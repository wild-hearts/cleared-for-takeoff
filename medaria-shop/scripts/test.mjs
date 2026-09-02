// scripts/test.mjs. Run with: node scripts/test.mjs
//
// Covers the parts where a mistake costs money rather than looking wrong: the price
// and variant resolution that checkout depends on, and the size matching the setup
// script uses to pick Printify variants. A naive substring match there picks size "M"
// out of the colour "Military Green" and silently sells the wrong garment forever.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { CATALOGUE, getProduct, shippingFor, publicCatalogue, PURCHASE_NOTICE, CURRENCY } from '../lib/products.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CFG = path.join(ROOT, 'lib', 'printify-config.generated.js');
let pass = 0, fail = 0;
const t = (n, f) => { try { f(); console.log('  ok   ' + n); pass++; } catch (e) { console.log('  FAIL ' + n + ' :: ' + e.message); fail++; } };

console.log('catalogue');
t('skus are unique', () => assert.equal(new Set(CATALOGUE.map(p => p.sku)).size, CATALOGUE.length));
t('every product has a price, artwork and a blueprint query', () => {
  for (const p of CATALOGUE) { assert.ok(p.price > 0, p.sku); assert.ok(p.artwork, p.sku); assert.ok(p.blueprintQuery, p.sku); }
});
t('currency is gbp', () => assert.equal(CURRENCY, 'gbp'));
t('purchase notice carries the three compliance statements', () => {
  assert.match(PURCHASE_NOTICE, /not a donation/i);
  assert.match(PURCHASE_NOTICE, /Gift Aid/i);
  assert.match(PURCHASE_NOTICE, /1204225/);
});
t('shipping bands, including a missing country', () => {
  assert.equal(shippingFor('GB').label, 'United Kingdom');
  assert.equal(shippingFor('gb').label, 'United Kingdom');
  assert.equal(shippingFor('FR').label, 'Europe');
  assert.equal(shippingFor('US').label, 'Rest of world');
  assert.equal(shippingFor(null).label, 'Rest of world');
});
t('getProduct handles unknown and undefined', () => {
  assert.ok(getProduct(CATALOGUE[0].sku)); assert.equal(getProduct('nope'), null); assert.equal(getProduct(undefined), null);
});
t('the public catalogue leaks no Printify or artwork fields', () => {
  for (const p of publicCatalogue(true)) { assert.ok(!('blueprintQuery' in p)); assert.ok(!('artwork' in p)); }
});

console.log('\nvariant matching, as used by printify-setup build');
const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const sizeMatches = (title, size) => new RegExp(`(^|[^a-z0-9])${norm(size).replace(/ /g, '[^a-z0-9]*')}([^a-z0-9]|$)`).test(norm(title));
const titles = ['Military Green / S','Military Green / M','Military Green / L','Military Green / XL','Military Green / 2XL','Military Green / 3XL','Sky Blue / S','Sky Blue / XL','Sky Blue / 2XL'];
t('S matches neither XL nor 2XL nor 3XL', () => assert.deepEqual(titles.filter(x => sizeMatches(x,'S')), ['Military Green / S','Sky Blue / S']));
t('XL matches neither 2XL nor 3XL', () => assert.deepEqual(titles.filter(x => sizeMatches(x,'XL')), ['Military Green / XL','Sky Blue / XL']));
t('2XL matches only 2XL', () => assert.deepEqual(titles.filter(x => sizeMatches(x,'2XL')), ['Military Green / 2XL','Sky Blue / 2XL']));
t('M does not match the colour Military Green', () => assert.deepEqual(titles.filter(x => sizeMatches(x,'M')), ['Military Green / M']));
t('11oz matches a mug variant', () => assert.ok(sizeMatches('11oz','11oz')));
t('One size matches One Size', () => assert.ok(sizeMatches('Black / One Size','One size')));

console.log('\nprintify.js against the stub config');
{
  const { getVariant, printifyConfigured } = await import('../lib/printify.js?stub=' + Date.now());
  const live = printifyConfigured();
  if (!live) {
    t('unconfigured: reports closed', () => assert.equal(printifyConfigured(), false));
    t('unconfigured: getVariant refuses rather than defaulting', () => assert.equal(getVariant(CATALOGUE[0].sku, { size: 'S' }), null));
  } else {
    t('configured: every catalogue sku has at least one orderable variant', () => {
      for (const p of CATALOGUE) {
        const sizes = (p.options.size || [null]); const colours = (p.options.colour || [null]);
        const any = colours.some(c => sizes.some(s => getVariant(p.sku, { colour: c, size: s })));
        assert.ok(any, p.sku + ' has no orderable variant');
      }
    });
    t('configured: an invented size is refused', () => assert.equal(getVariant(CATALOGUE[0].sku, { size: 'XXXXL' }), null));
  }
}

console.log('\nround trip through a fake generated config');
{
  // Runs in a CHILD PROCESS on purpose. Node caches an ES module by its resolved URL, so
  // rewriting printify-config.generated.js and re-importing printify.js in THIS process
  // would keep handing back the already-cached config and quietly test nothing.
  const backup = fs.readFileSync(CFG, 'utf8');
  fs.writeFileSync(CFG, 'export const PRINTIFY_CONFIG = ' + JSON.stringify({
    shopId: 99999,
    products: { 'x-test': { productId: 'prod_x', blueprintId: 1, providerId: 1, variants: [
      { key:'green-s', label:'Green S', colour:'Green', size:'S', variantId: 111, price: 2400 },
      { key:'blue-2xl', label:'Blue 2XL', colour:'Blue', size:'2XL', variantId: 222, price: 2600 } ] } },
    generatedAt: new Date().toISOString(),
  }, null, 2) + ';\n');
  try {
    const probe = `
      import { getVariant, printifyConfigured } from ${JSON.stringify(path.join(ROOT, 'lib', 'printify.js'))};
      const out = {
        configured: printifyConfigured(),
        exact: getVariant('x-test', { colour: 'Blue', size: '2XL' }),
        missing: getVariant('x-test', { colour: 'Blue', size: 'S' }),
        ignoresCallerPrice: getVariant('x-test', { colour: 'Green', size: 'S', price: 1 }),
        unknownSku: getVariant('nope', { size: 'S' }),
      };
      process.stdout.write(JSON.stringify(out));
    `;
    const res = spawnSync(process.execPath, ['--input-type=module', '-e', probe], { encoding: 'utf8' });
    if (res.status !== 0) throw new Error('probe failed: ' + (res.stderr || '').slice(0, 300));
    const got = JSON.parse(res.stdout);
    t('reports configured once a real config is written', () => assert.equal(got.configured, true));
    t('resolves the right variant id and price', () => {
      assert.equal(got.exact.variantId, 222);
      assert.equal(got.exact.price, 2600);
      assert.equal(got.exact.productId, 'prod_x');
    });
    t('refuses a colour/size pair that does not exist', () => assert.equal(got.missing, null));
    t('refuses an unknown sku', () => assert.equal(got.unknownSku, null));
    t('price comes from config, never from the caller', () => assert.equal(got.ignoresCallerPrice.price, 2400));
  } finally {
    // Restore even if the probe threw: leaving a fake shop id in a generated file that the
    // live checkout reads would be a considerably worse bug than the one being tested for.
    fs.writeFileSync(CFG, backup);
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

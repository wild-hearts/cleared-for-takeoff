// printify-setup.mjs. Connect Medaria Aid merchandise to Printify.
//
// Needs PRINTIFY_API_TOKEN in .env.local (Printify -> Account -> Connections -> API tokens)
// with scopes: shops.read, catalog.read, products.read, products.write,
//              uploads.read, uploads.write, orders.write
//
// Run in phases. Nothing is written until `build`, and `build` needs --confirm.
//
//   node scripts/printify-setup.mjs shops
//   node scripts/printify-setup.mjs blueprints "unisex softstyle t-shirt"
//   node scripts/printify-setup.mjs providers <blueprintId>
//   node scripts/printify-setup.mjs variants <blueprintId> <providerId>
//   node scripts/printify-setup.mjs costs <blueprintId> <providerId>     # real shipping
//   node scripts/printify-setup.mjs build --shop <shopId>                # dry run
//   node scripts/printify-setup.mjs build --shop <shopId> --confirm      # creates products
//   node scripts/printify-setup.mjs webhooks --shop <shopId> --confirm
//
// WHY PHASED, AND WHY NOTHING IS HARDCODED: blueprint, provider and variant ids are facts
// that live in Printify's catalogue and change. Guessing them from memory produces a shop
// that takes money for a variant that does not exist. Every id in the generated config is
// read back from the live API and printed for you to check before it is written.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CATALOGUE } from '../lib/products.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'lib', 'printify-config.generated.js');
const API = 'https://api.printify.com/v1';

const TOKEN = (() => {
  if (process.env.PRINTIFY_API_TOKEN) return process.env.PRINTIFY_API_TOKEN;
  const p = path.join(ROOT, '.env.local');
  if (fs.existsSync(p)) {
    const m = fs.readFileSync(p, 'utf8').match(/PRINTIFY_API_TOKEN\s*=\s*(.+)/);
    if (m) return m[1].trim().replace(/^["']|["']$/g, '');
  }
  return null;
})();
if (!TOKEN) {
  console.error('No PRINTIFY_API_TOKEN. Put it in .env.local (a file, never in chat).');
  process.exit(1);
}

const argv = process.argv.slice(2);
const cmd = argv[0];
const flag = (name) => { const i = argv.indexOf(`--${name}`); return i >= 0 ? argv[i + 1] : null; };
const has = (name) => argv.includes(`--${name}`);

async function pf(pathname, opts = {}) {
  const r = await fetch(API + pathname, {
    ...opts,
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json', ...(opts.headers || {}) },
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`${r.status} ${pathname}: ${text.slice(0, 400)}`);
  return text ? JSON.parse(text) : {};
}

const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

// ── discovery ────────────────────────────────────────────────────────────────────────
if (cmd === 'shops') {
  const shops = await pf('/shops.json');
  console.log('Shops on this Printify account:\n');
  for (const s of shops) console.log(`  id ${s.id}   ${s.title}   (${s.sales_channel})`);
  console.log('\nMedaria needs its OWN store, separate from Little Poppin (shop 28504147),');
  console.log('so its orders, products and reporting do not mix with a commercial brand.');
  console.log('If you only see Little Poppin here, add one: Printify -> Add new store ->');
  console.log('choose the API / manual option, then re-run this command.');
  process.exit(0);
}

if (cmd === 'blueprints') {
  const q = norm(argv[1] || '');
  if (!q) { console.error('Usage: blueprints "<search text>"'); process.exit(1); }
  const all = await pf('/catalog/blueprints.json');
  const hits = all.filter((b) => norm(b.title).includes(q) || norm(b.brand).includes(q));
  console.log(`${hits.length} blueprints matching "${argv[1]}":\n`);
  for (const b of hits.slice(0, 40)) console.log(`  id ${String(b.id).padStart(5)}  ${b.brand} - ${b.title}`);
  if (!hits.length) console.log('  (none. Try fewer words.)');
  process.exit(0);
}

if (cmd === 'providers') {
  const id = argv[1];
  if (!id) { console.error('Usage: providers <blueprintId>'); process.exit(1); }
  const list = await pf(`/catalog/blueprints/${id}/print_providers.json`);
  console.log(`Print providers for blueprint ${id}:\n`);
  for (const p of list) console.log(`  id ${String(p.id).padStart(4)}  ${p.title}`);
  console.log('\nPrefer "Printify Choice" where offered: it routes each order to the partner');
  console.log('nearest the buyer, so a supporter in Berlin is printed in Europe rather than');
  console.log('flown from another continent. That matters for a UK charity shipping widely.');
  process.exit(0);
}

if (cmd === 'variants' || cmd === 'costs') {
  const [, id, pid] = argv;
  if (!id || !pid) { console.error(`Usage: ${cmd} <blueprintId> <providerId>`); process.exit(1); }
  const data = await pf(`/catalog/blueprints/${id}/print_providers/${pid}/variants.json`);
  if (cmd === 'variants') {
    console.log(`${data.variants.length} variants for blueprint ${id}, provider ${pid}:\n`);
    for (const v of data.variants.slice(0, 200)) {
      console.log(`  ${String(v.id).padStart(7)}  ${v.title}`);
    }
  } else {
    const ship = await pf(`/catalog/blueprints/${id}/print_providers/${pid}/shipping.json`);
    console.log('Real shipping costs (USD cents), for setting SHIPPING in lib/products.js:\n');
    console.log(JSON.stringify(ship.profiles || ship, null, 2).slice(0, 4000));
  }
  process.exit(0);
}

// ── build ────────────────────────────────────────────────────────────────────────────
if (cmd === 'build') {
  const shopId = Number(flag('shop'));
  if (!shopId) { console.error('Usage: build --shop <shopId> [--confirm]'); process.exit(1); }
  const write = has('confirm');
  console.log(write ? 'BUILD. Products will be created.\n' : 'DRY RUN. Nothing will be created. Add --confirm to go ahead.\n');

  const blueprints = await pf('/catalog/blueprints.json');
  const products = {};
  const uploads = new Map(); // artwork path -> printify image id, uploaded once and reused

  for (const item of CATALOGUE) {
    console.log(`── ${item.sku}`);

    // 1. blueprint
    const q = norm(item.blueprintQuery);
    const bp = blueprints.find((b) => norm(b.title).includes(q))
      || blueprints.find((b) => q.split(' ').every((w) => norm(b.title).includes(w)));
    if (!bp) { console.log(`   NO BLUEPRINT matched "${item.blueprintQuery}". Run: blueprints "${item.blueprintQuery}"\n`); continue; }
    console.log(`   blueprint ${bp.id}  ${bp.brand} - ${bp.title}`);

    // 2. provider, by stated preference, else the first offered
    const provs = await pf(`/catalog/blueprints/${bp.id}/print_providers.json`);
    let prov = null;
    for (const pref of item.providerPreference || []) {
      prov = provs.find((p) => norm(p.title).includes(norm(pref)));
      if (prov) break;
    }
    prov = prov || provs[0];
    if (!prov) { console.log('   NO PROVIDER offered for this blueprint\n'); continue; }
    console.log(`   provider  ${prov.id}  ${prov.title}`);

    // 3. variants, matched against the catalogue's colour/size options
    const { variants } = await pf(`/catalog/blueprints/${bp.id}/print_providers/${prov.id}/variants.json`);
    const wantColours = item.options.colour || [null];
    const wantSizes = item.options.size || [null];
    const chosen = [];
    for (const colour of wantColours) {
      for (const size of wantSizes) {
        const v = variants.find((x) => {
          const t = norm(x.title);
          const okColour = !colour || t.includes(norm(colour));
          // Sizes must match as a WORD, not a substring: "s" would otherwise match
          // every title containing an s, and "xl" matches inside "2xl".
          const okSize = !size || new RegExp(`(^|[^a-z0-9])${norm(size).replace(/ /g, '[^a-z0-9]*')}([^a-z0-9]|$)`).test(t);
          return okColour && okSize;
        });
        if (!v) { console.log(`   MISSING variant: ${[colour, size].filter(Boolean).join(' / ')}`); continue; }
        chosen.push({
          key: [colour, size].filter(Boolean).map(norm).join('-').replace(/ /g, '-') || 'default',
          label: [colour, size].filter(Boolean).join(' · ') || bp.title,
          colour: colour || null,
          size: size || null,
          variantId: v.id,
          price: item.price,
        });
      }
    }
    if (!chosen.length) { console.log('   NO VARIANTS matched. Run the `variants` command and fix lib/products.js\n'); continue; }
    console.log(`   variants  ${chosen.length} matched`);

    // 4. artwork
    const art = path.join(ROOT, item.artwork);
    if (!fs.existsSync(art)) {
      console.log(`   NO ARTWORK at ${item.artwork}. Put the print-ready PNG there.\n`);
      continue;
    }
    if (!write) { console.log('   (dry run, not uploading or creating)\n'); continue; }

    let imageId = uploads.get(item.artwork);
    if (!imageId) {
      const up = await pf('/uploads/images.json', {
        method: 'POST',
        body: JSON.stringify({
          file_name: path.basename(art),
          contents: fs.readFileSync(art).toString('base64'),
        }),
      });
      imageId = up.id;
      uploads.set(item.artwork, imageId);
      console.log(`   uploaded  ${imageId}`);
    }

    // 5. create the product
    const created = await pf(`/shops/${shopId}/products.json`, {
      method: 'POST',
      body: JSON.stringify({
        title: item.name,
        description: `${item.blurb}\n\n${item.story}`,
        blueprint_id: bp.id,
        print_provider_id: prov.id,
        variants: chosen.map((v) => ({ id: v.variantId, price: v.price, is_enabled: true })),
        print_areas: [{
          variant_ids: chosen.map((v) => v.variantId),
          placeholders: [{
            position: 'front',
            images: [{ id: imageId, x: 0.5, y: 0.5, scale: 1, angle: 0 }],
          }],
        }],
      }),
    });
    console.log(`   created   product ${created.id}\n`);

    products[item.sku] = {
      productId: created.id,
      blueprintId: bp.id,
      providerId: prov.id,
      variants: chosen,
    };
  }

  if (!write) { console.log('Dry run finished. Re-run with --confirm once every line above looks right.'); process.exit(0); }

  const body = `// AUTO-GENERATED by scripts/printify-setup.mjs. Do not edit by hand.
// Prices are RETAIL GBP pence and EXCLUDE postage, which is charged by destination
// at checkout (see SHIPPING in lib/products.js).
export const PRINTIFY_CONFIG = ${JSON.stringify({ shopId, products, generatedAt: new Date().toISOString() }, null, 2)};
`;
  fs.writeFileSync(OUT, body);
  console.log(`Wrote ${path.relative(ROOT, OUT)} with ${Object.keys(products).length} product(s).`);
  console.log('Deploy, then place ONE real test order before telling anyone the shop is open.');
  process.exit(0);
}

// ── webhooks ─────────────────────────────────────────────────────────────────────────
if (cmd === 'webhooks') {
  const shopId = Number(flag('shop'));
  const key = process.env.PRINTIFY_WEBHOOK_KEY || flag('key');
  if (!shopId || !key) { console.error('Usage: webhooks --shop <shopId> --key <PRINTIFY_WEBHOOK_KEY> [--confirm]'); process.exit(1); }
  const url = `${(process.env.SITE_URL || 'https://www.medariaaid.com').replace(/\/$/, '')}/api/merch-printify-webhook?key=${encodeURIComponent(key)}`;
  const topics = ['order:created', 'order:updated', 'order:sent-to-production', 'order:shipment:created'];
  if (!has('confirm')) {
    console.log('DRY RUN. Would register these topics:\n');
    for (const t of topics) console.log(`  ${t}  ->  ${url.replace(key, '<key>')}`);
    console.log('\nAdd --confirm to register them.');
    process.exit(0);
  }
  for (const topic of topics) {
    try {
      const r = await pf(`/shops/${shopId}/webhooks.json`, { method: 'POST', body: JSON.stringify({ topic, url }) });
      console.log(`registered ${topic}  id ${r.id}`);
    } catch (err) { console.error(`FAILED ${topic}: ${err.message}`); }
  }
  process.exit(0);
}

console.error('Unknown command. See the comment at the top of this file for the phases.');
process.exit(1);

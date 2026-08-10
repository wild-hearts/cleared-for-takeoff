#!/usr/bin/env node
/**
 * check-prices.mjs — FT-12.
 *
 * Prices were hardcoded in twelve places: 49.00 in the Course offer on the
 * homepage and all ten audience pages, 9.89 against an Amazon listing on
 * /book/, and 199/399/699 for the group tiers. If any of those drift from
 * what the checkout actually charges, that is a structured-data mismatch
 * Google can flag, and a consumer-law problem in Australia independent of any
 * SEO consequence.
 *
 * Rewriting the visible copy on eleven hand-authored pages to read from a
 * config would be a large and risky change for the size of the problem. What
 * actually prevents the failure is making drift impossible to ship, so this
 * verifies instead: every price asserted anywhere on the site must appear in
 * partials/prices.json, and every price in that file must still be asserted
 * somewhere. Either way round it fails loudly.
 *
 *   node tools/check-prices.mjs
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SKIP = new Set(['.git', '.vercel', 'node_modules', 'partials', 'tools', 'course', 'course-content', 'assets', 'api']);

const cfg = JSON.parse(readFileSync(join(ROOT, 'partials/prices.json'), 'utf8'));

/** Every allowed figure, normalised so "49" and "49.00" compare equal. */
const norm = (v) => String(v).replace(/[^0-9.]/g, '').replace(/\.00$/, '').replace(/\.$/, '');
const allowed = new Set();
const examples = new Set();
for (const [groupName, group] of Object.entries(cfg)) {
  if (typeof group !== 'object' || group === null) continue;
  for (const [k, v] of Object.entries(group)) {
    if (k.startsWith('_')) continue;
    (groupName === 'prose_examples' ? examples : allowed).add(norm(v));
  }
}

function walk(dir, out = []) {
  for (const entry of readdirSync(join(ROOT, dir || '.'))) {
    if (SKIP.has(entry) || entry === 'google039507930feb61d1.html') continue;
    const rel = dir ? join(dir, entry) : entry;
    const st = statSync(join(ROOT, rel));
    if (st.isDirectory()) walk(rel, out);
    else if (entry.endsWith('.html')) out.push(rel.split(sep).join('/'));
  }
  return out;
}

const problems = [];
const seen = new Set();

for (const page of walk('')) {
  const html = readFileSync(join(ROOT, page), 'utf8');

  // 1. structured data
  for (const m of html.matchAll(/"price"\s*:\s*"?([\d.]+)"?/g)) {
    const v = norm(m[1]);
    seen.add(v);
    if (!allowed.has(v)) problems.push(`${page}: JSON-LD asserts price ${m[1]}, which is not in partials/prices.json`);
  }

  /* 2. visible copy. Tags are stripped first because the pricing tiers split
        the sign from the figure across elements ("<span>$</span>399"), so a
        naive scan of the raw HTML misses exactly the numbers that matter. */
  const text = html
    .replace(/<!-- @chrome:[\s\S]*?@endchrome:[a-z]+ -->/g, '')
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ');
  for (const m of text.matchAll(/\$\s*([\d]+(?:\.\d{2})?)\b/g)) {
    const v = norm(m[1]);
    if (examples.has(v)) continue;      // a figure in prose, not a price we charge
    seen.add(v);
    if (!allowed.has(v)) problems.push(`${page}: page copy shows $${m[1]}, which is in neither prices nor prose_examples in partials/prices.json`);
  }
}

const unused = [...allowed].filter((v) => !seen.has(v));
for (const v of unused) problems.push(`partials/prices.json lists ${v} but no page asserts it any more`);

if (problems.length) {
  console.error('✗ price drift:\n');
  for (const p of problems) console.error('   ' + p);
  console.error('\nReconcile partials/prices.json with the pages, or the pages with it.');
  process.exit(1);
}

console.log(`✓ prices consistent across the site (${[...allowed].sort().join(', ')} ${cfg.currency})`);
console.log('  reminder: the Amazon book price is reconciled by hand, nothing here updates it.');

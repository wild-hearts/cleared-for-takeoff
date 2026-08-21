#!/usr/bin/env node
/**
 * set-asin.mjs
 *
 * Republishing the combined edition gives the book a new ASIN and unpublishes
 * the old listings. Every link on the site then points at a dead product page.
 * This rewrites all of them, and partials/book.json, in one pass.
 *
 *   node tools/set-asin.mjs B0NEWASIN1        # do it
 *   node tools/set-asin.mjs B0NEWASIN1 --dry  # show what would change
 *
 * Then run `npm run check`, which proves nothing was missed.
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SKIP = new Set(['.git', '.vercel', '.claude', 'node_modules', 'partials', 'tools', 'course', 'course-content', 'assets', 'api']);
const EXTRA = ['llms.txt', 'feed.xml', 'sitemap.xml'];

const DRY = process.argv.includes('--dry');
const next = process.argv.slice(2).find((a) => !a.startsWith('--'));

if (!next) {
  console.error('Usage: node tools/set-asin.mjs <NEW_ASIN> [--dry]');
  process.exit(1);
}
if (!/^B0[A-Z0-9]{8}$/.test(next)) {
  console.error(`✗ "${next}" is not a plausible ASIN. Amazon ASINs start B0 and are ten characters.`);
  console.error('  Copy it from the address bar of the new listing: amazon.com.au/dp/THIS_BIT');
  process.exit(1);
}

const cfgPath = join(ROOT, 'partials/book.json');
const cfg = JSON.parse(readFileSync(cfgPath, 'utf8'));
const current = cfg.asin;

if (current === next) {
  console.log(`Nothing to do: partials/book.json already says ${next}.`);
  process.exit(0);
}

function walk(dir, out = []) {
  for (const entry of readdirSync(join(ROOT, dir || '.'))) {
    if (SKIP.has(entry)) continue;
    const rel = dir ? join(dir, entry) : entry;
    if (statSync(join(ROOT, rel)).isDirectory()) walk(rel, out);
    else if (entry.endsWith('.html')) out.push(rel.split(sep).join('/'));
  }
  return out;
}

let files = 0;
let links = 0;

for (const file of [...walk(''), ...EXTRA.filter((f) => existsSync(join(ROOT, f)))]) {
  const path = join(ROOT, file);
  const before = readFileSync(path, 'utf8');
  /* Only rewrite the ASIN where it sits behind /dp/. The same string appearing
     in prose would be a sentence about the old edition, not a link to it. */
  const after = before.replaceAll(`amazon.com.au/dp/${current}`, `amazon.com.au/dp/${next}`);
  if (after === before) continue;

  const n = before.split(`amazon.com.au/dp/${current}`).length - 1;
  files++;
  links += n;
  if (!DRY) writeFileSync(path, after);
  console.log(`  ${DRY ? 'would update' : 'updated'}  ${file}  (${n} link${n === 1 ? '' : 's'})`);
}

cfg.asin = next;
cfg.product_url = `https://www.amazon.com.au/dp/${next}`;
if (!DRY) writeFileSync(cfgPath, JSON.stringify(cfg, null, 2) + '\n');
console.log(`  ${DRY ? 'would update' : 'updated'}  partials/book.json`);

console.log(`\n${current} -> ${next}: ${links} links across ${files} files.`);
console.log(DRY ? 'Nothing was written. Drop --dry to apply.' : 'Now run: npm run check');

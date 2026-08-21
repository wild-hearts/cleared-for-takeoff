#!/usr/bin/env node
/**
 * check-book.mjs
 *
 * The book's ASIN is written into fourteen files: eleven page footers, the
 * homepage, /about/ and llms.txt. Nothing connected them, so republishing the
 * combined edition under a new ASIN meant fourteen hand-edits, and a single
 * miss would leave a live link pointing at a book that no longer sells.
 *
 * Same shape as check-prices.mjs: rather than rewriting hand-authored pages to
 * read from a config, this verifies that every Amazon link on the site agrees
 * with partials/book.json, and fails loudly when one drifts.
 *
 *   node tools/check-book.mjs
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SKIP = new Set(['.git', '.vercel', '.claude', 'node_modules', 'partials', 'tools', 'course', 'course-content', 'assets', 'api']);

const cfg = JSON.parse(readFileSync(join(ROOT, 'partials/book.json'), 'utf8'));
const { asin, author_page_url: authorUrl } = cfg;

if (!/^B0[A-Z0-9]{8}$/.test(asin)) {
  console.error(`✗ partials/book.json: "${asin}" is not a plausible ASIN (expected B0 followed by eight characters)`);
  process.exit(1);
}

/* llms.txt is not HTML but carries the same link, and it is the file answer
   engines read, so a stale ASIN there is arguably the worst place to have one. */
const EXTRA = ['llms.txt', 'feed.xml', 'sitemap.xml'];

function walk(dir, out = []) {
  for (const entry of readdirSync(join(ROOT, dir || '.'))) {
    if (SKIP.has(entry)) continue;
    const rel = dir ? join(dir, entry) : entry;
    if (statSync(join(ROOT, rel)).isDirectory()) walk(rel, out);
    else if (entry.endsWith('.html')) out.push(rel.split(sep).join('/'));
  }
  return out;
}

const files = [...walk(''), ...EXTRA.filter((f) => existsSync(join(ROOT, f)))];

const problems = [];
let productLinks = 0;
let authorLinks = 0;

for (const file of files) {
  const text = readFileSync(join(ROOT, file), 'utf8');

  for (const m of text.matchAll(/amazon\.com\.au\/dp\/([A-Z0-9]+)/g)) {
    productLinks++;
    if (m[1] !== asin) problems.push(`${file}: links to ASIN ${m[1]}, but partials/book.json says ${asin}`);
  }

  for (const m of text.matchAll(/amazon\.com\.au\/stores\/[^"'\s)]+/g)) {
    authorLinks++;
    const url = 'https://www.' + m[0];
    if (url !== authorUrl) problems.push(`${file}: author page link ${url} does not match partials/book.json`);
  }
}

if (productLinks === 0) {
  problems.push('no page links to the book on Amazon at all, which means either every link was lost or the ASIN in partials/book.json is stale');
}

if (problems.length) {
  console.error('✗ book links out of step:\n');
  for (const p of problems) console.error('   ' + p);
  console.error('\nRun `node tools/set-asin.mjs <ASIN>` to update every link at once.');
  process.exit(1);
}

console.log(`✓ book links consistent (${productLinks} links to ${asin}, ${authorLinks} to the author page)`);

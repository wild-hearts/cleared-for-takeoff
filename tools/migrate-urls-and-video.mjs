#!/usr/bin/env node
/**
 * migrate-urls-and-video.mjs — FT-04 and FT-06, run once.
 *
 * FT-04. A BreadcrumbList is supposed to describe a real hierarchy of pages.
 * The ten audience pages pointed position 2 at https://…/#audiences, a
 * fragment that just resolves to the homepage, and the homepage Course offer
 * pointed at /#pricing. /who-its-for/ now exists, so position 2 has a genuine
 * parent to point at and the audience pages gain a second internal link path.
 *
 * FT-06. The VideoObject on /free-lesson/ set embedUrl to the page's own URL.
 * embedUrl must return an embeddable player, not the containing page, so it is
 * meaningless as written; contentUrl alone is valid. The video was also
 * structurally orphaned, with nothing connecting the free lesson to the course
 * it is Module 1 of.
 *
 * The transcript is left exactly as it is. It is the strongest AEO asset on
 * the site: it hands answer engines the actual lesson content in a labelled
 * field.
 *
 *   node tools/migrate-urls-and-video.mjs [--dry]
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DRY = process.argv.includes('--dry');
const BASE = 'https://www.clearedfortakeoff.com.au';

const WHO = `${BASE}/who-its-for/`;
const COURSE = `${BASE}/#course`;
const SKIP_DIRS = new Set(['.git', '.vercel', '.claude', 'node_modules', 'partials', 'tools', 'course', 'course-content', 'assets', 'api']);

const stats = { breadcrumb: 0, offer: 0, courseId: 0, embedUrl: 0, isPartOf: 0 };
const typeOf = (n) => (Array.isArray(n['@type']) ? n['@type'] : [n['@type']]).filter(Boolean);

function walkHtml(dir, out = []) {
  for (const entry of readdirSync(join(ROOT, dir || '.'))) {
    if (SKIP_DIRS.has(entry) || entry === 'google039507930feb61d1.html') continue;
    const rel = dir ? join(dir, entry) : entry;
    const st = statSync(join(ROOT, rel));
    if (st.isDirectory()) walkHtml(rel, out);
    else if (entry.endsWith('.html')) out.push(rel.split(sep).join('/'));
  }
  return out;
}

/** A stable @id for each Course. The audience versions are genuine variants of
 *  one product, so each gets its own page-scoped id rather than eleven nodes
 *  fighting over a single one. */
function courseIdFor(page) {
  if (page === 'index.html') return COURSE;
  const dir = '/' + page.replace(/index\.html$/, '');
  return `${BASE}${dir}#course`;
}

function fix(node, page) {
  if (Array.isArray(node)) return node.forEach((n) => fix(n, page));
  if (!node || typeof node !== 'object') return;

  const types = typeOf(node);

  if (types.includes('BreadcrumbList') && Array.isArray(node.itemListElement)) {
    for (const item of node.itemListElement) {
      if (typeof item.item === 'string' && item.item.includes('#audiences')) {
        item.item = WHO;
        item.name = "Who it's for";
        stats.breadcrumb++;
      }
    }
  }

  if (types.includes('Offer') && typeof node.url === 'string' && node.url.includes('#')) {
    node.url = node.url.split('#')[0];
    stats.offer++;
  }

  if (types.includes('Course') && !node['@id']) {
    node['@id'] = courseIdFor(page);
    stats.courseId++;
  }

  if (types.includes('VideoObject')) {
    if ('embedUrl' in node) { delete node.embedUrl; stats.embedUrl++; }
    if (!node.isPartOf) { node.isPartOf = { '@id': COURSE }; stats.isPartOf++; }
  }

  for (const v of Object.values(node)) fix(v, page);
}

for (const page of walkHtml('')) {
  const original = readFileSync(join(ROOT, page), 'utf8');
  let html = original;

  for (const m of original.matchAll(/<script type="application\/ld\+json"([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (/id="site-graph"/.test(m[1])) continue;   // generated, never edit
    let data;
    try { data = JSON.parse(m[2]); }
    catch (e) { console.error(`  !! ${page}: unparseable JSON-LD (${e.message})`); continue; }

    fix(data, page);
    const next = JSON.stringify(data, null, 2);
    if (next !== m[2].trim()) html = html.replace(m[0], m[0].replace(m[2], '\n' + next + '\n'));
  }

  if (html !== original) {
    if (!DRY) writeFileSync(join(ROOT, page), html);
    console.log(`  ${DRY ? 'would update' : 'updated'}  ${page}`);
  }
}

console.log(`\nBreadcrumb #audiences -> /who-its-for/  ${stats.breadcrumb}`);
console.log(`Offer.url fragments stripped           ${stats.offer}`);
console.log(`Course nodes given a stable @id        ${stats.courseId}`);
console.log(`VideoObject.embedUrl removed           ${stats.embedUrl}`);
console.log(`VideoObject linked to the course       ${stats.isPartOf}`);

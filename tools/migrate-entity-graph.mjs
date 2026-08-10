#!/usr/bin/env node
/**
 * migrate-entity-graph.mjs — FT-02 and FT-03, run once.
 *
 * The site described itself as several loosely-related organisations rather
 * than one entity with many pages: twelve pages declared their own bare
 * `Organization` named "Cleared For Take-Off Academy" as provider or
 * publisher, six blog authors were bare `Person` objects with no `@id`, and
 * /about/ defined Naomi twice with two different job titles.
 *
 * This rewrites those into `@id` references against the canonical nodes in
 * partials/site-schema.json, which tools/build-chrome.mjs emits site-wide.
 *
 * Parses and re-serialises each JSON-LD block rather than pattern-matching
 * the HTML, so a malformed edit fails loudly instead of shipping.
 *
 *   node tools/migrate-entity-graph.mjs [--dry]
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DRY = process.argv.includes('--dry');
const BASE = 'https://www.clearedfortakeoff.com.au';

const ORG = `${BASE}/#org`;
const PUBLISHER = `${BASE}/#publisher`;
const WEBSITE = `${BASE}/#website`;
const NAOMI = `${BASE}/about/#naomi`;

/* Names that mean "us". Anything else keeps its inline definition: an external
   organisation such as Amazon is a genuinely different entity and must not be
   folded into our graph. */
const OURS_ORG = new Set(['cleared for take-off academy', 'c4to academy', 'cleared for take-off']);
const OURS_PUBLISHER = new Set(['wild hearts publishing', 'wild hearts publishing pty ltd']);
const OURS_PERSON = new Set(['naomi', 'naomi shiels']);

const SKIP_DIRS = new Set(['.git', '.vercel', 'node_modules', 'partials', 'tools', 'course', 'course-content', 'assets', 'api']);

const norm = (s) => String(s || '').trim().toLowerCase();
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

const stats = { org: 0, publisher: 0, person: 0, sharedRemoved: 0, aboutMainEntity: 0 };

/** Collapse a node that redefines one of our entities into a bare reference. */
function toReference(node) {
  const types = typeOf(node);
  const name = norm(node.name);

  if (types.some((t) => t === 'Organization' || t === 'EducationalOrganization')) {
    // Never collapse a node that carries its own foreign @id.
    if (node['@id'] && ![ORG, PUBLISHER].includes(node['@id'])) return null;
    if (OURS_ORG.has(name)) { stats.org++; return { '@id': ORG }; }
    if (OURS_PUBLISHER.has(name)) { stats.publisher++; return { '@id': PUBLISHER }; }
    return null;
  }
  if (types.includes('Person')) {
    if (node['@id'] === NAOMI) return null;      // already the canonical node
    if (node['@id']) return null;                 // someone else's @id, leave alone
    if (OURS_PERSON.has(name)) { stats.person++; return { '@id': NAOMI }; }
  }
  return null;
}

/**
 * Recursively rewrite provider / publisher / author / seller / worksFor etc.
 *
 * `isDefinitionSite` marks the one place a node is allowed to keep its
 * properties. Everywhere else the same @id must appear as a bare reference:
 * several blog posts were re-stating Naomi's name and a jobTitle that
 * contradicted the one on /about/, which is the same defect as FT-03 wearing
 * a different hat.
 */
function rewrite(value, isDefinitionSite = false) {
  if (Array.isArray(value)) return value.map((v) => rewrite(v, isDefinitionSite));
  if (!value || typeof value !== 'object') return value;

  const isCanonicalPerson = value['@id'] === NAOMI && typeOf(value).includes('Person');

  if (isCanonicalPerson && !isDefinitionSite) {
    if (Object.keys(value).length > 1) stats.person++;
    return { '@id': NAOMI };
  }

  if (!isCanonicalPerson) {
    const ref = toReference(value);
    if (ref) return ref;
  }

  const out = {};
  for (const [k, v] of Object.entries(value)) out[k] = rewrite(v, false);
  return out;
}

for (const page of walkHtml('')) {
  const original = readFileSync(join(ROOT, page), 'utf8');
  let html = original;

  const blocks = [...original.matchAll(/<script type="application\/ld\+json"([^>]*)>([\s\S]*?)<\/script>/g)];

  for (const m of blocks) {
    /* Never touch the generated shared graph. It is the canonical definition
       of #org and #publisher, so the "collapse our own Organization nodes to
       references" rule below would empty it out. */
    if (/id="site-graph"/.test(m[1])) continue;
    let data;
    try { data = JSON.parse(m[2]); }
    catch (e) { console.error(`  !! ${page}: unparseable JSON-LD, left untouched (${e.message})`); continue; }

    let changed = JSON.parse(JSON.stringify(data));

    /* FT-03 — /about/ defined Naomi twice, with conflicting job titles.
       AboutPage.mainEntity becomes a reference to the @id-bearing node, which
       is the one carrying sameAs, nationality and homeLocation. */
    if (page === 'about/index.html' && typeOf(changed).includes('AboutPage') && changed.mainEntity
        && !changed.mainEntity['@id'] && OURS_PERSON.has(norm(changed.mainEntity.name))) {
      changed.mainEntity = { '@id': NAOMI };
      stats.aboutMainEntity++;
    }

    /* /about/ is where the Person node is defined, so a top-level Person block
       there keeps its properties. Nested occurrences anywhere, including on
       /about/ itself, collapse to a reference. */
    const definesNaomi = page === 'about/index.html'
      && changed['@id'] === NAOMI && typeOf(changed).includes('Person');
    changed = rewrite(changed, definesNaomi);

    /* The shared graph is now emitted on every page, so drop the homepage's
       own copies of #org / #website rather than defining them twice. */
    if (Array.isArray(changed['@graph'])) {
      const before = changed['@graph'].length;
      changed['@graph'] = changed['@graph'].filter((n) => ![ORG, WEBSITE].includes(n['@id']));
      stats.sharedRemoved += before - changed['@graph'].length;
      if (changed['@graph'].length === 0) { html = html.replace(m[0], ''); continue; }
      if (changed['@graph'].length === 1 && before > 1) {
        changed = { '@context': 'https://schema.org', ...changed['@graph'][0] };
      }
    }

    const next = JSON.stringify(changed, null, 2);
    if (next !== m[2].trim()) {
      html = html.replace(m[0], m[0].replace(m[2], '\n' + next + '\n'));
    }
  }

  if (html !== original && !DRY) writeFileSync(join(ROOT, page), html);
  if (html !== original) console.log(`  ${DRY ? 'would update' : 'updated'}  ${page}`);
}

console.log(`\nOrganization -> #org          ${stats.org}`);
console.log(`Organization -> #publisher    ${stats.publisher}`);
console.log(`Person       -> about/#naomi  ${stats.person}`);
console.log(`AboutPage.mainEntity fixed    ${stats.aboutMainEntity}`);
console.log(`Duplicate shared nodes pruned ${stats.sharedRemoved}`);

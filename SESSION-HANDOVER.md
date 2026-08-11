# What changed, and what is left

**Session:** 11 August 2026 · **Branch:** merged to `main`, pushed, deployed to production
**Scope:** `forge-build-brief-c4to.md` (FT-01 to FT-14), `cft-seo-brief.md`, and the Perplexity re-audit

15 commits · 55 files · 6 new pages · live at www.clearedfortakeoff.com.au

---

# Part 1 · What changed

## The measurable before and after

| | Before | After |
|---|---|---|
| Distinct site navigations | 6 | 1 |
| Pages with a complete, valid Twitter card | 1 of 29 | 35 of 35 |
| Inline `Organization` / `Person` nodes instead of `@id` references | 42 | 0 |
| Named `Person` nodes on `/about/` | 2, conflicting job titles | 1 |
| Fragment URLs in breadcrumbs and offers | 11 | 0 |
| `@id`s defined on more than one page | several | 0 |
| Unresolved `@id` references | — | 0 |
| Sitemap URLs | 28 | 34 |
| Pages carrying the `#org` definition | 1 (homepage) | 35 |
| Audience pages with a factual quick-answer block | 0 | 10 |
| Editing a nav link | 29 files | 1 file |

## New pages

| URL | Why |
|---|---|
| `/ai-course-for-beginners/` | There was no public sales page at any URL. `/course/` is the gated member area, `noindex`. The homepage was carrying 100% of the selling. |
| `/who-its-for/` | Gives the ten audience pages a real breadcrumb parent and a second internal link path. Killed the `/#audiences` fragment. |
| `/contact/` | Returned 404. A real contact page is a procurement trust signal for the library and council buyer. |
| `/ai-workshops-for-libraries-and-community-groups/` | The brief's best keyword-to-buyer match on the site, with no page behind it. |
| `/ai-consulting/` | `/book/`'s nav linked to "Consulting" with no page behind it. |
| `/ai-readiness-assessment/` | Was one H3 on the homepage. |

## Structural changes

- **`partials/` is now the only copy of the site chrome.** Header, footer, audience
  directory, the CSS that styles them, the shared entity graph, the sub-nav config
  and the glossary source. `npm run site` rewrites all 35 pages in place.
  `npm run check` fails if anything has drifted.
- **The page-anchor navs are demoted.** The ten audience pages and
  `/kids-and-teens/` used to replace the site nav with `#flightplan`-style anchors,
  so anyone landing from search had almost no route into the rest of the site.
  Those anchors are now a secondary bar beneath the real header, and the build
  verifies each anchor target exists before emitting it.
- **The mobile menu works everywhere.** It was inline on the homepage only, so the
  hamburger did nothing on every other page.
- **Prices live in `partials/prices.json`** and `npm run check` fails if any page
  states a figure the file does not, or the file lists one no page states.

## Accuracy corrections

- **`/for-health/` said the tools "never see patient data".** An absolute claim about
  what ChatGPT, Claude, Perplexity and Gemini do, dependent on vendor, plan, settings
  and any data-processing agreement, and unverifiable. It also reversed the causality
  and contradicted the page's own framing further down. Now: *"patient data never goes
  near them, because you are the one deciding what goes in."* The hero's "without ever
  putting patient data at risk" became "with patient data kept out of it". Every other
  audience page was scanned for the same class of claim; there were none.
- **Three claims on the new commercial pages** were held back behind a visible amber
  outline until you confirmed them. All three confirmed and shipped.

## Bugs I introduced and fixed

Named because they were mine, not pre-existing.

1. **Homepage mobile menu stopped working.** FT-01 added the shared nav script on top
   of the homepage's existing inline copy, so two handlers fought over every click and
   one click left the menu shut. Both handlers are now single shared assets.
2. **A marker rename duplicated the chrome on all 34 pages.** The generated markers are
   matched literally, so editing their text orphaned every region and the builder
   appended a second header, footer, CSS and schema block. The builder now normalises
   old marker forms and collapses duplicates, so a rename is a safe edit.
3. **96 orphaned close markers** stranded by that repair. Dead markup, now cleaned.
4. **The first production deploy failed.** Naming a `package.json` script `build` made
   Vercel run it and then demand a `public/` output directory that has never existed.
   Renamed to `npm run site`.

## Two things the briefs got wrong

Both were written against failed crawls, which is now a pattern worth knowing.

- **FT-07 overstated the glossary problem.** It claimed 24 visible terms against 20 in
  schema, and no per-term anchors. The live page had 20 and 20, names matching, and
  every term already anchored. The single-source generator was built anyway, because
  that was the real fix and the count was only ever the symptom.
- **FT-01 understated the nav problem.** It listed three variants. There were six, and
  it flagged only `/kids-and-teens/` for anchor-only navigation when all ten audience
  pages did it too.

The Perplexity re-audit was the third failed crawl. It reported `robots.txt` and
`sitemap.xml` as unretrievable (both return 200), structured data as "not verifiable"
(35 pages carry it), and asked for small-business and professionals pages that have
been live for months. One finding in it was real and is fixed: the health page claim.

---

# Part 2 · Your checklist

Ordered by what unblocks the most. Fuller detail in `NAOMI-TODO.md`.

### Do first

- [ ] **Connect Google Search Console.** Step-by-step in `NAOMI-TODO.md` §1. Until this
      exists nobody, me included, can tell you what the site ranks for, whether the six
      new pages are indexed, or whether any of today's work moved anything. Every audit
      you have commissioned has said this. It takes about 30 minutes.
- [ ] **Request indexing** on the six new URLs once Search Console is connected.
- [ ] **Check what `c4toacademy.com` actually serves** and tell me which of the three
      cases it is. `NAOMI-TODO.md` §3. If it is duplicating marketing copy, the two
      sites are competing with each other.
- [ ] **Enable Vercel Web Analytics.** `NAOMI-TODO.md` §2, one toggle. Tell me when it
      is on and I will add the script tag.

### Accuracy, and both briefs flagged these

- [ ] **The Sydney / Canberra inconsistency.** Something in the copy says Sydney. The
      schema and `/contact/` both say Canberra. One is wrong.
- [ ] **The unverified statistics** flagged by the earlier audit. Deciding what is true
      is your call, not mine.
- [ ] **Decide whether the group prices are real.** The homepage labels $199/$399/$699
      "Indicative placeholder pricing" and the new pages repeat that framing honestly.
      At some point they need to become actual prices or come off.

### Proof, which is now the biggest gap on the site

Perplexity is right that page quality is no longer the bottleneck. There is still not
one testimonial, star rating or customer photo anywhere.

- [ ] **Six testimonials.** `TESTIMONIALS-FILL-IN.md` has the fields and the reasons.
      The CSS and schema are already built and waiting. About twenty minutes of my
      work once you paste real quotes in. I will not write placeholder ones.
- [ ] **Book a library, a U3A branch and a Probus club** for a 45-minute talk. You now
      have a page built specifically to sell that, and the talks generate the
      testimonials the page needs.

### Still open from the previous session

`TODO.md` has these in full; they are not superseded by anything I did today.

- [ ] `GA4_API_SECRET` into Vercel, or you cannot see checkouts complete
- [ ] Create the Stripe `READER` coupon that `/reader/` already promises
- [ ] Test a real purchase with a real card, end to end
- [ ] The book: republish the combined edition, send me the new ASIN, unpublish the old
- [ ] Gumroad account and product URLs

---

# Part 3 · My checklist

### Committed, waiting on you

- [ ] **Stand up `brands/cft/` in the Crewible repo.** You said start it; the deploy took
      priority. `crewible.zip` already has a scaffold with three skills. The work is
      reviewing it against `cft-spine-roles.md` and filling the gaps. It will surface
      the seven connector items it is blocked on rather than inventing credentials.
- [ ] **Wire the testimonials** the moment `TESTIMONIALS-FILL-IN.md` has real quotes.
- [ ] **Add the Vercel Web Analytics script** once you have flipped the toggle.
- [ ] **Act on whatever `c4toacademy.com` turns out to be:** canonicals to the main
      domain, or strip the marketing pages, or confirm `noindex` and close it.

### Worth doing, on your word

- [ ] **Content clusters.** Each audience page wants four to six genuinely useful
      supporting articles. This is the single highest-leverage remaining SEO work and
      it is a publishing programme, not a one-off build.
- [ ] **One strong lead magnet** as a crawlable landing page rather than a gated PDF.
      "The Australian Over-50s Guide to Using AI Safely" or the health-practice
      checklist are both strong, and both are sourced from course content you already
      have.
- [ ] **A `/blog/` internal linking pass** so each article points at the audience page
      it serves and back to the course.

### Deliberately not doing

- **FT-09, anchor-text refinement.** The brief marks it P3, optional, and says not to
  spend a session on it. The homepage links already read "For creators & writers".
- **Any URL migration.** Both briefs are emphatic. Existing slugs stay.
- **`aggregateRating` or `review` markup.** Not until real, displayed reviews exist.
  Fabricated ratings are a Google penalty and, for a paid course sold in Australia, a
  consumer-law exposure under ACL s18 and s29.
- **Course-list carousel markup.** Google's Course-list feature needs at least three
  courses and a real catalogue design. We have one course.

---

## How to change the site now

```bash
npm run site     # rewrite the chrome across every page from partials/
npm run check    # verify chrome, glossary and prices are in sync; fails loudly
```

Edit `partials/site-head.html` to change a nav link. Everything else follows.
`partials/README.md` explains the mechanism and the one specificity trap in it.

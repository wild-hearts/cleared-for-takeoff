# Overnight work, 7 August 2026

Everything below is done, verified, and sitting on branch `phase3-believe`.
**Nothing is committed and nothing is deployed.** The live site is untouched.

Preview it locally: the dev server config is saved as `c4to`, serving
`http://localhost:4201`.

---

## 0. Read this first: the course cannot be delivered

I checked `api/video-library.js`. Fifty-six lessons are defined across the six modules.
**Every one of them has `playbackId: 'PENDING'`.** There are zero live videos. There are
also no PDFs anywhere in the repo, so the "one-page cheat sheet per module" and "the
Cleared To Try workbook" do not exist as deliverables either.

The site is taking $49 through Stripe right now for "All 6 modules (~6 to 8 hours of
video)". Anyone who pays today gets an empty course. That is an Australian Consumer Law
guarantee failure, and for a brand built on *honesty over hype* it is the worst possible
first impression.

**Pick one this week:**

1. Finish and upload the videos before any marketing starts, or
2. Switch the course from "buy" to "join the waitlist" and sell the book meanwhile.

I have not changed the checkout, because taking your paid product offline is your call,
not mine. Say the word and switching it to a waitlist is about twenty minutes.

The full funnel and 90-day marketing plan is a separate document and it assumes you have
answered this. Everything in it is worthless until you have.

---

## 0b. The book, after the merge

You have combined the two books into one called *Cleared For Take-Off* and it needs
republishing on Amazon. Site is updated for that: the Book 2 promo is gone, the series
schema is removed, and the About page now refers to one book.

The old Book 1 listing (`B0GS21NW58`, $9.89) is still live and buyable, so on your
instruction the site keeps pointing at it until the new edition exists. Send me the new
ASIN and I swap it in minutes.

**When you republish, four things matter:**

- **Do not tick KDP Select.** I checked: the current listing is wide, not in Kindle
  Unlimited. Select means 90-day Amazon exclusivity, which makes the entire Gumroad half
  of the plan illegal. This is the single most consequential checkbox on the page.
- **Price at $9.99 or under.** KDP pays 70% between $2.99 and $9.99 and only 35% outside
  it. Your $9.89 was deliberately under the ceiling. A $12.99 ebook earns you *less* per
  sale than a $9.89 one.
- **Put the search terms in the subtitle**, not just the title. Amazon indexes it.
- **Unpublish both old editions** once the new one is live, so they stop competing.

The seven KDP keyword slots and two recommended categories are in the marketing plan.

---

## 1. Blocked on you (nothing else can move these)

### Testimonials

Still the biggest conversion lever. Both components are built and styled, waiting
for real quotes. See `TESTIMONIALS-FILL-IN.md`. I did not invent any.

### New, from the funnel work

- **Create the Stripe coupon.** I enabled promotion codes at checkout, but the code
  itself has to exist. Stripe → Products → Coupons → create `READER`, $10 off, then a
  promotion code with that name. Until you do, `/reader/` promises a discount that will
  not apply.
- **Create the Gumroad account** under Wild Hearts Publishing, currency AUD, and list the
  free prompt library first. Send me the product URLs and I will wire the buy buttons
  into the book page.
- **Decide the Gumroad pricing.** My recommendation is in the plan: $14.99 for a
  PDF/EPUB edition with extras, $55 for a book-plus-course bundle, free prompt library as
  the list builder. Do not list an identical cheaper-on-Amazon ebook.

### Things only your dashboards can do

- **Vercel Web Analytics**: turn it on (Project → Analytics). It is off, which is
  why I could not pull real Core Web Vitals field data.
- **Link Search Console to GA4**: GA4 Admin → Product links → Search Console.
- **Bing Webmaster Tools**: register the site. Bing feeds ChatGPT search.
- **GA4 Measurement Protocol secret**: GA4 → Admin → Data streams → your web stream
  → Measurement Protocol API secrets → Create. Add it to Vercel as `GA4_API_SECRET`.
  Until you do, server-side purchase tracking stays a silent no-op (see section 2).
- **Pull the five reports** from the original audit, section 4.

### Small things I need from you

- Your LinkedIn or any other profile URLs for `sameAs`. The Amazon author page is now
  in there; anything else you want listed, send it over.
- A real screenshot of the course dashboard or a module page, for the homepage.

---

## 2. What I built while you were asleep

### Phase 1, the bleeding

| Fix | Status |
|---|---|
| Mobile H1 hidden behind the sticky header | Fixed. Pinned hero stage is now desktop-only below 880px. |
| Homepage schema said the course costs $297 | Fixed. Now $49 everywhere. |
| Hero content started at `opacity:0`, delaying paint | Fixed. Transform-only animations, nothing above the fold starts invisible. |
| `/course/` indexed despite robots block | Fixed. Removed the Disallow so Google can crawl and see the existing noindex. |
| Raw Vercel 404 screen | Fixed. Branded `404.html` with nav, six recovery links and a GA4 event. |
| `/how-it-works` dead but indexed | Fixed. 301 to `/#flightplan` in `vercel.json`. |
| `lang="en"` on an Australian site | Fixed. `en-AU` on all 33 pages. |

Two visible product decisions that came out of the mobile fix, so you are not
surprised:

1. **The scroll-driven take-off animation is now desktop-only.** On a phone the hero
   is taller than the screen, so centring it inside one viewport height pushed the
   headline up behind the header. Padding alone only got the overlap from 40px to
   32px. Returning the hero to normal flow below 880px fixed it properly.
2. **The header Enroll button moved into the mobile menu.** Brand plus button plus
   hamburger could not share one line without the button painting over your
   wordmark. The hero's "Start Free Preview" is above the fold on mobile anyway, and
   the menu now opens with a full-width amber Enroll button.

### Phase 2, findability

- **23 titles rewritten** keyword-first. All now 44 to 62 characters.
  `Cleared for Take-Off Academy, Trades & Construction` became
  `AI for Tradies | Plain-English AI Course for Australian Trades`.
- **Every meta description rewritten** to 110 to 160 characters. The 255-character
  ones are gone.
- **Internal linking built.** Every article had exactly one inbound link. Now:

  | Article | Before | After |
  |---|---|---|
  | how-to-spot-when-ai-is-wrong | 1 | 11 |
  | prompt-library | 1 | 9 |
  | stop-ai-training-on-your-data | 1 | 9 |
  | which-ai-tool-to-start-with | 1 | 8 |
  | write-better-prompts-four-controls | 1 | 8 |
  | is-it-too-late-to-learn-ai | 1 | 5 |
  | is-ai-safe-for-kids | 1 | 4 |

- **Sitemap regenerated** with `lastmod` on all 26 URLs.
- **BreadcrumbList** on 25 pages. **Person** entity on About, with all seven articles
  linking their author to it. **WebPage** schema on the three legal pages.
  **HowTo** schema on the two step-by-step articles. 63 JSON-LD blocks, all valid.
- **Visible "Updated" dates** on all seven articles, `dateModified` refreshed.

### Phase 3, belief

- Navigation cut to five items plus a subdued Student login.
- `$49 AUD, once. Lifetime access. Not a subscription.` above the fold.
- "What this course is not" moved from section 9 to section 3.
- Founder credibility block above pricing, using your own About copy.
- Type system unified: the course area was downloading Outfit and Inter from Google
  Fonts and never declaring `font-family` once. Removed, now matches the marketing site.

### Phase 4, the long game

- **Images.** Every image on the site was a fully opaque RGBA PNG, paying for an alpha
  channel it never used. Generated AVIF and WebP at 1x and 2x with JPEG fallbacks,
  wrapped in `<picture>`. The book page went from about 4.6MB of images to **65KB**.
  The 1.9MB book cover now serves as a 15KB AVIF.
- **Citations.** Went from 4 authoritative outbound links sitewide to 25 across 18
  sources: OpenAI, Anthropic, Google, Microsoft, OAIC, Scamwatch, ACCC, eSafety, the
  National AI Centre and the Department of Education. Every URL was checked to
  resolve. Each article now has a "Sources and further reading" block.
- **Field-specific prompts.** Three copy-paste prompts per audience page, written for
  that field only, each with a "Then:" line on what to check. Phrase-level overlap
  between audience pages dropped from 0.256 to 0.219, unique content up to 60.3%.
- **Analytics.** GA4 now records the funnel, not just pageviews:
  `begin_checkout`, `start_free_preview`, `article_click`, `book_retailer_click`,
  `outbound_click`, `generate_lead`, `join_waitlist`, `login_link_requested`,
  `course_access_granted`, `scroll_depth`, `page_not_found`. All verified firing.
  Server-side `purchase` with real Stripe amounts is written into the webhook and
  waits on `GA4_API_SECRET`.
- **Accessibility.** Keyboard focus styles added to 13 pages plus the course
  stylesheet that had none. All 9 images have alt text, no unlabelled links.
- Post-checkout redirect now goes to the canonical `www` host instead of taking a
  308 immediately after payment.

### Second pass: things I had missed

I said I was finished and I was not. A second look found these, and they are all done.

**Bugs found and fixed**

- **Six articles had FAQ sections with no `FAQPage` schema.** FAQ markup is the single
  most citable format there is and it was sitting unmarked. Extracted the real questions
  and answers from the pages, 18 pairs now marked up.
- **The homepage had an `<h2>` before the `<h1>`.** The mid-flight overlay came first in
  the DOM. It is absolutely positioned, so moving it after the hero content changed
  nothing visually and fixed the heading order.
- **The contact form was throwing away the organisation field.** The form collects it,
  the JavaScript never sent it. Now sent and stored.
- **`api/contact.js` still had the $297 ghost.** Its label map referenced an
  "Academy Live Cohort ($997)", "Academy Self-Paced ($297)" and a "$2,497 workshop",
  none of which exist, and none of which matched the values the form actually sends.
  Every enquiry was being mislabelled. Replaced with the real options.
- **The form's error message told people to email `naomi@wildheartshq.com`**, which is
  the placeholder domain. Now points at `hello@clearedfortakeoff.com.au`.
- **Article headers were 108px tall and sticky on mobile**, so an eighth of a phone
  screen was permanently gone while reading. Now 49px, wordmark on one line.

**Weight**

- **5.66 MB now excluded from every deploy** via a new `.vercelignore`: the original
  source PNGs (all replaced by the AVIF/WebP renditions and referenced by nothing),
  the unused `Cover.jpg`, and the course-content markdown. Deployed size is 3.24 MB.
- **og-image went from a 303KB PNG to a 54KB JPEG**, updated across 23 pages with an
  `og:image:type` declaration.

**Added**

- **`feed.xml`**, an RSS feed of all seven articles, linked from every page and declared
  in robots.txt.
- **`llms.txt` rewritten.** It was stale and thin. Now covers the audience pages, every
  article, the free resources, the common questions the site answers, the refund position,
  the ABN and a citation request.
- **Organization schema upgraded** to `EducationalOrganization` with the ABN, a contact
  point, the Canberra address, `areaServed`, and the founder linked to the Person entity.
- **Email capture on all eight article pages.** Deliberately does **not** gate anything:
  the prompt library is your most-linked asset and hiding it behind a form would cost more
  in links and AI citations than it would gain in addresses. It posts to the existing
  `/api/contact` endpoint, so it works with the MailerLite key you already have. Tested:
  invalid addresses are caught client-side, network failures fail gracefully.
- **Caching headers** for the immutable image renditions, a **Permissions-Policy**, and
  correct content types for the feed and llms.txt.
- **Speculation Rules** for near-instant same-site navigation, plus preconnect for the
  analytics domains.

**Note on Content-Security-Policy:** I did not add one. The site is heavily inline, and the
course area loads the Mux video player from a CDN. A CSP strict enough to be worth having
would need testing against real video playback, which I cannot do while the videos are
pending. Worth doing once they are live.

---

## 3. Three corrections to the original audit

I got these wrong the first time and found out while doing the work.

1. **Course pages already had `noindex`.** I reported it as missing. The only real
   problem was robots.txt blocking Google from crawling the pages to see it.
2. **Articles already showed published dates.** I reported them as having none. What
   was genuinely missing was an updated stamp, which I added. `prompt-library` did
   have no date at all.
3. **The audience pages are not 66 to 73% duplicated.** That number came from
   comparing unique word sets, which is a poor measure since pages on similar topics
   naturally share vocabulary. Proper six-word shingle analysis put phrase-level
   overlap at 25.6% and unique content at 55.6% before I started. Your earlier
   "doorway fix" commit worked. I still added the prompt blocks, but as user value
   rather than as a rescue.

---

## 4. Not done, and why

- **VideoObject schema**: needs the module videos to be live.
- **Retailer links**: needs the URLs from you.
- **`sameAs` profiles**: needs the URLs from you.
- **`assets/Cover.jpg`**: 527KB and referenced by nothing. Left in place rather than
  deleting something that might matter to you.
- **The `mux-player` script** on course pages loads from `cdn.jsdelivr.net`. Worth
  self-hosting eventually, but I did not want to touch the video player without
  being able to test a real playback.

---

## 5. When you are ready

```bash
cd ~/Downloads/cleared-for-takeoff && git add -A && git status
```

Review the diff, then commit and deploy. Nothing here is live until you do.

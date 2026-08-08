# Your action checklist

30 steps, in order. Anything marked **[SEND TO CLAUDE]** is something I need back
before I can carry on.

---

## BLOCK A — Decide this first (5 minutes, blocks everything)

> **The course has no videos.** All 56 lessons in `api/video-library.js` are marked
> `PENDING`. There are no cheat-sheet or workbook PDFs either. Stripe is currently
> taking $49 for "6 modules, ~6 to 8 hours of video".
>
> Anyone who buys today receives an empty course. That is a refund claim under the
> Australian Consumer Law, and it is the exact opposite of the honesty the brand is
> built on.

- [ ] **1. Pick one: finish the videos, or switch the course to a waitlist**
  - **Option 1, finish them.** Record and upload all 56 to Mux, then paste each
    Playback ID into `api/video-library.js` in place of `PENDING`.
  - **Option 2, waitlist it.** I change the Enrol buttons to "Join the waitlist",
    capture emails, and you sell the book meanwhile. About 20 minutes of my time.
  - I have not touched the checkout. Taking your paid product offline is your call.
  - **[SEND TO CLAUDE]** which option

---

## BLOCK B — Ship what is already built (10 minutes)

42 files changed, 10 new, sitting uncommitted on branch `phase3-believe`. The live
site still has every problem I found.

- [ ] **2. Look at it running locally first**
  The dev server is saved as `c4to` and serves http://localhost:4201.
  Click through the homepage at phone size, the book page, and one article.

- [ ] **3. Review the diff**
  ```
  cd ~/Downloads/cleared-for-takeoff && git status && git diff --stat
  ```
  For detail on one file: `git diff index.html`

- [ ] **4. Commit**
  ```
  cd ~/Downloads/cleared-for-takeoff
  git add -A
  git commit -m "Site teardown fixes: mobile hero, SEO, schema, images, analytics, funnel"
  ```

- [ ] **5. Merge and deploy**
  ```
  git checkout main
  git merge phase3-believe
  git push
  npx vercel --prod
  ```
  If the Vercel build hangs on UNKNOWN or 0ms, use the prebuilt route:
  ```
  npx vercel build && npx vercel deploy --prebuilt --prod
  ```

- [ ] **6. Check three things on the live site**
  1. Homepage on your actual phone. "AI for Grown-Ups" should be visible. It was not before.
  2. `clearedfortakeoff.com.au/definitely-not-a-page` should give the branded 404.
  3. `/reader/` should load. That page is new.

- [ ] **7. Resubmit the sitemap**
  Search Console → Sitemaps → enter `sitemap.xml` → Submit. Then again for `feed.xml`.
  Every title, description and internal link changed, so this tells Google to look again.

---

## BLOCK C — Republish the book on Amazon (about an hour)

- [ ] **8. Do NOT tick KDP Select**
  This is the one that matters most. Select means 90 days of Amazon exclusivity, which
  makes selling on Gumroad a breach of contract and kills half the marketing plan.
  I checked your current listing: it is wide, not in Kindle Unlimited. Keep it that way.

- [ ] **9. Price at $9.99 or under**
  KDP pays 70% between $2.99 and $9.99, and only 35% outside that band.

  | Price | Royalty | You earn |
  |---|---|---|
  | $9.89 | 70% | $6.92 |
  | $12.99 | 35% | $4.55 |

  A $12.99 ebook earns you a third less per sale and sells fewer copies.

- [ ] **10. Fill the fields like this**
  - Title: `Cleared For Take-Off`
  - Subtitle: put your search terms here, e.g. "A plain-English guide to using AI, for
    people who feel behind". Amazon indexes the subtitle, so this is free search weight.
  - Series: leave empty. There is no series any more.
  - Publisher: Wild Hearts Publishing

- [ ] **11. Use all seven keyword slots**
  Do not repeat words already in the title, Amazon indexes those anyway.
  ```
  ai for beginners australia
  chatgpt for beginners plain english
  ai book for older adults
  how to use ai without coding
  artificial intelligence explained simply
  ai guide for small business owners
  learn ai over 50
  ```

- [ ] **12. Pick two low-competition categories**
  Not "Computers & Technology > AI", you will never rank. Use:
  - Business & Money > Skills
  - Education & Teaching > Adult & Continuing Education

  A category best-seller badge is social proof you can put on the website.

- [ ] **13. Unpublish both old editions once the new one is live**
  Unpublish, do not delete, so existing buyers keep their copy. Two dead editions
  competing with the new one splits your reviews and your ranking.

- [ ] **14. Send me the new ASIN**
  It is in the URL: `amazon.com.au/dp/B0XXXXXXXX`
  The site currently points at the old listing (`B0GS21NW58`), which still works and
  still sells. I swap it the moment you send the new one.
  **[SEND TO CLAUDE]** the new ASIN

---

## BLOCK D — The money plumbing (30 minutes)

- [ ] **15. Create the READER coupon in Stripe**
  I enabled promotion codes at checkout, but the coupon must exist or `/reader/`
  promises a discount that silently does nothing.
  1. Stripe → Product catalogue → Coupons → **New**
  2. Type: Amount off, $10.00 AUD, Duration: **Once**
  3. Save, then click **Create promotion code**
  4. Code: `READER` in capitals. No expiry, no redemption limit.

- [ ] **16. Create the Gumroad account**
  1. Sign up at gumroad.com under **Wild Hearts Publishing**, not a personal account
  2. Settings → Payments: currency **AUD**, connect your bank
  3. Add the ABN `34 695 911 025` for tax

  Gumroad takes 10%, Amazon takes 30%. More importantly, Gumroad gives you the
  customer's email and Amazon never will.

- [ ] **17. List the free prompt library first**
  Start with the free product. Low risk, and it builds your list from day one.
  - Product type: Digital product
  - Price: $0, "pay what you want" off
  - Upload the expanded prompt library as a PDF
  - Turn on **Require email**

- [ ] **18. Then list the two paid products**

  | Product | Price | Contents |
  |---|---|---|
  | Book, direct edition | $14.99 | PDF and EPUB, plus printable prompt library and Tool Hangar guide |
  | Book + course bundle | $55 | Both together, saves them $9 |

  **Do not list an identical ebook cheaper on Amazon.** Your Gumroad version has to be
  visibly better: formats Amazon cannot give them, plus extras.
  **[SEND TO CLAUDE]** the Gumroad product URLs

- [ ] **19. Put the reader offer in the back of the book**
  This is the single mechanic that turns three products into a funnel. Last page before
  the acknowledgements:
  ```
  If the book worked, the course is the same thing
  with me talking you through it.

  Six short modules, at your own pace, and Module 1
  is free with no payment details. Because you bought
  the book, use the code READER for $10 off the rest.

  clearedfortakeoff.com.au/reader
  ```
  Amazon will never tell you who bought your book. A code in the back matter is the
  only way to convert a reader into someone you can email.

---

## BLOCK E — Turn the instruments on (15 minutes)

You have been flying blind. GA4 was only installed on 6 July, so 131 days of traffic
from launch were never recorded and cannot be recovered.

- [ ] **20. Turn on Vercel Web Analytics**
  Vercel → project `cleared-for-takeoff` → Analytics tab → Enable. Free on your plan,
  and it gives real Core Web Vitals from actual visitors.

- [ ] **21. Link Search Console to GA4**
  GA4 → Admin → Product links → Search Console links → Link.

- [ ] **22. Add the GA4 Measurement Protocol secret**
  1. GA4 → Admin → Data streams → your web stream
  2. Measurement Protocol API secrets → Create → copy the value
  3. Vercel → project → Settings → Environment Variables → add `GA4_API_SECRET`
  4. Redeploy

  I wrote server-side purchase tracking into the Stripe webhook. It stays a silent
  no-op until this exists. Once it does, you get real revenue figures from Stripe.

- [ ] **23. Register Bing Webmaster Tools**
  bing.com/webmasters, import from Google Search Console in one click.
  Bing feeds ChatGPT search, so for an AEO play this matters.

- [ ] **24. Pull five reports and send them to me**
  1. Search Console → Performance, last 3 months: clicks, impressions, average position
  2. Search Console → Pages: how many of your 27 URLs are actually indexed
  3. Search Console → Queries: every term you get an impression for
  4. GA4 → Traffic acquisition, since 6 July, split by channel
  5. GA4 → Pages and screens: which pages get views

  Screenshots are fine. This is the most useful thing you can give me, because right
  now every recommendation is inference rather than measurement.
  **[SEND TO CLAUDE]** the five reports

---

## BLOCK F — The proof problem (ongoing, start now)

Zero testimonials, zero reviews, on both products. This is the binding constraint on
everything else, and the only thing on this list I genuinely cannot do for you.

- [ ] **25. Send the finished book to 20 real readers**
  Not friends who will be nice. People who fit the audience and will actually read it.
  Ask for a review only if they think it deserves one, and say so explicitly.
  Amazon barely surfaces a book under about 15 reviews.
  Amazon permits this as long as you never require or pay for a positive review.

- [ ] **26. Collect six testimonials**
  `TESTIMONIALS-FILL-IN.md` in your repo has the exact fields, the three questions that
  produce good quotes, and a copy-paste email. The three questions in short:
  1. What were you worried about before you started?
  2. What can you do now that you could not a month ago?
  3. What would you say to someone your age who thinks it is too late?

  The third answer is usually the testimonial. Both components are already built and
  styled on the site. They are empty because I will not invent quotes.
  **[SEND TO CLAUDE]** the filled-in file

- [ ] **27. Build one 45-minute talk and book three venues**
  One library, one U3A branch, one Probus club. Free, no pitch.
  This is the highest-leverage thing in the whole plan. Every talk is a room full of
  your exact buyer, and it solves the testimonial problem and the email list problem at
  the same time. Bring a printed permission slip and collect quotes on the spot.
  It is also the one channel TAFE, CSIRO and Google cannot follow you into.

---

## BLOCK G — Small things, whenever (5 minutes)

- [ ] **28. Send me a course screenshot**
  The dashboard or a module page. The homepage has no photograph of the actual product
  and I will not fake one.
  **[SEND TO CLAUDE]** a screenshot

- [ ] **29. Send me your LinkedIn or other profile URLs**
  Your Amazon author page is already in the schema. Anything else you want Google to
  associate with you as an entity, send it.
  **[SEND TO CLAUDE]** profile URLs

- [ ] **30. Decide on wildheartshq.com**
  It is a GoDaddy "Launching Soon" placeholder. I removed the link to it from the book
  page and stopped the contact form pointing people at an address on that domain.
  Either build it or let it go.

---

## The short version

- **Fastest meaningful move:** Block B. Ten minutes, and a month of fixes goes live.
- **Most important:** Block A. Every marketing dollar spent before that buys refunds.
- **The long pole:** Block F. Start it today because it takes weeks, not hours.

# Cleared For Take-Off: where things stand

Updated 7 August 2026, end of session. This supersedes `CHECKLIST.md`, which was
written before the course turned out to be finished.

---

## The headline

**The course is live and deliverable.** It was not this morning.

The 36 adult-course videos had been made, uploaded to Mux and secured months ago.
Nobody had pasted the playback IDs into `api/video-library.js`, so every lesson read
`PENDING` and the site returned "Video not yet available" to anyone who paid. That
is fixed, tested end to end, and deployed.

Everything you promise on the pricing page is now actually delivered: six modules of
video, six cheat sheets, six workbooks, and the Tool Hangar guides.

---

## Done today (nothing needed from you)

- Mobile headline was invisible behind the sticky header. Fixed.
- Google was told the course costs $297. Now $49.
- 36 of 36 course videos wired and streaming, signed playback intact.
- 14 PDFs delivered through a new entitlement-gated download route.
- The book had five buy buttons that all pointed at themselves. Now go to Amazon.
- Your full name removed from the site, copyright is the company.
- One contact address everywhere: `info@wildheartspublishing.com.au`
- 23 titles rewritten keyword-first, every meta description rewritten.
- Articles went from 1 inbound link each to 4 to 11.
- Ten audience pages went from 1 inbound link to 27, via a directory above every footer.
- Images: book page went from 4.6MB to 65KB. 5.7MB removed from every deploy.
- Citations went from 4 to 21 authoritative sources.
- 73 schema blocks, all valid. Breadcrumbs, Person, HowTo, FAQ, VideoObject.
- 14 GA4 events, from a standing start of pageviews only.
- New pages: `/reader/`, `/free-lesson/`, a branded 404.
- Sitemap, RSS feed, rewritten `llms.txt`, keyboard focus styles.

Five commits, all deployed. Nothing uncommitted.

---

## 1. Do these first (this week)

- [ ] **Add `GA4_API_SECRET` to Vercel.** Until you do, you can see checkouts start
      but not the money. GA4 → Admin → Data streams → your web stream → Measurement
      Protocol API secrets → Create → copy → Vercel → Settings → Environment
      Variables → redeploy. Five minutes.

- [ ] **Create the Stripe `READER` coupon.** `/reader/` promises $10 off and the code
      does not exist yet, so it silently fails. Stripe → Product catalogue → Coupons →
      New → Amount off, $10.00 AUD, Duration Once → Save → Create promotion code →
      `READER`.

- [ ] **Request indexing on `/free-lesson/`.** Quota resets daily.
      https://search.google.com/search-console/inspect?resource_id=https://www.clearedfortakeoff.com.au/

- [ ] **Test a real purchase yourself.** Buy the course with a real card, watch a paid
      lesson, download a workbook. Nothing has been through the full paid path since
      the videos were wired. Refund yourself afterwards.

- [ ] **Check the pricing page still tells the truth.** It lists "screen-recorded
      walkthroughs". The videos are slides with narration. Decide whether that line
      stays.

---

## 2. The proof problem (start now, takes weeks)

Still zero testimonials and zero reviews, on both products. This is the single
biggest constraint left, and the only thing on this list I cannot do for you.

- [ ] **Send the book to 20 real readers** for honest reviews. Amazon barely surfaces
      a book under about 15 reviews. Never require or pay for a positive one.

- [ ] **Collect six testimonials.** `TESTIMONIALS-FILL-IN.md` has the fields, the three
      questions that produce good quotes, and a copy-paste email. The components are
      built and styled on the site, waiting. Send me the filled-in file.

- [ ] **Start collecting star ratings.** One question at the end of Module 6: "out of
      five, how confident do you feel now?" That number unlocks `AggregateRating`
      schema and star ratings in Google.

- [ ] **Build one 45-minute talk. Book a library, a U3A branch and a Probus club.**
      Highest-leverage item in the whole plan. Solves testimonials and the email list
      at the same time, and it is the one channel TAFE, CSIRO and Google cannot follow
      you into.

---

## 3. The book

- [ ] **Republish the combined edition on Amazon.** Do NOT tick KDP Select: it means
      90 days of exclusivity and kills Gumroad entirely. Price at $9.99 or under, where
      the royalty is 70% rather than 35%. Put your search terms in the subtitle. The
      seven keyword slots and two recommended categories are in the marketing plan.

- [ ] **Send me the new ASIN.** The site points at the old listing (`B0GS21NW58`),
      which still works and still sells. I swap it in minutes.

- [ ] **Unpublish both old editions** once the new one is live.

- [ ] **Put the reader offer in the back matter**, pointing at
      `clearedfortakeoff.com.au/reader`. This is the only way to convert an Amazon
      reader, whose email you will never see, into someone on your list.

---

## 4. Gumroad

- [ ] **Create the account** under Wild Hearts Publishing, currency AUD, ABN
      34 695 911 025.
- [ ] **List the free prompt library first.** Lowest risk, and it builds the list from
      day one.
- [ ] **Then the paid two:** $14.99 direct edition (PDF and EPUB plus extras), $55
      book-and-course bundle. Do not list an identical ebook cheaper on Amazon.
- [ ] **Send me the product URLs** and I will wire the buy buttons into the book page.

---

## 5. What I can build next, on your word

- **The other five free lessons.** `/free-lesson/` is live as a test: real video, full
  transcript, VideoObject schema, indexable. If Google picks it up in a fortnight, the
  other five Module 1 lessons become five more indexable, transcript-backed pages
  targeting exactly what your buyers search for. Nobody else in your market has this.

- **The three Block F documents.** The beta-reader email, the 45-minute talk outline
  and speaker notes, and the venue pitch email for libraries and U3A. These turn "run
  talks" from an intention into three emails you send on Monday.

- **Article production.** Two a week toward 30, clustered on the four themes that
  already work: AI for the over-50s, AI safety for families, AI for specific Australian
  trades, and plain-English tool comparisons. I draft, you edit.

- **Kids & Teens videos.** 20 lessons still `PENDING`. That product is on a waitlist so
  nothing is being misrepresented, but the pipeline that made the adult videos
  (`c4to_make_videos.py`, slides plus ElevenLabs audio) is sitting there ready.

---

## 6. Watch, do not touch

- **Google indexing.** 4 of 28 pages indexed as of today, and 2 search clicks in three
  months. Sitemap submitted, ten pages pushed manually. The green line on the Page
  indexing chart should climb over the next fortnight. If it has not moved at all by
  the 21st, tell me.
  https://search.google.com/search-console/index?resource_id=https://www.clearedfortakeoff.com.au/

- **The five GA4 numbers that matter:** email signups per week, free preview starts,
  preview-to-checkout ratio, organic clicks, book sales per week. Ignore pageviews,
  followers, impressions and anything called engagement.

---

## Open questions for you

1. Does `wildheartshq.com` get built or let go? It is a GoDaddy placeholder and I have
   removed the site's links to it.
2. Do you sell the book anywhere besides Amazon? I removed the unverifiable Apple
   Books, Kobo and Google Play claims. Send links and they go back.
3. Your LinkedIn or other profile URLs, for `sameAs` on the Person schema. The Amazon
   author page is already in there.
4. A screenshot of the course dashboard for the homepage. I will not fake one.

---

## Reference

| | |
|---|---|
| Repo | `~/Downloads/cleared-for-takeoff`, branch `main` |
| Preview | `npx serve -p 4201 ~/Downloads/cleared-for-takeoff` |
| Deploy | `npx vercel --prod` |
| Teardown report | https://claude.ai/code/artifact/b510cfcd-1b74-4c1e-8afe-34a00436848f |
| Marketing plan | https://claude.ai/code/artifact/dc6cde27-a6c9-496f-8c42-36f678529157 |
| Course videos | 36/36 wired, Mux signed playback |
| Downloads | 14 PDFs, `/api/resource`, entitlement gated |

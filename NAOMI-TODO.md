# Your checklist

**Updated 21 August 2026.** This replaces the earlier version. Anything not on
this list is either done or is mine to do.

Ordered by urgency. Times are honest estimates.

---

# 🔴 Today

## 1. Replace the Claude token · 5 minutes

**Why:** it was visible on screen in a screenshot, so treat it as burned. It is
the token the automation engine uses to run every night.

1. On your **Mac**, open **Terminal**. Press **⌘ + Space**, type `Terminal`, press **Enter**.
2. Type this and press **Enter**:
   ```
   claude setup-token
   ```
3. Your browser opens. Approve it. Terminal then **prints** a token starting `sk-ant-`.
   It does not save it anywhere. Leave the window open.
4. Select that token with your mouse and copy it (**⌘ + C**).
5. Paste this whole line into Terminal and press **Enter**:
   ```
   bash -c 'read -rp "Paste the token then press Enter: " T; printf "%s" "$T" | ssh -i ~/.ssh/wildhearts_server root@168.144.175.96 /root/save-token.sh'
   ```
6. It asks you to paste. Press **⌘ + V**, then **Enter**.

**Success:** it confirms the token was saved. If you paste the wrong thing it
refuses and tells you what it got.

> `/root/` is on the **DigitalOcean server**, not your Mac. That command reaches
> across for you, so you never have to find it yourself.

## 2. Watch the 1pm engine run · 2 minutes, at about 1:05pm

**Why:** the automation engine is now scheduled. Today is the first time it runs
by itself on the server. MMP only. It runs at **6am, 1pm and 7pm** Sydney time.

Open **Terminal** and paste:
```
ssh -i ~/.ssh/wildhearts_server root@168.144.175.96 'ls -t /opt/crewible-engine/brands/mmp/.crewible/runs/*.log | head -1 | xargs tail -30'
```

**Success:** you see a report about Murder Mystery Party. It may say it is
waiting on something, which is fine and honest.

**If it says it cannot find a state file and has stopped:** that is correct
behaviour, not a fault. It refuses to invent a starting point. Tell me and I
will confirm whether it is a genuine first run.

---

# 🟠 This week

## 3. Google Search Console · 30 minutes · unblocks everything else

**Why:** without it, nobody, me included, can tell you what the site ranks for or
whether any of this month's work moved anything. Every audit you have paid for
has said this. It is the single highest-value thing on this list.

1. Go to **https://search.google.com/search-console**
2. Sign in with the Google account that owns the site's analytics.
3. Top left, click the property dropdown, then **Add property**.
4. Choose the **Domain** box on the **left**, not URL prefix on the right.
5. Type `clearedfortakeoff.com.au` — no `https://`, no `www`. Click **Continue**.
6. It shows a **TXT record**. Copy it.
7. In a new tab, go to wherever the domain's DNS is managed. Add a TXT record on
   the root (`@`), paste the value, save.
8. Back in Search Console, click **Verify**. If it fails, wait an hour and try
   again. DNS is slow; this is normal, not a mistake.
9. Once verified: left menu → **Sitemaps** → type `sitemap.xml` → **Submit**.

**Success:** the Coverage report appears within a few days and tells you how many
of the 36 sitemap URLs Google has actually indexed.

## 4. Ask Google to look at the eight new pages · 10 minutes

Only after step 3. In Search Console, click **URL Inspection** at the top, paste
each of these, press **Enter**, then click **Test live URL**:

```
https://www.clearedfortakeoff.com.au/ai-course-for-beginners/
https://www.clearedfortakeoff.com.au/who-its-for/
https://www.clearedfortakeoff.com.au/contact/
https://www.clearedfortakeoff.com.au/ai-workshops-for-libraries-and-community-groups/
https://www.clearedfortakeoff.com.au/ai-consulting/
https://www.clearedfortakeoff.com.au/ai-readiness-assessment/
https://www.clearedfortakeoff.com.au/blog/will-ai-take-my-job/
https://www.clearedfortakeoff.com.au/blog/when-not-to-use-ai/
```

**Success:** each says "URL is available to Google". Then click **Request indexing**.

## 5. Connect c4to-academy to GitHub · 10 minutes

**Why:** that Vercel project has never been connected, so every deploy is a manual
upload from your laptop that bakes your live Stripe keys into the build. Connecting
it means Vercel builds on its own servers and none of that happens.

1. Go to **https://vercel.com** and sign in.
2. Top left, check the team says **info-33179269s-projects**, not your personal account.
3. Click the project **c4to-academy**.
4. Click **Settings** along the top, then **Git** in the left menu.
5. Click **Connect Git Repository** → **GitHub** → **wild-hearts/c4to-academy**.
6. Approve the GitHub authorisation if asked.
7. Set the production branch to **main**, save.

**Success:** the Deployments tab shows a new build within a couple of minutes.

**If it fails with `UNKNOWN`:** stop and tell me. That means the build problem is
across your whole Vercel team, and it is worth raising with Vercel support.

## 6. Two Vercel toggles · 5 minutes total

**Web Analytics:** vercel.com → project **cleared-for-takeoff** → **Analytics**
tab → **Enable**. Tell me when it is on and I will add the tracking snippet.

**GA4_API_SECRET:** it is still not set, which means you cannot see checkouts
actually complete. In the same project: **Settings** → **Environment Variables** →
add `GA4_API_SECRET` with the value from your GA4 admin (Admin → Data Streams →
your stream → Measurement Protocol API secrets → Create).

---

# 🟡 Decisions only you can make

## 7. Cost the group training packages

The $199 / $399 / $699 tiers were invented by an AI session in June and are now
**off the site** — all three read "Quoted per group". That is honest but it is a
holding position.

What I need: what a facilitated session actually costs you to prepare and deliver,
and what you charged the last group you taught. Then the numbers go back with the
price guard watching them.

## 8. Honour 30 days for one group of buyers

Already agreed, recorded here so it is not lost. Anyone who bought through
**academy.clearedfortakeoff.com.au** between **2 July and 13 August 2026** saw a
30-day refund promise. They get 30 days. Everyone else gets 14.

It is written into the automation config, so the crew will apply it too.

## 9. Does academy.clearedfortakeoff.com.au keep selling?

It runs its own Stripe checkout and sells the same $49 course as the main site,
and both are indexed by Google as separate sites competing with each other.

Either it keeps selling and the two must be kept in step forever, or it becomes
students-only and all buying happens on the main site. Today's refund mismatch
was the first symptom of having two shops.

## 10. Say publicly that operations are AI-assisted?

Open since the operating plan was written. This is the brand whose promise is
*"No jargon. No hype. No pretending to be someone you're not."*, sold to people
anxious about AI. Deciding deliberately beats it surfacing in a student's question.

---

# 🟢 The biggest gap: proof

There is still not one testimonial, star rating or customer photo anywhere on the
site. Page quality is no longer the bottleneck; this is.

## 11. Six testimonials

`TESTIMONIALS-FILL-IN.md` has the fields. The CSS and schema are built and
waiting, so it is about twenty minutes of my work once you have real quotes to
paste in. Agreed: they go up when you have them.

## 12. Book three talks

A library, a U3A branch and a Probus club. You now have a page built specifically
to sell that, and the talks are what generate the testimonials the page needs.

---

# 📕 The book funnel

You want one book, sold in three places, feeding the course. Here is the order
it has to happen in, because each step depends on the one above it.

## 13. Republish the combined edition on Amazon · your job

**Why first:** everything else points at this. Until there is one book with one
ASIN, a Gumroad page and a website page would be advertising something a reader
cannot reliably find.

1. Go to **https://kdp.amazon.com** and sign in.
2. Publish the combined edition as a **new** title.
3. When it is live, open its Amazon page and look at the address bar. It reads
   `amazon.com.au/dp/XXXXXXXXXX`. **Copy that code and send it to me.**
4. Only then, unpublish the old separate listings.

**Do not touch the website.** The old code `B0GS21NW58` is in sixteen links
across fourteen files. I now have a single command that changes every one of
them at once and then proves none were missed. Hand-editing them is how one gets
left pointing at a delisted book.

## 14. Create the Gumroad account · your job · 15 minutes

**Why Gumroad and not just Amazon:** on Amazon you get a royalty and no idea who
bought it. On Gumroad you get the full price and the buyer's email address, and
that email address is what sells the $49 course later. Amazon is reach. Gumroad
is the list.

1. Go to **https://gumroad.com** and click **Start selling**.
2. Sign up with the Wild Hearts email address, not a personal one.
3. When it asks what you sell, choose **Digital products** → **E-books**.
4. Fill in the payout details so it can actually pay you.
5. Send me the URL of your Gumroad profile. It looks like
   `https://yourname.gumroad.com`.

**Stop there.** Do not build the product page. I will do that once I have the
URL, so the pricing, the reader code and the course upsell all line up.

## 15. What I do once you send me those two things

- The free prompt library as a $0 Gumroad product, which is the top of the funnel
- The book as a paid Gumroad product, priced against the Kindle edition
- A `/book/` page that offers both Amazon and Gumroad rather than only Kindle
- The `READER` code placed inside the Gumroad edition as well as the Kindle one
- The email that goes to a Gumroad buyer, pointing at the free Module 1

---

# ⚪ Still open from earlier sessions

Not superseded by anything recent. Full detail in `TODO.md`.

- [ ] Buy the course yourself with a real card, end to end, and watch a paid
      video. **Do this last**, once the funnel above is built, so one test
      purchase checks the whole chain rather than just the checkout.

---

# ✅ Done, so ignore these if you see them elsewhere

- The Stripe `READER` coupon is live and working: $10 off, no expiry, and
  restricted to the adult course only, so it cannot be used against the $12.99
  book, the kids courses, or any other Wild Hearts brand's checkout
- The invented group prices are off the site
- Both storefronts now say 14 days
- `c4toacademy.com` has been checked: it is a second public marketing site with its own checkout
- The three flagged claims on the new pages are confirmed and live
- "Sydney" appears in no live page; the Canberra inconsistency is resolved
- The engine token is installed and the schedule is running
- CVelo was moved back to `setup` because none of its connectors exist

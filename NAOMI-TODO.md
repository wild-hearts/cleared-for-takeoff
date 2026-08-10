# Things only you can do

Everything buildable in this repo is done. These five need your login, your
judgement, or a fact I do not have. Ordered by what unblocks the most.

---

## 1. Connect Google Search Console (30 minutes, unblocks everything else)

Both briefs call this the one true blocker, and they are right. Until it is
connected, nobody, me included, can tell you whether the site is indexed, what
it ranks for, or whether any of this month's work moved anything.

1. Open a browser and go to **https://search.google.com/search-console**
2. Sign in with the Google account that owns the site's analytics.
3. On the left, click the property dropdown at the very top, then **Add property**.
4. Choose the **Domain** box on the left, not the URL prefix box on the right.
   Type `clearedfortakeoff.com.au` with no `https://` and no `www`. Click **Continue**.
5. Google shows a **TXT record**. Copy it.
6. In a new tab go to wherever the domain's DNS lives, add a TXT record on the
   root (`@`), paste the value, save.
7. Back in Search Console, click **Verify**. If it fails, wait an hour and click
   Verify again; DNS is slow and this is normal.
8. Once verified, click **Sitemaps** in the left menu, type `sitemap.xml` in the
   box, click **Submit**.
9. Click **URL Inspection** at the top and paste each of these in turn, pressing
   Enter and then **Test live URL**:
   - `https://www.clearedfortakeoff.com.au/`
   - `https://www.clearedfortakeoff.com.au/for-later-life/`
   - `https://www.clearedfortakeoff.com.au/ai-workshops-for-libraries-and-community-groups/`
   - `https://www.clearedfortakeoff.com.au/blog/`
   - `https://www.clearedfortakeoff.com.au/free-lesson/`

**Success looks like:** each URL says "URL is on Google" or "URL is available to
Google". The Coverage report a few days later tells you how many of the 33
sitemap URLs are actually indexed.

**What it answers:** whether the thin-index worry is real or whether the site is
simply young. Do not let anyone rebuild anything on a guess before this exists.

---

## 2. Turn on Vercel Web Analytics (FT-13, two minutes)

GA4 is installed and working, so this is not urgent. It gives you per-route
numbers with no cookie-banner implications, which is how you find out which of
the eleven audience doors actually earns its keep.

1. Go to **https://vercel.com** and sign in.
2. Open the project called **cleared-for-takeoff**.
3. Click the **Analytics** tab along the top.
4. Click **Enable**.

**Success looks like:** the tab stops offering an Enable button and starts
showing a (empty at first) chart. Data appears within a day.

Tell me once it is on and I will add the script tag.

---

## 3. Check what the second domain is serving (FT-14, ten minutes)

`c4toacademy.com`, `www.c4toacademy.com` and `academy.clearedfortakeoff.com.au`
all point at a **different** Vercel project called `c4to-academy`, last deployed
April 2026. I have not touched it.

1. Open **https://c4toacademy.com** in a browser.
2. Look at what loads.

Then tell me which of these it is:

- **It is the gated learning platform, nothing marketed.** Fine. I will confirm
  it is `noindex` and close the ticket.
- **It shows course marketing copy that also exists on clearedfortakeoff.com.au.**
  That is genuine cross-domain duplication and the two sites are competing with
  each other. I will add canonicals pointing at the main domain, or strip the
  marketing pages.
- **It is broken or empty.** Also worth knowing, and quick to fix.

---

## 4. Confirm three claims before the new pages go live

The three new commercial pages carry three sentences I could not verify from
anything already on the site. They render with an **amber outline** so you
cannot miss them, and they are marked `data-confirm` in the HTML.

| Page | Claim | I need |
|---|---|---|
| `/ai-workshops-for-libraries-and-community-groups/` | "The session is live and facilitated either way", i.e. online as well as in person | Do you run these online? |
| `/ai-consulting/` | "We do not resell tools and we take no commission from any vendor" | True? It is a strong trust claim and worth being certain about |
| `/ai-readiness-assessment/` | "Most of what matters comes from short conversations" | Roughly how much of a client's time does an assessment take? |

Find them all with:

```bash
grep -rn "data-confirm" ai-consulting ai-readiness-assessment ai-workshops-for-libraries-and-community-groups
```

Once you tell me the answers I will write them in properly and remove the
outline. **Do not deploy these three pages until then.**

---

## 5. Two accuracy items both briefs flagged, neither of them SEO

Raised in the SEO brief and again in the Forge brief, still unresolved, and on a
site whose whole pitch is honesty about AI they matter more than any ticket I
have closed today.

- **The Sydney / Canberra inconsistency.** Something in the copy says Sydney
  somewhere. The schema and `/contact/` both say Canberra. One of them is wrong.
- **The unverified statistics.** Earlier audits flagged numbers in the copy with
  no source. I have not gone looking for them, because deciding what is true is
  your call, not mine.

Worth its own pass when you have an hour.

---

## Not doing, deliberately

- **FT-09, the anchor-text refinement.** The brief marks it P3 and optional, and
  says explicitly not to spend a session on it. The homepage links already read
  "For creators & writers", "For small business", "For later life". The only gain
  available is adding a category noun, and it is not worth the edit.
- **Any URL migration.** Both briefs are emphatic. The existing slugs stay.
- **`aggregateRating` or `review` markup.** Not until real, collected, displayed
  reviews exist on the page. Fabricated ratings are a direct Google penalty and,
  for a paid course sold in Australia, a consumer-law exposure.

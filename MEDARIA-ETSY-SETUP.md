# Medaria Aid on Etsy - findings, blockers and the build pack

Prepared 1 September 2026. Working document, not part of the Cleared for Takeoff
site (`*.md` is excluded in `.vercelignore`, so this is not served publicly).

---

## 1. What the records actually show

Searched: the Gmail mailbox on `medariaaid@gmail.com`, Google Drive, and public
web search for a live Etsy shop.

**There is one Etsy account and it is already Medaria's, on `medariaaid@gmail.com`.**

| Date | Email | What it tells us |
|---|---|---|
| 25 Apr 2026 | "Confirm your Etsy account - Hi Medaria!" | Account created on `medariaaid@gmail.com` |
| 25 Apr 2026 | "Password reset time!" then "Your Etsy password was updated" | Reset the same day as signup |
| 28 Apr 2026 | "Thanks for joining Etsy, Medaria!" | Verification chased again |
| 2 May 2026 | "Millions of shoppers can't wait for your grand opening" | Etsy's seller-onboarding nudge. A shop was started and never opened |
| 8 Aug 2026 | "Password reset time!" | Second reset |
| 14 Aug 2026 | Reset, "password was updated", "did you recently sign into Etsy?" (Safari 26, Mac OS X, **Canberra**) | Third reset, then a successful sign-in |

**CORRECTED 1 Sep 2026.** The first version of this document said there was no Little
Poppin Etsy account. That was wrong, and the error came from searching only one mailbox.

There is a live Little Poppin Etsy shop. Per `docs/TOMORROW.md` in the
`wild-hearts/littlepoppin` repo (dated 10 Aug 2026): the shop opened **2 July 2026 with 97
listings**, and Shop Manager shows the account name **"Naomi"**, not Medaria. A further **22
listings are staged and validated** but not yet created.

So there are almost certainly **two Etsy accounts**:

| | Account A | Account B |
|---|---|---|
| Email | `medariaaid@gmail.com` | unknown, not this mailbox |
| Name on account | Medaria | Naomi |
| Created | 25 Apr 2026 | on or before 2 Jul 2026 |
| Shop | none ever opened | Little Poppin, 97 live listings |

That same 10 Aug document already flagged this and had not resolved it: *"I could not confirm
this and may have told you wrong... Likely two accounts."* It is still open.

The giveaway is in the mailbox itself: **no Etsy email has reached `medariaaid@gmail.com`
since 25 June**, despite 97 listings going live on 2 July. Either seller notifications are
off, or, far more likely, the shop is not on that account at all.

**Do not act on the email swap until you have opened Etsy > Account settings on both accounts
and written down which email each one uses.** Everything below depends on it.

Separately: Google Search Console for `https://www.littlepoppin.com/` is verified on
`medariaaid@gmail.com`, and so is the Printify account that fulfils Little Poppin's physical
prints. Commercial Little Poppin infrastructure is sitting under the charity's inbox. See 3.1.

### So the plan needs reversing

You asked to move the Little Poppin Etsy login to `info@littlepoppin.com`, then
create a new Medaria account on `medariaaid@gmail.com`. That would take the
account that is already Medaria's, hand it to Little Poppin, and then rebuild
Medaria from scratch. Same amount of clicking, worse outcome, and you lose the
account age (four months of history, which matters for Etsy's new-shop scrutiny).

Do this instead:

1. **Keep** the existing account on `medariaaid@gmail.com` as Medaria's. Nothing to change.
2. **If Little Poppin actually needs Etsy**, create a fresh account on `info@littlepoppin.com`.
   Use a different browser profile - Etsy links accounts by device and browser
   fingerprint and will merrily suspend both if it decides they are one seller
   evading limits. One shop per account is the rule.

---

## 2. What I cannot do, straight up

I cannot create the accounts or build the shop. There is no path:

- No browser session holding your Etsy login, and no Etsy password (three resets
  in four months suggests you may not have it either).
- Zapier has no Etsy connector on your account. I checked. Nothing.
- Every step you asked for is gated on things a person has to do: password
  re-entry, a verification link clicked from the inbox, CAPTCHA, and possibly a
  phone code.

Etsy's Terms also prohibit automated account creation, so even with a browser
this would be the wrong move.

**CORRECTED 1 Sep 2026.** The first version said there was no Etsy API application. There is
a complete Etsy API pipeline already built, in `wild-hearts/littlepoppin`:
`scripts/etsy-auth.mjs` (OAuth 2.0 with PKCE), `scripts/etsy-content.mjs`,
`scripts/stage-etsy.mjs` and `scripts/etsy-publish.mjs`, the last of which creates listings as
drafts by default and is resumable, so an interruption cannot double-list or double-charge.

What that changes: **publishing listings is automatable, and the tooling exists.** What it
does not change: the pipeline requests scopes `listings_r listings_w shops_r shops_w`. None of
those touch account management, so **changing an account email and creating an account remain
impossible via the API** regardless of who runs it. That part stands.

It also still needs two things I cannot supply from here: an `ETSY_KEYSTRING` from an app
registered at https://www.etsy.com/developers/create, and the OAuth consent step, which opens
a browser and catches the redirect on `http://localhost:3003/callback` on your machine. The
tokens land in `dist/.etsy-tokens.json`, which is gitignored, so they exist on your Mac and
nowhere else. As of 10 Aug that keystring was the only thing blocking the 22 staged listings.

**The clicking is about 20 minutes of your time.** The part that takes hours is
the listing copy, tags, policies and Printify mapping, and that is section 5
onwards. That is the half I have done.

---

## 3. Things that will bite you, in order of how much

### 3.1 Which legal entity is the seller?

Medaria Aid is a UK charity. The Etsy sign-in came from Canberra. Etsy requires
the seller to be the legal entity that holds the bank account, at a registered
address, and it drives your Etsy Payments availability, tax reporting and the
currency the shop is locked to.

You cannot have it both ways. Decide before you open the shop, because changing
a shop's country afterwards on Etsy ranges from painful to impossible.

If the seller is the UK charity, everything routes through the UK entity and its
accounts. If it is an Australian arm, that arm needs to exist as an entity with
its own bank account and ABN, and the money then has to move to the charity by a
defensible route.

**This is an accountant question, not a me question.** Do not open the shop until
it is answered.

### 3.2 "100% of profits" is a regulated claim

Your merch copy says "100% of profits go directly into vehicle conversions,
trauma gear, and medevac delivery" and "Buying one shirt = 1/3 of a trauma kit".

In the UK the Fundraising Regulator's Code requires those claims to be accurate
and substantiated. "Profits" needs a written definition (after Printify cost,
Etsy fees, payment processing, currency conversion, and shipping?) and the
equivalence claims need a costing you can produce if asked. Etsy's own policy
also bars listings whose primary purpose is soliciting donations - merch with a
charitable message is fine, a listing that is really a donation is not.

Keep the claim, but define it in the shop's About section and hold the working.

### 3.3 Gift Aid does not apply to merch

Buying a t-shirt is a purchase, not a donation. No Gift Aid. Given you have a
`giftaid@medariaaid.com` alias and a live Gift Aid declaration form, make sure
nothing on the Etsy shop or the merch page implies otherwise.

### 3.4 UK charity trading income

Selling branded merch is generally non-primary-purpose trading. Above the small
trading exemption it becomes taxable and the usual answer is a trading
subsidiary that gift-aids its profits up to the charity.

**Unverified:** I believe the exemption is £8,000, or 25% of incoming resources
capped at £80,000, but I am going from memory and the thresholds move. Check
current Charity Commission guidance with your accountant. If Etsy is only ever
going to turn over a few thousand pounds this is moot, but confirm it rather
than assume it.

### 3.5 Etsy's print-on-demand rules will suspend you if you skip them

Non-negotiable, and the single most common reason POD shops get shut:

- On every listing, under "Who made it", select **"I did"** for the design.
- Add **Printify as a production partner** in Shop Manager (Settings > Production
  partners), and attach that partner to every POD listing. Describe it honestly
  as a print-on-demand manufacturer.
- The artwork must be yours. Anything with a Ukrainian trident, a unit insignia,
  a brigade patch design or a photograph you did not take is an IP problem, and
  Printify's own IP policy will reject it at the print provider before Etsy even
  looks.

### 3.6 The margin is thin and Etsy takes the thickest slice

Etsy charges a listing fee per item per four months, a transaction fee on the
item **and the shipping**, payment processing, and a currency conversion fee if
the buyer pays in a currency other than the shop's. Offsite Ads become mandatory
at a revenue threshold and take a further cut of attributed sales.

**Unverified:** current rates are roughly USD 0.20 listing, 6.5% transaction,
plus processing that varies by country. Check the live schedule before you price.

On a £20 tee with a Printify base cost around £10 to £12 plus shipping, you may
net two or three pounds. That is the argument for section 3.7.

### 3.7 Etsy is the wrong primary channel, and you already own the right one

**REWRITTEN 1 Sep 2026, now that I have read the Little Poppin codebase.**

You do not need to build a Printify store. You have already built one, it works, and it is
better than what Etsy would give you.

`wild-hearts/littlepoppin` is a static site on Vercel with serverless functions, and it
contains a complete, working Printify integration:

| Piece | File |
|---|---|
| Printify API client and order submission | `lib/printify.js` |
| Generated catalogue config (shop id, blueprints, variants, prices) | `lib/printify-config.generated.js` |
| Catalogue setup, cost modelling, webhook registration | `scripts/printify-*.mjs` |
| Stripe Checkout session creation | `api/checkout.js` |
| Payment webhook that submits the Printify order | `api/stripe-webhook.js` |
| Printify shipment webhook and tracking email | `api/printify-webhook.js` |
| Order and failure visibility | `api/ops.js`, `lib/events.js` |

Printify shop id **28504147**. Three formats, three sizes each, priced in AUD cents with
postage already built into the retail price:

| Format | 11x14 | 12x16 | 16x20 |
|---|---|---|---|
| Poster (matte) | $19 | $29 | $32 |
| Stretched canvas | $55 | $65 | $75 |
| Framed (black) | $99 | $109 | $135 |

Blueprint 282 (poster) and 937 (canvas), print provider 99. 93 designs are print-enabled.
Gallery sets can be ordered as a single Printify order at 10% off, capped at 5 prints in both
the page and the server so a hand-crafted request cannot order 93 framed prints. Per your own
9 Aug notes: 279 Printify products on Printify Choice, printed near the buyer in 53 countries,
postage bands US/AU/NZ $15, CA $25, rest of world $32.

**So the Medaria recommendation changes.** Instead of hand-building an Etsy shop, fork this
pattern for Medaria: a Medaria storefront that takes Stripe payments and submits Printify
orders, with the Etsy pipeline as the second channel for discovery. The `medaria-aid` Vercel
project already exists. You would be reusing a stack that has had its silent failures found
and fixed, rather than discovering the same four bugs again.

Two caveats. The Little Poppin stack has still never completed a real end-to-end paid order,
per the open item at the top of `docs/TOMORROW.md` (dated 10 Aug, unticked). And every charity
claim was deliberately stripped out of it in August, which is exactly the compliance work
sections 3.2 to 3.4 say you would have to redo, properly, for Medaria.

### 3.8 Two products in your line may not be Printify products

Your merch doc lists four items. Printify's catalogue does POD apparel very well.
Embroidered patches appear in the catalogue via some providers; enamel pins are
patchy to absent; and Printify does not do digital downloads at all.

- **"Never Give Up" patch** - check Printify's current catalogue for an embroidered
  patch provider that ships to your market. If none, this needs a separate
  manufacturer and becomes stock you hold.
- **Slava Dog pin** - almost certainly a separate enamel pin manufacturer, minimum
  order quantity, held stock. Not a Printify item.
- **Songs for Survival digital album** - Etsy digital download listing, no Printify
  involvement. You need distribution rights for every track. If it is a
  compilation of other artists' work, get that in writing before it goes up.

Only the tee is a clean Printify-to-Etsy product on day one.

### 3.9 Overdue: the Printify Australia shipping requirement

Printify emailed on 21 July 2026: from **4 August 2026**, Australia Post requires
a recipient email or Australian mobile for most parcels into Australia. The email
is still unread and the deadline passed four weeks ago. If Medaria has shipped
anything to Australia since, check for held parcels, and check the checkout
settings on whatever store is connected to that Printify account.

---

## 4. Your 20 minutes of clicking

**A. Recover the Etsy account** (`medariaaid@gmail.com`)
- Sign in at etsy.com. If the password is gone again, reset it from the inbox.
- Turn on two-factor authentication. Three resets in four months is a pattern.
- Confirm the account first name and add the organisation name properly.

**B. Only if Little Poppin needs Etsy**
- New account on `info@littlepoppin.com`, in a separate browser profile.
- Confirm first that `info@littlepoppin.com` actually receives mail. It does not
  appear anywhere in the records and `littlepoppin.com` did not resolve from
  here. You will need to click a verification link, so a dead mailbox stops you
  at step one.

**C. Open the Medaria shop**
- Shop Manager > shop preferences. Language, **country (see 3.1)**, currency.
  Currency is effectively one-way, so pick deliberately.
- Shop name. Suggestions, all available-looking but you must check in the Etsy
  form because it rejects near-duplicates: `MedariaAid`, `MedariaAidShop`,
  `WearTheMission`, `MedariaFrontline`.
- Bank account and billing. This is where the 3.1 decision becomes real.
- Settings > Production partners > add Printify.

**D. Connect Printify**
- printify.com > My Stores > Add new store > Etsy > authorise.
- In Printify, publish each product to Etsy. Printify pushes title, description,
  images, variants and prices; Etsy holds tags and attributes, which you set on
  the Etsy side afterwards.
- Set "This is a digital item" off for physical, and check the shipping profile
  Printify creates. Printify defaults are usually wrong for a UK/AU split.
- Order a sample of the tee before publishing. Colour on screen is not colour on
  cotton, and you are asking people to wear this on behalf of a charity.

---

## 5. Shop content

### Shop title (max 55 characters)
```
Medaria Aid | Merch That Funds Frontline Medevacs
```

### Shop announcement
```
Every item here funds emergency medical missions in Ukraine. Vehicle
conversions, trauma gear, and medevac delivery to frontline units.

Medaria Aid was started by two mothers, one in the UK and one in Australia,
whose sons went to Ukraine. It is now a registered UK charity working with
brigades and medics across several fronts.

Printed to order. Please allow production time on top of shipping.
```

### About section - "Our story"
```
Medaria Aid began with two mothers on opposite sides of the world and one
shared problem: their sons had gone to Ukraine, and the medics there did not
have the vehicles to get wounded people out.

We started buying and converting vehicles. Then trauma kits. Then the medevac
gear the frontline units kept asking for and could not get. We are now a
registered UK charity, and brigades and medics across several fronts know our
name.

This shop exists because people kept asking how they could help from a long way
away. Wearing the mission is not the same as being there. But it pays for the
things that are.
```

**Fill in before publishing:** the registered charity number. It should appear in
the About section and in every listing description. Leaving it out of a shop
making charitable claims is the kind of gap regulators notice.

### Shop sections
- Apparel
- Patches and Pins
- Digital

---

## 6. Listings

Etsy limits: title 140 characters, 13 tags, 20 characters per tag, 13 materials.

Every listing description should end with the standard block in 6.5.

### 6.1 "Help Is On The Way" Tee (Printify)

**Title**
```
Help Is On The Way Unisex Tee | Ukraine Medevac Charity Shirt | Military Green Humanitarian Aid T-Shirt | Funds Frontline Trauma Kits
```

**Tags**
`ukraine charity` · `humanitarian tee` · `medevac shirt` · `charity t shirt` ·
`military green tee` · `frontline medics` · `ukraine support` · `aid worker gift` ·
`unisex slogan tee` · `fundraiser shirt` · `solidarity shirt` · `paramedic gift` ·
`help is on the way`

**Materials** `cotton`, `ringspun cotton`, `water based ink`

**Description**
```
"Help Is On The Way" is what a medic says on the radio when a vehicle is
already moving. It is the whole job in five words.

This tee funds the vehicles. Every purchase goes into conversions, trauma gear,
and getting medevac equipment to frontline units in Ukraine.

DETAILS
- Unisex fit, lightweight ringspun cotton
- Military green or sky blue
- Printed to order, so please allow production time before dispatch
- Sizes S to 3XL, see the size chart image for measurements

FIT
Runs true to size with a relaxed body. If you are between sizes and want it
looser, size up.

CARE
Cold wash inside out, hang dry, do not iron the print. It will outlast the war.
```

### 6.2 "Never Give Up" Morale Patch

**Confirm a Printify embroidered patch provider exists before building this listing.**

**Title**
```
Never Give Up Embroidered Morale Patch | In Honour of Roman | Ukraine Medevac Charity Patch | Hook and Loop Backing | Funds Medical Gear
```

**Tags**
`morale patch` · `embroidered patch` · `ukraine patch` · `never give up` ·
`tactical patch` · `medic patch` · `charity patch` · `velcro patch` ·
`military patch` · `memorial patch` · `ukraine support` · `hook and loop` ·
`aid fundraiser`

**Materials** `embroidery thread`, `twill backing`, `hook and loop`

**Description**
```
Never Give Up. In honour of Roman.

An embroidered morale patch, hook and loop backed, sized for a plate carrier
or a jacket. All proceeds fund medical gear for frontline units in Ukraine.

DETAILS
- [DIMENSIONS - fill in from the manufacturer spec]
- Merrowed edge, hook and loop backing
- [PRODUCTION TIME - fill in]
```

**Fill in:** dimensions, production time, and Roman's story in a line or two if
the family is comfortable with it appearing on a product page. Ask them first.

### 6.3 Slava Dog Pin (limited edition)

**Not a Printify item. Needs a pin manufacturer and a minimum order.**

**Title**
```
Slava Dog Enamel Pin | Limited Edition Ukraine Charity Lapel Pin | Frontline Companion Memorial | Funds Medevac Missions
```

**Tags**
`enamel pin` · `ukraine pin` · `dog lapel pin` · `charity pin` ·
`limited edition pin` · `military dog pin` · `memorial pin` · `morale pin` ·
`ukraine support` · `lapel pin gift` · `collectible pin` · `frontline dog` ·
`aid fundraiser`

**Materials** `hard enamel`, `metal`, `butterfly clutch`

**Description**
```
Slava went where the medics went.

A limited edition hard enamel pin for our frontline companion. Once this run is
gone, it is gone. All proceeds fund medevac missions.

DETAILS
- [SIZE - fill in]
- Hard enamel, [PLATING - fill in], butterfly clutch backing
- Limited run of [QUANTITY - fill in]
```

**Fill in:** size, plating, run quantity, and Slava's story. A limited-edition
claim needs a real number attached to it, both for honesty and because it is the
reason people buy.

### 6.4 Songs for Survival - Digital Album

**Digital download listing. No Printify. Confirm distribution rights for every track first.**

**Title**
```
Songs For Survival Digital Album | Instant Download MP3 | Ukraine Medevac Fundraiser | Charity Music Compilation
```

**Tags**
`digital album` · `instant download` · `charity music` · `ukraine music` ·
`mp3 download` · `fundraiser album` · `songs for survival` · `benefit album` ·
`digital download` · `humanitarian music` · `ukraine support` ·
`indie compilation` · `aid fundraiser`

**Description**
```
Songs written to fund medevacs.

An instant digital download. No shipping, no wait, and the money goes straight
into evacuation work in Ukraine.

DETAILS
- [NUMBER] tracks, [FORMAT] files, [TOTAL SIZE]
- Available immediately after purchase from your Etsy downloads page
- Personal listening use. Please contact us for licensing or public performance.

TRACK LIST
[FILL IN]
```

**Fill in:** track list, file format and size, and written confirmation you hold
distribution rights for every track. Etsy will remove the listing and can suspend
the shop over a rights complaint, and for a charity that is a headline you do not
want.

### 6.5 Standard block for every description

```
WHERE YOUR MONEY GOES
Medaria Aid is a registered UK charity [CHARITY NUMBER] delivering medical
supplies, medevac vehicles and humanitarian aid to Ukraine's frontlines.
Profits from this shop fund vehicle conversions, trauma gear and medevac
delivery. Profit means the amount remaining after production, shipping and
platform fees.

This is a purchase, not a donation, and is not eligible for Gift Aid.
To donate directly, visit medariaaid.com.

Physical items are printed and shipped by our production partner. Digital items
download instantly.
```

That "profit means" sentence is doing compliance work. Do not delete it because
it is less punchy than "100% of profits".

---

## 7. Shop policies

**Processing time.** Printify's production window plus a buffer, not Printify's
best case. Under-promising here is free; late dispatch costs you your star
seller rating.

**Shipping.** Set separate profiles for UK, EU, Australia and rest of world based
on Printify's actual rates for the print provider you choose, not Etsy's
defaults. Your merch doc offers free shipping over $75 AUD / £40 GBP. On Etsy the
transaction fee applies to shipping revenue too, so build the cost into the item
price rather than treating free shipping as free.

**Returns and exchanges.** Print-on-demand is made to order, so the usual policy
is no returns for change of mind, replacement or refund for defects and print
errors within 30 days with a photo. UK consumer law gives buyers cancellation
rights on distance sales, with an exception for personalised or bespoke goods.
Whether made-to-order POD counts as personalised is arguable and you should not
be the test case. Take the safer position and honour cancellations.

**Privacy.** Buyer data goes to Printify to fulfil. Say so, and make sure it lines
up with the charity's privacy notice.

---

## 8. What I am taking on faith

Flagged rather than assumed silently:

1. **`info@littlepoppin.com` exists and receives mail.** It appears nowhere in the records.
   The site's own published contact address is `info@wildheartspublishing.com.au`, not an
   `@littlepoppin.com` one, so this mailbox may not exist at all. You will need to click a
   verification link at it, so a dead mailbox stops you at step one. Check first.
   (Also see the separate `www.littlepoppin.com` DNS problem, section 10.)
2. **You can get into the Etsy account.** Last confirmed sign-in 14 Aug 2026.
3. **Medaria Aid is a registered UK charity.** From a web summary of medariaaid.com.
   I have no charity number and could not reach the site to confirm.
4. **The Little Poppin Etsy shop state** (97 live listings, 22 staged, account named "Naomi")
   comes from `docs/TOMORROW.md` dated 10 Aug 2026. I could not sign in to Etsy to confirm it
   is still true three weeks later, and public search does not surface the shop.
5. **The merch line is current.** The source doc is `Medaria Aid - Merchandise.docx`
   in Drive, created 10 May 2026, last modified 16 Jun 2025 (that date ordering is
   odd, from the Drive metadata). A second Word file,
   `Medaria_Aid_Merch_Brainstorm.docx`, was emailed 28 May 2026 to
   `medariaaidcontact@gmail.com` and is only an email attachment, so I could not
   open it. If it supersedes the Drive doc, put it in Drive and the product
   section here needs redoing.
6. **Etsy's fee schedule and UK charity trading thresholds** are from memory and
   both change. Verify against current published rates and guidance before pricing.
7. **Printify's current catalogue** for embroidered patches and enamel pins. Check it
   in your account rather than trusting my recollection.

---

## 9. Order of operations

0. Open Etsy > Account settings on both accounts and write down which email each uses (see
   section 1). Every other Etsy decision here is guessing until that is known.
1. Answer 3.1: which entity is the seller. Everything else waits on this.
2. Deal with the overdue Printify Australia shipping setting (3.9).
3. Recover the Etsy account, add 2FA.
4. Decide whether medariaaid.com is the primary shop and Etsy the discovery
   channel (3.7). It probably should be.
5. Open the shop, add Printify as a production partner, connect the integration.
6. Publish the tee only. One product, sampled, correct.
7. Confirm patch and pin manufacturing before promising either.
8. Clear the album's rights before it goes anywhere near a listing.

---

## 10. Separate finding: `www.littlepoppin.com` does not resolve

Not Medaria, but found while checking how Little Poppin is set up and worth more than
anything else in this document.

**The apex works. The `www` hostname has no DNS record.** From this environment:

```
littlepoppin.com          -> 76.76.21.21          (Vercel apex, fine)
www.littlepoppin.com      -> NXDOMAIN
www.medariaaid.com        -> 66.33.60.193, 76.76.21.241   (control, fine)
www.clearedfortakeoff.com.au -> 66.33.60.194, 76.76.21.93 (control, fine)
cname.vercel-dns.com      -> 66.33.60.35, 76.76.21.123
```

The two control hostnames resolve on the same resolver, so this is not a sandbox artefact.
Vercel also lists `www.littlepoppin.com` among the project's domains, so Vercel thinks it
should be serving there.

**Why it matters.** The entire site is built on `www` as its canonical origin:

- `scripts/site-config.mjs`: `SITE_URL = 'https://www.littlepoppin.com'`
- 1,552 references to `www.littlepoppin.com` across the HTML, sitemap, JS and text files,
  against 1 to the apex
- Every `<link rel="canonical">`, every `og:url`, the `schema.org` Organization and WebSite
  nodes, all point at `www`
- `sitemap.xml` lists ~132 URLs, all on `www`
- `robots.txt` points at `https://www.littlepoppin.com/sitemap.xml`
- Google Search Console is verified on the `https://www.littlepoppin.com/` property
- `docs/TOMORROW.md` uses `https://www.littlepoppin.com/api/ops` for order visibility

So the site is telling Google, Pinterest and every social scraper that the real page lives at
a hostname that returns a DNS error, while quietly serving from the apex. That is the most
likely explanation for the July Search Console warnings in the mailbox: "Alternative page with
proper canonical tag", the merchant listings and product snippets issues, and the products
missing from the Shopping tab.

It also means every `www` link anyone has ever shared, printed, pinned or put in an Etsy
listing is currently dead. Not slow. Dead, with a browser DNS error and no redirect.

Search Console started collecting traffic for `www` on 5 July, so it resolved then. Something
changed between then and now. The last deployment was 18 Aug.

**Check it in ten seconds:** type `https://www.littlepoppin.com` into a browser. Then open
Vercel > littlepoppin > Settings > Domains, which will show the exact record it expects for
`www` (a `CNAME` to `cname.vercel-dns.com`), and add it at the registrar. Both hostnames
should resolve, with one redirecting to the other, and the one the code calls canonical should
be the one that serves.

I could not fetch the domain from here to confirm the HTTP behaviour: the egress proxy blocks
`littlepoppin.com`, and DNS-over-HTTPS is blocked too. Production itself is healthy, verified
through Vercel: `littlepoppin.vercel.app` returns 200 with the real homepage, last modified
26 Aug. GA4 is live on the site as `G-TD4975MVCS`, so that open item from 10 Aug is done.

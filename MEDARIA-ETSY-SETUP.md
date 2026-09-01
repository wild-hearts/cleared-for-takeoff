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

**There is no Little Poppin Etsy account in the records.** Zero Etsy mail to any
`littlepoppin.com` address, and nothing that ties Little Poppin to Etsy at all.
The only Little Poppin traffic in the mailbox is Google Search Console for
`https://www.littlepoppin.com/` (verified 2 Jul 2026, merchant listings and
product structured-data warnings on 5 and 19 Jul) - so Little Poppin is a
separate ecommerce site, not an Etsy shop.

The Etsy account's first-name field is literally "Medaria". Etsy addresses every
one of those emails to "Medaria".

**No live shop exists.** Public search finds `medariaaid.com` but no Etsy shop
for Medaria Aid. Consistent with the "grand opening" nudge never being acted on.

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
- No Etsy API application. Etsy's Open API needs a registered app and an approved
  OAuth grant, and it has no endpoint for changing an account email or creating an
  account regardless.
- Zapier has no Etsy connector on your account. I checked. Nothing.
- Every step you asked for is gated on things a person has to do: password
  re-entry, a verification link clicked from the inbox, CAPTCHA, and possibly a
  phone code.

Etsy's Terms also prohibit automated account creation, so even with a browser
this would be the wrong move.

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

### 3.7 Etsy is probably the wrong primary channel for this

You already have `medariaaid.com`. Printify connects natively to Shopify,
WooCommerce, Wix, Squarespace and Etsy. Selling from your own site keeps the
Etsy cut, keeps the donor relationship, keeps the email address, and lets you put
merch and donations on one page without tripping Etsy's donation rules.

**Unverified:** I could not reach `medariaaid.com` from this environment (egress
blocked) so I do not know what it is built on. If it is Wix or Shopify, the
Printify integration is a ten-minute job and it should be your main shop.

Etsy still earns its place as a **discovery channel** - people search Etsy for
"ukraine charity shirt" and will never search your site for it. Just run it as
the second channel, not the first.

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

1. **`info@littlepoppin.com` exists and receives mail.** It appears nowhere in the
   records, and `littlepoppin.com` did not resolve from this environment. Could be
   sandbox DNS, could be the domain being parked. Check before you rely on it.
2. **You can get into the Etsy account.** Last confirmed sign-in 14 Aug 2026.
3. **Medaria Aid is a registered UK charity.** From a web summary of medariaaid.com.
   I have no charity number and could not reach the site to confirm.
4. **The merch line is current.** The source doc is `Medaria Aid - Merchandise.docx`
   in Drive, created 10 May 2026, last modified 16 Jun 2025 (that date ordering is
   odd, from the Drive metadata). A second Word file,
   `Medaria_Aid_Merch_Brainstorm.docx`, was emailed 28 May 2026 to
   `medariaaidcontact@gmail.com` and is only an email attachment, so I could not
   open it. If it supersedes the Drive doc, put it in Drive and the product
   section here needs redoing.
5. **Etsy's fee schedule and UK charity trading thresholds** are from memory and
   both change. Verify against current published rates and guidance before pricing.
6. **Printify's current catalogue** for embroidered patches and enamel pins. Check it
   in your account rather than trusting my recollection.

---

## 9. Order of operations

1. Answer 3.1: which entity is the seller. Everything else waits on this.
2. Deal with the overdue Printify Australia shipping setting (3.9).
3. Recover the Etsy account, add 2FA.
4. Decide whether medariaaid.com is the primary shop and Etsy the discovery
   channel (3.7). It probably should be.
5. Open the shop, add Printify as a production partner, connect the integration.
6. Publish the tee only. One product, sampled, correct.
7. Confirm patch and pin manufacturing before promising either.
8. Clear the album's rights before it goes anywhere near a listing.

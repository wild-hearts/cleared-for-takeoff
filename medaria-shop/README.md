# Medaria Aid merchandise shop

A drop-in Printify + Stripe merchandise shop for `www.medariaaid.com`.

Adapted from the working Little Poppin implementation in `wild-hearts/littlepoppin`, which
has already had its silent failures found and fixed. Where this differs, it is on purpose
and the reason is in the comment.

---

## The problem to solve first

**`medariaaid.com` has no source repository.** It is not on GitHub, and the Vercel project
`medaria-aid` has no Git connection, so it is deployed from the Vercel CLI on one laptop.

A registered charity's public website, with a live donation flow, existing only as files in
one folder on one machine is a real risk. One dead SSD and the site is gone, with no history
and no way for anyone else to pick it up.

So, before anything here goes live:

```
cd <your local medariaaid.com folder>
git init && git add -A && git commit -m "Medaria Aid website"
# create wild-hearts/medaria-aid on GitHub, then
git remote add origin https://github.com/wild-hearts/medaria-aid.git
git push -u origin main
```

Then connect that repo in Vercel, medaria-aid, Settings, Git. After that deploys happen on
push, and this folder's contents can be committed like anything else.

---

## Installing

Copy the contents of this folder into the root of the medariaaid.com site, keeping the
structure:

```
merch.html                          the storefront
merch-success.html                  post-payment
merch-cancel.html                   abandoned checkout
api/merch-catalogue.js              what is on sale
api/merch-checkout.js               creates the Stripe session
api/merch-stripe-webhook.js         payment  -> Printify order
api/merch-printify-webhook.js       shipment -> tracking email
api/merch-ops.js                    "did that actually work?"
lib/products.js                     catalogue, prices, postage bands, compliance copy
lib/printify.js                     Printify client
lib/printify-config.generated.js    written by the setup script, do not hand-edit
lib/events.js                       durable order log
scripts/printify-setup.mjs          phased discovery and product creation
package.json                        dependencies
```

Every endpoint is namespaced `merch-` so nothing can collide with the donation flow or the
chatbot. `merch.html` reuses the site's own `style.css`, so it inherits the palette.

Add a nav link. In `index.html` and every other page's `<ul class="nav-links">`:

```html
<li><a href="merch.html">Merch</a></li>
```

If `package.json` already exists at the site root, merge the two `dependencies` blocks
rather than overwriting.

---

## Setting it up

**1. A separate Printify ACCOUNT, not just a separate store.** The existing Printify
account is registered to `medariaaid@gmail.com` and it holds Little Poppin's shop
`28504147`, which is a Wild Hearts Publishing commercial brand.

Adding a second store inside that account is the quick option and the wrong one. Printify
bills per account against the card on file, so one card would be paying for both a charity's
production and a commercial company's. Whichever card it is, the wrong entity is paying, and
unpicking that at year end is worse than the ten minutes it takes to avoid.

Sign up separately with `info@medariaaid.com`, add a store, and when it asks which platform,
choose the option that is not a platform connection (Printify's manual / API ordering route).
Put the charity's own card on that account. Then `node scripts/printify-setup.mjs shops`
confirms the id rather than you having to find it.

**2. Environment variables.** Copy `.env.example` into Vercel, medaria-aid, Settings,
Environment Variables. Two things matter:

- `STRIPE_SECRET_KEY` must be the **Medaria Aid** Stripe account, not the Wild Hearts one.
  Charity income has to land in the charity's account.
- `STRIPE_WEBHOOK_SECRET` is per-endpoint. Create a new endpoint for
  `https://www.medariaaid.com/api/merch-stripe-webhook` on the event
  `checkout.session.completed` and use *that* endpoint's secret.

**3. Artwork.** Put the print-ready PNG at `art/help-is-on-the-way.png`. Transparent
background, at least 4500px on the long edge for apparel. Nothing can be created without it,
and no such file exists yet.

**4. Run the setup script**, in phases, checking each result:

```
node scripts/printify-setup.mjs shops
node scripts/printify-setup.mjs blueprints "unisex softstyle t-shirt"
node scripts/printify-setup.mjs providers <blueprintId>
node scripts/printify-setup.mjs variants  <blueprintId> <providerId>
node scripts/printify-setup.mjs costs     <blueprintId> <providerId>
node scripts/printify-setup.mjs build --shop <shopId>
node scripts/printify-setup.mjs build --shop <shopId> --confirm
node scripts/printify-setup.mjs webhooks --shop <shopId> --confirm
```

Nothing is hardcoded. Blueprint, provider and variant ids are read from the live Printify
catalogue and printed for you to check before they are written. Guessing them from memory is
how you end up selling a variant that does not exist.

The API token comes from Printify, My Profile, Connections. It is shown once, and it expires
after a year: when it lapses, order submission fails server-side and the shop still looks
perfectly healthy from the outside. Diary it for eleven months, and watch
`/api/merch-ops` for `merch-printify-failed`.

**5. Fix the postage numbers.** `SHIPPING` in `lib/products.js` is a placeholder. Replace it
with real figures from the `costs` command before launch.

**6. One real test order.** Buy something, to yourself, and confirm the whole chain:
`/api/merch-ops?key=<OPS_SECRET>` should show `merch-printify-submitted`, then later
`merch-shipping-email`. Refund yourself afterwards.

Do not skip this. On the Little Poppin build, four separate failures in this exact chain
were all silent: nothing threw, everything looked healthy, and no order would have shipped.

---

## What is deliberately not here

- **The enamel pin, the embroidered patch and the *Songs for Survival* album.** Printify does
  not make enamel pins, its patch range is thin, and it does not do digital downloads at all.
  Each needs a different supplier and a separate decision. Listing them here would produce a
  shop that takes money for things it cannot fulfil.
- **Dual AUD/GBP pricing.** A Stripe Checkout session has exactly one currency. The charity
  is UK-registered and its Stripe pays out in GBP, so the shop is GBP and Stripe converts for
  overseas buyers.

One artwork, three products. That is on purpose: the "Help Is On The Way" design is the only
Medaria merchandise artwork that exists, and putting it on a tee, a tote and a mug gives a
shop with something to browse without inventing designs nobody has drawn.

---

## The compliance bits, and why they cannot be deleted

`PURCHASE_NOTICE` in `lib/products.js` appears on the Stripe payment page and on `merch.html`.
It does three jobs:

1. **Defines "profit".** The Fundraising Regulator's Code requires a claim about where money
   goes to be accurate and substantiated. "100% of profits" needs profit defined, which here
   means after production, postage and payment fees. The equivalence claims in the original
   merch document ("buying 5 patches = 1 full med pack") need a costing you can produce on
   request. If you cannot, do not publish them.
2. **Says this is not a donation and carries no Gift Aid.** Buying a mug is a purchase. There
   is a live Gift Aid declaration form and a `giftaid@` alias, so the risk of a supporter
   assuming otherwise is real, and so is the risk of Gift Aid being claimed on trading income.
3. **Tells the buyer what they are paying for before they pay**, which is consumer law.

**Still open, and an accountant's question rather than a developer's:** selling branded
merchandise is generally non-primary-purpose trading for a UK charity. Above the small
trading exemption it becomes taxable, and the usual answer is a trading subsidiary that
gift-aids its profits up to the charity. Confirm the current threshold before volume
matters. Nothing in this code decides that.

---

## Notes on the risky parts

- **The Stripe webhook never returns 500 after a successful payment.** Stripe retries on a
  non-2xx, and a retry on a fulfilment path means a second parcel. Failures are logged and
  recorded as `merch-printify-failed` instead, which is what `/api/merch-ops` is for.
- **Printify's `external_id` is the Stripe session id**, which Printify treats as an
  idempotency key, so a redelivered event cannot produce two parcels.
- **Prices never come from the browser.** `getVariant()` resolves the price server-side from
  the generated config. A request naming a variant that does not exist is refused, not
  defaulted.
- **Printify does not sign its webhooks.** Authenticity comes from a shared key in the
  registered URL plus never trusting the request body: before emailing anyone, the order is
  re-fetched from Printify by id. An earlier Little Poppin version verified an HMAC Printify
  never sends, and would have rejected every genuine delivery, silently, forever.
- **A phone number is collected at checkout** and passed to Printify, because Australia Post
  has required a recipient email or Australian mobile on parcels into Australia since
  4 August 2026.
- **The shop refuses to open until Printify is configured.** `printifyConfigured()` is false
  until the setup script has run, which makes the storefront say "not open yet" and makes
  the checkout endpoint return 503 rather than taking money for something nothing can produce.

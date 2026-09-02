// lib/products.js. The Medaria Aid merchandise catalogue.
//
// Hand-maintained. Everything the storefront and the checkout endpoint need lives here,
// EXCEPT the Printify ids, which are discovered by scripts/printify-setup.mjs and written
// to printify-config.generated.js. That split is deliberate: prices and copy are editorial
// decisions a person makes, variant ids are facts read back from Printify's catalogue.
//
// CURRENCY. Medaria Aid is a registered UK charity (No. 1204225) and its Stripe account
// pays out in GBP, so the shop prices in GBP. Stripe converts for overseas buyers at
// checkout. The AUD/GBP dual pricing in the original merch document does not work here:
// a Stripe Checkout session has exactly one currency.
export const CURRENCY = 'gbp';

// Every Stripe session this shop creates is tagged with this. The stripe-webhook endpoint
// refuses to fulfil anything without it, so a donation or a Wild Hearts order arriving on
// the same webhook can never be mistaken for a merch order.
export const BRAND = 'medaria_aid';

export const CHARITY_NUMBER = '1204225';

// Shown at checkout and on every product. This wording is doing compliance work, not
// marketing. Three separate obligations:
//   1. Fundraising Regulator's Code: a claim about where money goes must be accurate and
//      substantiated, so "profit" is defined rather than implied.
//   2. Buying merchandise is not a donation and carries no Gift Aid relief. Saying so
//      prevents a buyer believing they can claim it, and prevents a Gift Aid claim being
//      made on trading income.
//   3. Consumer law: the buyer must know what they are paying for before they pay.
export const PURCHASE_NOTICE =
  'This is a purchase, not a donation, and it is not eligible for Gift Aid. '
  + `Profits fund Medaria Aid's medical and medevac work in Ukraine (registered UK charity No. ${CHARITY_NUMBER}). `
  + 'Profit means what remains after production, postage and payment fees. '
  + 'To donate instead, visit medariaaid.com/donate.html';

// Postage in GBP pence, by destination. Charged separately rather than folded into the
// item price: Printify's own postage runs from a few pounds within the UK to considerably
// more for the rest of the world, and burying the worst case would make every UK buyer
// overpay. Review these against real Printify costs after the first live order.
//
// UNVERIFIED: these are placeholders until scripts/printify-setup.mjs has read the real
// per-variant shipping costs for the provider actually chosen. Do not launch on them.
export const SHIPPING = {
  GB: { label: 'United Kingdom', price: 395 },
  EU: { label: 'Europe', price: 795 },
  INTL: { label: 'Rest of world', price: 1195 },
};

const EU = new Set(['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE',
  'IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE','NO','CH','IS','LI']);

/** Destination band for a two-letter country code. */
export function shippingFor(country) {
  const cc = String(country || '').toUpperCase();
  if (cc === 'GB') return SHIPPING.GB;
  if (EU.has(cc)) return SHIPPING.EU;
  return SHIPPING.INTL;
}

// Countries the shop will ship to. Printify prints near the buyer in most of these, but
// the list is deliberately explicit: an order to a country the chosen provider cannot
// serve fails at Printify AFTER the buyer has paid, which is the worst possible time.
export const SHIP_COUNTRIES = ['GB','IE','FR','DE','ES','IT','NL','BE','PL','SE','DK','FI',
  'NO','CH','AT','PT','CZ','US','CA','AU','NZ'];

// ── The catalogue ────────────────────────────────────────────────────────────────────
//
// One artwork, three products. That is on purpose: the "Help Is On The Way" design is the
// only Medaria merchandise artwork that exists, and putting it on a tee, a tote and a mug
// gives a shop with something to browse without inventing designs nobody has drawn.
//
// The patch, the enamel pin and the Songs for Survival album from the original merch
// document are NOT here. Printify does not make enamel pins, its embroidered patch range
// is thin, and it does not do digital downloads at all. Each needs a different supplier
// and a separate decision. Adding them here would produce a shop that takes money for
// things it cannot fulfil.
//
// blueprintQuery / providerPreference are search terms, not ids. printify-setup.mjs
// resolves them against the live Printify catalogue and writes the ids it chose into
// printify-config.generated.js, printing each choice for confirmation first. Hardcoding
// blueprint ids from memory is how you end up selling a variant that does not exist.
export const CATALOGUE = [
  {
    sku: 'tee-help-is-on-the-way',
    name: '"Help Is On The Way" Tee',
    blurb: 'What a medic says on the radio when a vehicle is already moving. Unisex fit, soft cotton.',
    story: 'Every tee funds vehicle conversions, trauma gear and medevac delivery to frontline units in Ukraine.',
    image: '/img/merch/tee-help-is-on-the-way.jpg',
    artwork: 'art/help-is-on-the-way.png',
    blueprintQuery: 'unisex softstyle t-shirt',
    providerPreference: ['printify choice', 'europe', 'united kingdom'],
    price: 2400,
    options: {
      colour: ['Military Green', 'Sky Blue'],
      size: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
    },
  },
  {
    sku: 'tote-help-is-on-the-way',
    name: '"Help Is On The Way" Tote',
    blurb: 'Cotton shopper, printed with the same design. Useful, and quietly loud.',
    story: 'Every tote funds vehicle conversions, trauma gear and medevac delivery to frontline units in Ukraine.',
    image: '/img/merch/tote-help-is-on-the-way.jpg',
    artwork: 'art/help-is-on-the-way.png',
    blueprintQuery: 'tote bag',
    providerPreference: ['printify choice', 'europe', 'united kingdom'],
    price: 1800,
    options: { size: ['One size'] },
  },
  {
    sku: 'mug-help-is-on-the-way',
    name: '"Help Is On The Way" Mug',
    blurb: '11oz ceramic. For the desk of someone who cannot go, but can pay for the ones who did.',
    story: 'Every mug funds vehicle conversions, trauma gear and medevac delivery to frontline units in Ukraine.',
    image: '/img/merch/mug-help-is-on-the-way.jpg',
    artwork: 'art/help-is-on-the-way.png',
    blueprintQuery: 'mug 11oz',
    providerPreference: ['printify choice', 'europe', 'united kingdom'],
    price: 1500,
    options: { size: ['11oz'] },
  },
];

/** Catalogue entry by sku, or null. */
export function getProduct(sku) {
  return CATALOGUE.find((p) => p.sku === String(sku)) || null;
}

/**
 * The public shape of the catalogue, for the storefront to render.
 * Deliberately excludes anything Printify-side: the browser never needs a variant id, and
 * anything the browser can see is something an attacker can tamper with.
 */
export function publicCatalogue(configured) {
  return CATALOGUE.map((p) => ({
    sku: p.sku, name: p.name, blurb: p.blurb, story: p.story,
    image: p.image, price: p.price, options: p.options,
    available: !!configured,
  }));
}

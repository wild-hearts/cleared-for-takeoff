// api/merch-checkout.js
// Creates a Stripe Checkout Session for one merchandise item and returns its hosted URL.
// The storefront POSTs { sku, colour, size, quantity } and redirects to session.url.
//
// Endpoints are namespaced `merch-` so they cannot collide with anything the donation
// flow or the chatbot already uses on medariaaid.com.
import Stripe from 'stripe';
import { getProduct, CURRENCY, BRAND, PURCHASE_NOTICE, shippingFor, SHIP_COUNTRIES } from '../lib/products.js';
import { getVariant, printifyConfigured } from '../lib/printify.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

function baseUrl(req) {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, '');
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${proto}://${host}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Refuse rather than half-work. Without Printify configured this endpoint could still
  // create a payment, and then there would be a paid order with nothing able to produce it.
  if (!printifyConfigured()) {
    return res.status(503).json({ error: 'The shop is not open yet. Please check back soon.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const sku = String(body.sku || '');
    const quantity = Math.max(1, Math.min(10, parseInt(body.quantity, 10) || 1));

    const product = getProduct(sku);
    if (!product) return res.status(400).json({ error: 'Unknown product' });

    // Price and ids are resolved server-side from the generated config. Nothing about the
    // money comes from the request.
    const variant = getVariant(sku, { colour: body.colour, size: body.size });
    if (!variant) return res.status(400).json({ error: 'That size or colour is not available' });

    const origin = baseUrl(req);
    const name = variant.label ? `${product.name} (${variant.label})` : product.name;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        quantity,
        price_data: {
          currency: CURRENCY,
          unit_amount: variant.price,
          product_data: {
            name,
            description: product.blurb,
            images: product.image ? [`${origin}${product.image}`] : undefined,
            metadata: { sku, brand: BRAND },
          },
        },
      }],

      // Physical goods: an address is not optional, and Printify cannot produce without one.
      shipping_address_collection: { allowed_countries: SHIP_COUNTRIES },
      // Australia Post requires a recipient email or Australian mobile on parcels into
      // Australia since 4 Aug 2026, and other carriers increasingly want a number too.
      phone_number_collection: { enabled: true },

      // Postage by destination band, priced separately so a UK buyer is not subsidising
      // a parcel to New Zealand.
      shipping_options: Object.entries({
        GB: shippingFor('GB'), EU: shippingFor('FR'), INTL: shippingFor('US'),
      }).map(([key, band]) => ({
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: { amount: band.price, currency: CURRENCY },
          display_name: `Postage, ${band.label}`,
          metadata: { band: key },
        },
      })),

      // The notice a buyer must see BEFORE paying: this is a purchase, not a donation,
      // and it carries no Gift Aid. custom_text.submit needs no dashboard configuration,
      // so it cannot silently fail to appear.
      custom_text: { submit: { message: PURCHASE_NOTICE.slice(0, 1200) } },

      success_url: `${origin}/merch-success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/merch-cancel.html`,

      // Everything the webhook needs to fulfil, on the session itself. The webhook re-reads
      // these rather than trusting anything in its own request body.
      metadata: {
        brand: BRAND,
        fulfil: 'printify',
        sku,
        colour: variant.colour || '',
        size: variant.size || '',
        quantity: String(quantity),
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('merch-checkout error:', err);
    return res.status(500).json({ error: 'Could not start checkout. Please try again.' });
  }
}

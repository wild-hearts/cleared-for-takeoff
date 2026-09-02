// api/merch-stripe-webhook.js
// Verifies Stripe signatures and sends paid merchandise orders to Printify.
//
// Register at Stripe -> Developers -> Webhooks -> Add endpoint
//   URL:   https://www.medariaaid.com/api/merch-stripe-webhook
//   Event: checkout.session.completed
// Copy that endpoint's signing secret into STRIPE_WEBHOOK_SECRET. A signing secret is
// per-endpoint: the donation endpoint's secret will not verify these deliveries.
import Stripe from 'stripe';
import { BRAND, getProduct } from '../lib/products.js';
import { getVariant, submitPrintifyOrder } from '../lib/printify.js';
import { recordEvent } from '../lib/events.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Signature verification needs the raw, unparsed body.
export const config = { api: { bodyParser: false } };

async function rawBody(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method not allowed');
  }
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET unset. Refusing to process.');
    return res.status(503).end('Not configured');
  }

  let event;
  try {
    const buf = await rawBody(req);
    event = stripe.webhooks.constructEvent(buf, req.headers['stripe-signature'], webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    // Donations arrive on this same Stripe account. Fulfil merchandise only, and only
    // merchandise this shop created. Anything else is none of our business.
    if (session.metadata?.brand === BRAND && session.metadata?.fulfil === 'printify') {
      try {
        await fulfil(session);
      } catch (err) {
        // The payment has already succeeded. Returning 500 makes Stripe retry the whole
        // event, which risks a second parcel. Log loudly and record the failure instead,
        // so /api/merch-ops shows a paid order that was never produced.
        console.error('Merch fulfilment error:', err);
        await recordEvent('merch-printify-failed', {
          sessionId: session.id, sku: session.metadata?.sku || null, error: String(err.message || err).slice(0, 300),
        });
      }
    }
  }

  // Always 200 once the signature is good, or Stripe keeps redelivering.
  return res.status(200).json({ received: true });
}

async function fulfil(session) {
  // Re-read the session from Stripe rather than trusting the webhook body wholesale.
  const full = await stripe.checkout.sessions.retrieve(session.id, {
    expand: ['customer_details', 'shipping_details'],
  });

  const { sku, colour, size, quantity } = full.metadata || {};
  const product = getProduct(sku);
  const variant = getVariant(sku, { colour: colour || null, size: size || null });
  if (!product || !variant) {
    throw new Error(`No orderable variant for ${sku} / ${colour} / ${size}`);
  }

  const details = full.customer_details || {};
  const shipping = full.shipping_details || full.collected_information?.shipping_details || {};
  const addr = shipping.address || details.address || {};
  if (!addr.country) throw new Error('Paid order has no shipping address');

  const order = await submitPrintifyOrder({
    externalId: full.id,
    productId: variant.productId,
    variantId: variant.variantId,
    quantity: Math.max(1, parseInt(quantity, 10) || 1),
    address: { name: shipping.name || details.name, ...addr },
    email: details.email,
    phone: details.phone,
  });

  console.log('Printify order created:', order.id || JSON.stringify(order).slice(0, 120));
  await recordEvent('merch-printify-submitted', {
    sessionId: full.id,
    sku, colour: colour || null, size: size || null,
    printifyOrderId: order.id || null,
    country: addr.country || null,
    email: details.email || null,
  });
}

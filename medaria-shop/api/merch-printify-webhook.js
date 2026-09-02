// api/merch-printify-webhook.js. Production and shipping updates from Printify.
//
// Without this, a buyer pays, gets a Stripe receipt, and then hears nothing until a parcel
// turns up. Or does not. Printify knows when an order ships and what the tracking number
// is; something has to be listening.
//
// AUTHENTICATION. Printify does not sign its webhooks: the registered webhook object has
// only {topic, url, shop_id, id}, no secret and no signature header. Verifying an HMAC
// here would silently reject every genuine delivery. So authenticity is established twice:
//
//   1. A shared key in the registered URL (?key=...). Printify calls the URL exactly as
//      registered, so a caller without the key is turned away before anything happens.
//   2. Nothing in the request body is trusted for anything that leaves the system. Before
//      emailing anyone we re-fetch the order from Printify by id and use the address and
//      tracking from THAT response. A forged payload cannot make this email an arbitrary
//      address; at worst it makes us look up an order id that does not exist.
//
// Fails closed: no PRINTIFY_WEBHOOK_KEY configured, nothing is processed.
import { recordEvent } from '../lib/events.js';
import { PRINTIFY_CONFIG } from '../lib/printify.js';

export const config = { api: { bodyParser: true } };

async function fetchOrder(orderId) {
  const token = process.env.PRINTIFY_API_TOKEN;
  const shopId = PRINTIFY_CONFIG.shopId;
  if (!token || !shopId || !orderId) return null;
  const r = await fetch(`https://api.printify.com/v1/shops/${shopId}/orders/${orderId}.json`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!r.ok) return null;
  return r.json();
}

async function emailBuyer({ to, carrier, tracking, trackingUrl }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !to) return false;
  const from = process.env.ORDER_FROM_EMAIL || 'Medaria Aid <onboarding@resend.dev>';
  const text = [
    'Your Medaria Aid order is on its way.',
    '',
    carrier ? `Carrier: ${carrier}` : null,
    tracking ? `Tracking: ${tracking}` : null,
    trackingUrl || null,
    '',
    'Thank you. What you paid goes into medical and medevac work in Ukraine.',
    '',
    'Medaria Aid, registered UK charity No. 1204225',
  ].filter(Boolean).join('\n');

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to, subject: 'Your Medaria Aid order has shipped', text }),
  });
  if (!r.ok) console.error('Tracking email failed:', (await r.text()).slice(0, 200));
  return r.ok;
}

export default async function handler(req, res) {
  const key = process.env.PRINTIFY_WEBHOOK_KEY;
  if (!key) return res.status(503).end('Not configured');
  if (String(req.query.key || '') !== key) return res.status(401).end('Unauthorised');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method not allowed');
  }

  const body = req.body || {};
  const topic = String(body.type || body.topic || 'unknown');
  const orderId = body.resource?.id || body.resource?.data?.id || null;

  await recordEvent(`merch-printify-${topic.replace(/[^a-z0-9-]/gi, '-')}`, {
    orderId, topic,
  });

  // Only a shipment tells the buyer something they do not already know.
  if (/shipment/i.test(topic) && orderId) {
    const order = await fetchOrder(orderId);
    const shipment = order?.shipments?.[0] || null;
    const to = order?.address_to?.email || null;
    if (shipment && to) {
      const sent = await emailBuyer({
        to,
        carrier: shipment.carrier || null,
        tracking: shipment.number || null,
        trackingUrl: shipment.url || null,
      });
      await recordEvent('merch-shipping-email', { orderId, sent: !!sent });
    }
  }

  // Always 200 on an authenticated call. Printify retries on non-2xx, and a retry storm
  // over a failed email helps nobody.
  return res.status(200).json({ ok: true });
}

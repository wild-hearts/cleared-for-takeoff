// api/merch-ops.js. Plain-text answer to "did that actually work?"
//
//   /api/merch-ops?key=<OPS_SECRET>              recent activity, all types
//   /api/merch-ops?key=...&type=merch-printify-failed
//
// Fails CLOSED: without OPS_SECRET set it refuses, rather than exposing buyer emails to
// anyone who guesses the URL. Plain text on purpose, so it is readable on a phone.
import { readEvents } from '../lib/events.js';

const TYPES = [
  'merch-printify-submitted',
  'merch-printify-failed',
  'merch-printify-shop-order-shipment-created',
  'merch-shipping-email',
];

export default async function handler(req, res) {
  const secret = process.env.OPS_SECRET;
  if (!secret) return res.status(503).send('Ops view is not configured (OPS_SECRET unset).');
  const key = String(req.query.key || '');
  if (key.length !== secret.length || key !== secret) return res.status(401).send('Unauthorised');

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');

  const wanted = req.query.type ? [String(req.query.type)] : TYPES;
  const lines = [`Medaria Aid merch. Operations  (${new Date().toISOString()})`, ''];

  for (const type of wanted) {
    let blobs = [];
    try { blobs = await readEvents(type, 25); }
    catch (err) { lines.push(`${type}: could not read (${err.message})`, ''); continue; }
    lines.push(`${type.toUpperCase()}, ${blobs.length} recent`);
    if (!blobs.length) lines.push('  (none)');
    for (const b of blobs) {
      const when = (b.pathname.split('/').pop() || '').slice(0, 19).replace('T', ' ');
      lines.push(`  ${when}  ${b.pathname}`);
    }
    lines.push('');
  }

  lines.push('Notes:');
  lines.push('  merch-printify-submitted  = the order reached Printify');
  lines.push('  merch-printify-failed     = PAID BUT NOT PRODUCED. Place it by hand, now');
  lines.push('  merch-shipping-email      = tracking sent to the buyer');
  return res.status(200).send(lines.join('\n'));
}

// lib/printify.js. Physical fulfilment for Medaria Aid merchandise via the Printify API.
// Config is written by scripts/printify-setup.mjs.
import { PRINTIFY_CONFIG } from './printify-config.generated.js';

export { PRINTIFY_CONFIG };

/** True once setup has run against a real Printify shop. */
export function printifyConfigured() {
  return !!PRINTIFY_CONFIG.shopId && Object.keys(PRINTIFY_CONFIG.products || {}).length > 0;
}

/**
 * Resolve a sku + chosen options to a price and the Printify ids needed to order it.
 * Returns null if the combination is not orderable, which the caller MUST treat as a
 * refusal rather than a default: the alternative is charging for a variant that does not
 * exist and discovering it after the payment has cleared.
 *
 * Price comes from HERE, never from the request. A browser can send any number it likes.
 */
export function getVariant(sku, { colour, size } = {}) {
  const product = PRINTIFY_CONFIG.products?.[sku];
  if (!product || !PRINTIFY_CONFIG.shopId) return null;
  const wantColour = colour == null ? null : String(colour);
  const wantSize = size == null ? null : String(size);
  const v = (product.variants || []).find((x) =>
    (wantColour === null || x.colour === wantColour) &&
    (wantSize === null || x.size === wantSize));
  if (!v || !v.variantId) return null;
  return {
    productId: product.productId,
    variantId: v.variantId,
    price: v.price,
    label: v.label,
    colour: v.colour || null,
    size: v.size || null,
  };
}

/**
 * Submit a paid order to Printify for production and postage.
 *
 * externalId is the Stripe Checkout session id. Printify treats external_id as an
 * idempotency key, so a webhook that Stripe retries cannot produce two parcels.
 */
export async function submitPrintifyOrder({ externalId, productId, variantId, quantity = 1, address, email, phone }) {
  const token = process.env.PRINTIFY_API_TOKEN;
  const shopId = PRINTIFY_CONFIG.shopId;
  if (!token || !shopId || !productId || !variantId) throw new Error('Printify not configured');
  if (!address || !address.country) throw new Error('Printify order needs a shipping country');

  const fullName = String(address.name || 'Customer').trim();
  const first = fullName.split(' ')[0] || 'Customer';
  const last = fullName.split(' ').slice(1).join(' ') || '.';

  const body = {
    external_id: externalId,
    label: 'Medaria Aid merch',
    line_items: [{ product_id: productId, variant_id: Number(variantId), quantity: Math.max(1, Number(quantity) || 1) }],
    shipping_method: 1, // standard
    send_shipping_notification: true,
    address_to: {
      first_name: first,
      last_name: last,
      email: email || '',
      // Australia Post has required a recipient email or an Australian mobile on parcels
      // into Australia since 4 August 2026. Stripe is configured to collect a phone number
      // for exactly this reason; passing it on is the half that makes that useful.
      phone: phone || '',
      country: address.country,
      region: address.state || '',
      city: address.city || '',
      address1: address.line1 || '',
      address2: address.line2 || '',
      zip: address.postal_code || '',
    },
  };

  const resp = await fetch(`https://api.printify.com/v1/shops/${shopId}/orders.json`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!resp.ok) throw new Error(`Printify order failed ${resp.status}: ${(await resp.text()).slice(0, 300)}`);
  return resp.json();
}

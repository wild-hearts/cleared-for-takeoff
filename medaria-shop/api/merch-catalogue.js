// api/merch-catalogue.js. The storefront's single source of truth for what is on sale.
//
// merch.html fetches this rather than hardcoding products, so the catalogue lives in one
// place (lib/products.js) instead of drifting between the page and the checkout endpoint.
// It also reports whether Printify is configured, which is how the page knows to show
// "opening soon" instead of buttons that would 503.
import { publicCatalogue, CURRENCY, PURCHASE_NOTICE, SHIPPING } from '../lib/products.js';
import { printifyConfigured } from '../lib/printify.js';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'public, max-age=60, must-revalidate');
  return res.status(200).json({
    open: printifyConfigured(),
    currency: CURRENCY,
    notice: PURCHASE_NOTICE,
    shipping: SHIPPING,
    products: publicCatalogue(printifyConfigured()),
  });
}

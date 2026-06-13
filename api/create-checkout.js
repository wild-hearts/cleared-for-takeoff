// Cleared For Takeoff — Stripe Checkout Session Creator
//
// GET /api/create-checkout                      → self-paced adult course (default)
// GET /api/create-checkout?product=kids-junior  → Junior AI Navigators
// GET /api/create-checkout?product=kids-senior  → Senior AI Pilots
// GET /api/create-checkout?product=kids-both     → both kids tracks
//
// Creates a Stripe Checkout session for the chosen product and redirects the
// buyer to Stripe's hosted payment page. On success, Stripe redirects back and
// fires a webhook to /api/stripe-webhook, which reads the entitlement_product
// from the session metadata and grants the matching access.
//
// Required Vercel environment variables:
//   STRIPE_SECRET_KEY            →  From Stripe dashboard → Developers → API Keys
//   STRIPE_PRICE_ID_SELF_PACED   →  Price ID for the self-paced course ($49) (price_...)
//   STRIPE_PRICE_ID_KIDS_JUNIOR  →  Price ID for Junior AI Navigators (only if selling kids)
//   STRIPE_PRICE_ID_KIDS_SENIOR  →  Price ID for Senior AI Pilots
//   STRIPE_PRICE_ID_KIDS_BOTH    →  Price ID for both kids tracks (optional bundle)

// Each saleable product maps to its price env var, the entitlement the webhook
// should grant, and where Stripe sends the buyer afterwards.
const PRODUCTS = {
    'self-paced':  { priceEnv: 'STRIPE_PRICE_ID_SELF_PACED',  entitlement: 'self_paced',  success: '/course/?welcome=1' },
    'kids-junior': { priceEnv: 'STRIPE_PRICE_ID_KIDS_JUNIOR', entitlement: 'kids-junior', success: '/course/?welcome=1&next=kids&track=junior' },
    'kids-senior': { priceEnv: 'STRIPE_PRICE_ID_KIDS_SENIOR', entitlement: 'kids-senior', success: '/course/?welcome=1&next=kids&track=senior' },
    'kids-both':   { priceEnv: 'STRIPE_PRICE_ID_KIDS_BOTH',   entitlement: 'kids-all',    success: '/course/?welcome=1&next=kids&track=junior' },
};

module.exports = async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const secretKey = process.env.STRIPE_SECRET_KEY;
    const domain    = 'https://clearedfortakeoff.com.au';

    // Default to the adult self-paced course so the existing flow is unchanged.
    const product = PRODUCTS[req.query.product] || PRODUCTS['self-paced'];
    const priceId = process.env[product.priceEnv];

    if (!secretKey || !priceId) {
        console.error(`STRIPE_SECRET_KEY or ${product.priceEnv} not configured`);
        return res.status(500).json({ error: 'Payment not configured' });
    }

    try {
        const params = new URLSearchParams({
            'mode':                          'payment',
            'line_items[0][price]':          priceId,
            'line_items[0][quantity]':       '1',
            'metadata[entitlement_product]': product.entitlement,
            'success_url':                   `${domain}${product.success}`,
            'cancel_url':                    `${domain}/#pricing`,
            'customer_creation':             'always',
            'billing_address_collection':    'auto',
            'payment_method_types[0]':       'card',
        });

        const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
            method: 'POST',
            headers: {
                'Authorization':  `Bearer ${secretKey}`,
                'Content-Type':   'application/x-www-form-urlencoded',
            },
            body: params.toString(),
        });

        if (!response.ok) {
            const err = await response.json();
            console.error('Stripe API error:', err.error?.message);
            return res.status(502).json({ error: 'Could not create checkout session' });
        }

        const session = await response.json();
        return res.redirect(303, session.url);

    } catch (err) {
        console.error('Checkout handler error:', err.message);
        return res.status(500).json({ error: 'Server error' });
    }
};

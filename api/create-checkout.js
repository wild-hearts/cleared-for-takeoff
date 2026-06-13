// Cleared For Takeoff — Stripe Checkout Session Creator
//
// GET /api/create-checkout
//
// Creates a Stripe Checkout session for the self-paced course and redirects
// the student to Stripe's hosted payment page. On success, Stripe redirects
// back to /course/?welcome=1 and fires a webhook to /api/stripe-webhook.
//
// Required Vercel environment variables:
//   STRIPE_SECRET_KEY          →  From Stripe dashboard → Developers → API Keys
//   STRIPE_PRICE_ID_SELF_PACED →  Price ID for the self-paced course (currently $49) (price_...)

module.exports = async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const secretKey = process.env.STRIPE_SECRET_KEY;
    const priceId   = process.env.STRIPE_PRICE_ID_SELF_PACED;
    const domain    = 'https://clearedfortakeoff.com.au';

    if (!secretKey || !priceId) {
        console.error('STRIPE_SECRET_KEY or STRIPE_PRICE_ID_SELF_PACED not configured');
        return res.status(500).json({ error: 'Payment not configured' });
    }

    try {
        const params = new URLSearchParams({
            'mode':                          'payment',
            'line_items[0][price]':          priceId,
            'line_items[0][quantity]':       '1',
            'success_url':                   `${domain}/course/?welcome=1`,
            'cancel_url':                    `${domain}/#pricing`,
            'automatic_tax[enabled]':        'true',
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

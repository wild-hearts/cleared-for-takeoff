// Cleared For Takeoff, checkout preflight
//
// GET /api/checkout-preflight
//
// Answers one question and nothing else: if a buyer clicked Enrol Now right
// now, could this site create a Stripe Checkout session?
//
// WHY THIS EXISTS. Between 2 July and 3 September 2026 the buy button on this
// site returned 502 on every click, because STRIPE_SECRET_KEY held a value
// beginning "mk_", which is the ID Stripe prints beside an API key rather than
// the key itself. Eighteen health assertions ran against this brand for two
// months and not one of them asserted that the business could take money, so
// the dashboard stayed green the entire time. This endpoint is the assertion
// that was missing.
//
// WHY IT IS NOT SIMPLY A HIT ON /api/create-checkout. That handler creates a
// live Stripe Checkout session. Probing it on a schedule would manufacture
// sessions nobody bought, four times a day, on an account shared by twelve
// brands, and would poison the only ledger anyone reads for demand. This
// endpoint performs a READ of the price object instead: it creates nothing,
// writes nothing, and appears in no ledger.
//
// Environment variables read (values are never returned or logged):
//   STRIPE_SECRET_KEY            the live secret or restricted key
//   STRIPE_PRICE_ID_SELF_PACED   price id for the A$49 self-paced course
//
// Response is always JSON, always Cache-Control: no-store, and never contains
// key material. 200 means the till works. 503 means it does not, and `reason`
// says which link in the chain broke.

// The A$49 self-paced course, in the smallest currency unit. If this price ever
// legitimately changes, this constant changes with it in the same commit, and
// the check going red in between is the point rather than a nuisance.
const EXPECTED_CURRENCY    = 'aud';
const EXPECTED_UNIT_AMOUNT = 4900;

module.exports = async function handler(req, res) {
    // Without no-store, Vercel's edge can cache an ok:true and go on serving it
    // long after the credential has rotted. That would rebuild the exact failure
    // this endpoint exists to catch, with better paperwork. Set it first, so it
    // is present on every return path below including the 405.
    res.setHeader('Cache-Control', 'no-store');

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
        return res.status(503).json({ ok: false, reason: 'key_missing' });
    }

    // Same shape gate as api/create-checkout.js. A secret key starts sk_live_ or
    // sk_test_; a restricted key starts rk_. Anything else is an operator paste
    // error, and it is caught here BEFORE any network call to Stripe is made.
    if (!/^(sk|rk)_(live|test)_/.test(secretKey)) {
        return res.status(503).json({
            ok:     false,
            reason: 'key_wrong_shape',
            prefix: secretKey.slice(0, 3),   // "mk_", never key material
            length: secretKey.length,
        });
    }

    const priceId = process.env.STRIPE_PRICE_ID_SELF_PACED;
    if (!priceId) {
        return res.status(503).json({ ok: false, reason: 'price_env_missing' });
    }

    let response;
    let price;
    try {
        // A GET on a price. Read only. No object created, no event emitted.
        response = await fetch(`https://api.stripe.com/v1/prices/${encodeURIComponent(priceId)}`, {
            method:  'GET',
            headers: { 'Authorization': `Bearer ${secretKey}` },
        });
    } catch (err) {
        return res.status(503).json({ ok: false, reason: 'stripe_unreachable', detail: err.message });
    }

    if (response.status === 401) {
        return res.status(503).json({ ok: false, reason: 'stripe_auth_failed' });
    }
    if (response.status === 404) {
        return res.status(503).json({ ok: false, reason: 'price_not_found', price_id: priceId });
    }
    if (!response.ok) {
        return res.status(503).json({ ok: false, reason: 'stripe_unreachable', status: response.status });
    }

    try {
        price = await response.json();
    } catch {
        return res.status(503).json({ ok: false, reason: 'stripe_unreachable', status: response.status });
    }

    // A key that authenticates against a price that is archived, in the wrong
    // currency, in test mode, or at the wrong amount is still a broken till.
    // Assert the shape of the answer, not merely that an answer arrived.
    const mismatches = [];
    if (price.active   !== true)               mismatches.push('active');
    if (price.livemode !== true)               mismatches.push('livemode');
    if (price.currency !== EXPECTED_CURRENCY)  mismatches.push('currency');
    if (price.unit_amount !== EXPECTED_UNIT_AMOUNT) mismatches.push('unit_amount');

    if (mismatches.length) {
        return res.status(503).json({
            ok:          false,
            reason:      'price_mismatch',
            mismatched:  mismatches,
            price_id:    priceId,
            active:      price.active,
            livemode:    price.livemode,
            currency:    price.currency,
            unit_amount: price.unit_amount,
            expected:    { active: true, livemode: true, currency: EXPECTED_CURRENCY, unit_amount: EXPECTED_UNIT_AMOUNT },
        });
    }

    return res.status(200).json({
        ok:          true,
        price_id:    priceId,
        currency:    price.currency,
        unit_amount: price.unit_amount,
        livemode:    true,
        active:      true,
        key_prefix:  secretKey.slice(0, 7),   // "sk_live" or "rk_live", no key material
    });
};

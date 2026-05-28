// Cleared For Takeoff — Stripe Webhook Handler
//
// POST /api/stripe-webhook
//
// Receives events from Stripe. On successful payment:
//   1. Adds the student to MailerLite "C4TO Course Students" group
//   2. MailerLite automation sends them a welcome email with their access code
//
// Required Vercel environment variables:
//   STRIPE_WEBHOOK_SECRET      →  From Stripe → Developers → Webhooks → endpoint secret (whsec_...)
//   MAILERLITE_API_KEY         →  Already set
//   COURSE_ACCESS_CODE         →  The code students enter at /course/ (you choose this)
//
// In Stripe, set the webhook to listen for: checkout.session.completed

const crypto = require('crypto');

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).end();
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
        console.error('STRIPE_WEBHOOK_SECRET not set');
        return res.status(500).end();
    }

    // Collect raw body from stream (needed for signature verification)
    let rawBody;
    try {
        rawBody = await getRawBody(req);
    } catch (err) {
        console.error('Could not read request body:', err.message);
        return res.status(400).json({ error: 'Could not read body' });
    }

    // Verify Stripe webhook signature
    const signature = req.headers['stripe-signature'];
    try {
        verifyStripeSignature(rawBody, signature, webhookSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).json({ error: 'Invalid signature' });
    }

    // Process event
    let event;
    try {
        event = JSON.parse(rawBody);
    } catch {
        return res.status(400).json({ error: 'Invalid JSON' });
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const email   = session.customer_details?.email;
        const name    = session.customer_details?.name || '';

        console.log(`New course purchase: ${email}`);

        if (email) {
            try {
                await addStudentToMailerLite(email, name);
            } catch (err) {
                // Log but don't fail — Stripe will retry on 5xx
                console.error('MailerLite error (non-fatal):', err.message);
            }
        }
    }

    // Always return 200 so Stripe stops retrying
    return res.status(200).json({ received: true });
};

// ─── Raw body collection ─────────────────────────────────────────────────────
function getRawBody(req) {
    return new Promise((resolve, reject) => {
        // If Vercel has already parsed the body, reconstruct it
        if (req.body !== undefined) {
            const body = typeof req.body === 'string'
                ? req.body
                : JSON.stringify(req.body);
            resolve(body);
            return;
        }

        // Otherwise collect from stream
        const chunks = [];
        req.on('data', chunk => chunks.push(Buffer.from(chunk)));
        req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
        req.on('error', reject);
    });
}

// ─── Stripe signature verification (HMAC-SHA256) ────────────────────────────
function verifyStripeSignature(payload, signature, secret) {
    if (!signature) throw new Error('Missing Stripe-Signature header');

    // Parse signature header: t=timestamp,v1=hash1,v1=hash2...
    const t  = (signature.match(/t=(\d+)/) || [])[1];
    const v1 = [...signature.matchAll(/v1=([a-f0-9]+)/g)].map(m => m[1]);

    if (!t || v1.length === 0) throw new Error('Malformed Stripe-Signature header');

    // Reject events older than 5 minutes (replay attack prevention)
    const age = Math.abs(Math.floor(Date.now() / 1000) - parseInt(t));
    if (age > 300) throw new Error(`Webhook timestamp too old (${age}s)`);

    // Compute expected HMAC
    const expected = crypto
        .createHmac('sha256', secret)
        .update(`${t}.${payload}`, 'utf8')
        .digest('hex');

    // Accept if any v1 signature matches (Stripe sends multiple when rotating secrets)
    const valid = v1.some(sig => {
        try {
            return crypto.timingSafeEqual(
                Buffer.from(expected, 'hex'),
                Buffer.from(sig.padEnd(expected.length, '0'), 'hex')
            );
        } catch {
            return false;
        }
    });

    if (!valid) throw new Error('Signature mismatch');
}

// ─── Add student to MailerLite ───────────────────────────────────────────────
async function addStudentToMailerLite(email, fullName) {
    const apiKey  = process.env.MAILERLITE_API_KEY;
    const groupId = '188684482695399042'; // C4TO Course Students group

    if (!apiKey) throw new Error('MAILERLITE_API_KEY not set');

    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName  = nameParts.slice(1).join(' ') || '';

    const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
        method: 'POST',
        headers: {
            'Content-Type':  'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'Accept':        'application/json',
        },
        body: JSON.stringify({
            email,
            fields:  { name: firstName, last_name: lastName },
            groups:  [groupId],
            status:  'active',
        }),
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`MailerLite API ${response.status}: ${text}`);
    }

    return response.json();
}

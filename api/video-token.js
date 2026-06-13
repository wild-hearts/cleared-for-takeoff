// Cleared For Takeoff — Mux Signed Token API
//
// GET /api/video-token?lesson=m01-l01   (with Authorization: Bearer <supabase access token>)
//
// Returns a short-lived signed JWT that the Mux player uses to stream a video.
// Free-preview lessons (Modules 1 and 2) work without sign-in.
// Paid lessons require the signed-in user to hold an active entitlement.
//
// Required Vercel environment variables:
//   MUX_SIGNING_KEY_ID          →  Signing key ID from Mux dashboard
//                                   (Settings → Signing Keys → Create key)
//   MUX_SIGNING_PRIVATE_KEY     →  Base64-encoded RSA private key from Mux dashboard
//                                   (copy the full PEM, then: btoa(pemString))
//   SUPABASE_URL                →  Supabase project URL
//   SUPABASE_ANON_KEY           →  Supabase publishable/anon key
//   SUPABASE_SERVICE_ROLE_KEY   →  Supabase service-role/secret key (server only)

const crypto = require('crypto');
const { LESSON_MAP } = require('./video-library');

// Build a Mux-compatible signed JWT using Node's built-in crypto (no external deps)
function signMuxToken(playbackId, keyId, privateKeyPem) {
    function base64url(str) {
        return Buffer.from(str)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    }

    const header  = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT', kid: keyId }));
    const now     = Math.floor(Date.now() / 1000);
    const payload = base64url(JSON.stringify({
        sub: playbackId,
        aud: 'v',          // 'v' = video playback
        exp: now + 3600,   // expires in 1 hour
        kid: keyId,
    }));

    const signingInput = `${header}.${payload}`;
    const sign         = crypto.createSign('RSA-SHA256');
    sign.update(signingInput);
    const signature = sign.sign(privateKeyPem, 'base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

    return `${signingInput}.${signature}`;
}

// Verify the signed-in user holds an active paid entitlement.
// Resolves the user from their Supabase access token, then checks the
// entitlements table with the service-role key (which bypasses RLS).
async function hasEntitlement(req) {
    const auth  = req.headers['authorization'] || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return false;

    const SB_URL  = process.env.SUPABASE_URL;
    const ANON    = process.env.SUPABASE_ANON_KEY;
    const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!SB_URL || !SERVICE) {
        console.error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not configured');
        return false;
    }

    try {
        // 1. Resolve the user from their token
        const userRes = await fetch(`${SB_URL}/auth/v1/user`, {
            headers: { apikey: ANON || SERVICE, Authorization: `Bearer ${token}` },
        });
        if (!userRes.ok) return false;
        const user = await userRes.json();
        if (!user || !user.id) return false;

        // 2. Check for an active entitlement (service role bypasses RLS)
        const entRes = await fetch(
            `${SB_URL}/rest/v1/entitlements?user_id=eq.${user.id}&status=eq.active&select=id&limit=1`,
            { headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` } });
        if (!entRes.ok) return false;
        const rows = await entRes.json();
        return Array.isArray(rows) && rows.length > 0;
    } catch (err) {
        console.error('Entitlement check error:', err.message);
        return false;
    }
}

module.exports = async function handler(req, res) {
    // CORS — only allow requests from the course domain
    const allowedOrigin = process.env.ALLOWED_ORIGIN || 'https://clearedfortakeoff.com.au';
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const { lesson } = req.query;

    // 1. Validate lesson ID
    if (!lesson) {
        return res.status(400).json({ error: 'lesson parameter required' });
    }

    const lessonData = LESSON_MAP[lesson];
    if (!lessonData) {
        return res.status(404).json({ error: 'Lesson not found' });
    }

    // 2. Check access — free preview lessons are open; paid lessons need an entitlement
    const isFreePreview = lessonData.moduleData.free === true;
    if (!isFreePreview && !(await hasEntitlement(req))) {
        return res.status(403).json({ error: 'Sign in with your course account to watch this lesson' });
    }

    // 3. Check video is uploaded
    if (!lessonData.playbackId || lessonData.playbackId === 'PENDING') {
        return res.status(503).json({ error: 'Video not yet available', lesson });
    }

    // 4. Generate signed token
    const keyId         = process.env.MUX_SIGNING_KEY_ID;
    const privateKeyB64 = process.env.MUX_SIGNING_PRIVATE_KEY;

    if (!keyId || !privateKeyB64) {
        console.error('MUX_SIGNING_KEY_ID or MUX_SIGNING_PRIVATE_KEY not configured');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    let token;
    try {
        // Decode base64 → PEM string
        const privateKeyPem = Buffer.from(privateKeyB64, 'base64').toString('utf8');
        token = signMuxToken(lessonData.playbackId, keyId, privateKeyPem);
    } catch (err) {
        console.error('Token signing error:', err.message);
        return res.status(500).json({ error: 'Token generation failed' });
    }

    // 5. Return token — client uses this with the Mux player
    return res.status(200).json({
        playbackId: lessonData.playbackId,
        token,
        title:      lessonData.title,
        duration:   lessonData.duration,
        module:     lessonData.moduleData.id,
        free:       isFreePreview,
    });
};

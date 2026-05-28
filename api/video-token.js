// Cleared For Takeoff — Mux Signed Token API
//
// GET /api/video-token?lesson=m01-intro&code=YOUR_CODE
//
// Returns a short-lived signed JWT that the Mux player uses to stream a video.
// Free-preview lessons (Modules 1 and 2) work without a code.
// Paid lessons require a valid COURSE_ACCESS_CODE env var match.
//
// Required Vercel environment variables:
//   MUX_SIGNING_KEY_ID        →  Signing key ID from Mux dashboard
//                                 (Settings → Signing Keys → Create key)
//   MUX_SIGNING_PRIVATE_KEY   →  Base64-encoded RSA private key from Mux dashboard
//                                 (copy the full PEM, then: btoa(pemString))
//   COURSE_ACCESS_CODE        →  Shared access code for self-paced students
//   COURSE_COHORT_CODE        →  (Optional) Separate code for cohort students

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

function verifyAccessCode(code) {
    if (!code) return false;
    const selfPacedCode = process.env.COURSE_ACCESS_CODE;
    const cohortCode    = process.env.COURSE_COHORT_CODE;
    return (selfPacedCode && code === selfPacedCode) ||
           (cohortCode    && code === cohortCode);
}

module.exports = async function handler(req, res) {
    // CORS — only allow requests from the course domain
    const allowedOrigin = process.env.ALLOWED_ORIGIN || 'https://clearedfortakeoff.com.au';
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const { lesson, code } = req.query;

    // 1. Validate lesson ID
    if (!lesson) {
        return res.status(400).json({ error: 'lesson parameter required' });
    }

    const lessonData = LESSON_MAP[lesson];
    if (!lessonData) {
        return res.status(404).json({ error: 'Lesson not found' });
    }

    // 2. Check access — free preview lessons don't require a code
    const isFreePreview = lessonData.moduleData.free === true;
    if (!isFreePreview && !verifyAccessCode(code)) {
        return res.status(403).json({ error: 'Invalid or missing access code' });
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

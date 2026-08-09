// Cleared For Takeoff — gated resource downloads
//
// GET /api/resource?file=m2-workbook   (with Authorization: Bearer <supabase access token>)
//
// Serves the cheat sheets, workbooks and Tool Hangar guides that the pricing page
// promises. These are paid assets, so they use exactly the same entitlement gate as
// the videos: Module 1 is part of the free preview and open, everything else needs an
// active entitlement.
//
// The PDFs live in api/_files/, which Vercel treats as function territory rather than
// static assets, so they cannot be fetched directly by guessing a URL. vercel.json
// bundles that folder into this function via `includeFiles`.
//
// Required Vercel environment variables (all already set):
//   SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

const fs = require('fs');
const path = require('path');

// file key -> what it is, what the download should be called, and whether it is free
const RESOURCES = {
    'm1-cheatsheet': { file: 'm1-cheatsheet.pdf', name: 'Module 1 cheat sheet, Pre-Flight Checks.pdf',      free: true  },
    'm1-workbook':   { file: 'm1-workbook.pdf',   name: 'Module 1 workbook, Pre-Flight Checks.pdf',         free: true  },
    'm2-cheatsheet': { file: 'm2-cheatsheet.pdf', name: 'Module 2 cheat sheet, Cleared For Taxi.pdf',       free: false },
    'm2-workbook':   { file: 'm2-workbook.pdf',   name: 'Module 2 workbook, Cleared For Taxi.pdf',          free: false },
    'm3-cheatsheet': { file: 'm3-cheatsheet.pdf', name: 'Module 3 cheat sheet, Cleared For Takeoff.pdf',    free: false },
    'm3-workbook':   { file: 'm3-workbook.pdf',   name: 'Module 3 workbook, Cleared For Takeoff.pdf',       free: false },
    'm4-cheatsheet': { file: 'm4-cheatsheet.pdf', name: 'Module 4 cheat sheet, In The Air.pdf',             free: false },
    'm4-workbook':   { file: 'm4-workbook.pdf',   name: 'Module 4 workbook, In The Air.pdf',                free: false },
    'm5-cheatsheet': { file: 'm5-cheatsheet.pdf', name: 'Module 5 cheat sheet, Holding Pattern.pdf',        free: false },
    'm5-workbook':   { file: 'm5-workbook.pdf',   name: 'Module 5 workbook, Holding Pattern.pdf',           free: false },
    'm6-cheatsheet': { file: 'm6-cheatsheet.pdf', name: 'Module 6 cheat sheet, Final Approach.pdf',         free: false },
    'm6-workbook':   { file: 'm6-workbook.pdf',   name: 'Module 6 workbook, Final Approach.pdf',            free: false },
    'tool-hangar':   { file: 'tool-hangar.pdf',   name: 'The Tool Hangar, a guide to the wider AI fleet.pdf', free: false },
    'first-flights': { file: 'first-flights.pdf', name: 'The Tool Hangar, First Flights.pdf',               free: false },
};

// Same check the video token endpoint uses: resolve the user from their Supabase
// access token, then look for an active entitlement using the service role.
async function hasEntitlement(req) {
    const auth = req.headers.authorization || '';
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
        const userRes = await fetch(`${SB_URL}/auth/v1/user`, {
            headers: { apikey: ANON || SERVICE, Authorization: `Bearer ${token}` },
        });
        if (!userRes.ok) return false;
        const user = await userRes.json();
        if (!user || !user.id) return false;

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
    const allowedOrigin = process.env.ALLOWED_ORIGIN || 'https://clearedfortakeoff.com.au';
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    // ?list=1 returns the catalogue so the dashboard can render the download list
    if (req.query.list) {
        return res.status(200).json({
            resources: Object.entries(RESOURCES).map(([key, r]) => ({
                key, name: r.name, free: r.free,
            })),
        });
    }

    const key = req.query.file;
    if (!key) return res.status(400).json({ error: 'file parameter required' });

    const resource = RESOURCES[key];
    if (!resource) return res.status(404).json({ error: 'Resource not found' });

    if (!resource.free && !(await hasEntitlement(req))) {
        return res.status(403).json({ error: 'Sign in with your course account to download this' });
    }

    // Resolve inside _files only, so a crafted key can never walk the filesystem
    const filePath = path.join(__dirname, '_files', path.basename(resource.file));
    if (!fs.existsSync(filePath)) {
        console.error('Resource file missing on disk:', filePath);
        return res.status(503).json({ error: 'Resource not yet available', file: key });
    }

    const data = fs.readFileSync(filePath);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', data.length);
    res.setHeader('Content-Disposition', `attachment; filename="${resource.name}"`);
    res.setHeader('Cache-Control', 'private, no-store');
    return res.status(200).send(data);
};

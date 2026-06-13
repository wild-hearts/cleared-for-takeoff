// Shared Supabase client for the course area.
//
// The publishable (anon) key is SAFE in the browser by design: row-level
// security and the server-only service-role key protect the data. Do not put
// the service-role key here.
//
// Requires the supabase-js UMD bundle to be loaded first, e.g.
//   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
//   <script src="supabase-config.js"></script>

const SUPABASE_URL      = 'https://ugwqewrilflqymnpnxxg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_CD4rMgVbKrbyMESw7lBJZw_DaBicubb';

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

// ── Shared helpers used across the course pages ──────────────────────────────

// Returns the current session (or null). Resolves the magic-link hash on first load.
async function currentSession() {
    const { data } = await sb.auth.getSession();
    return data.session || null;
}

// Does the signed-in user hold an active paid entitlement?
async function hasFullAccess() {
    const { data, error } = await sb
        .from('entitlements')
        .select('product')
        .eq('status', 'active')
        .limit(1);
    if (error) { console.error('entitlement check failed', error); return false; }
    return (data || []).length > 0;
}

// Does the signed-in user hold access to a kids track? Track-aware: checks the
// entitlement product. The Stripe webhook sets product to 'kids-junior',
// 'kids-senior', or 'kids-all' on purchase. Until kids sales open, this returns
// false, so paid weeks stay locked while Week 1 (free) stays open.
async function hasKidsTrackAccess(track) {
    const products = track === 'junior' ? ['kids-junior', 'kids-all']
                   : track === 'senior' ? ['kids-senior', 'kids-all']
                   : [];
    if (!products.length) return false;
    const { data, error } = await sb
        .from('entitlements')
        .select('product')
        .eq('status', 'active')
        .in('product', products)
        .limit(1);
    if (error) { console.error('kids entitlement check failed', error); return false; }
    return (data || []).length > 0;
}

// Free preview is account-free (Module 1 only).
const isPreview = () => localStorage.getItem('c4t_preview') === 'true';

async function signOut() {
    await sb.auth.signOut();
    localStorage.removeItem('c4t_preview');
    window.location.href = 'index.html';
}

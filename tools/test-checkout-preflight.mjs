// Local logic test for api/checkout-preflight.js.
// global.fetch is stubbed throughout: this NEVER calls Stripe.
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const handler = require('../api/checkout-preflight.js');

let stripeCalls = 0;
let stubResponse = null;
global.fetch = async (url, opts) => {
  stripeCalls++;
  if (!/^https:\/\/api\.stripe\.com\/v1\/prices\//.test(url)) throw new Error('UNEXPECTED URL ' + url);
  if (opts.method !== 'GET') throw new Error('NON-GET TO STRIPE: ' + opts.method);
  if (stubResponse instanceof Error) throw stubResponse;
  return stubResponse;
};
const okRes = (status, body) => ({ status, ok: status >= 200 && status < 300, json: async () => body });

function mkRes() {
  const r = { headers: {}, code: null, body: null };
  r.setHeader = (k, v) => { r.headers[k] = v; };
  r.status = (c) => { r.code = c; return r; };
  r.json = (b) => { r.body = b; return r; };
  return r;
}

let pass = 0, fail = 0;
async function t(name, env, stub, method, expectStatus, check) {
  for (const k of ['STRIPE_SECRET_KEY', 'STRIPE_PRICE_ID_SELF_PACED']) delete process.env[k];
  Object.assign(process.env, env);
  stubResponse = stub;
  const before = stripeCalls;
  const res = mkRes();
  await handler({ method }, res);
  const calls = stripeCalls - before;
  const errs = [];
  if (res.code !== expectStatus) errs.push(`status ${res.code} != ${expectStatus}`);
  if (res.headers['Cache-Control'] !== 'no-store') errs.push('missing Cache-Control: no-store');
  const raw = JSON.stringify(res.body);
  if (env.STRIPE_SECRET_KEY && raw.includes(env.STRIPE_SECRET_KEY)) errs.push('LEAKED THE KEY IN THE BODY');
  const c = check && check(res.body, calls);
  if (c) errs.push(c);
  if (errs.length) { fail++; console.log(`FAIL  ${name}\n      ${errs.join('\n      ')}\n      body=${raw}`); }
  else { pass++; console.log(`ok    ${name}  -> ${res.code} ${raw}  (stripe reads: ${calls})`); }
}

const GOOD = { STRIPE_SECRET_KEY: 'sk_live_' + 'x'.repeat(90), STRIPE_PRICE_ID_SELF_PACED: 'price_123' };
const PRICE_OK = { active: true, livemode: true, currency: 'aud', unit_amount: 4900 };

await t('POST is rejected', GOOD, null, 'POST', 405, (b, calls) => calls ? 'called Stripe on a POST' : null);
await t('key missing', { STRIPE_PRICE_ID_SELF_PACED: 'price_123' }, null, 'GET', 503,
  (b, calls) => b.reason !== 'key_missing' ? 'wrong reason ' + b.reason : (calls ? 'called Stripe' : null));
await t('the real 3 Sep value, mk_ prefix', { STRIPE_SECRET_KEY: 'mk_1T2fvABCDEFGHIJKLMNODxvY', STRIPE_PRICE_ID_SELF_PACED: 'price_123' }, null, 'GET', 503,
  (b, calls) => b.reason !== 'key_wrong_shape' ? 'wrong reason ' + b.reason
    : b.prefix !== 'mk_' ? 'wrong prefix ' + b.prefix
    : calls ? 'called Stripe with a bad key' : null);
await t('publishable key pasted by mistake', { STRIPE_SECRET_KEY: 'pk_live_' + 'y'.repeat(80), STRIPE_PRICE_ID_SELF_PACED: 'price_123' }, null, 'GET', 503,
  (b, calls) => b.reason !== 'key_wrong_shape' ? 'wrong reason ' + b.reason : (calls ? 'called Stripe' : null));
await t('restricted key is accepted', { STRIPE_SECRET_KEY: 'rk_live_' + 'z'.repeat(80), STRIPE_PRICE_ID_SELF_PACED: 'price_123' }, okRes(200, PRICE_OK), 'GET', 200,
  (b) => b.ok === true && b.key_prefix === 'rk_live' ? null : 'bad body');
await t('price env missing', { STRIPE_SECRET_KEY: GOOD.STRIPE_SECRET_KEY }, null, 'GET', 503,
  (b, calls) => b.reason !== 'price_env_missing' ? 'wrong reason ' + b.reason : (calls ? 'called Stripe' : null));
await t('stripe 401', GOOD, okRes(401, {}), 'GET', 503, (b) => b.reason !== 'stripe_auth_failed' ? 'wrong reason ' + b.reason : null);
await t('stripe 404', GOOD, okRes(404, {}), 'GET', 503, (b) => b.reason !== 'price_not_found' ? 'wrong reason ' + b.reason : null);
await t('stripe 500', GOOD, okRes(500, {}), 'GET', 503, (b) => b.reason !== 'stripe_unreachable' ? 'wrong reason ' + b.reason : null);
await t('network throw', GOOD, new Error('ECONNRESET'), 'GET', 503, (b) => b.reason !== 'stripe_unreachable' ? 'wrong reason ' + b.reason : null);
await t('price archived', GOOD, okRes(200, { ...PRICE_OK, active: false }), 'GET', 503,
  (b) => b.reason === 'price_mismatch' && b.mismatched.includes('active') ? null : 'bad body');
await t('test-mode price', GOOD, okRes(200, { ...PRICE_OK, livemode: false }), 'GET', 503,
  (b) => b.reason === 'price_mismatch' && b.mismatched.includes('livemode') ? null : 'bad body');
await t('wrong currency and amount', GOOD, okRes(200, { ...PRICE_OK, currency: 'usd', unit_amount: 4900 }), 'GET', 503,
  (b) => b.reason === 'price_mismatch' && b.mismatched.includes('currency') ? null : 'bad body');
await t('price silently changed to A$59', GOOD, okRes(200, { ...PRICE_OK, unit_amount: 5900 }), 'GET', 503,
  (b) => b.reason === 'price_mismatch' && b.mismatched.includes('unit_amount') ? null : 'bad body');
await t('everything correct', GOOD, okRes(200, PRICE_OK), 'GET', 200,
  (b, calls) => b.ok === true && b.unit_amount === 4900 && calls === 1 ? null : 'bad body or call count ' + calls);

console.log(`\n${pass} passed, ${fail} failed. Total simulated Stripe reads: ${stripeCalls}. Real Stripe calls: 0.`);
process.exit(fail ? 1 : 0);

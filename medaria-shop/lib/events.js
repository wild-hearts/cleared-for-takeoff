// lib/events.js. A durable record of what happened to an order.
//
// There is no database on this project. Events are small JSON objects in the Vercel Blob
// store, which is enough to answer the only questions that matter at 2am:
//   - did this paid order actually reach Printify?
//   - which orders paid and were never produced?
//   - did the buyer get their tracking?
//
// Fire-and-forget by design. Recording must NEVER break fulfilment: if the store is
// unreachable the order still goes to Printify and we lose a log line, which is the right
// way round.
import { put, list } from '@vercel/blob';

const PREFIX = 'merch-events/';

/** Record one event. Never throws. Keep payloads small and free of full addresses. */
export async function recordEvent(type, data = {}) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return null;
  try {
    const at = new Date().toISOString();
    const pathname = `${PREFIX}${type}/${at.slice(0, 10)}/${at}-${Math.random().toString(36).slice(2, 8)}.json`;
    await put(pathname, JSON.stringify({ type, at, ...data }), {
      access: 'private', token, contentType: 'application/json', addRandomSuffix: false,
    });
    return pathname;
  } catch (err) {
    console.error('recordEvent failed (non-fatal):', err.message);
    return null;
  }
}

/** Recent events of a type, newest first. */
export async function readEvents(type, limit = 25) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return [];
  const out = [];
  let cursor;
  do {
    const page = await list({ token, prefix: `${PREFIX}${type}/`, cursor, limit: 1000 });
    out.push(...page.blobs);
    cursor = page.cursor;
  } while (cursor && out.length < 5000);
  return out.sort((a, b) => (a.pathname < b.pathname ? 1 : -1)).slice(0, limit);
}

import queryString from 'query-string';

import { db } from '../store';

export function parseQueryString(args) {
  return queryString.parse(args);
}

function getMethod(req) {
  const url = new URL(req.url);
  if (!url.pathname.includes('/api/method/')) {
    return null;
  }
  return url.pathname.replace('/api/method/', '');
}

export async function makeCachedResponse(request) {
  const req = request.clone();
  const method = getMethod(req);
  if (method === 'erpnext.accounts.party.get_party_details') {
    const args = parseQueryString(await req.text());
    const { party_type, party, pos_profile } = args;
    await db.open();
    const result = await db.party_details.get({
      party_type,
      party,
      pos_profile,
    });
    if (result) {
      if (new Date() - result.updatedAt < 1 * 24 * 60 * 60 * 1000) {
        const { message } = result;
        return new Response(JSON.stringify({ message }), {
          status: 200,
          ok: true,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      db.party_details.delete(result.id);
    }

    const response = await fetch(request);
    const res = response.clone();
    const data = await res.json();
    db.party_details.put(Object.assign(args, data, { updatedAt: new Date() }));
    return response;
  }

  return null;
}

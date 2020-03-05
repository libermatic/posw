import queryString from 'query-string';

import db from '../store';

export function parseQueryString(args) {
  return queryString.parse(args);
}

export async function get_response(req) {
  const request = req.clone();
  const { party_type, party, pos_profile } = parseQueryString(
    await request.text()
  );
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
        statusText: 'OK',
        headers: { 'Content-Type': 'application/json' },
      });
    }
    db.party_details.delete(result.id);
  }
  return null;
}

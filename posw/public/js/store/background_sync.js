import queryString from 'query-string';

import db from './db';
import { getRequestOptions } from './utils';

export default async function background_sync(tag) {
  const [doc, options] = await Promise.all([
    db.pos_invoices.get(tag),
    getRequestOptions(),
  ]);
  const {
    docs: [{ name, offline_pos_name }],
  } = await fetch(
    '/api/method/frappe.desk.form.save.savedocs',
    Object.assign(options, {
      body: queryString.stringify({ action: 'Submit', doc: JSON.stringify(doc) }),
    })
  ).then(r => r.json());

  if (offline_pos_name === tag) {
    await db.pos_invoices.delete(offline_pos_name);
  }
  return name;
}

import db, { tables, getSetting, putSetting } from './db';
import queryString from 'query-string';

export default async function background_fetch({ csrf_token }) {
  const lastUpdated = (await getSetting('lastUpdated')) || new Date(0).toISOString();
  const currentTime = new Date().toISOString();
  const options = getOptions(csrf_token);
  await Promise.all(
    Object.keys(tables).map(doctype => batchRequest({ doctype, lastUpdated, options }))
  );
  return putSetting('lastUpdated', currentTime);
}

async function batchRequest({ doctype, lastUpdated, options, cursor }) {
  const { message: { data, next } = {} } = await fetch(
    '/api/method/posw.api.pos.background_fetch',
    Object.assign(options, {
      body: queryString.stringify({ doctype, cursor, modified: lastUpdated }),
    })
  )
    .then(r => r.json())
    .catch(() => ({}));
  if (data) {
    await cache(doctype, data);
  }
  if (next) {
    await batchRequest({ doctype, lastUpdated, options, cursor: next });
  }
}

async function cache(doctype, data) {
  const storeName = tables[doctype];
  if (storeName) {
    return db.table(storeName).bulkPut(data);
  }
}

function getOptions(csrf_token) {
  return {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      Accept: 'application/json',
      'X-Frappe-CSRF-Token': csrf_token,
      'X-Frappe-CMD': '',
    },
  };
}

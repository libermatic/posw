import queryString from 'query-string';

import { getMethod, getParams } from './utils';

const SCRIPTS = [
  ['assets/erpnext/js/pos/clusterize.js', 'assets/erpnext/css/pos.css'],
  ['assets/erpnext/js/utils/serial_no_batch_selector.js'],
];

const DOCTYPES = ['Sales Invoice', 'Item Group', 'Batch'];

export async function setCache(cacheName) {
  const cache = await caches.open(cacheName);
  return cache.addAll([
    ...SCRIPTS.map(
      items =>
        `/api/method/frappe.client.get_js?${queryString.stringify({
          items: JSON.stringify(items),
        })}`
    ),
    ...DOCTYPES.map(
      doctype =>
        `/api/method/frappe.desk.form.load.getdoctype?${queryString.stringify({
          doctype,
          with_parent: 1,
        })}`
    ),
  ]);
}

export async function getCached(cacheName, _request) {
  const req = _request.clone();
  const method = getMethod(req);
  if (method === 'frappe.client.get_js') {
    const req = _request.clone();
    const cache = await caches.open(cacheName);
    const cached = await cache.match(req.url);
    if (cached) {
      return cached;
    }
    const res = await fetch(_request);
    cache.put(req.url, res.clone());
    return res;
  }
  if (method === 'frappe.desk.form.load.getdoctype') {
    const req = _request.clone();
    const { doctype, with_parent } = getParams(req);
    if (DOCTYPES.includes(doctype)) {
      const url = `/api/method/frappe.desk.form.load.getdoctype?${queryString.stringify(
        { doctype, with_parent }
      )}`;
      const cache = await caches.open(cacheName);
      const cached = await cache.match(url);
      if (cached) {
        return cached;
      }
      const res = await fetch(_request);
      cache.put(url, res.clone());
      return res;
    }
  }
  return null;
}

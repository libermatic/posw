import { getMethod } from './utils';

const SCRIPTS = [
  ['assets/erpnext/js/pos/clusterize.js', 'assets/erpnext/css/pos.css'],
  ['assets/erpnext/js/utils/serial_no_batch_selector.js'],
];

export async function setCache(cacheName) {
  const cache = await caches.open(cacheName);
  return cache.addAll(
    SCRIPTS.map(
      x =>
        `/api/method/frappe.client.get_js?items=${encodeURIComponent(
          JSON.stringify(x)
        )}`
    )
  );
}

export async function getCached(cacheName, _request) {
  const req = _request.clone();
  const method = getMethod(req);
  console.log(method);
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
  return null;
}

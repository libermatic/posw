self.importScripts('/assets/js/posw-worker.min.js');

const CACHE_NAME = 'scripts-v1';

class Worker {
  constructor() {
    this.registerHandlers();
  }

  registerHandlers() {
    self.addEventListener('install', function (e) {
      e.waitUntil(posw.assets.setCache(CACHE_NAME));
    });
    self.addEventListener('fetch', function (e) {
      e.respondWith(
        (async function () {
          const client = await self.clients.get(e.clientId);
          if (client && client.url.includes('desk#point-of-sale')) {
            const cached = await posw.assets.getCached(CACHE_NAME, e.request);
            if (cached) {
              return cached;
            }
            const response = await posw.intercept.request(e.request);
            if (response) {
              return response;
            }
          }
          return fetch(e.request);
        })()
      );
    });

    self.addEventListener('message', function (e) {
      const { action, payload } = e.data || {};
      if (action === 'load_master_data') {
        e.waitUntil(posw.store.background_fetch(payload));
      }
    });
  }
}

const worker = new Worker();

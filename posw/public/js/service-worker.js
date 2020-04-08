self.importScripts('/assets/js/posw-worker.min.js');

class Worker {
  constructor() {
    this.registerHandlers();
  }

  registerHandlers() {
    self.addEventListener('fetch', async function (e) {
      e.respondWith(
        (async function () {
          const client = await self.clients.get(e.clientId);
          if (client && client.url.includes('desk#point-of-sale')) {
            const response = await posw.intercept.request(e.request);
            if (response) {
              return response;
            }
          }
          return fetch(e.request);
        })()
      );
    });

    self.addEventListener('message', async function (e) {
      const { action, payload } = e.data || {};
      if (action === 'load_master_data') {
        e.waitUntil(posw.store.background_fetch(payload));
      }
    });
  }
}

const worker = new Worker();

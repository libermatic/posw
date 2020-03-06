self.importScripts('/assets/js/posw-worker.min.js');

class Worker {
  constructor() {
    this.registerHandlers();
  }

  registerHandlers() {
    self.addEventListener('fetch', async function(e) {
      e.respondWith(
        (async function() {
          const client = await self.clients.get(e.clientId);
          if (client && client.url.includes('desk#point-of-sale')) {
            const response = await self.posw.makeCachedResponse(e.request);
            if (response) {
              return response;
            }
          }
          return fetch(e.request);
        })()
      );
    });

    self.addEventListener('message', async function(e) {
      try {
        const { action, payload } = JSON.parse(e.data);
        if (action === 'load_master_data') {
          e.waitUntil(self.posw.store.background_fetch(payload));
        }
      } catch (e) {
        console.log('Invalid message.');
      }
    });
  }
}

const worker = new Worker();

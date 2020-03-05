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
            if (
              e.request.url.includes('erpnext.accounts.party.get_party_details')
            ) {
              const response = await self.posw.utils.get_response(e.request);
              if (response) {
                return response;
              }
            }
          }
          return fetch(e.request);
        })()
      );
    });
  }
}

const worker = new Worker();

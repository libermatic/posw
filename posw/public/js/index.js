import * as Sentry from '@sentry/browser';

import * as extensions from './extensions';

const __version__ = '0.0.0';

Sentry.init({
  dsn: frappe.boot.sentry_dsn,
  release: __version__,
  beforeSend(event, hint) {
    console.log(event);
    if (!event.request.url.includes('#point-of-sale')) {
      return null;
    }
    return event;
  },
});
Sentry.setUser({ email: frappe.boot.user.name });

frappe.provide('posw');
posw = { __version__, extensions };

if ('serviceWorker' in navigator) {
  // do not use native method
  if (frappe && frappe.request && frappe.request.call) {
    frappe.request.call = extensions.frappe_request_call;
  }

  // polyfill non-standard Promise method used by jQuery
  Promise.prototype.always = Promise.prototype.finally;

  navigator.serviceWorker
    .register('/assets/posw/js/service-worker.js', { scope: '/desk' })
    .then(() => {
      console.log('Service worker registered');
    })
    .catch(error => {
      console.log('Service worker registration failed, error:', error);
    });
}

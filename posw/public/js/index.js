import * as extensions from './extensions';

frappe.provide('posw');

posw = { extensions };

if ('serviceWorker' in navigator) {
  // do not use native method
  if (frappe && frappe.request && frappe.request.call) {
    frappe.request.call = extensions.frappe_request_call;
  }

  // polyfill non-standard Promise method used by jQuery
  Promise.prototype.always = Promise.prototype.finally;
}

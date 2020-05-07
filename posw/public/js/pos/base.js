import * as R from 'ramda';

import { db, putSetting } from '../store';
import makeExtension from './factory';

function uuid4() {
  // https://stackoverflow.com/questions/105034/how-to-create-guid-uuid
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
  );
}

function getIndicator(status) {
  if (status === 'SUCCESS') {
    return green;
  }
  return null;
}

export default function base(Pos) {
  return makeExtension(
    'base',
    class PosWithBase extends Pos {
      constructor(wrapper) {
        super(wrapper);
        putSetting('csrf_token', frappe.csrf_token).then(
          this.load_master_data.bind(this)
        );
        this.registerMessaging();
      }
      async load_master_data() {
        const registration = await navigator.serviceWorker.ready;
        if (registration.active) {
          registration.active.postMessage({ action: 'load_master_data' });
        }
      }
      async set_pos_profile_data() {
        const resolved = await super.set_pos_profile_data();
        if (this.frm.doc.pos_profile) {
          putSetting('pos_profile', this.frm.doc.pos_profile);
        }
        return resolved;
      }
      async submit_sales_invoice() {
        this.frm.doc = R.mergeDeepRight(this.frm.doc, {
          items: this.frm.doc.items.map(R.dissoc('barcodes')),
        });
        try {
          if (!('SyncManager' in window)) {
            throw new Error('Background Sync not suported');
          }
          const registration = await navigator.serviceWorker.ready;
          this.frm.doc.offline_pos_name = uuid4();
          await db.pos_invoices.put(this.frm.doc);
          registration.sync.register(this.frm.doc.offline_pos_name);
          this.frm.doc.docstatus = 1;
          this.toggle_editing();
          this.set_form_action();
          this.set_primary_action_in_modal();
        } catch (e) {
          super.submit_sales_invoice();
        }
      }
      registerMessaging() {
        const channel = new BroadcastChannel('invoice-sync');
        channel.addEventListener('message', e => {
          const { status, docname } = e.data;
          frappe.show_alert({
            indicator: getIndicator(status),
            message: __(`Sales invoice ${docname} created succesfully`),
          });
        });
      }
    }
  );
}

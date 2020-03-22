import { putSetting } from '../store';
import makeExtension from './factory';

export default function base(Pos) {
  return makeExtension(
    'base',
    class PosWithBase extends Pos {
      constructor(wrapper) {
        super(wrapper);
        this.load_master_data();
      }
      async load_master_data() {
        const registration = await navigator.serviceWorker.ready;
        if (registration.active) {
          registration.active.postMessage({
            action: 'load_master_data',
            payload: { csrf_token: frappe.csrf_token },
          });
        }
      }
      async set_pos_profile_data() {
        const resolved = await super.set_pos_profile_data();
        if (this.frm.doc.pos_profile) {
          putSetting('pos_profile', this.frm.doc.pos_profile);
        }
        return resolved;
      }
    }
  );
}

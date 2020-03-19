import { putSetting } from '../store';

export default function base(Pos) {
  if (Pos.extensions && Pos.extensions.includes('base')) {
    return Pos;
  }

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
  const extensions = PosWithBase.extensions || [];
  PosWithBase.extensions = [...extensions, 'base'];
  return PosWithBase;
}

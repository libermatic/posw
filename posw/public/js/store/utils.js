import db from './db';

export function attempt_cache({ method, args, data }) {
  if (method === 'erpnext.accounts.party.get_party_details' && args) {
    db.party_details.put(Object.assign(args, data, { updatedAt: new Date() }));
  }
}

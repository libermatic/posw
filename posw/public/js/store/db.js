import Dexie from 'dexie';

const db = new Dexie('posw');
db.version(1).stores({
  party_details: '++id, party_type, party, pos_profile, updatedAt',
});

export default db;

import Dexie from 'dexie';
import relationships from 'dexie-relationships';

const db = new Dexie('posw', { addons: [relationships] });
db.version(1).stores({
  system: 'id',
  pos_profiles: 'name',
  customers:
    'name, customer_name, customer_group, territory, mobile_no, primary_address, modified',
  item_groups: 'name, modified',
  items: 'name, item_name, description, item_group, customer_code, modified',
  item_barcodes: 'name, barcode, parent -> items.name, modified',
  uom_conversion_details:
    'name, uom, conversion_factor, parent -> items.name, modified',
});

export default db;

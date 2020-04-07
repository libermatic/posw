import Dexie from 'dexie';
import relationships from 'dexie-relationships';

export const tables = {
  'POS Profile': 'pos_profiles',
  Company: 'companies',
  Customer: 'customers',
  'Customer Group': 'customer_groups',
  'Party Account': 'party_accounts',
  Territory: 'territories',
  'Loyalty Program': 'loyalty_programs',
  'Item Group': 'item_groups',
  Item: 'items',
  'Item Barcode': 'item_barcodes',
  'UOM Conversion Detail': 'uom_conversion_details',
  'Item Default': 'item_defaults',
  'Item Tax': 'item_taxes',
  'Price List': 'price_lists',
  'Item Price': 'item_prices',
  Bin: 'bins',
  'Item Tax Template': 'item_tax_templates',
};

const db = new Dexie('posw', { addons: [relationships] });
db.version(1).stores({
  system: 'id',
  oneshots: 'id',

  // caches of back-end data
  pos_profiles: 'name',
  companies: 'name',
  customers:
    'name, customer_name, customer_group, territory, mobile_no, primary_address, modified',
  customer_groups: 'name',
  party_accounts: 'name, parenttype, parent, company',
  territories: 'name',
  loyalty_programs: 'name',
  item_groups: 'name, lft, rgt, modified',
  items: 'name, item_name, description, item_group, customer_code, modified',
  item_barcodes: 'name, barcode, parent -> items.name, modified',
  uom_conversion_details:
    'name, uom, conversion_factor, parent -> items.name, modified',
  item_defaults: 'name, parent',
  item_taxes: 'name, parent, item_tax_template -> item_tax_templates.name',
  price_lists: 'name',
  item_prices:
    'name, item_code, uom, price_list, customer, valid_from, valid_upto',
  bins: 'name, item_code, warehouse, actual_qty',
  item_tax_templates: 'name',
});

export async function getSetting(key) {
  const entity = (await db.system.get(1)) || {};
  return entity[key];
}

export async function putSetting(key, value) {
  const entity = (await db.system.get(1)) || {};
  return db.system.put(Object.assign(entity, { id: 1, [key]: value }));
}

export async function getOneshot(key) {
  const entity = (await db.oneshots.get(1)) || {};
  return entity[key];
}

export async function putOneshot(key, value) {
  const entity = (await db.oneshots.get(1)) || {};
  return db.oneshots.put(Object.assign(entity, { id: 1, [key]: value }));
}

export default db;

import { db, tables, getSetting } from '../../store';

export default async function validate_link({ value, options, fetch }) {
  if (
    ['Customer', 'Customer Group', 'Territory', 'Item Group'].includes(options)
  ) {
    const storeName = tables[options];
    const entity = await db.table(storeName).get(value);
    if (entity) {
      return Object.assign(
        { message: 'Ok', valid_value: value },
        fetch && { fetch: fetch.split(', ').map(x => entity[x] || null) }
      );
    }
  }

  const doctypeToPosField = {
    Company: 'company',
    Currency: 'currency',
    'Price List': 'selling_price_list',
  };
  if (Object.keys(doctypeToPosField).includes(options) && !fetch) {
    const pos_profile = await getSetting('pos_profile').then(
      name => name && db.pos_profiles.get(name)
    );
    if (pos_profile && pos_profile[doctypeToPosField[options]] === value) {
      return { message: 'Ok', valid_value: value };
    }
  }
}

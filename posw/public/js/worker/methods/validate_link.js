import { db, tables } from '../../store';

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
}

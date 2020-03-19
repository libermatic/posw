import * as R from 'ramda';

import { db } from '../../store';

export default async function get_value({ doctype, fieldname, filters }) {
  if (doctype === 'Item Group') {
    const args = JSON.parse(filters);
    const results = await db.item_groups
      .filter(x => Object.keys(args).every(field => x[field] === args[field]))
      .first();
    return R.pick(Array.isArray(fieldname) ? fieldname : [fieldname], results);
  }
}

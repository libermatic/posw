import { db } from '../../store';

import { parseArgs } from '../utils';

export default async function search_link({
  doctype,
  txt,
  query = null,
  page_length = 20,
  filters = null,

  // unused params
  searchfield = null,
  reference_doctype = null,
  ignore_user_permissions = false,
}) {
  if (
    doctype === 'Customer' &&
    query === 'erpnext.controllers.queries.customer_query'
  ) {
    const searchfields = [
      'name',
      'customer_name',
      'customer_group',
      'territory',
      'mobile_no',
      'primary_address',
    ];
    const result = await db.customers
      .reverse()
      .filter(row =>
        searchfields
          .map(x => row[x] && row[x].toLowerCase())
          .some(x => x && x.includes(txt.toLowerCase()))
      )
      .limit(page_length)
      .toArray();
    const [id, ...otherFields] = searchfields;
    return result.map(row => ({
      value: row[id],
      description: otherFields.map(x => row[x]).join(', '),
    }));
  }
  if (
    doctype === 'Item Group' &&
    query ===
      'erpnext.selling.page.point_of_sale.point_of_sale.item_group_query'
  ) {
    const { pos_profile } = parseArgs(filters) || {};
    if (pos_profile) {
      const result = await db.pos_profiles.get(pos_profile);
      if (result && result.item_groups.length > 0) {
        return result.item_groups
          .filter(x => !txt || x.toLowerCase().includes(txt.toLowerCase()))
          .map(x => ({ value: x, description: '' }));
      }
    }
    const result = await db.item_groups
      .filter(searchNameWithIgnoreCase(txt))
      .toArray();
    return result
      .slice(0, page_length)
      .map(({ name: value }) => ({ value, description: '' }));
  }
  if (doctype === 'Customer Group') {
    const result = await db.customer_groups
      .filter(searchNameWithIgnoreCase(txt))
      .toArray();
    return result
      .slice(0, page_length)
      .map(({ name: value, parent_customer_group: description }) => ({
        value,
        description,
      }));
  }
  if (doctype === 'Territory') {
    const result = await db.territories
      .filter(searchNameWithIgnoreCase(txt))
      .toArray();
    return result
      .slice(0, page_length)
      .map(({ name: value, parent_territory: description }) => ({
        value,
        description,
      }));
  }
}

function searchNameWithIgnoreCase(txt) {
  return ({ name }) => !txt || name.toLowerCase().includes(txt.toLowerCase());
}

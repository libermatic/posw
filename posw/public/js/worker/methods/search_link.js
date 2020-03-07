import { db } from '../../store';

export default async function search_link({
  doctype,
  txt,
  query = null,
  page_length = 20,

  // unused params
  filters = null,
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
}

import * as methods from './methods';
import { getMethod, getArgs, respond } from './utils';

export async function request(_request) {
  const req = _request.clone();
  const method = getMethod(req);
  console.log(method);
  if (method === 'erpnext.selling.page.point_of_sale.point_of_sale.get_items') {
    const args = getArgs(await req.text());
    const message = await methods.get_items(args);
    return respond({ message });
  }
  if (method === 'frappe.desk.search.search_link') {
    const args = getArgs(await req.text());
    const results = await methods.search_link(args);
    return results && respond({ results });
  }
}

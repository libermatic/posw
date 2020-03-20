import { putOneshot } from '../store';
import * as methods from './methods';
import { getMethod, getParams, getArgs, respond } from './utils';

export async function request(_request) {
  const method = getMethod(_request);
  const payload = await getPayload(_request);
  if (payload) {
    return respond(payload);
  }
  method && console.log(method);
  return null;
}

async function getPayload(_request) {
  const req = _request.clone();
  const method = getMethod(req);
  if (method === 'erpnext.selling.page.point_of_sale.point_of_sale.get_items') {
    const args = getArgs(await req.text());
    const message = await methods.get_items(args);
    return message && { message };
  }
  if (method === 'frappe.client.get_value') {
    const args = getParams(req) || getArgs(await req.text());
    const message = await methods.get_value(args);
    return message && { message };
  }
  if (method === 'frappe.desk.search.search_link') {
    const args = getArgs(await req.text());
    const results = await methods.search_link(args);
    return results && { results };
  }
  if (method === 'frappe.desk.form.utils.validate_link') {
    const args = getParams(req);
    const valid = await methods.validate_link(args);
    return valid;
  }
  if (method === 'runserverobj') {
    return methods.runserverobj(_request);
  }
  return null;
}

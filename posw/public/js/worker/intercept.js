import * as methods from './methods';
import { getMethod, getParams, getArgs, respond } from './utils';

export async function request(_request) {
  const method = getMethod(_request);
  try {
    const payload = await getPayload(_request);
    if (payload) {
      return respond(payload);
    }
  } catch (e) {
    return respond(
      {
        _server_messages: JSON.stringify([{ indicator: 'red', message: e.message }]),
        exc: JSON.stringify([e.stack]),
        exc_type: e.name,
      },
      /* status */ 417
    );
  }

  // log unhandled requests
  method && console.log(`%c${method}`, 'color: #42a5f5;');
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
  if (method === 'erpnext.setup.doctype.company.company.get_default_company_address') {
    return methods.get_default_company_address(_request);
  }
  if (
    method === 'erpnext.controllers.accounts_controller.get_default_taxes_and_charges'
  ) {
    return methods.get_default_taxes_and_charges(_request);
  }
  if (
    method ===
    'erpnext.accounts.doctype.loyalty_program.loyalty_program.get_loyalty_program_details'
  ) {
    const args = getArgs(await req.text());
    const message = await methods.get_loyalty_program_details(args);
    return message && { message };
  }
  if (
    method ===
    'erpnext.accounts.doctype.sales_invoice.sales_invoice.get_loyalty_programs'
  ) {
    const args = getArgs(await req.text());
    const message = await methods.get_loyalty_programs(args);
    return message ? { message } : {};
  }
  if (method === 'erpnext.accounts.party.get_party_details') {
    const args = getArgs(await req.text());
    const message = await methods.get_party_details(args);
    return message && { message };
  }
  if (
    method === 'erpnext.accounts.doctype.pricing_rule.pricing_rule.apply_pricing_rule'
  ) {
    const args = getArgs(await req.text());
    const message = await methods.apply_pricing_rule(args);
    return message && { message };
  }
  if (method === 'erpnext.stock.get_item_details.get_item_details') {
    const args = getArgs(await req.text());
    const message = await methods.get_item_details(args);
    return message && { message };
  }
  if (method === 'erpnext.stock.get_item_details.apply_price_list') {
    const args = getArgs(await req.text());
    const message = await methods.apply_price_list(args);
    return message && { message };
  }
  if (method === 'erpnext.regional.india.utils.get_regional_address_details') {
    return {};
  }
  return null;
}

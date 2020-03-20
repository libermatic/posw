import * as R from 'ramda';

import { db, getSetting, getOneshot, putOneshot } from '../../store';

async function getAccount(customer, company) {
  const customer_account = await db.party_accounts
    .where('parent')
    .equals(customer.name)
    .and(x => x.company === company && x.parenttype === 'Customer')
    .first();
  if (customer_account) {
    return customer_account.account;
  }
  const group_account = await db.party_accounts
    .where('parent')
    .equals(customer.customer_group)
    .and(x => x.company === company && x.parenttype === 'Customer Group')
    .first();
  if (group_account) {
    return group_account.account;
  }
  const { default_receivable_account } =
    (await db.companies.get(company)) || {};
  return default_receivable_account;
}

async function getPricelist(customer, pos_profile, price_list) {
  if (customer.default_price_list) {
    return customer.default_price_list;
  }
  if (pos_profile) {
    const { selling_price_list } =
      (await db.pos_profiles.get(pos_profile)) || {};
    return selling_price_list || price_list;
  }
}

export default async function({
  party = null,
  account = null,
  party_type = 'Customer',
  company = null,
  posting_date = null,
  bill_date = null,
  price_list = null,
  currency = null,
  doctype = null,
  ignore_permissions = false,
  fetch_payment_terms_template = true,
  party_address = null,
  company_address = null,
  shipping_address = null,
  pos_profile = null,
}) {
  if (party_type != 'Customer' || doctype != 'Sales Invoice') {
    return null;
  }
  const customer = await db.customers.get(party);
  if (!customer) {
    return null;
  }

  const [debit_to, selling_price_list] = await Promise.all([
    getAccount(customer, company),
    getPricelist(customer, pos_profile, price_list),
  ]);

  return Object.assign(
    R.pick(
      [
        'customer_name',
        'customer_group',
        'territory',
        'language',
        'default_currency',
        'default_sales_partner',
        'default_commission_rate',
      ],
      customer
    ),
    {
      customer: party,
      debit_to,
      due_date: posting_date || new Date().toJSON().subsctring(0, 10),

      customer_address: party_address || customer.customer_primary_address,
      billing_address_gstin: null,
      address_display: customer.primary_address,
      shipping_address_name: shipping_address,
      shipping_address: null,
      customer_gstin: null,
      company_address,
      company_gstin: null,

      contact_person: customer.customer_primary_contact,
      contact_display:
        customer.customer_primary_contact &&
        customer.customer_primary_contact.replace(`${party}-`, ''),
      contact_email: customer.email_id,
      contact_mobile: customer.mobile_no,
      contact_phone: null,
      contact_designation: null,
      contact_department: null,

      selling_price_list,
      price_list_currency: currency,

      tax_category: '',
      taxes_and_charges: null,

      currency,
      sales_team: [],
    }
  );
}

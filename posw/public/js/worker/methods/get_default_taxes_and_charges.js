import { db, getSetting, getOneshot, putOneshot } from '../../store';
import { getArgs } from '../utils';

async function get_default_taxes_and_charges({
  master_doctype,
  company = null,

  // unused params
  tax_template = null,
}) {
  if (master_doctype === 'Sales Taxes and Charges Template') {
    return getOneshot(`get_default_taxes_and_charges:'${company}'`);
  }
  return null;
}

export default async function (_request) {
  const req = _request.clone();
  const args = getArgs(await req.text());
  if (!args) {
    return null;
  }
  const taxes = await get_default_taxes_and_charges(args);
  if (taxes) {
    return taxes;
  }
  const pos_profile = await getSetting('pos_profile').then(
    name => name && db.pos_profiles.get(name)
  );
  if (!pos_profile || args.company !== pos_profile.company) {
    return null;
  }
  const data = await fetch(_request).then(r => r.json());
  await putOneshot(`get_default_taxes_and_charges:'${args.company}'`, data);
  return data;
}

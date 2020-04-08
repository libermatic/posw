import { db, getSetting, getOneshot, putOneshot } from '../../store';
import { getArgs } from '../utils';

async function get_default_company_address({
  name,

  // unused params
  sort_key = 'is_primary_address',
  existing_address = null,
}) {
  return getOneshot(`get_default_company_address:'${name}'`);
}

export default async function (_request) {
  const req = _request.clone();
  const args = getArgs(await req.text());
  if (!args) {
    return null;
  }
  const address = await get_default_company_address(args);
  if (address) {
    return address;
  }
  const pos_profile = await getSetting('pos_profile').then(
    name => name && db.pos_profiles.get(name)
  );
  if (!pos_profile || args.name !== pos_profile.company) {
    return null;
  }
  const data = await fetch(_request).then(r => r.json());
  await putOneshot(`get_default_company_address:'${args.name}'`, data);
  return data;
}

import { db, getOneshot, putOneshot } from '../../store';
import { getArgs } from '../utils';

async function runserverobj({
  method,
  docs = null,

  // unused params
  dt = null,
  dn = null,
  arg = null,
  args = null,
}) {
  if (method === 'set_missing_values' && docs) {
    const parsed = JSON.parse(docs);
    if (parsed && parsed.doctype === 'Sales Invoice') {
      const data = await getOneshot(
        'runserverobj:SalesInvoice.set_missing_values'
      );
      if (data && data.docs && data.docs[0]) {
        return Object.assign(data, {
          docs: [Object.assign(data.docs[0], parsed)],
        });
      }
    }
  }
  return null;
}

export default async function(_request) {
  const req = _request.clone();
  const args = getArgs(await req.text());
  const valid = await runserverobj(args);
  if (valid) {
    return valid;
  }
  const data = await fetch(_request).then(r => r.json());
  await putOneshot('runserverobj:SalesInvoice.set_missing_values', data);
  return data;
}

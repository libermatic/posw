import { db, getOneshot } from '../../store';

export default async function runserverobj({
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
}

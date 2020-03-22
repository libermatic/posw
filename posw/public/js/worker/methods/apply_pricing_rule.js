import * as R from 'ramda';

// TODO: currently a stub. implement pricing rule
export default async function({ args, doc = null }) {
  const item = R.head(JSON.parse(args).items) || {};
  return {
    doctype: item.doctype,
    name: item.name,
    parent: item.parent,
    parenttype: item.parenttype,
    child_docname: item.child_docname,
    discount_percentage_on_rate: [],
    discount_amount_on_rate: [],
  };
}

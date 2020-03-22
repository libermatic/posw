import * as R from 'ramda';

export function getRowWithPricingRule(row) {
  return {
    doctype: row.doctype,
    name: row.name,
    parent: row.parent,
    parenttype: row.parenttype,
    child_docname: row.child_docname,
    discount_percentage_on_rate: [],
    discount_amount_on_rate: [],
  };
}

// TODO: currently a stub. implement pricing rule
export default async function({ args, doc = null }) {
  const item = R.head(JSON.parse(args).items) || {};
  return [getRowWithPricingRule(item)];
}

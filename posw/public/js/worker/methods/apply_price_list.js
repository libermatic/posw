import * as R from 'ramda';

import { db } from '../../store';
import { UnsupportedFeatureError } from '../exceptions.js';
import { getItemPrice } from './get_item_details';
import { getRowWithPricingRule } from './apply_pricing_rule';

async function getParent(args) {
  // NOTE: `price_list_uom_dependant` does not exists
  // but `price_not_uom_dependent` does
  const [
    { currency: price_list_currency, price_list_uom_dependant = null } = {},
    { default_currency } = {},
  ] = await Promise.all([
    db.price_lists.get(args.price_list),
    db.companies.get(args.company),
  ]);
  if (price_list_currency !== default_currency) {
    throw new UnsupportedFeatureError('Multi-currency not yet supported!');
  }
  return {
    price_list_currency,
    price_list_uom_dependant,
    plc_conversion_rate: args.plc_conversion_rate || 1,
  };
}

async function getChildren(args, parent) {
  return Promise.all(
    args.items.map(async function (x) {
      const { variant_of } = await db.items.get(x.item_code);
      const price_list_rate = await getItemPrice(
        Object.assign(
          R.pick(['uom', 'conversion_factor', 'item_code'], x),
          {
            variant_of,
          },
          R.pick(['customer', 'price_list', 'currency', 'transaction_date'], args)
        )
      );
      const pricingRuleDetails = getRowWithPricingRule(x);
      return Object.assign(pricingRuleDetails, { price_list_rate });
    })
  );
}

export default async function ({ args, as_doc = false }) {
  const parsedArgs = JSON.parse(args);
  const parent = await getParent(parsedArgs);
  const children = await getChildren(parsedArgs, parent);
  return { parent, children };
}

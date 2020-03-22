import * as R from 'ramda';

import { db } from '../../store';
import { ValidationError } from '../exceptions.js';

async function getItem({ item_code, barcode, serial_no }) {
  if (item_code) {
    return db.items.get(item_code);
  }
  if (barcode) {
    return db.item_barcodes.get(barcode).then(x => x && db.items.get(x.parent));
  }
  // TODO: handle serial_no
  return null;
}

async function defaultGetter(item, parsed) {
  const defaults = await db.item_defaults
    .where('parent')
    .equals(item.name)
    .and(x => x.company === parsed.company)
    .first();
  const parsedStd = Object.assign(parsed, {
    default_warehouse: parsed.warehouse,
  });
  const pos_profile = await db.pos_profiles
    .get(parsed.pos_profile)
    .then(
      ({
        income_account,
        expense_account,
        cost_center: selling_cost_center,
        warehouse: default_warehouse,
      }) => ({
        income_account,
        expense_account,
        selling_cost_center,
        default_warehouse,
      })
    );
  const companyDefaults = await db.companies
    .get(parsed.company)
    .then(
      ({
        default_income_account: income_account,
        default_expense_account: expense_account,
        cost_center: selling_cost_center,
      }) => ({
        income_account,
        expense_account,
        selling_cost_center,
        default_warehouse: '',
      })
    );
  return function(field) {
    if (defaults && defaults[field]) {
      return defaults[field];
    }
    if (parsedStd[field]) {
      return parsedStd[field];
    }
    if (pos_profile && pos_profile[field]) {
      return pos_profile[field];
    }
    if (companyDefaults && companyDefaults[field]) {
      return companyDefaults[field];
    }
    return null;
  };
}

async function getConversionFactor(item, uom) {
  if (item.stock_uom === uom) {
    return 1;
  }
  const itemConversion = await db.uom_conversion_details
    .where('parent')
    .equals(item.name)
    .and(x => x.uom === uom)
    .first();
  if (itemConversion) {
    return itemConversion.conversion_factor;
  }
  if (item.variant_of) {
    const templateConversion = await db.uom_conversion_details
      .where('parent')
      .equals(item.variant_of)
      .and(x => x.uom === uom)
      .first();
    if (templateConversion) {
      return templateConversion.conversion_factor;
    }
  }
  return 1;
}

async function getItemTax(item, parsed) {
  function getTaxes(_taxes) {
    const getItemTaxRate = R.compose(
      JSON.stringify,
      R.map(x => R.head(x).tax_rate),
      R.groupBy(x => x.tax_type)
    );
    const { name: item_tax_template, taxes } = R.head(_taxes).item_tax_template;
    return { item_tax_template, item_tax_rate: getItemTaxRate(taxes) };
  }

  const item_taxes = await db.item_taxes
    .where('parent')
    .equals(item.name)
    .and(
      x =>
        x.parenttype === 'Item' &&
        (!x.valid_from ||
          new Date(x.valid_from) <= new Date(parsed.transaction_date))
    )
    .with({ item_tax_template: 'item_tax_template' });
  if (item_taxes.length > 0) {
    return getTaxes(item_taxes);
  }

  const group_taxes = await db.item_taxes
    .where('parent')
    .equals(item.item_group)
    .and(
      x =>
        x.parenttype === 'Item Group' &&
        (!x.valid_from ||
          new Date(x.valid_from) <= new Date(parsed.transaction_date))
    )
    .with({ item_tax_template: 'item_tax_template' });
  if (group_taxes.length > 0) {
    return getTaxes(group_taxes);
  }

  return { item_tax_template: null, item_tax_rate: '{}' };
}

export async function getItemPrice({
  item_code,
  variant_of,
  customer,
  price_list,
  currency,
  transaction_date,
  uom,
  conversion_factor,
}) {
  function getUomPrice(prices) {}

  const getFiltered = R.curry((fn, prices) => {
    const filtered = prices.filter(fn);
    if (filtered.length > 0) {
      const { price_list_rate, uom: item_priceUom } = filtered[0];
      return item_priceUom === uom
        ? price_list_rate
        : price_list_rate * conversion_factor;
    }
  });

  async function getPrice(name) {
    const prices = await db.item_prices
      .where('item_code')
      .equals(name)
      .and(
        x =>
          x.price_list === price_list &&
          x.currency === currency &&
          (!x.uom || x.uom === uom) &&
          new Date(x.valid_from || '2000-01-01') <=
            new Date(transaction_date) &&
          new Date(transaction_date) <= new Date(x.valid_upto || '2500-12-31')
      )
      .toArray();
    const getCustomerPrice = getFiltered(x => x.customer === customer);
    const getGeneralPrice = getFiltered(x => !x.customer);
    return getCustomerPrice(prices) || getGeneralPrice(prices);
  }

  const itemPrice = await getPrice(item_code);
  if (itemPrice) {
    return itemPrice;
  }

  if (variant_of) {
    const templatePrice = await getPrice(variant_of);
    if (templatePrice) {
      return templatePrice;
    }
  }

  return 0;
}

async function getBinData(item, warehouse) {
  const { actual_qty = 0, valuation_rate = 0, projected_qty, reserved_qty } =
    (await db.bins
      .where('item_code')
      .equals(item.name)
      .and(x => x.warehouse === warehouse)
      .first()) || {};
  return { actual_qty, valuation_rate, projected_qty, reserved_qty };
}

// TODO:
// implement pricing rule
// implemet batch and serials
export default async function({
  args,
  doc = null,

  // unused params
  for_validate = false,
  overwrite_warehouse = true,
}) {
  const parsed = JSON.parse(args);
  const item = await getItem(parsed);
  if (item.has_variants) {
    throw new ValidationError(
      `Item ${item.name} is a template, please select one of its variants`
    );
  }
  if (
    item.end_of_life &&
    item.end_of_life !== '0000-00-00' &&
    new Date(item.end_of_life) <= new Date()
  ) {
    throw new ValidationError(
      `Item ${item.name} has reached its end of life on ${new Date(
        item.end_of_life
      ).toLocaleDateString()}`
    );
  }
  if (item.disabled) {
    throw new ValidationError(`Item ${item.name} is disabled`);
  }

  const getDefault = await defaultGetter(item, parsed);

  const { qty = 1 } = parsed;
  const uom = item.sales_uom || item.stock_uom;
  const warehouse = getDefault('default_warehouse');

  const [
    conversion_factor,
    barcodes,
    { item_tax_template, item_tax_rate },
    { actual_qty, valuation_rate, projected_qty, reserved_qty },
  ] = await Promise.all([
    getConversionFactor(item, uom),
    db.item_barcodes
      .where('parent')
      .equals(item.name)
      .toArray(),
    getItemTax(item, parsed),
    getBinData(item, warehouse),
  ]);

  const stock_qty = qty * conversion_factor;
  const price_list_rate = await getItemPrice(
    Object.assign(
      { uom, conversion_factor, item_code: item.name },
      R.pick(['variant_of'], item),
      R.pick(['customer', 'price_list', 'currency', 'transaction_date'], parsed)
    )
  );
  const base_rate = 0;

  return Object.assign(
    R.pick(
      [
        'item_name',
        'description',
        'has_serial_no',
        'has_batch_no',

        'item_group',
        'brand',
        'stock_uom',
      ],
      item
    ),
    R.pick(
      [
        'update_stock',
        'transaction_date',
        'against_blanket_order',
        'doctype',
        'name',
        'child_docname',
      ],
      parsed
    ),
    {
      item_code: item.name,
      delivered_by_supplier: null,
      is_fixed_asset: 0,
      weight_per_unit: null,
      weight_uom: null,
      warehouse,
      income_account: getDefault('income_account'),
      expense_account: getDefault('expense_account'),
      cost_center: getDefault('selling_cost_center'),
      batch_no: null,
      uom,
      min_order_qty: '',
      qty,
      stock_qty,
      price_list_rate,
      base_price_list_rate: 0,
      rate: 0,
      base_rate,
      amount: 0,
      base_amount: 0,
      net_rate: 0,
      net_amount: 0,
      discount_percentage: 0,
      supplier: getDefault('default_supplier'),
      last_purchase_rate: 0,
      conversion_factor,
      barcodes,
      barcode: barcodes.length === 1 && barcodes[0].barcode,
      item_tax_template,
      item_tax_rate,

      customer_item_code: null,
      actual_qty,
      valuation_rate,
      projected_qty,
      reserved_qty,

      parent: null,
      parenttype: null,
      discount_percentage_on_rate: [],
      discount_amount_on_rate: [],
      gross_profit: (base_rate - valuation_rate) * stock_qty,
    }
  );
}

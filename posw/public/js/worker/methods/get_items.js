import * as R from 'ramda';

import { db } from '../../store';

async function searchById(value) {
  const entity = await db.item_barcodes.where('barcode').equals(value).first();
  if (entity) {
    const { parent: item_code, barcode } = entity;
    return { item_code, barcode };
  }
  return {};
}

async function getItemGroups(item_group, pos_profile) {
  const [{ lft, rgt } = {}, { item_groups = [] } = {}] = await Promise.all([
    db.item_groups.get(item_group || 'All Item Groups'),
    db.pos_profiles.get(pos_profile),
  ]);
  const allowed = await db.item_groups
    .where('lft')
    .aboveOrEqual(lft)
    .and(
      x => x.rgt <= rgt && (item_groups.length === 0 || item_groups.includes(x.name))
    )
    .toArray();
  return allowed.map(x => x.name);
}

async function itemPriceGetter(items, price_list) {
  const item_codes = items.map(x => x.name);
  const result = await db.item_prices
    .where('item_code')
    .anyOf(item_codes)
    .and(x => x.price_list === price_list)
    .toArray();
  const makeMap = R.compose(
    R.map(R.head),
    R.groupBy(x => x.item_code)
  );
  const pricesByItemCode = makeMap(result);
  return function (item_code) {
    const { price_list_rate, currency } = pricesByItemCode[item_code] || {};
    return { price_list_rate, currency };
  };
}

async function actualQtyGetter(items, warehouse) {
  const item_codes = items.map(x => x.name);
  const result = await db.bins
    .where('item_code')
    .anyOf(item_codes)
    .and(x => (warehouse ? x.warehouse === warehouse : true))
    .toArray();
  const makeMap = R.compose(
    R.map(R.sum),
    R.map(x => x.map(x => x.actual_qty)),
    R.groupBy(x => x.item_code)
  );
  const qtyByItemCode = makeMap(result);
  return function (item_code) {
    const actual_qty = qtyByItemCode[item_code];
    return { actual_qty };
  };
}

async function getItems({ items, price_list, warehouse }) {
  const [getItemPrice, getActualQty] = await Promise.all([
    itemPriceGetter(items, price_list),
    actualQtyGetter(items, warehouse),
  ]);
  return items.map(x =>
    Object.assign(
      R.pick(['item_name', 'is_stock_item'], x),
      { item_code: x.name },
      getItemPrice(x.name),
      getActualQty(x.name)
    )
  );
}

export default async function get_items({
  start,
  page_length,
  price_list,
  item_group,
  search_value = '',
  pos_profile = null,
}) {
  const { item_code, ...searchResults } = await searchById(search_value);
  const { warehouse, display_items_in_stock } =
    (await db.pos_profiles.get(pos_profile)) || {};
  if (item_code) {
    const result = await db.items.where('name').equals(item_code).toArray();
    const items = await getItems({ items: result, price_list, warehouse });
    return Object.assign({ items }, R.filter(R.identity, searchResults));
  }

  const item_groups = await getItemGroups(item_group, pos_profile);

  // non-performant
  const queryStart = Date.now();
  const result = await db.items
    .where('item_group')
    .anyOf(item_groups)
    .and(
      x =>
        !search_value ||
        x.name.toLowerCase().includes(search_value.toLowerCase()) ||
        x.item_name.toLowerCase().includes(search_value.toLowerCase())
    )
    .sortBy('name');
  const items = await getItems({
    items: result.slice(start || 0, page_length || 40),
    price_list,
    warehouse,
  });
  return { items };
}

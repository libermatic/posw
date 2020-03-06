# -*- coding: utf-8 -*-
from __future__ import unicode_literals


customer = [
    "customer_details",
    "customer_group",
    "customer_name",
    "customer_pos_id",
    "customer_type",
    "default_price_list",
    "disabled",
    "email_id",
    "loyalty_program",
    "loyalty_program_tier",
    "mobile_no",
    "modified",
    "name",
    "owner",
    "payment_terms",
    "primary_address",
    "tax_category",
    "tax_id",
    "territory",
]

item = [
    "brand",
    "customer",
    "customer_code",
    "description",
    "disabled",
    "has_batch_no",
    "has_expiry_date",
    "has_serial_no",
    "has_variants",
    "is_fixed_asset",
    "is_stock_item",
    "item_code",
    "item_group",
    "item_name",
    "modified",
    "name",
    "owner",
    "stock_uom",
]

item_barcode = [
    "barcode",
    "barcode_type",
    "modified",
    "name",
    "parent",
    "parentfield",
]

uom_conversion_detail = [
    "conversion_factor",
    "modified",
    "name",
    "parent",
    "parentfield",
    "uom",
]

fields = {
    "Customer": customer,
    "Item": item,
    "Item Barcode": item_barcode,
    "UOM Conversion Detail": uom_conversion_detail,
}


def get_columns(doctype):
    if doctype not in fields:
        return None, None
    return "tab{}".format(doctype), fields.get(doctype)

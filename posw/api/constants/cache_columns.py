# -*- coding: utf-8 -*-
from __future__ import unicode_literals

pos_profile = [
    "account_for_change_amount",
    "allow_delete",
    "allow_print_before_pay",
    "allow_user_to_edit_discount",
    "allow_user_to_edit_rate",
    "apply_discount_on",
    "campaign",
    "company",
    "company_address",
    "cost_center",
    "country",
    "currency",
    "customer",
    "customer_group",
    "disabled",
    "display_items_in_stock",
    "expense_account",
    "ignore_pricing_rule",
    "income_account",
    "letter_head",
    "modified",
    "name",
    "naming_series",
    "print_format",
    "print_format_for_online",
    "select_print_heading",
    "selling_price_list",
    "taxes_and_charges",
    "tc_name",
    "territory",
    "update_stock",
    "warehouse",
    "write_off_account",
    "write_off_cost_center",
]


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


tables = {
    "POS Profile": pos_profile,
    "Customer": customer,
    "Item": item,
    "Item Barcode": item_barcode,
    "UOM Conversion Detail": uom_conversion_detail,
}


def get_columns(doctype):
    if doctype not in tables:
        return None, None
    return "tab{}".format(doctype), tables.get(doctype)

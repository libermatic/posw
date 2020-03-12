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

item_group = [
    "is_group",
    "item_group_name",
    "lft",
    "modified",
    "name",
    "parent_item_group",
    "rgt",
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
]

uom_conversion_detail = [
    "conversion_factor",
    "modified",
    "name",
    "parent",
    "uom",
]

item_price = [
    "currency",
    "customer",
    "item_code",
    "min_qty",
    "modified",
    "name",
    "packing_unit",
    "price_list",
    "price_list_rate",
    "selling",
    "uom",
    "valid_from",
    "valid_upto",
]

bin = [
    "actual_qty",
    "fcfs_rate",
    "indented_qty",
    "item_code",
    "ma_rate",
    "modified",
    "name",
    "ordered_qty",
    "planned_qty",
    "projected_qty",
    "reserved_qty",
    "reserved_qty_for_production",
    "reserved_qty_for_sub_contract",
    "stock_uom",
    "stock_value",
    "valuation_rate",
    "warehouse",
]


tables = {
    "POS Profile": pos_profile,
    "Customer": customer,
    "Item Group": item_group,
    "Item": item,
    "Item Barcode": item_barcode,
    "UOM Conversion Detail": uom_conversion_detail,
    "Item Price": item_price,
    "Bin": bin,
}


def get_columns(doctype):
    if doctype not in tables:
        return None, None
    return "tab{}".format(doctype), tables.get(doctype)

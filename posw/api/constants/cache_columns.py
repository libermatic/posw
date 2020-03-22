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

company = [
    "abbr",
    "cost_center",
    "default_currency",
    "default_expense_account",
    "default_income_account",
    "default_receivable_account",
    "modified",
    "name",
]


customer = [
    "customer_details",
    "customer_group",
    "customer_name",
    "customer_pos_id",
    "customer_primary_address",
    "customer_primary_contact",
    "customer_type",
    "default_bank_account",
    "default_commission_rate",
    "default_currency",
    "default_price_list",
    "default_sales_partner",
    "disabled",
    "email_id",
    "gst_category",
    "image",
    "loyalty_program",
    "loyalty_program_tier",
    "market_segment",
    "mobile_no",
    "modified",
    "name",
    "payment_terms",
    "primary_address",
    "tax_category",
    "tax_id",
    "territory",
]

customer_group = [
    "default_price_list",
    "is_group",
    "lft",
    "modified",
    "name",
    "parent_customer_group",
    "payment_terms",
    "rgt",
]

party_account = [
    "account",
    "company",
    "modified",
    "name",
    "parent",
    "parenttype",
]


territory = [
    "is_group",
    "lft",
    "modified",
    "name",
    "owner",
    "parent_territory",
    "rgt",
    "territory_manager",
]

loyalty_program = [
    "company",
    "conversion_factor",
    "cost_center",
    "customer_group",
    "customer_territory",
    "expense_account",
    "expiry_duration",
    "from_date",
    "loyalty_program_type",
    "modified",
    "to_date",
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
    "is_stock_item",
    "item_code",
    "item_group",
    "item_name",
    "modified",
    "name",
    "owner",
    "stock_uom",
    "variant_of",
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

item_default = [
    "buying_cost_center",
    "company",
    "default_price_list",
    "default_supplier",
    "default_warehouse",
    "expense_account",
    "income_account",
    "modified",
    "name",
    "parent",
    "selling_cost_center",
]

item_tax = [
    "item_tax_template",
    "modified",
    "name",
    "parent",
    "parenttype",
    "tax_category",
    "valid_from",
]


price_list = [
    "currency",
    "enabled",
    "modified",
    "name",
    "price_not_uom_dependent",
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

item_tax_template = [
    "modified",
    "name",
]


tables = {
    "POS Profile": pos_profile,
    "Company": company,
    "Customer": customer,
    "Customer Group": customer_group,
    "Party Account": party_account,
    "Territory": territory,
    "Loyalty Program": loyalty_program,
    "Item Group": item_group,
    "Item": item,
    "Item Barcode": item_barcode,
    "UOM Conversion Detail": uom_conversion_detail,
    "Item Default": item_default,
    "Item Tax": item_tax,
    "Item Price": item_price,
    "Price List": price_list,
    "Bin": bin,
    "Item Tax Template": item_tax_template,
}

_more_clauses = {"Item": ["is_sales_item = 1"], "Price List": ["selling = 1"]}


def get_columns(doctype):
    if doctype not in tables:
        return None, None
    return "tab{}".format(doctype), tables.get(doctype)


def get_more_clauses(doctype):
    return _more_clauses.get(doctype, [])

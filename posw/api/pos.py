# -*- coding: utf-8 -*-
from __future__ import unicode_literals
import frappe
from frappe.desk.reportview import get_match_cond
from toolz import compose

from posw.api.constants.cache_columns import tables, get_columns, get_more_clauses
from posw.api.pos_profile import get_pos_profiles, get_item_tax_templates
from posw.api.utils import query_string, get_where, get_values


@frappe.whitelist()
def background_fetch(doctype, cursor=None, modified=None, limit=100):
    lim = frappe.utils.cint(limit)

    if doctype not in tables or lim < 1:
        return None

    get_dbtime = compose(
        frappe.utils.convert_utc_to_user_timezone,
        frappe.utils.get_datetime,
        frappe.utils.get_datetime_str,
    )

    result = _get_result(
        doctype, cursor, modified=get_dbtime(modified) if modified else None, limit=lim
    )

    if not result:
        return None

    next = result[-1].get("name") if len(result) > lim else None
    data = result[:-1] if next else result
    return {
        "next": next,
        "data": data,
    }


def _get_match_conditions(doctype):
    match_conditions = get_match_cond(doctype)
    return ["({})".format(match_conditions)] if match_conditions else []


def _get_result(doctype, cursor, modified, limit):
    if doctype == "POS Profile":
        return get_pos_profiles(cursor, modified, limit)
    if doctype == "Item Tax Template":
        return get_item_tax_templates(cursor, modified, limit)
    table, columns = get_columns(doctype)
    return frappe.db.sql(
        query_string.format(
            columns=", ".join(columns),
            table=table,
            where=get_where(
                cursor,
                modified,
                limit,
                more=get_more_clauses(doctype) + _get_match_conditions(doctype),
            ),
        ),
        values=get_values(cursor, modified, limit),
        as_dict=1,
    )

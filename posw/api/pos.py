# -*- coding: utf-8 -*-
from __future__ import unicode_literals
import frappe
from frappe.desk.reportview import get_match_cond
from toolz import concatv, compose, merge, groupby, first, excepts

from posw.api.constants.cache_columns import tables, get_columns, get_more_clauses


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


_query = "SELECT {columns} FROM `{table}` {where} ORDER BY name LIMIT %(limit)s"


def _get_match_conditions(doctype):
    match_conditions = get_match_cond(doctype)
    return ["({})".format(match_conditions)] if match_conditions else []


def _get_result(doctype, cursor, modified, limit):
    if doctype == "POS Profile":
        return _get_pos_profiles(cursor, modified, limit)
    table, columns = get_columns(doctype)
    return frappe.db.sql(
        _query.format(
            columns=", ".join(columns),
            table=table,
            where=_get_where(
                cursor,
                modified,
                limit,
                more=get_more_clauses(doctype) + _get_match_conditions(doctype),
            ),
        ),
        values=_get_values(cursor, modified, limit),
        as_dict=1,
    )


def _get_where(cursor, modified, limit, more=None):
    join_clauses = compose(lambda x: " AND ".join(x), concatv)
    clauses = join_clauses(
        ["name >= %(name)s"] if cursor else [],
        ["modified >= %(modified)s"] if modified else [],
        more or [],
    )
    return "WHERE {}".format(clauses) if clauses else ""


def _get_values(cursor, modified, limit, more=None):
    values = merge(
        {"name": cursor, "modified": modified, "limit": limit + 1}, more or {}
    )
    return values


def _get_pos_profiles(cursor, modified, limit):
    allowed = frappe.get_all(
        "POS Profile User",
        filters={"user": frappe.session.user},
        fields=["parent", "`default`"],
    )
    if not allowed:
        return None
    table, columns = get_columns("POS Profile")
    parents = [x.get("parent") for x in allowed]

    result = frappe.db.sql(
        _query.format(
            columns=", ".join(columns),
            table=table,
            where=_get_where(cursor, modified, limit, more=["name IN %(names)s"]),
        ),
        values=_get_values(cursor, modified, limit, more={"names": parents}),
        as_dict=1,
    )

    if not result:
        return None

    get_item_groups = _child_setter("Item Group", result)
    get_customer_groups = _child_setter("Customer Group", result)

    def set_children(row):
        name = row.get("name")
        return merge(
            row,
            {
                "item_groups": get_item_groups(name),
                "customer_groups": get_customer_groups(name),
            },
        )

    default_profile = excepts(StopIteration, first, lambda _: None)(
        [x.get("parent") for x in allowed if x.get("default")]
    )

    def set_default_profile(row):
        return merge(
            row, {"is_default": True} if row.get("name") == default_profile else {}
        )

    make_result = compose(set_default_profile, set_children)

    return [make_result(x) for x in result]


def _child_setter(doctype, result):
    groups = groupby(
        "parent",
        frappe.db.sql(
            """
                SELECT parent, {field} AS group_name FROM `tabPOS {doctype}`
                WHERE parent IN %(parents)s
            """.format(
                field=doctype.lower().replace(" ", "_"), doctype=doctype
            ),
            values={"parents": [x.get("name") for x in result]},
            as_dict=1,
        ),
    )

    def fn(name):
        return [x.get("group_name") for x in groups.get(name, [])]

    return fn

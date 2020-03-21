# -*- coding: utf-8 -*-
from __future__ import unicode_literals
import frappe
from functools import partial
from toolz import compose, merge, groupby, first, excepts, keyfilter

from posw.api.constants.cache_columns import get_columns
from posw.api.utils import query_string, get_where, get_values


def get_pos_profiles(cursor, modified, limit):
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
        query_string.format(
            columns=", ".join(columns),
            table=table,
            where=get_where(cursor, modified, limit, more=["name IN %(names)s"]),
        ),
        values=get_values(cursor, modified, limit, more={"names": parents}),
        as_dict=1,
    )

    if not result:
        return None

    def child_setter(doctype):
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

    get_item_groups = child_setter("Item Group")
    get_customer_groups = child_setter("Customer Group")

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


def get_item_tax_templates(cursor, modified, limit):
    table, columns = get_columns("Item Tax Template")
    result = frappe.db.sql(
        query_string.format(
            columns=", ".join(columns),
            table=table,
            where=get_where(cursor, modified, limit),
        ),
        values=get_values(cursor, modified, limit),
        as_dict=1,
    )

    if not result:
        return None

    details = groupby(
        "parent",
        frappe.db.sql(
            """
                SELECT parent, tax_type, tax_rate
                FROM `tabItem Tax Template Detail`
                WHERE parent IN %(parents)s
            """,
            values={"parents": [x.get("name") for x in result]},
            as_dict=1,
        ),
    )

    pick_keys = partial(keyfilter, lambda x: x in ["tax_type", "tax_rate"])

    def set_children(row):
        name = row.get("name")
        return merge(row, {"taxes": [pick_keys(x) for x in details.get(name, [])]})

    return [set_children(x) for x in result]

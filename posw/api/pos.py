# -*- coding: utf-8 -*-
from __future__ import unicode_literals
import frappe
from toolz import concatv, compose

from posw.api.constants.cache_columns import get_columns


@frappe.whitelist()
def background_fetch(doctype, cursor=None, modified=None, limit=100):
    table, columns = get_columns(doctype)
    lim = frappe.utils.cint(limit)

    if not table or lim < 1:
        return None

    def _get_where():
        if not cursor and not modified:
            return ""
        clauses = concatv(
            ["name >= %(name)s"] if cursor else [],
            ["modified >= %(modified)s"] if modified else [],
        )
        return "WHERE {}".format(" AND ".join(clauses))

    get_dbtime = compose(
        frappe.utils.convert_utc_to_user_timezone,
        frappe.utils.get_datetime,
        frappe.utils.get_datetime_str,
    )
    where = _get_where()
    result = frappe.db.sql(
        """
            SELECT {columns} FROM `{table}` {where} ORDER BY name LIMIT %(limit)s
        """.format(
            columns=", ".join(columns), table=table, where=where
        ),
        values={
            "name": cursor,
            "modified": get_dbtime(modified) if modified else None,
            "limit": lim + 1,
        },
        as_dict=1,
    )

    if not result:
        return None

    next = result[-1].get("name") if len(result) > lim else None
    data = result[:-1] if next else result
    return {
        "next": next,
        "contains": len(data),
        "after": modified,
        "data": data,
    }

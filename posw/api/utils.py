from toolz import concatv, compose, merge


query_string = "SELECT {columns} FROM `{table}` {where} ORDER BY name LIMIT %(limit)s"


def get_where(cursor, modified, limit, more=None):
    join_clauses = compose(lambda x: " AND ".join(x), concatv)
    clauses = join_clauses(
        ["name >= %(name)s"] if cursor else [],
        ["modified >= %(modified)s"] if modified else [],
        more or [],
    )
    return "WHERE {}".format(clauses) if clauses else ""


def get_values(cursor, modified, limit, more=None):
    values = merge(
        {"name": cursor, "modified": modified, "limit": limit + 1}, more or {}
    )
    return values

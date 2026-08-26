import math
from typing import Any
from uuid import UUID

from psycopg import Connection

from backend.app.schemas.transaction import TransactionFilters


SORT_COLUMNS = {
    "date": "t.occurred_at",
    "amount": "t.amount",
}


def get_demo_user_id(
    connection: Connection,
) -> UUID | None:
    row = connection.execute(
        """
        SELECT id
        FROM users
        ORDER BY created_at ASC
        LIMIT 1
        """
    ).fetchone()

    return row["id"] if row else None


def build_filter_query(
    user_id: UUID,
    filters: TransactionFilters,
) -> tuple[str, list[Any]]:
    clauses = ["t.user_id = %s"]
    parameters: list[Any] = [user_id]

    if filters.search:
        clauses.append("t.merchant ILIKE %s")
        parameters.append(f"%{filters.search.strip()}%")

    if filters.category:
        clauses.append("t.category = %s")
        parameters.append(filters.category)

    if filters.status:
        clauses.append("t.status = %s")
        parameters.append(filters.status)

    if filters.date_from:
        clauses.append("t.occurred_at >= %s")
        parameters.append(filters.date_from)

    if filters.date_to:
        clauses.append("t.occurred_at <= %s")
        parameters.append(filters.date_to)

    if filters.amount_min is not None:
        clauses.append("t.amount >= %s")
        parameters.append(filters.amount_min)

    if filters.amount_max is not None:
        clauses.append("t.amount <= %s")
        parameters.append(filters.amount_max)

    return " AND ".join(clauses), parameters


def get_transactions(
    connection: Connection,
    user_id: UUID,
    filters: TransactionFilters,
) -> dict[str, Any]:
    where_clause, parameters = build_filter_query(
        user_id,
        filters,
    )

    count_row = connection.execute(
        f"""
        SELECT COUNT(*) AS total
        FROM transactions t
        WHERE {where_clause}
        """,
        parameters,
    ).fetchone()

    total_items = count_row["total"]

    sort_column = SORT_COLUMNS[filters.sort_by]
    sort_direction = filters.sort_order.upper()

    offset = (filters.page - 1) * filters.page_size

    query_parameters = [
        *parameters,
        filters.page_size,
        offset,
    ]

    rows = connection.execute(
        f"""
        SELECT
            t.id,
            t.transaction_id,
            t.occurred_at,
            t.merchant,
            t.category,
            t.amount,
            t.currency,
            t.status,
            t.payment_method,
            t.is_refund,
            t.reward_coins
        FROM transactions t
        WHERE {where_clause}
        ORDER BY
            {sort_column} {sort_direction},
            t.id {sort_direction}
        LIMIT %s
        OFFSET %s
        """,
        query_parameters,
    ).fetchall()

    total_pages = (
        math.ceil(total_items / filters.page_size)
        if total_items
        else 0
    )

    return {
        "items": rows,
        "pagination": {
            "page": filters.page,
            "page_size": filters.page_size,
            "total_items": total_items,
            "total_pages": total_pages,
        },
    }


def get_transaction_by_id(
    connection: Connection,
    user_id: UUID,
    transaction_id: int,
) -> dict[str, Any] | None:
    return connection.execute(
        """
        SELECT
            t.id,
            t.transaction_id,
            t.occurred_at,
            t.merchant,
            t.category,
            t.amount,
            t.currency,
            t.status,
            t.payment_method,
            t.is_refund,
            t.reward_coins
        FROM transactions t
        WHERE t.id = %s
          AND t.user_id = %s
        """,
        (
            transaction_id,
            user_id,
        ),
    ).fetchone()


def get_transaction_metadata(
    connection: Connection,
    user_id: UUID,
) -> dict[str, Any]:
    category_rows = connection.execute(
        """
        SELECT DISTINCT category
        FROM transactions
        WHERE user_id = %s
        ORDER BY category ASC
        """,
        (user_id,),
    ).fetchall()

    status_rows = connection.execute(
        """
        SELECT DISTINCT status
        FROM transactions
        WHERE user_id = %s
        ORDER BY status ASC
        """,
        (user_id,),
    ).fetchall()

    limits = connection.execute(
        """
        SELECT
            MIN(amount) AS minimum_amount,
            MAX(amount) AS maximum_amount,
            MIN(occurred_at) AS earliest_date,
            MAX(occurred_at) AS latest_date
        FROM transactions
        WHERE user_id = %s
        """,
        (user_id,),
    ).fetchone()

    return {
        "categories": [
            row["category"]
            for row in category_rows
        ],
        "statuses": [
            row["status"]
            for row in status_rows
        ],
        **limits,
    }
from typing import Any
from uuid import UUID

from psycopg import Connection


def get_category_analytics(
    connection: Connection,
    user_id: UUID,
) -> dict[str, Any]:
    rows = connection.execute(
        """
        WITH category_totals AS (
            SELECT
                category,
                SUM(amount) AS total_amount,
                COUNT(*) AS transaction_count
            FROM transactions
            WHERE user_id = %s
              AND status = 'SUCCESS'
              AND amount > 0
            GROUP BY category
        ),
        overall AS (
            SELECT COALESCE(
                SUM(total_amount),
                0
            ) AS total_spending
            FROM category_totals
        )
        SELECT
            ct.category,
            ct.total_amount,
            ct.transaction_count,
            ROUND(
                (
                    ct.total_amount /
                    NULLIF(o.total_spending, 0)
                ) * 100,
                2
            ) AS percentage,
            o.total_spending
        FROM category_totals ct
        CROSS JOIN overall o
        ORDER BY ct.total_amount DESC
        """,
        (user_id,),
    ).fetchall()

    if not rows:
        return {
            "items": [],
            "total_spending": 0,
        }

    return {
        "items": [
            {
                "category": row["category"],
                "total_amount": row["total_amount"],
                "transaction_count": row[
                    "transaction_count"
                ],
                "percentage": row["percentage"],
            }
            for row in rows
        ],
        "total_spending": rows[0]["total_spending"],
    }
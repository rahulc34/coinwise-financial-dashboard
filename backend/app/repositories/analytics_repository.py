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

def get_analytics_summary(
    connection: Connection,
    user_id: UUID,
) -> dict[str, Any]:
    summary = connection.execute(
        """
        SELECT
            COALESCE(
                SUM(amount) FILTER (
                    WHERE status = 'SUCCESS'
                      AND amount > 0
                ),
                0
            ) AS total_spending,
            COUNT(*) AS transaction_count,
            COUNT(*) FILTER (
                WHERE status = 'SUCCESS'
            ) AS successful_count,
            ROUND(
                (
                    COUNT(*) FILTER (
                        WHERE status = 'SUCCESS'
                    )::NUMERIC /
                    NULLIF(COUNT(*), 0)
                ) * 100,
                2
            ) AS success_rate
        FROM transactions
        WHERE user_id = %s
        """,
        (user_id,),
    ).fetchone()

    top_category = connection.execute(
        """
        SELECT category
        FROM transactions
        WHERE user_id = %s
          AND status = 'SUCCESS'
          AND amount > 0
        GROUP BY category
        ORDER BY SUM(amount) DESC
        LIMIT 1
        """,
        (user_id,),
    ).fetchone()

    return {
        "total_spending": summary["total_spending"],
        "transaction_count": summary[
            "transaction_count"
        ],
        "successful_count": summary[
            "successful_count"
        ],
        "success_rate": summary["success_rate"] or 0,
        "top_category": (
            top_category["category"]
            if top_category
            else None
        ),
    }
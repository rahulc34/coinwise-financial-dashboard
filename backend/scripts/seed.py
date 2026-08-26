import json
import os
from pathlib import Path

import psycopg
from dotenv import load_dotenv

from backend.app.core.normalization import (
    NormalizationError,
    normalize_transaction,
)


PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATA_FILE = PROJECT_ROOT / "data" / "transactions.json"
SCHEMA_FILE = PROJECT_ROOT / "backend" / "app" / "db" / "schema.sql"

load_dotenv(PROJECT_ROOT / ".env")


REWARDS = [
    {
        "name": "₹50 Cashback",
        "description": "Receive ₹50 cashback on your next bill payment.",
        "coin_cost": 100,
        "reward_type": "CASHBACK",
        "reward_value": 50,
    },
    {
        "name": "₹100 Amazon Voucher",
        "description": "A ₹100 Amazon shopping voucher.",
        "coin_cost": 200,
        "reward_type": "VOUCHER",
        "reward_value": 100,
    },
    {
        "name": "₹150 Food Voucher",
        "description": "Save ₹150 on your next food order.",
        "coin_cost": 300,
        "reward_type": "VOUCHER",
        "reward_value": 150,
    },
    {
        "name": "₹250 Travel Voucher",
        "description": "A ₹250 voucher for your next trip.",
        "coin_cost": 500,
        "reward_type": "VOUCHER",
        "reward_value": 250,
    },
    {
        "name": "₹500 Premium Cashback",
        "description": "Receive ₹500 cashback on your credit-card bill.",
        "coin_cost": 1000,
        "reward_type": "CASHBACK",
        "reward_value": 500,
    },
]


def load_transactions() -> list[dict]:
    with DATA_FILE.open("r", encoding="utf-8") as file:
        transactions = json.load(file)

    if not isinstance(transactions, list):
        raise ValueError(
            "transactions.json must contain a JSON array"
        )

    return transactions


def main() -> None:
    database_url = os.getenv("DATABASE_URL")

    if not database_url:
        raise RuntimeError(
            "DATABASE_URL is missing from the .env file"
        )

    schema_sql = SCHEMA_FILE.read_text(encoding="utf-8")
    raw_transactions = load_transactions()

    normalized_transactions = []
    rejected_rows = []

    for index, transaction in enumerate(
        raw_transactions,
        start=1,
    ):
        try:
            normalized_transactions.append(
                normalize_transaction(
                    transaction,
                    source_row_number=index,
                )
            )
        except NormalizationError as error:
            rejected_rows.append(
                {
                    "row": index,
                    "transaction_id": transaction.get("id"),
                    "reason": str(error),
                }
            )

    with psycopg.connect(database_url) as connection:
        with connection.cursor() as cursor:
            # Create all database tables and indexes.
            cursor.execute(schema_sql)

            # Make the seed repeatable.
            cursor.execute(
                """
                TRUNCATE TABLE
                    redemptions,
                    reward_wallets,
                    transactions,
                    rewards,
                    users
                RESTART IDENTITY CASCADE
                """
            )

            cursor.execute(
                """
                INSERT INTO users (name, email)
                VALUES (%s, %s)
                RETURNING id
                """,
                (
                    "Rahul Chaurasiya",
                    "rahul@example.com",
                ),
            )

            user_id = cursor.fetchone()[0]

            transaction_values = [
                (
                    user_id,
                    transaction["transaction_id"],
                    transaction["occurred_at"],
                    transaction["merchant"],
                    transaction["category"],
                    transaction["amount"],
                    transaction["currency"],
                    transaction["status"],
                    transaction["payment_method"],
                    transaction["is_refund"],
                    transaction["source_row_number"],
                )
                for transaction in normalized_transactions
            ]

            cursor.executemany(
                """
                INSERT INTO transactions (
                    user_id,
                    transaction_id,
                    occurred_at,
                    merchant,
                    category,
                    amount,
                    currency,
                    status,
                    payment_method,
                    is_refund,
                    source_row_number
                )
                VALUES (
                    %s, %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s
                )
                """,
                transaction_values,
            )

            reward_values = [
                (
                    reward["name"],
                    reward["description"],
                    reward["coin_cost"],
                    reward["reward_type"],
                    reward["reward_value"],
                )
                for reward in REWARDS
            ]

            cursor.executemany(
                """
                INSERT INTO rewards (
                    name,
                    description,
                    coin_cost,
                    reward_type,
                    reward_value
                )
                VALUES (%s, %s, %s, %s, %s)
                """,
                reward_values,
            )

            cursor.execute(
                """
                SELECT COALESCE(SUM(reward_coins), 0)
                FROM transactions
                WHERE user_id = %s
                """,
                (user_id,),
            )

            initial_coin_balance = cursor.fetchone()[0]

            cursor.execute(
                """
                INSERT INTO reward_wallets (
                    user_id,
                    coin_balance
                )
                VALUES (%s, %s)
                """,
                (
                    user_id,
                    initial_coin_balance,
                ),
            )

        connection.commit()

    print("\n=== DATABASE SEED COMPLETE ===")
    print(f"Source rows: {len(raw_transactions)}")
    print(
        f"Inserted transactions: "
        f"{len(normalized_transactions)}"
    )
    print(f"Rejected rows: {len(rejected_rows)}")
    print(f"Rewards inserted: {len(REWARDS)}")
    print(f"Initial coin balance: {initial_coin_balance}")

    if rejected_rows:
        print("\nRejected transaction rows:")

        for rejected in rejected_rows:
            print(
                f"Row {rejected['row']} "
                f"({rejected['transaction_id']}): "
                f"{rejected['reason']}"
            )


if __name__ == "__main__":
    main()
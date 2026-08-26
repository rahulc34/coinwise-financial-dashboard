from typing import Any
from uuid import UUID

from psycopg import Connection


def get_wallet(
    connection: Connection,
    user_id: UUID,
) -> dict[str, Any] | None:
    return connection.execute(
        """
        SELECT
            id,
            user_id,
            coin_balance,
            updated_at
        FROM reward_wallets
        WHERE user_id = %s
        """,
        (user_id,),
    ).fetchone()


def get_wallet_for_update(
    connection: Connection,
    user_id: UUID,
) -> dict[str, Any] | None:
    return connection.execute(
        """
        SELECT
            id,
            user_id,
            coin_balance,
            updated_at
        FROM reward_wallets
        WHERE user_id = %s
        FOR UPDATE
        """,
        (user_id,),
    ).fetchone()


def get_active_rewards(
    connection: Connection,
) -> list[dict[str, Any]]:
    return connection.execute(
        """
        SELECT
            id,
            name,
            description,
            coin_cost,
            reward_type,
            reward_value,
            is_active
        FROM rewards
        WHERE is_active = TRUE
        ORDER BY coin_cost ASC
        """
    ).fetchall()


def get_reward_by_id(
    connection: Connection,
    reward_id: UUID,
) -> dict[str, Any] | None:
    return connection.execute(
        """
        SELECT
            id,
            name,
            description,
            coin_cost,
            reward_type,
            reward_value,
            is_active
        FROM rewards
        WHERE id = %s
        """,
        (reward_id,),
    ).fetchone()


def update_wallet_balance(
    connection: Connection,
    wallet_id: UUID,
    new_balance: int,
) -> dict[str, Any]:
    return connection.execute(
        """
        UPDATE reward_wallets
        SET
            coin_balance = %s,
            updated_at = NOW()
        WHERE id = %s
        RETURNING
            coin_balance,
            updated_at
        """,
        (
            new_balance,
            wallet_id,
        ),
    ).fetchone()


def create_redemption(
    connection: Connection,
    user_id: UUID,
    reward_id: UUID,
    coins_spent: int,
) -> dict[str, Any]:
    return connection.execute(
        """
        INSERT INTO redemptions (
            user_id,
            reward_id,
            coins_spent,
            status
        )
        VALUES (%s, %s, %s, 'COMPLETED')
        RETURNING
            id,
            status,
            redeemed_at
        """,
        (
            user_id,
            reward_id,
            coins_spent,
        ),
    ).fetchone()
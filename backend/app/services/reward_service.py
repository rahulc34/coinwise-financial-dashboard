from typing import Any
from uuid import UUID

from psycopg import Connection

from backend.app.core.exceptions import ApplicationError
from backend.app.repositories.reward_repository import (
    create_redemption,
    get_active_rewards,
    get_reward_by_id,
    get_wallet,
    get_wallet_for_update,
    update_wallet_balance,
)
from backend.app.services.transaction_service import (
    require_demo_user_id,
)


def retrieve_balance(
    connection: Connection,
) -> dict[str, Any]:
    user_id = require_demo_user_id(connection)
    wallet = get_wallet(connection, user_id)

    if wallet is None:
        raise ApplicationError(
            message="Reward wallet not found.",
            status_code=404,
            code="WALLET_NOT_FOUND",
        )

    return {
        "coin_balance": wallet["coin_balance"],
        "updated_at": wallet["updated_at"],
    }


def retrieve_catalogue(
    connection: Connection,
) -> dict[str, Any]:
    rewards = get_active_rewards(connection)

    return {
        "items": rewards,
    }


def redeem_reward(
    connection: Connection,
    reward_id: UUID,
) -> dict[str, Any]:
    user_id = require_demo_user_id(connection)

    with connection.transaction():
        reward = get_reward_by_id(
            connection,
            reward_id,
        )

        if reward is None:
            raise ApplicationError(
                message="Reward not found.",
                status_code=404,
                code="REWARD_NOT_FOUND",
            )

        if not reward["is_active"]:
            raise ApplicationError(
                message="This reward is no longer available.",
                status_code=409,
                code="REWARD_NOT_AVAILABLE",
            )

        wallet = get_wallet_for_update(
            connection,
            user_id,
        )

        if wallet is None:
            raise ApplicationError(
                message="Reward wallet not found.",
                status_code=404,
                code="WALLET_NOT_FOUND",
            )

        coin_cost = reward["coin_cost"]
        current_balance = wallet["coin_balance"]

        if current_balance < coin_cost:
            raise ApplicationError(
                message=(
                    f"This reward requires {coin_cost} coins, "
                    f"but your balance is {current_balance}."
                ),
                status_code=409,
                code="INSUFFICIENT_COINS",
                details={
                    "required_coins": coin_cost,
                    "available_coins": current_balance,
                },
            )

        new_balance = current_balance - coin_cost

        update_wallet_balance(
            connection,
            wallet["id"],
            new_balance,
        )

        redemption = create_redemption(
            connection,
            user_id,
            reward["id"],
            coin_cost,
        )

    return {
        "redemption_id": redemption["id"],
        "reward_id": reward["id"],
        "reward_name": reward["name"],
        "coins_spent": coin_cost,
        "remaining_balance": new_balance,
        "status": redemption["status"],
        "redeemed_at": redemption["redeemed_at"],
    }
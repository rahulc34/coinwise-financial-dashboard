from typing import Annotated

from fastapi import APIRouter, Depends, status
from psycopg import Connection

from backend.app.db.connection import get_database_connection
from backend.app.schemas.reward import (
    RedeemRewardRequest,
    RedemptionResponse,
    RewardCatalogueResponse,
    WalletBalanceResponse,
)
from backend.app.services.reward_service import (
    redeem_reward,
    retrieve_balance,
    retrieve_catalogue,
)


router = APIRouter(
    prefix="/rewards",
    tags=["Rewards"],
)


@router.get(
    "/balance",
    response_model=WalletBalanceResponse,
)
def get_balance(
    connection: Annotated[
        Connection,
        Depends(get_database_connection),
    ],
) -> WalletBalanceResponse:
    result = retrieve_balance(connection)

    return WalletBalanceResponse(**result)


@router.get(
    "/catalogue",
    response_model=RewardCatalogueResponse,
)
def get_catalogue(
    connection: Annotated[
        Connection,
        Depends(get_database_connection),
    ],
) -> RewardCatalogueResponse:
    result = retrieve_catalogue(connection)

    return RewardCatalogueResponse(**result)


@router.post(
    "/redeem",
    response_model=RedemptionResponse,
    status_code=status.HTTP_201_CREATED,
)
def redeem(
    request: RedeemRewardRequest,
    connection: Annotated[
        Connection,
        Depends(get_database_connection),
    ],
) -> RedemptionResponse:
    result = redeem_reward(
        connection,
        request.reward_id,
    )

    return RedemptionResponse(**result)
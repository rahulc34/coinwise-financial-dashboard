from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel


class WalletBalanceResponse(BaseModel):
    coin_balance: int
    updated_at: datetime


class RewardResponse(BaseModel):
    id: UUID
    name: str
    description: str
    coin_cost: int
    reward_type: str
    reward_value: Decimal
    is_active: bool


class RewardCatalogueResponse(BaseModel):
    items: list[RewardResponse]


class RedeemRewardRequest(BaseModel):
    reward_id: UUID


class RedemptionResponse(BaseModel):
    redemption_id: UUID
    reward_id: UUID
    reward_name: str
    coins_spent: int
    remaining_balance: int
    status: str
    redeemed_at: datetime
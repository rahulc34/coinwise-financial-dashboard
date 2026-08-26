from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field


TransactionStatus = Literal[
    "SUCCESS",
    "FAILED",
    "PENDING",
]

TransactionSortField = Literal[
    "date",
    "amount",
]

SortDirection = Literal[
    "asc",
    "desc",
]


class TransactionResponse(BaseModel):
    id: int
    transaction_id: str
    occurred_at: datetime
    merchant: str
    category: str
    amount: Decimal
    currency: str
    status: str
    payment_method: str
    is_refund: bool
    reward_coins: int


class PaginationResponse(BaseModel):
    page: int
    page_size: int
    total_items: int
    total_pages: int


class TransactionListResponse(BaseModel):
    items: list[TransactionResponse]
    pagination: PaginationResponse


class TransactionFilters(BaseModel):
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=50, ge=1, le=100)

    search: str | None = None
    category: str | None = None
    status: TransactionStatus | None = None

    date_from: datetime | None = None
    date_to: datetime | None = None

    amount_min: Decimal | None = None
    amount_max: Decimal | None = None

    sort_by: TransactionSortField = "date"
    sort_order: SortDirection = "desc"


class TransactionMetadataResponse(BaseModel):
    categories: list[str]
    statuses: list[str]
    minimum_amount: Decimal
    maximum_amount: Decimal
    earliest_date: datetime
    latest_date: datetime
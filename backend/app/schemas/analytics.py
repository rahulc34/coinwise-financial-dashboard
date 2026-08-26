from decimal import Decimal

from pydantic import BaseModel


class CategorySpend(BaseModel):
    category: str
    total_amount: Decimal
    transaction_count: int
    percentage: Decimal


class CategoryAnalyticsResponse(BaseModel):
    items: list[CategorySpend]
    total_spending: Decimal
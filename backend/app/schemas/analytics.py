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

class AnalyticsSummaryResponse(BaseModel):
    total_spending: Decimal
    transaction_count: int
    successful_count: int
    success_rate: Decimal
    top_category: str | None
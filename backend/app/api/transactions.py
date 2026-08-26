from datetime import datetime
from decimal import Decimal
from typing import Annotated, Literal

from fastapi import APIRouter, Depends, Query
from psycopg import Connection

from backend.app.db.connection import get_database_connection
from backend.app.schemas.transaction import (
    TransactionFilters,
    TransactionListResponse,
    TransactionMetadataResponse,
    TransactionResponse,
)
from backend.app.services.transaction_service import (
    list_transactions,
    retrieve_transaction,
    retrieve_transaction_metadata,
)


router = APIRouter(
    prefix="/transactions",
    tags=["Transactions"],
)


@router.get(
    "",
    response_model=TransactionListResponse,
)
def get_transaction_list(
    connection: Annotated[
        Connection,
        Depends(get_database_connection),
    ],
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 50,
    search: str | None = None,
    category: str | None = None,
    status: Literal[
        "SUCCESS",
        "FAILED",
        "PENDING",
    ] | None = None,
    date_from: datetime | None = None,
    date_to: datetime | None = None,
    amount_min: Decimal | None = None,
    amount_max: Decimal | None = None,
    sort_by: Literal["date", "amount"] = "date",
    sort_order: Literal["asc", "desc"] = "desc",
) -> TransactionListResponse:
    filters = TransactionFilters(
        page=page,
        page_size=page_size,
        search=search,
        category=category,
        status=status,
        date_from=date_from,
        date_to=date_to,
        amount_min=amount_min,
        amount_max=amount_max,
        sort_by=sort_by,
        sort_order=sort_order,
    )

    result = list_transactions(
        connection,
        filters,
    )

    return TransactionListResponse(**result)


@router.get(
    "/meta",
    response_model=TransactionMetadataResponse,
)
def get_metadata(
    connection: Annotated[
        Connection,
        Depends(get_database_connection),
    ],
) -> TransactionMetadataResponse:
    result = retrieve_transaction_metadata(connection)

    return TransactionMetadataResponse(**result)


@router.get(
    "/{transaction_id}",
    response_model=TransactionResponse,
)
def get_transaction_detail(
    transaction_id: int,
    connection: Annotated[
        Connection,
        Depends(get_database_connection),
    ],
) -> TransactionResponse:
    result = retrieve_transaction(
        connection,
        transaction_id,
    )

    return TransactionResponse(**result)
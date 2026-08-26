from typing import Any

from psycopg import Connection

from backend.app.core.exceptions import ApplicationError
from backend.app.repositories.transaction_repository import (
    get_demo_user_id,
    get_transaction_by_id,
    get_transaction_metadata,
    get_transactions,
)
from backend.app.schemas.transaction import TransactionFilters


def require_demo_user_id(connection: Connection):
    user_id = get_demo_user_id(connection)

    if user_id is None:
        raise ApplicationError(
            message="The demo user has not been seeded.",
            status_code=500,
            code="DEMO_USER_NOT_FOUND",
        )

    return user_id


def list_transactions(
    connection: Connection,
    filters: TransactionFilters,
) -> dict[str, Any]:
    user_id = require_demo_user_id(connection)

    if (
        filters.amount_min is not None
        and filters.amount_max is not None
        and filters.amount_min > filters.amount_max
    ):
        raise ApplicationError(
            message="Minimum amount cannot exceed maximum amount.",
            status_code=422,
            code="INVALID_AMOUNT_RANGE",
        )

    if (
        filters.date_from is not None
        and filters.date_to is not None
        and filters.date_from > filters.date_to
    ):
        raise ApplicationError(
            message="Start date cannot be later than end date.",
            status_code=422,
            code="INVALID_DATE_RANGE",
        )

    return get_transactions(
        connection,
        user_id,
        filters,
    )


def retrieve_transaction(
    connection: Connection,
    transaction_id: int,
) -> dict[str, Any]:
    user_id = require_demo_user_id(connection)

    transaction = get_transaction_by_id(
        connection,
        user_id,
        transaction_id,
    )

    if transaction is None:
        raise ApplicationError(
            message="Transaction not found.",
            status_code=404,
            code="TRANSACTION_NOT_FOUND",
        )

    return transaction


def retrieve_transaction_metadata(
    connection: Connection,
) -> dict[str, Any]:
    user_id = require_demo_user_id(connection)

    return get_transaction_metadata(
        connection,
        user_id,
    )
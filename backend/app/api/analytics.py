from typing import Annotated

from fastapi import APIRouter, Depends
from psycopg import Connection

from backend.app.db.connection import (
    get_database_connection,
)
from backend.app.schemas.analytics import (
    CategoryAnalyticsResponse,
)
from backend.app.services.analytics_service import (
    retrieve_category_analytics,
)


router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"],
)


@router.get(
    "/categories",
    response_model=CategoryAnalyticsResponse,
)
def get_categories(
    connection: Annotated[
        Connection,
        Depends(get_database_connection),
    ],
) -> CategoryAnalyticsResponse:
    result = retrieve_category_analytics(connection)

    return CategoryAnalyticsResponse(**result)
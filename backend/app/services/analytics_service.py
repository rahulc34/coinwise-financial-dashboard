from typing import Any

from psycopg import Connection

from backend.app.repositories.analytics_repository import (
    get_category_analytics,
)
from backend.app.services.transaction_service import (
    require_demo_user_id,
)


def retrieve_category_analytics(
    connection: Connection,
) -> dict[str, Any]:
    user_id = require_demo_user_id(connection)

    return get_category_analytics(
        connection,
        user_id,
    )
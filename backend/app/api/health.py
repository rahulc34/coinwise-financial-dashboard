from typing import Annotated

from fastapi import APIRouter, Depends
from psycopg import Connection
from pydantic import BaseModel

from backend.app.db.connection import get_database_connection


router = APIRouter(
    prefix="/health",
    tags=["Health"],
)


class HealthResponse(BaseModel):
    status: str
    database: str


@router.get(
    "",
    response_model=HealthResponse,
)
def check_health(
    connection: Annotated[
        Connection,
        Depends(get_database_connection),
    ],
) -> HealthResponse:
    connection.execute("SELECT 1")

    return HealthResponse(
        status="healthy",
        database="connected",
    )
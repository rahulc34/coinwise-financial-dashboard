from collections.abc import Generator

from psycopg import Connection
from psycopg.rows import dict_row
from psycopg_pool import ConnectionPool

from backend.app.core.config import settings


pool = ConnectionPool(
    conninfo=settings.database_url,
    min_size=settings.database_pool_min_size,
    max_size=settings.database_pool_max_size,
    open=False,
    kwargs={
        "row_factory": dict_row,
    },
)


def open_database_pool() -> None:
    pool.open()
    pool.wait()


def close_database_pool() -> None:
    pool.close()


def get_database_connection() -> Generator[Connection, None, None]:
    with pool.connection() as connection:
        yield connection
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.api.router import api_router
from backend.app.core.config import settings
from backend.app.core.error_handlers import register_error_handlers
from backend.app.db.connection import (
    close_database_pool,
    open_database_pool,
)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    open_database_pool()

    yield

    close_database_pool()


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    debug=settings.debug,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_error_handlers(app)
app.include_router(api_router)


@app.get("/", tags=["Root"])
def root() -> dict[str, str]:
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "docs": "/docs",
    }
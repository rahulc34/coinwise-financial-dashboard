from fastapi import APIRouter

from backend.app.api.analytics import (
    router as analytics_router,
)
from backend.app.api.health import router as health_router
from backend.app.api.rewards import router as rewards_router
from backend.app.api.transactions import (
    router as transactions_router,
)


api_router = APIRouter(prefix="/api")

api_router.include_router(health_router)
api_router.include_router(transactions_router)
api_router.include_router(rewards_router)
api_router.include_router(analytics_router)
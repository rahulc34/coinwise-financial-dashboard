from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


PROJECT_ROOT = Path(__file__).resolve().parents[3]


class Settings(BaseSettings):
    app_name: str = "Coinwise API"
    app_version: str = "1.0.0"
    environment: str = "development"
    debug: bool = False

    database_url: str
    frontend_url: str = "http://localhost:5173"

    database_pool_min_size: int = 1
    database_pool_max_size: int = 10

    model_config = SettingsConfigDict(
        env_file=PROJECT_ROOT / ".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    APP_ENV: str = "dev"
    API_PORT: int = 8001
    SECRET_KEY: str = "dev-secret"
    # accept comma-separated list in env; exposed as list
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:5174"
    ADMIN_API_KEY: str = "dev-admin-key"
    # optional database URL (Postgres in docker-compose). kept here for discoverability
    DATABASE_URL: str | None = None
    OPENAI_API_KEY: str | None = None
    GOOGLE_API_KEY: str | None = None
    ANTHROPIC_API_KEY: str | None = None
    REDIS_URL: str | None = None
    vite_api_base_url: str = "http://localhost:8001"

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()

# Helper: parse CORS origins into list for FastAPI
def get_cors_origins() -> List[str]:
    raw = settings.CORS_ORIGINS
    if isinstance(raw, str):
        return [o.strip() for o in raw.split(",") if o.strip()]
    return raw

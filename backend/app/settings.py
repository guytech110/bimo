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
    # Public dashboard URL (used to construct device verification/signup links)
    DASHBOARD_URL: str = "https://bimo-platform.vercel.app"

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()

# Safety: some deployment UIs accidentally include the env var name in the value
# (e.g. "DASHBOARD_URL=https://..."), sanitize by removing a possible
# leading "DASHBOARD_URL=" and trimming whitespace so redirects work.
try:
    if isinstance(settings.DASHBOARD_URL, str) and settings.DASHBOARD_URL.startswith("DASHBOARD_URL="):
        settings.DASHBOARD_URL = settings.DASHBOARD_URL.split("=", 1)[1].strip()
    # also trim accidental surrounding whitespace
    if isinstance(settings.DASHBOARD_URL, str):
        settings.DASHBOARD_URL = settings.DASHBOARD_URL.strip()
except Exception:
    pass

# Helper: parse CORS origins into list for FastAPI
def get_cors_origins() -> List[str]:
    raw = settings.CORS_ORIGINS
    origins: List[str]
    if isinstance(raw, str):
        origins = [o.strip() for o in raw.split(",") if o.strip()]
    else:
        origins = list(raw)
    # Always include DASHBOARD_URL host to prevent production CORS failures
    try:
        dash = settings.DASHBOARD_URL.strip()
        if dash and dash not in origins:
            origins.append(dash)
    except Exception:
        pass
    return origins

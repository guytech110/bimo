from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from .settings import settings, get_cors_origins

# Import routers that exist; some are optional in this trimmed repo
try:
    from .routers import health, providers, spend, admin
except Exception:
    # Fall back to empty placeholders if routers are missing during tests
    health = providers = spend = admin = None  # type: ignore

import importlib
import traceback as _trace

# Import optional routers individually so a failure in one doesn't disable others
def _import_router(name: str):
    try:
        module = importlib.import_module(f"app.routers.{name}")
        return module
    except Exception as e:
        # Print stack to logs so deployment errors are visible in Render logs
        print(f">>> Failed to import router '{name}': {e}")
        print(_trace.format_exc())
        return None

recommendations = _import_router('recommendations')
cli = _import_router('cli')
env = _import_router('env')
gateway = _import_router('gateway')
auth = _import_router('auth')
# If the full auth router failed to import (e.g. missing optional deps in prod),
# try to import a lightweight fallback router that provides /v1/auth endpoints
# so the signup/login flows used by the dashboard can work until full auth is
# restored. This keeps production available while we fix upstream issues.
if auth is None:
    try:
        import importlib
        auth = importlib.import_module('app.routers.auth_fallback')
    except Exception:
        auth = None
from .db_sa import engine, Base
import os

ENABLE_RATE_LIMIT = os.getenv("ENABLE_RATE_LIMIT", "false").lower() == "true"
if ENABLE_RATE_LIMIT:
    try:
        from slowapi import Limiter
        from slowapi.util import get_remote_address
        from slowapi.errors import RateLimitExceeded
    except Exception:
        ENABLE_RATE_LIMIT = False

app = FastAPI(
    title="bimo API",
    version="1.0.0",
    openapi_url="/v1/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)


from fastapi.responses import JSONResponse
from fastapi.exceptions import HTTPException as FastAPIHTTPException


@app.exception_handler(FastAPIHTTPException)
async def http_exception_handler(request: Request, exc: FastAPIHTTPException):
    """Return a stable JSON error shape for raised HTTPExceptions."""
    # Build canonical error payload
    detail = exc.detail if exc.detail is not None else ""
    code = None
    message = None
    details = {}

    # If detail is a dict with fields, respect them
    if isinstance(detail, dict):
        code = detail.get('code') or detail.get('error_code')
        message = detail.get('message') or detail.get('detail') or str(detail)
        details = detail.get('details') or {}
    else:
        message = str(detail)

    if not code:
        code = f"HTTP_{exc.status_code}"

    payload = {"error": {"code": code, "message": message, "details": details}}
    return JSONResponse(status_code=exc.status_code, content=payload)


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    """Catch-all handler to ensure stable JSON error shape for unexpected errors."""
    # Avoid leaking internal details in production
    import traceback as _tb
    tb = _tb.format_exc()
    # In dev, include trace in details; otherwise empty
    details = {"trace": tb} if settings.APP_ENV == 'dev' else {}
    payload = {"error": {"code": "INTERNAL_ERROR", "message": "internal server error", "details": details}}
    return JSONResponse(status_code=500, content=payload)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if ENABLE_RATE_LIMIT:
    limiter = Limiter(key_func=get_remote_address)
    @app.middleware("http")
    async def rate_limit_middleware(request, call_next):
        try:
            # default limit, can be refined per-route later
            with limiter.limit("100/minute"):
                response = await call_next(request)
                return response
        except Exception:
            return await call_next(request)

if health is not None:
    app.include_router(health.router, prefix="/v1")
if providers is not None:
    app.include_router(providers.router, prefix="/v1")
if spend is not None:
    app.include_router(spend.router, prefix="/v1")
if admin is not None:
    app.include_router(admin.router, prefix="/v1")
if recommendations is not None:
    app.include_router(recommendations.router, prefix="/v1")
if cli is not None:
    app.include_router(cli.router, prefix="/v1")
if env is not None:
    app.include_router(env.router, prefix="/v1")
if gateway is not None:
    app.include_router(gateway.router, prefix="/v1")
if auth is not None:
    app.include_router(auth.router, prefix="/v1")


@app.on_event("startup")
def on_startup():
    # Run Alembic migrations to ensure all tables exist
    import subprocess
    import sys
    from pathlib import Path
    
    try:
        # Run alembic upgrade head from the backend directory where alembic.ini lives
        backend_dir = Path(__file__).resolve().parents[1]
        result = subprocess.run(
            [sys.executable, "-m", "alembic", "upgrade", "head"],
            cwd=backend_dir,
            capture_output=True,
            text=True,
            timeout=30
        )
        if result.returncode != 0:
            print(f"Warning: Alembic migration failed: {result.stderr}")
    except Exception as e:
        print(f"Warning: Could not run migrations: {e}")
        # Fallback: create tables if migrations fail (dev only)
        from .settings import settings
        if not settings.DATABASE_URL or settings.DATABASE_URL.startswith("sqlite"):
            Base.metadata.create_all(engine)

@app.middleware("http")
async def _metrics_middleware(request: Request, call_next):
    # Count requests and capture latency into Redis-backed histogram when available
    import time as _time
    from .routers.health import REQUEST_STATS, record_request
    REQUEST_STATS["total"] += 1
    start = _time.perf_counter()
    response = await call_next(request)
    try:
        elapsed_ms = (_time.perf_counter() - start) * 1000.0
        record_request(getattr(response, "status_code", 200) or 200, float(elapsed_ms))
    except Exception:
        pass
    return response


@app.middleware("http")
async def _gateway_logging_middleware(request: Request, call_next):
    """Non-invasive gateway logger: records source, method, path, status, and latency.

    This middleware intentionally avoids reading the request body to prevent
    interfering with downstream request handling. It infers `source` from
    headers (prefer `X-BIMO-SOURCE`) and defaults to `prod` for gateway paths.
    """
    path = request.url.path or ""
    # Only log gateway-related endpoints to reduce noise
    if not (path.startswith("/v1/gateway") or path == "/v1/optimize"):
        return await call_next(request)

    import time as _time
    import logging as _logging

    logger = _logging.getLogger("bimo.gateway")
    start = _time.perf_counter()
    response = await call_next(request)
    elapsed_ms = (_time.perf_counter() - start) * 1000.0

    try:
        status = getattr(response, "status_code", 200) or 200
        headers = request.headers
        source = headers.get("X-BIMO-SOURCE") or headers.get("Connection-Source") or headers.get("X-BIMO-CONNECTION-SOURCE") or "prod"

        # Structured log (logger can be configured to emit JSON)
        logger.info(
            "gateway_request",
            extra={
                "path": path,
                "method": request.method,
                "status": status,
                "latency_ms": float(elapsed_ms),
                "source": source,
            },
        )
    except Exception:
        # Don't let logging failures affect request flow
        pass

    # Record Prometheus metrics safely (no-op if prometheus_client not installed)
    try:
        from prometheus_client import Counter, Histogram
        _c = Counter('bimo_usage_requests_total', 'Total usage requests', ['path', 'method', 'source', 'status'])
        _h = Histogram('bimo_usage_request_latency_ms', 'Request latency ms', ['path', 'method', 'source'])
        _c.labels(path=path, method=request.method, source=source, status=str(status)).inc()
        _h.labels(path=path, method=request.method, source=source).observe(float(elapsed_ms))
    except Exception:
        pass

    return response

@app.get("/")
async def root():
    return {"service": "bimo-api", "version": "1.0.0"}

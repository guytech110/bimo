import time
import uuid
import logging
from typing import Callable
from starlette.types import ASGIApp, Receive, Scope, Send
from ..settings import settings
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import HTTPException
from starlette.requests import Request


class CorrelationIdMiddleware:
    def __init__(self, app: ASGIApp, header_name: str = "X-Correlation-ID") -> None:
        self.app = app
        self.header_name = header_name
        self.logger = logging.getLogger(__name__)

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope.get("type") != "http":
            await self.app(scope, receive, send)
            return

        start = time.perf_counter()
        # Accept inbound correlation ID or generate new one
        headers = dict(scope.get("headers", []))
        corr_id = headers.get(self.header_name.lower().encode("latin-1"))
        if corr_id:
            corr_id = corr_id.decode("latin-1")
        else:
            corr_id = str(uuid.uuid4())

        async def send_wrapper(event):
            if event["type"] == "http.response.start":
                headers = event.get("headers", [])
                headers.append((self.header_name.encode("latin-1"), corr_id.encode("latin-1")))
                event["headers"] = headers
            await send(event)

        try:
            # Basic API key RBAC: validate X-API-Key header if present and attach to scope
            headers = dict(scope.get("headers", []))
            api_key = headers.get(b'x-api-key') or headers.get(b'authorization')
            if api_key:
                try:
                    api_key = api_key.decode('latin-1').replace('Bearer ', '')
                    # resolve key to role from DB (best-effort)
                    from .db_sa import get_db
                    db = next(get_db())
                    from .models import ApiKey
                    rec = db.query(ApiKey).filter(ApiKey.key == api_key).first()
                    if rec:
                        # attach role and org to scope state for downstream use
                        scope.setdefault('extensions', {})['api_key_role'] = rec.role
                        scope.setdefault('extensions', {})['api_key_org'] = rec.org_id
                        scope.setdefault('extensions', {})['api_key_rate_limit'] = rec.rate_limit
                except Exception:
                    pass
            # Rate limiting: if enabled and a per-key limit exists, apply it
            rate_limit = scope.get('extensions', {}).get('api_key_rate_limit')
            if rate_limit and settings.APP_ENV != 'dev':
                try:
                    limiter = Limiter(key_func=get_remote_address)
                    # This is a best-effort synchronous check; slowapi normally decorates routes.
                    with limiter.limit(rate_limit):
                        await self.app(scope, receive, send_wrapper)
                except RateLimitExceeded:
                    # Convert to HTTP 429
                    response = { 'status': 'rate_limited' }
                    await send_wrapper({ 'type': 'http.response.start', 'status': 429, 'headers': [] })
                    await send_wrapper({ 'type': 'http.response.body', 'body': b'Rate limit exceeded' })
                except Exception:
                    await self.app(scope, receive, send_wrapper)
            else:
                await self.app(scope, receive, send_wrapper)
        finally:
            # Minimal structured log line
            elapsed_ms = round((time.perf_counter() - start) * 1000)
            method = scope.get("method")
            path = scope.get("path")
            self.logger.info(
                "request_completed",
                extra={
                    "correlation_id": corr_id,
                    "method": method,
                    "path": path,
                    "elapsed_ms": elapsed_ms,
                },
            )



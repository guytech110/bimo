from fastapi import APIRouter, Response, Request
from typing import Dict

router = APIRouter()

# Simple in-memory request stats used by middleware in dev
REQUEST_STATS: Dict[str, int] = {"total": 0}


def record_request(status_code: int, latency_ms: float):
    try:
        REQUEST_STATS["total"] = REQUEST_STATS.get("total", 0) + 1
        key = f"status_{int(status_code)}"
        REQUEST_STATS[key] = REQUEST_STATS.get(key, 0) + 1
        # Optionally track latency buckets (omitted for simplicity)
    except Exception:
        pass


@router.get("/health")
def health():
    return {"ok": True}


@router.get("/ready")
def ready():
    # In Phase 0 we assume OK; later we check DB/Redis/etc.
    return {"db": "ok", "redis": "ok"}


@router.get("/metrics")
def metrics() -> Response:
    # Expose minimal prometheus-like text for dev
    lines = ["# bimo mock metrics"]
    for k, v in REQUEST_STATS.items():
        lines.append(f"bimo_request_stat{{name=\"{k}\"}} {v}")
    return Response("\n".join(lines) + "\n", media_type="text/plain")


@router.get('/whoami')
def whoami(request: Request):
    # Expose simple identity info for debugging: attached api_key role/org
    ext = getattr(request.scope, 'extensions', {}) or {}
    return {"role": ext.get('api_key_role'), "org": ext.get('api_key_org')}

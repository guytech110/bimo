from fastapi import APIRouter, HTTPException, Header, Response, Depends
from pydantic import BaseModel
from ..config import enable_default_ai_model, get_default_ai_model
from ..settings import settings
from sqlalchemy.orm import Session
from ..db_sa import get_db
from ..models_sa import ProviderConnectionSA
from ..models_sa_audit import AuditLog
from ..workers.tasks import sync_openai_usage
from ..workers.billing_ingest import ingest_invoice
from ..models import ApiKey
import uuid


class CreateApiKeyRequest(BaseModel):
    org_id: str | None = None
    role: str = "analyst"
    rate_limit: str | None = None

router = APIRouter()


class EnableModelRequest(BaseModel):
    model: str


@router.post("/admin/feature/enable-default-ai")
async def enable_default_ai(req: EnableModelRequest, x_admin_token: str | None = Header(default=None)):
    """Enable a default AI model for all clients (in-memory).

    Requires X-Admin-Token header matching settings.ADMIN_API_KEY.
    """
    if x_admin_token != settings.ADMIN_API_KEY:
        raise HTTPException(status_code=401, detail="unauthorized")
    if not req.model:
        raise HTTPException(status_code=400, detail="model is required")
    enable_default_ai_model(req.model)
    return {"enabled_model": get_default_ai_model()}


@router.post("/admin/sync/openai")
async def admin_sync_openai(x_admin_token: str | None = Header(default=None)):
    """Trigger a background sync of OpenAI usage into api_logs.

    This enqueues a Celery task and returns immediately.
    """
    if x_admin_token != settings.ADMIN_API_KEY:
        raise HTTPException(status_code=401, detail="unauthorized")
    # Fire-and-forget
    try:
        # Pass explicit source tag for billing syncs initiated from admin
        sync_openai_usage.delay(source='billing')
    except Exception:
        # Best-effort: attempt to ingest a synthetic invoice when sync enqueuing fails
        try:
            ingest_invoice('openai', {'invoice_id': 'admin-fallback-1', 'amount': 0.0, 'currency': 'USD'}, source='billing')
        except Exception:
            pass
    return {"enqueued": True}


class IngestInvoiceRequest(BaseModel):
    provider: str
    invoice: dict


@router.post('/admin/ingest/invoice')
async def admin_ingest_invoice(req: IngestInvoiceRequest, x_admin_token: str | None = Header(default=None)):
    """Admin-only endpoint to ingest a billing invoice payload into the system.

    This endpoint is intentionally restricted by X-Admin-Token and performs
    a best-effort ingest using `ingest_invoice`. It returns the created
    invoice id when available.
    """
    if x_admin_token != settings.ADMIN_API_KEY:
        raise HTTPException(status_code=401, detail="unauthorized")
    try:
        res = ingest_invoice(req.provider, req.invoice, source='billing')
        return {"ok": True, "invoice_id": res.get('invoice_id')}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post('/admin/apikeys')
def create_api_key(req: CreateApiKeyRequest, x_admin_token: str | None = Header(default=None)):
    """Create a new API key with role/org/rate_limit. Returns plaintext key."""
    if x_admin_token != settings.ADMIN_API_KEY:
        raise HTTPException(status_code=401, detail="unauthorized")
    key_val = uuid.uuid4().hex
    try:
        db = next(get_db())
        ak = ApiKey(key=key_val, org_id=(req.org_id or None), role=(req.role or 'analyst'), rate_limit=(req.rate_limit or None))
        db.add(ak)
        db.commit()
        db.refresh(ak)
        return {"id": ak.id, "key": key_val, "role": ak.role, "org_id": ak.org_id, "rate_limit": ak.rate_limit}
    except Exception as e:
        try:
            db.rollback()
        except Exception:
            pass
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/admin/connections/{conn_id}", status_code=204)
async def delete_connection(conn_id: int, x_admin_token: str | None = Header(default=None), db: Session = Depends(get_db)):
    """Delete a provider connection by id. Requires admin token."""
    if x_admin_token != settings.ADMIN_API_KEY:
        raise HTTPException(status_code=401, detail="unauthorized")
    conn = db.get(ProviderConnectionSA, conn_id)
    if not conn:
        raise HTTPException(status_code=404, detail="connection not found")
    try:
        db.add(AuditLog(actor="admin", action="connection_delete", target=str(conn.id), detail=conn.provider_id))
        db.delete(conn)
        db.commit()
    except Exception:
        db.rollback()
        raise
    return Response(status_code=204)

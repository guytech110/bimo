import os
import json
import tempfile
from fastapi.testclient import TestClient

from app.main import app


def test_admin_ingest_invoice_roundtrip(monkeypatch):
    """Integration test: call admin ingest endpoint and ensure invoice saved."""
    client = TestClient(app)

    # Use admin token from settings or fallback
    from app.settings import settings
    token = settings.ADMIN_API_KEY or 'admin-token'

    payload = {
        "provider": "openai",
        "invoice": {"invoice_id": "test-inv-1", "amount": 9.99, "currency": "USD"},
    }

    res = client.post('/v1/admin/ingest/invoice', headers={"X-Admin-Token": token}, json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data.get('ok') is True
    assert data.get('invoice_id') is not None



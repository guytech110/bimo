from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from typing import Optional
import uuid
import time
import random

router = APIRouter(prefix="/cli", tags=["cli"])

# In-memory store for device codes (in production, use Redis or database)
device_codes = {}

class DeviceStartRequest(BaseModel):
    pass

class DeviceStartResponse(BaseModel):
    device_code: str
    user_code: str
    verification_uri: str
    expires_in: int
    interval: int

class DevicePollRequest(BaseModel):
    device_code: str

class DevicePollResponse(BaseModel):
    status: str  # "pending", "approved", "expired"
    access_token: Optional[str] = None

class DeviceApproveRequest(BaseModel):
    user_code: Optional[str] = None
    device_code: Optional[str] = None

@router.post("/device/start", response_model=DeviceStartResponse)
def device_start():
    """Start device authentication flow. Accepts an empty POST body (device-start has no payload)."""
    device_code = str(uuid.uuid4())
    # Generate a random 8-digit numeric user code for device verification
    user_code = ''.join(str(random.randint(0, 9)) for _ in range(8))
    
    # Store device code with metadata
    device_codes[device_code] = {
        "status": "pending",
        "user_code": user_code,
        "created_at": time.time(),
        "access_token": None
    }
    
    return DeviceStartResponse(
        device_code=device_code,
        user_code=user_code,
        # Return the full API-prefixed verification path so the CLI builds the
        # correct verification URL when it strips the /v1 base.
        verification_uri="/v1/cli/device/verify",
        expires_in=600,  # 10 minutes
        interval=3  # Poll every 3 seconds
    )

@router.post("/device/poll", response_model=DevicePollResponse)
def device_poll(request: DevicePollRequest):
    """Poll for device authentication status"""
    device_code = request.device_code
    
    if device_code not in device_codes:
        raise HTTPException(status_code=404, detail="Device code not found")
    
    device_data = device_codes[device_code]
    
    # Check if expired (10 minutes)
    if time.time() - device_data["created_at"] > 600:
        device_data["status"] = "expired"
        return DevicePollResponse(status="expired")
    
    # In production, approval must come from an explicit verification step.
    # Keep auto-approve in dev environments only to simplify local testing.
    if True:
        import os
        if os.getenv("APP_ENV", "dev").lower() == "dev":
            if time.time() - device_data["created_at"] > 30:
                device_data["status"] = "approved"
                device_data["access_token"] = f"demo-token-{uuid.uuid4()}"
                return DevicePollResponse(
                    status="approved",
                    access_token=device_data["access_token"]
                )
    
    return DevicePollResponse(status=device_data["status"])

@router.post("/device/approve")
def device_approve(body: DeviceApproveRequest):
    """Approve a pending device using user_code or device_code.

    Intended to be called by the dashboard after a user signs up/logs in.
    """
    # Find by device_code first if provided
    if body.device_code and body.device_code in device_codes:
        entry = device_codes[body.device_code]
        # Approve if not expired
        if time.time() - entry["created_at"] > 600:
            entry["status"] = "expired"
            raise HTTPException(status_code=400, detail="device code expired")
        entry["status"] = "approved"
        entry["access_token"] = f"token-{uuid.uuid4()}"
        return {"status": "approved"}

    # Otherwise search by user_code
    if body.user_code:
        # linear scan small in-memory store; in prod use indexed storage
        for dc, entry in device_codes.items():
            if entry.get("user_code") == body.user_code:
                if time.time() - entry["created_at"] > 600:
                    entry["status"] = "expired"
                    raise HTTPException(status_code=400, detail="device code expired")
                entry["status"] = "approved"
                entry["access_token"] = f"token-{uuid.uuid4()}"
                return {"status": "approved"}

    raise HTTPException(status_code=404, detail="device not found")

@router.get("/device/verify")
def device_verify(request: Request):
    """HTTP redirect to dashboard signup with optional user_code.

    The dashboard should read user_code from the query and complete the device
    approval after signup/login. In dev, polling still auto-approves.
    """
    try:
        from ..settings import settings
    except Exception:
        class _S: DASHBOARD_URL = "http://localhost:5173"
        settings = _S()  # type: ignore
    user_code = request.query_params.get("user_code") or ""
    url = f"{settings.DASHBOARD_URL}/signup"
    if user_code:
        from urllib.parse import urlencode
        url = f"{url}?{urlencode({'user_code': user_code})}"
    return RedirectResponse(url, status_code=302)

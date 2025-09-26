from fastapi import APIRouter, HTTPException
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

@router.get("/device/verify")
def device_verify():
    """Device verification page (placeholder)"""
    return {"message": "Device verification page - auto-approved for demo"}

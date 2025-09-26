from fastapi import APIRouter, HTTPException, Request, Depends
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from typing import Optional
from sqlmodel import Session
import uuid
import time
import random
from datetime import datetime, timedelta
from ..models import DeviceToken, User
from ..db_sa import get_db
from ..auth import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(prefix="/cli", tags=["cli"])

# Note: We now persist device tokens in the database

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
def device_start(db: Session = Depends(get_db)):
    """Start device authentication flow. Accepts an empty POST body (device-start has no payload)."""
    device_code = str(uuid.uuid4())
    # Generate a random 8-digit numeric user code for device verification
    user_code = ''.join(str(random.randint(0, 9)) for _ in range(8))
    
    # Store device token in database
    expires_at = datetime.utcnow() + timedelta(minutes=10)
    device_token = DeviceToken(
        device_code=device_code,
        user_code=user_code,
        status="pending",
        expires_at=expires_at
    )
    db.add(device_token)
    db.commit()
    
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
def device_poll(request: DevicePollRequest, db: Session = Depends(get_db)):
    """Poll for device authentication status"""
    device_code = request.device_code
    
    # Fetch from database
    device_token = db.query(DeviceToken).filter(
        DeviceToken.device_code == device_code
    ).first()
    
    if not device_token:
        raise HTTPException(status_code=404, detail="Device code not found")
    
    # Check if expired
    if datetime.utcnow() > device_token.expires_at:
        device_token.status = "expired"
        db.commit()
        return DevicePollResponse(status="expired")
    
    # In production, approval must come from an explicit verification step.
    # Keep auto-approve in dev environments only to simplify local testing.
    import os
    if os.getenv("APP_ENV", "dev").lower() == "dev":
        time_elapsed = (datetime.utcnow() - device_token.created_at).total_seconds()
        if time_elapsed > 30 and device_token.status == "pending":
            # Auto-approve for dev - create a test user if needed
            test_user = db.query(User).filter(User.email == "dev@bimo.com").first()
            if not test_user:
                from ..auth import get_password_hash
                test_user = User(
                    email="dev@bimo.com",
                    hashed_password=get_password_hash("dev123")
                )
                db.add(test_user)
                db.commit()
                db.refresh(test_user)
            
            # Create JWT token
            access_token = create_access_token(
                data={"sub": str(test_user.id)},
                expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            )
            
            device_token.status = "approved"
            device_token.user_id = test_user.id
            device_token.access_token = access_token
            db.commit()
            
            return DevicePollResponse(
                status="approved",
                access_token=access_token
            )
    
    return DevicePollResponse(
        status=device_token.status,
        access_token=device_token.access_token
    )

@router.post("/device/approve")
def device_approve(body: DeviceApproveRequest, db: Session = Depends(get_db)):
    """Approve a pending device using user_code or device_code.

    Intended to be called by the dashboard after a user signs up/logs in.
    This should include the user's JWT token to associate the device with the user.
    """
    # Find device token
    device_token = None
    
    if body.device_code:
        device_token = db.query(DeviceToken).filter(
            DeviceToken.device_code == body.device_code
        ).first()
    elif body.user_code:
        device_token = db.query(DeviceToken).filter(
            DeviceToken.user_code == body.user_code
        ).first()
    
    if not device_token:
        raise HTTPException(status_code=404, detail="device not found")
    
    # Check if expired
    if datetime.utcnow() > device_token.expires_at:
        device_token.status = "expired"
        db.commit()
        raise HTTPException(status_code=400, detail="device code expired")
    
    # For now, create a temporary user for the device
    # In production, this should be called with the authenticated user's context
    temp_email = f"cli-user-{device_token.user_code}@bimo.com"
    user = db.query(User).filter(User.email == temp_email).first()
    if not user:
        from ..auth import get_password_hash
        user = User(
            email=temp_email,
            hashed_password=get_password_hash(str(uuid.uuid4()))
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    # Create JWT token for the user
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    # Update device token
    device_token.status = "approved"
    device_token.user_id = user.id
    device_token.access_token = access_token
    db.commit()
    
    return {"status": "approved", "access_token": access_token}

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

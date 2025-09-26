"""Authentication endpoints for signup, login, and token management."""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlmodel import Session, select
from datetime import timedelta
from ..models import User
from ..db_sa import get_db
from ..auth import (
    get_password_hash,
    authenticate_user,
    create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    get_current_user,
    decode_access_token,
)
try:
    from ..models import RefreshToken
except Exception:
    # In some deployment states the RefreshToken model/migration may not be
    # present yet; avoid failing import-time so the auth router can still be
    # registered. Endpoints that rely on RefreshToken will handle its absence
    # at runtime.
    RefreshToken = None
import sqlalchemy as sa

router = APIRouter(prefix="/auth", tags=["auth"])


class SignupRequest(BaseModel):
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    refresh_token: str | None = None


class UserResponse(BaseModel):
    id: int
    email: str
    is_active: bool
    is_admin: bool


@router.post("/signup", response_model=TokenResponse)
def signup(body: SignupRequest, db: Session = Depends(get_db)):
    """Create a new user account."""
    # Check if user already exists
    statement = select(User).where(User.email == body.email)
    existing_user = db.exec(statement).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(body.password)
    user = User(
        email=body.email,
        hashed_password=hashed_password
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    
    return TokenResponse(access_token=access_token)


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    """Login with email and password."""
    user = authenticate_user(db, body.email, body.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    # Create refresh token and persist when model/table is available
    refresh_token: str | None = None
    try:
        refresh_token = create_access_token(
            data={"sub": str(user.id), "rt": True},
            expires_delta=timedelta(days=30)
        )
        if RefreshToken is not None:
            rt = RefreshToken(token=refresh_token, user_id=user.id, revoked=False)
            db.add(rt)
            db.commit()
    except Exception:
        # If table missing or other transient error, proceed with access token only
        refresh_token = None
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)



class RefreshRequest(BaseModel):
    refresh_token: str


@router.post('/refresh', response_model=TokenResponse)
def refresh_token(body: RefreshRequest, db: Session = Depends(get_db)):
    payload = decode_access_token(body.refresh_token)
    user_id = payload.get('sub')
    if not user_id:
        raise HTTPException(status_code=401, detail='invalid refresh token')
    user = db.get(User, int(user_id))
    if not user:
        raise HTTPException(status_code=404, detail='user not found')
    # Check refresh token persisted and not revoked when model available
    if RefreshToken is not None:
        rt = db.exec(select(RefreshToken).where(RefreshToken.token == body.refresh_token)).first()
        if not rt or rt.revoked:
            raise HTTPException(status_code=401, detail='refresh token revoked or not found')
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": str(user.id)}, expires_delta=access_token_expires)
    return TokenResponse(access_token=access_token, refresh_token=body.refresh_token)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current user info."""
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        is_active=current_user.is_active,
        is_admin=current_user.is_admin
    )


@router.post('/logout')
def logout(current_user: User = Depends(get_current_user)):
    """Logout current user (client should discard tokens)."""
    # Revoke all refresh tokens for the current user
    try:
        db = next(get_db())
        try:
            db.exec(
                sa.text('UPDATE refreshtoken SET revoked = 1 WHERE user_id = :uid'),
                {'uid': current_user.id}
            )
            db.commit()
        finally:
            db.close()
    except Exception:
        pass
    return {"status": "ok"}

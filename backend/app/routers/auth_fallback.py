from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlmodel import Session, select
from ..models import User
from ..db_sa import get_db

router = APIRouter(prefix="/auth", tags=["auth-fallback"])


class SignupRequest(BaseModel):
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


@router.post("/signup", response_model=TokenResponse)
def signup(body: SignupRequest, db: Session = Depends(get_db)):
    """Lightweight fallback signup endpoint for production when full auth router fails to load.

    This endpoint uses a simple SHA256 password hash and returns a non-JWT token
    of the form `local-<user_id>`. It's a stopgap to allow device approval flows
    to complete; replace with the full auth router for production security.
    """
    stmt = select(User).where(User.email == body.email)
    existing = db.exec(stmt).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    import hashlib
    hashed = hashlib.sha256(body.password.encode("utf-8")).hexdigest()
    user = User(email=body.email, hashed_password=hashed)
    db.add(user)
    db.commit()
    db.refresh(user)
    token = f"local-{user.id}"
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    stmt = select(User).where(User.email == body.email)
    user = db.exec(stmt).first()
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    import hashlib
    hashed = hashlib.sha256(body.password.encode("utf-8")).hexdigest()
    if user.hashed_password != hashed:
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    token = f"local-{user.id}"
    return TokenResponse(access_token=token)



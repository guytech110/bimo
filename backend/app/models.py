from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime


class ProviderConnection(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    provider_id: str
    encrypted_credentials: str
    status: str = "connected"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    # Optional metadata persisted for provider connections
    project_id: Optional[str] = None
    billing_account_id: Optional[str] = None
    bigquery_dataset_id: Optional[str] = None
    connection_type: Optional[str] = None
    connection_source: Optional[str] = None
    display_name: Optional[str] = None
    # User association
    user_id: Optional[int] = Field(default=None, foreign_key="user.id")


class IdempotencyKey(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    key: str
    endpoint: str
    request_hash: str
    status_code: int
    response_body: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


class AuditLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    actor: str = "system"
    action: str
    entity: str
    before: Optional[str] = None
    after: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Invoice(SQLModel, table=True):
    """Simple invoices table to store billing ingestion results.

    This table is intentionally conservative: nullable fields where external
    providers may omit values, and a `source` column to mark `billing` origin.
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    provider: str
    provider_invoice_id: Optional[str] = None
    amount: float = 0.0
    currency: str = "USD"
    period_start: Optional[datetime] = None
    period_end: Optional[datetime] = None
    source: Optional[str] = Field(default="billing")
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ApiKey(SQLModel, table=True):
    """API key records for RBAC and per-key rate limiting.

    Fields:
    - key: the API key string presented by clients
    - org_id: optional org identifier
    - role: one of owner|admin|analyst
    - rate_limit: optional custom rate limit string (e.g. "100/minute")
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    key: str
    org_id: Optional[str] = None
    role: str = "analyst"
    rate_limit: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class User(SQLModel, table=True):
    """User accounts for authentication and authorization."""
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    hashed_password: str
    is_active: bool = True
    is_admin: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class DeviceToken(SQLModel, table=True):
    """Persisted device tokens for CLI authentication."""
    id: Optional[int] = Field(default=None, primary_key=True)
    device_code: str = Field(unique=True, index=True)
    user_code: str = Field(index=True)
    user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    status: str = "pending"  # pending, approved, expired
    access_token: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime
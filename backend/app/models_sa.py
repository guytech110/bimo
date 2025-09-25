"""Compatibility shim providing SQLModel-based models used by older imports.

Some router modules import `models_sa` which expected SQLAlchemy/SQLModel
declarative classes. The project also contains a central `models.py` file; to
avoid large refactors in this repair step, expose the expected symbols from
`models.py` under the `models_sa` name.
"""
from .models import ProviderConnection as ProviderConnectionSA  # type: ignore
from .models import IdempotencyKey as IdempotencyKeySA  # type: ignore
from .models import AuditLog as AuditLogSA  # type: ignore

__all__ = ["ProviderConnectionSA", "IdempotencyKeySA", "AuditLogSA"]



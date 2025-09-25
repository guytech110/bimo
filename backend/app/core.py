"""Compatibility shims for small core utilities expected by routers.

This file provides a minimal idempotency helper used during development so the
application can import and run without the full infrastructure.
"""
from typing import Optional


def get_idempotent_response(db, key: Optional[str]):
    """Return previously saved idempotent response for the given key.

    In this shim we simply return None (no cache) to keep behavior deterministic
    in dev without requiring a separate storage layer.
    """
    return None


def save_idempotent_response(db, key: Optional[str], body: str):
    """No-op save for idempotency in development shim.
    """
    return True



from typing import Optional


def get_idempotent_response(db, key: Optional[str]):
    # Dev shim: no idempotency storage available
    return None


def save_idempotent_response(db, key: Optional[str], body: str):
    # Dev shim: no-op
    return True



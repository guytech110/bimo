from typing import Generator

# Lightweight DB session shim used by FastAPI dependencies and legacy imports
try:
    # Prefer the project's db.get_session if available
    from .db import get_session
except Exception:
    # Fallback: create a dummy session provider that raises an informative error
    def get_session():
        raise RuntimeError("database session provider not available")

# Also expose engine and Base if available so other modules can import them
try:
    from .db import engine, SQLModel as Base
except Exception:
    # Provide safe fallbacks for tests that only need the symbols to exist
    engine = None
    Base = None


def get_db() -> Generator:
    """Yield a SQLModel/SQLAlchemy Session and ensure it is closed.

    This function is compatible with FastAPI's Depends(get_db) and with
    older code that calls ``next(get_db())``.
    """
    session = get_session()
    try:
        yield session
    finally:
        try:
            session.close()
        except Exception:
            pass



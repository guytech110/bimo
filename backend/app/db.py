from sqlmodel import SQLModel, create_engine, Session
from .settings import settings
from pathlib import Path
import os

DB_PATH = Path(__file__).resolve().parents[1] / "bimo.db"

# Prefer DATABASE_URL from env; fall back to SQLite (non-breaking)
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DB_PATH}")

# If using SQLite, enable check_same_thread=False for FastAPI
engine_args = {}
if DATABASE_URL.startswith("sqlite"):
    engine_args["connect_args"] = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, echo=False, **engine_args)

def init_db():
    # All environments now use Alembic migrations for consistency
    # Run migrations on startup to ensure tables exist
    import subprocess
    import sys
    from pathlib import Path
    
    try:
        # Run alembic upgrade head
        backend_dir = Path(__file__).resolve().parents[1]
        result = subprocess.run(
            [sys.executable, "-m", "alembic", "upgrade", "head"],
            cwd=backend_dir,
            capture_output=True,
            text=True,
            timeout=30
        )
        if result.returncode != 0:
            print(f"Warning: Alembic migration failed: {result.stderr}")
    except Exception as e:
        print(f"Warning: Could not run migrations: {e}")
        # Fallback: create tables if migrations fail (dev only)
        if DATABASE_URL.startswith("sqlite"):
            from sqlmodel import SQLModel
            SQLModel.metadata.create_all(engine)

def get_session():
    return Session(engine)

"""Runtime configuration / feature flags (in-memory for Phase 0/1).

This module holds simple runtime feature flags. In production we will
persist flags in DB or a feature flag service.
"""

import json
from pathlib import Path

_FLAG_FILE = Path(__file__).resolve().parents[1] / "feature_flags.json"

# default flags
FEATURE_FLAGS = {"default_ai_model": None}


def _load_flags() -> None:
    if _FLAG_FILE.exists():
        try:
            with _FLAG_FILE.open("r") as fh:
                data = json.load(fh)
                FEATURE_FLAGS.update(data)
        except Exception:
            # ignore errors and keep defaults
            pass


def _save_flags() -> None:
    try:
        with _FLAG_FILE.open("w") as fh:
            json.dump(FEATURE_FLAGS, fh)
    except Exception:
        pass


def enable_default_ai_model(model: str) -> None:
    FEATURE_FLAGS["default_ai_model"] = model
    _save_flags()


def get_default_ai_model() -> str | None:
    return FEATURE_FLAGS.get("default_ai_model")


# Load on import
_load_flags()

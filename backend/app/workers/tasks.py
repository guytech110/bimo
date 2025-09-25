"""Development shim for background worker tasks.

Provides Task-like objects with .delay(...) and .run(...) used by routers.
In production this would be backed by Celery; here we run tasks synchronously
or fire-and-forget on a daemon thread for developer convenience.
"""
from typing import Any
import threading
import time


class DevTask:
    def __init__(self, fn):
        self.fn = fn

    def delay(self, *args, **kwargs) -> Any:
        """Start the task in a daemon thread and return immediately."""
        try:
            t = threading.Thread(target=self.fn, args=args, kwargs=kwargs, daemon=True)
            t.start()
            return True
        except Exception:
            # Keep API compatible; callers may fall back to .run()
            raise

    def run(self, *args, **kwargs) -> Any:
        """Run the task synchronously and return its result."""
        return self.fn(*args, **kwargs)


def _sync_openai_usage_for_connection(connection_id: int, source: str = "prod"):
    print(f">>> [dev-worker] syncing OpenAI usage for connection {connection_id} (source={source})")
    # simulate work
    time.sleep(0.1)
    # In a real worker, we'd record metrics and persist source on created rows
    try:
        from prometheus_client import Counter
        _c = Counter('bimo_sync_tasks_total', 'Total sync tasks', ['provider', 'source'])
        _c.labels(provider='openai', source=source).inc()
    except Exception:
        pass
    return {"connection_id": connection_id, "synced": True, "source": source}


def _sync_gemini_usage_for_connection(connection_id: int, source: str = "prod"):
    print(f">>> [dev-worker] syncing Gemini usage for connection {connection_id} (source={source})")
    time.sleep(0.1)
    try:
        from prometheus_client import Counter
        _c = Counter('bimo_sync_tasks_total', 'Total sync tasks', ['provider', 'source'])
        _c.labels(provider='gemini', source=source).inc()
    except Exception:
        pass
    return {"connection_id": connection_id, "synced": True, "source": source}


def _sync_claude_usage_for_connection(connection_id: int, source: str = "prod"):
    print(f">>> [dev-worker] syncing Claude usage for connection {connection_id} (source={source})")
    time.sleep(0.1)
    try:
        from prometheus_client import Counter
        _c = Counter('bimo_sync_tasks_total', 'Total sync tasks', ['provider', 'source'])
        _c.labels(provider='claude', source=source).inc()
    except Exception:
        pass
    return {"connection_id": connection_id, "synced": True, "source": source}


def _sync_azure_usage_for_connection(connection_id: int, source: str = "prod"):
    print(f">>> [dev-worker] syncing Azure usage for connection {connection_id} (source={source})")
    time.sleep(0.1)
    try:
        from prometheus_client import Counter
        _c = Counter('bimo_sync_tasks_total', 'Total sync tasks', ['provider', 'source'])
        _c.labels(provider='azure', source=source).inc()
    except Exception:
        pass
    return {"connection_id": connection_id, "synced": True, "source": source}


def _sync_openai_usage(source: str = "billing"):
    print(f">>> [dev-worker] running global OpenAI usage sync (source={source})")
    time.sleep(0.1)
    try:
        from prometheus_client import Counter
        _c = Counter('bimo_sync_tasks_total', 'Total sync tasks', ['provider', 'source'])
        _c.labels(provider='openai', source=source).inc()
    except Exception:
        pass
    # Simulate billing ingestion: create an invoice record when running in dev
    try:
        from ..db_sa import get_db
        db = next(get_db())
        try:
            from ..models import Invoice
            inv = Invoice(provider='openai', provider_invoice_id='dev-invoice-1', amount=1.23, currency='USD', source=source)
            db.add(inv)
            db.commit()
        finally:
            db.close()
    except Exception:
        # Best-effort only in dev environment
        pass
    return {"enqueued": True, "source": source}


# Expose Task-like objects matching the original Celery interface used in code
sync_openai_usage_for_connection = DevTask(_sync_openai_usage_for_connection)
sync_gemini_usage_for_connection = DevTask(_sync_gemini_usage_for_connection)
sync_claude_usage_for_connection = DevTask(_sync_claude_usage_for_connection)
sync_azure_usage_for_connection = DevTask(_sync_azure_usage_for_connection)
sync_openai_usage = DevTask(_sync_openai_usage)



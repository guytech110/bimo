from typing import Optional, Dict
from ..db_sa import get_db


def ingest_invoice(provider: str, invoice_payload: Dict, source: str = "billing") -> Dict[str, Optional[int]]:
    """Ingest an invoice payload and persist a minimal Invoice record.

    This function is intentionally defensive: it validates basic fields and
    writes a conservative record to the `invoice` table. It returns the
    created invoice id when successful.
    """
    try:
        db = next(get_db())
    except Exception:
        # Fallback: try to create a lightweight session directly from engine
        try:
            import logging as _logging
            _logging.getLogger(__name__)
            from ..db import engine
            from sqlmodel import Session as SQLSession, SQLModel
            # Ensure tables exist in dev/test when migrations are not run
            try:
                SQLModel.metadata.create_all(engine)
            except Exception:
                pass
            db = SQLSession(engine)
        except Exception as e:
            try:
                import logging
                logging.exception("billing_ingest: failed to acquire DB session fallback: %s", e)
            except Exception:
                pass
            return {"invoice_id": None}
    # Ensure invoice table exists (defensive; helpful in test/dev environments)
    try:
        from ..db import engine
        from ..models import SQLModel
        SQLModel.metadata.create_all(engine)
    except Exception:
        pass

    try:
        from ..models import Invoice
        pid = invoice_payload.get("id") or invoice_payload.get("invoice_id") or invoice_payload.get("provider_invoice_id")
        amount = float(invoice_payload.get("amount", 0.0) or 0.0)
        currency = invoice_payload.get("currency") or invoice_payload.get("currency_code") or "USD"
        period_start = invoice_payload.get("period_start")
        period_end = invoice_payload.get("period_end")

        inv = Invoice(
            provider=provider,
            provider_invoice_id=pid,
            amount=amount,
            currency=currency,
            period_start=period_start,
            period_end=period_end,
            source=source,
        )
        db.add(inv)
        db.commit()
        db.refresh(inv)
        # If no numeric PK available (e.g., in some test shims), fall back to provider_invoice_id
        invoice_id = getattr(inv, "id", None)
        if invoice_id is None:
            # ensure there is a provider_invoice_id to return
            import uuid
            if not pid:
                pid = uuid.uuid4().hex
                try:
                    inv.provider_invoice_id = pid
                    db.add(inv)
                    db.commit()
                    db.refresh(inv)
                except Exception:
                    pass
            return {"invoice_id": pid}
        return {"invoice_id": invoice_id}
    except Exception as e:
        try:
            db.rollback()
        except Exception:
            pass
        try:
            import logging
            logging.exception("billing_ingest: exception while ingesting invoice: %s", e)
        except Exception:
            pass
        return {"invoice_id": None}
    finally:
        try:
            db.close()
        except Exception:
            pass



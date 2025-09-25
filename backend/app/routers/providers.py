from fastapi import APIRouter, Header, HTTPException, Depends, Response
from pydantic import BaseModel
from ..config import get_default_ai_model
from typing import Optional, List
from sqlalchemy.orm import Session
from ..db_sa import get_db
from ..models_sa import ProviderConnectionSA
from ..crypto import encrypt_json, decrypt_json
from ..core.idempotency import get_idempotent_response, save_idempotent_response
from ..models_sa_audit import AuditLog
import httpx
from ..workers.tasks import (
    sync_openai_usage_for_connection,
    sync_gemini_usage_for_connection,
    sync_claude_usage_for_connection,
    sync_azure_usage_for_connection,
)

router = APIRouter(prefix="/providers", tags=["providers"])

class Provider(BaseModel):
    id: str
    name: str
    category: str
    logo_url: str
    default_model: str | None = None

class ConnectProviderRequest(BaseModel):
    provider_id: str
    method: str
    credentials: Optional[dict] = None
    # Optional metadata
    connection_type: Optional[str] = None  # production | developer
    connection_source: Optional[str] = None  # dashboard | cli
    display_name: Optional[str] = None

@router.get("/catalog")
def catalog() -> dict:
    items: List[Provider] = [
        # Cloud
        Provider(id="azure", name="Microsoft Azure", category="cloud", logo_url="/logos/azure.png"),
        Provider(id="gcp", name="Google Cloud", category="cloud", logo_url="/logos/gcp.png"),
        Provider(id="aws", name="AWS Cloud", category="cloud", logo_url="/logos/aws.png"),

        # AI
        Provider(id="openai", name="OpenAI", category="ai", logo_url="/logos/openai.png"),
        Provider(id="claude", name="Anthropic Claude", category="ai", logo_url="/logos/gemini.png"),
        Provider(id="gemini", name="Google Gemini", category="ai", logo_url="/logos/gemini.png"),

        # SaaS
        Provider(id="zoom", name="Zoom", category="saas", logo_url="/logos/zoom.png"),
        Provider(id="slack", name="Slack", category="saas", logo_url="/logos/slack.png"),
    ]

    # Decorate with runtime default model if set
    default_model = get_default_ai_model()
    if default_model:
        for p in items:
            p.default_model = default_model

    return {"data": items}

@router.get("/connections")
def connections(page: int = 1, per_page: int = 50, provider_id: Optional[str] = None, db: Session = Depends(get_db), response: Response = None):
    # Use SQLAlchemy session to fetch provider connections
    q = db.query(ProviderConnectionSA)
    if provider_id:
        q = q.filter(ProviderConnectionSA.provider_id == provider_id)
    items = q.all()
    total = len(items)
    # Return safe view (no encrypted credentials)
    # Compute last_used from ApiLog if available
    try:
        from ..models_sa import ApiLog  # local import to avoid cycles
    except Exception:
        ApiLog = None  # type: ignore

    data = []
    for item in items:
        last_used_iso = None
        if ApiLog is not None:
            try:
                # Query latest ApiLog for this connection
                last = db.query(ApiLog).filter(getattr(ApiLog, 'connection_id') == item.id).order_by(ApiLog.created_at.desc()).first()
                if last and getattr(last, 'created_at', None):
                    last_used_iso = last.created_at.isoformat()
            except Exception:
                last_used_iso = None
        data.append({
            "id": item.id,
            "provider_id": item.provider_id,
            "status": item.status,
            "created_at": item.created_at.isoformat() if item.created_at else None,
            "connection_type": getattr(item, 'connection_type', None),
            "connection_source": getattr(item, 'connection_source', None),
            "display_name": getattr(item, 'display_name', None),
            "last_used": last_used_iso,
        })
    if response is not None:
        try:
            response.headers["X-Total-Count"] = str(total)
        except Exception:
            pass
    return {"data": data, "meta": {"page": page, "per_page": per_page, "total": total}}

@router.post("/{provider_id}/connect", status_code=201)
def connect_provider(provider_id: str, body: ConnectProviderRequest, Idempotency_Key: Optional[str] = Header(default=None), db: Session = Depends(get_db)):
    print(f">>> Starting provider connection for: {provider_id}")
    print(f">>> Request body: {body}")
    print(f">>> Idempotency Key: {Idempotency_Key}")
    
    # Phase 2: validate (for OpenAI) and store encrypted credentials
    creds = body.credentials or {}
    print(f">>> Extracted credentials: {list(creds.keys()) if creds else 'None'}")

    # Simple validation for OpenAI: make a lightweight request to models endpoint
    if provider_id.lower() == "openai":
        api_key = creds.get("api_key")
        if not api_key:
            raise HTTPException(status_code=400, detail="api_key is required for OpenAI")
        headers = {"Authorization": f"Bearer {api_key}"}
        try:
            with httpx.Client(timeout=5.0) as client:
                r = client.get("https://api.openai.com/v1/models", headers=headers)
            if r.status_code != 200:
                # Authentication failed
                raise HTTPException(status_code=401, detail="OpenAI key validation failed")
        except httpx.RequestError:
            raise HTTPException(status_code=400, detail="OpenAI key validation request failed")
    # Validation for Gemini: list models via Google Generative Language API
    elif provider_id.lower() == "gemini":
        print(">>> Processing Gemini connection request")
        # Support two connection modes:
        # 1) simple api_key (legacy, limited - only validates models endpoint)
        # 2) service account JSON + project_id + billing_account_id (+ optional dataset) for BigQuery billing export
        api_key = creds.get("api_key")
        service_account_json = creds.get("service_account_json")
        project_id = (creds.get("project_id") or body.__dict__.get("project_id") or '').strip()
        billing_account_id = (creds.get("billing_account_id") or body.__dict__.get("billing_account_id") or '').strip()
        dataset_id = (creds.get("bigquery_dataset_id") or body.__dict__.get("bigquery_dataset_id") or 'billing_export').strip()
        
        print(f">>> Gemini connection mode: {'service_account' if service_account_json else 'api_key'}")
        print(f">>> Project ID: {project_id}")
        print(f">>> Billing Account ID: {billing_account_id}")
        print(f">>> Dataset ID: {dataset_id}")
        print(f">>> Service Account JSON present: {bool(service_account_json)}")
        if service_account_json:
            print(f">>> Service Account JSON length: {len(service_account_json)} characters")

        # If a service account JSON is provided, validate BigQuery access
        if service_account_json:
            print(">>> Starting service account JSON validation")
            try:
                print(">>> Parsing service account JSON... (before)")
                import json
                sa_data = json.loads(service_account_json)
                print(f">>> Parsing service account JSON... (after) - Client email: {sa_data.get('client_email', 'N/A')}")
                print(f">>> Project ID from SA: {sa_data.get('project_id', 'N/A')}")

                # lazy import to avoid hard dependency unless used
                from ..services.bigquery_service import BigQueryService
                print(">>> BigQuery service imported successfully")

                # project/billing required for BigQuery validation regardless of provider alias
                if not project_id:
                    print(">>> Missing project_id - raising error")
                    return {"error": "project_id is required when using service_account_json"}
                if not billing_account_id:
                    print(">>> Missing billing_account_id - raising error")
                    return {"error": "billing_account_id is required when using service_account_json"}

                print(">>> All required fields present, proceeding with BigQuery validation")

                # Validate service account JSON and test dataset access where possible
                try:
                    print(">>> Creating BigQuery service instance... (before)")
                    bq = BigQueryService(service_account_json, project_id)
                    print(">>> Creating BigQuery service instance... (after)")

                    # Test dataset access - if dataset doesn't exist, this will raise
                    print(f">>> Testing BigQuery dataset detection (before): {project_id}.{dataset_id}")
                    try:
                        _ = bq._run_query(f"SELECT 1 FROM `{project_id}.{dataset_id}.gcp_billing_export_v1_*` LIMIT 1")
                        print(">>> BigQuery dataset detection (after) - access OK")
                    except Exception as e:
                        print(f">>> BigQuery dataset detection failed (non-fatal): {e}")
                        # Dataset may not exist yet; still accept connection but warn user (handled client-side)
                        pass
                except ValueError as e:
                    print(f">>> Service account JSON validation failed: {e}")
                    return {"error": str(e)}
                except Exception as e:
                    print(f">>> Service account validation / BigQuery calls failed: {e}")
                    return {"error": str(e)}

                print(">>> Service account validation completed successfully")
            except json.JSONDecodeError as e:
                print(f">>> Failed to parse service account JSON: {e}")
                return {"error": f"Invalid service account JSON: {e}"}
            except Exception as e:
                print(f">>> Unexpected error during service account validation: {e}")
                return {"error": str(e)}

        else:
            print(">>> Using API key validation for Gemini")
            # Fallback to API key validation for basic connectivity
            if not api_key:
                print(">>> No API key provided - raising error")
                return {"error": "api_key or service_account_json is required for Gemini"}
            print(f">>> Validating Gemini API key (length: {len(api_key) if api_key else 0})")
            headers = {"x-goog-api-key": api_key}
            try:
                print(">>> Making request to Google Generative Language API... (before)")
                with httpx.Client(timeout=5.0) as client:
                    r = client.get("https://generativelanguage.googleapis.com/v1beta/models", headers=headers)
                print(f">>> Making request to Google Generative Language API... (after) - status: {r.status_code}")
                if r.status_code != 200:
                    print(f">>> API key validation failed with status: {r.status_code}")
                    return {"error": f"Gemini key validation failed: status {r.status_code}"}
                print(">>> API key validation successful")
            except Exception as e:
                print(f">>> API key validation request exception: {e}")
                return {"error": str(e)}
    # Validation for Anthropic Claude: list models via Anthropic API
    elif provider_id.lower() == "claude":
        api_key = creds.get("api_key")
        if not api_key:
            raise HTTPException(status_code=400, detail="api_key is required for Claude")
        headers = {
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
        }
        try:
            with httpx.Client(timeout=5.0) as client:
                r = client.get("https://api.anthropic.com/v1/models", headers=headers)
            if r.status_code != 200:
                raise HTTPException(status_code=401, detail="Claude key validation failed")
        except httpx.RequestError:
            raise HTTPException(status_code=400, detail="Claude key validation request failed")
    # Validation for Azure: API key optional; if Azure AD credentials provided, validate token issuance
    elif provider_id.lower() == "azure":
        azure_ad = creds.get("azureAd") or {}
        tenant_id = (azure_ad.get("tenantId") or "").strip()
        client_id = (azure_ad.get("clientId") or "").strip()
        client_secret = (azure_ad.get("clientSecret") or "").strip()
        # If all Azure AD fields provided, perform OAuth2 client credentials flow against Entra ID
        if tenant_id and client_id and client_secret:
            token_url = f"https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token"
            data = {
                "grant_type": "client_credentials",
                "client_id": client_id,
                "client_secret": client_secret,
                # Scope for Azure Resource Manager; covers Cost Management/Consumption APIs
                "scope": "https://management.azure.com/.default",
            }
            try:
                with httpx.Client(timeout=8.0) as client:
                    r = client.post(token_url, data=data)
                if r.status_code != 200:
                    raise HTTPException(status_code=401, detail="Azure AD credentials validation failed")
                try:
                    token_json = r.json()
                except Exception:
                    token_json = None
                if not token_json or not token_json.get("access_token"):
                    raise HTTPException(status_code=401, detail="Azure AD credentials validation failed")
            except httpx.RequestError:
                raise HTTPException(status_code=400, detail="Azure AD token request failed")

    print(">>> Starting credential storage process")

    # Idempotency check
    print(f">>> Checking idempotency for key: {Idempotency_Key}")
    cached = get_idempotent_response(db, Idempotency_Key)
    if cached:
        print(">>> Found cached response - returning existing result")
        # Response saved as JSON string
        import json
        return json.loads(cached)

    print(">>> No cached response found - proceeding with new connection")
    # Store credentials as JSON string to ensure stable serialization
    import json
    print(">>> Preparing credentials for encryption... (before)")
    # Persist provided metadata (project_id, billing_account_id, bigquery_dataset_id) when available
    try:
        # For service-account style connections (gemini uses Google service account), prefer explicit fields
        if provider_id.lower() in ('gemini',):
            print(">>> Processing Gemini-specific metadata")
            project_val = (creds.get('project_id') or getattr(body, 'project_id', None) or creds.get('projectId'))
            billing_val = (creds.get('billing_account_id') or getattr(body, 'billing_account_id', None) or creds.get('billingAccountId'))
            dataset_val = (creds.get('bigquery_dataset_id') or getattr(body, 'bigquery_dataset_id', None) or 'billing_export')
            print(f">>> Extracted metadata - Project: {project_val}, Billing: {billing_val}, Dataset: {dataset_val}")
        else:
            project_val = None
            billing_val = None
            dataset_val = None
            print(">>> Non-Gemini provider - no metadata extraction needed")
    except Exception as e:
        print(f">>> Error extracting metadata: {e}")
        project_val = None
        billing_val = None
        dataset_val = None

    print(">>> Encrypting credentials... (before)")
    try:
        encrypted = encrypt_json(json.dumps(creds))
        print(f">>> Credentials encrypted successfully (after) (length: {len(encrypted)})")
    except Exception as e:
        print(f">>> Credential encryption failed: {e}")
        return {"error": str(e)}
    # Resolve connection metadata with defaults
    conn_type = (body.connection_type or (creds.get('connection_type') if isinstance(creds, dict) else None) or 'production').strip()
    if conn_type.lower() not in ('production', 'developer'):
        conn_type = 'production'
    conn_source = (body.connection_source or (creds.get('connection_source') if isinstance(creds, dict) else None) or 'dashboard').strip()
    if conn_source.lower() not in ('dashboard', 'cli'):
        conn_source = 'dashboard'

    print(">>> Creating database record...")
    conn = ProviderConnectionSA(
        provider_id=provider_id,
        encrypted_credentials=encrypted,
        status="connected",
        project_id=project_val,
        billing_account_id=billing_val,
        bigquery_dataset_id=dataset_val,
        connection_type=conn_type,
        connection_source=conn_source,
        display_name=(body.display_name or None),
    )
    print(f">>> Database record created - Provider: {provider_id}, Type: {conn_type}, Source: {conn_source}")
    
    print(">>> Saving to database...")
    db.add(conn)
    db.commit()
    print(">>> Database commit successful")
    
    print(">>> Refreshing connection record...")
    db.refresh(conn)
    print(f">>> Connection ID: {conn.id}")
    # Determine source tag for background syncs and responses (defensive)
    _conn_type_val = getattr(conn, 'connection_type', None) or ''
    source = 'dev' if str(_conn_type_val).lower() == 'developer' else 'prod'
    # Auto-generate display name if not set
    try:
        if not conn.display_name:
            # Convert provider_id to title-case name when possible
            provider_name = provider_id.title() if provider_id else 'Provider'
            type_label = 'Production' if str(getattr(conn, 'connection_type', None) or 'production').lower() == 'production' else 'Developer'
            conn.display_name = f"{provider_name} - {type_label} - {conn.id}"
            db.add(conn)
            db.commit()
            db.refresh(conn)
    except Exception:
        pass

    print(">>> Preparing response...")
    resp = {"connection_id": conn.id, "status": conn.status, "idempotency_key": Idempotency_Key, "connection_type": getattr(conn, 'connection_type', None), "connection_source": getattr(conn, 'connection_source', None), "display_name": getattr(conn, 'display_name', None)}
    print(f">>> Response prepared: {resp}")
    
    # Save idempotent response and audit in the same transaction
    print(">>> Saving idempotent response and audit log...")
    try:
        save_idempotent_response(db, Idempotency_Key, json.dumps(resp))
        db.add(AuditLog(actor="system", action="provider_connect", target=str(conn.id), detail=provider_id))
        db.commit()
        print(">>> Idempotent response and audit log saved successfully")
    except Exception as e:
        print(f">>> Error saving idempotent response/audit: {e}")
        db.rollback()
    
    # Best-effort: immediately enqueue a usage sync so data is available without extra steps
    print(">>> Starting background sync process...")
    try:
        if provider_id.lower() == "openai":
            print(">>> Enqueuing OpenAI usage sync...")
            try:
                sync_openai_usage_for_connection.delay(conn.id, source=source)
                print(">>> OpenAI sync enqueued successfully")
            except Exception as e:
                print(f">>> OpenAI sync enqueue failed, trying synchronous: {e}")
                # Fallback to synchronous run when worker isn't available (dev-friendly)
                try:
                    sync_openai_usage_for_connection.run(conn.id, source=source)
                    print(">>> OpenAI sync completed synchronously")
                except Exception as e2:
                    print(f">>> OpenAI sync failed completely: {e2}")
                    pass
        elif provider_id.lower() == "gemini":
            print(">>> Enqueuing Gemini usage sync...")
            try:
                sync_gemini_usage_for_connection.delay(conn.id, source=source)
                print(">>> Gemini sync enqueued successfully")
            except Exception as e:
                print(f">>> Gemini sync enqueue failed, trying synchronous: {e}")
                try:
                    sync_gemini_usage_for_connection.run(conn.id, source=source)
                    print(">>> Gemini sync completed synchronously")
                except Exception as e2:
                    print(f">>> Gemini sync failed completely: {e2}")
                    pass
        elif provider_id.lower() == "claude":
            print(">>> Enqueuing Claude usage sync...")
            try:
                sync_claude_usage_for_connection.delay(conn.id, source=source)
                print(">>> Claude sync enqueued successfully")
            except Exception as e:
                print(f">>> Claude sync enqueue failed, trying synchronous: {e}")
                try:
                    sync_claude_usage_for_connection.run(conn.id, source=source)
                    print(">>> Claude sync completed synchronously")
                except Exception as e2:
                    print(f">>> Claude sync failed completely: {e2}")
                    pass
        elif provider_id.lower() == "azure":
            print(">>> Enqueuing Azure usage sync...")
            try:
                sync_azure_usage_for_connection.delay(conn.id, source=source)
                print(">>> Azure sync enqueued successfully")
            except Exception as e:
                print(f">>> Azure sync enqueue failed, trying synchronous: {e}")
                try:
                    sync_azure_usage_for_connection.run(conn.id, source=source)
                    print(">>> Azure sync completed synchronously")
                except Exception as e2:
                    print(f">>> Azure sync failed completely: {e2}")
                    pass
    except Exception as e:
        print(f">>> Background sync process failed: {e}")
        # Non-fatal; background sync can be triggered later
        pass

    print(">>> Connection process completed successfully")
    return resp


@router.post("/{connection_id}/sync", status_code=202)
def sync_provider_connection(connection_id: int, x_admin_token: Optional[str] = Header(default=None)):
    from ..settings import settings as _settings
    if x_admin_token != _settings.ADMIN_API_KEY:
        raise HTTPException(status_code=401, detail="unauthorized")
    # For now: try OpenAI, and route to Gemini or Claude as needed.
    try:
        # Peek provider type
        from sqlalchemy.orm import Session
        db = None
        try:
            db = next(get_db())
            conn = db.get(ProviderConnectionSA, connection_id)
            provider = (conn.provider_id or "").lower() if conn else ""
        finally:
            if db is not None:
                db.close()
        if provider == "gemini":
            sync_gemini_usage_for_connection.delay(connection_id)
        elif provider == "claude":
            sync_claude_usage_for_connection.delay(connection_id)
        elif provider == "azure":
            sync_azure_usage_for_connection.delay(connection_id)
        else:
            sync_openai_usage_for_connection.delay(connection_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return {"enqueued": True}


@router.post("/{connection_id}/sync-now", status_code=200)
def sync_provider_connection_now(connection_id: int, x_admin_token: Optional[str] = Header(default=None)):
    from ..settings import settings as _settings
    if x_admin_token != _settings.ADMIN_API_KEY:
        raise HTTPException(status_code=401, detail="unauthorized")
    # Run synchronously (no Celery required)
    # Select worker based on provider id
    try:
        db = next(get_db())
        try:
            conn = db.get(ProviderConnectionSA, connection_id)
            provider = (conn.provider_id or "").lower() if conn else ""
        finally:
            db.close()
        if provider == "gemini":
            return sync_gemini_usage_for_connection.run(connection_id)
        if provider == "claude":
            return sync_claude_usage_for_connection.run(connection_id)
        if provider == "azure":
            return sync_azure_usage_for_connection.run(connection_id)
        return sync_openai_usage_for_connection.run(connection_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class RotateKeyRequest(BaseModel):
    api_key: str


@router.post("/{connection_id}/rotate-key")
def rotate_key(connection_id: int, body: RotateKeyRequest, x_admin_token: Optional[str] = Header(default=None), db: Session = Depends(get_db)):
    """Rotate the stored API key for a provider connection.

    For now we validate OpenAI keys by calling /v1/models, then update the encrypted credentials.
    Requires admin token for safety in this phase.
    """
    from ..settings import settings as _settings
    if x_admin_token != _settings.ADMIN_API_KEY:
        raise HTTPException(status_code=401, detail="unauthorized")

    conn = db.get(ProviderConnectionSA, connection_id)
    if not conn:
        raise HTTPException(status_code=404, detail="connection not found")

    new_key = (body.api_key or '').strip()
    if not new_key:
        raise HTTPException(status_code=400, detail="api_key is required")

    # If OpenAI: validate key
    if conn.provider_id.lower() == "openai":
        headers = {"Authorization": f"Bearer {new_key}"}
        try:
            with httpx.Client(timeout=5.0) as client:
                r = client.get("https://api.openai.com/v1/models", headers=headers)
            if r.status_code != 200:
                raise HTTPException(status_code=401, detail="OpenAI key validation failed")
        except httpx.RequestError:
            raise HTTPException(status_code=400, detail="OpenAI key validation request failed")
    elif conn.provider_id.lower() == "gemini":
        headers = {"x-goog-api-key": new_key}
        try:
            with httpx.Client(timeout=5.0) as client:
                r = client.get("https://generativelanguage.googleapis.com/v1beta/models", headers=headers)
            if r.status_code != 200:
                raise HTTPException(status_code=401, detail="Gemini key validation failed")
        except httpx.RequestError:
            raise HTTPException(status_code=400, detail="Gemini key validation request failed")
    elif conn.provider_id.lower() == "claude":
        headers = {"x-api-key": new_key, "anthropic-version": "2023-06-01"}
        try:
            with httpx.Client(timeout=5.0) as client:
                r = client.get("https://api.anthropic.com/v1/models", headers=headers)
            if r.status_code != 200:
                raise HTTPException(status_code=401, detail="Claude key validation failed")
        except httpx.RequestError:
            raise HTTPException(status_code=400, detail="Claude key validation request failed")

    # Update encrypted credentials JSON
    import json as _json
    try:
        creds_str = decrypt_json(conn.encrypted_credentials)
        creds = _json.loads(creds_str) if isinstance(creds_str, str) else (creds_str or {})
        if not isinstance(creds, dict):
            creds = {}
    except Exception:
        creds = {}
    creds["api_key"] = new_key
    conn.encrypted_credentials = encrypt_json(_json.dumps(creds))
    db.add(AuditLog(actor="admin", action="provider_rotate_key", target=str(conn.id), detail=conn.provider_id))
    db.commit()

    # Best-effort: enqueue a usage sync so updated key populates data automatically
    try:
        if conn.provider_id.lower() == "openai":
            try:
                sync_openai_usage_for_connection.delay(conn.id)
            except Exception:
                try:
                    sync_openai_usage_for_connection.run(conn.id)
                except Exception:
                    pass
        elif conn.provider_id.lower() == "gemini":
            try:
                sync_gemini_usage_for_connection.delay(conn.id)
            except Exception:
                try:
                    sync_gemini_usage_for_connection.run(conn.id)
                except Exception:
                    pass
        elif conn.provider_id.lower() == "claude":
            try:
                sync_claude_usage_for_connection.delay(conn.id)
            except Exception:
                try:
                    sync_claude_usage_for_connection.run(conn.id)
                except Exception:
                    pass
    except Exception:
        pass

    return {"status": "ok", "connection_id": conn.id}


@router.get("/{connection_id}/models")
def list_models_for_connection(connection_id: int, x_admin_token: Optional[str] = Header(default=None), db: Session = Depends(get_db)):
    """Proxy provider models endpoint for the stored connection key.

    - OpenAI: GET https://api.openai.com/v1/models (Bearer)
    - Gemini: GET https://generativelanguage.googleapis.com/v1beta/models (x-goog-api-key)
    - Claude: GET https://api.anthropic.com/v1/models (x-api-key + anthropic-version)
    """
    from ..settings import settings as _settings
    if x_admin_token != _settings.ADMIN_API_KEY:
        raise HTTPException(status_code=401, detail="unauthorized")
    conn = db.get(ProviderConnectionSA, connection_id)
    if not conn:
        raise HTTPException(status_code=404, detail="connection not found")
    try:
        import json as _json
        creds_str = decrypt_json(conn.encrypted_credentials)
        creds = _json.loads(creds_str) if isinstance(creds_str, str) else (creds_str or {})
        key = (creds or {}).get('api_key')
    except Exception:
        key = None
    if not key:
        raise HTTPException(status_code=400, detail="missing api_key")
    if conn.provider_id.lower() == 'openai':
        headers = {"Authorization": f"Bearer {key}"}
        with httpx.Client(timeout=10.0) as client:
            r = client.get("https://api.openai.com/v1/models", headers=headers)
    elif conn.provider_id.lower() == 'gemini':
        headers = {"x-goog-api-key": key}
        with httpx.Client(timeout=10.0) as client:
            r = client.get("https://generativelanguage.googleapis.com/v1beta/models", headers=headers)
    elif conn.provider_id.lower() == 'claude':
        headers = {"x-api-key": key, "anthropic-version": "2023-06-01"}
        with httpx.Client(timeout=10.0) as client:
            r = client.get("https://api.anthropic.com/v1/models", headers=headers)
    else:
        raise HTTPException(status_code=400, detail="models not supported for this provider")
    if r.status_code != 200:
        raise HTTPException(status_code=r.status_code, detail="upstream error")
    return r.json()


@router.get("/{connection_id}/usage")
def get_provider_usage(connection_id: int, days: int = 30, db: Session = Depends(get_db)):
    """Return usage metrics for a provider connection. For Gemini this queries BigQuery billing export when configured."""
    conn = db.get(ProviderConnectionSA, connection_id)
    if not conn:
        raise HTTPException(status_code=404, detail="connection not found")

    provider = (conn.provider_id or '').lower()

    # Default source for response
    source = 'prod' if (conn.connection_type or '').lower() == 'production' else 'dev'

    if provider == 'gemini':
        try:
            import json as _json
            creds_json = decrypt_json(conn.encrypted_credentials)
            creds = _json.loads(creds_json) if isinstance(creds_json, str) else creds_json
        except Exception:
            creds = {}

        service_account_json = (creds or {}).get('service_account_json')
        # Use getattr defensively because older deployments may not have the
        # optional columns on the ProviderConnection model yet.
        project_id = (creds or {}).get('project_id') or getattr(conn, 'project_id', None)
        dataset_id = (creds or {}).get('bigquery_dataset_id') or getattr(conn, 'bigquery_dataset_id', None) or 'billing_export'

        if service_account_json and project_id:
            try:
                from ..services.bigquery_service import BigQueryService
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"bigquery client not available: {e}")

            try:
                bq = BigQueryService(service_account_json, project_id)
                daily_spend = bq.get_daily_spend(dataset_id=dataset_id, days=days)
                token_usage = bq.get_token_usage(dataset_id=dataset_id, days=days)
                monthly_cost = bq.get_monthly_cost(dataset_id=dataset_id)
                raw = bq.get_raw_usage(dataset_id=dataset_id, days=days)
                # Attach source label to the response as required by frontend contract
                return {
                    'daily_spend': daily_spend,
                    'token_usage': token_usage,
                    'monthly_cost': monthly_cost,
                    'raw': raw,
                    'source': source,
                }
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"failed to query bigquery: {e}")

        # Fallback: no BigQuery configured
        raise HTTPException(status_code=400, detail="no BigQuery billing credentials configured for this connection")

    else:
        # Generic placeholder: for supported providers implement provider-specific
        # usage retrieval. For now return a stable shape with `source` so the
        # frontend and downstream systems always receive that field.
        return {"data": [], "meta": {"days": days, "provider": provider}, "source": source}


@router.delete("/{provider_id}/disconnect")
def disconnect_provider(provider_id: str, db: Session = Depends(get_db)):
    """Disconnect a provider by removing its stored connection(s).

    For simplicity we delete all connections matching this provider id.
    Returns count of removed connections.
    """
    q = db.query(ProviderConnectionSA).filter(ProviderConnectionSA.provider_id == provider_id)
    items = q.all()
    if not items:
        # Idempotent: consider not-found as 200 with deleted=0
        return {"deleted": 0}
    deleted = 0
    try:
        for it in items:
            db.add(AuditLog(actor="system", action="provider_disconnect", target=str(it.id), detail=provider_id))
            db.delete(it)
            deleted += 1
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="failed to disconnect provider")
    return {"deleted": deleted}

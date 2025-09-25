# Developer Quickstart

This quickstart explains how to run the project locally and validate `source` tagging.

Run backend
1. Create a python venv and install deps:
   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```
2. Start the API (dev uses SQLite fallback):
   ```bash
   uvicorn app.main:app --reload --port 8001
   ```

Run frontend
1. Install and start:
   ```bash
   npm install
   npm run dev
   ```

Validations
- Toggle `localStorage['bimo:source']='dev'` and refresh provider detail pages to confirm `X-BIMO-SOURCE` header is set.
- Use `curl -H "X-API-Key: <key>" http://localhost:8001/v1/whoami` to verify RBAC role attachment.
- Run `pytest` in `backend/` to execute unit tests added.

Secrets & Admin
- Admin endpoints are protected by `X-Admin-Token` (value in `backend/.env` or `backend/app/settings.py`).



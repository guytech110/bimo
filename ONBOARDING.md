Developer Onboarding (ONBOARDING)
=================================

Purpose
-------
Operator/developer quick-start: exact commands to set up the project locally, run migrations, start backend/frontend, and verify CLI end-to-end (signup → device approve → connect Gemini → fetch usage).

Prereqs
-------
- Node 20+, npm
- Python 3.10+ and a virtualenv
- jq (for reading JSON in examples)
- Optional: a Google service account JSON (for BigQuery tests)

Quick reproducible steps (copy/paste)
------------------------------------
From the repo root:

1) Install node deps and build frontend + CLI

```bash
npm install
npm run build
```

2) Backend: activate the venv and install Python deps

```bash
cd backend
source .venv/bin/activate
pip install -r requirements.txt
```

3) Run DB migrations

```bash
# from backend
. .venv/bin/activate
.venv/bin/alembic upgrade head
```

4) Start backend

```bash
# from backend
. .venv/bin/activate
.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8001 --log-level info
```

5) Frontend (optional)

```bash
# from repo root
npm run dev
# open http://localhost:5173
```

End-to-end CLI test (user flow)
--------------------------------
Run these commands in a separate terminal to test the user experience:

```bash
# 1. Login via device flow (opens dashboard signup/login page)
bimo login --gateway http://127.0.0.1:8001/v1

# In the browser: sign up (or log in). If the page was opened with ?user_code=
# the dashboard will automatically call /v1/cli/device/approve and the CLI
# will receive a JWT.

# 2. Verify CLI received a token
cat ~/.bimo/config.json

# 3. Connect Gemini using a local service account JSON (replace path)
bimo connect gemini --gateway http://127.0.0.1:8001/v1 --service-account-file ~/Downloads/SA.json --smart-connect --key-type developer

# 4. List connections and fetch usage
TOKEN=$(jq -r .token ~/.bimo/config.json)
curl -s -H "Authorization: Bearer $TOKEN" http://127.0.0.1:8001/v1/providers/connections | jq
# pick a connection id and fetch usage
curl -s -H "Authorization: Bearer $TOKEN" "http://127.0.0.1:8001/v1/providers/<id>/usage?days=30" | jq
```

Troubleshooting quick tips
--------------------------
- If `alembic` fails with revision errors, follow the repair workflow in `docs/Next agent.md` or ask the current maintainer to repair it for you.
- If `bimo` CLI can't be found: either run `node ./dist/cli/index.js` or `npm install -g .` from repo root (may require sudo on macOS).
- If usage is empty: BigQuery billing export may have no rows yet; ensure the service account has BigQuery read access and the billing export exists.

If anything fails when you run these commands, paste the terminal output and I will debug the exact error.

# bimo CLI — Gemini Onboarding (Quickstart)

This guide covers using the `bimo` CLI to connect Google Gemini (Vertex) to a bimo backend.

Prereqs
- `bimo` CLI installed and on PATH (or run via `node ./dist/cli/index.js`).
- A running bimo backend reachable at `https://<your-backend>/v1` (we used Render).
- For full usage metrics: a Google service account JSON with BigQuery read access and billing export enabled.

1) Login (device flow)
- Run: `bimo login --gateway https://bimo-backend.onrender.com/v1`
- CLI prints a verification URL and code. Open the URL (or let the CLI open your browser).
- After approval the CLI saves a token to `~/.bimo/config.json`.

2) Connect Gemini (service account — recommended)
- Prepare: download `service-account.json` (the SA must have BigQuery read permissions).
- Run:
  `bimo connect gemini --gateway https://bimo-backend.onrender.com/v1 --service-account-file ~/path/service-account.json --smart-connect --key-type developer`
- What `--smart-connect` does: attempts to auto-detect the GCP project, billing account, and BigQuery dataset from the SA and performs light validation.

Alternative: Connect with API key (limited)
- Run: `bimo connect gemini --gateway https://bimo-backend.onrender.com/v1 --api-key YOUR_GOOGLE_API_KEY`

3) Verify connection and usage
- List connections:
  ```bash
  TOKEN=$(jq -r .token ~/.bimo/config.json)
  curl -s -H "Authorization: Bearer $TOKEN" https://bimo-backend.onrender.com/v1/providers/connections | jq
  ```
- Check usage for connection ID `<id>`:
  ```bash
  curl -s -H "Authorization: Bearer $TOKEN" "https://bimo-backend.onrender.com/v1/providers/<id>/usage?days=30" | jq
  ```
- If BigQuery billing export has no rows, the endpoint returns an empty safe shape (no crash).

4) Trigger an immediate sync (admin only)
- If you have the admin API key: `curl -s -H "x-admin-token: $ADMIN_API_KEY" -X POST https://bimo-backend.onrender.com/v1/providers/<id>/sync-now | jq`

Permissions & Notes
- The SA should have BigQuery Data Viewer or equivalent to read billing export tables. To surface billing metadata you may also grant Billing Viewer.
- The backend stores credentials encrypted. `connection_type` can be `developer` or `production` (affects source label).
- If the deployed backend is missing BigQuery libs it will still accept connections and return empty usage; for full queries ensure `google-cloud-bigquery` is installed in the runtime image.

Troubleshooting
- `bimo: command not found` — either run `node ./dist/cli/index.js` or install globally with `npm install -g .` (may require sudo).
- Device flow returns a demo message `{"message":"Device verification page - auto-approved for demo"}` — this indicates the backend auto-approves demo device flows; CLI should still receive a token.
- Usage returns 400 / empty — probably no billing export rows yet; enable BigQuery billing export and wait for one row.

Example minimal workflow
1. `bimo login --gateway https://bimo-backend.onrender.com/v1`
2. `bimo connect gemini --gateway https://bimo-backend.onrender.com/v1 --service-account-file ~/Downloads/sa.json --smart-connect --key-type developer`
3. `curl -s -H "Authorization: Bearer $(jq -r .token ~/.bimo/config.json)" https://bimo-backend.onrender.com/v1/providers/<id>/usage?days=30 | jq`

If you want, I can add this as a README section in the repo or create a short video/GIF showing the flow.

Changelog (what I changed during onboarding):
- Added `/v1/cli` device auth endpoints and tested device flow.
- Defensive fixes in `backend/app/routers/providers.py` to tolerate older DB schemas.
- Minimal `BigQueryService` shim at `backend/app/services/bigquery_service.py` so usage endpoints return safe empties when BigQuery client or data is absent.
- Added `google-cloud-bigquery-storage` (optional) to `backend/requirements.txt` and pushed code.
- Added onboarding docs (this file).

Install & Examples (expanded)

Global install (recommended for users):

```bash
# from the repo root
npm install -g .
# or for development
npm link
```

If global install fails due to permissions, either run the commands as an elevated user on your platform or use the local-run approach below.

Run without global install:

```bash
# run CLI directly from project
node ./dist/cli/index.js login --gateway https://bimo-backend.onrender.com/v1
```

Fix missing runtime deps (common):

```bash
# install runtime deps used by the CLI into the dist/cli folder
npm --prefix ./dist/cli install open axios commander uuid
```

Quickstart copy-paste

```bash
# Login (device flow)
bimo login --gateway https://bimo-backend.onrender.com/v1

# Connect Gemini (service account & smart-connect)
bimo connect gemini --gateway https://bimo-backend.onrender.com/v1 --service-account-file ~/Downloads/sa.json --smart-connect --key-type developer

# Connect Gemini (API key)
bimo connect gemini --gateway https://bimo-backend.onrender.com/v1 --api-key YOUR_KEY --key-type production

# List connections & check usage
TOKEN=$(jq -r .token ~/.bimo/config.json)
curl -s -H "Authorization: Bearer $TOKEN" https://bimo-backend.onrender.com/v1/providers/connections | jq
curl -s -H "Authorization: Bearer $TOKEN" "https://bimo-backend.onrender.com/v1/providers/<id>/usage?days=30" | jq
```

CI / smoke-test snippet (example)

```bash
# Expects BIMO_GATEWAY and SA_PATH env vars
BIMO_GATEWAY=${BIMO_GATEWAY:-https://bimo-backend.onrender.com/v1}
SA_PATH=${SA_PATH:-~/Downloads/sa.json}

# Login (non-interactive tests should use a pre-generated token instead)
bimo login --gateway $BIMO_GATEWAY

# Connect (idempotent) and fetch usage
bimo connect gemini --gateway $BIMO_GATEWAY --service-account-file $SA_PATH --smart-connect --key-type developer
TOKEN=$(jq -r .token ~/.bimo/config.json)
CONN_ID=$(curl -s -H "Authorization: Bearer $TOKEN" $BIMO_GATEWAY/providers/connections | jq -r '.data[] | select(.provider_id=="gemini") | .id' | head -n1)
curl -s -H "Authorization: Bearer $TOKEN" "$BIMO_GATEWAY/providers/${CONN_ID}/usage?days=30" | jq
```

PowerShell examples (Windows)

```powershell
# Login (device flow)
$bimoGateway = 'https://bimo-backend.onrender.com/v1'
bimo login --gateway $bimoGateway

# Read token and list connections
$config = Get-Content "$env:USERPROFILE\.bimo\config.json" | ConvertFrom-Json
$token = $config.token
Invoke-RestMethod -Headers @{ Authorization = "Bearer $token" } -Uri "$bimoGateway/providers/connections"
```



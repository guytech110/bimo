# CLI onboarding — cross‑environment notes

This supplement adds Windows, Cloud Shell/Codespaces, non‑interactive flags, and REST/Docker examples. Backend APIs are unchanged.

## Non‑interactive flags and env

- `--json`  : print machine‑readable output only (e.g., `{ "connection_id": 123 }`)
- `--yes`   : assume defaults, skip prompts when possible
- `--quiet` : suppress progress logs
- Env fallbacks: `BIMO_GATEWAY`, `BIMO_TOKEN`

## Windows PowerShell quick start

```
$gateway = 'https://bimo-backend.onrender.com/v1'
npx bimo-cli@latest login --gateway $gateway
npx bimo-cli@latest connect gemini --service-account-file $env:USERPROFILE\Downloads\SA.json --gateway $gateway --key-type developer --smart-connect
```

## Cloud Shell / Codespaces

1) Upload `SA.json` into your home directory, e.g. `~/sa.json`.
2) Run:

```
bimo login --gateway https://bimo-backend.onrender.com/v1
bimo connect gemini --service-account-file ~/sa.json --gateway https://bimo-backend.onrender.com/v1 --key-type developer --smart-connect
```

## REST / cURL (no CLI)

```
# 1) Start device login
curl -s -X POST https://bimo-backend.onrender.com/v1/cli/device/start | jq

# 2) Approve in browser
# https://bimo-backend.onrender.com/v1/cli/device/verify?user_code=XXXX

# 3) Poll until approved
curl -s -X POST https://bimo-backend.onrender.com/v1/cli/device/poll \
  -H 'Content-Type: application/json' \
  -d '{"device_code":"..."}' | jq

# 4) Connect Gemini (token required)
curl -s -X POST https://bimo-backend.onrender.com/v1/providers/gemini/connect \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d @payload.json | jq
```

## Docker (run CLI without local Node/npm)

Build (optional) or use a published image if available.

```
docker build -t bimo-cli -f packages/cli/Dockerfile packages/cli

docker run --rm \
  -v $HOME/.bimo:/root/.bimo \
  -v $HOME/Downloads/SA.json:/sa.json:ro \
  bimo-cli \
  bimo connect gemini --service-account-file /sa.json --gateway https://bimo-backend.onrender.com/v1 --smart-connect --key-type developer
```



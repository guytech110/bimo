#!/usr/bin/env bash
set -euo pipefail

# Simple smoke test for the bimo CLI
# Usage: BIMO_GATEWAY=https://... SA_PATH=~/Downloads/sa.json ./scripts/cli_smoke_test.sh


BIMO_GATEWAY=${BIMO_GATEWAY:-https://bimo-backend.onrender.com/v1}
SA_PATH=${SA_PATH:-$HOME/Downloads/propane-passkey-466118-v5-6ee7e38565f8.json}

echo "Starting CLI smoke test against $BIMO_GATEWAY"

# If BIMO_TOKEN provided (CI), write it into the CLI config and skip interactive login
if [ -n "${BIMO_TOKEN:-}" ]; then
  echo "Using provided BIMO_TOKEN (non-interactive)"
  mkdir -p "$HOME/.bimo"
  printf '{"token":"%s"}\n' "$BIMO_TOKEN" > "$HOME/.bimo/config.json"
else
  echo "1) Login (interactive/device flow)"
  bimo login --gateway $BIMO_GATEWAY
fi

echo "2) Connect Gemini (service account, if provided)"
if [ -n "${SA_PATH:-}" ] && [ -f "$SA_PATH" ]; then
  bimo connect gemini --gateway $BIMO_GATEWAY --service-account-file "$SA_PATH" --smart-connect --key-type developer
else
  echo "No service account file provided; skipping connect step"
fi

TOKEN=$(jq -r .token ~/.bimo/config.json)
if [ -z "$TOKEN" ]; then
  echo "No token found; login failed" >&2
  exit 2
fi

CONN_ID=$(curl -s -H "Authorization: Bearer $TOKEN" $BIMO_GATEWAY/providers/connections | jq -r '.data[] | select(.provider_id=="gemini") | .id' | head -n1)
if [ -z "$CONN_ID" ]; then
  echo "No gemini connection found" >&2
  exit 3
fi

echo "3) Fetch usage for connection $CONN_ID"
curl -s -H "Authorization: Bearer $TOKEN" "$BIMO_GATEWAY/providers/${CONN_ID}/usage?days=30" | jq

echo "Smoke test complete"



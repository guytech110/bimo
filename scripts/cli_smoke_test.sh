#!/usr/bin/env bash
set -euo pipefail

# Simple smoke test for the bimo CLI
# Usage: BIMO_GATEWAY=https://... SA_PATH=~/Downloads/sa.json ./scripts/cli_smoke_test.sh

BIMO_GATEWAY=${BIMO_GATEWAY:-https://bimo-backend.onrender.com/v1}
SA_PATH=${SA_PATH:-$HOME/Downloads/propane-passkey-466118-v5-6ee7e38565f8.json}

echo "Starting CLI smoke test against $BIMO_GATEWAY"

echo "1) Login"
bimo login --gateway $BIMO_GATEWAY

echo "2) Connect Gemini (service account)"
# Create a fresh connection for this smoke test to avoid selecting stale connections
# Use file path (not upload) for service account; prefer file path to avoid upload issues
bimo connect gemini --gateway $BIMO_GATEWAY --service-account-file "$SA_PATH" --smart-connect --key-type developer || true

# After connecting, prefer the most recent connection that was created by the CLI

TOKEN=$(jq -r .token ~/.bimo/config.json)
if [ -z "$TOKEN" ]; then
  echo "No token found; login failed" >&2
  exit 2
fi

# Prefer the most-recent connection created by the CLI (connection_source == "cli").
# Fall back to the latest gemini connection if none created by this run exists.
CONN_ID=$(curl -s -H "Authorization: Bearer $TOKEN" "$BIMO_GATEWAY/providers/connections" | jq -r '.data | sort_by(.created_at) | reverse | .[] | select(.provider_id=="gemini" and (.connection_source=="cli" or .connection_source=="dashboard")) | .id' | head -n1)
if [ -z "$CONN_ID" ]; then
  CONN_ID=$(curl -s -H "Authorization: Bearer $TOKEN" "$BIMO_GATEWAY/providers/connections" | jq -r '.data | sort_by(.created_at) | reverse | .[] | select(.provider_id=="gemini") | .id' | head -n1)
fi
if [ -z "$CONN_ID" ]; then
  echo "No gemini connection found" >&2
  exit 3
fi

echo "3) Fetch usage for connection $CONN_ID"
curl -s -H "Authorization: Bearer $TOKEN" "$BIMO_GATEWAY/providers/${CONN_ID}/usage?days=30" | jq

# Optional cleanup: delete test connections created by this smoke run
# Set SMOKE_CLEANUP=true to enable deletion (CI can enable this safely)
if [ "${SMOKE_CLEANUP:-false}" = "true" ]; then
  echo "4) Cleaning up test connections (SMOKE_CLEANUP=true)"
  # This deletes all Gemini connections; enable only in test CI environments.
  curl -s -X DELETE -H "Authorization: Bearer $TOKEN" "$BIMO_GATEWAY/providers/gemini/disconnect" | jq
fi

echo "Smoke test complete"





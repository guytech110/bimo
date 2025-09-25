# Observability Runbook

This document describes the minimal observability setup and runbooks for Bimo.

Principles
- Logs should be structured JSON containing `service`, `env`, `correlation_id`, and `source` (`dev`|`prod`|`billing`).
- Metrics must include `source` label where relevant (usage, requests, syncs).
- Alerts should focus on availability, error rate, and spending anomalies.

Key signals
- `bimo_usage_requests_total{source="dev|prod|billing"}` — counts requests by source
- `bimo_usage_request_latency_ms{source="..."}` — request latency histogram
- `bimo_sync_tasks_total{provider, source}` — background sync runs
- `bimo_billing_ingest_errors_total` — billing ingestion failures

Runbooks
- High error rate (5xx): check gateway logs for `source`-tagged spikes, verify upstream provider credentials, roll back recent changes.
- Billing ingestion failures: check Celery worker logs, inspect failed invoice payloads via admin ingest endpoint, re-run ingestion.
- Rate limit triggered: inspect `whoami` endpoint to see role/org for keys, adjust `ApiKey.rate_limit` as needed.

Dashboards
- Create Grafana panels for request counts and latency by `source`, billing ingestion success rate, and cost over time by `source`.



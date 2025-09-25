# bimo – Engineering Rules

## Product North Star
- AI-first FinOps: prompt-level visibility, caching, routing, quality checks.
- Bill-shock prevention: budgets, anomaly alerts, forecasts.
- Reliability & security: auditable, repeatable, least-privileged secrets.

All data must be clearly attributed:
- `dev` → Developer (CLI) usage (estimates)
- `prod` → Production (Gateway) usage (real-time)
- `billing` → Provider invoices (authoritative)

---

## API Design
- Contract-first (OpenAPI updated before coding).
- All usage endpoints must include `source` (enum: dev | prod | billing).

Errors must follow stable JSON format:
```json
{ "error": { "code": "BUDGET_EXCEEDED", "message": "...", "details": {} } }
```

---

## Data & Migrations
Tables must include `source`:
- `api_logs.source` ENUM('dev','prod','billing')
- `provider_metrics_daily.source` ENUM('dev','prod','billing')

---

## Frontend Contracts
- All charts must display `source` labels.  
- Never show untagged totals.

---

## Background Jobs
- Celery tasks must record source when processing usage.
- Example: `sync_provider_data` → `prod`, `sync_billing` → `billing`.

---

## Observability
- Logs must include `source` field.
- Prometheus metrics: `bimo_usage_requests_total{source="dev"}`

---

## Security & Access
- API key auth, RBAC roles (owner, admin, analyst).
- Rate limiting per org/key.

---

## Testing & CI
- Tests must validate `source` tagging.
- CI pipeline: lint, type check, tests, security scan.

---

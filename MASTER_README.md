# 📘 Bimo – Master README

## Overview
**Bimo** is a unified FinOps platform for startups and developers.  
It gives one place to:

- **Connect providers** like OpenAI, Claude, Gemini, AWS, Azure, Zoom, Slack, and more.  
- **Track usage and costs** across:
  - **AI APIs** (tokens, prompts, latency, errors)  
  - **Cloud/Infra** (compute, storage, networking)  
  - **SaaS tools** (subscriptions, meetings, usage)  
- **See insights**: summaries, trends, anomalies, recommendations.  
- **Control spend**: budgets, alerts, optimization tips.  

Think of it as **Plaid for spend visibility + CloudZero for AI + SaaS analytics**.  

---

## How It Works
Bimo tracks spend in four steps:

1. **Connect Providers**  
   - Dashboard (OAuth/API key for SaaS, billing APIs)  
   - CLI (developer usage)  
   - Gateway (production usage)

2. **Route Through Bimo Gateway**  
   - Apps call `bimo.gateway/<provider>`  
   - Requests are forwarded + logged (tokens, latency, cost, errors)

3. **Track Usage & Spend**  
   - All calls tagged by **source**:  
     - `DEV (CLI)` → developer estimates  
     - `PROD (Gateway)` → production, real-time  
     - `BILLING` → authoritative invoices

4. **Optimize With Insights**  
   - Historical patterns, model choices, prompt efficiency  
   - Budgets, anomaly alerts, forecasts  
   - AI-powered recommendations  

---

## Data Sources Matrix
| Provider Type | Connection | Metrics | Source Tag |
|---------------|------------|---------|------------|
| AI APIs (OpenAI, Gemini, Claude) | CLI | Prompts, tokens, latency, cost (estimates) | `dev` |
| | Gateway | Same as CLI + environment/project attribution | `prod` |
| | Billing API (e.g. GCP Billing) | Actual invoices, credits | `billing` |
| Cloud (AWS, GCP, Azure) | Gateway | Request counts, latency/errors | `prod` |
| | Billing API | Service-level invoices (EC2, S3, BigQuery, etc.) | `billing` |
| SaaS (Slack, Zoom, GitHub, Notion) | Dashboard OAuth/API key | Seats, usage metrics | `prod` |
| | Billing API | Invoices, plan charges | `billing` |

---

## Documentation Set

- **[Frontend Guide](frontend.md)**  
  Covers React UI, onboarding, dashboard, provider management, budgets, alerts.  
  - Must display **source tags (dev/prod/billing)** in all charts.  
  - SaaS connections may expose seats/usage but not tokens.  
  - Emphasizes design system (shadcn/ui, Tailwind, Figma assets).

- **[Backend Guide](backend.md)**  
  Covers FastAPI gateway, PostgreSQL + pgvector, Redis, Celery workers, monitoring.  
  - All usage endpoints (`/providers/{id}/usage`) return `source`.  
  - Gateway is the **secret sauce**: real-time production visibility.  
  - Billing APIs provide invoice reconciliation.  
  - CLI usage is logged separately with `dev` tag.

- **[Engineering Rules](rules.md)**  
  Governs monorepo, API design, migrations, secrets, ML integration, CI/CD.  
  - Product North Star: AI-first FinOps (prompt-level visibility, bill-shock prevention, reliability).  
  - All logs and metrics must include `source` (`dev`/`prod`/`billing`).  
  - Never merge data without labeling; dashboards must show separation.  
  - Frontend contracts enforce consistent response shapes and enum exports.

---

## Why It’s Different
- **AI Token Visibility** → goes deeper than cloud bills, down to prompt/model level.  
- **Unified Spend View** → AI, Cloud, SaaS in one place.  
- **Dev vs Prod vs Billing** → clear separation between estimates, live usage, and actual invoices.  
- **Developer-Friendly CLI + Gateway** → no workflow disruption.  
- **Optimization Advice** → cheaper models, caching, anomaly alerts, and forecasts.  

---

✅ This README anchors the vision, while each sub-doc (frontend, backend, rules) expands in its lane.  
New contributors or investors can start here, then dive deeper as needed.  

# bimo – Backend Integration Guide

## Overview
The backend powers Bimo’s API gateway, provider sync, and spend analytics.

Bimo supports two types of connections:
- **Developer (CLI)**: Developer usage flows through the CLI proxy. Captures fine-grained API calls (prompt size, tokens, latency).
- **Production (Gateway)**: Deployed apps call Bimo’s gateway endpoints. Captures production usage, separated by project/environment.
- **Billing (Provider APIs)**: Authoritative invoices from AWS Cost Explorer, GCP Billing, SaaS invoices.

---

## Key Components
- **FastAPI** backend with PostgreSQL + pgvector
- **Gateway**: the secret sauce → proxies production requests and logs usage
- **Celery workers**: provider sync, budget checks, anomaly alerts
- **Redis**: caching + queue
- **Prometheus + Grafana**: metrics + dashboards

---

## API Surface
- `GET /providers/{id}/usage`  
  Returns usage with `source` field (`dev`, `prod`, `billing`).

- `POST /optimize`  
  Routes model calls (production), logs tokens, cost, latency.

- `GET /budget`, `GET /alerts`  
  Budgets and anomaly alerts.

---

## Core Flows
- **Optimize Flow** (Gateway):  
  Production calls routed through Bimo. Semantic cache + model selection applied. Tagged as `prod`.

- **CLI Flow**:  
  Developer activity logged, tagged as `dev`. Used for debugging and prompt analytics.

- **Billing Flow**:  
  Monthly invoices pulled from provider billing APIs. Tagged as `billing`.

---

## Frontend Integration
- Frontend charts must display usage with source tags.
- Example: `/spend/trends` returns `{ source: "prod", ... }`.

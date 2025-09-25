# bimo – Frontend Guide

## Overview
This document describes the **frontend architecture** and features of Bimo.

---

## Core Features & Components

### Dashboard
Central command center for spending analytics.

**Key Metrics**:
- Total Spend
- AI Spend
- Cloud Spend
- SaaS Spend

**Data Source Labels**
To avoid confusion between estimates and actuals, all metrics in the dashboard are tagged:

- **DEV (CLI)** → Usage captured from developers coding locally via the Bimo CLI. Best for prompt/token counts and debugging.
- **PROD (Gateway)** → Usage captured from production apps routed through Bimo’s gateway endpoints. Near-real-time, reliable for monitoring live spend.
- **BILLING** → Actual invoice data from provider billing APIs (e.g. GCP Billing, AWS Cost Explorer, SaaS invoices). Authoritative for reconciliation.

The dashboard merges these three views but always keeps them distinguishable.

### Provider Management
- Provider cards display connection status and metrics.
- SaaS providers (Zoom, Slack, Notion, etc.) may only expose billing/seat data, not tokens.
- AI providers (OpenAI, Gemini, Claude):  
  - CLI connections reflect **developer usage**.  
  - Gateway connections reflect **production usage**.

### Onboarding Flow
- Step 1: Welcome screen
- Step 2: Provider connection
- Step 3: Budget + alert setup

---

## Design System
- **Framework**: React + TypeScript
- **UI**: shadcn/ui components, TailwindCSS v4
- **Branding**: Figma logos, Inter font, teal (#14b8a6)
- **Dark Mode**: Full support

---

## Navigation
- Onboarding → Dashboard → Providers → Budgets → Billing → Users → Monitoring
- All usage views must show **source tags** (`dev`, `prod`, `billing`)

---

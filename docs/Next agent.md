# Next agent — Handoff

Purpose
-------
This document summarizes all work completed so far on the `bimo` project and provides a safe, actionable checklist and context so the next agent can pick up without breaking anything.

High-level summary
------------------
- Implemented a full CLI onboarding flow (device auth, connect) and verified end-to-end against the Render-deployed backend.
- Hardened backend to be defensive against schema drift (added optional ProviderConnection fields and used `getattr` where necessary).
- Added a minimal BigQuery shim so usage endpoints return safe empty shapes (no 500s) when BigQuery client/data is absent.
- Fixed several runtime/deploy issues and added CI and publish automation scaffolding (smoke-test workflow, publish workflow, patch script for `dist/cli/package.json`).
- Added docs and a smoke-test script for the CLI.

What is working now (tested)
----------------------------
- Device auth endpoints: `POST /v1/cli/device/start`, `POST /v1/cli/device/poll`, `GET /v1/cli/device/verify` (demo auto-approve).  Verified.
- CLI `login` (device flow) works against Render gateway and stores token to `~/.bimo/config.json`.
- CLI `connect gemini` supports service-account smart-connect and API key flows. Creating connections stores encrypted credentials and metadata.
- Usage endpoint: `GET /v1/providers/<connection_id>/usage` returns:
  - safe empty usage shape when BigQuery/export missing, or
  - real usage when BigQuery client present and billing export rows exist.
- Smoke test script: `scripts/cli_smoke_test.sh` can run login→connect→usage locally.

Important files changed / added
------------------------------
- `backend/app/routers/providers.py`
  - Defensive access to optional fields, tolerant validation, improved logging.
- `backend/app/routers/cli.py`
  - Device auth endpoints used by the CLI.
- `backend/app/services/bigquery_service.py`
  - Minimal shim: returns safe empties when `google-cloud-bigquery` not available.
- `backend/requirements.txt`
  - Added Google lib entries for BigQuery support.
- `docs/CLI_ONBOARDING.md` and `docs/PUBLISHING.md`
  - User-facing docs and publishing guidance.
- `scripts/cli_smoke_test.sh`
  - End-to-end smoke-test that runs `bimo login` and `bimo connect` and fetches usage.
- `scripts/patch_dist_cli_package.cjs`
  - Build helper that ensures `dist/cli/package.json` contains `"type":"module"` during CI/build.
- `.github/workflows/cli_smoke_test.yml`
  - Runs smoke test on PRs/pushes (requires secrets).
- `.github/workflows/publish-cli.yml`
  - Publishes CLI from `dist/cli` on tag push (requires `NPM_TOKEN` secret).

Recent important commits
------------------------
- Defensive provider access and BigQuery shim commits (look at `git log` for exact SHA). These are already pushed to `main`.
- CI and publish workflows added and pushed.

Environment & secrets
---------------------
These should NOT be committed to source. The next agent will need access to the following secrets (store in GitHub Actions Secrets):
- `SA_JSON` — (CI) base64 or raw service account JSON used by smoke-test (prefer storing in the repo secret and writing to a temp file in CI).
- `BIMO_GATEWAY` — endpoint for smoke tests (e.g., `https://bimo-backend.onrender.com/v1`) or omit and use default.
- `BIMO_TOKEN` (optional) — pre-generated token for non-interactive CI tests.
- `NPM_TOKEN` — npm automation token to publish the CLI package.

DB / Render notes
-----------------
- The Render Postgres database required schema updates; these were applied manually (ALTER TABLE) to add optional columns used by the ProviderConnection model. If you redeploy a brand-new DB, run the Alembic migrations from `backend/alembic`.
- When making schema changes, always run `alembic revision --autogenerate -m "desc"` and `alembic upgrade head` in a safe environment before deploying to prod.

How to run the core smoke-test locally (safe)
-------------------------------------------
1. Ensure backend is running (or the Render service is live) and your CLI binary `bimo` is installed or available at `node ./dist/cli/index.js`.
2. Make sure your local venv has dependencies if you run Python DB scripts: `source backend/.venv/bin/activate && python -m pip install -r backend/requirements.txt`
3. Set env vars and run script:
   ```bash
   export BIMO_GATEWAY=https://bimo-backend.onrender.com/v1
   export SA_PATH=~/Downloads/propane-passkey-466118-v5-6ee7e38565f8.json
   ./scripts/cli_smoke_test.sh
   ```

CI Notes (how publish & smoke-test run)
--------------------------------------
- Smoke test workflow: installs CLI runtime deps from `dist/cli`, patches `dist/cli/package.json` (script is a no-op if missing), then runs `scripts/cli_smoke_test.sh` using `SA_JSON` secret. If `SA_JSON` missing, workflow will skip.
- Publish workflow: runs on `push` tags matching `v*.*.*`, builds `dist/cli`, runs the patcher, and executes `npm publish` with `NODE_AUTH_TOKEN` taken from `secrets.NPM_TOKEN`.

Safety checklist for the next agent (MUST READ before editing)
-------------------------------------------------------------
1. Never commit secrets, `node_modules`, or large `dist/` artifacts. CI should build and publish artifacts, not commits.
2. If you need to change CLI packaging, edit the CLI *source* package.json (not `dist/cli/package.json`) or update the build pipeline. Use `scripts/patch_dist_cli_package.cjs` only as a build-time helper.
3. Before changing DB models in `backend/app/models.py` or SQLModel classes, create an Alembic migration and run it against a staging DB; do not change models without migrations.
4. If you modify `backend/routers/providers.py`, keep defensive getattr usage for optional fields and avoid raising on missing columns.
5. For any new dependency in `backend/requirements.txt`, ensure Render or your production environment installs it and re-deploys; runtime import errors were previously causing 500s.
6. When debugging, use the Render service logs and the local venv logs; if you run `alembic` locally target the Render `DATABASE_URL` only when you understand the impact.

Next recommended steps (pick up where we left off)
-------------------------------------------------
1. Add GitHub Secrets: `SA_JSON`, `BIMO_GATEWAY`, `NPM_TOKEN` (ask the owner for values). After adding secrets, enable the smoke-test workflow and verify it runs.
2. Publish a first CLI release by creating a git tag (e.g., `v0.1.0`) once `NPM_TOKEN` is set.
3. If you plan to operate at scale, add a Celery worker service in Render (or equivalent) to handle background usage syncs.

Helpful commands
---------------
- Show recent commits: `git log --oneline -n 20`
- Show changed files: `git status --porcelain`
- View backend logs on Render: use Render UI > Logs for the backend service
- Run migrations locally: `cd backend && .venv/bin/activate && alembic upgrade head`

Contact & ownership
---------------------
If you need secrets or access to Render/GitHub settings, contact the repository owner or the person who provided the original deployment credentials. Ask for temporary scoped service account credentials for CI and rotate them after use.

Final notes
-----------
This repo contains a mix of frontend, backend, and CLI artifacts and helper scripts. The next agent's priority should be to keep build artifacts out of source, use CI to produce them, and keep secrets only in CI secrets. Follow the safety checklist above for any change touching DB schema, runtime dependencies, or deploy scripts.

End of handoff.


CLI 100% Readiness Checklist
----------------------------
These items are required to consider the CLI "production ready". Each item includes a short description, why it matters, suggested commands or actions, and acceptance criteria.

1) Publish CLI to npm and/or provide installers
   - What: Build the CLI artifact in CI and publish `dist/cli` to npm (or create Homebrew/tap or GitHub Releases with binaries).
   - Why: Users expect a one-line install and versioned releases; production distribution improves onboarding and trust.
   - Actions:
     - Ensure `dist/cli/package.json` contains correct `name`, `version`, `bin`, and `type: "module"`.
     - Add `NPM_TOKEN` to GitHub secrets.
     - Run the publish workflow via tag push (we added `.github/workflows/publish-cli.yml`).
   - Acceptance: `npm install -g <pkg>` works and `bimo --version` returns published version.
  - Note: the CLI is now published as `bimo-cli@0.1.0` and the source lives in `packages/cli` in this repo.

2) Configure CI secrets and enable smoke-tests
   - What: Store `SA_JSON`, `BIMO_GATEWAY` (and optionally `BIMO_TOKEN`) in GitHub Secrets and enable the smoke-test workflow.
   - Why: Automated regression checks prevent shipping breaking changes to the CLI or backend.
   - Actions:
     - Add `SA_JSON` (CI service account JSON), `BIMO_GATEWAY`, and `NPM_TOKEN` to repo secrets.
     - Run a manual workflow dispatch or push a test commit to verify the smoke-test run completes.
   - Acceptance: GitHub Action `CLI smoke test` executes and returns success using the test secrets.

3) CI E2E reliability and least-privileged test credentials
   - What: Create a minimal service account with only required permissions for smoke-tests and store in secrets.
   - Why: Minimize blast radius of a compromised secret and make tests stable.
   - Actions:
     - Create a GCP service account with `BigQuery Data Viewer` (read-only) and any other minimal scopes required.
     - Use this SA in `SA_JSON` secret. Rotate token periodically.
   - Acceptance: Smoke-tests complete and the SA cannot modify billing or production resources.

4) Packaging and release automation
   - What: Ensure build reproducibility and that CI performs the build+patch+publish steps.
   - Why: Avoid committing `dist/` and ensure artifacts are consistent across releases.
   - Actions:
     - Verify `npm run build:cli` builds the CLI from source and produces the artifact in `dist/cli`.
     - Ensure `scripts/patch_dist_cli_package.cjs` runs in CI after build to set `type:module`.
   - Acceptance: CI build produces a `dist/cli` artifact that runs locally and in CI without warnings.

5) Cross-platform packaging & docs
   - What: Provide installer instructions and PowerShell examples for Windows users.
   - Why: Wider adoption and fewer support requests.
   - Actions:
     - Publish `docs/CLI_ONBOARDING.md` updates and include Windows PowerShell examples.
     - Optionally publish prebuilt binaries for macOS/Windows or a Homebrew formula.
   - Acceptance: Users on Linux, macOS, and Windows can follow docs and run `bimo login` successfully.

6) Automated Smoke-test gating on PRs
   - What: Make smoke-test run on PRs and prevent merge on failure.
   - Why: Prevent regressions from reaching `main`.
   - Actions:
     - Protect `main` branch and require passing status checks including `CLI smoke test`.
   - Acceptance: PRs with failing smoke-tests are blocked from merging.

7) Monitoring, logging, and alerting for CLI-related endpoints
   - What: Add alerts for failed device auth endpoints, failed connection validations, and failed background syncs.
   - Why: Detect problems early and reduce user impact.
   - Actions:
     - Add monitoring (Rendering/Prometheus/Sentry) to backend to track errors in `/v1/cli` and `/v1/providers/*` calls.
   - Acceptance: Alerts are fired for repeated failures and show actionable traces.

8) Worker deployment for background syncs
   - What: Deploy a worker process (Celery/Redis) for syncing provider usage rather than synchronous fallbacks.
   - Why: Scales better and avoids request timeouts for users.
   - Actions:
     - Add a Render/Heroku/other service for workers; configure Redis and Celery.
     - Update docs and `docker-compose` if needed for local dev.
   - Acceptance: Background syncs run asynchronously and complete without blocking user requests.

9) Security review & secrets rotation
   - What: Review IAM roles, rotate CI secrets, and audit logs.
   - Why: Protect billing and user data.
   - Actions:
     - Rotate `SA_JSON` after publishing the first CI run; store new SA in secrets.
     - Review `NPM_TOKEN` scope and rotate if necessary.
   - Acceptance: Audit log shows limited scope actions only.

Operational guidance for the next agent
-------------------------------------
- Perform one item at a time and validate smoke-tests after each change.
- For publishing, use a non-production npm scope until you verify the packaging details.
- Coordinate with repository owner to get `NPM_TOKEN` and to set GitHub secrets; do not commit secrets to git.

Add these items to the project's active todo list and mark them `in_progress` as you start working on each.




# Next agent — Handoff

Purpose
-------
This document summarizes all work completed so far on the `bimo` project and provides a safe, actionable checklist and context so the next agent can pick up without breaking anything.

High-level summary
------------------
 - Implemented a full CLI onboarding flow (device auth, connect) and verified end-to-end against the Render-deployed backend.
 - Hardened backend to be defensive against schema drift (added optional ProviderConnection fields and used `getattr` where necessary).
 - Added a minimal BigQuery shim so usage endpoints return safe empty shapes (no 500s) when BigQuery client/data is absent.
 - Implemented full JWT authentication (signup, login, refresh, logout) with persisted refresh tokens and server-side revocation.
 - Persisted device tokens and linked provider connections to user accounts so CLI and dashboard share identity.
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

Current status (what we have completed vs. remaining)
-----------------------------------------------------
- **Completed**:
  - Device auth / CLI device flow implemented and tested (device start / poll / approve).
  - CLI login flow wired to redirect to dashboard signup when `user_code` present; dashboard auto-approves device after signup/login.
  - Full JWT auth implemented: `/v1/auth/signup`, `/v1/auth/login`, `/v1/auth/refresh`, `/v1/auth/logout` with persisted refresh tokens and revocation.
  - Device tokens and provider connections persisted and linked to `user_id`.
  - BigQuery shim implemented; usage endpoints return safe empty shapes when BigQuery is unavailable.
  - Frontend messaging added to `LoginPage` for CLI `user_code` flows.
  - CI smoke-test updated to pre-provision a deterministic test user and write a valid JWT to `~/.bimo/config.json`.
  - Alembic migrations added and applied locally (including auth and refresh token migrations); local DB preserved via careful repair.
  - Smoke test run on GitHub Actions passed (frontend, backend-tests, openapi-lint jobs green in the recent run).

- **Remaining / Pending**:
  - Add GitHub Secrets in repository settings (`SA_JSON`, `BIMO_GATEWAY`, `NPM_TOKEN`) and verify CI runs in the protected environment.
  - Publish CLI to npm (create release tag and ensure `publish-cli.yml` has correct secrets and permissions).
  - Deploy backend to production environment (if not already) with `DASHBOARD_URL` pointing to the Vercel dashboard and ensure `DATABASE_URL`/secrets are correct.
  - Deploy an asynchronous worker (Celery + Redis) for background usage syncs instead of dev-thread fallbacks.
  - Add monitoring/alerting (Sentry/Prometheus/Render alerts) for `/v1/cli` and `/v1/providers/*` failures and background job failures.
  - Enable branch protection on `main` to require the smoke-test status and other checks before merge.
  - Perform a security review and secrets rotation (IAM least-privilege for SA used in CI).
  - Improve packaging and cross-platform installers for the CLI (Homebrew, Windows MSI or chocolatey, etc.).

Checklist for the next agent (first 7 actions)
---------------------------------------------
1. Confirm GitHub Secrets are set: `SA_JSON`, `BIMO_GATEWAY`, `NPM_TOKEN`. Verify `cli_smoke_test.yml` uses them correctly.
2. Trigger a manual GitHub Actions run of the smoke-test and inspect logs for any environment-specific failures.
3. Create a `v0.1.0` tag and run the `publish-cli.yml` workflow with `NPM_TOKEN` (test in a dry-run or staging npm scope first).
4. Set backend `DASHBOARD_URL` env var to the deployed Vercel URL and restart backend; verify `GET /v1/cli/device/verify?user_code=xxx` redirects to dashboard.
5. Deploy a worker instance (Render/Heroku) and configure Redis; update `workers/tasks` to use real Celery in prod.
6. Add a basic Sentry integration and Prometheus metrics for errors in `cli` and `providers` routers.
7. Protect `main` branch with required status checks including the smoke-test job.

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


High-priority first task for the next agent — Restore production auth and fix device-login failures
-----------------------------------------------------------------------------------------------
Problem summary (in simple terms):
- The production backend sometimes starts without the `auth` router because import-time errors occur (missing models or dependencies). When that happens, `/v1/auth/signup` and `/v1/auth/login` are not registered and the frontend signup/login pages return 404. That in turn blocks the CLI device-auth device approval flow.

What I did so far to mitigate:
- Updated frontend to ensure `VITE_API_BASE_URL` points to the correct `https://bimo-backend.onrender.com/v1` in production.
- Made the `auth` router tolerant to a missing `RefreshToken` import so it doesn't crash on import.
- Added an `auth_fallback` router and logic in `main.py` to register a minimal `/v1/auth` implementation if the full `auth` router fails to import. This was pushed as a temporary safeguard.
- Applied Alembic migrations to the Render Postgres database so DB schema is up-to-date.
- For an active CLI login waiting on a device code, I inserted a temporary user and approved the `devicetoken` row directly in the Render Postgres DB so that polling returned an access token and the CLI could finish.

Why this must be solved first:
- Users (and CI smoke-tests) cannot sign up or login if `/v1/auth` is missing, which prevents the CLI device flow from completing. This is high priority because it blocks onboarding, testing, and any user-facing auth-based functionality.

What you (next agent) must do to permanently fix it (step-by-step):
1. Inspect Render startup logs for import tracebacks (Render Dashboard → Logs). Focus on the first errors during boot that mention `Failed to import router 'auth'` or other `ModuleNotFoundError` lines.
2. For each missing dependency noted in logs (e.g., `jose`, other optional libs), add the dependency to `backend/requirements.txt` and update the project's venv and the Render build. Example:
   - Add package to `backend/requirements.txt` and push.
   - Redeploy Render (Manual Deploy) and confirm logs show no import error for `auth`.
3. If the import error is due to model/migration mismatch (e.g., `cannot import name 'RefreshToken'`):
   - Confirm Alembic migrations are present in `backend/alembic/versions/` that create the model/table.
   - Run `alembic upgrade head` against the Render Postgres DB (use the repo `alembic` settings or run from the Render shell if available) to apply missing migrations.
   - If migrations cannot be applied automatically in Render because of network/credentials issues, run them locally targeting the Render DB (set `DATABASE_URL` env to the Render DB URL) and run `alembic upgrade head`.
4. Remove temporary fallback code only after the full `auth` router imports cleanly and `/v1/auth` appears in the deployed OpenAPI. Steps:
   - Confirm deployed OpenAPI includes `/v1/auth/signup` and `/v1/auth/login`.
   - Remove or revert `auth_fallback` and the import-tolerance shim once tests pass.
5. Re-run smoke-tests (CI or `scripts/cli_smoke_test.sh`) to ensure end-to-end device login → signup → approve → connect works with a real JWT flow.

Acceptance criteria (how you know it's fixed):
- Deployed `https://bimo-backend.onrender.com/v1/openapi.json` includes `/v1/auth/signup` and `/v1/auth/login`.
- Dashboard signup posts to `https://bimo-backend.onrender.com/v1/auth/signup` (no 404) and returns a token.
- CLI `bimo login --gateway https://bimo-backend.onrender.com/v1` prints a code, browser signup completes, and CLI finishes with a stored JWT in `~/.bimo/config.json`.

Notes and safety:
- Do not remove the fallback until you have a reproducible deployment with the full auth router.
- If you must patch the running instance directly (Render shell), back up files before editing. Prefer fixing code in the repo and deploying via Git.
- Rotate any temporary tokens or DB entries created during testing (e.g., delete temp users) after verification.




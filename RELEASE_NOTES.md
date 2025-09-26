## bimo CLI — v0.1.0 (published)

Released: 2025-09-26

Highlights
- Publish first CLI package `bimo-cli@0.1.0` to npm.
- Added CLI monorepo under `packages/cli` and CI build/publish automation.

User visible changes
- Installable via `npm install -g bimo-cli` (or `npx bimo-cli`).
- CLI commands: `bimo login`, `bimo connect <provider>`, `bimo env export`.

Notes for maintainers
- The CLI source now lives at `packages/cli`. CI builds the package with `npm ci` and `npm run build` before publishing.
- If you change the CLI, update `packages/cli/package.json` and commit `package-lock.json` to keep CI deterministic.




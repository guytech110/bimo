# Publishing the bimo CLI

This document explains how to safely publish the `bimo` CLI to npm and wire up GitHub Actions to publish releases from tags.

High-level strategy
- Do not commit `dist/` build artifacts into source control.
- Build the CLI artifact in CI, patch the `dist/cli/package.json` (we already have a helper script) to set `type: "module"`, then publish from the built `dist/cli` directory.

Prerequisites
- Create an npm automation token with the `publish` scope (https://docs.npmjs.com/creating-and-viewing-access-tokens).
- Add the token to the repository secrets as `NPM_TOKEN`.

Safe GitHub Action (publish on tag)
- Create a tag (e.g. `v1.2.3`). The workflow will run on `push` of that tag and publish a package.

Example workflow (already provided as ` .github/workflows/publish-cli.yml`):

What it does (summary):
1. Checks out the repo.
2. Runs the repo build step to produce `dist/cli`.
3. Runs `node scripts/patch_dist_cli_package.cjs` to ensure `type: "module"` is present.
4. Uses the `NPM_TOKEN` secret to authenticate and publishes `dist/cli` as the CLI package.

Checklist before publishing
- Make sure package `name` and `version` in the CLI package.json are correct and won't overwrite an unrelated package.
- Use a scoped package name if you want org scoping (e.g., `@yourorg/bimo`).
- Test publish locally using `npm pack` from the `dist/cli` folder to validate tarball contents.

Rollback and safety
- Publishing runs only on tag pushes, not on every push.
- If a publish fails or is incorrect, deprecate the npm version and publish a corrected patch version.






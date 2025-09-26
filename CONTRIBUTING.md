Thank you for contributing to bimo!

Please follow this simple process to keep `main` stable and CI-green.

1. Create a branch for your change
   - Use a descriptive name: `feature/cli-improvement` or `fix/providers-validate`

2. Open a Pull Request (PR) targeting `main`
   - Push your branch and open a PR in GitHub.

3. Automatic checks
   - CI will run the following checks automatically on your PR:
     - `ci` (unit/static checks)
     - `OpenAPI Lint` (Spectral)
     - `CLI smoke test` (end-to-end smoke test)

4. Address failures
   - If any job fails, fix the problem in your branch and push; CI will re-run.

5. Code review
   - At least one approving review is required before merging.
   - Address reviewer feedback in the PR.

6. Merge
   - Once required checks pass and reviews are approved, merge the PR into `main`.

Branch protection policy (what the repo enforces)
- Protect `main` so that:
  - The `cli smoke test` status check is required.
  - At least one approving review is required before merge.
  - Force-pushes to `main` are blocked.

If you need help setting branch protection or running the smoke-test locally, contact the repo owner.




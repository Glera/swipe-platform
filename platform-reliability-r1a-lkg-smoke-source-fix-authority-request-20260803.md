# Platform Reliability R1-A — LKG smoke source-fix authority request

Prepared: 2026-08-03 UTC.

Status: **DRAFT; REQUIRES INDEPENDENT REVIEW AND EXPLICIT OPERATOR GO**.

Candidate-v3 run `30845173288/1` failed closed before candidate build or
publication. The independently accepted failure packet is exact meta commit
`6cb47b16148956fdeaaeb04d6cafd61b95700f95`. Its one-dispatch authority is
consumed and cannot be retried.

This request asks only to create a new two-file source-fix draft PR. It does not
ask to merge or publish anything.

## Exact proposed source package

- base: backend `master` only while it equals
  `f2a840517956c4f480fc9d8aaf6f832ebde489d9`;
- new branch: `codex/r1a-lkg-pythonpath-fix-20260803`;
- allowed files only:
  - `.github/workflows/platform-release-image.yml`;
  - `tests/test_platform_release.py`.

The workflow diff adds exactly one argument inside the existing LKG-forward
smoke container:

```yaml
-e PYTHONPATH=/app \
```

It sits after `EXPECTED_SCHEMA_REVISION` and before feature flags. The test
extends the existing bounded `lkg_smoke` substring assertions to require that
exact argument exactly once and before the `/smoke.py` mount. A local
test-only mutation must fail on the accepted base and pass after the workflow
line is present.

The correction may not change the smoke script, image, compatibility ranges,
baseline, build/publication/manifest logic, product behavior or Mission
runtime.

## Execution boundary after a future GO

After every JSON preflight check passes, the window may create the one branch,
make the exact two-file diff, run the complete platform-release verification,
commit once, push once and open one draft `DO NOT MERGE` PR. Only automatic PR
CI may run. The exact head and CI receipts then go to independent read-only
review.

No second push or automatic repair beyond the required diff is allowed. Any
drift, red-test mismatch, extra file, local/CI failure or P1/P2 review finding
stops the window for a new decision.

## Hard boundary

This request grants no merge, manual workflow dispatch/rerun, candidate-v3
retry, image publication/rebuild/relabel/delete, GitHub production-environment
mutation, Render access/mutation, deploy, production migration, rehearsal,
cutover, Stage 1 runtime action or generative-feed expansion.

After a green independently accepted draft PR, source merge requires another
operator authority with fresh production Auto Sync/Deploy-off evidence.
Candidate-v4 publication is a later separate decision after merge.

Example operator form, not an authorization:

> GO R1-A LKG-smoke source-fix for packet `<exact-reviewed-commit>` only.
> From backend master only while it equals
> f2a840517956c4f480fc9d8aaf6f832ebde489d9, create branch
> codex/r1a-lkg-pythonpath-fix-20260803; apply only the committed two-file
> PYTHONPATH/test diff; prove red→green, run required local checks, commit/push
> once, open one draft DO NOT MERGE PR, observe automatic CI and obtain
> independent review. No merge, manual workflow dispatch/rerun, image action,
> GitHub-environment or Render mutation, deploy, production migration,
> rehearsal, cutover or Stage 1 runtime action.

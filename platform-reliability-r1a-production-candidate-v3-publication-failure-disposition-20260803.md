# R1-A candidate-v3 failure — proposed corrective disposition

Prepared: 2026-08-03 UTC.

Status: **PROPOSED; REQUIRES INDEPENDENT REVIEW BEFORE A NEW OPERATOR
REQUEST**.

## Classification

Accept run `30845173288/1` as a correctly contained fail-closed publication
attempt. Its one-dispatch authority is terminally consumed. It produced no
candidate image, sidecar or persistent external authority.

Classify the immediate defect as
`lkg_forward_smoke_container_python_path_bootstrap_defect`. The exact LKG
compatibility verdict is **not reached**, because import failed before the
smoke opened a database session or compiled a baseline-owned table/view read.

## Narrow source correction proposal

A future, separately authorized backend source package may change only the
reviewed publication harness and its regression proof:

1. add `-e PYTHONPATH=/app` to the exact LKG `docker run` in
   `.github/workflows/platform-release-image.yml`;
2. extend `tests/test_platform_release.py` so a mutant that removes or changes
   that exact container path fails;
3. run the targeted platform-release tests, Mission architecture guard and
   fresh PR CI;
4. obtain independent review of the exact source diff;
5. merge only under a new source-merge authority with production Auto
   Sync/Deploy still proven off;
6. prepare a new candidate-v4 publication authority against the resulting new
   merge SHA. It must publish once, not rerun the failed workflow or relabel
   `f2a840...`.

The correction must not weaken the smoke, skip the old image, widen LKG
compatibility, rebuild the baseline, change product/Stage 1 runtime behavior or
modify Render/cutover authority.

## Withheld actions

This disposition grants no source edit, branch/ref write, PR, merge, workflow
dispatch, image publication, baseline rebuild, GitHub environment mutation,
Render key/provider action, deploy, migration, rehearsal, cutover or Stage 1
runtime action.

After independent review, the next operator request should authorize only a
bounded source-fix branch/PR plus local and CI evidence. Publication remains a
later separate decision after that source is merged and reviewed.

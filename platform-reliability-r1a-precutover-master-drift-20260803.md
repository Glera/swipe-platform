# Platform Reliability R1-A — contained master drift

Observed: 2026-08-03 UTC.

Status: **HARD STOP CONTAINED; NO EXTERNAL AUTHORITY CREATED OR USED**.

The operator named meta packet
`099f3de71c25c19492f53c79194f850713ce22f2` for the bounded pre-cutover
preparation. Its first action-time CAS check expected backend `master` at
`a12ca7ecea0f47e8862b4ba91879dff63cb46bfc`, but the remote head was already
`7b41e96ad0d979863159ebdd356122af6295a203`. Execution refused before reading
or creating any Render credential.

The movement was merged PR
[#49](https://github.com/Glera/swipe-backend/pull/49), `R1: keep production
auto-deploy disabled`: source `7a04bb74f29ca8373fe21e47a44d0d1e209dddf9`,
merge commit `7b41e96ad0d979863159ebdd356122af6295a203`, merged
`2026-08-03T13:03:58Z`. The PR changed only `render.yaml` (+5/−0) by pinning
Auto Deploy Off for the web service and both surviving crons and documenting
the operator-gated rule.

## Containment

- no temporary Render API key was created, so the 60-minute cleanup deadline
  never started;
- no provider capture or database job ran;
- no GitHub `production` environment, secret or variable was created;
- no image publication, merge, Render mutation, deploy or migration occurred;
- both Stage 1 branches remained byte-for-byte outside this work.

The production baseline image remains the accepted forward-only rollback LKG.
The image built from old candidate `11c9bce9891ae5b041215056ac4521551a056cb5`
is retained only as historical evidence: it cannot represent a successor based
on the new `master` and is stale as deploy authority.

Recovery therefore requires a reviewed successor based on exact new `master`,
then one new immutable candidate publication whose manifest names that exact
source SHA. Rebuilding the accepted baseline would add cost and risk without
improving rollback evidence.

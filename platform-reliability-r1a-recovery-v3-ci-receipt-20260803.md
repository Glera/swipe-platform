# Platform Reliability R1-A — recovery v3 CI receipt

Observed: 2026-08-03 UTC.

Status: **CI PASS AT EXACT HEAD; DRAFT/NO MERGE AUTHORITY**.

Backend PR [#52](https://github.com/Glera/swipe-backend/pull/52) remained draft
at exact base `f0cc933fb813be2e4784200592efced196d74973` and exact head
`8ea6f1de6d2fe4bbb43b56698fd135649130d3c5`. GitHub master still resolved to
the exact base after CI completed.

## Image workflow

- run: [30833244754](https://github.com/Glera/swipe-backend/actions/runs/30833244754);
- event: `pull_request`, head exact `8ea6f1d...`;
- `Compact image and immutable sidecar`: SUCCESS;
- no publish input and no image publication.

As independently reviewed, automatic PR CI does not execute the private exact
OCI LKG gate because that gate requires a separately authorized
`workflow_dispatch` with `publish=true`. The successful build proves workflow
and candidate build viability, not real LKG-image execution.

## PostgreSQL 16 workflow

- run: [30833244184](https://github.com/Glera/swipe-backend/actions/runs/30833244184),
  final attempt 2, head exact `8ea6f1d...`;
- all 28 PR checks: SUCCESS;
- every isolated migration job passed, including
  `mission-slice-core-0071`, `mission-ops-receipts-0072` and
  `platform-release-receipts-0073`;
- reverse drift: SUCCESS;
- full aggregate acceptance on attempt 2:
  - main PostgreSQL glob: `581 passed, 41 skipped`;
  - Mission core/API: `66 passed`;
  - device-flow contour: `18 passed`;
  - durable-authorization migration: `1 passed`;
  - final database head:
    `0073_platform_release_receipts`.

Attempt 1's aggregate job had `580 passed, 41 skipped` and one unrelated
timing-window alignment failure in
`test_straggler_across_boundary_retargets_by_clock_not_transaction_start`.
All isolated migration jobs were already green. Per the accepted CI-cost rule,
only `gh run rerun --failed` was used; no second workflow dispatch or duplicate
matrix was created. Attempt 2 passed without a code change.

Final PR readback: draft, open, `mergeStateStatus=CLEAN`, 28 checks and zero
non-success conclusions.

No merge, image publication, GitHub environment, Render mutation, production
migration, deploy or Mission runtime rollout occurred.

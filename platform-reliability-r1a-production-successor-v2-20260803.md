# Platform Reliability R1-A — production successor v2

Prepared: 2026-08-03 UTC.

Status: **ACCEPTED FOR ONE SEPARATELY AUTHORIZED CANDIDATE PUBLICATION; DO NOT
MERGE**.

Draft backend PR [#51](https://github.com/Glera/swipe-backend/pull/51) is the
replacement for drifted PR #48. It is based on exact current `master`
`7b41e96ad0d979863159ebdd356122af6295a203` and has exact head
`4714e339b60e3af747d138486ad7eadadec72dac` on branch
`codex/r1a-production-cutover-v2-20260803`.

## Construction and bounded delta

All 29 R1-A commits from the previously accepted candidate were replayed onto
the new base. Conflict resolution preserved the compact Dockerfile path on all
three Render services, all three explicit `autoDeployTrigger: "off"` pins and
PR #49's operator-gated comment.

| Evidence | Exact value |
| --- | --- |
| old candidate tree | `d65747222a909f389f7a622deab627912b4aec0f` |
| successor-v2 tree | `e53d6f9262a64d98712892a08ae06f1c9acef666` |
| whole-tree delta | only `render.yaml`, two comment lines |
| whole-tree diff SHA-256 | `677c41e20f66daddcad7cfa35d35e53c3c3feb7be528f348b52187460f57caf6` |
| range-diff SHA-256 | `3d6d15eb832c8bca3cf770151925d550f40051957c7b4e17a519fb21079255e2` |
| resulting `render.yaml` SHA-256 | `6482cb71792fe4f3e7f9e5881c9bc75d5378eeed80e81705825bba70a54e282b` |

The resulting manifest has exactly three Auto Deploy Off pins and exactly
three compact `./Dockerfile` paths.

## Verification

- local exact image-gate suite: 86 passed;
- broader local release set: 86 passed, with three PostgreSQL tests skipped
  only because their external test database was not configured;
- Mission architecture guard: PASS, policy SHA-256
  `3469120fba269c3be44eb4de4d829d83249cf01bcc426319b660f7256c0a3cc5`;
- compact image CI `30817233456/1`: 1/1 jobs successful at exact head;
- PostgreSQL acceptance CI `30817235439/1`: 25/25 jobs successful at exact
  head;
- independent safe-mode review session
  `6717e2e6-272b-4e1a-bd3d-c4465e29df38`: GO, no P1/P2.

The review authorized only the draft branch and nonpublishing CI. PR #51 is
still open, draft, clean, mergeable and unmerged.

## Immutable-image consequence

The already published baseline remains accepted LKG:

- run `30789375002/1`;
- OCI index
  `sha256:39f354d8b22a221bf5f71ed912ca57d9bd16a8f8007958709e3e97f969b5eedb`;
- manifest SHA-256
  `b2ddb48a4c907b82b592a430336811a6514ec8a58c3c2cd8336f7e339a2bbc88`;
- artifact `8846489671`, unexpired through 2026-11-01.

No publishing `workflow_dispatch` exists for the successor-v2 head. A new
candidate image is therefore required and sufficient: its manifest must bind
exact source `4714e339...` while pinning the same accepted LKG. The old
candidate image is historical evidence only. This receipt authorizes no
publication, merge, GitHub production-environment mutation, Render mutation,
deploy, migration or Stage 1 action.

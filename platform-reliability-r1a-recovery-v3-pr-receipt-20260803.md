# Platform Reliability R1-A — recovery v3 draft PR receipt

Observed: 2026-08-03 UTC.

Status: **DRAFT PR OPEN; CI/REVIEW IN PROGRESS; NO MERGE OR PRODUCTION
AUTHORITY**.

The operator selected option A: current-master Mission storage migrations may
remain in R1-A ancestry while all Mission runtime surfaces stay off. This
authorizes the recovery branch/draft PR only.

## Exact branch identity

- GitHub backend master CAS before branch publication:
  `f0cc933fb813be2e4784200592efced196d74973`;
- recovery branch: `codex/r1a-recovery-v3-20260803`;
- merge commit preserving old R1-A history:
  `678ce836a79e8ff6caff046ca7febc6591ed6b73`;
- exact recovery head:
  `8ea6f1de6d2fe4bbb43b56698fd135649130d3c5`;
- exact tree: `a7e4c6462d4d30d0af61eae4672792203739d832`;
- draft backend PR: [#52](https://github.com/Glera/swipe-backend/pull/52),
  base exact `f0cc933...`, head exact `8ea6f1d...`.

The master advance from the earlier reviewed `47a0a0a...` was exactly one new
documentation file, `docs/specs/mechanic-onboarding.md`. The first CAS refused
to create a branch at the stale base. A new detached simulation merged old
R1-A head `4714e339...` into `f0cc933...`, resolved the sole acceptance-workflow
conflict with the previously reviewed bytes, and applied the accepted 0073/LKG
proof commit. Its tree was byte-identical to the updated local proof tree
before the real branch was created.

## Local acceptance before push

- targeted R1-A/guard suite: `86 passed, 3 skipped` (PostgreSQL-gated);
- Mission architecture guard: PASS, exact policy SHA-256
  `3469120fba269c3be44eb4de4d829d83249cf01bcc426319b660f7256c0a3cc5`;
- one Alembic head: `0073_platform_release_receipts`;
- both workflow YAML files and `git diff --check`: PASS;
- exact final tree equality: PASS.

Fresh PR CI started automatically. At first readback, the compact image job,
full PostgreSQL acceptance and all migration roundtrips including Mission
`0071/0072` and R1-A `0073` were in progress; reverse-drift was already green.
This receipt does not project their eventual result.

Old backend PR #51 was commented as superseded/historical-only but not deleted.
Meta PR #40 was updated with the exact new PR identities and prohibition on
merge/publication/deploy.

No merge, workflow dispatch, image publication, GitHub environment, Render
mutation, production migration, deploy or Mission runtime rollout occurred.

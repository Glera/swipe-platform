# Platform Reliability R1-A — recovery after concurrent master advance

Observed: 2026-08-03 UTC.

Status: **PROPOSAL ONLY — NO RECOVERY OR PRODUCTION AUTHORITY**.

The pre-cutover v2 window failed closed after backend `master` advanced from
`7b41e96ad0d979863159ebdd356122af6295a203` to
`47a0a0a6b4841212c44382c73dbeb0b26037e850`. The contained failure and cleanup
are recorded in
`platform-reliability-r1a-cutover-preparation-v2-concurrent-drift-20260803.md`.
This document defines the smallest technically verified recovery, but does not
authorize a branch, PR, workflow dispatch, image, Render change, migration or
deploy.

## Current authorities

- GitHub `Glera/swipe-backend/master` resolves to exact
  `47a0a0a6b4841212c44382c73dbeb0b26037e850` by branch API, git-ref API and
  remote `ls-remote` readback.
- Stage 1 PR #41 is merged at `cd7c66564e92e9d54846e77954c7c49360d1d18a`
  with exact reviewed head `2029867495578310dda92c170a2e07c71203eefa`.
- Production is still on the accepted Stage 0 deploy set and database revision
  `0070_published_test_delivery`; Auto Sync/Deploy remain off. No Stage 1 or
  R1-A production migration was performed by the failed window.
- R1-A PR #51 is open, draft and conflicting at exact head
  `4714e339b60e3af747d138486ad7eadadec72dac`. Its candidate-v2 image is valid
  immutable evidence for the old graph, but is not current cutover authority.
- The accepted immutable baseline remains
  `cd6fb13ab222b8c6f93b2c9fed12d86820f368a3` / image digest
  `sha256:39f3547965c28852d4dcb76d721c193ef2542297a7621917003d291d3415eedb`.

Every recovery action must first re-read GitHub `master` and fail unless it is
the exact reviewed recovery base. A later master SHA requires a new simulation
and review; it is not absorbed by a casual rebase.

## Verified migration topology

The collision is real:

```text
old R1-A: 0070 -> 0071_platform_release_receipts
new master: 0070 -> 0071_mission_slice_core -> 0072_mission_ops_receipts
```

The minimal single-head recovery is:

```text
0070_published_test_delivery
  -> 0071_mission_slice_core
  -> 0072_mission_ops_receipts
  -> 0073_platform_release_receipts
```

The Stage 1 migrations create only new `mission_*` tables, sequences,
validation functions and append-only triggers. They reference the existing
`users` table but do not alter or delete existing application tables or data.
The `mission_contributions.user_id -> users.id` foreign key has implicit
`RESTRICT` deletion semantics: inert while Mission is off and empty, but a
future Mission rollout must treat referenced users as non-deletable or define
an explicit privacy-preserving deletion policy.
The R1-A migration similarly adds only the release-receipt table, function and
trigger. Their guarded downgrades are not the production rollback path:
R1-A rolls application images forward against a compatible descendant schema.

## Disposable replay result

A local disposable clone based on exact `47a0a0a...` replayed all 29 R1-A
commits from old PR #51. There were exactly three content conflicts, all in
`.github/workflows/postgres-acceptance.yml`; each was resolved by retaining
both the already-reviewed Mission jobs and the R1-A jobs. No application,
Render, migration-body or product conflict occurred.

The scratch-only migration rename/re-anchor then produced:

- one Alembic head: `0073_platform_release_receipts`;
- expected predecessor: `0072_mission_ops_receipts`;
- Mission architecture guard: PASS, policy SHA-256
  `3469120fba269c3be44eb4de4d829d83249cf01bcc426319b660f7256c0a3cc5`;
- targeted R1-A suite: `86 passed, 3 skipped` (the three PostgreSQL-gated tests
  were not claimed as locally executed).

This proves mechanical viability only. The scratch branch is not a reviewed
successor and must never be pushed or published.

## Required recovery package

If the operator resolves the authority question below in favour of recovery,
the implementer may prepare one new backend branch from the exact reviewed
master SHA and one draft PR, with no production actions:

1. Replay the R1-A patchset while retaining both Stage 1 and R1-A acceptance
   entries in `postgres-acceptance.yml`.
2. Rename/re-anchor only the R1-A migration and its exact test identities to
   `0073_platform_release_receipts -> 0072_mission_ops_receipts`. This includes
   every hard-coded predecessor/downgrade literal: in particular,
   `tests/test_platform_release_migration_postgres.py` must use `0072` as its
   one-step `PRIOR`, never cascade `0073 -> 0070` through both Mission
   migrations. Rename the test identity itself where it still says `0071`.
3. Preserve all three Mission flags at their code defaults (`false`) and add a
   CI assertion that the production release profile does not enable them.
4. Strengthen the image workflow before any new publication. After upgrading
   ephemeral PG16 to the candidate head, pull the exact accepted baseline
   image and run it against that descendant database. The baseline image must:
   import `app.main`, connect through its own `app.db`, and issue a zero-row
   `SELECT` through every table in its `Base.metadata`. This proves that the
   old baseline's ORM read shape remains executable at `0073`, rather than only
   proving URL parsing.
5. Run the complete PostgreSQL acceptance workflow, image workflow with
   `publish=false`, mission architecture guard, exact migration roundtrips and
   an independent review of the whole recovery delta.
6. Record an exact-head recovery receipt. PR #51 and candidate v2 remain
   historical evidence and must be marked superseded; they are never retagged
   or silently reused.

Only after that package is independently accepted may a separate authority
request propose exactly one candidate-v3 publication. The baseline must not be
rebuilt. Publication, pre-cutover preparation and production cutover remain
three separately authorized windows with fresh master/provider/database CAS.

## Product-authority conflict

The original active goal explicitly forbids a Stage 1 production rollout and
mixing Stage 1 history into R1-A. Current GitHub master already contains Stage
1. A successor based on current master therefore necessarily has Stage 1 in
its ancestry, and its preDeploy would apply `0071` and `0072` before R1-A
`0073`.

All Mission runtime switches remain false, so this would expose no Mission API,
writer, operator action or player UX. Nevertheless it is a **Stage 1
storage-schema rollout**, and cannot be reclassified away by implementation
wording.

There are only two honest choices:

- **A — authorize schema-only convergence.** Permit additive Stage 1 storage
  migrations `0071/0072` solely as the already-merged prerequisite of R1-A,
  while keeping every Mission flag off and continuing to forbid Mission data,
  API, operator and client rollout. This is the recommended engineering path.
- **B — preserve the literal no-Stage-1-production boundary.** Pause R1-A
  cutover. Reverting Stage 1 from master or deploying an older divergent branch
  is not proposed: both would create a new destructive/history decision and a
  less trustworthy release lineage.

Until the operator chooses A explicitly, only this read-only analysis and its
independent review may proceed.

# Platform Reliability R1-A — disposable recovery implementation proof

Observed: 2026-08-03 UTC.

Status: **LOCAL DISPOSABLE PROOF; NOT A BACKEND BRANCH OR RELEASE AUTHORITY**.

After independent GO on the recovery design, the proposed implementation was
completed only in the existing disposable clone. It is pinned by local-only
commit `04118de4b976d1af42f272f151f78df2d02c11cf`, which is based on exact
GitHub backend authority `47a0a0a6b4841212c44382c73dbeb0b26037e850` plus the
29 replayed R1-A commits. The scratch ref was not pushed.

## Implemented in scratch

- R1-A migration renamed and re-anchored to
  `0073_platform_release_receipts -> 0072_mission_ops_receipts`; its
  upgrade/downgrade body is unchanged.
- PostgreSQL migration gate now performs exactly the one-step
  `0073 -> 0072 -> 0073` roundtrip. The stale test name and all R1-A hard-coded
  revision identities were updated.
- Mission and R1-A entries coexist in `postgres-acceptance.yml`.
- Candidate image workflow gained an exact-LKG forward-compatibility gate
  **before** candidate build/publication. It pulls the pinned baseline, runs
  that image against candidate-head PG16 and requires the baseline's own
  `app.main`/`app.db` to issue a zero-row read through every table and read
  model in its own ORM metadata.
- The gate explicitly keeps all Mission runtime flags false. Unit acceptance
  additionally proves the three Mission settings default false and production
  `render.yaml` does not set them.

## Local evidence

An isolated local PostgreSQL 15 cluster was used only because Docker/PG16 is
not installed on the workstation. It was stopped and deleted after the run.

- Alembic has exactly one head: `0073_platform_release_receipts`.
- R1-A physical migration gate: `1 passed`, including exact one-step downgrade,
  upgrade, append-only mutation refusal and non-empty downgrade refusal.
- Exact accepted baseline source `cd6fb13ab222b8c6f93b2c9fed12d86820f368a3`
  against the recovered `0073` database: PASS, `145 tables, 1 read models`.
- Targeted non-PG suite after the implementation: `86 passed, 3 skipped`;
  skipped tests are the explicitly environment-gated PostgreSQL tests.
- Mission architecture guard: PASS, policy SHA-256
  `3469120fba269c3be44eb4de4d829d83249cf01bcc426319b660f7256c0a3cc5`.
- Workflow YAML parse and `git diff --check`: PASS.

The full R1-A PostgreSQL runtime gate intentionally rejected PG15 with
`release requires PostgreSQL 16`; that fail-closed result is not counted as a
passing PG16 proof. One additional failure in that attempted run came from a
percent-escaped Unix-socket query parameter interacting with Alembic's config
interpolation; the GitHub workflow uses ordinary TCP and the subsequent TCP
compatibility run passed. Neither result is hidden or generalized into a
production claim.

## Remaining proof

If option A receives operator authority, the recovery branch must reproduce
this delta from a fresh exact-master CAS. GitHub CI must then provide the real
PG16 migration/runtime result and execute the exact accepted OCI baseline
image gate. The local source/PG15 proof supplements but does not replace either
authority.

No backend branch, PR, workflow, image, GitHub environment, Render resource,
database, deploy or Stage 1 runtime surface was mutated by this proof.

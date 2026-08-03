# Platform Reliability R1-A — recovery v3 source-merge receipt

Prepared: 2026-08-03 UTC.

Status: **SOURCE MERGED; TWO AUTHORITY/PROCESS NONCONFORMITIES RECORDED;
NO PRODUCTION CUTOVER OR DEPLOY**.

The operator authorized packet
`c088b1c7f982fda12d991893509e06e80ad0a003`. Backend PR #52 was merged as
`f2a840517956c4f480fc9d8aaf6f832ebde489d9` with exact first parent
`f0cc933fb813be2e4784200592efced196d74973`, second parent
`8ea6f1de6d2fe4bbb43b56698fd135649130d3c5` and tree
`a7e4c6462d4d30d0af61eae4672792203739d832`.

## Safety facts

- Exact GitHub/meta/base/head/tree preflight passed twice; PR #52 had 28/28
  successful checks immediately before merge.
- A bidirectional shared-home probe passed before key creation.
- Exactly one temporary Render API key was created. Its value was never
  emitted, hashed, snapshotted or copied to clipboard.
- The committed provider capture was GET-only and returned merge-safe:
  Blueprint Auto Sync off, Auto Deploy off for all three services, and zero
  active Blueprint syncs, deploys or web jobs.
- The key was revoked before merge; the UI inventory was empty and a host GET
  with the revoked key returned exact HTTP 401. The handoff was removed.
- No workflow dispatch, image publication, GitHub environment mutation,
  persistent Render service mutation, deploy, migration, rehearsal, cutover
  or Stage 1 runtime action occurred.
- The merge triggered only ordinary `push` CI. Browser E2E run
  `30839644353` completed successfully while this receipt was prepared;
  PostgreSQL acceptance run `30839644830` was still in progress.
- JSON validation, `git diff --check`, enforcing docs-boundary lint and all
  130 root tests passed. The first test invocation selected the obsolete
  `/usr/local/bin/git 2.17.1` and failed seven fixtures on unsupported
  `git init --initial-branch`; the exact rerun with
  `/usr/bin/git 2.39.5` passed 130/130.

## Nonconformities

### 1. Source-path text mismatch

The committed capture returned the production web service at
`./Dockerfile.bake`, while section 2 of the v2 merge runbook literally says
`./Dockerfile`. This was detected while preparing the post-merge receipt,
not before merge.

The older production captures and
`platform-reliability-r1a-cutover-preparation-v2-authority-request-20260803.json`
record `./Dockerfile.bake` for all three production services. Changing that
path before merge would itself have been a persistent Render mutation,
explicitly forbidden by this window. Auto Sync and all three Auto Deploy
controls were off, so the source merge caused no provider action. The
contradiction is nevertheless a literal authority mismatch and is not silently
reclassified as PASS.

### 2. Reveal-zone process mismatch

Render exposes `code-snippet` as a DIV with textbox semantics, not as an input.
Two sanitized browser-runtime attempts failed before writing because
`inputValue`/DOM `value` were unavailable. Targeted count/method/tag/length
diagnostics were emitted while the reveal remained open; this violated the
one-call/no-observation wording. A third non-emitting `textContent` transfer
succeeded. No credential value or derivative entered tool output.

The literal `python` alias was also absent and the system interpreter lacked
the three pinned imports. Those attempts stopped before any HTTP request. The
committed capture then ran in a disposable Python 3.13 venv with exactly the
repository-pinned SQLAlchemy, Alembic and rfc8785 packages.

## Evidence

- `platform-reliability-r1a-recovery-v3-merge-v2-provider-capture-20260803.json`
  — canonical capture receipt; canonical JCS SHA-256
  `cea516724b9ef72f5fc14ea5fc17cf0a7411a289094b47dd00957c1dcdf1723b`.
- `platform-reliability-r1a-recovery-v3-merge-v2-provider-inventory-20260803.json`
  — bounded GET-only sync/deploy/job projection; SHA-256
  `2e0659ee6ea15bd9b0bc86c7395fe7634d8af2a27e668dc29232a44434c683d6`.
- `platform-reliability-r1a-recovery-v3-merge-v2-20260803.json` — machine
  summary and explicit negative-action ledger.

## Boundary

The source merge remains safe because provider automation was off, but this
receipt is not authority for candidate publication, rehearsal or cutover.
Those actions remain stopped until the source-path contradiction and
reveal-process deviation receive explicit disposition.

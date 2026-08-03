# Platform Reliability R1-A — recovery-v3 merge-window v2 corrective disposition

Prepared: 2026-08-03 UTC.

Status: **PROPOSED; REQUIRES INDEPENDENT REVIEW AND EXPLICIT OPERATOR
ACCEPTANCE**.

This document classifies the nonconformities recorded in
`platform-reliability-r1a-recovery-v3-merge-v2-20260803.{json,md}`. It does
not authorize a workflow dispatch, image publication, provider mutation,
deploy, migration, rehearsal, cutover or Stage 1 runtime action.

## Immutable outcome

Backend PR #52 merged as
`f2a840517956c4f480fc9d8aaf6f832ebde489d9`, with exact parents
`f0cc933fb813be2e4784200592efced196d74973` and
`8ea6f1de6d2fe4bbb43b56698fd135649130d3c5`, and exact tree
`a7e4c6462d4d30d0af61eae4672792203739d832`.

Before merge, fresh GET-only evidence proved Blueprint Auto Sync off, Auto
Deploy off for all three exact services and zero active sync/deploy/job. The
single temporary key was revoked before merge, the UI inventory was empty, the
revoked key returned exact HTTP 401 and the handoff was removed. Both automatic
`push` CI runs on the merge commit completed successfully. No production
deploy or database/runtime action occurred.

## NC-1 — web source-path wording

### Evidence

Section 2 of
`platform-reliability-r1a-recovery-v3-merge-v2-runbook-20260803.md` says the
web path must be `./Dockerfile`. The fresh committed capture instead returned
`./Dockerfile.bake`.

The latter is the settled pre-merge production state:

- `platform-reliability-r1a-cutover-preparation-v2-authority-request-20260803.json`
  pins `productionTarget.expectedDockerfilePath` to
  `./Dockerfile.bake`;
- production captures from 2026-08-01 and 2026-08-02 record
  `./Dockerfile.bake` for web and both crons;
- the same v2 preparation runbook requires source branch `master` and
  `./Dockerfile.bake`;
- changing the production web path before source merge would have been a
  persistent Render mutation, explicitly forbidden by the merge window.

### Disposition

**Accept as authority-document defect, no production incident.** The intended
pre-merge gate was the settled legacy source shape
`master + ./Dockerfile.bake` for all three services, with provider automation
off. The safety property was prevention of any build/deploy after the source
merge; that property was proven and held.

This acceptance does not retroactively change provider state and does not
authorize keeping `Dockerfile.bake` after a future cutover. The next cutover
packet must distinguish:

1. pre-cutover source baseline: `master + ./Dockerfile.bake`;
2. immutable-image candidate state: no Git source path;
3. rollback target and exact provider transition between them.

## NC-2 — reveal-zone execution contract

### Evidence

The Render reveal control had role `textbox` but was a DIV whose credential
was in `textContent`, not an input `value`. The first two sanitized transfer
attempts failed before writing. Targeted count/method/tag/length diagnostics
were emitted while the reveal remained open. A third non-emitting
`textContent` transfer wrote and fsynced the shared-home handoff and closed
the dialog with `Done`.

No credential value or derivative was emitted, snapshotted, hashed, placed in
argv/clipboard/git or returned by a tool. The key was used only for GET
requests, revoked before merge, proved unusable by exact HTTP 401 and removed
from the handoff.

The sanitized count/method/tag/length observations remain in the attended
session transcript as non-secret metadata. That immutable audit residue is
accepted by this disposition; it cannot reconstruct or narrow the credential
and requires no deletion.

### Disposition

**Accept as contained process nonconformity, not a credential exposure.** The
one-call/no-observation contract was not met, so the execution cannot be
described as literal PASS. Containment is complete and there is no live
credential or production mutation to remediate.

For every later Render-key window:

- pre-commit to the observed Render contract that `code-snippet` appears only
  after submit as a role=textbox DIV; because the element cannot be inspected
  before submit, validate its tag/role/shape block-locally inside the final
  call without emitting diagnostics, then read only `textContent`;
- the final create/read/write/fsync/`Done`/hidden sequence is one
  non-emitting call;
- method/tag/count diagnostics after submit are forbidden even when they do
  not contain secret bytes;
- any mismatch stops with immediate key revocation and no later authority
  action.

## NC-3 — local Python bootstrap

The literal `python` alias was absent and the system interpreter lacked the
three repository-pinned imports. Both attempts stopped before any HTTP request.
The committed capture then ran in a disposable Python 3.13 venv containing
only the pinned SQLAlchemy, Alembic and rfc8785 packages.

**Accept as P3 execution-note.** Future attended packets must pin and record
the executable path plus exact disposable-venv package set during preflight,
before key creation.

## Independent-review reproduction boundary

The corrective reviewer had a stale local backend checkout and read-only scope
forbade fetching. It therefore verified merge SHA, parent/tree and GitHub CI
identities as internally consistent attestations in the committed receipts,
not by resolving those objects locally. The live GitHub read-after-write proof
was performed by the operator session and is retained in the machine receipt.

## Resulting boundary

If independently reviewed and explicitly accepted by the operator:

- the exact source merge may be treated as the valid R1-A source authority;
- the two nonconformities are terminally disposed without rollback or key
  rotation;
- a new candidate-publication authority request may be prepared against exact
  backend master
  `f2a840517956c4f480fc9d8aaf6f832ebde489d9`.

Acceptance grants no candidate publication, workflow dispatch, Render key,
GitHub environment, provider mutation, deploy, migration, rehearsal, cutover
or Stage 1 runtime authority.

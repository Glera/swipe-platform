# Platform Reliability R1-A — recovery v3 merge runbook

Prepared: 2026-08-03 UTC.

Status: **NON-EXECUTABLE UNTIL EXACT OPERATOR GO**.

Authority and identities live in
`platform-reliability-r1a-recovery-v3-merge-authority-request-20260803.md`.
This runbook narrows execution and grants no authority itself.

## 0. Single-flight boundary

Resolve clean worktrees for backend PR head
`8ea6f1de6d2fe4bbb43b56698fd135649130d3c5` and the exact meta packet named
by the operator. Create a fresh `0700` receipt directory and separate `0600`
temporary-key handoff. Do not reuse any prior receipt directory or key file.

Before key creation, require exact backend master/base
`f0cc933fb813be2e4784200592efced196d74973`, exact PR head/tree, open draft
state, `MERGEABLE`/`CLEAN`, and exactly 28 completed successful checks. Require
the two exact CI runs and accepted review receipt. Require absent GitHub
environment `production`, absent repository `RENDER_*` secrets/variables and
no active merge/cutover/publication operation.

Use the established no-observation procedure for the one-time Render key
reveal: no DOM snapshot, screenshot, body text, console log or clipboard
transcript until the value has been written directly into the pre-created
handoff file and the reveal dialog is closed. If the key is exposed, revoke it
immediately and stop; no replacement key is allowed under the same GO.

## 1. Fresh GET-only provider capture

From the exact backend PR worktree, export the temporary key only inside a
subshell and run:

```bash
PYTHONPATH=. python scripts/platform-release-provider-capture.py \
  --blueprint-id exs-d95qo3q8qa3s73ea23p0 \
  --web-service-id srv-d95r3bfavr4c73aqsi4g \
  --sequencing-cron-id crn-d9kej0u1egvs73engu7g \
  --materialize-cron-id crn-d9e6vmtaeets73ai8cj0 \
  --output "$r1a_receipt_dir/platform-release-provider-capture.v1.json"
```

Require `status=PASS`, exact owner/resources/names/types, source branch
`master`, expected Dockerfile paths, Blueprint Auto Sync false and every Auto
Deploy false. Capture bounded direct GET projections of latest deploys and
current jobs; require no non-terminal deploy/sync/preDeploy/job.

Do not create a Render job and do not call any mutating Render endpoint.

## 2. Final GitHub CAS and merge

Immediately before changing draft state, repeat:

- backend master exact base;
- PR exact head/tree, open/draft, mergeable and clean;
- exactly 28 completed successful checks;
- no active cutover or image-publication workflow;
- fresh provider receipt still within the 30-minute window.

Then execute only:

```bash
gh pr ready 52 --repo Glera/swipe-backend
gh pr merge 52 \
  --repo Glera/swipe-backend \
  --merge \
  --match-head-commit 8ea6f1de6d2fe4bbb43b56698fd135649130d3c5
```

Do not enable auto-merge. If merge does not complete synchronously, stop and
restore draft state with `gh pr ready --undo 52 --repo
Glera/swipe-backend`; do not queue or retry it under the same GO.

## 3. Read-after-write proof and cleanup

Require PR #52 state `MERGED` and resolve the resulting backend master merge
commit. Its parents must be exactly, in order:

1. `f0cc933fb813be2e4784200592efced196d74973`;
2. `8ea6f1de6d2fe4bbb43b56698fd135649130d3c5`.

Its tree must equal
`a7e4c6462d4d30d0af61eae4672792203739d832`. Require zero workflow dispatch,
zero image publication, zero GitHub-environment mutation, zero Render
mutation/deploy/job and no Mission runtime action during the window.

Revoke the temporary Render key, prove the former key returns `401`, remove
the local handoff, and commit only bounded receipts/digests. Never record the
key or a broad provider inventory.

If the merge fails after `gh pr ready`, restore draft state before revocation.
If the merge succeeds but a postcondition differs, do not attempt a revert or
other destructive repair under this authority: preserve evidence, revoke the
key and stop for operator review.

Run JSON validation where applicable, `git diff --check`, docs-boundary lint
and root tests on the evidence packet. Stop before candidate publication,
rehearsal or cutover.

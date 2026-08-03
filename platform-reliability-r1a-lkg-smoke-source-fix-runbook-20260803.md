# R1-A LKG smoke source fix — bounded runbook

Prepared: 2026-08-03 UTC.

Status: **DRAFT; NON-EXECUTABLE WITHOUT AN INDEPENDENTLY REVIEWED PACKET AND
EXACT OPERATOR GO**.

Authority companion:
`platform-reliability-r1a-lkg-smoke-source-fix-authority-request-20260803.{json,md}`.

## 1. Fail-closed preflight

Record every JSON precondition. Use a fresh worktree; do not touch the user's
dirty checkout. Stop if backend `master` moved, the branch exists, the failed
run/tag/artifact facts changed, exact source blobs differ or production
authority appeared.

## 2. Red proof

On a disposable uncommitted copy of exact base, add only the two exact test
assertions. Run the targeted test and require failure specifically because
`-e PYTHONPATH=/app` is absent. Record command, exit and bounded error. Discard
that disposable mutation; do not commit a red state.

## 3. Exact green package

Create the authorized branch from exact base. Apply the workflow line and the
same two assertions. Require an exact two-file diff, then run:

```text
python -m pytest -q tests/test_platform_release.py tests/test_platform_release_coordinator.py tests/test_platform_release_provider_capture.py tests/test_mission_architecture_guard.py
python scripts/mission-architecture-guard.py
git diff --check
```

Record the interpreter/dependency environment. No unrelated formatting or
lockfile change is allowed.

## 4. One external source write

Commit once and push the new branch once. Open one draft PR to current backend
`master`, title/body marked `DO NOT MERGE`, with the failure run, exact diff,
red/green receipts and hard boundary. Do not manually dispatch CI or push a
repair commit.

Observe automatic Platform release image and PostgreSQL acceptance workflows.
If either fails, stop; retain evidence and request a new decision.

## 5. Independent review and stop

Obtain read-only review of the exact PR head, exact base, two-file diff,
red/green proof and CI. Commit receipts in the meta evidence branch.

Even after GO, the PR remains unmerged. Prepare a separate source-merge request
with fresh provider isolation evidence. Do not publish an image or create
production authority under this runbook.

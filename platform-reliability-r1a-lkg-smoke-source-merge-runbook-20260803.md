# R1-A LKG smoke source merge — bounded runbook

Prepared: 2026-08-03 UTC.

Status: **NON-EXECUTABLE WITHOUT AN INDEPENDENTLY REVIEWED EXACT PACKET AND
OPERATOR GO**.

Authority companion:
`platform-reliability-r1a-lkg-smoke-source-merge-authority-request-20260803.{json,md}`.

## 0. Fail-closed preflight

Use clean exact source/evidence worktrees. Require meta packet identity,
backend master `f2a840…`, PR #53 open/draft/clean at head `223ab97…` and
tree `75dbd88…`, one commit, 28/28 successful checks, exact two CI runs,
absent GitHub production environment/repository release authority, and no
active merge/publication/cutover run.

Prepare a fresh `0700` receipt directory and unique `0600` handoff under
`/Users/gleb`. Pin and record the Python 3.13 executable and exact
disposable-venv package set before key creation. Prove a non-secret
bidirectional browser/host shared-home mount probe and remove it.

## 1. One temporary key and GET-only capture

Create exactly one account-wide Render API key. From submit until the reveal is
closed, perform no snapshot, screenshot, logging or returned observation. One
final browser-runtime block must validate a unique role=textbox DIV
`code-snippet` locally, read only its `textContent`, write/fsync the
precreated handoff, click `Done`, and wait hidden. Any mismatch requires
immediate revocation and stop; do not emit diagnostics or create another key.

Run the exact source-head script from a disposable Python 3.13 venv:

```text
PYTHONPATH=. <pinned-python> scripts/platform-release-provider-capture.py
  --blueprint-id exs-d95qo3q8qa3s73ea23p0
  --web-service-id srv-d95r3bfavr4c73aqsi4g
  --sequencing-cron-id crn-d9kej0u1egvs73engu7g
  --materialize-cron-id crn-d9e6vmtaeets73ai8cj0
  --output <fresh-0700-receipt-dir>/platform-release-provider-capture.v1.json
```

Pass the key only through a reviewed child-process environment populated from
the `0600` handoff; never argv or tool output. Require capture
`status=PASS`, `mergeSafe=true`, exact identities, `master`,
`./Dockerfile.bake`, Auto Sync false and every Auto Deploy false.

Use bounded direct GET projections to capture latest Blueprint syncs, deploys
for all three services and web-service jobs. Record only IDs, timestamps,
statuses and counts; require every active count zero and
`operations=["GET"]`.

## 2. Revoke before merge

Delete the key through the signed-in UI, require empty key inventory, and run
one bounded request requiring exact HTTP 401 from the former credential.
Remove the handoff. No key value or derivative enters receipts.

Repeat every GitHub/meta/PR/CI CAS. Require the provider capture remains inside
the 30-minute window and no operation became active.

## 3. One synchronous merge

Execute only:

```text
gh pr ready 53 --repo Glera/swipe-backend
gh pr merge 53 --repo Glera/swipe-backend --merge \
  --match-head-commit 223ab97cf6e24e0542337d2a39e1bce9529f5d00
```

Do not enable auto-merge. If synchronous merge fails, restore draft with
`gh pr ready --undo 53 --repo Glera/swipe-backend` and stop without retry.

Require the new master commit's parents, in order, to be exact base then source
head, and its tree to equal `75dbd88045b5b301a903d9bc917c006cd2ceaffe`.
Do not revert or repair a postcondition mismatch.

## 4. Automatic CI and receipts

Observe only automatically triggered push CI on the exact merge commit. No
manual dispatch or rerun. Commit bounded provider, key-lifecycle, merge and CI
receipts after JSON validation, diff-check, docs-boundary lint and root tests.

Stop before candidate-v4 publication, GitHub-environment creation, rehearsal
or cutover. Those require later independent review and operator authority.

# Platform Reliability R1-A — recovery v3 merge-window v2 runbook

Prepared: 2026-08-03 UTC.

Status: **NON-EXECUTABLE UNTIL INDEPENDENT REVIEW AND EXACT OPERATOR GO**.

Authority lives in
`platform-reliability-r1a-recovery-v3-merge-v2-authority-request-20260803.md`.
This runbook narrows execution and grants no authority itself.

## 0. Exact preflight and shared-home proof

Repeat every immutable GitHub check from the authority request against clean
backend/meta worktrees. Require exact master/base/head/tree, open draft PR #52,
`MERGEABLE`/`CLEAN`, exactly 28 successful checks, the two exact CI runs,
accepted reviews, absent GitHub `production` environment, absent repository
`RENDER_*` authority and no active cutover/publication workflow.

Create a fresh `0700` receipt directory in host `/private/tmp`; it contains no
secret. The key handoff must **not** use `/private/tmp`.

Before key creation, perform a bidirectional non-secret probe at a unique
`/Users/gleb/.codex-r1a-shared-probe.XXXXXX` path:

1. host creates it exclusively at mode `0600` with a random non-secret
   sentinel;
2. browser runtime reads the exact sentinel, replaces it with a second
   non-secret sentinel and fsyncs;
3. host reads the exact replacement, verifies the same mode and removes it;
4. both sides verify absence.

Any mismatch stops before key creation.

Create the real handoff exclusively with
`mktemp /Users/gleb/.codex-r1a-render-key.XXXXXX`, set `0600`, require a regular
non-symlink file and keep only its non-secret path in orchestration state.

## 1. One-time reveal transfer

Require Render UI `No provisioned API keys`. Ground the unique create dialog,
name input, submit button and the eventual post-submit contract. After final
submit, enter a no-observation zone: no DOM/body/element text, screenshot,
console, clipboard or other output is legal.

One browser-runtime call must:

1. submit the already grounded dialog;
2. wait for exactly one `code-snippet` textbox;
3. read its value only into block-local process memory and validate the Render
   key shape without printing or hashing it;
4. open the pre-created shared-home handoff without following links, write the
   value, fsync, close, and verify runtime-side mode/non-zero size;
5. click the **post-submit `Done` button** (not the pre-submit `Close modal`
   control), wait for the reveal dialog to become hidden, clear the block-local
   value and return no output.

The next tool call verifies only host mode `0600`, regular/non-symlink type and
non-zero size. It never reads, prints or hashes the value. Any failure triggers
immediate UI revocation, file removal, a bounded FAIL receipt and full stop.

## 2. Fresh GET-only provider evidence

In a subshell, read the handoff into `RENDER_API_KEY`, export it only to child
processes and run the committed canonical capture from exact PR #52 head:

```bash
PYTHONPATH=. python scripts/platform-release-provider-capture.py \
  --blueprint-id exs-d95qo3q8qa3s73ea23p0 \
  --web-service-id srv-d95r3bfavr4c73aqsi4g \
  --sequencing-cron-id crn-d9kej0u1egvs73engu7g \
  --materialize-cron-id crn-d9e6vmtaeets73ai8cj0 \
  --output "$r1a_receipt_dir/platform-release-provider-capture.v1.json"
```

Require `status=PASS`, exact names/types, branch `master`, web
`./Dockerfile`, both cron `./Dockerfile.bake`, Blueprint Auto Sync false and
all three Auto Deploy false.

Using the same reviewed `Render` client and only GET requests, capture bounded
first-page projections (`limit=100`) for:

- `/blueprints/exs-d95qo3q8qa3s73ea23p0/syncs`;
- each exact service's `/deploys`;
- web `/jobs`.

Fail on any malformed/unknown state. Active Blueprint states are
`created|pending|running`; terminal states are `error|success`. Active deploy
states are `created|queued|build_in_progress|update_in_progress|pre_deploy_in_progress`;
terminal states are `live|deactivated|build_failed|update_failed|canceled|pre_deploy_failed`.
Active job states are `pending|running`; terminal states are
`succeeded|failed|canceled`. Require zero active rows. Record only resource IDs,
statuses, latest deploy IDs and receipt digests; never broad provider payloads.

No POST/PATCH/DELETE request and no Render job are authorized.

## 3. Revoke before merge

Close any reveal before observing the page. Scope the API-key list to the exact
temporary key name, open its unique menu, choose `Revoke`, confirm the exact
dialog and require `No provisioned API keys`.

While the host handoff still exists, issue one GET to
`https://api.render.com/v1/services?limit=1` with the key in the Authorization
header and require exact HTTP `401`. Then unlink the handoff and prove absence.
Never print response headers/body or the credential.

If UI inventory is not empty or the response is not 401, stop without merge.

## 4. Final CAS and source merge

Immediately repeat exact backend master, PR base/head/tree, open/draft,
`MERGEABLE`/`CLEAN`, 28 successful checks, zero active workflow and fresh
provider-receipt/deadline assertions. Then execute only:

```bash
gh pr ready 52 --repo Glera/swipe-backend
gh pr merge 52 \
  --repo Glera/swipe-backend \
  --merge \
  --match-head-commit 8ea6f1de6d2fe4bbb43b56698fd135649130d3c5
```

Auto-merge and merge queue are forbidden. A non-synchronous merge is a stop;
restore draft with `gh pr ready --undo 52 --repo Glera/swipe-backend`.

## 5. Read-after-write proof

Require PR #52 `MERGED`. The resulting backend master must have first parent
`f0cc933fb813be2e4784200592efced196d74973`, second parent
`8ea6f1de6d2fe4bbb43b56698fd135649130d3c5`, and tree
`a7e4c6462d4d30d0af61eae4672792203739d832`.

Prove zero workflow dispatch, image publication, GitHub-environment mutation,
Render mutation/deploy/job, migration and Mission runtime action. Commit only
bounded receipts/digests, run JSON validation, `git diff --check`,
docs-boundary lint and root tests, then stop before candidate publication,
rehearsal or cutover.

# R1-A LKG smoke source merge retry-v2 — bounded runbook

Prepared: 2026-08-04 UTC.

Status: **NON-EXECUTABLE WITHOUT INDEPENDENT REVIEW AND AN EXACT NEW OPERATOR GO**.

Authority companion:
`platform-reliability-r1a-lkg-smoke-source-merge-retry-v2-authority-request-20260804.{json,md}`.

## 0. Fail-closed preflight before any key exists

Require the exact reviewed meta packet, accepted source-fix and
contained-failure evidence,
backend master/base `f2a840…`, PR #53 draft/clean at `223ab97…` and tree
`75dbd88…`, one commit, 28/28 checks, exact pinned CI runs with zero
artifacts, absent GitHub `production` environment, absent repository-level
`RENDER_*`/`PLATFORM_RELEASE_*` secrets and variables, and no active operational
workflow.

Require an empty Render API-key inventory. Prepare a fresh `0700` receipt
directory, a unique empty `0600` handoff under `/Users/gleb`, a
bidirectional non-secret shared-home probe and a recorded Python 3.13
disposable environment with exact pinned packages.

Before submit, ground and locally require uniqueness for each entry in
`preGroundedBeforeSubmitLocators`. Pin the eventual post-submit create and
revoke contracts, but do not pretend their reveal/key-row/dialog elements exist
before creation. Generate the exact non-secret key name once from the authority
rule and record it in receipts. This is the last point at which a browser
snapshot or broad DOM observation is allowed.

## 1. One key: non-emitting reveal block

Fill the exact non-secret temporary key name. Execute submit, reveal transfer
and Done in one browser-runtime block. Wrap every locator resolution, count,
click and wait in a local catch that suppresses provider exception text,
element markup, DOM text and stack data. The block emits only fixed integer
status 0 or 1:

- click the already-grounded dialog submit;
- wait for the already-contracted `div[role=textbox]`;
- locally require one element, tag DIV, role textbox and bounded no-whitespace
  credential shape;
- read only that element's `textContent` into process memory;
- write and fsync the precreated handoff without returning the value or a
  derivative;
- clear the in-process string, click Done and wait hidden.

Any mismatch becomes integer 1 without rethrowing or logging its exception.
Block-local counts are permitted only because they never leave the block; this
is the explicit reconciliation with the accepted NC-2 diagnostic ban.

From the submit click until revocation and empty inventory complete, do not call
snapshot, screenshot, `innerText`, row/dialog `textContent`, attribute/tag
diagnostics, locator/page evaluate that returns DOM text, clipboard, CUA
observation or browser logs.

## 2. GET-only provider proof

Run the exact committed provider-capture script from the pinned Python
environment. Pass the key only through a child environment populated from the
handoff, never argv, shell history, stdout, stderr or tool parameters. After
the reveal write, validate only that the handoff is a regular file, mode `0600`
and non-zero bounded size without printing the size. Execute exactly:

```text
PYTHONPATH=. <pinned-python> scripts/platform-release-provider-capture.py
  --blueprint-id exs-d95qo3q8qa3s73ea23p0
  --web-service-id srv-d95r3bfavr4c73aqsi4g
  --sequencing-cron-id crn-d9kej0u1egvs73engu7g
  --materialize-cron-id crn-d9e6vmtaeets73ai8cj0
  --output <fresh-0700-receipt-dir>/platform-release-provider-capture.v1.json
```

Require `PASS`, exact identities, `master`,
`./Dockerfile.bake`, Auto Sync false and every Auto Deploy false.

Capture bounded newest-page projections for Blueprint syncs, all three service
deploy streams and web jobs. Treat any non-terminal or unknown lifecycle state
as active. Require every active count zero and record
`operations=["GET"]`.

## 3. Non-emitting structural revoke

Execute the entire UI revoke in one browser-runtime block. Suppress every
provider exception string and stack locally; return only integer 0 or 1:

- locate exactly one `li.border-b.border-primary` filtered by the exact
  non-secret temporary key name;
- locate and click its unique Menu button;
- locate one role=menu and click its unique Revoke menuitem;
- locate one role=dialog and click its unique Revoke API Key button;
- wait for the dialog to be hidden;
- require the exact temporary key name count to be zero;
- require exact `No provisioned API keys.` to be visible exactly once.

The block returns no provider value or diagnostic. Render's masked representation may
exist internally in the row and confirmation dialog, but it is never read or
emitted.

Using the former credential from the handoff, perform one bounded GET and
require exact HTTP 401. Then unlink the handoff. Do not create another key.

If the block returns 1, make no browser observation and do not
merge. Expose only the existing signed-in tab for the attended operator to
revoke the exact non-secret key name manually. After confirmation, require
exact HTTP 401, remove the handoff and temporary material, and end the window as
a contained failure. No diagnostic fallback, replacement key or merge retry is
authorized.

## 4. Final GitHub CAS and one merge

Repeat every meta/source/PR/check/CI/authority-absence/active-run gate. Require
provider evidence within 30 minutes. Then execute only:

```text
gh pr ready 53 --repo Glera/swipe-backend
gh pr merge 53 --repo Glera/swipe-backend --merge \
  --match-head-commit 223ab97cf6e24e0542337d2a39e1bce9529f5d00
```

Do not enable auto-merge. If the synchronous merge fails, restore draft and
stop without retry. Require ordered parents base then source and exact tree
`75dbd88045b5b301a903d9bc917c006cd2ceaffe`.

## 5. Automatic CI and receipts

Observe only automatically triggered push CI. Commit bounded provider,
credential-lifecycle, merge and CI receipts after JSON validation,
`git diff --check`, enforcing docs-boundary lint and root tests.
No credential material or derivative may enter a receipt, git, hash, stdout,
stderr or any other forbidden value surface.

Stop before candidate-v4 publication, GitHub environment creation, rehearsal
or cutover. Every later action requires separate review and operator authority.

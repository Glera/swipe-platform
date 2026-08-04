# Platform Reliability R1-A — LKG smoke source-merge retry-v2 authority request

Prepared: 2026-08-04 UTC.

Status: **DRAFT; REQUIRES INDEPENDENT REVIEW AND A NEW EXPLICIT OPERATOR GO**.

The prior authority at `c7aa22e…` is consumed. Its attended window stopped
before merge when Render's masked key representation entered browser tool
output. The failure was contained and independently accepted at exact meta
commit `29d184e458509e37d7caec72b07d5b3d9a9f4e9c`.

This packet changes only the credential-observation procedure. It preserves the
same exact PR #53 source, CI, provider-isolation and one-merge boundaries. It
grants no present authority.

## Exact source boundary

PR #53 must remain open, draft and clean at base
`f2a840517956c4f480fc9d8aaf6f832ebde489d9`, head
`223ab97cf6e24e0542337d2a39e1bce9529f5d00`, tree
`75dbd88045b5b301a903d9bc917c006cd2ceaffe`, one commit and exactly
28 completed successful checks. CI runs `30849622831/1` and
`30849622812/1` must remain successful pull-request runs on that head with
zero artifacts.

Every source, GitHub-authority and active-workflow absence check runs before key
creation and again after provider capture, key revocation and exact HTTP 401.

## Corrected browser boundary

Before submit, while no key exists, the executor grounds the Create button,
create dialog, key-name textbox, submit button and exact empty-inventory text.
The eventual reveal/Done and key-row/revoke-dialog locators cannot exist yet;
they are pinned as contracts and their live counts run only inside later
exception-suppressed blocks. After the Create API Key submit click, a strict
browser no-observation zone begins and remains active through revoke and
empty-inventory verification.

Render necessarily renders a masked representation inside the unobserved key
row and revoke dialog. The retry makes this provider-internal state explicit:
it may exist in the DOM, but no call may return, emit, snapshot, screenshot,
log, copy, hash or otherwise observe it.

The only permitted value read is the unique post-submit
`div[role=textbox]` reveal inside the final create block. That block validates
tag/role/shape locally, writes and fsyncs the precreated `0600` handoff,
clicks Done, waits hidden and emits nothing.

Every locator resolution, count, click and wait inside both post-submit blocks
is caught locally. Provider exception text, element markup, DOM text and stack
data may not escape through stdout, stderr or tool output. A block reports only
fixed integer status 0 or 1. Block-local counts are the explicit non-emitting
exception to the accepted NC-2 ban on post-submit diagnostics; they are never
returned or logged.

After the GET-only provider capture, one separate non-emitting revoke block:

1. finds the unique key-list item by the exact non-secret key name and the
   pre-committed `li.border-b.border-primary` structure observed in the
   contained operator cleanup session (session evidence, not an independently
   live-validated provider contract);
2. clicks its Menu, the unique Revoke menuitem and the dialog-scoped
   Revoke API Key button;
3. waits for the dialog to hide, the exact key name to be absent and the exact
   empty-inventory text to be visible;
4. returns no DOM observation or diagnostic.

No snapshot, screenshot, `innerText`, row/dialog `textContent`, attribute
diagnostic, clipboard, CUA observation or dev-log read is allowed after submit.
If the structural block mismatches, the agent may not inspect the dialog or
create a replacement key. It exposes only the existing signed-in tab for the
attended operator to revoke the exact non-secret key name manually. After
operator confirmation, the host must prove HTTP 401 and clean up; that window
ends in terminal failure and may not merge.

## Provider and merge boundary

Using the credential only through the reviewed child-process environment, run
the committed canonical capture and bounded GET inventory. Require exact
production identities, `master + ./Dockerfile.bake`, Auto Sync and every Auto
Deploy off, and zero active sync/deploy/preDeploy/job.

The credential may exist only in browser process memory for the single reveal,
the `0600` handoff and the child-process environment. It may never enter argv,
shell history, chat, clipboard, tool parameters, returned objects except the
fixed integer block status, stdout, stderr, snapshots, screenshots, receipts,
git or hashes. After the reveal write, the host validates only regular-file
type, mode `0600` and non-zero bounded size without printing that size.

Revoke before merge, prove exact HTTP 401, remove the handoff and disposable
material, then repeat every GitHub CAS. Only then may the executor mark PR #53
ready and make one synchronous merge-commit attempt with exact head
`223ab97…`. The merge commit must have base then source as ordered parents and
tree `75dbd88…`. Observe only automatic push CI.

## Deny-list

No replacement key, non-GET provider API request, post-submit browser
observation, workflow dispatch/rerun, image action, GitHub-environment mutation,
persistent Render mutation, deploy, production migration, rehearsal, cutover,
Stage 1 runtime action or generative-feed expansion is authorized. No pull
request other than exact PR #53 may merge; queueing a merge, auto-merge and
merge retry are forbidden.

Operator form, not an authorization:

> GO R1-A LKG-smoke source merge retry-v2 for packet
> `<exact-final-reviewed-meta-commit>` only. Use the committed browser
> no-observation contract: after Create API Key submit, emit no snapshot, text,
> attribute, dialog or key-row observation; transfer the reveal once to the
> precreated handoff and later revoke only through the pre-committed non-emitting
> structural block. Run the exact GET-only production capture, prove empty key
> inventory and revoked-key HTTP 401, then only if every GitHub/provider CAS
> passes mark backend PR #53 ready and merge exact head
> `223ab97cf6e24e0542337d2a39e1bce9529f5d00` once with merge-commit
> semantics. No workflow dispatch/rerun, image action, GitHub-environment or
> persistent Render mutation, deploy, migration, rehearsal, cutover or Stage 1
> runtime action.

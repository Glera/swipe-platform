# Platform Reliability R1-A — recovery v3 merge-window v2 authority request

Prepared: 2026-08-03 UTC.

Status: **INDEPENDENT REVIEW GO; READY FOR OPERATOR DECISION; NOT AUTHORIZED**.

This request replaces the consumed `a063ed91…` merge window. Its only material
change is the secret handoff boundary: the browser runtime and host share
`/Users/gleb` but do not share `/private/tmp`. The contained failure and
post-cleanup proof are recorded in
`platform-reliability-r1a-recovery-v3-merge-failure-20260803.{json,md}`.

This request authorizes only a bounded source merge after a fresh production
provider capture. It does not authorize image publication, cutover, deploy,
migration, GitHub-environment creation or Mission runtime activation.

## Immutable GitHub boundary

| Fact | Exact value |
| --- | --- |
| repository | `Glera/swipe-backend` |
| backend master / PR base | `f0cc933fb813be2e4784200592efced196d74973` |
| PR | `52` |
| PR branch | `codex/r1a-recovery-v3-20260803` |
| PR head | `8ea6f1de6d2fe4bbb43b56698fd135649130d3c5` |
| PR tree | `a7e4c6462d4d30d0af61eae4672792203739d832` |
| image CI | `30833244754`, success, `pull_request`, no publication |
| PostgreSQL CI | `30833244184`, attempt 2, success |
| implementation review | GO, no P1/P2, session `b045e4fd-b34d-4350-a636-677418ff76f1` |
| merge-packet review | GO, no P1/P2, session `d839b02b-1329-4abe-afc6-0918770762aa` |

Every identity and all 28 successful checks must pass again before key
creation and immediately before merge. GitHub environment `production` and
repository-level `RENDER_*` secrets/variables must remain absent. The old
candidate-v2 at `4714e339…` remains historical and cannot be reused.

## Exact bounded window

If and only if the operator names the eventual exact meta commit containing
this request, one attended window of at most 30 minutes may:

1. repeat every exact GitHub/meta/CI/review/absence check;
2. create and delete a non-secret bidirectional mount probe under
   `/Users/gleb`, proving browser-runtime and host reads/writes reach the same
   inode namespace;
3. pre-create one unique handoff at
   `/Users/gleb/.codex-r1a-render-key.XXXXXX` with mode `0600` and create one
   temporary account-wide Render API key;
4. in one non-emitting browser-runtime call, submit the grounded dialog, read
   the unique `code-snippet` textbox only into process memory, validate and
   write it directly to the pre-created shared-home handoff, fsync it, click
   the post-submit `Done` control and wait for the reveal dialog to be hidden;
5. verify only host file mode and non-zero size, then run the committed
   canonical GET-only provider capture plus the previously reviewed bounded
   direct GET inventory for Blueprint syncs, all three services' deploys and
   web-service jobs;
6. require exact resource identities/source paths, Blueprint Auto Sync off,
   Auto Deploy off for all three services and zero active
   sync/deploy/preDeploy/job;
7. revoke the temporary key before merge, require an empty UI inventory and
   exact HTTP `401` from the revoked key, then remove the handoff;
8. repeat the GitHub CAS and all 28 checks, mark PR #52 ready, merge exact head
   with merge-commit semantics and verify resulting parents/tree;
9. commit bounded receipts with no credential value.

Exact Render identities remain:

| Role | Exact ID |
| --- | --- |
| owner/workspace | `tea-d1m4lmali9vc73euvelg` |
| Blueprint | `exs-d95qo3q8qa3s73ea23p0` |
| web | `srv-d95r3bfavr4c73aqsi4g` |
| sequencing cron | `crn-d9kej0u1egvs73engu7g` |
| materialize cron | `crn-d9e6vmtaeets73ai8cj0` |

## Secret invariants and hard stops

The key value must never enter argv, shell history, chat, clipboard, a tool
parameter, returned object, stdout/stderr, DOM snapshot, screenshot, receipt or
git. The only legal value path is reveal textbox → browser-runtime memory →
shared-home `0600` file → reviewed host child-process environment. No broad
browser observation is legal from final create submission until the reveal is
closed and the host verifies a non-empty `0600` file.

Stop and revoke without merge if the mount probe fails; any exact GitHub fact
differs; any provider identity/control is unsafe or unreadable; any operation
is active; the handoff is empty, linked or has wrong permissions; the reveal
does not close; any output exposes the key; revocation cannot be proved by both
empty UI inventory and HTTP 401; or the deadline expires. No replacement key
is allowed under the same GO.

If PR #52 was changed from draft to ready but did not merge, restore it to
draft. The merge API's exact-head/no-exact-base limitation remains handled by
the final pre-merge master read and post-merge first-parent/second-parent/tree
proof. A deviation is a contained failure and grants no later action.

## Explicitly forbidden

- workflow dispatch, image rebuild/publication or reuse of old candidate-v2;
- GitHub-environment creation or mutation;
- persistent Render service, Blueprint, source, image or environment mutation;
- deploy, rollback, preDeploy, Render job or database migration;
- disposable rehearsal or R1-A cutover;
- Stage 1 mutation/merge/rollout or any Mission runtime flag change;
- generative-feed scope expansion.

A successful source merge only creates source authority for a later candidate
publication request whose `publish=true` workflow must run the exact private
OCI LKG gate before candidate build/publication.

Operator form, not an authorization:

> GO R1-A recovery-v3 merge-window v2 for packet `<exact-meta-commit>` only.
> Run the exact shared-home handoff probe, create one temporary account-wide
> Render API key, perform the committed GET-only production capture, revoke and
> prove the key unusable, and only if every CAS and provider precondition passes
> mark backend PR #52 ready and merge exact head
> `8ea6f1de6d2fe4bbb43b56698fd135649130d3c5`. Publish bounded receipts.
> Workflow dispatch, image publication, GitHub-environment mutation, Render
> mutation, deploy, migration, rehearsal, cutover and Stage 1 runtime action
> remain forbidden. On failure or deadline, restore draft state if necessary,
> revoke the key and remove the handoff; do not create a replacement key.

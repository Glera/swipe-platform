# Platform Reliability R1-A — recovery v3 merge authority request

Prepared: 2026-08-03 UTC.

Status: **READY FOR OPERATOR DECISION; NOT AUTHORIZED**.

Option A has been implemented without production mutation. Backend draft PR
[#52](https://github.com/Glera/swipe-backend/pull/52) preserves the accepted
R1-A ancestry above the additive, default-off Mission storage migrations and
adds the exact old-image forward-compatibility gate required before any later
candidate publication.

This request authorizes only a bounded source merge after a fresh production
provider capture. It does not authorize image publication, cutover, deploy,
migration, GitHub-environment creation or Mission runtime activation.

## Immutable GitHub boundary

The window is bound to all of these identities:

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
| independent review | GO, no P1/P2, session `b045e4fd-b34d-4350-a636-677418ff76f1` |

At preparation time PR #52 is open, draft, mergeable and clean, with 28/28
checks successful. Backend master is still the exact base. GitHub environment
`production` is absent and repository-level `RENDER_*` secrets/variables are
absent. Those are observations, not reusable defaults: every one must pass
again in the attended window.

The prior candidate-v2 image at old head `4714e339...` is historical after the
recovery. It must not be reused as the candidate for this PR. Candidate
publication from the eventual merge result is a later, separately authorized
step whose `publish=true` workflow must execute the exact private OCI LKG gate
before candidate build/publication.

## Exact bounded window

If and only if the operator names the eventual exact meta commit containing
this request, an attended window of at most 30 minutes may:

1. repeat the exact GitHub CAS, PR state and check assertions above;
2. prove no merge/cutover/image-publication workflow is active and no GitHub
   `production` environment or repository `RENDER_*` authority exists;
3. create one temporary account-wide Render API key;
4. run the reviewed GET-only production provider capture against the exact
   owner, Blueprint, web and two cron IDs below;
5. require the capture to prove exact resource identity/source paths,
   Blueprint Auto Sync off, Auto Deploy off for all three services and no
   active deploy/sync/preDeploy/job;
6. repeat the GitHub CAS and all 28 successful checks immediately before the
   merge;
7. mark PR #52 ready, merge it with merge-commit semantics while matching the
   exact head, and verify the resulting master/PR state;
8. revoke the temporary Render key, remove its local handoff and commit bounded
   receipts without any credential value.

Exact Render identities:

| Role | Exact ID |
| --- | --- |
| owner/workspace | `tea-d1m4lmali9vc73euvelg` |
| Blueprint | `exs-d95qo3q8qa3s73ea23p0` |
| web | `srv-d95r3bfavr4c73aqsi4g` |
| sequencing cron | `crn-d9kej0u1egvs73engu7g` |
| materialize cron | `crn-d9e6vmtaeets73ai8cj0` |

The provider capture is a read-only merge precondition. The temporary key
must never enter argv, shell history, chat, clipboard transcript, receipts or
git. Its reveal is handled through the existing no-observation handoff
procedure, and it is revoked whether the merge succeeds or fails.

## Hard stops

Stop without merge if any of the following is true:

- backend master differs from the exact base, PR head/tree differs, or PR #52
  is not open/draft/clean/mergeable;
- any of the 28 checks is missing, pending or not successful;
- the accepted review or CI identities cannot be resolved;
- GitHub environment `production` or repository-level `RENDER_*` authority
  exists unexpectedly;
- another merge, cutover or image-publication action is active;
- any Render identity, service type, source branch or Dockerfile path differs;
- Blueprint Auto Sync or any of the three Auto Deploy controls is on or
  unreadable;
- any deploy, sync, preDeploy or service job is active;
- the temporary key cannot be captured without disclosure or cannot be
  revoked;
- the 30-minute deadline expires.

If PR #52 was changed from draft to ready but did not merge, restore it to
draft before cleanup. Never attempt to repair a failed precondition by changing
Render or by silently rebasing/updating the packet.

The GitHub merge API has an exact-head guard but no exact-base parameter. The
window therefore performs a final master read immediately before the merge and
requires the resulting merge commit's first parent to equal the exact base,
second parent to equal the exact PR head, and tree to equal the exact PR tree.
Any deviation is a contained evidence failure and grants no later action; it
must not be hidden or treated as the authorized result.

## Explicitly forbidden

This request does **not** authorize:

- any workflow dispatch or image rebuild/publication;
- creation or mutation of a GitHub environment;
- persistent Render service, Blueprint, source, image or environment mutation;
- deploy, rollback, preDeploy, `alembic upgrade`, downgrade or service job;
- R1-A cutover or disposable rehearsal;
- Stage 1 mutation, merge, rollout or any Mission runtime flag change;
- generative-feed scope expansion.

A successful source merge only creates the immutable source authority for the
next candidate-publication request. It does not make R1-A production-ready by
itself.

Operator form, not an authorization:

> GO R1-A recovery-v3 merge window for packet `<exact-meta-commit>` only.
> Create one temporary account-wide Render API key, perform the exact GET-only
> production provider capture, and if every committed CAS and Auto Sync/Auto
> Deploy precondition passes, mark backend PR #52 ready and merge exact head
> `8ea6f1de6d2fe4bbb43b56698fd135649130d3c5`. Verify the merge, revoke the
> temporary key and publish bounded receipts. Workflow dispatch, image
> publication, GitHub-environment mutation, Render mutation, deploy, migration,
> rehearsal, cutover and Stage 1 runtime action remain forbidden. On failure or
> deadline, restore PR #52 to draft if necessary and revoke the key.

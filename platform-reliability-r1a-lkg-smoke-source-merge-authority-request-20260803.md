# Platform Reliability R1-A — LKG smoke source-merge authority request

Prepared: 2026-08-03 UTC.

Status: **DRAFT; REQUIRES INDEPENDENT REVIEW AND EXPLICIT OPERATOR GO**.

The source correction is complete and independently accepted at exact meta
commit `d635398c5e87b33fb40bfa66ea952528e9fda68f`. This request is a
separate authority for merging only draft backend PR
[#53](https://github.com/Glera/swipe-backend/pull/53), and only after fresh
production evidence proves provider automation remains disabled.

It grants no candidate publication, deploy, migration, rehearsal, cutover or
Stage 1 runtime action.

## Immutable GitHub boundary

| Fact | Exact value |
| --- | --- |
| repository | `Glera/swipe-backend` |
| backend master / PR base | `f2a840517956c4f480fc9d8aaf6f832ebde489d9` |
| PR | `53`, open, draft, clean |
| branch | `codex/r1a-lkg-pythonpath-fix-20260803` |
| head | `223ab97cf6e24e0542337d2a39e1bce9529f5d00` |
| tree | `75dbd88045b5b301a903d9bc917c006cd2ceaffe` |
| checks | exactly 28 completed successes |
| image CI | `30849622831/1`, success, pull_request, zero artifacts |
| PostgreSQL CI | `30849622812/1`, success, pull_request, zero artifacts |
| independent review | GO, no P1/P2, session `ed223f76-4e01-4652-b484-84c0321c9221` |

Every fact must pass before temporary-key creation and again immediately before
merge. GitHub environment `production` and repository-level
`RENDER_*`/`PLATFORM_RELEASE_*` authority must remain absent.

## Fresh provider-isolation proof

The attended window may create exactly one temporary account-wide Render API
key. Before creation it must prove the browser/host shared-home inode boundary,
precreate a unique `0600` handoff under `/Users/gleb`, and pin the
interpreter plus exact disposable-venv package set.

The accepted reveal contract is fixed: after submit, `code-snippet` is a
role=textbox DIV. In one non-emitting block, validate that shape without
returning diagnostics, read only `textContent` into process memory, write and
fsync the handoff, click `Done`, and wait for the dialog to be hidden. The
credential value or any derivative may never enter argv, history, chat,
clipboard, tool parameters/output, snapshots, screenshots, receipts, git or a
hash.

Using GET only, run the committed canonical provider capture and the bounded
inventory of Blueprint syncs, all three services' deploys and web jobs. Require:

- exact owner/Blueprint/service identities;
- source branch `master` and settled pre-cutover path
  `./Dockerfile.bake` for web and both crons;
- Blueprint Auto Sync false and every Auto Deploy false;
- zero active sync/deploy/preDeploy/job.

Revoke the key before merge, require an empty UI key inventory and exact HTTP
401 from the former credential, then remove the handoff. No replacement key is
allowed.

## Exact merge boundary

Within 30 minutes, after fresh provider proof, revocation and a final repeat of
every GitHub CAS/check:

1. mark only PR #53 ready;
2. merge exact head `223ab97cf6e24e0542337d2a39e1bce9529f5d00`
   once with merge-commit semantics and no auto-merge;
3. require the new master merge commit to have first parent
   `f2a840517956c4f480fc9d8aaf6f832ebde489d9`, second parent
   `223ab97cf6e24e0542337d2a39e1bce9529f5d00`, and tree
   `75dbd88045b5b301a903d9bc917c006cd2ceaffe`;
4. observe only automatically triggered push CI and commit bounded receipts.

If merge does not complete synchronously, restore draft state and stop. No
retry is authorized. A post-merge mismatch grants no revert or repair.

## Explicitly forbidden

No manual workflow dispatch/rerun, image action, GitHub production-environment
mutation, persistent Render mutation, deploy, production migration, rehearsal,
cutover, Stage 1 runtime action or generative-feed expansion is authorized.

Operator form, not an authorization:

> GO R1-A LKG-smoke source merge for packet `<exact-reviewed-meta-commit>`
> only. Run the exact shared-home probe and non-emitting temporary Render-key
> handoff; perform the committed GET-only production capture; revoke and prove
> the key unusable; and only if every GitHub/provider CAS passes mark backend
> PR #53 ready and merge exact head
> `223ab97cf6e24e0542337d2a39e1bce9529f5d00` once with merge-commit
> semantics. Observe automatic push CI and publish bounded receipts. No
> workflow dispatch/rerun, image action, GitHub-environment or persistent
> Render mutation, deploy, migration, rehearsal, cutover or Stage 1 runtime
> action.

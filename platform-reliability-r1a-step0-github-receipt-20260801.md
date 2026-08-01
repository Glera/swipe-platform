# Platform Reliability R1-A — Step 0 GitHub receipt

Observation time: `2026-08-01T11:27:21Z`.

This receipt records read-only GitHub state and immutable-ref publication. It
does not authorize or record a sentinel merge, workflow dispatch, GHCR
publication, Render mutation, rehearsal or production cutover.

## Plan capability

The authenticated GitHub Billing UI displayed both the success alert `Your
plan was changed successfully.` and subscription `GitHub Pro — $48.00 per
year`. No billing action was performed by the agent.

## Published immutable refs

| Repository | Ref | Remote SHA |
| --- | --- | --- |
| `Glera/swipe-backend` | `codex/r1a-rehearsal-baseline-20260801` | `1aee3e0bf596121d8d326951519d1f897e46ced1` |
| `Glera/swipe-backend` | `codex/r1a-rehearsal-candidate-20260801` | `c7c62ad893c361b78ddaba687e22254045525512` |
| `Glera/feed-prototype` | `codex/r1a-client-guard-20260801` | `e804c73d41f5e94401caa3bb5acb92f691866101` |
| `Glera/swipe-backend` | `codex/r1a-workflow-registration` | `5ef857f493016501a0eaa733d174eb39ba221d2a` |
| `Glera/p4g-workspace-meta` | `codex/platform-reliability-r1a-evidence` | `db85ca3be1264d10b2bf9566a3d10496db541f4d` |
| `Glera/p4g-workspace-meta` | `codex/r1a-rehearsal-blueprint-20260801` | `183336a1765933e8707a26747b7baf60d5212c1e` |

Each value was re-read through the GitHub Git References API after
publication. None of the five new branch names existed before publication;
the evidence branch advanced by fast-forward from
`e2466b90e53291e7f47e4eb6b0e016c5b0d7a501`.

## Fresh CI

The evidence-branch fast-forward updated open meta PR #40 and produced exactly
one automatic `meta-verify` run:

- run ID: `30697687280`;
- event: `pull_request`;
- head: `db85ca3be1264d10b2bf9566a3d10496db541f4d`;
- job: `verify`;
- result: `success`;
- started: `2026-08-01T11:26:32Z`;
- completed: `2026-08-01T11:26:57Z`;
- URL: `https://github.com/Glera/p4g-workspace-meta/actions/runs/30697687280`.

No workflow was manually dispatched or rerun.

## Repository authority inventory

Backend repository secret names were exactly:

- `GENERATOR_DEPLOY_KEY`;
- `SWIPE_UGC_DEPLOY_KEY`.

Repository variables were empty. Therefore no repository-level secret or
variable name began with `RENDER_`.

Backend environments were exactly:

- `master - swipe-backend`, with no protection rules and null deployment
  branch policy;
- `master - swipe-db`, with no protection rules and null deployment branch
  policy.

Environment `production` did not exist (`count = 0`). No environment, secret,
variable or provider state was created or changed while capturing this
inventory.

## Sentinel identity

At capture time backend `master` remained
`058c772ed5e0d46cf0e7ec4fcddf4f217b3f9ab2`, exactly the parent of sentinel
commit `5ef857f493016501a0eaa733d174eb39ba221d2a`. Its complete diff is two new
inert workflow files, 118 added lines and no deletion. No sentinel PR existed
at capture time.

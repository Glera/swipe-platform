# Platform Reliability R1-A — disposable rehearsal evidence packet

Status: **execution template; rehearsal not started**. Every `PENDING` value
must be replaced by bounded evidence from the attended run. This document is
not provider, publication, merge, deploy or production authority.

Execution contract:
`platform-reliability-r1a-disposable-rehearsal-runbook.md`.
Spend preflight:
`platform-reliability-r1a-rehearsal-cost-preflight-20260801.md`.
Operational ceiling: **USD 3.00**; creation stops before the first paid
resource unless the operator gives an action-time GO naming that cap and the
account-wide Render API-key blast radius.

## 1. Immutable reviewed inputs

| Role | Frozen ref | Exact SHA |
| --- | --- | --- |
| baseline backend | `codex/r1a-rehearsal-baseline-v2-20260801` | `0add5f3fbd2fa60a3a0a3ae2ba6f20ed333dd725` |
| candidate backend | `codex/r1a-rehearsal-candidate-v2-20260801` | `d0a9fa11cd88e3ae4202f7cafa631a319b622492` |
| client guard | `codex/r1a-client-guard-20260801` | `e804c73d41f5e94401caa3bb5acb92f691866101` |
| registration sentinel | `codex/r1a-workflow-registration` | `5ef857f493016501a0eaa733d174eb39ba221d2a` |
| rehearsal Blueprint | `codex/r1a-rehearsal-blueprint-v2-20260801` | `ccf690d106d7dd1f1d06279972a1851117287053` |

Blueprint path: `render.r1a-rehearsal.yaml`; Git blob
`809aa531176f44890f72dfa4953ee36148113629`; file SHA-256
`4361c8c826f6868de1d9bd34b2050fc0af1d05e2fa1974f2c832e8790b2c6710`.

Public release inputs:

- feed: `61110cdd506f5364b015f8e2b0cd81c12fda46a1`;
- playables: `0960952a9fc7d2d7e6f3ae23b1dffe039d97ebb9`;
- release archive: `a3a78562d6c71808e19d84bd1c23ab0cfaa0fc27`.

Preflight must resolve every remote ref and byte identity above again. Any
mismatch requires a new reviewed identity; never move a frozen ref.

## 2. Action-time authority and stop gates

- Operator GO text/time: `PENDING`.
- Accepted Render-key scope: account-wide read/write authority across every
  workspace visible to the operator account, constrained operationally to the
  recorded disposable IDs: `PENDING`.
- Maximum approved spend: `PENDING` (must be `<= USD 3.00`).
- GitHub Actions headroom and expected charge rechecked at: `PENDING`.
- Render creation estimate shown before mutation: `PENDING`.
- Production owner ID excluded from every target:
  `tea-d1m4lmali9vc73euvelg`.
- Known production IDs excluded from every target:
  `exs-d95qo3q8qa3s73ea23p0`, `srv-d95r3bfavr4c73aqsi4g`,
  `crn-d9kej0u1egvs73engu7g`, `crn-d9e6vmtaeets73ai8cj0`,
  `dpg-d95r32favr4c73aqs4d0-a`.

Stop before mutation on an unreadable/mismatched owner, non-empty destination,
unexpected Blueprint action, pre-existing GitHub `production` environment,
repository-level `RENDER_*` authority, remote ref drift, package-inventory
ambiguity or provider estimate above the approved cap.

## 3. Fresh pre-mutation inventories

| Receipt | Path / URL | SHA-256 | Result |
| --- | --- | --- | --- |
| GitHub environments | `PENDING` | `PENDING` | `PENDING` |
| GitHub repo secret/variable names | `PENDING` | `PENDING` | `PENDING` |
| Render visible owners/workspaces | `PENDING` | `PENDING` | `PENDING` |
| empty disposable owner services | `PENDING` | `PENDING` | `PENDING` |
| empty disposable owner databases | `PENDING` | `PENDING` | `PENDING` |
| Render GitHub App repository access before | `PENDING` | `PENDING` | `PENDING` |
| GHCR package inventory before | `PENDING` | `PENDING` | `PENDING` |

Disposable Render workspace/owner ID: `PENDING`.

Blueprint validation must return `valid=true`, names
`swipe-backend`, `swipe-seq-shadow-run`, `swipe-c1-materialize`, `swipe-db`,
and exactly four create actions with no KV/environment-group action.

- validation response: `PENDING`;
- validation SHA-256: `PENDING`;
- dashboard source/destination screenshot: `PENDING`.

## 4. Disposable identities and provider controls

| Resource | Exact ID | Initial deploy ID | Required control |
| --- | --- | --- | --- |
| Blueprint | `PENDING` | n/a | Auto Sync No |
| web | `PENDING` | `PENDING` | Auto Deploy Off |
| seq cron | `PENDING` | `PENDING` | Auto Deploy Off; far-future schedule |
| materialize cron | `PENDING` | `PENDING` | Auto Deploy Off; far-future schedule |
| PostgreSQL 16 | `PENDING` | n/a | free; `swipe_r1a_rehearsal` |
| registry credential | `PENDING` | n/a | classic PAT, exact `read:packages` only |
| temporary Render API key | identity only: `PENDING` | n/a | revoke during cleanup |
| GitHub environment | `production` | n/a | selected candidate branch only |

The raw GET receipts and canonical provider capture must prove the disposable
owner, exact baseline branch, `./Dockerfile`, Starter services, Frankfurt,
Auto Sync false and Auto Deploy Off. Record their paths/SHA-256 here:

| Resource | Raw receipt | SHA-256 | Canonical assertion |
| --- | --- | --- | --- |
| Blueprint | `PENDING` | `PENDING` | `PENDING` |
| web | `PENDING` | `PENDING` | `PENDING` |
| seq cron | `PENDING` | `PENDING` | `PENDING` |
| materialize cron | `PENDING` | `PENDING` | `PENDING` |
| database | `PENDING` | `PENDING` | `PENDING` |

Attended dashboard screenshot proving **Off**, not **After CI Checks Pass**:
`PENDING`.

Both disposable cron source builds must print exact container identity
`0add5f3fbd2fa60a3a0a3ae2ba6f20ed333dd725` from
`/app/platform-backend-sha` before the crons are suspended.

## 5. GitHub environment authority

Environment creation time: `PENDING`.

- selected branch:
  `codex/r1a-rehearsal-candidate-v2-20260801`;
- environment secret names: exactly `{RENDER_API_KEY}`;
- environment variable names: exactly
  `{RENDER_SERVICE_ID, RENDER_BLUEPRINT_ID, RENDER_OWNER_ID,
  RENDER_REGISTRY_CREDENTIAL_ID, PLATFORM_DATABASE_IDENTITY}`;
- `PLATFORM_DATABASE_IDENTITY`: exactly `r1a-rehearsal-20260801`;
- every ID value equals the disposable inventory above: `PENDING`;
- repository-level `RENDER_*` names remain absent: `PENDING`.

No secret value is written into this packet.

## 6. Immutable image publications

### Baseline

- workflow: `.github/workflows/platform-release-image.yml`;
- exact workflow head SHA: `PENDING`;
- run / attempt: `PENDING`;
- conclusion: `PENDING`;
- GHCR version ID/tag/digest: `PENDING`;
- manifest SHA-256: `PENDING`;
- provenance/SBOM/sidecar identities: `PENDING`;
- compressed size and transfer budget: `PENDING`.

### Candidate

- workflow: `.github/workflows/platform-release-image.yml`;
- exact workflow head SHA: `PENDING`;
- run / attempt: `PENDING`;
- conclusion: `PENDING`;
- GHCR version ID/tag/digest: `PENDING`;
- manifest SHA-256: `PENDING`;
- pinned baseline run/digest/manifest equality: `PENDING`;
- provenance/SBOM/sidecar identities: `PENDING`;
- compressed size and transfer budget: `PENDING`.

Each SHA gets at most one publication dispatch. A failure is not blindly
redispatched or rerun. The two successful immutable package versions and their
90-day sidecars are retained for production cutover.

## 7. Coordinator execution matrix

Every row uses `.github/workflows/platform-release-cutover.yml` from exact
candidate ref `codex/r1a-rehearsal-candidate-v2-20260801`, the same remote
concurrency domain and a fresh provider CAS.

| Step | Run / attempt | Input CAS / identity | Receipt / SHA-256 | Required result |
| --- | --- | --- | --- | --- |
| prepare-source | `PENDING` | `PENDING` | `PENDING` | only disposable web switches to exact candidate digest; no deploy |
| candidate deploy | `PENDING` | `PENDING` | `PENDING` | predecessor→target; exact DB receipt; health + protective smoke |
| exact replay | `PENDING` | `PENDING` | `PENDING` | identical committed receipt identity/bytes |
| stale source-CAS | `PENDING` | deliberately stale | `PENDING` | typed refusal; no provider/DB change |
| conflicting binding | `PENDING` | distinct non-authoritative source | `PENDING` | `deploy_identity_conflict`; no provider/DB change |
| rollback | `PENDING` | pinned baseline digest | `PENDING` | baseline serves newer schema; no downgrade |

Database revision evidence:

- before candidate: `PENDING` (must be `0070_published_test_delivery`);
- after candidate: `PENDING` (must be `0071_platform_release_receipts`);
- after rollback: `PENDING` (must remain
  `0071_platform_release_receipts`).

Bounded candidate health JSON and SHA-256: `PENDING`. It must contain
`ok=true` and the expected compact-image change
`island.bake_runtime.state=local`; this is evidence, not a liveness failure.

Bounded rollback health JSON and SHA-256: `PENDING`.

Protective compact-image smoke receipt: `PENDING`.

## 8. Cleanup and revocation

Cleanup starts even after a failed rehearsal. Retained GHCR baseline/candidate
versions are the only intentional residue after PASS.

| Action | Completed at | Verification receipt |
| --- | --- | --- |
| suspend/delete disposable web and crons | `PENDING` | `PENDING` |
| delete disposable database | `PENDING` | `PENDING` |
| disconnect/delete disposable Blueprint | `PENDING` | `PENDING` |
| delete registry credential | `PENDING` | `PENDING` |
| revoke `read:packages` PAT | `PENDING` | `PENDING` |
| revoke temporary Render API key | `PENDING` | `PENDING` |
| delete GitHub environment secret/variables/environment | `PENDING` | `PENDING` |
| restore Render GitHub App repository access | `PENDING` | `PENDING` |
| delete disposable Render workspace | `PENDING` | `PENDING` |
| prove repo-level `RENDER_*` names absent | `PENDING` | `PENDING` |
| prove known production IDs never mutated | `PENDING` | `PENDING` |

Actual Render charge/estimate after cleanup: `PENDING`; must be within the
approved ceiling.

## 9. Completion audit

- all immutable inputs still resolve exactly: `PENDING`;
- every required receipt is bounded, no-clobber and hash-bound: `PENDING`;
- baseline/candidate package visibility and repository linkage: `PENDING`;
- all disposable authorities/resources removed: `PENDING`;
- production provider state unchanged: `PENDING`;
- Stage 1 PR #41 remains draft DO NOT MERGE: `PENDING`;
- independent reviewer verdict on this exact filled packet: `PENDING`.

Final rehearsal verdict: `PENDING` (`PASS` or typed failure).

## 10. Production cutover handoff after rehearsal PASS

Rehearsal PASS does not authorize production. The later operator packet must
pin the retained baseline/candidate build run IDs, image digests, manifests,
current production master heads, fresh production provider inventory and a
new single-use capture proving Blueprint Auto Sync and all three services'
Auto Deploy are Off. It must enumerate each attended merge/source switch,
deploy, verification and forward-only rollback action, with a stop point
before each external mutation.

Historical backend PR #33 remains at the pre-successor head and is currently
conflicting by construction; it is audit history, not the merge vehicle for
the exercised candidate. After rehearsal PASS, open a successor PR from the
unchanged frozen candidate SHA (or a new independently reviewed successor if
master moved). Never force-push a reviewed rehearsal ref or substitute an
unrehearsed merge head. Fresh exact-head CI and independent delta review are
required before the production packet can name that PR.

The operator must then give a new explicit GO for that exact production
packet. Stage 1 rebase/renumber/merge remains after successful R1-A cutover and
has its own separate GO.

# Platform Reliability R1-A — production cutover packet

Prepared: 2026-08-02 UTC; successor-v2 recovery updated 2026-08-03 UTC.

Status: **BASELINE RETAINED; CANDIDATE V2 PUBLISHED AND INDEPENDENTLY ACCEPTED;
CUTOVER AUTHORITY NOT GRANTED**. Backend `master` advanced through PR #49
after the old candidate publication. The action-time CAS correctly refused
packet `099f3de` before any external authority was created. Draft PR #51 is
the reviewed successor at exact head
`4714e339b60e3af747d138486ad7eadadec72dac`; it is green and independently
accepted. Its immutable candidate image was published once under exact
authority, is bound below and has independent receipt GO. This
packet authorizes no further publication, merge, GitHub production-environment mutation, provider source
switch, deployment, rollback or Stage 1 action.

The previous preparation request
`platform-reliability-r1a-cutover-preparation-authority-request-20260803.md`
is blocked and non-executable. The next bounded decision is the one-run
candidate request
`platform-reliability-r1a-production-candidate-v2-publication-authority-request-20260803.md`
plus its machine-readable JSON companion.

## 1. Accepted rehearsal authority

The corrective disposable run deployed exact candidate-v7, advanced the
database from `0070_published_test_delivery` to
`0071_platform_release_receipts`, proved exact replay and typed refusals, then
deployed exact baseline-v4 forward-only while retaining `0071`. Cleanup and
credential revocation passed. Its final authority is
`platform-reliability-r1a-rehearsal-evidence-packet-20260801.md` plus the
independent verdict recorded against that exact packet.

Rehearsal image identities are retained as evidence:

| Role | Build run | Image digest | Manifest SHA-256 |
| --- | ---: | --- | --- |
| rehearsal baseline-v4 | `30712414323` | `sha256:2230743aa443d481a1e5ee7fff1a7830403ebd94ca8a3464b497d879e722264b` | `ab33c178ca0671efc5ee5054d2971b898e217b9deca0624ed0b24e8bcc103bc3` |
| rehearsal candidate-v7 | `30712534528` | `sha256:837612eda640e037f6d5322dc57c5ca9706a665ea8a9a38d6c986a5b54cdd2fb` | `5cd2d48fa4d87944d6cca124f6bddc238b738f1ef2c4285f13ce2c708c1496e0` |

They are not production deploy authority. Backend `master` advanced after the
rehearsal fork, so production requires a newly built and reviewed pair.

## 2. Read-only preparation snapshot

Captured 2026-08-02; informational until repeated at action time:

| Boundary | Exact observed head |
| --- | --- |
| backend `master` | `a12ca7ecea0f47e8862b4ba91879dff63cb46bfc` |
| meta `master` | `f4db7ad9326c41e73d0d50cc9a0f0ed50e709dc4` |
| client `master` | `1d05bb13acfaa08ec607f3b1fc0010902a91ece6` |
| Stage 1 backend draft PR #41 | `2029867495578310dda92c170a2e07c71203eefa`, draft `DO NOT MERGE` |
| Stage 1 client branch | `43f92693b55057d4c22652cbd81dad4ab67f0171` |
| frozen rehearsal baseline-v4 | `8cb8239e04bf30f54f7fe1f85758da8f4fe7caac` |
| frozen rehearsal candidate-v7 | `9d3dc995b5f2976acbf18d3bac62ad3fc138f022` |

At capture time the rehearsal candidate was 27 commits ahead of and two
commits behind backend `master`, with merge base
`9277047852c0d73f4d3b9a081e1b0b586f48ae3c`. Historical backend PR #33 is not
the merge vehicle.

## 3. Successor construction before any production mutation

1. Create a new `codex/r1a-production-cutover-*` branch from the action-time
   backend `master`.
2. Replay/rebase the reviewed R1-A change range onto that exact head. Do not
   move any frozen rehearsal ref.
3. Add a cutover-only commit that pins the exact production owner, Blueprint,
   web, both surviving crons, PostgreSQL and least-privilege GHCR registry
   credential IDs. `authority_scope=production` must reject every other ID;
   the rehearsal scope must remain unable to target production.
4. Re-run the full R1-A suites, lock synchronization, Mission guard, compact
   image checks and PostgreSQL acceptance. Record exact run IDs and attempts.
5. Obtain independent review of the bounded delta from candidate-v7 and from
   action-time `master`. Findings are dispositioned before publication.
6. Open a new successor PR. It remains unmerged until the provider gate and
   exact operator GO below.

No Stage 1 commit is rebased, renumbered, merged or deployed in this phase.

### Superseded successor-v1 receipts

- draft PR: [backend #48](https://github.com/Glera/swipe-backend/pull/48),
  `DO NOT MERGE`;
- pre-pin head: `7728b89b329318bf59da67c117382e85d3a43ada`;
- exact reviewed pin head: `11c9bce9891ae5b041215056ac4521551a056cb5`;
- base: backend `master@a12ca7ecea0f47e8862b4ba91879dff63cb46bfc`;
- range-diff: 27/27 frozen candidate-v7 commits content-identical and in the
  same order, followed only by the Mission-policy reanchor;
- reanchor: `app/models.py` baseline 8,701 lines, SHA-256
  `fa7844bd4753bd6acb2206853dda046b617ff4e6f021a27a051e08f2b70e3cb0`;
  integration growth budget remains zero;
- image/compact check run `30738681840`: PASS;
- full PostgreSQL/migration matrix run `30738681843`: PASS;
- independent Claude session `141be604-da1d-42b6-9841-6960d290d08d`:
  GO, no P1/P2; receipt
  `platform-reliability-r1a-production-successor-review-20260802.md`;
- exact production registry credential:
  `rgc-d9np7tajnfac73bi5ib0`, bound in code and verified against Render's
  create, owner-inventory and direct-read receipts;
- exact-pin local tests: targeted 50/50 and broader release set 71/71;
- exact-pin CI: image/compact run `30762502229` PASS; full
  PostgreSQL/migration run `30762502196` PASS;
- exact-pin independent review session
  `19698a08-41ca-4e58-8be4-d5d2ac531ee3`: GO, no P1/P2; receipt
  `platform-reliability-r1a-production-pin-review-20260802.md`;
- production capture and retry-window audit:
  `platform-reliability-r1a-production-precutover-capture-20260802.md`.

These receipts remain valid history for candidate v1, but PR #48 is no longer
the merge vehicle because its base predates PR #49.

### Accepted successor v2

- draft PR: [backend #51](https://github.com/Glera/swipe-backend/pull/51),
  `DO NOT MERGE`;
- exact base: `7b41e96ad0d979863159ebdd356122af6295a203`;
- exact head: `4714e339b60e3af747d138486ad7eadadec72dac`;
- 29 R1-A commits replayed; old-to-new whole-tree delta is only two
  operator-gated comment lines in `render.yaml`;
- whole-tree diff SHA-256:
  `677c41e20f66daddcad7cfa35d35e53c3c3feb7be528f348b52187460f57caf6`;
- image/compact run `30817233456/1`: PASS, 1/1 jobs;
- PostgreSQL acceptance run `30817235439/1`: PASS, 25/25 jobs;
- independent review session
  `6717e2e6-272b-4e1a-bd3d-c4465e29df38`: GO, no P1/P2;
- exact receipt:
  `platform-reliability-r1a-production-successor-v2-20260803.{json,md}`.

PR #51 remains draft and unmerged. Steps 1–5 are complete again for the new
base, but candidate publication and all production actions remain separately
gated.

## 4. Production immutable images

The original pair publication completed and was independently accepted. Full
historical evidence:
`platform-reliability-r1a-production-image-publication-receipt-20260803.md`
and its machine-readable JSON companion.

| Role | Backend | Run | OCI index | Manifest SHA-256 |
| --- | --- | ---: | --- | --- |
| production baseline | `cd6fb13ab222b8c6f93b2c9fed12d86820f368a3` | `30789375002/1` | `sha256:39f354d8b22a221bf5f71ed912ca57d9bd16a8f8007958709e3e97f969b5eedb` | `b2ddb48a4c907b82b592a430336811a6514ec8a58c3c2cd8336f7e339a2bbc88` |
| historical candidate v1 | `11c9bce9891ae5b041215056ac4521551a056cb5` | `30789817457/1` | `sha256:1969bd9afeb948d9ab40432dd11e629d22ef37cc863204b97d6f45ef5ff6b8df` | `1e708f6418ddc88689ab0aae5cd67b7ce65ceb962cc50eaea81d7973b991613b` |

The old candidate manifest correctly pins the exact baseline as its LKG, but
its source predates new `master` and cannot authorize deploying successor v2.
It is now historical evidence only. Never redispatch that SHA.

The baseline remains the accepted forward-only rollback image: its source and
schema contract are unchanged, its Actions artifact is unexpired, and
successor v2 retains the same reviewed LKG range. Rebuilding it is forbidden.

Candidate v2 was published exactly once and pins the existing baseline:

| Role | Backend | Run | OCI index | Manifest SHA-256 |
| --- | --- | ---: | --- | --- |
| production candidate v2 | `4714e339b60e3af747d138486ad7eadadec72dac` | `30819666007/1` | `sha256:d6aae406275945b30475aa6c797f73d52af6108a715f5c5a4bcfe109fddcd05b` | `a0e128be8ed3fa2484c74108cf324c8a6449be23daa7da5c25943b22b4c4e9e5` |

Exact receipt:
`platform-reliability-r1a-production-candidate-v2-publication-receipt-20260803.{json,md}`.
The one-run authority is exhausted; no image may be redispatched or rebuilt.

## 5. Action-time provider gate

Before creating or using any production authority, capture read-only:

- production owner `tea-d1m4lmali9vc73euvelg`;
- Blueprint `exs-d95qo3q8qa3s73ea23p0`;
- web `srv-d95r3bfavr4c73aqsi4g`;
- crons `crn-d9kej0u1egvs73engu7g` and
  `crn-d9e6vmtaeets73ai8cj0`;
- PostgreSQL `dpg-d95r32favr4c73aqs4d0-a`;
- all consumer/source bindings, active deploy IDs, database revision and
  current provider environment key names.

The capture must prove:

1. every ID belongs to the production owner and matches reviewed code;
2. Blueprint Auto Sync is Off;
3. web and both surviving crons have Auto Deploy Off;
4. no deploy/sync/preDeploy or migration is active;
5. the current source branch and Dockerfile path are exact and expected;
6. the production database and consumer set have no unexplained drift;
7. the production GHCR credential is least-privilege and its exact ID equals
   the reviewed pin;
8. the protected GitHub `production` environment admits only the reviewed
   successor branch and contains only the declared Render secret/variables;
9. repository-level `RENDER_*` authority remains absent.

Unreadable, enabled or mismatched state is a hard stop. A capture authorizes at
most the one exact attended merge/cutover window and is never reused.

The provider-state and registry-credential portions were captured at
`2026-08-02T19:03:32.093657Z`; normalized state before and after credential
creation was byte-identical. The GitHub `production` environment remains
absent by construction and may be created and captured only inside the next
separately authorized cutover-preparation window. A fresh provider/database
capture is also required. The full gate is therefore not yet satisfied for
merge or deploy.

An attended refresh under authority `7ed3c5d` reconfirmed provider state and
database revision, but GitHub rejected plan-gated zero-value reviewer/wait
fields while creating the environment. The resulting empty shell was deleted
and the temporary Render key revoked; no secret, branch policy, merge, deploy
or migration occurred. Its exact evidence is
`platform-reliability-r1a-cutover-preparation-plan-failure-20260803.{json,md}`.
The successor request uses a plan-compatible payload that retains the exact
custom branch restriction and omits unsupported reviewer/wait fields. It still
requires a fresh named operator authority before execution.

A later authority named packet `099f3de`, but the first preflight observed
backend `master` drift from `a12ca7e...` to `7b41e96...` and refused before
creating a temporary key. No cleanup window started and no external mutation
occurred. Receipt:
`platform-reliability-r1a-precutover-master-drift-20260803.{json,md}`. The old
preparation request is non-executable; it must be replaced only after the new
candidate receipt is independently accepted.

## 6. Exact attended sequence after operator GO

Each item has a stop point and its own receipt:

1. **Freeze:** announce single-flight window; recapture all heads and provider
   state; stop on drift.
2. **Merge successor:** merge only the reviewed exact PR head while Auto
   Sync/Deploy remain Off; verify resulting merge SHA and no provider action.
3. **Prepare source:** dispatch exact reviewed coordinator workflow with fresh
   provider CAS; require source switch only and no deploy.
4. **Verify prepared state:** reread service/source/environment and active
   deploy; stop unless it equals the prepare receipt.
5. **Deploy candidate:** deploy exact production candidate digest. Require
   coordinator receipt, successful preDeploy, exact database receipt, expected
   revision and bounded health/protective smoke.
6. **Observe:** verify web plus surviving cron/consumer behavior while all
   mission flags remain default-off.
7. **Decision point:** on PASS, retain candidate and close the window. On any
   release-boundary failure, invoke step 8; product-level rollback is not
   inferred automatically.
8. **Forward-only rollback:** through the same concurrency domain deploy exact
   production baseline digest. Never downgrade the database. Require baseline
   health and compatibility with the current schema.
9. **Close authority:** capture final provider/database state, remove temporary
   environment authority and revoke temporary credentials that are not durable
   production dependencies.
10. **Publish receipts:** update backend implementation status and root durable
    decision without duplicating mutable CI/provider facts.

## 7. Required GO payload

The operator GO must name one immutable packet revision containing:

- successor PR number and exact head/merge target;
- production baseline and candidate build runs, digests and manifests;
- fresh provider/database capture digest and timestamp;
- exact production registry credential ID already reviewed in code;
- expected current deploy ID and database revision;
- verified Auto Sync/Deploy-Off result;
- rollback target and compatibility proof;
- approved execution window and authorized operator.

The baseline fields are fixed by §4. Candidate-v2 fields remain empty until
the one separately authorized publication succeeds and is reviewed. A later
packet revision must bind that new candidate, then add a fresh
provider/database capture, expected deploy identity, protected-environment
receipt and execution window. It must not rebuild the baseline or redispatch
any already published SHA.

Example form, not an authorization:

> GO R1-A production cutover for packet `<git SHA>` only: successor PR
> `<number>@<head>`, baseline run/digest `<...>`, candidate run/digest `<...>`,
> provider capture `<sha256>@<time>`, expected deploy `<id>`, DB `<revision>`.
> Execute §6 single-flight; forward-only rollback target `<digest>`.

## 8. Post-cutover boundary

Only after production cutover receipts are independently accepted may Stage 1
authors rebase and renumber their migrations around R1-A's `0071`. Stage 1
still requires its own CI/review and separate GO. Generative-feed scope remains
unchanged.

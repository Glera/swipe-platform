# Platform Reliability R1-A — production cutover packet

Prepared: 2026-08-02 UTC.

Status: **PRE-PIN SUCCESSOR ACCEPTED; PRODUCTION AUTHORITY NOT GRANTED**. Draft
backend PR #48 is rebased, fully green and independently accepted at exact head
`7728b89b329318bf59da67c117382e85d3a43ada`. This packet does not authorize a
merge, image publication, production provider mutation, deployment, rollback
or Stage 1 action. The next external step is deliberately blocked on explicit
operator authority to create/capture the least-privilege production GHCR
credential and fresh production provider gate.

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

### Completed pre-pin successor receipt

- draft PR: [backend #48](https://github.com/Glera/swipe-backend/pull/48),
  `DO NOT MERGE`;
- exact head: `7728b89b329318bf59da67c117382e85d3a43ada`;
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
- production authority remains fail-closed at
  `_PRODUCTION_REGISTRY_CREDENTIAL_ID = None`.

Steps 1–5 above are complete for the pre-pin head. The credential pin is a
new cutover-only commit on PR #48 after the action-time provider capture; that
new head requires focused CI/review before image publication or merge.

## 4. Production immutable pair

After successor CI/review GO, publish each SHA at most once:

- **production baseline**: exact action-time backend `master`, including all
  accepted production changes before R1-A;
- **production candidate**: exact accepted successor PR head, pinning the
  baseline's build run, image digest and manifest SHA-256 as LKG.

For both builds record ref, head SHA, workflow run/attempt, OCI index digest,
Linux/amd64 digest, manifest SHA-256, artifact ID/digest/expiry and package
version ID. A failed SHA is not redispatched; use a reviewed successor SHA.

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

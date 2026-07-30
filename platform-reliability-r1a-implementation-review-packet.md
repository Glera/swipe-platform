# Platform Reliability R1-A — implementation review packet

Status: **DRAFT pending exact-head CI and independent implementation review**.
This packet grants no production authority.

Plan authority: `platform-reliability-r1a-v2-plan-2026-07-30.md` merged in
`p4g-workspace-meta@ea89f97` after the Stage 1 reviewer GO on PR #39.

## 1. Exact review heads

| Repository | Branch | Exact head | PR |
| --- | --- | --- | --- |
| `swipe-backend` | `codex/platform-reliability-r1a-implementation` | `587fe8e` | [#33](https://github.com/Glera/swipe-backend/pull/33) |
| `feed-prototype` | `codex/platform-reliability-r1a-client-guard` | `a5be5d3` | [#15](https://github.com/Glera/feed-prototype/pull/15) |
| `p4g-workspace-meta` | `codex/platform-reliability-r1a-evidence` | pending this packet commit | pending |

Base production branches are unchanged by the implementation PRs. No image
was manually published, no Render setting was changed, no deploy was
triggered, and no production database command ran.

## 2. Package A — compact immutable image

- Multi-stage Python 3.13 image with fully hashed production and test locks.
- Runtime has no Git, Node/npm, Playwright, UGC checkout, runtime clone,
  GitHub token, `npm install`, or startup migration.
- Runtime source identity is `/app/platform-backend-sha`; OCI image is built
  and optionally published from the exact reviewed backend SHA.
- Build workflow creates a sidecar only after the OCI digest exists.
- Pull-request mode builds and tests but cannot publish or deploy.
- Built-image smoke asserts the Stage 0 route manifest, generation/bot/
  notification runners off, protective routes present, resolver signing,
  block-before-sign, and takedown-before-sign.

## 3. Package B — manifests and exact identity

`platform-release-manifest.v1` binds:

- backend, feed, and playables source SHA;
- typed production UGC absence;
- OCI repository and immutable digest;
- exact ordered Alembic graph and migration byte digests;
- predecessor, target, PostgreSQL 16 schema capability;
- explicit accepted revision lists for candidate and LKG compatibility;
- release profile, CI run/attempt, and `release.json v2` digests;
- exact LKG image and exact LKG manifest.

Manifests use RFC 8785 JCS, reject duplicate JSON keys and noncanonical bytes,
and have bounded input size. A first CI run exposed PostgreSQL int64 sequence
bounds outside the JCS safe-number domain; the contract now preserves those
exact values as decimal strings.

## 4. Package C — remote single-writer coordinator

- GitHub `production` environment is the normal production authority.
- Global `platform-production-release`, `cancel-in-progress:false`
  concurrency serializes prepare/deploy/rollback across branches and hosts.
- Operator supplies exact successful build run, manifest SHA-256, and current
  Render deploy ID; “latest” discovery is forbidden.
- GitHub API proves build conclusion and exact `head_sha`.
- Render Blueprint Auto Sync and service Auto Deploy must already be off.
- Source CAS is checked before any mutation and again immediately before
  deploy.
- Only one-key environment-variable updates are used; broad replacement is
  forbidden.
- PASS and typed FAIL coordinator receipts are bounded and no-clobber.

The one-time `prepare-source` operation is non-deploying. It performs an exact
CAS switch from Git-backed Docker to the candidate image repository/digest,
installs the reviewed `preDeploy` command and preserves `/api/health`.

## 5. Package D — startup/preDeploy split

Web startup executes only Uvicorn. `preDeploy` from the target digest:

1. verifies image-local source/profile/migration bytes against the exact
   sidecar delivered through strict base64 + digest-bound environment;
2. holds a dedicated two-key PostgreSQL advisory lock;
3. accepts only predecessor→target or target→target;
4. runs Alembic only in the first mode;
5. recaptures the complete schema capability;
6. writes an append-only exact-byte receipt in migration 0068.

The receipt binds database, deploy, image, manifest/authorization, revisions,
mode, graph/byte digests, and resulting capability. Retry with the same deploy
identity returns exact stored bytes; conflicting reuse fails closed. Update
and delete are rejected by a DB trigger. Downgrade refuses to drop nonempty
release evidence.

The existing `/api/health` remains liveness. `/api/ready` was removed from
this implementation because accepted plan §6 reserves it for R1-C; exact DB
verification remains pre-traffic in `preDeploy` and post-deploy in a Render
one-off job.

## 6. Package E — forward-only rollback

An implementation pass found a real design trap before merge: an old image
cannot verify a future migration from its own migration bytes. A naive reuse
of normal `preDeploy` would therefore block rollback after an additive schema
change.

The corrected protocol uses two exact manifests:

- the LKG manifest proves the old image's own local identity;
- the candidate manifest is a rollback authorization that pins that LKG and
  lists every newer schema revision it is reviewed to accept.

Rollback mode verifies both identities, checks current revision membership,
captures current capability, writes `lkg_rollback_verified`, and performs no
migration. Build rejects any candidate whose target would fall outside the
pinned LKG accepted revisions. Production `alembic downgrade` is absent.

Deploy and rollback use the same environment, remote CAS, concurrency,
post-deploy DB verifier, liveness smoke, and receipt schema.

## 7. Package F — Mission architecture guard

The exact §7 boundary approved by the Stage 1 reviewer is now executable.

Backend:

- only `api_results`, `api_daily`, `api_session`, `main`, and
  `migrations/env.py` may import the Mission domain;
- Mission domain may import only its own modules plus `app.db`/`app.auth`;
- `app.rewards` is explicitly forbidden as amount authority;
- `models.py` accepts zero Mission model classes/tables;
- reviewed integration budgets: config +25, results +40, daily +35, session
  +20, main +20, migration env +3;
- each domain module ≤600 lines; aggregate ≤3200.

Client:

- only API response, outbox, feed flow, and main bootstrap may import Mission;
- `island.ts` has zero Mission logic/import budget;
- `feed.ts` integration budget is +90;
- each Mission module ≤600 lines; aggregate ≤1800.

Both guards carry exact baseline SHA/line anchors. Mutants prove a forbidden
import, an unreviewed edge/model leak, and exactly +1 over budget turn CI red.
No Stage 1 product code is included.

## 8. Local evidence

- backend release/coordinator/guard: 17 tests PASS;
- physical local migration 0068 roundtrip: PASS;
- append-only mutation refusal: PASS;
- nonempty downgrade refusal: PASS;
- image route/runners smoke from runtime dependency set: PASS;
- closed-delivery resolver unit suite including takedown-before-sign: PASS;
- client guard + three mutants: PASS;
- client TypeScript/Vite production build: PASS.

Local PostgreSQL is not version 16, and the schema-capability gate correctly
refused to treat it as release evidence. PG16 evidence is accepted only from
the exact-head CI service container.

## 9. CI evidence

Pending exact-head results:

- backend compact image + sidecar;
- full PostgreSQL acceptance;
- migration 0068 physical roundtrip;
- all existing migration matrix jobs;
- downstream reverse drift;
- client lint + build.

Earlier red runs are retained, not hidden:

1. JCS rejected PostgreSQL int64 sequence bounds;
2. the first image smoke ran one legacy-public test under the final
   closed-delivery flag profile; the harness was narrowed to the resolver
   class while route-manifest behavior remains a separate image assertion.

Both failures produced code/harness changes before the final run.

## 10. Production prerequisites

R1-A cutover remains NO-GO until all are true:

1. Stage 0 P1–P5 full acceptance;
2. ≥24 clean freeze after Stage 0;
3. exact-head CI in §9 PASS;
4. independent implementation review accepts packages A–G;
5. GHCR registry credential and protected GitHub `production` environment
   configured;
6. disposable Render-compatible source-switch/deploy/rollback rehearsal PASS;
7. fresh production source/deploy/consumer inventory;
8. separate operator GO for the cutover window.

DB trust gates (restore drill, fresh credential, deny-by-default external
ingress, closed consumer set) remain prerequisites for the first production
Mission writer, not for this default-off implementation branch.

## 11. Reviewer checklist

1. Can any PR or local host publish/deploy without the protected environment?
2. Can two coordinator runs both pass source CAS and deploy?
3. Can Blueprint sync/autodeploy race the coordinator?
4. Does `preDeploy` accept any state beyond the three plan modes?
5. Can a receipt be changed, silently replayed under another identity, or
   lost with the ephemeral preDeploy filesystem?
6. Does rollback remain possible after additive migration without schema
   downgrade?
7. Can a crafted manifest widen LKG compatibility or bypass local image
   identity?
8. Does the compact image retain resolver/report/block/moderation while
   excluding the retired toolchain?
9. Do backend/client Mission mutants prove the exact approved boundary?
10. Is `/ready` correctly out of scope while pre-traffic verification remains
    real?

## 12. Requested disposition

Return one of:

- `GO` — packages A–G may be merged only as cutover preparation; production
  still waits for §10;
- `GO WITH CONDITIONS` — exact findings and required evidence;
- `NO-GO` — authority, rollback, schema, protective-surface, or coordinator
  invariant is unsound.

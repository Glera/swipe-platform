# Platform Reliability R1-A — implementation review packet

Status: **REVIEW-READY; exact-head CI PASS, independent implementation review
pending**. This packet grants no production authority.

Plan authority: `platform-reliability-r1a-v2-plan-2026-07-30.md` merged in
`p4g-workspace-meta@ea89f97` after the Stage 1 reviewer GO on PR #39.

## 1. Exact review heads

| Repository | Branch | Exact head | PR |
| --- | --- | --- | --- |
| `swipe-backend` | `codex/platform-reliability-r1a-implementation` | `bfccf83` | [#33](https://github.com/Glera/swipe-backend/pull/33) |
| `feed-prototype` | `codex/platform-reliability-r1a-client-guard` | `a5be5d3` | [#15](https://github.com/Glera/feed-prototype/pull/15) |
| `p4g-workspace-meta` | `codex/platform-reliability-r1a-evidence` | exact PR head containing this packet | [#40](https://github.com/Glera/p4g-workspace-meta/pull/40) |

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
- exact LKG image and exact LKG manifest for every deployable candidate.

Manifests use RFC 8785 JCS, reject duplicate JSON keys and noncanonical bytes,
and have bounded input size. A first CI run exposed PostgreSQL int64 sequence
bounds outside the JCS safe-number domain; the contract now preserves those
exact values as decimal strings.

The first immutable baseline cannot truthfully pin an earlier immutable
manifest. Its non-deployable evidence manifest therefore carries the typed
identity `lastKnownGood: {"kind":"bootstrap-root"}` and refuses any invented
image/hash fields. The first deployable candidate is a separate reviewed build
that pins the exact baseline image and bootstrap-manifest digest with
`kind=image`. Coordinator tests prove `bootstrap-root` is rejected before a
Render client is constructed or any remote request can occur. Candidate build
CI downloads the exact LKG artifact by successful run ID and derives rollback
compatibility from its canonical manifest. Build, cutover, coordinator, and
rollback preDeploy independently reject a widened/retyped compatibility claim
before production mutation or DB access.

## 4. Package C — remote single-writer coordinator

- GitHub `production` environment is the normal production authority.
- Global `platform-production-release`, `cancel-in-progress:false`
  concurrency serializes prepare/deploy/rollback across branches and hosts.
- Operator supplies exact successful candidate/LKG build runs, candidate
  manifest SHA-256, and current Render deploy ID; “latest” discovery is
  forbidden.
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
change. A later self-review found the complementary trap: pinning an LKG hash
while accepting its compatibility list as a separate manual claim would allow
accidental widening. Both are closed in the protocol below.

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

## 8. Package G — evidence and local acceptance

- backend release/coordinator/guard: 24 tests PASS;
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

Exact backend head `bfccf83`:

- compact image, PG16 schema capability, Mission guard, runtime inventory,
  and built-image protective smoke: **PASS**
  ([run 30554692436](https://github.com/Glera/swipe-backend/actions/runs/30554692436));
- PostgreSQL acceptance: **25/25 jobs PASS**
  ([run 30554692413](https://github.com/Glera/swipe-backend/actions/runs/30554692413));
- full acceptance inside that run: **522 passed / 41 skipped**, device flow
  **18 passed**, isolated durable-authorization roundtrip **1 passed**;
- migration 0068 physical roundtrip, every existing migration-matrix job,
  downstream reverse drift, and final head assertion
  `0068_platform_release_receipts`: **PASS**.

Exact client head `a5be5d3`:

- guard, three CI mutants, TypeScript lint and production build: **PASS**
  ([run 30552145216](https://github.com/Glera/feed-prototype/actions/runs/30552145216)).

Earlier red runs are retained, not hidden:

1. JCS rejected PostgreSQL int64 sequence bounds;
2. the first image smoke ran one legacy-public test under the final
   closed-delivery flag profile; the harness was narrowed to the resolver
   class while route-manifest behavior remains a separate image assertion;
3. the prior full PostgreSQL suite had one unrelated one-second boundary
   alignment flake in `agents_m2m`; 521 tests and every migration job passed.
   It was not waived;
4. the next full run exposed a real test-contour conflict: a committed
   append-only platform receipt correctly prevented a later legacy migration
   test from destructively downgrading the shared acceptance DB. The
   destructive roundtrip now creates and uses its own disposable database;
   neither the receipt guard nor its trigger was weakened.

The final exact-head run is required to be green rather than waiving any of
these failures. Findings 1, 2, and 4 produced code/harness changes; the
unrelated timing flake in finding 3 passed on the unchanged exact-head repeat.

## 10. Production prerequisites

R1-A cutover remains NO-GO until all are true:

1. Stage 0 P1–P5 full acceptance;
2. ≥24 clean freeze after Stage 0;
3. implementation branches rebased onto the exact accepted post-Stage-0
   heads, with a bounded integration diff and fresh exact-head CI/review;
4. exact-head CI in §9 PASS now and again after that rebase;
5. independent implementation review accepts packages A–G and the final
   post-Stage-0 delta;
6. GHCR registry credential and protected GitHub `production` environment
   configured;
7. disposable Render-compatible source-switch/deploy/rollback rehearsal PASS;
8. fresh production source/deploy/consumer inventory;
9. separate operator GO for the cutover window.

Merging backend PR #33 is part of the cutover preparation because it changes
the active Docker/Render contract and could interact with current Auto Sync.
An implementation-review GO does **not** authorize that merge. It may occur
only after items 1–8 are evidenced in the attended cutover sequence.

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

- `GO` — packages A–G may advance to post-Stage-0 rebase and disposable
  rehearsal; it does not authorize merge, publication, Render mutation, or
  cutover;
- `GO WITH CONDITIONS` — exact findings and required evidence;
- `NO-GO` — authority, rollback, schema, protective-surface, or coordinator
  invariant is unsound.

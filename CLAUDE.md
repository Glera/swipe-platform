# Durable product decisions

- Swipe feed content continuation v1 has **no “more like this” button**. Demand
  is inferred from play behavior, not from a request UI.
- The frozen chain is: strong/manual signals → versioned per-player/mechanic
  affinity snapshot → server slot decision → personal catalog runway → factory
  series or safe fallback.
- Initial affinity weights, two-strong-signal threshold and ~4-day decay are
  pilot hypotheses and must live in versioned config. Every personalized
  decision retains the frozen allocation closure in
  `feed_decision.candidate_snapshot` and its exact affinity/slot/runway
  explanation in the immutable 1:1 `feed_policy_decision_context` sidecar.
- The measurement anchor is the first **seen** generated-series impression
  whose decision atomically consumes the durable one-shot continuity trigger
  created by a manual built-in-series chest for the same mechanic. It is an
  identity JOIN, not a time-window guess, a click, or an issued-but-unseen
  decision.
- Canonical details: `swipe-backend/docs/specs/feed-policy.md`. Catalog/runtime
  safety flags still take precedence; `capabilities.levelSeries=false` until
  the full manifest-bound E2E is green.
- A positive morning review is R&D evidence, not publication authority. Human
  publication intent is a separate TMA approval of one exact
  `catalog.promotion-binding.v1`; the screen must show the server-derived
  publish/content/runtime identity and every ordered level before Approve.
- Catalog credentials are singleton scopes: evaluation and publication can
  never share a grant. `POST /api/catalog/publish` is absent unless both Lab
  auth and the separate publish flag are enabled, and an approved publication
  still creates only a `candidate`—never an automatically issuable feed item.
- Canonical catalog identity is `sort/base`; runtime playable identity is
  `marble-sort-swipe`. Allocation is blocked until a server-owned release
  registry proves their mapping to a deployable payload+sidecar digest. The
  QA-only pinned artifact (`releasePlayable:false`) must never be promoted into
  a production runtime target by convention or filename.
- Catalog runtime URLs are content-addressed directories, not mutable flat feed
  aliases with `?v=` cache-busts. The first frozen bridge promotes the exact
  verified QA executable file set into
  `runtime-releases/marble-sort-swipe/<artifactDigestHex>/` and adds a separate
  `runtime-release.v1` descriptor with `releasePlayable:true`; it never edits or
  copies the QA-only wrapper manifest. The first verified release is committed
  at artifact `sha256:d66b4e…f9293`; its exact descriptor JCS hash is
  `b899735e…586be`.
- Backend runtime registration is storage-first and internal-only: immutable
  registration identity, one active release per `mechanic/variant`, and
  `candidate → active → retired` are guarded in PostgreSQL. Activation accepts
  only fresh (≤10 min) evidence bound to a server-owned origin and the exact
  locators/digests. A self-hashed evidence document is not external authority:
  no activation route may accept caller-authored JSON. The implemented
  read-only Node probe re-fetches exact descriptor+sidecar+executables; the
  internal operator CLI is feature-gated, dry-run by default, pins the probe
  closure and Node binary, and has no origin/evidence arguments or HTTP route.
  This path's candidate→active→replay closure over HTTP+PostgreSQL is a
  coverage contract (run status with CI, not here); regardless, no production
  active row or allocation exists until deploy verification and manual
  device/event-order gates pass.
- Catalog allocation core and the implicit-feed shadow path are implemented
  locally behind
  `ENABLE_CATALOG_ALLOCATION=false`: migration `0016` makes decisions
  append-only, persists bounded canary/player admission and binds each allocated
  decision to the exact active runtime release. The frozen wire keeps catalog
  identity `sort/base` separate from playable `marble-sort-swipe`, revalidates
  the complete manifest/LevelSpec/runtime closure, deduplicates seen/holds by
  `(fingerprint_version, series_fingerprint)`, and serves immutable ordered spec
  batches. Its pure/HTTP→PostgreSQL/concurrency/migration-downgrade coverage is
  the frozen invariant; the pass/fail status of any run lives with CI, not here.
  Migration `0018` adds immutable policy configs/mappings,
  exact run-linked manual evidence, affinity snapshots, one-shot triggers,
  opaque authorizations, runway/context sidecars and the exact factory-handoff
  impression JOIN. Migration `0019` and the shadow client bridge now add
  server-reviewed built-in playable/variant/catalog identity, durable CP and
  run-start outboxes, true issued-vs-seen, exact active dwell, BFCache-safe
  pause/resume and accepted state-changing Sort actions. A mapping refresh only
  affects the next decision; forced challenge slots stay outside built-in
  attribution and retain their immutable challenge variant. The browser E2E
  covers mapping replacement, a stalled issued-without-seen target, exact
  run-start recovery after reload and challenge isolation. This bridge remains
  off by default behind `VITE_CONTROL_PLANE_ENABLED=false`.
  Migration `0020` adds the generic policy only as a non-routable shadow:
  append-only stable user holdout/cooldown assignments are committed before
  catalog eligibility, slot-mix is per opportunity, recovery/fallback is the
  exact current built-in, and quota is the prior `W-1` receipts plus current.
  The shared first-opportunity assignment is the activation watermark: plans
  form a gap-free causal prefix from it, reject future configs/catalog/runtime
  and exclude ambiguous same-millisecond evidence. Successful shadow selections
  maintain seen/issued-hold freshness only from causally proven reveal;
  successful continuity handoff is one-shot in shadow without mutating the
  real trigger. The plan never creates a decision, authorization, hold, canary
  admission or ticket. Migration `0021` now adds the operational shadow loop:
  one exact JCS pilot activation, a bounded per-user causal queue with fenced
  leases/failure receipts, live status, and a DB-clocked immutable UTC report.
  Reports globally canonicalize decision replays before the day filter, retain
  unresolved/rejected sources, bind activation/source/runner/plan membership,
  and return first-class `inconclusive` for sample-size, SRM, overlap,
  projection, assignment, or causal-order failures. Concurrent materializers
  elect one committed receipt and replay its exact bytes. The internal CLI is
  dry-run-first and separately gated by `ENABLE_FEED_SHADOW_OPS=false`; it has
  no HTTP/player authority. The physical-PostgreSQL closure this decision
  requires — planner/runner/player/effectful/recall acceptance and the guarded
  migration roundtrips — is bound to the migration graph (Alembic) and its CI
  run, not asserted as status here. External scheduling and pilot activation are still not enabled;
  the same acceptance must run in CI/deploy with exact production bootstrap.
  The internal published-only allocator's PostgreSQL E2E covers
  empty→refill, exact replay, concurrency and manifest-bound ticket issue
  (run status with CI, not here).
  Migration `0022` adds opaque player-v2 ticket/spec delivery and configured
  runtime evidence. Migration `0023` adds a separate append-only effectful plan
  and plan-bound authorization; it never promotes a shadow receipt. The main
  `feed.ts` now connects built-in opportunity → effectful authority → opaque
  allocation → ticket/spec → catalog-required iframe → exact results/chest,
  but only when all three default-off frontend gates are enabled:
  `VITE_CONTROL_PLANE_ENABLED`, `VITE_CATALOG_PLAYER_V2_ENABLED`, and
  `VITE_FEED_EFFECTFUL_AUTHORITY_ENABLED`. The in-app dogfood harness runs the
  real production Feed build over a two-level exact series plus terminal
  recall recovery, while its API/runtime are stubs (run status with CI, not
  here). A separate real
  HTTP→PostgreSQL E2E links one source decision through effectful plan,
  authorization, FeedDecision, ticket, configured attempt, exact level result
  and chest. Authority
  `plannedAt/issuedAt/expiresAt` are one millisecond identity in wire and DB;
  flooring the real microsecond DB clock is part of the invariant. This is not
  permission to enable the route: production runtime/bootstrap, real-backend browser E2E,
  external scheduling, reload/cross-origin/device/event-order and p95 remain
  hard gates; `capabilities.levelSeries=false` is unchanged.
- Manifest-bound ticket-v2/results is implemented locally in backend migration
  `0017`. `run.start.v2` derives entry/series/runtime from an allocated decision;
  `/results` accepts only the next 1-based manifest ordinal with exact
  `applied_spec_hash`, and the chest only after all levels. PostgreSQL binds
  append-only evidence to ticket generation/identity and closes composite-FK
  NULL holes. V2 cannot replay through legacy wire; disabling allocation blocks
  new tickets but preserves exact replay of a committed ticket/lost response;
  client-chosen `run_id` is serialized across tickets. The real HTTP→PostgreSQL
  E2E covers `allocate → ticket → level → chest`, backend-only (run status
  with CI, not here).
  Migration `0024` adds default-off append-only recall actions: one scoped
  endpoint handles first soft/hard recall and epoch-CAS `soft→hard`; hard action,
  unfinished-ticket revocation and exact `invalidated` facts commit atomically
  under `runtime → entry → ticket`, and late replay uses the same committed
  `recall_id`. The sequential PG lifecycle, frontend no-reward recovery, and
  both orderings of `/results`↔hard-recall and pending-attempt-replay↔recall
  are coverage this decision requires (run status with CI, not here); the
  durable invariant is that committed results stay exact-replayable and late
  attempts receive exactly one invalidation with the same action id. Operator
  UI and production E2E remain enable gates.

# Режим разработки: два контура (операторское решение 04.08.2026)

- Калибровка планки: у платформы ноль живых пользователей, вижен активно
  итерируется макетами. Валюта — скорость итерации; доступность и
  непрерывность церемонией не защищаем, проверка — наблюдением. Пересмотр
  планки — отдельное операторское решение при появлении аудитории.
- Дефолтный контур — «прототип»: механики, макеты и эксперименты ленты,
  вижен-прототипы. Без ТЗ, без раундов ревью, один агент — один проход,
  право ломать; критерий приёмки — «оператор может поиграть сегодня».
  Fidelity-гейты (device evidence / Reference Twin / class baseline)
  обязательны только для Production Original; прототипы в ленту идут мимо
  них.
- Контур «ядро» (исчерпывающий список): секреты и credentials; деньги и
  платёжные акты; необратимые внешние акты (публикация каталога, cutover,
  деструктивные миграции, исходящие сообщения пользователям); чужие
  пользовательские данные. Здесь — ровно один раунд независимого ревью плюс
  вторая подпись (оператор или frontier-сессия) на необратимом шаге.
- Многораундовые ревью-циклы (r2+, серии кросс-ревью) — только по явному
  операторскому запросу на конкретный артефакт, не как дефолт процесса.
- Штатная операторская поверхность first-party playable-прототипов — Labs,
  не GitHub/terminal/Render. Git остаётся audit/rollback под капотом; один
  content-bound Telegram Approve разрешает exact release. Обновление всегда
  пересобирает обе обложки, а добавление новой механики связывает static,
  mapping и roster одним plan. Mobile-first вход начинается прямо из живой
  карточки: operator может пометить механику, оставить instruction, сыграть
  candidate и принять exact release с телефона; код/сборка остаются за агентом
  на вычислителе. До реализации действует текущий Composer-путь; ТЗ:
  `docs/specs/lab-playable-release-fast-lane.md`.
- Продуктовые инварианты ниже остаются в силе для уже построенных контуров;
  двухконтурный режим управляет процессом новой работы.
- Портфель, владельцы контуров и очередь операторских решений — в `STATE.md`
  (читать первым, обновлять последним).

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
  That TMA Approve is the **final** human publication act (operator decision
  29.07.2026): before it the phone surface must expose an explicit Cancel/Deny;
  after it a server-owned scheduler may finish catalog delivery with no open
  browser and no second desktop click, and cancellation is not promised because
  delivery may already be running. The scheduler is delivery of an
  already-approved binding, never new authority: it accepts only an exact
  active flow with exact draft/revision/binding identity, and a catalog refusal
  must surface to the operator rather than dying in a log line.
- Catalog credentials are singleton scopes: evaluation and publication can
  never share a grant. `POST /api/catalog/publish` is absent unless both Lab
  auth and the separate publish flag are enabled. A human Approve is then
  admitted by a deterministic server-owned risk policy: content that exactly
  reuses an already-active known-good runtime (artifact+contract+capabilities)
  for a mechanic/variant the catalog has already published is published
  directly; any new runtime/contract/capability boundary — or an explicit
  operator limited-rollout request — stays a `candidate` for the
  candidate→canary→published ladder. Every admission writes one append-only
  `catalog_admission_receipt` bound to the exact publish receipt and its
  server-derived digest comparison; there is still no auto-publication without
  Approve, and recall is the safety net.
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
- VISION v3.0.1 supersedes the legacy Island product direction. The durable
  Stage 0 boundary is: fresh clients do not mount Island; legacy product,
  social, economy, rewards, bots, notifications and bake/theme generation stay
  off; existing `island_*` data and append-only evidence are retained, not
  migrated into mission truth. Closed delivery, report, block, moderation and
  recall remain available as the protective envelope for already-created UGC.
  Future shelter/mission meta is a new server-owned contour: public mission
  facts are human-true, historical puzzle balances are not contributions, and
  Stage 1 may derive contributions only from new qualified-series/daily
  receipts under its own default-off gates. Creator District / `?metaworld=1`
  remains a removable mock, not product authority. The production proof and
  mutable rollout status live in backend receipts and
  `docs/specs/IMPLEMENTATION-STATUS.md`, not in this ledger.
- Island Social Core is a separate `island_*` namespace, outside the
  catalog/feed contours. Its 25.07.2026 global rollout under VISION v2.6 is
  retained below as historical contract context, not current enablement.
  Post-moderation/report/takedown was its protective envelope; P2 visit-card,
  holdout and consent-bound notifications had separate rollback controls.
  Moderation automation still requires a new fraud/abuse evidence decision.
- The island measurement unit is a **client-asserted completion claim**
  (never "win": there is no ticket/oracle path for UGC), gated server-side by
  visit/min-time/per-day cooldowns/caps. Claims never enter qualified-play,
  affinity, retention, creator payout or ad evidence — they are a separate
  `claimed` analytics class. House stage is `min(foreign_claims, 10)`; own
  plays never count (`owner <> guest`). Gifts v1 are puzzles only
  (collection cards deferred until collections are server-owned).
- Owner-facing «кто-то сыграл» is a projection of those same append-only
  completion claims, never a timer, visit-start or local simulation. The
  authenticated read is cursor-paged by the global claim `seq`; a missing
  cursor returns only the current high-water mark so enabling the surface cannot
  replay historical bot activity. Human and bot facts remain visibly distinct;
  removed/taken-down buildings and currently blocked actors are not surfaced.
  The cursor advances across hidden facts so lifting a block cannot resurrect
  an old notification.
- All balance-changing island events take `seq` from one DB sequence under a
  `FOR UPDATE` social row (total order per building). The append-only journals
  (`island_completion_claims`, `island_collect_claims`,
  `island_completion_outcomes`, `island_visit_awards`,
  `island_moderation_actions`, `island_meta_events`) are the source of truth;
  materialized counters are derived and replayable by `seq`. Every claim writes
  its immutable terminal outcome receipt in the same transaction as its first
  insert — without the receipt the claim does not exist. Replay reads only the
  receipt and never re-evaluates time, caps, flags or config: the same request
  on any later day or under any config returns a byte-identical response.
  Re-enabling `island_rewards_enabled` is never retroactively payable; back-pay
  is only a separate append-only operator-authorized process. All randomness is
  derived from a stable seed (visit_id / claim_id / chest-closure run_id) —
  never `random()` in a request.
- Visit-award (P2) chest evidence is an **exact server-resolved closure**, not
  client context: the terminal `VerifiedRun` with `metric_key='series'`, its
  consumed ticket, and the matching `RewardLedger` row
  (`lw:{run_id}`, `reason='series_complete'`, exact `meta.ticket_id`, owner =
  caller). A level-receipt, another user or a `legacy_no_ticket` record is a
  typed 404 `chest_not_found` — no roll without a real chest. One chest is at
  most one roll by construction (`run_id` PK, server-derived `roll_id`); the
  30% chance and daily caps are versioned config; holdout hides the card.
- Builtin bot binding is a typed **immutable identity**
  `{mechanicId, rosterRevision, versionsDigest}`: `mechanicId` is the client's
  sole runtime authority (fail-closed on unknown mechanics), and a changed
  binding on re-seed is a new `buildingId`. Immutable runtime *delivery* for
  builtin is **not** claimed in P1 — builtin mechanics ship over mutable deploy
  (a builtin-house guest plays the same bytes as the feed at that moment);
  exact by-digest delivery waits for a content-addressed contour and is tied to
  the P5/closed-CDN horizon. Bots are server-side active accounts in a reserved
  id range (`>= 900_000_000_000_000`, outside the Telegram range), operator-
  approved as a bootstrap mechanic, distinguishable as actor/source everywhere
  (`source`, `is_bot`, separate `bot_likes`, excluded from product metrics and
  future creator economy). The bot scheduler is fenced from v1: a PostgreSQL
  advisory lock held on one physical session for the whole tick and released in
  `finally`, one immutable per-day plan seeded once from
  `(bot, utc_date, config_digest)`, effects only in the transaction where the
  claim INSERT is proven via `RETURNING`, bounded same-day catch-up; a config/
  persona change takes effect only from the next UTC day.
- Island UGC moderation is **staged post-moderation** (VISION v2.5, operator-
  approved 24.07.2026): the machine playability gate proves technical
  playability only, not content safety. P3 moderation semantics stay gated on
  the merged VISION patch; before any guest sees UGC, report/block,
  exact-artifact-revision takedown, an operator publication/report queue with
  an observable review SLA, and revocable artifact delivery are mandatory.
  Every moderation action writes an append-only receipt bound to the exact
  `artifact_rel`; a mismatched revision is 409. The single-operator auth is an
  allowlist enforced by the server on every request (`?diag=1`/a hidden page
  is navigation, not an authorization boundary); the full scoped-grant
  contract is gated on "moderators > 1". Audience was expanded to ALL users in
  the historical 25.07.2026 rollout (swipe-backend PR #11). Stage 0 later
  removed the product surface while retaining this protective contract for
  existing artifacts. Moderation automation remains a new explicit operator
  decision with fraud/abuse and safety evidence.
- Island migrations `0050_a11` (cohort-watch base), `0051`–`0052` (island
  core), `0053` (async `/island/theme` jobs), `0054` (moderation-action
  seq) and `0055_island_p2` (visit-award response/config-digest +
  notification outbox/attempt-receipts) are merged to master (unified
  island, backend `c21d40f`→`36a7d2a`, client `d560076`→`dd9efbd`); P2
  (visit-card + consent-bound notifications + remove/block UI) was enabled in
  the historical 25.07.2026 rollout with versioned config
  (card 30%/holdout 10%/cap 5/day; notifications only after native
  requestWriteAccess consent, quiet hours 21:00–08:00 UTC, ≤3 attempts,
  consent+block re-checked before I/O); the legacy client visit simulator
  is removed (server facts only); P1/P3/P4 passed internal adversarial review (author ≠
  reviewer) AND independent Codex review (GO). Island was globally enabled by
  the 25.07.2026 operator decision (backend
  `a3dcdf7`/PR #11: `ENABLE_ISLAND_SOCIAL`/`ENABLE_ISLAND_BOTS` on,
  moderator allowlist `42692410`; client `19aece3`; rationale: empty
  platform, zero traffic, post-moderation contour live before real traffic);
  Stage 0 later disabled those product/social/generation gates while retaining
  protective delivery and moderation. Known accepted deviations of the
  historical rollout: bot seed runs `--apply`
  idempotently on service startup (ТЗ §3.1 said CLI dry-run-first; no
  advisory lock — single-instance assumption, multi-instance scaling
  requires a lock first). P4 reached its final async-only production contract
  on 25.07.2026: backend `01d3bf2` exposes only `202 {job_id}` and performs no
  model I/O in POST; client `2b827cd` (platform `5d0aa12`) has no dual-mode
  branch or opt-in header. VISION Part B is applied in v2.7.
  P5 closed delivery completed 26.07.2026 after the real-device gate passed on
  Telegram iOS/Android/macOS (fresh, resume, expired-link block, re-resolve and
  revoke semantics all PASS). Private Cloudflare R2 Standard stores
  content-addressed single-file HTML; state schema v5 persists only
  `rel + contentDigest`, never a bearer. Backend `89138b8` serves a
  consent-independent authenticated resolver with block/takedown/current-
  identity checks and 600-second signed GETs; client `c121121`
  (`swipe-platform@9d2c1ed`) has no public-UGC URL path. Migration `0057`
  scanned 7 records, migrated/verified 2 artifacts, changed 6 state rows and
  replayed with 0 changes/uploads. The public Render `swipe-ugc` service is
  suspended (legacy URL → 503), the repository is private, and a clean backend
  redeploy after privatization restored `bake_runtime=ready` at
  `swipe-ugc@563f9f4`. R2 omits Content-Length on presigned HEAD, so exact
  length remains fenced by authenticated HeadObject + signed GET sha256 +
  Range total. Already loaded bytes remain readable; new resolve is denied
  immediately and an already issued bearer expires within 600 seconds.
  The PG replay/idempotency/fencing/E2E/dogfood closure this
  decision requires is a coverage contract (run status with CI, not here);
  `capabilities.levelSeries=false` is unchanged.

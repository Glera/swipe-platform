# Island Social Core — P1-D integration & E2E review packet

Block P1-D: backend+client integration verification, browser E2E, dogfood, evidence
assembly. ТЗ `swipe-backend/docs/specs/island-social-core.md` v1.3 §7 (E2E list +
dogfood), §1 (R4 boundaries). Prepared by the P1-D executor agent.

Status: **GREEN** — local stand stood up, all island backend suites + migration
roundtrip + full pure suite pass, client tsc+build pass, all §7 browser E2E cases
and the §7 dogfood pass with DB-fact verification. No stop-the-line. No backend↔ТЗ
divergence found. No client integration fix was required.

---

## 1. Branch / commit map

### Backend — `swipe-backend` worktree `swipe-backend-island-social`, branch `island-social-core-p1`
Base `bc25381` → head **`bb8430b`** (pushed; ahead of origin/master by the island commits):

```
2f563b6 Island Social Core P1-A: config flags + photo_url plumbing
50a0c5a Island Social Core P1-A: endpoints
d99ac8e Island Social Core P1-A: tests + CI wiring
ac4bc66 Island Social Core P1-B: боты (builtin binding, сид-CLI, авто-друг, fenced-планировщик)
f3e12bb Island Social Core P1-A-fix: адверсариальное ревью (concurrency, cap, byte-identity)
bb8430b Island Social Core P1-B-fix: адверсариальное ревью (two-int runner lock, gated unlock)
```
Migrations: `0050_island_social_core` + `0051_friendship_user_hi_idx` (alembic head
`0051_friendship_user_hi_idx`).

### Client — `feed-prototype` worktree `feed-prototype-island-social`, branch `island-social-core-p1`
Base chain → `3eebca0` → `a85e768` → **`c27b58b` (P1-D, pushed this block)**:

```
3eebca0 Island Social Core P1-C: client stages, gifts, guest claims, friends HUD
a85e768 Island Social Core P1-C-fix: адверсариальное ревью
c27b58b Island Social Core P1-D: browser E2E              ← added by P1-D, pushed to branch
```
`c27b58b` adds `scripts/check-island-social-browser.mjs`,
`scripts/island-e2e-support/*` (python DB helpers + README) and 9 screenshots under
`e2e-artifacts/island-social/`. Master untouched; branch push only.

---

## 2. Local stand

- Disposable PostgreSQL 15 cluster (`initdb`, C locale) on `127.0.0.1:5210`, DBs
  `island_e2e` (stand) and `island_test`/`island_mig` (suites); `alembic upgrade
  head` → `0051`, all 17 `island_*` tables present.
- Backend: uvicorn on `127.0.0.1:5211`, `ENABLE_ISLAND_SOCIAL=1
  ENABLE_ISLAND_BOTS=1`, dev BOT_TOKEN + `DEV_USER_IDS`, `INITDATA_MAX_AGE=0`.
  Stand-only tuning (NOT prod): `ISLAND_PLAY_MIN_WIN_MS=1000` (fast deterministic
  wins), `ISLAND_BOT_TICK_SEC=100000` (manual ticks for a deterministic dogfood),
  `ALLOWED_ORIGINS` incl. the harness origin. No prod config / render.yaml touched.
- Bots: `python -m app.island_bots seed --apply` → 4 bots
  (`900000000000001..4`) with builtin bindings.
- Client: production `vite build` with `VITE_API_BASE=http://127.0.0.1:5211`,
  `VITE_ISLAND_ENABLED=1`, `VITE_UGC_BASE_URL=http://127.0.0.1:5213`; served on
  `5213`; auth via genuine HMAC-signed `initData` through the `?initData=` dev
  override. Stand torn down at end of block.

---

## 3. Test runs (this block's final re-verification, on the disposable PG)

Backend (`swipe-backend-island-social`, python 3.13, `.venv`):

| Suite | Gate | Result |
|---|---|---|
| `tests/test_island_social_core_postgres.py` | `RUN_CONTROL_PLANE_POSTGRES_TESTS=1` | **27 passed** |
| `tests/test_island_bots_postgres.py` | `RUN_CONTROL_PLANE_POSTGRES_TESTS=1` | **8 passed** |
| `tests/test_island_social_core_migration_postgres.py` | `RUN_ISLAND_SOCIAL_MIGRATION_TESTS=1` | **2 passed** (up/down roundtrip) |
| island non-PG units (`test_island_social`, `test_island_bots`, `test_island_social_core`, `test_island_recipe`, `test_island_state`) | pure | **31 passed** |
| **Full pure suite** (`pytest -q`, clean env, PG opt-ins off) | pure | **842 passed, 296 skipped, 10 subtests, 0 failed** in ~67s |

Note: an initial pure run reported 1 failure in
`test_cohort_observability.py::test_...fails_fast_when_incomplete`; this was **env
pollution** — the runner had `BOT_TOKEN` exported, which the test asserts is
*absent*. Re-run in a clean env → passes. The authoritative pure number above is
the clean-env run (0 failed).

Client (`feed-prototype-island-social`, node 24):

| Check | Result |
|---|---|
| `tsc --noEmit` | **pass (exit 0)** |
| `vite build` (`VITE_ISLAND_ENABLED=1`, real API base) | **pass** (single-file 1.09 MB) |

---

## 4. Browser E2E — §7 (Playwright, real client build ↔ real backend ↔ real PG)

Harness `scripts/check-island-social-browser.mjs`. Every case asserts both the
rendered DOM and the resulting PostgreSQL facts. **All cases pass.** Screenshots in
`feed-prototype-island-social/e2e-artifacts/island-social/`.

| Case | Flow | DOM assertion | DB fact | Screenshot |
|---|---|---|---|---|
| A | owner collect (no double-count) | puck shows `pending_gifts=3`; **two rapid taps → exactly ONE POST /collect** (in-flight guard); puck disappears after collect | `island_collect_claims` = 1 row `granted/gifts=3/puzzles=3`; `island:collect:*` ledger = 1 grant; `pending_gifts→0` | `A1-owner-island-max-foundation-puck.png`, `A2-owner-collect-toast.png` |
| A | MAX badge + stages | `g.isl-sector[data-b="1"] g.isl-max` text `MAX` (foreign_claims=10); B0 (stage 2) has no MAX badge | (social B1 foreign_claims=10) | A1 |
| A | foundation CTA | `g.isl-foundation` text `Создай механику` on empty unlocked slot | — | A1 |
| B | guest claim → gift, then repeat-day | win modal `.isl-win`; gift `🎁 Подарок: +3 🧩`; second same-day visit → `Сегодня подарок уже получен — приходи завтра` | `island_completion_outcomes` = `granted(3)` then `repeat_day`; exactly ONE `island:gift:*` ledger grant | `B1-guest-gift-granted.png`, `B2-guest-gift-repeat-day.png` |
| C | bot badge | `.isl-botbadge` text `🤖 бот` on a bot island | `island_bots` row exists for owner | `C1-bot-badge.png` |
| D | friend accept via `f_<code>` deeplink | auto-accept fires on boot; notifier "Вы теперь друзья"; HUD cell `[data-friend-visit=<inviter>]` | `island_friendships` = 1 active `invite` edge (lo,hi correct) | `D1-friend-accepted-hud.png` |
| E | **§7 DOGFOOD** | see §5 | see §5 | `E1-dogfood-house-grown.png`, `E2-dogfood-collected.png`, `E3-dogfood-bot-visit-gift.png` |

The guest win (B, E) is a **real** end-to-end win: `visits/start → complete →
result` all hit the real backend; only the mechanic runtime HTML (out of
island-social-core scope) is a fixture iframe that emits the standard
`{source:'playable',type:'completed',success:true}` past the min-win threshold.

MAX/stage-10 uses a direct-PG `foreign_claims=10` seed — sanctioned by §7 ("MAX-бейдж
и стадии … можно через прямые записи в PG для стадии 10").

### API-level cross-check (client's exact HTTP contract, signed initData → PG)
Before the browser layer, the same endpoints were driven directly and DB-verified:
guest claim `granted(+3)` / `repeat_day` / **byte-identical replay of the first
result**; owner collect `granted(gifts=2,puzzles=2)` / **replay** / **empty receipt**
(new claim_id, pending=0); friend code+accept; bot public `is_bot=true`. Journals
observed: `completion_claims×2`, `completion_outcomes {granted, repeat_day}`,
`collect_claims {granted, empty}`, `puzzle_ledger {island:gift+3, island:collect+2}`,
`meta_events {completion_claimed×2, gift_claimed, owner_collected×2,
friend_code_created, friend_joined}`.

---

## 5. Dogfood — §7 (automated, Case E)

`свежий аккаунт → авто-друг-бот → бот за сутки растит домик (план в БД) → сбор
тапом → визит к боту → completed → подарок-пазлы`:

1. Fresh user `700000020` + first island creation → `maybe_seed_bot_friend` attaches
   bot `900000000000001` (`source='bot_seed'`), asserted in `island_friendships`.
2. `run_tick(now=end-of-day)` → `plansWritten=4, claimsApplied=24, likesApplied=3`;
   the user's house grows to **foreign_claims=9 / bot_claims=9 / pending_gifts=9**
   (bot-sourced, capped at 9). `E1` shows the grown stage-9 house + pending puck 9
   with the bot friend in the HUD.
3. Owner collects by tap → `island_collect_claims granted/gifts=9/puzzles=9`,
   `pending_gifts→0` (`E2`).
4. User visits the auto-friended bot's builtin building, wins → gift
   `granted(+3)`; `island_completion_outcomes` row for guest `700000020` =
   `granted/3` (`E3`).

(TG digest is the P2 branch of the dogfood line and is out of P1 scope.)

---

## 6. R4 exact-scope compliance (§1)

Implemented in P1 and exercised: completion claims + stages + owner collect
(puzzles), bots (builtin binding, seed CLI, auto-friend, fenced runner), friends
(+block/remove in schema; accept/list/remove routes), metrics events, deeplinks
`f_`/`i_`.

**NOT implemented (tables-only / gated), verified absent as routes in P1:**
- **visit-award (P2)** — no `POST /island/visit-award/from-chest|accept|decline`
  route in `api_island_social*.py`; `island_visit_awards` table exists (0 rows).
- **moderation (P3)** — no `report`/`moderation`/`takedown` route; the only
  reference is the read-only derived `is_taken_down()` helper (explicitly "No P1
  route"); `island_moderation_actions`, `island_reports` tables exist (0 rows).
- **theme async refactor (P4)** — untouched.

No master push, no deploy, no flag enable outside the local stand. Backend flags
`ENABLE_ISLAND_SOCIAL`/`ENABLE_ISLAND_BOTS` remain default-off in code; client gated
by `VITE_ISLAND_ENABLED`.

---

## 7. Adversarial review rounds

- **P1-A (backend endpoints/tests):** GO-with-conditions → **6 fixes landed in
  `f3e12bb`** ("P1-A-fix: адверсариальное ревью — concurrency, cap,
  byte-identity"). Verified indirectly by P1-D: concurrent collect/claim,
  daily-cap and byte-identical replay paths are green in
  `test_island_social_core_postgres.py` (27 passed) and reproduced live (replay
  returns exact committed `response`).
- **P1-C (client stages/gifts/guest claims/friends HUD):** GO-with-conditions →
  **2 fixes landed in `a85e768`** ("P1-C-fix: адверсариальное ревью"). Verified by
  P1-D browser E2E (all client flows render and drive the real endpoints).
- **P1-B (bots + P1-A-fix):** GO-with-conditions (no P1 findings) → **2 fixes
  landed in `bb8430b`** after P1-D's stand was torn down:
  - **P2-1:** runner advisory lock `758012026` lived in the same single-bigint
    lock space as per-user `pg_advisory_xact_lock(user_id)` (the constant is a
    valid Telegram id — one such user could starve every bot tick, and a long
    tick could block that user's requests). Fixed: two-int form
    `pg_try_advisory_lock(classid=0x15A9D, objid=1)` — a separate PostgreSQL
    lock space, collision impossible by construction. New test
    `test_runner_lock_is_in_a_separate_space_from_per_user_locks` proves both
    directions; busy-path test updated. Bots PG suite: **9 passed**.
  - **P3-1:** `pg_advisory_unlock` no longer called on the busy path (gated by
    `got`) — spurious PostgreSQL WARNINGs eliminated.
  - Documented-not-fixed (reviewer P3s): the immutable daily plan does not
    re-check takedown/block mid-day at apply time (bot claims mint no puzzles;
    re-check lands with the P3 moderation package); commit-message test count
    off by one (13 new tests, not 12).
  - Reviewer verified clean: session-level fencing on one physical connection
    with `finally` release and idempotent catch-up after connection loss;
    immutable plans (config rotation mid-day inert); effects strictly gated on
    `INSERT … ON CONFLICT DO NOTHING RETURNING`; global 200/day cap
    race-free by construction; builtin binding immutability + non-bot
    rejection; consistent advisory→row lock ordering (deadlock-free);
    canonical serialization on all response paths.
  Final backend numbers after `bb8430b`: island suites together **67 passed**,
  migration roundtrip **2 passed**, full pure **842 passed / 297 skipped /
  0 failed**.

---

## 8. Documented accepted decisions

(a) **collect under kill-switch/daily_cap burns pending** — spec-faithful F003
("collect→0"): a collect event always drives `pending_gifts→0` regardless of reward
disposition (`island_collect` code path), so `rewards_disabled`/`daily_cap` collects
still consume the accrual. Confirmed in code (`api_island_social_core.py` collect).

(b) **read-surface public/state outside the flag** — `GET /island/public/{owner}`
and `GET /island/state` are extensions of existing endpoints (stage/pending_gifts/
takedown/is_bot fields) mounted regardless of `ENABLE_ISLAND_SOCIAL`; exposure is
nil (they only surface data the island already stored). Accepted.

(c) **`i_<owner>` deeplink alive outside `VITE_ISLAND_ENABLED`** — COHORT-PREFLIGHT
position: the client routes `i_`/`?island=` visits regardless of the UI flag, but
the server is inert without `ENABLE_ISLAND_SOCIAL`. Accepted; see Codex Q5.

(d) **13 pre-existing environmental failures in
`test_catalog_lab_auth_postgres.py`** — re-confirmed this block: **13 failed, 1
skipped** when run without the dedicated device-flow env (it needs
`ENABLE_CATALOG_LAB_AUTH`, `PUBLIC_BASE_URL`, `CATALOG_LAB_VERIFICATION_URL`, a
device identity). CI runs this file in a separate step with that env and excludes
it from the main PG batch. Unrelated to island; matches the baseline `d99ac8e`.

(e) **global bot cap on execution, not in plan** — `island_bot_daily_claims_cap`
(200/day system-wide) is enforced when applying claims, not baked into the immutable
per-day plan; the plan is deterministic per `(bot, date, config_digest)` and rotates
only on the next UTC day. Consistent with §3.3/F004.

---

## 9. Integration bugs & fixes

**None requiring a client/backend code change.** The client drives every real
endpoint correctly; DOM and DB agree in all cases.

Test-harness accommodations (not product defects), documented for reviewers:
- SVG island taps: a synthetic Playwright mouse click registers as a map **pan**
  (`panMoved`) and is suppressed by design; the harness fires the slot/puck click
  via `dispatchEvent('click')` to mimic a real tap. Real-device taps are unaffected.
- Guest win requires the mechanic iframe to emit `completed`; the harness serves a
  fixture playable (the mechanic runtime is out of island-social-core scope).
- `friends/code` `link` is `""` on the stand because the bot username env is unset
  (`mini_app_deep_link`); environmental, not a defect — the client composes its own
  share deeplink.

---

## 10. Questions for Codex (implementation review)

1. **Bot-tick target scope.** `_eligible_targets` grows *every* live player's public
   building (island updated within `target_days`), not only friends of the bot — so
   bots inflate `bot_claims`/`pending_gifts` on islands that never friended them
   (observed on the owner fixture during the dogfood tick). Intended ambient
   liveliness, or should ticks be friend-scoped? How does this interact with the
   per-`(bot,player)` 1–3 and global 200/day caps under many players?

2. **pending_gifts decoupled from guest gift disposition.** Owner `pending_gifts`
   increments on *every* foreign completion claim, including `repeat_day`/`daily_cap`
   /`rewards_disabled` (guest got no gift). So an owner harvests puzzles for visits
   that granted the guest nothing (confirmed live: 2 claims incl. a `repeat_day` →
   owner collected 2). Is the owner-collect economy intentionally independent of
   guest-gift disposition (anti-abuse implications)?

3. **Lost gift on an early `/result`.** The min-win gate is enforced on `/result`,
   but the client's retry-once is on `/complete`; a `/result` firing just under
   `island_play_min_win_ms` returns 425 and the gift is silently dropped (dbg "gift
   claim failed") while the visit/like still count. Acceptable, or should `/result`
   also retry / return a typed early signal the client can honor?

4. **Derived-counter drift.** `island_building_social` counters are mutated in place
   under `FOR UPDATE` by both human claims and bot ticks; the journals are the
   append-only source of truth (trigger-protected). Is a prod-side materialization/
   drift check planned (replay `seq` → recompute), or is the row treated as
   canonical between deploys?

5. **`i_<owner>` reachability once the backend flag flips.** Deep-link visits bypass
   `VITE_ISLAND_ENABLED`; once `ENABLE_ISLAND_SOCIAL` is on for anyone, a shared
   `i_`/`f_` link lets a flagged-off cohort member reach live guest-claim/friend
   endpoints. Is the "показ людям — отдельное решение оператора, гейтящееся на P3 +
   remove/block UI" boundary sufficient, given the server accepts these calls as
   soon as the backend flag is on?

---

## 11. Reproduce

Stand + suites: disposable PG on 5210, `alembic upgrade head`, uvicorn on 5211 with
the env in §2, `python -m app.island_bots seed --apply`, then
`scripts/island-e2e-support/seed_e2e.py`. Browser E2E:
`node scripts/check-island-social-browser.mjs` (see
`scripts/island-e2e-support/README.md` for env). Screenshots regenerate into
`e2e-artifacts/island-social/`.

---

## 12. Codex R1 fix round (diff-only R2 evidence)

Fix commits pulled and re-verified on a rebuilt stand (same pattern as §2):
backend **`305505e`** ("P1-fix R2: Codex review (backend)"), client **`60372ac`**
("P1-fix R2: Codex review (client)"). Alembic head unchanged (`0051`). All Codex
diff-only R2 conditions were reproduced against the real client build ↔ real
uvicorn ↔ real PostgreSQL, with the **production `island_play_min_win_ms=8000`**
(so every guest win is genuinely a sub-threshold "fast win").

| F | Fix commit | How verified (test / stand case) | Result |
|---|---|---|---|
| **F001** per-player bot cap | be `305505e` | Claim budget is now bounded **1..max per (bot, player)/day total across ALL that player's buildings**, then distributed round-robin (not per-building). `tests/test_island_bots_postgres.py` (11 passed, +3) + stand dogfood: a fresh 1-building user grew to `pending=6` from 4 bots (bounded), where the old per-building rule would over-grant. | PASS |
| **F006** replay auth + fingerprint | be `305505e` | Guest `/result` replay identity = **outcome only** (duration_ms excluded): foreign caller → 404, different duration_ms → byte-identical replay, different outcome → 409. `tests/test_island_social_core_postgres.py` (31 passed, +4) + `fastwin_evidence.py` (third post byte-identical). | PASS |
| **F007** full block incl. legacy complete | be `305505e` | A block excludes **both** sides on every path — `GET /island/public`→404, `visits/start`→404, `visits/{id}/complete` (legacy)→404, `like`→404 (not only `gift_available_today`). `tests/test_island_social_core_postgres.py`. | PASS |
| **F008** binding rotation on re-seed | be `305505e` | `seed --apply` with a changed binding atomically rotates the snapshot: new `buildingId` published, old retired from `island_states`, historical social rows preserved (was `ON CONFLICT DO NOTHING` orphaning). `tests/test_island_bots_postgres.py` F007-rotation. | PASS |
| **F002** binding authority + fail-closed | cl `60372ac` | `playSeries` resolves a bot builtin building **by `builtin.mechanicId`, never the mutable `tpl`**; unresolvable → fail closed (no visit). Stand: point 4a — building `tpl="merge"` but runtime chip = `BUILTIN · sort`; point 4b — `mechanicId="ghost-x-unknown"` → "Механика недоступна", **DB shows 0 visits / 0 claims**; point 4c — `GET /island/public` returns the `builtin` binding. Screenshots `R2-F002-binding-authority.png`, `R2-F002-fail-closed.png`. | PASS |
| **F003** bounded retry 425/Retry-After | cl `60372ac` | `/result` bounded-retries (3, same `visit_id`) honouring `Retry-After`. `fastwin_evidence.py`: first post @<8s → **425 + `Retry-After: 8`** → retry → `granted`; DB has **exactly 1 claim / 1 outcome / 1 gift-ledger row, pending +1**, and a third post is byte-identical. Browser CASE B & E win at 1.6 s (<8 s) and still reach the granted gift purely via the client's auto-retry. | PASS |
| **F004** accept after session bootstrap | cl `60372ac` | Friend-accept + HUD refresh moved into `applySessionBootstrap`; a cold user lands the accept on the **first** `/session`. Browser CASE D (fresh accepter `700000010`, `f_<code>` before any `/session`) → friendship created, inviter cell visible. Screenshot `D1-friend-accepted-hud.png`. | PASS |
| **F005** deeplink gate (flag-off inert) | cl `60372ac` | `VITE_ISLAND_ENABLED` gates the whole social surface. Stand point 3: a client built **without** the flag, opened with `?island=`+`tgWebAppStartParam=f_<code>`, mounts **no** `.island-world`, **no** `.isln-friends`, **no** island (meta) tab, and issues **no** `friends/accept` call. Screenshot `R2-F005-flagoff-inert.png`. | PASS |
| **F009** guest HUD puzzles | cl `60372ac` | A granted guest gift now flies puzzles into the shared counter (guest balance) — `openIslandWorld` passes `addPuzzles` on guest islands. Browser CASE B granted gift `🎁 +3` (`B1-guest-gift-granted.png`). | PASS |
| **F010** stage / gift-marker sync | cl `60372ac` | `/result` adopts authoritative `stage`/`foreign_claims` and clears `gift_available_today`. `fastwin_evidence.py`: after a granted claim `GET /island/public` returns `gift_available_today=false` and `stage=3` for that guest/building (consumed gift not re-offered). Browser CASE B repeat-day shows "приходи завтра", not a fresh gift. | PASS |
| **F011** friend-E2E hardening | cl `60372ac` | The E2E accept waiter is registered **before** navigation (a new `openPage` `beforeNav` hook) and the assertion requires a **visible, clickable** inviter cell after preloader fade. CASE D green; `D1` regenerated showing the inviter cell in the HUD (no blocking overlay). | PASS |

### New suite numbers (this round)

| Suite | Prev | Now |
|---|---|---|
| `test_island_social_core_postgres.py` | 27 | **31 passed** |
| `test_island_bots_postgres.py` | 8 | **11 passed** |
| Combined island suites (core+bots PG + `test_island_social`/`_bots`/`_social_core`/`_recipe`/`_state`) | — | **74 passed** (matches expectation) |
| `test_island_social_core_migration_postgres.py` (roundtrip) | 2 | **2 passed** |
| Client `tsc` + `vite build` | green | **green** |

### Browser E2E (regression + new)

- Regression CASES **A–E** all pass at the production `min_win=8000` (guest wins now
  travel through the F003 retry path). One P1-D harness adjustment: CASE E asserts
  the grown `pending_gifts` **dynamically** (now `6`, was `9`) because F001 tightened
  the per-player bot budget — the dogfood narrative is unchanged.
- New screenshots: `R2-F002-binding-authority.png`, `R2-F002-fail-closed.png`,
  `R2-F005-flagoff-inert.png`; `D1-friend-accepted-hud.png` regenerated (F011).
- New harness: `scripts/check-island-social-r2-binding-flagoff.mjs` (points 3, 4);
  evidence helpers `scripts/island-e2e-support/{fastwin_evidence,r2_binding_setup,mkinit}.py`.

### Two informational orchestrator decisions (recorded)

- **Replay fingerprint = outcome only, excluding `duration_ms`** (F006): `duration_ms`
  is a *measurement*, and a bounded retry (F003) legitimately re-sends a different
  `duration_ms`; folding it into the replay identity would 409 the honest retry.
  Identity is therefore the `outcome` (`completed`); a *different outcome* → 409, a
  *different duration* → byte-identical replay of the committed receipt. This is the
  exact retry-compatibility contract the fast-win path depends on.
- **Deeplink gate (F005) supersedes the earlier COHORT-PREFLIGHT stance** for the
  social surface: this **updates accepted-decision (c) in §8**. Previously `i_`/`f_`
  were "client-routed, server inert without the backend flag"; now the client fully
  gates `i_<owner>`/`?island=`/`f_<code>` behind `VITE_ISLAND_ENABLED`, so a
  flag-off build is inert client-side as well (strictly stronger). Codex question 5
  in §10 is thereby narrowed to the backend-flag-on case only.

### Stand note (no product impact)

Two stand-only issues were hit and resolved while gathering this evidence: (1) a
stray launchd-orphaned `postgres` postmaster attached to the disposable datadir on
an alternate port and collided with the 5210 cluster (resolved by reclaiming a
single postmaster on the datadir; the user's own `homebrew.mxcl.postgresql@15`
service — targeting `/usr/local/var/postgresql@15` — was **not** touched); (2) the
second harness serves on ports 5214/5215, which needed adding to the backend
`ALLOWED_ORIGINS` for the stand. Neither reflects a product defect.

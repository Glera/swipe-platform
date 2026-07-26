# Share / Challenge V1-B — recipient E2E stand packet

Stand verification of the recipient contour against backend **master@f4ddc37**
(alembic head **0056_challenge_v1**, `ENABLE_CHALLENGE_V1` off in prod) and client
branch **challenge-v1 @ba7607b**. Prepared by the P1-D stand executor.

Status: **GREEN with one STOP-THE-LINE.** Every backend recipient contract, the 426
fence, the flag-gated rail, and island liveness pass. The stop-the-line is that the
**V1 spec-bound recipient flow is not wired into the client app UI** (below), so the
recipient could only be driven at the HTTP + real-sibling-binder level, not through
the wired feed.

---

## 0. Environment fix (the reported SQLAlchemy/psycopg bug)

The shared `.venv` (SQLAlchemy 2.0.36 + psycopg[binary] 3.2.3) reportedly fails on
the `server_version` bytes-vs-str parse. **The bug did NOT reproduce here.** Against
a disposable Homebrew **PostgreSQL 15.14** the exact same pins parse
`server_version_info=(15, 14)` and `SELECT 1` cleanly. Conclusion: the failure is
**server-specific** (a different Postgres the author connected to), not a pin
problem.

Fix used (both belt-and-suspenders, shared `.venv` never touched):
- **Isolated stand venv** `scratchpad/ch_venv` = `python -m venv` + `pip install -r
  requirements-test.txt` → identical proven pins (SA 2.0.36, psycopg 3.2.3,
  fastapi 0.115.6, alembic 1.14.0).
- **Disposable PG 15** on `127.0.0.1:5220` (the server that does not trigger the
  bug). `alembic upgrade head` → `0056_challenge_v1`; 7 challenge tables + 20
  island tables.

## 1. Stand

- PG 15 disposable cluster `:5220`, DB `challenge_e2e` migrated to `0056`.
- uvicorn `:5221` (isolated venv) with `ENABLE_CHALLENGE_V1=1`,
  `ENABLE_ISLAND_SOCIAL=1` (D11 graph), dev BOT_TOKEN + signed-initData auth,
  `BOT_USERNAME=devbot` (deep links), generous run/result/create limits,
  `RUN_TICKET_MIN_RESULT_MS=0`, `ALLOWED_ORIGINS` for the harness ports.
- Client built from `challenge-v1` with `VITE_CHALLENGE_V1_ENABLED=true` (+ `false`
  build for the flag-off rail), `VITE_ISLAND_ENABLED=1`.

## 2. STOP-THE-LINE — recipient V1 flow not wired into the client UI

In `challenge-v1 @ba7607b` there are **two** challenge paths and only the LEGACY one
is wired into `feed.ts`/`main.ts`:
- **Legacy (wired):** `apiGetChallenge`/`apiAcceptChallenge`/`apiChallengeInbox`/
  `apiCompleteChallenge` — no wire header, plays the mechanic as an ordinary
  built-in iframe.
- **V1 spec-bound (NOT wired):** `apiGetChallengeSpecBoundRequired`,
  `apiGetChallengeLevelBundleRequired`, `apiStartChallengeRecipientRunRequired`,
  `apiPostChallengeResultRequired`, `apiCompleteChallengeV1Required`, and the
  `ChallengePlayerSession` sibling-binder (`src/challenge-player.mjs`). These
  symbols appear only in `src/api.ts` + `scripts/check-challenge-player.mjs`; they
  are never imported by `feed.ts`/`main.ts`/`island.ts`. `VITE_CHALLENGE_V1_ENABLED`
  gates exactly **one** live thing — the ⚡ friend-avatar badge (`feed.ts:3333`).

Consequences: (a) the recipient DOM E2E "deep-link → accept → level-bundle →
sibling-binder → complete" cannot run through the wired app; the wired legacy client
would in fact **426** on a spec-bound challenge (no wire header). (b) So the recipient
was driven at the contract level: real HTTP with the wire header + the **real**
`challenge-player.mjs` module fed the **real** backend level-bundle. This proves the
V1 backend + the client's V1 modules are correct and interoperable, and that the
remaining V1-B work is **wiring** those modules into `feed.ts`/`main.ts`.

## 3. Recipient V1 HTTP E2E — PASS (`check-challenge-recipient-e2e.mjs`)

Source built server-side (source client flow not wired, as expected):
`challenge_source_setup.py` seeds an **active `marble-sort-swipe`** fixture release →
source `run.start(run.start.challenge.v1)` → `result` → `create_challenge`
→ challenge `…`, content-addressed `runtime_url`
(`runtime-releases/marble-sort-swipe/<artifactHex>/index.html`), `deep_link`
`t.me/devbot?startapp=<id>`.

Recipient (HTTP, wire header + signed initData), each step DB-verified:

| Step | Result |
|---|---|
| `GET /challenges/{id}` (wire) | 200; carries `spec_digest`, `playable_id=marble-sort-swipe`, content-addressed `runtime_url` |
| recipient `POST /runs/start` (wire) | 200; **ticket-binding written BEFORE play**, bound to the **server-derived** `spec_digest` (recipient never sends the spec) |
| `GET /challenges/tickets/{ticket}/level-bundle` (wire) | 200; `schema=challenge.ticket-level-spec-bundle.v1`, `bundle.specDigest == spec_digest` |
| sibling-binder (real `challenge-player.mjs`) | `validateChallengeLevelBundle` → `buildChallengeFrameNavigation` (content-addressed `/runtime-releases/…/index.html?level_config=catalog_required&expected_spec_hash=…`) → `configure_ready → post_configure_level → configured → challenge_reveal_ready`; `applied_spec_digest` (wrapper) == `spec_digest` |
| `POST /results` (`applied_spec_digest`) | 200; server wrote `challenge_spec_bindings` for the recipient run |
| `POST /challenges/{id}/accept` (wire) | 200 |
| `POST /challenges/{id}/complete` (`applied_spec_digest`) | 200; rewards/DM path |

DB facts: `challenge_events = {create:1, accept:1, complete:1}`;
`challenge_ticket_bindings = 2` (source + recipient, same `spec_digest`);
`challenge_spec_bindings = 1`; `challenge_attempts = 1`;
`reward_ledger ch: = 3`; `challenge_friendship_receipts = created`;
**`island_friendships source='challenge'` (700000101↔700000102)** + `friend_edges = 2`
(dual-write D11).

## 4. 426 case — PASS (`check-challenge-426.mjs`)

A legacy client (NO `X-P4G-Challenge-Wire-Version`, exactly what wired
`apiGetChallenge`/`apiAcceptChallenge` send):
- `GET /challenges/{id}` → **426 `challenge_client_upgrade_required`**
- `POST /challenges/{id}/accept` → **426**
- recipient `POST /runs/start` → **426**
- **ZERO mutations** — counts of ticket-bindings/events/attempts/friendships/edges/
  receipts identical to the source baseline (only the source's 1 create-event + 1
  ticket-binding exist; no recipient rows created).

## 5. Rail browser check — PASS (`check-challenge-rail-browser.mjs`, screenshots)

Viewer V (700000102) is island-friends with challenger C (700000101) and has C's
unbeaten challenge in `box=in`.
- **flag ON** (`VITE_CHALLENGE_V1_ENABLED=true`): unified rail `[You | friends |
  challenges]`; **⚡ badge `.isln-friend__challenge-badge` on the friend avatar**
  `[data-friend-visit="700000101"]`; inbox card `.story[data-challenge]` present.
  `e2e-artifacts/challenge/rail-flag-on.png`.
- **flag OFF**: same rail + inbox card, **no** friend-avatar ⚡ badge (byte-identical
  legacy). `e2e-artifacts/challenge/rail-flag-off.png`.
- Minor client observation: at boot the ⚡ badge races the async island-friends
  population; it applies reliably only after a rail refresh (`window.__feedRefreshRail`).
  The harness forces one refresh; a wired build may want to re-badge after
  `refreshIslandFriends` resolves.

## 6. Island regression — island alive on master + 0056

- Island endpoints on the stand: `GET /api/island/state` → 200,
  `POST /api/island/friends/code` → 200 (`api_island_social_core.py` present on
  master).
- Challenge-migration island safety (PG tests, isolated DB): `island-CHECK
  roundtrip 0055↔0056`, `direct-play creates island friendship source='challenge'`,
  `block → zero rows + 404`, `426 upgrade`, `accept+complete both once` — **7
  passed**.
- (The full island A-E browser harness targets the newer `island-social-core-p1`
  client, a different branch than master's merged island — so island liveness was
  confirmed at the backend/endpoint + migration-roundtrip level instead of a
  version-skewed UI run.)

## 7. Prod read-only (task 6)

- `GET https://swipe-backend-541t.onrender.com/api/health` → build **`47501e5`**.
  Finding: prod is **origin/master HEAD = 47501e5**, which is **f4ddc37 (PR #16,
  the challenge merge) + one docs-only commit** (ТЗ v1.4.2; no code/migration
  change, no `0057` in code). So prod is **code-identical to f4ddc37**; the task's
  "build f4ddc37" expectation holds at the code level (prod build string differs by
  the docs commit).
- Prod challenge routes are mounted + auth-gated: `POST/GET /api/challenges` → 401
  without initData (route alive, TMA-gated). Flag-off create refusal could not be
  driven on prod (no prod BOT_TOKEN) so it was demonstrated locally.
- **Local flag-off** (throwaway uvicorn, `ENABLE_CHALLENGE_V1` unset, like prod):
  v1 source `run.start(run.start.challenge.v1)` → **409** (refused); legacy
  `GET /api/challenges` → 200; `GET /api/health` → 200. So with the flag off no v1
  object is created and the legacy contour is intact.

## 8. What did not work / open items

1. **Recipient DOM E2E** as literally specified is blocked by §2 (V1 recipient flow
   unwired) — recorded as the primary stop-the-line. Deliverable substituted:
   HTTP + real sibling-binder contract E2E.
2. Full island A-E browser harness not run (client-branch skew, §6); backend
   liveness + migration roundtrip used instead.
3. ⚡ rail badge boot-order race (§5) — minor client robustness note.

## 9. Reproduce

Backend `swipe-backend` @f4ddc37; disposable PG 15 on 5220; isolated venv
`scratchpad/ch_venv`; uvicorn 5221 with the env in §1. Client `challenge-v1`.
`node scripts/check-challenge-recipient-e2e.mjs`, `…/check-challenge-426.mjs`,
`…/check-challenge-rail-browser.mjs` (env: `API_ORIGIN, BOT_TOKEN, VENV_PY,
BACKEND_ROOT, DATABASE_URL`). Source helper:
`scripts/challenge-e2e-support/challenge_source_setup.py`.

---

## 10. Full viral-loop DOM E2E (final round) — heads: backend `c221113`, client `c9e9a55`

Both flows are now WIRED into the UI (play overlay `chpl-*`, wiring commits
**8762777** + **c9e9a55**); backend advanced to **challenge-source-level @c221113**
(V1-A.1 server-issued source level, migrations to **0057_challenge_source_offers**).
Internal review of V1-A.1 was **GO-with-conditions** → per-user offer idempotency
fix (`c221113`) + 2 spec clarifications (`@7b9eaad`). Stand: isolated worktree venv
(SA 2.0.36 / psycopg 3.2.3, no server_version bug against disposable PG 15) +
uvicorn @c221113 (head 0057, `ENABLE_CHALLENGE_V1=1`, `ENABLE_ISLAND_SOCIAL=1`) +
client build @c9e9a55.

### Runtime path used (task's CORS/CSP note)

The overlay builds the iframe from the bundle's **relative** `indexLocator`
(`runtime-releases/marble-sort-swipe/<hex>/index.html`) resolved against
`location.href` — i.e. the **app's own origin** — not `VITE_UGC_BASE_URL`. So there
is **no cross-origin/CORS problem**: the iframe is same-origin with the app. The
stand seeds the active release pinned to the **real hosted hex**
`d66b4e44…f9293` (which really exists under
`swipe-platform/runtime-releases/marble-sort-swipe/`), so the client builds the
**exact real content-addressed URL**
`…/runtime-releases/marble-sort-swipe/d66b4e44…/index.html?level_config=catalog_required&expected_spec_hash=<hex>`
— asserted verbatim. The real runtime is not auto-winnable, so a **fixture** served
at that exact path speaks the `configure_ready → configure_level → configured →
challenge_reveal_ready` handshake and signals the win (host timer owns
`metricValue`). A local `swipe-platform/runtime-releases` copy was available as a
fallback but not needed (same-origin).

### DOM cases (`scripts/check-challenge-play-browser.mjs`, screenshots)

| Case | Result |
|---|---|
| **RECIPIENT** (viral payoff) | deep-link `tgWebAppStartParam=<id>` → intro `Принять` → overlay mounts the **exact content-addressed URL** → handshake → visible **reveal** (`iframe.chpl-frame--ready`) → win → `/results`+`/complete` → result modal `🏆 Ты обогнал…`. DB: `events={create:1,accept:1,complete:1}`, ticket_bindings=2, spec_bindings=1, **island_friendship source='challenge'**, `ch:` rewards=3. Screenshots `play-B1-intro/B2-overlay-reveal/B3-result`. **PASS** |
| **Pause/HUD inset** | while overlay open the feed is paused (`challengePlayOpen`→`setHostPaused`) and the feed bar stays visible (overlay inset between `--top-zone-h` and `--bar-reserve`) — asserted in the recipient case. **PASS** |
| **CLOSE before win** | `button.chpl-close` (✕) → overlay torn down, **zero `/results`**, no `complete` event. **PASS** |
| **IDENTITY mismatch** | tampering the level-bundle params (specHash drift) → client identity recompute **aborts BEFORE mount** (no `.chpl-world`, zero `/results`). **PASS** |
| **OFF build** | client built without `VITE_CHALLENGE_V1_ENABLED` → v1 deep-link probes `GET /challenges/{id}` **without** the wire header → **426** → "Обнови приложение…" prompt; no overlay. Screenshot `play-OFF-upgrade-toast`. **PASS** |
| **SOURCE** (win CTA→overlay→create→share) | **best-effort / partial.** The source overlay is the *same* `chpl-*` code proven by the recipient case, and the source create chain (source-level offer → run.start → result → `create_challenge` → `share_url`/`deep_link` → `openTelegramLink`) is proven **server-side** (offer-based, DB: offer/spec/binding/challenge/create-event). The *feed normal-win → `button.challenge-pill` CTA* DOM trigger could not be driven by the fixture harness (the round is a catalog series; a single fixture win does not produce a manual non-series win) — this is a feed-round mechanic, not a Challenge-V1 issue. |

### metricValue (author's question, task 7)

The overlay treats the runtime's completion message **only as a boolean** and reports
`metricValue = round(performance.now() − solveStart)` — the **host timer** stamped at
reveal (`challenge-play-overlay.ts` `finishWin`). The real marble-sort runtime does
maintain internal timing (Matter.js `elapsedHistory`; a `redirect_bounce_fail
{elapsed_ms}` telemetry), and its win `postMessage({source,id,type,…})` may carry
extra fields, but **the client reads none of them for the metric**. Consequence: the
reported "solved in Ns" is the host wall-clock from *reveal→win*, which can differ
from the game's own internal solve time (it excludes pre-reveal configure time and
includes any reveal-to-first-input lag). Recorded, not fixed.

### Branch integration harnesses (task 6)

`check:challenge-426` **PASS**; `check:challenge-recipient-e2e` **PASS** (after
updating `challenge_source_setup.py` to the V1.4.2 **offer-based** flow — the old
client-authored `challengeSpec` path is now rejected by anti-substitution 409, a
correct behavior change). `check:challenge-rail-browser` — setup PASS but the ⚡
friend-badge assertion times out on the new client (boot-order race, previously
needing a forced `__feedRefreshRail`); the DOM play harness supersedes it for the
wired-flow evidence.

### Regression (task 8)

Island endpoints on the stand: `GET /island/state` → 200, `POST
/island/friends/code` → 200. Challenge PG suites (isolated DB, head 0057): 7 pass
— **island-CHECK roundtrip 0055↔0056**, source-level **deterministic issuance**,
**published-only pool**, **anti-substitution**, **empty-pool 409**, direct-play
friendship, 426 upgrade, accept+complete.

### Final heads

Backend **challenge-source-level @c221113** (alembic **0057**); client **challenge-v1
@c9e9a55**. Prod build (from §7) is code-identical to the merged challenge contour;
`ENABLE_CHALLENGE_V1` stays off in prod.

---

## 11. Codex final fix round (R2 evidence)

Heads: backend **challenge-source-level @539480b** (alembic head **0058_challenge_source_offers**
— Island P5 took 0057), client **challenge-v1 @4990a3e** (rebased on master c121121
with Island P5). Stand: isolated worktree venv (SA 2.0.36 / psycopg 3.2.3 — the
`server_version` quirk that blocked the author did **not** reproduce against a
disposable PG 15; `initdb` under `LC_ALL=C`, app/alembic under
`PYTHONUTF8=1`/`LANG=en_US.UTF-8`), uvicorn @539480b with
`ENABLE_CHALLENGE_V1=1 ENABLE_ISLAND_SOCIAL=1`, client builds with
`VITE_CHALLENGE_V1_ENABLED=1 VITE_ISLAND_ENABLED=1`.

| Finding | Fix | Proof on this stand | Result |
|---|---|---|---|
| **P1-1** offer-bound runtime (offer = the run's authoritative spec; `resolve_active_release` must not participate) | be `539480b` + wire field `sourceOfferRequestId` | `p1_offer_bound_runtime.py`: offer issued while release **A** active → **A retired** + **B activated** → source `run.start` with `sourceOfferRequestId` still resolves **A**; `challenge_specs.runtime_release_id` = A (state `retired`), and the level-bundle `indexLocator` the client puts in the iframe src carries **A's** content hash, **B's hash absent**. | **PASS** |
| **P1-2** committed-offer replay while the flag is OFF | be `539480b` | Offer committed on the ON backend; uvicorn restarted with `ENABLE_CHALLENGE_V1` **unset**; same `(user, request_id)` → **byte-identical** response (`cmp` clean); a **new** `request_id` → **409 `challenge_v1_not_enabled`**. | **PASS** |
| **P1-3** durable phase envelope (lost-response / reload) | cl `4990a3e` (`challenge-envelope.mjs`, phase-resume orchestration) | `check-challenge-play` **25 assertions pass** (ids minted once before the first POST and reused on retry/reload → exactly one offer/run/results/challenge, mount exactly once, frozen metric payload unchanged). | **PASS** |
| **P1-4** cross-origin gameplay win (SECURITY) | cl `4990a3e` (`challenge-overlay-guard.mjs`: source **and** origin **and** live configured-epoch; re-navigation revokes) | `check-challenge-overlay-guard` **7 assertions pass** (contract red-then-green) **plus a new DOM probe** `check-challenge-xorigin-dom.mjs`: post-reveal navigation of the real overlay iframe to a foreign origin which posts `completed` → **win rejected** (0 `/results`, 0 `complete` events, no result screen). Screenshot `xorigin-A-foreign-win-rejected.png`. | **PASS** |
| **P1-4 addendum** (author's concern: false revoke must not break honest play) | — | Same probe, case B: a legit same-origin runtime that never self-reloads → win **ACCEPTED** (exactly 1 `/results`, 1 `complete`), and the chpl frame is fetched **exactly once** between mount and win → the epoch-revoke never fires on honest play. **No false revoke reproduced.** Screenshot `xorigin-B-legit-accepted.png`. | **PASS (no finding)** |
| **P2** evidence hygiene (SOURCE fail-hard, prereq seeded in-harness, `ci:challenge-browser`) | cl `4990a3e` | Prereq seeding works (active real-hex release + 6 published sort levels). The now-fail-hard SOURCE DOM case is **RED** — see the finding below. | **partial** |
| **Rebase** backend → Island P5 (challenge offers 0057→**0058**) | be `539480b` | Fresh DB migrates to `0058`; Island P5 `0057_island_closed_delivery` applied (island_bake_jobs `content_digest`/`object_key`/`artifact_bytes` + `ix_island_bake_jobs_private_identity`); island endpoints 200 on the stand. | **PASS** |
| **Rebase** client → master (Island P5) | cl `4990a3e` | Combined build green; both check sets present; island + challenge harnesses coexist. | **PASS** |

### Full DOM cycle (task 1)

- **RECIPIENT — PASS** on the new heads: deep-link → `Принять` → overlay at the exact
  content-addressed URL → handshake reveal → win → `/results` + `/complete` → result
  screen. DB: `events={create:1,accept:1,complete:1}`, ticket_bindings=2,
  spec_bindings=1, `island_friendships source='challenge'`, `ch:` rewards=3.
  Screenshots `play-B1-intro`, `play-B2-overlay-reveal`, `play-B3-result` (regenerated).
- **SOURCE — RED (new finding, harness-level).** The fail-hard case never reaches
  `button.challenge-pill`. Root cause, evidenced: `Feed.seriesEnabled()` returns true
  for **every** feed playable (only an active challenge for the same mechanic disables
  it), so a normal feed win is **always a series win** — the "non-series manual win"
  the harness comment assumes is unreachable. The fixture's win therefore runs the
  series to payout and raises the **chest ceremony** (`.chest-ov--in`); `POST /api/results`
  fires (the win is registered) but the pill never appears. The series-win pill
  (`feed.ts:4619`, `showFallbackPrompt`, requires `!catalogSeries` + `seriesWinShown`)
  only follows the chest payout, and six real press gestures (pointerdown/hold/up) on
  `.chest-ov__chest` did not dismiss the ceremony in the fixture environment. The
  author committed this case fail-hard but never ran it against a backend stand (their
  own note: the local stand was blocked). **The source *contract* is nevertheless
  proven** — offer → `run.start`(`sourceOfferRequestId`) → result → `create` →
  `deep_link`/`share_url` all verified server-side, and the source overlay is the same
  `chpl-*` code the recipient case exercises end-to-end. Fixing the harness needs a
  chest-ceremony-aware step (or a non-series feed round), not a product change.

### Other cases re-verified on these heads

`check:challenge-426` **PASS** (426 on GET/accept/run.start, zero mutations);
`check:challenge-recipient-e2e` **PASS**; node harnesses
`challenge-identity` **7**, `challenge-player` **27**, `challenge-play` **25**,
`challenge-overlay-guard` **7** — all green. `check:challenge-rail-browser` still
flakes on the ⚡ friend-badge boot-order race (pre-existing, superseded by the DOM
harnesses). Therefore the aggregate `ci:challenge-browser` is **not green** on this
stand: two of its four members (rail-browser badge race, play-browser SOURCE) are red
for the reasons above.

### Regression (task 7)

Island endpoints on the stand: `/island/state` 200, `/island/friends/code` 200,
`/island/public/{unknown}` 404 (correct). PG suites on head 0058:
**challenge 53 passed** (`test_challenge_v1_postgres` + `test_challenge_source_level_postgres`),
**island 42 passed** (`island_social_core` + `island_bots`).

### Prod read-only (task 8)

`GET /api/health` → build **`2a373d0`** — a **docs-only** master commit (ТЗ v1.4.3);
master does **not** contain the source-level route or the offers migration (V1-A.1 is
still branch-only). Consequently `POST /api/challenges/source-level` → **405** (the
path only matches `GET /challenges/{id}`; the v1 route is absent in prod), while
`POST /api/challenges` and `GET /api/challenges` → **401** (mounted, TMA-gated).
Island P5 is live in prod: `bake_runtime {state: ready, ugc_commit: fffce85}`.

### CI status — blocked on CI-owner secrets/promotion (task 6)

- `gh workflow run challenge-e2e.yml --ref challenge-v1 -f backend_ref=539480b` →
  **HTTP 404: "workflow challenge-e2e.yml not found on the default branch"**.
  `workflow_dispatch` workflows are only registered from the **default branch**
  (`master`), and `challenge-e2e.yml` exists **only on `challenge-v1`**. Dispatch is
  therefore impossible until the workflow lands on master (or the CI owner promotes
  it).
- Repository secrets present: **`SWIPE_UGC_DEPLOY_KEY` only**.
  **`SWIPE_BACKEND_DEPLOY_KEY` is absent**, so the workflow's "Checkout
  swipe-backend" step would fail even once registered.
- **Requires the CI owner:** provision `SWIPE_BACKEND_DEPLOY_KEY` and merge/promote
  `challenge-e2e.yml` to the default branch (and, per the author's note, promote
  `workflow_dispatch` → `pull_request` once the backend head is frozen). Not invented
  or worked around here.

### Stand artifacts

Client commit **`f6bd2f2`** on `challenge-v1` adds
`scripts/check-challenge-xorigin-dom.mjs`,
`scripts/challenge-e2e-support/p1_offer_bound_runtime.py` and the
`xorigin-A/B` screenshots (recipient `play-B*` regenerated).

### §11 addendum — both harness debts closed (`ci:challenge-browser` 4/4)

Same heads (backend **539480b** / head 0058, client **4990a3e**); client evidence
commit **`9cff985`**.

**How the chest ceremony closes (for the protocol).** `showChestCeremony` builds a
`.chest-ov` scrim with hint "Tap or hold!" and a `button.chest-ov__chest`. Bindings:
`pointerdown → startCharge()` (sets `holdTimer = setTimeout(dropAll, HOLD_MS)`, with
`HOLD_MS = 500`, plus `setPointerCapture`), `pointerup`/`pointercancel` →
`endCharge() → dropOne()`. So:
- **short tap (<500 ms) = `dropOne()`** — one prize per tap; the ceremony only ends
  after the queue empties (N taps for N prizes);
- **press-and-hold ≥500 ms = `dropAll()`** — every remaining prize flies at once.
Either way, emptying the queue calls `vanishGift()` + `spendAndFinish()`, which
persists the reward, hides the hint and (after ~760 ms + stagger) hands off to
`showSeriesWinScreen(i)`. That screen is where the challenge CTA lives:
`showFallbackPrompt()` → `showChallengePill(..., persist=true)`, gated on
`lastRunId && !catalogSeries && payoutRunId matches && seriesWinShown.has(i)` (and it
yields to an island visit-award card when one is won). My earlier six blind ~140 ms
presses were therefore *taps*, which could not finish the queue — hence the red.

**Debt 1 — SOURCE DOM: PASS.** With the real hold gesture the whole chain runs in the
DOM: chest ceremony → `⚡ Бросить вызов · 0.8s` pill → `POST /challenges/source-level`
→ overlay on the exact content-addressed URL → handshake/reveal → win → `POST
/challenges` → `openTelegramLink(t.me/share/url?...startapp=<id>)`. DB: source offer
journaled, spec + ticket_binding written, exactly one challenge for that challenger,
`create` event = 1. Screenshots `play-A0-chest-ceremony`, `play-A1-cta-pill`,
`play-A2-source-overlay`. Two harness bugs were fixed on the way: (a) the runtime
fixtures hardcoded an artifact hex, so the overlay's runtime-identity guard aborted
silently (`configure → _fail('runtime')`, surfaced only as the
`challenge_play_aborted / configuration_runtime` analytics event) whenever a different
release was active — the fixtures now derive the digest from their own
content-addressed URL, like a real runtime; (b) the share assertion did not allow
percent-encoding (`startapp%3D`).

**Debt 2 — rail-browser: PASS, and it is NOT a product bug.** Diagnosis by DOM state:
the friends cluster held only 4 empty invite cells with **0** friend cells and **0**
challenge cards for >12 s, while the API demonstrably returned both for that user
(`/island/friends` → C, `/challenges?box=in` → the challenge). Instrumenting revealed
the page issued **no** `/api/session` at all: the harness serves on ports
**5223/5224**, which were absent from the backend's `ALLOWED_ORIGINS`, so every call
was CORS-blocked. With those origins allowed the case passes **without any forced
refresh** — which positively confirms the client author's **P3-3 re-apply at the end
of `renderFriendsHud` works**; the previously-needed `__feedRefreshRail()` nudge has
been removed from the harness. So this was case (a) (harness/stand), not case (b).

**Aggregate `npm run ci:challenge-browser` → 4/4 GREEN**: `check:challenge-426`,
`check:challenge-recipient-e2e`, `check:challenge-rail-browser` (⚡ badge, flag-off
byte-identical), `check:challenge-play-browser` (RECIPIENT, SOURCE, CLOSE, MISMATCH,
OFF-build). One infrastructural fix was required for the aggregate: four sequential
vite builds exceeded the 180 s `spawnSync` cap (`status: null`), so the build timeout
is now 420 s and build failures report `status`/`signal`. Prereq seeding is also
idempotent now (reuses an active release / existing published pool rather than
violating `uq_runtime_releases_one_active`).

**Stand note for CI:** the backend must allow the harness origins
(5223/5224 rail, 5233/5234 play+OFF, 5235 x-origin) in `ALLOWED_ORIGINS`, otherwise
these browser checks fail in a way that looks like missing UI.

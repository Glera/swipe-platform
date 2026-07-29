# Mobile-first Lab review queue + Lab performance · review packet

Date: 2026-07-29  
Author workspace: `/Users/gleb/My projects/p4g-platform-workspace`  
State: committed author branches; merge/deploy is blocked on independent review.

Draft PRs (exact review surfaces):

- backend: https://github.com/Glera/swipe-backend/pull/25
- generator: https://github.com/Glera/swipe-generator/pull/5
- feed/TMA: https://github.com/Glera/feed-prototype/pull/13
- agents/notifier: https://github.com/Glera/swipe-agents/pull/9

## Objective

Review one coordinated change across four repositories:

1. every human Series Order stop can be completed inside the Telegram Mini App
   on a phone, without a localhost link or generic Lab authority;
2. production notifications contain only the order title, optional brief,
   human action and one stable TMA inbox link;
3. Lab acknowledges long operations immediately, avoids hidden global
   projections on initial navigation, and produces repeatable latency evidence.
4. `/review` in the dedicated production Telegram chat opens one inbox for
   every current Series Order action plus standalone pending
   level/skin/series/experiment/prototype candidates.
5. Exact standalone HTML artifacts are captured from generator authority,
   uploaded once by SHA-256, verified again in TMA and executed only in a
   network-isolated sandbox. Voice input remains an editable local draft.

Frozen contracts:

- `swipe-backend/docs/specs/mobile-series-order-review.md`
- `swipe-backend/docs/specs/lab-performance-contract.md`

## Repositories and author-owned files

### `swipe-backend` (`b67a60c`, base `c24f801`)

New:

- `app/api_mobile_reviews.py`
- `app/mobile_review_contract.py`
- `app/mobile_review_service.py`
- `migrations/versions/0068_mobile_series_order_review.py`
- `tests/test_mobile_review_contract.py`
- the two specs named above
- `migrations/versions/0069_mobile_review_queue.py`

Modified:

- `app/api_catalog_lab_auth.py`
- `app/catalog_lab_auth.py`
- `app/config.py`
- `app/main.py`
- `app/models.py`
- `render.yaml`
- `tests/test_catalog_lab_auth.py`
- spec index/cross-links

### `swipe-generator` (`163400e`, base `b36811c`)

New:

- `src/mobile-review-bundle.mjs`
- `src/mobile-review-coordinator.mjs`
- `src/mobile-review-lab-client.mjs`
- `test/mobile-review.test.mjs`

Modified:

- mobile bridge wiring/status/auth/sync in `src/server.mjs`
- async publication preparation in
  `src/catalog-series-publish-initiation.mjs`
- compact order list and review-bootstrap projections
- lazy Memory context and initial route loading in `public/lab.js`
- mobile grant card and visible factory-review progress in
  `public/series-orders-ui.js`
- performance acceptance script/tests
- read contention hardening in `src/rework-store.mjs`
- browser stubs updated to serve the already-imported `run-status-ui.js`

Do not include the pre-existing untracked file
`test/series-order-compression-review-r1-repro.test.mjs`.

R2 general-queue bridge also owns:

- content-addressed standalone Lab package derivation;
- exact HTML artifact capture/upload;
- per-candidate fault isolation (one missing artifact cannot stop later inbox
  items);
- prototype feedback and server-recommended level/experiment rework handoff.

### `feed-prototype` (`3b82b0f`, base `f6eff58`)

New phone-native TMA surface:

- `src/mobile-review.ts`
- `src/mobile-review-navigation.mjs`
- `src/mobile-review-navigation.d.mts`
- `scripts/check-mobile-review-browser.mjs`

Modified API/bootstrap/styles/package scripts. The review route must return
before feed/session boot.

The TMA now supports exact Sort runtime plus verified sandbox HTML, persists
every form/voice draft on input, opens the next queue item after verdict, and
never receives provider/model identity before author-blind review.

### `swipe-agents` (`fd899e5`, base `4bc9a01`)

Production-action message now projects order brief and an allowlisted stable
`https://t.me/<bot>[/<app>]?startapp=review` URL. Technical ids are absent from
visible text. An explicit `/review` from the exact operator in the dedicated
production chat receives the same stable inbox link through the durable
Telegram outbox. Do not include the pre-existing untracked `.claude/`.

## Required authority invariants

1. `operator.review:write` is a singleton scope. It cannot inherit or combine
   catalog publish/recall/evaluation/roster authority.
2. Backend routes are physically absent unless both Lab auth and the mobile
   review feature flag are on.
3. TMA routes require signed Telegram init data and the exact dev-user
   allowlist. Generator upload/consume requires the singleton Lab grant.
4. A bundle is immutable/content-addressed. Lifecycle is append-only
   `current → superseded|decided|closed`, with a decided item receiving an
   explicit `applied|superseded` consumption receipt, never document UPDATE.
5. Genesis upload races for one order serialize in PostgreSQL. There is at
   most one current bundle after concurrent uploads.
6. Backend validates the complete action-specific decision domain before
   terminally recording `decided`.
7. Generator re-builds the bundle from fresh local authority before applying
   a phone decision. A stale/re-signed/cross-action decision cannot mutate the
   Series Order.
8. TMA receives no executable arguments, local filesystem paths, provider
   credentials, JWT, arbitrary callback URL or provider/model before verdict.
9. Preview membership is server-owned. Runtime handshake must bind contract,
   artifact and applied spec; a candidate outside bundle membership cannot be
   mounted or selected.
10. `telegram_approve` cannot be decided through `operator.review:write`.
    Publication continues to use the existing content-bound
    `catalog:publish` device flow and TMA confirmation.
11. The mobile route never boots `/api/session` or the player feed.
12. Reload preserves drafts and mutation identity. Lost response replays the
    same decision; double tap does not create a second effect.
13. After a decision the same TMA session follows the next current item for
    that order, but bounded polling never invents completion.
14. Production notification rendering cannot be pointed at non-HTTPS,
    non-`t.me`, foreign-start-param or credential-bearing URLs.
15. A publication bundle cannot stay current forever after the separate
    `catalog:publish` flow succeeds. Generator may append only a
    content-bound `closed` receipt; that endpoint cannot publish anything.
16. A phone decision racing a desktop/new-head action is consumed as
    `superseded` without applying to the new head or retrying forever.
17. Production notifications come from the coordinator's ready projection:
    an action is absent until backend acknowledged the exact current bundle,
    and disappears immediately after consume/close/head change.
18. Standalone backlog identity is derived only from immutable Lab evidence.
    A stale phone decision is re-derived and consumed as `superseded`.
19. Raw HTML upload is bounded while streaming (4 MiB), digest-checked before
    commit, append-only in PostgreSQL, and readable only by signed exact dev
    user. TMA repeats SHA-256 before sandbox launch.
20. Sandbox HTML has no `allow-same-origin`, no navigation authority and an
    effective `connect-src 'none'`; it cannot receive bearer credentials or an
    arbitrary URL.
21. A corrupt/missing standalone artifact produces a typed per-candidate issue
    and cannot block the rest of the inbox.
22. Mobile rework decisions carry no provider/model selection. Generator
    resolves a server-owned recommended registry profile only after verdict,
    then live preflight may honestly defer before any provider effect.
23. Voice recognition or Telegram keyboard dictation only changes a persisted,
    editable textarea draft. No audio or transcript is submitted before an
    explicit verdict button.
24. `/review` is argument-free, fresh-update checked, exact operator checked,
    exact production-chat checked and replay-safe per Telegram update id.

## Performance invariants

1. Orders initial view uses compact summaries, then loads one selected exact
   detail; it does not wait for full `/v1/lab`.
2. Review/Prototype/Workshop use `mode=review-bootstrap`; Queue uses
   `mode=poll`; Memory alone loads `/v1/context`.
3. GET projections no longer call `lab.advance()` synchronously.
4. Slow publication preparation acknowledges within one second, remains one
   exact in-memory operation, shows a spinner/phase, survives modal reload and
   does not create a second device authorization.
5. Factory review progress stays visible when re-rendering a formerly
   collapsed history block.
6. A short cross-process rework-store writer lock is absorbed within a bounded
   wait; a sustained lock still fails closed.
7. Every local server response emits `Server-Timing: total;dur=…`.
8. `scripts/check-lab-performance.mjs` writes an immutable evidence file with
   p50/p95/max for total latency, response bytes and server duration.

Committed-state isolated acceptance:

- evidence:
  `scratchpad/lab-performance-isolated-2026-07-29-r2.json`
  (`sha256:7d76e2cfce4b302a7a0c3c81ce7b93f6a9bd0a657d3692eb7e858a9379b5a42d`);
- 20 samples per route and 20 mixed rounds; all 12 applicable gates passed
  on an empty isolated data root (there was no selected-order detail);
- p95 shell 62 ms, full Lab 7 ms, poll 1 ms, review-bootstrap 2 ms,
  order critical path 2 ms, mixed concurrency 11 ms;
- an earlier populated isolated root also passed its selected-order gate.
  Exact values must still be regenerated after merge on the real data root;
  the empty-root result is not a production-load claim.

## Verification already performed

- backend full after R2: `1171 passed / 579 skipped / 10 subtests`; focused
  mobile contract: `16 passed`; Alembic base→head and head→base offline SQL
  generated successfully, including the closure and consumption constraints;
- feed full `npm run lint`: passed, including the expanded mobile browser E2E;
  it proves exact Sort plus digest-verified sandbox HTML, CSP network
  isolation, editable voice fallback, reload-safe draft and prototype verdict;
  the earlier mobile
  browser check injects a 500 ms decision response and proves synchronous
  disable + visible acknowledgement within the 100 ms interaction gate;
- generator R2 focused mobile profile: `13/13`; syntax/check profile passed;
  corrupt-candidate isolation, volatile-preflight stability and exact
  server-recommended rework are executable regressions;
- the 67-test broad changed-file browser/service profile produced two timing
  failures only under parallel browser load; each failed test then passed
  alone (`3/3` and `2/2`). Treat this as a test-stability note, not a hidden
  green claim;
- generator full verify reached `619 passed / 2 skipped`; five remaining
  failures are pre-existing cross-repo drift because sibling `swipe-ugc`
  advanced to `83357fb` while generator still pins the prior accepted worker
  commit/frozen derivation and setting-factory identities. Do not “fix” those
  golden values inside this change; they require a separate coordinated
  worker-pin acceptance;
- swipe-agents focused `/review`/env/outbox profile: `61 passed`;
- swipe-agents full suite: `430 passed`, one 30-second backup race timeout
  under parallel load; the same race test passed alone in 6.9 seconds.

PR CI at the latest committed SHAs:

- swipe-agents `fd899e5`: green;
- backend `b67a60c`, generator `163400e` and feed `3b82b0f`: fresh
  clean-checkout runs are in progress after the final audio-free dictation /
  duplicate-reservation hardening commits. Reviewer must require literal
  `conclusion=success`; the preceding backend migration matrix and all local
  profiles were green, but they are not a substitute for these current runs.

## Reviewer attack questions

1. Can a phone decision be re-signed for another action, target, preview,
   setting candidate, order head or user?
2. Can two generator uploads leave two current bundles for one order?
3. Can a decision be marked consumed before the existing typed handler
   commits, or be applied twice after a lost response/restart?
4. Does `leave_paused` incorrectly imply an external mutation?
5. Does series `good` admit incomplete preview evidence without the explicit
   risk override?
6. Can author identity leak through runtime/review/presentation fields?
7. Can TMA publication bypass the existing exact binding lookup and Telegram
   confirmation?
8. Can a malicious env value turn the production chat link into phishing or
   credential exfiltration?
9. Does background publication produce an unhandled rejection, wedge a
   replacement binding, or silently forget a late error?
10. Do summary projections omit data the list UI assumes, or make mutation
    handlers consume presentation cache as authority?
11. Can the five-second mobile sync loop create a new event-loop load cliff
    once authorized?
12. Do the SLOs measure real bytes/server time, and are slow actions visibly
    acknowledged before network completion?
13. Can a close command hide a still-current action, close a decision that
    won its row-lock race, or acquire publication authority?
14. Does a stale phone decision get a durable `superseded` outcome without
    invoking any typed handler?
15. Can a production notification be emitted before its exact TMA bundle
    exists, or remain visible after the bundle is terminal?
16. Can oversized/chunked HTML exhaust memory before the 4 MiB guard, or can
    digest/path/symlink drift make TMA execute bytes different from evidence?
17. Can sandbox HTML exfiltrate init data, bearer headers, cookies, local
    storage or navigate the top-level Telegram WebView?
18. Can a missing historical prototype prevent newer levels/series from
    entering the phone queue?
19. Can a model preflight/quota transition change an already-issued bundle,
    reveal provider identity before taste verdict, or accept caller-authored
    model/effort?
20. Can `/review` from another known chat, another user, a stale update or a
    replay create a production delivery?
21. Can auto-follow after a standalone verdict skip a still-current item,
    discard an unsent draft or terminalize an item outside the bounded
    presentation window?

Return `GO` only if all P1/P2 findings are closed with executable regressions.
Do not merge, deploy, modify the original 4317 data root, or overwrite any
author worktree during review.

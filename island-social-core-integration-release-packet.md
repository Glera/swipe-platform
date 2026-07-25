# Island Social Core — unified integration release packet

Date: 2026-07-25  
Status: **merged and deployed, rollout remains default-off**

This packet supersedes branch-by-branch review handoffs for P1, P4 and P3.
Codex owns the combined integration heads below; no further P1↔P4↔P3
branch shuttling is required.

## Exact heads

| Repository | Branch | Exact head | Contents |
|---|---|---:|---|
| `swipe-backend` | `codex/island-social-core-integration` | `ff81176b076158e97a7d7d6f5804dc9d86b11da7` | P1 + P4 + P3 + all integration-review fixes; rebased by merge onto `origin/master@697ba3e` |
| `feed-prototype` | `codex/island-social-core-integration` | `9451b7536f2ba4ea29be3662ec4d56a5493b0e3d` | P1 + P4 + P3 + all integration-review fixes; contains `origin/master@5f062d8` |

Both branches are pushed to `origin`. `git merge-tree --write-tree
origin/master HEAD` completed without conflicts in both repositories at these
master snapshots.

## What the integration round closed

- P4 attempt receipts now persist truthful wall time on every completed physical
  model call, including terminal failures.
- Async theme submission has a client-minted durable `request_id` persisted
  before the first POST. Exact replay survives a lost response, terminal
  completion and a later force-sync flip without a second quota charge.
- Distinct deliberate requests with identical prompts no longer alias through
  digest dedup. Legacy clients without `request_id` retain live-job digest dedup.
- Theme polling has abortable request timeouts and a real absolute six-minute
  wall-clock deadline, including WebView suspension/resume.
- Ready theme handles survive reload until Build; stale initial/revision
  completions cannot overwrite a newer generation or resurrect a built slot.
- Every physical model receipt records the actual execution effort (`default`),
  not an inert config value.
- Migration 0054 safely backfills pre-existing moderation receipts while
  preserving the append-only trigger before and after the backfill.
- Legacy state buildings without persisted `buildingId` remain visible to
  moderation and friend-card counts through deterministic ID synthesis.
- Moderator actions create the allowlisted actor user before writing FK-bound
  receipts.
- Result, legacy complete and like/unlike serialize with takedown on the same
  building-social row and re-check moderation after acquiring the lock.
- Theme cancel no longer overwrites a concurrent ready result through a stale
  SQLAlchemy identity-map row.
- Parameter-resolution failures terminalize the durable theme job without model
  spend or reclaim loops.
- Moderation reload/pagination responses are generation-fenced, request-timeout
  bounded and retryable with the exact cursor.
- Pagination and mutations use cross-render keyed in-flight fences; DOM repaint
  cannot duplicate a page, takedown/restore or report resolution.

## Verification

Backend, exact integration code:

- `python -m pytest -q` → **844 passed, 353 skipped, 10 subtests passed**
- Island PostgreSQL suites (P1 + bots + P4 + P3) → **89 passed**
- Migration downgrade/upgrade + append-only round-trip → **3 passed**
- Fresh disposable PostgreSQL database migrated from base through
  `0050_a11_cohort_watch_read → 0051_island_social_core →
  0052_friendship_user_hi_idx → 0053_island_theme_jobs →
  0054_island_mod_action_seq`

Client, exact integration code:

- `npm run lint` → **PASS**, including all browser/dogfood checks and the new
  moderation retry/freshness/exclusivity check
- production `tsc && vite build` → **PASS**

## Independent review disposition

Three blind review/fix rounds covered the combined patches, not isolated author
branches. All **28** actionable findings were fixed (12 backend, 16 client);
the final focused verification returned **No findings** for both repositories.

- [Backend machine-readable dispositions](island-social-core-integration-backend-dispositions.json)
- [Client machine-readable dispositions](island-social-core-integration-client-dispositions.json)

Both disposition files pass `scripts/auto-review-validate.mjs`. Collector
manifests reported no excluded secrets, allowed large binaries or base fallback.
All isolated review checkouts were removed after verification.

## Pre-deployment scope checkpoint (satisfied)

- Before operator GO, `master` was unchanged and nothing was deployed.
- Island feature flags were held default-off through the release.
- No quiet-week, agent-system or `cohort_*` runtime configuration was changed.
- P2 visit card and P5 CDN/device-spike remain outside this merge.

The approved order was:

1. merge/deploy backend integration head;
2. verify migrations and default-off health;
3. merge/deploy client integration head;
4. keep flags off until a separately approved staged enablement.

## Deployment closure — 2026-07-25

Operator GO was received and the ordered release completed:

| Surface | Merge / deploy identity | Production evidence |
|---|---|---|
| workspace evidence | `p4g-workspace-meta@2e681820562d7ebe214560c936d8ca713530e3d4` (PR #6) | meta verify PASS |
| backend | `swipe-backend@c21d40f7abd8e8aa86e08583f736c05ca3cbd4d0` (PR #10) | `/api/health` reports `build: c21d40f`; startup migration completed; master PostgreSQL acceptance PASS |
| client source | `feed-prototype@d5600765ce47a61916ae6539c9df274d64ca0cd5` (PR #2) | master lint + build PASS |
| static deploy | content `swipe-platform@941aa21`, stamp `fe33b7d3233eabb193542e84998e7f855a21a3c8` | served `index.html` is byte-identical to the deploy repo, SHA-256 `163305ce863e115d77d4b7e2f94cbc38fdb07911b0ec64e732e44f2c24471340` |

Default-off verification:

- backend `/api/island/friends` returns 404, proving the P1/P3 router is not
  mounted;
- production browser at `/` has one feed tab, zero Meta tabs and zero island
  roots;
- the same browser assertion passes at `/?island=123`, proving direct island
  entry is gated too;
- the existing `exact-user` catalog release profile for user `42692410` and all
  four catalog gates were preserved byte-for-byte in `release.json`;
- no Island flag was set during the production build.

No Island cohort was exposed. Enabling the Island flag remains a separate
operator decision.

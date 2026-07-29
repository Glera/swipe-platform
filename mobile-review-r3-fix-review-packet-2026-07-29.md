# R3 fix-review packet: mobile-first Lab review queue

Date: 2026-07-29.

Purpose: a narrow re-review of the findings in
`mobile-review-independent-review-r2-2026-07-29.md`. This packet does not
authorize merge or deploy. Author and reviewer must remain different people.

## Exact heads

All four repositories use branch `codex/mobile-review-performance`:

| Repository | Head | CI |
| --- | --- | --- |
| `swipe-backend` | `da19d9022a740e454a400a2a4075baa047118363` | [PostgreSQL acceptance 30454782900](https://github.com/Glera/swipe-backend/actions/runs/30454782900), success |
| `feed-prototype` | `27ce554f3748ade8937a9013b9331f0faf00835a` | [verify 30454783695](https://github.com/Glera/feed-prototype/actions/runs/30454783695), success |
| `swipe-generator` | `ac50c859fbfee058dd0c6a96aaa8c0f438474f70` | [verify 30455198855](https://github.com/Glera/swipe-generator/actions/runs/30455198855), success |
| `swipe-agents` | `2af1d1b8f0cd8590c91f001a17f977295f6bf45a` | [swipe-agents CI 30454784182](https://github.com/Glera/swipe-agents/actions/runs/30454784182), success |

No head above has been merged or deployed.

## Product decision frozen by this round

`TMA Approve` is the final human publication act for the exact
content-bound promotion binding. Before that act, the phone surface exposes
an explicit Cancel/Deny action. After exact approval, a server-owned scheduler
may finish catalog delivery without an open browser and without a second
desktop publish click. Cancellation is not promised after approval because
delivery may already be running or complete.

The decision is written consistently in:

- `swipe-backend/docs/specs/mobile-series-order-review.md`;
- `swipe-backend/docs/specs/series-order-flow.md`;
- `swipe-backend/docs/specs/IMPLEMENTATION-STATUS.md`.

## R2 disposition

### 1. R2-B1: CSP injection through attacker-authored `<head>` text

Closed in `feed-prototype`.

- `hardenExactPrototypeHtml` accepts only a narrow canonical document shape:
  optional BOM/whitespace, canonical doctype, real `<html>`, then real
  `<head>`.
- Comments, scripts, or other content before the real head fail closed.
- CSP is inserted as the first real head child; no string replacement against
  the first attacker-controlled `<head>` occurrence remains.
- Browser regression uses `<!-- <head> --><script src=...>` and remote image
  payloads. The iframe is not created, no network escape occurs, and no
  decision can be submitted.

Suggested attack: vary comment/case/prefix/doctype and confirm every
noncanonical document fails before iframe creation.

### 2. R2-B2: publication semantics, cancellation, invisible failures

Closed across `feed-prototype`, `swipe-generator`, and the specs.

- The phone publication bundle exposes exact Cancel/Deny before approval.
- `publication_prepare` now waits for exact preview hosting and authorization
  initiation; a preparation failure remains a visible `failed` state and does
  not consume the mobile item.
- Retry uses the same exact flow and does not duplicate preparation.
- New `catalog-series-publish-scheduler.mjs` owns post-approval background
  delivery. It accepts only exact active flow states, exact draft/revision/
  binding identity, deduplicates in-flight work, and retries transient failure
  on a later tick.
- Tests prove delivery with no browser, exact identity, duplicate-tick
  suppression, ignored idle/failed/incomplete flows, and transient retry.
- `telegram_approve` is explicitly superseded as a review decision and cannot
  become review authority.

Suggested attacks:

1. Deny on the phone before approval and prove no catalog call occurs.
2. Approve, close every browser, and prove exactly one publication.
3. Fail preparation, retry, and prove the mobile item was not consumed.
4. Run overlapping scheduler ticks and verify one exact publish effect.

### 3. R2-B3: untyped DBAPI failure and NUL input

Closed in `swipe-backend`.

- Recursive JSON-domain validation rejects NUL keys/values and non-finite or
  non-JSON values before persistence.
- Service functions catch `DBAPIError` after `IntegrityError` and return typed
  `MobileReviewStorageInvalid` (`422`) instead of leaking `500`.
- HTTP regression sends a NUL-bearing document and asserts typed `422` plus no
  stored row.
- An injected flush-time DBAPI failure has its own typed regression.
- JSONB-size validation conservatively covers PostgreSQL textual exponent
  expansion (`1e100` and `1e-100` regressions).

Suggested attack: re-sign NUL in a key, nested value, and large/small exponent
documents; none may create a row or produce `500`.

### 4. R2-B4: inert race/replay/append-only coverage

Closed in `swipe-backend`.

- PostgreSQL race test creates two different genesis bundles for one order,
  so it exercises the order lock rather than primary-key serialization.
- Actor is part of decision replay identity.
- Dead post-`IntegrityError` replay branches for decision, closure, and
  consumption were removed; row-locked exact replay is the ordinary pre-read
  path and an integrity failure is a conflict.
- PostgreSQL tests assert both `UPDATE` and `DELETE` rejection on all six
  append-only tables.
- Migration `0071_mobile_review_hardening` adds the exact composite
  decision/bundle identity and consumption FK.

Suggested attacks: disable `_lock_order`, run distinct genesis bundles, mutate
each append-only table, and forge a consumption row pairing a real decision
with a foreign bundle.

### 5. R2-B5: agents transport-budget poisoning and lost transient alerts

Closed in `swipe-agents`.

- Synthetic `delivery_config_missing` events do not consume the real transport
  send budget.
- Only the typed missing-production-review-URL condition is terminalized.
- Transient renderer/SQLite failures are rethrown, leave the delivery queued,
  and do not increment attempts.
- Full suite: 441 passed.

Suggested attacks: four config-missing deliveries followed by one real send;
then inject a transient renderer/SQLite failure and verify later retry.

### 6. NEW-4: shallow technical-details allowlist and spec drift

Closed in `swipe-backend`.

- Allowed keys are exactly `actionKind`, `actionIdentity`, `eventId`,
  `orderId`, `packetDigest`, `source`, `sourceKind`, `sourceId`, and
  `sourceDigest`.
- Values are scalar only; nested provider/model smuggling is rejected.
- Contract and spec carry the same literal list.

Suggested attack: place provider/model below every allowed key and verify
rejection.

### 7. G-N3: event-loop blocking

Closed in `swipe-generator`.

- `series-order-store.mjs` contains no `Atomics.wait`.
- A canonical source assertion prevents reintroduction.
- No synchronous lock wait was added elsewhere in this fix round.

### 8. Explicit closure of deferred R2 items

- Action badge: summary mode now uses the greater of order-packet and mobile
  notification counts; test proves a nonzero mobile backlog cannot render 0.
- “Sync now”: the dedicated sync control is handled before the auth container;
  auth selection is button-specific, so the outer container cannot swallow
  the click. Source-order regression added.
- `telegram_approve`: superseded; never admitted as review authority.
- Agents: forwarded messages and foreign bot suffixes are rejected; suffix
  classification fails closed without the bot username; `/review` fails
  closed without the dedicated review chat ID.
- Backend: composite consumption-to-decision/bundle FK; actor-bound replay;
  `publication_prepare` present in both migration and ORM enum; ORM/migration
  drift tests added.
- One storage presentation taxonomy remains intentionally shared, but detailed
  cause is server-owned and chained; callers cannot author it.

## Verification evidence

- Backend targeted contract/migration suite: `23 passed, 6 skipped`; skips are
  the opt-in PostgreSQL tests subsequently exercised by the exact-SHA
  PostgreSQL acceptance CI. Offline base-to-head and `0071 -> 0070` downgrade
  SQL both render successfully.
- Feed/TMA: full `npm run lint` (TypeScript, contract checks, browser checks)
  and build are green locally and in exact-SHA CI.
- Generator: full pinned local `npm run verify` is `644 tests / 642 pass /
  2 intentional skip / 0 fail`. The pinned `swipe-ugc` release is required by
  the release contract; the ordinary dirty-sibling run was not represented as
  acceptance evidence.
- Agents: `npm run typecheck` and full `npm test`, `441 passed`.
- Root `node scripts/docs-boundary-lint.mjs`: clean.

## Requested R3 review

Review only the four exact heads above against the eight R2 disposition
classes. Re-run or extend the suggested attacks. A GO requires the generator
exact-SHA CI to be terminal `success` as well as the other three jobs. Do not
merge or deploy from this packet; return a signed GO/NO-GO first.

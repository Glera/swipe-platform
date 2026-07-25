# Safe recall broker — backend evidence

Date: 2026-07-17

- Repository: `swipe-backend`
- Branch: `codex/safe-recall-broker`
- Base: `70c2b0f`
- Commit: `d6a512f` (`Add dedicated catalog recall broker`)
- P1 fix: `3b2f5b9` (`Bind recall receipts to exact database effects`)
- Canonical-wire fix: `fa429d4` (`Reject noncanonical recall receipt wire values`)
- PG assertion follow-up: `c6ed3f3` (`Assert early recall receipt type rejection`)
- Timestamp assertion follow-up: `a0086bb` (`Expect canonical timestamp projection rejection`)
- Worktree: `swipe-backend-safe-recall-broker`
- Merge/deploy: not performed

## Implemented backend vertical

- New singleton Lab authority `catalog:recall`; it is independently gated by
  `ENABLE_CATALOG_RECALL` and rechecks `DEV_USER_IDS` on approval and every JWT
  use. `catalog:publish` can no longer call the recall endpoint.
- Migration `0039_catalog_recall_broker` extends device/grant constraints and
  adds append-only `catalog_recall_command_receipts` with exact actor, entry,
  mutation, recall-action, request and receipt closure.
- Request wire is `catalog.recall-command.request.v1`; body includes canonical
  `mutationId` and `entryId`, and the body entry must equal the URL entry.
- Exact replay returns the same stored receipt bytes with HTTP 200. Fresh
  commit returns HTTP 201. Reusing a mutation for different bytes is 409.
- Recall action, ticket effects, intervention and broker receipt commit in one
  PostgreSQL transaction. A transaction-scoped advisory lock makes concurrent
  identical commands converge on one receipt.
- Stored requests and receipts replay their JCS digests before reuse; DB
  triggers enforce JSON/materialized parity, exact `catalog-lab:<actor>` recall
  authority, and append-only storage. Downgrade is guarded by receipts or
  recall-scope authorization evidence.
- One backend-owned cross-repo fixture:
  `docs/specs/fixtures/catalog-recall-broker-v1.golden.json`.

## Executed checks

- Focused pure: `53 passed`.
- Full pure: `652 passed, 141 skipped, 10 subtests passed`.
- Alembic single head: `0039_catalog_recall_broker`.
- Offline `base -> head` and `0039 -> 0038` SQL generation: green.
- `git diff --check`: green.
- PostgreSQL tests and isolated roundtrip are wired into
  `.github/workflows/postgres-acceptance.yml`; no local PostgreSQL listener was
  available on ports 55440/5432, so physical 0039 execution remains a required
  review/CI gate before merge.

## Remaining generator/UI half

1. Consume the backend golden directly; do not copy it into generator.
2. Add a dedicated `catalog:recall` device-flow/token provider. A publish token
   must fail before network use and at backend auth.
3. Replace the old `catalog.recall-action.request.v1` call with the exact
   broker request, preserving one durable `mutationId` across retries and
   binding body `entryId` to the flag subject.
4. Verify the exact response/receipt/JCS digest and actor/entry/request closure;
   retry lost responses with the same bytes and accept only exact replay.
5. After a committed receipt, post the existing flag resolution using the
   receipt's `recall.recallId`; persist/reconcile the crash cut between recall
   commit and flag resolution.
6. Update Lab copy from “publish authority” to the separate recall authority,
   then add the catalog-browser recall UI. No publish/canary surface is added.

## Review focus

- Physical PostgreSQL upgrade/downgrade and trigger diagnostics.
- Two-session identical/different-mutation races.
- Publish JWT rejected by the recall route; recall JWT rejected by publish and
  all other singleton scopes.
- Re-signed receipt mutations (actor, entry, request, recall id, digest) fail.
- Generator crash after backend commit but before flag resolution converges
  without a second recall action.

## P1 fix round after independent NO-GO

Independent review correctly found that the original 0039 trigger proved the
recall action identity but did not bind every re-signed command/result claim to
database facts. Commit `3b2f5b9` closes that gap:

- DB guard now requires exact key sets and binds command
  `expectedRecallEpoch/mode/reason/evidenceRef/replacementEntryId` to
  `recall_actions` plus the catalog entry.
- Receipt `createdAt/stateVersion/replacementEntryId/revokedTickets/
  invalidatedAttempts` is bound to the exact recall action, terminal catalog
  entry, tickets carrying that `recall_action_id`, and exact recall-sourced
  invalidation facts on those tickets.
- Replay-side pure validation now checks exact nested shapes and all
  materialized actor/entry/mutation/receipt/action identities before digest
  replay.
- PostgreSQL matrix adds ten self-consistent re-signed forged INSERTs (all
  hashes recomputed), one real hard recall with one revoked ticket and one
  invalidated attempt, plus a forced receipt-guard failure proving the catalog
  state, recall action and receipt roll back atomically.
- Fix-round focused pure: `23 passed`; full pure: `652 passed, 153 skipped,
  10 subtests passed`; offline upgrade/downgrade SQL and diff check green.
- A fresh local PostgreSQL bootstrap was attempted and failed at `initdb` with
  the known macOS SysV error: `shmget ... Cannot allocate memory`. Therefore the
  new physical matrix still requires the already-wired CI/reviewer PG run.

## Canonical-wire fix after second independent NO-GO

The second review found a real PostgreSQL JSON type-confusion gap: `->>` plus
casts accepted re-signed string numerics such as `"7"`, and timestamp casts
accepted alternate byte spellings of the same instant. Commit `fa429d4`
closes the wire-level ambiguity without changing the HTTP contract:

- The insert trigger now applies `jsonb_typeof` to every exact command,
  receipt and nested result field. Numeric authority claims must be JSON
  numbers with canonical non-negative integer spelling; nullable identifiers
  must be JSON string or null.
- `committedAt` and nested `createdAt` must equal the database-owned timestamp
  rendered exactly as millisecond UTC `YYYY-MM-DDTHH:MM:SS.mmmZ`; equivalent
  offset/space spellings are rejected byte-for-byte.
- Replay validation mirrors exact keys, JSON/Python types, canonical UUIDs,
  integer domains, text domains, hash shapes, timestamp bytes and the command
  to result epoch/mode/replacement closure before JCS digest replay.
- Re-signed regression vectors cover string `stateVersion`, `revokedTickets`
  and `invalidatedAttempts`, plus alternate nested/top-level timestamp bytes.
- A receipt-trigger integrity rejection is surfaced as local fail-honest 503
  (`catalog_recall_receipt_integrity`) rather than a misleading 409 conflict;
  no public request/response schema changed.
- The hard-recall rollback test now proves restoration of catalog state and
  version, ticket `revoked_at`/`recall_action_id`, and absence of recall facts,
  action, intervention and receipt after the forced trigger rejection.

Checks for this round: focused pure `28 passed`; full pure `657 passed, 158
skipped, 10 subtests passed`; compilation, offline `base -> head`, offline
`0039 -> 0038`, and `git diff --check` all green. The 20 PostgreSQL tests are
collected and skipped locally because the same SysV failure still prevents a
physical cluster; physical execution remains the explicit CI/reviewer gate.
The follow-up `c6ed3f3` makes the physical matrix distinguish intentional
early `projection` rejection for wrong JSON types/timestamp bytes from later
`authority` rejection for well-typed but false claims.
Physical CI run `29557538630` then exposed one remaining expectation typo:
the well-typed but false `recall.createdAt` is also rejected by the canonical
timestamp projection comparison before authority closure. Commit `a0086bb`
records that exact constraint; production code was unchanged. Focused `28
passed / 20 PG skipped`, full pure `657 / 158 / 10`, compilation and both
offline migration directions remained green. A fresh physical PG rerun is
still required.

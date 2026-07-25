# Operator flag rework handoff — backend evidence

## Scope

- Repository worktree: `swipe-backend-operator-flag-rework-handoff`
- Branch: `operator-flag-rework-handoff-backend`
- Base: `ce06477`
- Reviewed head: `d6beb1343584f4456fdecc9abfc1a35fac287d3b`
- Merge status: not merged; held for independent review
- Generator and feed client: not modified

## Commits

1. `60370cd` — Add atomic operator flag rework handoff
2. `aa66601` — Gate rework handoff migration roundtrip
3. `001b5f6` — Enforce atomic handoff resolution closure
4. `4bdbb76` — Shorten operator handoff revision identity
5. `f6deef7` — Allow lineage-free handoff evidence fixtures
6. `ad69399` — Reuse exact lineage across skin batch fixtures (test-only prerequisite cherry-picked from master)
7. `8271f46` — Bind handoff replay and identity conflicts exactly
8. `dbf467e` — Bind lineage evidence to server-owned availability
9. `d6beb13` — Exercise both handoff race outcomes (test-only correction: each race branch catches its own product conflict type)

## Implemented contract

- Migration revision `0038_operator_flag_rework` adds append-only handoff storage, authority/parity triggers, atomic resolution closure, composite foreign keys, and a guarded downgrade.
- The server validates the exact operator flag, actor grant, entry/series/ordinal/spec identity, pass evaluation evidence, runtime artifact, runtime contract, and available server-owned lineage before committing a handoff.
- If server lineage exists, recipe and generator digests must both match the same lineage row. If no server lineage exists, both values must be explicit `null`.
- A `rework_started` resolution can only exist together with the matching durable handoff. The old caller-authored resolution path remains fail-closed.
- POST is idempotent for identical bytes and produces a byte-identical replay receipt. Reuse of a mutation ID, request ID, or URL flag with different identity is a terminal conflict.
- Concurrent identical POSTs serialize on the flag: one creates the handoff, one returns the committed replay. Handoff versus dismiss also has one winner.
- Skin-bearing v1 candidates are rejected with `operator_flag_rework_parent_unavailable` until the frozen contract can prove their parent evidence.
- Read routes return exact committed receipts and are actor-scoped under the existing `operator:flags:write` authority.

## Verification

- Pure backend suite: `639 passed, 137 skipped, 10 subtests passed`.
- Focused contract/golden/PG collection without a local database: `15 passed, 9 skipped`.
- Alembic offline clean `base -> head` and downgrade SQL: passed; head is `0038_operator_flag_rework`.
- Clean worktree at reviewed head: confirmed.
- PostgreSQL workflow run `29554898653`: passed in full at head `d6beb13`.
  - Full PostgreSQL acceptance: passed, including all opt-in suites, device-flow acceptance, and head verification.
  - Isolated `0038_operator_flag_rework` downgrade/upgrade roundtrip: passed.
  - Every pre-existing migration matrix in the workflow: passed.

## Independent review targets

1. Recompute the command, handoff, and receipt hashes from the frozen golden and compare exact bytes.
2. Verify that no caller-controlled identity or evidence bypasses the server closure.
3. Exercise identical replay, URL flag mismatch, request/mutation reuse, concurrent POST, and handoff-vs-dismiss races.
4. Verify lineage-present and lineage-absent branches, including partial/mismatched lineage rejection.
5. Verify the deferred database invariant: a handoff cannot commit without its exact `rework_started` resolution.
6. Run the full physical PostgreSQL workflow, including the isolated migration 0038 roundtrip.

## MAC_B_ISSUE159_SERVER_TIER2_DISCOVERY — HANDOFF_READY

This wake is FIFO strictly after Issue #151 rows 4–5 wake `5434530750`; it does not supersede or preempt that work. Consume it only after the earlier wake is terminal.

### Frozen package

- ticket/spec: https://github.com/Glera/p4g-workspace-meta/issues/159 and `docs/specs/favorite-mechanic-infinite-stream-v0.md`
- PR: https://github.com/Glera/swipe-backend/pull/82
- exact base: `7361c317bd258de3d4a620aed484222d6f9da7d3`
- exact head: `0ef73b63135f0eecf271fe1c024ee15d0e3718cf`
- exact tree: `089a51efb0703b46797b96a54f1dcfbee3a54184`
- canonical GitHub PR patch: `130916` bytes, SHA-256 `52a8f552c0cfb4743f61a7a374c8da021dddf20edf1548be7e3dc43a747ebbc7`
- PR state at handoff: OPEN, draft, CLEAN, MERGEABLE

The package is the already-authorized Form-C Mac A server half: one-time server-owned Sort seed tickets/runway, exact generator/envelope pinning, trusted regenerate-and-compare verifier, result binding, refill/dedup/recall and default-off controls. It is rebased directly onto backend master `7361c317...` (live DB remains 0089); migration `0090_sort_seed_runway` is code-only and has not been applied live.

### Evidence

- focused after rebase: `70/70 PASS`
- full pure backend before the two CI-only base-alignment fixes: `1742 passed, 744 skipped, 10 subtests PASS`
- exact-head image CI: https://github.com/Glera/swipe-backend/actions/runs/33043026147 — SUCCESS
- exact-head PostgreSQL acceptance: https://github.com/Glera/swipe-backend/actions/runs/33043026119 — SUCCESS
- physical isolated roundtrips `0089_research_party_intake` and `0090_sort_seed_runway`: SUCCESS
- full PostgreSQL acceptance and all repository-native matrix jobs: SUCCESS

The only post-rebase CI corrections were test-fixture alignment with the new head: the 0089 roundtrip now asserts Alembic's actual current head after `upgrade head`, and the synthetic LKG removes 0090 rather than its predecessor while expecting 0090 in the candidate compatibility range. Product/runtime code and migration 0090 were unchanged by those corrections.

Earlier author-blind review receipts on the stacked pre-rebase package are durable in Issue #159 (`5428217981`, `5428852883`) but do not sign this rebased exact head. Treat this as the one required fresh physical Tier-2 discovery for the exact package above.

### Authorized Mac B action

Run exactly one blind `claude-opus-5` / `high` full discovery on the frozen exact PR package, with the Issue #159 contract/spec and authority docs as input but without the author transcript or self-assessment. Return one complete P1/P2/P3 batch, reviewer session/result identity and durable verdict in Issue #159, plus a causal callback wake to Mac A.

- P1/P2 = 0 → HANDOFF_READY for separate exact-head merge disposition.
- Any P1/P2, package/CI drift, ambiguous identity or scope expansion → typed STOP; no correction is authorized by this wake.

Do not author code, rerun CI, merge, apply migration 0090, deploy, change settings/credentials/permissions/infra, activate the feature, issue tickets, mutate product state, Approve, publish or promote. No retry or second discovery.

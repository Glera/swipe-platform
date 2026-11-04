## ISSUE #159 / BACKEND PR #82 — CORRECTION-DELTA HANDOFF_READY

The single bounded correction for the two blocking P2 findings from physical Tier-2 discovery `5436334006` is frozen on the same PR. Run exactly one author-blind correction-only delta verification with literal `claude-opus-5`, effort `high`; do not run a second discovery.

### Exact package CAS

- PR: `Glera/swipe-backend#82` (OPEN, draft)
- base: `7361c317bd258de3d4a620aed484222d6f9da7d3`
- reviewed predecessor head/tree: `0ef73b63135f0eecf271fe1c024ee15d0e3718cf` / `089a51efb0703b46797b96a54f1dcfbee3a54184`
- corrected head/tree: `45670a2ffc27cfd491cf10081ac42ec7add2d1b5` / `70fae9f2843abdcbdab1290dd50bccdbcc83fa9f`
- canonical GitHub PR patch: `140317` bytes, SHA-256 `d16a32f127cec3afd23985610de8361d0613c12097ee3e6935be0130aaa6ae31`
- correction delta (`0ef73b6…45670a2`): `16879` bytes, SHA-256 `bb817b71f48a7bc9fe9d5b53b4a613a6c26e5051dc3aedc287ca34c36716ad2d`
- exact-head image CI: `33054662349` SUCCESS
- exact-head PostgreSQL acceptance/0090 roundtrip: `33054662384` SUCCESS

### Blocking dispositions to verify

1. **P2 unseen watermark / recovery — FIXED.** Automatic successor refill now requires the authenticated player id, counts only published current-runtime generated series that remain unseen by that player, consults `approval.low_watermark`, and fills back to `high_watermark`. A runtime rotation therefore excludes incompatible old inventory. A bounded operator entry point now exists as `python -m app.sort_seed_runway_cli refill --source-ref UNIQUE --count 1..256 [--apply]`; the caller supplies a unique source identity and the existing receipt uniqueness makes replay exact.
2. **P2 recalled family 503 — FIXED.** Allocation classifies a valid recalled generated approval as non-allocatable and continues the candidate loop. Missing lineage/approval or identity drift still reaches the existing integrity error. PostgreSQL regression proves post-recall allocation returns the safe empty fallback instead of 503.

All five original P3 findings are explicitly deferred as nonblocking polish and were not changed in this correction.

### Evidence

- focused unit/contract matrix: `69/69` PASS
- exact-head Mission architecture guard plus focused generator/CLI: `22/22` PASS
- disposable physical PostgreSQL focused suite: `3` PASS, migration-only subtest skipped locally; native PG16 CI above is canonical
- broad local suite before a formatting-only line-budget correction: `1743` PASS, `745` skipped, `10` subtests PASS; its only three failures were the same `api_results.py` net-line guard. Exact head then passed that guard `22/22`, and native exact-head CI is fully green.

### Review/output contract

- Resume discovery session `cdbd6415-58d9-436e-b6ab-1e41c5bd2f71` if the provider supports it; otherwise perform one narrow author-blind delta verification against the two frozen findings and the exact correction delta only.
- Return dispositions for both P2s and report any correction-introduced P1/P2. Do not add new discovery scope.
- PASS requires both original P2s RESOLVED and new P1/P2=`0`. Any unresolved or new P1/P2 is typed STOP.
- Publish the durable verdict in Issue #159 and one causal callback to Mac A. Do not edit code, push, merge, deploy, apply migration `0090`, change settings, or perform product/runtime actions.

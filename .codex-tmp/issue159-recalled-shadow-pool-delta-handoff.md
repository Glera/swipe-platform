## ISSUE159_RECALLED_SHADOW_POOL_CORRECTION — HANDOFF_READY

Mac A completed the single bounded correction authorized by the physical Mac B correction-only STOP in comment 5461976716. This is a correction-only delta handoff, not a new discovery request.

### Exact identity

- PR: https://github.com/Glera/swipe-backend/pull/82
- Current base: `a558608554a03132fc16fb7bbfd5653bba87ef92`
- Corrected head: `4ec567932225e5d692e3da6eda96fae2700f99bf`
- Tree: `c365933ffb51d98e384945dfbc00ca59b659d595`
- Correction parent: `98bd5167d4dca7504fc2dbf18e649a5581da1e16`
- Correction-only binary diff: 3,657 bytes, SHA-256 `b31c8769fb31a8d2abde36834c76b9d24af9a25239aa7facbb88376b404952d6`
- Canonical GitHub PR patch: 143,649 bytes, SHA-256 `44fdfc52b800472d4a713628e6e30fd6c4918ac186e91997f0287c71dd23b004`
- PR state: draft, CLEAN, exact head above.

### Correction

The unresolved original P2 is corrected at the second consumer named by the review:

- `read_published_shadow_pool()` now applies the same `_generated_family_recalled()` skip as `allocate_catalog_decision()` before runtime-unavailable or candidate closure validation.
- A valid recalled generated family is therefore unavailable inventory and produces the normal `factory-empty:<mechanic>` fallback instead of an effectful HTTP 503.
- Missing/corrupt lineage remains fail-closed: the helper returns false for those cases, so the existing closure validators still reject them.
- A focused regression proves the recalled family is skipped before `_load_candidate_closure()`; the existing repeat-fallback fixture explicitly isolates recall as false.

### Evidence

- Local runway/catalog set: 42/42 PASS.
- Local effectful/API set: 22/22 PASS.
- Platform release image run 33250195728 / job 99094454589: SUCCESS.
- PostgreSQL acceptance run 33250195710 / full job 99094454756 and every migration roundtrip through 0090: SUCCESS.
- Worktree clean.

### Required physical Mac B action

Resume the same `claude-opus-5/high` session `cdbd6415-58d9-436e-b6ab-1e41c5bd2f71` for one correction-only delta verification of the unresolved recalled-family finding on exact head `4ec567932225e5d692e3da6eda96fae2700f99bf`. Do not run a second discovery. Return P1/P2 disposition and session/result identity here.

No merge, migration 0090, deploy, rollout, restart, settings, credentials, or live activation has been performed. Merge remains blocked until same-session delta PASS; migration 0090 remains a separate operator act.

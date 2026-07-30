# Reference Twin — isolation and fixture map

Reference Twin is an internal measurement instrument. It may reproduce exact
captured layouts because it is neutral-skinned, non-shipping and denied by
production tooling.

## Fixture map

| Fixture | Objective | Required trace features |
| --- | --- | --- |
| `zen-match-level-6` | `collect-target-types` | target closure with non-empty state |
| `zen-match-level-7` | `collect-target-types` | fail-on-7th and safe seventh triple |
| `zen-match-level-8` | `collect-target-types` | free Undo |
| `zen-match-level-9` | `clear-all` | Magnet tutorial |
| `zen-match-level-10` | `collect-target-types` | Play On `300`, target closure |

Exact geometry, equality classes, counters and trace IDs remain blank until
the immutable capture directory is mounted and its manifest digest verifies.
Approximate stand-ins are forbidden because they would make trace parity
unfalsifiable.

## Required provenance

Every fixture binds:

- capture UUID and manifest SHA-256;
- app build and level number;
- source screenshot/video/action IDs;
- normalized extraction tool/version;
- fixture digest and per-scenario trace digest;
- source frame/action IDs on every asserted trace step;
- exact expected final state for every scenario.

The Z2 implementation validates this complete envelope, re-derives state
caches and replays every expected before/after receipt. Required scenario
coverage is level-specific: primary terminal for all levels; fail/safe seventh
for Level 7; Undo for Level 8; Magnet for Level 9; Continue `300` for Level 10.
The verified pack is intentionally empty until the capture bytes are
transferred; the build validates every raw envelope, unique fixture IDs and
complete `6–10` coverage before any five-way comparison.

## Isolation gates

- Twin files live under a dedicated `reference-twin` namespace.
- Production registries and release entrypoints may not import that namespace.
- Production build denies the Twin namespace and scans every resolved target
  module for static/concatenated Twin marker fragments, capture identity or
  fixture ID.
- Twin fixtures never receive production SkinSpec/assets.
- Production candidates carry `referenceTwin: false` and first-party
  provenance.

## Readiness

| Gate | Current evidence |
| --- | --- |
| capture receipt | present |
| immutable bytes mounted in implementation worktree | pending transfer |
| manifest re-verification | pending transfer |
| read-only manifest/file/action-chain verifier | implemented and synthetically covered |
| exact extraction | pending |
| five deterministic trace replays | pending |
| production import/content deny test | implemented and covered in Z2 branch |
| deployment override containment | test-only override; AppLovin and swipe production paths force it off |

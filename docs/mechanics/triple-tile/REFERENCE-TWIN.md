# Reference Twin — isolation and fixture map

Reference Twin is an internal measurement instrument. It may reproduce exact
captured layouts because it is neutral-skinned, non-shipping and denied by
production tooling.

## Fixture map

| Fixture | Objective | Required trace features |
| --- | --- | --- |
| `zen-match-level-6` | `collect-target-types` | target closure with non-empty state |
| `zen-match-level-7` | `collect-target-types` | target closure with non-empty state |
| `zen-match-level-8` | `collect-target-types` | fail-on-7th, free Undo, Play On `300` |
| `zen-match-level-9` | `clear-all` | Magnet tutorial |
| `zen-match-level-10` | `collect-target-types` | safe seventh triple, target closure |

The immutable capture is mounted and verified. The fixture pack contains
`51 / 54 / 72 / 36 / 60` tiles and `7 / 8 / 7 / 4 / 5` observed type
classes for Levels 6–10. It binds the captured coordinates, counters and
action/state traces. Faces that remain fully occluded when a goal level
terminates are not directly observable; their deterministic multiplicity
completion is an explicit ambiguity disposition and does not enter an
observed action assertion.

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
coverage is level-specific: primary terminal for all levels; fail, Undo and
Continue `300` for Level 8; Magnet for Level 9; safe seventh for Level 10.
The verified five-fixture pack is materialized; the build validates every raw
envelope, unique fixture ID and complete `6–10` coverage before any five-way
comparison.

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
| capture receipt | real mounted capture: manifest, 254 files and 704-action chain verified |
| immutable bytes mounted for implementation | pass; external artifact root, never copied into shipping source |
| manifest re-verification | pass; SHA-256 `70960297…2febfa` |
| evidence index | pass; digest `c80c4f96…75e034` |
| geometry/type/counter extraction | pass for observed state; fully occluded residual faces explicitly inferred |
| deterministic trace replays | pass for five primary and all captured special scenarios |
| production import/content deny | pass in logic/browser and production build |
| deployment override containment | production build validates the real pack; test override remains forbidden in production |

# Z2 Reference Packet — Zen Match Levels 6–10

- Authority refreeze: **30.07.2026**
- Status: **capture complete / Reference Twin active**
- Primary reference: **Zen Match Android build `220000.1.755`**
- Target range: **Levels 6–10**
- Capture session: `2bb6ac89-3da1-4641-b753-52c9f982f0d3`
- Manifest SHA-256:
  `70960297ef9308d3fbe537d708f63b442a92c0f4a4de357918a3ee10172febfa`
- Brief: [`CLASS-BRIEF.md`](CLASS-BRIEF.md)
- Capture report:
  [`CAPTURE-MANIFEST-ZEN-2026-07-30.md`](CAPTURE-MANIFEST-ZEN-2026-07-30.md)

> Этот packet supersede-ит прежний research packet, в котором Zen Match
> Level 17 задавал feel, а public Levels 6–10 были только structural anchors.
> Immutable device capture Levels 6–10 теперь одновременно задаёт rules,
> level structure и presentation taste.

## Evidence inventory

| Evidence | Quantity / identity | Authority |
| --- | --- | --- |
| Screenshots | `235` | captured device frames |
| Video fragments | `17` | presentation/cadence evidence; declared Android screenrecord gaps |
| JSONL actions | `704` | action/state chronology |
| Capture manifest | session UUID above | file inventory and hashes |
| Manifest digest | SHA-256 above | immutable session identity |
| App build | `220000.1.755` | captured target build |

Capture report states that the hash chain and every file manifest were
verified at acquisition time. The current implementation worktree must
re-verify the manifest bytes before signing exact fixtures; transferring those
bytes is not a new acquisition and does not justify replaying Levels 6–10.

## Authority model

- `R-capture`: directly visible in session frames/actions;
- `R-report`: acquisition result recorded by the evidence agent, but source
  bytes must be mounted for independent re-verification;
- `O-production`: approved shipping decision;
- `G-probe`: a specific missing timing/transition measurement.

No `G-probe` permits a guessed value to masquerade as reference measurement.

## Captured behavioral findings

### Objectives

- Levels `6`, `7`, `8` and `10` use target counters
  (`collect-target-types`).
- Their round completes when target counters close even if board and/or tray
  still contains tiles.
- Level `9` uses `clear-all`.
- Objective completion is evaluated after the accepted placement and triple
  resolution.

This contradicts the old `clear-all only`, `no goals` baseline. The old
statement is retired, not retained as an alternative interpretation.

### Seven-slot boundary

- A non-resolving seventh placement fails immediately.
- A seventh placement that completes a triple and leaves post-resolve
  occupancy below seven is safe.
- Fail policy is therefore post-resolve `occupancy >= 7`, not attempted
  eighth.

### Captured tools and recovery

- One free Undo was used and captured.
- Magnet tutorial/action was captured on Level `9`.
- Play On/Continue for `300` game coins was used and captured.
- No real money was spent.
- No advertisement was opened.

These are required Reference Twin traces but are explicitly excluded from the
Production Original baseline.

## Objective model

```text
clear-all:
  resolved state wins iff remaining = 0 and tray occupancy = 0

collect-target-types:
  target progress is credited only by resolved triples
  resolved state wins iff every target counter is closed
  remaining board/tray are irrelevant after that terminal transition

otherwise:
  resolved tray occupancy >= 7 fails
```

The exact target type/count values per level are capture data. They must not
be inferred from public walkthroughs or from the existing reverse-generated
production levels.

## Reference Twin fixture contract

Each `zen-match-level-{6..10}` fixture must contain:

- `schema: p4g.triple-tile.reference-twin`;
- fixture version;
- `referenceTwin: true`;
- capture UUID, manifest digest, build and level number;
- normalized board geometry and layer ordering;
- neutral type IDs preserving captured equality classes;
- versioned objective and counters;
- level-specific scenarios with captured initial state;
- ordered action trace with before/after state digests in every scenario;
- exact expected final state and required terminal/residual assertion;
- required Twin-only scenarios/actions;
- source frame/action IDs on every trace step and for every asserted datum.
- real-capture verification of every trace action → next-frame pair and
  accepted ordinary tap coordinate, with explicit disposition for declared
  semantic remaps.

Fixture validation fails closed if provenance is absent or the manifest digest
does not match the frozen digest above.

## Production decisions

Production Original preserves:

- exposure graph semantics;
- canonical tray multiset;
- triple auto-resolution;
- both objective kinds;
- fail-on-7th/safe seventh triple;
- captured presentation causal order;
- audio off and approved haptic semantics.

Production Original excludes:

- exact geometry/type allocation;
- Zen Match symbols, palette, UI, background and trade dress;
- Undo, Magnet, Continue, coins, crowns, boosters and meta;
- any import from Reference Twin files.

The five reverse-generated Garden Curios levels are now reclassified and
re-gated as Production Original. They retain independent geometry/assets,
match captured density `51/54/72/36/60`, and match objective volume
`15/18/27/clear-all 36/12`. Their capture / observable-online /
deterministic-solver action counts are:

| Level | Capture trace | Observable online | Solver |
| --- | ---: | ---: | ---: |
| 6 | 49 | 51 | 49 |
| 7 | 48 | 47 | 45 |
| 8 | 68 | 62 | 69 |
| 9 | 35 | 36 | 36 |
| 10 | 54 | 54 | 59 |

Each recipe carries its reference count and maximum permitted delta.
Generation fails closed if either the visible-information witness or solver
witness leaves that band. This is parity evidence for solution effort; it does
not authorize copied geometry, symbols or trade dress.

## Presentation observations and measurement status

| Row | Required behavior | Status |
| --- | --- | --- |
| Board assembly | animated, deterministic layer reveal/settle | `R-capture`; exact timings require frame extraction |
| Accepted response | board tile begins visible tray flight immediately | `R-capture` |
| Concurrent taps | exposed tap may be accepted during prior flight | `R-capture` |
| Tray insertion | group by type, stable compression of others | `R-capture` |
| Triple barrier | recognition begins after third landing | `R-capture` |
| Triple removal | sequential with particles | `R-capture` |
| Unavailable tap | visible response, no logical transition | `R-capture`; exact onset/duration may need probe |
| Goal completion | terminal after counter closure, not board clear | `R-capture` |
| Win/fail cadence | drains required presentation before terminal UI/host event | `R-capture`; exact intervals require frame extraction |
| Audio | off | `O-production` |
| Haptics | light accepted / soft triple / rigid unavailable+fail | `O-production` |

Legacy prototype defaults (`280–380 ms` flight, `180 ms` rearrange, `70 ms`
recognition, `68 ms` stagger, `190 ms` removal, `300/12/760 ms` assembly)
remain provisional until mapped to capture frames. They are implementation
starting points, not `R-capture`.

## Targeted probe policy

The full Levels 6–10 run is not repeated. A probe is authorized only when:

1. a parity row cannot be measured from existing video/action evidence;
2. the missing value can change runtime behavior or a taste decision;
3. [`PROBE-MATRIX.md`](PROBE-MATRIX.md) names the exact setup, stimulus,
   expected frames and stop condition.

Known Android screenrecord segment gaps are declared evidence limitations.
Timing claims crossing a gap are invalid and must use a short uninterrupted
probe.

## Secondary historical research

| Source | Retained use | Explicitly not authoritative |
| --- | --- | --- |
| Zen Match Level 17 native recording | comparison with earlier presentation implementation | Levels 6–10 rules, objectives or exact timings |
| Triple Tile Levels 20/25/30 | taxonomy and genre comparison | target band, primary taste, production structure |
| Tile Busters / Tile Club / Tile Family | market/taxonomy context | parity or implementation decisions |

## Reference parity evidence

The executable checklist lives in
[`PARITY-CHECKLIST.md`](PARITY-CHECKLIST.md). Deviations and their
dispositions live in [`REFERENCE-DELTA.md`](REFERENCE-DELTA.md). Fixture
mapping and isolation requirements live in
[`REFERENCE-TWIN.md`](REFERENCE-TWIN.md).

No final parity claim is valid without:

- exact manifest re-verification;
- five trace replays;
- production deny/near-duplicate gates;
- side-by-side visual evidence;
- [independent review](REVIEW-Z2-INDEPENDENT-2026-07-30.md) with `PASS`;
- operator disposition of remaining deltas.

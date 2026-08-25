# Queens constraint-placement — executable abstract spec

This spec describes the rule class, not ZooDoku identity, economy or content.

## Board

For integer `N ≥ 4`, the board contains `N²` cells and a total region mapping
`region(row, col) ∈ [0, N)`. Every region is non-empty; production generation
should additionally require connected regions and exactly one solution.

A solution is a set `Q` of exactly `N` cells satisfying:

1. every row contains exactly one member of `Q`;
2. every column contains exactly one member of `Q`;
3. every region contains exactly one member of `Q`;
4. for every distinct `a,b ∈ Q`, `max(|a.row-b.row|, |a.col-b.col|) ≥ 2`.

Rule 4 is a one-cell king-adjacency ban, **not** a full diagonal-queen ban.

## Logical state

```text
ready {
  boardId, N, regionMap, solutionCommitment,
  pieces: Set<Cell>, marks: Set<Cell>,
  givenPieces: Set<Cell>, optional hintsRemaining
}
  -> ready      on mark/place/remove/hint
  -> completed  when pieces == committed solution
  -> restarted  on restart, then ready
```

`solutionCommitment` is test authority and need not be exposed to the client
as a correctness oracle. `givenPieces` cannot be removed.

## Input semantics

| Intent | Preconditions | Transition | Required feedback |
| --- | --- | --- | --- |
| Toggle mark | empty, non-given cell | add/remove X | immediate, reversible |
| Place | non-given cell | add piece; remove local X | visible placement |
| Remove | placed, non-given cell | remove piece | visible removal |
| Paint marks | path over cells | add X to eligible empty cells | continuous path acknowledgement |
| Hint | hint available | identify one logically supported move | explanation before/with application |
| Restart | any non-complete state | restore initial givens, clear user state | no hidden residue |

The captured reference maps mark to tap, place to double-tap and path marks to
swipe. That mapping is observed, not frozen: a feed playable must resolve the
swipe/takeover conflict in a separate input taste gate.

## Validation modes

- `constraint-only`: a placed piece may be legal yet not part of the unique
  solution; feedback reports only visible rule conflicts.
- `oracle-assisted`: a wrong solution cell may be rejected or counted as an
  error. This is the captured mobile surface.

The provisional first-party profile chooses `constraint-only` and no hearts.
Changing this is a product decision, not an implementation convenience.

## Win/fail/restart

- Win occurs immediately after the exact solution set is present.
- The abstract class has no mandatory fail state.
- Restart is always deterministic and idempotent.
- Captured three-heart exhaustion and rewarded revive are excluded from the
  core spec.

## Level controls

- `N` and region topology;
- count and location of givens;
- forced-move ratio / deduction depth;
- region-size entropy and singleton count;
- optional hint budget.

The captured early ladder uses `N ∈ {4,6,8}`, a sawtooth size curve, one given
for levels 1–10, then zero givens. Exact layouts are internal evidence only and
must never ship.

## Dataset acceptance

Every first-party board must have exactly one solution under all four rules.
The validator must reject disconnected/empty regions, duplicate solution
claims, a solution with the wrong cardinality, and any row/column/region or
adjacency violation. Dataset generation is outside this R1 pack.

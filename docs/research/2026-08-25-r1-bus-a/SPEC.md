# Bus A — abstract mechanic specification from R1

This specification describes a dependency-and-buffer puzzle. It does not
authorize use of the Bus Jam name, transport metaphor, layouts, assets,
economy or copy.

## Deterministic base state

```text
Cell = empty | blocked | passenger(color)

State = {
  mask,
  occupancy,
  receiverColors[],
  receiverIndex,
  receiverLoad in 0..3,
  staging[5],
  status: ready | failed | completed
}
```

The board mask defines an orthogonal graph and one or more egress cells at the
boarding edge. A passenger is `reachable` when its cell has a 4-connected
empty route to an egress after treating its own cell as empty. Empty cells do
not compact.

## Player move

`select(cell)` is legal only when `cell` contains a reachable passenger.

1. If its color equals the active receiver color and a seat is free, remove it
   from the board and increment `receiverLoad`.
2. Otherwise, if staging has a free tile, remove it from the board and place it
   in the leftmost free staging tile.
3. Otherwise apply the chosen overflow policy.

Native Twin policy: the move occupies the fifth tile and immediately enters
`failed`. Provisional Original policy is unresolved; the preferred candidate
rejects overflow and fails only on a proven deadlock. The two policies must be
separate fixtures, never silently conflated.

## Automatic resolution

After every passenger movement:

```text
while receiverLoad == 3:
  emit receiver_full exactly once
  receiverIndex += 1
  receiverLoad = 0
  auto-board staged passengers matching the new active color

if board empty and staging empty and all receivers consumed:
  emit win exactly once
```

Observed auto-board uses staged matching passengers and frees their tiles.
R1 did not resolve the case where more matching passengers are staged than the
new receiver has seats, so the future implementation must define and test a
stable left-to-right rule.

## Failure and restart

Native reference:

```text
fifth staging tile occupied -> failed immediately
Give Up -> consume one life -> failed terminal
Try Again -> exact initial level state
```

The first-party profile excludes lives, currency continuation and ads. Restart
must reconstruct the exact initial logical fingerprint without economy.

## Counted-tunnel extension

```text
Tunnel = {
  outletCell,
  hiddenSequence: color[],
  visibleRemainingCount
}
```

Clearing the outlet advances the hidden sequence and updates the count. Exact
count display semantics remain unresolved. Tunnels are excluded from the first
neutral slice and require a separate golden fixture if later authorized.

## Win invariant and generation constraints

- Receiver capacity is `3`.
- For each color, passenger count must equal `3 × receiverCount(color)`.
- Total passengers equal `3 × receiverColors.length`.
- Every accepted board needs at least one solver-proven solution under its
  fixed staging capacity and overflow policy.
- Generator difficulty should measure frontier branching, maximum staging
  occupancy, forced-move depth and solution count.
- Exact captured boards are never production datasets.

## Solver

Search state key:

```text
(occupancy, receiverIndex, receiverLoad, ordered staging, tunnel state)
```

Staging is ordered because deterministic auto-board and future over-capacity
behavior may depend on slot order. BFS/IDA* may enumerate reachable passengers;
automatic receiver changes are normalized before memoization.

Suggested difficulty bands for an Original dataset:

- onboarding: no staging required;
- early: staging used, maximum occupancy `1–2`;
- core: maximum occupancy `3–4`, at least one forced release;
- reject: native-overflow unavoidable, hidden-order guess, or unique solution
  with zero recovery slack unless explicitly taste-approved.

## Input and terminal

- Intent: one `select-passenger` tap plus `restart`; optional `undo`.
- A blocked passenger tap is a no-op and cannot mutate staging.
- Feed takeover swipe must never select a passenger.
- Final full receiver triggers one completion event; no submit button.
- No gameplay timer is required.

## Rights projection

The shippable abstraction is: dependency graph + colored tokens + ordered
three-capacity receivers + fixed five-slot holding buffer. A first-party
Original must replace transport, characters, palette, typography, copy,
economy, motion, audio and all layouts.

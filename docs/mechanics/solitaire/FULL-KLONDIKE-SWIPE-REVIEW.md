<!-- mechanics-process-version: 2 -->
# Full Klondike for Swipe — human review packet

- Date: `2026-08-03`
- Status: `implemented-awaiting-rollout-review`
- Product owner / taste authority: human operator
- Implementation authority: granted by human disposition `approve` on `2026-08-03`
- Rollout authority: separate and explicitly out of scope
- Legacy sources reviewed:
  - `solitaire-core` at `6e296be42c236525c221c37486472963a8fb6147`
  - `p4g-platform` at `23ffb5bae4fc5454613e3317e48eff3f64e2acc0`

This packet records the product and architecture boundary for moving the
existing full Klondike game into the current `playables`/swipe runtime. It is a
review document, not permission to edit runtime sources or publish a feed item.

## Human decisions already supplied

1. Preserve a **full Klondike game**. A short endgame, micro-level or
   challenge-shaped substitute would break the mechanic's essence.
2. Use a normal random deal. Guaranteed solvability is not a release blocker.
3. Seeded/deterministic content is not required. This class is not a
   deterministic challenge under the current product vision.
4. Clean the legacy interfaces and remove obsolete shell coupling.
5. Require human review before implementation and another human visual review
   before any feed/deploy mutation.
6. Swipe autoplay is required. It may use legal-move heuristics rather than a
   solver; when it reaches a dead end it starts a fresh random deal. Autoplay
   demonstrates the full mechanic but does not promise to finish a deal.

## Proposed product contract

### Ruleset

- Standard 52-card deck, 7 tableau columns, stock, waste and 4 foundations.
- Draw one card at a time.
- Unlimited stock recycle, matching the legacy implementation.
- Tableau builds down by alternating colour; only a King starts an empty
  tableau column.
- Foundations build Ace through King by suit.
- Random deals may be unwinnable. Hidden cards must never be silently
  rearranged after the deal.
- A win is exactly 52 correctly suited and ordered cards in foundations.
- There is no gameplay timeout.

`ensureSolvability()` is therefore not part of the new runtime. Its hidden-card
rearrangement changes a dealt game's identity and is unnecessary once
solvability is explicitly non-authoritative.

### Player interaction

- Tap a single card to perform the best unambiguous legal auto-move.
- Drag a face-up card or valid face-up suffix between tableau/foundation piles.
- Tap stock to draw/recycle.
- Keep `Undo`, `Hint`, `New deal`, move count and elapsed-time display.
- `Home` advances only cards that are currently safe to move to foundations;
  it stops as soon as no such legal move remains.
- `No moves` is advisory. It offers Undo or New deal and does not rewrite the
  board.
- A random dead end is not a challenge failure. Starting another deal does not
  emit `completed/lost`, and the board is never rewritten behind the player.

### Session behaviour in a swipe feed

- A deal is longer than a normal challenge and must survive navigation away
  from its feed card.
- Store a versioned local snapshot and restore it after iframe eviction/reload.
- Invalid or incompatible snapshots fail closed to a fresh random deal.
- Host pause freezes timers, animation scheduling, pointer transitions and
  audio without changing logical state.
- Initial release declares `hasAutoPlay: true`, `hasEditor: false`, and
  `hasRestart: true`. Autoplay dispatches only actions accepted by the same
  engine as manual play. It may choose moves through a one-step heuristic and,
  when no useful continuation exists, restart with a fresh random deal. This is
  explicitly an attract/demo policy, not a solvability claim.
- Win emits exactly one `completed/won` for the deal. Abandoning a random deal
  emits no terminal outcome under the current non-challenge product vision.

## Proposed implementation boundary

### Destination

Source lives in `playables/solitaire-v1/`. `swipe-platform/` remains generated
deployment output and must not be hand-edited.

The playable must use the shared bootstrap, lifecycle, analytics, viewport,
platform completion and swipe API. It must not import `@game/solitaire-core`,
`p4g-platform`, React, Zustand, Tailwind or legacy LiveOps packages.

### Rendering

Use Vanilla TypeScript plus DOM/CSS for the card field and Canvas only for
optional effects. Fifty-two positioned card elements are a small DOM workload;
DOM hit targets and CSS transforms preserve the legacy drag/tap feel with less
custom hit-testing than a Canvas-only board. React adds no required capability
and would preserve the coupling being removed.

### Modules

```text
playables/solitaire-v1/
  playable.config.ts
  src/model.ts          card, pile, state, action, event and projection types
  src/engine.ts         immutable validated transitions
  src/hints.ts          legal one-step suggestions; no solvability claim
  src/history.ts        bounded undo snapshots
  src/persistence.ts    versioned save validation and restore
  src/layout.ts         portrait/landscape geometry and stack compression
  src/presentation.ts   DOM renderer, pointer state and animations
  src/main.ts           bootstrap, lifecycle, swipe API and disposal
```

## Interface proposal

The legacy `moveCards(state, cards, sourceType, sourceIndex, ...)` positional
signature is rejected. It permits contradictory source/target data and cannot
prove that the supplied cards belong to the source.

```ts
type CardId = string;

type SourceRef =
  | { kind: 'tableau'; column: number; from: number }
  | { kind: 'waste' }
  | { kind: 'foundation'; suit: Suit };

type TargetRef =
  | { kind: 'tableau'; column: number }
  | { kind: 'foundation'; suit: Suit };

type KlondikeAction =
  | { type: 'draw-stock' }
  | { type: 'move'; source: SourceRef; target: TargetRef }
  | { type: 'new-deal'; deck: readonly Card[] };

interface KlondikeTransition {
  readonly state: KlondikeState;
  readonly events: readonly KlondikeDomainEvent[];
}
```

The engine derives moving card ids from `source`; callers never submit both a
source and an arbitrary card array. Every action validates indices, face-up
status, suffix ordering, source top, target suit and destination rules before
returning a new state.

State contains no `Date`, DOM nodes, callbacks, timers, score registries or
module-global mutable sets. Elapsed time, undo history, persistence and visual
motion belong to runtime layers. A state invariant validator must account for
all 52 unique cards across tableau/foundation/stock/waste after every accepted
transition.

## Explicit legacy exclusions

- dynamic `ensureSolvability()` rearrangement;
- premium cards, Joker, keys, shovels and gifts;
- old rank-point scoring and global scored-card sets;
- collections, shop, quests, donation progress and legacy win-flow popups;
- shell persistence keys and `GameIntegration` callbacks;
- global `window.__preventNextClick` / `__isTapNotDrag` drag coordination;
- direct DOM queries inside domain actions;
- verbose production console logging.

## Acceptance evidence required before feed integration

### Engine

- exhaustive rule fixtures for tableau/foundation/stock/recycle;
- rejected forged, face-down, non-contiguous and wrong-source moves;
- rejected wrong-suit foundation moves;
- input state remains deeply unchanged after every action;
- 52-card uniqueness/accounting invariant across random action sequences;
- win and no-moves semantics fixtures;
- undo restores the exact previous logical snapshot.

### Runtime and presentation

- tap, drag, cancelled drag and invalid-drop recovery on touch and mouse;
- portrait and landscape screenshots at the repository device matrix;
- minimum 44 px interactive targets even when visual cards are narrower;
- long-tableau compression without losing access to the final card;
- stock recycle, hint, undo, new-deal confirmation and completed signals;
- pause/resume during drag, flight, auto-collect and idle;
- restore after forced iframe reload and fail-closed corrupted-save fixture;
- exact-once completion and listener/timer disposal;
- swipe build/static/runtime gates and measured mid-range Android performance.

### Human review

Before implementation:

- full-game scope and ruleset;
- DOM/CSS rendering choice;
- removal of hidden solvability correction;
- persistence and heuristic-autoplay/restart policy;
- legacy exclusions and interface proposal.

Before rollout:

- card readability and tactile feel;
- full-session usability in the feed;
- dead-end/new-deal UX;
- portrait/landscape visual evidence;
- explicit `accept`, `revise` or `reject` disposition.

## Review disposition

Current disposition: **approve** (`2026-08-03`).

Approval revision: autoplay is required and restarts a random deal when its
legal-move heuristic reaches a dead end; it does not guarantee completion.

Human reviewer should record one of:

- `approve` — implementation may start within this packet's boundary;
- `revise: <changes>` — update this packet and repeat review;
- `reject` — stop the goal without runtime implementation.

## Implementation evidence

Implemented in `playables/solitaire-v1/` after the approval above. No feed,
catalogue or hosted deployment was mutated.

- Logical engine: full 52-card random Klondike, draw-one/unlimited recycle,
  immutable reducer, source-derived moves, canonical win and 52-card invariant.
- Runtime: tap/drag, bounded Undo, Hint, safe `Home`, New-deal confirmation,
  versioned local restore, pause/resume, exact win completion and clean swipe API
  (`hasAutoPlay: true`, `hasEditor: false`, `hasRestart: true`).
- Autoplay: same reducer as manual play, no solver, no seed contract, no hidden
  correction. Live browser logs observed automatic `no-useful-moves` restarts;
  a progress guard bounds unproductive stock cycling without claiming the deal
  is mathematically unsolvable.
- Automated verification: `npm run test:solitaire` — `22/22` passing, including
  750-step random invariant walks, forged-state rejection, persistence, history,
  hints, autoplay non-revisit and restart policy, compact layout, and exact
  preservation of an off-centre drag grab point.
- Static verification: strict targeted TypeScript check passed.
- Responsive browser review: `390×844`, `844×390`, and `320×568`; seven columns,
  no horizontal/vertical overflow, final cards remain reachable, and compact
  card/control targets are `44px` minimum.
- Interaction browser review: the stock flip uses a bounded overlay; manual and
  autoplay moves fly to their destination; an off-centre waste-to-foundation
  drag advanced the real engine state from move `82` to `83`; foundation arrival
  emitted a quality-scaled suit burst. Card faces now keep one large central
  suit and ranks in the two corners, without duplicate small suit glyphs.
- Drag/landing follow-up: a five-card suffix is rendered as five physical cards
  under the pointer (no count badge), with all five source cards dimmed. Its
  post-drop motion began at the exact calculated release origin `(131, 167)` and
  preserved the stack offsets. Stock/waste and foundation landings retain the
  previous top card as a temporary underlay; browser capture observed a flying
  `3♠` above the existing `2♠` until the destination `3♠` became visible.
- Fast-input follow-up: manual input is no longer globally locked by a flight.
  Two taps advanced the real state from move `173` to `175` while two motion
  layers and two card-id-scoped hidden destinations were still active. Waste
  drag hid `4♣` completely and exposed the real `5♠` below; foundation drag hid
  `3♠` and exposed the real `2♠`. The `0.24` source placeholder remains only on
  tableau, where it communicates the vacated field position.
- Tactile-input follow-up: drag begins after `4px`, caches the nodes and geometry
  of only engine-approved targets at pointer-down, and resolves a drop
  synchronously from the leading card's rectangle. A two-point browser flick
  moved a physical three-card stack
  with exactly `1px` of overlap while the release pointer remained `24px` left
  of the destination; the state advanced immediately from move `53` to `54`
  without waiting for hover paint.
- Rejection follow-up: a tapped card with no legal target performs a seven-step
  linear side shake. An invalid drag keeps its real ghost and flies it back to
  the original viewport position instead of snapping; browser polling captured
  the return at `(175,422)`, `(113,223)`, `(92,156)`, then `(71,90)`.
- Motion follow-up: manual/automatic card flights now use linear positional
  timing, and every card in a moved suffix starts together so the suffix remains
  rigid. Low-tier foundation particles reached `87px` from the card centre for
  a `50px`-wide card, visibly clearing the card boundary while retaining the
  tier's two-particle budget.
- Background-gesture follow-up: a double pointer tap/click on empty felt within
  `360ms` and `32px` starts a foundation cascade, while a single tap is inert
  and cards, stock, toolbar and dialogs are excluded. Unlike the conservative
  `Home` button, this explicit shortcut takes every currently legal foundation
  move and re-evaluates the board after every launch so newly exposed moves join
  the cascade.
  Browser review observed `2♣` followed by the newly available `3♣`, advancing
  moves `131 → 132 → 133`; one background tap left the count at `131`.
  A timing revision now launches successive cascade moves every `70ms` without
  awaiting the previous `230ms` low-tier landing; browser review observed two
  concurrent flight layers while moves advanced `160 → 162`. Completion copy
  still waits for all overlapping flights to settle.
- Weak-device profile review: forced `low` tier at `390×844` under continuous
  autoplay held `60 FPS` with an `18 ms` peak in two consecutive 8-second HUD
  samples and emitted no console errors. This is a local in-app-browser profile,
  not a substitute for the final physical low-end Android pass.
- Performance controls: pile/tableau render keys avoid unrelated DOM rebuilds;
  flights and particles animate only `transform`/`opacity`; concurrent flights
  use card-id reference counts instead of rebuilding animation state; low tier
  uses 230 ms flights, two arrival particles, simple card shadows, no dialog
  backdrop blur, and no filtered hint pulse.
- Swipe artifact: `dist-swipe/` build passed canonical/build/stamp gates; final
  artifact digest `sha256:0a3f60ce24204889d984ad96811745dea82eaec1679173ff83ce224476be9415`
  (`index.html` 1,067 bytes, `payload.js` 82,432 bytes).

Rollout remains blocked on the separate human visual disposition described
above. The current code/artifact is a review candidate, not a publication.

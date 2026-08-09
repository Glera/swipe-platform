# Labs mechanic-variation throughput audit — frozen pre-start brief

Date: 2026-08-09

Status: **FROZEN — telemetry spike YES; Two Dots selected**

Authority:
[`LABS-MECHANIC-VARIATION-THROUGHPUT-AUDIT-HANDOFF-2026-08-09.md`](LABS-MECHANIC-VARIATION-THROUGHPUT-AUDIT-HANDOFF-2026-08-09.md).
This brief records execution inputs; it does not reopen or replace that
protocol.

## 1. Ticket and ownership

- Request author: operator, handed off 2026-08-09.
- Original request: accept the bounded audit from the handoff, freeze this
  brief, run the exact Two Dots telemetry spike with automatic Sorting
  fallback, execute the candidate staircase, and finish with `X/Y/Z/N/V` and
  exactly one frozen terminal decision.
- Type: `mechanic` + bounded `labs` audit.
- Assigned cell / line owner / ticket author: Mac B / receiving frontier Codex
  session / receiving frontier Codex session.
- Repository merge authority: Mac B for `playables` and `swipe-generator`;
  portfolio owner for this meta-repository and the terminal `STATE.md` update.
- Review tier at start: Tier 0 for exact-playable candidate/content work. Any
  shared harness or Labs code change raises only that patch to Tier 1. Any
  backend, DB, auth, release-infrastructure, shared-runtime or production need
  is a stop condition, not an implementation invitation.
- GitHub issue: [`Glera/p4g-workspace-meta#76`](https://github.com/Glera/p4g-workspace-meta/issues/76).

## 2. Timebox and measurement clock

- Audit timebox: two working days, not extendable for incomplete optional work.
- Telemetry-spike start: `2026-08-09T17:51:36Z`
  (`2026-08-09T20:51:36+03:00`).
- Hard spike cutoff: `2026-08-09T19:51:36Z`
  (`2026-08-09T22:51:36+03:00`).
- Spike stop: `2026-08-09T18:03:18Z`
  (`2026-08-09T21:03:18+03:00`), 11m42s after T0 and 1h48m18s before cutoff.
- Spike result: **YES — use Two Dots**.
- Spike question: can exact `orthogonal-link-v1` produce a comparable local
  candidate action trace through an exact-playable/local-harness adapter, with
  no backend, DB or shared-runtime change?
- Binary rule: demonstrable adapter sufficiency selects Two Dots; `NO`,
  uncertainty or timeout selects Sorting immediately, without extension.
- Spike effort is charged to telemetry/trace work in `X`; all spike wall time
  is included in `Z`.

Contemporaneous ledger starts at the spike clock, not at first code edit:

| UTC start | UTC stop | Candidate | Bucket | Evidence / activity |
| --- | --- | --- | --- | --- |
| 17:51:36 | 18:03:18 | audit setup | telemetry/trace | authority read, exact baseline resolution, adapter implementation and proof; 0.195 active wall-hours; one fail-closed harness rework |

### Spike evidence

- Candidate-local harness commit:
  `playables@35b36ff1d9d9c69ede2d0e2ff82f627cffa769b3`; only the Two Dots
  evidence capture and its focused test changed. Product source remained
  byte-identical to the pinned baseline.
- Baseline repository tree: `b9bc5870ee349bf054b632edd0d22d477f6271f7`;
  exact `orthogonal-link-v1` subtree:
  `e8173eb409361e4bb2c7667c39dba2292fffb03f`.
- Trace receipt SHA-256:
  `ecacdd2fc0d3bb36637cd5c0ac96479be2866308b673ce6b3cd2cea6c554ab57`.
- SWIPE runtime artifact digest:
  `sha256:37da6de7f3f0cd4f7ace784d23e90ab3b2130be7e445931e69585679f24e04f5`.
- Exact trace: 6/6 canonical manual real-pointer actions; rejects `0`,
  autoplay actions `0`, page errors `0`; terminal `won`; digest chain
  `ol1-05ea3fd1 -> ol1-0b17da5e -> ol1-51decf7b -> ol1-1dd81f49 ->
  ol1-805c97d7 -> ol1-253edad1 -> ol1-f8956970`.
- Focused harness tests: 2/2 PASS. Strict technical profile: 12 engine/solver
  tests plus the full browser test PASS.
- Successful capture wall time: 8.135s (build 3.733s, browser capture 3.911s).
  Setup-inclusive T0-to-first-valid-trace was 9m09s; frozen-brief-commit to
  trace was 5m04s. The audit uses the larger setup-inclusive value in `Z`.
- Rework 1: the first run stopped at mount because the SWIPE artifact had an
  externalized `payload.js`; the candidate-local evidence server was narrowed
  to serve and verify the exact runtime-manifest file set. No product or
  platform change was involved.

This proves the minimum comparable action/state closure locally. It does not
claim that the existing sandbox worker can originate Two Dots: that worker is
currently Sort-only, rejects unchanged and sub-20-line candidates, and its
registered Sort baseline predates `sort.actions.v1`. Candidate packaging cost
is therefore measured explicitly as audit assembly and may become `N`; it is
not repaired by building a new platform in this goal.

## 3. Exact pinned baseline

- Remote: `https://github.com/Glera/playables.git`
- Remote ref resolved before mutation: `origin/master`
- Exact baseline SHA: `cb581e71e57f60822247d8ac2077e73adff86e88`
- Baseline subject: `fix(orthogonal-link-v1): apply mobile rework`
- Selected playable if spike is `YES`: `orthogonal-link-v1`.
- Fallback playable if spike is not `YES`: `marble-sort-swipe`, from the same
  pinned SHA unless a fresh remote CAS before fallback proves a different
  committed baseline is required; any such change must be recorded before the
  first Sorting mutation.
- The user's existing `playables` checkout is not an input. Builds and changes
  use isolated exact-SHA worktrees only.

Baseline control means unchanged playable source at the pinned SHA. Audit
scripts, receipts and local trace capture may live outside the playable source,
but they must record their own exact git/tree identity and may not alter the
baseline artifact bytes.

## 4. Trace closure frozen for comparability

Each accepted state-changing player decision must produce one ordered local
record with:

- candidate id, exact source SHA/tree and artifact SHA-256;
- run id, level id and monotonically increasing `actionSequence`;
- action type plus exact ordered path/cells;
- acceptance/disposition and whether the path closed a loop;
- pre- and post-action stable state digests;
- moves before/after, objective delta and newly completed subgoal delta;
- rule-entity state before/after when a Level-2 rule exists;
- terminal completion when it changes.

The same capture code, real-pointer path and canonical JSON schema must be used
for baseline and every selected candidate. Autoplay/oracle/rejected input does
not count as a player decision. A trace is incomplete if an accepted state
change lacks either ordered input or state-effect closure.

## 5. Candidate staircase — Two Dots path

All candidates independently fork the exact baseline/control seam. A later
candidate may reuse audit tooling and lessons, but does not silently accumulate
an earlier candidate's gameplay rule.

### `TD-B0` — baseline control

- Source rule: no playable-source change.
- Play: canonical real-pointer witness from the pinned production level.
- Prediction: action ordering, objective deltas, moves and terminal digest
  match the pinned control evidence.
- Forbidden: any playable source, level, timing, presentation or shared-runtime
  change.

### `TD-C1` — config floor

- Only change: production level `moves: 12 -> 14`.
- Prediction: canonical action ordering and objective deltas remain unchanged;
  `movesRemaining` is exactly +2 relative to baseline at every comparable
  action, and timing/decision structure does not change.
- Falsifier: a different accepted action sequence, objective delta, board
  transition or artifact behavior beyond the declared moves budget.
- Forbidden: board, refill, palette, objectives, engine, presentation, timing,
  telemetry schema or shared code.

### `TD-O2` — mandatory Level-2 `obstacle`

- Single new rule: cell `[2,2]` begins as a locked dot. A locked dot cannot be
  linked. The first accepted link that removes an orthogonally adjacent dot
  unlocks it; the dot itself remains for a later link.
- New player subgoal: deliberately unlock the blocked dot before using its
  high-value `c2` connection.
- Constructed vignette: on the exact initial board, baseline can open with
  `[[2,2],[3,2]]`. The mutation makes that action unavailable; a reachable
  rational opener is the `c0` link `[[0,1],[0,2],[1,2]]`, whose removal is
  adjacent to `[2,2]` and unlocks it for a later decision.
- Predicted future action-pattern shift: the first accepted decision changes
  from the short `c2` link to the setup `c0` link; the trace then contains one
  `locked -> unlocked` state transition before any path contains `[2,2]`.
- Falsifier: `[2,2]` is accepted while locked, the adjacent setup does not
  unlock it, or founder play follows the baseline opener without an observable
  rule-induced detour.
- Minimum feel: visible lock overlay before interaction; immediate reject or
  unlock feedback; explicit lock-break/subgoal-complete feedback.
- Forbidden: dimensions, palette, refill sequence, moves, color objectives,
  loop rule, gravity, general input semantics, audio, shared runtime, backend,
  DB and production telemetry.

### `TD-G2` — optional Level-2 `additional_goal`

Attempt only after `TD-O2` is valid and inside budget.

- Single new rule: one anchored background target under `[0,0]` is cleared
  when the dot currently over it is removed; winning additionally requires all
  background targets cleared.
- New player subgoal: route an accepted link through the target cell rather
  than optimizing only color counts.
- Constructed vignette: baseline's short `c2` opener
  `[[2,2],[3,2]]` advances a color objective but not the target. With the new
  goal, `[[0,0],[0,1],[0,2]]` is the rational opener because it clears the
  anchored target as well as advancing `c0`.
- Predicted shift: at least one early action is redirected through `[0,0]` and
  the trace records `targetsRemaining: 1 -> 0` on that action.
- Falsifier: the target clears without its overlying dot being removed, never
  affects a rational path, or winning ignores the remaining target.
- Minimum feel: target distinguishable before interaction; immediate clear
  feedback; explicit target-complete feedback.
- Forbidden: obstacle/lock rule, dimensions, palette, refill, moves, color
  objective counts, loop/gravity semantics, shared runtime and external
  systems.

### `TD-R2` — optional Level-2 `delayed_reward`

Attempt only after `TD-G2` is valid and inside budget.

- Single new rule: an open link of length at least four charges its final dot;
  including that charged dot in a later accepted link removes the full row as
  an additional delayed effect, then consumes the charge.
- New player subgoal: invest in creating a charged dot now and route a later
  link through it for a larger payoff.
- Constructed vignette: from a purpose-built reachable board state with both a
  short immediate pair and a four-dot path, baseline rationally takes the
  immediate pair. The mutation takes the four-dot path ending on a row whose
  later charged activation advances more remaining objectives.
- Predicted shift: a qualifying creation action is followed by a later action
  containing the same charged entity identity; only the latter has a row-wide
  reward delta.
- Falsifier: reward fires on creation, can fire without a later accepted link,
  or does not produce a distinguishable two-decision trace.
- Minimum feel: charged dot visibly distinct; immediate charge-created
  feedback; explicit row reward/charge-consumed feedback.
- Forbidden: lock or background-target rules, board dimensions, palette,
  refill, moves, baseline color objectives, shared runtime and external
  systems.

## 6. Automatic Sorting fallback

If the spike is not `YES`, stop all Two Dots implementation and amend this
brief before mutation with the exact Sorting baseline/control identities and
concrete Sorting vignettes. The already frozen bounds remain: unchanged
baseline, one timing-only config floor, one `obstacle`, then sequential
`additional_goal` and `delayed_reward`; all use existing `sort.actions.v1`.
This amendment is execution detail, not a request to reconsider the fallback.

## 7. Technical, sandbox and feel gates

- Every candidate uses the same strict technical profile for the selected
  playable, the same build target, same real-pointer capture and same visual-
  proof procedure.
- Candidate outputs must retain literal
  `publicationEligible=false`, `catalogEligible=false`, and
  `feedEligible=false` in the existing `mechanic_sandbox` prototype path.
- No catalog, roster, feed, Render, deployment, migration, secret, production
  release or shared-runtime action is authorized.
- Validity requires exact source/artifact identity, strict technical PASS,
  playable founder trace, complete trace closure and no unrecorded manual
  repair.
- For each Level-2 candidate, feel is capped at entity visibility, immediate
  interaction feedback and explicit subgoal-complete feedback. Extra polish is
  out of scope.

## 8. Cost buckets and stop rules

`X` is recorded per candidate in active person-hours, separately for:

1. rule logic;
2. visual/audio/interaction feel;
3. technical QA;
4. telemetry/trace work;
5. rework caused by defects or ambiguity.

`Y` separates marginal cash spend from subscription/CI/model usage. `Z` is
wall time from this frozen brief to a playable founder trace, with spike setup
included. Rework count and reason are recorded per candidate.

Stop the staircase when the mandatory rule candidate breaches the frozen
budget, cannot produce a comparable valid trace, requires work outside the
exact playable, or exposes a necessary patch wider than a narrow audit enabler.
Missing optional trend is then evidence, not permission to continue.

## 9. Frozen terminal decision tree

The receipt must select exactly one, using the handoff thresholds verbatim:

- `GO FAMILY A`
- `FIX EXPERIMENT HARNESS`
- `FIX MUTATION PIPELINE`
- `STOP`

No fifth outcome may be introduced. `STATE.md` is changed only after the
execution receipt and decision exist, and is the final file changed in the
audit.

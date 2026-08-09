# Handoff: Labs mechanic-variation throughput audit

Date: 2026-08-09

Status: **READY TO START AS A NEW GOAL**

Owner after handoff: the frontier Codex session that receives this file.

Operator decision: the protocol below is converged; do not reopen conceptual
design before producing execution evidence.

## 1. Read first

1. Root `AGENTS.md` — workspace roles, authority and review boundaries.
2. Root `STATE.md` — current portfolio state; update it last.
3. `VISION.md:190-202,235-249` — human taste, factory kernel, mechanic
   variations and the learning loop.
4. `docs/specs/lab-playable-release-fast-lane.md` — reusable source-agent,
   technical/build/visual-proof primitives. Fast Lane itself is a publication
   lane and is **not** the execution surface for this audit.
5. `swipe-backend/docs/specs/mechanic-mix-sandbox.md` — candidate-only
   prototype pool and its no-publish boundary.
6. `swipe-backend/docs/specs/telemetry-contract.md` — current action/event
   vocabulary; `manual_action` is presently a Sort pilot.

This handoff is the execution authority for the bounded phase -1 audit. It
does not change product VISION, authorize production publication, or approve a
new general-purpose experimentation platform.

## 2. One-sentence objective

Within a hard timebox of two working days, use the existing Labs
candidate-only sandbox and already-built worker/test/build/visual-proof
primitives to measure the real cost of producing meaningful Level-2 mechanic
mutations from one exact pinned baseline, ending with `X/Y/Z/N/V` and one
predefined decision rather than another architecture document.

## 3. What this is — and is not

This is a **throughput audit**, not Family A and not an evaluator experiment.
It asks whether the platform can cheaply produce controlled, playable and
traceable mechanic mutations.

It is not:

- a new Fast Lane release or a sequence of exact-user production releases;
- a statistical claim about player preference;
- a universal mechanic DSL or ontology;
- a new DB, queue, dashboard, publish route, model router or synthetic player;
- a reason to invalidate production factories;
- permission to publish any candidate to the catalog, roster or common feed.

Reuse the sandbox prototype pool. Reuse Fast Lane's bounded source worker,
strict technical profile, build and visual-proof machinery where applicable.
All outputs remain `publicationEligible=false`.

## 4. First action: exact two-hour telemetry spike

Start a visible two-hour timer before inspecting or changing implementation.
The timer may not be extended for “almost done”. Record start and stop times.

Question: can `orthogonal-link-v1` (Two Dots) emit a comparable **local
candidate trace** through an exact-playable adapter without any backend, DB or
shared-runtime change?

The minimum useful action trace must distinguish ordered player decisions and
their state effect sufficiently to compare baseline and mutations. Do not
invent a production telemetry route merely for this audit.

Binary choice at the two-hour cutoff:

- **YES:** a bounded exact-playable/local-harness adapter is demonstrably
  sufficient -> use Two Dots.
- **NO, uncertain, or time expired:** stop the spike and use Sorting with its
  existing `sort.actions.v1` evidence path. Do not discuss an extension.

The spike's time is part of `Z` and its active effort is part of `X`; it may
not disappear as “setup”.

## 5. Exact candidate family

Resolve and record one committed remote baseline SHA before any mutation.
Baseline, config control and every rule candidate must be built,
instrumented, played and captured through the same candidate-only path.
Historical production traces or an already-built production artifact do not
replace the baseline control run.

### 5.1 Required candidates

1. **Baseline control** — unchanged exact source.
2. **Config control** — one predeclared Level-0/1 tuning change. It measures
   the floor cost of “any change at all”; it is not gameplay diversity. Its
   honest behavioral prediction may be “timing changes, decision ordering
   does not”.
3. **Mandatory Level-2 rule mutation** — axis `obstacle`: one new entity with
   one rule that creates a new player subgoal.

If and only if the mandatory rule mutation stays inside the frozen budget and
produces a valid comparable trace, continue sequentially with:

4. **Optional Level-2 rule mutation** — axis `additional_goal`.
5. **Optional Level-2 rule mutation** — axis `delayed_reward`.

Do not launch optional mutations in parallel. The staircase is intentional:
the first rule mutation exposes first-time cost; later ones reveal marginal
cost and learning trend. If the mandatory mutation breaches the stop rule,
the missing trend is not a reason to continue — the audit has already found
its answer.

Concrete rule designs are frozen in the brief before code. Examples are
allowed as inspiration, not mandatory implementation:

- obstacle: locked cell/slot or temporarily unavailable object;
- additional goal: removable background/layer or secondary board target;
- delayed reward: a charged/special object created now for a later action.

## 6. Meaningful variation contract

`Near-miss` limits the number of simultaneous rule changes, not their gameplay
depth. A Level-2 mutation adds a new entity or subgoal while retaining the
family's core verb.

Every rule mutation must include, before implementation:

1. the single new rule;
2. the new player subgoal;
3. a constructed test vignette: a reachable state where the rational action
   differs from baseline because of that rule;
4. the predicted future action-pattern shift;
5. a falsifier — an observation that would count against the prediction;
6. forbidden adjacent changes.

Phase -1 proof is **constructive**, not statistical. The vignette and exact
trace must demonstrate the changed decision path. Founder play checks
legibility and trace validity. Population-level distribution claims belong to
Family A.

If founder traces do not show the predicted shift, record “behavioral effect
not observed”; do not automatically relabel the mutation Level 0. Possible
causes include weak rule force, poor legibility, insufficient plays or an
insensitive trace vocabulary.

## 7. Minimal comparable feel contract

Every Level-2 mutation gets only the minimum feel required to make the rule
legible and comparable:

1. the new entity is visually distinguishable before interaction;
2. interaction with it produces immediate feedback;
3. completing the new subgoal produces explicit feedback.

Anything beyond those three items is polish and is excluded from phase -1.
Record effort separately as:

- rule logic;
- visual/audio/interaction feel;
- technical QA;
- telemetry/trace work;
- rework caused by defects or ambiguity.

Do not create a separate “same rule, full feel” candidate in this phase. Keep
`same formal spec / different feel` as a deferred Family-A modality card for a
future `spec -> traces -> video+audio` evaluator comparison.

## 8. Measurements

Record timestamps and effort contemporaneously, not from memory after the
run. The final receipt must contain:

- `X`: active person-hours per candidate, with the five cost buckets above;
- `Y`: marginal cash cost plus CI/model usage reported separately (subscription
  usage is not silently presented as marginal cash spend);
- `Z`: wall time from frozen candidate brief to a playable founder trace;
- `N`: the single largest bottleneck and its evidence;
- `V`: valid mutations / attempted mutations;
- rework count and reason per candidate;
- technical-profile outcome;
- trace completeness and comparability;
- cost trend from config control through successive Level-2 rules.

A valid candidate has exact source/artifact identity, passes the same strict
technical profile, is playable by the operator, preserves the required trace
closure, and does not rely on an unrecorded manual repair.

## 9. Frozen decision tree

Choose one terminal decision from the evidence. Do not invent a fifth outcome
after seeing results.

### `GO FAMILY A`

Use when the mandatory Level-2 mutation and at least one subsequent Level-2
mutation produce valid comparable candidates within the two-day timebox,
without backend/DB/shared-runtime work, and marginal active effort is no more
than one person-day per Level-2 mutation.

### `FIX EXPERIMENT HARNESS`

Use when rule implementation and build are cheap, but valid comparable traces
require manual telemetry repair, differ structurally across candidates, or
cannot be trusted without harness work.

### `FIX MUTATION PIPELINE`

Use when a rule needs backend/DB/shared-runtime changes or manual work outside
the exact playable, or when more than half of `X` is spent on integration and
assembly rather than rule design and minimum feel.

### `STOP`

Use only when the pipeline and traces are valid and no single removable
bottleneck dominates, but total cost is broadly high enough that a Family A of
6-8 variants is not reasonable. Prefer the appropriate `FIX` when a concrete
`N` exists.

If the two-day timebox expires, stop safely, preserve completed artifacts and
classify the evidence using the same tree. Time expiry does not authorize
scope expansion.

## 10. Review and authority

- The operator has accepted this protocol. Do not restart conceptual review.
- Nontrivial source or logic changes still follow root `AGENTS.md`: bounded
  implementation, relevant tests and independent review before merge.
- Use Claude as the independent reviewer at meaningful merge/acceptance
  points, not for repeated prose iterations or every generated candidate.
- Human taste remains evidence, not machine publication authority.
- No production, roster, catalog, Render, backend deploy, migration, secret or
  external irreversible action is authorized by this handoff.
- If a necessary implementation gap exceeds a narrow audit-enabling patch,
  stop and classify it as `N`; do not build the missing platform inside this
  goal.

## 11. Required durable outputs

1. A pre-start frozen brief committed to git with:
   - exact selected baseline SHA;
   - telemetry-spike result and timestamps;
   - candidate definitions and forbidden changes;
   - constructive vignettes;
   - behavioral predictions/falsifiers;
   - decision thresholds above.
2. Candidate artifacts and trace identities from the existing sandbox path.
3. One execution receipt with `X/Y/Z/N/V`, cost breakdown, rework and terminal
   decision.
4. `STATE.md` updated last with only the durable outcome and next boundary.

Goal completion means the evidence and one terminal decision exist. It does
not require a positive result or publication of a variation.

## 12. Ready-to-paste goal

```text
Read LABS-MECHANIC-VARIATION-THROUGHPUT-AUDIT-HANDOFF-2026-08-09.md,
then AGENTS.md and STATE.md. Accept ownership of the bounded Labs mechanic-
variation throughput audit described there. Do not reopen the converged
protocol. First commit the frozen pre-start brief, then start the exact
two-hour Two Dots action-telemetry spike. Execute the staircase only through
the existing candidate-only sandbox, preserve all no-publish boundaries,
measure X/Y/Z/N/V contemporaneously, obtain independent Claude review only at
meaningful code/merge gates, and finish with exactly one frozen terminal
decision. Do not stop at a plan while a safe in-scope next action remains.
```

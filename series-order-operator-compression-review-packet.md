# Series Order operator compression — review packet

## Scope

- Generator branch: `codex/series-order-operator-compression`
- Generator commits under review:
  `116b86b`, `cebce16`, `5898a8d`, `f85bf62`, `0800583`.
- Backend docs branch/worktree:
  `/private/tmp/swipe-backend-series-order-docs` (`codex/series-order-docs`)
- Backend docs commits under review: `1bcb0f4`, `b8c9d90`.
- Goal: reduce the normal Series Order operator path to 2–4 meaningful
  contacts while preserving every taste, factory, series and Telegram gate.

## Implementation

- Server-owned `lab.series-order-delegation-policy.v1`.
- Immutable `lab.series-order-delegation.v1`.
- Durable per-head claim, committed-effect receipts and append-only same-head
  claim releases when external QA evidence changes the next legal transition.
- Provider-free scheduler driver using only the existing
  `approve|advance|materialize` APIs.
- Five-second driver throttle independent of Lab HTTP polling.
- Default-on one-click browser flow:
  `create → initial order approval → delegation`.
- Server-derived `lab.series-order-operator-packet.v1`.
- Collapsed expert controls retain the manual API path.

## Authority boundaries to attack

1. A draft order cannot receive delegation before initial exact order approval.
2. Model-assisted factory requests never expose a delegation target.
3. Campaign approval is delegated only for a fresh provider-free plan.
4. QA repair is delegated only for native technical repair, never
   selection/taste replacement.
5. Setting selection, all taste verdicts and factory admission remain human.
6. No code path calls publish, recall, roster or Telegram Approve.
7. Policy rotation pauses an existing delegation.
8. Claim/effect replay is independent of wall-clock timestamps.
9. Crash after `materialization_started` reuses the same durable claim and
   records the final `all_drafts_committed` event.
10. A running driver cannot create duplicate events/jobs/drafts under a second
    tick.
11. Two different claims on one event-head cannot bind each other's effect:
    lookup is exact on `beforeEventId + mutationId`.
12. An uncommitted claim may be released only by the frozen
    `projection_changed_without_order_event` reason; an effected claim cannot
    be released.
13. Exhausting the QA repair limit exposes one `action_required` packet and
    never remains an infinite working spinner or silently raises the limit.
14. The one-click UI compares the returned immutable request bytes,
    `mutationId`, order/projection ids and a browser-recomputed JCS orderHash
    before it echoes any server-owned approval target; a forged or drifted
    create response cannot be auto-approved.

## Verification

- Modified Series Order suites: `43 passed, 0 failed`, including executable
  same-head QA-evidence recovery, parallel-tick serialization, both
  create-factory review stops, repair-limit UX and the four-contact browser
  path.
- Browser proof: one click emits exactly `create`, `approve`, `delegate`, then
  shows the working operator packet without a normal `advance` button. The
  same browser scenario then exposes exactly three more causal contacts:
  `level_review → series_review → telegram_approve`, with no
  `advance|materialize` control between them.
- Full generator test run reached `536 passed / 1 skipped`; four unrelated
  frozen cross-repo checks fail because current `swipe-ugc@b8be78d` differs
  from accepted worker pin `70f50d4`, which also changes the derivation-v1
  compiler identity. No Series Order test failed.
- Root tooling/docs tests: `29 passed`.
- Docs boundary lint: clean.

## Live canary

Local order `db500296-8822-4b77-aac5-a31cfd4fdbb6` was created, exact-approved
and delegated by one browser click. Without further clicks it:

1. resolved the existing factories;
2. approved the provider-free series campaign;
3. generated and QA-checked three LevelSpecs;
4. approved and launched three bounded technical repair rounds;
5. recovered a previously claimed `advance` after QA changed the same
   event-head, leaving an immutable release record;
6. stopped at round four as `action_required` with
   “Решить, продолжать ли ремонт сверх лимита”.

This proves the compressed path through its first bounded human stop. It does
not claim the separate live level-taste → full-series-taste → Telegram tail;
that remains pending.

## Review decision requested

Return `GO` or findings with exact severity and executable reproduction.
Do not merge/deploy from this packet.

## R1 fix round

Independent R1 returned `NO-GO` with findings F1–F5. The fix round keeps all
14 authority boundaries unchanged and closes the executable findings.
Generator fix commit: `b36bd7d`; docs clarification: `eed7633`.

- a delegation transition limit, policy rotation or unexpected driver error
  is projected as `action_required` with one `expert_resolution` action,
  never an empty eternal `working` packet;
- committed effect rejects a released claim, while delegated mutation identity
  now includes exact `action + effectClass + units`;
- the materialization-start event carries the exact delegated command
  mutation, so recovery cannot attribute a concurrent manual same-head
  materialization to the delegated claim;
- the browser retains the create mutation through the complete
  `create → approve → delegate` chain; a lost response after committed initial
  approval replays the same immutable order and resumes directly at delegation;
- delegated order selection rotates beyond the four-order per-tick cap.

Verification after the fix:

- the reviewer's untracked R1 repro file: **4/4**;
- canonical Series Order profile including new release-XOR, units identity,
  operator stop, driver-error, exact materialization attribution, browser
  retry and five-order fairness regressions: **50/50**;
- no review/taste/factory/Telegram authority was added or delegated.

Remaining R1 P3 disposition: policy loading stays shallow-frozen in this
round because the executable low-limit review fixtures intentionally derive a
test policy from the loaded document; production receives the normalized
server-owned object and exposes no mutation path. Deep-freezing a cloned
runtime policy remains non-blocking hardening. Machine-code blocker copy
outside the new driver-stop map is likewise a presentation follow-up.

Requested re-review is intentionally narrow: rerun R1 A/B/C, confirm distinct
driver mutation IDs for different `units`, and inspect the canonical retry and
round-robin tests. Merge/deploy remains stopped until that `GO`.

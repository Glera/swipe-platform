# Archive — 2026-07 (closed evidence/handoff/review artifacts)

Closed artifacts of completed July initiatives, moved out of the workspace root
during the 2026-07-25 hygiene pass. All items below reached their terminal state
(GO / merged / accepted / superseded). Nothing here is an active gate; live
work stays in the root and in `swipe-backend/docs/specs`.

## agents-m2m (machine-to-machine read authority) — R3-GO received
- `agents-m2m-read-review-r1.md` — adversarial review of agents-m2m-read draft v1 (`swipe-backend@c0f96af`); findings raised.
- `agents-m2m-read-review-r2.md` — review of draft v2 (`bed3ee3`); v1 findings closed, 2 new P2 (text-only).
- `agents-m2m-read-review-r3-go.md` — diff-review of v2.1 (`d83abc7`); **GO** on flagged implementation.
- `agents-m2m-cr-r1.md` — code review of the `agents-m2m-read` branch (HEAD `cb56584`) vs spec v2.5.
- `agents-m2m-cr-r2-go.md` — point-check of the fix wave (`0e0eb2b`); **GO** on merge/deploy, no open P1/P2.

## agents-operator-qa — R4-GO received
- `agents-operator-qa-review-r1.md` — adversarial review of draft v1 (`1d96f36`); 3 P2 + P3 spread.
- `agents-operator-qa-review-r2.md` — diff-review of v2 (`a618de7`); **GO** on shadow build.
- `agents-operator-qa-review-r4-go.md` — diff-review of v2.14 + broker-recovery runbook; **GO** (design-complete).
- `agents-operator-qa-cr-block1.md` — code review of QA impl block 1 (`codex/agents-operator-qa@54a7249`, migration agents-0003).
- `agents-operator-qa-cr-blocks-234.md` — code review of QA impl blocks 2-4 (broker/fencing, transport/delivery, typed-facts, linkage; HEAD `cdd9225`).
- `agents-operator-qa-native-broker-review.md` — security review of the native macOS execution broker (`7763d5a`) before root-install.

## swipe-agents A1 (agent-team) — R3 complete, ready for human gates
- `swipe-agents-review-a1-r1.md` — adversarial review R1 (`swipe-agents@4433c90`, spec agent-team.md@`a8001c9`).
- `swipe-agents-review-a1-r2.md` — review R2 (`main@2ab2e56`, 314/314 green).
- `swipe-agents-review-a1-r3.md` — review R3, wave 6 point-check ×6 (`main@f76e4e9`, 334/334 green).

## Experiment-worker / conformance rework — accepted
- `worker-conformance-evidence.md` — experiment-worker conformance evidence pack, fix round 3 (`0a6ad25`).
- `worker-conformance-wip-integration-evidence.md` — worker-conformance + user WIP integration evidence (fix commit `431deb9`).
- `experiment-rework-coordinator-evidence.md` — experiment rework coordinator review handoff (generator-coordinator worktree).
- `experiment-worker-switch-review.md` — independent review packet for experiment-worker-switch (`swipe-ugc@codex/experiment-worker-switch`).

## Operator flag rework — accepted
- `operator-flag-rework-handoff-backend-evidence.md` — backend evidence (swipe-backend-operator-flag-rework worktree).
- `operator-flag-rework-handoff-generator-evidence.md` — generator evidence (swipe-generator).

## Series factory / order — closed packets
- `series-factory-sort-review-packet.md` — independent review packet, Series Factory / Sort (swipe-generator).
- `series-factory-slot-repair-review-packet.md` — Series Factory slot-repair review packet (2026-07-21).
- `series-order-pause-handoff-2026-07-22.md` — Series Order pause handoff; operator series order → Workshop draft via reusable planes.

## Other closed handoffs / evidence
- `roster-backend-implementation-packet.md` — Roster-backend (ТЗ-A server half); implementation complete + accepted 16.07 (`swipe-backend@373559c`).
- `safe-recall-broker-evidence.md` — safe recall broker backend evidence (swipe-backend, 2026-07-17).
- `backend-master-varchar-handoff.md` — handoff for red master (varchar(16) in variants.source) after GitHub Actions billing outage.
- `codex-cross-review-2026-07-20.md` — cross-review of two authority slices, awaiting independent codex GO (since merged).
- `c1-analyst-digest-2026-07-20.md` — analyst C1 morning digest, manual role run (5 windows 15-19.07).
- `c1-analyst-handoff-2026-07-20.json` — analyst C1 handoff dataset feeding the digest above.
- `CLAUDE-HANDOFF-2026-07-17.md` — continuation handoff for the five-ТЗ package (no production overclaim).

## Session capture / test byproducts
- `session-transcript-78709870-2026-07-15.jsonl` — raw session transcript (2026-07-15), ~18 MB.
- `smoke-test-screenshot.png` — smoke-test screenshot byproduct (2026-02-16).

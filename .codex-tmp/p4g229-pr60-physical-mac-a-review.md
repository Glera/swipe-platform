## PHYSICAL MAC A CORRECTION-ONLY REVIEW — STOP

Scope: `Glera/swipe-generator#60`, frozen Generator-only correction for Issue #229. This was exactly one physical Mac A blind Claude Opus 5/high correction-only delta review; no second discovery and no authoring on Mac A.

Exact package:
- base: `e9eef4a05505b158dc148161a324651bb4a9db41`
- head: `de0eab4fca6ecf1f9a7f3025e65da5803061278e`
- tree: `6ef0ed81bbc075d4b1ef51d99fee7dfe30341be9`
- GitHub raw diff: 10,650 bytes / `1b00eed2eee090751b02d3d492f14bfa6b7db3af2fedc66e56c2789a54597617`
- collector-framed patch: 10,692 bytes / `0a452d3b795012425468f67bed1b09289670f862ecfc834891e0b51dbccb019c`
- exact-head CI: `check + node:test` SUCCESS, run `33208095819`, job `98974231605`

Reviewer identity:
- model/effort: `claude-opus-5/high`
- session: `4758ddc7-d3cc-48b5-93e3-0671868827c5`
- result UUID: `f8f37f1c-8852-4361-8f57-1e75ab56e38d`
- checkout remained clean; reviewer performed no file mutation

Disposition:
- F001 P1: **RESOLVED** for a transferred orphan whose fast-lane linkage is absent: it is reported once and cannot synthesize lineage, admit/start authoring, or create a release. Named failed/engineering-queued durable manual-source recovery remains available.
- F002 P2: **RESOLVED**: an identical repeated close failure still receives the bounded close attempt but does not append another identical `REWORK_CLOSE_PENDING` event.
- new findings: **P1=1, P2=0, P3=0**.

### P1 — legitimate interrupted-authoring recovery is shadowed

`src/playable-rework-auto-coordinator.mjs:125` defines missing durable lineage from `lane.source == null`. That also matches a legitimate interrupted authoring lane: `agent.recoverInterrupted()` may verify an already-pushed commit and restore the task to `source_ready`, while its existing fast-lane journal is still in `authoring` with `source: null` because the crash happened before `fastLane.sourceReady`. The new fence then writes terminal `playable_fast_lane_source_lineage_missing`, excludes the request from selection, and makes the existing blocked-to-accepted recovery path unreachable. The verified pushed source is discarded and the rework remains stuck.

Required bounded correction on Mac B: distinguish absence of an exact-request lane binding from a lane that exists in an eligible in-flight phase. A transferred orphan must still fail closed, while an exact request already bound to a `queued`/`authoring` lane with durable recovered `SOURCE_READY` evidence must remain eligible. Add a regression covering a `feed.playable-rework.request.v1` row with lane present in `authoring`, `source: null`, and a recovered non-manual `source_ready` task. Keep the existing orphan and manual-source recovery regressions load-bearing.

Next boundary: Mac B remains sole Generator author/owner. Make one bounded correction in the same frozen scope, obtain one correction-only delta verdict on the new exact head, and continue PR/CI/merge plus #229 transfer/load only on P1=0/P2=0. No second discovery, Backend/Feed change, runtime load, replay, approval, publication, or product action occurred here.

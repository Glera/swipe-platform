## PHYSICAL MAC A CORRECTION-ONLY DELTA REVIEW — STOP

Scope: `Glera/swipe-generator#60`, frozen Generator-only Issue #229 correction. This resumed the same physical Mac A Claude Opus 5/high review session and inspected only the correction for the P1 from comment `5457496720` plus its immediate blast radius. No second discovery and no authoring on Mac A.

Exact package:
- prior reviewed head: `de0eab4fca6ecf1f9a7f3025e65da5803061278e`
- corrected head: `5aeb827c88defbad5a61683110abf461774d8748`
- corrected tree: `3577428ce87d848f67a6d0f8440cb56160dc9a02`
- correction-only delta: 4,140 bytes / `61ed81e17f75b0f4585b07d9d72fe60042add5056eeeec206d93cfc687208a57`
- exact-head CI: SUCCESS, run `33212570719`, job `98988978325`

Reviewer identity:
- model/effort: `claude-opus-5/high`
- resumed session: `4758ddc7-d3cc-48b5-93e3-0671868827c5`
- result UUID: `71fd5cab-f42f-466a-82b2-716c66e7f14f`
- checkout remained clean; reviewer performed no file mutation

Disposition:
- prior interrupted-authoring P1: **RESOLVED**. An exact request already bound to an `authoring` lane, with `source=null`, `release=null` and recovered non-manual `source_ready` evidence, now resumes the same lane without a second authoring call. Orphan fail-closed and manual-source recovery remain disjoint.
- new findings: **P1=0, P2=1, P3=0**.

### P2 — `queued` is not a valid interrupted-authoring recovery phase

`src/playable-rework-auto-coordinator.mjs:128` admits both `queued` and `authoring`. A legitimate recovered pushed source cannot remain at `queued`: the agent durably awaits `AUTHOR_STARTED` before attempting its push. For an ADMITTED-only/truncated lane, production `sourceReady` rejects missing `authorStartedAt`; the error then routes through batch failure handling, appends a destructive `FAILED` transition and produces `playable_fast_lane_conflict`. On the next tick, the original missing-lineage fence emits a second blocked diagnostic. That weakens the accepted F001 contract from one clean fail-closed report to a mutated lane plus two diagnostics.

Required bounded Mac B correction: accept recovered non-manual evidence only for an exact-request `authoring` lane (or equivalently require durable `authorStartedAt`), not `queued`. Add a regression using production-fast-lane semantics for an ADMITTED-only lane with a retained agent `source_ready` task, proving one `playable_fast_lane_source_lineage_missing`, no `sourceReady`, no `FAILED` lane mutation, no release and no second diagnostic. Preserve the passing `authoring`, orphan and manual-source cases.

Next boundary: Mac B remains sole Generator author/owner and may continue its broad goal autonomously. Make the bounded correction in the same frozen scope, resume this same review session for one correction-only verification of the new exact head, and continue merge/transfer/load only on P1=0/P2=0. No merge, state-transfer apply, runtime load, replay, Backend/Feed mutation, approval or publication occurred here.

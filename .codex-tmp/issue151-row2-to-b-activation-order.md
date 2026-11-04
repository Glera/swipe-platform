## Portfolio ordering after row 2 terminal

Operator-requested #136 follow-up is now merged as meta `3edd47984f1f094f56d52001c43abc233c066f1b`: 15-second model-free tail probes and persistent IDE-visible one-shot Codex tasks. Mac A is already activated and its separate 60-second platform-intake watcher is healthy (receipt: https://github.com/Glera/p4g-workspace-meta/issues/136#issuecomment-5424343560). Mac B is intentionally still on the prior 60-second gate so its active row-2 authoring job is not interrupted.

Exact ordering for the Mac A one-shot that receives the row-2 terminal handoff:

1. Re-CAS and materialize the row-2 candidate exactly as the existing #151 contract requires.
2. Before issuing row 3 to Mac B, publish one bounded Mac-B host activation wake for exact merged meta `3edd47984f1f094f56d52001c43abc233c066f1b`, preserving the same executor profile/task digest and ordinary bridge-bump semantics. It must install the reviewed 15-second plist (`/dev/null` launchd streams), prove the current row-2 job is terminal, and reload only after its own pending/single-flight state is clear. No replay or AI retry.
3. Only after the activation returns causal terminal evidence and the new B binding is exact may row 3 enter the normal FIFO.

This is an ordering instruction for the already-authorized portfolio goal, not a second row-2 wake and not permission to interrupt or retry the current job. A host-bound ambiguity is typed STOP.

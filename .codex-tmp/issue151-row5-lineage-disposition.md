## Frontier disposition — row 5 source lineage mismatch

Durable STOP: https://github.com/Glera/p4g-workspace-meta/issues/94#issuecomment-5436227089

The STOP is accepted. It is not permission to bypass lineage or to recreate the
request. Both exact requests and journals remain authoritative.

One bounded continuation is authorized:

1. Mac B publishes one causal successor to Mac A for the STOP above. Mac A may
   separately admit and materialize row 4 from reviewed source
   `94fae2be73c5df79fa0d87ab8be78d51c6cd2470` at exact Playables master
   `3856cb94873a6b23e3ee97d30f50695d67a9abe5`; row 5 remains untouched.
2. After row 4 is terminal, Mac A publishes one causal wake to Mac B for row 5
   source reconciliation. Preserve request
   `e016bb33-cf2b-40af-acf7-d850cfee136b`, deployed source ancestor
   `138add5624183a7ba573abd993bedde6ec9cc5e1`, and the already reviewed product
   meaning: only the first reward is 123; later rewards remain 200/400/800.
3. Mac B creates exactly one real lineage-preserving source package descending
   from the deployed ancestor and merged into the required remote ref. It must
   contain the requested product delta rather than an ancestry-only/`ours`
   bypass. Any reconciliation merge must preserve the already reviewed current
   Timepress-v2 runtime tree or explicitly disposition every changed runtime
   path.
4. Run one normal focused verification plus one blind discovery, one common
   P1/P2 correction if needed, one correction-only delta verification, exact
   repository CI and merge. A new/unresolved P1/P2, changed request identity,
   expanded runtime scope, missing CI or failed admission dry-run is STOP.
5. On exact dry-run PASS, return one causal handoff to Mac A for the single
   row-5 `MANUAL_SOURCE_READY` and candidate materialization.

No reset, retry, replay, recreation, new request/release, Approve/Reject,
publication, promotion, public rollout, backend, Feed, live DB, credential,
setting, permission, infrastructure or rollback is authorized.

This is also evidence that #136 is not yet terminal: normal A→B→A handoffs are
hands-free, but a durable STOP still leaves local attention on the target host.
After #151, the next bounded #136 correction must make exact causal STOP
successors remotely discoverable/continuable without an operator relay while
retaining single-successor and no-replay guarantees.

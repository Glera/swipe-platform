# Platform Reliability R1-A — rehearsal closure review R8 disposition

Status: every R8 finding is addressed locally without changing packages A–G.
Final R9 review is required. GitHub Pro, ref publication and all provider/GitHub
mutations remain unperformed.

| Finding | Disposition |
| --- | --- |
| P1 Blueprint discrimination | Validation now asserts only documented valid/name/empty-set/action-count fields and explicitly says it binds uploaded bytes, not source. Post-create no-clobber GET receipts require exact temporary owner, dated branch, Dockerfile, plan, region, cron schedules and database name/plan; the canonical capture receipt also gets an exact jq branch/path assertion. |
| P2 post-switch evidence | Removed the nonexistent fresh-GET imagePath receipt claim. Evidence is exactly the reviewed prepare PATCH-response verification log plus receipt/run/attempt and the deploy log's fresh-GET env check bound to its receipt; deploy remains exact-digest. |
| P2 private repo access | Numbered step 0 inventories the Render GitHub App, confirms existing backend access, adds only meta if absent after the production provider gate, records before/after and restores exactly that additive grant in cleanup. |
| P2 environment-scope proof | Step 0 proves no repository RENDER_ secret/variable and no pre-existing production environment. After creation, receipts prove the exact candidate branch policy and exact environment secret/variable name sets, then repeat the repo-level absence. Cleanup repeats both assertions. |

P3 closures:

- source table/publication now pins sentinel 5ef857f exactly; the immutable
  Blueprint source commit is pinned in the next audit commit to avoid a
  self-referential Git hash;
- step 0 makes sentinel capture/merge ordering executable;
- first package publication proves private visibility, backend linkage and
  exact version set;
- compressed OCI sizes are projected against at least eight external pulls and
  Pro transfer headroom;
- production cutover deadline is 60 days after the older build, leaving a
  30-day artifact-retention margin;
- rehearsal asserts Dockerfile exactly while production keeps its separate
  legacy-path allowance.

No external state changed.

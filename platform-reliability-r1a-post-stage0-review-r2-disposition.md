# Platform Reliability R1-A — post-Stage-0 review R2 disposition

Review mode: independent Claude Opus xhigh, read-only (`plan`, write/edit tools
disabled), no persisted session.

Reviewed exact identities:

- `swipe-backend@9ec641a5c1bfdbf2241cc7974142aa0b680a300b`;
- `feed-prototype@b7ea23b578cf5b141987f51180a2ba3e36260f82`;
- `p4g-workspace-meta@e2443bd`;
- backend CI runs `30686769413` and `30686769415`, client run
  `30686770674`, meta run `30687080935`.

Verdict: **GO WITH CONDITIONS**. The reviewer explicitly authorized only a
disposable rehearsal after closure and fresh review, never merge, image
publication, Render production mutation or cutover.

| Priority | Finding | Disposition |
| --- | --- | --- |
| P1 | `codeCompatibility` and exact-equality `lkgCompatibility` made every candidate target newer than the LKG target unreachable. | Implemented in backend `4b84fa7`: preserve the pinned range byte-for-byte and add separately validated `lkgForwardCompatibility` ending at the candidate target. Fresh CI/review pending. |
| P2 | `predecessor_to_target`, lock contention and conflicting binding lacked executable PG coverage. | Implemented in backend `4b84fa7`: disposable PG16 gate covers migration, exact replay, contention, conflict and forward-only rollback across two real migration graphs. Fresh CI pending. |
| P2 | `swipe-seq-shadow-run` and `swipe-c1-materialize` used the strict Dockerfile without supplying its SHA argument. | Implemented in backend `4b84fa7`: Render's build-time `RENDER_GIT_COMMIT` is the exact-SHA fallback and image CI executes it; both services inventoried. Fresh image CI pending. |
| P2 | Client/backend guards missed bare `mission` names, nested paths and some mutant classes. | Implemented in backend `4b84fa7` and client `747cef6`: fail-closed discovery plus bare/nested/inbound/`app.config` mutants; allowlist unchanged. Fresh CI pending. |
| P2 | “required” overstated GitHub enforcement unavailable on the current repository plan. | Implemented in backend docs and meta packet: checks run unconditionally on every PR; merge is attended under §10.9. |
| P3 | Plan heading said non-enforcing; concurrency scope said account-wide; implementation status has no R1-A entry. | Accepted where current authority permits: heading and scope corrected in the R1-A documents. `IMPLEMENTATION-STATUS.md` is updated only at merge, because it is rollout authority rather than branch evidence. |

No finding changes product semantics or authorizes Stage 1 merge. Stage 1's
draft migration collision remains owned by its authors after R1-A cutover.

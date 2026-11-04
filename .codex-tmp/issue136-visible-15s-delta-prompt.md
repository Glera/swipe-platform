Second and final correction-only delta verification explicitly authorized by the operator. Do not perform a new discovery.

Review the corrected exact working-tree patch only, read-only:
- checkout: /private/var/folders/p8/cdxryk7x5rn4bj4rsj0sx_wc0000gn/T/auto-review-iVgite/checkout
- full corrected patch: /private/var/folders/p8/cdxryk7x5rn4bj4rsj0sx_wc0000gn/T/auto-review-iVgite/patch.diff
- base: f8cfd75e5f63ea449049e74ada1819477d3fafcf
- layers: commits=[], staged=[], unstaged=[docs/specs/two-mac-model-free-wake-gate-v1.md, scripts/com.p4g.two-mac-wake-gate.plist.template, scripts/two-mac-bridge.mjs, scripts/two-mac-executor-bootstrap.test.mjs, scripts/two-mac-executor-profile.mjs, scripts/two-mac-wake-gate-core.mjs, scripts/two-mac-wake-gate.mjs, scripts/two-mac-wake-gate.test.mjs], untracked=[]
- corrected patch bytes: 56604
- exclusions/secrets/binaries: none

Acceptance intent is unchanged: 15-second model-free discovery latency; no periodic AI; one fresh one-shot AI only for an actionable wake; the active AI task must be visible in Codex Desktop without Desktop becoming a liveness dependency; at-most-once, STOP, authority, and no-retry boundaries remain unchanged.

Original findings and author dispositions are in:
/Users/gleb/My projects/p4g-platform-workspace/.codex-tmp/issue136-visible-15s-dispositions.json

Your immediately preceding correction-only verdict found exactly two remaining P2:
1. GraphQL `updatedAt` second precision was compared as a string against the REST cache millisecond form, defeating the 15-second fast path.
2. Repeated GitHub tail/full-audit failures could remain silent forever.

The second correction normalizes probe instants and compares parsed instants; records a mode-0600 consecutive control-read failure counter; permits two bounded transient failures with minute backoff; creates durable `control_read_unavailable` attention on the third; clears the series on a successful probe/audit; and adds load-bearing tests for both timestamp forms, persistent failure escalation, no AI call, and transient recovery.

Verify only:
1. whether those exact two P2 are resolved by the corrected bytes;
2. whether this second correction introduces any new reachable P1/P2;
3. only adjacent regression edges of timestamp normalization and bounded read-failure escalation. Treat the already-verified earlier correction as fixed context, not a new discovery surface.

Do not repeat broad discovery and do not promote P3 to blockers. Do not modify files, run commands/tests/network, or use subagents.

Return exactly one of:
PASS — original P1/P2 resolved; new P1=0, P2=0
or
STOP — then list only unresolved original P1/P2 and new correction-introduced P1/P2 as numbered findings.

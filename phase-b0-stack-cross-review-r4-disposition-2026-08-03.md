# Phase-B0 R4 disposition and R5 exact-head request

Date: 2026-08-03. Status: R4 `NO-GO` accepted; all reported 2×P1,
4×P2 and 4×P3 are fixed and resubmitted for independent diff-only R5.
This document is evidence, not a GO verdict and not authority to merge, build
or install a release, replace restic, switch `current`, issue/read credentials,
touch B2, load launchd, start acceptance, reboot, kill a process, or enable an
agent contour.

## Exact heads

| Item | Exact identity | State |
| --- | --- | --- |
| prerequisite remote-sync follow-up | swipe-agents PR #14 `f798e11185850ebbb5e6842b2cdaad22640b126c` | unchanged; independently GO in R2 |
| release boundary | swipe-agents PR #15 `4d90621eb35c64780545ef9edb7ed729684fdaef` | GitHub CI `SUCCESS`, run 30825827974 |
| bounded acceptance integration | swipe-agents PR #16 `ca0c59e2167a73d54c3800053abb45c789fff8a5` | GitHub CI `SUCCESS`, run 30825828689 |
| independent input | meta master `52e0392`, `phase-b0-stack-cross-review-r4-2026-08-03.md` | `NO-GO`, 2×P1 + 4×P2 + 4×P3 |

The stack remains #14 → #15 → #16. The reserve host and provider state were
not changed.

## State-space-first disposition

### P1-A — complete run-state/time domain

The base-A1 query no longer uses `finished_ts IS NULL` as an unbounded tail.
A run is in the audited set only when it was scheduled inside the interval, it
finished inside the interval, or its unfinished grace interval crosses the
start. Therefore an old terminal `missed` projection with NULL `finished_ts`
cannot poison every future audit, while all five statuses that actually
intersect the interval remain visible.

The regression enumerates `succeeded|failed|missed|scheduled|started` twice:
once thirty days before the anchor (all wholly historical rows are excluded),
and once across the start boundary (only `succeeded` is accepted). The prior
in-window, pre-grace nonterminal case remains fail-closed. The refusal text now
says “covered by the acceptance interval”, not “scheduled in the window”.

### P1-B — all five lease statuses and their shapes

The independent root SQLite row parser now recognizes the complete schema:

| Status | Valid stored shape | Effective live lease |
| --- | --- | --- |
| `unclaimed` | NULL holder, NULL expiry | no |
| `claimed` | non-empty holder, safe non-negative integer expiry | only when unexpired and the exact PID is alive |
| `released` | NULL holder, NULL expiry | no |
| `expired` | NULL holder, NULL expiry | no |
| `completed` | retained non-empty holder and integer expiry | no |

Unknown status, odd/non-hex output and every partial combination are the one
typed `root_store_probe_invalid` refusal. A real `/usr/bin/sqlite3` test drives
all five statuses, including the documented `expired` startup residue; a
separate negative matrix covers invalid status/shape combinations. Runner and
root now agree that only `claimed` can be effective.

## Release trust-boundary disposition

### P2-A — no caller-authored dispatcher attestation

Candidate and installer modules no longer have direct CLI blocks. Setting
`P4G_PHASE_B0_DISPATCH_ROOT` and `P4G_PHASE_B0_DISPATCH_COMMIT` has no effect:
direct execution produces neither a receipt nor a privileged operation. The
former `release_dispatch_required` self-attestation and `.dispatch-commit`
marker were removed rather than renamed as security.

The exact streamed dispatcher is now the only supported CLI. Its own
source-embedded runner imports the reviewed library functions and emits the
canonical receipt. A regression supplies both formerly sufficient environment
variables to both modules and requires empty stdout/stderr and no action.

### P2-B — materialized paths are not execution inputs

The shell still materializes raw commit blobs as an inspectable intermediate,
but the embedded runner reads each blob, independently recomputes its Git blob
OID, and retains those verified bytes in memory. It rewrites the closed local
import graph to data URLs and imports that in-memory graph. No materialized
path is opened by the ESM loader, so unlink-and-replace after the shell check is
either rejected by the second OID check or irrelevant after bytes are loaded.

The adversarial test waits until the candidate has passed the shell check,
unlinks and replaces it with a valid poison module while the remainder is
being materialized, and requires `release_dispatch_object_mismatch` with no
poison marker. Removing only the in-memory OID comparison makes that test red
and allows the replacement execution path.

### P2-C — exact Node/npm bytes

The dispatcher requires one exact Node v24.18.0 realpath and SHA-256 before
starting the embedded runner. The reviewed candidate then independently checks
its running Node realpath/binary SHA-256 and the deterministic digest of the
complete npm 11.16.0 package tree before every npm operation. It invokes
`npm-cli.js` and TypeScript through the reviewed Node realpath rather than a
PATH-selected `npm` or `node`. The allowlist has two complete tuples: the
Homebrew Intel-macOS production distribution and the exact official
Linux/setup-node 24.18.0 CI distribution. There is no `24.x` wildcard.

The build manifest/receipt now binds `nodeBinarySha256` and
`npmTreeSha256`. A test constructs a complete fixture tool tree, accepts exact
bytes, mutates one npm file, and requires `release_candidate_toolchain`.

### P2-D — no restic selector or injectable reviewed policy

`assertReviewedResticBinary` no longer accepts `reviewedPath` or
`reviewedRelease`; the dangerous trailing spread is gone. It requires the
source-controlled `/usr/local/bin/restic`, exact platform/arch and exact binary
digest. The remote-sync CLI parser no longer accepts `--restic`, both installed
wrappers stopped passing it, and the path is assigned only from the production
constant.

Effectful fake-restic tests load a test copy with exactly the one production
pin call removed; a source assertion requires that call to exist exactly once.
The unmodified production module separately rejects an alternate path even
when given the reviewed digest. Thus test transport substitution is not a
production function parameter or CLI option, and deleting the real call makes
the test file fail before collection.

## P3 closure

1. The inherited-`NODE_OPTIONS` test now starts `/bin/zsh` with the hostile
   parent environment; only the dispatcher child's own `env -i` removes it.
2. The dispatcher is no longer included in or materialized as an unused member
   of its module closure.
3. Vitest has one global setup that builds `dist` before workers. Direct
   `npx vitest run tests/...` cannot silently test stale emitted code, while
   `npm test` remains equivalent and deliberately redundant.
4. The embedded runner is launched by `/usr/bin/env -i` with only fixed
   HOME/PATH/LANG/LC_ALL. The runbook claim is now literal rather than an
   incomplete five-variable blacklist.

## Executed evidence

- Full exact stacked head on the production-platform Mac: **74/74 files,
  503/503 assertions**, zero skips, zero failed tests and zero RPC errors
  (`npm test`, 51.63 seconds). Both exact-head GitHub checks are also terminal
  green; the Linux CI run exercises the separate pinned setup-node tuple.
- Historical-run mutation (`finished_ts IS NULL` unbounded) → red on old
  `missed`: observed total 2 instead of 1.
- Lease-domain mutation (remove `expired`) → red through real sqlite3 with
  `root_store_probe_invalid`.
- Dispatcher mutation (remove second Git-blob OID comparison) → TOCTOU test
  red; strengthened poison contains the valid host import and reaches
  execution without the comparison.
- Restic mutation (remove operation-boundary assertion) → test suite refuses
  collection because the exact single production pin call disappeared.
- Mutation clone and generated test artifacts were removed. Main worktrees
  were clean before publication.

## R5 reviewer request

Please diff only R4 exact heads → heads above, while re-running:

1. the reviewer’s 30-day-old `missed` SQLite probe plus all five statuses at
   both temporal boundaries;
2. all five `trigger_leases` statuses through real sqlite3, including
   `expired(NULL,NULL)` and malformed controls;
3. the former two-env direct-entry bypass against both modules;
4. unlink-and-replace of the materialized entry after the shell OID check;
5. Node/npm byte drift and alternate-restic-path probes;
6. removal mutations for the second OID check and restic operation pin; and
7. direct `npx vitest run ...` from stale/missing `dist`, followed by the full
   exact-head suite and CI.

GO still requires no open P1-P3 and terminal exact-head CI. Even GO makes the
stack only merge-eligible. Merge, immutable build/install, reviewed restic
replacement, `current`, credentials, real non-UTC scheduled B2 cycle, launchd
activation and the 48-hour physical window remain later separate human acts.

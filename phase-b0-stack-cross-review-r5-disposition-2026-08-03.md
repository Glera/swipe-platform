# Phase-B0 R5 disposition and R6 exact-head request

Date: 2026-08-03. Status: R5 `NO-GO` accepted. R5 found no P1 or P2;
all seven reported P3 evidence gaps are dispositioned below and resubmitted
for independent diff-only R6. This document is evidence, not a GO verdict and
not authority to merge, install, replace restic, switch `current`, read or
issue credentials, touch B2, load launchd, start a process or acceptance
window, reboot, or enable an agent contour.

## Exact heads

| Item | Exact identity | State |
| --- | --- | --- |
| prerequisite remote-sync follow-up | swipe-agents PR #14 `f798e11185850ebbb5e6842b2cdaad22640b126c` | unchanged; independently GO in R2 |
| release boundary | swipe-agents PR #15 `499f0fc5528da3b8756a1a87d7310ed04425fb03` | GitHub CI `SUCCESS`, run 30842372221 |
| bounded acceptance integration | swipe-agents PR #16 `2030368cc37fe73aead2c7ef8b99d4219a1694e5` | rebased on the exact PR #15 head; GitHub CI `SUCCESS`, run 30842373339 |
| independent input | meta master `7788bf4`, `phase-b0-stack-cross-review-r5-2026-08-03.md` | `NO-GO`, 0×P1 + 0×P2 + 7×P3 |

The stack remains #14 → #15 → #16. The reserve host and provider state were
not changed.

## P3 disposition

### 1. Formerly inert audit and lease conditions

The focused acceptance regressions now make every reported mutation visible:

- `claimed|holder|-1` must produce `root_store_probe_invalid`;
- odd-length status and holder hex must produce the same typed refusal;
- a `started` run scheduled inside the window with the anomalous
  `grace_deadline_ts < scheduled_ts` shape must remain in the audit and fail
  completion; and
- literal `total` and `unknown` database statuses both count as unknown while
  the aggregate `total` is incremented exactly once per row.

The last fixture catches removal of the `total`/`unknown` reserved-name
filter through both the aggregate and unknown counters.

### 2. Five-state lease coverage is unconditional

The pure exported parser is now driven unconditionally through all five valid
schema states using exact SQLite hex-row fixtures. `claimed` includes the
zero-expiry boundary; `completed` retains holder/expiry; and
`unclaimed|released|expired` require both nullable fields empty. This test has
no uid or sqlite dependency. The real `/usr/bin/sqlite3` integration remains
as an additional environment-gated wrapper cross-check, not the source of
state-space completeness.

### 3. Dispatcher object-read failure is typed and cleans up

`git cat-file blob` is now guarded by an explicit
`release_dispatch_object_read` refusal. The refusal runs through the armed
EXIT trap. A regression commits a tree at the final closure path, executes the
real committed dispatcher, requires the typed event, and proves that no new
`/tmp/p4g-phase-b0-release-dispatch.*` root remains.

### 4. The declared build is bound to the executed compiler step

Candidate construction reads the committed `package.json` before dependency
or compiler execution and requires `scripts.build` to equal exactly
`tsc -p tsconfig.json`. The exact string is written into the new
`agents.phase-b0-release-build-manifest.v2`; therefore the manifest digest
binds the declared build to the direct reviewed compiler invocation. Missing
or extended scripts are typed `release_candidate_build_script` refusals.

### 5. Remote-sync fixture claim is narrowed and production CLI is enumerated

The fixture comment no longer claims that its assertion-stripped copy proves
the production CLI boundary. A new test imports the unmodified production
module, parses every supported command shape, and requires the fixed
`/usr/local/bin/restic` path for each; it also proves `--restic` is rejected.
The existing unmodified-module test still proves that a byte-identical fake at
an alternate path is refused. Effectful fake-restic tests claim only the
behavior they actually exercise after that independent boundary proof.

### 6. Toolchain measurements have no caller-authored reviewed standard

`assertReviewedToolchainBytes` is now nullary. It measures the running Node
binary and complete npm tree and compares only with source-controlled exact
tuples. The former `reviewed*` arguments no longer exist.

Fixture tests use a separate measurement-only `inspectToolchainBytes` helper;
it cannot authorize a build. `validateToolchainPolicy` now validates only the
runtime metadata domain (platform, architecture, Node version/ABI and npm
version) instead of presenting digest constants already proven by the
nullary byte assertion as a second live check. The exact-host double-candidate
test exercises the nullary production path.

### 7. Node/npm pin claim and re-pin procedure are honest

The runbook now states that Node/npm byte pins are anti-drift and
reproducibility controls, not an anti-substitution boundary against the
operator account that owns the Homebrew Cellar and its parents. Any Homebrew
realpath or byte drift is a stop condition. Re-pinning requires inspection of
the replacement bytes, updates to both exact platform tuples, reverse-mutation
and full exact-host suites, a new independent no-P1-P3 review, and only then a
new immutable release. There is no automatic or attended shortcut.

## Executed evidence

- Exact stacked head on the production-platform Mac: **74/74 files,
  508/508 assertions**, zero skips, zero failures and zero RPC errors
  (`npm test`, 86.10 seconds).
- Focused release-candidate suite: **10/10**, including the real double build,
  typed tree-as-blob failure and build-script boundary.
- Focused acceptance plus remote-sync suites: **53/53**.
- GitHub exact-head CI is terminal green for both PR #15 and PR #16 at the
  identities above.

The full suite is intentionally reproducible only on the exact pinned reserve
Mac toolchain and exact pinned GitHub setup-node runner. A third host with a
different Node/npm distribution is expected to fail closed. This is an
accepted determinism constraint, not a claim of universal green portability.

## R6 reviewer request

Please diff only the R5 exact heads → heads above and re-run:

1. the four mutations named in disposition item 1;
2. all five lease states through the unconditional pure parser test, including
   root/no-sqlite environments, plus the optional real-sqlite cross-check;
3. a tree object at the final dispatcher closure path, checking both typed
   stderr and absence of a leaked dispatch root;
4. missing and extended `scripts.build` values and manifest binding on a real
   candidate;
5. every production `parseArgs` command plus alternate `--restic` and
   alternate-path identity probes;
6. an attempted caller-supplied toolchain standard and Node/npm byte drift;
   and
7. direct focused tests, the full exact-host suite, and exact-head CI.

GO still requires no open P1-P3 and terminal exact-head CI. Even GO makes the
stack only merge-eligible. Merge sequencing, immutable build/install, reviewed
restic replacement, `current`, credentials, the real non-UTC B2 cycle,
launchd activation and the 48-hour physical window remain later separate
human acts.

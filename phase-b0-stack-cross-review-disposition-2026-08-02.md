# Phase-B0 stack cross-review disposition

Date: 2026-08-02. Status: fixed and resubmitted for independent exact-head
review. This document is evidence only. It grants no merge, install, release
switch, credential, launchd, process-kill, reboot, rollback or runtime
authority.

## Exact resubmission inputs

| Item | Exact identity | Verification state |
| --- | --- | --- |
| remote-sync follow-up | swipe-agents PR #14 `f798e11185850ebbb5e6842b2cdaad22640b126c` | CI `SUCCESS` |
| reproducible release pipeline | swipe-agents PR #15 `9f457710ad47e22010795db98c5bef7560e7a6ed` | exact-head CI `SUCCESS` ([run 30763862600](https://github.com/Glera/swipe-agents/actions/runs/30763862600)) |
| bounded acceptance tooling | swipe-agents PR #16 `c03a840c4dae66d1b932a457e02cfef971ff7862` | exact-head CI `SUCCESS` ([run 30763970257](https://github.com/Glera/swipe-agents/actions/runs/30763970257)) |
| original independent verdict | `phase-b0-stack-cross-review-2026-08-02.md` at meta master `f4db7ad` | `NO-GO`, 2 P1 plus P2/P3 |
| corrected evidence packet | p4g-workspace-meta PR #52 at the head containing this document | exact-head meta CI and repeat independent review required |

The branches remain stacked in the same order: #14 -> #15 -> #16. No live
host, B2 repository, credential, `current` link, launchd job or process was
changed by this fix round.

## P1 dispositions

### P1-A: local Git administration poisoned `git archive`

Fixed in PR #15. The release builder no longer calls `git archive`. It walks
the reviewed commit/tree/blob object graph with `/usr/bin/git cat-file`,
recomputes the SHA-1 object identity over every raw object, validates the exact
tree modes and paths, rejects gitlinks, unsafe paths and escaping symlinks, and
materializes the reviewed raw blob bytes. Local `.git/config`,
`.git/info/attributes`, export rules, smudge filters, replace refs and checkout
bytes are not build inputs.

The adversarial regression creates a disposable repository, adds
`export-ignore` in `.git/info/attributes` and a local executable smudge filter,
then requires both tracked files and their original bytes in the candidate and
requires that the filter never execute. The two-build test also checks equal
source-tree, build-manifest, toolchain, native-artifact and frozen release-tree
identities.

### P1-B: host wall clock could compress 48 hours

Fixed in PR #16. The live Backblaze B2 probe now requires a valid HTTPS
response `Date` header and emits `agents.phase-b0-b2-provider-probe.v2` with
`providerObservedAt` and exact `clockSkewMs`. The following chain is closed:

- `agents.phase-b0-acceptance-anchor.v2` starts at B2 provider time and binds
  the provider probe, repository digest and enabled macOS network-time state;
- every seed/scheduled backup obtains a fresh live B2 probe before restic or
  retention mutation and binds provider time plus the complete probe digest in
  `agents.phase-b0-remote-backup-receipt.v3`;
- the closing verifier obtains another live B2 probe and accepts only a
  provider-observed duration of 48–72 hours with host/provider skew at most
  five minutes;
- counted receipts are ordered and gap-checked by provider time, while every
  corresponding online restic snapshot must remain close to that observation.

Advancing host time by six hours while provider time advances normally now
fails `provider_clock_skew` before backup mutation; choosing a host end 48
hours ahead while provider time has advanced only minutes fails
`invalid_remote_acceptance_window`. Both attacks are executable regressions.

### P1-C: the builder executed unreviewed worktree bytes

Fixed in PR #15. The builder again requires an empty tracked-worktree status,
including staged changes, before creating a staging directory. It additionally
reads the reviewed commit objects for its complete local execution closure
(`p4g-agent-phase-b0-release-candidate.mjs`, `phase-b0-host.mjs` and
`phase-b0-remote-sync.mjs`) and byte-compares every executing file to that
commit. Release materialization still uses raw verified objects and remains
independent of local Git attributes and filters.

The regression creates a committed builder closure, proves the clean case,
then requires both an unstaged and staged builder patch to fail before build.
Local `.git/info/attributes` remains an allowed non-input and cannot alter the
raw-object candidate.

### P1-D/P1-E: installed wrappers rejected their callers

Fixed in PR #16. `p4g-agent-remote-sync` now accepts the no-argument
`provider-probe` command used by bounded-acceptance bootstrap.
`p4g-agent-phase-b0-acceptance` now validates `rollback-store-state` with
`--observed-at`, separately from `audit --window-end`; its usage contract also
names the command.

The new integration test executes 20 production argv forms through the actual
zsh wrappers and requires every valid form to pass parsing and reach its
authority/origin gate. Negative controls retain exit 2 for an extra
`provider-probe` argument and the former invalid
`rollback-store-state --window-end` form. Ubuntu CI installs zsh explicitly,
so this test cannot silently collapse back to substring inspection.

## P2 dispositions

| Finding | Disposition |
| --- | --- |
| P2-A root wrappers inherit hostile PATH | PR #14 pins `/usr/bin:/bin:/usr/sbin:/sbin` in every root authority wrapper, including the acceptance wrapper added by #16. A hostile-PATH regression places a failing `git` first and proves the system binary is used. |
| P2-B unpinned native install script | PR #15 runs `npm ci --ignore-scripts`, fetches only the reviewed platform/ABI `better-sqlite3` archive over HTTPS with a source-controlled SHA-256 allowlist, validates exact archive shape, then builds/prunes with lifecycle scripts disabled. The installed native module is executed against an in-memory SQLite DB. |
| P2-C `releases/` mode depends on umask | The installer explicitly `chmod 0755` after creation. The executing regression starts under `umask 077` and proves traversal remains available to the non-admin runtime identity. |
| P2-D no toolchain/platform identity | Candidate schema v2 binds platform, architecture, Node version, Node ABI, npm version, native archive URL/digest and build-manifest digest; only Node 24 / ABI 137 / npm 11 and reviewed platform tuples are accepted. |
| P2-E apply and switch in one act | Argument validation rejects simultaneous `--apply-release` and `--switch-current`; the tests and runbook preserve two separate authority acts. |
| P2-F capture reservation leaks | The physical publisher records the reservation inode and removes only that exact inode in `finally` on ordinary refusal, including pre-mutation failures. A process crash can still leave a marker intentionally; it fails closed and requires attended archive/disposition rather than automatic unsafe reclaim. The failure/retry lifecycle is executed by tests. |
| P2-G dead-man local file claimed provider authority | Claim narrowed honestly. `agents.phase-b0-deadman-window-evidence.v2` is explicitly `operator_attested_external_provider_ui`; it requires an operator inspection flag/time and a separate root publication act. It is documented as a human gate, not a provider signature or machine-verifiable security boundary. An agent-authored file alone has no root publication authority. |
| P2-H root loads runner-selected native addon/store | Root now asks the installed wrapper to execute `rollback-store-state` as non-admin `p4g_runner`. That helper re-hashes the exact anchored immutable release before loading its native module and reads the store without privilege. Root accepts only a typed receipt bound to anchor/release/tree/observation. |
| P2-I effectful layer untested | Tests execute all eight named live wiring surfaces: start, audit, publish, physical capture, complete, rollback, runtime restart and cold-boot verification, with injected host boundaries plus negative paths. In addition, all 20 production CLI argv shapes now execute through the real zsh wrappers in CI; pure validators remain separately covered. |
| P2-J repeat bootstrap mutates before known refusal | `control bootstrap` checks for an existing regular or symlink anchor before arming the trap or issuing any launchctl/install mutation. Source-order regression requires the guard before the first mutating statement. |

## P3 dispositions

### PR #14

Log rotation is performed inside the verified launchd callback before any B2
or backup mutation. A rotation refusal therefore produces no successful
snapshot and cannot turn one completed backup into an endless five-minute
series of additional full backups. Successful backup completion is no longer
rewritten to failure by post-success rotation.

### PR #15

- runner lookup has a fixed root environment and absolute `/usr/bin/id`;
- CLI catches preserve typed `ReleaseCandidateError`/`ReleaseInstallError`
  codes rather than collapsing them to `unexpected`;
- failed copy/rename paths remove only their own staging tree;
- rollback failure removes only the exact symlink installed by that invocation
  and emits a composite typed failure preserving primary and rollback codes;
- runtime-root safety is checked even in no-write mode;
- `cpSync` uses `force:false,errorOnExist:true`, and any staged difference is
  reported at the first exact path;
- builder umask is pinned and the first complete build is exercised under
  hostile `umask 0111`;
- the Git attribute/filter channel is eliminated by raw object
  materialization (and `GIT_ATTR_NOSYSTEM=1` remains defense in depth);
- production candidates remove dev dependencies, tests, `.github`, docs,
  host/source TypeScript trees and build-only configuration;
- unused `SOURCE_DATE_EPOCH` dependence was removed;
- negative tests cover inconclusive launchctl, rollback conflict, tampered
  candidates, dirty/inexact installer source and unsafe roots.

### PR #16

- a missing root evidence file now produces typed `missing_<label>`;
- rollback release identity is obtained from a full immutable-tree inspection,
  not a path regex;
- atomic publication uses an unguessable temp and deletes it only when its
  dev/inode still match the file created by that invocation;
- the physical-capture reservation keeps its original file descriptor open
  through the drill, so an unlink-and-replace cannot reuse that inode and be
  mistaken for the reservation during cleanup;
- base-A1 audits include only runs whose grace deadline has matured by the
  chosen end, avoiding a false failure for a currently valid in-flight run;
- the root acceptance wrapper uses the fixed system PATH;
- dead-man, provider-time, reservation, bootstrap-order and every effectful
  control seam have explicit negative coverage.

## Verification receipts

- PR #14 focused tests: 45/45; exact-head GitHub CI `SUCCESS`.
- PR #15 exact-head GitHub CI: 73 files, 465 passed and two documented
  macOS-only skips out of 467; the four release-candidate tests, including the
  executable two-build and dirty-builder regressions, ran and passed.
- PR #16 focused host/acceptance suites on macOS: 53/53.
- PR #16 exact-head GitHub CI: 74 files, 492 passed and the same two
  macOS-only skips out of 494; the real-wrapper argv regression ran and
  passed. A local serial run completed all 494 assertions but ended non-zero
  on a Vitest worker RPC timeout after the 70-second two-build test, so it is
  explicitly not claimed as a PASS receipt.
- TypeScript build, Node syntax, zsh syntax and `git diff --check`: pass.
- Meta #52 exact-head CI must be green before the repeat reviewer may issue
  GO; implementation CI cannot substitute for independent review.

## Repeat-review focus

The independent reviewer should re-run, not merely inspect:

1. the `.git/info/attributes` export-ignore plus executable-smudge attack and
   verify the filter is never invoked;
2. the host-time compression attack, including eight otherwise-valid
   launchd receipts with less than 48 hours of B2 server elapsed time;
3. capture refusal before mutation followed by a clean retry, plus preservation
   of a foreign replacement reservation inode;
4. root PATH poisoning, apply+switch rejection, hostile umasks and native
   module execution;
5. the effectful start/publish/capture/complete/rollback/restart/cold-boot
   wiring and typed missing-evidence failures;
6. the narrowed dead-man statement: accept it only as an explicit operator
   attestation gate, never as cryptographic provider proof.

The required verdict remains GO only with no open P1–P3. Even GO will be review
evidence, not authority: merge, build/install, `current` switch, credentials,
activation, launchd and the physical 48-hour window remain separate later
operator decisions.

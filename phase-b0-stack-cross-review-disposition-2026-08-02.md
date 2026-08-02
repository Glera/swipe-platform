# Phase-B0 stack cross-review disposition

Date: 2026-08-02. Status: fixed and resubmitted for independent exact-head
review. This document is evidence only. It grants no merge, install, release
switch, credential, launchd, process-kill, reboot, rollback or runtime
authority.

## Exact resubmission inputs

| Item | Exact identity | Verification state |
| --- | --- | --- |
| remote-sync follow-up | swipe-agents PR #14 `f798e11185850ebbb5e6842b2cdaad22640b126c` | CI `SUCCESS` |
| reproducible release pipeline | swipe-agents PR #15 `8db31845272258611a7b6fa8df17725943169b91` | exact-head CI `SUCCESS` ([run 30764629683](https://github.com/Glera/swipe-agents/actions/runs/30764629683)) |
| bounded acceptance tooling | swipe-agents PR #16 `6ce1ca618f842fe81ae0ce844f760df2b25ea1fe` | local 74/74 files and 498/498 assertions; exact-head CI `SUCCESS` ([run 30766214538](https://github.com/Glera/swipe-agents/actions/runs/30766214538)); repeat review required |
| original independent verdict | `phase-b0-stack-cross-review-2026-08-02.md` at meta master `f4db7ad` | `NO-GO`, 2 P1 plus P2/P3 |
| second independent verdict | `phase-b0-stack-cross-review-r2-2026-08-02.md` at meta master `458c5e2` | `NO-GO`, 3 P1 plus enumerated P2 |
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

- `agents.phase-b0-acceptance-anchor.v3` starts at B2 provider time plus a
  fixed ten-minute warm-up and binds the provider probe, repository digest and
  enabled macOS network-time state; all external preflight completes before
  launchd mutation and the launchd snapshot must precede that future start;
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

The new integration test executes 21 production argv forms through the actual
zsh wrappers and requires every valid form to pass parsing and reach its
authority/origin gate. Negative controls retain exit 2 for an extra
`provider-probe` argument and the former invalid
`rollback-store-state --window-end` form. Ubuntu CI installs zsh explicitly,
so this test cannot silently collapse back to substring inspection.

### P1-F: version text did not authenticate the credential-bearing restic binary

Found by the owner-side requirement audit after the R2 resubmission and fixed
in the final integration branch PR #16. The production path now accepts only
the reviewed official Intel-macOS restic 0.19.1 binary with SHA-256
`b2b553b402b9971b0c3f673d880397a421526f55a08f21fe5b82b5dd9e049a08`.
The reviewed compressed release asset is
`restic_0.19.1_darwin_amd64.bz2`, SHA-256
`c38d579622cf602f665234c5a8c315030b6cf70656028fe6dc29a786b60e5f35`,
from the source-controlled official GitHub release URL. Runtime hashes the
opened executable before every version check and operation, still requires
root ownership, no symlink and exact mode `0555`, and refuses a wrong platform
or digest as `unreviewed_restic_binary` before credentials reach a subprocess.
The runbook makes download, archive verification, decompression, binary
verification and root install separate explicit steps and refuses implicit
replacement.

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
| P2-H root loads runner-selected native addon/store | The installed wrapper still produces the typed store-state receipt as non-admin `p4g_runner` after re-hashing the anchored release. Root additionally invokes only `/usr/bin/sqlite3 -readonly` against the realpath-constrained, runner-owned mode-0600 `store-*/authority.sqlite` and independently derives the effective runtime lease. The two results must agree; root loads no runner-selected native addon. |
| P2-I effectful layer untested | Tests execute the named live wiring surfaces with negative paths. In addition, all 21 production CLI argv shapes execute through the real zsh wrappers in CI, including the two-phase acceptance start and rollback store probe; malformed controls must stop at wrapper usage. Pure validators remain separately covered. |
| P2-J late bootstrap refusal after host mutation | `control bootstrap` refuses an existing anchor first, then completes runner preflight, live B2 provider probe, network-time check and activation hashing into a root-private digested `acceptance-start-preflight.v1` before the first launchctl/install mutation. After launchd load, `start --candidate` performs only local receipt/activation/launchd validation and anchor publication. A stale/tampered candidate or late launchd failure remains inside the armed rollback trap. |
| R2 P2: production release retained `dist/tests` | PR #15 prunes `dist/tests` explicitly and the executing two-build regression asserts its absence from the actual frozen release. |
| R2 P2: new release refusal paths lacked coverage | PR #15 exports narrow validation seams and executes negative cases for raw-object digest/tree/mode/path/collision/gitlink/symlink, toolchain and native platform/digest/archive failures. |
| R2 P2: changed release-tree algorithm retained `.v1` domain | The tree digest domain is `agents.phase-b0-release-tree.v2`; candidate/install receipts carry `releaseTreeDigestSchema`, and the incompatible activation contract is bumped to `agents.phase-b0-activation.v2`. |
| R2 P2: an unfinished run before grace vanished from audit | PR #16 selects every run scheduled by the chosen end plus unfinished state crossing the start. Grace may delay a missed event but cannot hide `scheduled`/`started`; a real SQLite regression requires `base_a1_run_state_incomplete`. |
| R2 P2: dead-man review forced a false five-minute timestamp | Validation permits a true operator inspection from window end through +24h, while root publication separately requires `operatorAttestedAt` within five minutes of the live publication time. Both the deliberate delay and stale-publication refusal are tested. |

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
  host/source TypeScript trees, compiled `dist/tests` and build-only
  configuration;
- release-tree digest semantics and activation schema are versioned `.v2`;
- raw Git, toolchain and native-artifact refusal codes have executable
  negative coverage rather than substring-only assertions;
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
- base-A1 audits include every run scheduled by the chosen end and every
  unfinished run crossing the start, so grace cannot launder an in-flight
  failure; the operator chooses an end after the final run is terminal;
- the root acceptance wrapper uses the fixed system PATH;
- rollback compares the runner receipt to an independent root system-SQLite
  lease probe;
- dead-man review has a 24-hour human window but a five-minute live-publication
  bound;
- external start checks complete before launchd mutation and feed a closed,
  digested candidate into the post-load anchor;
- the production restic execution boundary pins the reviewed official
  Intel-macOS binary digest instead of trusting executable version text;
- dead-man, provider-time, reservation, bootstrap-order and every effectful
  control seam have explicit negative coverage.

## Verification receipts

- PR #14 focused tests: 45/45; exact-head GitHub CI `SUCCESS`.
- PR #15 exact-head GitHub CI run 30764629683: `SUCCESS`; the actual frozen
  candidate excludes `dist/tests`, all refusal families execute, and the
  release-tree/activation schema v2 path passes.
- PR #16 final integration head local serial run: 74/74 files, 498/498 assertions; the
  executable two-build regression, 21-form real-wrapper regression, real
  SQLite CLI lease probe, two-phase start tests and production restic-digest
  allowlist regression all ran. Exact-head CI run 30766214538 is `SUCCESS`.
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
7. actual candidate inventory (`dist/tests` absent), every new release refusal
   family, and the `.v2` release-tree/activation bindings;
8. an unfinished pre-grace run, runner/root lease disagreement, delayed honest
   dead-man inspection versus stale publication, and B2/network-time refusal
   before the first launchd mutation.
9. a fake executable that prints the correct restic version but has different
   bytes, plus platform substitution; neither may reach a credential-bearing
   subprocess.

The required verdict remains GO only with no open P1–P3. Even GO will be review
evidence, not authority: merge, build/install, `current` switch, credentials,
activation, launchd and the physical 48-hour window remain separate later
operator decisions.

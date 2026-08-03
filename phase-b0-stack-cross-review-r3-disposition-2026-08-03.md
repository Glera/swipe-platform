# Phase-B0 stack cross-review R3 disposition

Date: 2026-08-03. Status: fixed and resubmitted for one more independent
exact-head review. This is evidence, not a GO verdict and not authority to
merge, install, switch `current`, issue/read credentials, load launchd jobs,
start the 48-hour window, reboot, kill a process, or enable any agent contour.

## Exact resubmission

| Item | Exact identity | State |
| --- | --- | --- |
| prerequisite remote-sync follow-up | swipe-agents PR #14 `f798e11185850ebbb5e6842b2cdaad22640b126c` | independently GO in R2; unchanged |
| reproducible release boundary | swipe-agents PR #15 `a780898f9cb024fbcba8981aedd0300291c33064` | GitHub CI `SUCCESS`, run 30816864575 |
| bounded acceptance integration | swipe-agents PR #16 `df0f22ee5d3b792297b8183926b7955d6bca10c7` | local exact-head 74/74 files, 498/498 assertions; GitHub CI `SUCCESS`, run 30816896683 |
| prior R2 disposition | `phase-b0-stack-cross-review-disposition-2026-08-02.md` | superseded where it claimed the old self-check and lease path closed |
| independent R2 report | `phase-b0-stack-cross-review-r2-2026-08-02.md` plus the reviewer's subsequent R3 message | NO-GO input to this round |

The stack remains #14 -> #15 -> #16. No live host file, B2 object, credential,
release link, process, launchd job, receipt, or activation state changed.

## Structural disposition: release code cannot attest itself

The former in-process `assertExactSource` approach is removed from both the
candidate builder and the root installer. The supported release path now starts
with `host/phase-b0/p4g-agent-phase-b0-release-dispatch`, whose bytes are
streamed by absolute system Git directly from the exact reviewed commit and
executed by `/bin/zsh` under `env -i`.

Before any Node import, that dispatcher:

1. proves the requested checkout HEAD equals the exact reviewed commit;
2. creates a private temporary dispatch root;
3. reads the builder, installer and their complete local module closure as raw
   blobs from that commit;
4. recomputes every materialized blob OID and freezes the files mode 0400;
5. removes `NODE_OPTIONS`, `NODE_PATH` and inherited npm configuration; and
6. invokes `/usr/local/bin/node` only on the materialized entrypoint.

The worktree copy is not inspected or executed. This is deliberate: once raw
committed objects are the only input, a clean-worktree security claim would add
a hook/configurable Git-status surface without authenticating anything. The
dispatcher uses no `git archive`, checkout filters, attributes, hooks, install
scripts, PATH-selected binaries, or Node preload hooks. The builder and
installer direct CLI paths require the exact materialized realpath, dispatch
commit and private dispatch marker. The runbook uses the same dispatcher for
candidate dry-runs, installer dry-run and root installer apply; the root form is
`reviewed dispatcher | sudo env -i /bin/zsh -s ...`, not a mutable worktree
module.

The adversarial regression leaves both tracked entrypoints poisoned. It
requires the dispatcher to execute the committed candidate and committed
installer entrypoints, produce their committed identities, and never execute
the poison marker. A malicious inherited `NODE_OPTIONS=--import=...` marker is
also required to remain absent. Thus the exact attack in which a poisoned
module repairs itself during import is impossible: that module is never
imported. The production acceptance additionally builds two complete frozen
release trees through the committed dispatcher and requires byte-identical
toolchain, native artifact, manifest and release-tree receipts.

macOS canonicalizes `/tmp` as `/private/tmp`; direct-entry recognition now
compares realpaths so a valid materialized invocation cannot silently become a
no-op. Dispatcher subprocess tests are asynchronous, preventing Vitest RPC
starvation while the real double build runs.

## Structural disposition: rollback lease is a total typed state

The independent root SQLite parser no longer assumes every row has an expiry.
It accepts exactly two shapes:

- `claimed`: non-empty typed holder plus a safe integer expiry; or
- `released`: empty/NULL holder and empty/NULL expiry.

Every partial combination and every other status is
`root_store_probe_invalid`. A real SQLite regression first proves a live
claimed PID, then an expired claim, then performs the production clean-shutdown
transition to `released, NULL, NULL` and requires `liveRuntimeLease:false`.
This reproduces and closes the reviewer's exact `[72656C6561736564||]` case.

## Restic call-site and diagnostic disposition

The reviewed-binary assertion is now exercised through `resticIdentity`, the
actual operation boundary, not only as an isolated helper. Removing that call
made the named test red with `expected ... unreviewed_restic_binary`.

Diagnostic ordering is stated narrowly. A generic Homebrew restic whose
owner/mode is outside the production contract fails earlier as
`insecure_restic`; this is intended fail-closed behavior. Once the production
path has the required root ownership, regular-file/no-symlink shape and mode
0555, wrong reviewed bytes or platform fail as `unreviewed_restic_binary`
before a credential-bearing subprocess. The packet must not claim the latter
code for an installation that already violates the former boundary.

## Mutation and full-suite evidence

- Replacing the total lease-row regex with the former mandatory-expiry regex
  made the real SQLite clean-shutdown test fail at
  `independent root SQLite lease output is malformed`.
- Deleting the reviewed-restic assertion from `resticIdentity` made its
  call-site regression fail.
- Both mutations were reverted; the working trees were clean before the final
  run.
- Nested `npm run build` calls were removed from four tests. Package scripts
  build once, release dispatcher probes use non-blocking child processes,
  Vitest is bounded to four file workers, the deterministic replay property has
  an explicit 60-second allowance, and the credential-free `restic version`
  probe has a 30-second deadline.
- Final exact stacked head: 74/74 test files and 498/498 assertions passed in
  63.78 seconds, with zero skips, zero failed tests and zero unhandled RPC
  errors. The real double production build passed through the committed
  dispatcher in 56.12 seconds.

## Required independent R4 checks

The repeat reviewer should execute, not merely read:

1. poison both tracked candidate/installer modules with a top-level
   self-restoring payload and prove the payload never executes while the
   committed entries do;
2. inject `NODE_OPTIONS`, local attributes, filters and an escaping symlink;
   none may alter or execute in the candidate;
3. run the installer through the same streamed dispatcher, including the root
   runbook argv in a non-mutating fixture;
4. run the real SQLite `claimed -> released(NULL,NULL)` transition and malformed
   partial-state controls;
5. delete the restic pin call at its operation boundary and require the test
   suite to turn red;
6. run the whole suite with the release acceptance enabled and require no
   skipped tests, RPC errors or shared-`dist` race; and
7. distinguish `insecure_restic` owner/mode refusal from
   `unreviewed_restic_binary` byte/platform refusal in the final wording.

GO still requires no open P1-P3 and terminal exact-head CI. Even an independent
GO only makes the stack merge-eligible. Merge, immutable build/install,
`current` switch, credentials, non-UTC scheduled B2 cycle, launchd activation
and the 48-hour physical acceptance window remain later, separate human acts.

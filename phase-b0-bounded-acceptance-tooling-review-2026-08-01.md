# Phase-B0 bounded acceptance tooling review packet

Date: 2026-08-01. Status: submitted for independent exact-head review. This
packet grants no merge, installation, release switch, credential, launchd,
process-kill, reboot, rollback or runtime authority.

## Exact input

| Item | Identity |
| --- | --- |
| remote-sync follow-up | swipe-agents PR #14 at `27791e0f1c23457f5746160ca752a3537149265b` |
| reproducible release pipeline | stacked swipe-agents PR #15 at `437cbde242f348dd72abe9386291707ea9a6f3fa` |
| bounded acceptance tooling | stacked [swipe-agents PR #16](https://github.com/Glera/swipe-agents/pull/16) at `69143208950a372cd115a33695567bccf25a36ef` |
| completion contract | `phase-b0-bounded-acceptance-matrix-2026-08-01.md` |

## Closure model

PR #16 makes the remote `verify-window` receipt necessary but insufficient.
One root-owned bootstrap anchor binds the exact policy, immutable release
tree, activation, remote attestation, dead-man URL digest, native boot identity
and all three launchd jobs. Every later receipt must bind that anchor and the
same 48-to-72-hour interval.

The source-controlled contour provides:

1. bootstrap-integrated anchor publication. All three labels and a fresh
   runner preflight must pass. The launchd PID is the Node runtime PID and its
   exact process-scoped `caffeinate -is` child is also required. Anchor failure
   remains inside the bootstrap rollback trap;
2. a read-only base-A1 SQLite interval audit: no failed or missed run, no
   unresolved delivery, no duplicate provider message identity, SQLite
   integrity `ok`, and one live supervised runtime lease;
3. a destructive restart drill that kills only the anchored supervised PID,
   observes a launchd retry while the old lease remains fenced, then accepts a
   replacement only after expiry and lease-epoch advance;
4. cold-boot verification requiring a changed native boot identity, a new
   scheduled+launchd remote backup after the boot time, one matching runtime
   lease and a real external dead-man ping;
5. exact validators for provider-side dead-man interval evidence and complete
   operator incident dispositions. A local ping alone cannot substitute for
   the provider observation digest, and `false_incident` fails closure;
6. emergency-safe disable. It always makes the runtime inert; when an anchor
   and end audit exist it additionally publishes a rollback receipt proving
   `enabled:false`, all labels unloaded, zero matching processes, no live
   runtime lease and no remote deletion;
7. a root-owned final aggregate that requires the anchor, A1 audit, online B2
   window, restart, reboot, dead-man, incident and rollback receipts to agree
   byte-for-byte on all shared identities.

No command in this PR is executed by merge or install. `restart-drill`, reboot
and rollback remain future explicit physical authority acts.

## Verification

- Targeted host and acceptance tests: 37/37.
- Full local repository suite: 476/476 across 74 files.
- The full run includes the executable two-build immutable-release and
  install/current-separation regression inherited from PR #15.
- Node syntax, zsh syntax and `git diff --check`: pass.
- CI run for the exact PR #16 head is the authoritative remote gate; record its
  terminal identity in the PR after completion.
- No reserve-host path, `current`, secret, launchd label, process or OS state
  was read or changed to produce this packet. The only process experiment was
  an isolated five-second local `caffeinate /bin/sleep` observation under the
  development account, used to verify the macOS parent/child process model.

## Required adversarial review axes

The independent reviewer should attempt at least:

1. backdate, overwrite or cross-bind an anchor; substitute a different
   activation, policy, tree, attestation, boot or launchd snapshot;
2. confuse the launchd Node PID with its `caffeinate` child, add a second child,
   or bind the runtime lease to either the wrong PID or wrong epoch;
3. make a pre-expiry restart look like a valid takeover, hide overlap, reuse
   the old PID, or leave `send_started`/`outcome_unknown` or duplicate provider
   identities;
4. forge a reboot without changing native boot identity, reuse a pre-boot B2
   receipt, substitute an attended backup, or satisfy recovery with a local
   heartbeat instead of the external dead-man;
5. choose unrelated start/end timestamps for the B2 and A1 receipts, omit an
   incident disposition, classify a false incident as acceptable, or reuse a
   receipt from another release;
6. disable only part of the contour, leave a matching process/live lease,
   claim deletion of remote data, or let emergency disable depend on the
   presence of acceptance evidence;
7. exploit symlink, owner/mode, parent-path, partial-write, concurrent
   publication or stale-candidate races in the root evidence set;
8. complete from the remote verifier alone or complete before rollback.

## Remaining gates

1. independent GO with no open P1-P3 for PRs #14, #15, #16 and the exact meta
   evidence head;
2. a new operator merge decision naming all reviewed heads and their order;
3. reproducible post-merge build twice;
4. separate permissions for release install, host-bundle replacement,
   `current`, credentials/evidence, activation, the remote-sync-only physical
   gate, full bootstrap, restart drill, reboot and rollback;
5. the actual bounded interval and final receipt audit.

Nothing in this packet authorizes any one of those acts.

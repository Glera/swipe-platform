# Phase-B0 bounded acceptance tooling review packet

Date: 2026-08-01. Status: submitted for independent exact-head review. This
packet grants no merge, installation, release switch, credential, launchd,
process-kill, reboot, rollback or runtime authority.

## Exact input

| Item | Identity |
| --- | --- |
| remote-sync follow-up | swipe-agents PR #14 at `f798e11185850ebbb5e6842b2cdaad22640b126c` |
| reproducible release pipeline | stacked swipe-agents PR #15 at `e5c31b07f324309d1eb1d8393966468e455fb7e4` |
| bounded acceptance tooling | stacked [swipe-agents PR #16](https://github.com/Glera/swipe-agents/pull/16) at `b355af9af36929ed419ab487b21bae12af3303be` |
| completion contract | `phase-b0-bounded-acceptance-matrix-2026-08-01.md` |

## Closure model

PR #16 makes the remote `verify-window` receipt necessary but insufficient.
One root-owned bootstrap anchor binds the exact policy, immutable release
tree, activation, remote attestation, dead-man URL digest, native boot identity,
B2 HTTPS server-time observation, enabled macOS network-time state and all
three launchd jobs. Every later receipt must bind that anchor and the same
48-to-72-hour provider-observed interval.

The source-controlled contour provides:

1. bootstrap-integrated anchor publication. All three labels and a fresh
   runner preflight must pass. The launchd PID is the Node runtime PID and its
   exact process-scoped `caffeinate -i -s` child is also required; the parsed
   child command must name the same immutable release as preflight. Anchor
   failure remains inside the bootstrap rollback trap;
2. a read-only base-A1 SQLite interval audit whose end is already past: every
   run whose grace deadline matured in-window or whose unfinished state still
   overlaps the start boundary is terminal `succeeded`; a run still inside its
   configured grace is excluded until mature. There is no
   failed/missed event, queued/unsettled/failed delivery, duplicate provider
   identity or SQLite error; and the live lease PID equals the launchd PID;
3. a destructive restart drill that kills only the anchored supervised PID,
   observes a launchd retry while the old lease remains fenced, then accepts a
   replacement only after expiry and lease-epoch advance. Root reserves and
   directly captures the helper output before mutation, so a duplicate or
   concurrent capture cannot cause another kill and a handwritten physical
   receipt is not accepted;
4. cold-boot verification requiring a changed native boot identity, both the
   launchd backup invocation and remote snapshot after boot, invocation within
   thirty minutes rather than a later six-hour slot, one matching runtime lease
   and a real external dead-man ping;
5. exact validators for an explicitly operator-attested external dead-man UI
   observation and complete operator incident dispositions. The receipt is a
   human publication gate, not a provider signature or machine-verifiable
   security boundary; it requires first/last heartbeat coverage, a bounded
   observation count and no gap over fifteen minutes. Every incident must
   close inside the window; `false_incident` fails,
   host-idle tolerance is limited to stored `network`/`network_down` evidence,
   every disposition is time-bounded, and incident signals already active at
   bootstrap cannot disappear from the interval;
6. emergency-safe disable. It always makes the runtime inert; when an anchor
   and end audit exist it additionally publishes a rollback receipt proving
   `enabled:false`, all labels unloaded, zero matching processes, no effective
   runtime lease holder and no remote deletion. An unexpired SQLite claim is
   effective only while its exact `supervised-runtime:<pid>` holder is alive;
   malformed or inconclusive identity fails closed, while an already-dead
   holder does not force a five-minute rollback delay. SQLite/native inspection
   runs as non-admin `p4g_runner` only after re-hashing the anchored immutable
   release; root does not load a runner-selected native addon. The publisher then
   re-runs the online B2 verifier and binds its exact accepted-window digest;
   rollback/completion timestamps must be contemporaneous with the live host;
7. a root-owned final aggregate that requires the anchor, A1 audit, online B2
   window, restart, reboot, dead-man, incident and rollback receipts to agree
   byte-for-byte on all shared identities. Restart and reboot evidence must be
   produced no later than the selected A1 audit end, so a later healthy host
   state cannot repair a failed interval retrospectively.
8. one root-only publisher for every pre-rollback artifact. It accepts only a
   private single-link candidate under the runner home, re-runs the A1 audit and
   online B2 verifier, validates human evidence, and atomically publishes with
   hard-link no-replace plus file/directory fsync. Concurrent replacement and
   ordinary `install` overwrite are no longer evidence paths.

No command in this PR is executed by merge or install. `restart-drill`, reboot
and rollback remain future explicit physical authority acts.

## Verification

- Focused acceptance and remote-sync tests: 45/45.
- Full local repository suite: 492/492 across 74 files in a clean serial run.
- The full run includes the executable two-build immutable-release and
  install/current-separation regression inherited from PR #15.
- Node syntax, zsh syntax and `git diff --check`: pass.
- Exact-head CI for PR #16 is required on
  `b355af9af36929ed419ab487b21bae12af3303be`; its final result is recorded in
  the cross-review disposition rather than inherited from the superseded head.
- Meta evidence suite: 135/135 locally; the exact PR #52 CI identity is recorded
  after this packet commit is pushed.
- No reserve-host path, `current`, secret, launchd label, process or OS state
  was read or changed to produce this packet. The only process experiment was
  an isolated five-second local `caffeinate /bin/sleep` observation under the
  development account, used to verify the macOS parent/child process model.

## Required adversarial review axes

The independent reviewer should attempt at least:

1. backdate, overwrite or cross-bind an anchor; substitute a different
   activation, policy, tree, attestation, boot or launchd snapshot;
2. confuse the launchd Node PID with its `caffeinate` child, use the combined
   `-is` spelling instead of the production `-i -s` argv, substitute another
   release in the helper command, add a second child, or bind the runtime lease
   to either the wrong PID or wrong epoch;
3. make a pre-expiry restart look like a valid takeover, hide overlap, reuse
   the old PID, invoke two destructive captures, handwrite the receipt, or leave
   queued/failed/unsettled delivery state or duplicate provider identities;
4. forge a reboot without changing native boot identity, reuse a pre-boot B2
   receipt, substitute an attended or later six-hour backup, or satisfy recovery
   with a local heartbeat instead of the external dead-man;
5. choose a future or unrelated end, hide a nonterminal run or incident that
   overlaps the start boundary, mismatch the lease PID, omit an incident
   disposition, leave an incident open, apply the
   host-idle exception to another detector/class, or reuse another release;
6. satisfy dead-man coverage with only endpoint observations, sparse pings or
   one late success; place a restart/reboot receipt after the audited end or an
   incident decision outside its bounded review period;
7. disable only part of the contour, leave a matching process/live lease,
   delete an accepted B2 snapshot after the pre-rollback verifier, launder a
   future rollback/completion time, or let emergency disable depend on the
   presence of acceptance evidence;
8. exploit symlink, owner/mode, parent-path, partial-write, concurrent
   publication or stale-candidate races in the root evidence set;
9. complete from the remote verifier alone or complete before rollback.

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

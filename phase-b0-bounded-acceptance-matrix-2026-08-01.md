# Phase-B0 bounded unattended acceptance matrix

Date: 2026-08-01. Status: pre-execution completion contract. This document
does not authorize merge, installation, a `current` switch, credential access,
evidence publication, `launchctl` mutation, reboot, process termination,
Telegram delivery, or runtime enablement.

## Purpose

Phase-B0 is not complete merely because the remote-backup
`verify-window` command passes. That command proves the independent B2 backup
boundary. The goal also requires evidence for the exact release, base-A1
health and leases, launchd restart/takeover, cold boot, external dead-man and
rollback. A final PASS is valid only when every mandatory row below has a
content-addressed or otherwise independently anchored receipt and no row is
open.

The seven-day attended quiet week remains valid evidence for the Phase-A A1
logic. It is not substituted for the new Phase-B0 launchd, remote-sync or
power-boundary evidence.

## Exact pre-review input

| Item | Exact identity | Current gate |
| --- | --- | --- |
| remote-sync follow-up | swipe-agents PR #14 at `f798e11185850ebbb5e6842b2cdaad22640b126c` | cross-review findings fixed; repeat exact-head review pending |
| reproducible release pipeline | swipe-agents PR #15 at `e5c31b07f324309d1eb1d8393966468e455fb7e4` | cross-review findings fixed; repeat exact-head review pending |
| evidence packet | p4g-workspace-meta PR #52; this matrix becomes part of its next exact head | independent exact-head review pending |
| superseded pre-fix candidate identity | `checkedPaths=3001`, `releaseTreeDigest=054c836102a19aa0232990c05315610590da1cda9021f1b2a44a0d8ac9b9df02` | historical evidence only; explicitly not install authority |

The final merged commit and release-tree digest will necessarily differ from
the pre-merge candidate above and must be reproduced twice after the reviewed
merge. No pre-review digest may be reused as post-merge authority.

## Mandatory evidence matrix

| Stage | Required proof | Accepted evidence and fail condition | State before human gates |
| --- | --- | --- | --- |
| Independent review | No open P1-P3 on all exact inputs | Reviewer verdict names every exact head. Any unreviewed head movement resets this row. | pending |
| Merge | Reviewed commits only, in reviewed order | Operator decision names exact heads; GitHub merge receipts are recorded. A bot/session merge without that decision fails the row. | forbidden until review GO and new permission |
| Reproducible release | Final merged source produces identical immutable bytes twice | Two builder receipts have the same final merged commit, `checkedPaths` and `releaseTreeDigest`; no candidate is under the live runtime root. Any mismatch fails. | tooling ready |
| Install without discovery switch | Exact candidate copied while all jobs remain unloaded | Installer receipt says `installed=true,currentSwitched=false`; production scanner passes; `current` and all launchd labels are unchanged. | requires separate permission |
| Discovery switch | `current` points to the reviewed immutable release | Separate installer receipt says `currentSwitched=true`; post-switch scanner reports zero writable paths. Any rollback-holder conflict fails closed. | requires separate permission |
| Independent backup bootstrap | Real encrypted B2 snapshot and exact restore | Attended `init`, `seed-backup`, `restore-drill`; root provider/escrow evidence and remote attestation bind the live private/free-only bucket, exact restic bytes and restored tree. Secrets and bucket identity remain out of evidence/chat. | requires attended credentials and publication gates |
| Non-UTC launchd origin | Production discriminator runs on this Mac | With supervised/dead-man unloaded, one temporary remote-sync LaunchDaemon produces a new `scheduled+launchd` receipt with UTC-Z snapshot time; cleanup evidence proves bootout, disabled label and absent live plist. A shell, PPID-only or attended receipt fails. | source-controlled in reviewed PR #14; physical execution still requires permission |
| Activation and top-up | Exact release is enabled only on fresh remote evidence | Root activation receipt binds final release/tree/policy/attestation/dead-man/boot digests. An attended scheduled-path top-up is fresh and explicitly excluded from the 48-hour count. | requires separate publication acts |
| Bootstrap anchor | All three exact jobs become loaded once | Root bootstrap receipt records the activation digest, release/tree digest, boot identity, B2 HTTPS server time, enabled macOS network-time state and three launchd labels/PIDs. The Node-to-caffeinate child command must use exact `-i -s` argv and the same immutable release as preflight. The anchor must be written immediately after successful bootstrap and before the window is counted. An existing anchor refuses before any launchd mutation. | proposed in PR #16; pending independent exact-head review |
| Independent time | Host wall-clock manipulation cannot compress acceptance | `agents.phase-b0-acceptance-anchor.v2`, every counted backup receipt and the closing B2 probe bind provider-observed HTTPS `Date`; host/provider skew over five minutes refuses before backup mutation, and provider end minus provider start must be 48–72 real hours. | source/tests ready; physical interval not started |
| Remote 48-hour boundary | At least eight distinct launchd snapshots with no gap over 6h15m | `p4g-agent-remote-sync verify-window` returns `agents.phase-b0-remote-sync-window-verification.v3`; every receipt matches the online restic ledger and its provider-time observation, and remote latest equals durable latest. | verifier ready; window not started |
| Base-A1 health/store | The deterministic supervisor performed work without silent failure | Read-only end audit is bound to the exact store and an already-past end: every run whose grace deadline matured in-window or whose unfinished state overlaps its start is terminal `succeeded`; a run still inside grace is not falsely failed. SQLite integrity is `ok`; there is no failed/missed event, queued/unsettled/failed delivery, PID/lease mismatch or duplicate provider id. Every incident intersecting the window, including one opened before bootstrap, closed in-window and has an exact operator disposition; host-idle tolerance is only for stored `network`/`network_down`. | proposed in PR #16; physical interval not started |
| Runtime continuity | Exactly one effective A1 lease holder across launchd restart/takeover | Root reserves the destructive capture before any kill. On the exact release, the helper records old PID/lease epoch, termination, pre-expiry refusal, takeover after expiry, and no overlapping holder or delivery drift; root validates and no-replace publishes the direct output. A handwritten or concurrent capture fails. | exact Phase-B0 physical receipt pending and requires permission |
| Cold boot | FileVault-off headless boundary actually restores all three jobs | An approved reboot records changed boot identity; launchd invocation and remote snapshot both after boot, with invocation within 30 minutes so a later six-hour slot cannot substitute; source-controlled launchd retry remains five minutes; one supervised holder and external dead-man recovery are required. | pending; reboot requires a separate operator act |
| External dead-man | An operator inspected the external monitor's complete window | `agents.phase-b0-deadman-window-evidence.v2` is explicitly `operator_attested_external_provider_ui`: the operator reviews the provider UI, binds the interval, first/last heartbeat coverage, bounded count, maximum gap, alert destination and zero unexplained alerts, then performs the separate root publication. This is a human gate, not a provider signature or machine-verifiable security boundary; an agent-authored local file alone has no root publication authority. | validator proposed in PR #16; endpoint/configuration and operator attestation pending |
| Rollback | One reviewed action makes all Phase-B0 authority inert | With explicit approval, `p4g-agent-phase-b0-control disable` boots out all labels, persistently disables them, removes live plists and publishes `enabled:false`; a receipt then proves no matching processes and no effective runtime lease holder. An unexpired claim held by the exact dead supervised PID is inert; malformed or inconclusive holder identity fails closed. The online B2 window is re-verified after disable and must equal the published pre-rollback digest; rollback/completion times must match the live clock. Re-enablement, if wanted, is a new activation/bootstrap authority act. | code/tests ready; physical execution is disruptive and separately gated |
| Final closure | All evidence is byte-bound and mutually consistent | Final packet hashes the bootstrap anchor, remote verification, A1 audit, restart/takeover, boot, dead-man and rollback receipts; exact release/tree/policy/activation identities agree; no P1-P3 or undisposed incident remains. | pending |

## Window rules

1. The start is the successful full bootstrap, not seed, activation
   publication, an attended top-up or the temporary remote-sync-only gate.
2. The end is at least 48 hours and at most 72 hours after the anchored start.
3. A restart or cold boot does not reset the window if all fail-closed and
   continuity checks pass. A release, policy, activation, credential,
   repository, launchd-definition or monitored-endpoint change invalidates the
   window and starts a new one.
4. An unavailable or stale independent backup intentionally stops complete
   base A1. Recovery through remote-sync is acceptable only when the receipt
   chronology proves the designed fail-closed interval and self-healing path;
   deleting evidence or bypassing freshness invalidates the window.
5. The remote verifier is necessary but not sufficient. Its success must
   never be reported as the complete Phase-B0 PASS.
6. Restart and cold-boot receipts must be produced no later than the chosen
   A1 end audit. Later healthy state cannot repair an earlier failed interval.

## Evidence tooling proposed before bootstrap

Stacked swipe-agents PR #16 at
`b355af9af36929ed419ab487b21bae12af3303be` proposes all source-controlled
closure surfaces identified by this matrix:

1. a root-owned typed bootstrap/window anchor bound to exact activation,
   native boot identity, launchd state and the Node-to-caffeinate process
   chain;
2. a deterministic Phase-B0 base-A1 end-audit receipt for the anchored SQLite
   interval;
3. exact-release physical restart/takeover and cold-boot receipt producers;
4. an external-monitor continuity evidence schema bound to the same window;
5. a post-disable rollback receipt that proves the absence of jobs, processes
   and a live runtime lease without deleting remote data, followed by a final
   aggregate that requires every receipt above plus the remote B2 verifier.

This code is stacked review input, not an achieved gate or permission to
expand runtime authority. Until PR #16 receives independent exact-head GO and
is included in the later reviewed merge/release, the honest state remains
`runtime implementation review-ready; bounded acceptance tooling unapproved`,
not `Phase-B0 activation-ready`.

## Authority sequence after tooling closure

Each arrow remains a distinct human gate:

`independent GO` -> `merge` -> `build twice` -> `install release` ->
`switch current` -> `provider/escrow evidence` -> `activation publication` ->
`remote-sync-only physical gate` -> `full bootstrap/start anchor` ->
`bounded drills and 48-hour observation` -> `final audit` -> `rollback or a
new explicit continue-running decision`.

No A1.1/B1, Finance live collector/sender, cohort cron or scheduled LLM role is
part of this matrix.

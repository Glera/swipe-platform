# Phase-B0 remote-sync — review and activation packet

Date: 2026-08-01. Status: R2 NO-GO remediation submitted for diff-only review;
**not merged, installed, activated or enabled by this packet**. The prior
independent review confirmed all original 1 P1, 3 P2 and 9 P3 closures, then
found one owner decision, one activation-deadline tail and seven P3 tails in
the remediation. This document records the owner's decision and author's R3
dispositions; it does not promote them to independently verified closures.

## Decision and scope

The operator has no external disk and explicitly chose to continue without
one. This does not convert the Phase-A same-disk exception into an independent
backup. The reviewed replacement is an encrypted Backblaze B2 repository via
restic, with a physical restore drill and a separate off-host escrow of the
restic password.

This slice changes only the reserve-host Phase-B0 boundary for deterministic
base A1. It does not enable or enlarge A1.1/B1, Finance delivery/live
collectors, cohort cron, the standalone unattended bot, scheduled LLM roles,
deploy, publish, payment, product flags or other mutating authority.

## Exact code input

| Item | Exact identity |
| --- | --- |
| prerequisite physical-preflight fix | swipe-agents PR #12, merged as `d1a2d29`; reviewed source head `3a7f2a1f18c629f9e165f3ea70e46845af0ba9e6` |
| remote-sync implementation | [swipe-agents PR #13](https://github.com/Glera/swipe-agents/pull/13) |
| R1 NO-GO head | `bfab9294913c2f9052bbfbf862a61588aa999e1a` |
| R2-reviewed remediation head | `6ffa3d0273aace9d4af412a6f0f8d49e70a8e1f2` |
| R3 remediation head for diff-only review | `b76c4a7914a0950309af3ee5661767522132fa63` |
| frozen host policy digest | `ae2ec821c33b06cb288fd92b603b094b8abb6f3fa85dbd157b4390fb8bb0f0cf` |
| remote attestation schema | `agents.phase-b0-remote-sync-attestation.v2` |
| host policy schema | `agents.phase-b0-host-policy.v2` |

PR #13 is based on merged `main`, not stacked on an unmerged branch.

## Contract under review

1. `phase-b0.v2` fixes `backupBoundaryKind=remote_sync`; an activation receipt
   for `distinct_device` cannot be substituted on this host.
2. The B2 target is a private bucket and the repository path is fixed to
   `b2:<reviewed-bucket>:p4g-phase-b0`. Credentials remain only in the
   runner-owned mode-0600 `agents.env`; subprocess and receipt output contain
   identities only as SHA-256 digests.
3. The binary is exactly restic 0.19.1 and its physical bytes are bound into
   both the root-owned remote attestation and the Phase-B0 activation path.
4. A public remote attestation is publishable only after a remote seed backup
   and a later restore of that exact snapshot with identical relative paths,
   bytes and modes. Restore compares against the backup-time tree digest,
   counts and bytes, not a mutable live source tree.
5. The attestation fixes a no-card Backblaze profile with a `$0.00` charge
   boundary: 10 GB storage, 1 GB/day download, 2,500/day Class B and
   2,500/day Class C operations, with 75% and 100% alerts. It also binds
   two fresh secret-free root-owned evidence artifacts: the attended account
   observation and proof that the restic password is escrowed outside the
   reserve Mac. Runner-supplied digest strings are no longer accepted.
6. Account payment/cap/alert state is not exposed by the B2 Native API and is
   honestly retained as attended root evidence. Bucket privacy, SSE-B2,
   Object Lock and lifecycle are read live through B2 v4 before every material
   remote operation. The key must bind exactly one bucket, no prefix and the
   exact seven least-privilege capabilities; any live widening or bucket drift
   fails closed.
7. Remote backup is a third launchd job: `RunAtLoad`, six-hour interval, no
   `KeepAlive`, no Telegram/LLM/provider-configuration authority, typed
   low-volume stdout/stderr under its private state root, bounded to one 1 MiB
   active file and one rotated archive per stream, and durable private
   receipts. Generic refusal logs contain no provider response or credential.
8. One atomic four-hour writer lease fences init, backup and restore; release
   removes only the same inode and holder identity, never a replacement lock.
   Seed and scheduled snapshots have separate tags. Attended scheduled-path
   backups are recorded but excluded from unattended acceptance; the launchd
   path is separately named and refuses a non-launchd parent. Pruning occurs at
   most daily, preserves the last 72 hours, then applies 14 daily, 8 weekly and
   6 monthly retention.
   Every scheduled snapshot records a backup-time tree digest and accepts
   restic RFC3339 timestamps with a local offset only after normalizing them to
   UTC-Z.
9. The 48-hour verifier considers scheduled receipts only, anchors every one
   to a distinct row in the complete remote restic ledger, derives gaps from
   external snapshot times and requires remote-latest to match local-latest.
   Separately, a receipt older than 6h15m intentionally fails the complete
   base-A1 runtime and every dead-man preflight. Activation preparation and
   publication instead require the seven-day remote-attestation freshness and
   do not inherit the 6h15m runtime deadline. Cold start is repaired by the
   remote-sync `RunAtLoad` job; B2 failure leaves A1 off.
10. Upgrading the already installed disabled host bundle requires explicit
   `--replace-files` and refuses while any of the three jobs is loaded. Host
   install, root evidence publication, remote attestation, activation receipt,
   one attended scheduled-path backup and bootstrap remain distinct authority
   acts.

## R1 NO-GO dispositions

| Finding | Remediation at `6ffa3d0` |
| --- | --- |
| P1: restic emits a local-offset timestamp but receipt validation required literal `Z` after upload | Snapshot parsing accepts RFC3339 `Z` or offset, converts the instant to canonical UTC-Z, and validates only the normalized receipt. The executing fake-restic regression supplies `+03:00`. |
| P2: the runner could manufacture eight local receipts | Acceptance lists the complete tagged remote snapshot ledger and requires every scheduled receipt to match one distinct remote id+time in monotonic order. Seed/manual receipts never count. Handwritten, duplicate, missing, gapped and latest-mismatch cases are negative tests. |
| P2: provider state and evidence digests were self-asserted | `b2_authorize_account` and bucket-scoped `b2_list_buckets` now prove the exact bucket, exact key scope, privacy, encryption, Object Lock and lifecycle live. Payment/caps/alerts become fresh root-owned structured evidence files, bound byte-for-byte by attestation v2; arbitrary CLI digest input was removed. |
| P2: failure was silent and no freshness boundary existed | Remote stdout/stderr go to low-volume state-root logs with generic refusal codes. Every dead-man preflight checks a 22,500-second maximum age for the latest bound receipt; stale backup evidence suppresses the external heartbeat. |
| P3: prune ran every six hours | A bound prune receipt limits prune to once per 24 hours, and `--keep-within 72h` protects the acceptance window before daily/weekly/monthly retention. |
| P3: concurrent writers had no lock | Atomic directory lease fences init, backup and restore; a live lease refuses and only an expired lease is quarantined and reclaimed. |
| P3: remote tests could skip while being counted green | The fake-restic suite executes unconditionally; no restic-installed conditional remains in the changed suite. Native macOS syntax tests remain explicitly platform-specific and are reported separately. |
| P3: restore compared against the later live source tree | Backup receipts now persist source tree digest/file count/byte count; restore compares the remote snapshot to that frozen backup-time identity. |
| P3: packet overstated test counts | Counts below report literal runner output and preserve the one full-suite timeout instead of converting it to green. |
| P3: tracked fixture exposed the global B2 bucket identity | No real bucket name, id or endpoint is present in code, fixtures or this packet; fixtures use a non-production synthetic name. |
| P3: superseded v1 policy/schema artifacts remained live | Orphan `phase-b0.v1`, `golden.v1`, policy-v1 and remote-attestation-v1 artifacts are removed; v2 is the sole source-controlled host contract. |
| P3: digest-then-exec left a restic identity window | Every invocation opens and hashes the executable and captures device/inode/size/mtime/ctime immediately before execution, executes the resolved physical path, then verifies the same identity after. The production path additionally requires a root-owned non-symlink regular file at exact mode `0555`. |
| P3: scheduled remote backup lacked its own activation gate | The scheduled command requires the root-owned enabled Phase-B0 activation and exact attestation digest before any provider or restic write; seed remains a separately named attended path. |

## R2 findings and R3 dispositions

| R2 finding / decision | Disposition at `b76c4a7` |
| --- | --- |
| Owner decision: does a stale independent backup stop only heartbeat or all base A1? | **Intentional full-runtime fail-closed boundary.** Runtime and dead-man require a latest receipt no older than 6h15m. Remote-sync remains able to repair it; there is no local-only or operator-bypass mode. The cold-start sequence is explicit in the runbook. |
| P2/P3: seed-to-activation had an undocumented 6h15m deadline | The host now has closed typed freshness profiles: `runtime={fresh attestation:false, fresh latest:true}` and `activation={fresh attestation:true, fresh latest:false}`. Preparation/publication keep the seven-day attestation bound but do not force a re-seed after 6h15m. A real attended backup refreshes the runtime receipt immediately before bootstrap. |
| P3: binding parse escaped typed host diagnostics | Binding parse moved inside the translation boundary; the regression requires `remote_sync_invalid_restic_repository`, never generic `unexpected`. |
| P3: two-hour non-renewing lease could expire inside the bounded three-hour backup path, and release unconditionally removed the lock | Lease is four hours; each of the three possible restic subprocesses is capped at one hour. Release verifies both captured lock inode/device and holder UUID. The replacement-holder regression proves the old holder returns false and leaves the new lock intact. |
| P3: attended `backup` was indistinguishable from launchd evidence | Public attended `backup` records `runOrigin=attended`. The plist invokes the distinct `scheduled-backup`; both wrapper and module require launchd parent PID 1 before recording `runOrigin=launchd`. Acceptance filters to `scheduled+launchd`, so attended repair/probe cycles never count. |
| P3: malformed `last-backup.json` was permanently fatal with no recovery procedure | `quarantine-corrupt-head` takes the writer lock, refuses valid evidence and insecure ownership/mode, atomically preserves invalid bytes in a private quarantine path and returns only their digest. The runbook then requires an attended backup and full Phase-B0 check. |
| P3: four negative paths were untested | Executing regressions now cover `insecure_restic`, `restic_identity_changed`, clean provider-probe drift and `receipt_time_regressed`; the time-regression test follows two valid committed receipts. |
| P3: test-count claim included platform skips | This packet reports literal results only: targeted 40/40 with no skip; full suite 457 passed plus one disclosed timeout; isolated affected file 2/2. |
| P3: remote-sync logs were unbounded | Wrapper rotates each stream at 1 MiB, keeps one archive, rejects symlink/non-file log paths and applies mode 0600 to the new active file. |

## Verification evidence

- Targeted host/security suite: 40/40 green. The 16 remote-sync tests execute
  an actual fake-restic binary, including the `+03:00` timestamp path; none is
  conditionally skipped.
- Native syntax gates: Node checks green; zsh checks green; all three plists
  pass `plutil -lint`.
- Build and typecheck: green.
- Full local suite: 457 passed and one `backup-commit-race` case timed out at
  the shared 30-second limit under full-suite contention. The entire affected
  file then passed alone 2/2 in 8.67 seconds. This is not reported as an
  all-green full-suite run; exact-head CI is authoritative for the merge gate.
- Two clean installer dry-runs at the exact head were byte-identical and made
  no host changes; the complete rendered manifest output hashes to
  `1f5200e272dd5d52c31052f6deda022a41f61240a41f9c7fd4ca1bbe182707e7`.
- Exact-head repository CI [run 30708573840](https://github.com/Glera/swipe-agents/actions/runs/30708573840)
  completed successfully at
  `b76c4a7914a0950309af3ee5661767522132fa63`.
- Meta-repository verification passed 130/130 with zero skips. The repository's
  authoritative command is `node --test 'scripts/*.test.mjs'`; the unrelated
  legacy workspace `scripts/verify.sh` is not used as evidence for this packet.
- The real scheduled-path cycle on this non-UTC Mac remains intentionally
  unproved because restic, the scoped key, root evidence and activation have
  not been installed or issued. It is a post-review, installed-but-unloaded
  physical gate, not an assertion of this code packet.

## Required adversarial review axes

The reviewer should attack at least:

1. repository/mechanism substitution and credentials reflected through any
   success or failure path;
2. env, state, receipt, executable, candidate and root-attestation
   owner/mode/symlink/TOCTOU boundaries;
3. forged, stale, reordered or cross-repository backup/restore receipts;
4. restore of a different snapshot, missing files, changed bytes or modes;
5. payment-method reappearance, quota/alert/privacy/encryption/lifecycle
   weakening, missing off-host password escrow, and activation digest
   substitution;
6. concurrent/manual backup versus scheduled backup and acceptance-receipt
   inflation;
7. interruption at every host-file replacement, enable and bootstrap step;
8. reboot/re-enable after attestation ageing and rollback from a partially
   installed bundle;
9. restic/B2 output or inherited environment leaking into logs, receipts or
   exception text;
10. 48-hour window boundary, first/last interval and provider-latest races.

## Current physical state at packet creation

Read-only inspection found:

- `current -> releases/aa91b2be1cc74632fdc8fb75d355172237c656e8`;
- supervised, dead-man and remote-sync labels not loaded;
- no attended supervised/quiet-week process;
- no Phase-B0 activation receipt;
- no remote-sync attestation;
- restic not installed.

By explicit operator authorization, one empty Backblaze bucket now exists. A
read-only attended check established: private access, SSE-B2, Object Lock
disabled, `keep only the last version`, no payment method, `$0.00` visible
charge caps, the four free quotas above, and 75%/100% alerts. The packet does
not publish the bucket identifier, account identifier or endpoint. No
application key was created or read, and the bucket had zero objects/bytes at
creation.

The quiet week already passed separately and is not restarted by this backup
decision. The new 48-hour window begins only after the three Phase-B0 jobs are
explicitly bootstrapped.

## Human gates to real base-A1 work

After exact-head diff-only re-review and terminal CI success:

1. operator merge decision for PR #13;
2. build an immutable merged release and replace host files while all jobs are
   still disabled;
3. operator re-verifies the already-created private bucket and no-card
   free-only profile, then creates a bucket-scoped, no-prefix key with exactly
   the seven reviewed capabilities, without sharing it in chat;
4. operator saves the independently generated restic password outside this
   Mac and inserts the four B2/restic values into `agents.env` without sharing
   them in chat;
5. attended `init -> seed-backup -> restore-drill`;
6. publish the fresh provider-boundary and escrow evidence as two separate
   root-owned artifacts, then generate and publish remote attestation v2;
7. operator signs in to the external dead-man provider and inserts only its
   secret URL into `agents.env`;
8. publish an exact activation receipt for the merged immutable release and
   the already approved `filevault_disabled_headless_boot` decision;
9. while all launchd labels remain unloaded, run one real attended `backup`
   through the exact scheduled path and confirm its offset time normalized to
   UTC-Z, its remote snapshot and its durable v2 receipt;
10. separate explicit operator approval for `launchctl bootstrap`;
11. immediately start the 48-hour acceptance window and close it with the
   deterministic remote verifier plus the base-A1 health/lease/Telegram audit.

Base A1 performs real work immediately after step 10; the 48 hours are proof of
unattended stability, not an additional delay before the first probes.

## Cost boundary and Finance follow-up

Backblaze documents no-card signup, the first 10 GB as free, free daily
download and transaction allowances, and caps/alerts. This deployment freezes
the provider profile at no payment method and `$0.00`; it does not accept a
paid fallback. Exceeding a free quota must stop or defer provider work rather
than authorize spend.
Official sources:

- [B2 product page](https://www.backblaze.com/cloud-storage)
- [B2 pricing](https://www.backblaze.com/cloud-storage/pricing)
- [B2 caps and alerts](https://www.backblaze.com/docs/cloud-storage-create-and-manage-caps-and-alerts)
- [restic 0.19.1 repository initialization](https://restic.readthedocs.io/en/stable/030_preparing_a_new_repo.html)

Until the Finance role receives a typed B2 collector, its reports must describe
B2 as `free-only, provider-alerted, not-collected`; they must not claim full
provider coverage. That collector is a separate read-only finance source
revision and is not authority of the backup job.

## One-step rollback

The reviewed source command boots out all three jobs, persistently disables
their labels, removes live plists and publishes `enabled:false`:

```zsh
sudo /usr/local/var/p4g/swipe-agents/bin/p4g-agent-phase-b0-control disable
```

Remote data is not deleted during rollback. Provider deletion, key revocation
and billing-account changes remain separate attended human actions.

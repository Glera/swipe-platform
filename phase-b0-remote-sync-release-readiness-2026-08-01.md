# Phase-B0 remote-sync — review and activation packet

Date: 2026-08-01. Status: review input; **not merged, installed, activated or
enabled by this packet**.

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
| exact review head | `144deddc8c15df433b176458768cbd2466ed062f` |
| frozen host policy digest | `45c8bcbe602a580a99d9c1be3a88fc1421c92a8f412b4f0908d65f21efa1a1b7` |
| remote attestation schema | `agents.phase-b0-remote-sync-attestation.v1` |
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
   and a later restore of the same snapshot with identical relative paths,
   bytes and modes.
5. The attestation fixes Backblaze hard caps at `$0.10/day` each for storage,
   downloads and transactions. It also binds secret-free evidence that those
   settings are visible and that the restic password is escrowed outside the
   reserve Mac.
6. Remote backup is a third launchd job: `RunAtLoad`, six-hour interval, no
   `KeepAlive`, no Telegram/LLM/provider-configuration authority, output to
   `/dev/null`, durable private receipts under the runner state root.
7. Retention is 14 daily, 8 weekly and 6 monthly snapshots. A 48-hour verifier
   requires at least eight distributed successes, no interval above 6h15m,
   exact repository/binary binding, and an online match between local last
   evidence and the provider's current snapshot.
8. Upgrading the already installed disabled host bundle requires explicit
   `--replace-files` and refuses while any of the three jobs is loaded. Host
   install, remote attestation, activation receipt and bootstrap remain four
   distinct authority acts.

## Verification evidence

- Targeted host/security suite: 30/30 green after the final rebase.
- Native syntax gates: Node checks green; zsh checks green; all three plists
  pass `plutil -lint`.
- Full local suite: all changed and new tests green. One pre-existing
  `backup-commit-race` case exceeded its 30-second per-test timeout only under
  full-suite contention; the exact case then passed alone 2/2 in 8.76 seconds.
- Exact-head repository CI [run 30699101722](https://github.com/Glera/swipe-agents/actions/runs/30699101722)
  is green: 72 files, 447 passed and 2 platform-skipped tests.
- No blind `auto-review` capability was available in this Codex session. This
  packet therefore does not claim independent review; merge remains gated on
  an external exact-head review with no open P1-P3.

## Required adversarial review axes

The reviewer should attack at least:

1. repository/mechanism substitution and credentials reflected through any
   success or failure path;
2. env, state, receipt, executable, candidate and root-attestation
   owner/mode/symlink/TOCTOU boundaries;
3. forged, stale, reordered or cross-repository backup/restore receipts;
4. restore of a different snapshot, missing files, changed bytes or modes;
5. cap weakening, missing off-host password escrow, and activation digest
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

The quiet week already passed separately and is not restarted by this backup
decision. The new 48-hour window begins only after the three Phase-B0 jobs are
explicitly bootstrapped.

## Human gates to real base-A1 work

After exact-head review and CI:

1. operator merge decision for PR #13;
2. build an immutable merged release and replace host files while all jobs are
   still disabled;
3. operator signs in to Backblaze, creates/enables B2, a private bucket and a
   bucket-scoped key, applies all three `$0.10/day` hard caps, and waits for
   propagation;
4. operator saves the independently generated restic password outside this
   Mac and inserts the four B2/restic values into `agents.env` without sharing
   them in chat;
5. attended `init -> seed-backup -> restore-drill`, then publish the public
   remote attestation;
6. operator signs in to the external dead-man provider and inserts only its
   secret URL into `agents.env`;
7. publish an exact activation receipt for the merged immutable release and
   the already approved `filevault_disabled_headless_boot` decision;
8. separate explicit operator approval for `launchctl bootstrap`;
9. immediately start the 48-hour acceptance window and close it with the
   deterministic remote verifier plus the base-A1 health/lease/Telegram audit.

Base A1 performs real work immediately after step 8; the 48 hours are proof of
unattended stability, not an additional delay before the first probes.

## Cost boundary and Finance follow-up

Backblaze documents the first 10 GB as free, storage above that at its current
pay-as-you-go rate, and daily caps/alerts for storage, downloads and
transactions. The frozen caps represent a combined worst-case provider ceiling
of `$0.30/day` (`$9.30` in a 31-day month), while expected usage is lower.
Official sources:

- [B2 pricing](https://www.backblaze.com/cloud-storage/pricing)
- [B2 caps and alerts](https://www.backblaze.com/docs/cloud-storage-create-and-manage-caps-and-alerts)
- [restic 0.19.1 repository initialization](https://restic.readthedocs.io/en/stable/030_preparing_a_new_repo.html)

Until the Finance role receives a typed B2 collector, its reports must describe
B2 as `hard-capped, provider-alerted, not-collected`; they must not claim full
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

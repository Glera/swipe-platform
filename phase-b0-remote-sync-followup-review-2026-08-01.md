# Phase-B0 remote-sync final follow-up review packet

Date: 2026-08-01. Status: submitted for independent exact-head review;
**not installed or enabled**. This packet follows the premature merge recorded
in `phase-b0-authority-gate-incident-2026-08-01.md`. It grants no merge,
installation or runtime authority.

## Exact input

| Item | Identity |
| --- | --- |
| merged predecessor | swipe-agents PR #13, source head `90412e2654442c747314ac6ea892f8dd493f7aca`, merge commit `5f62a41522712e36cf4592bdec9c8ea3e34a07cd` |
| follow-up implementation | [swipe-agents PR #14](https://github.com/Glera/swipe-agents/pull/14) |
| exact follow-up head | `0de72ee045414aa261e914baef69fe409d9401ab` |

## Final-review dispositions

| Finding | Disposition |
| --- | --- |
| P2: `runOrigin=launchd` was spoofable by orphan reparenting | `scheduled-backup` still requires PPID 1, and now also executes absolute `/bin/launchctl print system/com.p4g.swipe-agents.remote-sync`. Exactly one reported job PID must equal the current Node PID. The wrapper uses `exec`, so the reviewed launchd job and Node retain one PID. A double-forked process can obtain PPID 1 but cannot become the PID published by that system launchd label. Failure is typed `scheduled_origin_not_launchd`. The real macOS check remains mandatory in the physical gate. |
| P3: a failed `RunAtLoad` could strand A1 until the next six-hour interval | The plist adds `KeepAlive.SuccessfulExit=false` with a 300-second throttle. Failures retry every five minutes; a successful exit is not kept alive and resumes the ordinary six-hour `StartInterval`. The cold-start runbook states this explicitly. |
| P3: pre-run rotation moved active output into the archive | Shell pre-run rotation is removed. The Node process rotates only after its complete, launchd-verified attempt, so all bytes from that attempt remain together in `.1` and the new active file is empty. |
| P3: rotation preceded runner/admin checks | Rotation is removed from the wrapper entirely. Wrapper runner and non-admin gates execute before Node. The Node rotation additionally requires a private state directory owned by the current runner and a successful exact launchd self-identity check. |
| P3: the origin test substituted `parentPid` rather than proving the production discriminator | Tests now cover PPID 1 with both matching and mismatching launchctl job PID, a normal production-default refusal, and the double-fork attack's decisive state: orphan PPID with a PID different from the registered job. Fixtures do not claim the real macOS system-label fact; the installed-but-disabled physical gate must obtain one genuine receipt. |
| P3: missing negative coverage and off-host limitation | Regressions cover insecure backup head and invalid seed+launchd receipt. The runbook explicitly reserves root-owned non-symlink restic mode `0555` and real launchctl self-identity for the reserve-Mac physical gate. |
| P3: the four-hour lease did not formally cover three one-hour subprocesses plus unbounded hashing | The holder renews when one hour remains, after every bounded restic subprocess and during every tree entry and 1 MiB file chunk. File hashing streams incrementally and rejects identity/size/time drift. Renewal and release both require the captured lock inode and holder. Expired reclaim additionally requires the recorded PID to be provably absent. |

During author re-review, one additional race was closed before publication:
competing expired-lease reclaimers are serialized by an atomic reclaim guard,
and the observed lock inode, holder, PID and expiry are rechecked before move.
The prior holder cannot renew or delete a replacement.

## Verification

- Targeted host/security suites: 43/43 green, zero skips.
- Full local suite: 460 passed; one known shared-contention timeout in
  `tests/acceptance/backup-commit-race.test.ts` at its 30-second suite limit.
  The same exact-head file then passed alone 2/2 in 8.11 seconds. The full run
  is not described as all-green; repository CI is authoritative.
- Exact implementation head CI
  [run 30712293762](https://github.com/Glera/swipe-agents/actions/runs/30712293762)
  passed, including typecheck and the complete repository test suite.
- Node syntax, zsh syntax, `plutil -lint` and `git diff --check`: green.
- No credential value, bucket identifier or provider response was read or
  added to source/evidence.

## Reviewer focus

The independent reviewer should specifically try to:

1. obtain `runOrigin=launchd` from a shell, double-fork or a different
   launchd label;
2. make a failed cold start busy-loop or wait six hours, or make a successful
   run repeat every five minutes;
3. rotate logs before identity validation, split one run between active and
   archive, or replace either log with a symlink;
4. expire a lease during the longest legal path, reclaim a live holder,
   steal a replacement lock, or let two reclaimers become writers;
5. change a source file during streamed hashing without a typed refusal.

## Remaining human and physical gates

Even after independent GO, the order is strict:

1. explicit operator merge decision naming PR #14 and this exact head;
2. separate explicit permission to build/install an immutable disabled
   release;
3. provider credential and escrow steps performed attended without placing
   secrets in chat;
4. attended init, seed and restore drill;
5. root evidence and activation publication as separate acts;
6. temporarily bootstrap only remote-sync and require one real non-UTC
   `runOrigin=launchd` cycle, then boot out, disable and remove the live plist;
7. separate operator permission for full Phase-B0 bootstrap and the 48-hour
   acceptance window.

No step above is authorized by this packet.

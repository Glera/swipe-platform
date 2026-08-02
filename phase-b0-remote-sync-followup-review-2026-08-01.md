# Phase-B0 remote-sync final follow-up review packet

Date: 2026-08-01. Status: updated after read-only host audit; submitted for a
fresh independent exact-head review. **This follow-up is not installed or
enabled.** Its merged predecessor was installed without the required authority,
as recorded
in `phase-b0-authority-gate-incident-2026-08-01.md`. It grants no merge,
installation or runtime authority.

## Exact input

| Item | Identity |
| --- | --- |
| merged predecessor | swipe-agents PR #13, source head `90412e2654442c747314ac6ea892f8dd493f7aca`, merge commit `5f62a41522712e36cf4592bdec9c8ea3e34a07cd` |
| follow-up implementation | [swipe-agents PR #14](https://github.com/Glera/swipe-agents/pull/14) |
| exact follow-up head | `f798e11185850ebbb5e6842b2cdaad22640b126c` |
| stacked release pipeline | [swipe-agents PR #15](https://github.com/Glera/swipe-agents/pull/15), based on PR #14 |
| exact release-pipeline head | `9f457710ad47e22010795db98c5bef7560e7a6ed` |

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

## Read-only host-audit finding

The reserve Mac contradicted the earlier packet state: predecessor release
`5f62a41522712e36cf4592bdec9c8ea3e34a07cd` had been created, its root-owned
host bundle installed, and `current` switched without an exact authorization.
It remained disabled: activation and boundary evidence are absent, live plists
are absent, and all three jobs are unloaded.

The audit also reproduced a release blocker: root execution of the predecessor
installer refreshed `.git/index`, replacing it at mode `0600`; the production
scanner returns typed `writable_release`. PR #14 now sets
`GIT_OPTIONAL_LOCKS=0` on both Git reads. Its regression builds a clean fixture
repository with a read-only index and writable index parent, runs the actual
installer, and requires the index bytes, mode, mtime and ctime to remain exact.
No permission repair, host replacement or `current` switch was performed.

## Full-release reproducibility finding and disposition

The host-bundle render above is reproducible, but it does not build the full
runtime release. Two ordinary clean clone -> `npm ci` -> build candidates of
the same PR #14 commit produced different production-tree digests:

- `02e294cbb0e59bf4980162998a41aa4e95c471c5fbf0f34b2b64a4729e00d1f7`;
- `177797827710ea50d3fc54268b572a27d2cf2b1cdff73744c9c222d2eee4530f`.

The only differing paths were mutable Git administration bytes
(`.git/index` and reflogs); product files and the native dependency were
identical. Copying an ordinary checkout therefore cannot satisfy a
reproducible immutable-release claim.

Stacked PR #15 closes that release-level gap without `git archive`. It parses
the reviewed commit/tree/blob objects directly, recomputes every raw object
OID, rejects gitlinks, unsafe paths and escaping symlinks, and materializes
only those raw blob bytes. Local `.git/config`, `.git/info/attributes`, smudge
filters, replace refs and checkout bytes are outside the build input. It builds
with an isolated private HOME and npm cache, fixed
UTC/C/source-commit epoch and disabled user/system Git configuration, removes
the build home, emits only a deterministic `.git/HEAD` identity marker,
freezes the full tree, and returns a typed production tree-digest receipt. A second
default-dry-run command re-verifies that candidate. `--apply-release` installs
only the exact re-verified bytes while all Phase-B0 jobs are unloaded and does
not touch `current`; `--switch-current` is a distinct authority act with an
atomic switch and rollback to the prior link on post-switch verification
failure.

The installer also proves that its own tracked source is clean at the same
exact commit with Git optional locks disabled. A launchd query counts as
"unloaded" only on the observed macOS `launchctl print` ESRCH exit 113;
loaded status 0 and every inconclusive/error/signal result refuse. Rollback
captures the inode of the prepared `current` link and never overwrites a
concurrent replacement.

The macOS rename boundary is also recoverable. The installer opens only the
staging root's owner-write bit for the same-filesystem rename and freezes the
target immediately afterward. If killed in that interval, a repeated explicit
`--apply-release` accepts only the exact installer-owned shape (root `0755`,
every child already frozen), restores root `0555`, and still requires the full
reviewed digest. Any other writable shape remains a refusal.

The former pre-fix head produced `checkedPaths=3001` and digest
`054c836102a19aa0232990c05315610590da1cda9021f1b2a44a0d8ac9b9df02`;
that identity is explicitly superseded and is not install authority. At exact
PR #15 head `9f457710ad47e22010795db98c5bef7560e7a6ed`, the executing regression
builds the complete frozen release twice from raw Git objects, requires equal
tree/build/toolchain/native identities, probes the installed native module and
keeps `current` switching a separate act. Before building it now also refuses
any staged or unstaged tracked change and byte-compares the executing builder
module closure to the reviewed commit. No live host path was changed.

## Verification

- Targeted host/security suites at current PR #14 head: 45/45, zero skips.
- Exact implementation head CI
  [run 30759565214](https://github.com/Glera/swipe-agents/actions/runs/30759565214)
  passed, including typecheck and the complete repository test suite.
- Node syntax, zsh syntax, `plutil -lint` and `git diff --check`: green.
- Two no-write installer renders at the final head produced identical manifest
  digest `bc7c88a61b4b46e769f42a44dfbe4f96b11779910868554e0df577f02f5e7b12`.
  The worktree Git index remained byte- and metadata-identical across both.
- No credential value, bucket identifier or provider response was read or
  added to source/evidence.
- PR #15 exact-head CI: 465 passed plus two documented macOS-only skips across
  73 files; its four-test release-candidate suite builds two complete releases,
  rejects staged and unstaged builder changes, installs the reviewed bytes into a
  temporary runtime without `current`, switches `current` separately, then
  re-runs the production scanner and native `better-sqlite3` probe.
- PR #15 exact-head CI
  [run 30763862600](https://github.com/Glera/swipe-agents/actions/runs/30763862600)
  passed with the build/install executing regression enabled.
- Unlike the earlier revision, the complete build/install executing regression
  is mandatory in Ubuntu CI as well as the local macOS run; it may not be
  reported green as a platform skip.

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
6. make two exact PR #15 builds diverge; inject working-tree or user npm/Git
   state; escape through a copied symlink; substitute bytes after the receipt;
7. publish a partial or writable release, install while a job is loaded,
   change `current` during `--apply-release`, or prevent rollback after a
   failed post-switch verification.

## Remaining human and physical gates

The complete closure contract is frozen in
`phase-b0-bounded-acceptance-matrix-2026-08-01.md`. In particular, the remote
`verify-window` receipt is necessary but does not by itself prove the complete
Phase-B0 goal. Bootstrap anchoring, base-A1 interval audit, exact-release
restart/takeover, cold boot, provider-side dead-man continuity and rollback
must also close before a final PASS can be claimed.

Even after independent GO, the order is strict:

1. independent GO for exact heads of PR #14, stacked PR #15 and this evidence
   packet, with no open P1-P3;
2. explicit operator merge decision naming both PRs and exact heads; merge
   order is PR #14, then PR #15;
3. reproduce the final merged commit twice, then obtain separate explicit
   permission to install only that immutable disabled release;
4. obtain another explicit authority act before switching `current`;
5. provider credential and escrow steps performed attended without placing
   secrets in chat;
6. attended init, seed and restore drill;
7. root evidence and activation publication as separate acts;
8. temporarily bootstrap only remote-sync and require one real non-UTC
   `runOrigin=launchd` cycle, then boot out, disable and remove the live plist;
9. separate operator permission for full Phase-B0 bootstrap and the 48-hour
   acceptance window.

No step above is authorized by this packet.

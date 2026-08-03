# Phase-B0 reserve-host read-only readiness audit R2

Observed: 2026-08-03T13:20:48Z. Audit principal: `p4g_assistant` on the
reserve Mac. Code review inputs were swipe-agents PR #15
`a780898f9cb024fbcba8981aedd0300291c33064`, PR #16
`df0f22ee5d3b792297b8183926b7955d6bca10c7`, and meta PR #52
`632e35af1be24db90130022fe959d47d73915938`.

No sudo command, secret read, provider-authenticated call, file write, release
switch, launchd mutation or unattended-process action was performed. One
unprivileged time diagnostic was mistakenly invoked with `sntp -sS`; macOS
returned `clock_settime: Operation not permitted`, so the clock was not
changed. Its reported offset is not used as readiness evidence. Future network
time evidence must use the reviewed attended preflight after separate authority.

## Result

The host remains safely **disabled and contained**, but it is **not ready for
installation or activation**. Independent R4 has not yet returned. The current
release is the known predecessor and still fails the immutable-tree gate. The
installed restic bytes are outside the reviewed allowlist. The installed host
bundle predates bounded-acceptance tooling and lacks its acceptance wrapper.
Activation, provider/escrow evidence, remote attestation and acceptance
receipts are absent.

| Boundary | Current evidence | Verdict |
| --- | --- | --- |
| OS / architecture | macOS 15.7.3 build 24G419, x86_64 | pass |
| Node | `/usr/local/bin/node` v24.18.0 | pass |
| runner identity | `p4g_runner` uid 502; staff/non-admin | pass |
| FileVault decision | `FileVault is Off` | matches `filevault_disabled_headless_boot` decision |
| disk | data volume 14% used, about 403 GB available | pass |
| current | `current -> releases/5f62a41522712e36cf4592bdec9c8ea3e34a07cd` | predecessor; replacement still required |
| current release inspection | exact PR #16 `inspectPinnedRelease` returns `writable_release` | fail closed |
| restic physical shape | root:wheel, regular file, mode 0555, 0.19.1 darwin/amd64 | shape pass |
| restic reviewed identity | SHA-256 `be8e974acdd959e18c34c7dc377258388131e61d2126208703419443c1d53655`; exact PR #16 `resticIdentity` returns `unreviewed_restic_binary` | **replacement required** |
| installed host bundle | root:wheel mode 0555, but `p4g-agent-phase-b0-acceptance` is absent | **superseded; replacement required** |
| staged plists | all three root:wheel 0644 and `plutil`-valid | staged predecessor only |
| live plists | all three absent from `/Library/LaunchDaemons` | disabled/pass |
| launchd labels | supervised/dead-man/remote-sync each return native not-loaded status 113 | disabled/pass |
| Phase-B0 processes | no exact supervised, caffeinate, dead-man, remote-sync or acceptance process | disabled/pass |
| policy file | root:wheel mode 0444 | present predecessor policy; replacement bundle must revalidate |
| activation | absent | pending later human gate |
| provider evidence | absent | pending later attended gate |
| escrow evidence | absent | pending later attended gate |
| remote attestation | absent | pending seed/restore/provider proof |
| acceptance anchor/audit/rollback | all absent | no acceptance window is active or claimed |
| runner secrets/state | runner home subtrees are mode 0700 and unreadable to audit principal; contents not read | deliberately unverified |
| network-time setting | `systemsetup -getusingnetworktime` requires administrator authority on this host | pending later attended preflight; no claim |

## Installed filesystem inventory

The runtime root and releases root remain `p4g_assistant:admin` mode 0755. The
known release directories are:

- `1b31b64dd9a3554179d5ce8eb2ed0521479c98b4`
- `5f62a41522712e36cf4592bdec9c8ea3e34a07cd`
- `69ed430d1dca3291e893275854d3b90e11aadda5`
- `aa91b2be1cc74632fdc8fb75d355172237c656e8`
- `ea243275f719b8c06b26396eee8ca5b6552c5bbb`
- `f75841d843a47a21cebee4b363c9d60402f51865`

No PR #15/#16 release head is present. The current-link and reviewed-restic
mtimes remain the previously recorded 2026-08-01 values; the read-only audit
found no evidence of a later Phase-B0 install or switch.

## Gates from this baseline

1. Obtain independent R4 GO on the exact #15/#16/#52 heads with no open P1-P3.
2. Obtain an explicit merge decision; verify exact merge commits and terminal
   CI before building from the merged commit.
3. Build two immutable candidates through the committed external dispatcher
   and independently compare their complete receipts.
4. Obtain a separate install-only decision. Install the reviewed release and
   replacement host bundle while jobs remain unloaded; replace the current
   unreviewed restic bytes only under the same explicit attended supply-chain
   act.
5. Re-run this audit. Require the acceptance wrapper, exact host manifests,
   reviewed restic digest and immutable release to pass before requesting a
   separate `current` switch.
6. Credentials, provider/escrow evidence, seed/restore, activation, launchd
   bootstrap and the bounded physical window remain later distinct acts.

This audit grants none of those acts and is not acceptance evidence.

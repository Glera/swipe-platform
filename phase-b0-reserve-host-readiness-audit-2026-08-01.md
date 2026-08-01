# Phase-B0 reserve-host read-only readiness audit

Observed: 2026-08-01 after swipe-agents PR #14 head
`27791e0f1c23457f5746160ca752a3537149265b` was published. Audit principal:
`p4g_assistant`; no sudo, secret read, provider call, file mutation, release
switch or launchd mutation was performed.

## Result

The host is safely **disabled but not ready for activation**. OS/runtime,
runner, restic, disk and staged-plist prerequisites pass. The installed
predecessor release fails the immutable-tree gate and is superseded by the
unmerged follow-up. Activation and independent-boundary evidence do not yet
exist. A later operator-approved replacement install is required; permission
repair of the predecessor is not an accepted substitute.

| Boundary | Observed evidence | Verdict |
| --- | --- | --- |
| OS / architecture | macOS 15.7.3, x86_64 | pass |
| Node | `/usr/local/bin/node` v24.18.0 | pass |
| runtime runner | `p4g_runner` uid 502, primary group staff, not in admin | pass |
| FileVault decision | native status `FileVault is Off` | matches approved `filevault_disabled_headless_boot` decision |
| disk | root volume 3% used, 418 GB available | pass |
| restic | 0.19.1 darwin/amd64; root:wheel mode 0555 | pass |
| runtime roots | runtime and releases roots owner `p4g_assistant:admin`, mode 0755; not writable by `p4g_runner` | pass |
| current | `current -> releases/5f62a41522712e36cf4592bdec9c8ea3e34a07cd` | unauthorized predecessor; replacement required |
| release identity | Git HEAD is exact `5f62a41522712e36cf4592bdec9c8ea3e34a07cd`, status clean | identity pass |
| release immutability | `.git/index` is root:admin mode 0600; production `inspectPinnedRelease` returns `writable_release` | **fail closed** |
| installed host bundle | root:wheel mode 0555 and byte-identical to predecessor release | installed but superseded |
| staged plists | all three root:wheel 0644 and `plutil`-valid | staged only |
| live plists | all three absent from `/Library/LaunchDaemons` | disabled/pass |
| launchd jobs | supervised, dead-man and remote-sync all not loaded | disabled/pass |
| activation | `phase-b0-activation.json` absent | pending human gate |
| remote attestation | absent | pending provider/restore evidence |
| provider + escrow evidence | both absent | pending attended gates |
| runner env | inaccessible to the audit principal; contents were not read | must be checked later as `p4g_runner` without disclosure |

## Timeline recovered from filesystem metadata

| UTC | Event |
| --- | --- |
| 16:48:01 | predecessor release directory created |
| 17:43:28 | predecessor `.git/index` replaced by root Git refresh |
| 17:43:29 | root host-bundle files replaced |
| 17:45:56 | `current` switched to predecessor release |

These acts had no fresh exact operator authorization. Attribution and
containment are recorded separately in
`phase-b0-authority-gate-incident-2026-08-01.md`.

## Follow-up implementation and release evidence

The unmerged PR #14 source is clean at
`27791e0f1c23457f5746160ca752a3537149265b`. Two independent no-write runs of
`p4g-agent-phase-b0-install` produced the same complete artifact-manifest
digest:

`bc7c88a61b4b46e769f42a44dfbe4f96b11779910868554e0df577f02f5e7b12`

The worktree index mode, mtime, ctime, size and SHA-256 remained identical
across both renders. Targeted tests pass 44/44; full local tests pass 462/462;
exact-head CI run 30712769109 passes. This proves the host-bundle manifest,
not the full runtime release.

Two ordinary full release builds from that same commit were not reproducible:
their production tree digests were
`02e294cbb0e59bf4980162998a41aa4e95c471c5fbf0f34b2b64a4729e00d1f7`
and `177797827710ea50d3fc54268b572a27d2cf2b1cdff73744c9c222d2eee4530f`.
Only `.git/index` and Git reflogs differed; product/native bytes matched.
Ordinary checkout copying is therefore rejected as the replacement release
procedure.

Stacked swipe-agents PR #15 supplies the missing reproducible builder and a
two-act installer. At exact head
`2a97acb41b05b4405ab80508882efa8e946ff793`, two complete candidates both
reported `checkedPaths=3001` and tree digest
`6dafeb0250cc2bc50f1c09834b9ac7dd57dcef2fd6bb055ecda9f1eac74f607e`.
The install regression proves release copy and `current` switch are separate;
the live no-write receipt reported no install and no switch. Full local tests
pass 464/464. Exact-head CI run 30714477425 passed; independent review has not
yet returned GO.

## Next gated sequence

1. independent GO for PR #14, stacked release PR #15 and companion evidence
   PR #52, all at exact heads and with no open P1-P3;
2. fresh operator permission naming all reviewed code PR heads, then merge in
   order #14 -> #15;
3. reproduce and review the final merged release candidate twice;
4. separate operator permission to install the new immutable release without
   switching `current`, and to replace the disabled host bundle;
5. another explicit operator act to switch `current`; verify zero writable
   paths before any activation candidate is prepared;
6. perform credentials, provider evidence, seed/restore, attestation,
   activation, transient remote-sync physical gate, full bootstrap and 48-hour
   acceptance only through their already separated authority gates.

No step in this sequence is authorized by this audit.

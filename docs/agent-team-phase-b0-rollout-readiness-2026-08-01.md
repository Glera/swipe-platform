# Agent Team Phase-B0 — merged rollout readiness

Date: `2026-08-01`
Scope: unattended deterministic base A1 on the reserve Mac
Implementation merge: `Glera/swipe-agents@1b31b64dd9a3554179d5ce8eb2ed0521479c98b4`
Evidence merge: `Glera/p4g-workspace-meta@14b5e0115495bdebaaedb59c3a7d94b6caf0f93f`

## Verdict

The exact reviewed Phase-B0 implementation is merged and its immutable
runtime candidate is reproducible. The reserve Mac is **not yet eligible for
activation**: no public evidence yet binds a working external dead-man, the
current backup is on the same device as the data root, and FileVault is off
without a typed owner decision accepting that cold-boot boundary.

No release has been installed, `current` has not changed, no activation
receipt or live LaunchDaemon plist exists, and no unattended process has been
started. No secret was read or copied during this audit.

## Exact merge and CI evidence

- reviewed implementation head:
  `3dcf4ea2e63ced9bfed74a64e65b0e87c5a6727d`;
- merge commit: `1b31b64dd9a3554179d5ce8eb2ed0521479c98b4`;
- the reviewed head is an ancestor of that exact merge;
- merge-commit `verify` succeeded:
  <https://github.com/Glera/swipe-agents/actions/runs/30685907241>;
- reviewed evidence head:
  `1f9c4fdd25353d3d9b49829f10d42254dac9e817`;
- evidence merge commit:
  `14b5e0115495bdebaaedb59c3a7d94b6caf0f93f`;
- merge-commit meta verification succeeded:
  <https://github.com/Glera/p4g-workspace-meta/actions/runs/30685911634>.

The implementation review history and all closed P1-P3 findings remain in
`docs/agent-team-phase-b0-activation-readiness-2026-07-31.md`.

## Reproducible immutable runtime

Two clean checkouts of the exact implementation merge were independently
installed and built with Node `v24.18.0`. The first was also run through the
full test suite. Unbounded Vitest worker fan-out exposed one 30-second
`backup-commit-race` timeout under host contention; the exact test passed
twice in isolation and the complete suite passed with a four-worker bound:
`71/71` files and `438/438` tests. Exact-merge GitHub CI is green.

Before hashing, the release is normalized in two narrowly defined ways:

1. remove `.vite` and `.vite-temp`, which are test-run caches and are not
   runtime inputs;
2. replace clone-specific `.git` internals with a read-only directory
   containing only detached `.git/HEAD` with the exact 40-hex merge commit.

This is compatible with the reviewed runtime contract: Phase-B0 reads only
`.git/HEAD`, while the activation receipt independently binds every remaining
path, mode, symlink target and byte. The complete Git directories and test
caches from this construction were moved to the operator Trash, not silently
deleted.

Both normalized builds produced exactly:

```text
releaseCommit=1b31b64dd9a3554179d5ce8eb2ed0521479c98b4
releasePathsChecked=2990
releaseTreeDigest=eac6d743e5988f9e0aefd1c378f66872fd6fb978b2dcb6fe00b642027b8b71a6
```

The retained candidate is currently outside the live runtime tree at:

```text
/private/tmp/p4g-phase-b0-candidate.lbu6ew/runtime/releases/1b31b64dd9a3554179d5ce8eb2ed0521479c98b4
```

It is owned by the assistant account, not `p4g_runner`, and has no writable
real path. Installation must copy it to a fresh direct child of
`/usr/local/var/p4g/swipe-agents/releases`; it must refuse an existing
different destination. Installation does not imply a `current` switch.

A no-live-path installation rehearsal copied the retained candidate through a
fresh staging name into a disposable runtime root, atomically renamed it to
the exact commit child, and inspected it with the merged Phase-B0 scanner as
runner UID `502`. The installed copy still had zero writable paths and exactly
`2990` checked paths with tree digest
`eac6d743e5988f9e0aefd1c378f66872fd6fb978b2dcb6fe00b642027b8b71a6`.
The disposable copy was moved to the operator Trash after verification.

## Host-bundle identities

The exact-merge source-controlled installer completed its default no-write
run. The public artifact identities are unchanged from the activation-readiness
packet:

| Artifact | SHA-256 |
|---|---|
| `phase-b0-host.mjs` | `5c0674230896c9006dd9c35c2788e712f3ea6075a8f04953cd2fae4e5054fc71` |
| `p4g-agent-unattended` | `1bcfe898ade289f314f4a9f2adf07daf578341667f27f2e5935024dbad32d8d6` |
| `p4g-agent-deadman` | `7e98254a4cb7f8efb0da2ffbf08f4640649d4cbfc8709fd5aa236faa98820b9c` |
| `p4g-agent-phase-b0-check` | `8a8079c4fbd6cce8f031cbc50db0b1b11f974be19cd5d54222671b34918bf6da` |
| `p4g-agent-phase-b0-prepare` | `0d68b4950e16b786c31ac1a25179226686b8b7c74c2435a247b55dc427125f5b` |
| `p4g-agent-phase-b0-publish` | `e55ce5297a89e8466eb45a1d33e83ac1be37bc24a34c611fd089330f394cf8ea` |
| `p4g-agent-phase-b0-control` | `a3ea6003e75079cb763d653b4b509f562a641676f2b6483b48e461b5310341f3` |
| host policy | `32f3d0912765b696356efec9b505552a4b2dd0d09229a83f9f225960eb49dd5f` |
| supervised staged plist | `9106a7eefd8d9f835f935db48e32584652991718d7997997f611b3a800594446` |
| dead-man staged plist | `10427ede008e7b1b4bf656c49203357763e3f58dfacb267be951e8698e5075fb` |

Semantic Phase-B0 policy digest:
`d3d1080be20f217e1e80ad7909e8e09a397c328da50b4d6cfaf826ddc3f6a617`.

## Read-only reserve-Mac audit

Observed without reading `agents.env`, Telegram values, store contents or any
credential:

| Boundary | Observation | Result |
|---|---|---|
| Node | `/usr/local/bin/node` is `v24.18.0` | ready |
| runner | `p4g_runner`, UID `502`, no `admin` group | ready |
| required tools | native `caffeinate`, `launchctl`, `plutil` present | ready |
| backend health | reviewed public health endpoint returned HTTP `200` | ready |
| live release | `current -> releases/aa91b2be1cc74632fdc8fb75d355172237c656e8` | unchanged |
| launchd | both Phase-B0 labels not loaded | safely disabled |
| live plists | both `/Library/LaunchDaemons` files absent | safely disabled |
| activation receipt | absent | safely disabled |
| power settings | system sleep remains `1`; Phase-B0 will use process-scoped `caffeinate -is` | ready |
| FileVault | `FileVault is Off.` | owner decision required |
| backup boundary | `/Users/p4g_runner/swipe-agents-backups` and `/Users/p4g_runner` are both device `16777220` | blocked: not independent |
| external dead-man | no public evidence of a configured endpoint; secret not inspected | blocked |

The data root itself was not traversed because the assistant account does not
have access to the runner's private directory. Mount metadata shows no
separate volume under `/Users/p4g_runner`; the same-device backup observation
is therefore sufficient to reject the `distinct_device` claim, not to approve
any alternative.

## Exact next gates

These remain separate acts and must not be collapsed:

1. **Release files.** Owner authorizes copying the exact candidate to the
   immutable releases directory and installing only the reviewed host bundle
   plus staged plists. No `current` change, receipt or `launchctl` call.
2. **Independent backup.** Provide either a distinct mounted device or a
   separately reviewed remote-sync attestation. The existing local backup is
   not sufficient.
3. **Cold boot.** Either enable FileVault and accept human unlock after power
   loss (`filevault_manual_unlock`), or explicitly accept the at-rest risk of
   the current state (`filevault_disabled_headless_boot`). It must not be
   inferred from `FileVault is Off`.
4. **External dead-man.** Verify any existing external HTTPS monitor or create
   one if absent, exercise its absence alert, and bind it in public evidence.
   Its secret URL stays only in the runner's mode-0600 `agents.env`; never
   paste it into chat or a public receipt.
5. **Installed-but-disabled preflight.** Inspect installed ownership, modes,
   artifact hashes and the release tree while jobs remain disabled and
   `current` remains unchanged.
6. **Activation identity.** Separately authorize the `current` switch, create
   the public candidate and publish the root-owned activation receipt.
7. **Bootstrap.** Separately authorize `launchctl bootstrap` and a bounded
   48-hour acceptance window.

The 48-hour acceptance must prove: one effective runtime; exact physical
release and activation digest; successful scheduled backups; external
dead-man continuity and absence alert drill; crash/restart lease takeover;
one real reboot; health recovery; no duplicate Telegram provider IDs; no
`send_started`/`outcome_unknown` residue; fail-closed behavior on a deliberately
invalid receipt; and the emergency disable/reenable path. A1.1/B1, Finance
live collection/delivery, cohort cron and scheduled LLM sessions remain off.

Emergency rollback remains:

```zsh
sudo /usr/local/var/p4g/swipe-agents/bin/p4g-agent-phase-b0-control disable
```

No later role inherits authority from a successful Phase-B0 acceptance.

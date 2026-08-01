# Agent Team Phase-B0 — activation-readiness packet

Date: `2026-07-31`  
Scope: unattended deterministic base A1 on the reserve Mac  
Implementation: `Glera/swipe-agents` PR #11  
Exact implementation head: `3dcf4ea2e63ced9bfed74a64e65b0e87c5a6727d`  
Reviewed base: `35e48688bea8cccdc4db45975fa23a2e961653f2`

## Verdict

Phase-B0 is **activation-ready**: implementation is complete, exact-head CI is
green, and the final independent diff-only review of `3dcf4ea2…` is clean with
no open P1-P3.

Nothing in this packet authorizes merge, release construction, installation,
an activation receipt, `launchctl bootstrap`, a credential or live delivery.
The reserve Mac has not been modified by this implementation round.

## Why this is the next agent-system rung

The seven-day Phase-A quiet week completed on the accepted deterministic A1
release. The observed host-idle network pause demonstrated that an attended
terminal session is not a sufficient always-on process boundary. Phase-B0
therefore graduates only the already accepted deterministic base A1 into a
system LaunchDaemon with process-scoped power containment.

This is not an LLM-agent scheduler. It does not enable A1.1/B1, cohort cron,
Finance live collectors or sender, a Claude session, git mutation, deploy,
publication, flags, payments or any other business action.

## Frozen host contract

- system LaunchDaemon processes run as non-admin `p4g_runner`;
- `/usr/bin/caffeinate -is` is process-scoped; no global `pmset` mutation;
- standalone bot gate remains `AGENTS_ENABLE_BOT=0` while the accepted
  supervised poller/sender remains within base A1;
- `env -i` gives the host preflight and supervised runtime an allowlisted
  environment, excluding inherited acceptance, backend overrides,
  production-actions, finance and Node injection variables;
- `current` resolves once to an exact physical release child;
- no release path may be owned by `p4g_runner` or writable by that identity;
- the activation receipt binds Git commit **and** a deterministic digest over
  every release path, mode, symlink target and file byte;
- the external HTTPS dead-man URL is secret, while only its SHA-256 identity
  is present in public receipts;
- same-disk backup does not graduate from Phase A: activation requires a
  distinct device or a typed remote-sync attestation digest;
- FileVault cold-boot behavior is an explicit typed operator decision;
- install, activation publication and launchd bootstrap are three separate
  human acts;
- disable boots out both jobs, persistently disables their labels, removes
  live plists and atomically writes `enabled:false`.

The full operator contract is in
`swipe-agents/docs/runbook-phase-b0-unattended.md` at the exact head above.

## Independent-review dispositions

The first adversarial review returned three P1 findings and one P2. All four
were accepted and fixed in `7c43083d…`. Its successive diff-only closure
passes found five additional boundary defects; every one was accepted,
reproduced and fixed through `3dcf4ea2…`.

| Finding | Disposition |
|---|---|
| P1: installing plists directly into `/Library/LaunchDaemons` could cross the bootstrap gate after a reboot | Plists are staged under the root-owned runtime tree. Bootstrap first persistently disables both labels, performs attended preflight and a real dead-man ping, then copies/enables/loads; every observed failure path disables, boots out and removes live plists. |
| P1: a read-only release owned by `p4g_runner` could be chmodded and changed later | Every release path is rejected when its owner UID is the runner, in addition to the existing owner/group/other write-bit and escaping-symlink checks. |
| P1: Git HEAD did not bind ignored/stale `dist` or dependency bytes | Activation now contains `releaseTreeDigest`; prepare and every preflight recompute a length-delimited deterministic digest over the complete physical release tree and require equality. |
| P2: inherited supervised variables could redirect probes or enable production-action polling | All runner Node entrypoints and the final supervised process cross an `env -i` allowlist. Backend host/port and production-actions are absent; health, NTP, environment and lab origin are exact reviewed values. |
| R2 P1: macOS symlink mode bits could reject ordinary internal `node_modules/.bin` links | The scanner hashes an internal symlink's path, literal target and reported mode but does not interpret ignored symlink write bits; the resolved target must remain inside the release and its real object is checked normally. |
| R2 P2: an intermediate plist install or label-enable failure could bypass explicit cleanup under `set -e` | An `EXIT` trap is armed immediately before the first bootstrap side effect and remains armed through the loaded-state proof. Every command failure or signal takes the same idempotent disable/bootout/remove path. |
| R3 P1: an internal link could leave through an external mutable symlink and re-enter before the final `realpath` check | Both the literal target boundary and final canonical target are checked; an external target is rejected even when its current destination points back to a release artifact. |
| R4 P1: `path.resolve` could collapse `..` before following an external symlink component, hiding a leave-and-re-enter path | Resolution now walks every component and nested symlink recursively. The boundary is checked after each hop, absolute targets and cycles fail closed, and the exact external-component/`..` bypass is a regression test. |
| R5 P3: a malformed target could continue through a regular-file component because `realpathSync` normalizes later syntax | Every continued component, including `.`, `..` and a trailing separator, first proves the current object is a directory. File/continuation targets fail closed and are covered by two regressions. |

Regression coverage includes byte mutation after receipt creation, a
read-only runner-owned tree, both symlink re-entry classes,
inherited-authority exclusion, and the staged launchd ordering/rollback
contract.

## Verification

### Exact implementation head

- focused Phase-B0 suite: `20/20` passed;
- full local `npm run typecheck && npm test`: `71` files, `438/438` passed;
- native `plutil -lint`: both plists passed;
- native `zsh -n`: all seven wrappers passed;
- `git diff --check`: passed;
- GitHub Actions `verify`: success on exact head, run
  <https://github.com/Glera/swipe-agents/actions/runs/30669047420>.

The installed Finance v1-A release was read-only scanned without reading its
environment, store, secrets or processes. It satisfies the Phase-B0 ownership
and immutability boundary: `3016` paths, deterministic tree digest
`368f2c0ea086d76e4459ee28ec41887b4f5cc233968aaf8d72d6a6f111ed2e86`.
This proves compatibility of the host boundary, not authority to activate
that release.

The exact-head installer dry-run completed with no write and emitted these
public host-bundle identities:

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

The semantic JCS policy digest remains
`d3d1080be20f217e1e80ad7909e8e09a397c328da50b4d6cfaf826ddc3f6a617`.

## Explicitly unchanged

- no file under `/Library/LaunchDaemons` or `/usr/local/etc/p4g` was written;
- no launchd job, unattended process or `caffeinate` process was started;
- no release symlink, store, secret, Telegram binding or OS power/FileVault
  setting changed;
- no PR was merged and no release was built;
- A1.1/B1, Finance live collection/delivery, cohort cron and scheduled LLM
  sessions remain disabled.

## Remaining human gates

After final independent review closes with no P1-P3, the owner still decides
each of these separately:

1. merge exact `swipe-agents` PR #11 head;
2. build/install a new immutable release and install only the reviewed host
   files plus staged plists;
3. choose an external dead-man provider/destination without disclosing its
   URL, and supply the URL in the existing mode-0600 `agents.env`;
4. provide independent-backup evidence: distinct device or reviewed
   remote-sync attestation;
5. choose `filevault_manual_unlock` or separately accept
   `filevault_disabled_headless_boot`;
6. approve activation-receipt publication;
7. approve launchd bootstrap and a bounded unattended acceptance window.

The one-step emergency rollback after enablement is:

```zsh
sudo /usr/local/var/p4g/swipe-agents/bin/p4g-agent-phase-b0-control disable
```

No later agent role inherits authority from Phase-B0. A1.1/B1, Finance live
sources/sender and any LLM role each retain their own release, credential and
acceptance gates.

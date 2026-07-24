# Reserve Mac A1 — next-decision packet (2026-07-24)

Status: **implementation and attended smoke verified; physical
backup/restore receipt pending one `p4g_runner` command.**

This packet is evidence, not authority. It does not authorize merges, backend
deploy, unattended A1, A1.1/B1, reboot/takeover, or quiet-week start.

## Authority boundary

The owner authorized:

- merge of backend PR #7 at reviewed head `7231f085`;
- merge of agents PR #2 at reviewed head `d88ed17b`;
- merge of meta PR #1 at reviewed head `6e4762a`;
- build and installation of one new immutable A1 release on the reserve Mac;
- an attended backup/restore drill into a fresh data root.

The owner explicitly did not authorize backend deploy, unattended operation,
A1.1, or B1. Reboot/takeover and quiet-week start remain separate decisions.

## Merged and installed facts

| Artifact | Evidence |
|---|---|
| Backend | PR #7 merged as `4eaafab637068993e8a96654ca86495c91e3652a`; no deploy performed |
| Agents | PR #2 merged as `f75841d843a47a21cebee4b363c9d60402f51865` |
| Meta | PR #1 merged as `a83bd320e51486942b870a72d5a14f8665225c57` |
| Reserve release | `current -> releases/f75841d843a47a21cebee4b363c9d60402f51865`; Git HEAD exact; zero writable release paths; prior `ea243275…` release preserved |
| Release verification | 349/349 full tests and 67/67 acceptance from the clean built commit |
| Runtime config | `p4g-agent-check` ended in `supervised.check ok`; all policy/schedule/health/suppression/detector digests are recorded in swipe-agents PR #3 |
| Telegram binding | digest, attention, and incident groups all bound to non-zero ids; raw ids are not repeated in this packet |
| Attended smoke | both leases `held`; one scheduled run completed 8 probes with no signal/delivery side effects; `Ctrl-C` emitted `supervised.stopped`; no process or launchd job remained |

The first published release directory inherited an overly narrow staging mode
and correctly failed cross-user `cd`. Permissions were corrected to
`a+rX,a-w`; content and Git HEAD did not change. This is recorded rather than
hidden.

## Closed review dispositions

The two backend P3 findings were already fixed in reviewed head `7231f085`:

- registration rejects subject ids containing all forbidden render tokens;
- registration rejects a cohort whose conservative single-message render
  bound exceeds Telegram's 4096-character limit.

Targeted tests on current backend `master` passed 9/9. No follow-up backend PR
or deploy is required for those findings.

## Open, green PR graph

No PR below is authorized for merge by this packet.

| PR | Exact head | Base | Purpose | Evidence |
|---|---|---|---|---|
| [swipe-agents #3](https://github.com/Glera/swipe-agents/pull/3) | `ab34b6e2f3a85b6fc29cfa8af8cd3dbc7e2be9c9` | `main` | reserve-host acceptance ledger and installed config digests | CI green |
| [swipe-agents #4](https://github.com/Glera/swipe-agents/pull/4) | `ee1887055b6a99e1cc5f8f814e4575f41d01e032` | `main` | build entrypoints before `npm test`, removing clean-checkout scheduling flake | 349/349 + 67/67; CI green |
| [swipe-agents #5](https://github.com/Glera/swipe-agents/pull/5) | `8e74525f744edc93db2c7766bec2eeede7d52ee3` | PR #4 | Ajv/fast-uri/Vitest advisory fixes | `npm audit`: 0; 349/349 + 67/67; CI green |
| [swipe-agents #6](https://github.com/Glera/swipe-agents/pull/6) | `d7c618fb64888cff286832c0eb68ae5881f6482c` | PR #4 | make backup, migration, and default-off bot direct entrypoints symlink-safe | 352/352 + 67/67; CI green |

PRs #5 and #6 are intentionally stacked on #4 because their regression runs
execute built `dist` entrypoints. After #4 merges, each can be retargeted to
`main`; neither depends on the other.

## Installed dependency advisory disposition

The installed `f75841d…` release still contains the versions reported by the
pre-fix npm audit. Source-level reachability inspection found:

- Ajv is constructed without the advisory-specific `$data` option, and no
  committed schema uses `$data`;
- schemas are committed assets rather than attacker-supplied schema/URI
  authorities, so the fast-uri host-confusion path is not exposed as an A1
  input boundary;
- Vitest is dev-only and its UI server is never started by A1 runtime commands.

Disposition: include PR #5 in the next separately approved immutable release;
the audit does not independently authorize an emergency rollout.

## Backup/restore drill

Host command installed:

```text
/usr/local/bin/p4g-agent-backup-restore-drill
```

Properties of the installed wrapper:

- requires the non-admin `p4g_runner` user and Node 24;
- pins exact installed release `f75841d…`;
- refuses while supervised is running;
- dry-runs before writing;
- writes a new snapshot and restores only into a fresh drill data root;
- requires non-zero event count, SQLite integrity `ok`, replay drift zero,
  evidence missing/mismatch zero, no ambiguous deliveries, and RTO ≤ 1 hour;
- makes no Telegram call;
- proves the live `current` symlink and physical target are unchanged;
- emits a mode-0600 receipt and snapshot SHA-256.

Installed wrapper SHA-256:

```text
30113f73b14213e3703db86591bb8d80add1f8b9ae620efcb019b28fb2810984
```

A fully isolated synthetic store passed the same core path:

```json
{"event":"synthetic-drill.verification","ok":true,"eventCount":1,"stuck":0,"unknown":0,"promoted":0,"integrity":"ok","drift":0,"evidenceChecked":0,"evidenceMissing":0,"evidenceMismatched":0,"rtoMs":115,"telegramCalls":0}
```

This does **not** close the physical gate. The remaining owner action is exactly:

```bash
p4g-agent-backup-restore-drill
```

After its receipt is captured, update agents PR #3 and this packet with
snapshot bytes/hash, event/evidence counts, measured RTO, reconciliation state,
unchanged-live proof, and the receipt path. Never copy token/env contents.

## Next human decision after the physical receipt

Recommended merge/release decision order:

1. review and merge agents PR #3 (evidence only);
2. review and merge PR #4;
3. retarget, review, and merge PRs #5 and #6;
4. decide separately whether to build another immutable **A1 patch release**
   containing those fixes; do not mutate `f75841d…` in place.

Even after those decisions, the following remain closed:

- backend production deploy and N=1 production dry-run;
- unattended A1 service installation/enablement;
- reboot/takeover physical drill;
- quiet-week start;
- A1.1 and B1.

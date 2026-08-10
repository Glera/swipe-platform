# Labs Fast Lane — Smash Fest add execution receipt

Date: 2026-08-10 (UTC)

Status: **NEEDS_HELP before Smash candidate creation**.

This is bounded Tier 0 content/onboarding evidence for
[ticket #82](https://github.com/Glera/p4g-workspace-meta/issues/82). Product
authority remains `docs/specs/lab-playable-release-fast-lane.md`. No Family A
branch or sandbox record was read or changed.

## Exact source discovery and admission

Read-only discovery started at `2026-08-10T07:35:00Z` and found that the
requested mechanic was not yet on remote `playables/master`:

- intake master: `cb581e71e57f60822247d8ac2077e73adff86e88`, root tree
  `b9bc5870ee349bf054b632edd0d22d477f6271f7`;
- pushed ref: `refs/heads/codex/smash-fest-depth-v2`;
- pushed commit: `99a0984a9811b3d29f0971db5449fbe11685ea05`, root tree
  `b4b9e024726cfa8aa415db2e8d8659a71325a250`;
- discovered source id/path: `smash-fest-v1` / `smash-fest-v1/`;
- exact source tree: `78194cd91c8f13a247bf0acceddaea8494c51364`;
- exact `src/` tree: `e449af485d3580f6c3c2a3df6edf073b4288699f`;
- merge-base: `45d5dc81a73184f6ebac1f5dcb197ec0f143f872`;
  master was 54 commits ahead and Smash Fest 11 commits ahead;
- the pushed package lacked the required non-empty
  `test:smash-fest-v1:technical` convention.

After the durable ticket existed, the existing content was imported without
changing either Smash source tree. The only manual conflict was the root
package-script list; it was resolved as a union and gained the per-mechanic
technical alias. No shared runtime or pipeline logic changed.

- playables PR: [#14](https://github.com/Glera/playables/pull/14);
- reviewed candidate head: `e6de2a24fa95d72561430e87bc83c3e71cc425d5`;
- merge commit / current admitted source commit:
  `5cbc5578beded5eb73abd6ddff85e9eed821739e`;
- admitted master root tree: `be0887778afe89a7a460df2ba1a7ac4b8cbf7e29`;
- admitted source tree: `78194cd91c8f13a247bf0acceddaea8494c51364`;
- admitted `src/` tree: `e449af485d3580f6c3c2a3df6edf073b4288699f`.

## Technical, visual and cover evidence

The first technical-profile attempt intentionally failed closed because the
runtime test requires a built SWIPE artifact. The package alias was corrected
to run unit/model/physics/presentation checks, build `smash-fest-v1`, then run
the real browser lifecycle test. The resulting exact profile passed:

- model/physics/presentation: 27/27;
- browser runtime: PASS in `63.065s`; real tap takeover, pause/resume, restart,
  five-level autoplay win and page/console-error checks;
- SWIPE build: PASS, runtime digest produced by the build path;
- visual proof: PASS at
  `2026-08-10T07:44:16.594Z`, base
  `3ff501137ce0aac9b230e4404a583da0ded3844e`, after-patch digest prefix
  `d42571e0bd9a`; before `59.124s` win, after `60.140s` win, both mounted,
  `pageErrors=[]`, `result.json` SHA-256
  `a9ab2020316253c643dba09a17ecd6b9d26d4708b780606a0498f7f9551fefbb`;
- the after proof visibly progressed from live targets/projectile to
  `RANGE CLEARED`; no blank frame, clipping or error overlay was observed;
- default tall cover: valid JPEG `780x1200`, SHA-256
  `d42c72288268b70ed3bb76e7404eedc073b988c597ca29e7a9d9416df0dc6c86`;
- default compact cover: valid JPEG `960x1200`, SHA-256
  `763a9d80e08cf2a0fd6e31307b95a22af28b24231091d8ff66b3a4e2774e82d5`.

These cover hashes are pre-admission evidence, not frozen Fast Lane release
identities. A future resumed release must rebake and freeze both covers again.

## Terminal blocker

When Smash Fest became eligible on remote master, the one-writer Fast Lane was
already held by an unrelated Two Dots rework:

- release `6c267c01-1fc5-4137-a2c6-e81142d67972`;
- state `READY_FOR_APPROVAL`;
- source `orthogonal-link-v1@dae6f2d114a57cd8c8799f5071a37b3b5f63820b`;
- candidate commit `46144eb2a05a276fa122ae5f74876e4b9b7801cc`;
- candidate hosted at `2026-08-10T07:41:41.588Z`;
- its first exact authorization expired at `2026-08-10T07:51:46.656Z` and
  automatic intake renewed the same unrelated intent through
  `2026-08-10T08:01:47.428Z`.

The existing service rejects a new release while any prior release is
unfinished. This ticket has no authority to approve or cancel another exact
candidate. Therefore Smash Fest did not receive a `releaseId`, candidate URL,
Telegram intent, static commit, mapping, roster plan or activation. Production
static, mapping and roster were not changed by Smash Fest.

Resume **the same ticket #82** after the existing release becomes terminal.
The safe next action is the ordinary Labs `add` input:
`smash-fest-v1`, catalog `destruction/smash-fest-v1`, family `destruction`,
series length `1`, placement after `orthogonal-link-v1-swipe`. No pipeline
refactor is authorized by this receipt.

## Timing

| Phase | UTC interval | Duration | Result |
| --- | --- | ---: | --- |
| source discovery / preflight | 07:35:00–07:37:42 | 2m42s | exact pushed ref and two fail-closed admission gaps found |
| durable ticket + source admission + technical/visual/cover preparation | 07:37:42–07:47:52 | 10m10s | ticket #82, PR #14 merged |
| admitted remote-master verification | 07:47:52–07:48:21 | 29s | exact source trees preserved |
| existing-release queue wait | 07:48:21–07:53:16 | 4m55s | lane remained occupied |
| Smash `READY_TO_PLAY` | — | not started | no Smash release record |
| Smash operator approval wait | — | **0s** | approval was never requested |
| publication / mapping / roster CAS / live verification | — | not started | no Smash production mutation |

- wall time to terminal `NEEDS_HELP`: **18m16s**;
- active agent/system time excluding the external queue: **13m21s**;
- unrelated Fast Lane queue wait: **4m55s**;
- Smash operator-wait time: **0s**.

The 15–20 minute add target was not met as an outcome: the wall clock reached
the target band without producing a Smash candidate. The single largest
bottleneck was **source admission** (`10m39s` including final remote-master
verification): the pushed mechanic was divergent from master and lacked the
conventional technical profile. The terminal blocker was the already occupied
serial Fast Lane (`4m55s` observed). No follow-up refactor was started.

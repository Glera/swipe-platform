# Labs Fast Lane — Smash Fest add READY receipt

Date: 2026-08-10 (UTC)  
Ticket: [p4g-workspace-meta #82](https://github.com/Glera/p4g-workspace-meta/issues/82)  
Status: **PASS to the authorized boundary: `READY_FOR_APPROVAL`; publication and activation not authorized**.

This resumes the preserved admission recorded in
`labs-fast-lane-smash-fest-add-needs-help-receipt-2026-08-10.md`. It does not
repeat source admission and does not touch Family A records.

## Exact preflight

All supplied read-only CAS identities matched before the release write:

| Authority | Exact identity |
| --- | --- |
| Feed master / live `release.json.feedCommit` | `807185578e544b2732d18c2d4458932f6dab98ea` |
| Static master/live baseline | `4f0a9c4fcf7529bc4ba0ae64b3232c8b1d2f617d` |
| Playables master / source commit | `a1d86ee337e3d3b0cf4124d881ca8f7c83e530ee` |
| Backend master/live code | `4ceb69889167c084b4976bd15ba81186352b64cf` |
| Generator live | `a90b25f4ff5b4066d168a16455becaf4369b6e84` |

The admitted Smash source tree remains
`78194cd91c8f13a247bf0acceddaea8494c51364`; its `src/` tree remains
`e449af485d3580f6c3c2a3df6edf073b4288699f`. The prior visual proof is exact
source-compatible (`result.json` SHA-256
`a9ab2020316253c643dba09a17ecd6b9d26d4708b780606a0498f7f9551fefbb`).
The unrelated Two Dots release remained `READY_FOR_APPROVAL` and was neither
approved, rejected nor cancelled. Parallel preparation v1 permits this distinct
mechanic to prepare without entering the serialized publication lane.

## Candidate receipt

- release: `ab5e07b9-f129-4fc3-aa91-3880bb4f1df7`;
- source/playable/mode: `smash-fest-v1@a1d86ee337e3d3b0cf4124d881ca8f7c83e530ee` /
  `smash-fest-v1-swipe` / `add`;
- runtime version/digest: `77af2f8c4d` /
  `sha256:fdb14decba62f3cd8584a974f6f2558faf4ae2e855ea3b1f272350b16ca166a8`;
- artifact / manifest-entry digests:
  `59813b9f50ee30654efd67691745c0f239ca8dd2b1cdda6e62b08f078e3eed23` /
  `33d479eb2367f442190c9a71fd3ea344a781a90dd9e0016a62cc068b29fdff06`;
- tall cover: `780×1200`, SHA-256
  `3e973b50fd0fef8ed0bc57c286e908316182f79f04b29a12cb313998eb126e7f`;
- compact cover: `960×1200`, SHA-256
  `3f1551a519b21581daee8df043d2e901a628c55cf4c99fe0f0bbe7f485397eef`;
- candidate commit: `2773e79724caccc1ba6671a4ff2a5be8859e0187`, direct child of the
  static baseline; HTTPS candidate:
  <https://swipe-platform.onrender.com/playable-previews/ab5e07b9-f129-4fc3-aa91-3880bb4f1df7/smash-fest-v1-swipe.html>;
- candidate HTML / review-binding digests:
  `0c440e41bedfe0c367b6861ca7d43704d7a95b7f6d77def38261c1e3667b76b0` /
  `7bb2cec2459b56157ee3d69855b0698fe9eb32af59737e47edc255cf7264f617`;
- exact release intent digest:
  `d38ed2698c503fac48dd23be487b6535ed1149b62aa716de93cb9b0e54c98a51`.

The standard candidate path reran `test:smash-fest-v1:technical`, SWIPE build,
both default cover bakes and fail-closed artifact hosting. All candidate files
match the frozen local SHA-256 values over HTTPS. A real pointer changed the
live candidate from range 1 to range 2; no page/console error was observed.
The focused feed route projected **`Готово к проверке`** and correctly
failed closed without Telegram `initData`.

Exactly one durable READY notification was confirmed: attempt count `1`,
provider message `56`, `replayed=false`. Server-owned operator review link:
<https://t.me/swipeit_bot?startapp=pr_ab5e07b9-f129-4fc3-aa91-3880bb4f1df7>.

## Frozen add plan; not applied

- mapping `aebca46d-6617-5e02-8793-2a4dd2cf1b43`;
- variant `d9a350f8-8fa0-532a-a510-24ae764a15ef`;
- catalog/family: `destruction/smash-fest-v1` / `destruction`;
- roster mutation `7fcce1e5-9bc7-46e9-b6ac-f4d79ff92c33` with expected current
  activation `5671e39c-7512-48c6-8769-4ebca5945a2f`;
- placement after `orthogonal-link-v1-swipe`, series length `1`;
- planned deploy-manifest digest
  `2647814a719ea96e161e3000ac10ec1d2d7d5e93a5e5efea2068fc5aa28f5580`.

Production `versions.json` still has no `smash-fest-v1-swipe`. No static
publication, mapping apply, roster registration/CAS activation, backend deploy,
DB migration, credential/env/permission change, public rollout or retry occurred.

## Timing

| Phase | UTC interval | Duration | Result |
| --- | --- | ---: | --- |
| instrumented resume preflight | 14:20:24–14:23:40 | 3m16s | five identities, ticket, worker/release state and add collision/anchor checked |
| technical/build/cover preparation | 14:23:41.724–14:25:15.812 | 1m34s | technical, SWIPE build, both covers and frozen artifacts PASS |
| `READY_TO_PLAY` hosting | 14:25:15.812–14:25:37.821 | 22s | immutable candidate and binding verified over HTTPS |
| READY notification | 14:25:37.821–14:25:38.702 | <1s | exactly one confirmed message |
| operator approval wait | — | **0s** | executor stops before approval by scope |
| publication / mapping / roster CAS / production live verification | — | not authorized | not started |

Instrumented wall and active agent/system time to READY are both **5m15s**;
operator-wait time is **0s**. The preflight began after `14:17:05Z` but its
earliest setup was not clocked, so the conservative total bound is
**5m15s–8m34s**. Against the previous terminal run, instrumented wall improved
from `18m16s` by `13m01s` (71%), and active time improved from `13m21s` by
`8m06s` (61%). This is within the 15–20 minute new-mechanic target even under
the conservative bound. The largest measured resumed phase was source/platform
CAS and release/worker preflight (`3m16s`); no follow-up refactor was started.


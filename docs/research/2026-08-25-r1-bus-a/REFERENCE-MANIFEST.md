# Bus A R1 — reference manifest

## Primary reference

| Field | Value |
| --- | --- |
| Title / publisher | Bus Jam / Rollic Games |
| Android package | `com.nt.games.busjam` |
| Unified identity | iOS `6450176534`; unified `64998f879db92b7adfa0f490` |
| Version | `82.6.1` (`versionCode=5625`) |
| Store source | Google Play; installer `com.android.vending` |
| Capture date | 2026-08-25 |
| Device | Samsung SM-A326B, Android 11 / API 30 |
| Display | `720×1600`, `300 dpi`, portrait, `60 Hz` |
| Device identity | SHA-256 `ede55d41e11f9f29d462594cdc00d8d1b4db13f9744dbebe01b3ea47c3e1e27c` (raw serial local-only) |
| Raw artifact root | host-local `.research-artifacts/bus-a-r1-20260825/` |
| Raw manifest | SHA-256 `2358aab827bb1f3dd42548a557ada54f6690ee5892567efbb257db3d1ad89479` |
| Lab doctor | `PASS`; one authorized device; animation scales effective `1.0` |

Identity was confirmed durably in
[#172 c.5410816905](https://github.com/Glera/p4g-workspace-meta/issues/172#issuecomment-5410816905).
The charter correction is merged in
[#179](https://github.com/Glera/p4g-workspace-meta/pull/179).

On-device source digests, without copying APKs:

| Split | SHA-256 |
| --- | --- |
| `base.apk` | `5665c61b1b7c8e72cb612413df7da4c79ef035ec42342c2b86a496caaf3b9eab` |
| Unity data asset split | `7d8e8a052ad4cec462357d4627ce29a324fbb977b36500cf3aab17f8623863ef` |
| arm64 config split | `05cbd6a538b563b9a2b6899d7e7899482d8ce410137b61273a4aa2f54372e259` |

No APK, foreign source, credential, raw device identifier or captured
trade-dress byte is committed.

## Canonical evidence

| ID | Host-local artifact | SHA-256 | Status / use |
| --- | --- | --- | --- |
| `BR1-E01` | `initial/first-launch-clean.mp4` | `5574651b6131330baad9093fd788898718a7882d15d562aefb6d9ca4918217d9` | accepted; 89.931078 s; terms, splash, tutorial |
| `BR1-E02` | `levels/level-002/gameplay-clean.mp4` | `05dea09f4e44948b97d7acdc682ea829cab1fd7d544ed134f036777b6d9f25a1` | accepted canonical gameplay; 92.384611 s |
| `BR1-E03` | `failures/level-004-buffer-full/fail-clean.mp4` | `7da48222753ce3dc5d53fc8ed186ff2f2fc53b65c7e259362d69f62f671bc626` | accepted capacity fail / heart-loss path; 49.866156 s |
| `BR1-E04` | `assists/level-008-undo/undo-clean.mp4` | `32f5174235877a099754a18711291d4b1abeab9ad7a378d3f47b93b075dcbf4d` | accepted Undo assist; 24.832689 s |
| `BR1-E05` | `scenario-level1-complete-idle-tap/clean.mp4` | `14830eab63d9d2fdcc0844854f6570f68ca0e602ab8ade45f3ac654dbc51ca2d` | accepted clean channel; 7.873589 s |
| `BR1-E06` | `scenario-level1-complete-idle-tap/instrumented.mp4` | `fe0c80deb7c4992df4f93de56c68ccfc7023d49932102e4ed261bccae8fc3d41` | accepted instrumented channel; 7.995300 s |
| `BR1-E07` | both scenario start frames | aHash `047e7e3c1800ff00` | pHash distance `0`, threshold `12` |
| `BR1-E08` | level 4 initial / post-retry states | crop aHash `fdfe3cff3c380000` | restart equivalence distance `0` |
| `BR1-E09` | `progression/level-008-unlock/initial-or-unlock.png` | `84a073f707bcb51819504bad61b66ad74f9a12435c305ab94443b17998ce0071` | accepted first Undo unlock |

`reference-lab scenario verify` passes content hashes, media probes, normalized
state receipts and initial-state equivalence for the clean/instrumented pair.
The gesture offset was shell-controlled at 2 s; no independent high-resolution
input timestamp was captured, so it supports channel parity, not latency.

## Coverage

- first launch, terms acceptance and native tutorial;
- levels 1–7 completed and level 8 sampled;
- direct boarding, five-tile staging and automatic staged boarding;
- native overflow fail, one-life loss and exact retry;
- one and two counted tunnel ramps;
- Undo unlock/use and its rewarded-refill boundary;
- passive banner/full-screen monetization surfaces without interaction;
- matched clean/instrumented scenario pair and media-derived timeline.

## Exclusions and qualifications

- Level 3's automatically opened local profile editor was dismissed without
  saving; its screenshot is raw-only and supports no observation.
- Repeated taps on already emptied coordinates support no input-queue claim.
- Banner ads and video-marked reward/refill controls were not touched.
- `Undo` is classified as an assist, not an explain-hint.
- Level 8 was intentionally not completed after the bounded assist probe.
- Agent-operated capture durations are not human solve-time.

Full dispositions are in [`FAILURE-LEDGER.md`](FAILURE-LEDGER.md).

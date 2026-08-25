# Queens R1 — reference manifest

## Primary reference

| Поле | Значение |
| --- | --- |
| Title / publisher | ZooDoku / Nebula Studio |
| Package | `com.nebula.zoodoku` |
| Version | `1.0.7` (`versionCode=1071`) |
| Store source | [Google Play](https://play.google.com/store/apps/details?id=com.nebula.zoodoku) |
| Capture date | 2026-08-25 |
| Device | Samsung SM-A326B, Android 11 / API 30 |
| Display | `720×1600`, `300 dpi`, portrait, `60 Hz` |
| Device identity | SHA-256 `d54e29d5c32708148c45e6fc243b67424b0188a42eb5e1ee87a73cc46c7a04cc` (raw serial local-only) |
| Raw artifact root | host-local `.research-artifacts/queens-r1-20260825/` |
| Raw manifest | SHA-256 `7cac1332cdb24f1133ba5c74402e3fbe04590d220d64a5b45028d3ff8acf34cb` |
| Lab doctor | `PASS`; one authorized device; animation scales effective `1.0` |

No APK, foreign source code, credentials, raw device identifier or captured
trade-dress bytes are committed.

## Canonical evidence

| ID | Artifact | SHA-256 | Status / use |
| --- | --- | --- | --- |
| `QR1-E01` | `levels/level-013/gameplay-clean-scrcpy.mp4` | `2bc79ecfd6ed61c4887fe0044cb8a3bb43f627ef45edff56b39ae039f91b8f69` | accepted; 23.840056 s; actual placements, completion, leaderboard transition |
| `QR1-E02` | `levels/level-013/board.png` | `a4741bb140ab82fc9592f70744537af2d1c4d05e5dd8df0d5478e069b2775c05` | accepted initial board |
| `QR1-E03` | `scenario-level11-idle-tap/clean.mp4` | `68e4b4f5dffe0982ec88788cbca96fc7fc84b5e825d312c209bf8788f6e23063` | accepted clean channel, 7.020589 s |
| `QR1-E04` | `scenario-level11-idle-tap/instrumented.mp4` | `0089d4d7bed22b3382f8b96a4485c0693f36657c57bcd5f3871979573bd78459` | accepted instrumented channel, 7.025678 s |
| `QR1-E05` | both scenario start frames | `780a357bc0378e07d810b039cc571fd6f0a476286cf4173e1c6147803edf3ec1` | exact-equal start frame |
| `QR1-E06` | `scenario-onboarding-first-launch/clean.mp4` | `10b31671498e64ca72a80a83ba9b76b9d962db2c153f83275e7f37da2ab76154` | accepted Terms → consent-choice path, 24.827744 s |

The clean/instrumented pair passes `reference-lab scenario verify`: media and
content hashes pass, app/build/state receipts agree, perceptual start-frame
distance is `0` at threshold `12` (`aHash grayscale 8×8`, value
`ffff0f000001ffff`). Instrumented input overlay was enabled only for that
channel and restored afterwards.

## Coverage

- first launch, Terms acceptance and consent choices;
- full native tutorial;
- initial boards and completions for levels 1–10;
- level-size/given sampling through level 13;
- three-heart loss, zero-heart modal and restart;
- magnifier and lightbulb hints, including zero-count rewarded-ad boundary;
- daily reward/leaderboard interruptions and level-10 progression reward;
- one clean/instrumented scenario pair;
- one canonical real gameplay video and contact sheets.

## Exclusions

Rejected attempts remain in the raw manifest for audit but are not evidence:

- `initial/queens-r1-*` belongs to the initially misidentified package;
- `scenario-level1-tutorial-step1/clean.mp4` did not execute its intended
  double-tap while the device was locked;
- `levels/level-012/gameplay-clean.mp4` and derived frames are static because
  Android `screenrecord` did not capture the Unity surface updates;
- `levels/level-012/completed.png` contains a later leaderboard state and an
  unrelated notification overlay;
- `hints/magnifier-zero-gate.png` is a rewarded-ad frame, useful only as a
  safety-boundary receipt and never as gameplay/trade-dress evidence.

The full disposition is in [`FAILURE-LEDGER.md`](FAILURE-LEDGER.md).

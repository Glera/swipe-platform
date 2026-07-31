# Zen Match Levels 6–10 parity checklist

Status values: `measured`, `decision`, `gap`, `pass`, `fail`, `reopened`.

Current overall disposition: **Z2 technical evidence retained; Z3 taste
parity reopened**. See
[`TASTE-REVIEW-Z3-2026-07-31.md`](TASTE-REVIEW-Z3-2026-07-31.md).

## Rules and traces

- [x] Level 6 target completion wins with captured residual board/tray.
- [x] Level 7 target completion wins with captured residual board/tray.
- [x] Level 8 target completion wins with captured residual board/tray.
- [x] Level 9 clear-all requires empty board and tray.
- [x] Level 10 target completion wins with captured residual board/tray.
- [x] Non-resolving seventh placement fails (Level 8).
- [x] Seventh placement resolving a triple is safe (Level 10).
- [x] Undo replays exact before/after state (Level 8).
- [x] Magnet replays exact captured legal actions (Level 9).
- [x] Continue records cost `300` and restores exact captured state (Level 8).

## Presentation

| Row | Measurement / disposition | Status |
| --- | --- | --- |
| board assembly | Level 9 10 fps sheet: response `≤100 ms`, settled/interactive `~0.8–0.9 s`; current readiness `760 ms` retained | measured |
| tap → visible response | Level 8 60 fps sheet: `≤33 ms` | measured |
| board→tray flight | Level 8 60 fps sheet: approximately `0.28–0.35 s`; current `280–380 ms` path bucket retained | measured |
| concurrent accepted taps | state/presentation queue accepts rapid taps and reserves all seven slots; native exact overlap cadence not isolated | decision |
| grouped insertion/compression | captured causal order and deterministic browser projection match; exact easing is production-owned | decision |
| third landing → recognition | begins after observed landing; current `70 ms` retained inside 60 fps uncertainty | measured |
| sequential removal + particles | roughly `0.35–0.55 s` after recognition; current stagger/remove constants retained | measured |
| unavailable response | no continuous native interval; ZP-02 specifies the only authorized exact probe | gap |
| goal completion cadence | native fragments cross deadline/invalid MP4; ZP-04 | gap |
| fail cadence | native Level 8 event is after deadline; ZP-03 | gap |
| audio | off | decision |
| haptics | light / soft / rigid | decision |

## Originality and platform

- [x] Production build fails on resolved Twin module imports.
- [x] Five R1 Production Original levels pass all 25 cross-pair
  near-duplicate checks (`0.227644…0.540676 < 0.88`); exact
  geometry/exposure is rejected unconditionally.
- [x] Production objective volumes match the captured models:
  `15 / 18 / 27 / clear-all 36 / 12`.
- [x] Five Production Original levels have solver witnesses without tools.
- [x] Captured-primary / R1 observable-online / R1 deterministic-solver action
  counts remain in the declared per-level band:
  `49/48/68/35/54`, `47/47/65/36/56`, `48/51/63/36/51`.
- [x] Observable policy uses only exposed faces, geometry, tray and objective
  progress; covered-face swaps and opaque ID relabeling do not change its
  decision evidence.
- [x] Autoplay reaches each current objective.
- [x] First accepted manual tap takes over without reset.
- [x] Blocked/background tap does not cancel autoplay.
- [x] Pause/resume preserves result.
- [x] Terminal completion is emitted once.
- [x] Compact/tall/landscape and low-tier visual checks pass.
- [x] Updated native / neutral Twin / Production side-by-side and 15-second
  montage are attached; receipt binds manifest, extracted-evidence receipt,
  native frame SHA-256 and production build digest.
- [x] [Final independent review](REVIEW-Z2-INDEPENDENT-2026-07-30.md) is
  attached with verdict `PASS` for the previous technical scope.

## Z3 canonical runtime and level feel

- [x] Twin and Original are selected as datasets in one canonical runtime.
- [x] Renderer, input, presentation, viewport, terminal flow and lifecycle are
  identical between comparison modes.
- [x] Manual mode is forced for taste A/B; SWIPE autoplay is not a confound.
- [x] Release build contains neither Twin selector nor fixtures/provenance.
- [x] Twin and Original publish per-level silhouette/occupancy signatures.
- [x] Twin and Original publish initial exposed count/type entropy.
- [x] Twin and Original publish forced/choice and exposure/unlock curves.
- [x] Twin and Original publish blocker fan-in/fan-out signatures.
- [x] Twin and Original publish pair/triple availability curves.
- [x] Twin and Original publish tray occupancy/pressure curves.
- [x] Twin and Original publish target reveal/terminal cadence.
- [x] Original R1 remains solver-valid and below originality thresholds.
- [ ] Operator accepts same-runtime Original R1 taste parity.
- [ ] Independent review is repeated after operator disposition.

The current Garden Curios pack is `Original R1 / taste review pending`.
`Original R0 / taste parity failed` remains reproducible historical evidence;
it is not the active dataset. The two unchecked rows are authority gates, not
missing runtime, signature, solver or containment implementation.

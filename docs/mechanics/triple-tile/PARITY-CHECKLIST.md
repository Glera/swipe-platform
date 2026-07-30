# Zen Match Levels 6–10 parity checklist

Status values: `measured`, `decision`, `gap`, `pass`, `fail`.

## Rules and traces

- [ ] Level 6 target completion wins with captured residual board/tray.
- [ ] Level 7 target completion wins with captured residual board/tray.
- [ ] Level 8 target completion wins with captured residual board/tray.
- [ ] Level 9 clear-all requires empty board and tray.
- [ ] Level 10 target completion wins with captured residual board/tray.
- [ ] Non-resolving seventh placement fails.
- [ ] Seventh placement resolving a triple is safe.
- [ ] Undo replays exact before/after state.
- [ ] Magnet replays exact captured legal actions.
- [ ] Continue records cost `300` and restores exact captured state.

## Presentation

| Row | Measurement / disposition | Status |
| --- | --- | --- |
| board assembly | extract from capture; ZP-01 only if needed | gap |
| tap → visible response | extract frame interval | gap |
| board→tray flight | extract by path-length buckets | gap |
| concurrent accepted taps | captured behavior; independent extraction and browser replay pending | gap |
| grouped insertion/compression | captured behavior; side-by-side measurement pending | gap |
| third landing → recognition | extract frame interval | gap |
| sequential removal + particles | captured behavior; frame interval and side-by-side pending | gap |
| unavailable response | extract; ZP-02 only if needed | gap |
| goal completion cadence | per captured goal level | gap |
| fail cadence | extract; ZP-03 only if needed | gap |
| audio | off | decision |
| haptics | light / soft / rigid | decision |

## Originality and platform

- [x] Production build fails on resolved Twin module imports.
- [ ] Five Production Original levels pass near-duplicate gate.
- [x] Five Production Original levels have solver witnesses without tools.
- [x] Autoplay reaches each current objective.
- [x] First accepted manual tap takes over without reset.
- [x] Blocked/background tap does not cancel autoplay.
- [x] Pause/resume preserves result.
- [x] Terminal completion is emitted once.
- [x] Compact/tall/landscape and low-tier visual checks pass.
- [ ] Montage, side-by-side, delta list and independent review are attached.

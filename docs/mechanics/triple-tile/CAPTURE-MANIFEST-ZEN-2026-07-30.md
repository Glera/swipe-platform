# Zen Match native capture receipt — 30.07.2026

- Тип: **immutable evidence receipt**, не implementation/rollout status
- Reference role: **Zen Match secondary / Zen recovery authority**
- Parent packet: [`REFERENCE-PACKET.md`](REFERENCE-PACKET.md)
- Device process:
  [`../REFERENCE-DEVICE-LAB.md`](../REFERENCE-DEVICE-LAB.md)
- Capture ID: `2bb6ac89-3da1-4641-b753-52c9f982f0d3`
- Manifest SHA-256:
  `70960297ef9308d3fbe537d708f63b442a92c0f4a4de357918a3ee10172febfa`

Этот receipt фиксирует один app build/account cohort. Он не утверждает, что
те же номера уровней или layout существуют в другой версии, установке или
A/B cohort, и не меняет primary reference Triple Tile без отдельного решения
оператора.

## Identity

| Поле | Captured value |
| --- | --- |
| Package | `com.exoticmatch.game` |
| Version name | `220000.1.755` |
| Version code | `233732` |
| Account cohort | `fresh-pig-expedition-2026-07-30` |
| Device | Samsung `SM-A326B` |
| Android | `11`, API `30` |
| Display | `720×1600`, portrait, `60 Hz`, `300 dpi` |
| Target band | Levels `6–10` |
| Session created | `2026-07-30T12:53:39.667Z` |
| Session exported | `2026-07-30T15:12:51.167Z` |

Raw media остаётся локально в
`.artifacts/reference-lab/zen-match/<capture-id>/` и не входит в production
bundle или Git.

## Integrity receipt

| Evidence | Count / hash |
| --- | --- |
| Exported artifacts | `254` |
| Screenshots | `235` |
| Video segments | `17` |
| JSONL actions | `704` |
| `actions.jsonl` SHA-256 | `2c16ce1797a3425b1145c339e3949b0ba82a98929dce2e4f4e7d3d76d574fc95` |
| Last action-chain hash | `999f5934c7ad3e39cd6a63aa609c410433de6f5879569c0d671afd4b01e90a66` |
| `session.json` SHA-256 | `dc34c29aa0cb44d342794789199537b8657be5b460be2edbf86360bbacf4a47b` |

После export локальная проверка пересчитала все file hashes, монотонные
`seq`, `prevSha256` и `entrySha256`.

## Target-level observations (`R-native-secondary`)

| Level | Goal at entry | Terminal observation |
| ---: | --- | --- |
| 6 | raspberry `6`, mushroom `9` | win наступил при закрытии goal counters; нецелевые tiles оставались |
| 7 | banana `6`, gem `6`, orange leaf `6` | goal-based success |
| 8 | pumpkin `9`, water `9`, banana `9` | deliberate capacity fail, Undo и `Play On 300` captured; затем success |
| 9 | clear `36` tiles | forced center opening; mandatory free Magnet tutorial; board-empty success |
| 10 | orange leaf `12` | success сразу при нулевом target counter; banana оставалась на board |

Наблюдаемые rule details:

- goal-based round не требует очистить board/tray после закрытия всех target
  counters;
- holder capacity равна `7`: седьмая non-resolving tile вызвала fail;
- placement в седьмой slot безопасна, если она немедленно завершает triple и
  освобождает holder;
- Undo вернул последнюю выбранную water tile на board, восстановил goal
  counter и потратил один бесплатный charge;
- `Play On 300` потратил только внутриигровые coins, снял три tiles из holder
  и выложил их обратно на board как доступный ряд;
- tutorial Magnet взял type последней holder tile, автоматически извлёк две
  matching tiles с board и закрыл triple;
- Level 9 использует другую win-модель (`clear all`) внутри того же early
  progression band.

## Coverage limitations

- Android `screenrecord` завершает segment не позднее `180 s`. В этой
  exploration-сессии несколько rotations были сделаны после hard cap, поэтому
  corpus доказывает state/rule transitions через JSONL + screenshots, но не
  является непрерывным timing authority для каждого полного уровня.
- Native audio/haptic не captured; haptic требует короткой проверки человеком
  на устройстве.
- Covered-tap, concurrent rapid-tap и cold-load timing ещё требуют
  declarative probes.
- Level layouts разрешены как exact internal-only Reference Twin fixtures.
  Их нельзя переносить в shipping production content; production layouts и
  visual identity остаются original.

## Handoff to Zen recovery

1. Использовать этот capture/build как authority для neutral Reference Twin
   Levels `6–10`.
2. Разделить fixtures на goal-based (`6`, `7`, `8`, `10`) и clear-all (`9`).
3. В state machine отдельно воспроизвести seventh-slot resolve-before-fail,
   goal-complete-before-board-empty, Undo, Magnet и paid-with-coins continue.
4. Timings presentation измерять повторным коротким segmented probe, а не
   выводить из участков с recording gaps.
5. Production Original сохраняет подтверждённые правила, но получает
   собственные layouts, symbols, UI и progression.

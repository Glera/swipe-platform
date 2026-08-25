# Queens R1 — full native reference pack

- Дата capture: 2026-08-25
- Статус: `reference_ready`
- Класс: constraint placement («Queens»)
- Primary reference: ZooDoku 1.0.7 (`com.nebula.zoodoku`), Android
- Предшественник: [`2026-08-24-r0/lite-pack-queens.md`](../2026-08-24-r0/lite-pack-queens.md)
- Process: `reference-replication.v3`
- Execution authority: **нет**

R1 закрывает главный пробел lite-pack: правило, управление, сердца, две
подсказки, restart, первые 13 уровней и progression теперь проверены на
нативном мобильном билде. Captured bytes остаются host-local; в git входят
только провенанс, digests, числовые наблюдения, rights boundary и будущие
acceptance-контракты.

## Результат

Эталон подтверждает компактное ядро: одна фигура в каждой строке, колонке и
цветном регионе, фигуры не соприкасаются даже по диагонали на одну клетку.
Нативный ramp отличается от фан-веб-билда R0: размер поля идёт пилой между
`4×4`, `6×6` и `8×8`; levels 1–10 имеют одну готовую фигуру, level 11+ — ни
одной. Ошибка в hidden solution расходует одно из трёх сердец. Restart сразу
восстанавливает три сердца и очищает уровень.

Копировать разрешено только абстрактное правило, input semantics и
наблюдаемые pacing bands. Брендинг ZooDoku, животные, ribbon UI, leaderboard,
копирайтинг и captured layouts не являются shipping-материалом.

## Состав

- [`REFERENCE-MANIFEST.md`](REFERENCE-MANIFEST.md) — immutable provenance и
  evidence inventory;
- [`OBSERVATIONS.md`](OBSERVATIONS.md) и
  [`OBSERVATIONS.v1.json`](OBSERVATIONS.v1.json) — измерения;
- [`SPEC.md`](SPEC.md) — абстрактный executable rule contract;
- [`DELTAS.md`](DELTAS.md) — R0 → R1;
- [`CLASS-BRIEF.md`](CLASS-BRIEF.md) — handoff в обычный copy-ticket;
- [`FIDELITY-CONTRACT.v1.json`](FIDELITY-CONTRACT.v1.json) и
  [`PRESENTATION-PROFILE.v1.json`](PRESENTATION-PROFILE.v1.json) — граница
  evidence → first-party implementation;
- [`TEST-MATRIX.md`](TEST-MATRIX.md) — acceptance будущего prototype;
- [`FAILURE-LEDGER.md`](FAILURE-LEDGER.md) — отклонённые capture-попытки;
- [`PROCESS-RECEIPT.md`](PROCESS-RECEIPT.md) — terminal process receipt;
- [`evidence/manifest.json`](evidence/manifest.json) — machine-readable
  evidence index.

## Открытый, но неблокирующий пробел

Десять agent-operated solve/capture durations содержат время визуальной
транскрипции и не являются human solve-time. Органическая кривая новичка
должна быть измерена в operator taste-session после одного neutral Twin slice.
Это не блокирует durable copy-ticket, но блокирует freeze session target и
любой claim «≤60 секунд».

## Жёсткие границы

Этот pack не разрешает implementation, merge, publication, deploy, runtime
adoption, production dataset или product selection. Он не затрагивает meta
#151, platform/backend и production. Следующий шаг — отдельное одноразовое
решение по copy-ticket.

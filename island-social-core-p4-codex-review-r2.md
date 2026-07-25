# Island Social Core P4 — независимое Codex-ревью R2

Дата: 2026-07-25  
Backend head: `434f4c089713058a5573b56caea0edf2f0c4d2d4`  
Client head: `94f4eaf690607527f166090ff2633b0a2a6f3e04`  
Вердикт: **GO с одним обязательным условием до merge**

Обе находки R1 закрыты по существу:

- executor сам управляет adherence-loop через `_single_theme_call`;
- перед каждым физическим Anthropic POST отдельная транзакция добавляет
  receipt и увеличивает `attempts`;
- второй POST наблюдает уже committed `attempts=2` и два receipts;
- клиентская resume identity совпадает по составу и нормализации с
  серверным digest: `prompt + avoid + difficulty + motion`.

## R2-F001 [P2] — terminal error-path теряет wall-time receipt

`swipe-backend/app/api_island.py:814-834`

После рефакторинга `wall_times[call_index]` заполняется только для success
и `_ThemeValidationError`. В ветках `asyncio.TimeoutError`,
`HTTPException` и generic `Exception` executor завершает job без
`wall_time_ms` в receipt.

Это регресс относительно прежнего executor (он вычислял wall time после
любого terminal исхода) и прямое расхождение с §5.1:
`receipt: model/effort/attempts/wall-time`.

Исправление: фиксировать elapsed в `finally` для каждого завершившегося
physical call, кроме process cancellation/crash, где незавершённый receipt
намеренно остаётся без terminal timing. Добавить тест хотя бы для HTTP или
generic terminal failure; у receipt должны быть `attempt`, model/effort и
`wall_time_ms`.

## Verify

- exact P4 theme PG suite: **16 passed**;
- targeted backend pure: **28 passed**;
- client exact head: `tsc` + production Vite build — **PASS**;
- физический PG15: fresh upgrade до `0053`, затем общий
  `0054→0052→0054` roundtrip — **PASS**;
- combined exact backend merge P1→P4→P3: theme+moderation PG
  **38 passed**, targeted pure **28 passed**.

После точечного wall-time fix достаточно diff-only R3; повторный полный
проход не нужен.


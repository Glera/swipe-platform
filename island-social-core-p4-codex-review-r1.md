# Island Social Core P4 — независимое Codex-ревью реализации R1

Дата: 2026-07-25  
Backend: `bb8430b..23028f3`  
Client: `c27b58b..9e3f7a3`  
Вердикт: **NO-GO до фикс-раунда**

Patch identity проверена в изолированных checkout: backend 2 commits,
client 2 commits; остальные слои, binary и excluded secrets пусты.
`baseFallback: local-master`.

## F001 [P1] — один receipt покрывает до двух физических model calls

`swipe-backend/app/api_island.py:675-695`, вызываемый
`_anthropic_theme` — `app/api_island.py:179`

Runner перед I/O записывает `attempts=1` и один receipt, после чего вызывает
legacy `_anthropic_theme`. Внутри него есть adherence retry и может произойти
второй физический Anthropic POST. Для второго model call нет отдельного
receipt, записанного **до** I/O.

Это прямо расходится с §5.1: максимум два model calls, каждый fenced своим
предварительным attempt receipt. Текущая телеметрия сообщает один attempt
при двух расходах, а crash между/во время второго вызова невозможно честно
восстановить из receipts. Тесты мокают `_anthropic_theme` как один вызов и
не покрывают этот путь.

Исправление: вынести single-attempt model call и adherence validation на
уровень job executor; перед каждым разрешённым физическим вызовом атомарно
добавлять receipt/increment attempts, затем делать I/O. Reclaim после
зафиксированного незавершённого call остаётся terminal interrupted без
нового расхода.

Нужен red-then-green тест: первый ответ не проходит adherence, перед вторым
вызовом уже существуют `attempts=2` и два receipts; число фактических POST
равно числу receipts.

## F002 [P2] — resume identity клиента неполна

`feed-prototype/src/island.ts:867-885, 2389-2394`

Persisted handle сравнивает только `slot + prompt`, тогда как server digest
включает также `avoid`, `difficulty`, `motion`. После reload пользователь
может оставить prompt, изменить настройки и получить старую job/pack вместо
нового запроса.

Сохранять и сравнивать полный нормализованный request identity либо его
канонический digest.

## Остальная оценка

Без дополнительных находок проверены:

- consume+insert quota transaction и digest race fallback;
- partial unique active-job dedup;
- lease ownership и bounded reclaim;
- cancel/finalize `FOR UPDATE` re-assert;
- authenticated GET/DELETE;
- canonical ready replay;
- force-sync override.

Задокументированное в evidence ограничение «один durable attempt содержит
до двух физических вызовов» не принято: оно меняет явный нормативный
инвариант §5.1, а не уточняет реализацию.

## Verify

- backend unaffected pure island tests:
  `pytest -q tests/test_island_social.py tests/test_island_state.py`
  → **16 passed**, exit 0;
- авторский evidence: theme PG 14, combined PG 50, full pure 842,
  client tsc/build → PASS.

После F001–F002 достаточно diff-only R2.

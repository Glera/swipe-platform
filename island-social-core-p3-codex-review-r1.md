# Island Social Core P3 — независимое Codex-ревью реализации R1

Дата: 2026-07-25  
Backend: `305505e..dea261b`  
Client: `91c904e..9e4d7a2`  
Вердикт: **GO с одним неблокирующим условием**

Patch identity проверена в изолированных checkout: backend 2 commits,
client 3 commits; остальные слои, binary и excluded secrets пусты.
`baseFallback: local-master`.

## F001 [P3] — после ошибки «Показать ещё» нельзя повторить запрос

`feed-prototype/src/island-moderation-console.ts:132-135`

`moreBtn` ставит `disabled=true` и рассчитывает, что успешный `paint()`
заменит кнопку. При transient error `loadMore*()` ловит ошибку внутри и
возвращает normally, `paint()` не вызывается, а прежняя кнопка остаётся
disabled до полного reload консоли.

Условие GO: re-enable кнопку в `finally`, если она всё ещё подключена;
при успехе новый render всё равно заменит её. Покрыть отказ одного page
request и успешный повтор с тем же cursor.

## Отклонённая слепая находка

Предлагалось перенести проверку текущей public/takedown перед replay
существующего report. Отклонено: dedup report — terminal receipt-like
идентичность `(building, reporter)`; повтор возвращает минимальный уже
известный reporter-у response и не создаёт новый report/rate-limit/event.
Он не выдаёт `artifact_rel`, owner profile или содержимое снятого артефакта.
Переоценка публичности сделала бы idempotent retry нестабильным.

## Что подтверждено

- moderator allowlist проверяется сервером на каждом operator endpoint;
- report допускает только чужой публичный non-bot UGC, учитывает block,
  takedown, dedup и rate limit;
- takedown сверяет exact current `artifact_rel`;
- takedown/restore сериализованы social-row lock;
- derived state использует монотонный `seq`, а не wall clock;
- public/state/start/complete/like/result и bot execution перепроверяют
  takedown;
- publications/reports используют `(created_at,id)` keyset;
- операторские строки экранируются, client UI не является auth boundary.

## Verify

- backend targeted pure:
  `pytest -q tests/test_island_social.py tests/test_island_social_core.py
  tests/test_island_bots.py`
  → **15 passed**, exit 0;
- авторский evidence: island PG 64, migration 0053 roundtrip, full pure 843,
  client tsc/build → PASS.

P3 можно стыковать после исправления F001; повторное полное ревью не нужно,
достаточно показать diff и один UI regression test.

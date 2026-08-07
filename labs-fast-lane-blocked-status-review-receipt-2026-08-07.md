# Labs Fast Lane blocked-status review receipt — 2026-08-07

## Scope

Один bounded cross-repo пакет делает остановку автоматической доработки
видимой без ручного действия в Labs:

- server-owned `blocked` projection и безопасная причина;
- янтарно-красная кнопка `! Нужна помощь` в Telegram Mini App;
- best-effort Telegram signal при первом переходе;
- продолжение очереди и recoverable retry того же request;
- bounded тестовый budget для медленного conveyor tuning Sorting.

Финальные source heads пакета:

- `playables@cda0369e5306b0c967da74c2b6303123fd5ecc6a`;
- `swipe-backend@05ea37b`;
- `swipe-generator@f239899`;
- `feed-prototype@1fef66f`.

После exact-head CI и review эти heads влиты без product-byte изменений:
Playables PR #10 → `affe8acd`, Generator PR #22 → `e3f9601`, Backend PR #60
→ `bbc8026b`, Feed PR #27 → `d9cbafc`. Production rollout в эту квитанцию не
входит.

## Независимое ревью

Reviewer: Claude Fable 5, subscription CLI, xhigh, read-only. Первый проход
вернул `NO-GO` с тремя P2:

1. caller и control строили разные key, из-за чего foreground sync мог терять
   открытый popover или незавершённый ввод;
2. новый backend wire ломал exact-key validator прежнего Generator при
   backend-first rollout;
3. reset только journal оставлял post-proof artifact и повтор детерминированно
   останавливался на конфликте.

Disposition:

1. введён один shared key-builder; browser test проводит changed projection и
   unchanged foreground refresh, сохраняет DOM identity/open details, затем
   отдельно проверяет claimed transition;
2. backend сохраняет legacy wire для `accepted` и добавляет `execution` только
   для `blocked`; новые consumers принимают оба варианта;
3. `resetFailed` архивирует visual proof **до** journal. Интеграционный тест
   создаёт настоящий post-proof source drift и доводит повтор того же request
   до `source_ready`.

Delta-review на backend `fb32c55`, generator `f239899`, feed product head
`bb9be87` вернул **GO, P1/P2 нет**. Следующие feed-коммиты `dd6aa98` и
`1fef66f` меняют только review-requested browser assertion: пересекают
существующее foreground dedupe window и ждут фактический GET durable rework;
product bytes не меняют. Тест дважды прошёл локально; exact-head CI является
authority результата.

Backend-коммит `05ea37b` после review также test-only: синтетический LKG graph
теперь удаляет текущую 0075, а не прежнюю 0074, и ожидает полный compatibility
range через 0075. Отдельная fingerprint-проверка подтверждает LKG head 0074;
exact-head PostgreSQL CI остаётся authority полного сценария.

## P3 и границы

- Telegram signal остаётся best-effort; durable mobile badge — гарантированный
  fallback. Outbox не добавляется на prototype-этапе.
- Rolling order пинится как Backend 0075 → Feed → Generator-writer. Обычный
  `accepted` совместим со старым Generator; writer не обращается к route до его
  появления.
- UI не утверждает, что source commit отсутствует: при позднем сбое он мог уже
  попасть в Git. Буквальная гарантия — изменения не опубликованы в ленту.
- Release-stage failure после создания release остаётся отдельным follow-up;
  этот пакет закрывает bounded source-agent/supervisor failure до candidate.
- Real-time Sort smoke продолжает доказывать rAF advancement/canvas/no
  pageerrors; terminal win доказывается общей deterministic tick pipeline с
  multiplier, жёстко ограниченным `[0.5, 3]` и максимумом 6400 ticks.

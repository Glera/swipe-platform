# Codex cross-review R3: Island Social Core v1.2

Дата: 24.07.2026  
Проверенные ревизии:

- `swipe-backend@9d71a73:docs/specs/island-social-core.md`;
- `p4g-workspace-meta@7443f59:island-social-core-vision-v1.md`;
- `p4g-workspace-meta@e98fe11:VISION.md` v2.5;
- фактические `RewardLedger`, `PuzzleLedger`, `VerifiedRun` и
  `api_results.py` на `swipe-backend@9d71a73`.

Вердикт:

- исправления R2 по guest-result receipt, chest closure, scheduler и VISION
  приняты;
- VISION v2.5 применён корректно, конституционный блок Пакета 3 снят;
- **Пакет 1 — один узкий P1 до GO:** empty owner-collect должен создавать
  terminal receipt;
- **Пакет 2 — один schema fix:** `run_id` имеет тип `String(96)`, не UUID.

После этих двух точечных правок достаточно R4 diff-only; полного
архитектурного раунда не требуется.

## Что закрыто

### R1-F001 / VISION

VISION v2.5 содержит согласованный staged post-moderation contract:

- machine gate назван только гейтом технической играбельности;
- до первого гостевого показа обязательны report/block, exact-revision
  takedown, moderation queue с review SLA и отзываемая доставка;
- первый rollout ограничен принятыми друзьями и caps;
- расширение аудитории требует нового решения.

Part B не применена; legacy `/island/theme` note остаётся до фактического
deploy P4. Это корректно.

### R1-F002 / chest closure

v1.2 теперь совпадает с кодом:

- terminal `VerifiedRun(metric_key='series')`;
- consumed exact ticket;
- `RewardLedger(idempotency_key='lw:{run_id}',
  reason='series_complete', meta.metric_key='series',
  meta.ticket_id=exact ticket)`;
- optional дополнительная сверка
  `PuzzleLedger('series-puzzle:{run_id}', reason='series_chest')`;
- legacy-no-ticket исключён;
- caller ownership обязателен.

Смысловая closure закрыта. Оставшаяся проблема только в типе колонки Пакета 2,
см. R3-F002.

### R2-F002 / guest result

`island_completion_outcomes` теперь материализует каждый исход, включая
нулевые, в той же транзакции, что claim. Receipt фиксирует disposition,
day bucket, config digest, ledger key и exact response. Replay не перечитывает
часы, flags, caps или config. Требуемые tests через смену UTC-дня, флагов и
конфига внесены.

### F003 / F004

Ordered building replay и fenced bot scheduler остались без регрессий.
Уточнение про одну физическую PostgreSQL session и `finally` для advisory lock
добавлено.

## Оставшийся P1 Пакета 1

### R3-F001 · Empty collect не получает terminal receipt

Spec §2.1 правильно объявляет `island_collect_claims` terminal receipt с
disposition `empty`. Но endpoint §2.2 всё ещё говорит:

```text
FOR UPDATE social;
pending_gifts == 0 → 200 {gifts: 0}.
INSERT collect_claim ...
```

Это читается как ранний возврат до INSERT. Тогда:

1. клиент вызывает `claim_id=A`, когда balance пуст;
2. получает `{gifts:0}`, но receipt A не существует;
3. позже бот создаёт pending gift;
4. replay того же `claim_id=A` собирает новый balance.

Это нарушает terminal identity и обещание byte-identical replay.

Требуемая точечная правка:

- первый вызов любого нового `claim_id` всегда под lock создаёт
  `island_collect_claims`, включая `disposition='empty'`, `gifts=0`,
  `puzzles=0`, config digest и exact response;
- только после commit возвращается response;
- любой повтор читает receipt до проверки текущего `pending_gifts`;
- reuse ID с другим owner/building/input → 409;
- DoD явно покрывает `empty → accrual → replay same claim_id = exact empty`;
- также покрыть `daily_cap/rewards_disabled → flag/day rotation → exact replay`.

После этой правки **Пакету 1 можно дать GO**.

## Schema fix Пакета 2

### R3-F002 · `run_id UUID` не совпадает с моделью

Spec описывает `island_visit_awards.run_id UUID PK` и отдельный
`verified_run_id`. В текущей схеме:

- `VerifiedRun.run_id` — `String(96)` primary key;
- `RunTicket.root_run_id` — `String(96)`;
- `ResultIn.run_id` — строка длиной до 96.

Требуемая правка:

- `island_visit_awards.run_id VARCHAR(96) PK` и FK на
  `verified_runs.run_id`;
- удалить неопределённый отдельный `verified_run_id` либо явно назвать его
  тем же FK — двух идентичностей здесь нет;
- `ticket_id` — FK/closure к exact ticket;
- `roll_id = uuid5(namespace, JCS({userId, runId}))`, где строка кодируется
  канонически, без предположения UUID;
- тест с non-UUID `run_id` обязателен.

Это не блокирует реализацию Пакета 1, но должно быть исправлено до GO Пакета 2.

## Package verdict

| Пакет | R3 verdict |
|---|---|
| P1 | **NO-GO: один точечный P1 R3-F001** |
| P2 | **Spec fix R3-F002, затем отдельный implementation gate** |
| P3 | **Конституционно разблокирован; implementation review остаётся** |
| P4 | **Spec GO** |
| P5 | **Blocked до device spike** |

## R4 exit

Достаточен узкий diff из двух изменений:

1. empty collect всегда пишет terminal receipt + acceptance test;
2. visit-award `run_id` приведён к `VARCHAR(96)` exact FK closure.

Если diff не меняет другие контракты, R4 может завершиться GO для Пакета 1.


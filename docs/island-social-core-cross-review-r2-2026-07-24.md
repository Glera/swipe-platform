# Codex cross-review R2: Island Social Core v1.1

Дата: 24.07.2026  
Проверенные ревизии:

- `p4g-workspace-meta@ad190ae:island-social-core-vision-v1.md`;
- `p4g-workspace-meta@ad190ae:vision-patch-island-moderation-proposal.md`;
- `swipe-backend@a4f5b6c:docs/specs/island-social-core.md`;
- фактическая receipt-модель `swipe-backend/app/api_results.py` на
  `swipe-backend@a4f5b6c`.

Вердикт:

- **R1 F003 и F004 закрыты; F001 закрыт как rollout gate.**
- **R1 F002 не закрыт:** ТЗ ссылается на сочетание ledger key/reason, которого
  нет в коде.
- **Пакет 1 пока NO-GO** из-за нового P1 replay finding R2-F002.
- **VISION proposal Part A — APPROVE AFTER EDITS**, не применять в текущей
  формулировке.
- **Part B — не применять сейчас; при наступлении гейта удалить legacy-note,
  а не добавлять implementation status в конституцию.**

## Проверка P1 из R1

### F001 · Закрыт как hard gate

P3 отделён от остальных пакетов и явно заблокирован до merge утверждённого
VISION patch. Это достаточная диспозиция для ТЗ. Она не означает автоматического
одобрения текста самого patch — рекомендации к нему ниже.

### F002 · Открыт: выбрана несуществующая receipt identity

ТЗ утверждает:

```text
reward_ledger:
  idempotency_key = "lw:{run_id}"
  reason = "series_chest"
```

Фактический `api_results.py` пишет:

```text
reward_ledger:
  idempotency_key = "lw:{run_id}"
  reason = "series_complete"
  meta.metric_key = "series"
  meta.ticket_id = ...

puzzle_ledger:
  idempotency_key = "series-puzzle:{run_id}"
  reason = "series_chest"
```

То есть `lw:{run_id}` и `series_chest` находятся в разных ledgers. Проверка из
v1.1 либо всегда вернёт 404, либо реализация будет вынуждена отступить от ТЗ.

Исправление:

1. Каноническим chest evidence сделать terminal `VerifiedRun` caller'а с
   `metric_key='series'`, связанным с consumed ticket.
2. Требовать соответствующий `RewardLedger`:
   `idempotency_key='lw:{run_id}'`, `reason='series_complete'`,
   `meta.metric_key='series'`, exact `meta.ticket_id`.
3. Если puzzle receipt существует, дополнительно сверять
   `PuzzleLedger(idempotency_key='series-puzzle:{run_id}',
   reason='series_chest')`, но не делать его единственным доказательством:
   величина puzzle grant является экономической деталью.
4. Legacy `series_complete` с `meta.legacy_no_ticket=true` либо явно исключить
   из visit awards, либо описать отдельную server-owned identity для builtin
   series. Нельзя молча считать legacy и ticket-bound evidence одинаковыми.
5. `island_visit_awards` хранит не строковый ledger key как смысловую identity,
   а exact `verified_run_id/run_id + user_id + ticket_id` closure; `roll_id`
   серверно выводится из неё.

После правки нужны тесты: ticket-bound chest accepted; level receipt rejected;
другой user rejected; legacy rejected/отдельно принят по записанной policy;
lost response возвращает exact committed award.

### F003 · Закрыт

Общий `seq`, social-row lock, ordered replay двух журналов и тест обоих commit
orders закрывают исходную неоднозначность. При реализации sequence может иметь
глобальные gaps — это нормально; важен полный порядок событий одного building.

### F004 · Закрыт

Advisory ownership с v1, immutable daily plan с config digest,
`INSERT ... RETURNING` как условие эффектов, bounded same-day catch-up и
next-day rotation образуют достаточный scheduler contract.

Acceptance должен удержать advisory lock на той же физической PostgreSQL
session весь тик и гарантированно освобождать его в `finally`.

## Новый P1

### R2-F002 · Результат completion claim не имеет terminal replay receipt

ТЗ обещает, что повтор `POST /island/visits/{visit_id}/result` возвращает
byte-identical награду. Но `island_completion_claims` хранит только сам claim,
а отрицательные решения награды не материализованы:

- дневной puzzle cap уже исчерпан;
- `island_rewards_enabled=false`;
- дневной gift cooldown сработал;
- подарок равен нулю по policy.

Пример:

```text
день 1: claim committed, reward denied из-за daily cap
день 2: тот же visit/result replay
```

Если replay заново оценивает текущий cap/day/config, он может выдать подарок,
которого не было в первом committed ответе. Это нарушает exact replay и
позволяет менять outcome ожиданием или rotation config.

Исправление:

- при первом claim одной транзакцией создать immutable
  `island_completion_outcome`/receipt;
- receipt хранит exact policy/config digest, day bucket, reward disposition
  (`granted | repeat | daily_cap | rewards_disabled | zero_policy`), puzzles,
  ledger key и response projection;
- любой повтор читает только receipt и не переоценивает часы, cap, flags или
  config;
- включение rewards позже не делает старый claim автоматически payable;
  ретро-выплата — отдельный append-only operator-authorized процесс;
- reuse `visit_id`/claim identity с иными building/user/inputs возвращает 409,
  а не replay;
- аналогично `collect claim_id` обязан быть связан с exact
  `(owner, building, input)` и хранить terminal reward disposition.

До этой правки Пакет 1 не готов к реализации: defect находится в его основном
reward path.

## Оставшиеся P2 из R1

Диспозиции F005–F014 в v1.1 в целом приняты корректно:

- claimed и verified разведены;
- island puzzle cap и kill switch добавлены;
- bot/human source и likes разделены;
- builtin получил immutable binding;
- remove/block введены;
- cards удалены до server-owned collections;
- visit card получил holdout и UX arbitration;
- moderation lifecycle и exact artifact revision появились;
- CDN вынесен после device spike;
- async theme получил job/receipt boundary;
- VISION-триаж и cross-repo references добавлены.

F015 принят как осознанный bounded risk для одного оператора. Перед P3 всё равно
нужно проверить, что `?diag=1` не является authorization boundary: сервер
обязан независимо применять moderator allowlist и писать exact action receipt.

## Ревью VISION moderation proposal

### Part A: направление принято, формулировку исправить

Переход на post-moderation — явное продуктовое решение оператора и может быть
внесён в VISION. Текущий текст слишком широко и неточно меняет policy.

Проблемы:

1. Machine bake доказывает техническую проходимость, а не безопасность
   контента, IP или визуала.
2. «Естественная модерация качества мотивацией игроков» не является safety
   control и не должна стоять в конституционном guardrail.
3. Строка authority смешивает первоначальное решение автора о публикации и
   последующее takedown authority оператора.
4. «За пределы круга друзей» не определяет, кто считается другом и могут ли
   deep links открыть контент до acceptance.
5. Не зафиксировано, что report/takedown и moderation queue должны быть готовы
   до первого гостевого показа, а не после.

Рекомендуемый текст A1:

> | UGC-рескин | автор-игрок — initial publish exact artifact; оператор —
> moderation/takedown exact artifact revision | Build + machine playability
> gate; до первого гостевого показа действуют report/takedown и операторская
> очередь пост-модерации | принятые друзья автора в закрытом rollout |

Рекомендуемый текст A2:

> - **UGC-модерация — staged post-moderation (решение оператора
>   24.07.2026).** Автор может опубликовать exact UGC-артефакт после машинного
>   гейта проходимости. Этот гейт доказывает только техническую играбельность,
>   не безопасность содержания. До первого показа гостю обязательны:
>   report/block, мгновенный takedown по exact artifact revision,
>   операторская очередь новых публикаций с наблюдаемым review SLA и
>   отзываемая доставка артефакта. Первый rollout ограничен принятыми друзьями
>   автора и отдельными caps; расширение аудитории или автоматизация
>   moderation — новое явное решение оператора с fraud/abuse и safety
>   evidence.

Существующий отдельный пункт report/takedown можно оставить, но убрать
дублирование либо сделать его общим для любого UGC rollout.

**Рекомендация оператору:** утвердить переход к staged post-moderation по смыслу,
но попросить Клода применить исправленную формулировку выше.

### Part B: не хранить выполненный status в принципе VISION

После deploy P4 легаси-оговорка больше не нужна. Предложение заменить её
исторической строкой с датой смешивает продуктовый принцип и изменчивый
implementation status.

Рекомендуемое действие после доказанного deploy:

- удалить курсивное legacy-исключение целиком;
- оставить основной принцип 2 без оговорки;
- убрать async-refactor из «Сейчас»;
- факт закрытия записать в `IMPLEMENTATION-STATUS.md`/CI и git history, не в
  конституционную формулировку.

## Package verdict

| Пакет | R2 verdict | Причина |
|---|---|---|
| P1 | **NO-GO** | закрыть R2-F002 terminal replay receipt |
| P2 | **NO-GO, spec fix** | исправить F002 chest identity; затем отдельный review реализации |
| P3 | **BLOCKED** | утвердить и merge исправленный Part A, затем реализовать |
| P4 | **SPEC GO** | реализация отдельно, Part B только после deploy evidence |
| P5 | **BLOCKED** | сначала device spike, как записано |

## Условия короткого R3

Для следующего прохода достаточно узкого diff:

1. исправленная server-owned chest closure;
2. immutable terminal outcome receipts для guest result и owner collect;
3. byte-identical replay tests через смену UTC day, reward flag и config;
4. исправленный Part A текста VISION proposal;
5. Part B заменён инструкцией удалить legacy note после deploy.

После этого при отсутствии новых противоречий Пакет 1 можно перевести в GO без
повторного полного архитектурного раунда.


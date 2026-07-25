# Code review — QA реализация, блок 1 (`codex/agents-operator-qa@54a7249`)

Дата: 2026-07-20. Ревьюер: внешняя линия. Скоуп: коммит `54a7249`
«durable request slot + insight foundations» (миграция agents-0003,
store/FSM/projections/схемы/тесты, 15 файлов). Спека: v2.14
(`swipe-backend-qa-spec@2380919`), §6/§7/§8/§13 + agent-team §15a.

⚠️ Организационно: worktree HEAD ушёл на `9292aa5` (+2 коммита:
`53c0ea3` fake-broker, `9292aa5` attended-fencing) — ВНЕ скоупа этого
ревью, требуют своего прохода. Тесты: JSON-репорт на HEAD = 537 passed /
0 failed; первый прогон дал 6 «failed» = воркер-таймауты broker/run-smoke
из поздних коммитов (не ассерты, набор флапает под нагрузкой на этом Mac —
для CI нужен больший таймаут / --no-file-parallelism на heavy-сьютах).
QA-scope блока 1 — 52/52 зелёные.

## Вердикт по блоку 1: фундамент верный, продолжать можно — но 1 P2 править ДО блока доставки + закрыть property-покрытие, пока store свежий.

Корректно и подтверждено (я + Opus-срез): атомарность quota-резервации
(accepted + reservation в одной append-tx, `UNIQUE(quota_window,ordinal)`
+ `BEGIN IMMEDIATE` → дубль ordinal непредставим, drift детектируем);
отсутствие `accepted→quota_denied` соответствует §7.1 (сверхквота =
отдельная классификация без qaRequest); slot-fencing (epoch-монотонность,
`SLOT_FENCE_MISMATCH`, clock-proven renew/expire, seq-fencing → один
holder); insight `created→retired` = §8 (superseded/manual сняты в v1);
контент-адресация вопроса тройным контуром (CHECK + domain-guard +
pattern); scope строго аддитивен, чужие тесты не ослаблены.

## P2 — править в этом блоке (до wiring доставки)

### P2-1. FSM `question_deleted` инвертирован относительно §6/§7.1
`fsm.ts:137-161`: `question_deleted` достижим из `quota_reserved/
triggered/context_pinned/attempting/attempt_deferred/answer_validated`
— состояний, где удаление вопроса физически НЕ наблюдаемо, — и
**отсутствует ребро `delivery_pending → question_deleted`**, а именно на
доставке §6 детектирует удаление (Telegram «нет сообщения»). Следствие:
финальный reply в удалённый вопрос вынужден идти `delivery_pending →
failed_terminal`, а `failed_terminal` по §7.1/§13 обязан породить notice
→ либо standalone-пост (запрещён §2), либо недоставимый reply. Тихий
терминал `question_deleted` в точке детекции недостижим. Последствие
проявится только с блоком доставки (delivery-мост не написан), но FSM —
замороженный артефакт ЭТОГО блока; править таблицу надо сейчас, иначе
deleted-on-delivery уйдёт в §2-нарушение. Заодно пересмотреть pre-delivery
источники (нужны ли они, если детекция — только на доставке и на ack).

### P2-2. Генератор property-потока не покрывает qa-request|slot|insight
`tests/gen.ts` (`AggType`) не включает три новых агрегата → §15a-1/3/10
(replay=projection, one-holder, live==replay под случайными
интерливингами) для них НЕ гарантированы — ровно тот слабый спот, что мы
ловили в M2M-ревью. Конкретно: slot без единого `diffLiveVsReplay`/
concurrency-теста (свойство «конкурентный claim → один holder» только
аргументировано); qa-request replay-equality лишь на happy-path (ветки
deferred/expired/question_deleted/failed_terminal не проверены);
`INSIGHT_DUPLICATE` (тот же кандидат дважды) не тестируется. Закрыть,
пока store-блок свежий: расширить gen.ts на три агрегата + slot
replay+concurrency + insight-duplicate.

## P3 / WEAK — по усмотрению (часть законно уедет в следующий блок)

- `rejected_over_quota` не зарегистрирован в `spec-deltas-a1.md` (§7.1/§11
  требуют) и не добавлен в enum классификаций — реализации over-quota в
  блоке нет, но дельту внести при её появлении.
- Правило «3 consumed → failed_terminal» держится только на CHECK
  `consumed_attempts BETWEEN 0 AND 3` → 4-й consuming attempt даёт сырую
  SQLite-ошибку, не `StoreError`/domain-guard; маршрут в failed_terminal
  на уровне store не гарантирован (ждёт drain-оркестратор). Либо
  domain-guard, либо явно оставить оркестратору.
- `qaRequestId` не деривируется/не проверяется store (нет
  `QA_REQUEST_ID_MISMATCH`, в отличие от trigger/insight); `insightId`/
  `answerId` не соответствуют формуле из вашего описания (нет
  `sha256(bytes)`, нет `answerId`-деривы) — сверить с приложением §12
  (golden может быть неполон).
- ordinal не gap-free/не монотонен на уровне store — аллокатор — upstream
  poller (следующий блок); проверить единственность там.
- `accepted → expired` формально в §7.1 («любой нетерминальный до
  reply_queued»), но impl не даёт — узкое окно, косметика.

## Итог
Блок 1 годен как фундамент, регрессий/утечек/ослаблений нет. До сборки
доставки: закрыть P2-1 (FSM) и P2-2 (property-покрытие) — оба дешевле
сейчас, чем после wiring. P3 — таблицей fixed/deferred. Поздние коммиты
`53c0ea3`/`9292aa5` — отдельным проходом.

# Адверсариальное ревью A1 (swipe-agents) — раунд R1 внешнего ревьюера

Дата: 2026-07-17. Ревьюемое состояние: `swipe-agents` @ `4433c90`.
ТЗ: `swipe-backend/docs/specs/agent-team.md` @ `a8001c9` (§15a заморожен).
Метод: 5 параллельных ревью-срезов (store/§15a, watchers/§4+§10, Telegram/§12,
harness+supervisor/§14, соответствие ТЗ+секреты); оба P1 и деэскалация
перепроверены ревьюером вручную по коду. Прогон: typecheck чистый, 276/276.

## Вердикт: NO-GO (граница чёткая, объём фиксов небольшой)

Положительное, что зафиксировано и НЕ требует работы:
- Отклонений класса «возврат к ТЗ» нет: новых authority, terminal outcomes,
  внешней семантики не обнаружено. `agents-0002` (tg_poller_state) — легитимная
  additive-проекция §12. Исходящий HTTP только api.telegram.org + health-origin.
- Секреты/гигиена чисты (нет dist/.env/токенов в git; токен не в argv/env, не
  логируется). Default-off: `AGENTS_ENABLE_BOT=1`, `AGENTS_SUPERVISED=1`.
- 10/10 обязательств §15a покрыты невырожденными тестами (golden UUID5/JCS
  перепроверены из первых принципов; конкуренция — реальные worker-threads;
  append-only — SQL-триггеры; проекция фолдится в одной транзакции с событием).
- Таблица §14 полна (13/13 отказов имеют acceptance), ни один тест не проходит
  при молчании watcher'а. Изоляция — allowlist, fail-closed, Render-IP не
  проходит. Takeover fencing — реальный seq-fence. Ослабления тестов в истории
  NO-GO-фиксов нет (0 skip/only, 820 expect).

## P1 — блокеры

### P1-1. Kill между `send_started` и коммитом исхода теряет доставку на обычном рестарте (§14 #5 «дубль, не потеря» нарушен в production-проводке)
`send_started` коммитится до HTTP (`src/bot/sender.ts:147`), но выборка на
отправку берёт только `queued|outcome_unknown` (`src/bot/sender.ts:88-90`).
Единственный переход `send_started→outcome_unknown` — `reconcileStuckSends`
(`src/backup/reconcile.ts:24`) — вызывается ТОЛЬКО из `postRestoreReconcile`
(restore из backup) и вручную из теста `tests/acceptance/outbox.test.ts:56`.
Ни `run/supervised.ts`, ни `bot/runtime.ts`, ни `bot/main.ts` его не зовут.
Итог: после kill в этом окне incident-доставка застревает в `send_started`
навсегда; drift-детектор это не ловит (валидное нетерминальное состояние).
Фикс: вызывать `reconcileStuckSends(store)` при старте и/или в начале каждого
drain-цикла в обоих production-контурах.

### P1-2. Эскалации и re-alert'ы уровней digest/attention никогда не доставляются (§10 «эскалация обходит дедуп … постится заново»)
Движок enqueue'ит доставку только при `severity === "incident"`
(`src/watchers/engine.ts:186` для opened, `:211` для escalated).
`Dispatcher.enqueueSweep` подбирает только `kind='opened'` digest/attention
(`src/bot/dispatcher.ts:83-86`), `reconcileMissing` — только incident
(`src/bot/dispatcher.ts:120-122`). Событие `escalated` с severity
digest/attention не имеет НИ ОДНОГО пути enqueue: сигнал, эскалировавший
digest→attention, и периодический re-alert (`reescalated`, ≤1/6ч по §4)
молчат навсегда после первого `opened`. Комментарий в engine.ts:204-205
обещает обратное. Фикс: расширить sweep на `kind IN ('opened','escalated')`
для digest/attention (дедуп по event_id события эскалации, как в
reconcileMissing).

## P2 — обязательны к решению до acceptance (фикс или явное решение в ТЗ)

1. **Деэскалация отсутствует** (§10: «downgrade запрещён — понижение =
   закрыть и открыть новый»). При `newRank < curRank` движок падает в
   `observe()` и держит старую severity (`src/watchers/engine.ts:123-143`);
   диск, вернувшийся из <2GB в полосу 2–10GB, остаётся incident до полного
   sustain-close. Close+reopen не реализован, downgrade-тестов нет.
2. **Store-голдены декоративны**: `leaseOverdueMultiple`,
   `missedRunGraceMultiple`, `backlogIncidentOver` из `store.v3.json` не
   читаются нигде; рантайм хардкодит `2*` в `supervisor/health-reads.ts:45,67`
   и `supervisor/supervisor.ts:177`, границу 501 — литералом в rules.
   Смена версии конфига не изменит рантайм = ложная уверенность deploy-гейта.
3. **Fidelity acceptance §14 #5**: «kill» смоделирован throw'ом в fake
   transport + ручным вызовом reconcile (`tests/acceptance/outbox.test.ts`),
   рестарт через production-инициализацию не проходится — именно поэтому P1-1
   не был пойман. Нужен тест: закрыть store → переоткрыть по тому же path →
   production-старт → дубль уходит сам.
4. **Fidelity §15a-3**: реальная гонка в worker-threads реимплементирует claim
   сырым SQL мимо `Store.append` (`tests/properties/concurrency.test.ts:57-79`);
   единственный тест на настоящем append — последовательный. Регресс в самом
   append (потеря `.immediate()`) гонкой не ловится.
5. **Генератор property-потока** (`tests/gen.ts`) не покрывает агрегат
   tg-update (фолд `tg_poller_state` с MAX/counter — самый нетривиальный) и
   reopen fingerprint'а; §15a-1/10 для этих веток держатся на хардкод-сценариях.
6. **Token-leak вектор в immutable log**: сырой `(e).message` транспорта
   интерполируется в `reason` события `outcome_unknown`
   (`src/bot/transport.ts:122-124` → `src/bot/sender.ts:158`) и в stderr.
   База URL содержит токен; лог append-only — утечка неудаляема. Фикс:
   фиксированная таксономия reason, без сырых строк ошибок.

## P3 — к исправлению или явному принятию (кратко)

- Исключение из пробы роняет весь цикл watcher'ов без probe-event и без
  `unknown`-сигнала (`src/watchers/runner.ts:76`); ошибки NTP/TCP-адаптеров
  маппятся в конкретные классы вместо `unknown` (§4 «unknown никогда не молчит»).
- Suppression держится, пока открыт root-сигнал, даже после восстановления
  root-пробы (маскирует новый network/timeout до 5 мин) — зафиксировать
  трактовку §10 в acceptance.
- `outcome_unknown` после 6 попыток застревает навсегда без терминального
  audit-исхода «gave up» (`src/bot/sender.ts:97-105`).
- Fixed-window breaker допускает 2×limit на стыке окон; `breaker_suppressed`
  сжигают daily cap недоставленных сообщений.
- `recoverPendingEffects`/`acceptedEffects` сканируют весь tg-лог при каждом
  старте (рост без границы).
- `buildSupervised()`/`checkSupervised()` собирают реальные адаптеры без
  env-гейта (гейт только в `main()`); перенести `assertSupervisedGates` в
  сборку.
- `missed_run`-сигнал store-watcher'а поднимается и по инференсу
  `scheduled+grace` без supervisor-written `missed`-события — задокументировать
  как санкционированный резерв либо убрать.
- Run-lease не имеет expiry/takeover (в отличие от триггеров): run умершего
  holder'а вечно `started` (ловится только stale_lease-сигналом).
- `projectionDrift()`-проба сайд-эффектит полный rebuild проекций внутри
  read-пути (`src/watchers/probes/store.ts:169-194`).
- Store-CAS лизов — не guarded-UPDATE, а optimistic seq на дисциплине
  caller'ов (латентный footgun против §8 «CAS-claim»).
- Offset-append поллера не фенсится на write-point (держится на синхронности
  batch-цикла; любой будущий await внутри цикла ломает single-writer).
- 64KB readCapped-путь реального HTTP не исполняется тестами (инжектится флаг
  `truncated`).
- Замер RTO в backup-drill использует реальный Date.now (безвредно).

## Условия перехода к GO раунда R2
1. Фиксы P1-1, P1-2 + новые тесты, которые падают на текущем коде
   (production-restart для P1-1; escalated-доставка digest/attention для P1-2).
2. По каждому P2 — фикс либо явное аргументированное «принять как есть»
   (для №1 деэскалации «принять» невозможно — контракт §10 заморожен).
3. P3 — таблицей «fixed / accepted + причина».
4. Полный зелёный прогон + отсутствие новых отклонений от ТЗ.
Enablement по-прежнему отдельный гейт: §14 fault-injection acceptance целиком
+ тихая неделя (§15) — этим ревью НЕ выдаётся.

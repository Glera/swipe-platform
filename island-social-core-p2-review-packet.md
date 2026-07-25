# Island Social Core P2 — implementation/release packet

Дата: 25.07.2026  
Статус: implementation, review, merge и default-off production deploy complete.
Safety slice live; два product enable остаются отдельными operator gates.

## 1. Exact review heads

| Repo | Branch / head | PR |
|---|---|---|
| `swipe-backend` | review `codex/island-p2@eed11a9`; merged `master@655ad32` | [#12](https://github.com/Glera/swipe-backend/pull/12) |
| `feed-prototype` | review `codex/island-p2@151b437`; merged `master@34642cc` | [#6](https://github.com/Glera/feed-prototype/pull/6) |
| `playables` deploy policy | merged `master@e141101`; explicit Island release profile | [#1](https://github.com/Glera/playables/pull/1) |
| `swipe-platform` | production export `master@aacdc04`; content commit `ce531ec` | Render Static |
| `p4g-workspace-meta` | этот packet + durable CLAUDE sync | commit этой ревизии |

База обоих кодовых PR — текущий `master`; миграция P2 — линейная
`0054_island_mod_action_seq → 0055_island_p2`.

## 2. Что входит

### Safety slice — выпускается без экспериментального enable

- Реальный UI `DELETE friend` и block с подтверждением.
- Block под pair-lock атомарно soft-remove дружбу, блокирует обе стороны во
  всех существующих public/visit/result контурах и повторно проверяется при
  accept visit-card.
- Старый локальный visit simulator отсутствует в production source и защищён
  regression assertion. Карта/счётчики читают только серверные факты игроков и
  зарегистрированных server-owned ботов.

### Visit-card experiment — отдельный default-off gate

- Ролл существует только после exact server-owned chest closure:
  caller `VerifiedRun(metric_key=series)` + consumed/root `RunTicket` +
  `RewardLedger(lw:{run_id}, reason=series_complete, exact ticket_id)`.
  Foreign, level и legacy-no-ticket выглядят как typed 404.
- `roll_id` server-derived UUID5; chance/holdout/target детерминированы;
  config digest и canonical response сохранены. Replay не перечитывает профиль
  и не перебрасывает ролл.
- 30% chance, 10% holdout, cap 5 offered/day — versioned defaults.
  Human-first target, затем enabled bot; исключены self/friends/blocks,
  непубличные и takedown домики.
- Клиент вызывает award только после confirmed exact `/results` receipt.
  `won && !holdout` занимает единственный post-chest prompt slot; failure quiet.
  Accept открывает реальный public island, decline закрывает карточку.

Гейты: backend `ENABLE_ISLAND_VISIT_AWARDS=false`; client
`VITE_ISLAND_VISIT_AWARDS_ENABLED=false`.

### Telegram notifications — второй независимый default-off gate

- Native `requestWriteAccess()` вызывается на осмысленном invite action один
  раз на Telegram user. Ответ сохраняется на backend; transient API failure
  повторяет только backend write, без второго native prompt.
- Semantic outbox: immediate `friend_joined` и ≤1 daily digest/UTC-day.
  Unique dedup, config digest, lease recovery, max 3 physical attempts,
  append-only attempt evidence.
- Перед каждым I/O повторно проверяются consent и friend block. Quiet hours v1:
  21:00–08:00 UTC. Digest watermark продвигается только после confirmed send.
- Bot token редактируется из transport exceptions до записи в DB/log.

Гейты: backend `ENABLE_ISLAND_NOTIFICATIONS=false`; client
`VITE_ISLAND_NOTIFICATIONS_ENABLED=false`. Реальный Telegram send намеренно не
выполнялся без отдельного operator GO.

## 3. Evidence

### Full regression

- Backend: `847 passed, 359 skipped, 10 subtests passed`.
- Client: полный `npm run lint`, включая весь TypeScript/browser/catalog
  regression и P2 production-browser test — PASS.
- Workspace-meta: `29/29` document/authority tests — PASS.
- `git diff --check` — clean в трёх repo.
- GitHub exact-head CI: backend full PostgreSQL + 17 migration/drift jobs,
  client lint/build и meta verify — PASS. Первый backend run имел один Docker
  pull timeout и поймал немонотонный P2 test clock; exact fix-head rerun полностью
  green.

### Physical PostgreSQL / migration

- P2 PG: exact chest replay и негативы; holdout/cap/human-first; atomic block +
  stale accept; consent/dedup/confirmed watermark; quiet hours;
  revoke-before-I/O.
- Совместный Island PG suite: P1/P3/P4/P2 — `93 passed`.
- Migration `0055` downgrade→upgrade + append-only-attempt trigger — PASS.

### Browser

- Focused production build: remove `DELETE`, block `PUT`, consent-once +
  backend retry, exact production card renderer/actions, duplicate-card guard,
  holdout/source assertions — PASS.
- Реальная вертикаль: production client + uvicorn + migrated PostgreSQL +
  genuine HMAC TMA auth. Все прежние P1 owner/guest/friend/bot/dogfood cases
  зелёные; новый case:

  `exact chest → visit-card → public island → completed visit →
  guest gift(+3) → owner collect(1)`.

  БД сверена: award `accepted`, outcome `granted/3`, collect `granted/1`.

### Production default-off release

- Backend Render health после deploy возвращает build `655ad32`; migration
  `0055` вошла через merge #12. Новые award/write-access/block поверхности
  отвечают без auth чистым `401`, без `404/5xx`.
- Static production feed опубликован штатным source-locked deploy:
  stamp `2026-07-25 13:30 UTC · ce531ec · feed 34642cc02122`,
  `release.json.feedCommit=34642cc021225fdfd2a4311ca73859ac1f1eb2a3`,
  `deployToolingCommit=e1411013afbc5d0443824898330c4f824000b1fa`.
- Shipped bundle содержит реальные remove/block и P2 API-контракты, не содержит
  legacy simulator identifiers. Release metadata и emitted-bundle verifier
  подтверждают exact profile `Island=true / cards=false / notifications=false`;
  backend Render blueprint сохраняет соответствующие server flags `false`.
- Production browser на exact stamp видит вкладку «Мета» и четыре реальные
  friend-invite cells; backend health возвращает build `655ad32`.
- Поэтому live сейчас только safety slice. Visit-card roll/renderer и native
  consent/outbound runner остаются inert до двух независимых operator решений.

## 4. Self-adversarial fixes during closure

1. Native permission accepted + transient backend failure сначала терял consent:
   добавлен per-user pending receipt и retry без повторного prompt.
2. Consent localStorage сначала был общим для WebView: ключи привязаны к
   authenticated Telegram user id.
3. Transport exception потенциально мог включить Bot API URL/token: token
   теперь redacted, добавлен regression test.
4. Stale card accept после нового block: server re-check доказан PG-тестом.
5. Первый vertical harness ожидал плоский `puzzles`; production wire честно
   вернул `gift.puzzles`. Исправлен только harness; полный прогон повторён green.
6. Rerun fixture пытался удалить append-only `verified_runs`: fixture сделан
   идемпотентным и переиспользует exact chest identity.
7. CI после 13:00 UTC поймал немонотонный test clock (`replace(hour=12)`):
   production корректно не взял future outbox. Test clock перенесён на
   фиксированное время `now + 2 days`; P2 PG повторён на fresh DB.
8. Первый default-off production export зависел от ambient shell-флага и
   ненамеренно скрыл уже одобренный Island UI. Backend и данные не затронуты;
   UI сразу восстановлен. Deploy-policy #1 сделал профиль source-controlled:
   Island UI всегда `true`, оба P2-гейта всегда `false` по умолчанию; неверные
   комбинации fail closed, exact literals проверяются в emitted bundle и
   записываются в `release.json`. Повторный deploy без ambient env доказал
   `true/false/false` на production stamp `ce531ec`.

## 5. Честные residuals

- Telegram Bot API не принимает idempotency key. Crash после успешного send,
  но до DB confirm, может дать bounded duplicate при lease recovery (≤3
  attempts). Exactly-once не заявляется.
- Quiet hours пока UTC, потому что timezone пользователя не является
  доверенным серверным фактом.
- Holdout скрывает карточку в поддерживаемом клиенте; raw award response хранит
  target для exact experiment evidence.
- P5 closed CDN остаётся отдельным device-spike/пакетом и не входит в P2.

## 6. Выполненный release и оставшиеся стоп-гейты

Выполнено: exact-head CI → backend merge/deploy → client merge/source-locked
static deploy → health/build/unauth smoke. Authenticated remove/block и полный
visit-card путь доказаны на production build в реальной локальной вертикали с
PostgreSQL; production-пользователей для mutating smoke пакет не создаёт.

Осталось только:

1. **Operator gate A:** отдельно включить visit-card backend + client build
   (defaults 30% / holdout 10% / cap 5).
2. **Operator gate B:** отдельно включить native consent + outbound runner и
   подтвердить quiet hours `21:00–08:00 UTC`, max attempts `3`.

Оба enable являются отдельными внешними state changes; default-off release их
намеренно не выполнил.

### Exact operator procedure

**Gate A — visit-card.**

1. В backend поменять только `ENABLE_ISLAND_VISIT_AWARDS=true`, оставить
   version/chance/holdout/cap без изменений; после Render deploy проверить
   health и auth boundary.
2. Выпустить клиент штатным deploy:
   `VITE_ISLAND_VISIT_AWARDS_ENABLED=true bash scripts/deploy-swipe.sh`.
   Release-policy сама фиксирует `Island=true`, notifications остаются `false`,
   а emitted bundle и `release.json` обязаны доказать `true/true/false`.
3. Проверить один реальный exact chest и receipt/метрики
   `eligible_chest → accepted|declined`; holdout не должен показать карточку.
4. Rollback: сначала клиентский профиль `true/false/false`, затем backend
   `ENABLE_ISLAND_VISIT_AWARDS=false`. Сохранённые receipts не удалять.

**Gate B — consent + outbound Telegram.**

1. В backend поменять только `ENABLE_ISLAND_NOTIFICATIONS=true`; boot-validator
   требует существующий `BOT_TOKEN`, social flag и config version. До client
   deploy поддерживаемый клиент не создаёт новых consent; runner всё равно
   обслуживает только явно сохранённые `allows_write_pm=true`.
2. Выпустить клиент:
   `VITE_ISLAND_NOTIFICATIONS_ENABLED=true bash scripts/deploy-swipe.sh`.
   Exact release profile для отдельного B — `true/false/true`; для обоих
   включённых гейтов — `true/true/true`.
3. На одном операторском Telegram-аккаунте пройти meaningful invite,
   подтвердить единственный native prompt и проверить одну confirmed attempt;
   затем контролировать outbox attempts, terminal/retryable и отсутствие
   отправок в `21:00–08:00 UTC`.
4. Emergency rollback: сначала backend
   `ENABLE_ISLAND_NOTIFICATIONS=false` (останавливает materialize и I/O), затем
   клиентский notifications gate `false`. Consent и append-only receipts не
   удалять.

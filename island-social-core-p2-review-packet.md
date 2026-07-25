# Island Social Core P2 — implementation/release packet

Дата: 25.07.2026  
Статус: implementation complete; feature branches pushed; exact-head CI green.
Merge/deploy и operator enable gates remain. Master, Render deploy и production
flags на этой ревизии ещё не изменялись.

## 1. Exact review heads

| Repo | Branch / head | PR |
|---|---|---|
| `swipe-backend` | `codex/island-p2@eed11a9` | [#12](https://github.com/Glera/swipe-backend/pull/12) |
| `feed-prototype` | `codex/island-p2@151b437` | [#6](https://github.com/Glera/feed-prototype/pull/6) |
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
`VITE_ISLAND_VISIT_AWARDS_ENABLED` unset.

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
`VITE_ISLAND_NOTIFICATIONS_ENABLED` unset. Реальный Telegram send намеренно не
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

## 5. Честные residuals

- Telegram Bot API не принимает idempotency key. Crash после успешного send,
  но до DB confirm, может дать bounded duplicate при lease recovery (≤3
  attempts). Exactly-once не заявляется.
- Quiet hours пока UTC, потому что timezone пользователя не является
  доверенным серверным фактом.
- Holdout скрывает карточку в поддерживаемом клиенте; raw award response хранит
  target для exact experiment evidence.
- P5 closed CDN остаётся отдельным device-spike/пакетом и не входит в P2.

## 6. Release order и стоп-гейты

1. Дождаться green exact-head CI и review обоих PR.
2. Merge backend #12, затем client #6. Это развернёт migration + remove/block,
   но visit-card/messages останутся физически inert.
3. После deploy проверить health/build, migration head, 401 без auth и
   authenticated remove/block smoke.
4. **Operator gate A:** отдельно включить visit-card backend + client build
   (defaults 30% / holdout 10% / cap 5).
5. **Operator gate B:** отдельно включить native consent + outbound runner и
   подтвердить quiet hours `21:00–08:00 UTC`, max attempts `3`.

Merge/deploy и оба enable являются внешними state changes. Этот пакет их не
выполняет автоматически.

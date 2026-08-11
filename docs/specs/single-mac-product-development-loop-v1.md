# Single-Mac Product Development Loop v1

Статус: **SUPERSEDED как operating authority решением 11.08.2026; merged
default-off foundation остаётся reusable evidence**.

Successor:
`docs/specs/two-mac-zero-transfer-bridge-phase-0.md`.

Ниже сохранён frozen контракт 09.08. Его Telegram intake → durable backend
record → one Issue → attended terminal status → Telegram notification уже
влит и переиспользуется. Запрет Mac B на merge `swipe-generator`/`playables` и
Single-Mac-only routing больше не действуют; остальные credential/publication
границы сохраняются в successor и `CLAUDE.md`.

## 1. Топология

### Main Mac — Product Control Plane

- единственный owner platform development и portfolio `STATE.md`;
- `swipe-backend`, `feed-prototype`, static `swipe-platform`, Labs code и
  связанные PR/merge/deploy;
- Telegram platform intake, durable GitHub ticket и одна видимая очередь;
- один активный platform-ticket;
- Codex — implementer, Claude — независимый reviewer, когда review требует
  реальная authority-граница.

Первый vertical заканчивается candidate/status notification. Он не
автоматизирует PR, merge или deploy и не создаёт credentials, env, schedules
или unattended runner.

### Second Mac — Content Factory only

- copy/create/variation first-party mechanics;
- candidate builds, technical tests, action traces и visual proof;
- не более 2–3 `READY_TO_PLAY` content candidates одновременно.

Second Mac не меняет platform/backend, не владеет repository merge, production
credentials, deploy, runtime schedules или `STATE.md`, не запускает
platform-worker и не является запасным Product Control Plane. Content output
передаётся Main Mac как exact candidate packet; PR/merge/publication остаются
на Main Mac и под существующим human authority.

## 2. Детерминированный routing

| Typed ingress | Route | Результат |
| --- | --- | --- |
| Telegram `platform_change` | Main Mac platform queue | durable platform-ticket |
| Labs `create/copy/variation` | Content Factory | content candidate packet |
| Content Factory обнаружил platform dependency | остановить content work | `NEEDS_PLATFORM_CHANGE` + linked platform-ticket |

Свободный текст не выбирает Mac, provider, model или review tier. AI-router,
quota optimizer и автоматический выбор между подписками не строятся.

## 3. Platform ticket и очередь

GitHub Issue `Glera/p4g-workspace-meta#N` — durable engineering record.
Telegram/Mini App — operator UX. Backend ingress/outbox не становится общей
agent DB и хранит только source identity, Issue delivery receipt, один
attended terminal receipt и notification outbox. GitHub Issues — единственная
development queue; отдельная backend queue поверх неё не строится.

Минимальный наблюдаемый lifecycle:

```text
Telegram request → GitHub Issue → attended Main Mac session
                 → READY_TO_PLAY | NEEDS_HELP → Telegram notification
```

`READY_TO_PLAY` обязан ссылаться на exact candidate repository, commit SHA,
artifact digest и URL. `NEEDS_HELP` содержит safe blocker и
`nothingPublished=true`. Узкий attended CLI записывает только один из двух
terminal receipts после работы основной сессии; он не запускает Codex/Claude
и не исполняет код. Bridge, terminal и notification one-shot CLI запускает
attended Main-Mac session, не оператор вручную. Steady-state действия оператора
ограничены надиктовкой задачи, получением terminal notification и открытием
результата. Notification — проекция durable receipt, не authority.
Один active platform-ticket обеспечивается ручной WIP-дисциплиной в GitHub
Issues; repo-lock, lease и merge queue не нужны.

## 4. Content Factory boundary

Content lifecycle независим от platform queue и сохраняет existing Fast Lane
technical/visual/operator gates. Content Factory не создаёт скрытую
platform-задачу: при platform dependency он пишет один typed
`NEEDS_PLATFORM_CHANGE` receipt и linked platform-ticket. Пока platform-ticket
не дал exact compatible result, content candidate остаётся blocked.

Content Factory не получает Telegram bot token, production deploy credential
или generic GitHub mutation authority. Его 2–3 READY limit — WIP discipline,
не distributed scheduler.

## 5. Review и authority

- content-only dogfood: technical tests + traces/visual proof + operator
  game-feel; model review не обязателен;
- bounded platform/Labs patch: один blind Claude review готового exact patch;
- backend/migration/auth/shared release boundary: тот же независимый review,
  exact-head PostgreSQL CI и требуемый operator GO для authority-changing
  действия;
- reviewer видит ticket, acceptance, exact patch/head, callers/tests и
  authority docs, но не авторский transcript/self-assessment.

Cross-Mac review больше не является gate. Второй Mac не используется как
reviewer или fallback platform owner.

## 6. Жёсткие запреты

- distributed merge queue, repo-lock или lease infrastructure;
- AI-router, quota optimizer, provider picker;
- общая agent platform или generic task store;
- background agent runner, scheduler/polling supervisor или автоматический
  запуск Codex/Claude subscription;
- автоматический выбор implementer/reviewer или candidate builder общего
  назначения;
- platform/backend worker на втором Mac;
- production credentials, merge-authority, deploy или `STATE.md` ownership на
  втором Mac;
- смешивание development loop со `swipe-agents`;
- автоматический merge/deploy в первом vertical.

## 7. Первый acceptance vertical

```text
signed Telegram platform request
→ durable backend intake/outbox
→ exact GitHub Issue
→ visible Main Mac queue (one active)
→ attended Codex implementation
→ one blind attended Claude review
→ READY_TO_PLAY or NEEDS_HELP terminal receipt
→ backend-owned Telegram notification
```

Acceptance:

1. одна test platform request создаётся из Telegram и replay-safe видна в Main
   Mac queue;
2. request сохраняет exact actor/text/build/context и durable ticket identity;
3. implement/review lifecycle возвращает exact `READY_TO_PLAY` либо безопасный
   `NEEDS_HELP`;
4. operator получает notification, а notification loss не меняет durable
   state;
5. Second Mac не участвует ни в одном шаге;
6. существующий Content Factory продолжает работать без изменений;
7. merge/deploy остаются ручным последующим актом вне vertical.

## 8. Salvage checkpoint

Evidence checkpoints остановленной инициативы (только источники diff):

- backend `feac8523356a932452be763819520bbd1bddd582`;
- feed `337609f72552de7450f394f4a6682dcbd71d6761`;
- meta STOP checkpoint `c5b8909fe08a8942a7dcea73cddebd97f2d63f9c`.

Финальные backend/feed ветки всегда создаются от актуального `origin/master`.
Checkpoint commits не являются их ancestry: из них вручную переносятся только
явно перечисленные platform-only hunks/files — intake/outbox, exact Issue
transport, два terminal receipts и notification outbox. Mac A/B routing, две
author queues, `CELLS`, mechanic auto-linkage, cross-Mac handoff/review,
dispatcher, leases, generic candidate builder и любая будущая orchestration
infrastructure не переносятся.
Перед review patch обязан дать negative proof отсутствия этих конструкций и
проходит новый Tier 2 review целиком. Migration identity выбирается от
фактического Alembic head, а не наследуется из checkpoint по имени.

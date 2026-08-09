# Single-Mac Product Development Loop v1

Статус: **FROZEN как operating authority** (операторское решение 09.08.2026).

Supersedes:
`docs/specs/two-mac-development-operating-model.md`.

Эта модель определяет development ownership и routing. Продуктовый смысл
остаётся в `VISION.md`; merge/deploy/publication/credential authority из
`CLAUDE.md` не расширяется.

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
| Labs `create | copy | variation` | Content Factory | content candidate packet |
| Content Factory обнаружил platform dependency | остановить content work | `NEEDS_PLATFORM_CHANGE` + linked platform-ticket |

Свободный текст не выбирает Mac, provider, model или review tier. AI-router,
quota optimizer и автоматический выбор между подписками не строятся.

## 3. Platform ticket и очередь

GitHub Issue `Glera/p4g-workspace-meta#N` — durable engineering record.
Telegram/Mini App — operator UX. Backend ingress/outbox не становится общей
agent DB и хранит только source identity, delivery receipt и bounded status
projection.

Минимальный lifecycle:

```text
SUBMITTED → QUEUED → IN_PROGRESS
          → NEEDS_HELP
          → READY_TO_PLAY → ACCEPTED | REWORK_REQUESTED
```

`READY_TO_PLAY` обязан ссылаться на exact candidate repository, commit SHA,
artifact digest и URL. `NEEDS_HELP` содержит safe blocker и
`nothingPublished=true`. Notification — проекция durable transition, не
authority. Main queue сериализуется правилом «один active platform-ticket»;
repo-lock, lease и merge queue не нужны.

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
→ Codex implementation
→ one blind Claude review
→ READY_TO_PLAY or NEEDS_HELP durable transition
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

Импортируемые WIP commits остановленной инициативы:

- backend `feac8523356a932452be763819520bbd1bddd582`;
- feed `337609f72552de7450f394f4a6682dcbd71d6761`;
- meta STOP checkpoint `c5b8909fe08a8942a7dcea73cddebd97f2d63f9c`.

Из них разрешены только platform intake/outbox, exact Issue/event primitives,
status projection и candidate tooling. Mac A/B routing, mechanic→second-Mac
linkage, peer queues, cross-Mac handoff/review и любая будущая orchestration
infrastructure не импортируются как authority. Backend/feed checkpoint считаются
WIP и проходят новый review с нуля.

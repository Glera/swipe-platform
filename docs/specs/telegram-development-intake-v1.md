# Telegram Development Intake v1

Статус: **инициатива зафиксирована; Slice 0 подготовлен к исполнению,
продуктовая автоматизация не начата** (09.08.2026).

Authority верхнего уровня:

- продуктовый смысл и триаж — `VISION.md`;
- ownership, review ladder и двухмашинная работа —
  `docs/specs/two-mac-development-operating-model.md`;
- текущий выпуск first-party playable —
  `docs/specs/lab-playable-release-fast-lane.md`;
- мобильный review и Telegram-диктовка —
  `swipe-backend/docs/specs/mobile-series-order-review.md`;
- изменчивый portfolio status — `STATE.md`.

Этот документ владеет только новым ingress → engineering ticket → dispatch →
operator inbox контуром. Он не меняет publication, merge, deploy, impact,
financial или production-ops authority.

Исполняемый handoff:
`TELEGRAM-DEVELOPMENT-INTAKE-HANDOFF-2026-08-09.md`.

## 1. Проверяемая цель

Оператор из Telegram Mini App надиктовывает и редактирует задачу в контексте
конкретной механики или экрана платформы. Система без GitHub/terminal со
стороны оператора:

1. сохраняет исходный текст и server-owned контекст;
2. создаёт durable `development-ticket.v1` в GitHub meta-repo;
3. детерминированно направляет авторскую работу на Mac A или Mac B;
4. применяет review tier действующей two-Mac model;
5. возвращает exact candidate либо безопасный `NEEDS_HELP` в одну мобильную
   операторскую очередь;
6. сохраняет обычные merge/deploy/publication authority после принятия.

Существующий Fast Lane механик не получает нового operator-клика и не
повышается из Tier 0 по факту появления engineering-ticket. После 10–20
настоящих тикетов принимается отдельное решение об автоматическом provider
runner; до этого запуск сессий может оставаться frontier-assisted.

## 2. Словарь: четыре разные сущности

| Сущность | Что это | Authority |
| --- | --- | --- |
| intake request | исходная просьба оператора с контекстом | backend ingress receipt; для механики уже существует `feed.playable-rework.request.v1` |
| development ticket | инженерный контракт, ownership, repo/path intent, state | GitHub Issue `Glera/p4g-workspace-meta` |
| candidate/release | exact исполняемый результат | CI, preview/release journal и exact SHA/digest |
| review item | конкретное человеческое решение | существующий TMA mobile-review либо content-bound Telegram approval |

Request не является publication authority. Ticket не является candidate.
Review item не является dev-задачей. Смешивание этих сущностей в одну generic
таблицу или один scope запрещено.

## 3. Что означает «голосом» в v1

V1 повторяет уже реализованную семантику механик:

- кнопка **Надиктовать** фокусирует обычное редактируемое текстовое поле;
- используется системный микрофон Telegram/OS-клавиатуры;
- приложение не запрашивает microphone permission, не получает и не хранит
  audio bytes и не вызывает cloud/Web Speech;
- черновик сохраняется локально и может быть исправлен до отправки;
- backend получает только явно отправленный оператором финальный текст.

Приём voice-message из Telegram-чата, скачивание audio и server-side
transcription **не входят** в эту инициативу. Это отдельный privacy/storage/
bot-authority контур и потребует нового решения.

## 4. Два входа, один ticket contract

### 4.1 Механика

Существующий operator-only action **Доработать механику** сохраняет exact
`playableId`, mapping, roster activation, runtime digest/source SHA, feed
position, level/run и optional screenshot. После принятия request
детерминированный bridge создаёт и связывает один development-ticket до
официального candidate.

Пользовательский happy path не меняется:

```text
диктовка → Отдать в работу → candidate → Поиграть → Принять и опубликовать
```

Связанный GitHub Issue остаётся под капотом. Один active rework root на
механику, отсутствие auto-retry, технический профиль, visual proof и exact
Telegram approval Fast Lane сохраняются.

### 4.2 Платформа

Новый operator-only action **Доработать платформу** открывает ту же по стилю
TMA-форму и сохраняет минимум:

- signed Telegram actor и server time;
- исходную редактируемую инструкцию;
- `surface/route` и platform build/release SHA;
- видимый screen context и optional screenshot;
- caller-side mutation id для replay;
- optional mechanic/entry/run context, если platform-screen его уже имеет.

Оператор не выбирает репозиторий, review tier, модель или Mac. Первый Slice 1
принимает только bounded frontend/UI задачу платформы; backend/core запрос
может быть сохранён, но triage повышает его до Tier 2 до начала реализации.

## 5. `development-ticket.v1`

Ticket identity v1 — immutable GitHub identity
`Glera/p4g-workspace-meta#<issue-number>`. Issue template:
`.github/ISSUE_TEMPLATE/development-ticket.md`.

Обязательные поля:

- ticket id, request actor и server timestamp;
- source request id/hash и исходный текст/voice transcript без подмены;
- `mechanic | labs | platform | impact | engineering-os`;
- screen/mechanic/client/build/screenshot context, когда доступен;
- ожидаемый пользовательский результат и проверяемые acceptance criteria;
- предполагаемые repo/path intent;
- assigned cell, line owner и ticket author;
- review tier `0 | 1 | 2` с причиной;
- branch/worktree и exact candidate/PR identity;
- текущее lifecycle state и ссылки на evidence;
- machine-readable blockers без сырого model/test лога.

Issue создаётся сразу после durable intake, а не после готового кода. Для
существующей ветки ticket фиксирует текущий head и импортирует её; пересоздание
ветки запрещено.

## 6. Маршрутизация и review

| Ticket type / затронутая authority | Author cell | Default tier |
| --- | --- | --- |
| `platform` bounded `feed-prototype`/static UI | Mac A | 1 |
| `impact` product code без реального impact-акта | Mac A | не ниже 1 |
| `mechanic` content/tuning/exact-user dogfood | Mac B | 0 |
| `labs` bounded generator/Lab code | Mac B | 1 |
| `engineering-os` | Mac B | 1 |
| backend, migration, auth, money, shared release authority | Mac A merge-authority | 2 |

Реально затронутая граница всегда сильнее заявленного типа. Mac B не может
слить backend-изменение: ticket повышается до Tier 2 и передаётся Mac A по
письменному handoff.

На каждой машине одновременно один активный author ticket. Review может идти
параллельно и не занимает author slot. Repo/path overlap сериализуется
владельцем линии; отдельные repo-lock, distributed lease и merge queue в v1 не
строятся.

## 7. Lifecycle и две очереди

Единый lifecycle остаётся из two-Mac model:

```text
SUBMITTED → TRIAGED → QUEUED → IN_PROGRESS
          → NEEDS_HELP
          → READY_TO_PLAY → ACCEPTED → MERGING/DEPLOYING → LIVE → CLOSED
                          → REWORK_REQUESTED → QUEUED
          → CANCELLED
```

В UI различаются две проекции:

1. **Development queue:** `TRIAGED | QUEUED | IN_PROGRESS` по Mac/line.
2. **Operator inbox:** `READY_TO_PLAY | NEEDS_HELP`, агрегированный с обеих
   машин и существующих release/review контуров.

`QUEUED` с reason `machine_offline` используется вместо нового скрытого
состояния. Ошибка не остаётся только в terminal/локальном логе: она переводит
ticket в `NEEDS_HELP` с безопасным описанием и подтверждением, что ничего не
опубликовано.

GitHub Issue является durable engineering record. Exact test/review/candidate/
release evidence остаётся у CI и соответствующего runtime. TMA показывает
bounded projection и не создаёт параллельный task truth. Детали current-state
projection и CAS фиксируются до Slice 1 (решение D3 ниже).

## 8. Целевая архитектурная граница

```text
signed TMA intake
  → narrow backend intake receipt/outbox
  → deterministic GitHub bridge
  → p4g-workspace-meta Issue
  → Mac A/B assisted dispatcher
  → isolated worktree + CI/review/candidate
  → ticket state/evidence projection
  → TMA development queue + operator inbox
```

- Telegram bot token не передаётся Engineering OS или авторскому агенту.
- GitHub credential не передаётся автору/reviewer и не даёт production
  authority.
- Backend intake/outbox не становится universal task store: после Issue ACK
  engineering lifecycle принадлежит Issue.
- `swipe-agents` может продолжать deterministic notifications, но не запускает
  LLM и не становится dev-dispatcher.
- Live Lab остаётся на Mac A из detached exact `master`. Target-state authoring
  mechanic ticket живёт на Mac B; Mac A получает exact source SHA/release
  handoff и исполняет только runtime-host часть.

## 9. Этапы

### Slice 0 — operating discipline, без product mutations

1. Зафиксировать этот spec и executable handoff.
2. Добавить общий Issue template `development-ticket.v1` в meta-repo.
3. Добавить видимую таблицу WIP в верх `STATE.md`.
4. Зафиксировать D3–D5 ниже до code implementation.
5. Провести два локальных dry-run ticket packet: Mac A platform и Mac B
   mechanic; без GitHub Issue creation, provider launch, merge или deploy.

Acceptance: оба packet полностью заполняют contract; routing/tier однозначны;
overlap виден; Fast Lane request bytes и operator UX не меняются.

### Slice 1 — первый platform vertical на Mac A

```text
TMA platform request → durable Issue → assisted Mac A author
→ Tier 1 blind review → HTTPS exact candidate
→ READY_TO_PLAY → operator ACCEPT/REWORK
```

Первая задача — маленькая UI/presentation правка `feed-prototype`, без
backend/migration/auth/release-infra. GitHub и terminal оператор не видит.

### Slice 2 — Mac B и существующий Fast Lane

1. Автоматически связать mechanic request с development-ticket.
2. Передать author execution на Mac B, сохранив Tier 0 и technical/visual
   gates.
3. Передать exact source SHA runtime-host Mac A для release preparation.
4. Агрегировать candidates/NEEDS_HELP обеих машин в один inbox.
5. Доказать восстановление после offline одной машины без duplicate author.

Переход делается аддитивно: текущий Mac A Fast Lane остаётся working fallback,
пока Mac B path не прошёл acceptance. Два executor одного request одновременно
запрещены.

### Slice 3 — решение о runner

После 10–20 реальных tickets измерить ручной запуск, quota/offline и conflicts.
Ровно одно решение:

- `KEEP ASSISTED`;
- `BUILD PROVIDER ADAPTER`;
- `FIX TICKET/STATUS LOOP`;
- `STOP`.

## 10. Критерии успеха пилота

- platform и mechanic ticket создаются с телефона без GitHub/terminal;
- исходная просьба и exact context доходят до candidate без потери связи;
- Mac A и Mac B могут вести по одному независимому author ticket;
- operator видит одну очередь `READY_TO_PLAY/NEEDS_HELP`;
- Tier 0 Fast Lane не получает model-review ceremony;
- Tier 1/2 имеют требуемую независимость и exact-head evidence;
- ни одна merged/deployed работа не остаётся без ticket;
- после 10–20 tickets нет неясных веток, владельцев или stale merge;
- Engineering OS/reviewer не получает production credentials;
- измерены `SUBMITTED→IN_PROGRESS`, `IN_PROGRESS→READY_TO_PLAY`, operator wait,
  rework, NEEDS_HELP, repo/path conflicts и provider availability.

## 11. STOP-границы

- Не строить новую общую БД задач, scheduler, repo-lock, merge queue или quota
  optimizer до пилота.
- Не принимать Telegram voice-message/audio в рамках v1.
- Не объединять development queue с mobile review, catalog publication или
  production-ops authority.
- Не давать TMA generic command API или model/provider picker.
- Не переносить live Lab на Mac B и не запускать его из author worktree.
- Не требовать Issue/LLM review до локального spike; ticket обязателен только
  перед уже замороженными gates PR/candidate/handoff/merge/deploy.
- Не считать notification, label, model verdict или branch name evidence exact
  candidate.
- Не выполнять external GitHub settings/credentials/deploy до отдельного
  operator authority соответствующего шага.

## 12. Decision log

| ID | Статус | Решение / вопрос | Момент закрытия |
| --- | --- | --- | --- |
| D1 | FROZEN | Voice v1 = editable system dictation; no audio/voice-message ingestion | сейчас |
| D2 | FROZEN | Все cross-repo development tickets живут в `Glera/p4g-workspace-meta` | сейчас |
| D3 | FROZEN | Durable lifecycle/CAS и append-only projection зафиксированы в [Issue #94, D3](https://github.com/Glera/p4g-workspace-meta/issues/94); второго task truth нет | 11.08.2026 |
| D4 | FROZEN | Host/credential boundary зафиксирована в [Issue #94, D4](https://github.com/Glera/p4g-workspace-meta/issues/94); новые credentials/runner/daemon не разрешены | 11.08.2026 |
| D5 | FROZEN | Exact candidate использует только существующий repository-specific HTTPS path по [Issue #94, D5](https://github.com/Glera/p4g-workspace-meta/issues/94); новый candidate host не создаётся | 11.08.2026 |
| D6 | FROZEN | Mechanic request создаёт linked ticket автоматически и без operator click | сейчас |
| D7 | FROZEN | Zero-transfer wake/callback и one-owner handoff зафиксированы в [Issue #94, D7](https://github.com/Glera/p4g-workspace-meta/issues/94); существующие task/heartbeat переиспользуются | 11.08.2026 |
| D8 | DEFERRED | Assisted launch или provider adapter | после 10–20 tickets |

D3–D5 и D7 закрыты durable решением Issue #94. Эта спецификация ссылается на
него и не дублирует изменчивый implementation/runtime status. Любое изменение
этих решений требует нового явного authority; D8 остаётся отложенным до
наблюдения 10–20 реальных tickets.

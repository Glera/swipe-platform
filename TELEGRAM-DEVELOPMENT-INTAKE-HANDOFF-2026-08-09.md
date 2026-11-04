# Handoff: Telegram Development Intake + Two-Mac Queue v1

Дата: 09.08.2026

Владелец: frontier portfolio owner, Mac A

Authority:
`docs/specs/telegram-development-intake-v1.md`

Parent authority:
`docs/specs/two-mac-development-operating-model.md`

Статус: цель запущена; документационный Slice 0 подготовлен, code/external
mutations не начинались.

## Цель одной фразой

Дать оператору единый Telegram-first путь «надиктовать mechanic/platform
ticket → одна из двух машин делает работу → exact candidate или NEEDS_HELP
возвращается на телефон», сохранив Fast Lane, ownership и human authority.

## Читать перед исполнением

1. `STATE.md`.
2. `AGENTS.md` и root `CLAUDE.md`.
3. `VISION.md`.
4. `docs/specs/two-mac-development-operating-model.md`.
5. `docs/specs/telegram-development-intake-v1.md`.
6. `docs/specs/lab-playable-release-fast-lane.md`.
7. `swipe-backend/docs/specs/mobile-series-order-review.md`.
8. `docs/specs/dev-loop.md`.

## Исходный audit

Переиспользуемые primitives уже существуют:

- Feed/TMA mechanic action с exact occurrence, editable dictation и optional
  screenshot;
- backend durable request `open|claimed|closed` и additive `blocked` execution;
- Generator oldest-open coordinator, bounded source-agent, technical checks,
  visual proof, exact source commit и Fast Lane release;
- Telegram exact approval и mobile review inbox;
- isolated worktree, per-repo CI и blind review primitives;
- GitHub meta-repo как portfolio authority.

Не существует:

- `development-ticket.v1` GitHub lifecycle в реальном использовании;
- platform intake route/surface;
- bridge request → meta Issue;
- Mac A/B dispatcher/status bridge;
- unified development/output projection;
- accepted способа host exact HTTPS platform branch candidate.

Текущие локальные `swipe-backend` и `swipe-generator` checkout содержат
пользовательские dirty изменения на старой mobile-review ветке. Не использовать
их для implementation и не чистить. Создавать отдельные clean worktree от
fresh `origin/master`.

## Замороженные решения

1. Voice — системная диктовка в editable textarea, не Telegram voice-message.
2. GitHub Issue в `Glera/p4g-workspace-meta` — durable cross-repo ticket.
3. Platform → Mac A; mechanic/Labs → Mac B; реальная authority может повысить
   tier и передать merge Mac A.
4. Один active author ticket на Mac; review не занимает author slot.
5. Mechanic Fast Lane остаётся Tier 0 и не получает новый operator-click.
6. Живой Lab остаётся на Mac A из detached `master`; Mac B передаёт exact SHA.
7. В v1 нет task DB, merge queue, repo-lock, quota optimizer или automatic
   provider runner до pilot decision.
8. GitHub/Telegram/production credentials не попадают к author/reviewer.

## Первый исполняемый пакет: Slice 0

### S0.1 — ticket contract

- Провалидировать `.github/ISSUE_TEMPLATE/development-ticket.md` на одном
  platform и одном mechanic fixture.
- Ticket id в реальном GitHub равен `Glera/p4g-workspace-meta#N`; в локальном
  dry-run используется `DRY-A-001` / `DRY-B-001` и явный `dry_run=true`.
- Не создавать GitHub Issues в рамках dry-run.

### S0.2 — routing dry-run

Platform fixture:

- type `platform`;
- repo intent `feed-prototype`, один bounded UI path;
- cell Mac A, Tier 1, reviewer другой provider того же Mac;
- no backend/deploy/credentials.

Mechanic fixture:

- source `feed.playable-rework.request.v1`;
- repo intent `playables/<exact source>`;
- cell Mac B, Tier 0;
- exact source SHA handoff Mac A runtime host;
- no model review, no publication in dry-run.

Acceptance: заполнены все mandatory fields, routing не зависит от свободного
текста, repo/path overlap вычислим, ticket не несёт publication authority.

### S0.3 — закрыть три pre-code решения

Подготовить bounded decision packets:

- **D3:** current state в Issue (recommended: single machine-readable field +
  GitHub event history/CAS), TMA read projection;
- **D4:** issue-only bridge credential и host, без доступа author agent;
- **D5:** exact HTTPS candidate для `feed-prototype` branch.

Для каждого packet: 2–3 реальных варианта, risk/rollback/secret surface,
recommendation и минимальный acceptance. Никаких settings/secret mutations.

### S0.4 — evidence

- root docs boundary lint;
- root `node --test 'scripts/*.test.mjs'`;
- `git diff --check`;
- `node scripts/worktree-status.mjs` в конце сессии;
- обновить `STATE.md` последним.

## Slice 1 после S0 acceptance

Один bounded frontend vertical:

```text
operator-only «Доработать платформу»
→ editable dictation + exact screen/build context
→ durable meta Issue
→ assisted Mac A isolated worktree
→ Tier 1 blind review + feed lint
→ exact HTTPS candidate
→ READY_TO_PLAY
→ operator ACCEPT или REWORK_REQUESTED
```

Не включать backend/core, миграцию, auth, Render setting, new secret или
production deploy в первый ticket. Отдельный deploy возможен только после
accepted exact candidate и действующего deploy authority.

## Slice 2 после живого platform vertical

Связать существующий mechanic request с meta Issue и доказать single-claim
переход:

```text
Mac A live intake/runtime host
→ one durable ticket/claim
→ Mac B author + technical/visual proof
→ exact source SHA handoff
→ Mac A release preparation
→ existing Telegram exact approval
```

До доказанного single-claim/CAS current Mac A source-agent остаётся fallback.
Нельзя одновременно запускать старый и новый executor на одном request.

## Выход Slice 0

1. Два валидных local dry-run ticket packet.
2. D3–D5 frozen decision packets.
3. Чистая документальная/тестовая проверка meta-repo.
4. Обновлённый `STATE.md` с текущим WIP и следующим exact action.
5. Ноль GitHub settings, credentials, provider, merge, deploy или production
   mutations.

После этого отдельная implementation-сессия начинает Slice 1 с clean Mac A
worktree и durable ticket.

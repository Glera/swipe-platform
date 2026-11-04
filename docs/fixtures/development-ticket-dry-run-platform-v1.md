# DRY-A-001 · Platform ticket packet

`dry_run=true`; GitHub Issue, branch, provider, candidate, merge и deploy не
создаются.

<!-- schema: development-ticket.v1 -->

## Request identity

- Ticket ID: `DRY-A-001`
- Request actor: `local-operator`
- Requested at: `2026-08-09T12:00:00.000Z`
- Source request ID/hash:
  `dry-platform-request-001 / sha256:e60dc7096ae347b29b42185436b74f116ac1bdefe504d053985a16df07cce4c9`
- Type: `platform`

## Original request

> На экране ленты сделать подпись версии платформы заметнее, не меняя игровую карточку.

## Captured context

- Surface/route: `feed /`
- Mechanic/playable: `unavailable: platform-level request`
- Client/platform build SHA: `0000000000000000000000000000000000000000` (synthetic dry-run identity)
- Runtime/candidate identity: `unavailable: no candidate before implementation`
- Screenshot/evidence: `unavailable: dry-run packet`

## Expected outcome

На мобильном экране оператор различает текущую версию платформы без открытия
debug-панели; расположение и touch-area игровой карточки не меняются.

## Acceptance criteria

- [ ] Стамп версии читаем в mobile viewport и не перекрывает bottom navigation.
- [ ] `npm run lint` в `feed-prototype` проходит на exact candidate head.
- [ ] Before/after screenshot подтверждает только bounded presentation change.

## Routing

- Assigned cell: `Mac A`
- Line owner: `frontier Platform line owner`
- Ticket author: `unassigned until IN_PROGRESS`
- Review tier: `1`
- Tier reason: `bounded feed-prototype UI code; no shared/core authority`
- Intended repositories/paths:
  `feed-prototype:src/feed.ts`, `feed-prototype:src/styles.css`
- Overlap check: `clear in dry-run WIP table`

## Execution identity

- State: `TRIAGED`
- Branch/worktree: `unassigned: dry-run does not create worktree`
- Imported head: `none: no existing branch`
- Candidate/PR identity: `none: dry-run stops before implementation`
- Evidence: `this packet + routing review only`

## Safe operator status

- Current summary: `Задача проверена маршрутизатором; изменения не начинались и не опубликованы.`
- Blocker/NEEDS_HELP: `none`

## Authority checklist

- [x] Ticket itself grants no merge, deploy, publication, impact or financial authority.
- [x] Original request and exact context remain linked to every future candidate.
- [x] Reviewer input will exclude the author transcript/self-assessment.
- [x] Production/Telegram/GitHub credentials are not exposed to author or reviewer.

## Dry-run verdict

`ROUTE MAC A · TIER 1 · ONE PLATFORM AUTHOR SLOT · NO EXTERNAL EFFECT`

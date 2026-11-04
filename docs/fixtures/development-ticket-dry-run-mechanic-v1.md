# DRY-B-001 · Mechanic ticket packet

`dry_run=true`; backend request, GitHub Issue, branch, provider, source commit,
release и publication не создаются.

<!-- schema: development-ticket.v1 -->

## Request identity

- Ticket ID: `DRY-B-001`
- Request actor: `local-operator`
- Requested at: `2026-08-09T12:01:00.000Z`
- Source request ID/hash:
  `dry-mechanic-request-001 / sha256:d7450841bb5f5239a2737097d10f1e923d1f352daa940141a94e98673a6e5607`
- Type: `mechanic`

## Original request

> Увеличить точки в Two Dots, чтобы на маленьком экране их было легче различать.

## Captured context

- Surface/route: `feed / exact built-in occurrence`
- Mechanic/playable: `orthogonal-link-v1 / orthogonal-link-v1-swipe`
- Client/platform build SHA: `0000000000000000000000000000000000000000` (synthetic dry-run identity)
- Runtime/candidate identity:
  `source=0000000000000000000000000000000000000000; runtime=sha256:0000000000000000000000000000000000000000000000000000000000000000`
  (synthetic dry-run identities)
- Screenshot/evidence: `unavailable: dry-run packet`

## Expected outcome

Точки различимы на маленьком экране, real-pointer input и техническая игровая
петля сохраняются; изменение остаётся exact-user dogfood до Telegram Approve.

## Acceptance criteria

- [ ] Изменены только bounded paths exact playable source.
- [ ] `test:orthogonal-link-v1:technical`, Swipe build и visual proof проходят.
- [ ] Exact source SHA передан runtime-host Mac A; publication отсутствует до существующего Telegram approval.

## Routing

- Assigned cell: `Mac B`
- Line owner: `frontier Labs line owner`
- Ticket author: `unassigned until IN_PROGRESS`
- Review tier: `0`
- Tier reason: `first-party playable tuning/exact-user dogfood; no shared runtime`
- Intended repositories/paths: `playables:orthogonal-link-v1/**`
- Overlap check: `clear in dry-run WIP table; one active root for mechanic`

## Execution identity

- State: `TRIAGED`
- Branch/worktree: `unassigned: dry-run does not create worktree`
- Imported head: `none: synthetic request has no existing branch`
- Candidate/PR identity: `none: dry-run stops before source execution`
- Evidence: `this packet + deterministic routing classification only`

## Safe operator status

- Current summary: `Задача проверена маршрутизатором; изменения не начинались и не опубликованы.`
- Blocker/NEEDS_HELP: `none`

## Authority checklist

- [x] Ticket itself grants no merge, deploy, publication, impact or financial authority.
- [x] Original request and exact context remain linked to every future candidate.
- [x] Tier 0 does not add a model-review ceremony.
- [x] Production/Telegram/GitHub credentials are not exposed to author or reviewer.

## Runtime-host handoff boundary

Mac B owns authoring and merge in `playables`. Mac A may prepare/release only an
exact source SHA received after Mac B technical/visual gates. This dry-run does
not resolve D7 single-claim transport and therefore starts neither executor.

## Dry-run verdict

`ROUTE MAC B · TIER 0 · ONE MECHANIC AUTHOR SLOT · MAC A RUNTIME HOST · NO EXTERNAL EFFECT`

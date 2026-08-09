# STOP handoff: Telegram Development Intake / two-Mac development

Дата: 09.08.2026

Terminal status: **STOP — SUPERSEDED BY OPERATOR DECISION**.

Оператор отменил модель двух равноправных рабочих ячеек. Второй Mac больше не
участвует в разработке платформы. Этот checkpoint не разрешает продолжать
dispatcher/router/lease/merge coordination, а также merge, deploy, credential,
secret, environment или runtime-schedule mutations.

## Checkpoint identity

Все три локальные ветки называются
`codex/telegram-development-intake-v1` и не pushed.

| Repository/worktree | Checkpoint |
| --- | --- |
| meta `/Users/gleb/My projects/p4g-platform-workspace-telegram-intake-v1` | commit, содержащий этот handoff; parent `08f34d6d3f1a857691f83c0c0d079705241d4a17` |
| backend `/Users/gleb/My projects/p4g-platform-workspace-telegram-intake-backend` | `feac8523356a932452be763819520bbd1bddd582` |
| feed `/Users/gleb/My projects/p4g-platform-workspace-telegram-intake-feed` | `337609f72552de7450f394f4a6682dcbd71d6761` |

Exact meta checkpoint SHA печатается terminal receipt после commit: commit не
может надёжно содержать собственный SHA. Ничего из checkpoint не удалять и не
переписывать до новой цели.

## Что сохранено

### Meta-repo

- `development-ticket.v1` Issue template, strict validator/router, append-only
  event reducer/hash chain и два dry-run ticket fixture;
- спецификация, D3–D5 decision packet и executable handoff инициативы;
- historical cross-links из two-Mac operating-model docs. Сама two-Mac модель
  теперь superseded и не является target-state authority.

### Backend

- default-off operator-only platform intake route и session capability с
  server-pinned build SHA;
- PostgreSQL request/outbox models и migration `0076`;
- linked mechanic delivery draft;
- exact-repository GitHub App Issue transport, one-shot bridge runner,
  ambiguous-outcome reconciliation и tests;
- release compatibility/CI wiring для migration.

Backend checkpoint — **WIP, не merge-ready**. Повторный blind Tier 2 review
нашёл четыре незакрытых finding: reserved ticket-id sentinel мог orphan-ить
Issue; terminal reconciliation мог retry-иться бесконечно; claimed mechanic
backfill выдавал начатую работу за новый `SUBMITTED`; context fields могли
инъецировать Markdown structure. Исправление было прервано операторским STOP,
поэтому даже частично изменённые участки требуют нового review с нуля.

### Feed

- capability-gated action «Доработать платформу» с editable system dictation,
  optional screenshot и actor-bound durable lost-response retry;
- strict response/list validation, auth teardown и GET/POST race fencing;
- candidate-preparation tooling с official feed/platform/UGC identity,
  repository CAS, isolated `npm ci`, exact manifest и dry-run/live separation;
- focused contract/browser/candidate tests.

Feed checkpoint — **WIP, не merge-ready**. Последний полный `npm run lint` был
немедленно прерван по STOP после прохождения TypeScript и части suites; финального
result нет. Повторный blind Tier 1 review исправленного F006–F011 delta не
проводился.

## Изменённые файлы

Backend checkpoint:

- `.env.example`
- `.github/workflows/postgres-acceptance.yml`
- `app/api_development_ticket_intake.py`
- `app/api_operator_playable_reworks.py`
- `app/api_session.py`
- `app/config.py`
- `app/db.py`
- `app/development_ticket_bridge_cli.py`
- `app/development_ticket_contract.py`
- `app/development_ticket_delivery.py`
- `app/development_ticket_github.py`
- `app/development_ticket_intake.py`
- `app/main.py`
- `app/models.py`
- `app/operator_playable_reworks.py`
- `migrations/versions/0076_development_ticket_intake.py`
- `tests/fixtures/development_ticket_genesis_golden.json`
- `tests/test_development_ticket_delivery.py`
- `tests/test_development_ticket_github.py`
- `tests/test_development_ticket_intake.py`
- `tests/test_development_ticket_migration_postgres.py`
- `tests/test_platform_release.py`
- `tests/test_platform_release_postgres.py`

Feed checkpoint:

- `package.json`
- `scripts/check-operator-development-intakes-browser.mjs`
- `scripts/check-operator-development-intakes.mjs`
- `scripts/prepare-platform-candidate.mjs`
- `scripts/prepare-platform-candidate.test.mjs`
- `src/api.ts`
- `src/feed.ts`
- `src/operator-development-intakes.d.mts`
- `src/operator-development-intakes.mjs`
- `src/styles.css`
- `vite.config.ts`

Meta checkpoint:

- `.gitignore`
- `.github/ISSUE_TEMPLATE/development-ticket.md`
- `TWO-MAC-DEVELOPMENT-OPERATING-MODEL-HANDOFF-2026-08-09.md`
- `TELEGRAM-DEVELOPMENT-INTAKE-HANDOFF-2026-08-09.md`
- `TELEGRAM-DEVELOPMENT-INTAKE-STOP-HANDOFF-2026-08-09.md`
- `docs/fixtures/development-ticket-dry-run-mechanic-v1.md`
- `docs/fixtures/development-ticket-dry-run-platform-v1.md`
- `docs/specs/telegram-development-intake-decisions-d3-d5.md`
- `docs/specs/telegram-development-intake-v1.md`
- `docs/specs/two-mac-development-operating-model.md`
- `scripts/development-ticket.mjs`
- `scripts/development-ticket.test.mjs`
- `STATE.md`

## External mutation receipt

External mutations: **none**.

- no GitHub Issue, PR, push, merge or remote branch;
- no GitHub App installation, permission, credential or secret;
- no backend environment/config change and no database migration execution;
- no Render/static/backend deploy;
- no runtime daemon, schedule or LaunchAgent;
- no production Telegram/bot mutation.

Во время локальной проверки создавались временные detached verification
worktree и sibling symlink aliases. При STOP process group был завершён, trap
удалил только эти временные объекты; persistent checkpoint не затронут.

## Что можно переиспользовать в single-Mac цели

Переиспользуемы после нового scope/review:

1. operator-only platform TMA intake и editable system dictation;
2. durable request identity, idempotency и default-off outbox;
3. узкий GitHub Issue transport и `development-ticket.v1` lifecycle primitives;
4. exact candidate builder/manifest для bounded platform UI;
5. safe `queued/confirmed/NEEDS_HELP` projection и lost-response recovery;
6. mechanic request linkage как вход в существующий single-Mac Fast Lane.

Не переносить как authority:

- routing `platform → Mac A`, `mechanic → Mac B`;
- две author queues, cross-Mac handoff или runtime-host split;
- любые будущие dispatcher, lease, repo-lock или merge-coordination идеи;
- claimed mechanic backfill и текущий Tier 2 bridge без нового blind review.

Новая цель должна сначала определить одного development owner, single-Mac
routing и судьбу существующего Fast Lane, затем явно импортировать нужные
checkpoint commits. Автоматически продолжать эту цель запрещено.

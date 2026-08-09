# Parked initiative: Workspace Hygiene and Authority Reconciliation

Дата подготовки: 09.08.2026

Статус: **PARKED — НЕ ИСПОЛНЯТЬ**, пока не выполнены trigger-условия §2.

Владелец при активации: frontier portfolio owner Mac A.

Назначение: безопасно свести Git/worktree/PR-долг после завершения текущих
параллельных инициатив, не удалить активную работу другого Mac и не смешать
санитарную чистку с продуктовой разработкой.

Этот документ — handoff будущей инициативы, а не разрешение на push/close/
delete/reset/prune/merge. Все изменчивые факты ниже повторно снимаются при
активации.

## 1. Почему инициатива припаркована

На момент подготовки одновременно идут три разрешённых потока:

1. throughput audit значимых вариаций механик;
2. Agent Team / Phase-B0 / Finance;
3. mobile-first development intake для двух Mac.

Они затрагивают meta, playables, generator, agents, backend и feed — почти
весь cleanup scope. Четвёртый исполнитель, закрывающий PR или удаляющий
worktree, может принять живую ветку другого Mac за stale. Текущий WIP-лимит
`2 product + 1 background` уже исчерпан.

## 2. Trigger-условия активации

Инициатива запускается только когда одновременно выполнено:

- variation audit завершён одним terminal-решением и оставил exact handoff;
- two-Mac Telegram vertical оставил PR/branch/handoff либо явно поставлен на
  паузу;
- активное source/install окно Phase-B0 закрыто; `swipe-agents` очищается
  только после его 48-часового acceptance либо явной остановки;
- каждый владелец линии перечислил свои активные branches/worktrees;
- на target worktree нет живого процесса, авторской сессии или runtime;
- portfolio owner назначил одно repo за раз и подтвердил его merge-authority.

Дата сама по себе не активирует инициативу.

## 3. Немедленный authority correction, не cleanup

Аудит обнаружил коллизию имён миграций:

- backend `origin/master` содержит
  `0074_feed_playable_release_scope` и
  `0075_playable_rework_execution_status`;
- TRUNCATE-защита — отдельная ветка
  `origin/claude/mission-truncate-guard@55a5656`, где миграция всё ещё названа
  `0074_append_only_truncate_guard` и основана на
  `0073_platform_release_receipts`;
- ветка опубликована, но отстаёт от master и не входит в Alembic graph master.

Следствие: P4G Stage 2 **не разблокирован** этой защитой. До нового reviewed
guard нельзя выполнять `mission_ops --apply` или включать Mission core.

Исправление guard — отдельный Tier 2 продуктовый пакет, не часть уборки:

1. clean branch от актуального backend `origin/master`;
2. следующий свободный revision после актуального head (на снимке — `0076`);
3. `down_revision` равен актуальному head (на снимке — `0075`);
4. повторная инвентаризация append-only таблиц на новом current head;
5. нельзя переносить старый список 108 таблиц без пересчёта: две новые
   миграции могли добавить journals/triggers;
6. PostgreSQL base→head, downgrade/upgrade, direct/multi-table/CASCADE
   TRUNCATE tests;
7. независимый cross-Mac frontier review и отдельный deploy/enablement gate.

При активации hygiene этот пакет должен быть либо завершён, либо оставлен как
явный blocker Stage 2; cleanup не реализует его попутно.

## 4. Подтверждённые находки и требуемая диспозиция

### H1 — опасный основной backend checkout

На снимке основной `swipe-backend` checkout стоял на
`codex/mobile-review-performance` и содержал десятки modified/untracked файлов,
включая старые до-rebase migrations 0072/0073. Он не считается runtime или
источником Alembic authority.

До решения владельца запрещены `reset`, `clean`, `stash drop`, rebase, Alembic
и попытка «вернуть master». Сначала: full patch identity, untracked+ignored
inventory, secret/large-file guard, сравнение с PR #25/related refs и
письменная disposition владельца.

### H2 — generator WIP и live Lab различаются

Живой Lab работает из отдельного detached master checkout. Основной generator
checkout может быть покрыт старой snapshot-веткой, но визуальный diff «только
удаления» не доказывает отсутствие новых untracked/ignored/binary bytes.

Перед возвратом checkout: full patch manifest против snapshot, затем exact
owner disposition. Live checkout и launchd в cleanup не трогаются.

### H3 — локальные commits, которые могут быть единственными копиями

Audit candidates для повторной проверки:

- `playables` local master: FTUE/pins commits;
- `feed-prototype challenge-v1`: Share/Challenge client work;
- `swipe-backend` local master: series-order docs commits;
- `swipe-agents` local main: Telegram fixes;
- старые meta recovery branches.

Формулировка «незапушено» не принимается без проверки всех local и remote refs.
Для каждого candidate фиксируется:

`commit → reachable remote refs → owner → secrets/large files → keep/archive/
superseded/discard`.

Blanket push запрещён. Полезное публикуется в namespaced archival/product
branch только после проверки; uncommitted bytes требуют отдельного snapshot,
а не push существующей ветки.

### H4 — открытые PR

Audit snapshot насчитал около 25 PR и предложил группы:

- recovery/R1-A candidates, предположительно superseded исполненным Variant B;
- evidence-only или закрытые инициативы;
- mobile-review R6/R7 family, которая может сохранять продуктовый смысл;
- живые PR: Phase-B0, cohort watcher, runtime descriptor, Labs package;
- сознательно parked Block Out.

Список не является готовым batch-close plan. Каждый PR получает строку:

`PR → current head → owner → superseding merge/receipt → unique evidence →
close/merge/keep`.

Закрытие superseded PR сопровождается комментарием со ссылкой на итоговый
merge/receipt. Evidence не вливается в master только ради «сохранения истории»,
если оно устарело или уже достижимо из другого authority.

### H5 — stale worktrees и локальные ветки

Есть merged worktree, unmerged/ahead worktree и prunable записи на исчезнувшие
`/private/tmp` пути. Очистка использует `scripts/worktree-status.mjs` и
дополнительный owner inventory.

Автоматически допустимо предложить удаление только для:

- clean;
- merged в актуальный upstream;
- не main;
- не locked;
- без live process/runtime;
- с подтверждением владельца, если worktree относится к текущей инициативе.

Unmerged/ahead/dirty worktree не удаляется скопом. `git worktree prune`
применяется только к доказанно missing metadata и не заменяет disposition
связанной ветки.

### H6 — главные checkout не на clean master

Целевая норма two-Mac модели: главный checkout каждого repo — clean tracked
default branch; вся работа — в именованных worktree. Возврат выполняется
последним, после сохранения WIP и без удаления author worktree.

### H7 — устаревшие утверждения аудита

На момент финальной сверки:

- two-Mac docs уже committed/pushed в meta master как `08f34d6`, поэтому
  утверждение «они untracked» устарело;
- mission truncate branch уже имеет remote ref, поэтому не является
  единственной локальной копией.

Любой будущий hygiene audit начинает с fetch и печатает `auditedAt` + exact
`origin/<default>` для каждого repo. Утверждения о local-only подтверждаются
проверкой `refs/heads` и `refs/remotes`, а не `branch -vv` одной ветки.

## 5. Scope исполнения

### In scope

- read-only inventory Git refs, dirty layers, worktrees, stashes и open PR;
- сохранение уникального WIP после owner+secret review;
- per-PR dispositions и закрытие доказанно superseded PR;
- удаление доказанно clean+merged stale worktrees;
- prune только missing worktree metadata;
- возврат основных checkout на clean default branch;
- обновление `STATE.md` и короткий final hygiene receipt;
- удаление локальных review aliases, только если exact commit достижим из
  сохранённого ref и alias не используется worktree.

### Out of scope

- изменение playable/gameplay, `?metaworld=1` или другого продукта;
- перенос/архив legacy P4G workspace и корневого npm workspace;
- реализация/merge/deploy TRUNCATE guard;
- изменение живого Lab, launchd, Render или production credentials;
- merge активных product PR;
- переписывание истории, force-push или массовое удаление remote branches;
- очистка секретов через историю Git без отдельного incident process;
- repo-lock, merge queue или новый cleanup daemon.

## 6. Порядок repo-by-repo

1. **Freshness capture:** fetch без merge; exact heads, worktrees, status,
   refs, PR snapshot.
2. **Meta:** только после завершения активных meta-веток; сохранить handoffs,
   удалить доказанно prunable/merged worktrees.
3. **Playables и feed:** после variation/Telegram handoff; FTUE/challenge
   dispositions до переключения main checkout.
4. **Generator:** после остановки author sessions; live detached Lab не
   трогать.
5. **Backend последним:** сначала mobile-review WIP и migration collision.
6. **Swipe-agents отдельным окном:** только после Phase-B0 acceptance/pause;
   installed release и `p4g_runner` data root не входят в Git cleanup.

Не открывать больше одного repo cleanup window одновременно.

## 7. Артефакт preflight

Перед любым mutating шагом подготовить таблицу:

| Repo | Exact upstream | Main checkout | Dirty layers | Active owner | Unique refs | Open PR dispositions | Safe merged worktrees | Blockers |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |

К таблице прилагаются точные команды, но они не исполняются до frontier review.
Для каждого destructive/recoverable шага указать target и rollback/retention.

## 8. Acceptance

- ни один active/parked product commit не потерян;
- все preserved commits достижимы из именованного remote ref либо явно
  принятого local archive;
- основные checkout чистые и стоят на актуальной default branch;
- live Lab и Phase-B0 runtime не изменились;
- open PR имеют owner и disposition; superseded закрыты с точной ссылкой;
- stale worktree удалены только по критерию §5;
- backend Alembic graph не изменён hygiene-пакетом;
- Stage 2 status честно указывает на незавершённый current-head TRUNCATE guard;
- `node scripts/worktree-status.mjs` не показывает необъяснённых worktree;
- `STATE.md` содержит только активные/parked контуры и новые terminal handoff.

## 9. Оценка

После выполнения trigger-условий: один–два рабочих дня. Основное время — не
команды Git, а owner dispositions для dirty WIP и старых PR. Если preflight
обнаружит новый активный поток, соответствующий repo пропускается, а не
«дочищается» ценой риска.

# Handoff: Two-Mac Development Operating Model v1

Дата: 09.08.2026

Владелец портфеля: frontier-оркестратор Mac A

Authority: `docs/specs/two-mac-development-operating-model.md`

Статус: модель зафиксирована; реализация автоматического контура не начата.

Первый отдельный implementation-handoff после операторского запуска цели:
`TELEGRAM-DEVELOPMENT-INTAKE-HANDOFF-2026-08-09.md`. Он не заменяет этот
документ и не меняет замороженные ownership/review-решения.

## Цель одной фразой

Дать оператору mobile-first путь `тикет → работа одной из двух ячеек →
играбельный кандидат → принятие`, не строя до пилота scheduler, task-store,
merge queue или quota optimizer.

## Почему этот handoff существует

У оператора два Mac и на каждом Claude + Codex. Цель — две независимые
производственные линии с кросс-провайдерным review, а не четыре параллельных
автора без общего владельца. Прошлый главный failure mode — не недостаток
агентов, а неясное владение, пересекающиеся ветки и отставшие merge.

## Читать перед началом

1. `STATE.md` — текущий портфель.
2. `AGENTS.md` — роли моделей и внешние authority-границы.
3. `CLAUDE.md` — durable режим prototype/core.
4. `docs/specs/two-mac-development-operating-model.md` — этот контракт.
5. `docs/specs/dev-loop.md` — запрет на преждевременный universal wrapper.
6. `docs/specs/lab-playable-release-fast-lane.md` — существующий mobile-first
   контур механик, который нельзя замедлять новым review по умолчанию.

## Замороженные решения

1. Mac A владеет Platform/portfolio и merge в backend/feed/static platform.
2. Mac B владеет Playables/Labs и merge в generator/playables.
3. `swipe-agents` остаётся deterministic production-ops без LLM и не является
   Engineering OS.
4. Живой Lab/Fast Lane runtime пока хостится на Mac A из detached master,
   хотя код `swipe-generator` принадлежит Mac B.
5. Владелец линии фиксирован; автор отдельного тикета может меняться.
6. Review ladder: Tier 0 без модельного review; Tier 1 cross-provider на том
   же Mac; Tier 2 cross-Mac + exact-head CI + требуемый operator GO.
7. Вход review — ticket contract + exact patch + authority context, без
   авторского нарратива.
8. В v1 нет repo-lock, dev merge queue и автоматического quota scheduler.
9. GitHub Issue — durable engineering record; Telegram/Mini App — UX
   оператора. Engineering runner не получает Telegram/production credentials.
10. Локальные и `wip/*`-ветки разрешены без тикета. Тикет обязателен перед
    PR/candidate, cross-Mac handoff, merge или deploy. Существующая ветка
    импортируется, а не пересоздаётся.

## Реальная сложность

### Уже доступно почти бесплатно

- две машины и четыре подписки;
- GitHub branches/Issues/PR/CI;
- Fast Lane intake, durable statuses, Telegram notifications и exact
  candidate approval для механик;
- isolated worktree, visual proof и cross-provider review primitives;
- fixed repository ownership как convention.

### Полезный MVP — средняя сложность

Оценка: 3–6 инженерных дней после короткого code-path audit.

Нужно добавить один platform-ticket vertical: mobile intake, durable GitHub
record, детерминированный triage на Mac A, status projection, candidate link и
единую READY_TO_PLAY/NEEDS_HELP очередь. Запуск frontier-сессии в MVP может
оставаться assisted; оператор GitHub и terminal не видит.

### Полная автоматическая маршрутизация — заметно сложнее и не v1

Оценка после пилота: ещё 1–3 недели в зависимости от реального provider CLI
и поведения auth/quota на обеих машинах. Основной риск — не код очереди, а
надёжный запуск/возобновление подписочных Claude/Codex сессий, offline Mac и
честное определение quota exhaustion. До 10–20 тикетов эти предположения
нельзя превращать в архитектуру.

## Первый исполняемый пакет: Slice 0

Цель: включить operating discipline без продуктового кода.

1. Добавить общий GitHub Issue template `development-ticket.v1` либо
   эквивалентный Markdown-шаблон с обязательными полями из authority.
2. Зафиксировать для каждого репо merge-authority и Mac в clone-local README
   или bootstrap note; не добавлять серверный lock.
3. Сверить, что оба Mac используют отдельные clean worktree и установленные
   warning-only hooks.
4. Ввести видимую таблицу активного WIP в верхней части `STATE.md`:
   `ticket / line / repo+paths / author / reviewer / state / candidate`.
5. Провести два искусственных dry-run: один независимый ticket на Mac A и один
   на Mac B; без merge/deploy.

Acceptance: обе задачи однозначно маршрутизированы, конфликт путей виден до
начала кода, а существующая Fast Lane петля не изменилась.

## Второй пакет: Slice 1 — первый живой vertical

Выбрать маленькую bounded-правку интерфейса платформы, не backend/core.

1. Добавить mobile action «Доработать платформу» рядом с существующим
   mechanic rework UX либо переиспользовать его surface с новым typed kind.
2. Сохранить исходную просьбу, экран/context/build SHA и Telegram actor.
3. Детерминированный bridge создаёт/связывает GitHub Issue без передачи bot
   token агенту.
4. Frontier Mac A назначает ticket author и isolated branch/worktree.
5. Tier 1: другой провайдер получает ticket contract + exact patch.
6. Candidate становится одной строкой в READY_TO_PLAY; Telegram даёт кнопку
   открыть exact candidate и действия «Принять / Вернуть в работу».
7. Принятый bounded change идёт через обычный merge-authority Mac A.

Acceptance: оператор проходит весь путь только с телефона; GitHub остаётся
подкапотным audit trail.

## Третий пакет: Slice 2 — подключение Mac B

1. Тот же ticket contract для `mechanic | labs`.
2. Tier 0 сохраняет текущую скорость Fast Lane и не ждёт LLM review.
3. Tier 1 generator/Labs review выполняется вторым провайдером Mac B.
4. Merge generator выдаёт exact-SHA restart handoff Mac A; живой runtime не
   запускается из author worktree.
5. READY_TO_PLAY агрегирует кандидаты обеих машин в одну очередь.

## Пилот и решение после него

Провести 10–20 настоящих тикетов. Для каждого собрать только:

- время SUBMITTED→IN_PROGRESS;
- время IN_PROGRESS→READY_TO_PLAY;
- время ожидания оператора;
- число rework и NEEDS_HELP;
- конфликты репо/путей;
- какой ручной шаг повторялся;
- был ли provider unavailable/quota-limited.

После пилота ровно одно решение:

- `KEEP ASSISTED` — frontier вручную стартует сессии, остальное автоматично;
- `BUILD PROVIDER ADAPTER` — повторяемый запуск доказан и механизируется;
- `FIX TICKET/STATUS LOOP` — проблема до запуска агента;
- `STOP` — система не улучшает время до наигрываемого результата.

## STOP-границы

- Не писать новую БД задач, пока GitHub Issue + существующий request state
  закрывают vertical.
- Не давать Engineering OS Render/GitHub production secrets.
- Не переносить `swipe-agents` в dev-loop и не добавлять туда LLM.
- Не требовать review Tier 1 от playable dogfood Tier 0.
- Не запускать два overlapping author task в одном repo.
- Не превращать дату/квоту в автоматический merge/deploy authority.
- Не менять живой Lab checkout напрямую; только exact-master restart path.

## Связанные портфельные поправки

- Технический гейт P4G Stage 2 по миграции `0074` уже пройден последующим
  rollout; Stage 2 должен быть обозначен как готовый к переприоритизации, а не
  заблокированный этой миграцией.
- Feed sequencing остаётся запаркованным до review-точки 13.10/friend cohort;
  дата означает пересмотр, а не автоматическое включение.
- Impact Operations остаётся отдельной operator-owned линией реального мира;
  её продуктовый код маршрутизируется через Mac A, отдельный третий Mac не
  требуется.

## Выход следующей сессии

Сначала представить короткий audit существующих reusable путей и минимальный
diff Slice 0/1. Никаких внешних mutations, GitHub settings, новых credentials,
демонов или product deploy без отдельного operator GO.

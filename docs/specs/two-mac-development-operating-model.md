# Two-Mac Development Operating Model v1

Статус: целевая operating model зафиксирована оператором 09.08.2026;
автоматический диспетчер ещё не реализован. Исполняемый handoff:
`TWO-MAC-DEVELOPMENT-OPERATING-MODEL-HANDOFF-2026-08-09.md`.

## 1. Цель

Оператор создаёт с телефона задачи по механикам и платформе, две независимые
рабочие ячейки исполняют их параллельно, а оператор получает единую очередь
играбельных кандидатов. Git, ветки, CI и review остаются под капотом и не
становятся пользовательским интерфейсом.

Модель должна увеличить пропускную способность без возвращения к состоянию
из множества пересекающихся веток, неясных владельцев и отставших merge.

## 2. Что не строим в v1

- собственную merge queue, repo-lock или distributed lease для dev-процесса;
- универсальный агентный task-store поверх GitHub;
- автоматический оптимизатор квот четырёх подписок;
- прямой доступ Engineering OS к production credentials;
- объединение dev-loop с `swipe-agents`;
- обязательный модельный review каждого playable-прототипа;
- перенос живого Lab с Mac A на Mac B.

До 10–20 реальных управляемых тикетов сериализация обеспечивается правилами
владения и видимой очередью. Механизация добавляется только для доказанно
повторяющегося ручного шага.

## 3. Топология

### Mac A — Product Platform и portfolio control

- продуктовая лента, дейлики, коллекции, сезоны и Play for Good;
- `swipe-backend`, `feed-prototype`, generated/static `swipe-platform`;
- deterministic production-ops `swipe-agents` (без LLM);
- meta-repo, `STATE.md`, roadmap и единая операторская очередь;
- хост живого Lab/Fast Lane runtime до отдельного решения.

### Mac B — Content, Labs и Engineering OS

- `playables`, копирование и значимые вариации механик;
- `swipe-generator`, фабрики и код Lab;
- локальный dev-loop/Engineering OS без production credentials;
- авторство bounded-изменений для своей ячейки.

На каждом Mac доступны Claude и Codex. Одновременно один провайдер является
автором активного тикета, второй — ревьюером или резервом. Четыре подписки —
это две производственные линии с независимым review и запасом квоты, а не
четыре параллельных владельца.

## 4. Владение и авторство

Различаются пять ролей:

1. **Portfolio owner** — frontier-оркестратор на Mac A; ведёт `STATE.md` и
   межлинейный приоритет.
2. **Line owner** — фиксированный frontier-владелец Platform либо Labs.
3. **Ticket author** — Claude или Codex, выбранный для конкретной работы.
4. **Repository merge-authority** — единственный владелец merge в репо.
5. **Runtime host/operator** — машина, на которой живёт сервис и выполняется
   штатный restart/runbook.

Автор тикета может меняться по пригодности и доступной квоте. Владелец линии
не меняется без письменного handoff. Подписи и GO даёт только frontier-модель
или оператор по правилам `AGENTS.md`.

| Репозиторий / authority | Merge-authority |
| --- | --- |
| `swipe-backend` | Mac A |
| `feed-prototype`, `swipe-platform` | Mac A |
| `swipe-agents` (production ops, no LLM) | Mac A |
| `swipe-generator` | Mac B |
| `playables` | Mac B |
| meta-repo / `STATE.md` | portfolio owner, Mac A |
| Engineering OS / dev-dispatcher | Mac B, отдельно от `swipe-agents` |

Правка Mac B, затрагивающая `swipe-backend`, автоматически идёт по ступени 2
и сливается merge-authority Mac A.

## 5. Тикет — не обязательное разрешение на ветку

### Без тикета разрешено

- локальный spike, research и одноразовая диагностика;
- локальная ветка либо опубликованная `wip/*`-ветка без PR;
- эксперимент, который не создаёт candidate и не меняет общий runtime;
- подготовка идеи до решения, стоит ли её продолжать.

Такая работа не может быть merged/deployed, передана другой машине как
готовая реализация или показана оператору как официальный кандидат.

### Тикет обязателен до первого из событий

- открыт PR с намерением merge;
- создан кандидат «готово к наигрышу»;
- работа передана другой машине/владельцу;
- затронут shared backend, миграция, auth, деньги или release-инфра;
- планируется merge/deploy/publication.

Существующую ветку не нужно пересоздавать: она импортируется в новый тикет,
который фиксирует текущий head, репо и предполагаемые пути.

## 6. Контракт тикета

Минимальный ticket contract:

- `ticket_id`, автор запроса и время;
- исходный текст/голосовая расшифровка без редакторской подмены;
- тип: `mechanic | labs | platform | impact | engineering-os`;
- экран, mechanic id, client/build SHA и скриншот, если доступны;
- ожидаемый пользовательский результат и критерии приёмки;
- предполагаемые репозитории и пути;
- назначенная ячейка, line owner, ticket author;
- review tier `0 | 1 | 2` и причина повышения;
- branch/worktree и exact candidate/PR identity;
- текущее состояние и ссылка на evidence.

GitHub Issue является durable engineering record v1. Telegram/Mini App —
операторская поверхность. Engineering OS читает GitHub, а не получает
Telegram bot token или production authority напрямую.

## 7. Жизненный цикл

```text
SUBMITTED → TRIAGED → QUEUED → IN_PROGRESS
          → NEEDS_HELP
          → READY_TO_PLAY → ACCEPTED → MERGING/DEPLOYING → LIVE → CLOSED
                          → REWORK_REQUESTED → QUEUED
          → CANCELLED
```

- Telegram-сообщение — уведомление о переходе.
- Единая очередь «готово к наигрышу» — authority текущего состояния.
- Ошибка никогда не остаётся только в локальном логе: она даёт
  `NEEDS_HELP` с безопасным объяснением.
- Принятие оператором относится к exact candidate, а не к названию ветки.

## 8. Три ступени review

### Tier 0 — prototype/content dogfood

Механики, тюнинг, обложки и exact-user прототипы: строгие технические тесты,
visual proof и операторский наигрыш. Модельного review по умолчанию нет;
оператор является reviewer game feel. Переход «Открыть всем» — отдельный
акт с полной gamefeel-проверкой.

Если в ходе работы обнаружена необходимость менять shared runtime, harness,
права или общий контракт, автор останавливается и повышает tier.

### Tier 1 — bounded-код платформы/Labs

Один blind cross-provider review на PR-гейте внутри того же Mac. Review input:

- исходный ticket contract и acceptance criteria;
- exact patch/head;
- связанные authoritative docs и callers/tests;
- без авторского плана, транскрипта и самооценки.

### Tier 2 — core/shared authority

Shared backend, миграции, auth, деньги, impact authority и release-инфра:
review другой frontier-моделью с другого Mac, exact-head CI и требуемая
операторская вторая подпись/GO.

## 9. Параллельная работа

- Нормальный WIP: один активный авторский тикет на Mac A и один на Mac B.
- Review может идти параллельно и не занимает авторский слот.
- Разные репозитории и доказанно path-disjoint изменения могут выполняться
  параллельно.
- Пересекающиеся пути одного репозитория имеют одного автора; второй поток
  ждёт либо получает письменный handoff.
- Merge-authority сериализует фактические merge без отдельной merge-системы.
- Core/backend изменения не ведутся двумя авторами одновременно.
- Активный Fast Lane rework может встретить CAS при merge в `playables`;
  это штатный durable failure/retry, а не повод строить новый lease в v1.

## 10. Код и живой runtime

Код может принадлежать Mac B, а runtime жить на Mac A.

- живой Lab запускается только из detached checkout точного `master`;
- рабочие и integration worktree никогда не служат live runtime;
- merge `swipe-generator` на Mac B выдаёт handoff с exact SHA;
- Mac A выполняет одну versioned restart-команду и фиксирует health;
- обновление playable content не требует restart Lab;
- перенос хостинга Lab на Mac B — отдельная будущая инициатива.

## 11. Минимальное внедрение

### Slice 0 — operating discipline

Документы, repository ownership, ticket template и ручной triage. Никаких
демонов и новых credentials. Должно занять часы, не дни.

### Slice 1 — один полезный mobile-first вертикальный путь

`Telegram platform request → GitHub Issue → Mac A implementation → Tier 1
review → candidate → READY_TO_PLAY notification/inbox → operator decision`.

Распределение выполняется простыми правилами по типу и репозиторию. Запуск
агентной сессии может оставаться frontier-assisted.

### Slice 2 — вторая ячейка и status bridge

Тот же контракт для Mac B, статус из GitHub обратно в Telegram, единая
очередь кандидатов, восстановление после offline Mac.

### Slice 3 — решение об автоматическом runner

Только после 10–20 тикетов измерить: время triage, ожидание автора, время до
candidate, долю конфликтов и ручные повторяющиеся шаги. Затем выбрать между
простым provider adapter и сохранением frontier-assisted запуска. Автоматический
quota optimizer не является предусловием полезной системы.

## 12. Критерии успеха пилота

- оператор создаёт platform-ticket с телефона без GitHub/terminal;
- две машины могут вести по одной независимой работе;
- ни один кандидат/merge не теряет связь с исходной просьбой;
- оператор видит одну очередь READY_TO_PLAY и NEEDS_HELP;
- Tier 0 не замедлен модельной церемонией;
- Tier 1 и Tier 2 имеют нужную независимость review;
- после 10–20 тикетов нет накопленной очереди неясных веток;
- ни Engineering OS, ни reviewer не получают production credentials.

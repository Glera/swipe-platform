# Agent Team ROI Pause — operator decision 09.08.2026

Статус: **ACTIVE DECISION**. Этот документ ограничивает дальнейшую работу по
Agent Team до отдельного operator review.

## Решение одной фразой

Довести только bounded physical Phase-B0 в последнем коротком окне либо
остановить его по лимиту; Finance v1-B и все последующие агентные роли
припарковать до появления измеримой операционной потребности.

## Почему решение изменилось

У платформы пока нет внешней аудитории, высокой цены простоя и сложного
набора платных провайдеров. За несколько недель Agent Team построил прочную
default-off инфраструктуру, но оператор ещё не получил соразмерной ежедневной
пользы.

Фактически построено:

- deterministic supervisor, watchers и SQLite authority store;
- Telegram outbox/delivery и supervised operations;
- backup/restore, host isolation и evidence contracts;
- default-off Finance store, fixtures и reporting primitives.

Но это пока не «команда автономных агентов». Unattended LLM, analyst,
researcher и production orchestrator намеренно не включены. Finance v1-B —
измерительный контур billing/forecast, а не AI-персона. При двух основных
провайдерах его текущая польза заменяется несколькими минутами ручной проверки.

Sunk cost не является основанием продолжать контур без доказанного ROI.

## 1. Единственный активный остаток: Phase-B0

Цель: получить один постоянно работающий deterministic monitoring/backup
контур на резервном Mac либо честно остановиться в supervised/manual режиме.

Разрешённый бюджет после возобновления:

- максимум **один рабочий день активной инженерной/операторской работы**;
- затем максимум **48 часов unattended acceptance** по существующему
  Phase-B0 контракту;
- ожидание 48 часов не считается активной работой;
- PR/merge/install/enablement authority остаются раздельными и не выводятся из
  этого документа автоматически.

### Успех

- reviewed exact release физически установлен и включён по Phase-B0 runbook;
- 48-часовой acceptance завершён без недиспозированных дефектов;
- monitoring, backup и dead-man дают оператору наблюдаемую пользу;
- опубликован terminal receipt с exact release/host boundary;
- после этого Agent Team замораживается: новых ролей не строить.

### Stop-loss

Немедленно остановить Phase-B0 и оставить manual/supervised режим, если:

- обнаружен новый дефект, требующий архитектурного расширения, нового
  credential contour или ещё одного многораундового review;
- для исправления нужен более чем bounded delta существующего Phase-B0 scope;
- активная работа выходит за один рабочий день;
- 48-часовой acceptance сбрасывается существенным физическим дефектом;
- operator time снова превышает наблюдаемую пользу monitoring/backup.

Stop-loss не означает удаление кода. Состояние документируется, runtime
остаётся default-off/manual, возврат возможен по §5.

### Quiet week не подменяется

Phase-B0 48h acceptance и A1 quiet-week — разные evidence. Если quiet-week
уже закрыт, terminal receipt обязан сослаться на exact ранее принятый receipt.
Новый 48-часовой прогон не переименовывается в quiet week и не заявляет больше,
чем реально проверил.

## 2. Finance v1-B — PARKED

Текущий status snapshot:

- development ticket: `Glera/swipe-agents#18`;
- draft PR: `Glera/swipe-agents#19`;
- сообщённый exact head: `37e739d07c4a540851f4a8116cf78a643bbcd0f2`;
- source/CI work существует, но ничего не merged/installed/enabled.

Операторское решение:

- оставить PR draft с явной пометкой `PARKED BY OPERATOR — ROI GATE`;
- не тратить сейчас квоту на blind cross-Mac review;
- не создавать GitHub/Backblaze finance credentials;
- не запускать live probes или 48h finance shadow;
- не добавлять Telegram sender/schedule;
- не merge/install Finance-код только потому, что он уже написан;
- сохранить issue, exact head, CI и runbook как возобновляемый checkpoint.

Render/GitHub расходы пока проверяются вручную с provider budget alerts и
коротким календарным напоминанием. `unknown` не интерпретируется как `$0`.

## 3. Остальные роли — PARKED

До отдельного решения не продолжать:

- Finance delivery;
- общий operator brief;
- scheduled analyst;
- researcher automation;
- unattended Claude/LLM runner;
- production orchestrator как runtime;
- cohort watcher enablement до появления friend cohort;
- «команду из пяти ролей» как продуктовую цель;
- новую общую agent platform, UI или coordinator.

Source branches/docs могут сохраняться, но не получают новые implementation
rounds, credentials, schedules или production authority.

## 4. Что приоритетнее сейчас

Engineering OS / two-Mac Telegram development loop — отдельная инициатива и
не входит в `swipe-agents`. Её польза проверяется временем от мобильного тикета
до играбельного кандидата и напрямую ускоряет создание продукта.

Нельзя переносить в неё `swipe-agents` store, bot authority, production
credentials или Phase-B0 runtime. Общими могут быть только нейтральные
development conventions и GitHub artifacts.

## 5. Trigger-условия возврата

Finance или следующие Agent Team роли пересматриваются при первом
содержательном условии:

- variable infrastructure spend стабильно превышает ориентир `$100–200/мес`;
- используется не менее 4–5 платных провайдеров;
- ручной контроль расходов занимает более 30 минут в неделю;
- произошёл неожиданный счёт или provider alerts оказались недостаточны;
- появился внешний friend/paid cohort и реальная цена простоя;
- несколько операторов делят ответственность и нет одного владельца billing;
- monitoring/backup Phase-B0 доказал ежедневную пользу и появился конкретный
  следующий repeated manual pain.

Trigger открывает новый ROI review, а не автоматически разрешает merge,
credentials или unattended LLM.

## 6. Acceptance этого решения

- active agent-system сессия прекращает Finance после чистого checkpoint;
- issue #18 и PR #19 получают честный parked status без merge;
- нет новых finance credentials, review-runs, probes, shadow или delivery;
- сессия публикует bounded plan оставшейся Phase-B0 работы и её active-time
  estimate до любого mutation;
- Phase-B0 заканчивается terminal success либо stop-loss, а не очередным
  расширением архитектуры;
- `STATE.md` после terminal результата переводит Agent Team в `FROZEN`;
- portfolio focus возвращается к продукту, Labs и two-Mac development loop.

## 7. Готовая инструкция активной agent-system сессии

```text
Операторское решение 09.08: Agent Team проходит ROI pause.
Authority: AGENT-TEAM-ROI-PAUSE-DECISION-2026-08-09.md.

НЕМЕДЛЕННО:
1. Остановить Finance v1-B на текущем чистом checkpoint.
2. Issue #18 и draft PR #19 оставить открытыми, но пометить
   `PARKED BY OPERATOR — ROI GATE`; зафиксировать exact head, CI и runbook.
3. Не запускать blind/cross-Mac review PR #19.
4. Не merge Finance, не создавать GitHub/Backblaze credentials, не выполнять
   provider probes, finance shadow, Telegram sender или schedule.
5. Не продолжать operator brief, analyst, researcher, cohort watcher,
   unattended LLM или production-orchestrator runtime.

ЕДИНСТВЕННЫЙ АКТИВНЫЙ SCOPE — Phase-B0:
6. Сначала выдать оператору точный список оставшихся шагов, authority-точек и
   оценку активной работы; бюджет — максимум один рабочий день плюс 48 часов
   unattended acceptance.
7. PR #17, immutable release, install, activation и enablement остаются
   раздельными решениями; это сообщение само их не разрешает.
8. Если возникает новый существенный физический/архитектурный дефект,
   расширение credential contour, новый большой review-round или превышение
   одного рабочего дня — STOP. Оставить supervised/manual режим и terminal
   handoff, не проектировать следующий слой.
9. 48h Phase-B0 acceptance не называть A1 quiet-week. Сослаться на exact
   существующий quiet-week receipt отдельно либо оставить этот evidence gate
   честно открытым.
10. После PASS или STOP обновить STATE и опубликовать один terminal receipt.
    Затем Agent Team = FROZEN до trigger-условий authority §5.

НЕ ТРОГАТЬ:
- Engineering OS/two-Mac dispatcher;
- другие repos/cleanup;
- production platform/Labs;
- живые credentials вне exact Phase-B0 operator step.
```

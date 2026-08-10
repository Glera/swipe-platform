# SINGLE-MAC PRODUCT DEVELOPMENT LOOP v1 — live smoke handoff

Статус: **NOT AUTHORIZED / NOT EXECUTED**.

Этот handoff описывает один attended smoke после отдельного операторского
решения о внешнем контуре. Он не разрешает push, PR, merge, migration живой БД,
deploy, создание/изменение credentials, env/settings или schedules.

## Exact candidate

- backend:
  `codex/single-mac-product-development-loop-v1@c88090850fdfa7eb4f1c525d28d37399b2dea11c`;
- feed:
  `codex/single-mac-product-development-loop-v1@c53d94e82fc0d2b23afc193f6bc5db3daaf98d21`;
- durable queue: только GitHub Issues
  `Glera/p4g-workspace-meta`;
- Second Mac и Content Factory не участвуют.

До smoke exact backend/feed bytes должны попасть в выбранный оператором
контур через отдельно авторизованный manual release. PostgreSQL exact-head CI
и migration authority остаются обязательными release gates.

## Operator-owned prerequisites

Оператор отдельно подтверждает:

1. какой не-production или production-контур используется;
2. что GitHub App уже ограничен одним repository и только
   `issues:write` / `metadata:read`;
3. что Telegram actor — единственный exact allowlisted operator;
4. что `PLATFORM_DEVELOPMENT_INTAKE_BUILD_SHA` равен фактическому feed build;
5. что включение перечисленных default-off switches и migration живой БД
   разрешено.

Имена switches фиксированы в backend `.env.example`; значения и secrets в
handoff не записываются. Никакой agent не создаёт их самостоятельно.

## Один smoke

1. Оператор открывает опубликованный Telegram Mini App и отправляет один
   уникальный запрос вида
   `SMOKE SINGLE-MAC <UTC>: проверить наблюдаемый platform intake; ничего не публиковать`.
2. Mini App обязан показать durable receipt с `requestId`, `mutationId`,
   `requestHash` и состоянием Issue delivery. Повтор того же mutation обязан
   вернуть тот же request с `replayed=true`.
3. На Main Mac attended-сессия запускает ровно один bridge pass:

   ```bash
   python -m app.development_ticket_bridge_cli --max-deliveries 1
   ```

   Receipt обязан дать `confirmed=1`, `pending=0`. Затем оператор сверяет
   один Issue, marker `p4g-development-ticket:v1`, actor/request/build/context
   и отсутствие mechanic/Mac routing.
4. Для smoke без code candidate attended-сессия пишет безопасный
   `NEEDS_HELP` terminal command:

   ```json
   {
     "schema": "platform.development-ticket-terminal.v1",
     "mutationId": "<new canonical UUID>",
     "issueNumber": "<created issue number>",
     "status": "NEEDS_HELP",
     "summary": "Live intake smoke completed without a code candidate.",
     "candidate": null,
     "blocker": {
       "reasonCode": "smoke_only_no_candidate",
       "operatorAction": "Confirm the intake receipt and close the smoke Issue."
     },
     "review": null,
     "nothingPublished": true
   }
   ```

   ```bash
   python -m app.development_ticket_terminal_cli --command <absolute-json-path>
   ```

5. Attended-сессия запускает ровно один notification pass:

   ```bash
   python -m app.development_ticket_notification_cli --max-notifications 1
   ```

   Оператор должен получить Telegram message с exact Issue URL,
   `NEEDS_HELP`, safe operator action и
   `Ничего не опубликовано автоматически`.
6. Оператор вручную закрывает smoke Issue только после сверки durable backend
   receipt и Telegram message. Автоматического close/merge/deploy нет.

## Terminal evidence

Smoke receipt должен записать:

- environment и exact backend/feed SHA;
- Telegram `requestId` / `mutationId` / `requestHash`;
- GitHub Issue URL и exact source marker/hash из единственного Issue body;
- terminal mutation/status и notification id/provider message id;
- replay result;
- подтверждение, что Second Mac не участвовал;
- подтверждение, что code, merge и deploy не запускались этим lifecycle.

Любой `failed_terminal`, unresolved `outcome_unknown`, identity mismatch,
лишняя Issue, неверный build или отсутствие Telegram message завершает smoke
как `NEEDS_HELP`; автоматический retry, rollback или расширение authority
запрещены.

# Series Order operator-compression follow-ups — review packet

Дата: 2026-07-27.

Нужна независимая подпись перед merge двух узких follow-up-срезов к
`swipe-generator@b36bd7d`. Живой заказ и его append-only данные эти ветки не
трогают.

## A. Actionable review backlog

- worktree: `/private/tmp/swipe-generator-series-order-backlog-packet`
- branch: `codex/series-order-backlog-packet`
- base: `b36bd7d`
- изменены только:
  - `src/series-factory.mjs`
  - `src/series-order-service.mjs`
  - `public/lab.js`
  - `test/series-order-service.test.mjs`
  - `test/lab-ui-series-order-level-review.test.mjs`

### Обещание

Если bounded driver остановлен typed-причиной
`series_order_review_backlog_full`, единый operator packet обязан показать
action:

```json
{
  "kind": "review_backlog",
  "label": "Отсмотреть накопившиеся материалы (N)",
  "url": "/lab?review=pending"
}
```

В identity входят текущий event id, typed stop reason и наблюдаемое число
ожидающих review. Все прочие driver stops продолжают идти через
`expert_resolution`; authority и effect-поверхность не меняются.

### Проверка автора

```sh
cd /private/tmp/swipe-generator-series-order-backlog-packet
node --test --test-concurrency=1 test/series-order-service.test.mjs
```

Результат: 32/32.

### Attack questions

1. Может ли caller подменить число backlog или URL?
2. Не маскируются ли другие stop reasons новым action?
3. Стабильна ли identity до изменения order head или backlog count?
4. Нет ли нового effect/authority пути?

### Live-found level-review link fix

Живой order packet корректно выдал
`/lab?review=pending&subject=level&seriesOrderId=…&target=…`, но frontend
разрешал order scope только для `skin|series` и показывал
«Некорректная ссылка на отсмотр заказа» до API-запроса.

Фикс допускает `level` как browser-only return scope. `seriesOrderId` не
отправляется в skin-only `/v1/variations` filter; вместо этого Lab отдельно
читает server-owned Series Order detail и ограничивает глобальный pending
ответ exact `projection.levelDesign.levelReviewTargetIds`. После последнего
order-level verdict UI возвращается в исходный заказ, даже если в глобальной
очереди остаётся чужой pending level. Отдельный browser-тест намеренно
подмешивает такой foreign target и доказывает exact оба verdict и возврат.

Профиль:

```sh
node --test --test-concurrency=1 \
  test/series-order-service.test.mjs \
  test/lab-ui-series-orders.test.mjs \
  test/lab-ui-series-order-level-review.test.mjs
```

Результат: 39/39.

`npm run check`: clean.

### Live-found catalog delivery blocker

После трёх `good` level verdict Level Library честно оставался
`seriesEligible=false`, пока catalog evaluation receipts были `pending`.
Старый packet продолжал показывать `level_review`, хотя повторный taste уже не
требовался.

Фикс различает `level_delivery_pending` только для exact direct-review
кандидата с QA pass + completed good review и недоставленным receipt. Order
packet показывает:

```json
{
  "kind": "catalog_delivery",
  "label": "Завершить доставку оценок",
  "url": "/lab"
}
```

Он не делегирует auth или delivery authority: ссылка ведёт к существующей
singleton-панели, durable device authorization остаётся человеческой, а
authorized outbox дренирует существующий coordinator.

Итоговый профиль follow-up-среза:

```sh
node --test --test-concurrency=1 \
  test/series-factory.test.mjs \
  test/series-order-service.test.mjs \
  test/lab-ui-series-orders.test.mjs \
  test/lab-ui-series-order-level-review.test.mjs
```

Результат: 54/54.

## B. Repair envelope 6/6

- worktree: `/private/tmp/swipe-generator-series-order-repair-limit-6`
- branch: `codex/series-order-repair-limit-6`
- base: `b36bd7d`
- изменены только:
  - `config/series-order-delegation-policy.v1.json`
  - `test/series-order-delegation.test.mjs`
  - `test/series-order-service.test.mjs`

### Обещание

Новые делегации получают server-owned immutable limits:

```json
{
  "maxAutomaticTransitions": 64,
  "maxDerivedCampaignApprovals": 2,
  "maxQaRepairRounds": 6,
  "maxQaRepairSlots": 6
}
```

Slot cap остаётся настоящим work-budget. Round cap приравнен к нему, чтобы
последовательные однослотовые QA-repair не создавали лишний человеческий гейт.
Существующие делегации не переидентифицируются и сохраняют свои старые limits.

### Проверка автора

```sh
cd /private/tmp/swipe-generator-series-order-repair-limit-6
node --test --test-concurrency=1 \
  test/series-order-delegation.test.mjs \
  test/series-order-service.test.mjs
```

Результат: 36/36.

Дополнительный service-регрессор проводит один проблемный ordinal через все
шесть автоматических однослотовых repair-раундов и доказывает, что exact
extension появляется только перед раундом 7. После его добавления результат
профиля: 37/37.

### Attack questions

1. Принимает ли клиент собственные limits или они по-прежнему выводятся только
   из server-owned policy?
2. Сохраняется ли digest-binding policy/target/delegation?
3. Может ли один round превысить суммарные шесть replacement slots?
4. Меняется ли уже созданная делегация задним числом?

## C. Spec synchronization

- worktree: `/private/tmp/swipe-backend-series-order-backlog-docs`
- branch: `codex/series-order-backlog-packet-docs`
- base: `979a27f`
- изменён только `docs/specs/series-order-flow.md`

Документ синхронизирует `review_backlog` и limits 6/6. Он не должен содержать
изменчивые rollout/CI-утверждения.

## Условие GO

- A и B соответствуют обещаниям выше;
- нет расширения delegated effects, taste-review или publication authority;
- существующие immutable делегации не меняются;
- spec и код не расходятся.

После GO автор отдельно закоммитит/сольёт A, B и docs, перезапустит Lab и
проверит новый policy digest на новой делегации. Текущий live-order продолжает
старую делегацию через explicit exact approvals.

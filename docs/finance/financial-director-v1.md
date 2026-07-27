# Финансовый директор v1 — cost observability без финансовой authority

Дата: 27.07.2026. Статус: role contract + implementation handoff.

## VISION-триаж

- Усиливает VISION принцип 7: экономит внимание, не забирая финансовую
  authority.
- Горизонт: поперечный operational rail; не открывает новый продуктовый
  контур и не меняет лестницу rollout.
- Вкус не требуется; human approve обязателен для budget/plan/hard-stop,
  credential issuance и любого действия по экономии.

## 1. Задача и граница

Роль отвечает на четыре вопроса:

1. Сколько фактически billed в текущем периоде?
2. Каков прогноз до конца периода и насколько он изменился?
3. Какой provider / product / cost center вызвал изменение?
4. Какое решение требуется от оператора сейчас?

Роль никогда не меняет тариф, budget, hard stop, capacity или workload.
Она наблюдает, классифицирует, предупреждает и предлагает. Финансовый акт
всегда совершает оператор.

## 2. Source matrix v1

| Source | Что читаем | v1-доступ | Cost center |
|---|---|---|---|
| Render | MTD charges, provider forecast, service/datastore/cron/pipeline/bandwidth breakdown, included usage, invoices | attended dashboard/CSV; unattended adapter только после отдельного read-only credential/API решения | versioned mapping: `swipe`, `legacy`, `unallocated` |
| GitHub | metered gross/billed/discount, product/SKU/repository breakdown, budget utilization, stop-usage state | attended billing UI сейчас; unattended — dedicated minimal billing-read principal, не developer credential | repository mapping |
| CDN/object storage | storage GB-month, request classes, retrieval/egress, billed total, budget state | сейчас `render_static`: только Render bandwidth; новый R2/S3 account = новая source-policy revision | `swipe.cdn` |

Правило дедупликации: пока статика обслуживается Render, строка CDN является
проекцией Render bandwidth и имеет `includedInProviderTotal:"render"`. Она не
прибавляется к общему итогу второй раз.

## 3. Нормализованный документ

Каждый poll создаёт immutable `finance.cost-snapshot.v1`:

```json
{
  "schema": "finance.cost-snapshot.v1",
  "provider": "render|github|cdn",
  "accountIdDigest": "<sha256>",
  "billingPeriod": {"start": "YYYY-MM-DD", "end": "YYYY-MM-DD"},
  "observedAt": "<UTC instant>",
  "currency": "USD",
  "mtdGross": "decimal-string|null",
  "mtdBilled": "decimal-string",
  "mtdDiscount": "decimal-string|null",
  "providerForecast": "decimal-string|null",
  "derivedForecast": "decimal-string|null",
  "approvedBudget": "decimal-string|null",
  "hardStopEnabled": "true|false|unknown",
  "categories": [],
  "sourceEvidenceDigest": "<sha256>",
  "policyDigest": "<sha256>"
}
```

Decimal хранится строкой с minor-unit validation; binary float запрещён.
Invoice/CSV/API response сохраняется как encrypted evidence либо только
content digest — в Telegram и git не попадают payment data, адрес, email,
полный account id, токен или последние цифры карты.

## 4. Детерминированные сигналы

Пороги живут в human-approved `finance.cost-policy.v1`; replay той же пары
snapshot+policy byte-identical.

| Signal | Условие по умолчанию | Severity |
|---|---|---|
| `budget_utilization` | 50 / 75 / 90 / 100% approved budget | digest / attention / attention / incident |
| `month_forecast_growth` | forecast выше прошлого полного месяца одновременно на ≥20% и ≥$2 | attention |
| `daily_burn_acceleration` | billed за 24ч ≥2× median предыдущих 7 полных суток и абсолютный рост ≥$1 | attention |
| `new_meter_nonzero` | ранее нулевая/отсутствующая категория стала >$0 | attention |
| `unbounded_variable_spend` | meter тарифицируется по usage, но budget/hard stop отсутствует или unknown | attention; incident при превышении approved cap |
| `source_stale` | нет нового provider-authoritative snapshot >36ч | attention |
| `currency_not_comparable` | общий итог потребовал бы сложить разные валюты без approved FX source | attention, итог не вычислять |

Provider forecast показывается первым. Derived forecast:
`fixed period charges + variable MTD / elapsed billing seconds × total billing seconds`;
он всегда помечен `derived`, содержит `asOf` и не заменяет invoice.
Fixed/variable-классификация берётся из versioned source policy; если её
нет, derived forecast остаётся `null`, а не экстраполирует подписку как
суточный burn.

## 5. Доставка

- Новый Telegram-бот не требуется: используется существующий delivery
  principal.
- Рекомендуется отдельный operator-only topic/chat `finance`; chat id остаётся
  в env/Keychain, не в policy или evidence.
- Ежедневно в 09:00 local: сообщение только при изменении ≥$0.50, новом
  signal или смене forecast; иначе replay-noop.
- Немедленно: attention/incident с provider, текущей суммой, forecast,
  порогом, главным driver и ровно одним запрашиваемым решением.
- Понедельник: сводка за неделю и MTD. В первый день месяца — reconciliation
  предыдущего settled invoice против последнего snapshot.

## 6. Authority и safety

- Collectors имеют только read. Billing mutation endpoints отсутствуют из
  клиента по построению.
- Один credential на provider; в snapshot только `accountIdDigest`.
- Нельзя использовать токен production/deploy/publish или текущий широкий
  developer token как удобный billing credential.
- Отсутствующий provider, сломанный parser, currency mismatch или stale data
  не превращаются в `$0`; это typed `unknown` + alert.
- Discount/credit показывается отдельно: gross burn остаётся risk-сигналом,
  потому что скидка может исчезнуть.
- Инфра-контроль владеет доступностью collectors; финансовый директор —
  интерпретацией spend. Один и тот же сигнал не доставляется двумя ролями:
  infra создаёт source-health fact, CFO создаёт cost alert.

## 7. Реализация

1. Зафиксировать operator-approved caps и cost-center mapping.
2. Реализовать pure normalizer/detector + golden vectors без credentials.
3. Добавить provider adapters отдельно; fixtures должны быть redacted.
4. Append-only SQLite storage, lease/fencing/receipts/replay-noop по A1.
5. Attended dry-run и byte-сверка с provider UI/CSV.
6. Shadow: ежедневный poll без Telegram delivery; минимум две смены суток и
   искусственные golden boundary cases 49→50, 74→75, 89→90, 99→100%.
7. Human enablement delivery. Первый invoice reconciliation остаётся
   пост-активационным correctness gate.

Новый CDN-provider или новая валюта — новая source-policy revision и
отдельная acceptance; существующий A1/quiet-week не перезапускается задним
числом и не считается evidence финансового контура.

## 8. Definition of Done

- Render, GitHub и `render_static` CDN представлены без двойного счёта.
- Gross/billed/discount/forecast различены и покрыты golden tests.
- Cost-center mapping versioned; unknown не угадывается.
- Все пороги и stale/currency boundary cases red-then-green.
- Ни один adapter не имеет mutation method/scope.
- Dry-run совпадает с provider UI/CSV до цента и единицы usage.
- Telegram delivery идемпотентна, не содержит PII/payment/secrets.
- Провал source даёт `unknown`, не зелёный `$0`.
- Rollback в один шаг отключает только finance delivery/schedule и не
  касается A1 runtime, production services или provider budgets.

## 9. Открытые human gates

1. Утвердить месячный soft cap Render и отдельный cap Render bandwidth/CDN.
2. Подтвердить сохранение GitHub Actions hard budget $20.
3. Выбрать существующий operator-only Telegram chat/topic для `finance`.
4. Разрешить выпуск двух read-only principals после review adapters.

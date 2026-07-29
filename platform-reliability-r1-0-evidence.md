# Platform Reliability Foundation R1-0 — read-only evidence

Статус: snapshot 1 из 2. Все запросы выполнены в PostgreSQL-транзакции
`READ ONLY`; production-конфигурация, данные, Recovery и credentials не
изменялись.

## Authority и identity

- План: `p4g-workspace-meta@b590f5837a2d11d91cc08238cb31a84c7d1de8f2`.
- Backend-факт-карта: `swipe-backend@eb179164daf63a87b6ce4c3bd9e6a472a58ae3a2`.
- Production DB: Render `swipe-db`, PostgreSQL 16, Alembic
  `0067_feed_sequencing_evidence`.
- Snapshot: `2026-07-29 08:31:46 UTC`.
- Повторяемый коллектор:
  `scripts/platform-reliability-r1-db-snapshot.sql`.
- Timestamped Render receipt:
  `platform-reliability-r1-0-render-receipt.json`.

## Render facts

| Факт | Значение |
|---|---:|
| Plan | Basic-256mb |
| Storage | 11.5% из 1 GB |
| Storage autoscaling | disabled |
| PITR | доступен |
| Recovery window | 3 дня |
| Logical export | доступен, файлы хранятся минимум 7 дней |
| Restore drill | **не запускался**, операторский гейт |

Дополнительная security-находка: external PostgreSQL ingress разрешён из
`0.0.0.0/0` (`everywhere`). Это не изменялось в R1-0. Ограничение allowlist
может сломать operator/dev-доступ, поэтому требует отдельного операторского
решения и карты легитимных источников.

Render Metrics в момент среза показывал `No data captured in the last 12
hours` для CPU, disk, connections и transactions, хотя БД обслуживала запросы.
До отдельной проверки эту поверхность нельзя считать доказанным источником
алертов R1-5.

## Database snapshot

| Метрика | Значение |
|---|---:|
| `pg_database_size` | 39,541,783 bytes (38 MB) |
| User table+index+TOAST relations | 26,656,768 bytes (25 MB) |
| Heap | 8,808 kB |
| Indexes | 12 MB |
| Public tables | 145 |
| Non-empty tables | 102 |
| Exact rows across public tables | 27,880 |
| Live/dead tuple estimate | 27,882 / 964 |
| Connections | 6 из 103 (`1 active`, `5 idle`) |
| Current lock waiters | 0 |
| Deadlocks since stats origin | 17 |

`pg_stat_database.stats_reset` был `NULL`: отдельного timestamp последнего
сброса статистики провайдер не предоставил, поэтому 17 нельзя привязать к
конкретному окну.

Разница между `pg_database_size` (38 MB) и Render storage (около 115 MB)
ожидаемо включает не только пользовательские relations: системные объекты,
WAL и provider overhead. Capacity нельзя оценивать только по сумме таблиц.

### Крупнейшие relations

| Table | Exact rows | Total | Observed bytes/row |
|---|---:|---:|---:|
| `content_analytics_report_inputs` | 9,463 | 3,296 kB | 356 |
| `events` | 9,091 | 3,008 kB | 338 |
| `cp_event_inbox` | 2,990 | 2,928 kB | 1,002 |
| `feed_decisions` | 943 | 1,896 kB | 2,058 |
| `feed_effectful_plans` | 97 | 1,472 kB | 15,539 |
| `evaluation_runs` | 143 | 960 kB | 6,874 |
| `affinity_impression_evidence` | 755 | 688 kB | 933 |
| `content_impressions` | 774 | 536 kB | 709 |
| `run_tickets` | 266 | 536 kB | 2,063 |
| `content_analytics_evidence_rows` | 214 | 472 kB | 2,258 |

Большой bytes/row у маленьких таблиц — верхняя оценка: при текущей
малой cardinality туда попадает стоимость пустых/разреженных index pages.

### Записи за 7 / 30 дней

База содержит данные примерно за 22 дня, поэтому `30d` сейчас означает почти
всю историю.

| Table | Clock | 7d | 30d |
|---|---|---:|---:|
| `events` | `created_at` | 1,024 | 9,091 |
| `cp_event_inbox` | `received_at` | 223 | 2,990 |
| `feed_decisions` | `created_at` | 59 | 943 |
| `content_impressions` | `revealed_at` | 42 | 774 |
| `affinity_impression_evidence` | `created_at` | 45 | 755 |
| `reward_ledger` | `created_at` | 129 | 593 |
| `verified_runs` | `created_at` | 129 | 343 |
| `run_tickets` | `created_at` | 70 | 266 |
| `puzzle_ledger` | `created_at` | 71 | 179 |

`content_analytics_report_inputs` не имеет собственного timestamp. За
последние семь materialization-дней создано 4,112 ссылок, в среднем 587.4
на отчётный день. Ключи повторяются между отчётами по контракту closure:
это отдельный schedule/report amplification, а не уникальные player events.

### Индексный fan-out

- `run_tickets`: 15 indexes.
- `feed_decisions`: 13 indexes.
- `feed_effectful_plans`: 8 indexes.
- `cp_event_inbox`: 7 indexes.
- `content_impressions`, `verified_runs`, `evaluation_runs`: по 6 indexes.

Удалять indexes по этому срезу нельзя: часть из них является constraint /
idempotency authority. Но при нагрузочном моделировании их write amplification
должен измеряться отдельно.

## DAU projection

Модель — не capacity commitment, а диапазон для раннего риска:

- lower bound: средний payload фактических строк;
- upper bound: текущий полный relation footprint на строку
  (heap + indexes + TOAST при разреженной малой базе);
- user-linear профиль построен по девяти основным player-write таблицам за
  последние 7 дней;
- отдельно добавлен текущий C1 manifest baseline;
- WAL, bloat, новые таблицы и возможный рост C1 closure **не включены**.

Измерено:

- player writes: `76,507–199,645 bytes / active user-day`;
- C1 manifest baseline: `86,915–209,514 bytes / report day`.

Коллектор печатает составляющие первой суммы как девять строк
`user_day_model` (rows, distinct user-days, unowned rows, payload и relation
bytes), а второй — строкой `c1_manifest_model` (4,112 memberships, число
materialization-дней и обе оценки bytes/row). Поэтому значения выше можно
пересчитать без скрытого ручного запроса.

| DAU | Projected growth/day | До 70% диска от текущих 11.5% |
|---:|---:|---:|
| 10 | 0.81–2.10 MiB | 285–737 дней |
| 100 | 7.38–19.24 MiB | 31–81 день |
| 1,000 | 73.05–190.60 MiB | 3–8 дней |

Вывод: при текущем dogfood база безопасна краткосрочно. Запуск даже малой
когорты не является немедленным stop-the-line, но 1 GB без autoscaling не
имеет приемлемого запаса для быстрого роста до сотен DAU. Порог 70% должен
появиться до cohort expansion, а costed capacity/autoscaling-решение — до
трёхзначного DAU.

## Findings

### R1-0-F001 · P1 · Capacity headroom не соответствует 100+ DAU

Observed верхняя модель достигает 70% примерно за месяц при 100 DAU.
Прежде чем утверждать точный upgrade, нужен snapshot 2 и нагрузочная проверка,
но alert + costed storage option нельзя откладывать до заполнения диска.

### R1-0-F002 · P2 · C1 input manifests — крупнейшая relation

`content_analytics_report_inputs` уже обогнала сырые events и повторяет input
keys между отчётами. Это может быть полностью корректной eternal-evidence
семантикой; finding требует измерения amplification, а не удаления/retention.

### R1-0-F003 · P1 · External PostgreSQL ingress открыт всему интернету

Пароль и TLS остаются барьерами, но network layer сейчас никак не ограничивает
поверхность атаки по источнику. Следующий шаг — операторская карта легитимных
источников и cost/impact закрытия `0.0.0.0/0`; самостоятельное изменение
запрещено.

### R1-0-F004 · P2 · Render Metrics не даёт текущего operational evidence

Dashboard показывал отсутствие данных за 12 часов. R1-5 не должен строить
disk/runner alerting исключительно на этой поверхности без отдельного
red-then-green доказательства доставки.

### R1-0-F005 · P2 · Зафиксировано 17 исторических deadlocks

Сейчас lock waiters отсутствуют. Без timestamps/query identity это не
stop-the-line; требуется привязка к DB logs перед любыми исправлениями.

## Незакрытые гейты

1. Snapshot 2 через 24–48 часов тем же SQL — нужен для фактического delta.
2. Isolated PITR restore-drill — только с оператором и после разрешения расхода.
3. Ротация GitHub token и изменение ingress — только оператор.
4. Никаких retention/delete/classification решений этот пакет не принимает.

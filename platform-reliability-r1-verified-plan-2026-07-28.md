# Platform Reliability Foundation R1 — план v3 (окончательный, для codex)

Дата: 2026-07-28 (v3 — консолидированный патч по exact-bytes review
`p4g-workspace-meta@8f7ae3f`; вердикт ревью: GO направление). Роли: **codex
исполняет, Claude ревьюит каждый пакет (author≠reviewer), оператор — все
включения, классификации, деньги, drill-ы.**

Все верификации — против явного `origin/<branch>` (`git show
origin/master:<file>`) с фиксацией SHA. Backend-факты проверены против
`swipe-backend@eb17916`.

## 0. Верификация фактов среза (v3)

| # | Утверждение | Вердикт | Доказательство |
|---|---|---|---|
| 1 | PG 1 GB без autoscaling | ✅ | `render.yaml`: `basic-256mb`, `diskSizeGB: 1`, `storageAutoscalingEnabled: false` |
| 2 | Миграции на старте web | ✅, долг известен | `start-bake-runtime.sh` (`alembic upgrade head`); render.yaml называет preDeploy отдельным rollout-ом |
| 3 | clone + `npm install` на старте | ✅ | `start-bake-runtime.sh` `clone_or_update()` + `npm install --omit=dev` |
| 4 | Токен в URL remote | ✅ | `start-bake-runtime.sh:18–19` (`x-access-token:${GITHUB_TOKEN}@`) |
| 5 | Runtime способен пушить в Git | ✅ | `start-bake-runtime.sh:31–38` @eb17916: checkout впереди remote → `git push origin HEAD:$branch`. **R1 удаляет весь push-path**; read-only токен — временная защита |
| 6 | Пять runner-ов в одном процессе | ✅ | `app/main.py:76–80`: bake, theme, cp-maintenance, bot, notification |
| 7 | Healthcheck намеренно без БД | ✅ осознанно | `app/main.py:110–113` docstring (keep-alive). Лечится `/ready`, не «починкой» `/health` |
| 8 | Миграций 66 | ✅ ровно 66 `.py` | `git ls-tree origin/master migrations/versions/` (в v1 посчитаны 2 не-миграционных файла) |
| 9 | Системный age-retention почти отсутствует | ✅, уточнено | age-retention есть в `app/agents_m2m.py` (`agents_read_denial_window`, `agents_read_rate`); прочее — контрактные окна контуров, не системная политика |
| 10 | models.py ~8600; feed.ts 10 441; island.ts 4279 | ✅ | 8760 / 10 441 / 4279 |
| 11 | Deploy-коммиты | ✅ | 513 коммитов swipe-platform за 30 дней всего; из них deploy/stamp ~339–387 (методики счёта расходятся, порядок одинаков) |
| 12 | Гонки релизов | ✅ инцидентом 28.07 | деплои 15:00/15:18 разных сессий; сброс P2-гейтов чужим env (закрыт пришпиленным профилем `4fe9a32`) |
| 13 | Restore-drill прод-PG не зафиксирован | ✅ | есть только drill A1 (резервный хост) и recall каталога 17.07 |
| 14 | Бот-сид на старте | ✅, принятое отклонение | CLAUDE.md (single-instance допущение записано) |

## 0-bis. Закрытые платформенные вопросы

1. **PITR** — у всех платных Render Postgres; окно 3 дня (Hobby) / 7 (Pro+)
   ([docs](https://render.com/docs/postgresql-backups)). В R1-0: подтвердить
   Recovery page фактического инстанса + isolated restore-drill в отдельную БД.
2. **preDeployCommand** — платные Docker web services, отдельный instance, при
   ошибке старый deploy живёт ([docs](https://render.com/docs/deploys)).
   Zero-downtime ⇒ expand/contract: первая перенесённая миграция проходит
   explicit backward-compat аудит; политика обязательна с этого момента.

## 1. Вердикты по инициативам

### И1 Data Safety & Recovery — P0, первая
Журналы — source of truth с byte-identical replay по `seq`; «DELETE старше N»
для evidence-классов запрещён. Классы: **eternal evidence** (только партиции +
холодный архив с digest и доказанным обратным чтением) / **operational**
(retention по-таблично) / **derived** / **disposable**. Каждое не-eternal
отнесение — операторское решение. В R1-0 классификации и удалений нет.

### И2 Immutable Build & Release — P0
Достройка существующего (пришпиленный профиль `4fe9a32` + sha256 в receipt,
source-lock, content-addressed runtime-releases, провенанс-стампы). Новое:
- **bake-runtime = prebuilt Docker image**: CI чекаутит точные backend/UGC SHA,
  `npm ci`, проверяет digest, публикует image; Render разворачивает **по
  digest**. Artifact-хранилище — для пользовательских артефактов, не для
  исполняемого runtime-кода.
- **Release manifest = sidecar `platform-release-manifest.v1.json`** (release.json
  v2 НЕ расширяется неизвестными полями): SHA256 самого release.json v2;
  backend/feed/playables/UGC commits; container digest; migration requirement;
  profile digest; CI run/build identity. Старые читатели v2 не затронуты.
- Сериализация деплоев: **R1-0 даёт только fail-closed CAS** (проигравший
  падает с ошибкой — это не очередь); настоящая сериализация в R1-2 через
  удалённый координатор (GitHub Actions concurrency group или эквивалент).
- **Rollback-доказательство**: «скрипт остаётся в git» доказательством не
  является. Требуются pinned last-known-good artifact, документированная
  команда отката и **проверенный rollback smoke**.
- Удаление runtime push-path; read-only fine-grained токен вне remote URL.
- Локальный деплой после перехода — только break-glass с receipt-ом.

### И3 Runtime Isolation & Readiness — P1, единый worker
- `/health` — liveness/keep-alive, контракт не меняется. `/ready` — БД +
  **минимально необходимая schema capability** (НЕ точный alembic head: во
  время preDeploy старый код работает со свежей схемой; точный head проверяют
  preDeploy/CI) + обязательные runtime-зависимости. После доказательства
  `/ready` **ставится в Render healthCheckPath** — иначе он не управляет
  трафиком и остаётся декорацией.
- Вынос runner-ов: **один** background worker с пятью loop-ами и fencing по
  образцам 0021. Гарантия формулируется достижимо: (а) **нет двойных
  эффектов** — lease/fencing, все эффекты проверяют актуальный fence;
  (б) **failover-gap ограничен TTL** lease; (в) **durable work не теряется** —
  очередь сохраняется и догоняется новым исполнителем (bounded recovery,
  не невозможный zero-gap).
- Механизм handover: DB-owned activation row `target ∈ {web, worker}` с
  монотонным epoch и CAS. Worker поднимается standby → пишет readiness
  receipt → **оператор** переводит epoch → fenced acquisition worker-ом →
  проверка heartbeat/effects → удаление web-runner-ов. Падение worker-а =
  очередь цела, догоняется.
- Дальнейшее дробление — по измеренному blast radius/load, после финдиректора.

### И4 Observability — P1, параллельно И3
Фильтр «алерт = требуемое действие». Внешний сервис = поставщик/расход →
финдиректор + оператор.

### И5 Modularization — в R1 только стоп-кран
Архтест: запрет новых межконтурных импортов; бюджет строк новых файлов;
**grandfathered-монолиты заморожены на зафиксированном baseline** — рост
`feed.ts`/`island.ts`/`models.py` сверх baseline валит CI (иначе новый код
продолжит стекать в монолиты). Разнос — отдельной целью после R1.

### И6 Contract Supply Chain — вне R1 (P2)

### И7 Drift Guard — частично в R1
Operational manifest выпадает из sidecar-манифеста И2. CI-сравнение
серверных/клиентских флагов — тонкий срез. Урок этого же ревью: **scoreboard
не должен утверждать изменчивые runtime-значения** (флаги, включения) — только
ссылаться на rollout-authority (render.yaml / release-профиль); исправлено в
hypotheses.json одновременно с v3.

## 2. Карточка цели (GO оператора 28.07; v3-редакция exit)

- **Statement:** прод собирается из неизменяемых артефактов и не зависит от
  операторской машины; миграции отделены от старта web; переполнение диска или
  остановка runner-а видны алертом до пользовательской ошибки; восстановление
  прод-БД доказано прогоном с записанными RPO/RTO.
- **Exit:**
  1. production startup не выполняет git, npm install и миграций;
  2. CI выпускает immutable artifact (container image по digest) из точных SHA;
  3. deploy сериализован удалённым координатором; локальный путь — break-glass;
  4. rollback доказан: pinned last-known-good + команда + smoke;
  5. restore доказан isolated drill-ом, RPO/RTO записаны;
  6. `/ready` (БД + schema capability + зависимости) стоит в Render
     healthCheckPath; `/health` — liveness;
  7. web не владеет runner-ами: единый worker, lease/fencing, gap ≤ TTL,
     durable work догоняется;
  8. алерты диск 70/85% + per-runner живость, «алерт = действие»;
  9. классификация журналов утверждена оператором (удалений в R1 нет);
  10. стоп-кран: архтест импортов + бюджет строк + baseline-freeze монолитов
      зелёные в CI.
- **Kill/откат:** каждая ступень откатывается независимо (для релизного контура
  — через pinned last-known-good, не через «скрипт в git»); продуктовые контуры
  не задеваются; мораторий соблюдён.
- **Ведёт:** codex · ревью Claude · гейты оператора.

## 3. R1-0 — первые 48 часов

1. Снимок `pg_total_relation_size` + rows по таблицам; **bytes/row; записи за
   7/30 дней; прогноз для 10/100/1000 DAU** (рост при нулевом трафике сам по
   себе непоказателен).
2. Подтверждение PITR/recovery window на Recovery page фактического инстанса.
3. Isolated restore-drill в отдельную БД без переключения production
   (temp-инстанс = расход → уведомить финдиректор; присутствие оператора).
4. **Fail-closed CAS** в deploy-swipe.sh (проигравший деплой падает с ошибкой;
   очередь НЕ обещается — сериализация в R1-2).
5. Удаление runtime push-path (строки 31–38) + ротация токена в read-only
   fine-grained (ротация — оператор в Render dashboard).
6. Никакой классификации eternal evidence и никаких удалений.

Read-only часть R1-0 (пп. 1–2) запускается немедленно; drill, ротация,
расходы и любые production-переключения — операторские гейты.

### Утверждённая последовательность закрытия ingress (оператор, 29.07)

Целевое состояние: полностью закрытый external PostgreSQL ingress
(карта источников закрыта 29.07: постоянных внешних потребителей нет —
backend и C1 cron ходят по private network через Blueprint
`fromDatabase.connectionString`; единственный внешний класс — ручные
operator/Codex/Claude-сессии с Mac).

1. Snapshot 2 (нужен внешний доступ).
2. `0.0.0.0/0` → точный IP Mac `/32`.
3. Ротация DB credentials — zero-downtime цепочка: новый user → Blueprint
   sync/redeploy → smoke web/C1 → удаление старого user (новый user попадает
   в `fromDatabase.connectionString` при следующем Blueprint sync, не
   мгновенно).
4. Restore-drill (isolated, с оператором).
5. Удаление `/32`; red-then-green доказательство: backend + C1 cron остаются
   зелёными через private network, а новое внешнее подключение с Mac получает
   ожидаемый network refusal.

Дальнейшая диагностика — временный точный `/32` на сессию с закрытием после.
До snapshot 2 конфигурация не меняется.

Точный порядок действий, stop/rollback, полный Blueprint consumer closure,
protocol-level negative proof и isolated PITR acceptance зафиксированы в
`platform-reliability-r1-operator-runbook.md`. Dashboard health или
TCP-only `nc` не заменяют DB-запрос: `/api/health` по принятому контракту не
проверяет PostgreSQL, а Render применяет inbound rules на protocol-level после
TCP connect. Merge заранее-reviewed backend-патча входит в operator Gate G:
при включённом по умолчанию Blueprint Auto Sync сам merge в связанную
production-ветку может немедленно применить `ipAllowList: []`.

Snapshot 2 сравнивается скриптом
`scripts/platform-reliability-r1-db-delta.mjs`: отдельно provider storage,
`pg_database_size`, user relations и deadlocks. Отсутствующая во втором
`exact_row_count` таблица считается опустевшей (`0`), а не исчезает из delta.
Процент Render трактуется как округлённое измерение с интервалом
неопределённости, если receipt не содержит точный `usedBytes`.

Сырой TSV snapshot 1 не был сохранён: первый evidence-проход удержал полный
collector output только в shell-переменной. Для воспроизводимости подтверждённые
timestamped DB outputs сохранены в
`platform-reliability-r1-0-db-query-receipt.json` (call IDs, exact excerpts,
SHA256 неизменяемого session-log prefix и каждого полного tool output), а их нормализованное
представление — в `platform-reliability-r1-0-snapshot-baseline.json`.
Анализатор проверяет digest receipt до сравнения. Поэтому для пары snapshot 1→2
точны provider/database/relation/deadlock и aggregate exact-row delta, а
per-table exact-row delta честно имеет статус `unavailable`.

Snapshot 2 и все последующие collector TSV сохраняются целиком. Коллектор
завершает exact summary + completion sentinel; анализатор fail-closed отклоняет
усечённый output и требует совпадения серверного `current_database()` с
`logicalDatabaseName`, прочитанным из Render Info receipt того же сервиса.
Caller-supplied service ID не считается identity-доказательством. Для полных
пар действует правило «отсутствующая таблица = 0»:

```bash
node scripts/platform-reliability-r1-db-capture.mjs \
  --url-file "$R1_DB_URL_FILE" \
  --output <snapshot-2.tsv> \
  --not-before 2026-07-30T08:31:00Z \
  > <snapshot-2-db-capture-receipt.json>
```

`R1_DB_URL_FILE` — несекретный путь, возвращённый
`stageCredentialUrl()` из того же доверенного in-app browser/Node-вызова,
который читает Render input value. Stager сам генерирует криптографически
случайное имя, открывает его через `O_CREAT|O_EXCL|O_NOFOLLOW`, ставит `0600`
и никогда не возвращает URL. Раздельные `mktemp` → write, предсказуемое имя
или предварительно созданный путь запрещены: они оставляют symlink/TOCTOU
окно до wrapper-проверки.

URL не попадает в чат, shell history и аргументы `psql`. Wrapper очищает
ambient `DATABASE_URL` / `PG*`, передаёт разобранные credentials дочернему
`psql` только через минимальное allowlisted environment, включает второй
read-only guard через `PGOPTIONS`, требует полный completion sentinel и при
каждом обработанном success/error удаляет credential-файл. Output создаётся
эксклюзивно и удаляется при ошибке или слишком раннем server timestamp.
Capture-receipt сохраняется и содержит SHA-256 точных TSV bytes.

У reconstructed snapshot 1 component timestamps различаются на несколько
минут; database/relation/rows/deadlocks нормализуются каждый по собственному
окну. Provider-minus-relation rate имеет значение только если оба endpoint
skew не превышают 15 минут; иначе поле `null` / `inconclusive`.

Команда сравнения (JSON для evidence; `--format markdown` — review view):

```bash
node scripts/platform-reliability-r1-db-delta.mjs \
  --before platform-reliability-r1-0-snapshot-baseline.json \
  --after <snapshot-2.tsv> \
  --capture-after <snapshot-2-db-capture-receipt.json> \
  --provider-before platform-reliability-r1-0-render-receipt.json \
  --provider-after <snapshot-2-render-receipt.json>
```

## 4. Нарезка

| Пакет | Содержимое | Authority-граница |
|---|---|---|
| R1-0 (48ч) | §3 | drill/ротация — оператор; прочее read-only или код через ревью |
| R1-1 data safety | классификация (draft → оператор), алерты диска, партиции/архив утверждённого | классы — только оператор |
| R1-2 immutable release | CI-image по digest, sidecar-manifest, сериализация (concurrency), rollback smoke | перевод локального деплоя в break-glass — оператор |
| R1-3 startup split | preDeploy-миграции (+expand/contract аудит), web без git/npm (prebuilt image) | смена стартового контракта — оператор |
| R1-4 readiness+worker | /live+/ready → healthCheckPath; standby worker + activation epoch + fenced handover | epoch-перевод и новый сервис (деньги) — оператор+финдиректор |
| R1-5 observability | коллекторы, дашборд, алерты | внешний сервис — оператор |
| R1-6 стоп-кран | архтест + бюджет строк + baseline-freeze | чистый CI |

Правила: пакет = ветка + evidence с точными SHA; Claude ревьюит до merge;
включения — по слову оператора; новые флаги default-off; боевые значения —
только закоммиченные источники; scoreboard ссылается на rollout-authority,
не дублирует изменчивые значения.

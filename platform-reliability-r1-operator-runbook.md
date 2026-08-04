# Platform Reliability R1 — PostgreSQL operator runbook

Статус: **operator window возобновлено 2026-08-01; Gate A и Gate B исполнены;
Gate C остановлен новым Sync Hook incident**. Snapshot 2 и его independent
review завершены. Финальный operator receipt ещё не опубликован, поэтому эта
строка — рабочее состояние, а не completion evidence. Каждый следующий
помеченный `OPERATOR` гейт требует нового присутствия и явного подтверждения
оператора в текущей сессии.

Цель окна:

1. сузить внешний PostgreSQL ingress до одного operator-Mac `/32`;
2. без простоя перевести все Render-сервисы на новый default credential;
3. доказать isolated point-in-time recovery;
4. полностью закрыть внешний ingress;
5. доказать одновременно fresh internal connectivity и отказ нового
   PostgreSQL-запроса снаружи.

### Historical operator deferral 2026-07-30: superseded 2026-08-01

Этот блок сохраняется как журнал решения, но больше не описывает текущий
runtime-state: оператор позднее дал отдельный GO на окно, Gate A сузил ingress
до одного `/32`, а Gate B создал новый default credential. Ни один из этих
фактов сам по себе не закрывает R1; их terminal evidence входит только в
финальный operator receipt.

Оператор разрабатывает с нескольких Mac. При текущих динамических внешних
адресах точный `/32` создаёт регулярный ручной churn и риск самоблокировки.
Render при этом рассматривается как временная non-strategic test/dogfood
площадка, которая может быть заменена до масштаба. Поэтому весь mutating
operator window остановлен до Gate A:

- `0.0.0.0/0` временно остаётся; это принятый внешний attack-surface, а не
  исправленное состояние;
- DB credential не ротировался, allowlist не менялся, Blueprint sync/redeploy,
  recovery DB и расходы не запускались;
- пароль PostgreSQL и TLS остаются главным барьером внешнего доступа; это
  приемлемо только пока credential уникален, не попадает в repo/chat/log/tool
  output и нет признаков подозрительной аутентификации;
- R1-0 read-only baseline сохраняет ценность, но R1 нельзя обозначать
  complete: строки `/32`, credential rotation, PITR и external ingress closure
  completion matrix остаются незакрытыми;
- при возобновлении окно начинается заново с fresh consumer inventory,
  deployment/sync preflight и отдельного подтверждения Gate A. Старое
  «готов к operator window» не переносится.

Решение пересматривается не позже `2026-08-29` и немедленно раньше при любом
из условий:

- расширение за пределы operator dogfood или приближение к 100 DAU;
- появление другого человека с прямым PostgreSQL-доступом либо внешней
  automation;
- решение оставить Render стратегической production-площадкой;
- credential попал в сохраняемый output или возникла подозрительная
  authentication/network activity;
- стабильная сеть/VPN/zero-trust access делает multi-Mac allowlisting
  практически дешёвым.

До возобновления запрещено добавлять новые постоянные внешние DB-consumers и
нельзя трактовать открытый ingress как production-ready.

## 0. Authority и неизменяемые ограничения

- Source database: Render service
  `dpg-d95r32favr4c73aqs4d0-a` (`swipe-db`).
- Render database **Apps** не является картой consumers: это поверхность
  подключаемых admin-apps. Runtime-карта строится в момент окна по всему
  workspace:
  - все Render services/cron/workers и environment groups, чьи env metadata
    ссылаются на `swipe-db` / `fromDatabase.connectionString`;
  - все linked Blueprints и их pinned source manifests;
  - отдельно manual env consumers и внешние automations;
  - `pg_stat_activity`/логи за охватывающий самый редкий schedule период —
    только corroboration, потому что idle cron может отсутствовать в одном
    срезе.
  Значения connection strings не читаются/сохраняются. Список в чате, один
  Blueprint или database Apps не считается полным authority.
- Все найденные consumers должны быть перечислены в receipt и переведены.
  Замкнутый baseline set сверяется заново; любое расхождение останавливает окно
  до диспозиции.
- Source DB никогда не переключается на recovery DB в этом drill.
- Никаких DDL/DML-маркеров в source DB ради теста. Все SQL-проверки source и
  recovery выполняются в `REPEATABLE READ READ ONLY`.
- Connection strings, пароли, PSQL commands и точный внешний IP не пишутся в
  логи, shell history, git или evidence. В receipt допускаются только
  SHA-256 username/CIDR и несекретные Render identity.
- Render Settings/Credentials могут содержать visually-masked secrets прямо в
  DOM. На этих страницах запрещены broad DOM snapshots, body dumps и
  clipboard reads. Нужный state проверяется только точечным locator/evaluate,
  который возвращает несекретное поле; ephemeral secret handoff выполняется
  одним доверенным вызовом без возврата значения наружу.
- Если hook/credential всё же появился в сохраняемом browser/tool output, он
  считается exposed даже без copy/save. Final PASS требует отдельного
  операторского решения и, по умолчанию, подтверждённой provider-supported
  rotation/invalidation. Единственное исключение — exact pre-window Sync Hook
  incident из §2.1 с typed `operator_accepted_residual`; оно не расширяется на
  новые инциденты. В evidence пишутся только typed outcome, локальный
  структурный action ID и digest несекретного proof. При настоящей
  rotation/invalidation нужен targeted Dashboard terminal receipt без opaque
  provider ID; при accepted residual — acceptance digest, deadline и
  reopen triggers. Тот же Blueprint дополнительно подтверждается двумя
  датированными targeted observations до и после action.
  Для database-credential incident target — SHA-256 конкретного несекретного
  username, а terminal proof показывает `authentication_rejected` ровно для
  этого digest. Incident/decision/action ID имеют закрытые форматы, связанные
  с typed kind и UTC-днём события.
  Невозможность безопасно инвалидировать значение — `NO-GO`, кроме ровно
  принятого в §2.1 исторического Render residual; disconnect/reconnect Blueprint
  сам по себе ничего не инвалидирует.
- Открытие расходов, создание/deletion credential, Blueprint sync/redeploy,
  запуск cron, recovery и изменение allowlist — только в operator window.

Официальные контракты Render:

- [credential rotation](https://render.com/docs/postgresql-credentials):
  новый Render-managed user становится default; Blueprint `connectionString`
  обновляется только на следующем manual sync; старый user остаётся валиден
  до удаления;
- [external connections](https://render.com/docs/postgresql-creating-connecting):
  same-region Render services используют private URL, external allowlist их не
  затрагивает;
- [inbound IP rules](https://render.com/docs/inbound-ip-rules): `/32`
  ограничивает одним IPv4; пустой список блокирует весь внешний ingress;
  TCP-only `nc`/`telnet` не доказывает блокировку — нужен protocol-level
  PostgreSQL request;
- [PITR](https://render.com/docs/postgresql-backups): recovery создаёт отдельную
  DB, не меняет source; restore point должен быть старше текущего времени
  минимум на 10 минут и recovery копирует allowlist source.

Blueprint authority требует отдельной осторожности:
[`ipAllowList` omitted означает allow-all](https://render.com/docs/blueprint-spec#inbound-ip-rules).
Поэтому dashboard-only empty allowlist не является durable финалом.
Backend-патч `ipAllowList: []` готовится и ревьюится заранее, но применяется
только в operator window после drill. Render Blueprint
[Auto Sync включён по умолчанию](https://render.com/docs/infrastructure-as-code#disabling-automatic-sync):
push/merge в связанную production-ветку может сам немедленно применить
`render.yaml`. Поэтому merge backend-патча является частью `OPERATOR GATE G`,
а не безопасной подготовкой до окна. На промежуточном manual Blueprint sync
preview обязан явно сохранить действующий `/32`; любое предложение вернуть
`0.0.0.0/0` останавливает rotation до нового операторского решения.

## 1. Evidence bundle

Создать отдельную ветку от свежего `p4g-workspace-meta/origin/master`.
Никаких runtime-фактов не коммитить до их наблюдения. Финальный пакет содержит:

| Артефакт | Содержание |
|---|---|
| `platform-reliability-r1-0-snapshot-2.tsv` | полный raw collector output с `snapshot_complete	ok` |
| `platform-reliability-r1-0-snapshot-2-db-capture-receipt.json` | server-time + SHA-256 точных TSV bytes + secret-handling assertions |
| `platform-reliability-r1-0-snapshot-2-render-receipt.json` | same-service Render storage/identity observation |
| `platform-reliability-r1-0-snapshot-delta.json` | машинный analyzer output |
| `platform-reliability-r1-0-snapshot-delta.md` | review view |
| `platform-reliability-r1-gate-c0-blueprint-before.json` | no-secret old Blueprint/source/service baseline before replacement |
| `platform-reliability-r1-gate-c0-blueprint-after.json` | no-secret new Blueprint observation + terminal old-ID absence |
| `platform-reliability-r1-gate-c0-blueprint-comparison.json` | exact-byte replayed source/service/Auto Sync continuity proof |
| `platform-reliability-r1-operator-receipt.json` | несекретный журнал operator window |
| `platform-reliability-r1-final-evidence.md` | requirement-by-requirement synthesis |
| `platform-reliability-r1-secret-scan-receipt.json` | SHA-256 всех обязательных артефактов + zero-match secret/IP scan |

Оба delta-output содержат одинаковый provenance-набор SHA-256: snapshot 1
baseline, snapshot 2 TSV, snapshot 2 capture receipt и оба same-service Render
receipt. Несовпадение любого hash или Markdown без этого блока — `NO-GO` для
snapshot review.

Перед окном использовать
`docs/templates/platform-reliability-r1-operator-receipt-template.json` и
`docs/templates/platform-reliability-r1-final-evidence-template.md` как
чеклисты полноты. Копии с runtime-фактами создаются только под точными
именами из таблицы; каждый placeholder обязан быть заменён или удалён.
Шаблон не является evidence и не получает статус PASS.
Перед secret scan instantiated receipt и final evidence обязаны пройти
строгую structural/chronology-проверку без неразрешённых `{{...}}`;
проверка встроена в финальный evidence scanner и не заменяется визуальным
просмотром шаблона.
DB clock для Start Recovery сохраняется с отдельным evidence digest; разница
с operator action timestamp не может превышать 60 секунд. Каждый action имеет
уникальный `actionId` и стабильный `operationId`: failed attempt закрывается
либо typed rollback/containment, либо более поздним successful action того же
operation/target с явным `resolvesActionId`.

Snapshot 2 снимается только через
`scripts/platform-reliability-r1-db-capture.mjs`. В одном доверенном in-app
browser/Node-вызове Render input value передаётся экспортированной
`stageCredentialUrl()`: она генерирует криптографически случайное имя,
эксклюзивно открывает regular-файл через `O_CREAT|O_EXCL|O_NOFOLLOW`, ставит
`0600` и возвращает только несекретный путь. Предсказуемое имя или раздельные
`mktemp` → write запрещены.

Wrapper не передаёт URL или password в argv, использует минимальное
allowlisted child environment, включает внешний transaction read-only guard,
проверяет completion sentinel и server timestamp
`>= 2026-07-30 08:31:00Z`, а credential-файл удаляет при каждом обработанном
success/error. Нельзя подменять этот путь прямым `psql "$DATABASE_URL"`.
Stdout wrapper сохраняется как обязательный capture-receipt; delta analyzer
должен подтвердить его `outputBytes`, timestamp и SHA-256 против точного TSV.

В `operator-receipt` для каждого внешнего действия записать:

- UTC before/after;
- Render service / deploy / cron-run / Blueprint-sync identity;
- operator confirmation timestamp;
- terminal outcome;
- hash или typed result проверки;
- rollback outcome, если он применялся;
- `secretsCaptured: false`.

Не писать точный `/32`. Записать `cidrKind: "single-ipv4"` и SHA-256
канонической строки `<ipv4>/32`. Username не является credential, но для
минимизации следа также сохранять только SHA-256.

## 2. Stop-before-start

Перед первым изменением должны одновременно выполняться:

- snapshot 2 снят после `2026-07-30 08:31:00Z`, raw TSV сохранён;
- delta analyzer принял пару snapshot 1→2 и same-service Render receipts;
- independent review snapshot-пакета не имеет P1/P2 blockers;
- database status `available`;
- workspace-wide env-reference inventory, linked Blueprints и repo manifests
  дали один замкнутый consumer set; manual/external consumers отсутствуют либо
  явно диспозированы;
- нет активного deploy/Blueprint sync/recovery/export;
- каждый известный до окна secret-exposure incident до Gate A имеет отдельное
  operator approval и либо provider-supported rotation/invalidation terminal
  proof, либо — только для exact incident из §2.1 — полностью заполненную
  `operator_accepted_residual` disposition. Новые Sync Hook incidents и любые
  database-credential incidents исключения не имеют;
- у оператора есть окно на весь цикл и подтверждён возможный расход recovery;
- сохранён pinned source SHA и last-known-good deploy identity каждого
  потребителя;
- старый external URL удерживается только в ephemeral memory до
  post-deletion negative test.

Любой unmet-пункт — `NO-GO`, production не меняется.

### 2.1 Known Blueprint Sync Hook incident

Read-only факт-проверка `2026-07-29` не нашла публичного provider-контракта
для rotation/revocation Blueprint Sync Hook:

- [официальный Blueprint guide](https://render.com/docs/infrastructure-as-code)
  документирует только Auto Sync и Manual Sync;
- [публичный Render OpenAPI](https://api-docs.render.com/v1.0/openapi/render-public-api-1.json)
  содержит `/blueprints`, `/blueprints/validate`,
  `/blueprints/{blueprintId}` и `/blueprints/{blueprintId}/syncs`, но не
  Blueprint hook lifecycle endpoint;
- документированный `Regenerate Hook` относится к
  [service deploy hooks](https://render.com/docs/deploy-hooks), а не к
  Blueprint.

Targeted button-only проверка Dashboard `2026-07-30`, не читавшая и не
возвращавшая hook value, показала только `Show secret` и `Copy`: provider
control Regenerate/Revoke отсутствует. Состояние инцидента остаётся
`provider_path_not_documented`.

Оператор `2026-07-30` принял этот единственный остаточный риск для текущего
`non_strategic_dogfood`-использования Render: платформа рассматривается как
тестовая площадка и может быть заменена до масштаба. Это решение открывает
Gate A только через typed-диспозицию `operator_accepted_residual`. Она не
означает, что hook отозван, ротирован или безопасен: известный hook по-прежнему
может дать неавторизованный запуск Blueprint Sync, но не прямой доступ к
PostgreSQL.

Typed-диспозиция обязана:

- относиться ровно к
  `r1-prewindow-blueprint-sync-hook-dom-20260729`, тому же Blueprint digest и
  предшествовать Gate A;
- содержать review deadline не позже 31 дня после принятия;
- запрещать читать, копировать или использовать hook;
- требовать durable `ipAllowList: []` до завершения R1, фиксацию финального
  состояния Auto Sync и stop-the-line при неожиданном Blueprint Sync;
- вновь открыть решение до расширения когорты, до 100 DAU, до появления
  второго Blueprint-оператора/автоматизации, при решении оставить Render
  стратегической production-площадкой или при любом неожиданном sync;
- сохранить exact before/after continuity Blueprint/source и digest
  операторского решения.

Выключение Auto Sync не доказывает инвалидирование hook. Human Render Support
`2026-08-03` подтвердил единственный provider-supported путь для этого
Blueprint: удалить старый Blueprint и создать новый. По ответу провайдера это
удаляет текущий hook, не удаляет существующие сервисы и выдаёт новому
Blueprint новый hook; последний sync старого Blueprint был
`2026-07-30T15:09:14Z`. Точный bounded receipt —
`platform-reliability-r1-gate-c-render-support-response.json`.

Human Render Support `2026-08-04` подтвердил, что `fromDatabase` создаёт
реальные environment variables на существующих сервисах, cron schedules
хранятся на самих cron-сервисах, а удаление/recreation Blueprint не меняет эти
сервисы. Это provider-confirmed semantics, но не provider-observed execution.
Поэтому оба DB-backed cron всё равно suspended на всё окно, web не должен
рестартовать, а один active attempt ограничен 900 секундами. Deadline, pause
state, отсутствие web restart и typed provider authority входят в v3
before/after observations; истечение deadline оставляет cron suspended и
требует нового baseline + нового operator GO.

Follow-up про Sync Hook apply-versus-Preview пока не является provider fact:
последний ответ агента был явно помечен как guess. До factual-ответа рунбук
fail-closed предполагает немедленное применение текущего `render.yaml` без
Dashboard Approve. Поэтому Gate C0 начинается с exact-reviewed source freeze
backend PR #54 @`dd250d08cfd65723532fd0f59d63064e88c38a24`; reviewer GO не
разрешает его merge. Freeze merge, cron suspension и Blueprint replacement
разрешает только fresh operator `GO Gate C0`, привязанный к exact head.

Ответ не является terminal proof: до фактической замены старый hook остаётся
валидным. Удаление/recreation — отдельный destructive `OPERATOR GATE C0` по
`platform-reliability-r1-gate-c-contract.md`. PASS требует отсутствия старого
Blueprint, нового ID, сохранения exact service IDs/configuration/source и Auto
Sync `No`; новый hook не читается и не сохраняется. Простое
disconnect/reconnect не считается инвалидированием. Этот путь после
исполнения закрывает оба incident того же старого hook, включая исторический
residual. Ни новый Sync Hook incident, ни раскрытие учётных данных базы так
принять нельзя.

Service/database continuity в Gate C0 имеет evidence class
`operator_attested`, не provider-verified; отдельно фиксируется
`providerConfirmedFromDatabaseContinuity=true`. Observation v3 сохраняет raw
bounded non-secret projections (service ID/kind/status/plan/schedule/runtime,
command, environment key names, structured DB binding and DB configuration),
а comparator сам вычисляет stable code-point-ordered digests. Caller-supplied
configuration hashes в observation запрещены. После terminal old-Blueprint
absence локальная сохранённая копия hook становится inert, но не исчезает:
она удаляется отдельным cleanup receipt либо получает явного owner/deadline.

Если новый secret-exposure incident возникает уже в окне, текущий action
останавливается/получает typed containment, и никакой следующий gate-action не
начинается до отдельного operator approval и terminal
rotation/invalidation proof. Каждый такой incident добавляется в
`secretExposureIncidents`; умолчание или запись `none` запрещены.
Stop-rule применяется к единой временной шкале: и A–G actions, и другие
secret-disposition actions. Вложенная disposition не считается containment
для продолжающейся внешней disposition.

## 3. Сужение ingress: `0.0.0.0/0` → operator `/32`

### 3.1 Preflight

1. Определить публичный IPv4 operator Mac и канонизировать как `<ipv4>/32`.
2. Убедиться, что адрес — IPv4, не private/reserved, и совпадает с текущим
   egress Mac. Не коммитить его.
3. Пока действует `0.0.0.0/0`, выполнить по full external URL:

   ```sql
   BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY;
   SELECT current_database(), current_user, inet_client_addr();
   ROLLBACK;
   ```

4. Записать только DB identity, user hash и два CIDR digest:
   `operatorEgressCidrSha256` из наблюдённого egress и
   `renderRuleCidrSha256` из сохранённого правила. PASS требует их равенства,
   `cidrKind: "single-ipv4"` и `protocolQuerySucceeded: true`.

### 3.2 Change — `OPERATOR GATE A`

После подтверждения оператора заменить единственное правило
`0.0.0.0/0` на `<ipv4>/32` и сохранить.

PASS:

- Render показывает ровно один database-level source `/32`;
- новый PostgreSQL protocol request по тому же external URL с Mac успешен;
- `current_database()` совпадает с source DB;
- Render Apps остаются available.

KILL/rollback: если новый protocol request с Mac не проходит или любой
внутренний consumer деградировал, оператор возвращает прежнее правило
`0.0.0.0/0`, подтверждает восстановление и завершает окно без rotation.

## 4. Zero-downtime credential rotation

### 4.1 Создать новый default — `OPERATOR GATE B`

1. Зафиксировать hash старого default username.
2. После подтверждения оператора выбрать **New default credential**.
3. Скопировать новый external URL только в ephemeral memory; не сохранять его
   в файл/clipboard дольше окна.
4. Доказать по `/32` новым credential:

   ```sql
   BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY;
   SELECT current_database(), current_user;
   ROLLBACK;
   ```

5. Зафиксировать hash нового username и показанный Render `createdAt`;
   отдельный opaque credential ID не выдумывать, если Dashboard его не
   предоставляет.

Новый user не означает, что приложения уже переключены. Старый user нельзя
удалять до §4.4.

### 4.2 Capability preflight и Blueprint sync — `OPERATOR GATE C`

Исполняемый контракт конкретного окна, точный Preview и безопасный comparison
receipt фиксируются отдельным reviewable-пакетом. Для текущего окна это
`platform-reliability-r1-gate-c-contract.md`; чат не является authority для
состава предусловий.

Если старый Sync Hook ещё не инвалидирован, сначала исполняется отдельный
`OPERATOR GATE C0`: fresh GO, явно разрешающий exact PR #54 merge → merge
fail-closed source freeze → suspend обоих cron → v3 before observation →
удаление только старого Blueprint → bounded relink Preview → создание нового
Blueprint → v3 after observation до 900-second deadline. Cron остаются
suspended до terminal comparison и отдельного Gate C. Freeze живёт только в
одном attended operator window, не дольше 60 минут от merge, и запрещает любой
production deploy. Срочный hotfix требует сначала abort + полный revert freeze.
Если replacement сам запускает deploy, ожидаем только terminal sentinel exit
`78` до app/DB; successful/Live deploy — немедленный NO-GO. При deadline, web
restart или неожиданном runnable cron окно останавливается без удаления
какой-либо DB credential. После terminal Gate C или любого abort полный freeze
revert обязан побайтно восстановить reviewed R1-A source до 60-minute deadline.
Точная последовательность и stop rules живут в Gate C contract.

До sync новый user должен пройти не только `SELECT 1`, но и read-only
capability audit:

- direct-login профиль старой credential;
- строго более поздний direct-login профиль новой credential;
- fail-closed exact comparison этих профилей;
- read-only Alembic current/check против pinned source.

Публичный результат содержит только hash-bound pass/fail и typed differences
без credentials и raw database/object/role names. Любой miss — sync не
начинается, старый user остаётся рабочим.

Профили снимаются одним SQL и сравниваются fail-closed:

```bash
# Для каждого вызова credential передаётся через operator-local PG*
# environment, не connection URL в argv.
psql -X -q \
  -f scripts/platform-reliability-r1-db-capability.sql > <old-profile.jsonl>
psql -X -q \
  -f scripts/platform-reliability-r1-db-capability.sql > <new-profile.jsonl>
node scripts/platform-reliability-r1-db-capability-compare.mjs \
  --old <old-profile.jsonl> --new <new-profile.jsonl> \
  > <capability-comparison.json>
```

Comparator требует прямую аутентификацию каждой credential. Для исходного
пользователя допустим `session_user = current_user`; для Render-managed
rotation допустим наблюдаемый delegated-login (`session_user != current_user`)
только если effective user сохранён, session role не имеет privileged role
attributes, его единственная role-config — `role=CURRENT_EFFECTIVE_USER`, а
все прямые membership/SET-права уже покрыты effective user и ни одно членство
не имеет admin option. Прямые ACL-гранты session-роли перечисляются по
database/schema/relation/column/routine/type/default-ACL каталогам: допустимо
только пустое множество либо негрантабельный `CONNECT` к текущей базе;
в `pg_db_role_setting` допустима только глобальная
`role=CURRENT_EFFECTIVE_USER`, остальные настройки запрещены. Затем
проверяются тот же PostgreSQL cluster/system
identifier, database OID и server version, разные session users, strictly
later new-profile,
полный completion sentinel и byte-canonical equality всех role attributes,
memberships/options/settings, ownership, RLS/policies, default ACL,
database/schema/relation/column/sequence/routine/type privileges и grant
options. PostgreSQL 16/17-зависимые `SET ROLE`/`MAINTAIN` capabilities
фиксируются явно как unsupported, а не пропускаются. В evidence идут profile,
cluster, database, username и object identity SHA-256 плюс typed diff; raw
профили (включая ACL/config values) остаются operator-local и не коммитятся.
Self-references в default ACL нормализуются в `CURRENT_USER`, чтобы одинаковая
future-object authority двух credentials не расходилась только из-за разных
имён grantor/grantee.
Только exit `0` и `profilesEqual=true` разрешают Blueprint sync; любой parse,
coverage, cluster или capability miss — fail closed.

1. Открыть linked Blueprint и сначала просмотреть sync diff.
2. Fail closed, если preview содержит create/delete/plan/storage/schedule,
   неожиданные env или source-commit изменения. Разрешён только ожидаемый
   refresh DB reference и неизменный declarative source.
3. После подтверждения оператора выполнить manual Blueprint sync.
4. Зафиксировать sync ID, pinned source SHA, затронутые сервисы и terminal
   status.

### 4.3 Fresh internal proof

Перезапустить/redeploy весь замкнутый consumer set из §0, получивший новое
Blueprint value. Для каждого нужен свежий, а не унаследованный socket:

- web: terminal `Live`, затем из Render Shell выполнить отдельный read-only
  `SELECT current_database(), current_user` через приложение;
- каждый DB-backed cron: новый successful manual run после sync. Допустим
  только его штатный idempotent `run-once`; записать run ID и terminal result;
- из external `/32` session проверить `pg_stat_activity`: присутствует новый
  user, старый user имеет `0` sessions после bounded drain/redeploy.

Точный список берётся из §0 authority. Проверка только `/api/health`
недостаточна: этот endpoint по принятому контракту не проверяет DB.

KILL/containment:

- при sync/deploy/run ошибке старый credential остаётся валиден и deletion
  запрещён;
- не утверждать, что rollback deploy вернул старый dynamic env: Render
  Blueprint reference уже указывает на новый default;
- web переводится последовательно: failed candidate не заменяет последний
  Live instance; зафиксировать, какой user обслуживает оставшийся Live;
- pinned last-known-good image можно redeploy только с уже доказанными
  capability нового credential. Если он тоже не получает fresh DB proof,
  окно останавливается в состоянии «оба users сохранены» и требует отдельного
  reviewed recovery-плана;
- не удалять ни одного user;
- новый default можно оставить активным до отдельной диспозиции — его deletion
  тоже требует оператора. Не обещать автоматический repoint на старый URL:
  такого reviewed механизма в этом runbook нет.

### 4.4 Удалить старый credential — `OPERATOR GATE D`

Только когда:

- все consumers имеют fresh proof с новым user;
- `pg_stat_activity` показывает `0` старых sessions;
- каждый consumer из замкнутого set имеет свежий terminal proof;
- оператор отдельно подтвердил deletion.

После удаления старого credential:

1. старый external URL обязан получить authentication rejection при
   PostgreSQL protocol request через ещё открытый `/32`;
2. новый external URL обязан остаться успешным;
3. повторить fresh internal web query и по одному штатному run каждого cron.

Если старый URL всё ещё успешен — `NO-GO`: не переходить к recovery/closure.

## 5. Isolated PITR restore-drill — `OPERATOR GATE E`

Recovery создаёт новый оплачиваемый database service. До окна уведомить
финансового директора о temporary instance и сохранить его диспозицию. Перед
final **Start Recovery** показать оператору имя, restore point, copied
settings, ожидаемый plan/cost и получить явное подтверждение. Нет
finance-диспозиции или operator approval — restore не запускается.

### 5.1 Server-owned anchor

До запуска зафиксировать server-clock restore point внутри доступного окна,
старше текущего времени минимум на 10 минут. Boundary строится не по
приблизительному `created_at`:

1. В read-only transaction прочитать последний уже committed
   `content_analytics_scheduler_run_receipts` row (`before`) и DB clock.
2. Выбрать `restore_point` строго после этой read-only observation.
3. После `restore_point` штатный credential-smoke из §4.3 запускает обычный
   idempotent C1 `run-once`. Он по контракту пишет append-only receipt даже для
   `noop`; его terminal run receipt становится `after`.
4. К началу recovery `restore_point` должен быть старше текущего DB clock
   минимум на 10 минут.

Записать SHA-256 canonical identity обоих receipts и Render run ID `after`.
Так `before` доказанно был committed до точки, а `after` создан штатным
terminal run после неё. Это не искусственный DML-marker: тот же C1-run уже
обязателен для проверки rotated credential. Если C1-run не создал terminal
receipt, drill не может получить PASS.

Дополнительно зафиксировать source:

- `current_database`, PostgreSQL major, Alembic head;
- public table count;
- exact total rows;
- immutable sample digests.

Все запросы — одна `REPEATABLE READ READ ONLY` транзакция.

### 5.2 Restore и validation

1. Создать recovery DB с уникальным `r1-drill-<UTC>` именем, source DB не
   переключать.
2. Ждать terminal `Available`; записать recovery service ID и timestamps.
3. Подключиться к recovery по full URL.
4. Доказать:
   - другой database/service identity;
   - ожидаемые PostgreSQL major и Alembic head;
   - `before` digest присутствует;
   - `after` digest отсутствует;
   - schema/table counts и immutable samples согласованы с restore point;
   - source DB всё время остаётся `Available`, ее consumer bindings не
     менялись.

Записать наблюдаемые recovery objectives, не превращая один drill в SLA:

- `observedRpoSeconds` = DB clock в момент Start Recovery минус requested
  restore point;
- `observedProvisionRtoSeconds` = Start Recovery → terminal `Available`;
- `observedValidationRtoSeconds` = Start Recovery → последний успешный
  acceptance query.

Restore с неверной boundary, schema или sample = `FAIL`, не повторять
автоматически и ничего не переключать.

### 5.3 Cleanup — `OPERATOR GATE F`

После сохранения evidence показать оператору exact recovery service target.
По отдельному подтверждению удалить recovery DB. Source DB
удалять/переключать запрещено. Зафиксировать terminal deletion outcome.

Suspend — только аварийная отсрочка, не PASS и не закрытие расхода: receipt
обязан содержать named owner, финансовое уведомление и deletion deadline не
позже 24 часов. Пока recovery DB не удалена, completion matrix остаётся
незакрытой.

## 6. Полное закрытие external ingress

### 6.1 Durable change — `OPERATOR GATE G`

После успешных §§3–5 и подтверждения оператора применить заранее
отдельно-reviewed backend-патч, в котором exact `swipe-db` mapping содержит
`ipAllowList: []`:

1. убедиться, что patch основан на актуальном `swipe-backend/origin/master` и
   меняет только network boundary + её fail-closed validation closure;
2. подтвердить в Render exact linked Blueprint, source repo/branch/path и
   текущее состояние Auto Sync только targeted reads несекретных controls;
   broad snapshot страницы Settings запрещён. Не читать/показывать Sync Hook.
   Несоответствие receipt baseline останавливает окно;
3. показать оператору exact PR/head и получить отдельное подтверждение
   production-мутации. Если Auto Sync включён, с подтверждением оператора
   сначала выключить его и зафиксировать результат. Невозможность выключить
   Auto Sync останавливает Gate G: merge при включённом Auto Sync запрещён;
4. выполнить merge, затем открыть Manual Sync preview/plan. Он обязан
   содержать только ожидаемое закрытие `swipe-db`;
   неожиданный resource/deploy diff останавливает sync и требует диспозиции;
5. выполнить/дождаться terminal Blueprint sync и зафиксировать его identity;
6. убедиться, что Render показывает пустой database allowlist;
7. записать итоговое состояние Auto Sync. Не включать его обратно молча:
   любое восстановление состояния — отдельное подтверждённое решение
   оператора;
8. если в Gate G возник новый typed secret-exposure incident, немедленно
   остановить текущий action и применить общее stop-rule из §2. Возобновление
   возможно только новым action после terminal disposition. Эта операция не
   подразумевает разрешения отключать или пересоздавать Blueprint.

Dashboard-only удаление `/32` без committed Blueprint authority не получает
PASS: следующий sync мог бы вернуть allow-all.

### 6.2 Обязательное paired proof

PASS требует оба доказательства после timestamp сохранения:

1. **Internal green**
   - fresh Render-Shell read-only DB query из web;
   - fresh successful run каждого DB-backed cron;
   - service/deploy/run IDs и новый username hash совпадают с rotation receipt.
2. **External refused**
   - тот же новый external URL, доказанно успешный до closure, выполняет новый
     PostgreSQL protocol request с Mac;
   - request завершается non-zero без результата SQL;
   - сохраняется только typed failure и sanitized stderr digest;
   - DNS/обычный HTTPS с Mac остаются работоспособны; TCP-connect может быть
     только дополнительным reachability signal, но не доказательством
     блокировки.

Health-only или dashboard-only evidence не закрывает гейт.

KILL/rollback: если internal proof красный, оператор временно возвращает тот же
точный `/32` (не `0.0.0.0/0`) для диагностики. После устранения повторяется
fresh internal proof и `/32` снова удаляется. Если external request успешен при
пустом allowlist, окно остаётся `NO-GO` и закрытие не заявляется.

## 7. Completion matrix

Финальный independent reviewer должен поставить PASS отдельно:

| Requirement | Минимальное authority-evidence |
|---|---|
| Snapshot 2/delta | full TSV + byte-bound capture receipt + completion sentinel + same-service Render receipt + analyzer outputs |
| `/32` | Render rule receipt + successful PostgreSQL request после сужения |
| New credential | username hash + Render createdAt + new-user external query |
| All consumers rotated | workspace-wide env/Blueprint closure + fresh DB proof каждого consumer |
| Old credential retired | zero old sessions + old URL authentication rejection |
| PITR works | separate recovery ID + before present/after absent + schema/sample checks |
| Source untouched | source service/deploy identities unchanged through drill |
| Temp cost closed | finance disposition + operator-approved recovery deletion terminal receipt |
| RPO/RTO observed | requested point, Start, Available и validation timestamps + вычисленные seconds |
| External ingress closed | merged Blueprint `ipAllowList: []` identity + sync receipt + empty allowlist + post-change protocol rejection |
| Internal remains green | post-closure fresh DB proof каждого consumer |
| Secret hygiene | exact git patch equals the approved evidence manifest (plus its own output receipt), no credentials/operator IP in decoded or raw artifacts; любой новый typed secret-exposure incident имеет operator-approved terminal rotation/invalidation proof; известный pre-window Sync Hook либо реально ротирован/отозван, либо представлен единственным exact `operator_accepted_residual` с review deadline и reopen triggers; `node scripts/platform-reliability-r1-evidence-scan.mjs --root . --base-ref origin/master > platform-reliability-r1-secret-scan-receipt.json` PASS |

Цель R1 считается выполненной только после независимого review всего пакета,
а не после последнего клика в Render. При `operator_accepted_residual` итог
формулируется как «R1 complete with accepted Render residual», а не как
«все secret incidents закрыты».

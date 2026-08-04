# Маршрут A — рунбук доведения master до прода

- Дата: 04.08.2026. Составлен разведкой по репозиторию + тремя адверсариальными линзами.
- Вердикт: **ROUTE_A_NEEDS_CHANGE** — форма маршрута A сохраняется, но шаги изменены четырьмя P1.
- Это evidence, не authority: каждый операторский акт остаётся вашим решением.

## Резюме

Маршрут A остаётся исполнимым только с изменениями: три P1-находки бьют в само основание плана, и одна из них может закрыть Gate C0 полностью. (1) Компаратор C0 требует буквального равенства before.blueprint.sourceSha === after.blueprint.sourceSha (scripts/platform-reliability-r1-blueprint-replacement-compare.mjs:649-651, exit 2), но по контракту (platform-reliability-r1-gate-c-contract.md:162-179) удаление старого Blueprint происходит РАНЬШЕ сбора after-наблюдения, а provider-capture этот параметр физически не отдаёт (квитанция Blueprint = ровно {autoSync, id}, scripts/platform-release-provider-capture.py:172-173). Поэтому в план добавлен обязательный ручной NO-GO-гейт перед удалением: оператор глазами читает source-SHA старого Blueprint в Dashboard, и при неравенстве с head master Blueprint НЕ удаляется. (2) Ни один шаг не сохранял ЗНАЧЕНИЯ env перед терминальным удалением: компаратор сравнивает только имена ключей (:212-225) и прямо запрещает захват значений (secretsCaptured обязан быть false, :481-482), а ISLAND_MANIFEST_TOKEN_KEY объявлен generateValue:true и вне Render не существует. Добавлен отдельный операторский шаг офлайн-выгрузки значений. (3) Дамп снимался один раз в начале, а необратимые акты — через часы и несколько операторских гейтов, при работающих cron; проверка дампа проходила даже на усечённом файле. Теперь дампов три (baseline, перед удалением Blueprint, перед ручной миграцией), проверка идёт с --exit-on-error и объёмной сверкой. Дополнительно: рабочий чекаут swipe-backend физически НЕ является master (HEAD 6a526ac, не предок origin/master, другой граф миграций 0071_mobile_review_hardening…), поэтому введён шаг 0 — чистый git worktree; сверка schema-capability действительна только на PostgreSQL ровно 16 (postgresMajor входит в дайджест, app/platform_release.py:355-358); мерж PR #53 и публикация образа переставлены ПЕРЕД необратимым окном C0, чтобы не делать релиз заложником окна.

## Шаги

### 0. Шаг 0 (агент). Чистый рабочий чекаут origin/master — рабочее дерево оператора НЕ использовать

**Кто:** agent · **оценка:** 5 мин

Текущий каталог /Users/gleb/My projects/p4g-platform-workspace/swipe-backend НЕ является master: git rev-parse HEAD = 6a526ac9950de650947e162ab5bd2239e1094474 (это head открытого PR #25), merge-base --is-ancestor origin/master → NO, в рабочем дереве ~25 изменённых файлов, включая app/models.py и app/main.py. Главное: у него ДРУГОЙ граф миграций (0071_mobile_review_hardening → 0072_series_level_limit_10 → 0073_published_test_delivery), в нём вообще нет ревизий 0072_mission_ops_receipts и 0073_platform_release_receipts, а текущее состояние прода 0070_published_test_delivery в этом графе называется иначе. migrations/env.py:12-14 импортирует app.models ИЗ РАБОЧЕГО ДЕРЕВА, поэтому запуск alembic отсюда против прода направил бы в прод чужие миграции. Создать отдельный worktree и ВСЕ последующие команды репозитория запускать только из него.

```bash
cd "/Users/gleb/My projects/p4g-platform-workspace/swipe-backend" && git fetch origin && git worktree add /tmp/r1a-master origin/master && cd /tmp/r1a-master && git rev-parse HEAD
```

**Предусловие:** Нет. Рабочее дерево оператора при этом не трогается — незакоммиченные изменения остаются на месте

**Проверка:** git rev-parse HEAD печатает f2a840517956c4f480fc9d8aaf6f832ebde489d9 (или новый merge-SHA после шага 6); ls /tmp/r1a-master/migrations/versions/ содержит 0071_mission_slice_core.py, 0072_mission_ops_receipts.py, 0073_platform_release_receipts.py

**Обратимость:** git worktree remove /tmp/r1a-master

### 1. Дамп PostgreSQL прода №1 (baseline) — единственная сеть безопасности, хранить вне git

**Кто:** operator · **оценка:** 30-50 мин с учётом Access Control

Взять в Render Dashboard External Connection String для swipe-db (dpg-d95r32favr4c73aqs4d0-a), при необходимости добавить IP оператора в Access Control БД. Строку подключения НЕ вставлять в argv (она видна в ps и попадает в историю shell): положить пароль в ~/.pgpass (chmod 600) и обращаться по частям, либо экспортировать переменную без echo. Дамп писать по АБСОЛЮТНОМУ пути ВНЕ git-дерева — каталог /Users/gleb/My projects/p4g-platform-workspace засорён и является репозиторием, дамп содержит персональные данные (telegram user id). Сразу посчитать sha256, записать размер и сделать вторую копию на отдельный носитель. Отдельной командой снять кластерные объекты: pg_dump одной базы не выгружает роли, членства, ALTER ROLE/DATABASE и (с --no-owner --no-privileges) владельцев и ACL — для восстановления в новый инстанс этого не хватит. В репозитории скрипта или runbook'а бэкапа не существует вовсе (git ls-tree по origin/master не содержит ничего по dump/backup/restore).

```bash
mkdir -p ~/secure/r1a && cd ~/secure/r1a
export PGDUMPFILE="$HOME/secure/r1a/swipe-prod-baseline-$(date -u +%Y%m%dT%H%M%SZ).dump"
pg_dump --format=custom --no-owner --no-privileges --verbose --file="$PGDUMPFILE" "$PROD_EXTERNAL_URL"
shasum -a 256 "$PGDUMPFILE" | tee "$PGDUMPFILE.sha256"
ls -l "$PGDUMPFILE"
pg_dumpall --globals-only --no-role-passwords --file="$HOME/secure/r1a/globals-$(date -u +%Y%m%dT%H%M%SZ).sql" -d "$PROD_EXTERNAL_URL"
```

**Предусловие:** Ничего ещё не менялось. БД plan basic-256mb, diskSizeGB 1 (render.yaml:8-13), объём мал

**Проверка:** Файл .sha256 создан, размер записан, вторая копия существует. Оглавление читается: pg_restore --list "$PGDUMPFILE" | wc -l — непусто. ВАЖНО: --list читает только TOC в начале архива и на усечённом файле вернёт полное оглавление с exit 0 — сам по себе он усечение НЕ детектирует, реальная проверка на шаге 2

**Обратимость:** read-only, побочных эффектов нет

### 2. Проверить восстановимость дампа — на PostgreSQL РОВНО 16, с падением на первой ошибке

**Кто:** operator · **оценка:** 20 мин

Восстановить дамп в изолированный кластер PostgreSQL 16. Мажорная версия критична: capture_schema_capability кладёт в хэшируемый документ "postgresMajor": server_version_num // 10000 (app/platform_release.py:341-343, 355-358), прод объявлен как postgresMajorVersion "16" (render.yaml:13), эталон кандидата снимается CI на образе postgres:16. Локальный Homebrew-кластер легко окажется PG17 и сделает всю сверку шага 10 бессмысленной. Восстанавливать ОБЯЗАТЕЛЬНО с --exit-on-error: по умолчанию pg_restore продолжает после ошибок и завершается успешно, печатая лишь "errors ignored on restore: N", а проверка одной строки alembic_version пройдёт, даже если десятки таблиц не восстановились.

```bash
docker run -d --name r1a-pg16 -e POSTGRES_PASSWORD=r1a -p 55432:5432 postgres:16
export RESTORE_URL=postgresql://postgres:r1a@127.0.0.1:55432/swipe_restore_check
psql postgresql://postgres:r1a@127.0.0.1:55432/postgres -c 'CREATE DATABASE swipe_restore_check;'
pg_restore --exit-on-error --no-owner --no-privileges --dbname="$RESTORE_URL" "$PGDUMPFILE"
psql "$RESTORE_URL" -Atc "show server_version_num;"
psql "$RESTORE_URL" -Atc "select version_num from alembic_version;"
psql "$RESTORE_URL" -Atc "select count(*) from information_schema.tables where table_schema='public';"
psql "$RESTORE_URL" -Atc "select pg_size_pretty(pg_database_size(current_database()));"
```

**Предусловие:** Шаг 1 выполнен, sha256 дампа записан

**Проверка:** pg_restore завершился с кодом 0 (без --exit-on-error код 0 ничего не доказывает); server_version_num начинается с 16; version_num печатает РОВНО 0070_published_test_delivery (сравнение в preDeploy строгое по строке, app/platform_release.py:1016); число таблиц public и размер БД сверены с продовым снимком шага 4 в разумном допуске

**Обратимость:** docker rm -f r1a-pg16

### 3. Репетиция миграции 0070→0073 на восстановленной PG16-копии

**Кто:** agent · **оценка:** 15 мин

Прогнать реальную цепочку 0071→0072→0073 против РЕАЛЬНЫХ данных: CI гоняет их только на пустой базе. Разрушительных операций по существующим объектам нет — только CREATE; единственный DML — вставка одной строки в mission_runtime (0071:385); единственный замок на существующем объекте — FK mission_contributions.user_id → users.id, дающий SHARE ROW EXCLUSIVE на users. Вся цепочка идёт одной транзакцией (migrations/env.py:34-42, CONCURRENTLY/autocommit_block отсутствуют). Замерить фактическое время — это единственная опора для оценки шага 18.

```bash
cd /tmp/r1a-master && time DATABASE_URL="$RESTORE_URL" "/Users/gleb/My projects/p4g-platform-workspace/swipe-backend/.venv/bin/python" -m alembic upgrade 0073_platform_release_receipts && DATABASE_URL="$RESTORE_URL" "/Users/gleb/My projects/p4g-platform-workspace/swipe-backend/.venv/bin/python" -m alembic current
```

**Предусловие:** Шаг 2; команды запускаются ТОЛЬКО из /tmp/r1a-master (см. шаг 0), интерпретатор — из .venv, системный python не имеет зависимостей (ModuleNotFoundError: pydantic / rfc8785)

**Проверка:** alembic current → 0073_platform_release_receipts; зафиксировано фактическое время выполнения

**Обратимость:** копия одноразовая, прод не затронут

### 4. Read-only факт-снимок прода: ревизия, расширения, размер, объём таблиц

**Кто:** operator · **оценка:** 10 мин

Зафиксировать точное содержимое alembic_version, список расширений (главный источник будущего predeploy_capability_mismatch — эталон снят на чистой postgres:16, а прод мигрировал инкрементально с 0001) и объёмные показатели для сверки дампа из шага 2.

```bash
psql "$PROD_EXTERNAL_URL" -Atc "select version_num from alembic_version;"
psql "$PROD_EXTERNAL_URL" -Atc "select extname from pg_extension order by 1;"
psql "$PROD_EXTERNAL_URL" -Atc "select count(*) from information_schema.tables where table_schema='public';"
psql "$PROD_EXTERNAL_URL" -Atc "select pg_size_pretty(pg_database_size(current_database()));"
```

**Предусловие:** Есть внешний доступ из шага 1

**Проверка:** version_num == 0070_published_test_delivery буква в букву; список расширений и объёмы сохранены в файл рядом с дампом и СВЕРЕНЫ с выводом шага 2

**Обратимость:** read-only

### 5. Зафиксировать PITR-точку и подтвердить доступность окна восстановления

**Кто:** operator · **оценка:** 15 мин

Вторая сеть безопасности, которую исходный план игнорировал. По официальному контракту Render (зафиксирован в platform-reliability-r1-operator-runbook.md:126-128) point-in-time recovery создаёт ОТДЕЛЬНУЮ базу, не переключает source и копирует allowlist; restore point должен быть старше текущего времени минимум на 10 минут. Готовая процедура именно для этой продовой БД описана в §5 «Isolated PITR restore-drill — OPERATOR GATE E» (там же, строки 513-570), включая server-owned anchor и критерии валидации. Здесь достаточно read-only части: подтвердить в Dashboard, что PITR-окно на плане basic-256mb доступно, и записать server-clock точку. Внимание: recovery создаёт новый ОПЛАЧИВАЕМЫЙ database service — это отдельное решение, но знать заранее, что рычаг есть, обязательно.

```bash
psql "$PROD_EXTERNAL_URL" -Atc "select now();"   # server-clock anchor, записать рядом с дампом
```

**Предусловие:** Шаг 4

**Проверка:** В Render Dashboard для swipe-db виден доступный диапазон PITR; anchor-время записано

**Обратимость:** read-only, никакого recovery не запускается

### 6. ОПЕРАТОРСКИЙ АКТ. Влить PR #53 — фикс PYTHONPATH в LKG-смоуке (ПЕРЕД окном C0)

**Кто:** operator · **оценка:** 10 мин

Диф — ровно одна строка `-e PYTHONPATH=/app` в docker run шага «Prove exact pinned LKG against candidate-head PG16» (.github/workflows/platform-release-image.yml:251-273, в отличие от Stage 0 smoke на :335-346) плюс 4 строки в tests/test_platform_release.py. Без этого любой диспатч master воспроизведёт ImportError: cannot import name 'models' from 'app' и образ снова не опубликуется. ПОРЯДОК ИЗМЕНЁН относительно исходного плана: #53 мержится ДО заморозки и до окна C0. Утверждение исходного рунбука о конфликте с PR #54 из-за общего tests/test_platform_release.py не подтверждается — оба PR сейчас MERGEABLE/CLEAN, диффы не пересекаются по строкам (#53 правит workflow и тело существующего теста, #54 добавляет render.yaml, Dockerfile.bake, deploy/…freeze.v1.json и отдельный тест-страж). Ранний мерж разрывает зависимость публикации образа от исхода необратимого окна.

```bash
gh pr ready 53 --repo Glera/swipe-backend && gh pr merge 53 --repo Glera/swipe-backend --merge
```

**Предусловие:** Свежий операторский GO; PR #53 = 223ab97cf6e24e0542337d2a39e1bce9529f5d00, isDraft=true, MERGEABLE/CLEAN (проверено); заголовок PR содержит «DO NOT MERGE» — это метка исходного контура, снимается этим GO

**Проверка:** git show origin/master:.github/workflows/platform-release-image.yml | shasum -a 256 → 2b18f0bc85df9ee6448adff17b207eafa0131c1a0e03425006f2df095ae15338; записать новый merge-SHA <M>; обновить worktree: cd /tmp/r1a-master && git fetch origin && git checkout origin/master

**Обратимость:** да, git revert

### 7. Перепроверить граф миграций перед диспатчем

**Кто:** agent · **оценка:** 5 мин

Убедиться, что мерж не сдвинул граф: голова 0073, предок 0072. Ветка ровно одна; при len(heads)!=1 код падает migration_heads_invalid.

```bash
cd /tmp/r1a-master && "/Users/gleb/My projects/p4g-platform-workspace/swipe-backend/.venv/bin/python" -m app.platform_release migration-fingerprint --output /tmp/fingerprint-$(date -u +%s).json && jq '{targetRevision, expectedPredecessor}' /tmp/fingerprint-*.json
```

**Предусловие:** worktree на новом master <M>; путь --output не должен существовать (_publish_no_clobber, app/platform_release.py:122-131)

**Проверка:** targetRevision=0073_platform_release_receipts, expectedPredecessor=0072_mission_ops_receipts

**Обратимость:** read-only

### 8. ОПЕРАТОРСКИЙ АКТ. Диспатч публикации образа (candidate-v4, ref = новый master)

**Кто:** operator · **оценка:** ~20 мин прогона, timeout 35 мин

Один workflow_dispatch «Platform release image» с publish=true. Пакет candidate-v3 переиспользовать НЕЛЬЗЯ: его однодиспатчевая authority израсходована упавшим прогоном 30845173288/1 (workflow_dispatch, head f2a840517956, conclusion=failure 2026-08-03T19:18:15Z), а expectedRefSha=f2a8405 и workflowSha256=95d81d36… стали ложными. Входы (кроме ref) берутся из отревьюенного пакета без изменений. lkg_kind обязан быть image — манифест с bootstrap-root отвергается и в preDeploy (candidate_lkg_not_pinned), и в координаторе. ЗАПРЕТ: не пиновать в LKG манифесты прогонов 30789817457 и 30819666007 (см. блокер) — _revision_index упадёт с compatibility_revision_unknown.

```bash
gh workflow run platform-release-image.yml --repo Glera/swipe-backend --ref master \
  -f publish=true \
  -f feed_sha=1d05bb13acfaa08ec607f3b1fc0010902a91ece6 \
  -f playables_sha=45d5dc81a73184f6ebac1f5dcb197ec0f143f872 \
  -f swipe_platform_sha=28193c34ac461235ac42c5555ea9e870fac5fed1 \
  -f code_min_revision=0072_mission_ops_receipts \
  -f code_max_revision=0073_platform_release_receipts \
  -f lkg_min_revision=0069_arrows_runtime_variant \
  -f lkg_max_revision=0073_platform_release_receipts \
  -f lkg_kind=image \
  -f lkg_build_run_id=30789375002 \
  -f lkg_image_digest=sha256:39f354d8b22a221bf5f71ed912ca57d9bd16a8f8007958709e3e97f969b5eedb \
  -f lkg_manifest_sha256=b2ddb48a4c907b82b592a430336811a6514ec8a58c3c2cd8336f7e339a2bbc88
```

**Предусловие:** master == <M> из шага 6. ОТДЕЛЬНО РЕШИТЬ И ЗАПИСАТЬ до запуска: пин feed_sha=1d05bb13 не содержит Minesweeper, а голова feed-prototype (b1a9e63) его содержит, при этом бэкенд уже несёт серверную политику серии для minesweeper-v1 (app/run_policy.py:13). Рантайм-связи нет (бэкенд не отдаёт ассеты ленты), но манифест зафиксирует провенанс ленты, отставший от факта. Либо переподтвердить 1d05bb13 как осознанно замороженный, либо обновить пины и переревьюить пакет

**Проверка:** gh run list --workflow=platform-release-image.yml --limit 1 → conclusion=success; шаг «Prove exact pinned LKG against candidate-head PG16» ЗЕЛЁНЫЙ — он не проходил зелёным НИ РАЗУ (выполняется только при workflow_dispatch+publish, CI пул-реквеста его не гоняет); артефакт platform-release-<M> создан

**Обратимость:** публикация образа в GHCR необратима, но безопасна: workflow ничего не деплоит

### 9. Забрать манифест, вычислить два значения для Render и сохранить их вне GitHub

**Кто:** agent · **оценка:** 10 мин

Скачать сайдкары прогона. Манифест НЕ коммитится в git, тегов и релизов в репозитории нет — он существует ТОЛЬКО как артефакт с retention 90 дней. Сохранить байты манифеста офлайн немедленно.

```bash
gh run download <candidate_run_id> --repo Glera/swipe-backend --pattern 'platform-release-*' --dir ~/secure/r1a/candidate
cd ~/secure/r1a/candidate
shasum -a 256 platform-release-manifest.v1.json          # -> PLATFORM_RELEASE_MANIFEST_SHA256
base64 -i platform-release-manifest.v1.json | tr -d '\n' # -> PLATFORM_RELEASE_MANIFEST_B64
jq '{pred: .database.expectedPredecessor, target: .database.targetRevision, capSha: .database.schemaCapabilitySha256, lkg: .lastKnownGood.kind, img: .image.digest}' platform-release-manifest.v1.json
```

**Предусловие:** Шаг 8 успешен

**Проверка:** sha256 совпадает с полем sha256 в manifest-summary.json; expectedPredecessor=0072_mission_ops_receipts, targetRevision=0073_platform_release_receipts, lastKnownGood.kind=image

**Обратимость:** read-only

### 10. ТОЧНАЯ сверка schema-capability на PG16-копии против манифеста (единственная действительная форма)

**Кто:** agent · **оценка:** 30 мин

Исходный план предлагал diff снимка прода-на-0070 против эталона кандидата — это шум, а не сигнал: capture_schema_capability штампует в документ migrationGraphSha256 из ЛОКАЛЬНОГО чекаута и revision из БД (app/platform_release.py:329-331, 355-358), поэтому снимок 0070 заведомо не совпадёт. Действительная проверка одна: снять capability с восстановленной PG16-копии ПОСЛЕ upgrade до 0073 (шаг 3) и сравнить её sha256 с database.schemaCapabilitySha256 манифеста. Это единственный способ поймать predeploy_capability_mismatch ЗАРАНЕЕ: в проде он срабатывает уже ПОСЛЕ выполненного alembic upgrade (порядок в app/platform_release.py — сначала :1018 upgrade, потом :1027-1033 сравнение) и оставляет БД на 0073 со старым кодом и провалившимся деплоем. Опасение про данные не подтверждается: секция sequences читает только start/min/max/increment/cycle/cache без last_value, все секции читают лишь каталог — реальный источник расхождения это extensions и объекты не из миграций.

```bash
cd /tmp/r1a-master && DATABASE_URL="$RESTORE_URL" "/Users/gleb/My projects/p4g-platform-workspace/swipe-backend/.venv/bin/python" -m app.platform_release schema-capability --output /tmp/copy-capability-0073.json
jq -r '.database.schemaCapabilitySha256' ~/secure/r1a/candidate/platform-release-manifest.v1.json
```

**Предусловие:** Шаги 3 (копия на 0073), 9 (манифест на руках); копия ОБЯЗАТЕЛЬНО PostgreSQL 16, иначе postgresMajor разойдётся и результат недействителен; /tmp/copy-capability-0073.json не должен существовать

**Проверка:** Напечатанный командой sha256 РАВЕН .database.schemaCapabilitySha256 манифеста. При расхождении — диффить только секции columns/constraints/indexes/triggers/functions/extensions и НЕ идти на шаг 18 до объяснения расхождения

**Обратимость:** read-only

### 11. Read-only инвентарь Render перед окном C0

**Кто:** operator · **оценка:** 20 мин

Снять provider-capture (только GET) по продовым идентити (scripts/platform-release-coordinator.py:46-63). Обязателен PYTHONPATH: скрипт делает `from app.platform_release import …` и `from app.render_release_client import …` (строки 16-17), но при прямом запуске файла sys.path[0] = <repo>/scripts, поэтому пакет app не находится — падает на импорте до единого HTTP-запроса. Собственный cutover-workflow репозитория именно поэтому выставляет `PYTHONPATH: .` (.github/workflows/platform-release-cutover.yml:162). Отдельно подтвердить, что Blueprint Auto Sync = No и autoDeploy выключен у web и обоих cron: на задеплоенном 09fa0cd render.yaml не объявляет autoDeployTrigger, так что дефолт Render мог оставить автодеплой включённым.

```bash
cd /tmp/r1a-master && PYTHONPATH=. "/Users/gleb/My projects/p4g-platform-workspace/swipe-backend/.venv/bin/python" scripts/platform-release-provider-capture.py --blueprint-id exs-d95qo3q8qa3s73ea23p0 --web-service-id srv-d95r3bfavr4c73aqsi4g --sequencing-cron-id crn-d9kej0u1egvs73engu7g --materialize-cron-id crn-d9e6vmtaeets73ai8cj0 --output ~/secure/r1a/platform-release-provider-capture.v1.json
```

**Предусловие:** Render API key с правом чтения в RENDER_API_KEY; ключ вводит оператор сам, не логировать. Файл --output не должен существовать

**Проверка:** status=PASS, mergeSafe=true; у всех трёх сервисов autoDeploy=false и dockerfilePath=./Dockerfile.bake (принимаются только ./Dockerfile и ./Dockerfile.bake, provider-capture.py:24); blueprint.autoSync=false. ВНИМАНИЕ: квитанция по Blueprint содержит ровно {autoSync, id} (строки 172-173) — sourceSha, env-переменные, plan, schedule и preDeployCommand она НЕ отдаёт, поэтому шаги 12 и 14 обязательны отдельно

**Обратимость:** read-only

### 12. ОПЕРАТОРСКИЙ АКТ (P1, ранее отсутствовал). Выгрузить ЗНАЧЕНИЯ env всех трёх сервисов офлайн — до любого касания Blueprint

**Кто:** operator · **оценка:** 30 мин

В плане не было ни одного шага, сохраняющего значения env перед терминальным удалением Blueprint, а оба инструмента структурно неспособны это сделать: provider-capture собирает по сервису ровно {autoDeploy, branch, dockerfilePath, id, name, role, type} (строки 111-122); компаратор Gate C0 сравнивает только ИМЕНА ключей (compare.mjs:212-225) и ПРЯМО ЗАПРЕЩАЕТ захват значений — `if (booleanValue(value.secretsCaptured…)) fail(…must be false)` (:481-482). Значит relink, сохранивший имена, но потерявший или перегенерировавший значения, всё равно даст boundedReplacementConsistent=true. Формулировка «восстановить вручную» ложна как минимум для двух ключей: ISLAND_MANIFEST_TOKEN_KEY объявлен generateValue:true (render.yaml:202-204) — источника вне Render не существует, а комментарий в самом render.yaml запрещает его ротацию между initial capture и T+24h верификацией, то есть потеря = навсегда непроверяемое keyed Stage 0 evidence; GITHUB_TOKEN объявлен sync:false (09fa0cd:render.yaml:261-262) и является PAT с правом push в Glera/swipe-ugc. Также только в Render существуют ISLAND_ARTIFACT_S3_ACCESS_KEY_ID/SECRET_ACCESS_KEY, BOT_TOKEN, ANTHROPIC_API_KEY, STATS_BASIC_AUTH и остальные из 23 ключей sync:false. Выгрузить значения через Dashboard → Environment каждого из трёх сервисов (или GET /v1/services/{id}/env-vars), положить в офлайн-хранилище ВНЕ репозитория и ВНЕ GitHub, посчитать sha256 файла. Этот файл НЕ добавляется в C0-evidence — там secretsCaptured обязан быть false; это отдельный операторский артефакт.

**Предусловие:** Шаг 11. Отдельно и явно: без сохранённого ISLAND_MANIFEST_TOKEN_KEY окно C0 не открывать

**Проверка:** Файл содержит все ключи всех трёх сервисов, включая ISLAND_MANIFEST_TOKEN_KEY и GITHUB_TOKEN; sha256 файла записан; файл лежит вне git-дерева и не попал в историю shell

**Обратимость:** read-only по отношению к Render; сам артефакт хранится офлайн

### 13. ОПЕРАТОРСКИЙ АКТ. Влить backend PR #54 — заморозка Gate C0

**Кто:** operator · **оценка:** 10 мин

Заморозка возвращает render.yaml байт-в-байт к живому контракту 7b41e96 (dockerfilePath ./Dockerfile.bake у всех трёх сервисов, без preDeployCommand и PLATFORM_*, с UGC_REPO_*/GITHUB_TOKEN) и добавляет fail-closed sentinel Dockerfile.bake, печатающий 'Gate C0 relink-only freeze forbids deployment' и выходящий с кодом 78. autoDeployTrigger "off" сохраняется у всех трёх сервисов.

```bash
gh pr ready 54 --repo Glera/swipe-backend && gh pr merge 54 --repo Glera/swipe-backend --merge
```

**Предусловие:** Свежий операторский GO; шаги 11-12 закрыты (env-значения сохранены офлайн); meta PR #56 смержен (1ed6026, схема evidence v3); PR #54 = dd250d08cfd65723532fd0f59d63064e88c38a24, MERGEABLE/CLEAN (проверено)

**Проверка:** git show origin/master:render.yaml | shasum -a 256 → d661199516dae5290e2bdc7399153bf95415cff10f29c310ccb5066b9a5c690f (= liveRenderSha256); из /tmp/r1a-master: pytest -q tests/test_platform_release.py зелёный (test_compact_image_or_exact_gate_c0_freeze_is_fail_closed). Записать merge-SHA <F> — он же будет head master в окне C0

**Обратимость:** да, но ТОЛЬКО целым коммитом: любая частичная комбинация валит тест-страж (откатили render.yaml без манифеста → падает sha256-сверка; удалили только sentinel → падает assert exists; удалили только манифест → падает assert not Dockerfile.bake.exists())

### 14. P1-ГЕЙТ ПЕРЕД НЕОБРАТИМЫМ ДЕЙСТВИЕМ. Глазами прочитать source-SHA старого Blueprint. NO-GO при неравенстве

**Кто:** operator · **оценка:** 15 мин

Компаратор требует БУКВАЛЬНОГО равенства before.blueprint.sourceSha === after.blueprint.sourceSha, иначе differences=['sourceSha'], boundedReplacementConsistent=false и exit 2 (scripts/platform-reliability-r1-blueprint-replacement-compare.mjs:649-651, :805-807; поле обязательно и валидируется как полный 40-hex, :320-332). Старый Blueprint синхронизирован 2026-07-30T15:09:14Z, syncStatus='paused'; синхронизированный им коммит — 7b41e96 (git show 7b41e96:render.yaml | shasum -a 256 == d661199…c690f == liveRenderSha256 из deploy/platform-reliability-r1-gate-c0-freeze.v1.json). Мерж шага 13 сдвинул master на новый merge-коммит <F>. Если Render показывает sourceSha старого Blueprint как ПОСЛЕДНИЙ СИНХРОНИЗИРОВАННЫЙ коммит (7b41e96), а нового — как head ветки (<F>), равенство недостижимо в принципе: это commit id, а не байты render.yaml, которые заморозка как раз и восстанавливает. Провести проверку СЕЙЧАС, потому что по контракту (platform-reliability-r1-gate-c-contract.md:162-179) удаление Blueprint — пункт 3, а сбор after-наблюдения и запуск компаратора — пункты 8-9, то есть проверка равенства физически происходит уже ПОСЛЕ необратимого удаления. Список стоп-условий контракта («невозможность показать Preview, рестарт web, runnable cron, истечение 900 с») этого случая не покрывает. provider-capture тут не помощник: sourceSha в его квитанции нет.

**Предусловие:** Шаг 13; master == <F>

**Проверка:** Отображаемый в Dashboard source-SHA старого Blueprint exs-d95qo3q8qa3s73ea23p0 РАВЕН текущему head master <F> (сверять полный SHA, Dashboard показывает 7 символов — раскрыть). ЕСЛИ НЕ РАВЕН — Blueprint НЕ УДАЛЯТЬ, окно C0 не открывать: доказательство C0 в текущей схеме компаратора недостижимо, и решение об ослаблении компаратора/контракта принимается ДО окна, а не после необратимого удаления

**Обратимость:** read-only; это и есть точка невозврата, которую он защищает

### 15. ОПЕРАТОРСКИЙ АКТ. Окно Gate C0: relink Blueprint вручную в Render + свежий дамп внутри окна

**Кто:** operator · **оценка:** окно 45-60 мин, активная фаза ≤15 мин

По контракту platform-reliability-r1-gate-c-contract.md:152-179: (1) приостановить оба cron — swipe-seq-shadow-run '15 * * * *' и swipe-c1-materialize '30 2 * * *'; (2) ПОСЛЕ приостановки, когда база перестала принимать записи от cron, снять СВЕЖИЙ ДАМП №2 (дамп шага 1 к этому моменту устарел на несколько операторских окон, а cron всё это время писали в append-only журналы; при потере базы на удалении Blueprint восстановление из baseline молча потеряло бы всё, что записано между ними) и зафиксировать DB-clock; (3) зафиксировать старт и hard deadline ≤900 с; (4) снять v3 before-observation (web live/running, оба cron suspended, отсутствие рестарта web, provider_confirmed_…); (5) удалить ТОЛЬКО старый Blueprint exs-d95qo3q8qa3s73ea23p0; (6) доказать его отсутствие при сохранённых service ID; (7) создать новый Blueprint из того же repo/branch/render.yaml; новый Sync Hook не читать; (8) ДО финального create/apply осмотреть Preview — он обязан relink'нуть существующие service ID и не менять plan/storage/schedule/command/source и не включать commit-триггеры; (9) записать новый Blueprint ID, точный source SHA, Auto Sync = No; (10) снять after-observation до дедлайна при всё ещё suspended cron. Cron в C0 НЕ возобновлять. Инструмента нет — всё руками в Dashboard.

```bash
# внутри окна, сразу после приостановки обоих cron:
export PGDUMPFILE2="$HOME/secure/r1a/swipe-prod-preC0-$(date -u +%Y%m%dT%H%M%SZ).dump"
pg_dump --format=custom --no-owner --no-privileges --file="$PGDUMPFILE2" "$PROD_EXTERNAL_URL" && shasum -a 256 "$PGDUMPFILE2" | tee "$PGDUMPFILE2.sha256"
psql "$PROD_EXTERNAL_URL" -Atc "select now();"   # PITR anchor внутри окна
```

**Предусловие:** Шаг 14 дал GO (sourceSha совпадает); шаг 12 (env-значения офлайн, включая ISLAND_MANIFEST_TOKEN_KEY) закрыт; свежий GO именно на окно C0; capability-preflight закоммичен (platform-reliability-r1-gate-c-capability-comparison.json, sha256 73cd60e8…); master НЕ двигать между двумя observation

**Проверка:** Обе observation сняты, service ID не изменились, web не рестартовал (webRestartObserved обязан быть false), уложились в 900 с, дамп №2 снят и хэширован

**Обратимость:** НЕТ: старый Blueprint удаляется терминально. Стоп-условия: невозможность показать Preview, рестарт web, runnable cron, истечение 900 с. Blueprint deletion alone остаётся containment

### 16. Собрать доказательство C0 компаратором

**Кто:** agent · **оценка:** 10 мин

Прогнать компаратор и отдельно перепроверить его же вывод через --verify-json (разрешены ровно 4 опции: --before, --after, --support, --verify-json).

```bash
cd "/Users/gleb/My projects/p4g-platform-workspace" && node scripts/platform-reliability-r1-blueprint-replacement-compare.mjs --before platform-reliability-r1-gate-c0-blueprint-before.json --after platform-reliability-r1-gate-c0-blueprint-after.json --support platform-reliability-r1-gate-c-render-support-response.json > platform-reliability-r1-gate-c0-blueprint-comparison.json && node scripts/platform-reliability-r1-blueprint-replacement-compare.mjs --before platform-reliability-r1-gate-c0-blueprint-before.json --after platform-reliability-r1-gate-c0-blueprint-after.json --support platform-reliability-r1-gate-c-render-support-response.json --verify-json platform-reliability-r1-gate-c0-blueprint-comparison.json
```

**Предусловие:** Локальный meta-чекаут подтянут до origin/master — сейчас HEAD 5e76b67 отстаёт, а самого файла scripts/platform-reliability-r1-blueprint-replacement-compare.mjs в рабочем дереве НЕТ (он есть только в origin/master). Сначала git fetch && git pull

**Проверка:** boundedReplacementConsistent=true, exit 0 (при false компаратор завершается кодом 2); evidenceClass=operator_attested

**Обратимость:** read-only, генерирует файл доказательства

### 17. ОПЕРАТОРСКИЙ АКТ. Откатить заморозку целиком

**Кто:** operator · **оценка:** 10 мин

git revert -m 1 <sha merge-коммита PR #54> и push. ТОЛЬКО целиком: частичный откат валит тест-страж в любой комбинации.

```bash
cd /tmp/r1a-master && git revert -m 1 <merge-sha-PR54> && git push origin HEAD:master
```

**Предусловие:** Шаг 16 дал PASS; after-observation уже снята и сохранена

**Проверка:** git show origin/master:render.yaml | shasum -a 256 → 6482cb71792fe4f3e7f9e5881c9bc75d5378eeed80e81705825bba70a54e282b; pytest -q tests/test_platform_release.py зелёный (else-ветка)

**Обратимость:** да

### 18. ОПЕРАТОРСКИЙ АКТ. Дамп №3 и ручное доведение прод-БД 0070 → 0072 (обход predeploy_state_rejected)

**Кто:** operator · **оценка:** 20-40 мин

app/platform_release.py:1016-1023 допускает ровно два before-состояния — expectedPredecessor (0072_mission_ops_receipts) или targetRevision (0073), иначе _fail('predeploy_state_rejected'); одношаговый 0070→0073 через preDeploy невозможен. Единственный способ без правки кода — применить 0071+0072 вручную (одна транзакция). Выполнять НЕПОСРЕДСТВЕННО перед шагами 19-20: как только БД уйдёт с 0070, живой деплой 09fa0cd не переживёт рестарт — его scripts/start-bake-runtime.sh:77 делает alembic upgrade head под set -euo pipefail, а его набор миграций заканчивается на 0070. ОБЯЗАТЕЛЬНО задать таймауты: ни alembic.ini на origin/master, ни migrations/env.py не выставляют lock_timeout/statement_timeout, а внутри транзакции создаётся FK mission_contributions.user_id → users.id, берущий SHARE ROW EXCLUSIVE на живую таблицу users, пока прод продолжает обслуживать трафик — без таймаута миграция будет ждать неограниченно и задержит записи в users. Fail-fast лучше висящей блокировки: транзакция одна, откат чистый. Перед запуском снять дамп №3 и PITR anchor.

```bash
export PGDUMPFILE3="$HOME/secure/r1a/swipe-prod-preMigrate-$(date -u +%Y%m%dT%H%M%SZ).dump"
pg_dump --format=custom --no-owner --no-privileges --file="$PGDUMPFILE3" "$PROD_EXTERNAL_URL" && shasum -a 256 "$PGDUMPFILE3" | tee "$PGDUMPFILE3.sha256"
psql "$PROD_EXTERNAL_URL" -Atc "select now();"
cd /tmp/r1a-master && PGOPTIONS='-c lock_timeout=5s -c statement_timeout=600s' DATABASE_URL="$PROD_EXTERNAL_URL" "/Users/gleb/My projects/p4g-platform-workspace/swipe-backend/.venv/bin/python" -m alembic upgrade 0072_mission_ops_receipts
```

**Предусловие:** Дамп №3 снят и хэширован; репетиция шага 3 прошла и дала фактическое время; сверка capability шага 10 дала совпадение; образ и манифест уже существуют (шаги 8-9); worktree на master после revert (шаг 17)

**Проверка:** DATABASE_URL="$PROD_EXTERNAL_URL" … -m alembic current → 0072_mission_ops_receipts

**Обратимость:** Пока журналы mission_* пусты — downgrade возможен (0071:676-696 и 0072:81-93 отказывают только при непустых журналах). После первой квитанции релиза (шаг 20) штатный откат схемы закрывается: 0073 downgrade RAISE EXCEPTION при непустой platform_release_receipts (0073:88-99)

### 19. ОПЕРАТОРСКИЙ АКТ. Перевести web-сервис на image-runtime и проставить ключи PLATFORM_*

**Кто:** operator · **оценка:** 30-45 мин

Автоматический путь ограниченно доступен: scripts/platform-release-coordinator.py:47-48 жёстко пинит _PRODUCTION_BLUEPRINT_ID='exs-d95qo3q8qa3s73ea23p0', который relink гарантированно сменит → _fail('production_target_identity_invalid') на _validate_authority_scope (:98-127). Но это ОДНА константа: остальные три идентити (srv-d95r3bfavr4c73aqsi4g, owner tea-d1m4lmali9vc73euvelg, database identity 'swipe-production') relink переживают, а blueprint_id используется координатором только для GET /blueprints/{id} и проверки autoSync is False (:424-427). Координатор — обычный скрипт, читающий RENDER_API_KEY из окружения; GitHub-окружение production нужно только workflow'у platform-release-cutover.yml, не самому скрипту. ВАРИАНТ A (предпочтительный): поправить константу _PRODUCTION_BLUEPRINT_ID (+ вхождение в _KNOWN_PRODUCTION_RENDER_IDS + тест) на новый exs-id и запустить координатор локально командой ниже — это возвращает CAS-проверку текущего live-деплоя, компенсирующий откат env при ошибке, верификационный one-off job и квитанцию с fromDeployId/toDeployId. ВАРИАНТ B (ручной, без квитанции): в Render UI выставить на сервисе imagePath ghcr.io/glera/swipe-backend@sha256:<digest кандидата> с registry credential rgc-d9np7tajnfac73bi5ib0, preDeployCommand `python -m app.platform_release predeploy-env`, healthCheckPath /api/health и env: PLATFORM_DATABASE_IDENTITY=swipe-production, PLATFORM_DEPLOY_IDENTITY=<новая уникальная строка ^[A-Za-z0-9][A-Za-z0-9._:/-]{0,159}$>, PLATFORM_RELEASE_MANIFEST_B64 и PLATFORM_RELEASE_MANIFEST_SHA256 из шага 9 (PLATFORM_RELEASE_OPERATION можно не задавать — дефолт 'deploy'). ЗАФИКСИРОВАТЬ: значения PLATFORM_DEPLOY_IDENTITY и обеих PLATFORM_RELEASE_MANIFEST_* НЕ менять до успешного verify-applied-db шага 20 — verify_applied_db ищет квитанцию по ТОЧНОМУ PLATFORM_DEPLOY_IDENTITY (_stored_receipt, app/platform_release.py:1225-1240) и без него падает applied_receipt_missing, а манифест сверяет по _sha256(manifest_raw). ВАРИАНТ C (attended Blueprint sync master) не рекомендуется: у master и живого контракта различается НАБОР ключей — в 09fa0cd объявлены GITHUB_TOKEN (sync:false, PAT с push в Glera/swipe-ugc), UGC_REPO_PATH, UGC_REPO_URL, которых в origin/master:render.yaml нет вовсе; поведение Render при удалении ключа из render.yaml репозиторием не установлено, плюс по документации sync обновит DATABASE_URL до нового default credential.

```bash
# Вариант A, после правки константы:
cd /tmp/r1a-master && PYTHONPATH=. RENDER_API_KEY=… RENDER_OWNER_ID=tea-d1m4lmali9vc73euvelg RENDER_REGISTRY_CREDENTIAL_ID=rgc-d9np7tajnfac73bi5ib0 PLATFORM_DATABASE_IDENTITY=swipe-production "/Users/gleb/My projects/p4g-platform-workspace/swipe-backend/.venv/bin/python" scripts/platform-release-coordinator.py --operation prepare-source --authority-scope production --manifest ~/secure/r1a/candidate/platform-release-manifest.v1.json --expected-manifest-sha256 <sha256 из шага 9> --service-id srv-d95r3bfavr4c73aqsi4g --blueprint-id <новый exs из шага 15> --expected-current-deploy dep-… --deploy-identity <PLATFORM_DEPLOY_IDENTITY> --output ~/secure/r1a/prepare-source-receipt.json
```

**Предусловие:** Шаг 18 (БД на 0072); новый Blueprint из шага 15 с Auto Sync = No; проверить, что ISLAND_MANIFEST_TOKEN_KEY и 23 ключа sync:false сохранились на сервисе после relink — если нет, восстановить из офлайн-выгрузки шага 12. Без DEV_USER_IDS (при ENABLE_AGENTS_M2M_READ=true) и без всех трёх FEED_EFFECTFUL_*_CONFIG_VERSION (при ENABLE_FEED_EFFECTFUL_AUTHORITY=true) Settings бросает ValueError и сервис не стартует (app/config.py:485-500, 598-604)

**Проверка:** runtime сервиса стал image; preDeployCommand и healthCheckPath видны в конфиге; все четыре PLATFORM_*-ключа заданы; при варианте A — квитанция prepare-source создана

**Обратимость:** да, PATCH обратим; трафик пока на старом деплое

### 20. Деплой, preDeploy-миграция и проверка результата

**Кто:** render · **оценка:** 30-45 мин

Render выполнит preDeployCommand: _manifest_from_env проверит PLATFORM_RELEASE_MANIFEST_B64/SHA256, пересверит манифест с локальным графом миграций образа, sha256 /app/deploy/platform-release-profile.v1.json и /app/platform-backend-sha; возьмёт advisory-lock pg_try_advisory_lock(20260730,1); увидит before=0072_mission_ops_receipts (mode=predecessor_to_target); выполнит alembic upgrade 0073; пересверит schema-capability и запишет append-only квитанцию в platform_release_receipts. ОЖИДАЕМЫЕ, НЕ РЕГРЕССЫ: (а) поле health island.bake_runtime перейдёт из {"state":"ready"} в {"state":"local"} — ISLAND_BAKE_READY_FILE не объявлен в render.yaml ни на 09fa0cd, ни на master, а в новом образе нет bake-тулчейна; island_bake_ready_file="" → bake_runtime_status() всегда возвращает "local" (app/api_island.py:47-51), а раннер работает только при state=="ready" (:689) — то есть island-генерация (P4 bake/theme) на этом образе физически неисполнима, и обратное включение ENABLE_ISLAND_GENERATION_RUNNERS=true БОЛЬШЕ НЕ ЯВЛЯЕТСЯ откатом: задачи будут копиться в очереди молча; (б) из прод-образа исчезают node/npm/git/playwright (deploy/platform-release-profile.v1.json: excludedRuntimeCapabilities), поэтому runtime_release_bootstrap (shutil.which("node")) и island_artifact_migration (subprocess git) в проде больше не запускаются — активация нового runtime-релиза candidate→active из прод-контейнера невозможна.

```bash
# preDeployCommand внутри контейнера (render.yaml:26-27):
python -m app.platform_release predeploy-env
# после того как деплой стал live — one-off job НА ТОМ ЖЕ сервисе, чтобы унаследовать PLATFORM_DEPLOY_IDENTITY и PLATFORM_RELEASE_MANIFEST_*:
python -m app.platform_release verify-applied-db
```

**Предусловие:** Шаг 19; PLATFORM_DEPLOY_IDENTITY и оба PLATFORM_RELEASE_MANIFEST_* не менялись с момента preDeploy

**Проверка:** Лог preDeploy: mode=predecessor_to_target, ревизия 0073_platform_release_receipts, без predeploy_capability_mismatch; verify-applied-db печатает status=PASS; curl /api/health отвечает; лента открывается на устройстве

**Обратимость:** Штатный rollback контракта (app/platform_release.py:1110-1119) НЕ делает downgrade — это «старый образ на новой схеме». Откат схемы 0073→0072 после квитанции требует ручной операции: append-only триггер tr_platform_release_receipts_append_only объявлен BEFORE UPDATE OR DELETE … FOR EACH ROW и на TRUNCATE не срабатывает (строковые триггеры не реагируют на TRUNCATE; statement-level BEFORE TRUNCATE в миграции нет), поэтому владелец таблицы может выполнить TRUNCATE platform_release_receipts и затем штатный alembic downgrade 0072_mission_ops_receipts. Это не рекомендуемый путь, а факт: сети безопасности три — PITR (быстро, не трогает source), дампы №1/№2/№3, и TRUNCATE+downgrade

### 21. ОПЕРАТОРСКИЙ АКТ. Разморозить cron — но только после доказательства сборки из ./Dockerfile

**Кто:** operator · **оценка:** 30-60 мин

Оба cron после relink продолжают хранить dockerfilePath ./Dockerfile.bake, которого на master нет (удалён 74a9c44) — их следующий деплой не соберётся. По чеклисту R1-A (docs/specs/platform-release-r1a.md:118-122) это attended точечное обновление, меняющее ТОЛЬКО этот путь на ./Dockerfile, с before/after квитанцией; протаскивать изменение Blueprint-синком контракт запрещает. НО перед этим доказать непроверенное поведение провайдера: новый Dockerfile принимает сборку только если PLATFORM_BACKEND_SHA — lowercase hex длиной 40..64 (Dockerfile:38-45, иначе exit 2), а для cron это значение берётся исключительно из ARG PLATFORM_BACKEND_SHA=${RENDER_GIT_COMMIT} (Dockerfile:15-19), то есть Render ОБЯЗАН превратить свою default-переменную RENDER_GIT_COMMIT в docker build arg. Единственное подтверждение этого — комментарий, написанный тем же PR; ни теста, ни капчуры, ни успешной сборки cron из ./Dockerfile в репозитории нет, а Dockerfile.bake удалён, поэтому вернуть cron на прежний путь без правки кода уже нельзя. Проверить на одноразовом сервисе либо явно задать PLATFORM_BACKEND_SHA в envVars каждого cron. ДЕДЛАЙН РАЗМОРОЗКИ: swipe-c1-materialize материализует settled-окна в пределах C1_MATERIALIZE_SCHEDULER_LOOKBACK_DAYS=14 (render.yaml:403-406, app/config.py:144). Если между последним успешным прогоном и разморозкой пройдёт больше 14 суток, окна старше lookback не будут материализованы НИКОГДА — тихая потеря demand-аналитики, невидимая ни в одной верификации. Workaround «оставить cron suspended» имеет срок годности.

**Предусловие:** Шаг 20 успешен; comparison-файл шага 16 сохранён (после смены пути повторный C0 невозможен — компаратор пинит dockerfilePath к './Dockerfile.bake'); поведение RENDER_GIT_COMMIT→build arg доказано

**Проверка:** provider-capture показывает ./Dockerfile у crn-d9kej0u1egvs73engu7g и crn-d9e6vmtaeets73ai8cj0; ближайший прогон swipe-seq-shadow-run ('15 * * * *') собрался и завершился успешно. СТОП-УСЛОВИЕ: если сборка cron падает на проверке hex — cron остаются suspended, починка идёт отдельным код-коммитом (дефолт ARG или снятие требования), а не импровизацией. Если с последнего успешного прогона materialize прошло >14 суток — до разморозки прогнать run-once с увеличенным --lookback-days (аргумент существует: app/content_analytics.py:2319) и зафиксировать это отдельным операторским решением

**Обратимость:** да

## Блокеры

- **шаг 15** · снимает: _operator-hands (ручное чтение Dashboard) до окна; при неравенстве — решение об ослаблении компаратора/контракта = code-change + переревью_
  P1. Равенство sourceSha в Gate C0 проверяется только ПОСЛЕ необратимого удаления Blueprint. Компаратор требует буквального before.blueprint.sourceSha === after.blueprint.sourceSha (scripts/platform-reliability-r1-blueprint-replacement-compare.mjs:649-651, exit 2 при несовпадении, :805-807), контракт ставит удаление пунктом 3, а сбор after-наблюдения и запуск компаратора — пунктами 8-9 (platform-reliability-r1-gate-c-contract.md:162-179). provider-capture этот параметр не отдаёт: квитанция Blueprint = ровно {"autoSync", "id"} (scripts/platform-release-provider-capture.py:172-173). Старый Blueprint синхронизирован 2026-07-30T15:09:14Z на коммите 7b41e96, а мерж заморозки сдвигает master.
  **Обход:** Новый шаг 14: прочитать отображаемый source-SHA старого Blueprint глазами и не удалять его, если SHA не равен head master
- **шаг 15** · снимает: _operator-hands_
  P1. Значения env всех трёх сервисов нигде не сохранялись до терминального удаления Blueprint. provider-capture возвращает по сервису {autoDeploy, branch, dockerfilePath, id, name, role, type} (строки 111-122) — ни envVars, ни plan/schedule/preDeployCommand. Компаратор сравнивает только имена ключей (compare.mjs:212-225) и запрещает захват значений (secretsCaptured обязан быть false, :481-482), поэтому relink с сохранёнными именами и потерянными значениями всё равно даст PASS. ISLAND_MANIFEST_TOKEN_KEY объявлен generateValue:true (render.yaml:202-204) — источника вне Render не существует; GITHUB_TOKEN (sync:false) — PAT с push в Glera/swipe-ugc; плюс ISLAND_ARTIFACT_S3_*, BOT_TOKEN, ANTHROPIC_API_KEY, STATS_BASIC_AUTH.
  **Обход:** Новый шаг 12: офлайн-выгрузка значений env всех трёх сервисов до открытия окна; в C0-evidence этот артефакт НЕ добавляется
- **шаг 15** · снимает: _operator-hands_
  P1. Дамп из шага 1 устаревает к моменту необратимых актов. Между baseline-дампом и удалением Blueprint / ручной миграцией проходит несколько операторских окон, а cron swipe-seq-shadow-run ('15 * * * *') каждый час и swipe-c1-materialize ('30 2 * * *') ежедневно пишут в append-only журналы. Приостановка cron в исходном плане происходила уже после того, как дамп устарел.
  **Обход:** Три дампа: №1 baseline (шаг 1), №2 внутри окна C0 сразу после приостановки cron (шаг 15), №3 непосредственно перед ручной миграцией (шаг 18)
- **шаг 2** · снимает: _operator-hands_
  P1. Проверка дампа проходила на битом файле. pg_restore --list читает только TOC в начале архива и на усечённом файле выдаёт полное оглавление с exit 0. pg_restore без --exit-on-error продолжает после ошибок и завершается успешно, печатая лишь «errors ignored on restore: N», а проверка одной строки alembic_version пройдёт, даже если десятки таблиц не восстановились. Объёмные показатели прода снимались (pg_size_pretty на шаге 4) и ни с чем не сверялись.
  **Обход:** shasum -a 256 + размер рядом с дампом; pg_restore --exit-on-error; сверка числа таблиц public и pg_database_size с продовым снимком
- **шаг 18** · снимает: _agent (git worktree), без потери незакоммиченных изменений оператора_
  Рабочий чекаут swipe-backend НЕ является master и содержит другой граф миграций. git rev-parse HEAD = 6a526ac9950de650947e162ab5bd2239e1094474 (head открытого PR #25), merge-base --is-ancestor origin/master → NO, ~25 изменённых файлов включая app/models.py и app/main.py. Локальные версии: 0071_mobile_review_hardening → 0072_series_level_limit_10 → 0073_published_test_delivery; ревизий 0072_mission_ops_receipts и 0073_platform_release_receipts там нет. migrations/env.py:12-14 импортирует app.models из рабочего дерева, а шаг ручной миграции направляет alembic В ПРОД.
  **Обход:** Шаг 0: git worktree add /tmp/r1a-master origin/master; все команды репозитория — только оттуда, интерпретатор .venv/bin/python
- **шаг 8** · снимает: _operator + подготовка входов candidate-v4 (те же входы, новый ref/merge-SHA, workflowSha256 → 2b18f0bc85df9ee6448adff17b207eafa0131c1a0e03425006f2df095ae15338)_
  Пакет candidate-v3 мёртв: однодиспатчевая authority израсходована прогоном 30845173288/1 (workflow_dispatch, head f2a840517956, conclusion=failure, 2026-08-03T19:18:15Z), артефактов 0, GHCR-тега для f2a8405 нет. Предусловие пакета «нет ни одного прогона Platform release image для точного source f2a8405» нарушено необратимо; expectedRefSha=f2a8405 и workflowSha256=95d81d36… стали ложными.
  **Обход:** Диспатч с новым master после мержа PR #53
- **шаг 6** · снимает: _operator (merge; код уже написан)_
  На f2a8405 сборка образа падает физически: шаг «Prove exact pinned LKG against candidate-head PG16» делает docker run без -e PYTHONPATH=/app (.github/workflows/platform-release-image.yml:251-273, в отличие от Stage 0 smoke на :335-346) → ImportError: cannot import name 'models' from 'app'. Фикс существует только в невлитом draft-PR #53 (223ab97, MERGEABLE/CLEAN).
  **Обход:** Нет. Пока строка не в master, любой диспатч воспроизведёт ту же ошибку
- **шаг 8** · снимает: _дисциплина оператора; никакого кода не требуется_
  ЗАПРЕТ. Существуют два уже опубликованных образа с манифестами, внешне подходящими под текущий прод: прогоны 30789817457 (backend 11c9bce, image sha256:1969bd9a…, манифест 1e708f64…) и 30819666007 (backend 4714e339, image sha256:d6aae406…, манифест a0e128be…). Оба несут database.expectedPredecessor='0070_published_test_delivery', то есть деплоились бы без ручного alembic — это опасная «короткая дорога». Но их targetRevision='0071_platform_release_receipts' отсутствует в графе master (там 0071_mission_slice_core → 0072_mission_ops_receipts → 0073_platform_release_receipts), поэтому такой деплой оставит прод на ревизии, неизвестной ни alembic master, ни любому будущему манифесту, и predeploy_state_rejected станет постоянным.
  **Обход:** Не деплоить их ни при каких обстоятельствах и не пиновать как LKG (_revision_index упадёт с compatibility_revision_unknown). Единственный валидный LKG — b2ddb48a (baseline 30789375002, kind='bootstrap-root', codeCompatibility [0069,0070]), поэтому lkg_min_revision обязан быть ровно 0069_arrows_runtime_variant
- **шаг 20** · снимает: _operator-hands (ручной alembic) либо code-change (расширить допустимое before до codeCompatibility.acceptedRevisions)_
  Прод-БД на 0070_published_test_delivery, манифест master несёт expectedPredecessor=0072_mission_ops_receipts. app/platform_release.py:1016-1023 допускает ровно два before-состояния, иначе _fail('predeploy_state_rejected'). Одношаговый 0070→0073 через preDeploy невозможен.
  **Обход:** Шаг 18 с PGOPTIONS='-c lock_timeout=5s -c statement_timeout=600s'. Осознанная цена — 0071/0072 применяются вне advisory-lock и без квитанции platform_release_receipts
- **шаг 19** · снимает: _code-change (_PRODUCTION_BLUEPRINT_ID + _KNOWN_PRODUCTION_RENDER_IDS + тест) ИЛИ обход руками через Render UI_
  Автоматический cutover после relink требует правки ОДНОЙ константы, а не переписывания пути (формулировка «мёртв» была преувеличением). scripts/platform-release-coordinator.py:98-127 пинит четыре идентити, но relink меняет только exs-id: srv-d95r3bfavr4c73aqsi4g, tea-d1m4lmali9vc73euvelg и 'swipe-production' relink переживают (support-ответ: blueprintReplacementChangesExistingServices=false). blueprint_id используется только для GET /blueprints/{id} и проверки autoSync is False (:424-427). Сам координатор — обычный скрипт, читающий RENDER_API_KEY из окружения; GitHub-окружение production нужно только workflow platform-release-cutover.yml (:42), не скрипту.
  **Обход:** Вариант A шага 19: локальный запуск координатора с PYTHONPATH=. и env RENDER_API_KEY/RENDER_OWNER_ID/RENDER_REGISTRY_CREDENTIAL_ID/PLATFORM_DATABASE_IDENTITY — возвращает CAS, компенсирующий откат env, one-off верификацию и квитанцию fromDeployId/toDeployId, которые ручной путь теряет
- **шаг 19** · снимает: _github (пересоздание окружения) — требуется ТОЛЬКО при возврате к platform-release-cutover.yml_
  GitHub-окружение production было создано и УДАЛЕНО 2026-08-02 (противоречие срезов разрешено). Сейчас repos/Glera/swipe-backend/environments отдаёт ровно два окружения — 'master - swipe-backend' и 'master - swipe-db' (созданы Render 2026-07-06); при этом repos/Glera/swipe-backend/deployments содержит записи environment='production' от 2026-08-01/02 (id 5706749113 … 5711747524, ref codex/r1). Вместе с окружением исчезли его environment-scoped секрет RENDER_API_KEY и шесть vars (RENDER_SERVICE_ID/BLUEPRINT_ID/OWNER_ID/REGISTRY_CREDENTIAL_ID, PLATFORM_DATABASE_IDENTITY, PLATFORM_RELEASE_AUTHORITY_SCOPE); gh variable list пуст, gh secret list содержит только GENERATOR_DEPLOY_KEY и SWIPE_UGC_DEPLOY_KEY.
  **Обход:** Маршруту A окружение не нужно: workflow «Platform release image» его не требует, локальный координатор тоже
- **шаг 21** · снимает: _render-ui (attended обновление каждого cron) + предварительное доказательство поведения провайдера, иначе code-change (дефолт ARG или явный PLATFORM_BACKEND_SHA в envVars)_
  Оба cron хранят dockerfilePath ./Dockerfile.bake, которого на master нет (удалён 74a9c44), и вернуть их туда без правки кода уже нельзя. При этом сборка из нового ./Dockerfile для cron опирается на НЕПРОВЕРЕННОЕ поведение провайдера: PLATFORM_BACKEND_SHA обязан быть lowercase hex 40..64 (Dockerfile:38-45, иначе exit 2), а берётся исключительно из ARG PLATFORM_BACKEND_SHA=${RENDER_GIT_COMMIT} (Dockerfile:15-19) — Render обязан превратить свою default-переменную в docker build arg. Единственное подтверждение — комментарий, написанный тем же PR; ни теста, ни успешной сборки cron из ./Dockerfile в репозитории нет.
  **Обход:** Проверить на одноразовом сервисе до окна; при провале оставить cron suspended — но не дольше 14 суток от последнего успешного прогона swipe-c1-materialize (C1_MATERIALIZE_SCHEDULER_LOOKBACK_DAYS=14, render.yaml:403-406, app/config.py:144), иначе settled-окна старше lookback не будут материализованы никогда
- **шаг 9** · снимает: _operator-hands_
  Релизный манифест нигде не персистится вне GitHub-артефакта (retention 90 дней; платформа не коммитит его в git, тегов и релизов в репозитории нет). Артефакт baseline 8846489671 истекает 2026-11-01T06:11:36Z.
  **Обход:** Скачать артефакт сразу после успешного диспатча и сохранить байты манифеста офлайн
- **шаг 20** · снимает: _operator-hands (репетиция на PG16-копии)_
  predeploy_capability_mismatch срабатывает ПОСЛЕ уже выполненного alembic upgrade (порядок в app/platform_release.py: :1018 upgrade → :1027-1033 сравнение) и оставляет БД на 0073 со старым кодом. Эталон schemaCapabilitySha256 снят в CI на чистой postgres:16, прод мигрировал инкрементально с 0001. Сверка действительна ТОЛЬКО на PostgreSQL ровно 16: postgresMajor = server_version_num // 10000 входит в хэшируемый документ (app/platform_release.py:341-343, 355-358).
  **Обход:** Шаг 10: sha256 capability восстановленной PG16-копии после upgrade до 0073 против .database.schemaCapabilitySha256 манифеста. Сравнение снимка прода-на-0070 с эталоном кандидата бессмысленно — migrationGraphSha256 и revision гарантированно разойдутся
- **шаг 18** · снимает: _operator-hands (планирование окна)_
  Как только БД уйдёт с 0070, живой деплой 09fa0cd не переживёт рестарт: scripts/start-bake-runtime.sh:77 выполняет alembic upgrade head под set -euo pipefail, а его набор миграций заканчивается на 0070.
  **Обход:** Шаг 18 выполнять непосредственно перед 19-20; любой рестарт или перенос инстанса в этом окне = простой до завершения деплоя
- **шаг 8** · снимает: _operator-hands_
  Версии GHCR-пакета нельзя перечислить текущим gh-токеном (scopes: gist, read:org, repo, workflow): user/packages и users/Glera/packages отдают 403 «You need at least read:packages scope»; Glera — User, а не организация, поэтому orgs/Glera даёт 404.
  **Обход:** gh auth refresh -h github.com -s read:packages, либо считать доказательством публикации сам successful run и его сайдкары

## Остаточные риски

- Главный непокрытый риск: НЕ УСТАНОВЛЕНО, что именно Render Dashboard показывает как source-SHA у Blueprint со статусом paused — последний синхронизированный коммит (7b41e96, 2026-07-30) или head ветки. Шаг 14 превращает это в гейт, но если ответ окажется «последний синхронизированный», Gate C0 в текущей схеме компаратора недостижим В ПРИНЦИПЕ, и маршрут A придётся менять ещё раз: либо ослаблять компаратор (правка scripts/platform-reliability-r1-blueprint-replacement-compare.mjs, его тестов и текста контракта, с переревью), либо отказываться от C0-доказательства. Решение об этом должно быть принято ДО окна.
- НЕ ПОДТВЕРЖДЕНО, что Render при СОЗДАНИИ Blueprint показывает ограниченный relink-Preview и не предложит обновить DATABASE_URL до нового default credential. Условие №1 из PR #54 («Render confirms the hook apply-vs-preview behavior») не закрыто. Если apply вызовет env-refresh и рестарт web — webRestartObserved=true, и это NO-GO по контракту прямо внутри окна, когда старый Blueprint уже удалён.
- НЕ ПОДТВЕРЖДЕНО из репозитория, переживает ли managed-Postgres блок `databases: swipe-db` в render.yaml пересоздание Blueprint: relink может переиспользовать dpg-d95r32favr4c73aqs4d0-a, а может попытаться согласовать по имени. Это ровно тот ресурс, который защищается безусловно. Плюс `region:` не объявлен ни у одного ресурса — пересозданные сервисы теоретически могут оказаться в дефолтном регионе, что для same-region private URL критично.
- Даже с офлайн-выгрузкой значений (шаг 12) восстановление ISLAND_MANIFEST_TOKEN_KEY после перегенерации ломает keyed Stage 0 evidence по смыслу: комментарий в render.yaml прямо запрещает ротацию между initial capture и T+24h верификацией. Выгрузка защищает от потери, но не доказывает, что Render не перегенерирует ключ при relink.
- Шаг «Prove exact pinned LKG against candidate-head PG16» НИ РАЗУ не проходил зелёным — он выполняется только при workflow_dispatch+publish, поэтому CI пул-реквеста #53 его не гонял. После добавления PYTHONPATH старый baseline-образ (голова 0070) должен импортировать свои модели и селектить свои таблицы против схемы 0073; возможна вторая, ещё не наблюдавшаяся ошибка. Форвард-совместимость LKG формально не доказана.
- Не проверено, доступны ли шагу «Checkout exact feed release source» приватные Glera/feed-prototype и Glera/swipe-platform под github.token — baseline 30789375002 прошёл, но конфигурация с тех пор могла измениться; при отказе диспатч упадёт до публикации.
- НЕ РЕШЁН выбор code_min_revision: отревьюенный пакет candidate-v3 несёт 0072_mission_ops_receipts, альтернативный анализ рекомендовал 0070_published_test_delivery как «более безопасный набор». В шаге 8 стоит отревьюенное значение 0072. Параметр влияет только на codeCompatibility (используется при rollback-проверках), не на предусловие preDeploy, но зафиксировать выбор письменно стоит.
- Провенанс ленты в манифесте отстанет от факта: feed_sha=1d05bb13 не содержит Minesweeper, а голова feed-prototype (b1a9e63) его содержит, при этом бэкенд уже несёт серверную политику серии minesweeper-v1 (app/run_policy.py:13). Рантайм-связи нет (git grep StaticFiles по app пуст, бэкенд не отдаёт ассеты ленты), продуктового изменения не возникает — но «доказательство идентичности релиза» станет ложным ровно в том поле, ради которого существует, а следующий деплой ленты с minesweeper окажется вне закрытого манифеста.
- Ручной alembic 0071/0072 (шаг 18) не создаёт записей в platform_release_receipts: квитанцию пишет только preDeploy. Итоговая квитанция зафиксирует beforeRevision=0072, и применение 0071/0072 останется без доказательства в БД — сознательное отступление от принципа R1-A «миграция только под квитанцией», которое стоит зафиксировать отдельным операторским решением.
- Гарантия append-only слабее декларируемой. Триггер tr_platform_release_receipts_append_only объявлен BEFORE UPDATE OR DELETE … FOR EACH ROW (0073_platform_release_receipts.py) — строковые триггеры НЕ срабатывают на TRUNCATE, а statement-level BEFORE TRUNCATE в миграции нет. Владелец таблицы может выполнить TRUNCATE и затем штатный downgrade. То же верно для одиннадцати mission-журналов из 0071 (APPEND_ONLY_TABLES:185-197, триггеры в той же форме на :664-669). Для плана это хорошая новость (откат достижим), но как durable-инвариант append-only здесь дыра — нужно отдельное решение, добавлять ли BEFORE TRUNCATE.
- Ручной вариант B шага 19 не покрыт ни одним тестом и не оставляет квитанции координатора: отпадают CAS-проверка текущего live-деплоя, компенсирующий откат env при ошибке, верификационный one-off job и receipt с fromDeployId/toDeployId. Проверка деплоя становится наблюдательной. Вариант A (правка одной константы + локальный запуск) эти гарантии возвращает и предпочтителен.
- Тест-страж заморозки не защищён CI полностью: paths-фильтр workflow «Platform release image» не содержит render.yaml и Dockerfile.bake, поэтому PR, трогающий только render.yaml, вообще не запустит проверку. Обязательных ruleset-проверок на текущем плане GitHub нет — красный чек сам по себе merge не блокирует. Защита от частичного отката держится на дисциплине «revert целиком».
- Итоговый пакет evidence R1 (operator-receipt по гейтам A-G + final-evidence.md + secret-scan) при снятой церемонии PASS не выдаст по построению: валидатор требует по каждому потребителю postSyncDeployOrRunId, freshDatabaseProofSha256 и consumerClosure.status='closed'. Пакет следует считать отложенным, а не закрытым.
- Мелочь, способная сорвать повторный preDeploy: predeploy-env пишет результат через _publish_no_clobber в /tmp/platform-applied-release.v1.json — повторный запуск в том же контейнере или на том же смонтированном /tmp упадёт с output_exists, хотя квитанция в БД реплеится корректно. То же правило действует для всех локальных --output в шагах 7, 10, 11: путь не должен существовать.
- Пакет retry-v2 на мерж PR #53 (064542c, R1..R4 GO) предполагал создание временного Render API key через браузер — именно на этом 04.08 сорвалась предыдущая попытка (маскированный ключ попал в вывод браузерного инструмента, hard stop, ключ отозван). В настоящем плане мерж PR #53 сведён к gh pr ready/merge без Render-контура; ключ Render нужен позже и вводится оператором вручную, не через браузерный инструмент.
- meta origin/master:platform-reliability-r1-gate-c0-r1a-ordering-review-v3-2026-08-04.md (коммит 8c5098b) всё ещё утверждает, что candidate-v3 «ждёт ровно одного операторского запуска». Это опровергнуто прогоном 30845173288/1 и квитанцией platform-reliability-r1a-production-candidate-v3-publication-failure-20260803.md ('FAIL CONTAINED; NO IMAGE PUBLISHED; ONE-DISPATCH AUTHORITY CONSUMED'). Документ решений остаётся расходящимся с фактом — его следует поправить отдельно, иначе следующий читатель воспроизведёт ту же устаревшую посылку.

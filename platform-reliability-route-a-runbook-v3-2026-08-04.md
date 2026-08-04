# Platform Reliability R1-A — упрощённый production route

**Дата решения:** 2026-08-04

**Статус:** DRAFT v3 · findings P1/P2 внесены · требуется независимое review ·
не даёт execution authority

**Авторы:** Claude (исходный маршрут), Codex (редакция v3).

**Цель:** production web работает из immutable-образа финального backend
`master`, Alembic находится на `0073_platform_release_receipts`, а
опубликованная лента показывает `minesweeper-v1-swipe`.

## 1. Решение оператора и граница маршрута

Аудитории нет, допустим простой. Поэтому оператор снял лишние защиты после
Gate C0, но не сам Gate C0.

Снимаются:

- disposable rehearsal `0070→0073` как отдельный production gate;
- точный attended cutover-пакет прежней редакции;
- выходные критерии Gate C по cron/`pg_stat_activity` и Gate D;
- GitHub environment `production` как authority gate.

Сохраняются:

- Gate C0: exact-reviewed source freeze, relink-only замена Blueprint,
  terminal comparison и полный revert freeze;
- immutable image digest и exact финальный backend source;
- sidecar manifest и schema-capability;
- fail-closed `preDeploy` из того же образа;
- LKG forward smoke;
- точный handoff от потока R1 перед production deploy;
- отдельное операторское GO на каждый внешний изменяющий акт.

Gate C0 — не церемония доступности. Старый утёкший Sync Hook остаётся
действующим credential до фактической замены Blueprint; Render подтвердил
`hookCanInitiateBlueprintSync: true`. Поэтому исключение Gate C0 оставило бы
реальную write-authority снаружи и в этом маршруте запрещено.

Этот документ не разрешает merge backend-кода, workflow dispatch, Render
mutation, migration или deploy. Каждый такой акт получает отдельную
одноразовую authority.

## 2. Непересекающиеся потоки

### R1 — владелец данных

R1 выполняет и подтверждает:

- production dump и полный restore на PostgreSQL 16;
- migration rehearsal `0070→0073` на восстановленной копии;
- свежий pre-deploy data handoff и последующее закрытие external ingress.

R1 **не** выполняет ручной production-догон `0070→0072`. Он обошёл бы advisory
lock и не создал бы единую release receipt.

### R1-A — владелец release-механизма и web deploy

R1-A выполняет:

- patch A: fail-closed `preDeploy`, который принимает exact-пиннутый `0070`;
- подготовку source-freeze-кандидата для Gate C0;
- публикацию одного exact candidate image после terminal revert Gate C0;
- проверку manifest/schema-capability/LKG;
- staging release-env, смену web source на exact image digest;
- наблюдение единственного deploy и `verify-applied-db`;
- отзыв временного Render API key.

## 3. Зафиксированные входные факты

На момент этой редакции:

- backend `master` — `1b145d441378b884e17938632378542ac3bf2069`;
- PostgreSQL acceptance `30892649576` и Browser E2E `30892649700` для него
  завершились `success`;
- production database находится на `0070_published_test_delivery`;
- migration graph заканчивается
  `0071_mission_slice_core → 0072_mission_ops_receipts →
  0073_platform_release_receipts`;
- candidate-v3 authority израсходована failed-run `30845173288/1`;
- candidate-v4 request отозван: он пинит backend до patch A и не может быть
  выполнен;
- валидный LKG — run `30789375002`, image
  `sha256:39f354d8b22a221bf5f71ed912ca57d9bd16a8f8007958709e3e97f969b5eedb`,
  manifest SHA-256
  `b2ddb48a4c907b82b592a430336811a6514ec8a58c3c2cd8336f7e339a2bbc88`;
- опубликованная статическая платформа —
  `12033fa72d0dfaba4bde49264e2d543bf19e928a`; её `release.json` пинит feed
  `c1681d8044c28124be6d8e099a9a73849b59921e` и exported playables
  `67fedba6901cf492bc0d60ac051560e89d443f3b`;
- публичные `versions.json` и playable URL уже показывают Minesweeper.

SHA backend `1b145d…` — входная точка для patch A, не будущий candidate SHA.
Финальный source SHA станет известен только после patch A, Gate C0 и полного
revert freeze.

## 4. Merge-граница

До успешного production deploy запрещены merge backend PR:

- #26 — закрывает external ingress до завершения R1;
- #48, #33, #30, #25 — двигают migration graph и протухают manifest.

Разрешаемые только отдельными GO исключения, строго по порядку:

1. reviewed patch A;
2. exact source-freeze PR #54, заново привязанный к then-current master;
3. полный revert этого freeze merge.

Никакой candidate image не публикуется между merge freeze и его полным revert.
После revert backend master снова замораживается; новый candidate packet пинит
его exact SHA и exact workflow bytes. Stage 1 runtime activation запрещена.

## 5. Phase A — patch A для `0070→0073`

Текущий `_run_verified_predeploy` принимает только вычисленный
`expectedPredecessor=0072` или target `0073`; production `0070` получает
`predeploy_state_rejected`. Ручная миграция снаружи запрещена.

Patch A обязан:

1. Включить exact `0070_published_test_delivery` в immutable, digest-bound
   release policy/manifest как единственный дополнительный разрешённый start.
2. Под существующим advisory lock повторно проверить revision и выполнить всю
   цепочку `0070→0073` в одном preDeploy invocation.
3. После upgrade сверить canonical schema-capability с exact manifest.
4. Записать одну immutable `platform_release_receipts` запись, связывающую
   before=`0070`, after=`0073`, image/source/manifest/deploy identity.
5. Оставить retry-safe путь target=`0073` без новой миграции.
6. Fail closed для любой непиннутой, промежуточной, неоднозначной или
   multi-head revision.

Обязательны red→green негативные тесты как минимум для `0069`, `0071`, unknown
revision, multi-head и подменённого policy/manifest digest; PostgreSQL acceptance
и независимое review exact diff. Merge patch A требует отдельного operator GO.

## 6. Phase B — Gate C0 relink-only

Gate C0 выполняется до публикации candidate image, одним attended окном и по
отдельному exact operator GO.

Перед GO:

1. Patch A уже влит, backend master и tree зафиксированы, CI зелёный.
2. Backend PR #54 пересобран или перебазирован на этот exact master. Sentinel
   обязан падать с exit `78` до application startup и database access.
3. Контракт/immutable policy из meta PR #57 обновлены: они пинят новый
   pre-freeze master/tree, exact PR #54 head/tree, ordered merge parents/tree и
   required post-revert tree. Старые пины `f2a8405…` использовать нельзя.
4. Exact backend/meta diffs независимо отревьюены. Reviewer GO является только
   evidence; merge и Render action он не разрешает.

После отдельного `GO Gate C0`:

1. Сверить все CAS и влить exact PR #54 merge-commit semantics.
2. Приостановить оба cron, снять v3 before observation.
3. Удалить только старый Blueprint и провести bounded relink-only replacement
   существующих service IDs по exact reviewed contract.
4. Любой replacement-triggered deploy допустим только как terminal sentinel
   exit `78` до app/DB. Successful/Live deploy — немедленный NO-GO.
5. Снять v3 after observation, доказать отсутствие unexpected sync и получить
   terminal comparison.
6. На успехе и на любом abort полностью откатить freeze merge не позднее 60
   минут после него; доказать exact post-revert tree и отсутствие чужих commits.

До terminal revert запрещены candidate publication, обычный deploy и пауза без
оператора. При failure старый Blueprint/credential state фиксируется буквально;
маршрут не притворяется, что Sync Hook инвалидирован. После PASS старый Sync Hook
считается недействительным только на основании terminal old-ID absence и нового
Blueprint ID, а не по формулировке этого документа.

## 7. Phase C — новый candidate packet

Только после terminal Gate C0 + exact freeze-revert receipt:

1. Зафиксировать финальный backend master SHA/tree и automatic CI.
2. Проверить, что migration graph/workflow bytes не менялись неожиданно.
3. Пинить фактически опубликованные frontend identities:

   ```text
   feed_sha=c1681d8044c28124be6d8e099a9a73849b59921e
   playables_sha=67fedba6901cf492bc0d60ac051560e89d443f3b
   swipe_platform_sha=12033fa72d0dfaba4bde49264e2d543bf19e928a
   ```

4. Сформировать **новый** one-dispatch request с финальным backend SHA,
   workflow SHA, patch-A release-policy identity и LKG identity.
5. Получить независимое review и отдельное exact operator GO.
6. Выполнить максимум один `workflow_dispatch publish=true`; failure расходует
   authority, retry/rerun требует нового пакета.

Candidate acceptance требует exact head SHA, successful LKG forward smoke,
один immutable image digest, canonical manifest, exact-byte schema-capability и
build metadata. Manifest обязан выражать принятый patch A start=`0070`,
target=`0073` и связывать финальный backend/cross-repo source. Публикация image
ничего не деплоит.

## 8. Phase D — handoff R1

Перед Render source mutation R1 передаёт reviewed receipt:

1. Production dump имеет SHA-256 и размер; restore на PostgreSQL 16 доказан.
2. Exact финальный candidate-код прогнан на восстановленной копии от `0070` до
   `0073` тем же preDeploy-путём под lock.
3. Полученный canonical schema-capability SHA-256 равен candidate sidecar.
4. Production непосредственно перед deploy всё ещё exact `0070`; migration
   graph, candidate digest и manifest не изменились.
5. Текущий live web deploy зафиксирован для CAS.

Production остаётся на `0070` до preDeploy candidate. Dump/restore/rehearsal
ведёт R1; R1-A не получает его production database credential вне отдельно
разрешённого Render/preDeploy окна.

## 9. Phase E — production source/deploy

Требуется отдельное operator GO на exact candidate digest, manifest SHA,
финальный backend SHA и R1 handoff. GitHub environment `production` не создаётся.

1. Создать временный account-wide Render API key только на окно; проверить exact
   owner/service/Blueprint/registry/live-deploy CAS и Auto Deploy off.
2. Через Save-only установить exact manifest/deploy identity/operation env;
   неожиданный deploy — STOP.
3. Один раз переключить web source на exact GHCR digest с pull-only credential,
   `python -m app.platform_release predeploy-env` и `/api/health`.
4. Source switch считается deploy-triggering. Если deploy уже создан, второй
   POST запрещён. Если bounded observation доказывает его отсутствие,
   coordinator выполняет один deploy POST с тем же CAS.
5. PreDeploy принимает production `0070`, под lock выполняет `0070→0073`,
   сверяет capability и пишет одну release receipt.
6. После `live` один `verify-applied-db` job доказывает exact applied identity.
7. Наблюдением подтвердить exact image/source, DB `0073`, `/api/health=200`,
   публичную ленту и `minesweeper-v1-swipe`; Stage 1 flags остаются off.
8. Отозвать временный Render key и безэмиссионно доказать HTTP 401. Pull-only
   registry credential и release manifest env остаются для restart exact image.

## 10. STOP-условия

STOP без импровизации, если:

- patch A или его независимое review отсутствует;
- C0 policy не пинит фактический after-patch-A master и PR #54;
- Gate C0/revert receipt неполон либо старый Sync Hook не инвалидирован;
- backend master/workflow/migration graph изменился после candidate packet;
- candidate workflow упал или artifacts неоднозначны;
- R1 handoff не доказывает production=`0070` и capability parity;
- Render CAS не совпал, env staging неожиданно создал deploy или source switch
  создал deploy не exact digest;
- preDeploy/verify-applied-db не дал PASS;
- временный ключ появился в output или не отзывается.

Допустимый простой не означает допустимую потерю данных, потерю провенанса или
повтор внешнего акта без новой authority.

## 11. Что сознательно отложено

- post-C0 cron/`pg_stat_activity` closure и Gate D;
- точный attended cutover packet прежнего маршрута;
- GitHub production environment ceremony;
- schema downgrade;
- append-only `BEFORE TRUNCATE` усиление.

Gate C0, patch A и единая preDeploy receipt **не** отложены.

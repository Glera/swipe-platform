# Platform Reliability R1-A — упрощённый production route

**Дата решения:** 2026-08-04

**Статус:** DRAFT v3 · findings P1/P2, follow-up P1 и adversarial P1/P3 внесены ·
требуется независимое review · не даёт execution authority

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
- patch B для Gate C0 comparator: ожидаемый source transition + равенство
  reviewed `render.yaml` вместо недостижимого буквального равенства source SHA;
- свежий pre-deploy data handoff и последующее закрытие external ingress.

R1 **не** выполняет ручной production-догон `0070→0072`. Он обошёл бы advisory
lock и не создал бы единую release receipt.

### R1-A — владелец release-механизма и web deploy

R1-A выполняет:

- patch A: fail-closed `preDeploy`, который принимает exact-пиннутый `0070`;
- подготовку source-freeze-кандидата для Gate C0;
- patch C после Gate C0: перепиновку coordinator на новый Blueprint ID;
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
4. reviewed patch C, перепинивающий coordinator на новый Blueprint ID из
   terminal C0 receipt.

Никакой candidate image не публикуется между merge freeze и его полным revert.
После revert разрешён только patch C. Backend master окончательно замораживается
после его merge и зелёного CI; новый candidate packet пинит этот exact SHA и
exact workflow bytes. Patch C до candidate packet не является нарушением
заморозки. Stage 1 runtime activation запрещена.

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

### B1. Patch B — обязательное предусловие

Текущий comparator в meta PR #57 по-прежнему содержит:

```js
if (before.blueprint.sourceSha !== after.blueprint.sourceSha) {
  difference('sourceSha');
}
```

При relink старый Blueprint закономерно указывает на SHA своей последней
синхронизации, а новый — на exact source-freeze merge. Поэтому буквальное
равенство недостижимо по построению: корректный C0 завершится
`differences=['sourceSha']`, exit 2.

До Gate C0 поток R1 обязан внести и независимо отревьюить patch B:

1. Удалить требование равенства `before.sourceSha === after.sourceSha`.
2. Fail closed проверить обе стороны ожидаемого перехода: before SHA равен
   зафиксированному старому Blueprint source, after SHA равен exact freeze merge
   из immutable policy.
3. Отдельно доказать byte-identical SHA-256 `render.yaml` между reviewed live
   source и freeze candidate; совпадение содержимого не выводится из commit SHA.
4. Сохранить проверки new Blueprint ID, unchanged service IDs/configuration,
   `unexpectedSyncObserved=false` и все существующие stop rules.
5. Добавить тест, где разные ожидаемые source SHA при одинаковом exact
   `render.yaml` дают PASS, и негативные тесты для неверного before/after SHA,
   изменённого `render.yaml` и unexpected sync.

Patch B и обновлённая immutable policy должны быть слиты либо исполняться из
явно content-addressed reviewed meta commit. Текущий head PR #57 без patch B не
является исполнимым предусловием C0.

Перед GO:

1. Patch A уже влит, backend master и tree зафиксированы, CI зелёный.
2. Backend PR #54 пересобран или перебазирован на этот exact master. Sentinel
   обязан падать с exit `78` до application startup и database access.
3. Patch B реализован, его позитивные/негативные тесты зелёные, exact bytes
   независимо отревьюены.
4. Контракт/immutable policy из meta PR #57 обновлены: они пинят новый
   pre-freeze master/tree, exact PR #54 head/tree, ordered merge parents/tree и
   required post-revert tree, expected before/after source transition и exact
   `render.yaml` digest. Старые пины `f2a8405…` использовать нельзя.
5. Exact backend/meta diffs независимо отревьюены. Reviewer GO является только
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

## 7. Phase C — patch C и новый candidate packet

Только после terminal Gate C0 + exact freeze-revert receipt:

### C1. Patch C — новый Blueprint ID

Gate C0 по построению удаляет старый Blueprint
`exs-d95qo3q8qa3s73ea23p0` и создаёт новый ID. Существующий coordinator пинит
старый ID константой `_PRODUCTION_BLUEPRINT_ID` и отклонит новый до первого HTTP
с `production_target_identity_invalid`; rollback сломается тем же образом.

После полного revert freeze, но до фиксации финального master, R1-A обязан:

1. Взять новый Blueprint ID только из terminal C0 receipt и сверить его с
   provider GET и regex `^exs-[0-9a-z]{20}$`.
2. Создать минимальный patch C, который меняет
   `_PRODUCTION_BLUEPRINT_ID`, соответствующий элемент
   `_KNOWN_PRODUCTION_RENDER_IDS` и их тестовые ожидания со старого ID на новый.
   Другие production identities и release semantics не меняются.
3. Добавить негативный тест: старый ID после C0 отвергается; новый exact ID при
   остальных production CAS принимается. Сетевых или production действий тест
   не выполняет.
4. Получить независимое review exact diff и content-addressed receipt, который
   связывает old ID, terminal C0 receipt, new ID, patch head и ожидаемое значение
   будущего `vars.RENDER_BLUEPRINT_ID`.
5. По отдельному operator GO влить exact patch C, дождаться automatic CI и лишь
   тогда объявить новый backend master финальным.

Patch C ещё не пишется до C0: новый ID пока не существует. Текущая константа не
лечится GitHub variable, поэтому одна перепиновка `vars.RENDER_BLUEPRINT_ID` без
source patch не считается исправлением.

### C2. Новый candidate packet

1. Зафиксировать финальный post-patch-C backend master SHA/tree и automatic CI.
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
финальный backend SHA, patch-C receipt и R1 handoff.

Source switch, terminal deploy и rollback инициируются только через reviewed
`.github/workflows/platform-release-cutover.yml` + exact coordinator из
финального backend master. Provider может начать deploy как следствие source
switch; это считается результатом того же authorized `prepare-source`, а не
отдельным неучтённым путём. Так сохраняются LKG forward validation,
release-manifest binding, serialized mutations и rollback. GitHub environment
`production` создаётся временно только как transport для job secret/vars: без
required reviewers, без wait timer и без самостоятельной approval authority.
Fresh operator GO остаётся единственным authority.

### E1. Полный preflight входов

До source mutation и workflow dispatch:

1. Создать один временный account-wide Render API key только на окно; не
   показывать его значение. Проверить exact owner/service/new Blueprint/registry/
   live-deploy CAS и Auto Deploy off.
2. Создать ephemeral GitHub environment `production` с branch policy только для
   exact финального `master`, без reviewers/wait timer. Установить один
   environment secret `RENDER_API_KEY` с тем же временным ключом.
3. Установить и затем read-back проверить ровно шесть environment vars:

   | variable | exact value |
   | --- | --- |
   | `RENDER_SERVICE_ID` | `srv-d95r3bfavr4c73aqsi4g` |
   | `RENDER_BLUEPRINT_ID` | новый exact ID из C0 + patch-C receipt |
   | `RENDER_OWNER_ID` | `tea-d1m4lmali9vc73euvelg` |
   | `RENDER_REGISTRY_CREDENTIAL_ID` | `rgc-d9np7tajnfac73bi5ib0` |
   | `PLATFORM_DATABASE_IDENTITY` | `swipe-production` |
   | `PLATFORM_RELEASE_AUTHORITY_SCOPE` | `production` |

4. Проверить, что source constant `_PRODUCTION_BLUEPRINT_ID` в exact candidate
   равна environment `RENDER_BLUEPRINT_ID`, а остальные пять vars совпадают с
   финальным source и C0/provider receipts. Repository-level Actions variables
   не используются как неявный fallback.
5. Каждый exact operation packet обязан пинить workflow ref/SHA,
   `operation`, `candidate_build_run_id`, `candidate_manifest_sha256`,
   `lkg_build_run_id` и `expected_current_deploy`. Source switch использует
   `operation=prepare-source`; deploy — `operation=deploy`; rollback всегда
   требует нового отдельного GO.
6. Сверить Render `environmentKeyNames` с terminal C0 observation: `DATABASE_URL`
   и прежние ключи не исчезли; допускается только объявленный release-env delta.
   До deploy `PLATFORM_ROLLBACK_AUTHORIZATION_B64` и
   `PLATFORM_ROLLBACK_AUTHORIZATION_SHA256` обязаны отсутствовать. В GitHub
   vars/secrets таких ключей также быть не должно.

Отсутствующий environment, secret, var, несовпавший read-back или лишний
protection rule — STOP до dispatch, не исправление внутри одноразового run.

### E2. Source и deploy

1. Через Save-only установить exact release env:
   `PLATFORM_DATABASE_IDENTITY=swipe-production`, уникальный
   `PLATFORM_DEPLOY_IDENTITY`, exact manifest B64/SHA и
   `PLATFORM_RELEASE_OPERATION=deploy`; rollback authorization keys остаются
   отсутствующими. Неожиданный deploy — STOP.
2. По отдельному exact GO один раз dispatch workflow с
   `operation=prepare-source`: coordinator переключает web source на exact GHCR
   digest с pull-only credential, `python -m app.platform_release predeploy-env`
   и `/api/health`.
3. Source switch считается deploy-triggering. Если deploy уже создан, второй
   POST запрещён. Если bounded observation доказывает его отсутствие, отдельное
   exact GO разрешает один workflow dispatch с `operation=deploy`; coordinator
   выполняет единственный deploy POST с тем же CAS.
4. PreDeploy требует `PLATFORM_DATABASE_IDENTITY=swipe-production`, принимает
   production `0070`, под lock выполняет `0070→0073`, сверяет capability и пишет
   одну release receipt.
5. После `live` coordinator запускает один `verify-applied-db` job и сохраняет
   durable receipt. При source-triggered deploy без второго POST эквивалентный
   one-off verify job и receipt требуют отдельного exact execution packet.
6. Наблюдением подтвердить exact image/source, DB `0073`, `/api/health=200`,
   публичную ленту и `minesweeper-v1-swipe`; Stage 1 flags остаются off.

### E3. Cleanup

После terminal success либо terminal rollback:

1. Удалить environment secret `RENDER_API_KEY` и API read-back доказать его
   отсутствие.
2. Зафиксировать names/digests шести non-secret vars, затем удалить ephemeral
   environment `production` и доказать 404. Будущий rollback создаёт fresh
   transport только по новому GO.
3. Отозвать временный Render key и безэмиссионно доказать HTTP 401.
4. Pull-only registry credential и exact release manifest env остаются на Render
   для restart live immutable image.

## 10. STOP-условия

STOP без импровизации, если:

- patch A или его независимое review отсутствует;
- patch B отсутствует либо comparator всё ещё требует буквального равенства
  before/after `sourceSha`;
- C0 policy не пинит фактический after-patch-A master и PR #54;
- Gate C0/revert receipt неполон либо старый Sync Hook не инвалидирован;
- patch C отсутствует, его source constant/receipt/GitHub var не совпадают с
  новым Blueprint ID или patch C пытаются выполнить до terminal C0;
- backend master/workflow/migration graph изменился после candidate packet;
- candidate workflow упал или artifacts неоднозначны;
- R1 handoff не доказывает production=`0070` и capability parity;
- ephemeral `production` environment, temporary secret, шесть vars или exact
  workflow inputs отсутствуют/не совпадают;
- rollback authorization keys присутствуют при `operation=deploy`;
- Render CAS не совпал, env staging неожиданно создал deploy или source switch
  создал deploy не exact digest;
- preDeploy/verify-applied-db не дал PASS;
- временный ключ появился в output или не отзывается.

Допустимый простой не означает допустимую потерю данных, потерю провенанса или
повтор внешнего акта без новой authority.

## 11. Что сознательно отложено

- post-C0 cron/`pg_stat_activity` closure и Gate D;
- точный attended cutover packet прежнего маршрута;
- persistent GitHub production approval gate; ephemeral transport из §9 не
  является approval gate;
- schema downgrade;
- append-only `BEFORE TRUNCATE` усиление.

Gate C0, patches A/B/C и единая preDeploy receipt **не** отложены.

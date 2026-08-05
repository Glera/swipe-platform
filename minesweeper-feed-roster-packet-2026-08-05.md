# Пакет «Сапёр в production-ростер»

- Дата: 05.08.2026.
- Автор: Codex / R1-A. Ревьюер: отдельная хаб-сессия Claude.
- Статус: **DRAFT — подготовка завершена частично, исполнение запрещено до
  независимого ревью и отдельных operator GO.**
- Цель: после принятого deploy-среза B добавить `minesweeper-v1-swipe` в
  server-owned roster так, чтобы `/session` возвращал его на позиции 5 и после
  двух перезапусков мини-аппа сапёр был виден в ленте.
- Этот пакет не является частью приёмки deploy-среза B и не блокирует его.
  Исполнение начинается только после PASS фазы 4 того среза.

## 1. Authority и immutable pins

| Контур | Pin | Что доказано |
| --- | --- | --- |
| backend | `0e9e940a2a762f0e35f93c3e35f3afcfea6baaa4`, tree `7b6f8955eb081fd7110a469d078a54ea786db1cc` | CLI mapping/roster и текущая sequencing closure |
| feed | `c1681d8044c28124be6d8e099a9a73849b59921e`, tree `3178575fbd150cc8bd7d2711c61e92142b303b0a` | baked roster: сапёр стоит после Arrows, на позиции 5 |
| swipe-platform | `12033fa72d0dfaba4bde49264e2d543bf19e928a`, tree `1b5cf0d5e6b4b3a1a20f8d02d22cdc5a64523327` | exact production export |
| playables source | `67fedba6901cf492bc0d60ac051560e89d443f3b` | `versions.json` связывает с ним Minesweeper export |

Production export:

- `versions.json` SHA-256:
  `d0b15849c92bdd681bd3fd143b4c92644959d3e363af160153c1bc38b66c0b82`;
- `release.json` SHA-256:
  `17eeb41cc27756456e2e63debf2bffaf9bafb4d9db7c9236a0a44453d2df0bac`;
- Minesweeper version `a62f94702b`, runtime artifact
  `sha256:31687c400a53bb7a844fdfc1a76a7475f13aab5763cc8fd82d9db13343e76220`;
- HTML SHA-256 `c55a4aba46896feb8dcf89aed4e6c6a49d8dc6858e531944621dee86f6d0016f`;
- payload SHA-256 `a62f94702b490e11f0ca8330d2d167d5462e3d57712742604b2b20e3ca889bb5`;
- cover SHA-256 `58502e1183fa2009221a2c613035e70af8721e789c1db03631b370b007e66602`;
- compact cover SHA-256
  `527d5d2422ac7d2b2cd58620824114c74fcae4e51cafe2f1624ed41e2cf8242c`.

Перед каждым production dry-run/apply исполнитель сверяет фактический deploy
и эти pins заново. Если deployed `versions.json` имеет другие bytes, пакет
STOP и пересобирается с новым review.

## 2. Подготовленные identity и manifests

Canonical identity:

| Поле | Значение |
| --- | --- |
| `playableId` | `minesweeper-v1-swipe` |
| `variantId` | `8fea2760-c422-d071-ad0e-35ab4c909c4d` |
| `mappingId` | `c47b75ff-1e9b-43ae-aa53-fca5e8bb86a4` |
| `mechanicFamily` | `minesweeper` |
| `catalogMechanic` | `minesweeper/base` |
| `mappingVersion` | `builtin-minesweeper-v1.production-pilot.2026-08.v1` |
| actor | `telegram:42692410` |

`variantId` не придуман оператором: это exact output клиентского
`variantIdForMechanic("minesweeper-v1-swipe")`. Маппинг ссылается на
`builtin-deploy:swipe-platform:minesweeper-v1-swipe@12033fa72d0dfaba4bde49264e2d543bf19e928a`.

Артефакты:

| Файл | Contract digest | File SHA-256 |
| --- | --- | --- |
| `minesweeper-feed-mapping-v1.json` | mapping digest `6237927d6093aab4fc67d893d6ea943c1a2f2bededeffa7534fa3ee97da1a4fd` | `e160bbd50d1d154ce30f42ec1789cfe2edfb990fd5d0b9ced035ed76809f56f9` |
| `minesweeper-feed-roster-v1.json` | roster hash `7a9418ddcb1e495521ad0f04a0191da486e3325477af5808edb45903812a9d30` | `725a1f28002fa148bd3f1156003f8fc58666f167b5149cf98af2af311bb45dfd` |

Второй manifest отражает только baseline §3. Если production roster/CAS
сместился, его нельзя применять: новый ordered manifest строится из свежего
состояния, получает новый hash и повторное независимое review.

Независимая статическая проверка на exact backend contract:

```bash
python - <<'PY'
from pathlib import Path
import hashlib, json
from app.feed_mapping_registry import load_manifest_documents
from app.feed_roster import load_roster_identity

mapping_path = Path("../minesweeper-feed-mapping-v1.json")
roster_path = Path("../minesweeper-feed-roster-v1.json")
mapping = load_manifest_documents(mapping_path)
roster = load_roster_identity(json.loads(roster_path.read_text()))
print(mapping[0].mapping_digest())
print(roster.roster_hash())
print(hashlib.sha256(mapping_path.read_bytes()).hexdigest())
print(hashlib.sha256(roster_path.read_bytes()).hexdigest())
PY
```

Ожидаются ровно четыре значения из таблицы выше и `len(entries) == 15`.

## 3. Baseline snapshot — evidence, не CAS на исполнение

Источник: `/Users/gleb/secure/r1a/swipe-prod-baseline-20260804T085513Z.dump`,
SHA-256 `ef138c93f85683f1f091650fdd2a8394b1153f12fea93d31d5fae9d358ef3c31`.

Важная поправка к передаче: файл снят **04.08.2026 08:55 UTC**, а не 05.08.
Сверка 05.08 выполнялась на локально восстановленной копии. Raw dump имеет
Alembic `0070`; прежняя формулировка «копия после rehearsal на 0073» описывает
локальный upgrade той же копии, не время и не ревизию production capture.

Snapshot:

- 14 active mappings: arrows, drama, merge×6, pins×5, sort;
- Minesweeper variant и mapping отсутствуют;
- active roster activation
  `123ad86c-df97-4f9f-872b-6255fce36f4f`, roster
  `920d8493-3deb-41fc-b998-f1e1ca216202`, deploy-manifest digest
  `3c51bdbb92b913179f865cfe637836359a659be679526e155cd4de05c13929e7`;
- active ontology activation
  `5469dca3-3bdd-4e18-a4f6-24693e548b17`, version
  `mechanic-ontology.production.2026-07.v1`, digest
  `a40cd210b800017a485bd9835027fbfffecb6aba9f0ec2e89aa416aab0c73e3c`;
- active cold-start activation
  `dcc1329b-7ccd-4a8d-acc5-2e72467edf02`, version
  `cold-start.sequencing-shadow.2026-07.v1`, digest
  `f8eb50b335c5f4f26c6d6084fe13581cd649b702a2c7e84276a90806ccfd81aa`;
- slot activation pointer отсутствует.

При исполнении всё это перечитывается заново. Ни один snapshot ID не
подставляется в apply без свежей CAS-сверки.

## 4. Блокирующая code-предпосылка: successor ontology closure

`minesweeper` — новая family. Присвоить сапёру `sort`, `pins` или другую
существующую family ради обхода шага запрещено: это ложная catalog identity и
загрязнение affinity.

Backend `0e9e940` не может безопасно провести это изменение как есть:

1. bootstrap пиннит только четыре family;
2. его code-ontology уже `...2026-07.v2`, а зависимые affinity/cold-start/slot
   всё ещё используют версии `...2026-07.v1`; новые bytes под теми же версиями
   дадут immutable version conflict;
3. bootstrap считает любую live cold/slot version, не равную текущей code-pin,
   «console head». При обычном successor bundle это дало бы ложный
   `bootstrap_supersedes_console`;
4. slot activation pointer в baseline отсутствует. Если он появится до
   исполнения, новая ontology closure обязана включить и CAS-перевод slot
   pointer в той же транзакции; оставлять active slot на старой ontology
   нельзя.

До любых DB apply требуется отдельный reviewed backend PR и его deployment.
Минимальный source-scope PR:

- добавить `PinnedFamily("minesweeper", "Minesweeper", ("logic", "deduction"),
  ("minesweeper-v1-swipe",))`; cold-start slate не менять;
- выпустить новые версии ontology, affinity, cold-start, slot и policy — ни
  один immutable version не переиспользовать для других bytes;
- распознавать exact predecessor bundle по version+digest и отражать его в
  receipt как predecessor, а не требовать/симулировать
  `--supersede-console`;
- сохранить один общий bundle lock и одну транзакцию;
- если свежий preflight увидит slot pointer, добавить в manifest его exact
  expected activation и CAS-активацию нового slot config; если pointer всё ещё
  отсутствует, явно проверить и зафиксировать adoption-candidate semantics;
- тест на prod-like predecessor: dry-run и apply дают complete coverage,
  новую family, новые immutable refs и не меняют порядок cold-start probes;
- негативные тесты: stale ontology/cold/slot CAS, version reuse, missing mapping,
  mapping/ontology coverage regression и попытка назваться predecessor с
  другим digest.

Этот PR не входит в deploy-срез B и не должен менять его pin. Он готовится и
ревьюируется сейчас, но мержится/деплоится только после фазы 4 варианта B и
отдельных GO. Пакет ниже не executable, пока эта closure не стала живым кодом.

## 5. Исполнение — строгий порядок и отдельные GO

### 5.0 Fresh read-only preflight

После PASS фазы 4 и deployment code-предпосылки:

1. подтвердить deployed backend SHA и SHA-256 live `versions.json`;
2. перечитать active roster projection, mapping registry, ontology, cold-start
   и slot pointers;
3. перечитать variant row;
4. сохранить receipt с row identities/digests и timestamp;
5. если roster отличается от §3 — STOP, пересобрать ordered roster manifest и
   повторить review.

### 5.1 Variant — server-owned precondition, не operator insert

Должна существовать exact row:

```text
id              = 8fea2760-c422-d071-ad0e-35ab4c909c4d
parent_mechanic = minesweeper-v1-swipe
schema_version  = 0
params          = {}
source          = auto
```

Если её нет, direct SQL запрещён. Выполнить обычную reviewed Minesweeper
сессию через `/runs`/`/results`, которая использует штатный `ensure_variant`,
затем повторить read-only запрос. Любое несовпадение существующей row — STOP.

### 5.2 Mapping dry-run, затем отдельный GO на apply

Dry-run:

```bash
python -m app.feed_mapping_registry register \
  --manifest /path/minesweeper-feed-mapping-v1.json \
  --actor telegram:42692410
```

Acceptance dry-run: `status=would_apply`, `total=1`, `create=1`, `replay=0`,
mapping digest равен §2. Replay допустим только если exact row уже появилась
из ранее принятого акта; иначе неожиданная row — STOP.

После отдельного operator GO — ровно один apply-процесс:

```bash
ENABLE_FEED_MAPPING_REGISTRY_OPS=true \
python -m app.feed_mapping_registry register \
  --manifest /path/minesweeper-feed-mapping-v1.json \
  --actor telegram:42692410 --apply
```

Флаг задаётся только этому процессу; persistent env сервиса не меняется.
Сохранить stdout receipt и немедленно сделать read-only `list`.

### 5.3 Successor ontology bundle: draft → review → dry-run → отдельный GO

Только после committed mapping:

1. `python -m app.feed_sequencing_bootstrap preflight`;
2. создать новый operation UUID;
3. `draft` exact manifest из свежих DB identities;
4. независимое review manifest bytes, всех config digests, predecessor refs и
   activation CAS;
5. dry-run **тех же bytes** без `--apply`;
6. убедиться, что `coverageBefore.complete=true` и
   `coverageAfter.complete=true`, Minesweeper membership ровно одно, slate
   неизменен, `supersededConsoleHeads=[]`;
7. запросить отдельный operator GO;
8. применить теми же bytes с одноразовым
   `ENABLE_FEED_SEQUENCING_BOOTSTRAP=true`.

`--accept-coverage-regression` и `--supersede-console` в этом пакете
запрещены. Их необходимость означает новую authority-развилку и STOP.

### 5.4 Roster registration dry-run, затем отдельный GO на apply

Использовать подготовленный `minesweeper-feed-roster-v1.json` только если
fresh roster равен §3. Minesweeper добавляется на позиции 5; остальные 14
mapping IDs и их относительный порядок не меняются.

```bash
python -m app.feed_roster register \
  --entries /path/minesweeper-feed-roster-v1.json \
  --actor telegram:42692410
```

Acceptance: `dryRun=true`, `entryCount=15`, `added` содержит ровно новый
mapping ID, `removed=[]`, target roster hash равен §2.

После отдельного operator GO повторить с `--apply`. Сохранить `rosterId`,
`rosterHash` и receipt. Registration apply и activation apply — два разных
operator GO, не один.

### 5.5 CAS activation dry-run, затем отдельный GO на apply

Непосредственно перед dry-run заново прочитать current activation ID. Взять
exact deployed `versions.json`; его bytes обязаны хэшироваться в §1 digest.

```bash
python -m app.feed_roster activate \
  --roster <registered-roster-id> \
  --expected-current <fresh-current-activation-id> \
  --reason "Add reviewed Minesweeper after Arrows" \
  --actor telegram:42692410 \
  --deploy-manifest /path/to/exact-production-versions.json
```

Acceptance dry-run: `wouldReplay=false`, `added` содержит ровно Minesweeper,
`removed=[]`, `reordered=false`, `deployManifestDigest` равен §1.

Снова перечитать current activation. Если ID сместился — старый dry-run и GO
сгорели; новый draft/review обязателен. После отдельного operator GO выполнить
тот же вызов с `--apply` и сохранить activation/intervention/request IDs.

## 6. Приёмка и наблюдаемый критерий

1. Новый `/session` возвращает `feedRoster.activationId` из apply-receipt,
   15 entries и Minesweeper mapping на позиции 5.
2. Minesweeper entry содержит exact `playableId`, `variantId`,
   `catalogMechanic` и mapping digest §2.
3. Первый перезапуск мини-аппа завершает старую session; второй получает новую.
4. После второго перезапуска сапёр виден сразу после Arrows и запускается.
5. Нет `roster_entry_unavailable` для Minesweeper и нет `roster_fallback`.
6. Sequencing coverage остаётся complete; новая family видна в ontology
   projection.

Только после этих наблюдений критерий **«сапёр виден в ленте»** считается
закрытым.

## 7. STOP и rollback

STOP без импровизации при любом из условий:

- deployed SHA/manifest bytes не равны review-пакету;
- variant отсутствует после штатной сессии или имеет другие immutable поля;
- mapping dry-run не `create=1`/exact replay;
- current roster/activation меняется между snapshot, dry-run и apply;
- ontology bundle требует coverage-regression/supersede флаг;
- coverage становится incomplete либо slot/ontology closure расходится;
- `/session` не воспроизводит activation receipt или клиент уходит в fallback.

Rollback не удаляет immutable rows. Он регистрирует/переиспользует предыдущий
14-entry roster и создаёт **новую** CAS activation с current Minesweeper
activation как `expected-current`, exact deploy manifest и отдельным operator
GO. Ontology и mapping остаются исторически проверяемыми; их retire/смена —
отдельный пакет, не аварийный шаг этого акта.

## 8. Матрица authority

| Акт | До deploy B phase 4 | После phase 4 | Нужен отдельный GO |
| --- | --- | --- | --- |
| подготовка manifests и source PR closure | можно | можно | нет для локальной подготовки/ревью |
| merge/deploy successor ontology code | нельзя | можно после review | да, на merge/deploy |
| обычная Minesweeper session для variant | нельзя как часть пакета | можно | не DB apply, но фиксируется evidence |
| mapping `--apply` | нельзя | после code/variant preflight | да |
| ontology bundle `--apply` | нельзя | после mapping | да |
| roster register `--apply` | нельзя | после ontology | да |
| roster activation `--apply` | нельзя | последним | да |

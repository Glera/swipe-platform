# Пакет «Сапёр в production-ростер»

- Дата: 05.08.2026.
- Автор: Codex / R1-A. Ревьюер: отдельная хаб-сессия Claude.
- Статус: **CLAUDE REVIEW GO на пакет SHA-256 `0c3af338…6d330`; исполнение
  запрещено до PASS deploy B и отдельных operator GO.**
- Цель: после принятого deploy-среза B добавить `minesweeper-v1-swipe` в
  server-owned roster так, чтобы `/session` возвращал его на позиции 5 и после
  двух перезапусков мини-аппа сапёр был виден в ленте.
- Этот пакет не является частью приёмки deploy-среза B и не блокирует его.
  Исполнение начинается только после PASS фазы 4 того среза.

## 1. Authority и immutable pins

| Контур | Pin | Что доказано |
| --- | --- | --- |
| backend | `0e9e940a2a762f0e35f93c3e35f3afcfea6baaa4`, tree `7b6f8955eb081fd7110a469d078a54ea786db1cc` | CLI mapping/roster; ontology не участвует в этом writer-path |
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
print(len(roster.entries))
PY
```

Ожидаются ровно четыре значения из таблицы выше и пятое значение `15`.

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

## 4. Ontology не блокирует путь ростера

`minesweeper` — новая family. Присвоить сапёру `sort`, `pins` или другую
существующую family ради обхода шага запрещено: это ложная catalog identity и
загрязнение affinity.

Но ontology не является gate фактического production-пути этого пакета.
Проверка `0e9e940` зафиксирована в
`ontology-gate-finding-2026-08-05.md` (`e837257`):

- `feed_mapping_registry` не импортирует и не читает ontology;
- mapping contract валидирует `mechanicFamily` как строковую identity и
  равенство prefix `catalogMechanic`, а не membership активной ontology;
- `feed_roster` при register/activate проверяет существование и active-state
  mapping, но не sequencing closure;
- `/session` строит roster projection из activation/config/mapping rows;
- sequencing/ontology-контур запаркован и не участвует в player route.

Следовательно, critical path — **variant → mapping → roster registration →
CAS activation**. Successor ontology остаётся отдельным follow-up перед
включением feed-sequencing для независимых игроков; этот пакет её не меняет и
не требует второго backend deployment.

Короткий путь дополнительно прогнан локально на восстановленном production
dump из §3, без production writes, на exact backend `0e9e940` и
swipe-platform `12033fa`:

- после локального upgrade до `0073` штатно создана exact auto-variant;
- mapping dry-run дал `create=1` и digest §2, apply создал ровно одну row;
- roster dry-run дал `entryCount=15`, `added=[c47b75ff…]`, `removed=[]`,
  `reordered=false` и roster hash §2; apply прошёл;
- activation dry-run с current activation
  `123ad86c-df97-4f9f-872b-6255fce36f4f` и exact production
  `versions.json` прошёл;
- ни один шаг не потребовал ontology activation или второго deploy.

Это reachability-evidence, а не production CAS: все current IDs и manifests
всё равно перечитываются заново в §5.0.

## 5. Исполнение — строгий порядок и отдельные GO

### 5.0 Fresh read-only preflight

После PASS фазы 4 deploy-среза B:

1. подтвердить deployed backend SHA и SHA-256 live `versions.json`;
2. перечитать active roster projection и mapping registry;
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
сессию через authenticated `/runs` → `/results` (напрямую либо через
challenge deep-link), которая использует штатный `ensure_variant`, затем
повторить read-only запрос. Любое несовпадение существующей row — STOP.

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

### 5.3 Roster registration dry-run, затем отдельный GO на apply

Использовать подготовленный `minesweeper-feed-roster-v1.json` только если
fresh roster равен §3. Minesweeper добавляется на позиции 5; остальные 14
mapping IDs и их относительный порядок не меняются.

```bash
ENABLE_FEED_ROSTER_CONFIG=true \
python -m app.feed_roster register \
  --entries /path/minesweeper-feed-roster-v1.json \
  --actor telegram:42692410
```

Acceptance: `dryRun=true`, `entryCount=15`, `added` содержит ровно новый
mapping ID, `removed=[]`, target roster hash равен §2.

После отдельного operator GO повторить с `--apply`. Сохранить `rosterId`,
`rosterHash` и receipt. Registration apply и activation apply — два разных
operator GO, не один. `ENABLE_FEED_ROSTER_CONFIG=true` должен быть виден
процессу явно; persistent Render env этим пакетом не меняется.

### 5.4 CAS activation dry-run, затем отдельный GO на apply

Непосредственно перед dry-run заново прочитать current activation ID. Взять
exact deployed `versions.json`; его bytes обязаны хэшироваться в §1 digest.

```bash
ENABLE_FEED_ROSTER_CONFIG=true \
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
тот же вызов с `--apply`, сохранив тот же process-local flag, и сохранить
activation/intervention/request IDs.

## 6. Приёмка и наблюдаемый критерий

1. Новый `/session` возвращает `feedRoster.activationId` из apply-receipt,
   15 entries и Minesweeper mapping на позиции 5.
2. Minesweeper entry содержит exact `playableId`, `variantId`,
   `catalogMechanic` и mapping digest §2.
3. Первый перезапуск мини-аппа завершает старую session; второй получает новую.
4. После второго перезапуска сапёр виден сразу после Arrows и запускается.
5. Нет `roster_entry_unavailable` для Minesweeper и нет `roster_fallback`.

Только после этих наблюдений критерий **«сапёр виден в ленте»** считается
закрытым.

## 7. STOP и rollback

STOP без импровизации при любом из условий:

- deployed SHA/manifest bytes не равны review-пакету;
- variant отсутствует после штатной сессии или имеет другие immutable поля;
- mapping dry-run не `create=1`/exact replay;
- current roster/activation меняется между snapshot, dry-run и apply;
- `/session` не воспроизводит activation receipt или клиент уходит в fallback.

Rollback не удаляет immutable rows. Он регистрирует/переиспользует предыдущий
14-entry roster и создаёт **новую** CAS activation с current Minesweeper
activation как `expected-current`, exact deploy manifest и отдельным operator
GO. Mapping остаётся исторически проверяемым; его retire/смена — отдельный
пакет, не аварийный шаг этого акта.

## 8. Матрица authority

| Акт | До deploy B phase 4 | После phase 4 | Нужен отдельный GO |
| --- | --- | --- | --- |
| подготовка manifests | можно | можно | нет для локальной подготовки/ревью |
| обычная Minesweeper session для variant | нельзя как часть пакета | можно | не DB apply, но фиксируется evidence |
| mapping `--apply` | нельзя | после variant preflight | да |
| roster register `--apply` | нельзя | после mapping | да |
| roster activation `--apply` | нельзя | последним | да |

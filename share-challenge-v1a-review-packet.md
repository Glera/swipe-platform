# Share/Challenge V1-A (backend) — evidence-пакет для Codex implementation-review

Дата: 25.07.2026. Пакет V1-A по ТЗ `swipe-backend/docs/specs/share-challenge-v1.md`
v1.4 + R5 GO (exact head `436a867`) + post-GO amendment v1.4.1
(`@31c9439`, механика = marble-sort-swipe, решение оператора). Автор кода —
Opus-субагент, внутреннее адверсариальное ревью — независимый субагент
(author≠reviewer), оркестрация — Claude.

## Ветка / коммиты

`swipe-backend`, ветка **`challenge-v1`** (запушена; master не трогался),
ребейзнута на `origin/master@36a7d2a` (включает island P2 = миграцию
`0055_island_p2`):

```
1ac8803* Share/Challenge V1-A: migration + models + config      (rebased)
7a75f02* Share/Challenge V1-A: endpoints + challenge_core       (rebased)
60a0296* Share/Challenge V1-A: PostgreSQL DoD suite             (rebased)
68843e0* Share/Challenge V1-A: source replay level-field sverka (rebased)
6dcc9a3  Share/Challenge V1-A-fix: rebase→0056, friend-limit symmetry,
         marble-sort adapter, challenge-scoped level bundle
27f5cd5  Share/Challenge V1-A-fix: consolidated review tests
```

(\* — хэши до ребейза, для соответствия внутренним ревью-отчётам; актуальная
цепочка — на ветке.)

Миграция: **`0056_challenge_v1`** (down_revision=`0055_island_p2`),
единственный alembic head, roundtrip `0055↔0056` зелёный.

## Спек-путь (для контекста ревью)

ТЗ прошло 5 раундов Codex spec-review (R1 концепция → R5 GO/PASS, exact
head `436a867`) + post-GO amendment v1.4.1: после stop-the-line V1-A0
(pins не имеет content-addressed контура: pilot policy
`unsupported_runtime_mapping`, нет runtime-contract digest — investigation
record `share-challenge-v1a0-bootstrap-packet.md`) оператор выбрал
**marble-sort-swipe**; прежний V1-A0-гейт растворён — активный release
(`sha256:d66b4e…f9293` / descriptor JCS `b899735e…586be`)
production-активирован 14.07.

## Что реализовано (exact-scope V1-A)

- **Миграция 0056**: `challenge_specs` (composite FK на
  `uq_runtime_releases_configuration_binding` — digest не может расходиться
  с резолвимым release), `challenge_ticket_bindings` (pre-play, пишется в
  run.start), `challenge_spec_bindings` (server-derived projection, ДВА
  composite FK: `(run_id,ticket_id)`→verified_runs +
  `(ticket_id,spec_digest)`→ticket_bindings — cross-ticket подмена
  невозможна по схеме; + новый UNIQUE `(run_id,ticket_id)` на
  verified_runs), `challenge_events` (exactly-once partial-uniques по
  `(challenge_id[,actor,kind])`, request_id/request_digest, shape-CHECK
  friendship_outcome), `challenge_friendship_receipts` (first-writer, FK →
  challenges/users), `challenges.spec_digest` FK; island-CHECK
  `+'challenge'` (та же миграция; downgrade = атомарная конверсия
  `challenge→invite`); append-only триггеры на 5 таблиц.
- **Эндпоинты**: create (порядок validate source → committed replay →
  rate-limit → insert; `request_digest=sha256(JCS(body без
  request_digest))` server-recompute; advisory-fencing без двойного
  списания); GET view/inbox (426 по `X-P4G-Challenge-Wire-Version` на
  spec-bound путях, НЕ на complete; TTL/блок-фильтры); accept (410 TTL,
  блок=404+ноль строк, идемпотентная island-дружба source='challenge' +
  first-writer receipt + dual-write legacy); **run.start
  challenge-discriminator** (`run.start.challenge.v1`, source несёт
  challengeSpec, recipient — только challenge_id, спека server-derived,
  чужая challengeSpec → 409; direct-play: binding+receipt+accept-event
  ОДНОЙ транзакцией; replay возвращает исторический release + сверяет
  клиентские level-поля); `/results` server-derived projection + сверка
  `applied_spec_digest` против ticket-binding (mismatch → 409 до наград);
  complete (committed replay без side-effects/DM); **challenge-scoped
  level bundle** `GET /challenges/tickets/{id}/level-bundle`
  (LevelSpec из challenge_specs+release БЕЗ decision/entry/series identity,
  поверх того же `catalog_required` handshake; owner+binding only).
- **Адаптер marble-sort-swipe**: реестр pluggable; typed-схема =
  существующая executable `sort.level-spec.v1` (`SortLevelParams`), pinned
  schema digest; happy-path PG-тесты на нейтральной fixture (механика —
  данные конфига).
- **Флаг** `ENABLE_CHALLENGE_V1=false`: гейтит ТОЛЬКО создание новых
  v1-объектов; существующие spec-bound маршрутизируются по `spec_digest`
  строки независимо от флага; legacy-путь при OFF — byte-for-byte
  (регресс-тест).
- **Лимит друзей симметричен** (P2-фикс ревью): island
  `_active_invite_friend_count` расширен до `source IN
  ('invite','challenge')` — ЕДИНСТВЕННЫЙ канонический счётчик, параллельный
  хелпер удалён; поведение прод-острова сегодня нейтрально (challenge-рёбер
  нет до flag-on).

## Внутреннее адверсариальное ревью → фиксы

Вердикт: **GO-с-условиями, ноль P1** — 13 векторов атаки на инварианты
пяти спек-раундов, все выдержали (cross-ticket, pre-play, атомарность
direct-play, server-derived recipient-spec, historical replay, блок=ноль
строк, request-fencing, exactly-once, флаг-семантика, downgrade-конверсия,
island-регресс). Условия закрыты `6dcc9a3`/`27f5cd5`:

| Находка | Фикс |
|---|---|
| P2-1 асимметрия лимита (параллельный счётчик вместо расширения island-функции) | единый счётчик source IN ('invite','challenge'); тест «invite-accept при лимите из challenge-рёбер → 409» |
| P3-1 нет конкурентного теста лимита | Barrier-тест: параллельные accept → ровно limit рёбер, один limit-receipt |
| P3-2 SQL-ошибка → откат accept целиком | инъекция ошибки: ни одной строки |
| P3-3 нет byte-for-byte legacy-регресса | флаг-OFF снапшот-тест create/get/accept/complete/inbox |
| P3-4 NOT NULL / чужой request_digest | оба теста добавлены |

## Числа (финальный прогон после фикс-раунда, disposable PG 15)

- Pure suite: **855 passed / 390 skipped / 0 failed**.
- Challenge PG: **31 passed**; adapter pure: **8 passed**.
- Island PG (core+migration): **31 passed, 3 skipped** — без изменений от
  baseline (island в проде; counter-фикс behavior-neutral).
- Full PG: **1173 passed / 57 skipped / 1 failed** — единственный fail =
  предсуществующий wall-clock флейк `agents_m2m` straggler-теста (проходит
  в изоляции; challenge/island таблиц не касается).
- Alembic: единственный head `0056_challenge_v1`, roundtrip зелёный,
  `alembic check` без дрейфа challenge-объектов.

## R5-чекпойнты (все закрыты, с тестами)

1. Direct-play одна транзакция (binding+receipt+accept-event; ошибка
   откатывает всё; complete-без-accept невозможен) ✅
2. Recipient spec server-derived; чужая challengeSpec → 409 ✅
3. Source-replay: сверка клиентских level-полей + исторический runtime ✅
4. FK receipt → challenges/users ✅
5. Happy-path на ephemeral ACTIVE fixture; candidate — negative-path ✅

## Микро-решения для подтверждения Codex

1. **`CHALLENGE_LEVEL_SEED = 0`** (документировано в
   `challenge_bundle_contract.py`): `SortLevelParams` не несёт seed (seed —
   поле envelope `sort.level-spec.v1`); challenge-доски полностью явные
   через `cellColorMap`, seed инертен; конвенция единая для source и
   recipient — `expectedSpecHash` детерминирован.
2. `wire_version` в inbox-элементах — nullable по ТЗ (legacy-строки);
   задокументировано в legacy-регресс-тесте.
3. `specDigest` (6-полевой challenge-digest) и `expectedSpecHash`
   (4-полевой `sort.level-spec.v1.specHash`) — два разных хэша, оба в
   bundle-ответе; не взаимозаменяемы (v1.4.1 §Reconciliation).

## Вне скоупа V1-A (следующие пакеты)

- **V1-B (клиент)**: sibling-binder поверх `catalog_required` handshake,
  применение уровня получателем, `applied_spec_digest` в /results,
  `share_tap`, `challenge-rail.ts` отдельным модулем, JCS golden vectors
  Python↔browser; координация `feed.ts` с island-направлением.
- **V1-C**: prepared inline message (best-effort), SQL K-фактора/acceptance.
- Production deploy / flag-on — человеческие гейты (R5).

## Codex implementation-review R1 → fix round (эвиденс для diff-only R2)

Codex R1 (`p4g-workspace-meta`, ветка `codex/challenge-v1a-review`
@9c39f0b): NO-GO, 4 P1 + 1 P2, все воспроизведены его adversarial-пробами
(5/5 red). Микрорешения приняты (SEED=0, два digest'а, nullable
wire_version — PASS). Все пять закрыты; **новый exact head:
`6aaad66`** (коммиты `6c713fe` фиксы + `6aaad66` regression-тесты по
пробам). Harness верифицирован ревертом одного фикса (проба снова red).

| Находка | Фикс | Тест (red-then-green) |
|---|---|---|
| P1-1 source mechanic не замкнут на playableId | server-owned `mechanic_id` в манифесте адаптера; mismatch → 409 `challenge_source_mechanic_mismatch` до любых записей | `test_r2_p1_source_mechanic_must_match_playable` |
| P1-2 /complete: replay не exact + повторный DM | fenced `_v1_complete` под advisory-локом (challenge, actor): response-снапшот + серверный digest на complete-событии; committed replay = byte-identical, ноль мутаций/DM (в обход block/expiry — исторический ответ); side-effects только при первой записи | `test_complete_exact_replay_one_dm_and_wrong_body`, `test_r2_concurrent_complete_replay_one_dm` |
| P1-3 level-bundle доступен после block | двусторонний block-guard в producer → 404 (source-тикет владельцу доступен) | `test_r2_p1_level_bundle_blocked_pair_404` |
| P1-4 flag-off блокировал replay source-тикета | тикет резолвится ДО гейта: existing → replay работает при OFF (historical release); новый source при OFF → 409 | `test_r2_p1_flag_off_allows_source_ticket_replay` |
| P2-1 receipt не терминален для графа | единый receipt-first helper `apply_challenge_friendship_once` (accept / recipient run.start / complete-fallback): существующий receipt → сохранённый outcome БЕЗ мутаций графа; удалённая дружба не воскресает | `test_r2_p2_friendship_receipt_is_terminal_no_resurrect` |

Числа после фикс-раунда: pure **855/0**; challenge PG **36** + adapter
**8**; island PG **31** (без изменений); **full PG 1179 passed / 0
failed** (включая ранее флейковый agents_m2m-тест).

## Codex diff-review R2 → fix R3 (эвиденс для финального diff-only от 6aaad66)

Codex R2 (ветка `codex/challenge-v1a-r2-review` @2afc8e6): NO-GO, 2 P1
(3 из 5 R1-фиксов полностью, 2 частично). Оба закрыты; **новый exact
head: `266bd5f`** (один узкий коммит: фиксы + тесты; миграция/схема не
тронуты — ровно R3-скоуп).

| Находка | Фикс | Red-then-green |
|---|---|---|
| P1-1: plain-тикет обходил flag-off и мог ретроактивно стать v1 | трёхветочная классификация в `_start_challenge_source` ДО любых вставок, гейт по доказанному immutable binding (не по существованию тикета): ticket+binding → exact-replay (ON и OFF); ticket без binding → НАВСЕГДА legacy, typed 409 `challenge_ticket_not_bound` (ON и OFF); нет тикета → создание за флагом, ticket+spec+binding рождаются вместе | `test_r3_plain_ticket_never_retrofits_to_v1` (red на 6aaad66-коде, green после) + 4 требуемых кейса классификации |
| P1-2: complete-digest без tz_offset_minutes — изменённый запрос проходил как exact replay | `complete_identity_digest` = sha256(JCS(полного normalized `CompleteIn.model_dump`)) — каждое принятое поле в identity; дрейф полей структурно невозможен + `test_complete_identity_digest_covers_every_field` | `test_r3_complete_digest_covers_effectful_timezone` (red на двухполевом digest, green после); изменённый tz после блока → 404, без блока → 409; exact replay byte-identical + один DM |

Числа: pure **856/0**; challenge PG + adapter **47**; island PG **31**
(без изменений); **full PG 1182 passed / 0 failed**.

## Codex diff-review R3 → fix R4 (финальный exact head)

Codex R3 (@7c5218fa): NO-GO, один узкий P1 — гонка первого source
run.start (2 конкурентных запроса, один ticket_id, разные spec → 2
успеха / 1 binding / 2 spec-строки). Закрыт; **новый exact head:
`f98d338`** (один коммит; ветка ребейзнута на `origin/master@01d3bf2` —
island theme-sync removal, конфликтов нет).

- **Фикс:** `source_ticket_advisory_lock` — `pg_advisory_xact_lock` по
  ticket_id ДО первого чтения RunTicket и любых вставок; проигравший
  ждёт коммита победителя, re-read binding под локом → трёхветочный
  replay-путь (same spec → exact replay; different → 409
  `challenge_spec_mismatch`); spec upsert/bind только на ветке
  победителя → ноль orphan-spec; проигравший не тратит run-start юнит.
- **Red-then-green:** снятие одной fence-строки → проба Codex красная
  3/3; восстановлено → green. Тесты:
  `test_r4_concurrent_first_source_same_spec` (оба успеха byte-identical,
  ровно 1 ticket/binding/spec) и `..._different_spec` (1 успех + 1 typed
  409, ноль orphans) — реальные SessionLocal + Barrier.
- **Числа:** pure **856/0**; challenge+adapter+island PG **98 passed**;
  full local PG **1182 / 0 failed**.
- **Combined GitHub CI на exact head `f98d338`: SUCCESS** — Full
  PostgreSQL acceptance, reverse-drift goldens, 16 migration-roundtrip
  джобов (вкл. island-p2-0055; ранее в этой секции ошибочно значилось
  17 — doc-nit Codex R4, исправлено).

## Codex diff-review R4 → fix R5 (ФИНАЛЬНЫЙ exact head)

Codex R4 (@0cd5ba6d): NO-GO, один P1 — plain run.start был вторым
uncatalogued-писателем run_tickets вне забора (spec-bound тикет
реплеился через legacy wire; plain first-create мог вклиниться и стать
v1 постфактум). Закрыт; **финальный exact head: `3d9280c`**.

- **Фикс:** `source_ticket_advisory_lock` →
  **`uncatalogued_ticket_advisory_lock`** (`run-ticket:{ticket_id}`),
  берётся ОБОИМИ путями (v1 source И plain) в одной точке — единый lock
  order, interleave невозможен. Классификация под забором тотальна:
  source+binding → exact replay; source без binding → 409
  `challenge_ticket_not_bound`; **plain+binding → 426
  `challenge_client_upgrade_required`, ноль мутаций** (spec-bound тикет
  реплеится только v1-wire); plain без binding → legacy replay; новый
  тикет рождается ровно в одном контуре.
- **Red-then-green:** реверт fence — проба A красная последовательно,
  проба B красная 4/4 конкурентно; восстановлено → green. Тесты:
  `test_r5_spec_bound_ticket_rejects_plain_wire_replay` (426, ровно
  1 ticket/binding/spec) и `test_r5_concurrent_plain_vs_source_first_create`
  (Barrier: plain-победа → тикет навсегда unbound + source 409; source-
  победа → bound с рождения + plain 426; НИКОГДА retrofit; 6× стабильно
  на обоих исходах). R4-тесты source↔source остаются зелёными.
- **Числа:** pure **856/0**; challenge+adapter+island PG **100 passed**;
  full local PG **1184 / 0 failed**.
- **Combined GitHub CI на `3d9280c`: SUCCESS** (run 30168484283; Full
  PG acceptance + reverse-drift + 16 migration-roundtrip джобов).

## Reproduce

Ветка `challenge-v1`; suites: `pytest -q` (pure);
`RUN_CONTROL_PLANE_POSTGRES_TESTS=1 pytest tests/test_challenge_v1_postgres.py`;
`RUN_ISLAND_SOCIAL_MIGRATION_TESTS=1 pytest
tests/test_island_social_core_migration_postgres.py`; roundtrip
`alembic upgrade head` / `downgrade 0055_island_p2`.

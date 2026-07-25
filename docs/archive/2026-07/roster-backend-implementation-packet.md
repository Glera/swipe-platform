# Roster-backend (ТЗ-A, серверная половина) · read-only implementation packet

Статус: **архивный implementation packet; реализация завершена и независимо
принята 16.07.2026.** Backend зафиксирован в `swipe-backend` `373559c`, client
wire — в `feed-prototype` `c0d667a` + `d61f77d`. Актуальный контракт и оставшиеся
enable-гейты ведутся в `swipe-backend/docs/specs/feed-roster-config.md`:
physical PostgreSQL CI, deploy с флагом false и operator composer/auth. Текст
ниже сохранён как provenance исходного плана и больше не является инструкцией
к старту новой миграции.

## 1. Схема (миграция `0035_feed_roster_config`)

### `feed_roster_configs` — immutable зарегистрированный состав

| колонка | тип | инвариант |
|---|---|---|
| roster_id | UUID PK | |
| roster_hash | String(64) UNIQUE | `sha256(JCS({schema:'feed.roster-config.v1', entries:[{builtinMappingId},…]}))` — identity ТОЛЬКО ordered builtinMappingId (подтверждено каноническим golden) |
| schema | String(48) | CHECK `= 'feed.roster-config.v1'` |
| document | JSONB | CHECK object + `->>'schema' = schema` + `->>'rosterHash' = roster_hash`; полный ordered entries c exact-ключами |
| registered_by / registered_at | String(128)/timestamptz | CHECK non-empty; `_now()` |

- Append-only trigger (BEFORE UPDATE OR DELETE → RAISE), паттерн 0033.
- Повторная регистрация того же hash = идемпотентный возврат существующей
  строки (сравнение document побайтово, конфликт → 409), паттерн
  `register_content_demand_thresholds`.

### `feed_roster_entries` — нормализованное замыкание состава

| колонка | тип | инвариант |
|---|---|---|
| roster_id | FK configs | PK(roster_id, position) |
| position | Integer | CHECK 1..24; UNIQUE(roster_id, position) через PK |
| builtin_mapping_id | UUID | FK → `feed_mechanic_mappings.mapping_id`; UNIQUE(roster_id, builtin_mapping_id) — дубликаты механик в ростере запрещены |

- Guard-trigger регистрации (паттерн 0021 activation guard, FOR SHARE):
  каждый entry разрешается в существующий mapping; порядок entries в document
  побайтово равен порядку positions (проекция пинится триггером).
- Mapping state НЕ проверяется при регистрации (реестр может хранить будущий
  состав); проверяется при активации.

### `feed_roster_activations` — линейная CAS-цепочка, единственный leaf

| колонка | тип | инвариант |
|---|---|---|
| activation_id | UUID PK | |
| roster_id | FK configs | |
| previous_activation_id | UUID NULL, FK self | **UNIQUE** — цепочка линейна; loser CAS-гонки падает на constraint |
| genesis | — | partial unique index `WHERE previous_activation_id IS NULL` — один корень |
| deploy_manifest_digest | String(64) | digest production `versions.json`, который видел оператор; CHECK hex64 |
| intervention_id | UUID FK → interventions | NOT NULL — активация атомарно пишет intervention-строку в той же транзакции |
| activated_by / reason / activated_at | | CHECK non-empty; reason ≤512 |

- Активный ростер = единственная activation без наследника
  (`NOT EXISTS successor`), НЕ `max(activated_at)` — wall-clock не авторитет
  (принятое решение 15.07).
- Activation guard-trigger: каждый mapping ростера обязан быть `state='active'`
  под FOR SHARE на момент активации; retired в составе → отказ.
- Append-only; rollback = новая активация предыдущего roster_id, не UPDATE.

### `feed_decisions.roster_activation_id` — nullable колонка + FK

- Добавляется nullable, v1-решения остаются NULL (legacy). Индекс по
  (roster_activation_id) для ТЗ-C позиционных разрезов.
- ВНИМАНИЕ ПРИ РЕБЕЙЗЕ: если 0034 тоже трогает `feed_decisions` — проверить
  отсутствие конфликтов имён/индексов.

## 2. CAS-семантика активации

```
activate(roster_id, expected_current: activation_id | none, reason, manifest_digest):
  tx: advisory lock (single key) →
      current = leaf | none;
      if current != expected_current → 409 cas_mismatch (без ретрая внутри);
      insert activation(previous=current) + intervention row;
      guard-trigger валидирует active mappings;
  конкурентная гонка: проигравший ловит UNIQUE(previous_activation_id)
  → 409 + инструкция перечитать current.
```

## 3. `/session` проекция (за `ENABLE_FEED_ROSTER_CONFIG=false`)

- Флаг off ИЛИ нет активаций → поле `feedRoster` отсутствует (клиент обязан
  вести себя как со старым сервером — правило деградации 3 ТЗ-A).
- Иначе: `{schema, activationId, rosterHash, entries:[{builtinMappingId,
  playableId, variantId, catalogMechanic, mappingDigest, mappingState}]}` —
  entries читаются JOIN-ом из exact mapping rows (playableId =
  source_playable_id и т.д.); `mappingState` — mutable availability, ВНЕ
  identity; rosterHash пересчитывается на лету по ordered ids и обязан
  совпасть со stored (integrity assert, не доверие колонке).

## 4. CP: `builtin_feed_decision_v2`

- Payload `{decision_id, mapping_id, roster_activation_id, feed_position}`
  (contract класс уже заготовлен клиентом: `BuiltinFeedDecisionPayload` +
  staged `buildBuiltinFeedDecisionV2` в c0d667a).
- Сервер: activation существует И mapping ∈ entries её roster — иначе
  `_RejectedProjection('roster_mapping_not_in_activation')`. Активация НЕ
  обязана быть текущим leaf (клиент легитимно доигрывает сессию на прошлой
  активации — «смена со следующей сессии»).
- Duplicate-ACK возвращает статус оригинала; конфликт полей → rejection
  (паттерн `_project_builtin_decision` v1).
- FeedDecision пишется с roster_activation_id; snapshot несёт feed_position.

## 5. Операторский CLI `app/feed_roster.py` (без HTTP-write)

- `--register entries.json` — dry-run: валидация schema/JCS/mapping-замыкания,
  diff против текущего активного, печать rosterHash; `--apply` персистит
  registration (за флагом).
- `--activate <roster_id> --expected-current <id|none> --reason … 
  --deploy-manifest <path>` — dry-run diff; `--apply` требует
  `ENABLE_FEED_ROSTER_CONFIG=true`; digest манифеста пишется в activation.
- Паттерн: content_analytics CLI (dry-run-first) + runtime_release_bootstrap
  (dry-run → apply, no HTTP hook).

## 6. Golden-инварианты (общий канон, копии запрещены)

Тест читает `docs/specs/fixtures/feed-roster-session-v1.golden.json` НАПРЯМУЮ:
1. `jcs_bytes(identityInput) == expectedIdentityJcs` (байты);
2. `jcs_sha256(identityInput) == expectedRosterHash == sessionProjection.rosterHash`;
3. seed трёх mappings из golden → построенная `/session`-проекция побайтово
   равна `sessionProjection` (shape-parity с клиентской половиной);
4. изменение порядка entries меняет hash; изменение playableId — НЕ меняет.

## 7. PG acceptance матрица (opt-in, auto-discover в CI)

- CAS-гонка: две конкурентные активации → ровно один winner, loser 409 на
  UNIQUE(previous); genesis-гонка → один корень (partial unique).
- Активация с retired mapping → отказ guard-trigger.
- Атомарность activation+intervention: сбой между ними невозможен (одна tx).
- v2-декизия: mapping не из activation → rejected projection, dead-letter путь.
- Append-only триггеры всех трёх таблиц; guarded downgrade при данных.
- Migration roundtrip base→0035→base (пустая) зелёный.
- `/session` при off-флаге не несёт feedRoster (регресс старых клиентов).

## 8. Файлы (план: ~9 файлов, один коммит)

```
migrations/versions/0035_feed_roster_config.py        (new)
app/models.py             (+3 таблицы, +feed_decisions.roster_activation_id)
app/feed_roster.py        (new: service + CLI)
app/api_session.py        (feedRoster projection за флагом)
app/api_control_plane.py  (builtin_feed_decision_v2 projection)
app/control_plane_contract.py (payload v2)
app/config.py + .env.example + render.yaml (enable_feed_roster_config=false)
tests/test_feed_roster.py / test_feed_roster_golden.py /
tests/test_feed_roster_postgres.py                    (new)
docs/specs/feed-roster-config.md (status update отдельным doc-коммитом)
```

## 9. Чек перед стартом (после handoff 0034)

1. `alembic heads` = ровно `0034_three_level_production_evidence`.
2. diff 0034: пересечения в models/config/main/api_session/api_control_plane?
3. tree чистый, никаких чужих WIP в перечисленных файлах.
4. Канонический golden не изменился (byte-check против identityInput).

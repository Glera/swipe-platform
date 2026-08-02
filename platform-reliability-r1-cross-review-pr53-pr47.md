GO WITH CONDITIONS

# Кросс-ревью связки: meta PR #53 + backend PR #47 (перед Gate C)

- Дата: 02.08.2026. Reviewer: Claude (Fable 5); author = Codex — author ≠ reviewer соблюдён.
- Meta PR #53 exact head: `5d1a3158b81844b36f96fbe7cd49e7db8d84ea1d`
  (codex/platform-reliability-r1-render-delegated-credential).
- Backend PR #47 exact head: `01409e41bcaa36e981593a9da1d990fa4dc4c3ae`
  (codex/r1-alembic-metadata-indexes).
- Diff-only, read-only: реализационные ветки не изменялись.

## Вердикты

- **Backend PR #47 — GO.** Мержить можно как есть.
- **Meta PR #53 — GO WITH CONDITIONS.** Merge разрешаю; условие привязано к
  Gate C (ниже), не к merge.

## Backend PR #47 — проверено

1. Оба ORM-объявления сверены с DDL миграций буква в букву:
   - `uq_admission_receipts_one_published`: 0047 создаёт
     `["entry_id"], unique=True, postgresql_where=sa.text("decision = 'published'")`
     (migrations/versions/0047_catalog_risk_admission.py:142) — ORM-декларация в
     `CatalogAdmissionReceipt.__table_args__` идентична, включая текст предиката.
   - `ix_island_bake_jobs_private_identity`: 0057 создаёт
     `["user_id","rel","content_digest"], unique=False`
     (migrations/versions/0057_island_closed_delivery.py:44) — идентично.
2. `text` уже импортирован в app/models.py; дубликатов имён индексов нет
   (импорт моделей в тестах прошёл бы с ошибкой).
3. Новый тест закрывает load-bearing атрибуты: uniqueness, exact columns,
   exact predicate, имена. Негативной стороны здесь не требуется — источник
   правды полноты — сам read-only `alembic check` против прода, который и
   выявил ровно эти два индекса; терминальный receipt этого check остаётся
   заявленным условием Gate C (в самом PR), не этого ревью.
4. Побочный эффект в плюс: metadata-driven `create_all` тест-схемы теперь
   включают partial-unique — ближе к проду. CI: 26/26 на exact head, включая
   Full PostgreSQL acceptance и все migration roundtrips.
5. Никакой миграции, никакой прод-мутации — подтверждаю по диффу.

## Meta PR #53 — findings

1. **[P2, условие Gate C] Delegated-аудит не смотрит прямые ACL-гранты на
   session-роль.** Вся capability-поверхность снимается от лица effective
   user: каждый privilege-record — `has_*_privilege(current_user, …)`
   (scripts/platform-reliability-r1-db-capability.sql: relation/column/
   sequence/routine/type/schema/database блоки), `defaultAcl` и `setting`
   отфильтрованы по `current_user`. Новый `sessionCredential`-wrapper
   проверяет role attributes, `rolconfig` и **memberships** — но не ACL.
   Прямой `GRANT SELECT ON <table> TO <session_role>` (и любой другой
   object-grant на свежую роль) не виден нигде: это не membership, не
   attribute, не rolconfig — а после `RESET ROLE` это живая authority
   credential'а (current_user возвращается к session_user, и действуют его
   собственные гранты). Такая rotation даёт `profilesEqual=true,
   rotationMode=delegated-effective-role-preserved` при фактически более
   широкой поверхности — прямое расхождение с заявленным «without accepting
   hidden or broader authority». Старый comparator (v1) на этом классе просто
   fail-closed'ился целиком, так что v2 — это ослабление, и его граница
   должна быть герметичной. После rotation старая credential отключается, то
   есть скрытый грант жил бы бессрочно.
   **Фикс (небольшой, в том же стиле):** в sessionCredential-захват добавить
   enumeration ACL-записей, где grantee = session-роль, по
   `pg_database.datacl`, `pg_namespace.nspacl`, `pg_class.relacl`,
   `pg_attribute.attacl`, `pg_proc.proacl`, `pg_type.typacl` (+
   `pg_default_acl`, где session-роль — grantee, и `pg_db_role_setting` для
   session-роли), и в delegated-ветке требовать: множество пусто ЛИБО ровно
   `CONNECT` на текущую базу (легитимной login-роли CONNECT нужен — напрямую
   или через PUBLIC; PUBLIC-грант в enumeration не попадает, так что exact
   допуск = {database CONNECT}). Плюс негативные тесты: прямой table-grant →
   fail; database CONNECT → pass.
2. **[P3] Непокрытые негативы в новом тесте.** Цикл негативов проверяет
   superuser / лишний roleConfig / три coverage-флага, но не
   `currentRoleMembership: false` и не `login: false` — обе ветки реализованы
   в parseProfile, но не закреплены тестом.
3. **[P3] Версионирование comparison-документа.** `PROFILE_SCHEMA` поднят до
   v2, но `COMPARISON_SCHEMA` остался `…comparison.v1`, при этом в результат
   добавлены обязательные поля (`rotationMode`, `old/newEffectiveUserSha256`)
   и **сменилась семантика** `oldUserSha256/newUserSha256` (были hash
   effective user, стали hash session user). Для старых прямых профилей
   значения совпадают, но контракт документа изменился — поднять до v2 или
   явно зафиксировать в runbook.

## Meta PR #53 — проверено без замечаний

- Fail-closed сохранён по всей новой ветке: ровно один sessionCredential-row
  (0 или 2+ → fail), exact keys, typed поля, `delegated` сверен с фактическим
  `session_user != current_user`, отсутствие строки от `WHERE rolname =
  session_user` (роль исчезла) → count-fail.
- Delegated-условия корректны и взаимно согласованы: запрет privileged
  attributes; `roleConfig` — canonical exact `['role=CURRENT_EFFECTIVE_USER']`
  (нормализация в SQL завязана на фактический `current_user`, т.е. на
  сохранённого effective); `currentRoleMembership` требует прямого членства в
  effective (иначе `role=` при логине и не сработал бы); транзитивные
  memberships покрыты корректно — `pg_has_role(current_user, …, 'MEMBER')`
  транзитивен, значит покрытие прямых членств session-роли покрывает и их
  замыкание; admin-option прямых членств запрещён.
- compareProfiles: session users обязаны различаться; одинаковый effective →
  new обязан быть delegated; разные effective → delegated запрещён с обеих
  сторон (нельзя замаскировать смену effective под provider-паттерн). Повторная
  rotation (old тоже delegated, effective сохранён) проходит — правильно.
- Privacy-инвариант сохранён: в comparison — только sha256, тест
  `doesNotMatch /old_user|new_user|swipe_55ht/` остался и проходит.
- `search_path`/`row_security` снимаются live (`current_setting`) — hostile
  значения из per-DB настроек session-роли отразились бы в byte-compare
  effective-блока. Per-DB `role=` для session-роли сменил бы effective user и
  упал на сравнении users.
- Runbook-правка честно описывает новую границу допуска; CI meta-verify +
  postgres-16-capability-proof зелёные на exact head.

## Условие Gate C (единственное блокирующее)

До принятия rotation-receipt Gate C: закрыть P2 (ACL-by-grantee для
session-роли, допуск ⊆ {database CONNECT} + негативные тесты) и повторить
live-сравнение на операторском /32 — ЛИБО оператор явно принимает bounded
deviation в тексте Gate C receipt (с формулировкой «прямые object-grants на
session-роль не аудируются»). P3 №2–3 — вместе с этим же патчем или следом,
Gate C не блокируют.

Merge обоих PR и подготовка Blueprint preview — разрешены сейчас.

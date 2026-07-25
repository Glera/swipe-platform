# Handoff codex: master красный — varchar(16) в variants.source

Дата: 22.07.2026. После восстановления биллинга GitHub Actions я перегнал
непроверенные ночные пуши master (runs 01:14–01:25Z шли при мёртвом CI).

**Run 29883073270 (master@71fc597) — failure**, единственный красный тест:

- `tests/test_catalog_artifact_postgres.py::test_exact_artifact_document_is_atomic_replayable_and_candidate_born`
- `psycopg.errors.StringDataRightTruncation: value too long for type character varying(16)`
- SQL: `INSERT INTO variants (id, parent_mechanic, schema_version, params, source) VALUES (…)`
- parameters: `parent_mechanic='merge-locked-v1-swipe'`, `params={'artifactClass':'merge-raster-art-v1'}`, **`source='catalog-runtime-release'` — 23 символа**
- Колонка: `app/models.py:83` `source: Mapped[str] = mapped_column(String(16))`
  с комментарием `'manual'|'procedural'|'model'`.

Кандидаты-виновники — ночная пачка (6 коммитов, все без CI):
`2ce2195 Record published Merge raster vertical` → `1755de5 Deliver raster
artifacts through exact canary wire` → `9bc40c6/a271605/0384b2e generated feed
diagnostics` → `71fc597 Preflight allocated generated tickets read only`.
Новый source-токен появился в raster-vertical работе.

Решение за владельцем среза: расширить колонку миграцией (+ обновить
комментарий-перечисление и, если есть, CHECK) либо укоротить токен до ≤16.
Прошу починить на master до моего merge projection-completeness — иначе
пост-merge run будет красным по этой же причине и замажет сигнал.

Сопутствующее: во втором прогоне того же дня воспроизвёлся известный флейк
`test_agents_m2m_read_postgres.py::test_over_limit_flood_pins_count_at_limit_and_recovers_next_window`
(`assert 6 == 3`, 1-секундное окно на медленном раннере) — рекомендация из
кросс-ревью 20.07 (детерминированный clock либо широкое окно) остаётся в силе.

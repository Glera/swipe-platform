# R1 isolated restore-drill — квитанция

- Дата: 2026-08-04 UTC. Исполнитель: Claude (Opus 5). Прод — только чтение.
- Клиент: PostgreSQL 16.14 (Homebrew `postgresql@16`), установлен ДО чтения credential.
- Учётные данные: `~/.pgpass` + `PG*`-переменные. URL в argv не попадал.

## Снимок прода (read-only)

| Параметр | Значение |
| --- | --- |
| server_version_num | `160014` (PostgreSQL 16.14) |
| alembic revision | `0070_published_test_delivery` |
| таблиц в public | 146 |
| размер БД | 45 MB (46 808 087 байт) |
| расширения | только `plpgsql` |
| encoding / collate | UTF8 / en_US.UTF8 |

## Дамп

- Формат custom, **с владельцами и ACL** (отброшены при восстановлении, а не при снятии).
- Размер 3 388 554 байт, объектов в оглавлении 1401, время 1 мин 13 с.
- `sha256 = ef138c93f85683f1f091650fdd2a8394b1153f12fea93d31d5fae9d358ef3c31`
- Вторая копия снята, хэши совпадают.
- `pg_dumpall --globals-only --no-role-passwords -l <db>`: 60 строк, 5 `CREATE ROLE`.
  **Роли захвачены, но не восстанавливались и не проверялись** — drill доказывает
  schema/data restore, не role-authority restore.

## Восстановление

Изолированный кластер PG16 **без TCP вообще** (`-h ''`, только unix-сокет) —
строже, чем `127.0.0.1`. Локальный сервер `160014`, совпадает с продом побайтово по мажору.

| Проверка | Прод | Копия |
| --- | --- | --- |
| alembic revision | `0070_published_test_delivery` | совпадает |
| таблиц в public | 146 | 146 |
| индексов | — | 503 |
| размер | 45 MB | 42 MB (нет мёртвых кортежей) |

`pg_restore --no-owner --no-privileges --exit-on-error` → **код 0**.

## Эксперимент 1: код возврата pg_restore

Утверждение рунбука, что обычный `pg_restore` завершается успешно при
игнорируемых ошибках, **опровергнуто**. Восстановление без `--exit-on-error`
при 251 проигнорированной ошибке вернуло **код 1**. Возражение Codex R1 верно.
`--list` при этом действительно ничего не доказывает — эта часть находки в силе.

## Репетиция миграции 0070 → 0073

На восстановленной копии, из чистого worktree `origin/master` = `1b145d4`
(`app` резолвится из master, не из устаревшего чекаута `6a526ac`).

- `0070 → 0071_mission_slice_core → 0072_mission_ops_receipts → 0073_platform_release_receipts`
- **1.4 секунды** на реальных данных. Не backfill.
- Итог: `0073_platform_release_receipts`, 160 таблиц (+14).

## Эксперимент 2: TRUNCATE сквозь append-only guard

Находка Codex R1 №5 **подтверждена прямым опытом**, а не чтением.

- **ПОПРАВКА 04.08.2026.** Первоначально здесь стояло «все `mission_*` триггеры
  стерегут ровно `DELETE+UPDATE`, значит `TRUNCATE` не покрыт», со ссылкой на
  `information_schema.triggers`. **Эта улика недействительна:**
  `information_schema.triggers` не показывает TRUNCATE-триггеры вообще — в
  стандарте SQL такого события нет. Проверено прямым опытом: таблица, у которой
  есть работающий `BEFORE TRUNCATE` guard, в этом представлении выглядит
  ПУСТОЙ, а `TRUNCATE` по ней отбивается. Отличить защищённую таблицу от
  незащищённой этим запросом **нельзя**; нужен `pg_trigger` и `tgtype & 32`.
  Вывод ниже устоял только на второй улике — на фактически прошедшем `TRUNCATE`.
- `TRUNCATE` на листовой `mission_contribution_allocations` → `TRUNCATE TABLE`, успех.
- `TRUNCATE ... CASCADE` на `mission_case_bindings` → каскад дошёл до `mission_runtime`,
  то есть до seed-строки миграции 0071.

Таблицы пусты (namespace default-off), данные не пострадали — прошла именно авторизация.
Это дефект миграций Stage 1, а не пути деплоя; чинится отдельно
`BEFORE TRUNCATE FOR EACH STATEMENT` guard'ами и негативными тестами.

Квитанция — evidence, не authority.

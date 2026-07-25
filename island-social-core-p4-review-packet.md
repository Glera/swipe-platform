# Island Social Core — P4 (async /island/theme) review packet

Дата: 24.07.2026. Пакет P4 по ТЗ `swipe-backend/docs/specs/island-social-core.md`
v1.3 §5.1 (SPEC GO от Codex R2). Автор кода — Opus-субагент, внутреннее
адверсариальное ревью — независимый субагент (author≠reviewer), оркестрация —
Claude (главная сессия). Готов к независимому Codex-ревью реализации.

## Ветки / коммиты (стыкованы ПОВЕРХ island-social-core-p1)

- **Backend** `swipe-backend`, ветка `island-theme-async`
  (base = `origin/island-social-core-p1`):
  - `802fdf4` Island Social Core P4: async theme (миграция 0052, dual-mode
    endpoint, runner, receipts, client contract)
  - `23028f3` Island Social Core P4-fix: адверсариальное ревью
- **Client** `feed-prototype`, ветка `island-theme-async`
  (base = `origin/island-social-core-p1`):
  - `bfd26d2` Island Social Core P4: dual-mode aiTheme + job polling
  - `9e3f7a3` Island Social Core P4-fix: адверсариальное ревью
- Master нигде не пушился; деплоя/enable не было. ВНИМАНИЕ ревьюеру: ветка
  стыкована поверх P1 ДО его Codex-фикс-раунда (база — `bb8430b`); после GO
  обоих пакетов при merge потребуется обычный rebase/merge поверх
  актуального P1 (`305505e+`), конфликтная поверхность — 4 файла, оценена
  внутренним ревью как manageable.

## Что реализовано (контракт §5.1)

- **Dual-mode один релиз:** sync 200 pack — поведение по умолчанию,
  бит-в-бит прежнее; async 202 `{job_id}` по заголовку
  `X-Island-Theme-Async` / `?async_mode=true` / конфигу
  `island_theme_async_enabled`. Sync-ветка сохранена (удаление — шаг после
  деплоя, гейт Части B VISION-патча).
- **Серверный kill-switch (из ревью):** `island_theme_force_sync`
  (default false) перекрывает и конфиг, и клиентский opt-in — оператор
  выключает async без редеплоя клиента.
- **Миграция 0052** — `island_theme_jobs` (request_digest, attempts,
  attempt_receipts, cancel_requested, lease_owner/expires, статусы
  queued|generating|ready|failed, partial-unique по digest WHERE
  нетерминальный). Roundtrip up/down проверен. Примечание: ТЗ §2.1 относил
  таблицу к P1-миграции, но 0050 явно отложила её к P4 — дом таблицы 0052,
  решение оркестратора.
- **Digest-дедуп:** sha256(JCS({user, prompt, preferences})); advisory
  xact-lock по юзеру + partial-unique; нетерминальный повтор POST → тот же
  job (lost-202 safe), терминальный → легальный реролл. IntegrityError-
  фоллбэк: rollback (включая списание), возврат победителя.
- **Quota once:** списывается один раз при создании job; дубль/фоллбэк не
  списывают повторно (тесты, включая Barrier-гонку двух POST).
- **Lease/fencing:** claim только queued/истёкшей lease (SKIP LOCKED),
  owner-token re-check; reclaim с attempts>0 → `failed(interrupted)` без
  второго физического прогона.
- **Receipt до модельного вызова** — отдельной транзакцией строго до I/O;
  крэш между receipt и вызовом → interrupted, spend bounded.
- **Cancellation:** `DELETE /island/theme/{job_id}` идемпотентен; финализация
  раннера — `SELECT … FOR UPDATE` + re-assert
  `status=='generating' AND lease_owner==owner AND NOT cancel_requested`
  в той же транзакции (фикс P2-1 ревью).
- **Exact replay:** GET ready всегда отдаёт canonical-сериализованный pack —
  byte-identical между вызовами.
- **Клиент:** `aiTheme` понимает оба режима; job_id персистится per-slot
  (localStorage, зеркало bake-паттерна) — reload резюмит поллинг, повторная
  генерация того же промпта после терминала не двоит списание (фикс P3-1).

## Внутреннее адверсариальное ревью → фиксы

Вердикт ревью: GO-с-условиями; ноль P1. Все условия закрыты
`23028f3`/`9e3f7a3`:

| Находка | Фикс | Доказательство |
|---|---|---|
| P2-1 гонка cancel↔finalize (слепой UPDATE мог перезаписать cancelled → ready) | FOR UPDATE + re-assert в терминальной транзакции | интерливинг-тест `test_cancel_interleaved_between_read_and_write_wins`, **red-then-green** на pre-fix коде |
| P2-2 нет серверного рубильника (клиентский заголовок включает async навсегда) | `island_theme_force_sync` | `test_force_sync_overrides_client_optin` |
| P3-1 job без persist → двойное списание после reload | per-slot handle + resume | клиентский путь, tsc/build |
| P3-2 dedup-insert без IntegrityError-фоллбэка | одна транзакция consume+insert, rollback+re-select | 2 теста (детерминированный hook + Barrier-гонка) |

Ревью проверило без находок: digest-гонки, quota-once, receipt-before-call,
bounded spend на reclaim, byte-identical replay, идемпотентность DELETE,
чистоту sync-режима (VISION принцип 2 — новых синхронных модельных путей
нет), миграционную цепочку 0049→0052.

## Числа (финальный прогон после фиксов)

- Theme PG suite: **14 passed** (10 + 4 фикс-раунда).
- Theme + island PG вместе: **50 passed** (регрессий P1-веток нет).
- Полный pure: **842 passed / 311 skipped / 0 failed**.
- Клиент: tsc чисто, vite build зелёный.

## Задокументированные решения / известные ограничения

1. **Attempt-семантика:** один durable attempt = один вызов
   `_anthropic_theme` (внутри ≤2 физических вызова с adherence-retry под
   одним receipt); reclaim никогда не перезапускает модель (bounded spend
   приоритетнее liveness). Receipt пишет `attempts:1` при ≤2 внутренних
   вызовах — гранулярность receipt не совпадает с формулировкой §5.1
   «attempts=2», спенд при этом bounded ровно как требует спека.
2. **ORM int4 `user_id`** у `IslandThemeJob` — конвенция `IslandBakeJob`;
   таблица строится миграцией (BigInteger), `create_all` не использовать.
3. Async-режим включается клиентским opt-in до серверного дефолта — гейт
   оператора: `island_theme_force_sync` (см. выше).
4. После деплоя P4 и удаления sync-ветки: применить Часть B VISION-патча
   (удалить легаси-оговорку целиком; факт — в IMPLEMENTATION-STATUS/git
   history), отдельным решением оператора.

## Вопросы Codex'у (R1)

1. Достаточен ли интерливинг-тест cancel↔finalize (hook+two-threads) как
   доказательство отсутствия окна, или требуется дополнительный
   multi-worker сценарий?
2. Fingerprint дедупа не включает модель/effort (они серверные) — согласны,
   что смена `island_theme_model` в конфиге легитимно НЕ инвалидирует
   нетерминальные jobs?
3. ~~Приемлема ли документированная attempt-гранулярность receipt~~ —
   отвечено Codex R1 (отклонено), закрыто фикс-раундом ниже.

---

## Codex R1 fix round (эвиденс для diff-only R2)

Codex R1 (`p4g-workspace-meta@3043ed5`): NO-GO, 2 находки. Обе закрыты;
**новые heads: backend `434f4c0`, клиент `94f4eaf`** (ветки
`island-theme-async`, запушены).

| Находка | Фикс | Доказательство |
|---|---|---|
| F001 (P1): один receipt покрывал до двух физических Anthropic-вызовов | adherence-цикл поднят на уровень executor: извлечён single-call юнит `_single_theme_call`; перед КАЖДЫМ физическим вызовом атомарно receipt append + attempts increment (commit) → I/O; ≤2 вызова/job; reclaim после зафиксированного незавершённого вызова = terminal `interrupted` без нового расхода; **sync-путь бит-в-бит не изменён** (легаси `_anthropic_theme` сохранён поверх юнита) | `test_each_physical_call_is_fenced_by_its_own_receipt` — **red-then-green** (на pre-fix executor падает `1 == 2`: два POST делили один receipt); в момент второго POST в БД attempts=2 и два receipts; #POSTs == #receipts; + `test_validation_miss_twice_is_terminal_failed` |
| F002 (P2): resume-identity клиента = только slot+prompt | handle хранит полную нормализованную request identity (`prompt + preferences{avoid, difficulty, motion}`, та же нормализация и состав, что серверный digest); mismatch → новый запрос | клиентский путь, tsc/build |

Прогоны после фиксов (на дереве, ребейзнутом поверх Codex-мерджа
миграционной цепочки `c10726a`; миграция переименована в
`0053_island_theme_jobs`, единственный alembic head, roundtrip зелёный):
theme PG **16 passed**; theme+island PG **58 passed**; полный pure
**844 passed / 0 failed**; клиент tsc/build зелёные.

**R2→R3:** Codex R2 нашёл одну недостачу — `wall_time_ms` писался только
на success/validation-error путях. Закрыто **`afccc55`**: elapsed пишется
на receipt ЛЮБОГО завершившегося физического вызова (timeout, HTTP,
generic exception; исключение — process cancellation/crash, который
закрывает reclaim как `interrupted`). Два новых failure-path теста
(HTTP 502, timeout) — theme PG **18 passed**, полный pure **844 / 0
failed**. Head для diff-only R3: backend **`afccc55`**, клиент `94f4eaf`.

Ограничение №1 из «Задокументированных решений» выше (attempt-гранулярность)
УСТРАНЕНО этим фикс-раундом — receipt теперь per физический вызов, как
требует §5.1. Пункты 2–4 остаются в силе.

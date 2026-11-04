# Хэндзоф · Реализация feed-sequencing (оркестрация Fable 5 → Opus 5)

Дата: 27.07.2026. Автор хэндзофа: оркестратор-сессия (Claude Fable 5).
Статус: **все пять backend-пакетов реализованы и приняты независимым ревью**
(Пакет 5 — вердикт «GO без условий», получен после первичной версии этого
хэндзофа). Серверная часть контура (slices 2–8 спеки) закрыта; впереди —
клиентская debug-панель, операторские решения §17 и мерж (см. §5–§6).

---

## 1. Протокол оркестрации (ОБЯЗАТЕЛЕН для новой сессии)

Роли:

- **Главная сессия (Claude Fable 5)** — оркестратор, архитектор и адьюдикатор.
  Сама код не пишет (кроме тривиальных правок); принимает архитектурные
  решения, формулирует пакеты, адьюдицирует findings, докладывает юзеру.
- **Исполнитель** — фоновый Opus-агент (`Agent` tool,
  `subagent_type: general-purpose`, `model: opus`). Агент долгоживущий:
  продолжать ТОГО ЖЕ агента через `SendMessage` (контекст репо/идиом дорог).
  При обрыве `529 Overloaded` — пауза 3–4 мин (фоновый `sleep`), затем резюм
  тем же `SendMessage`: «продолжай с фактического состояния worktree».
- **Ревьюер** — ОТДЕЛЬНЫЙ фоновый Opus-агент (author ≠ reviewer, всегда).
  Тоже долгоживущий — он накопил репро-сценарии всех пакетов и гоняет
  регрессию по своим старым репро.

Цикл на каждый пакет:

```
пакет (автор) → полное адверсариальное ревью (вердикт GO / GO-с-условиями /
NO-GO; findings P1/P2/P3 с file:line и минимальным репро)
→ fix-раунд автора (red-then-green ОБЯЗАТЕЛЕН для каждого P1/P2-блокера)
→ точечная перепроверка ревьюером ПО ЕГО ЖЕ репро
→ FIX-ACCEPTED → следующий пакет
```

Правила:

- Мерж в master, push, любое enable, production-регистрация конфигов —
  **только явное решение юзера**. Агенты не пушат никогда.
- Ревьюер файлы не меняет; автор коммитит порциями с точной атрибуцией
  (код в том коммите, чей message его описывает), каждое сообщение
  заканчивается `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- Ревьюеру всегда даются явные «направления атаки» + требование прогнать
  тесты самому на своём disposable PostgreSQL и сверить числа автора.

## 2. Цель и authority-документы

Реализация спеки последовательностной политики ленты (shadow-only,
default-off): эпизодные предпочтения, family-онтология, favorite-состояния,
satiation/gap/regret pacing, планировщик, reset epochs, no_offer, debug.

- `swipe-backend/docs/specs/feed-sequencing.md` — основная спека (§-ссылки
  ниже по ней). В неё по ходу вносились согласованные уточнения (§5.2 miss
  upper-bound, §7.3 cold-start precedence, §11 scope триггеров).
- `swipe-backend/docs/specs/feed-sequencing-patch-proposals.md` — точные
  аддитивные патчи к frozen-докам (§1 применён, §5 применён, §4 применён).
- Оба закоммичены в `swipe-backend/master` @ `92838b7` (+ индекс-абзац README).
- Контекст всего фида: `feed-policy.md`, `telemetry-contract.md`,
  `content-analytics-report.md`, `generated-feed-insertion.md`,
  `feed-roster-config.md`, pinned-числа в `app/feed_policy_bootstrap.py`.

## 3. Рабочая область

- **Worktree**: `/Users/gleb/My projects/p4g-platform-workspace/swipe-backend-feed-sequencing`
  (git worktree репозитория `swipe-backend`). Основной checkout swipe-backend
  НЕ трогать — там незакоммиченные правки юзера (`docs/specs/README.md` ханк
  про series-order-flow + сам `series-order-flow.md`).
- **Стек веток** (каждая поверх предыдущей, HEAD worktree =
  `codex/feed-sequencing-s5`):

| ветка | пакет | миграция | содержимое | статус ревью |
|---|---|---|---|---|
| `codex/feed-sequencing-s1` | 1 | 0059 | словарный патч analytics (qualified takeover); `feed.mechanic-ontology.v1`: контракт/JCS/storage/CAS-активация/CLI | ✅ FIX-ACCEPTED |
| `codex/feed-sequencing-s2` | 2 | 0060 | coverage preflight §2.3; `feed_preference_episodes`+contributions; каузальный классификатор fast_reject §3.3; независимость §3.4; AffinityConfigV2 (`feed_affinity_configs_v2`); проекция состояний §4.3 + satiation §5.1; episode-materializer CLI | ✅ FIX-ACCEPTED |
| `codex/feed-sequencing-s3` | 3 | 0061 | gap/regret/rescue чистая проекция §5.2/§6 (`feed.pacing-input.v1`); reset epochs §11 (`feed_personalization_resets`, CAS epoch, терминализация триггеров существующим `expired` + защищённая атрибуция `expired_by_reset_id`); guard-тело 0019 через импортированный конструктор | ✅ FIX-ACCEPTED |
| `codex/feed-sequencing-s4` | 4 | 0062 | `feed.slot-config.v3` + `feed.cold-start-config.v1` (контракты/storage/CAS); opportunity planner §8 c constraint order §7.3, exploration floor §7.2 + candidate-выбор, cold-start §9, snapshot `feed.sequence-plan-snapshot.v1`, durable `favorite_delivery_miss` (missBound=upper, naturalBuiltinEvaluated=false); advisory-координация с v1-материализатором | ✅ FIX-ACCEPTED |
| `codex/feed-sequencing-s5` | 5 | 0063 | durable no_offer receipt (`feed_generated_offer_misses`) + flag-gated интеграция в ЖИВОЙ `app/feed_generated_offer_service.py`; read-only debug GET-роуты §12 (`/api/feed/sequencing/debug/{profile,why-now,history}`); хвосты П4 | ✅ GO без условий |

- **Флаги** (все default-off в Settings/.env.example/render.yaml):
  `ENABLE_FEED_SEQUENCING_ONTOLOGY`, `ENABLE_FEED_EPISODE_MATERIALIZER`,
  `ENABLE_FEED_PERSONALIZATION_RESET`,
  `ENABLE_FEED_GENERATED_OFFER_MISS_RECEIPTS`, `ENABLE_FEED_SEQUENCING_DEBUG`
  (+ пустой allowlist `FEED_SEQUENCING_DEBUG_USER_IDS`). Никаких HTTP-write
  поверхностей; `capabilities.levelSeries` не менялся.
- Последние числа прогонов автора (Пакет 5): pure 59; полный `pytest -q`
  **1074 passed / 499 skipped**; PG-модули ×2 = 93+93; migration-гейты 6;
  репро-пара 102; acceptance CI-порядком **70 файлов, 448 passed / 37
  skipped**, БД at head `0063_feed_generated_offer_misses`, 0 остаточных
  строк.

## 4. Как гонять тесты (рецепты, выучены практикой)

- Интерпретатор: `"…/swipe-backend/.venv/bin/python"` с `PYTHONPATH=.` из
  worktree (своего venv в worktree нет). ВАЖНО: migration-гейты спавнят
  `<worktree>/.venv/bin/alembic` — для acceptance в worktree нужен симлинк
  `ln -sfn ../swipe-backend/.venv .venv` (с fix-раунда Пакета 7 `.gitignore`
  содержит `.venv` без слэша — симлинк игнорится, можно оставлять).
- Полный быстрый: `pytest -q` в ЧИСТОМ окружении (`env -u DATABASE_URL` —
  иначе PG-гейтированные тесты пойдут на живую БД вместо skip).
- Disposable PostgreSQL: Homebrew `initdb` в scratchpad, порт 5543x, свои БД.
  `LC_ALL=C` обязателен И на `initdb --locale=C`, И на `pg_ctl start` (иначе
  «postmaster became multithreaded during startup» на macOS) — но ЛОМАЕТ
  alembic/python (UnicodeDecodeError на кириллице миграций): питоновским
  процессам — `env -u LC_ALL LANG=en_US.UTF-8 PYTHONUTF8=1`. Десятки
  одноразовых кластеров исчерпывают SysV-учёт macOS (shmget ENOMEM при
  пустом `ipcs -m`) — лечится только `sudo sysctl kern.sysv.shmall=65536
  kern.sysv.shmmni=256 kern.sysv.shmseg=64` (юзер, 28.07) или перезагрузкой.
- PG-модули контура: `RUN_CONTROL_PLANE_POSTGRES_TESTS=1` +
  `RUN_FEED_SEQUENCING_MIGRATION_TESTS=1` для migration-гейтов.
- **Полный acceptance строго CI-порядком на одной свежей БД**:
  `find tests -name '*postgres*.py' ! -name test_catalog_lab_auth_postgres.py | sort`,
  после — проверить `alembic_version` at head и 0 остаточных строк во всех
  sequencing-таблицах. Это ловит класс «тест загрязнил общую БД» (дважды
  ловил реальные блокеры).
- Известный flaky (pre-existing, НЕ чинить): `test_agents_m2m_read_postgres.py::
  test_straggler_across_boundary_retargets_by_clock_not_transaction_start` —
  таймингозависимый; при одиночном падении перепрогнать.

## 5. Итог ревью Пакета 5 (закрыт, GO без условий)

Ревьюер подтвердил построчно: literal no_offer-ответа вынесен без изменения
(JCS-digest старого и нового совпал), flag off → живой путь байт-в-байт
прежний (существующие selector-тесты не менялись, 12 passed), порядок replay
безопасен (allocated-replay проверяется РАНЬШЕ no-offer-replay — перехват
request_id с поздним allocated-исходом невозможен; ретрай no_offer после
пополнения пула честно возвращает те же bytes с `replayed=True` по §10),
receipt транзакционен с ответом, side effects нулевые. Debug-роуты: при off
отсутствуют в `app.routes`/OpenAPI; единственный 404-constant `"not found"`
на все три отказа; только GET; пересчёта нет по построению. Хвосты П4 закрыты
по существу (узкий публичный helper, обе ветви третьего правила §7.2, 0
удалённых строк в принятых П4-тестах).

Остаточные P3 (гигиена, для будущих раундов): (1) добавить комментарий в
`app/feed_generated_offer_miss.py`, что `all_candidates_held` /
`constraint_blocked` зарезервированы под писателя-планировщика; (2)
теоретический timing-side-channel «флаг off vs не-в-allowlist» у debug-404
(признан несущественным для внутренней read-only поверхности); (3) обход
теста запрета импортов через реэкспорт конструктивно не проверялся.

## 6. Очередь после Пакета 5

1. **Пакет 6 — клиентская debug-панель** (репозиторий `feed-prototype` —
   он САМОСТОЯТЕЛЬНЫЙ, `github.com/Glera/feed-prototype`, а не каталог
   swipe-platform): 4 вкладки §12 (Profile / Why now / History / Reset)
   поверх принятого debug-API; расширять существующий `feed-prototype/src/debug.ts`;
   `?diag=1` — навигация, НЕ авторизация (авторизация — серверный allowlist);
   Reset-вкладка — только отображение receipts из `resets[]` history-ответа
   (POST-поверхности нет, reset остаётся CLI). **В работе с 27.07.2026**:
   worktree `feed-prototype-sequencing-debug`, ветка
   `codex/feed-sequencing-debug-panel` от master @ `5f062d8`.
   **ЗАКРЫТ 27.07.2026: FIX-ACCEPTED финально** (полный цикл
   автор→ревью→fix-раунд→перепроверка→мини-раунд→финальная сверка).
   HEAD ветки = `612ce19`, 8 коммитов: `0dc83dc` pure-модуль
   `feed-sequencing-debug.mjs`+`.d.mts` (fail-closed envelope включая
   `sources`, три view-модели, deep-freeze verbatim bytes, дрейф
   элементов = warnings+raw); `0b02bf3` GET-only api-клиент (404 →
   типизированный `unavailable` без разбора тела/ретраев); `d090692`
   4-вкладочный подэкран в diag-панели (generation-счётчик против гонок,
   Reset = только отображение receipts); `b4d19b8`/`181577b`/`185f9b2`
   fix-раунд R1 (5 P2 + 7 P3, все red-then-green); `86ee0c5` кнопка —
   последняя функциональная перед Close; `612ce19` де-флейк браузерного
   чека + гвард `no-store`. Итоговые числа (сверены ревьюером лично):
   `npm run lint` зелёный целиком — 21 чек, из них
   `check:feed-sequencing-debug` = `174 core + 51 backend-drift`
   ассертов (без соседнего backend-репо — явный SKIPPED + `174 core + 0`)
   и `check:feed-sequencing-debug-browser` = 59 ассертов на реальном
   production-билде (5/5 стабильных прогонов после де-флейка, все 5
   мутационных проб красные); `vite build` зелёный. Ревью подтвердило
   вживую: XSS-стойкость (textContent-only), deep-freeze, гонки
   subject/limit, honest-404 (один запрос, тело не читается), только GET
   без тел, старая QA-панель идентична master по позициям 1–7.
   Остаточные заметки (НЕ долг): (а) импорт-алиас `import { apiReset as
   nuke }` обходит региональный гвард — признанный предел, не чинить;
   (б) blur-семантика user_id-инпута (лишний invalidate при клике сразу
   после ввода — безвредно, фенс закрывает); (в) разрывы спека↔контракт:
   `skill` §12.1 отсутствует в принятом серверном контракте, §12.3 шире
   `/history` (нет takeover/outcome/chest/exit и ontology-идентичностей)
   — кандидаты на будущий backend-раунд. Ничего не запушено; мерж ветки
   `codex/feed-sequencing-debug-panel` — решение юзера.
   Решения оркестратора по вопросам автора: (а) разрывы спека↔контракт
   признаны — `skill` §12.1 в принятом контракте отсутствует, §12.3 шире
   `/history` (нет takeover/outcome/chest/exit и ontology-идентичностей);
   клиент показывает только принятое сервером, без клиентской агрегации;
   кандидаты на будущий backend-раунд; (б) Why now рендерит секции snapshot
   вербатим под серверными ключами; (в) политика дрейфа принята как
   проектное решение.
2. **Операторские решения §17 — ПРИНЯТЫ ЮЗЕРОМ 28.07.2026**:
   - family-онтология: УТВЕРЖДЕНА как в драфте — 4 семьи, все текущие
     merge-варианты = одна family `merge` (planning, collection:
     merge-locked-v1, merge-timepress-v1/v2, merge-timepress-no-orders-v1,
     merge-second-board-v1/v2), `sort` (marble-sort → `sort/base`), `pins`
     (pins, pins-l3), `drama` (short-drama).
   - cold-start slate: драфт-порядок `merge-locked-v1 → marble-sort → pins →
     short-drama → merge-timepress-v1 → pins-l3 → merge-second-board-v1 →
     merge-timepress-no-orders-v1` регистрируется как пилотный v1; юзер
     будет донастраивать состав/порядок сам и дополнять новыми семействами.
     ВАЖНО: юзер хочет крутить slate И pilot values из **Labs** (там, где
     уже настраивается меню ленты = roster). Сейчас sequencing-конфиги —
     только CLI; Labs-поверхность для них = отдельный будущий пакет
     (операторская write-поверхность, свой цикл ревью; каждая правка =
     новая версия immutable JCS-документа, никакого мутирования).
   - pilot values §17 п.3–7 — приняты как в спеке (пилотные гипотезы).
   - п.8 player-facing reset — **НЕТ** (решение юзера).
3. **Production-регистрация конфигов — ВЫПОЛНЕНА ОПЕРАТОРОМ 28.07.2026**
   (вариант А: авторизованная Render-сессия, деплой `2fe216e`): operation
   `dd516440-5d6f-4873-86b0-c8c9ec5250b1`, activation онтологии
   `5469dca3-3bdd-4e18-a4f6-24693e548b17`, activation cold-start
   `dcc1329b-7ccd-4a8d-acc5-2e72467edf02`; post-check coverage/planner
   coverage полные, findings нет; replay того же манифеста =
   `status: replayed`; `--accept-coverage-regression` не использовался;
   shadow не включался, постоянные env не менялись. Proof записан в
   `IMPLEMENTATION-STATUS.md`, runbook дополнен uuidgen-заметкой
   (@`c6549f3`). Историческая справка апрува:
   Регистрационные функции всех классов есть в коде
   (`feed_mechanic_ontology` CLI register/activate;
   `register_cold_start_config`/`activate_cold_start_config`/
   `register_slot_config_v3` и AffinityConfigV2 в
   `app/feed_sequencing_configs.py`), но единого операторского бандла нет →
   **Пакет 7**: sequencing-bootstrap CLI по образцу `feed-policy-bootstrap`
   (один exact bundle: ontology v1 + membership, cold-start slate v1,
   AffinityConfigV2 pilot, SlotConfigV3 pilot; dry-run по умолчанию,
   отдельный default-off флаг, PG-тесты, тот же цикл автор→ревьюер).
   После приёмки — dry-run → apply на прод-БД (после деплоя миграций
   0059–0063).
4. **Мерж ВЫПОЛНЕН 28.07.2026 по отмашке юзера** (без push):
   - `swipe-backend` master @ `dc176d0` — merge-коммит `--no-ff` всех пяти
     пакетов (28 коммитов, +18 882 строк; база `92838b7` не сдвигалась,
     конфликтов ноль, незакоммиченные правки юзера в `docs/specs/` не
     задеты). Pre-merge условие проверено и НЕ сработало: миграции `0058`
     в master не было, `0059.down_revision = 0057_island_closed_delivery`.
   - `feed-prototype` master @ `e8ac366` — merge-коммит Пакета 6.
   - Пост-мерж верификация на master: бэкенд `pytest -q` = **1074 passed /
     499 skipped** (совпало с принятыми числами); клиент `npm run lint`
     целиком + `vite build` зелёные.
   - **Условие развернулось на Share/Challenge**: перед посадкой ветки
     swipe-backend-challenge-v1 её миграция `0058_challenge_source_offers`
     обязана сменить `down_revision` на `0063_feed_generated_offer_misses`
     (номер-имя остаётся 0058), иначе Alembic two heads.
   - **PUSH ВЫПОЛНЕН 28.07.2026 по отмашке юзера.** Обе удалёнки успели
     уйти вперёд по чужим линиям (backend: island PR #20–24 + Series Order
     доки, без миграций; клиент: island PR #2–#12), поэтому перед push
     сделаны интеграционные мержи: backend без конфликтов →
     `origin/master = 798b123`, pytest 1074 passed, **CI acceptance
     success (run 30335743437)**; клиент — 2 конфликтных файла
     (`package.json` lint-цепочка = оба набора чеков, 26 штук;
     `debug.ts` — island удалил `island-sim.ts` с тумблером FAKE/REAL,
     разрешено в пользу origin, sequencing-регион цел) с арифметическим
     доказательством «ничего не потеряно» → `origin/master = 724224b`,
     lint 26 чеков + build зелёные, sequencing-browser 3/3. Устаревшие
     незакоммиченные доки юзера в swipe-backend (`series-order-flow.md`
     старее удалённого на §13) заменены удалёнными, бэкап в scratchpad
     сессии. Мелочь: drift-guard клиентского чека читает бэкенд по пути
     worktree `swipe-backend-feed-sequencing`; после удаления worktree он
     громко перейдёт в SKIPPED — можно перенацелить на `swipe-backend/`.
5. **Пакет 7 (sequencing production bootstrap CLI) — ЗАКРЫТ FIX-ACCEPTED
   28.07.2026** (цикл: ревью R1 GO-с-условиями 2×P2+8×P3 → fix-раунд
   `9e5ee28` → точечная перепроверка, остатка нет): ветка
   `codex/feed-sequencing-s7-bootstrap`
   от `origin/master 798b123`, 4 коммита (`501959f`/`7887cce`/`8b84132`/
   `9e5ee28` — coverage-regression gate `--accept-coverage-regression` +
   CLI-тест флага + P3-набор). Финальные числа (сверены ревьюером): полный
   suite 1103 passed / 521 skipped; PG-модуль 14/14 ×3; acceptance строгим
   CI-набором 470–476 passed / 0 failed; residue 0 (кроме задокументированных
   append-only ontology-11/roster-11 тестового мира). Остаточные наблюдения
   без действий: недостижимый `cold_start_probe_coverage_incomplete`
   (признан спекой), пренебрежимое TOCTOU-окно гейта с конкурентным
   roster-CLI (падает в безопасную сторону).
6. **ВНЕШНЕЕ РЕВЬЮ смерженного master 28.07.2026 (юзер, независимый
   ревьюер): 3 P1 + 4 P2 по принятому контуру** — `bootstrap --apply` и
   любое shadow-включение ЗАМОРОЖЕНЫ юзером до закрытия P1 (dry-run/
   preflight/draft признаны безопасными; влияния на игроков нет —
   default-off/non-routable; bootstrap и frontend признаны готовыми).
   Findings: P1-1 утверждённый 8-probe slate непроходим (после 4 families
   исключаются их повторные пробы; застревание `nextProbe=null`;
   `feed_sequence_planner.py:796`); P1-2 routine coverage
   planner/materializer не проверяет active cold-start probes (§2.3;
   `:213`/`feed_episode_materializer.py:271`); P1-3 reset не сериализован
   с writer-ами (разные advisory-namespaces → старо-эпохальный snapshot с
   новым as_of; `feed_personalization_reset.py:106`); P2-4 favorite до
   cap/delta gate (§4.3); P2-5 exploration `admitted=true, candidate=null`;
   P2-6 rolling expiry streak по последнему regret; P2-7 plan-replay не
   связывает sourceEventId/feedPosition/forcedIdentity/acquisition.
   **Пакет 8 ЗАКРЫТ FIX-ACCEPTED и смержен 28.07.2026** (`origin/master =
   6a935b8`): ветка `codex/feed-sequencing-s8-external-fixes`, 6 коммитов,
   все 7 findings red-then-green; внутренний ревьюер воспроизвёл каждый на
   базе сам, включая физическую reset-гонку (pg_locks наблюдён вживую:
   writer держит epoch-lock первым, reset ждёт на нём), полную
   дедлок-матрицу advisory-локов (классы per-user и глобальные не
   пересекаются; порядок тотальный: epoch → {reset|episode|affinity} →
   planner) и 24-поточный стресс без дедлоков. Ключевые семантики фиксов:
   потребление cold-start пробы = non-forced seen-unit точной catalog
   identity (КАЖДАЯ из повторных merge-проб требует своего юнита; forced
   не потребляет; §9-переупорядочивание = перестановка непотреблённых);
   routine coverage резолвит активный slate (`evaluate_routine_coverage`);
   historical favorite confirmation читает admission (`inFavoriteSet`);
   floor без кандидата = конфликт+debt+`builtin_fallback` (или
   cold_start_probe при активном cold-start — цепочка §7.3); replay при
   изменённом opportunity-контексте = `planner_opportunity_mismatch`
   (контекст НЕ в identity — иначе два плана на решение). Остаточные P3
   ревьюера (не блокеры): (а) non-probe non-forced показ той же механики
   потребляет пробу — принятая документированная семантика; (б)
   `PlannerOpportunity.acquisition: bool` против строковых значений в
   фикстурах — сузить до Literal/str В БУДУЩЕМ SLICE production caller
   (сравнение по-байтно сделает False vs "organic" mismatch-ом); (в)
   `feed_roster_configs` ползёт в acceptance-БД (69→73, append-only,
   активаций 0) — при случае внести roster в общий truncate-closure.
   Отдельно: «включение shadow» в любом случае
   потребует нового slice — production caller/runner планировщика ещё не
   существует. Побочная находка вне контура: локальный клиентский lint
   падает на `check:catalog-authority-timing-browser` (CI зелёный) —
   вынесена в отдельную задачу (юзер запустил её отдельной сессией).
7. **Пакеты 9 и 10 — СТАРТ ОБОИХ по решению юзера 28.07.2026,
   design-first (СТОП до адьюдикации оркестратором, код не пишется)**:
   - **Пакет 9 — production caller/runner планировщика** (автор №1,
     тот же долгоживущий): ветка `codex/feed-sequencing-s9-caller-runner`
     от master ≥ `c6549f3`. Ключевые вопросы дизайна: переиспользование
     runner-контура 0021 vs отдельный по образцу; точки возникновения
     opportunity; «assignments append-only до pool read» §14; нулевое
     влияние на player-ответ; async-форма против сериализации epoch-lock
     (p95); сужение `PlannerOpportunity.acquisition` (P3 внешнего ревью)
     входит в пакет. Внешнее включение — отдельное решение юзера.
   - **Пакет 10 — операторские крутилки sequencing-конфигов в Lab**
     (НОВЫЙ автор №2, двух-репозиторный: swipe-backend write-поверхность +
     вкладка в swipe-generator): slate + pilot values как НОВЫЕ версии
     immutable JCS-документов через существующие register/activate + CAS,
     default-off флаг + scoped grant по образцу roster-write,
     переиспользование `coverage_regression`-гейта bootstrap; онтология
     остаётся в CLI (вне объёма). Юзер-контекст: хочет крутить slate и
     числа сам, рядом с настройкой меню ленты.
   - Координация: авторы не пересекаются по файлам (`feed_shadow_*`/
     `feed_sequence_planner.py` — только Пакет 9; `api_*` конфигов —
     только Пакет 10). Ревьюер один, ревьюит последовательно.
   - **Оба дизайна приняты 28.07.2026, реализация идёт.** Ключевые
     адьюдикации: Пакет 9 = ОТДЕЛЬНЫЙ контур по образцу 0021 (Option B;
     не расширять принятый runner), единственная точка = projected
     `builtin_feed_decision_v2`, двухфазность «assignment-транзакция до
     чтения пула → деривация+plan» с тройной сверкой, ноль изменений
     `/cp/events`, миграция **0064**, `ENABLE_FEED_SEQUENCING_SHADOW_OPS`
     гейтит только --apply CLI, render.yaml не трогается, offer-selector
     вне объёма v1, первый отчёт honest-`inconclusive`, `acquisition:bool`
     → `forced_origin` Literal. Пакет 10: структурная находка — у
     slot-config НЕТ живого указателя → вариант A: новая CAS-таблица
     `feed_slot_config_v3_activations`, миграция **0065** (временный
     down_revision 0063 на ветке; ЖЁСТКОЕ pre-merge условие — rebase на
     0064 Пакета 9, который садится первым); генезис указателя = первый
     apply консоли (без бэкфилла); клиент авторит ТОЛЬКО intent
     (`feed.sequencing-change-intent.v1`), сервер замораживает байты
     manifest, no-op reuse по модулю configVersion, версии
     `<kind>.console.v1.<h16>` (санкционировано); регрессия консоли — по
     ROUTINE coverage (онтология не меняется); онтология вне объёма (CLI);
     флаги `ENABLE_FEED_SEQUENCING_CONSOLE` + `_APPLY`, singleton-scope
     `feed.sequencing:write`, окно manifest 60 мин, rollback-аффорданс в
     объёме; CLI-bootstrap получает типизированный guard от тихого отката
     консоли (+ `--supersede-console`); порядок сдачи: backend → ревью →
     UI. Интеграция пакетов: runner-activation Пакета 9 в v1 принимает
     slot-версию ЯВНЫМ аргументом и пиннит на прогон (каузальная
     дисциплина 0020/0021); дефолт «из указателя П10» — однострочный
     follow-up после посадки обоих.
   - **Статус 28.07 (вечер)**: Пакет 9 реализован (4 коммита
     `7c14793`/`275aaee`/`0d6bd7a`/`6681e40`, спека
     `feed-sequencing-shadow-operations.md`); ревью R1 =
     **GO-с-условиями: 1 P1 + 3 P2 + 6 P3** — P1-1: ветка отказа
     `process_claim` (runner `:566-594`) без фенса выселяет живую лизу
     конкурента при падении устаревшего worker-а В ХОДЕ работы, подписывает
     чужую попытку и расходует её `failure_id` (следующий честный отказ
     станет `transient`); совпадает с единственной дырой триггера 0064
     (`leased→retry_wait|blocked` разрешён кому угодно — P2-1); P2-2
     медленный УСПЕШНЫЙ item кидает необработанный StaleLease и валит весь
     pass; P2-3 три вакуумных гварда (финализирующий фенс / флаг run-once /
     digest активации). Подтверждено ревью: §14-порядок (red-проба),
     независимый побайтовый пересчёт draw, изоляция route-set, side-effects
     только свои таблицы, drifted-каноничность без DoS соседей, дифф
     тестов без ослаблений. Fix-раунд П9 закрыт (`e72c6e2`/`ae0fd96`:
     двухслойный фикс P1 — предусловие триггера «only the live lease may
     release an item» + фенс ветки отказа; `stale_after_plan` для
     медленного успеха; все 6 P3) → перепроверка FIX-ACCEPTED →
     микро-раунд `9625d1f` (DB-свидетель триггера pg_proc-критерием,
     lease-shape CHECK только прямой стороной, PG 14/14) — микро-раунд
     подтверждён ревьюером: **Пакет 9 FIX-ACCEPTED ФИНАЛЬНО ЦЕЛИКОМ**
     (оба слоя P1-фикса с независимыми красными свидетелями; матрица
     переходов переснята). **Смержен в master @ `26a39b3` и запушен
     28.07.2026** (suite 1111 passed на master; CI в полёте). Ребейз
     `0065` Пакета 10 на `0064` теперь выполним. Семантика: освобождение
     СОХРАНЯЕТ lease_token (активность = status+lease_expires_at).
     **Пакет 10 backend: ревью R1 GO-с-условиями (2 P2: ложное «регрессия
     принята» в квитанции; /changes без сверки каноничности сырых байтов;
     5 P3) → fix-раунд `9fe2c99`/`db14ccf` (единое regression_accepted;
     `parse_change_command` с raw-JCS-сверкой →
     `console_manifest_not_canonical`; кросс-валидация slate +
     `console_slate_coverage_unreachable`; живые authz-тесты TestClient с
     red-пробами; фикстуры дедуплицированы) → перепроверка = ФИНАЛЬНЫЙ
     FIX-ACCEPTED без остатка** (no-op матрица подтверждена row-counts
     ревьюера; расхождений в числах ноль: full 1145/550, PG 40,
     acceptance 505/0 head 0065). **UI-фаза Пакета 10** (worktree
     `swipe-generator-sequencing-console`, ветка
     `codex/feed-sequencing-s10-console-ui` от generator-master `03e669b`;
     обязательный гейт пакета, записан в спеке и IMPLEMENTATION-STATUS:
     минимум один HTTP-E2E «настоящий device-auth грант → /state →
     /drafts → /changes» против реального uvicorn+PG до включения любого
     флага в проде). Ядро готово @ `dbb5e07` автором №2: lab-клиент с
     exactKeys и JCS-сериализацией /changes-команды (JS-JCS сверен
     побайтово с питоновским, 5798 байт), независимый пересчёт
     requestHash, 6 прокси-роутов, вкладка «Числа ленты»
     (DnD/«часто-редко-read-only»/модалка диффа с CAS и чекбоксом
     регрессии), клиентские тесты 8/8, check зелёный. Контекст автора №2
     исчерпан → **добивку ведёт свежий автор №3**: (1) гейтовый E2E —
     написан, блокер `POST /api/admin/device-auth` reject (вероятнее
     деталь харнесса; при доказанном дефекте backend — СТОП/доклад, не
     чинить молча); (2) Playwright над fake-бэкендом; (3)
     server-прокси-тест; (4) golden-drift. Решение оркестратора:
     rollback-аффорданс v1 = «Сбросить в активные» + переактивация без
     регистрации; полный префилл исторической версией требует `document`
     в `registered*Configs` backend-проекции — будущий follow-up-раунд
     (backend принят, не трогается).
   - **UI-фаза добита автором №3** (5 коммитов до `8220c4f`: E2E-харнес,
     2 UI-дефекта red-then-green — receipt-карта терялась при re-seed
     драфта; тихий re-read после 409 стирал причину отказа; Playwright 35
     ассертов 3/3 стабильно; прокси-тест 54 ассерта; vendored golden с
     guard-ом skip-vs-failure; verify 569: 4 pre-existing падения
     идентичны main checkout). **ГЛАВНОЕ — доказан дефект backend П10:
     scope `feed.sequencing:write` невозможно выдать** — отсутствует в
     `DeviceAuthCreateIn.exact_scope` (`api_catalog_lab_auth.py:222-236`,
     422 на create) и в трёх DB CHECK (`ck_lab_device_authorizations_scope`,
     no-promotion ветка promotion_binding, `ck_lab_access_grants_scope` —
     блокирует token exchange). Образец правильной формы — миграция
     `0041_feed_roster_write_scope`; вакуум: тесты ассертили три хелпера,
     но не СОЗДАНИЕ гранта. С патчем вне репо гейтовый E2E зелёный
     end-to-end (~11 с): grant → state (genesis) → drafts → changes 201 →
     replay → stale-CAS → указатель установлен. **Fix-раунд у автора №2:
     wire-валидатор + миграция `0066`** (down_revision 0065; посадка:
     0065 rebase на 0064, 0066 следом) + PG-тест полного пути
     grant-создания (red = текущий 422) + перегон E2E. Vendored golden
     UI помечен `pendingBackendOriginal` — backend должен опубликовать
     свой golden консоли (follow-up).
   - **Финал ревью П10 (28.07 поздний вечер)**: scope-фикс = FIX-ACCEPTED
     без остатка (оба белых списка с независимыми свидетелями — снятие
     каждого по отдельности роняет именованные тесты; дельта констрейнтов
     0065→0066 на живой БД: +1 токен в каждом из трёх, удалено ничего,
     расширение 0048 цело; guarded downgrade при живом гранте). UI =
     GO-с-условиями (дефектов ноль; E2E зелёный на БД ревьюера 13.3 с;
     JS-JCS и requestHash подтверждены ТРЕТЬЕЙ независимой реализацией
     побайтово; verify 569 совпал число-в-число) — 6 пунктов ревьюер не
     успел лично: финальный мини-заход закрыл ВСЕ ШЕСТЬ его же пробами,
     findings ноль → **ВЕСЬ ПАКЕТ 10 FIX-ACCEPTED**. Детали: 4
     pre-existing падения verify тождественны main @3138987 посимвольно
     (ветка +6 тестов/±0 падений); status-map покрыта двумя независимыми
     свидетелями на обоих слоях (клиент и прокси); golden-guard — полная
     матрица (легальный pending-skip / failure без оригинала при снятом
     флаге / failure при фальшивом / pass при настоящем); оба UI-дефекта
     имеют бьющих red-свидетелей; ungranted = ноль обращений к backend
     (перехватом; один локальный /status к lab-прокси — норма); числа
     3/3+1/1+8/8, ассерции 54/35 точно. Прежние «4 падения baseline»
     ревьюера — артефакт его копии (без сиблингов/node_modules), честно
     отозваны. Приёмка ≠ включение: оба флага консоли default-off, enable
     — отдельное решение оператора. **ПОСАЖЕНО 28.07 по отмашке юзера**:
     backend `origin/master = f659ac8` (0065 ребейзнута на 0064 +
     `_PREVIOUS`; единственный head 0066; полный suite 1147 passed; CI
     acceptance SUCCESS; README-конфликт индекс-абзацев разрешён «оба»);
     generator — мерж `daff253` в origin/master (verify на смерженном
     master ×2 = те же 4 pre-existing падения, ничего нового). Особенности
     посадки: параллельная сессия закоммитила онтологию-v2 (`8042e6b`,
     локально, не запушено мной — её решение) — мой стеш её черновика
     перекрыт коммитом и снят (патч в scratchpad); generator-CI на master
     был КРАСНЫМ до нашего мержа (factory-тест Series Order) и красен
     после на ДРУГОМ Series Order тесте («switching and refreshing
     review…») — оба вне sequencing-диффа, зона активного параллельного
     Series Order воркстрима. Юзер утвердил шаги 1–4 (включение консоли;
     включение shadow-прогонов; пакет §14-отчёта; хвосты) + новый заказ:
     сравнительная проекция «факт vs тень» в debug (JOIN
     FeedDecision ↔ plan snapshot по source decision + вкладка/строки в
     diag-панели) — планировать вместе с §14-отчётом.
   - ВНИМАНИЕ параллельный воркстрим: в ОСНОВНОМ checkout swipe-backend
     незакоммиченная (или свежая) правка bootstrap-спеки/кода — онтология
     `mechanic-ontology.production.2026-07.v2` с добавленными
     `pins-l5/l7/l9-swipe` в family pins (PINNED_SLATE не менялся —
     слейт-порядок настраивается через Labs). При посадке П10 интегрировать
     с fetch, как раньше; console/E2E рассчитаны на активную онтологию —
     v2-переактивация им не мешает (CAS-якоря берутся из /state).
   Справка Пакета 7:
   `app/feed_sequencing_bootstrap.py`: bundle `feed.sequencing-bootstrap.v1`,
   команды `preflight`/`draft`/`bootstrap [--apply]`, apply за default-off
   `ENABLE_FEED_SEQUENCING_BOOTSTRAP`, миграций ноль. Ключевые решения
   оркестратора: golden-фикстура Пакета 1 НЕ кодирует боевой состав
   (вымышленные fixture-иды) — утверждённый состав пиннится в executable
   по 10 реальным playable id С СУФФИКСОМ `-swipe` из
   `feed-prototype/src/playables.ts` (merge×6 / sort / pins×2 / drama);
   catalog identity + mappingId резолвятся из живой БД в `draft` (пин-промах
   = typed fail с полным registry); `normalizationFloor=4.0` (pinned
   тест-векторы Пакета 2; V1=1.0 — другой формульный контекст);
   квитанция = `Intervention kind='policy_deploy'` (без миграции, как
   marble-bootstrap, различение по scope.schema); coverage §2.3 считается
   против онтологии, активируемой тем же бандлом (иначе self-deadlock);
   probe_* блокируют apply, mapping_* печатаются; same-intent гонка = оба
   успешны через exact replay. Версии: онтология
   `mechanic-ontology.production.2026-07.v1`, slate
   `cold-start.sequencing-shadow.2026-07.v1` (namespace
   `cold-start-order.2026-07.v1`), affinity §4.1 / slot §7.1 дословно.
   Числа автора: полный suite 1095 passed / 519 skipped; PG-модуль 12/12
   ×3 подряд; acceptance CI-порядком 71 модуль 447/0, head 0063, residue 0.
   Ожидаемый сюрприз первого прод-dry-run: если две merge-пробы slate
   резолвятся в один catalogMechanic → `bundle_cold_start_invalid`,
   порядок slate придётся править по факту. После ревью: операторский
   прод-прогон preflight → draft → dry-run → apply (руками юзера или по
   его отмашке; миграции 0059–0063 должны быть задеплоены).
5. Открытые заметки на будущее (не блокеры): forced identity при переходе к
   effectful должен стать явным полем authorization (сейчас производная
   slot_type); `lateEvidenceAfterEpisodeCommit` — только счётчик; двойной
   modulo в target-draw задокументирован (~0.03% перекос); satiation
   counter-signal (replay/return) ждёт replay-lineage контракта; ветка
   `natural_builtin` maxGap не оценивается до roster-ring авторитета (miss =
   верхняя граница — помечено в snapshot/спеке/IMPLEMENTATION-STATUS).

## 7. Дисциплины, выученные в этой разработке (передать агентам дословно)

- PG-тесты обязаны чистить за собой: общий TRUNCATE-closure
  `tests/feed_sequencing_test_support.py` (+ `clear_reset_window` из
  `tests/feed_reset_test_support.py`); уникальные окна player id на процесс.
- Guard-функции, заменяемые повторно в истории миграций, строить ТОЛЬКО
  импортированным конструктором последней ревизии (кейс: 0061 молча откатывал
  `FOR SHARE` из 0019 — поймано только физическим сравнением
  `pg_get_functiondef`).
- Живые контуры трогать только flag-gated с доказанной байтовой
  неизменностью при off; при любом сомнении — СТОП и доклад оркестратору.
- Числа/пороги — только внутри registered immutable JCS-документов.
- Каждый новый config-класс — отдельная таблица c композитными FK (registry
  `feed_policy_config_versions` append-only и родитель policy-FK: новые kind
  туда не добавлять; прецедент разобран в docstring миграции 0060).
- Ревьюер пересчитывает digests/draw независимой реализацией и повторяет
  свои старые репро прошлых пакетов как регрессию.
- PG-модуль НЕ переиспользует чужие playable id с другими байтами:
  `feed_mechanic_mappings` append-only и DB-guarded (DELETE запрещён, документ
  immutable, `retired` односторонний), поэтому одна регистрация того же
  playable id с другим `mappingVersion`/provenance НАВСЕГДА отравляет общую
  acceptance-БД (`FeedPolicyEvidenceConflict` на каждом последующем прогоне,
  строку не удалить и не починить). Фикстуры мапписов делать детерминированными
  (uuid5 + фиксированный `registeredAt`), чтобы повторная регистрация была exact
  replay; десять pinned playable id пакета 7 и `legacy-orphan-swipe` уже заняты
  модулем `test_feed_sequencing_bootstrap_postgres.py`.
- `.venv` в worktree нет: migration-гейты спавнят `<worktree>/.venv/bin/alembic`
  и без симлинка на соседний venv 8 модулей падают чисто окружением. Симлинк
  `ln -sfn ../swipe-backend/.venv .venv` (в .gitignore) — часть рецепта.
- Строгий CI-набор env для полного acceptance: `RUN_CONTROL_PLANE_POSTGRES_TESTS=1`
  `RUN_FEED_SEQUENCING_MIGRATION_TESTS=1` `RUN_CONTENT_ANALYTICS_POSTGRES_TESTS=1`
  `RUN_COHORT_OBSERVABILITY_POSTGRES_TESTS=1`.

# FLYWHEEL — портфельная доска маховика

Что это: одна страница, держащая пять инициатив пуша 25.08 как один маховик.
Сюда ссылаемся в обсуждениях; прогресс обновляет владелец полосы при каждом
терминале (Fable держит доску); детали и решения — в тикетах инициатив.
`STATE.md` остаётся коротким контрольным экраном.

```text
Researcher находит сильную механику
        ↓
Mac B копирует и полишит её в Labs
        ↓
телефонный контур принимает кандидата
        ↓
approved-генератор даёт бесконечный контент
        ↓
сезон/миссия создаёт смысл возвращаться
        ↓
поведение игроков улучшает следующий research
```

## Снимок загрузки полос — 25.08 (терминал #177 code/review merge)

| Полоса | Статус | Что блокирует | Следующий терминал |
|---|---|---|---|
| Codex A (Mac A) | **автономная цель запущена** (фаза 0: коррекция+активация #136 c dogfood-wake 5410446094; далее #151→#177→#140→#159→#160/#188 без промежуточных указаний) | только неделегируемые акты оператора | evidence-backed срез результата |
| Mac B | получает wake 5410446094 (timepress manual-source) — после активации сам; до неё одна минимальная пересылка | — | MANUAL_SOURCE_READY → FIFO |
| Fable (Mac A) | доска на терминалах; диспозиции по NEEDS_HELP/review-лестнице; taste-поддержка | — | census по завершении цели |
| Оператор | играбельно сейчас: **Two Dots кандидат** (deep link в #151 row 1) | — | далее только неделегируемое: taste Approve, live-миграции, credentials/infra, новые P1/P2 |

**На время автономного прогона:** быстрая правда операций — `STATE.md`
(ведёт Codex A); FLYWHEEL — портфельный вид, обновляется на терминалах.

Порядок Mac A «mission раньше #159-сервера» принят по рекомендации
Codex+Fable (мораторий вижена: mission — единственный новый продуктовый
контур); переставляется только операторским словом. #159 не тормозится:
standalone-генератор играется в Labs локально (unverified-класс) до
серверной интеграции.

## Волна 0 — хвост #151 (почти терминальна)

Сделано: F7 [PR #78](https://github.com/Glera/swipe-backend/pull/78) смержен
как backend master `33d147a2`; оба master CI SUCCESS — receipt
[#151 c.5407495938](https://github.com/Glera/p4g-workspace-meta/issues/151#issuecomment-5407495938).
Осталось: операторский GO → один rollout 0085+0086 → restart генератора на
`09d12fc` → физическая приёмка 5 правок. До этого — заморозка
деплоев/рестартов. Не смешивается с новым backend-кодом.

## И1 — Hands-free транспорт (#136 piece 3)

- Цель: маки синкаются сами; оператор не курьер.
- Состав: model-free scanner на обоих маках; AI только при реальной задаче;
  exactly-once resume owner-сессий; durable pending; компактное чтение и
  ротация #94; ноль холостых AI-тиков.
- «К тесту»: три настоящих перехода Mac A→B→A без ручного копирования.
- Статус (census Codex A 25.08 вечер): **код merged и отревьюен; активация
  STOP** на двух дефектах — GitHub-pagination parser Mac A и headless
  owner-session bootstrap Mac B (`codex exec` завершился до identity).
  Старые гейты восстановлены, Mac B = owner_busy (безопасно). Разрешена
  одна bounded-коррекция + один review + одна активация; первый dogfood
  wake — существующий 5410446094 (row 2 приёмки). Оценка: 0,5–1 день до
  активации, 1–2 дня до трёх доказанных переходов.
- Ссылки: [#136](https://github.com/Glera/p4g-workspace-meta/issues/136).

## И2 — Всё с телефона

- Цель: правки платформы и механик, запуск работ и приёмка — из Labs/телефона.
- Состав: [#140](https://github.com/Glera/p4g-workspace-meta/issues/140)
  (отказ fast-lane → обычный тикет, один вход);
  [#118 slice 2] + [#109](https://github.com/Glera/p4g-workspace-meta/issues/109)
  (список изменений, audience/lifecycle бейджи, promotion); Labs S3 — комната
  «Создать» (research → pack → «Копировать» → candidate → решение);
  R2 [#160](https://github.com/Glera/p4g-workspace-meta/issues/160).
- «К тесту»: с телефона запускается research → mechanic-ticket → кандидат →
  решение, без терминала.
- Владельцы: #140 Codex A (1–2 дня после И1); S3/R2 Mac B после Queens.
- Статус: не начат; мобильный review кандидатов уже живёт.

## И3 — Сезоны / Mission (новый вижен)

- Цель: founder dogfood первого настоящего кейса в стиле утверждённого альбома.
- Факт-база: макеты утверждены; vision-патчи, реестр №1–60, альбом, канва,
  implementation plan, ТЗ-дельта лестницы и поэкранный delta-list в meta.
- Явный операторский override 25.08 запустил #177 сейчас, не перехватывая
  #140/#151/#136. Backend PR #79 строит replacement-only ladder v2 и additive
  migration 0087; Feed PR #49 строит bounded taste slice за default-off gates.
- «К тесту»: полный цикл кейса READY→ACTIVE→вклады→UNLOCKED→FULFILLED на
  dogfood-пользователе.
- Статус: **CODE/REVIEW MERGED · WAITING_OPERATOR LIVE ACTS** — Backend PR #79
  merged как `00d3310d…` после physical Mac B Tier-2
  STOP→correction→delta PASS; Feed PR #49 merged как `c25af39e…` после blind
  Opus discovery→correction→delta PASS. Exact-master PostgreSQL/roundtrip,
  real-backend browser closure и Feed lint/build CI SUCCESS. Live migration
  0087, rollout/settings/restart и founder dogfood не запускались и остаются
  отдельными операторскими актами.

## И4 — Бесконечная любимая механика (#159)

- Цель: пилот доказывает 100+ невиданных серий без ручного производства.
- Схема: seed-гибрид (генератор в механике, authority на сервере); спека
  финальна: verifier, 6 условий refill, generatorVersion/envelopeConfigVersion,
  рескины, серии из seed.
- Статус: **MERGED + WAITING_OPERATOR (Approve конверта)** — review STOP→коррекция→delta-PASS, PR #36 в master `9b4f97f`, post-merge CI 5/5 (receipts в #159). Envelope — candidate до операторского Approve по итогам Seed Lab. Было:
  128/128 конструктивно сертифицированных уровней с browser-win, golden
  seed→spec_hash, Seed Lab 146 вариантов (LOCAL·UNVERIFIED, fail-closed в
  прод-сборках). Draft [playables PR #36](https://github.com/Glera/playables/pull/36),
  CI 4/4; receipt [#159 c.5409668852](https://github.com/Glera/p4g-workspace-meta/issues/159#issuecomment-5409668852).
- Ворота: blind cross-provider review PR #36 + операторский taste-наигрыш
  Seed Lab (параллельно); Approve конверта — после review-PASS+merge
  (диспозиция c.5409952197). Затем: Codex A — seed-tickets + trusted
  verifier (после mission-слайса).
- Ссылки: [#159](https://github.com/Glera/p4g-workspace-meta/issues/159),
  [спека](docs/specs/favorite-mechanic-infinite-stream-v0.md).

## И5 — Researcher и копирование

- Цель: постоянный приток свежих механик: найти → pack → копировать → candidate.
- Статус: **Queens R1 TERMINAL (REFERENCE_READY)** — пак в master
  ([PR #170](https://github.com/Glera/p4g-workspace-meta/pull/170), receipt
  [#160 c.5408793613](https://github.com/Glera/p4g-workspace-meta/issues/160#issuecomment-5408793613));
  copy-ticket [#171](https://github.com/Glera/p4g-workspace-meta/issues/171)
  ждёт операторского GO (без автоматического implementation);
  Bus A [#172](https://github.com/Glera/p4g-workspace-meta/issues/172)
  запаркован после #159-генератора. Organic novice timing — отдельный
  taste-гейт. **Bus A R1 TERMINAL (REFERENCE_READY, 25.08)** — пак в master
  ([PR #183](https://github.com/Glera/p4g-workspace-meta/pull/183), build
  com.nt.games.busjam 82.6.1/5625, receipt
  [#172 c.5411800603](https://github.com/Glera/p4g-workspace-meta/issues/172#issuecomment-5411800603)).
  Два полных R1-пака за один день; copy-тикеты (Queens #171, Bus — по
  selection) ждут операторского GO.
- Дальше: R2 #160 (запуск партий из Labs) после S3.
- Ссылки: [#160](https://github.com/Glera/p4g-workspace-meta/issues/160),
  [charter](docs/specs/market-researcher-r0-r1-charter.md),
  [pack](docs/research/2026-08-25-r1-queens/README.md).

## Горизонты — census Codex A (25.08 вечер, принят как authority)

- Маки без ручной пересылки + все пять кандидатов #151: **1–3 рабочих дня**.
- Mission в founder-тесте: **1–2 дня** (сам хвост — 2–4 часа после активации).
- Устойчивый телефонный цикл с автоэскалацией (#140): **3–5 дней**.
- Бесконечная механика (#159 сервер) и Research из телефона (#160/#188):
  **+1–2 недели** параллельной работы.

## Правила доски

- Обновление **только на терминалах** (не на каждом промежуточном CI);
  владелец полосы обновляет свою строку, Fable сводит.
- Строка = `status / blocker / следующий терминал / receipt` — без длинной
  технической истории.
- Exact SHA и CI — ссылки на authority (PR/receipt), не переписываются по
  многим местам.
- Словарь статусов: `DESIGN → READY → IN_PROGRESS → WAITING_OPERATOR →
  READY_TO_TEST → DOGFOOD → TERMINAL`.
- Обсуждение деталей: в тикете инициативы, не на доске. Новые разделы не
  добавляем — доска доказывает живучесть терминальными обновлениями.
- Операторские акты всегда видны первой таблицей.

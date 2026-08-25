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
| Codex A (Mac A) | mission-бэкенд LIVE (0087, receipt #177 c.5414779410); FIFO приёмки #151: row 1 READY_FOR_APPROVAL, row 2 ждёт content-authoring | слово оператора: Feed #49 static rollout + mission enrollment | founder dogfood |
| Mac B | READY → manual-source package для merge-timepress-v1 (row 2 FIFO #151) | — | MANUAL_SOURCE_READY → FIFO продолжается |
| Fable (Mac A) | доска/маршруты | — | census после закрытия #151 |
| Оператор | 3 акта | — | (1) row 1 Approve в Telegram (deep link в #151); (2) слово на Feed #49 + enrollment → dogfood; (3) GO #171 (опц.) |

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
- Владелец: Codex A, сразу после #151. Оценка 1–3 дня.
- Статус: не начат (первый в очереди).
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

## Горизонты — пересчёт T9 (вечер 25.08, после внепланового рывка)

Факт: mission-бэкенд уже LIVE (0087_mission_gift_ladder в DB, rollout
receipt #177 c.5414779410) — Codex A прошёл слайс раньше плана. #136
p3/#140 частично в работе за кадром (fail-safe restore DONE). Осталось до
founder dogfood сезона: Feed #49 static rollout → mission
settings/enrollment → наигрыш. Это **дни, не неделя**.

- #151: FIFO приёмки идёт — row 1 (orthogonal-link) READY_FOR_APPROVAL с
  deep-link'ом; row 2 (merge-timepress-v1) ждёт одного manual-source
  package от Mac B; дальше FIFO-суффикс сам.
- Mac B: timepress-authoring (часы) → затем #188-handback → R2; Queens
  copy #171 по GO.
- #159 сервер: после mission-хвоста (+2–3 дня) → полный пилот.
- «Пять веток в тесте» ≈ **4–7 дней**; две уже в тесте, mission — на
  пороге dogfood.

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

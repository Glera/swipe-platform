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

## Снимок загрузки полос — 25.08 (терминал T1)

| Полоса | Статус | Что блокирует | Следующий терминал |
|---|---|---|---|
| Codex A (Mac A) | WAITING_OPERATOR | GO `live DB migration` 0085→0086 + слово на рестарт генератора | rollout receipt → старт #136 p3 |
| Mac B | READY → R2 #160 (запуск research-партий из Labs) | — | первый узкий E2E R2 |
| Fable (Mac A) | TERMINAL: mission-пакет закоммичен | — | поддержка исполнения слайса |
| Оператор | 1 акт | — | пятистрочная приёмка #151 в клиенте |

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
- Факт-база: 10 показов 13–14.08, 55 решений, альбом итерации 8; vision-патчи
  («лестница подарков», «кипсейк→бланк») пока НЕ в git; frontend-слайс уже в
  master за гейтами; backend-ветка требует rebase + переделки формулы под
  лестницу; D1–D5 из старого контракта #153 фактически отвечены показами.
- Шаги: приёмка альбома (оператор, сегодня) → Fable: коммит патчей/реестра/
  альбома в meta, #153 → implementation plan, ТЗ-дельта лестницы, поэкранный
  delta-лист → Codex A: backend-слайс (rebase+лестница, cross-Mac review,
  отдельный GO на live-миграцию) + вкус-слайс ленты → dogfood.
- «К тесту»: полный цикл кейса READY→ACTIVE→вклады→UNLOCKED→FULFILLED на
  dogfood-пользователе.
- Статус: **MOCKUPS APPROVED (показ №12, 25.08)** — дизайн замкнут; трек закоммичен в meta (VISION-патчи, реестр №1–60, альбом, канва); план: `docs/specs/mission-etap1-implementation-plan.md`. Ждёт слота Codex A после #140. Горизонт dogfood: ~неделя от старта слайса.

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

## Горизонты (без новых P1/P2)

- 2–4 дня: #151 закрыт; маки передают работу без оператора.
- 4–7 дней: задачи запускаются/принимаются с телефона (первый узкий E2E).
- 5–8 дней: standalone-пилот бесконечной механики в Labs.
- 7–12 дней: первый research-кандидат «найти → pack → копировать → candidate».
- 1–2 недели после вкусового гейта: Mission founder dogfood.
- Следом: серверная интеграция #159 и полный dev-пилот.

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

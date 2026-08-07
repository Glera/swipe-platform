# STATE.md — контрольный док портфеля

## ▶ LABS FAST LANE — ENABLED, EXIT RECEIPT ЕЩЁ ОТКРЫТ (07.08)

- Оператор дал GO на bounded enabling window по пакету SHA-256
  `9db293d7099ad67c1d8ee47c460ce06218349d18bbfec25ba7139f46dadc1b89`.
  Три reviewed source-ветки влиты exact merge-коммитами; backend опубликован
  immutable-образом и задеплоен, база мигрирована на `0074`, merged feed
  опубликован, локальный Labs работает с Fast Lane flag `1`.
- Фактические SHA, workflow runs, image/manifest digests, deploy/verification
  IDs, static byte equality и локальный service status записаны в
  `docs/receipts/labs-fast-lane-enabling-exit-receipt-2026-08-07.md`.
  Квитанция честно остаётся `IN PROGRESS`: временный Render key отозван,
  GitHub environment secret удалён и оба отсутствия проверены независимо;
  Telegram update-dogfood ещё не проведён. До него Fast Lane не объявляется
  terminal PASS.
- Локальная Stage 2 ветка `claude/mission-truncate-guard@55a5656` сохранена в
  origin без merge/deploy. Её provisional `0074` не резервирует номер: перед
  будущей интеграцией guard будет перенумерован поверх фактического Alembic head.
- Старые pending Blueprint previews считаются известным dashboard-footgun:
  `exe-d9pg7s3m8hqs73fguv80` и `exe-d9nercqjnfac73aunbvg` никогда не Approve.
  Поле `pendingPreviewIds=[]` старого capture не доказывает их отсутствие и не
  используется как новый release gate; Gate C0 не возвращается.
- Реализация использует инертный HTTPS candidate под content-addressed путём в
  `swipe-platform`, один exact Telegram Approve и затем live static + optional
  atomic mapping/roster apply. Обычный playable release не идёт через Render.
- Три implementation PR были влиты с exact независимо проверенных heads:
  backend `#58@96a6d80`, generator `#15@ec2d43a`, feed `#23@965486d`.
  Независимые dispositions и локальная проверка записаны в
  `docs/receipts/labs-fast-lane-{independent-review,verification}-2026-08-06.md`.
- Финальный enabling-пакет независимо проверен: **GO, P1/P2 нет**. Exact-head
  CI всех трёх PR зелёный. Outage GitHub Actions отделён от кода; повторный
  backend CI поймал и закрыл только test-order pollution между append-only
  roster acceptance и console golden, финальная PostgreSQL matrix зелёная.
- Один enabling deploy был задан отдельным пакетом
  `docs/receipts/labs-fast-lane-enabling-deploy-packet-2026-08-06.md`;
  это последний platform/backend deploy в штатном playable-контуре. Обычный
  content-only release после terminal dogfood не должен возвращаться к Render.

## LABS FAST LANE ДЛЯ PLAYABLE — ИСТОРИЧЕСКОЕ ПРОДУКТОВОЕ РЕШЕНИЕ (06.08)

- Оператор утвердил целевой UX first-party прототипов: существующая механика
  обновляется через Labs за 5–10 минут, новая добавляется за 15–20 минут;
  operator touchpoints — один exact Telegram Approve и наблюдение в Mini App.
- Git остаётся audit/rollback под капотом; GitHub, terminal, Render-ключи и
  backend deploy не входят в обычный content-only release.
- Обе обложки пересобираются по умолчанию; update не меняет mapping/roster,
  add после live static verification одним plan создаёт identity/mapping и
  CAS-активирует roster. Цель — одно открытие Mini App.
- В ТЗ добавлена mobile-first петля: operator помечает exact живую механику с
  телефона, отправляет instruction в существующий flags/rework контур, играет
  HTTPS candidate и тем же Telegram exact action принимает release. В v0 Mac
  остаётся вычислителем; offline-запрос ждёт подключения Labs, cloud IDE/farm
  вне scope.
- Единое ТЗ двух сценариев:
  `docs/specs/lab-playable-release-fast-lane.md`. Актуальный implementation
  status находится в верхнем срезе этого файла; до enabling deploy действует
  текущий Composer/onboarding process.

## ▶ ФАБРИКИ В MASTER И ЖИВОМ LAB; LEGACY SERIES ORDER ЗАКРЫТ (06.08)

- Klondike feed-пакет доведён до merge после bounded review Claude Opus 5
  через подписочный CLI. Первый проход нашёл один P1: обязательный cover-guard
  ошибочно охватывал legacy-механики со standard card. Scope исправлен до
  трёх явных custom-cover рецептов; delta-review — **GO**, P1/P2 нет.
  Backend PR #57 влит как `ad65ac5`, feed PR #22 — `1c4a221`, playables PR
  #7 — `3f17df6`; exact-head CI всех трёх зелёный. Серии теперь fail-safe:
  неизвестная механика получает 1 игру, `arrows-v1` явно сохраняет 5.
  Статика опубликована в production как `swipe-platform@feb982d`: feed,
  оба playable и четыре cover-файла отвечают HTTP 200 и побайтово совпадают
  с git. Backend release packet `klondike-backend-release-packet-2026-08-06.md`
  на `2b37a9e` прошёл независимый Opus 5 review — **GO**. Phase 1 завершена
  одним dispatch без Render authority: run `31101029853`, attempt 1, PASS;
  manifest `3c74aa6f…`, immutable candidate `sha256:32a6eca8…`. Artifact
  принят 27 exact-проверками, durable receipt —
  `klondike-backend-phase1-image-publication-receipt-2026-08-06.md`. GO
  израсходован; следующий акт требует отдельного разрешения на bounded
  credential preparation и `prepare-source`, затем отдельно deploy и
  Composer mapping/activation Klondike.

- Legacy `series_order_corrupt` закрыт без переписывания immutable-данных:
  чтение различает текущую и durable generation-verification. Изменение
  прошло независимый Claude Fable review (**GO**) и влито в
  `swipe-generator/master` через PR #12, merge
  `5d81c75a4740ebe5b009ad55d9a16561b554b712`; все три исторические записи
  снова читаются полной проекцией.
- Сохранённый WIP «Фабрики» `wip/live-checkout-2026-08-05@a7b5891`
  поднят, сведен с master и доведён до релиза. Независимый review нашёл три
  P2 (replay до compose, честность Arrows receipt, невмешивающийся background
  poll); все закрыты red-then-green. PR #13 влит merge-коммитом
  `e63767f260b443fa1ef31b166c4945a4d5bb539f`, exact-head CI зелёный,
  delta-review Claude Fable — **GO**.
- Живой Lab работает из чистого detached checkout
  `/Users/gleb/My projects/p4g-platform-workspace/swipe-generator-live`.
  Визуальный smoke страницы «Фабрики» PASS: доступны Сортинг и Стрелочки,
  показываются 9 sort-фабрик и 1 arrows-фабрика, error-панели нет;
  `/v1/series-orders?mode=summary` возвращает 25 записей без
  `series_order_corrupt`.
- Во время первого рестарта обнаружен дефект installer-а: три операционных
  env не переносились в новый LaunchAgent. Реальные `.data` не менялись;
  сервис сразу возвращён на прежний data-root. Durable fix прошёл отдельный
  независимый review (**GO**) и exact-head CI, влит через PR #14, merge
  `d8619d328e148b46d09ee6b170c95df175678887`. Обычный повторный
  `service:install` доказал сохранение data-root, platform origin, deploy
  manifest и catalog endpoint; финальный HTTP smoke PASS.
- Dirty checkout оператора не тронут. Неблокирующие P3 сохранены в review:
  старые dev-only Arrows receipts, узкое окно уже начатого poll и усиление
  source-contract тестов; живой контур они не блокируют.
- Minesweeper update + полный Klondike прошли три независимых Claude Fable
  review-раунда: два P2 сохранения/автоплея исправлены двухсессионными
  browser-тестами, финальный exact-head verdict — **GO**, findings нет.
  Playables PR #6 влит merge-коммитом
  `c54573c917f341a8489461c2349b86eb2d43dcdd`; reviewed source-head
  `bc9ba0728e4761cd3ca87f11f6794f8e5f586f7a`. Klondike: 23 unit + 3
  browser + 39 runtime PASS; Minesweeper regression suite и оба swipe-build
  PASS. Feed `b1a9e63` прошёл preflight (локальный fixture-drift объяснён
  dirty backend checkout; его bytes совпадают с `backend/origin/master`).
  Следующий акт — один operator-run `deploy-swipe.sh minesweeper-v1
  solitaire-v1`; production manifest и roster пока не менялись.

## ▶ ПЛАТФОРМА ВОССТАНОВЛЕНА; MINESWEEPER В ЛЕНТЕ (06.08)

- Это верхний актуальный срез; более ранние дневниковые записи ниже остаются
  историей и не переопределяют его.
- Variant B завершён по reviewed v4 route. Durable receipt:
  `platform-reliability-variant-b-phase3-deploy-receipt-2026-08-06.md`.
- Production backend: exact candidate image из backend `0e9e940`, deploy
  `dep-d9q1vo7avr4c73akv7k0` live. Public health PASS.
- DB verification job `job-d9q202e1egvs73d5bdbg` succeeded на exact команде
  `verify-applied-db`: committed release receipt и revision
  `0073_platform_release_receipts` доказаны pinned-кодом, а не run-status.
- Phase 2/3 были ровно двумя dispatch: `31074614067` prepare-source и
  `31075139056` deploy; оба exact head `0e9e940`, attempt 1, success. Retry и
  rollback не было.
- Terminal cleanup PASS: временный Render key отозван и даёт 401; GitHub
  environment secrets пусты; holder удалён; шесть non-secret release variables
  сохранены. Render 2FA enabled.
- Reviewed Minesweeper-пакет исполнен: active roster содержит 15 entries,
  Minesweeper стоит на позиции 5 после Arrows; activation
  `837fdee2-6d6f-4676-9080-2ad4d7434c57`.
- Наблюдаемая приёмка PASS: оператор увидел и сыграл Minesweeper; telemetry
  фиксирует `unit_shown` на `feed_pos=4`, first input, manual wins и
  `series_complete` без `roster_entry_unavailable`/`roster_fallback`.
  Durable receipt:
  `minesweeper-feed-roster-execution-receipt-2026-08-06.md`.
- Recovery-контур на этом заканчивается. Эталон mechanic onboarding принят:
  reviewed mapping apply → Lab Composer preview/diff/CAS activation → два
  запуска Mini App. Ручные roster JSON/UUID и три отдельных GO остаются только
  bootstrap-историей. Backend guide влит PR #56 (`3328858`), Composer docs и
  honest lost-response recovery — generator PR #10 (`1257aa7`); независимый
  Claude verdict — GO, receipt
  `mechanic-onboarding-standard-claude-review-2026-08-06.md`.
- Локальный Lab/Composer восстановлен: versioned Node `24.19.0`, launchd
  использует `/usr/local/opt/node@24/bin/node`, production manifest source
  `https://swipe-platform.onrender.com/versions.json`, preview origin явно
  пинится на `https://swipe-platform.onrender.com`; status/state проецируют
  active Minesweeper roster. Шаблон следующего пакета:
  `docs/mechanics/FEED-ONBOARDING-PACKET-TEMPLATE.md`.
- External controls/credentials/dispatch/deploy исполняет только оператор;
  Codex оркестрирует, проверяет read-only evidence и принимает результат.

## ▶ CODEX ПРИНЯЛ FRONTIER-ОРКЕСТРАЦИЮ (05.08, вечер)

- Оператор передал Codex владение маршрутом, реализацией, коммитами и
  финальной приёмкой до наблюдаемого результата: backend master в production,
  БД на `0073`, Minesweeper виден и играется в ленте.
- Процесс возвращён к двухконтурной норме `CLAUDE.md`: инфраструктура
  заканчивается после этого результата; следующий приоритет — механики и
  game feel, а не дальнейшая достройка recovery-церемоний для нулевой
  аудитории.
- Claude сохраняется как независимый ревьюер только в двух осмысленных
  точках: один delta-review production deploy/migration-пакета и один review
  mapping/roster/CAS-пакета перед активацией. Дополнительные раунды возникают
  только при новой существенной находке или изменении executable authority.
- Gate C0 окончательно снят с критического пути. Текущий маршрут — Variant B:
  publish image → prepare-source → exact GET-only projection → deploy.
  Редакция 3 в
  `platform-reliability-variant-b-deploy-slice-v3-2026-08-05.md` получила
  независимый Claude **GO** на exact bytes `269c0400…0f69` против backend
  `0e9e940`; новых P1/P2 нет. Последняя read-only сверка поймала одну
  исполнимую формальность: GitHub `workflow_dispatch.ref` — branch/tag, поэтому
  Phase 1 уточнена до `ref=master` с непосредственным CAS
  `master==0e9e940`; Claude дал **delta-GO** на exact commit `12408b3` и
  подтвердил, что post-run `head_sha`/manifest binding не ослаблены. Dispatch
  и Render mutation ещё не выполнялись; следующий акт — отдельный operator GO
  на Phase 1 image publication без Render authority.
- Короткий путь Minesweeper подтверждён на локально восстановленном
  production dump: mapping → roster register → CAS activation проходит без
  ontology activation и второго backend deploy. Пакет обновлён в
  `minesweeper-feed-roster-packet-2026-08-05.md` и получил независимый Claude
  **GO** на meta `330fb4f` против backend `0e9e940`, feed `c1681d8` и
  swipe-platform `12033fa`; все identity/digests/CLI/CAS воспроизведены.
  Production writes ещё не выполнялись.
- Pending preview `exe-d9pg7s3m8hqs73fguv80` не одобрять никогда.

## ⇄ ХЭНДОФФ FRONTIER-ОРКЕСТРАЦИИ → Codex Sol (05.08 ~19:00)

Claude-клиент повторно даунгрейдит эту сессию на Opus вопреки пину модели.
Оператор переносит роль frontier-оркестратора на Codex Sol (frontier). Роль
вниз (Opus) НЕ передаётся. **Первым читать:
`HANDOFF-FRONTIER-ORCHESTRATION-2026-08-05.md`** — там операционная выжимка
по всем 5 контурам, открытая петля (frontier-ревью NO-GO среза B v2 +
встречное возражение по ontology сапёра, ждёт ответа хаба/R1-A) и
методические правила. Затем этот STATE целиком.

## ▶ ОРКЕСТРАЦИЯ АКТИВНА (пауза снята 05.08 ~18:30)

Разбор смен модели: лимиты НЕ исчерпаны (запас и по Fable, и по неделе) —
даунгрейды делала автоматическая пооходовая оценка задач клиента
(«safe routine coding»), не квота. Исправлено: модель ЗАПИННЕНА в
~/.claude/settings.json ("model": "claude-fable-5") — эвристика больше
не выбирает. Правило остаётся навсегда: подписи/GO/приёмки — только на
Fable; recovery платформы НЕ является «routine coding» (несущая часть —
суждение и ревью, а не нажатия; записано в память и AGENTS.md).

**Снимок вахты (что ждём / от кого / что делает frontier по приходу):**
1. Деплой-манёвр: обновлённый срез B (3 dispatch, полные inputs, terminal
   cleanup, пин ref) — от хаба → frontier: сверка правок с 6 findings
   R1-A. Затем сапёр-пакет (P1-3) — от R1-A → ревью хаба. Затем
   delta-проход R1-A → frontier+оператор: двойной GO на три dispatch.
2. Lab-интеграция mobile-review: фиксы 2 P2 + компактный пакет — от
   «SwipeIt development» → независимое ревью R1-A → frontier: подпись
   merge, согласование рестарта :4317 с оператором.
3. Секрет SWIPE_BACKEND_DEPLOY_KEY — отдельная запущенная сессия ведёт
   оператора; по завершении отметить в follow-ups Lab.
4. После Lab-интеграции: комнаты этап 1 (ТЗ готово:
   docs/lab-rooms-stage1-tz-2026-08-05.md) — запустить исполнителя.
5. Прочее без изменений: Stage 2 P4G за гейтом деплой→0074; макеты
   сезона ждут отсмотра оператора; feed-sequencing запаркован.

Возобновление: оператор пишет «продолжаем» на Fable-сессии → начать с
чтения этого снимка и входящих от исполнителей.

Правила: каждая оркестрирующая сессия читает этот файл первым и обновляет
последним. Один владелец на контур; смена владельца — только через письменный
хэндофф. Режим процесса — два контура (преамбула `CLAUDE.md`). Необратимые
акты — вторая подпись (оператор или frontier-сессия). Роли моделей —
`AGENTS.md`. Это изменчивый статус-док, не ledger.

## Активные контуры (лимит: 2 продуктовых + 1 фоновый)

### 1. Деплой-манёвр R1/R1-A
- Владелец: хаб-сессия «Видение продукта: Play for Good» (Opus) +
  исполнители R1 и R1-A (Codex №1).
- Цель-граница: «master деплоится, сапёр виден в ленте». После неё — стоп
  достройке Gate-механики, финальный хэндофф, закрытие сессии.
- Вторая подпись обязательна: вливание исключений merge-freeze, Gate C0,
  cutover. (Ручной догон БД `0070→0072` ОТМЕНЁН 04.08: патч A законно
  восстановлен в форме exact-пин `0070` — поправка `56c4c93`.)
- Факты 04.08: прод-бэкенд `09fa0cd` (01.08), БД `0070`; freeze
  `#26/#48/#33/#30/#25` + отложенная `0074`; патч B — GO с P2 (meta PR #57,
  R1 дописывает мутационные тесты до вливания); патч C — за R1-A. Критичная
  деталь патча C: GitHub var `RENDER_BLUEPRINT_ID` и константа
  `scripts/platform-release-coordinator.py:47` меняются ОДНИМ шагом между
  терминальным C0 и финальным master (`HANDOFF-P4G-STAGE1-2-2026-08-04.md` §4).
- Прогресс поздний вечер 04.08: R1 закрыл P2 (PR #57, exact head `578366c`,
  focused 8/8 + exact-head CI PASS) — ждёт diff-only re-review хаба; R1-A
  выполнил GitHub preflight (environment + 5 vars, PR #58 head `9095892`,
  патч C = один bounded post-C0 шаг) — ждёт re-review. Флажок «патч A»
  разобран 05.08: нарушения нет — хаб отозвал собственное возражение в
  переписке, не перенеся в артефакт (поправка `56c4c93` + правило «решение
  не изменено, пока не изменён артефакт»).
- 05.08: оба re-review — GO (PR #57: мутации 8/8 fail, P2+P3 закрыты;
  PR #58: входы сверены с константами координатора пофактно). Вторая
  подпись на вливание патча B ДАНА frontier-сессией после независимой
  проверки (head `578366c`, MERGEABLE, состав только meta, CI verify
  success). **Патч B ВЛИТ** 05.08 06:33 UTC (merge `a2ecde3`).
- 05.08: патч A (swipe-backend PR #55, DO NOT MERGE, head `6c78147`) —
  вердикт хаба **GO с двумя P2**: границы `acceptedRevisions` не связаны с
  графом миграций ни сверху (`accepted[-1] != target` нагружена, но не
  проверена — сборка требует только `target <= code_max`; сценарий
  срабатывает сразу после деплоя при входе `0074`), ни снизу (нижняя
  граница не связана с `expectedPredecessor`). Метод: независимый вывод
  10 мутаций из дифа ДО чтения карты исполнителя + параллельные
  адверсариальные линзы; 4 инертные мутации корректно списаны на
  вышестоящий `_validate_manifest_shape` (защита в глубину, не дефекты).
  Ход за R1-A: оба P2 в `build_manifest` + `_verify_manifest_payload` +
  два теста → diff-only re-review → вторая подпись на вливание вторым
  исключением заморозки. Следующие шаги: патч A → перепривязка PR #54 →
  Gate C0 → патч C → публикация образа → деплой.
- 05.08 (позже): re-review патча A — **GO** (head `9eebe3b`): 4 новых
  инварианта мутационно держатся в обеих точках, регресса нет; P2 №1
  хаб ретрактировал как собственную ошибку с опубликованным механизмом
  («инертность мутации ≠ недостижимость проверки — второй вопрос задавать
  отдельно»); добавленный инвариант оставлен как защита в глубину. CI
  28/28 на точной голове, MERGEABLE/CLEAN, состав — только
  `platform_release` + тесты + спека. **Вторая подпись на merge PR #55
  ДАНА frontier-сессией.** Далее: merge → перепривязка PR #54 → Gate C0
  (attended-окно: RENDER_API_KEY оператора) → патч C одним шагом → образ →
  деплой.
- 05.08: **Gate C0 ОСТАНОВЛЕН ДО СТАРТА** — при чтении source SHA в
  дашборде нажат Manual sync: создан pending preview
  `exe-d9pg7s3m8hqs73fguv80`, перезаписан одно-слотовый `lastSyncAt`
  (потеряна возможность переподтвердить неиспользование утёкшего хука
  наблюдением). Ни одно необратимое действие окна не выполнено; прод
  `09fa0cd`/`0070`, PR #54 не влит, заморозка в силе. Халт-оценка хаба:
  `platform-reliability-r1-gate-c0-halt-assessment-2026-08-05.md`
  (meta `3e00c87`). Решения (уточнено разведкой 05.08): кнопки Reject в
  Render НЕТ — отказ = бездействие; preview достижим только по прямому
  URL (/sync/ ед. число), Auto Sync = No, сам не применится; содержимое
  зафиксировано (ss_87847bypj: 8 изменений = контракт R1-A на 0e9e940).
  **Оператор закрыл вкладку 05.08 — экспозиция preview снята** (сам
  preview остаётся pending и достижим только по прямому URL; Approve не
  нажимать, если когда-либо открыт). Замещающее доказательство
  неиспользования хука собрано и двойно подтверждено
  (render-hook-nonuse-observation-2026-08-05.md + сверка хаба `c9015e7`:
  якоря сходятся с git до 3 секунд). Corrective-пакет пишет R1-A
  (5 требований хаба + frontier: замещающее доказательство из истории
  deploys/events провайдера за 30.07→05.08; read-only путь к source SHA
  через API; правило «дашборд: сначала скриншоты, ноль кликов»); прежний
  GO на C0 СГОРЕЛ — новое окно только с новым двойным GO.
- 05.08 (день): **corrective-пакет получил независимый GO** (168/168 PASS,
  блокеры R3 закрыты, прод/Blueprint не тронуты; пакет локально в
  /private/tmp/p4g-gate-c0-corrective-20260805/). Frontier: разрешение на
  commit/push/meta-PR дано; шаг «ответ Render Support о семантике хука»
  предложено снять с критического пути (non-use доказан, семантика
  зафиксирована эмпирически, хук умирает со старым Blueprint). Временный
  Render API ключ corrective-работ — оператору отозвать. **На оценке у
  хаба вариант C0′ «сборка сбоку»** (create-alongside вместо delete-first:
  новый Blueprint из того же отревьюенного контракта + restore дампа +
  repoint клиента; отпадают необратимость, 60-мин лимит и вопрос хука;
  добавляются repoint/ре-ввод секретов/двойная оплата на дни) — вопрос
  оператора «не проще ли собрать заново, аудитории нет»; решение за
  оператором после сравнения хаба.
- 05.08 (день): сравнение хаба опубликовано
  (`platform-reliability-completion-variants-2026-08-05.md`, meta
  `7bb4772`): **Gate C0 не лежит на пути к деплою** (координатор пинит
  живые ID, деплой = переключение на image digest) — C0 был нужен только
  для убийства хука, срочность которого сняли доказательства. C0′
  отклонён (fromDatabase → новая пустая база; смена service ID = больше
  перепиновки). **РЕШЕНИЕ ОПЕРАТОРА: вариант B подтверждён** — деплой
  сейчас, хук ретирится потом отдельной задачей. Принятый риск записан:
  хук жив (неиспользован, Approve-only, AutoSync off), дрейф «образ vs
  render.yaml» до ретирования; preview НЕ одобрять никогда. Параллельный
  вопрос Render Support: ротация Sync Hook без замены Blueprint (не
  блокирует). Ход хаба: деплой-срез B → один раунд ревью маршрута →
  новый двойной GO → исполнение.
- 05.08 (день): **деплой-срез B опубликован** (meta `4bfd38d`,
  `platform-reliability-variant-b-deploy-slice-2026-08-05.md`): 3 фазы,
  ноль необратимого до единственного deploy POST; образ публикуется без
  Render вообще; RENDER_BLUEPRINT_ID задаётся сейчас значением живого
  Blueprint. Frontier принял срез как основу; ревьюер — R1-A (автор ≠
  ревьюер), к вердикту три условия frontier: (1) rollback прочитать по
  коду + LKG-образ == реально работающему в проде; (2) критерий «сапёр
  виден» перенести после регистрации в ростере (у оператора активен
  серверный ростер без сапёра), 3.2 не ждёт 3.1; (3) 0074 вливается
  первой из разморозки. После вердикта — двойной GO (frontier +
  оператор), до него ни одного диспатча.
- 05.08 (вечер): все 4 условия frontier закрыты хабом фактами (2 вскрыли
  его ошибки: LKG на 25 коммитов ВПЕРЕДИ прода — rollback не возвращает
  текущее; ростер без сапёра; 2 закрыты в его пользу: rollback-gate по
  построению принимает 0073, деталь — перед откатом переустановить
  PLATFORM_ROLLBACK_AUTHORIZATION_*). Затем **ревью R1-A: NO-GO** —
  4×P1 (пропущен обязательный prepare-source: маршрут = ТРИ dispatch со
  STOP-порядком промежуточного состояния; неполные workflow inputs,
  включая publish=true, без которого образ не публикуется; «сапёр в
  ростер» не исполним без mapping/ontology/roster/activation-пакета;
  нет terminal cleanup и STOP-веток сбоев) + P2 (непиннутый workflow
  ref) + P3 (merge×6). Точные inputs фазы 1 выданы и подтверждены.
  Ходы: хаб правит срез (P1-1/2/4, P2, P3); R1-A параллельно готовит
  исполнимый пакет «сапёр в ростер» (P1-3) под ревью хаба; delta-проход
  R1-A → двойной GO. Исполнений нет.
- 05.08 (утро): **патч A ВЛИТ** (merge `0e9e940`, дерево == дереву
  проверенной головы `9eebe3b` — 28 зелёных прогонов покрывают master
  точно). Перепривязка подготовлена R1-A локально и отревьюена хабом по
  git-объектам: **GO по обеим половинам** (backend PR #54 кандидат
  `739d5b7`, meta PR #58 кандидат `23f22fe`); один P3 — семантика
  `baselineSourceSha` (решение: записать текстом, кандидата НЕ менять).
  **Вторая подпись на два force-with-lease ДАНА** (dd250d0→739d5b7,
  9095892→23f22fe; головы сверены). После пуша: CI на новых головах →
  отдельная подпись на Gate C0 — первый шаг, который дойдёт до прода.

### 2. Портфель + P4G (Stage 2 на паузе)
- Владелец: frontier-сессия (Fable).
- Гейт-цепочка Stage 2: деплой → миграция `0074_append_only_truncate_guard`
  (ветка `claude/mission-truncate-guard` @ `55a5656` сохранена в origin, но не
  влита и перед будущей интеграцией должна быть rebased+renumbered поверх
  фактической головы) → только потом `mission_ops --apply` /
  `ENABLE_MISSION_CORE` (HANDOFF §1). TRUNCATE-дыра шире заявленной:
  108 таблиц. Диагностика только через `pg_trigger`/`tgtype & 32`
  (`information_schema.triggers` TRUNCATE-триггеры не видит).
- Макеты сезона: продолжать в прототипном контуре. Черновик 3 из ~14
  поверхностей спасён: `season-mockups-draft-2026-08-04.html`. Открытый
  вопрос хаба: где «утверждённый прогресс-бар сезона с иконками друзей» —
  не найден.
- Lab-аудит выполнен 05.08 (4 Opus-аудитора + верификатор, по чистому
  origin/master @ bfe1e78): `docs/lab-audit-2026-08-05.md` — обрывов
  проводки нет; 4 P1 перфоманса, 16 фидбек-нарушений (включая денежный
  двойной запуск кампании), слепые зоны тестов, бэклог 4 волн.
- Живой прогон выполнен (§10 аудита): живой сервис = неслитая ветка
  mobile-review; поллинг-шторм и замирания подтверждены; кнопка «Играть»
  в Библиотеке мертва на живой сборке (передать владельцу mobile-review).
- **Волны 1–2 реализованы**: swipe-generator PR #8 (ветка
  lab-audit-fixes-w12, 2 коммита). Бонус-находка верификатора:
  lab-ui тест-гейт был ВАКУУМНЫМ (отсутствовал `/run-status-ui.js` в
  allowlist 11 харнессов) — починен, 37/37; одна регрессия волны 2
  поймана и закрыта red-then-green; полный `npm test` побайтово равен
  базлайну. Merge — по зелёному CI (Node 24).
- Проверка живого `localhost:4317` 05.08: процесс запущен из основного
  checkout `swipe-generator` на `codex/mobile-review-performance@c8cc533`,
  который относительно `origin/master@bfe1e78` имеет 12 своих и не содержит
  2 master-коммита; дерево содержит большой незакоммиченный WIP. PR #8 пока
  **не едет в master**: exact head `24384a4`, CI красный на
  `factory_proof_axis_missing` (`sceneColors`). Статика Lab читается с диска
  на каждый запрос, серверные модули загружены при старте — merge/правка в
  живом checkout без остановки может дать гибрид «новый UI / старый сервер».
  05.08: задание на реконсиляцию отправлено владельцу напрямую (сессия
  «SwipeIt development»), R1-A подтвердил готовность дать независимую
  финальную подпись перед cutover. Ход владельцу mobile-review:
  заморозить живой checkout, письменно
  зафиксировать WIP, примирить его в отдельном integration-worktree с
  актуальным master и только с прошедшими ревью/CI срезами (включая отдельный
  draft PR #6), прогнать приёмку; только на коротком cutover остановить старый
  сервис и перезапустить Lab из exact integration-head. Мёртвую кнопку
  «Играть» чинить и проверять в этом же интеграционном срезе.
- **Реконсиляция mobile-review НАЧАТА** (05.08, владелец контура): WIP живого
  checkout зафиксирован снапшот-веткой `wip/live-checkout-2026-08-05`
  (`a7b5891`, 60 файлов / +9692 строк, контур «Фабрики», НЕ mobile-review) —
  собран через временный индекс, рабочее дерево и живой Lab не тронуты.
  Дальше: integration-worktree от `origin/master@5d1ae26`, примирение 12
  master-коммитов с 9 своими, phone-review за default-off флаг, починка
  кнопки «Играть», verify+smoke, пакет на R1-A.
- **Волны 1–4 ПОЛНОСТЬЮ В MASTER** (05.08): PR #8 merged `433eea4`,
  PR #9 merged `5d1ae26`, master swipe-generator ЗЕЛЁНЫЙ (впервые с
  28.07). По пути найдено и закрыто сверх плана: вакуумный lab-ui гейт
  (11 харнессов), среда-лотерея sceneColors (ось из сида ← identity
  CI-раннера; 11/300 → 0/300, детерминированная соль вне policy-digest),
  две продакшн-гонки отсмотра (перезапуск живого превью съедал
  completion-evidence; поздний рефреш сбрасывал позицию оператора) —
  свипы под CPU-троттлингом 28/28. Заметное оператору: рефреш очереди
  больше не сбрасывает отсмотр; «удачно» гаснет при снятии превью.
  Follow-ups Lab: родственная гонка level-play-frame; бейдж «статистика
  недоступна» на уровне очереди; **секрет SWIPE_BACKEND_DEPLOY_KEY
  ЗАВЕДЁН 05.08** — оператор сгенерировал пару руками, read-only deploy
  key `swipe-generator goldens-drift` (id 159359243) в swipe-backend,
  приватная половина в секретах swipe-generator; первый прогон
  `sibling-contracts.yml` 31005179066 зелёный (4/4 голдена, skipped 0),
  суточный гард дрейфа вооружён, файлы ключа с Desktop удалены; док-долг
  по удалённым роутам в swipe-backend/docs (после снятия заморозки);
  вернуть Node 24 на мак (brew).
- **«Три комнаты» УТВЕРЖДЕНЫ оператором 05.08**: прототип
  `lab-rooms-mockup-2026-08-05.html`; этап 1 (навигационный слой) — ТЗ
  `docs/lab-rooms-stage1-tz-2026-08-05.md`. Порядок по решению оператора
  05.08 («сперва параллельная ветка по labs — в master»): посадка волн
  3–4 → **реконсиляция generator-половины mobile-review в master** →
  комнаты этап 1. Нюансы реконсиляции: рабочее дерево swipe-generator у
  оператора грязное на этой ветке (нужно согласие владельца на
  wip-снапшот или его push); backend-половина mobile-review ждёт снятия
  merge-freeze после деплоя → phone-review UI при реконсиляции прячется
  за default-off. Этап 2 комнат — центр допусков + слияние дублей;
  этап 3 — единый поток очереди отсмотра.

### 3. Механики + независимая верификация A1 (ждёт исполнителя)
- Владелец: первый Кодекс, освободившийся ПОСЛЕ деплой-манёвра. Уточнение
  оператора 04.08: оба Кодекса сейчас заняты манёвром — R1 (второй мак)
  закрывает P2 в meta PR #57, R1-A ведёт патч C и GitHub-входы. До конца
  манёвра контур не стартует; новых заданий кодексам не передавать.
- ТЗ: `mac2-codex-tz-mechanics-and-a1-v1.md`.
- Границы: не трогает `swipe-backend` и мастера платформенных репо; выход —
  ветки в origin + квитанции-файлы; деплой запускает только оператор/Мак 1.

## Прод сейчас (снимок 04.08)
- Лента: https://swipe-platform.onrender.com — клиент `c1681d8` (03.08),
  бэкенд `09fa0cd` (01.08), БД `0070`. Серверный ростер активен
  (13 mappings, активация `629d2b1e` от 28.07, БЕЗ minesweeper).
- **Живая дыра:** minesweeper есть в baked-ростере клиента, а бэкенд
  `09fa0cd` считает его серию длиной 5 → терминальный результат серии
  получает 409 `series_incomplete` → клиентский outbox молча дропает.
  Итог: первая сессия каждого нового пользователя теряет сундук сапёра;
  пользователи с ростер-снапшотом сапёра не видят вовсе. Решение — очередь №1.
- Фронтенд-гейты прод-профиля `cohort-operator`: control-plane/catalog —
  **true** (player-v2/canary ограничены аккаунтом 42692410;
  catalog-feed-dogfood открыт всем CP-игрокам), island-гейты — false.
  Формулировка «default-off» в CLAUDE.md описывает код-дефолты, не
  прод-профиль.

## Очередь решений оператора
1. ~~Minesweeper-дыра~~ — **решено 04.08: вариант (б)** — терпеть до деплоя
   бэкенда. Следствие: дыра живёт до деплоя, приоритет манёвра усилен.
2. ~~Block Out в ленту~~ — **решено 04.08: отложено** — оператор полирует
   механику сам; агентам Block Out не трогать до отметки GO здесь.
3. ~~Feed-sequencing O1–O4~~ — **решено 04.08: запарковано** до появления
   независимых игроков (закрытый тест 13.10 / friend cohort). Команды на
   включение (~полчаса): `docs/feed-sequencing-operator-steps-2026-08-04.md`.
4. ~~`island_visit_awards`~~ — **дефолт принят 04.08**: разобрать попутно
   при вливании `0074` (владелец — тот, кто вливает 0074); отдельного
   решения не требует.
5. ~~VISION.md «1..10»~~ — **подтверждено оператором 04.08** («лимит серии
   увеличивал до 10»); строка перенесена в master.
6. **`secrets.RENDER_API_KEY`** — ввести в окно деплоя, отозвать по §9 п.8
   (запрос хаба).
7. **Replication-WIP**: ветка `wip/replication-docs-pre-sync-2026-08-04`
   (arrows re-review v3, VISION 1..10, capture-правки) — вернуть сессии
   механик на rebase поверх свежего master.

## Парковки (условие возврата)
- **A1 supervised/enablement** — после деплоя + тихая неделя. R3.1 закрыт
  волной 7 ещё 17.07 (merge `2d40e18`) + R4/R4.1; идёт независимая
  верификация (контур 3).
- **P4G Stage 2 инфра** — деплой + `0074` + стабилизация макетов
  поверхностей.
- **C2 evidence** — data-gated (нужны независимые игроки / friend cohort).
- **Feed-sequencing O1–O4** — запаркован 04.08 (решение оператора); возврат:
  появились независимые игроки (закрытый тест 13.10 / friend cohort).
- **Cohort observability** — слит, инертен (`ENABLE_COHORT_OBSERVABILITY=false`).
- **Mobile-review контур** — рабочие деревья swipe-backend / swipe-generator /
  swipe-agents стоят на `codex/mobile-review-performance` с грязными
  изменениями; в swipe-backend две опасные до-rebase миграции `0072`/`0073`
  (НЕ запускать alembic из этого дерева); разбор — владелец PR #25
  (HANDOFF §5б).

## Гигиена (следующий проход, не блокирует)
- Архив в `docs/archive/2026-08/`: series-order-* пакеты (R2 GO, код влит),
  html-питчи от 05.07, `pins-ftue-L1-video-compliance.pdf`,
  `playable-tickets.html`/`playables-status.html`,
  `feed-sequencing-orchestration-handoff-2026-07-27.md` (устарел: пакеты
  11–12 не отражены; архивировать после O1–O4).
- `scratchpad/`, `help-map-prototype/` → `.gitignore` или переезд;
  `package.json`/`package-lock.json` (легаси npm-workspace) → архив.
- `swipe-agents`: локальный `main` на 3 коммита впереди `origin/main` и на
  65 позади — сверить и примирить.
- Файл `=` удалён 04.08.

## Журнал передач
- 04.08 поздний вечер: решения оператора — сапёр ждёт деплоя; Block Out
  отложен (оператор полирует сам); feed-sequencing запаркован; VISION
  «1..10» подтверждён и перенесён в master; `island_visit_awards` —
  разобрать при 0074.
- 04.08 вечер: чекпойнт → разделение контуров; хэндофф хаба принят
  (`HANDOFF-P4G-STAGE1-2-2026-08-04.md`); созданы STATE.md, роли в
  AGENTS.md, двухконтурный режим в CLAUDE.md, ТЗ Мак 2; WIP
  replication-доков законсервирован веткой
  `wip/replication-docs-pre-sync-2026-08-04`.

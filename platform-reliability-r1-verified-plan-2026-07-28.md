# Platform Reliability Foundation R1 — выверенный план v2 (для codex)

Дата: 2026-07-28 (v2, после codex-контрревью GO-с-условиями). Автор: Claude
(оркестратор). Статус: утверждённый план исполнения. Роли: **codex исполняет,
Claude ревьюит каждый пакет (author≠reviewer), оператор — все включения,
классификации и деньги.**

Верификация фактов велась против `swipe-backend@eb17916` (origin/master).
Методологическая поправка v2: проверка v1 по факту №5 прошла по устаревшему
локальному checkout (`git pull` был заглушен и молча не сработал) — все
последующие верификации в R1 обязаны идти против `origin/<branch>` явно
(`git show origin/master:<file>`), с фиксацией SHA в evidence.

## 0. Верификация фактов среза

| # | Утверждение среза | Вердикт | Доказательство |
|---|---|---|---|
| 1 | PG 1 GB без autoscaling | ✅ | `render.yaml`: `plan: basic-256mb`, `diskSizeGB: 1`, `storageAutoscalingEnabled: false` |
| 2 | Миграции на старте web-контейнера | ✅, долг уже известен | `scripts/start-bake-runtime.sh` (`alembic upgrade head`); комментарий в `render.yaml` называет перенос в `preDeployCommand` отдельным rollout-ом |
| 3 | Клонирование swipe-ugc + `npm install` на старте | ✅ | `start-bake-runtime.sh` `clone_or_update()` + `npm install --omit=dev` |
| 4 | GitHub-токен попадает в URL remote | ✅ | `start-bake-runtime.sh:18–19`: `https://x-access-token:${GITHUB_TOKEN}@github.com/…` — остаётся в конфиге клона на диске |
| 5 | Production runtime способен пушить в Git | ✅ **(поправка v2; в v1 ошибочно отвергнуто)** | `start-bake-runtime.sh:31–38` (`origin/master@eb17916`): если checkout впереди remote, стартап выполняет `git push origin HEAD:$branch`. На ephemeral fs ветка редко достижима, но write-authority существует. **R1 удаляет весь push-path**; read-only токен — лишь временная защита |
| 6 | Пять фоновых runner-ов в одном процессе | ✅ ровно пять | `app/main.py:76–80`: bake, theme, control-plane-maintenance, bot, notification |
| 7 | Healthcheck намеренно без БД | ✅ осознанное решение | `app/main.py:110–113`, docstring: keep-alive обязан оставаться зелёным при недоступном PG. Лечится добавлением `/ready`, а не «починкой» `/health` |
| 8 | ~145 таблиц / 66 миграций | ✅ порядок верен | 68 файлов миграций |
| 9 | Retention только у пары служебных таблиц | ✅ | retention-логика найдена только в контурах feed-sequencing / cohort-observability |
| 10 | models.py ~8600; feed.ts 10 441; island.ts 4279 строк | ✅ | 8760 / 10 441 / 4279 |
| 11 | ~339 deploy-коммитов за 30 дней | ✅ и больше | 513 коммитов swipe-platform за 30 дней (deploy+stamp парами) |
| 12 | Гонки параллельных релизов | ✅ инцидентом | 28.07: деплои 15:00/15:18 из разных сессий; сброс P2-гейтов чужим env (закрыт пришпиленным профилем, playables `4fe9a32`) |
| 13 | Restore-drill прод-PG не зафиксирован | ✅ | Есть только drill A1 на резервном хосте и recall каталога 17.07; прод-PG restore-доказательства нет |
| 14 | Сид ботов на старте | ✅, принятое отклонение | CLAUDE.md: ТЗ §3.1 хотело CLI dry-run; single-instance допущение записано |

## 0-bis. Закрытые вопросы (были «открытыми» в v1)

1. **PITR**: доступен всем платным Render Postgres; окно 3 дня (Hobby) /
   7 дней (Pro+) — [Render Postgres Recovery](https://render.com/docs/postgresql-backups).
   В R1-0 остаётся: подтвердить Recovery page фактического инстанса и провести
   isolated restore-drill в отдельную БД (без переключения production).
2. **preDeployCommand**: поддержан платными Docker web services, выполняется на
   отдельном instance; при ошибке старый deploy продолжает работать —
   [Render deploy pipeline](https://render.com/docs/deploys). Zero-downtime
   требует expand/contract-совместимости схемы со старым кодом → первая
   перенесённая миграция проходит explicit backward-compat аудит, и политика
   expand/contract становится обязательной с этого момента.

## 1. Вердикт по инициативам

### И1 Data Safety & Recovery — ПРИНЯТА с контрактной правкой (P0, первая)
Append-only журналы — по durable-решениям **source of truth с byte-identical
replay по `seq`**. «DELETE старше N» для evidence-классов запрещён — ломает
replay-гарантии. Классификация в четыре класса:
- **eternal evidence** — вечно; допустимы только партиционирование и выгрузка в
  холодный архив с digest и доказанным обратным чтением;
- **operational** — retention допустим, по-таблично;
- **derived** — восстановимо replay-ем;
- **disposable** — чистится свободно.
Каждое отнесение журнала к не-eternal классу — **операторское решение**.
Никакая классификация и тем более удаление НЕ входят в R1-0.

### И2 Immutable Build & Release — ПРИНЯТА, достройка существующего
Не переизобретать: пришпиленный release-профиль с sha256 в receipt
(playables `4fe9a32`, боевой прогон 28.07 18:22), source-lock деплоя,
content-addressed `runtime-releases/…/<digestHex>/`, провенанс-стампы.
Новое: CI-сборка клиента из точных SHA → immutable artifact с digest;
сериализация деплоев + CAS по текущей версии; единый release-manifest
(backend SHA + feed SHA + playables SHA + UGC SHA + профиль+sha256 + alembic
head), совместимый с release.json v2; откат на предыдущий артефакт;
**полное удаление runtime push-path** (факт 5) и read-only fine-grained токен
вне remote URL. Локальный деплой-путь после перехода остаётся только как
break-glass (задокументированный, с receipt-ом использования).

### И3 Runtime Isolation & Readiness — ПРИНЯТА в едино-worker варианте (P1)
`/health` не трогаем (осознанный keep-alive контракт); добавляем `/live` и
`/ready` (БД + alembic head + обязательные runtime-зависимости, включая
bake_runtime). Вынос: **один** отдельный background worker со всеми пятью
loop-ами и существующим fencing (образцы 0021: fenced leases, failure
receipts) — не пять сервисов. Переход flag-gated: web держит runner-ы до
доказанного worker-а, затем выключение у web (никакого окна двойного
исполнения: взаимоисключающий флаг, не параллель). Дальнейшее дробление —
только по измеренному blast radius/load и после заключения финдиректора.

### И4 Observability & Operational SLO — ПРИНЯТА (P1, параллельно И3)
Фильтр VISION «экономия внимания»: алерт = требуемое действие оператора.
Выбор внешнего сервиса (Sentry и т.п.) = новый поставщик/расход →
финдиректор + оператор.

### И5 Modularization — в R1 только стоп-кран
Архитектурный тест-запрет **новых** межконтурных импортов + бюджет строк для
**новых** файлов (существующие монолиты — grandfathered список). Разнос
models.py/feed.ts/island.ts — отдельной целью после R1.

### И6 Contract Supply Chain — вне R1 (P2)

### И7 Drift Guard — частично в R1
Operational manifest выпадает из release-manifest И2; CI-сравнение
серверных/клиентских флагов — тонкий срез в R1. Остальное после.

## 2. Карточка цели (утверждена оператором 28.07, GO с условиями)

- **Название:** Platform Reliability Foundation R1.
- **Statement:** прод собирается из неизменяемых артефактов и не зависит от
  состояния операторской машины; миграции отделены от старта web; переполнение
  диска или остановка runner-а обнаруживаются алертом до пользовательской
  ошибки; восстановление прод-БД доказано прогоном с записанными RPO/RTO.
- **Exit (расширен по контрревью):**
  1. production startup не выполняет git, npm install и миграции;
  2. CI выпускает immutable artifact по точным SHA;
  3. deploy использует CAS/очередь; локальный путь — только break-glass;
  4. restore доказан с зафиксированными RPO/RTO (isolated drill);
  5. `/ready` проверяет БД, migration head и обязательные runtime-зависимости;
  6. web не владеет фоновыми runner-ами (единый background worker);
  7. алерты: диск 70/85%, per-runner живость — активны и «алерт = действие»;
  8. классификация всех журналов утверждена оператором (без удалений в R1);
  9. новый код не увеличивает межконтурное сцепление и не создаёт новые
     oversized-файлы (архтест + бюджет строк зелёные в CI).
- **Kill/откат:** каждая ступень независимо откатывается; старые стартовый и
  деплой-скрипты остаются в git до конца quiet-периода R1; продуктовые контуры
  не задеваются; мораторий соблюдён.
- **Ведёт:** codex (исполнение), Claude (кросс-ревью каждого пакета),
  оператор (утверждения: классификация, деньги, включения, drill).

## 3. R1-0 — первые 48 часов (по контрревью, зафиксировано)

1. Снимок `pg_total_relation_size`, rows и скорости роста по таблицам
   (read-only; повторный снимок через 24–48ч для скорости).
2. Подтверждение PITR и recovery window на Recovery page фактического
   инстанса.
3. **Isolated restore-drill** в отдельную БД, без переключения production
   (кратковременный расход на temp-инстанс — уведомить финдиректор-контур;
   присутствие оператора обязательно).
4. Немедленная сериализация локального деплоя: CAS-замок в deploy-swipe.sh
   (fetch→verify→push атомарно; отказ при сдвиге origin/master между fetch и
   push; git non-ff уже даёт нижний уровень защиты — добавить явный замок).
5. Удаление runtime push-path (`clone_or_update` строки 31–38) + ротация
   GITHUB_TOKEN в read-only fine-grained (ротация — операторское действие в
   Render dashboard; код-часть — обычный review-flow).
6. Никакой классификации eternal evidence и никаких удалений — отдельные
   операторские решения вне R1-0.

## 4. Нарезка для codex (порядок и authority-границы)

| Пакет | Содержимое | Authority-граница |
|---|---|---|
| R1-0 (48ч) | п.3 выше | drill и ротация токена — с оператором; остальное read-only/код через ревью |
| R1-1 data safety | классификация журналов (draft → оператор утверждает); алерты диска; партиции/архив только для утверждённого | без самостоятельных решений по классам |
| R1-2 immutable release | CI-сборка, digest-артефакт, release-manifest, CAS-деплой | выключение локального деплоя (перевод в break-glass) — по слову оператора |
| R1-3 startup split | preDeploy-миграции (+expand/contract аудит первой миграции); web без git/npm (bake-runtime как build-слой образа) | смена стартового контракта — финальное подтверждение оператора |
| R1-4 readiness+worker | /live+/ready; единый background worker (5 loop-ов, fencing 0021, flag-gated переход) | новый сервис = деньги → финдиректор + оператор до старта |
| R1-5 observability | коллекторы, дашборд, алерты по фильтру «алерт=действие» | внешний сервис — оператор |
| R1-6 стоп-кран | архтест импортов + бюджет строк новых файлов | чистый CI |

Правила: каждый пакет — отдельная ветка + evidence-пакет с точными SHA;
Claude ревьюит каждый пакет до merge; включения в прод — только по явному
слову оператора; новые флаги default-off; боевые значения — только через
закоммиченные источники (render.yaml / release-профиль).

## 5. Остаточные вопросы codex-у

1. Оценить: bake-runtime как слой Docker-образа (COPY из build-stage) против
   отдельного artifact-хранилища — стоимость холодного старта и размер образа.
2. Предложить формат release-manifest, расширяющий release.json v2
   (profileName+profileFileSha256) без слома читателей.
3. Для R1-4: предложить механизм взаимоисключения web-runners/worker
   (флаг+lease), исключающий и двойное исполнение, и «никто не исполняет».

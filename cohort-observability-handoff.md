# ТЗ-handoff: Cohort Observability v1.1 — когортный дайджест + cohort watch

Дата: 23.07.2026 (v1.1 после codex-ревью `42b3a78` — все 6 P1 приняты).
Оркестратор: Claude. Исполнитель: codex (отдельная сессия, резервная машина).
Утверждено оператором как измерительный инструмент шага 2 лестницы —
мораторий не нарушается.

**Текущий allowed scope реализации (GO codex):** уточнённая спека +
безопасная C1-часть компонента A. Компонент B (watchers), production
enablement и friend invites — за своими гейтами (см. §3, §6).

Замороженный текст спеки по итогам — в
`swipe-backend/docs/specs/cohort-observability.md`; этот файл — handoff.

## 0. Authority и контекст

- Продукт: `VISION.md` v2.3 (лестница §, North Star, принцип 7).
- Границы C1/C2: `swipe-backend/docs/specs/content-analytics-report.md` —
  **несущий документ этого ТЗ**: return_demand, first-experience,
  segment/runway/starvation, GenerationBrief = C2 (data-gated); C1 =
  funnels/facts.
- Роли: `AGENT-ROLES.md` (meta-repo) с lifecycle-статусами.
- A1: `swipe-backend/docs/specs/agent-team.md` — source matrix A1
  исчерпывающая (health/диск/часы/сеть/локальный store); cohort-источники в
  неё НЕ входят (§3 этого ТЗ).
- M2M: `agents-m2m-read.md` — статус заголовка расходится с фактом
  (backend read path принят и смержен, заголовок draft). Задача внутри
  среза: привести authority-документ к одному источнику правды (exact
  accepted revision + receipt), НЕ утверждая A1-допуск (agent-side
  интеграция и freshness-watcher = B1, отдельная приёмка).
- Кирпичи: C1 cron (receipts/replay-noop, окна D-2), c1.4 (master
  `e358b43`), transactional outbox-паттерн
  (`swipe-generator/src/evaluation-outbox.mjs` — образец для доставки),
  разовая TG-доставка 20.07 (формат), `feed-prototype/COHORT-PREFLIGHT.md`.

## 1. Не цели / границы

- **Строго C1.** В v1 НЕТ: organic return / межсессионного
  time-to-first-qualified-play / runway-starvation — это C2-extension после
  data gate (отдельное будущее ТЗ). Разрешённая длительность в v1 — только
  **внутрисерийная**: от первого `catalog_level_impression` до chest в
  пределах одного immutable series ticket, и называется она
  `inSeriesDurationMs`, не «time to qualified» и не retention.
- Никакой новой HTTP/публикационной/флаговой authority; никаких прямых
  DB-кредов вовне backend.
- Никакого изменения C1-контракта задним числом (additive c1.x с ревью).
- Friend-строки не передаются в LLM ни на каком этапе.

## 2. Компонент A — когортный дневной дайджест (backend)

### 2.1 Scope метрик (C1-safe, исчерпывающе)

По каждому участнику когорты за окно:

- C1-воронки entry/level/series (счётчики стадий по словарю
  `funnelStages` из hypotheses.json);
- exact ordinal отвала незавершённой серии;
- серии начаты / завершены; split builtin vs generated;
- raw-факты ошибок: configuration_failure, loader/runtime failure;
- `inSeriesDurationMs` завершённых серий (определение в §1);
- same-day operational-счётчики — только с пометкой `settled:false`.

Агрегат дня: активные из N, новые игроки с завершённой серией, сводка
ошибок. **Никаких** производных «вернулся/удержан/голодает».

### 2.2 Два слоя свежести + identity ревизий

- **Operational-слой**: отдельная read-only проекция `cohort-operational.v1`
  поверх projection-примитивов c1.4. Identity снапшота = exact input
  manifest: `window + dataCutoffWatermark + codeDigest + configDigest +
  cohortConfigDigest`. Поздние факты ⇒ **новая immutable revision**
  (старые байты неизменны), не перезапись. No-op определяется по manifest,
  не по «cohort+day».
- **Settled-слой**: строки канонического C1 (D-2), связываются с
  operational-ревизиями по окну; расхождение — норма и показывается как
  таковое.
- В спеке зафиксировать: какая ревизия доставляется; когда и как приходит
  settled-коррекция; UTC-окно + IANA timezone расписания; поведение на DST,
  zero-data и late arrivals.

### 2.3 Privacy contract (обязателен ДО инвайтов)

- В immutable документах и Telegram-карточках — только псевдонимный
  `cohortSubjectId`; telegram id/имя в JCS-документ и receipts НЕ входят.
- Обратимое соответствие subject↔user хранится отдельно, encrypted,
  deletable; retention и процедура удаления описаны.
- Явное согласие участников (фиксирует оператор при инвайте; шаблон — в
  COHORT-PREFLIGHT).
- Доставка — exact приватный operator-to-bot чат.
- Operator-only dry-run помечается «диагностический N=1», без
  групповых/каузальных формулировок.

### 2.4 Механика и доставка (честный at-least-once)

- Материализация: по образцу `content_analytics_scheduler`
  (lease/fencing, run-receipts, replay = noop по manifest-identity).
- Доставка: **transactional outbox** (образец — evaluation-outbox):
  deterministic `deliveryId`, at-least-once, классификация
  terminal/retryable/`outcome_unknown` (crash после send до receipt),
  digest-id в тексте/metadata сообщения для распознавания дубля человеком,
  bounded retry + breaker, receipt с `message_id` только после
  подтверждённого ответа Bot API.
- Токен продуктового бота — только outbound; никакого
  webhook/long-polling ownership у backend; QA-бот A1 и его канал —
  отдельный контур, токены не смешиваются.

### 2.5 Несущий гейт дисциплины (не лексика)

Typed schema документа: allowlist точных C1-полей, числа/labels рендерит
validator, свободнотекстовых interpretation/advisory полей НЕТ.
Лексический blacklist (рекоменд*/стоит/лучше) остаётся как
defense-in-depth regression + видимая финальная строка «Дисциплина:
C2-выводов нет».

## 3. Компонент B — cohort watch: ОТДЕЛЬНАЯ ревизия A1.1/B1 (не в этом срезе)

Codex-ревью верно указало: source matrix A1 исчерпывающая, cohort-источники
в неё не входят, и физически удалённому watcher'у нечем читать backend без
новой поверхности (прямой DB-кред запрещён). Поэтому:

- Компонент B выносится в **отдельное ТЗ A1.1/B1**: поправка
  source/authority matrix, server-owned watermarks/read surfaces, credential
  scope, отдельные fault-injection acceptance.
- `cohort_runway_starvation` — отложен до C2 (вместе с runway-метриками).
- `cohort_loader_failure` — в v1 остаётся **backend-owned сигналом внутри
  дайджеста** (raw-факты уже в scope §2.1); нужен ли B1-watcher — решение
  при проектировании A1.1.
- `cohort_digest_missing` — строится по **server-owned
  materialization/delivery watermark** (внутренний факт компонента A), не
  по догадке из Telegram; сам watcher — тоже A1.1.

### Последовательность тихих недель (принято по ревью)

1. Текущая A1 quiet week доигрывается как evidence базового контура —
   разработку компонента A она не блокирует.
2. Параллельно: спека+реализация компонента A (этот handoff).
3. A1.1/B1: authority amendment + fault-injection acceptance.
4. **Отдельная полная quiet week боевой cohort-конфигурации — именно она
   invite gate.** (Если оператор хочет одну финальную неделю — она явно
   называется A1.1/B1 acceptance week; прогресс базовой недели — evidence,
   не замена гейта.)

## 4. Есть сейчас → роль

| Есть | Роль |
|---|---|
| C1 cron + receipts + replay-noop | образец механики и settled-слой |
| c1.4 primitives (master) | единственный источник подсчётов |
| content-analytics-report.md | несущая граница C1/C2 |
| evaluation-outbox (generator) | образец transactional-доставки |
| m2m read backend path (смержен) | доступ чтения; статус-док привести к правде |
| разовая TG-доставка 20.07 | формат карточки |
| COHORT-PREFLIGHT.md | операционный чеклист + согласие участников |

## 5. Coverage contract (статус — у CI)

Pure+PG: детерминизм/JCS/digest; lease-гонка → один receipt; late events →
новая revision, старые bytes нетронуты; operational vs settled divergence;
completeness/missing denominators; смена cohort-config/membership;
zero-data; N=1 operator; duplicate/out-of-order события; delivery: crash до
send / после send до receipt / lost response; retry/breaker; bounded outbox;
privacy: redaction, отдельное deletable mapping, отсутствие id/имени в
JCS-байтах; timezone/DST; size caps; default-off rollout и rollback без
удаления evidence; migration roundtrip в общей матрице.

## 6. DoD (для allowed scope)

1. Спека заморожена в `docs/specs/cohort-observability.md` (v1.1-границы).
2. Компонент A реализован за default-off флагом; полный coverage §5 зелёный
   в CI.
3. Dry-run на операторе (N=1, диагностический): cron-receipt +
   доставленная карточка с пометками слоёв и privacy-контрактом.
4. `agents-m2m-read.md` статус приведён к правде (exact revision+receipt).
5. Ревью: Claude (полное) → codex (authority) → merge. Прод-деплой крона,
   A1.1/B1 и инвайты — отдельные операторские акты за гейтами.

## 7. Развёртывание: на резервной машине

1. `git clone https://github.com/Glera/p4g-workspace-meta.git
   p4g-platform-workspace && cd p4g-platform-workspace &&
   bash bootstrap-workspace.sh`
2. Ручной хвост: `gh auth login`, codex-auth, PostgreSQL 15, локальный
   `DATABASE_URL`. Операторские секреты (Render ops-ключ, прод-токены) НЕ
   переносить — реализация локальна+CI; прод-акты с основной машины.
3. Порядок чтения: `VISION.md` → `AGENTS.md` → `AGENT-ROLES.md` →
   `IMPLEMENTATION-STATUS.md` → `content-analytics-report.md` → этот файл.
4. Правила: worktree-ветки, без прямых пушей в master, явные exit-коды.

## 8. Открытые решения оператора

- Время дайджеста / чат (приватный operator-to-bot).
- Формат карточки (после dry-run).
- Одна финальная acceptance-неделя vs две (см. §3).
- Пороги будущих A1.1-классов — при их ТЗ.

# Experiment-worker conformance · evidence-пакет для интеграции и ревью

## Fix-раунд 3 (ответ на второй NO-GO, коммит **`0a6ad25`**)

Моя половина скоупа по разделению; generator-side envelope / independent
verifier / attempt-binding / gate events — за primary. Сьют:
**98 / 97 pass / 1 skip / 0 fail**, lint 10 модулей, literal NUL устранён
(проверено байтовым сканом всех worker/test/scripts модулей).

1. **Exact frozen metrics**: `conformance = {idleMs 1..600000, rafFrames
   0..10^7}`, `autoplay = {durationMs 1..86400000, rafFrames 1..10^7,
   visualStates 2..10^6 (гейт требует ≥2 визуальных состояний), runNumber ∈
   {1,2}}` — ровно то, что измеряют реальные гейты; произвольные объекты
   отклоняются exact-keys. `files` = уникальные `marble-sort-swipe/src/**.ts`
   (точный домен validateDiff), ≤200 путей, без `..`.
2. **attemptUid = canonical UUID**, обязателен при `--parent` (rework),
   полный НЕусечённый UUID входит в candidate id (`slug-digest-uuid`) и
   валидируется контрактом (`id must embed the full untruncated attempt UUID`).
3. **Failure redaction + exact verifier**: `redactFailureMessage` (ANSI,
   control-символы, home-префикс путей → `~`, bound 2000) применяется ДО
   подписи; `verifyWorkerFailure` — exact-keys, snake_case code, redacted
   message (само-идемпотентность редакции проверяется), digest replay;
   re-sign матрица для failure тоже.
4. **publish-experiment single hardened capture**: manifest/html/cover/patch
   читаются ровно один раз `readFileExact` (O_NOFOLLOW), все digests typed
   результата проверяются (включая patch), публикуются ИМЕННО захваченные
   байты (writeFileSync capturedBytes вместо copyFileSync по pathname).
5. **Межпроцессный race-тест**: три отдельных node-процесса публикуют один
   кандидат конкурентно → один immutable результат, один манифест, ноль
   выживших staging-директорий. README приведён к актуальному контракту
   (один invocation, typed RESULT/ERROR, append-only, UGC_EXPERIMENT_ATTEMPTS
   удалён).

Вне моего скоупа (за primary, по разделению): immutable server-owned parent
envelope (worker примет его формат, когда generator его определит — сейчас
worker-local closure остаётся последней линией), generator-side RESULT/ERROR
verifier + error-code persistence + `worker_completed → gate_verified →
delivered` events.

## Fix-раунд 2 (ответ на NO-GO, коммит **`cf56702`**)

Все 5 обязательных исправлений + command-level тесты. Сьют worktree:
**95 tests / 94 pass / 1 skip / 0 fail**, lint 10 модулей.

1. **`verifyWorkerResult` = полная пере-валидация домена**: exact-keys всего
   документа, вложенные concept/conformance/autoplay/files, `autoplayPassed=true`,
   `agentInvocations=1`, равенство top-level и artifact identity
   (baseCommit/baselineId), derive-проверка url/coverUrl из id, запрет
   parent.patchSha256 == artifact.patchSha256 (форж «no-op tuning»). Тест
   «re-signed forged»: 7 подделок с ВАЛИДНЫМ digest над невалидными
   утверждениями — все отклоняются теми же typed-кодами, что и байтовая порча.
2. **Feedback внутри typed boundary + домен request**: вся отклоняющая
   валидация входа (parentId-формат, feedback, model invocation, attempt-uid,
   baseline) перенесена в главный try — любой отказ = однострочный typed
   `ERROR` + exit 1, без stack trace (command-тест проверяет). Домен зеркалит
   generator `printable`: 1..2000 символов, ≤8000 utf-8 байт, без
   control-символов и leading/trailing whitespace, без trim/подмен.
3. **Parent hardened**: новый `worker/publish-local.mjs`,
   `readFileExact` = O_NOFOLLOW + fstat-IsFile + bound 64МБ, bytes читаются
   ровно один раз; `loadParentClosure` требует verified typed manifest
   (legacy → typed `legacy_parent_unverifiable`) и реплей patch/html/cover
   digests; применяется ТОЛЬКО захваченный patch-байт-массив через файл,
   которым владеет процесс (pathname родителя не переоткрывается). Тесты:
   symlink-подмена → `parent_unverifiable`, чужие байты →
   `parent_closure_mismatch`.
4. **Append-only race-safe публикация**: staging в `.staging-*`, коммит
   no-overwrite линками в фиксированном порядке html→cover→patch→manifest
   (manifest = последний commit-marker); EEXIST → побайтовое сравнение:
   идентично = exact replay committed-манифеста, различие = typed
   `publish_conflict`; кандидат связывается с immutable attempt через
   `--attempt-uid` (id получает суффикс, поле `attemptUid` в RESULT). Тесты:
   конкурентные 4 публикации → один immutable результат, conflict не трогает
   committed-байты, staging всегда убран.
5. **Consumer-срез (swipe-ugc половина)**: `publish-experiment.mjs` для typed
   кандидатов выполняет `verifyWorkerResult` + реплей html/cover digests до
   публикации и читает `parent.experimentId`/`agentInvocations` (legacy-путь
   сохранён для старых манифестов); `capture-cover.mjs` больше не мутирует
   content-addressed результаты (typed кандидаты skip с логом — cover входит
   в identity). Generator-side проверка typed RESULT/ERROR и сохранение error
   code — за primary, как договорено.

Новые/обновлённые тесты: `experiment-worker-conformance` (8, включая
re-signed матрицу) + `experiment-worker-publication` (6: append-only,
конкуренция, closure/symlink, command-level invalid feedback / control chars
/ oversized / unverifiable parent с нулём созданных артефактов). Golden
пересоздан: `expectedResultDigest = a040ddd4a189…`.

---

## Раунд 1 (исторический контекст)

Ветка: `worker-conformance` в worktree `swipe-ugc-worker-conformance/`
(база `65f1d52`, коммит **`028e60a`**). Основной `swipe-ugc` worktree с чужим
WIP не тронут; generator/backend/Lab UI не тронуты. Мержа не делал — по
договорённости интеграцию и независимое ревью проводит primary.

## Скоуп → реализация (4 файла)

| Требование | Как закрыто |
|---|---|
| Feedback без обрезания, exact 1..2000 | `validateExperimentFeedback` в новом `worker/result-contract.mjs`: null/'' допустим только без parent; для tuning-pass обязателен; длина 1..2000 **сырых** символов, никакого trim/slice; нарушение = typed `invalid_feedback`. Строка `slice(0, 500)` удалена |
| Один физический запуск = один job/attempt/receipt | `MAX_ATTEMPTS` и цикл repair-повторов удалены целиком; ровно один `await invokeAgent(...)` на процесс; `agentInvocations` в RESULT жёстко валидируется `=== 1` (нарушение = typed `multiple_provider_invocations_share_one_job` — тот же код, что ждёт generator-dispatch) |
| Убрать внутренние три повтора | см. выше; repair-ветка `agentPrompt` (вшивание failure-транскрипта) тоже удалена — цикл доработки принадлежит generator-слою джобов |
| Typed exact RESULT | `buildWorkerResult`: exact-keys схема `ugc.experiment-worker-result.v1`; `parent: {experimentId, patchSha256} \| null` (patch родителя хэшируется при загрузке); `artifact: {baseCommit, baselineId, htmlSha256, coverSha256, patchSha256}`; `resultDigest` = sha256 канонического JSON (детерминированная сериализация с сортировкой ключей, запрет NaN/undefined); `verifyWorkerResult` реплеит digest. Манифест на диске = тот же typed-документ |
| Unproven autoplay / неполное evidence → non-zero, без success | soft-gate удалён: `AutoplayIncompleteError` получает код `autoplay_unproven` и уходит в typed `ERROR` + `exitCode 1`, ничего не публикуется; `assertCompleteEvidence` требует patch+html+cover+conformance+autoplay-метрики+win и именует недостающее (`incomplete_evidence`); `buildWorkerResult` дополнительно отказывает при `autoplayPassed !== true` |
| ERROR-канал | тоже typed: `ugc.experiment-worker-failure.v1` с `code/message/provider/model` и `failureDigest` |

## Тесты

- Новый `test/experiment-worker-conformance.test.mjs`: **7/7** —
  feedback-границы (2000 ок, 2001 отказ, 750 non-ASCII round-trip), детерминизм
  канонического JSON под перестановкой ключей, golden-digest реплей,
  «RESULT только для одного доказанного запуска» (все typed-отказы),
  именование недостающего evidence, digest-bound failure, и source-conformance
  (нет slice у feedback, нет MAX_ATTEMPTS, один call-site invokeAgent, RESULT
  через контракт, soft-gate отсутствует).
- Golden: `test/fixtures/experiment-worker-result-v1.golden.json`,
  `expectedResultDigest = 8242eef25e171293c0101b348dd9d1b5bfd8fedd91f8dec0db1063d82f2a23ba`.
- Полный сьют swipe-ugc в worktree: **88 tests / 87 pass / 1 skipped / 0 fail**
  (после `npm ci`; worktree не наследует node_modules), `scripts/lint.mjs`
  зелёный.

## Замечания интегратору

1. **Смена схемы RESULT/манифеста**: удалены legacy-поля `attempts`,
   `gateError`, `parentId`, `baselineTree`, `agentTimeoutSec`,
   `agentSilenceWarnSec`, `totalTimeoutSec`, плоские `pitch/mechanic/feeling/
   prompt/feedback` (теперь внутри `concept{}`); добавлены `schema`, `parent`,
   `artifact`, `resultDigest`, `agentInvocations`. Потребители манифеста в
   generator/UI должны перейти на typed-схему (generator-side hookup у вас).
2. **Tuning теперь требует feedback**: `--parent` без `--feedback` = typed
   отказ (раньше подставлялся дефолтный текст). Generator-dispatch обязан
   передавать инструкцию явно — для rework-моста это и есть желаемое.
3. **Autoplay flake-retry сохранён** (quarantine-семантика заморожена ТЗ) —
   «внутренние повторы» касались только agent-инвокаций.
4. Чужой WIP в основном worktree трогает `worker/experiment.mjs` — при
   интеграции ветку нужно свести с ним осознанно (мой diff базируется на
   `65f1d52`).

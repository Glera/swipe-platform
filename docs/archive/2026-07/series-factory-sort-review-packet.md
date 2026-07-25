# Series Factory / Sort — independent review packet

## Handoff

- Repository: `swipe-generator`
- Isolated worktree: `/Users/gleb/My projects/p4g-platform-workspace/swipe-generator-series-factory`
- Branch: `codex/series-factory`
- Review commit: `57b29558361f6b113941a5f2f8f11084968116b5`
- Base: `2afee562f43ee7febd5be8b3ba4e01ff9c8d2b59` (`origin/master` at branch creation)
- Merge/push/deploy: **not performed**; independent GO is required first.

Authority for the review is `swipe-backend/docs/specs/night-generation-factory.md`,
especially §4, §5.1, §7, §8, §11 step 2, and §12.

## Exact implemented vertical

1. A human starts from one exact `night.generation-campaign.v1` document.
2. The repo-owned `night.factory-deployment-policy.v1` is loaded from a fixed
   path. CLI callers cannot replace either deployment policy or UGC root.
3. Phase A accepts only provider-free `scheduled_deterministic` Sort series.
   `scheduled_llm`, model plans, provider budget, assets and skin composition
   fail closed.
4. The campaign pins semantic Sort mechanic mapping, runtime contract,
   generator-source closure and planner contract by digest.
5. The deterministic planner emits one existing `levels` job per ordinal,
   including exact RecipeProposal, seed, target difficulty and expected
   canonical LevelSpec. A changed but re-digested expected spec fails trusted
   replay validation.
6. `enqueue --apply` first appends one local
   `night.series-factory-approval.v1` receipt (campaign/plan/policy/actor/time),
   then reuses or creates the bounded jobs. Deterministic client IDs make a
   lost response replay-safe.
7. Review backlog is counted across every pending Lab subject. Before the
   first missing job is created, the guard proves `outstanding + missing <=
   maxOutstandingReviews`. Exact already-created jobs reserve no second slot.
8. A content-addressed job-binding receipt freezes each
   `(series, ordinal, clientId, jobId)`. Selection therefore uses the true
   artifact-scoped review identity of that exact campaign job; it never
   derives review identity from specHash.
9. The pure selector reports pending/rejected candidates and rejects closure
   drift, ambiguity, exact/corpus/behavioral duplicates, excluded
   fingerprints, effort regression, sudden effort jump, quota overflow and a
   full review backlog.
10. `materialize --apply` posts only ordinary idempotent Workshop draft
    requests. Full-series preview/chest/review and Telegram-only publication
    remain unchanged and mandatory.

The lane-local output is deliberately named `night.series-selection.v1`, not
the future unified `night.morning-packet.v1` from §11 step 6.

## Deliberately absent

- no provider/model invocation;
- no new server route or HTTP authority;
- no scheduler hook;
- no catalog/TMA/publish/recall call;
- no automatic review or verdict;
- no change to `mechanics.json` or `capabilities.levelSeries`;
- no product scorecard or C1-dependent learning decision.

## Evidence reproduced by the author

```text
npm run verify
422 tests / 422 pass / 0 fail / 0 skip

node --test test/series-factory.test.mjs
7 tests / 7 pass

git diff --check
clean
```

The focused suite includes:

- exact campaign/policy/autonomy and re-signed-plan attacks;
- byte-stable planner replay through the existing trusted generator;
- lost-response enqueue replay and divergent-clientId conflict;
- full-backlog exact replay versus no-effect rejection of new jobs;
- artifact-scoped job binding;
- duplicate/exclusion/regression/jump/backlog selector matrix;
- re-signed selection mutation before Workshop POST;
- append-only approval creation and exact replay;
- real CLI template/plan/enqueue dry-run without a Lab server;
- rejection of non-loopback effectful transport.

## Suggested adversarial review

```bash
cd '/Users/gleb/My projects/p4g-platform-workspace/swipe-generator-series-factory'
git show --stat 57b2955
git diff 2afee56..57b2955 -- \
  config/night-factory-deployment.v1.json \
  src/series-factory.mjs \
  src/series-factory-store.mjs \
  scripts/series-factory.mjs \
  test/series-factory.test.mjs \
  README.md package.json
node --test test/series-factory.test.mjs
npm run verify
```

Focus attacks:

1. Can a caller replace policy/contract/model/autonomy after campaign hash?
2. Can a re-signed plan alter LevelSpec, recipe, seed or job request?
3. Can a lost response or partial previous apply double-reserve backlog or
   create a second job?
4. Can an older review of the same spec under another runtime enter the draft?
5. Can corpus duplicates or sharp progression failures consume morning quota?
6. Can a modified selection post a Workshop draft before local rejection?
7. Can approval bytes be overwritten, forged for another plan, or bypassed by
   any effectful exported function/CLI path?
8. Is requiring the currently available pinned generator closure for replay
   acceptable for this Phase-A vertical, or must historical campaign
   materialization gain a separately frozen plan store before GO?
9. Does the absence of a scheduler/server/publication path remain structural,
   not merely a default flag?

Do not run either `enqueue --apply` or `materialize --apply` against the main
Lab data root during review; the focused tests use isolated temporary state and
adapters.

---

## Независимое ревью Claude — вердикт: GO (57b2955)

Прогон verify повторён независимо на review-коммите: **422 tests / 422 pass /
0 fail** (exit 0). Дерево чистое, дифф = 7 файлов, ни один существующий
src/серверный файл не изменён — regression §12 «ручные Workshop/derive/publish
пути не изменились» выполнен по построению.

### Ответы на attack-вопросы пакета

1. **Policy/contract/autonomy после campaignHash** — нет. CLI загружает policy
   только из фиксированного repo-пути и contract только из sibling `swipe-ugc`;
   флагов подмены нет. `validateCampaign` требует равенства
   `campaign.policyDigest` пересчитанному digest активной policy, deepEqual
   inputManifest/sourceRefs текущему trusted-closure, `modelPlan=null`,
   `maxProviderInvocations=0`, и поверх policy-разрешения жёстко допускает
   только `scheduled_deterministic` (typed `night_campaign_autonomy_forbidden`).
2. **Re-signed plan** — переподписанный planDigest проходит digest-проверку, но
   `verifySeriesFactoryPlan` реплеит каждый ordinal через
   `compileRecipeProposal`+`generate` c deepEqual expectedSpec и падает
   `series_factory_plan_invalid` (проверено тестом с forged gridCols).
3. **Двойное резервирование backlog / второй job** — детерминированный
   `clientId sf:<campaignHash>:<series>:<ordinal>`; exact-existing job =
   `reused` и missing=0, guard `outstanding+missing<=max` считает только
   реально отсутствующие jobs; divergent existing → `series_factory_job_conflict`
   до любых enqueue; при полном backlog enqueue-адаптер не вызывается ни разу.
4. **Чужой review того же spec** — селектор фильтрует по
   `item.jobId === binding.jobId && lineage.campaignJobId === binding.jobId`
   плюс runtimeContractDigest/recipeDigest/generatorDigest; identity ревью
   artifact-scoped, не specHash. Проверил реальную проекцию
   `projectLevelLibrary`: `lineage.campaignJobId`, `seriesEligible`,
   duplicate-массивы, `delivery.delivered`+receiptId, oracle
   `difficulty.status='observed'` — все поля реально существуют, синтетическая
   библиотека тестов изоморфна боевой.
5. **Дубликаты/скачки в morning quota** — reject происходит до квоты; quota
   `min(maxMorningSeries, maxOutstandingReviews-outstanding)` расходуется
   только selected-сериями.
6. **Модифицированная selection** — `verifySeriesSelection` пересчитывает
   selectionDigest и пересверяет каждый selected c planом/binding'ом ДО
   первого postDraft (тест: forged reversal → 0 новых POST). Workshop-повтор
   идемпотентен: детерминированный mutationId, same-bytes → replay,
   different-bytes → 409 (`series_workshop.mjs:311`).
7. **Approval bypass** — все три эффектных экспорта требуют
   `verifySeriesFactoryApproval`; `bindSeriesFactoryJobs` не экспортирован.
   Store: `wx`-tmp + `linkSync` (append-only, EEXIST→committed winner), digest
   над содержимым, approvalId детерминирован от campaignHash. Принятая
   семантика Phase A: `enqueue --apply` = та самая «одна явная команда
   оператора» из §8 — receipt фиксирует именно её; отдельного publish/TMA
   authority receipt не даёт.
8. **Историческая материализация** — требование текущего pinned closure
   fail-closed: после апгрейда generator старый campaign честно падает
   `night_campaign_invalid`, ничего не материализуя. Для Phase-A vertical это
   приемлемо; отдельный frozen plan store — будущий срез (когда campaigns
   переживают апгрейды closure). GO не блокирует.
9. **Отсутствие scheduler/server/publish — структурно**: server.mjs не тронут,
   HTTP-вызовы CLI только на loopback-origin без credentials/query
   (`localBaseUrl`), эндпоинты — существующие обычные `/v1/jobs`,
   `/v1/series-drafts`; никакого cron/launchd. Backlog честный:
   `/v1/variations?review=pending` без subject-фильтра покрывает все 4 типа
   subjects.

### Некритичные наблюдения (не блокируют)

- Шаблонная `difficultyCurve` никогда не выдаёт `expert`
  (`round(position*(len-2))` максимум = 'hard'); фолбэк `?? 'hard'`
  недостижим. Кампания с ручным curve может использовать expert — валидатор
  принимает. Косметика шаблона.
- `verifySeriesFactoryPlan` через `boundedText` может бросить
  `night_campaign_invalid` вместо `series_factory_plan_invalid` на кривом
  title — несогласованность кода ошибки, не безопасности.
- `campaignHash` считается по нормализованному (trimmed title) документу —
  два байт-разных файла могут дать один hash; в духе JCS, принято.

### Условия merge

Merge в generator master — GO. Push-гейт стандартного CI временно невозможен:
GitHub Actions заблокирован биллингом аккаунта (все runs падают с «spending
limit», подтверждено аннотациями) — после восстановления биллинга обязательный
прогон remote CI на master. Первая настоящая Sort-кампания локальна (CLI +
локальный Lab) и от биллинга не зависит.

# Series Factory slot repair · review packet

Дата: 2026-07-21

## Scope

- `swipe-generator@68e3895` on `codex/series-factory-repair`
- `swipe-backend@0d05369` on `codex/series-factory-repair-spec` (docs only)
- base Series Factory commit: `57b2955`

Ни одна ветка не влита в master и не запушена. Боевой `repair --apply` не
запускался; localhost Lab не получил новых jobs.

## Intended contract

Repair — отдельный append-only human-approved round поверх immutable base
campaign/plan/job binding. Он:

1. выбирает только latest terminal non-pass slots;
2. сохраняет RecipeProposal, recipe digest и difficulty target, меняет только
   seed;
3. создаёт новый trusted-compiler-replayed LevelSpec и стабильный repair
   clientId;
4. несёт отдельный exact provider-free candidate-budget extension;
5. перед первым enqueue повторно сверяет caller-visible non-pass summary с
   immutable job result;
6. хранит один линейный record на round через no-replace `link(2)`;
7. позволяет следующему round заменить только latest failed replacement;
8. materialize строит effective series из base+replacement slots и не ослабляет
   QA/delivery/blind-good/dedup/progression/series-review gates.

## Verification

- focused: `node --test test/series-factory.test.mjs` → 11/11
- full: `npm run verify` → 426/426
- root: `node scripts/docs-boundary-lint.mjs` → clean
- `git diff --check` → clean in both repos

Red-first/negative matrix includes:

- deterministic exact repair replay;
- pass slots preserved, pending source blocks, all-pass returns `not_needed`;
- trusted compiler replay and curriculum/recipe immutability;
- re-signed budget extension mismatch rejected;
- lost-response-safe enqueue and full-backlog exact replay;
- live source changed to `pass` rejected before enqueue;
- mixed base+repair selection and re-signed job substitution rejected;
- second round closes over latest replacement;
- append-only store replay and divergent same-round conflict.

## First real dry-run

- base campaignHash:
  `c57c58a9d66cb2c089de26226ba41a43f6208c154dc5d8ea541b48d1e8ba6d8b`
- repairPlanDigest:
  `3e4e646bdf2d33887490bf4f7ee7dbf1efe00111b7a83170a361625379d91c09`
- budget extension: 3 candidates, 0 provider invocations, 0 hidden retries
- replacements:
  - series 1 / ordinal 5 → seed 1011 → spec `f9b4fc1a…007a`
  - series 2 / ordinal 3 → seed 1012 → spec `a47a818c…0eac`
  - series 2 / ordinal 5 → seed 1013 → spec `932a0c13…9769`

## Review attacks requested

1. Может ли repair заменить QA-pass slot либо довериться caller-authored
   `sourceVerdict`?
2. Может ли новый round переписать/обойти prior round или создать две ветви?
3. Может ли repair молча расширить исходный candidate/provider/retry budget?
4. Может ли selector подменить base/replacement job или собрать hybrid между
   двумя planned series?
5. Переживает ли crash между approval record и enqueue без второго candidate?
6. Сохранилась ли byte-identity base `night.series-selection.v1` и mutationId
   при отсутствии repair history?
7. Есть ли путь к Workshop/publish authority до обычных human-good и
   full-series gates?

---

## Независимое ревью Claude — вердикт: GO после одного обязательного P2-фикса

Прогон повторён независимо в ревью-worktree на `68e3895`: **426/426, exit 0**.
Spec-ветка `0d05369` — чистое append-only дополнение §5.1 (+ честная смена
статуса документа на «замороженный контракт» со ссылкой на
IMPLEMENTATION-STATUS). Оба основных checkout'а codex не трогал — прогон и
чтение только из изолированного worktree.

### Ответы на attack-вопросы

1. **Repair pass-slot / caller sourceVerdict** — нет. `sourceEvidenceFor`
   выводит evidence только из immutable `job.result.qa.children` (match по
   exact specHash, ровно один); `eligible = pass ∧ observed` блокирует замену
   на этапе apply (`repair_source_invalid`), а caller-authored `sourceVerdict`
   лишь кросс-сверяется с пересчитанным. Плюс plan-level запрет
   `pass+observed`. Словарь `{pass, inconclusive, flake}` сверен с реальным
   `levels-qa-children.mjs:30` — совпадает.
2. **Переписать prior round / две ветви** — нет. Store: gap-free
   `round-NNNN.json` c обязательной цепочкой `previousRepairPlanDigest`,
   no-replace `wx`+`linkSync`, same-round другой план →
   `series_factory_repair_round_conflict` (и в EEXIST-гонке тоже). Верификация
   каждого round идёт против effective slots предыдущих раундов
   (`expectedRound = history+1`).
3. **Тихое расширение бюджета** — нет. `budgetExtension.maxCandidates ===
   replacements.length`, provider/retry жёстко 0; базовый campaign budget
   не мутируется; backlog-guard базового `maxOutstandingReviews` повторно
   применяется в repair-apply до первого enqueue.
4. **Подмена job / hybrid серий** — нет. Selector работает по effective slots
   (base либо latest replacement того же `(seriesIndex, ordinal)`), фильтр
   кандидатов по exact `jobId`+`lineage.campaignJobId` этого слота;
   `verifySeriesSelection` пересчитывает orderedSpecHashes/orderedJobIds
   против effective closure и `repairChainDigest` всей цепочки.
5. **Crash между approval-record и enqueue** — переживает. Record коммитится
   до enqueue; повторный запуск через `listSeriesFactoryRepairs` ловит
   `repair_job_pending` на последнем record и доводит apply по committed
   байтам; детерминированный `sfr:`-clientId исключает второго кандидата.
6. **Byte-identity базы** — сохранена: при пустой repair-history schema/keys/
   mutationId/notes selection v1 не меняются ни на байт.
7. **Путь к publish authority** — отсутствует: materialize по-прежнему постит
   только обычные idempotent Workshop drafts; server.mjs не тронут; все гейты
   (QA/delivery/blind-good/dedup/progression/series-review/Telegram) на месте.

### P2 — обязательный фикс до merge: дубль-драфты нетронутых серий

`repairChainDigest` глобален для selection: при непустой history mutationId и
notes меняются у **всех** серий кампании, включая не тронутые repair'ом.
Сценарий: S1 полностью прошла и материализована до repair (base mutationId);
S2 чинится; повторный `materialize --apply` теперь постит S1 с новым
mutationId+repair-note → Workshop создаёт **второй драфт той же серии** (дедуп
только по mutationId). Каждый следующий round меняет chainDigest и плодит ещё
по драфту за серию. Текущую реальную кампанию это не бьёт (обе серии
затронуты), но контракт v2 замораживается merge'ем — чинить сейчас.
Рекомендация: per-series identity — в mutation identity/notes включать только
раунды, чьи replacements касаются данного `seriesIndex` (подцепочка их
digests); пустая подцепочка → exact базовая identity (byte-identical replay).
Верификатор пересчитывает ту же подцепочку. Re-review фикса — точечный.

### P3 (не блокируют)

- Терминальные job-состояния `failed`/`cancelled` (реальны в
  `store.mjs:268`) попадают в ветку `state !== 'ready'` →
  `repair_source_pending` («is not terminal») — ошибка вводит в заблуждение, и
  слот с hard-failed job в v1 непочиняем навсегда (existing job реюзается,
  selection вечно pending). Для детерминированных provider-free levels-jobs
  случай редкий; нужен typed отказ (например
  `series_factory_repair_source_terminal_failure`) и строка в спеке о границе
  v1.
- `materialize` при полу-применённом repair падает сырым
  `repair_job_pending` — корректно fail-closed, но подсказка «запустите
  repair --apply» сэкономила бы оператору диагностику.

### Merge-условия

После P2-фикса: merge обеих веток; remote CI по-прежнему заблокирован
биллингом GitHub Actions — прогон на master обязателен после восстановления.
Запуск трёх repair-jobs (`3e4e646b…`) — только после вашего явного `go`
оператору.

---

## Fix round · готов к точечному re-review

- generator: `346fcda` поверх `68e3895`
- backend docs: `15aa6d2` поверх `0d05369`
- focused: 12/12
- full verify: 427/427, explicit exit code 0
- docs-boundary-lint: clean

Обязательный P2 закрыт per-series projection: mutation identity и notes считают
digest только по repair-rounds, содержащим replacement этой series. Новый
регрессионный тест ремонтирует только S2 и доказывает, что S1 сохраняет exact
base mutationId+notes, тогда как S2 получает новую identity.

Оба P3 также закрыты локально:

- `failed`/`cancelled` source теперь получает typed
  `series_factory_repair_source_terminal_failure`; граница repair v1 записана
  в spec/README;
- materialize над approved, но ещё не enqueue-нутым repair record выдаёт
  `series_factory_repair_apply_required` с прямой инструкцией выполнить
  `repair --apply`.

---

## Re-review Claude (fix round) — вердикт: GO (346fcda / 15aa6d2)

Verify повторён независимо на `346fcda`: **427/427, exit 0**.

- **P2 закрыт ровно по рекомендации**: `repairDigestForSeries` строит
  per-series подцепочку `{round, replacements, binding jobs}` только из
  раундов, затронувших данный `seriesIndex`; пустая подцепочка → exact базовая
  mutation identity и notes. Применено симметрично в
  `selectSeriesFactoryCandidates` и `verifySeriesSelection`. Новый
  регрессионный тест ремонтирует только S2 и ассертит равенство
  mutationId+notes S1 базовым и неравенство у S2 — ровно найденный сценарий.
  Repair другой серии больше не может породить дубль-драфт, а идентичность
  починенной серии меняется только при изменении её собственных слотов.
- **P3-1 закрыт**: `failed`/`cancelled` source → typed
  `series_factory_repair_source_terminal_failure` (тест есть); граница v1
  зафиксирована в спеке: чинится только terminal QA evidence
  (`inconclusive`/`flake`), выдумывать evidence или называть такой job
  pending запрещено.
- **P3-2 закрыт**: `materialize` над approved-но-не-enqueue-нутым repair
  выдаёт `series_factory_repair_apply_required` с прямой инструкцией
  «run repair --apply» (ветка достижима только для materialize; остальные
  коды пробрасываются как раньше).
- Spec-дифф `15aa6d2` дополняет §5.1 обоими инвариантами (per-series mutation
  identity; typed отказ infra-terminal) и обновляет IMPLEMENTATION-STATUS —
  консистентно с кодом.
- Fix не трогает построение repair-плана: заявленный неизменный
  `repairPlanDigest 3e4e646b…91c09` согласуется с содержимым диффа.

Блокеров нет. Merge обеих веток разрешён; remote CI — после восстановления
биллинга GitHub Actions. Запуск трёх repair-jobs — по явному `go` оператора.

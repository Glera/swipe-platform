# Кросс-ревью: два authority-среза (20.07.2026)

Оба среза готовы, приняты мной как оркестратором-ревьюером и ждут независимого GO
codex до merge. Автор обоих — Opus-агенты под моим бриф/ревью-циклом;
author≠reviewer соблюдён, codex — третья пара глаз на authority-плоскостях.

---

## Срез A — Risk-based publication admission (swipe-backend)

**Ветка** `risk-based-admission` (запушена), коммиты
`31ebfb6 → 5edb2d8 → e7971a8 → 487373c → e2d2328` (последний закрывает NO-GO).
**PG-CI: run 29741646193 = success** (одно падение = m2m-флейк из дополнения
ниже, зелёный на ретрае). Полный pure suite 797 passed / 245 skipped.

**Закрытие NO-GO (e2d2328):**
- P1 auth-обход: admission исполняется ТОЛЬКО при ненулевом
  `promotion_authorization_id` (public-document путь после
  `validate_promotion_authorization_in_transaction`); внутренний
  `publish_catalog_series` рождает plain candidate БЕЗ receipt — direct
  published недостижим по построению. `reconcile_admission` через
  `_require_consumed_human_approval` перепроверяет ТО ЖЕ
  `_human_approval_evidence`, что и canary-лестница (consumed singleton,
  decision v2, exact hashes, JCS-сверка summary), typed
  `publish_not_human_approved` при отсутствии.
- P1 спеки: `catalog-operator-promotion.md` + новый раздел risk-based
  admission; `catalog-lifecycle.md` таблица переходов; «Публикации без
  предшествующего consumed human Approve НЕТ». docs-boundary-lint clean.
- P2 replay: published без admission-receipt → typed
  `entry_not_admission_managed` (происхождение не изобретается); replay
  возвращает только реально найденный receipt. Новый CHECK
  `ck_admission_receipts_stable_exact`: stable ⇒ равенство digests ∧
  capabilities_match ∧ mechanic_variant_known ∧ ¬operator_requested_canary.
- Regression-матрица codex зашита в PG-тесты: internal/no-auth → candidate
  (0 receipts); internal candidate reconcile → rejected; approved document →
  born published (stable) / candidate (risky); ladder-published →
  not_admission_managed.

**Решение оператора (ревизия замороженного правила):** Telegram Approve —
финальное человеческое решение для контентных вариаций на доказанном runtime.
Backend при human-approved публикации применяет детерминированную server-owned
risk policy: `stable_runtime_reuse` (artifact+contract digest совпадают с
активным known-good релизом mechanic/variant, mechanic/variant уже
публиковался, capabilities совпадают, нет operator-canary запроса) ⇒ entry
рождается `published`; любая новая граница ⇒ `candidate` (лестница
candidate→canary→published не тронута и остаётся путём для рискованного).
Каждая admission пишет append-only `catalog_admission_receipts` (migration
0047) с причиной: `stable_runtime_reuse | new_runtime | new_contract |
operator_requested_canary`.

**Ключевые файлы:** `app/catalog_risk_admission.py` (pure policy +
gather + reconcile), правка `apply_catalog_series_in_transaction`
(`catalog_publish_service.py`), `migrations/versions/0047_catalog_risk_admission.py`,
`evaluate-admission` подкоманда существующего promotion-CLI
(dry-run-first, гейт `ENABLE_CATALOG_OPERATOR_PROMOTION`).

**CI-хроника (4 раунда — все дефекты закрыты с классами):**
1. Integrity-error на legitimate stored-форме `runtime_requirements`
   (snake_case stored vs camelCase чтение) → tolerant parse frozen-моделями;
   отсутствие digest = «рискованно» (candidate/new_runtime), не 500.
2. Residue behavioral-тестов ломал соседний m2m-счётчик → герметичный
   truncate до-и-после.
3. Ассерты собственного PG-теста не учитывали publish-source birth-receipt →
   фильтр `source='reconcile'`.
4. Downgrade-guard стрелял на candidate-birth receipts, которые чужие
   seed-миры создают через общий publish-путь → guard сужен до
   `decision='published'` (реальная admission-authority); обе траектории
   закреплены тестами (offline-SQL позиция guard'а до drop'ов; refuse c
   сохранностью строки).

**Вопросы агента → мои решения (проверены прод-фактами):**
- known-to-catalog буквально (published-сосед обязателен): у `4f70dc08`
  5 published sort/base соседей, artifact digest == активному релизу,
  capabilities совпадают ⇒ reconcile даст `stable_runtime_reuse`.
- Operator-canary канал: freeform `entry_draft.rollout` НЕ парсится
  (instruction-boundary); канал = `--request-canary` в reconcile; validated
  поле контракта — будущий срез.
- new_capability складывается в `new_contract` (документировано).

**Ledger:** workspace `CLAUDE.md` уже отражает новую формулировку
(незакоммичен в meta-repo — коммитить вместе с merge);
`docs-boundary-lint` clean. IMPLEMENTATION-STATUS обновлён на ветке.

**Пост-merge операция (моя):** deploy → `evaluate-admission
--entry-id 4f70dc08-… --apply` (dry-run сначала) → серия оператора published.

**Фокус ревью:** полнота policy-сравнений (нет ли обхода через NULL-формы);
guard-семантика 0047; отсутствие новой HTTP-authority; согласованность с
canary-лестницей и recall.

---

## Срез B — Autoplay-unproven доставка (swipe-ugc + swipe-generator)

**Ветки** `autoplay-unproven-delivery`: ugc `70f50d4a`, generator `14a9ea51`
(обе НЕ запушены — локальные; generator base `bd8e978`).

**R2 — закрытие NO-GO:**
- P1 v1-читаемость: выбрано (б) — обе frozen v1-формы под одной схемой,
  выбор verifier'а по `input.worker.contractDigest`
  (`LEGACY_WORKER_CONTRACT_DIGESTS=['sha256:ee838c67…']` заморожен в
  definition). История read-only: авторство под legacy отвергается;
  gateProof/capture/review-projection/publish принимают frozen-форму
  (legacy proven WIN публикуем, unproven в legacy не существует). Frozen
  legacy-golden = exact исторические байты старого golden (sha 7f6a06c0
  запинен); regression-тест: legacy-form ready job ВИДЕН в review queue
  (не quarantined) с autoplayOutcome:null.
- P1 честные причины: `reason: 'win_proven'|'win_not_proven'` +
  `outcome: 'win'|'timeout'|'terminal_loss'|'mixed'` (mixed только при
  runs=2); классификация в `worker/autoplay-outcome.mjs` тем же предикатом,
  что break-условие цикла; токен `budget_exhausted` отвергается всеми
  слоями. Бейдж честный: «проигрыш до таймаута» / «таймаут 150s × 2» /
  «проигрыш и таймаут (N прогона)».
- Contract digest финально: `ee838c67 (frozen legacy) → a9dd3388`;
  golden перегенерирован один раз (file sha 67d272fc), перепинен в обоих
  репо; `UGC_COMMIT` перепин на 70f50d4a.

**Приёмка (изолированная пара на R2-HEAD'ах, agent + мой спот-повтор):**
ugc full 107/0 (2 env-skip), generator full 412/0 (3 sibling-skip),
**все 3 кросс-репо фенса зелёные в паре**; мой спот: conformance/publication
21/0, fence-файлы 44/0.

**Решение оператора (после canary #2):** кандидат rework, у которого
runtime-safe билд и ВСЕ прочие гейты PASS, но fixed-seed autoplay не доказал
WIN в бюджете — больше не typed ERROR, а **typed RESULT с явной пометкой**
`autoplayOutcome {proven:false, reason:'budget_exhausted', budgetSeconds,
runs}`, доходящий до blind-review с заметным бейджем «WIN не доказан
autoplay (Ns)». **Публикация остаётся строго WIN-only** — новый
`assertPublishableWin` в контракте, вызов в `publish-experiment.mjs` до
любых browser-гейтов (typed `experiment_publish_unproven`). Любой другой
отказ остаётся ERROR.

**Финальная схема (R2):** одна схема `ugc.experiment-worker-result.v1`,
обе frozen v1-формы читаемы по `input.worker.contractDigest`; текущий
digest `a9dd3388…`, frozen legacy `ee838c67…`; `autoplayOutcome
{proven, reason: win_proven|win_not_proven, outcome:
win|timeout|terminal_loss|mixed, budgetSeconds, runs}`.

**Статус: GO codex получен (R2), координированный merge исполнен** —
ugc master `70f50d4a` (FF), generator master `2afee56` (workflow-пин
обновлён, runtime-пин `70f50d4a`); CI обоих гейтились после push.

**Фокус ревью:** минимальность диффа контракта (история: 3 NO-GO раунда);
двусторонний инвариант proven/autoplayPassed; полнота WIN-only отказов
(нет ли обходного promotion-пути); честность перегенерации golden
(fixture-код failure сменён на `tuning_unchanged`; токен `budget_exhausted`
полностью отвергнут схемой R2).

---

**После обоих GO:** мержу A и B (B — по процедуре пина), деплой backend,
reconcile 4f70dc08, отчёт оператору.

---

## Дополнение (после NO-GO-фиксов): находка в тесте m2m-read

`tests/test_agents_m2m_read_postgres.py::test_over_limit_flood_pins_count_at_limit_and_recovers_next_window`
использует `agents_m2m_read_window_seconds=1` и шлёт 8 последовательных HTTP-запросов:
на медленном CI-раннере серия пересекает границу 1-секундного окна и честно
получает 3+3=6 двухсоток вместо 3 → флейк (наблюдён в admission-CI раундах 1 и 5;
на ретрае зелёный). Рекомендация владельцу: детерминированный clock (monkeypatch
источника времени окна) либо широкое окно + мгновенная серия. Наша ветка тест
не трогает.

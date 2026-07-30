# Platform Reliability R1-A v2 — immutable release under Play for Good

Статус: **PLAN REVIEW REQUIRED; production work запрещён**.

Оператор дал GO на подготовку R1-A v2 `2026-07-30`. Реализация может
разрабатываться и проверяться в ветках без production-окон. Backend cutover
разрешён только отдельным operator GO после полного acceptance Stage 0.
Mission-границы из §7 не становятся enforcing до cross-review ревьюером
Stage 1.

## 1. Authority и зафиксированные входы

- Product authority: `VISION.md` из
  `p4g-workspace-meta@c7110903cda4067723913e2a0885d296200ba550`
  (Play for Good v3.0.1; базовое решение — `96df90a`).
- Stage 0: `play-for-good-stage0-island-off-tz.md` v7 из того же tree.
- Stage 1: `play-for-good-stage1-mission-slice-tz.md` v8 из того же tree.
  Статус Stage 1 — `DRAFT`: до реализации требуется заявленная в документе
  diff-проверка funding-policy/weights enforcement.
- Исходный reliability plan:
  `platform-reliability-r1-verified-plan-2026-07-28.md`.
- Production backend fact base:
  `swipe-backend/origin/master@eb179164daf63a87b6ce4c3bd9e6a472a58ae3a2`.
- Stage 0 backend implementation существует только как незавершённая ветка
  `codex/stage0-backend-gates@9ff13fa`; её наличие не считается acceptance.

VISION-мораторий соблюдается: R1-A не создаёт пользовательскую поверхность,
экономику или новый продуктовый contour. Это явно одобренная reliability-
работа, обслуживающая mission trust-loop. При конфликте внимания Stage 0 и
mission-пакеты ревьюятся первыми; R1-A использует свободные review-слоты.

## 2. Почему v2 отличается от исходного R1

После Stage 0 production web больше не исполняет Island bake/theme,
bot/notification runners и не принимает legacy Island generation routes.
Следовательно:

1. production web-image не должен содержать `swipe-ugc`, runtime clone,
   Node/npm или bake toolchain только ради выключенного контура;
2. закрытые защитные поверхности Island остаются обязательными:
   closed-delivery resolver, public report, user block,
   moderation/takedown и recall;
3. старый план отдельного worker с пятью loop-ами не переносится:
   surviving background work инвентаризируется заново после Stage 0;
4. Stage 1 добавляет append-only mission/financial receipts. Его production
   migration и writers нельзя вести через startup, который сам делает
   `git push`, `npm install` и `alembic upgrade`.

## 3. Неизменяемая последовательность

```text
Stage 0 P1–P5
  → полный acceptance, включая ≥24h чистого freeze
  → R1-A production cutover
  → Stage 1 migration + code, всё default-off
  → provider-neutral DB trust gates
  → первые production mission_ops writes
  → ENABLE_MISSION_CORE / ENABLE_MISSION_READ dogfood
```

### 3.1 Stage 0

Stage 0 использует текущий production pipeline. Это допустимо только потому,
что пакет не добавляет mission-миграцию или денежные facts, обратим флагами и
имеет собственные receipts.

- Ни один Stage 0 deploy не пересекается с R1-A cutover.
- Пока нет remote coordinator, Stage 0 окна вручную single-flight.
- «Island-off baseline» означает полный общий acceptance Stage 0, а не только
  П4: П5 schema/docs и ≥24 часа clean freeze обязательны.

### 3.2 R1-A development и cutover

- Код, CI, image и evidence строятся в ветках; image publication не означает
  deploy.
- Backend-изменения, способные вызвать Render Auto Sync, не мержатся в
  production branch до отдельного cutover GO.
- Cutover стартует только с fresh source/deploy/consumer inventory,
  Stage 0 evidence identity и отсутствием активного deploy/sync.

### 3.3 Stage 1 и DB trust

Stage 1 schema migration может пройти через новый `preDeploy` при всех
mission-флагах off: пустые additive таблицы ещё не являются финансовыми
facts. Но DB trust gates обязательны **до первого production writer**, а не
только до `ENABLE_MISSION_CORE`. В частности, до любого production
`mission_ops --apply` — включая `register-funding-policy`,
`register-weights`, `activate-weights`, `register-contract`, `seed-pool`,
`ready`, `activate`, `unlock-cutoff` и `fulfill` — должны быть доказаны:

- внешний PostgreSQL ingress больше не равен `0.0.0.0/0`;
- credential свежий, consumer set замкнут, старый credential выведен;
- isolated restore фактически прошёл на провайдере production DB с
  записанными RPO/RTO;
- source DB не переключалась и recovery cost закрыт;
- способ operator-доступа работает с нескольких Mac без общего ingress.

Механизм provider-neutral: точные IP, статический VPN/zero-trust egress,
provider shell или новая инфраструктура допустимы, если выполняется exit.
При миграции с Render новый provider проходит те же proof, а старый credential
и database decommissioned отдельным receipt.

## 4. Exit R1-A v2

1. CI строит compact production web-image из exact backend SHA и публикует по
   immutable digest.
2. В web runtime отсутствуют GitHub write-token, remote URL с token, `git`,
   Node/npm, runtime clone и `npm install`.
3. Web startup не выполняет `alembic upgrade`; migration запускается один раз
   через `preDeploy` из того же image digest.
4. Каждая migration проходит expand/contract audit. Stage 1 migration
   additive; rollback к last-known-good image не требует schema downgrade.
5. Remote coordinator сериализует production releases. Проигравший contender
   не deploy'ит; local deploy — только break-glass с receipt.
6. Sidecar `platform-release-manifest.v1.json` фиксирует:
   backend/feed/playables source SHA, image digest, migration requirement,
   release-profile digest, CI build/run identity и SHA-256 `release.json v2`.
   UGC identity после Stage 0 — typed absence
   `not_present_in_production_web_image_after_island_off`, не выдуманный SHA.
7. Pinned last-known-good image, точная rollback-команда и rollback smoke
   доказаны на том же release contour.
8. Compact image проходит exact Stage 0 protective smoke (§6).
9. Архитектурный guard enforcing только после Stage 1 reviewer approval
   exact allowlist/budget (§7).
10. Cutover evidence принят независимым reviewer; production mutation —
    отдельный operator gate после Stage 0.

## 5. Пакеты реализации

| Пакет | Содержимое | Production authority |
|---|---|---|
| A · image | multi-stage compact image, locked Python deps, no UGC/Node/git, digest build | build/publish only |
| B · manifest | sidecar schema, exact-byte digests, typed UGC absence, verifier | none |
| C · coordinator | remote concurrency, source CAS, single-writer release receipt, break-glass contract | deploy off until cutover |
| D · startup split | `preDeploy` migration, schema-capability command, clean web entrypoint | cutover gate |
| E · rollback | LKG pointer, rollback command, expected smoke, failure receipts | no prod drill before gate |
| F · guard | dependency allowlist, monolith baselines, line budgets, CI mutants | enforcement after Stage 1 review |
| G · evidence | exact heads, image/SBOM/digests, protective smoke, rollback proof | independent review |

Пакеты A–F могут разрабатываться параллельно только в непересекающихся
worktree. Интеграция и review идут последовательно A+B → C+D → E+F → G.

## 6. Compact-image protective acceptance

Проверка выполняется **из собранного production image**, а не из host
checkout. При Stage 0 final flags:

- legacy Island route manifest contour (a) возвращает ожидаемые 404;
- closed-delivery artifact-url resolver выдаёт signed GET для pinned
  существующего artifact и не требует `swipe-ugc` checkout;
- public report и user block живы;
- moderator allowlist по-прежнему server-owned; moderation/takedown и recall
  работают;
- artifact takedown немедленно закрывает последующую выдачу;
- bake/theme/bot/notification runners не стартуют;
- filesystem/image inventory доказывает отсутствие GitHub token, `.git`,
  `swipe-ugc`, `node`, `npm` и write-capable deploy tooling;
- `/health` остаётся liveness. `/ready` и worker split — отдельный R1-C после
  нового post-Stage-0 inventory, не скрытый scope R1-A.

Если защитный endpoint зависит от исключённого toolchain, image получает
NO-GO; toolchain не возвращается «временно» без отдельного review причины.

## 7. Mission architecture guard — proposal, пока non-enforcing

### 7.1 Правило

`mission_*` не получает blanket exception. Разрешён новый отдельный domain;
интеграционные рёбра выводятся из Stage 1 v8 и перечислены точно. Любое новое
ребро требует ТЗ-diff и author≠reviewer approval.

### 7.2 Разрешённые backend-рёбра

| Existing integration point | Разрешённая зависимость | Назначение |
|---|---|---|
| `app/api_results.py` | mission contribution application/replay adapter | optional committed `mission_contribution` в terminal series response |
| `app/api_daily.py` | mission contribution application/replay adapter | atomic daily contribution receipt |
| `app/api_session.py` | pure mission capability projection | `mission_dogfood`, без write authority |
| `app/main.py` | mission read router + startup DB preflight only | mount/read and fail-closed core startup |
| `migrations/env.py` | `app.mission_models` metadata registration | Alembic видит отдельные mission tables |
| operator entrypoint | `app.mission_ops` | dry-run-first typed CLI; без HTTP writes |

Направление зависимости одностороннее: adapters импортируют public mission
service/contract API. Mission domain не импортирует endpoint modules,
Island, Catalog, Lab, agents или presentation code. Он может зависеть только
от shared DB/auth-safe primitives и собственных models/contracts/services.

### 7.3 Разрешённые client-рёбра

| Existing integration point | Разрешённая зависимость | Назначение |
|---|---|---|
| typed API response layer | mission receipt types/parser | optional server receipt, byte-compatible absence |
| series-win flow | mission ceremony presenter | ceremony только из committed receipt |
| daily-claim flow | mission ceremony presenter | daily receipt ceremony |
| session bootstrap | mission capability gate | mount только flag + capability |
| main feed shell | mission widget/router adapter | read surface; логика в отдельном module |

Client mission code не импортирует `island.ts`. Island data и puzzle balance
не становятся mission authority.

### 7.4 Предлагаемый line budget для cross-review

Это proposal, не enforcing policy:

- `app/models.py`: **0 mission model classes**; все новые модели в
  `app/mission_models.py`;
- `migrations/env.py`: только metadata-registration import;
- `app/api_results.py`: до 40 net новых integration lines;
- `app/api_daily.py`: до 35;
- `app/api_session.py`: до 20;
- `app/main.py`: до 20;
- `feed-prototype/src/feed.ts`: до 45 integration lines;
- существующий `island.ts`: 0 mission lines;
- новый production domain module: максимум 600 строк; превышение требует
  split или отдельной диспозиции;
- migration и tests учитываются отдельным generated/schema и evidence
  budget, но не дают права переносить production logic в migration/test.

До enforcement ревьюер Stage 1 сверяет allowlist и budgets с exact v8
implementation plan. После его verdict изменения фиксируются exact-byte
baseline и mutant-тестами: запрещённый import, +1 сверх бюджета и попытка
добавить mission model в `models.py` обязаны краснить CI.

## 8. Kill, rollback и scope discipline

- Stage 0 поведение не меняется разработкой R1-A.
- Не добавляются Render services и расходы.
- Не меняются ingress, credentials, recovery или Blueprint state.
- Не реализуется Stage 1 business logic внутри R1-A.
- Не создаётся worker до post-Stage-0 runner inventory и отдельного
  operator/finance решения.
- Любой production auto-deploy от R1-A branch/PR — stop-the-line.
- Cutover failure откатывается на pinned LKG image; schema остаётся совместимой.
- Ни один green test не заменяет operator authority для deploy, mission,
  impact или financial act.

## 9. Review checklist

Reviewer плана должен отдельно ответить:

1. Полный ли Stage 0 acceptance является единственным cutover predecessor?
2. Не может ли compact image сломать closed-delivery/report/block/moderation?
3. Достаточно ли manifest связывает image, schema и source identity?
4. Не маскирует ли `preDeploy` destructive/non-expand migration?
5. Сериализация действительно remote single-writer, а не host lock/CAS?
6. Rollback остаётся возможен после каждой migration requirement?
7. Совпадает ли Mission allowlist с Stage 1 v8 без blanket exception?
8. Реалистичны ли line budgets; не поощряют ли они перенос логики в adapters?
9. DB trust gate стоит до первого real `mission_ops --apply`, а не слишком
   поздно перед одним лишь `ENABLE_MISSION_CORE`?
10. Не создаёт ли R1-A новый продуктовый contour в нарушение VISION?

До закрытия review findings реализация пакетов A–F не начинается.

# WS4.0 — CI preflight (read-only reconnaissance)

Дата: 2026-07-17. Скоуп: `swipe-agents`, `swipe-generator`, `swipe-ugc`,
`feed-prototype`. Спека: `docs/specs/dev-loop.md` §WS4. Референс паттернов:
`swipe-backend/.github/workflows/postgres-acceptance.yml`.

Разведка **read-only**: ни один из репозиториев не изменён (нет файлов, нет
`npm install`, нет git-операций). Единственная запись — этот файл в meta-repo.

---

## Сводная таблица

| репо | remote (GitHub) | default branch | siblings (hard) | Node | lockfile | браузер | готовность |
| --- | --- | --- | --- | --- | --- | --- | --- |
| swipe-agents | **нет origin** | `main` | нет | ≥24 | есть | нет | green* |
| swipe-ugc | `Glera/swipe-ugc` | `master` | нет (soft) | не задан→22 | есть | **да (chromium)** | green |
| swipe-generator | **нет origin** | `master` | swipe-ugc (real) + backend goldens | ≥22 | **нет** | нет | yellow |
| feed-prototype | `Glera/feed-prototype` | `master` | backend golden ×1 | не задан→20/22 | есть | **да (chromium)** | yellow |

`*` swipe-agents по содержимому самый простой и «зелёный», но **не запушен на
GitHub** (нет `origin`) — workflow писать можно, запустить нельзя, пока репо не
создан на GitHub. То же и для swipe-generator.

Общий кросс-репо факт: **`swipe-backend` — приватный** (в backend-CI шаг
называется «Checkout **private** backend»). Поэтому любой чужой workflow,
которому нужны backend-фикстуры, либо **локализует** их (маленькие JSON), либо
делает cross-repo checkout приватного репо по токену. Публичные соседи
(`Glera/swipe-ugc`, `Glera/swipe-platform`) чекаутятся без токена — как в
backend-CI.

Текущие HEAD (для placeholder-ref в checkout соседей):
- swipe-ugc `master` = `65f1d52bca68afc976b0ea9e0a4d0a1e7685016b`
- swipe-backend `master` = `7dfa99f0d39b0107c0fd636c7fd4958530febed2`
- swipe-platform: ref из backend-CI = `a33d1a0f1b2621e94ac78d9466bbcb25aaea8adf`
  (в verify четырёх репо не нужен — только в generator-скриптах вне verify).

---

## 1. swipe-agents — GREEN (самый простой)

### verify
- `npm run typecheck` → `tsc -p tsconfig.json --noEmit` (браузер не нужен).
- `npm test` → `vitest run` (38 `*.test.ts`; браузер не нужен).
- (опц.) `npm run build` → `tsc` — не обязателен для verify, но дёшев.
- Подкоманды `test:properties` / `test:acceptance` — подмножества `vitest run`.

### siblings
Кросс-репо чтений **нет** (grep `../swipe-*` / `../playables` пуст). Полностью
самодостаточен.

### окружение / node / lockfile
- `engines.node >= 24.0.0` → **setup-node 24** (не 22, как в backend).
- `package-lock.json` присутствует → `npm ci`.
- deps: `ajv`, `ajv-formats`, `better-sqlite3@12.2.0` (нативный — на ubuntu
  под Node 24 ставится prebuilt-биндингом; build-tools обычно не требуются, но
  если prebuild отсутствует — нужен `python3`+`make`+`g++`, они есть на
  `ubuntu-latest`). devDeps: `@types/*`, `typescript@5.8.3`, `vitest@3.2.4`.

### состояние машины / кандидаты на gate
- `tests/adapters/tcp.test.ts` поднимает TCP-сервер на `127.0.0.1:0` (loopback,
  CI-safe).
- Telegram: `src/bot/transport.ts` строит URL к `api.telegram.org`, но в тестах
  (`tests/acceptance/isolation.test.ts`) это лишь строка для guard-логики —
  **реальной сети нет**. `BOT_TOKEN`/`*.token`/`.env*` git-игнорятся, тестам не
  нужны.
- Нет зависимостей от глобальных бинарников/сервисов/сети.

### черновик workflow
```yaml
name: swipe-agents CI
on:
  workflow_dispatch:
  push: { branches: [main] }
  pull_request:
permissions: { contents: read }
concurrency:
  group: swipe-agents-${{ github.ref }}
  cancel-in-progress: true
jobs:
  verify:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4
        with: { persist-credentials: false }
      - uses: actions/setup-node@v4
        with: { node-version: "24", cache: npm }
      - run: npm ci
      - run: npm run typecheck
      - run: npm test
```
Оценка прогона: **~2–4 мин** (npm ci + tsc + vitest, без браузера).

---

## 2. swipe-ugc — GREEN

### verify
`npm run verify` = `lint && test && bake --check-base && test:preview`:
- `npm run lint` → `scripts/lint.mjs`: `node --check` по файлам (без браузера).
- `npm test` → `node --test test/*.test.mjs` (15 файлов). **Три browser-теста**
  запускают `chromium.launch()` через локальный `createServer` (self-served,
  внешний harness не нужен):
  - `sort-skin-matrix-browser.test.mjs` — **без skip-гейта** (гоняется всегда).
  - `sort-level-qa-baseline-browser.test.mjs` — **без skip-гейта**.
  - `sort-skin-fps-browser.test.mjs` — **gated OFF**: `skip: process.env.RUN_SORT_SKIN_FPS !== '1'`.
- `bake.mjs --check-base` — выходит `process.exit(0)` **до** блока с
  `await import('playwright')` и до `git fetch`: только проверяет base-manifest
  hashes. Браузер/сеть/origin **не нужны**.
- `test:preview` → `worker/test-preview.mjs`: статический `import { chromium }`,
  `chromium.launch()` → **нужен установленный chromium**.

Итог: verify **требует chromium** (из-за 2 browser-тестов + test:preview) →
`npx playwright install --with-deps chromium`.

### siblings
- `test/sort-level-contract.test.mjs` читает
  `../../swipe-backend/tests/fixtures/content-identity-vectors.json`, но
  **guard`ed**: `if (!existsSync(backendIdentityFixturePath)) return;` — при
  отсутствии backend тест тихо скипается. То есть для **зелёного** CI backend
  чекаутить не обязательно (drift-проверка просто не выполнится). Если нужно
  реально enforce-ить drift — добавить exact-ref checkout приватного backend по
  токену; иначе оставить self-contained и зафиксировать это в комментарии
  workflow. **Рекомендация: self-contained** (соответствует §WS4 «ugc — самый
  простой», public-репо).

### окружение / node / lockfile
- `engines` не задан → **setup-node 22** (как в backend-CI).
- `package-lock.json` есть → `npm ci`.
- deps: `ajv@8.20.0`, `playwright@1.59.1` (пин **точный**, по комментарию в
  package.json — бинарники запечены в backend Dockerfile под этот ревижн; не
  ослаблять до `^`).

### состояние машины / кандидаты на gate
- Browser-тесты требуют chromium (устанавливаем в CI).
- `RUN_SORT_SKIN_FPS` — оставить невыставленным (тест остаётся skip).
- `bake --check-base` мог бы делать `git fetch origin` в полном режиме — но в
  `--check-base` до этого не доходит; сеть не нужна.
- Нет BOT_TOKEN/telegram в verify-пути.

### черновик workflow
```yaml
name: swipe-ugc CI
on:
  workflow_dispatch:
  push: { branches: [master] }
  pull_request:
permissions: { contents: read }
concurrency:
  group: swipe-ugc-${{ github.ref }}
  cancel-in-progress: true
jobs:
  verify:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - uses: actions/checkout@v4
        with: { persist-credentials: false }
      - uses: actions/setup-node@v4
        with: { node-version: "22", cache: npm }
      - run: npm ci
      # точный ревижн chromium уже зафиксирован playwright@1.59.1 в lockfile
      - run: npx playwright install --with-deps chromium
      - run: npm run verify
      # backend drift-проверка (content-identity-vectors) само-скипается
      # без swipe-backend; это осознанный self-contained выбор.
```
Оценка прогона: **~4–7 мин** (npm ci + playwright chromium install ~1–2 мин +
2 browser-теста + test:preview).

---

## 3. swipe-generator — YELLOW

### verify
`npm run verify` = `check && test`:
- `npm run check` → длинная цепочка `node --check <file>` по ~60 `.mjs`
  (src/public/scripts). Браузер не нужен, сеть не нужна.
- `npm test` → `node --test test/*.test.mjs` (**66** файлов). Браузер **не
  нужен** (нет chromium/playwright в тестах). Но **нужны соседи** (см. ниже).

### siblings (hard — тесты падают без них)
1. **Реальный `swipe-ugc` контент** (не фикстуры — исходники):
   тесты читают `swipe-ugc/recipes/sort/skins/fixtures/*.json`,
   `swipe-ugc/bases/sort-v2-skins-qa/manifest.json`, `swipe-ugc/recipes/...`
   через `ugcRoot = ../swipe-ugc`. Затронуто ≥9 тест-файлов
   (`skin-review`, `catalog-preview-baker`, `catalog-delivery-*`,
   `catalog-evaluation-delivery`, `evaluation-outbox`, `level-derive`,
   `level-review`, `levels-qa-executor`, `levels-job`) + `src/skin-review.mjs`,
   `src/levels-job.mjs`. Часть тестов строит **fake ugc** в tmpdir
   (`test/helpers/levels-qa-fixture.mjs`), но перечисленные читают **реальный**
   `../swipe-ugc` без guard. → **эволюционирующий контент, вендорить неудобно →
   exact-ref checkout публичного `Glera/swipe-ugc`.**
2. **backend golden-фикстуры** (маленькие JSON, `readFileSync` **без** guard —
   hard):
   - `swipe-backend/docs/specs/fixtures/feed-roster-console-v1.golden.json` (4KB)
   - `swipe-backend/docs/specs/fixtures/catalog-browser-read-v1.golden.json` (9.6KB)
   - `swipe-backend/docs/specs/fixtures/operator-flag-rework-handoff-v1.golden.json` (20KB)
   Репо **приватный**. → **локализовать** (скопировать 3 файла в generator +
   drift-guard) **или** cross-repo checkout приватного backend по токену.
   Рекомендация: локализация (маленькие контрактные goldens) проще, чем
   приватный токен в чужом CI; drift ловит backend-CI на своей стороне.
   (Альтернатива, если нужен единый источник — private checkout backend.)
3. `swipe-platform` — только в `scripts/catalog-series*.mjs`, **вне verify**;
   для CI не нужен.

Ни backend-goldens, ни real-ugc чтения **не** обёрнуты в `existsSync` →
без соседей `npm test` красный. (`catalog-series.test.mjs` дополнительно
скипает python-часть через `if (!existsSync(python)) return;` — python не
требуется.)

### окружение / node / lockfile
- `engines.node >= 22` → **setup-node 22**.
- **Нет `package-lock.json`.** Но и **нет `dependencies`/`devDependencies`
  вообще** — тесты используют только встроенный `node:test` и Node builtins.
  Значит lockfile тривиально пустой; сгенерировать `npm install`
  (создаст near-empty lock) и закоммитить, затем `npm ci`. `npm ci` без
  lock невозможен, но с пустым lock — мгновенный no-op.

### состояние машины / кандидаты на gate
- Python: только `catalog-series` python-ветка, само-скипается — не гейтить.
- Нет сети/глобальных бинарников/локальных сервисов в verify-пути (`.data/`
  git-игнорируется).
- Главный риск — **пути соседей**: тесты жёстко ждут `../swipe-ugc` и
  `../swipe-backend` рядом с репо (`workspace = ../`). В CI структуру каталогов
  надо воспроизвести: checkout generator в подпапку + соседи рядом.

### черновик workflow
```yaml
name: swipe-generator CI
on:
  workflow_dispatch:
  push: { branches: [master] }
  pull_request:
permissions: { contents: read }
concurrency:
  group: swipe-generator-${{ github.ref }}
  cancel-in-progress: true
jobs:
  verify:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    defaults: { run: { working-directory: swipe-generator } }
    steps:
      - uses: actions/checkout@v4                 # сам generator
        with: { path: swipe-generator, persist-credentials: false }
      - uses: actions/checkout@v4                 # публичный сосед (real content)
        with:
          repository: Glera/swipe-ugc
          ref: <PIN_SWIPE_UGC_SHA>                # placeholder, напр. 65f1d52...
          path: swipe-ugc
          persist-credentials: false
      # backend goldens: ВАРИАНТ A (рекоменд.) — локализованы в репо, шаг не нужен.
      # ВАРИАНТ B — приватный checkout:
      # - uses: actions/checkout@v4
      #   with: { repository: Glera/swipe-backend, ref: <PIN>, path: swipe-backend,
      #           token: ${{ secrets.BACKEND_RO_PAT }}, persist-credentials: false }
      - uses: actions/setup-node@v4
        with: { node-version: "22" }              # cache:npm только если lock закоммичен
      - run: npm ci                                # требует закоммиченный (near-empty) lock
      - run: npm run verify
```
Оценка прогона: **~3–6 мин** (deps почти нет; 66 node:test-файлов + два
checkout). Основная работа preflight — не время, а lockfile + структура соседей.

---

## 4. feed-prototype — YELLOW

### verify
Единого `verify` нет; для CI = `lint` + `build` (скрипт `verify:island` —
кросс-репо зонтик, дергает generator+ugc, для **своего** репо не использовать).
- `npm run lint` = `tsc --noEmit` + **20 check-скриптов**. Из них **7 —
  browser** (`chromium.launch`), остальные — чистый Node:
  - browser: `check:feed-roster-browser`, `check:operator-level-flags-browser`,
    `check:operator-level-flags-feed-browser`,
    `check:catalog-authority-timing-browser`, `check:catalog-feed-dogfood-browser`,
    (+ `check-catalog-lab-entry-browser`, `check-control-plane-feed-browser` —
    существуют, но в цепочку `lint` **не** входят).
  - **4 browser-скрипта дополнительно запускают `npm run build` / `vite build`
    внутри себя** (`check-feed-roster-browser`, `check-catalog-authority-timing-browser`,
    `check-control-plane-feed-browser`, `check-catalog-lab-entry-browser`) →
    несколько полных Vite-сборок за один `lint`. Дорого по времени.
- `npm run build` = `tsc && vite build`.

### siblings
- **hard (throws без файла):**
  `../swipe-backend/docs/specs/fixtures/feed-roster-session-v1.golden.json` (2KB)
  — читают `check-feed-roster.mjs` и `check-feed-roster-browser.mjs`
  (`readFileSync` в try, но при ошибке кидает). Приватный backend. → **локализовать
  1 файл** (тривиально) или private checkout.
- **soft (existsSync-guard, drift-only):**
  `check-series-policy.mjs` и `check-reward-vectors.mjs` сверяются с backend
  `series-policy.json` / `reward-vectors.json`, **но канонические копии уже
  вендорнуты** в `feed-prototype/test-fixtures/` (`series-policy.json`,
  `reward-vectors.json`); backend-сверка опциональна. → соседа не требуют.
- `serve-catalog-feed-real-e2e.mjs` читает `../swipe-platform`, но это
  **serve-скрипт вне lint/build** — в CI не участвует.

Вывод: единственная жёсткая внешняя зависимость — **один** backend golden
(`feed-roster-session-v1`). Локализация делает репо self-contained.

### окружение / node / lockfile
- `engines` не задан. Vite 5 требует Node ≥18; playwright 1.59.1 ок на 20/22.
  → **setup-node 20 или 22** (взять 22 для единообразия с ugc/backend).
- `package-lock.json` есть → `npm ci`.
- **Проблема §WS4.0:** `playwright` **импортируется** в 7 `check-*-browser.mjs`,
  но **не объявлен** в `package.json` (сейчас резолвится через родительский
  workspace `node_modules`). devDeps: `@anthropic-ai/sdk`, `typescript`, `vite`,
  `vite-plugin-singlefile`. → перед CI **добавить `playwright` (точный пин под
  chromium, лучше `1.59.1` как в ugc) в devDependencies и перегенерить lock**.
  Это правка исходного репо — **вне read-only preflight**, зафиксировано как
  предусловие.

### состояние машины / кандидаты на gate
- Browser-скрипты требуют chromium.
- Внутренние `npm run build` в browser-checks удлиняют прогон; кандидат на
  оптимизацию (собрать `dist` один раз, если скрипты научатся переиспользовать —
  сейчас каждый собирает сам).
- Сеть/сервисы не нужны (harness'ы self-served на 127.0.0.1).

### черновик workflow
```yaml
name: feed-prototype CI
on:
  workflow_dispatch:
  push: { branches: [master] }
  pull_request:
permissions: { contents: read }
concurrency:
  group: feed-prototype-${{ github.ref }}
  cancel-in-progress: true
jobs:
  verify:
    runs-on: ubuntu-latest
    timeout-minutes: 25
    steps:
      - uses: actions/checkout@v4
        with: { persist-credentials: false }
      # предусловие: playwright объявлен в package.json + lock перегенерён.
      - uses: actions/setup-node@v4
        with: { node-version: "22", cache: npm }
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      # backend golden feed-roster-session-v1: ВАРИАНТ A — локализован (шага нет).
      # ВАРИАНТ B — приватный checkout swipe-backend по токену (см. generator).
      - run: npm run lint    # tsc --noEmit + 20 check-скриптов (7 browser)
      - run: npm run build   # tsc && vite build
```
Оценка прогона: **~8–14 мин** (npm ci + chromium ~1–2 мин + 7 browser-checks,
из них 4 с внутренней Vite-сборкой + финальный build). Самый долгий из четырёх.

---

## Риски и предусловия (сводно)

| репо | предусловия перед рабочим workflow | главный риск |
| --- | --- | --- |
| swipe-agents | создать GitHub-репо/`origin` (пуш `main`) | нативный `better-sqlite3` prebuild под Node 24 |
| swipe-ugc | — (готов) | 2 browser-теста без skip-гейта + время chromium |
| swipe-generator | GitHub-репо/`origin`; **сгенерить+закоммитить lock**; выбрать sibling-стратегию (checkout public ugc + локализ. backend goldens) | жёсткая раскладка `../swipe-ugc`/`../swipe-backend`; drift локализованных goldens |
| feed-prototype | **объявить `playwright` в package.json + перегенерить lock**; локализовать 1 backend golden | тяжёлый lint (4 внутр. Vite-сборки) + время |

Все предусловия (создание origin, генерация lockfile, объявление playwright,
локализация goldens) — **изменения в целевых репозиториях**, намеренно **не**
выполнены в этой read-only разведке.

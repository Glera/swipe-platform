# Dev-loop v1 — meta-repo, worktree-status, auto-review, visual-proof, per-repo CI, VISION/AGENTS

Статус: **v3 — архитектурный GO получен, четыре P1 третьего раунда
внесены; утверждено к исполнению с WS0 → WS1/WS5.**
Происхождение: кросс-ревью 17.07.2026 (видео Peter Steinberger «Agentic
Engineering», youtube `82YaJw-_t10`); v2 — исправления второго раунда
(meta-repo, изолированные checkout, факты CI); v3 — четыре P1 третьего
раунда (полная patch identity, binary bytes + secret guard, артефакты вне
авторских репо, ужесточение критерия удаления worktree) и неблокирующие
правки.

Расположение этого файла в `swipe-backend/docs/specs/` — **временное** до
появления workspace meta-repo (WS0); backend не владеет development
workflow.

## Принципы (заморожены)

1. **Не строить `p4g ready`.** Обёртка/meta-CLI разрешена только после
   того, как на ≥10–20 реальных изменениях повторяющийся ручной паттерн
   станет очевиден. До этого — независимые инструменты.
2. **Dev-loop — отдельный локальный контур.** Никакого пересечения со
   `swipe-agents` A1 (deterministic production-ops, no LLM): ни общего
   authority store, ни production credentials, ни Telegram.
3. **Evidence ≠ убеждение.** Доказательства корректности — тесты, visual
   proof и review findings. Транскрипт — не evidence; полный transcript в
   PR не выкладывается.
4. **Тяжёлые артефакты (видео/PNG) не коммитятся в git.**
5. **Авторский worktree — read-only для всех инструментов dev-loop.**
   Review и visual-proof работают на изолированных checkout; падение
   инструмента не может изменить исходное дерево.
6. Каждый workstream ценен сам по себе; зависимости указаны явно.

---

## WS0 — workspace meta-repo (блокер для WS1/WS2/WS5)

**Проблема:** корень workspace не является git-репозиторием, поэтому
`scripts/worktree-status.mjs`, `VISION.md`, `AGENTS.md`,
`.claude/skills/auto-review/` остались бы незаверсионированными локальными
файлами.

**Решение:** превратить корень в маленький meta-repo, который отслеживает
**только** workspace tooling/docs:

- `.gitignore` явно игнорирует все вложенные репозитории (по списку, не
  glob-ом «всё» — чтобы новый tooling-файл не потерялся молча), плюс
  `node_modules/`, арт-директории, временные worktree-каталоги;
- в него входят: `scripts/`, `VISION.md`, `AGENTS.md`, `.claude/skills/`,
  root `CLAUDE.md`, `README.md`, это ТЗ (переезжает сюда из backend);
- **не** входят: код вложенных репо, их worktree-копии, артефакты.

**Приёмка:** `git status` в корне чистый при нетронутых вложенных репо;
`git add -n -A` (dry-run — обычный `git add -A` сам изменил бы index) не
перечисляет ни одного файла вложенных репозиториев; существующие
вложенные `git`-операции не задеты.

**Оценка:** пара часов, но делается первым.

---

## WS1 — `worktree-status` (read-only)

**Что:** один Node-скрипт без зависимостей, `scripts/worktree-status.mjs`
в meta-repo.

**Делает:** для каждого репо (`feed-prototype`, `swipe-generator`,
`swipe-backend`, `swipe-ugc`, `playables`, `swipe-agents`) читает
`git worktree list --porcelain` и для каждого worktree выводит:

- repo, branch, path;
- dirty/clean (`git status --porcelain`);
- merged/not-merged относительно master (`git merge-base --is-ancestor`);
- ahead/behind (`git rev-list --left-right --count`);
- дата последнего коммита;
- missing path / prunable.

**Вывод:** таблица + блок «безопасно удалить»; печатает готовую команду
`git worktree remove` с **shell-quoted путями**, **никогда не выполняет
её сам**.

**Критерий предложения удаления (все условия одновременно):**

- clean **и** merged, где merged считается относительно **явно
  настроенного upstream / `origin/master`**, не неопределённого
  локального `master`;
- НЕ основной worktree репозитория;
- НЕ locked worktree;
- НЕ detached worktree, чей commit не доказанно достижим из upstream;
- missing/prunable path → **отдельная** рекомендация
  (`git worktree prune` после ручной проверки), не `worktree remove`.

**Не делает:** авто-очистку, запись, метрики, демоны.

**Приёмка:**
- **детерминированные тесты — на временных fixture-репозиториях**
  (сконструированные состояния: main/locked/detached/missing/clean+merged/
  dirty), не на живом workspace — его состояние меняется параллельной
  работой;
- на живом workspace: показывает все worktree шести репо, скрипт не
  меняет ни одного файла/ref;
- clean+merged (по полному критерию) получает предложение, все
  исключённые категории — нет.

**Оценка:** полдня.

---

## WS2 — минимальный auto-review skill

**Что:** workspace-level skill `auto-review`
(`.claude/skills/auto-review/SKILL.md` в meta-repo), запускается из
авторской сессии перед commit/PR.

### Patch identity (зафиксировано)

Patch = полное состояние **`base → working tree`**, а не только локальные
правки:

- **base** = `git merge-base HEAD <upstream>`, где upstream — настроенный
  tracking branch; `master` — только fallback при его отсутствии, с
  явной пометкой в резюме;
- в patch входят **четыре слоя, каждый фиксируется отдельно**:
  1. commits `base..HEAD` (committed branch delta — без него изолированный
     checkout от base потерял бы уже закоммиченную работу ветки);
  2. staged;
  3. unstaged;
  4. untracked (отдельным списком);
- **бинарные** файлы: модели отправляется только manifest (путь, размер,
  hash), но **изолированный checkout получает реальные локальные байты** —
  иначе build и тесты проверяют не то состояние;
- **secret guard (fail-closed):** до передачи чего-либо reviewer-модели
  untracked-текст фильтруется по deny-списку (`.env*`, ключи,
  credentials, файлы с подозрительными именами/содержимым); совпадение →
  файл исключается из reviewer-контекста и явно перечисляется в резюме;
- лимит размера diff (v1: 300 KB текста; больше — skill останавливается и
  просит автора сузить scope);
- source worktree не изменяется ни на одном шаге, включая падение review.

### Цикл v1

1. Skill собирает patch identity + invariants-файл репозитория
   (`REVIEW-INVARIANTS.md`, опционален).
2. Создаёт **изолированный checkout**: temp worktree от base SHA +
   применённые все четыре слоя patch (включая commits `base..HEAD` и
   реальные binary bytes). Ревьюер работает только в нём.
3. Вызывает независимого ревьюера (subagent) в свежем контексте.
   **Ревьюер слеп к автору, но не к кодовой базе:** скрыты транскрипт,
   план и объяснения автора; доступны (read-only) полные затронутые
   файлы, их callers/consumers, связанные тесты, authoritative docs,
   соседние контракты — всё внутри изолированного checkout.
4. Findings возвращаются в авторскую сессию; каждому wrapper присваивает
   **run-local ID** (`F001…`) — ID стабилен внутри прогона, стабильность
   между LLM-прогонами не обещается.
5. Автор для **каждого** run-local ID: исправляет ЛИБО явно отклоняет с
   причиной. Молчаливый пропуск запрещён — skill валидирует, что каждый
   ID получил disposition.
6. Skill повторяет затронутые проверки (verify-команда репо из AGENTS.md)
   и формирует Markdown-резюме: findings / принято / отклонено+причина /
   команды и exit codes проверок. **Резюме идёт в PR description или
   task output, не в commit message** (там оно быстро станет слишком
   большим).

**Транскрипт:** sanitized transcript остаётся локально; раскрывается
ревьюеру только **после** слепого раунда — для разрешения спорных
findings. В PR — опционально hash-ссылка и краткая статистика.

**Не делает в v1:** receipt-схему, task-store, межсессионный роутинг,
автоматическое редактирование PR. **Второй ревьюер (Codex CLI):** не в
каждом прогоне; на части пилотных patches сравнить Claude vs Codex по
дополнительным findings, затем решить.

### Приёмка — два слоя

**Детерминированная (обязательная):** patch identity собирается корректно
на подготовленных состояниях (staged/unstaged/untracked/binary/без
upstream); изолированный checkout не трогает авторский worktree (в т.ч.
при инъецированном падении); формат findings валиден; каждый finding ID
требует disposition; команды и exit codes зафиксированы в резюме.

**Эмпирическая (pilot corpus, не гейт):** несколько подготовленных
buggy/design-decision patches + ручная оценка полезности. Обещания
«ревьюер обязательно находит баг» нет — LLM-поведение флаки по природе.

**Пилот:** swipe-backend и swipe-generator, 10–20 реальных изменений.
После — решение о формализации `engineering-change-receipt.v1` по
фактическому выводу.

**Оценка:** 2–3 дня + пилотный период.

---

## WS3 — visual-proof skill (playables)

**Что:** `npm run visual-proof <id> [--level N]` в `playables/`, поверх
существующего Playwright-харнеса release-гейта.

### Изоляция (зафиксировано)

Сборки **не** идут в рабочем дереве (build перезаписал бы `dist/`,
release metadata и другие локальные артефакты; playables worktree сейчас
dirty). Вместо этого два временных checkout:

- **before** — из base SHA текущей задачи (merge-base с upstream, как в
  WS2; не «всегда master»);
- **after** — из того же base SHA + применённый текущий patch.

Оба собираются изолированно; исходный worktree только читается.

### Прогон

1. Оба checkout: одинаковые seed, viewport, сценарий, уровень; autoplay
   через shared **`auto-cursor.ts`** (AutoCursor; `auto-finger.ts` — только
   отрисовка руки) **в реальном темпе** (принцип «realistic pace»).
2. Запись: короткий WebM/MP4 (Playwright video) + ключевые PNG
   (mount, mid-run, win/end state).
3. Вывод — **за пределами всех авторских репозиториев** (запись в
   `playables/test-results/` нарушала бы принцип 5):
   `<workspace>/.artifacts/visual-proof/<id>/<timestamp>/{before,after}/`,
   директория игнорируется meta-repo. Внутри временных checkout писать
   можно что угодно; финальные файлы **копируются** наружу, checkout
   удаляется. Печать путей парами.

GIF — не по умолчанию (опция позже, если понадобится для вставки в PR).

**Предпосылка WS3.0 (до основной):** аудит детерминизма пилотной
механики — одинаковый уровень, раскладка, тайминг, момент записи
воспроизводимы. Если нет — сначала seed-инъекция (`?seed=` или аналог),
только для пилота.

**Пилот:** `pins-ftue`, на **контролируемой чистой ветке/fixture**, не на
текущем dirty worktree.

**Приёмка (ужесточена после инцидента 17.07 — «зелёный» прогон записал
только фоновое видео, а принимался по размеру файла):**
- **визуальная инспекция обязательна:** кадры mount/mid/win открываются
  как изображения и проверяются содержательно (механика смонтирована,
  autoplay-курсор виден, победное состояние настоящее) — сравнение
  размеров/наличия файлов приёмкой НЕ является;
- **fail-closed:** прогон, не получивший настоящий WIN-сигнал из
  механики, поймавший page errors или не смонтировавший механику,
  завершается ненулевым кодом — видео без доказанного прогона не
  считается результатом;
- каждый прогон пишет машинно-читаемый `result.json` (outcome+duration
  по прогонам, base/upstream/слои patch, ошибки, версии, viewport);
- **изоляция patch:** пилотное доказательство делается с явным
  `--include <paths>` — after отличается от before только целевой
  правкой, а не всем dirty-состоянием репо;
- два прогона на неизменённом patch дают сопоставимые ролики (одинаковый
  конечный стейт, длительность в допуске);
- намеренная правка уровня видна в after и отсутствует в before;
- правка уровня N не меняет visual-proof уровня N±1 (правило scoped
  level edits);
- авторский worktree не изменён; в git ничего не добавлено.

**Оценка:** WS3.0 — полдня-день; skill — 2 дня.

---

## WS4 — CI по одному репозиторию

Четыре независимых workflow. Backend не трогаем — его
`postgres-acceptance.yml` уже есть и богаче (чистый PG16, base→head,
10 roundtrip-джобов, exact-ref checkout соседей).

### WS4.0 — dependency/fixture preflight (обязательный первый шаг)

Известные факты (проверены 17.07.2026), которые делают наивный
`npm ci && npm test` невозможным:

- `swipe-agents`: `engines.node >= 24` — CI на **Node 24**, не 22;
- `swipe-generator`: **нет `package-lock.json`** → сгенерировать и
  **закоммитить lockfile**, затем `npm ci` (вариант с `npm install`
  отвергнут — ослабляет смысл clean reproducible CI);
- `feed-prototype`: импортирует `playwright` в `scripts/check-*-browser.mjs`,
  но **не объявляет** его в своём `package.json` (локально резолвится
  через родительский workspace) → объявить зависимость явно;
- `swipe-generator` тесты читают sibling `swipe-ugc`, `swipe-backend`,
  местами `playables`; `feed-prototype` проверки читают backend fixtures
  → для этих двух нужен либо exact-ref checkout соседей (по образцу
  backend CI), либо локализация golden fixtures. Выбор — за исполнителем
  preflight, per-репо, с фиксацией в workflow-комментарии.

### Порядок

1. **swipe-agents:** Node 24, `npm ci`, `npm run typecheck`, `npm test` —
   единственный из четырёх без sibling-зависимостей, самый простой;
2. **swipe-ugc:** `npm ci`, `npm run verify`,
   `npx playwright install --with-deps chromium`;
3. **swipe-generator:** после preflight (lockfile + sibling-стратегия);
4. **feed-prototype:** после preflight (playwright dep + backend
   fixtures + chromium).

**Не делаем в v1:** общий `verify:swipe`, changed-repo runner, cross-repo
fresh changeset (частично уже существует в backend CI).

**Приёмка:** каждый workflow зелёный на master своего репо; время прогона
зафиксировано.

**Оценка:** agents/ugc — по полдня; generator/feed — **1–2 дня каждый**
из-за preflight (прежняя оценка «полдня на репо» была оптимистична).

**Playables:** полный CI всех playables в v1 не делается. Как продолжение
WS3 — path-scoped workflow для пилотного playable: release-гейт +
visual-proof артефакты.

### WS4.1 — exact-SHA guard для ручного dispatch

`scripts/ci-run-once.mjs` — локальный read-mostly helper, не общий
оркестратор CI. Он уменьшает случайные повторные расходы GitHub Actions,
не меняя workflow самих репозиториев.

Контракт:

- ключ дедупликации — `(repository, workflow, full head SHA)`;
- автоматический push/PR run имеет приоритет над ручным dispatch;
- default — dry-run, единственная мутация требует явный `--apply`;
- активный или успешный exact-SHA run переиспользуется;
- любой завершённый неуспешный exact-SHA run блокирует новый dispatch:
  helper предлагает rerun существующего run, а детерминированная ошибка
  исправляется новым commit SHA;
- перед dispatch remote branch должен указывать ровно на проверенный SHA;
- непосредственно перед мутацией повторяются и run lookup, и remote-ref
  check; ошибка `git`/`gh`, невалидный ответ или движение branch закрывают
  операцию без dispatch.

Граница гарантии: GitHub не предоставляет атомарной операции
«создать workflow_dispatch, только если run с таким SHA отсутствует».
Двойной preflight закрывает обычную гонку, но оператор всё равно не
использует `--apply` сразу после push — сначала даёт зарегистрироваться
автоматическому run.

Операционное правило: один push на пакет/раунд ревью; automatic run имеет
приоритет; manual dispatch — только после exact-SHA preflight; повтор
инфраструктурного/флаки-падения — через `gh run rerun --failed`.

Приёмка helper:

- детерминированные тесты без сетевых мутаций покрывают active, success,
  failure, cancelled, отсутствующий run, движение remote ref и появление
  автоматического run между двумя проверками;
- default-вызов не исполняет `gh workflow run`;
- при любой ошибке lookup helper fail-closed;
- shell не используется: команды исполняются массивами аргументов.

---

## WS5 — `VISION.md`, `AGENTS.md` и разделение слоёв документации

1. **`VISION.md`** (meta-repo, одна страница): пользовательская ценность,
   North Star, продуктовые принципы, что платформа сознательно **не**
   делает. Черновик — агент, финализирует юзер.
2. **`AGENTS.md`** (meta-repo): таблица `репозиторий → назначение →
   authoritative docs → verify-команда → запрещённые зависимости/границы`
   + ссылка на root `CLAUDE.md`. `docs:list`-инструмент — YAGNI.
3. **Authority по типу факта** (зафиксировано):

   | тип факта | authority |
   | --- | --- |
   | migration head | Alembic graph |
   | результаты проверок | CI |
   | rollout/readiness | `IMPLEMENTATION-STATUS.md` |
   | durable decisions, инварианты | root `CLAUDE.md` |
   | продуктовый смысл | `VISION.md` |

   В `CLAUDE.md` **допустимы** стабильные ссылки на конкретные миграции
   как identity («частью инварианта X является миграция 0016»); удаляются
   только изменчивые утверждения вида «текущий head», «сейчас зелёное»,
   «последняя миграция» — вместо них ссылка на authority из таблицы.
   **Критерий — проверяемый, не политика:** в meta-repo добавляется
   docs-boundary lint (скрипт, запускаемый вместе с WS1-инструментами),
   который фейлит при появлении в `CLAUDE.md` запрещённых изменчивых
   паттернов (явный список в самом скрипте: «текущий head», «сейчас
   зелёное», «последняя миграция», «passes/green as of» и аналоги);
   правило описывается в `AGENTS.md`. Ветку финализирует параллельная
   линия; после — кросс-проверка на противоречия.

---

## Порядок и зависимости

| шаг | зависит от | заметка |
| --- | --- | --- |
| WS0 meta-repo | — | первым: блокер владения |
| WS1 worktree-status | WS0 | самый дешёвый выигрыш |
| WS5 AGENTS.md (таблица) | WS0 | нужна WS2; делать рано |
| WS4.0 preflight | — | параллельно, делегируемо |
| WS2 auto-review | AGENTS.md | пилот 10–20 изменений |
| WS3.0 аудит детерминизма | — | параллельно WS2 |
| WS3 visual-proof | WS3.0 | пилот pins-ftue, чистая ветка |
| WS4 CI ×4 | WS4.0 | agents → ugc → generator → feed |
| WS5 VISION.md | WS0 | ~час времени юзера |
| receipt / обёртка | пилоты WS2+WS3 | только по факту паттерна |

## Решения по бывшим открытым вопросам

1. Пилот WS3 — `pins-ftue`, контролируемая чистая ветка/fixture.
2. Второй ревьюер — не в каждом прогоне; сравнение Claude vs Codex на
   части пилотных patches, решение по дополнительным findings.
3. ТЗ живёт в meta-repo после WS0; backend — временно.
4. Playables CI — path-scoped workflow пилотного playable как
   продолжение WS3, не полный CI.

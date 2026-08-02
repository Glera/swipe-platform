NO-GO

# Кросс-ревью связки Phase-B0: swipe-agents PR #14/#15/#16 + meta PR #52

- Дата: 02.08.2026. Reviewer: Claude (Fable 5). Author = Codex/агенты —
  author ≠ reviewer соблюдён. Diff-only, read-only: ни одна ветка, ни рабочее
  дерево, ни резервный Mac не изменялись; эксперименты выполнены в одноразовых
  репозиториях в скретчпаде сессии.
- Exact heads: #14 `27791e0f1c23457f5746160ca752a3537149265b`,
  #15 `437cbde242f348dd72abe9386291707ea9a6f3fa`,
  #16 `5ea044accdc0e75a426a8ffd1e79d74eda89ebf5`,
  meta #52 `94b9ec5e2b069e24a84ee2c49492df0c91d7098e`.
  Все четыре подтверждены на момент вердикта как OPEN/MERGEABLE/CLEAN, CI
  зелёный на exact SHA (agents CI ×3 success, meta-verify success).
- Метод: ручной разбор #14 и meta-пакета + два параллельных адверсариальных
  прохода по #15 и #16. **Оба P1 воспроизведены мной лично**, независимо от
  проходов; ниже приведены фактические выводы команд.

## Вердикт

**NO-GO.** Два P1, оба ломают центральный клейм своего PR:

| PR | Вердикт | Блокирует |
| --- | --- | --- |
| #14 | GO WITH CONDITIONS | P2-A (PATH в root-актах), P3-A |
| #15 | NO-GO | **P1-A** + 4×P2 |
| #16 | NO-GO | **P1-B** + 5×P2 |
| meta #52 | NO-GO как evidence-пакет | два клейма расходятся с кодом (ниже) |

Порядок мержа #14 → #15 и запрет на установку/переключение не оспариваются —
они и так не разрешены. Вопрос только в том, что сами по себе #15 и #16 пока
не дают тех гарантий, ради которых существуют.

---

## P1-A [#15] — `git archive` не определяется рецензированным коммитом: локальный `.git/config` и `.git/info/attributes` — живые входы сборки

`host/phase-b0/p4g-agent-phase-b0-release-candidate.mjs:69-79` (`gitEnv`)
отключает только global и system конфиг:
`GIT_CONFIG_GLOBAL=/dev/null`, `GIT_CONFIG_NOSYSTEM=1`. **Локальный**
`$GIT_DIR/config` и `$GIT_DIR/info/attributes` не нейтрализованы, а
`git archive` прогоняет содержимое блобов через `convert_to_working_tree()` —
то есть применяет `export-ignore`, `core.autocrlf` и **`filter.<name>.smudge`**.

Воспроизведено мной (git 2.39.5, ровно те же переменные окружения, что у
билдера, одноразовый репозиторий):

```
baseline:            a.txt b.txt
+ .git/info/attributes: "b.txt export-ignore"
  → архив:           a.txt          (файл молча исчез из релиза)
+ .git/info/attributes: "a.txt filter=evil"
+ git config filter.evil.smudge "/usr/bin/sed s/hello/PWNED/"
  → содержимое a.txt в архиве: PWNED
проверка после подмены: git status --porcelain --untracked-files=no → 0 строк
                        git rev-parse HEAD → f26908b5 == рецензированный commit
```

`assertExactSource` (`:123-149`) проверяет ровно две вещи — `HEAD ==
sourceCommit` и пустой `status --porcelain --untracked-files=no` — и обе
остаются истинными. Значит канал невидим для всех заявленных проверок.

Почему это именно P1, а не «теоретическая» находка:

1. **Предусловие — запись в `.git/` операторского чекаута, а не в отслеживаемое
   дерево.** Это ровно тот принципал, которому контур не доверяет: агенты
   работают под операторским аккаунтом и рутинно исполняют git в этом чекауте.
   Инцидент-квитанция от 01.08 фиксирует, что привилегированные акты под общей
   учёткой на этом хосте уже происходили без авторизации.
2. **Двойная сборка не ловит, а подтверждает подмену.** Тампер детерминирован,
   поэтому обе обязательные сборки дают один и тот же `releaseTreeDigest`, и
   ритуал воспроизводимости выдаёт зелёный на отравленных байтах.
3. **Всё, что ниже по цепочке, привязано к выходу `git archive`.** Инсталлятор
   перепроверяет тот же дайджест, активация связывает его же. Ни одна из
   аккуратно сделанных пост-проверок не может это обнаружить — они проверяют,
   что установлены ровно те байты, которые выбрал `git archive`.
4. **Smudge-фильтр — это ещё и исполнение произвольной команды** от имени
   оператора внутри «герметичной» сборки.

Фикс: (а) архивировать из чистого промежуточного GIT_DIR (`git init` во
временный каталог под `buildHome`, `git fetch <source> <commit>`, архивировать
там — у свежего репозитория нет ни local config, ни `info/attributes`);
и/или (б) сверять извлечённое дерево с объектной базой:
`git ls-tree -r --format='%(objectmode) %(objectname) %(path)' <commit>`,
пересчитывать `sha1("blob <len>\0"+bytes)` по каждому извлечённому файлу и
требовать точного совпадения множества, режимов и OID (заодно закрывает молча
выпадающие `160000` gitlinks); плюс `GIT_ATTR_NOSYSTEM=1`,
`-c core.autocrlf=false -c core.eol=lf` и отказ при существующем
`$GIT_DIR/info/attributes`.

## P1-B [#16] — 48-часовое окно измеряется исключительно настенными часами хоста

Проверено по коду:

- `host/phase-b0/phase-b0-acceptance.mjs:248` —
  `const startUtc = new Date(nowMs).toISOString()`, где `nowMs = Date.now()`
  (`:1343`).
- `:337` — конец окна валидируется как `endMs > nowMs` против того же
  `Date.now()`; `validateWindow` проверяет только разность двух хостовых меток.
- Удалённый верификатор (`phase-b0-remote-sync.mjs:1645-1690`) сверяет
  `receipt.completedAt` (пишет хост) с `remoteSnapshot.time` — а время снапшота
  restic берёт с клиента. Обе стороны «перекрёстной» проверки — одни и те же
  часы.
- `inspectB2Provider` (`phase-b0-remote-sync.mjs:483`) реально ходит по HTTPS к
  `api.backblazeb2.com`, но принимает `nowMs = Date.now()` как собственный
  источник времени и не извлекает ни `Date`-заголовок ответа, ни серверный
  `uploadTimestamp`. Ни одной серверной метки времени в цепочку не попадает.
- `kern.boottime` (`:1024-1034`) только хэшируется в `bootDigest` — как
  идентичность, не как время.

Сценарий: root отключает сетевое время и делает 8 итераций «шаг часов +6ч →
`launchctl kickstart -k system/com.p4g.swipe-agents.remote-sync`». Каждая
итерация даёт **настоящий** B2-снапшот и настоящую квитанцию с
`runKind=scheduled`, `runOrigin=launchd` — оба поля выставляет подлинный
launchd-запуск, то есть дискриминатор из #14 честно проходит. Времена внутри
согласованы (`remoteSnapshot.time === receipt.snapshotTime`), монотонность
держится, `maxGap ≤ 6h15m` держится, `successfulBackups ≥ 8` держится. Затем
`audit --window-end <T0+48h>` проходит, потому что `Date.now()` уже показывает
T0+48h. Итог: «48 часов автономной работы» закрываются примерно за полчаса
реального времени, и **все дайджесты внутренне согласованы** — ни одна проверка
пакета не отличит это от настоящего окна.

Это не абстракция: матрица сама трактует манипуляцию часами как in-scope
(строка Rollback: «rollback/completion times must match the live clock»), а
инцидент 01.08 показал, что привилегированные акты на этом хосте могут
исполняться агентом под общей учёткой. Именно от такого «самосогласованного
доказательства закрытия гейта» весь протокол и защищает.

Фикс: завести в цепочку хотя бы одну метку времени, которую хост не выбирает.
`inspectB2Provider` уже делает HTTPS-запрос — снять `Date` из ответа (или
серверный `uploadTimestamp` из `b2_list_file_names`), положить `providerNowUtc`
в anchor (на `start`) и в remote-window receipt (на `verify-window`) и требовать
`providerNowEnd − providerNowStart ≥ MIN_WINDOW_MS` с ограниченным расхождением
против локальных часов. Дополнительно писать в anchor вывод
`systemsetup -getusingnetworktime` и отказывать при выключенном сетевом времени.

---

## P2 — по PR

### #14

**P2-A. Root-исполняемые обёртки резолвят `git`/`stat`/`shasum`/`awk`/`id`
через PATH вызывающего sudo.** `p4g-agent-phase-b0-install:53,58` — обе
Git-команды, изменённые этим PR, вызываются без абсолютного пути; в шапке
скрипта PATH не нормализован. Тот же паттерн в `p4g-agent-phase-b0-control:61`,
`p4g-agent-phase-b0-install:118`, `p4g-agent-phase-b0-publish:45`,
`p4g-agent-phase-b0-acceptance:43`. Все они по рунбуку запускаются под root
(`docs/runbook-phase-b0-unattended.md:380,455,477,496,589,601,611,654`).
Контраст внутри того же контура: launchd-обёртка `p4g-agent-remote-sync` строит
`CLEAN_ENV` и делает `exec /usr/bin/env -i`; `.mjs`-модули зовут
`/bin/launchctl` и `/usr/bin/id` абсолютно; билдер #15 использует константу
`GIT_PATH`. Проектный стандарт есть — здесь не применён.
macOS не поставляет `secure_path` в sudoers, поэтому sudo сохраняет PATH
вызывающего; на Homebrew-хосте `/usr/local/bin` пишется admin-аккаунтом (по
readiness-аудиту именно там node и restic), а «protected» в
`phase-b0-host.mjs:393` определён как «не пишется runtime-раннером», а не «root».
Подложенный `/usr/local/bin/git` исполняется как root внутри самого
authority-гейта. Проверка на резервном Mac: `sudo sh -c 'echo $PATH'`.
Фикс: `typeset -r PATH=/usr/bin:/bin:/usr/sbin:/sbin` в шапке каждого
root-враппера либо абсолютные пути ко всем внешним бинарям.

### #15

- **P2-B. Сборка не герметична: `npm ci` исполняет install-скрипты, тянущие
  неприпинованный нативный код.** `release-candidate.mjs:294-299` — без
  `--ignore-scripts`. Проверено: `hasInstallScript: true` у `better-sqlite3`,
  `esbuild`, `fsevents`; install-скрипт better-sqlite3 —
  `prebuild-install || node-gyp rebuild --release`. Тарболлы integrity-пиннуты,
  но 1.9 МБ нативного `.node`, скачиваемого `prebuild-install` с GitHub-релиза,
  **не покрыты** lockfile-integrity и попадают в замороженное дерево, после чего
  благословляются tree-дайджестом. Замена ассета вверх по течению → обе
  обязательные сборки согласованно принимают неотревьюенный нативный код.
- **P2-C. `mkdirSync(releasesRoot, {mode: 0o755})` маскируется umask.**
  `release-install.mjs:320-324`, chmod после не делается. Проверено на node
  v24.7: при `umask 077` каталог создаётся `0700`. Именно `umask 077` ставят все
  zsh-инструменты репозитория. `assertSecureDirectory` пропускает `0700
  root:wheel`, поэтому install и `--switch-current` вернут зелёные квитанции, а
  `p4g_runner` не сможет пройти в `releases/` и рантайм не стартует. В легаси
  инсталляторе этот же footgun обойдён явным `install -d -m 0755`.
- **P2-D. Квитанция не содержит идентичности тулчейна/платформы.**
  `release-candidate.mjs:322-328`. Дерево включает `node_modules`, чьё
  содержимое OS/arch-зависимо (`fsevents`, `@esbuild/<platform>-<arch>`,
  ABI-специфичный `.node`); node/npm не припиннуты. Значит Mac оператора и
  Ubuntu-CI законно дадут **разные** `releaseTreeDigest`, и никто не отличит
  «другой тулчейн» от «подменённый кандидат» — ровно то различение, ради
  которого существует двойная сборка.
- **P2-E. `--apply-release` и `--switch-current` принимаются одной командой.**
  `release-install.mjs:247-254`, и тест `phase-b0-release-candidate.test.js:81-96`
  прямо утверждает валидность комбинации. Рунбук описывает их как два
  раздельных authority-акта с отдельным одобрением между ними.

### #16

- **P2-F. Резервация physical-capture утекает при любом отказе до мутации и
  необратимо убивает окно.** `phase-b0-acceptance.mjs:1299-1338`: маркер
  `.capture-in-progress` создаётся до `runJsonAsRunner`, `unlinkSync` стоит
  только на success-пути, `try/finally` нет. Самый вероятный операторский
  сценарий: перезагрузка ночью, `capture --kind reboot` утром спустя >6ч →
  `remote_sync_run_at_load_not_observed` (`phase-b0-physical.mjs:213-233`), kill
  не выполнялся, мутации не было — но маркер остаётся навсегда, `complete`
  больше никогда не проходит, повтор даёт `physical_capture_in_progress`, а
  команды снятия маркера нет ни в коде, ни в рунбуке.
- **P2-G. Dead-man «provider evidence» — самоподписанный локальный файл.**
  `:785-841`: `monitorIdDigest`, `alertDestinationDigest`,
  `providerObservationDigest` проверяются только как 64-hex и ни с чем не
  сверяются; публикация (`:1278-1287`) кладёт кандидата дословно — в отличие от
  `audit`/`remote-window`, которые переисполняются вживую. Матрица требует
  обратного: «A local ping or local file alone is insufficient», а durable-решение
  репозитория гласит «a self-hashed evidence document is not external authority».
- **P2-H. root грузит нативный аддон в обход верификации релиза.**
  `:1515-1518` в `captureLiveRollbackReceipt`: `createRequire` по
  `releases/<anchor.release>` и `new Database(STORE_PATH)` **без** `preflight()`
  — единственный такой путь; `STORE_PATH` идёт через runner-контролируемый
  symlink `current` без `lstat`/`O_NOFOLLOW`.
- **P2-I. Весь эффектный слой PR не исполняется ни одним тестом.** 0 ссылок в
  `tests/` на `startLiveAcceptance`, `auditLiveAcceptance`,
  `publishLiveAcceptanceEvidence`, `captureLivePhysicalEvidence`,
  `completeLiveAcceptance`, `captureLiveRollbackReceipt`, `runLiveRestartDrill`,
  `verifyLiveColdBoot`. Швы для тестов уже сделаны
  (`runLiveRestartDrill({now, sleep, spawn, kill})`) и не использованы.
  Валидаторы покрыты широко и хорошо — не покрыт слой, который мутирует хост.
- **P2-J. `control bootstrap` поднимает все три демона и только потом
  детерминированно отказывает.** `p4g-agent-phase-b0-control:150-153` — `start`
  вызывается после всех трёх `launchctl bootstrap`, при `BOOTSTRAP_IN_PROGRESS=1`,
  поэтому EXIT-trap сносит хост. Любой повторный bootstrap при живом anchor
  (`acceptance_evidence_exists`) поднимает supervised-рантайм — он успевает взять
  лизу и, возможно, доставить — и тут же всё убивается. Условие известно до
  мутации: достаточно проверить anchor в `require_installed`.

## P3 (не блокируют по отдельности, но входят в «без P1–P3»)

- #14: пост-успешный отказ ротации логов даёт бесконечный 5-минутный цикл
  **полных** бэкапов (`phase-b0-remote-sync.mjs:2041-2064` ставит `exitCode=1`
  после успешного бэкапа + `KeepAlive.SuccessfulExit=false` /
  `ThrottleInterval 300`); триггеры — ENOSPC на пересоздании активного лога,
  `nlink !== 1`, чужой uid. Рунбук описывает retry как «until one backup
  succeeds» — а здесь бэкапы успешны, но retry не прекращается.
- #15: env-наследование в `lookupRunnerIdentity` инсталлятора (в отличие от
  билдера); все типизированные коды отказа схлопываются в `unexpected`
  (`release-install.mjs:497-500`, `release-candidate.mjs:336-339`) — оператор
  получает машиночитаемый артефакт, не говорящий, почему акт провалился;
  провалившийся `renameSync` оставляет замороженное staging-дерево в
  `releases/`; провал отката теряет исходную ошибку и оставляет `current`
  переключённым; dry-run reverify не проверяет безопасность runtime-корня;
  `errorOnExist` — молчаливый no-op; umask не припиннут (при `umask 0111`
  бинарники релиза замораживаются неисполняемыми с зелёной квитанцией);
  `GIT_ATTR_NOSYSTEM` не выставлен; в «продакшн»-релиз едут devDependencies,
  тесты и `.github/`; `SOURCE_DATE_EPOCH` вычисляется, но никем не потребляется;
  тестовые пробелы (inconclusive-ветка launchctl, rollback inode-conflict,
  tampered-candidate) — при том что launchctl в исполняемом пути замокан.
- #16: отсутствующая квитанция даёт `unexpected` вместо типизированного отказа;
  захардкоженный путь релиза в regex дублирует политику; `atomicEvidenceJson`
  может удалить чужой temp; `runStates.started === 0` может ложно валить живой
  аудит.
- Вне ревьюируемых диффов (наблюдение, не находка):
  `tests/run/symlink-entrypoints.test.ts > runs the backup CLI direct-execution
  guard` флакует под нагрузкой — 1 из 4 моих полных прогонов, `status=null`
  (таймаут спавна при 74 параллельных файлах). Зелёный CI как receipt слабеет от
  флака; стоит поднять таймаут.

## meta PR #52

Фактическая часть пакета точна: состояние резервного Mac, хронология
инцидента, идентичности и последовательности гейтов сверены и совпадают;
формулировка «Permanent control: independent review is evidence, never merge
authority» — правильное закрытие инцидента 01.08. Замечаний к честности
изложения нет; пакет нигде не присваивает себе полномочий.

Но два клейма расходятся с рецензируемым кодом и потому не могут быть
зафиксированы как закрытые:

1. `phase-b0-remote-sync-followup-review-2026-08-01.md`, раздел
   «Full-release reproducibility finding and disposition»: «archives only exact
   tracked source bytes» — опровергнуто P1-A.
2. `phase-b0-bounded-acceptance-matrix-2026-08-01.md`, строка «External
   dead-man»: «A local ping or local file alone is insufficient» — реализованный
   валидатор принимает ровно самоподписанный локальный файл (P2-G).

Плюс матрица не содержит ни одной строки, требующей независимого от хоста
источника времени, — на что указывает P1-B; это стоит внести в контракт
закрытия, а не только в код.

## Проверено-чисто (существенное)

- **#14 закрывает double-fork спуф по-настоящему.** `backupRunOrigin:1902-1938`
  в проде вызывается без инъекций, путь `/bin/launchctl` абсолютный, env
  санитизирован, timeout/signal/maxBuffer ловятся fail-closed, требуется ровно
  один `pid = N` и равенство `process.pid`; обёртка делает `exec`, поэтому PID
  launchd-джобы и Node — один. PID-реюз невозможен: ядро не переиспользует PID,
  пока launchd не пожнёт процесс, а при жатве launchd снимает публикацию pid.
  **Исполнено на реальном macOS 15 (этот Mac, не фикстура):**
  `/bin/launchctl print system/com.apple.securityd` → ровно одна строка
  `\tpid = 393`, строгий счёт совпадений регекспа = 1; отсутствующая метка →
  exit 113, загруженная → exit 0 (это же подтверждает границу «unloaded = ESRCH
  113» из #15).
- **#14 лизинг и хэширование.** Продление при остатке ≤1ч при шагах ≤1ч даёт
  строго положительную маржу; захват чужого лиза невозможен — reclaim требует
  ESRCH, `EPERM`/любая иная ошибка fail-closed; конкурирующие reclaim'еры
  сериализованы атомарным `mkdir`-guard'ом с перепроверкой dev/ino до и после
  `rename`. `appendFileBytes:1377-1420` сверяет opened/completed по
  dev/ino/size/mtime/**ctime** — ctime из userland не подделывается.
- **#15 подмена байтов после квитанции закрыта.** Пере-хэширование на каждой
  передаче: кандидат перед копированием, staging после копирования,
  опубликованное дерево после `rename`, живой `current` при `--switch-current`.
  Симлинк-побег закрыт тремя способами (bounded-обход с циклом, лексическая и
  realpath-проверки), `cpSync` с `dereference:false, verbatimSymlinks:true`,
  `lchownSync`. Дайджест-поля длиннопрефиксны — коллизии склейкой путей
  недоступны. Детектор выгруженных джоб строг: `status===0` → отказ,
  `error/signal/status===null` → отказ, принимается **только** ровно 113.
  Rollback-inode-проверка настоящая: dev+ino снимаются до `rename` и
  сравниваются вместе с `readlink` перед любой записью отката.
- **#16 привязки байтовые, а не по именам.** `release`/`releaseTreeDigest` не
  читаются из файла, а пересчитываются preflight'ом (3001 путь) и сверяются с
  activation; `bindIdentity` требует anchor+release+tree+activation на
  restart/reboot/rollback; `audit` и `remote-window` **переисполняются** живьём,
  а не берутся с доверием; публикация write-once через `linkSync`+EEXIST, чтение
  требует root-owned 0644 не-симлинк с root-owned родителем;
  runner-кандидаты — `O_NOFOLLOW`, uid/mode/nlink/размер. Границы окна точные
  (48h/72h), только UTC-Z, задним числом внутри цепочки не пройти.
  launchd self-identity в #16 не копирует паттерн `== process.pid` (инструмент —
  внешний наблюдатель) и заменён более сильным кортежем ppid+user+полный argv
  с требованием ровно одной строки `ps`; модель процессов caffeinate проверена
  эмпирически и верна. `control` не получил новых актов авторитета; инсталлятор
  расширен строго аддитивно (SOURCES/DESTINATIONS/MODES = 17/17/17 при живом
  guard'е длины), dry-run-first сохранён.
- **Скоуп.** Посторонних правок нет ни в одном из трёх PR. Единственный файл вне
  Phase-B0-поверхности — `tests/finance/cli.test.ts` в #16: правка корректна и
  **усиливает** default-off (убирает наследование `AGENTS_FINANCE_*` из среды);
  замечание гигиеническое — стоит выяснить, почему в среде автора эти гейты были
  выставлены.
- **Тесты у меня локально.** Полный прогон стека на darwin вне `/tmp`:
  **483/484 passed**; единственный отказ —
  `phase-b0-release-candidate` из-за отсутствия системного пользователя
  `p4g_runner` (CI заводит его через `useradd`), то есть средовой, не дефект.
  CI-обязательность исполняемой регрессии подтверждена:
  `executeReleaseHostTest = darwin || AGENTS_RELEASE_CANDIDATE_CI === "1"`,
  и `verify.yml:41` выставляет флаг; `continue-on-error` и платформенных `if:`
  нет. Регрессия неизменности индекса — `it.runIf(darwin)`, в Ubuntu-CI
  пропускается, но я исполнил её лично на darwin.

## Условие следующего раунда

Закрыть P1-A и P1-B, перечисленные P2 по каждому PR и P3; прислать disposition
с fixed exact SHA всех затронутых частей и обновлённый meta-пакет (два клейма
выше + строка контракта про независимый от хоста источник времени). Следующий
раунд повторит: воспроизведение tamper-канала `git archive` на фиксе,
исполняемую проверку окна против серверного времени, жизненный цикл резервации
capture, и негативы на непокрытый эффектный слой #16.

Ничто в этом отчёте не является разрешением на merge, установку, переключение
`current`, bootstrap или запуск окна: вердикт — evidence, а не authority.

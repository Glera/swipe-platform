# Two-Mac model-free wake gate v1

Статус: implementation contract для Issue
[#136](https://github.com/Glera/p4g-workspace-meta/issues/136), piece 3.
Стабильные ownership/authority-инварианты остаются в
[two-mac-zero-transfer-bridge-phase-0.md](two-mac-zero-transfer-bridge-phase-0.md).

## Результат

На каждом Mac работает один короткий host-local процесс. Пустой тик:

1. постранично читает только GitHub Issue-комментарии;
2. применяет существующий `scanControlWakeComments` и causal-lineage контракт;
3. не запускает модель и завершается.

При первом реальном `DISPATCH` процесс:

1. сверяет raw Codex session id из локального `0600` config с server-visible
   только SHA-256 task binding;
2. сверяет exact локальный meta HEAD с active machine binding;
3. атомарно сохраняет один bounded payload и prompt hash;
4. проверяет exact локальный `0600` headless-owner receipt и Codex
   thread-writer lock выделенной owner-сессии; отсутствие lock допустимо только
   при совпадении receipt с session/task/active binding, а существующий lock
   всегда классифицируется по владельцу;
5. после bounded capability-probe выполняет один
   `codex exec resume --json <session-id> -`, передавая prompt через stdin;
6. двигает consumed cursor только после exit `0`.

Owner-сессия обязана быть отдельной headless CLI-сессией и не должна открываться
в Codex Desktop: Desktop `app-server` удерживает writer lock всё время загрузки
thread, а не только во время активного turn. Gate различает эти процессы через
`lsof` и полный argv владельца lock; Desktop-owner даёт durable
`headless_owner_loaded_in_desktop`, а не бесконечный ложный `owner_busy`.
Завершённый `codex exec` штатно не обязан сохранять writer-lock: idle-доказательство
живёт в `headless-owner-receipt.v1.json`, а не в пустом lock-файле. Receipt
создаётся только после exact replacement binding командой
`--run --write-headless-owner-receipt`, хранится рядом с config в mode `0600` и
содержит exact `{machine, codexSessionId, taskDigest, bindingDigest,
bridgeCommit}` плюс canonical digest. Missing, stale, malformed или не-`0600`
receipt при отсутствующем lock даёт durable `headless_owner_receipt_invalid`
до AI-вызова.
Тот же receipt обязателен для существующего, но никем не удерживаемого
orphaned lock; gate и receipt-writer используют одну `lsof`/`ps`
классификацию. Default dry-run ничего не пишет и для targeted wake явно
возвращает `headlessOwnerReceipt=exact|invalid`.

Никакого periodic AI fallback нет. `STOP`, `AUTHORITY_REQUIRED`, malformed
targeted wake, binding drift и неясный exit становятся durable attention.
Неясный resume никогда автоматически не повторяется.

## Один host process

На Mac A новый gate может вызвать существующий `intake-drain-watcher.mjs`
ровно один раз в начале тика через `intakeDrainConfigPath`. Это позволяет при
активации заменить старый drain-only plist одним новым plist, а не держать два
таймера. На Mac B поле равно `null`.

Gate сам не публикует GitHub comments, не принимает продуктовые решения и не
получает production credentials. AI-сессия после пробуждения использует
существующий bridge producer для terminal receipt+wake.

## Локальный config

Файл `~/.p4g-wake-gate/config.json`, mode `0600`, exact keys:

```json
{
  "schema": "two-mac.wake-gate.config.v1",
  "machine": "mac-a",
  "repo": "Glera/p4g-workspace-meta",
  "controlIssue": 94,
  "enabled": false,
  "ghExecutable": "/opt/homebrew/bin/gh",
  "codexExecutable": "/Applications/ChatGPT.app/Contents/Resources/codex",
  "codexHome": "/Users/USER/.codex",
  "codexSessionId": "LOCAL-OWNER-SESSION-UUID",
  "metaCheckout": "/ABSOLUTE/CLEAN/META/CHECKOUT",
  "workspaceDir": "/ABSOLUTE/WORKSPACE",
  "intakeDrainConfigPath": "/Users/USER/.p4g-intake-watcher/config.json",
  "initialScannedCommentId": "EXACT-BOOTSTRAP-CURSOR",
  "initialConsumedWakeCommentId": "EXACT-BOOTSTRAP-CURSOR",
  "trustedCommentAuthorIds": ["GITHUB-NUMERIC-ACTOR-ID"],
  "pageSize": 100,
  "maxPages": 10,
  "rotationCommentThreshold": 400,
  "notificationTitle": "P4G Two-Mac"
}
```

Для Mac B: `machine=mac-b`, его локальный session UUID и
`intakeDrainConfigPath=null`. Raw session UUID не попадает в git, GitHub,
stdout или notification.

При переходе со старой Desktop-owner task на выделенную headless task оператор
один раз разрешает `bootstrap --supersede-binding-digest OLD --replace-owner-task`.
Bridge сначала append-only переводит старый binding в HOLD, затем создаёт новый
binding на exact merged meta HEAD. Scanner принимает только active task digest и
непосредственный последний held predecessor той же машины; для Mac B то же
правило отдельно применяется к callback Mac A. Благодаря этому уже сохранённый
FIFO wake переносится без нового wake, replay или cursor rewrite. Более старые
held-задачи не становятся aliases.

Оба initial cursor задаются при bootstrap из последнего уже
диспозиционированного control-комментария. `trustedCommentAuthorIds` содержит
только server-read numeric GitHub actor IDs операторов/bridge publishers;
display login не является authority. Legacy/неизвестный автор marker-а
fail-closed блокирует gate.

## Durable local state

`wake-gate-state.v1.json` хранит отдельно:

- `lastScannedCommentId`;
- `lastConsumedWakeCommentId`;
- compact comment index (полные bytes только bridge-marker и ещё не
  просмотренного prose; старый prose обнуляется);
- один `pending` со статусом `queued | started | outcome_unknown`;
- bounded `handledWakeIds` и notification keys;
- одно blocking attention.

State и payload пишутся atomic rename через `0600` temp file. Gate имеет
host-local no-steal directory lock; аварийно оставшийся lock не имеет TTL и
требует явной диспозиции.

## Compact reading и rollover

GitHub каждый тик полностью читается страницами до 100 comments с explicit
page bound: `since` не используется, потому что lagged creation и page shift
могут пропустить wake. Повторный id обязан иметь те же append-only bytes и
того же numeric author; исчезновение ранее виденного comment тоже fail closed.
Marker history сохраняется для causal-lineage, старый prose — нет. Общий
body-cache bounded. Oversize, edit, page gap или выход за bounds fail closed
до cursor advance.

При `rotationCommentThreshold` gate сначала дочитывает уже существующие wakes,
а затем блокируется с durable `control_issue_rotation_required`. Ротация
самого control Issue остаётся редким bounded operator rollover: только когда
оба cursor совпадают, `pending/attention` пусты и обе owner-сессии idle. Новый
Issue получает fresh exact machine bindings; затем оба локальных config
переключаются одним окном. Gate не создаёт Issue и не меняет authority сам.

## Recovery без replay

Постоянный AI-retry запрещён. После доказанной оператором причины доступны
только локальные identity-bound команды:

- `--run --clear-attention COMMENT_ID` — очистить exact attention;
- `--run --resolve-outcome WAKE_ID --resolution consumed` — зафиксировать
  доказанный terminal receipt без повторного resume;
- `--run --resolve-outcome WAKE_ID --resolution not-started` — вернуть exact
  wake в `queued`, только если доказано, что дочерний процесс не стартовал.

Ошибка resume и crash после записи `started` всегда дают
`outcome_unknown`; wake не попадает в dedupe до доказанного success.

## Activation boundary

Этот PR не активирует ничего. После merge и отдельного операторского слова:

1. на каждом Mac создать отдельную headless CLI owner-сессию; не открывать её в
   Desktop;
2. сделать operator-authorized replacement bootstrap active binding на exact
   merged meta HEAD, удержав прежний binding append-only;
3. заменить в local config только `codexSessionId`, сначала с `enabled=false`;
   записать и перечитать exact `headless-owner-receipt.v1.json` через
   `--run --write-headless-owner-receipt`, затем проверить default dry-run;
4. заменить старый Mac A drain-only plist новым шаблоном; на Mac B установить
   тот же шаблон без drain config;
5. выставить `enabled=true`, загрузить plist один раз;
6. dogfood: пустой тик = 0 AI; один A→B→A = один resume на каждом Mac;
   busy/power-off/outcome-unknown остаются pending/attention без retry.

Откат — unload двух plist. Durable Issue и local state не удаляются.

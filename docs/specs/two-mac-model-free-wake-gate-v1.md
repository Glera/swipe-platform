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
4. проверяет Codex thread-writer lock и не будит занятую owner-сессию;
5. после bounded capability-probe выполняет один
   `codex exec resume --json <session-id> -`, передавая prompt через stdin;
6. двигает consumed cursor только после exit `0`.

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

1. на каждом Mac сделать штатный bootstrap active binding на exact merged
   meta HEAD;
2. создать local config с `enabled=false`, проверить default dry-run;
3. заменить старый Mac A drain-only plist новым шаблоном; на Mac B установить
   тот же шаблон без drain config;
4. выставить `enabled=true`, загрузить plist один раз;
5. dogfood: пустой тик = 0 AI; один A→B→A = один resume на каждом Mac;
   busy/power-off/outcome-unknown остаются pending/attention без retry.

Откат — unload двух plist. Durable Issue и local state не удаляются.

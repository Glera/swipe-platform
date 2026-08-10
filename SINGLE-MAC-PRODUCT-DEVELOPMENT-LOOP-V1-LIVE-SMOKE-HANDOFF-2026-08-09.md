# SINGLE-MAC PRODUCT DEVELOPMENT LOOP v1 — rollout + live-smoke packet

Статус: **PREPARED / NO-GO**. В этом ходе внешние изменения не выполнялись.

Один будущий attended rollout разрешим только после закрытия двух preflight
условий:

1. существующий private static Deploy Hook, значение которого попало в
   readable DOM авторизованного Render dashboard во время read-only baseline,
   должен быть отозван/перегенерирован оператором;
2. оператор должен принять фактический источник номера Issue: bridge CLI
   печатает только aggregate run receipt, а `issueNumber` берётся из
   `delivery.issueUrl` обновлённого durable intake receipt. Production-код ради
   изменения stdout в этот packet не добавляется.

Этот документ не разрешает deploy, migration живой БД, settings/secrets,
GitHub App, реальный Issue, live smoke или schedules.

## Exact merged authority

- meta: `Glera/p4g-workspace-meta@5da309bf927c1681bb5989f4a55152ca1153e864`
  (merged PR #80);
- backend: `Glera/swipe-backend@3c3693ae71d3e6ca22961a018adf18d1f1e0abe0`
  (merged PR #61);
- feed: `Glera/feed-prototype@02f398f0c2697884d3184eb4ca4a0218bc191e4d`
  (merged PR #28);
- durable queue: только GitHub Issues `Glera/p4g-workspace-meta`, repository
  id `1305418803`;
- Second Mac и Content Factory не участвуют.

Exact feed build pin для планируемого rollout:
`PLATFORM_SOURCE_SHA=02f398f0c2697884d3184eb4ca4a0218bc191e4d`.
Тот же exact SHA должен быть записан в
`PLATFORM_DEVELOPMENT_INTAKE_BUILD_SHA`. Иной feed SHA этим packet не
разрешён.

## Read-only live baseline — 10.08.2026

Baseline снят GET/read-only действиями; secret values не читались намеренно,
новые credentials/access не создавались.

- backend health: `service=swipe-backend`, `version=0.1.0`, public
  `build=dev`. Public health не доказывает source SHA. Render связывает живой
  сервис с image digest
  `sha256:3d2889a6646de067b5c6951c3410f0c07b6ea38c637396163bee8c3c85f99ce5`;
  immutable manifest CI run `31187976429` связывает digest с backend
  `bbc8026b4dcc3c4ed2e30c07952571a63ef297cb`;
- текущий backend deploy id: `dep-d9quqaqd0e5s73b5u01g`. Это только baseline,
  не будущий CAS: перед cutover его надо перечитать;
- verification job `job-d9quqlflk1mc73fnc5mg` подтвердил живую DB revision
  `0075_playable_rework_status`; migration `0076_single_mac_platform_loop` не
  применена;
- live OpenAPI содержит 80 routes и не содержит development-intake route;
  unauthenticated `GET /api/development-intake` возвращает 404. Новая
  capability off;
- live feed release: feed
  `e3b273f9a685fb0554bac57a1703af699bf044c1`, public archive
  `46144eb2a05a276fa122ae5f74876e4b9b7801cc`, live `index.html` SHA-256
  `6629d2e070881140315c8d019d7a6263fcf1adc7363515582efd86b334f23c36`;
- static Render deploy id `dep-d9so191t0dsc73btt8j0`, Auto-Deploy On Commit;
- exact GitHub Issue marker search `p4g-development-ticket:v1` дал 0 Issues;
- Render backend содержит 125 env names; sorted name-list SHA-256
  `8de571fb01efd0af8b1c6cc76bb4891b8936c60fb1fafea373030317a2f352e9`.
  Ни одного из девяти новых setting names ниже нет. Значения существующих
  settings/secrets не читались.

## Почему порядок именно такой

Фактический static release path — `playables/scripts/deploy-swipe.sh`. Он
собирает sibling `feed-prototype`, создаёт два commits в
`swipe-platform/master` и запускает Render через Auto-Deploy On Commit. Feed
компилирует `__PLATFORM_SOURCE_SHA__` только из process env
`PLATFORM_SOURCE_SHA`; helper не задаёт его сам. Поэтому rollout обязан
вызвать штатный helper с explicit env pin. Без этого UI останется закрытым
даже после backend enablement из-за build-SHA handshake.

Backend уже image-backed. Фактический production path — сначала manual
`Platform release image`, затем `Platform production release` с
`operation=deploy`. `prepare-source` для этого candidate не нужен.

## Один bounded attended rollout

Все шаги ниже входят в одно будущее операторское окно и останавливаются при
первом нарушении STOP-условия.

### 0. Preflight и operator-only credentials

1. Перечитать remote CAS для трёх merged heads, CI, live backend deploy id,
   DB revision, `swipe-platform/master` и live feed release.
2. Оператор отзывает/перегенерирует раскрытый static Deploy Hook. Агент не
   читает и не переносит новое значение.
3. Оператор создаёт GitHub App, установленный только в
   `Glera/p4g-workspace-meta`, с `Metadata: read` и `Issues: write`; остальные
   repository/account permissions отсутствуют. App id, installation id и
   private key передаются только в secret/settings UI, не в chat, shell log
   или artifact.
4. Оператор добавляет следующие backend settings через **Save only**, без
   отдельного deploy:

   - `ENABLE_PLATFORM_DEVELOPMENT_INTAKE=true`;
   - `PLATFORM_DEVELOPMENT_INTAKE_USER_IDS=<exact positive Telegram user id>`;
   - `PLATFORM_DEVELOPMENT_INTAKE_BUILD_SHA=02f398f0c2697884d3184eb4ca4a0218bc191e4d`;
   - `ENABLE_DEVELOPMENT_TICKET_BRIDGE=true`;
   - `ENABLE_DEVELOPMENT_TICKET_NOTIFICATIONS=true`;
   - `DEVELOPMENT_TICKET_GITHUB_APP_ID=<positive integer>`;
   - `DEVELOPMENT_TICKET_GITHUB_INSTALLATION_ID=<positive integer>`;
   - `DEVELOPMENT_TICKET_GITHUB_REPOSITORY_ID=1305418803`;
   - `DEVELOPMENT_TICKET_GITHUB_PRIVATE_KEY=<operator-owned PEM secret>`.

Кроме девяти перечисленных settings новых settings/secrets нет;
новых routes, CLI или background processes rollout не добавляет.
Notification использует уже существующий `BOT_TOKEN`.

### 1. Feed first

Использовать fresh clean sibling workspace:

- `playables@5cbc5578beded5eb73abd6ddff85e9eed821739e` — current deploy tooling;
- `feed-prototype@02f398f0c2697884d3184eb4ca4a0218bc191e4d`;
- `swipe-platform@46144eb2a05a276fa122ae5f74876e4b9b7801cc` — expected base CAS, если
  remote master всё ещё exact.

Штатный вызов из `playables`:

```bash
PLATFORM_SOURCE_SHA=02f398f0c2697884d3184eb4ca4a0218bc191e4d \
  bash scripts/deploy-swipe.sh
```

Зафиксировать два новых exact archive commits, новый `release.json`, live
Render deploy id и live identity. Пока backend capability off, новый UI
остаётся скрытым.

### 2. Exact backend image and additive migration

Dispatch `Platform release image` на backend exact
`3c3693ae71d3e6ca22961a018adf18d1f1e0abe0` с `publish=true` и inputs:

```text
feed_sha=02f398f0c2697884d3184eb4ca4a0218bc191e4d
playables_sha=5cbc5578beded5eb73abd6ddff85e9eed821739e
swipe_platform_sha=<exact new archive master from step 1>
code_min_revision=0075_playable_rework_status
code_max_revision=0076_single_mac_platform_loop
lkg_min_revision=0074_feed_playable_release_scope
lkg_max_revision=0076_single_mac_platform_loop
lkg_kind=image
lkg_build_run_id=31187976429
lkg_image_digest=sha256:3d2889a6646de067b5c6951c3410f0c07b6ea38c637396163bee8c3c85f99ce5
lkg_manifest_sha256=f56c6705b7e2805260e6cb0b40c0079be550ba8bfe632c01265e1d87b7a32f18
```

После successful candidate image запустить `Platform production release` с
`operation=deploy`, exact candidate run/manifest receipt, тем же LKG run и
перечитанным immediately-before-dispatch `expected_current_deploy`. Cutover
применяет additive `0076`; destructive downgrade запрещён.

После terminal verification доказать exact candidate image digest, manifest,
Render deploy id, DB revision `0076_single_mac_platform_loop`, route/capability
для единственного allowlisted actor и отсутствие capability для остальных.

### 3. Один attended smoke

1. В Mini App отправить один уникальный запрос:
   `SMOKE SINGLE-MAC <UTC>: проверить наблюдаемый platform intake; ничего не публиковать`.
   UI показывает `requestId`, `mutationId`, `requestHash`, `replayed=false` и
   delivery state. Exact replay той же mutation возвращает тот же request с
   `replayed=true`.
2. Attended Main-Mac session запускает ровно один bridge pass:

   ```bash
   python -m app.development_ticket_bridge_cli --max-deliveries 1
   ```

   Run receipt обязан показать `outcomes.confirmed=1`, `pending=0`. Затем
   обновить durable Mini App receipt/list: `delivery.issueUrl` обязан указывать
   ровно на один Issue с marker `p4g-development-ticket:v1`. Bridge CLI stdout
   сам номер Issue не содержит.
3. Из exact `delivery.issueUrl` извлечь decimal issue number и сформировать
   terminal JSON. Поле остаётся JSON integer, не строкой и не placeholder:

   ```bash
   jq -n --argjson issueNumber "$ACTUAL_ISSUE_NUMBER" '{
     schema:"platform.development-ticket-terminal.v1",
     mutationId:"<new canonical UUID>",
     issueNumber:$issueNumber,
     status:"NEEDS_HELP",
     summary:"Live intake smoke completed without a code candidate.",
     candidate:null,
     blocker:{
       reasonCode:"smoke_only_no_candidate",
       operatorAction:"Confirm the intake receipt and close the smoke Issue."
     },
     review:null,
     nothingPublished:true
   }' > "$ABSOLUTE_TERMINAL_JSON"
   ```

   До вызова CLI проверить
   `jq -e '.issueNumber | type == "number" and . > 0 and floor == .' "$ABSOLUTE_TERMINAL_JSON" >/dev/null`.
4. Attended session выполняет:

   ```bash
   python -m app.development_ticket_terminal_cli --command "$ABSOLUTE_TERMINAL_JSON"
   python -m app.development_ticket_notification_cli --max-notifications 1
   ```

   Terminal receipt должен вернуть тот же integer `issueNumber`, status
   `NEEDS_HELP` и queued notification; notification run — один confirmed и
   `pending=0`. Оператор получает Telegram receipt с exact Issue URL,
   `NEEDS_HELP`, safe action и `Ничего не опубликовано автоматически`.
5. Оператор вручную закрывает единственный smoke Issue после сверки всех
   receipts. Автоматического close/merge/deploy нет.

## STOP, rollback и evidence

STOP без retry/расширения authority при CAS drift, non-green CI, DB не на
`0075` до cutover, App scope шире exact repo/permissions, feed build pin
отличается, hook не отозван, больше одного Issue, unresolved
`outcome_unknown`, identity mismatch, missing Telegram receipt или любом
secret exposure.

Rollback capability:

1. поставить три `ENABLE_*` в `false`:
   `ENABLE_PLATFORM_DEVELOPMENT_INTAKE`,
   `ENABLE_DEVELOPMENT_TICKET_BRIDGE`,
   `ENABLE_DEVELOPMENT_TICKET_NOTIFICATIONS`;
2. сохранить settings и выполнить exact-image redeploy — одного Save only
   недостаточно, running process не изменится;
3. доказать исчезновение route/capability/UI. Additive `0076` остаётся inert;
   destructive downgrade запрещён;
4. при credential defect оператор отзывает App installation/key. Агент не
   выполняет credential mutation.

Итоговый receipt хранит exact feed/archive/backend/image/manifest/deploy
identity, DB revision, три TMA identifiers, replay, Issue URL/marker,
terminal/notification receipts, ручное закрытие и подтверждение, что Second
Mac, code runner, merge и deploy automation этого lifecycle не участвовали.

Оценка одного окна: 55–85 минут (preflight/credentials 10–15, feed 10–15,
image+cutover 25–40, smoke+evidence 10–15). Timeout CI/hosting завершает окно
как STOP, а не порождает unattended retry.

## Текст единственного следующего operator GO

> GO на один attended rollout + live smoke Single-Mac Product Development
> Loop v1 строго по
> `SINGLE-MAC-PRODUCT-DEVELOPMENT-LOOP-V1-LIVE-SMOKE-HANDOFF-2026-08-09.md`.
> Принимаю, что bridge run receipt агрегированный, а фактический strict-integer
> issueNumber берётся из `delivery.issueUrl` обновлённого durable intake
> receipt. В одном attended окне я лично отзываю/перегенерирую ранее раскрытый
> static Deploy Hook, создаю repo-scoped GitHub App и ввожу credentials/settings
> только в operator UI; агент не видит secret values. Разрешены exact feed
> `02f398f0c2697884d3184eb4ca4a0218bc191e4d`, exact backend
> `3c3693ae71d3e6ca22961a018adf18d1f1e0abe0`, additive migration 0076,
> перечисленные default-off settings и ровно один smoke Issue с replay,
> bridge, NEEDS_HELP, notification и ручным close. Любой STOP-trigger завершает
> окно без retry. Не разрешены scheduler/runner, merge automation, Second Mac,
> дополнительные Issues, destructive downgrade или расширение App authority.

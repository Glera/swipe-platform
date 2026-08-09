# Telegram Development Intake v1 — decisions D3–D5

Статус: **FROZEN для Slice 0/1** (09.08.2026).

Authority: `docs/specs/telegram-development-intake-v1.md`.

Этот пакет закрывает только три pre-code вопроса: lifecycle/CAS, узкий
GitHub bridge и exact HTTPS platform candidate. Он не разрешает GitHub App
installation, secret mutation, backend deploy или candidate-hosting deploy.

## D3 — lifecycle: append-only Issue events

### Решение

GitHub Issue body является immutable genesis ticket contract после bridge ACK.
Поскольку Issue number заранее неизвестен, bridge сначала создаёт
source-marker stub, один раз заменяет его полным contract с фактическим
`owner/repo#number`, затем добавляет genesis event; только весь этот exact
набор считается подтверждённым ticket. Дальнейший `PATCH` body запрещён.
Canonical current state — детерминированная свёртка machine-readable
`development-ticket-event.v1` из append-only Issue comments. TMA, summary и
labels — только восстанавливаемые проекции; `state:*` label не является
authority.

Каждая transition command содержит:

- `ticketId`, `mutationId` и hash exact command bytes;
- expected head: event id/hash, revision и `fromState`;
- `toState`, reason code и safe operator summary;
- exact candidate/evidence identity, когда она обязательна.

Bridge является единственным lifecycle writer. Перед append он fresh-read-ит
все comments, проверяет pinned application author, неизменённый
`created_at == updated_at`, schema, sequence/hash chain, command replay и
allowed edge. После append он перечитывает Issue; downstream effect разрешён
только если новый event стал canonical head. В приложении нет delete/update
transport для lifecycle comments.

Same `mutationId` + same command hash возвращает прежний event. Same mutation с
другими bytes, stale expected head, fork или gap дают conflict и не запускают
effect. Restart восстанавливает всё из Issue без локального lifecycle state.

GitHub не документирует conditional write/CAS для issue `PATCH`; ETag относится
к conditional reads. Поэтому JSON block в body или state label нельзя называть
GitHub-native CAS:
[GitHub REST best practices](https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api#use-conditional-requests-if-appropriate),
[update issue](https://docs.github.com/en/rest/issues/issues#update-an-issue).

Allowed recovery edges включают `NEEDS_HELP → QUEUED` и
`REWORK_REQUESTED → QUEUED`. `ACCEPTED`, `LIVE`, `CLOSED` и `CANCELLED` не
выводятся из label, branch или provider verdict.

### Отвергнутые варианты

1. Один mutable JSON state block в Issue body: stale writer может затереть
   operator edit; body/comment reconciliation после crash неатомарен.
2. Exclusive `state:*` labels: смена labels неатомарна, а audit comments всё
   равно нужны; появляется drift двух представлений.
3. GitHub Project field: отдельный item/permissions и лишняя lifecycle surface
   до доказанной необходимости.

### Acceptance

- strict schema, hash chain, author и полный transition graph тестируются;
- два transitions от одного head дают ровно один canonical winner;
- lost response/restart находят event по mutation и не создают duplicate;
- edited, foreign, gapped и удалённый не-tail event fail closed и не
  dispatch-ит работу;
- ACCEPT/REWORK связываются с current event head и exact candidate;
- pagination, GitHub 5xx/rate limit и stale cache не создают optimistic state.

GitHub Issues list сам по себе не позволяет доказать, что последний comment
никогда не был удалён repository admin-ом: удалённый canonical tail выглядит
как более короткая валидная цепочка. V1 исключает delete authority из bridge и
считает admin deletion внешним authority-changing incident. Обещание
обнаруживать удалённый tail потребовало бы отдельного GitHub audit-log/webhook
authority и в v1 не даётся.

## D4 — bridge: backend outbox worker + GitHub App

### Решение

Bridge живёт в `swipe-backend` как deterministic default-off worker рядом с
durable intake/outbox PostgreSQL. Это Tier 2 implementation slice. Он не живёт
в `swipe-agents`, `swipe-generator`, `swipe-bot` или author/provider session.

Credential — отдельный GitHub App:

- installed repository: только `Glera/p4g-workspace-meta`;
- repository permissions: `Issues: read/write`, `Metadata: read`, остальные
  `none`; user authorization и webhooks не нужны;
- private key хранится только в Render secret environment;
- App id, installation id и pinned repository id — non-secret config;
- short-lived installation token не попадает в API, DB documents, Issue body,
  logs, exceptions, TMA, author или reviewer environment;
- transport разрешает только `api.github.com` и issue endpoints exact pinned
  repository.

GitHub документирует issue write permission и short-lived installation tokens:
[Issues REST API](https://docs.github.com/en/rest/issues/issues),
[installation access token](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-an-installation-access-token-for-a-github-app).

Intake и immutable outbox row фиксируются одной DB transaction. Remote create
имеет hidden source-id/hash marker. Один bridge run удерживает PostgreSQL
session advisory lock от recovery до последнего delivery; второй runner
завершается без remote call. Перед каждым remote mutation row durably входит в
`send_started`. Любой crash или невалидный response после начала mutation
переводится в `outcome_unknown`: blind повторный POST запрещён, reconciliation
ищет exact marker среди open/closed Issues. Только две разнесённые backoff-ом
полные проверки отсутствия разрешают следующий create; read outage не
исчерпывает неоднозначную delivery. После ACK backend хранит intake/delivery
receipt и bounded read projection; lifecycle authority принадлежит Issue.

Platform build identity выдаётся только server-owned session capability.
Frontend показывает control, только если exact server build SHA совпадает с
полным SHA, вшитым в client build; POST с другим SHA получает conflict. Route,
surface и screenshot остаются caller-observed context и так и маркируются в
ticket — они не называются server-verified.

`401/403` означает terminal configuration `NEEDS_HELP`; `429/5xx/timeout` —
bounded backoff. Feature flag rollback останавливает sends, не удаляя intake,
Issues или receipts.

### Отвергнутые варианты

1. Mac A same-user daemon с локальным `gh`: текущий credential имеет broad
   user scopes, а общий user/Keychain не доказывает изоляцию от author agent.
2. Scheduled GitHub Action puller: нужен новый M2M backend principal, а schedule
   имеет лишнюю задержку и не годится основным mobile-first bridge.
3. Переиспользовать существующий backend `GITHUB_TOKEN`: другая authority и
   слишком широкая secret surface.

### Acceptance

- competing workers сериализованы одним DB-session lock, а 10 replay одного
  intake используют одну source identity и создают не более одного Issue;
- crash до call, после remote create и lost response восстанавливаются через
  durable phase + read reconciliation без blind duplicate;
- App может list/create/comment Issues exact repo, но не contents, refs,
  Actions, deployments, secrets или другие repositories;
- repo/installation mismatch и unexpected host/path fail closed;
- pending rows переживают GitHub offline и drain-ятся oldest-first;
- App install, permission и secret выполняет оператор; до этого worker off.

## D5 — platform candidate: inert exact path on current origin

### Решение

Для первого signed operator-only Slice 1 exact candidate собирается из clean
official `Glera/feed-prototype` source SHA, exact
`Glera/swipe-platform@origin/master` base SHA и clean official
`Glera/swipe-ugc` source SHA, реально использованного Vite build. Все три SHA
должны быть достижимы из объявленных remote refs; generic/local fixture
identity разрешена только в явно маркированном dry-run. Затем добавляются
только:

```text
platform-previews/<ticket-segment>/<feed-source-sha>/<ugc-source-sha>/index.html
platform-previews/<ticket-segment>/<feed-source-sha>/<ugc-source-sha>/candidate-manifest.v1.json
```

Candidate URL:

```text
https://swipe-platform.onrender.com/platform-previews/<ticket-segment>/<feed-source-sha>/<ugc-source-sha>/index.html?base=/
```

`?base=/` сохраняет mechanics на production root и тот же origin. Это
единственный текущий bounded путь, который одновременно сохраняет signed TMA,
backend CORS и same-origin playable behavior без backend/config/new-secret
изменения.

Важно: commit этих инертных bytes в `swipe-platform/master` запускает Render
static deployment. Это **candidate-hosting deploy**, но не publication:
production root/roster/manifests остаются byte-identical и candidate path нигде
не рекламируется. Перед первым таким deploy нужен отдельный operator GO и
serialization с Fast Lane writer. Абсолютный запрет любого production-service
deploy до acceptance делает D5 невыполнимым в текущем scope.

Render PR service preview — предпочтительная будущая изоляция, но сейчас
preview setting не доказан, а отдельный dynamic origin не проходит exact
backend CORS для реального signed vertical. GitHub Pages имеет те же origin/CORS
ограничения и требует новой deployment authority.
[Render service previews](https://render.com/docs/service-previews).

`ticket-segment` — детерминированный safe slug + hash полного canonical ticket
id; путь не принимает raw `owner/repo#N`. Candidate build начинается с
dependency install по lockfile в изолированном
checkout и отдельном temp HOME/npm cache/config; существующие `node_modules`,
родительский workspace resolution и user npm config не являются input.
Candidate manifest связывает ticket, feed/UGC source SHA, platform base SHA,
pinned build profile/version и HTML SHA-256. Самоссылочный candidate commit не
встраивается в bytes manifest: после commit его exact SHA связывается с тем же
manifest/artifact digest финальным preparation receipt и ticket event.
READY_TO_PLAY ссылается на URL + commit + digest; новый push создаёт новую
candidate identity.

### Отвергнутые варианты

1. Render PR preview сейчас: хорошая isolation/cleanup, но не реальный signed
   TMA/API candidate без отдельного fixed origin + CORS/operator decision.
2. GitHub Pages: новая settings/Actions authority, большая duplicated static
   snapshot и тот же CORS failure.
3. Mutable root `index.html`: это publication/deploy candidate без isolation и
   нарушает exact acceptance boundary.

### Acceptance

- build использует remote-reachable clean detached feed/UGC SHA, exact
  remote-reachable platform `origin/master`, lockfile-only dependency install,
  pinned `PLATFORM_VERSION` и recorded build profile;
- candidate diff содержит только два allowed files под exact ticket/SHA path;
- root `index.html`, release/versions manifests и mechanic files идентичны base;
- live master CAS проверен перед push; drift → `NEEDS_HELP`, без force/retry;
- HTTPS response 200 и SHA-256 bytes равен manifest;
- mobile TMA smoke подтверждает UI, same-origin mechanic и signed backend call;
- READY_TO_PLAY содержит URL, candidate commit и digest; ACCEPT не означает
  publication;
- отмена не удаляет историю; retention/public-data policy указывается в ticket.

## Gate после freeze

Slice 0 tooling и local dry-runs могут завершаться без external mutations.
Slice 1 code начинается с default-off contracts. До live vertical отдельно
нужны:

1. Tier 2 review backend bridge implementation;
2. operator installation/permission/secret для GitHub App;
3. operator GO на один serialized candidate-hosting deploy.

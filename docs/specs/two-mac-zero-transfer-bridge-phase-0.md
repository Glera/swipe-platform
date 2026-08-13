# Two-Mac Zero-Transfer Bridge — Phase 0

Статус: **FROZEN operating authority** (операторское решение 11.08.2026).

Durable ticket и изменяемая closure matrix:
[Glera/p4g-workspace-meta#94](https://github.com/Glera/p4g-workspace-meta/issues/94).
Этот документ задаёт стабильные границы; текущие heads, CI и live receipts
живут в Issue/PR и `STATE.md`.

## 1. Результат

После одного bootstrap на каждом физическом Mac оператор не переносит между
машинами prompt, receipt, SHA, task ID или wake instruction. Его действия —
product intent/taste и настоящие authority decisions.

- Mac A наблюдает и исполняет platform/backend/feed задачи.
- Mac B наблюдает и исполняет mechanic/Labs задачи.
- GitHub Issue — durable engineering ticket, transport и callback evidence.
- Каждая машина возобновляет ту же локальную Codex-задачу через bounded in-chat
  heartbeat.
- Offline Mac оставляет тикет `QUEUED:machine_offline`; возврат продолжает тот
  же event chain без дубля и reassignment.

Phase 0 не является generic automation platform.

## 2. Ownership

### Mac A — Product Control Plane

- meta, portfolio и `STATE.md`;
- `swipe-backend`, `feed-prototype`, static `swipe-platform`;
- platform PR/merge/deploy и production authority;
- live Lab runtime host из detached exact `swipe-generator/master` после
  exact-SHA handoff.

### Mac B — Content Factory

- `swipe-generator` и `playables` authoring/merge;
- create/copy/variation/mechanic rework;
- candidate build, tests, action traces и visual proof.

Mac B не получает platform/backend/feed authoring, Telegram bot, Render,
backend, production, publication, deploy или `STATE.md` authority.

## 3. Routing

| Typed source | Route | Durable result |
| --- | --- | --- |
| Telegram `Правка платформы`, backend, feed | Mac A | platform Issue |
| Labs create/copy/variation/mechanic rework | Mac B | content Issue |
| Content work requires platform change | Mac B stops content dependency; Mac A gets linked ticket | `NEEDS_PLATFORM_CHANGE` |

Free text, model, provider, quota или subscription не выбирают route.

## 4. Durable Issue contract (D3)

Issue body или один server-derived binding comment содержит immutable
`two-mac.bridge-ticket.v1`:

- Issue repository ID/number и ticket ID;
- original request ID/hash и mutation/parent identity при наличии;
- source kind/repository/id/commit/tree;
- assigned machine/authority, SHA-256 digest локальной target task identity и,
  только для Mac B route, immutable callback digest exact Mac A owner task;
- original instruction и canonical creation time.

Append-only `two-mac.bridge-event.v1` comments содержат sequence, parent event
ID/digest, ticket digest, state, actor machine/task digest, idempotency key,
canonical time, exact evidence и bounded error code.

Projection, не labels/assignee/prose, определяет current state:

```text
QUEUED → QUEUED:machine_offline → CLAIM_PROPOSED → CLAIMED → IN_PROGRESS
                                                             ↘ HANDOFF_READY
                                                             ↘ READY_TO_PLAY
                                                             ↘ NEEDS_HELP
HANDOFF_READY → READY_TO_PLAY | NEEDS_HELP
READY_TO_PLAY | NEEDS_HELP → DONE
```

`QUEUED:machine_offline` может быть пропущен. Claim исполним только после
proposal, полного reread, confirm и ещё двух полных независимых reread. Exact
replay схлопывается; изменённые bytes под тем же idempotency key, sibling/fork,
stale parent, sequence gap, route mismatch или task mismatch fail closed.
Один повреждённый Issue даёт bounded `STOP:issue_journal_invalid`, но не
останавливает наблюдение остальных тикетов.

На одном физическом Mac mutating pass сериализован OS-released local file lock.
Это не lease: нет expiry, stealing или automatic reassignment.

`NEEDS_HELP` не позднее следующего доступного orchestration/heartbeat окна
классифицирует frontier-оркестратор. Technical проблема внутри standing
authority возвращается той же bound owner task; product/taste/new authority
идёт оператору; repeated failure или CAS ambiguity завершается typed `STOP`.

## 5. Host/credential boundary (D4)

Один exact meta script выполняет только один observation/transition pass и
завершается. In-chat Codex heartbeat — существующий trigger той же задачи, не
daemon/scheduler/runner. CLI:

- использует только allowlisted meta repository Issues;
- получает task identity из локального `CODEX_THREAD_ID`, хранит/показывает
  только SHA-256 digest;
- не принимает task digest или arbitrary command как input;
- dry-run по умолчанию, mutation только с `--apply`;
- не читает/печатает GitHub token.

Каждый observer/claim/advance сначала сверяет local task и local bridge HEAD с
единственным active binding в control Issue. Mac A terminal transition для Mac
B ticket дополнительно обязан совпасть с immutable callback task digest самого
ticket; значение `--machine` само по себе authority не даёт.

Bootstrap выводит task identity локально, сверяет exact `meta/master` и пишет
machine/task/bridge binding только append-only comment-ом в control Issue.
Если там есть binding на старый bridge HEAD той же owner task, replacement требует явный
`--supersede-binding-digest`: один bootstrap pass сначала пишет валидируемый
`two-mac.bridge-machine-hold.v1`, перечитывает отсутствие active binding и
только затем пишет replacement binding. Старый marker и его task digest
остаются evidence, но HOLD binding не может пройти observer/claim/advance.
Prose `HOLD` или обычный comment состояния не меняют.
Потеря самой owner task или два одновременно записанных conflicting bootstrap
не переопределяются автоматически: это typed STOP и отдельное operator
authority decision; Phase 0 не создаёт новую task и не угадывает победителя.
Локальный heartbeat уже привязан к этой Codex task, поэтому отдельный task DB
или state file не нужен. Credential/permission/setting creation или activation
— отдельное consolidated operator window. Mac B не получает production или
Telegram credentials.

Race receipt до введения этого контракта сохранён append-only:
[Issue #94 comment 5251171648](https://github.com/Glera/p4g-workspace-meta/issues/94#issuecomment-5251171648),
Mac B binding `2374f285f922355d62bb330614be38b0a72656c033cd813a99006f61de1820d5`
на bridge `773545463e17faf8c05ca3743b432696e4c4aebd`, task digest
`be9b2496185c314369ebb101cc9e18f0a32f6bef4c8ae929556fed09f44c5983`.
Он не удаляется и обязан быть явно переведён в machine-readable HOLD внутри
replacement bootstrap до появления нового active Mac B binding.

## 6. Candidate evidence (D5)

Phase 0 не создаёт новый candidate host. `READY_TO_PLAY` разрешён только с:

- remote-verified exact repository/ref/full SHA;
- existing HTTPS candidate URL;
- exact artifact SHA-256, совпадающий с реально прочитанными candidate bytes.

Если существующего repository-specific transport нет, результат —
`NEEDS_HELP:candidate_transport_unavailable`; bridge не deploy-ит и не
изобретает URL.

## 7. Mechanic linkage (D6)

Merged platform intake сохраняет backend record → one GitHub Issue transport.
Mechanic binding выводится из server-owned Generator projection
(`requestId`, `requestHash`, mutation/parent/source identity) и создаёт/replays
ровно один meta Issue. Caller-authored lineage и ручное изготовление journal
запрещены.
Перед новой binding bridge ищет existing durable ticket с тем же `requestId`;
другой Issue fail closed и не может выпустить второго исполнителя.

Two Dots #91 и Smash #82 — обязательные acceptance cases. До exact Mac B merge
их live product records не мутируются.

## 8. Wake/callback (D7)

Heartbeat видит только assigned route и совпадающий local task digest. Он
возобновляет ту же task с bounded result: Issue URL/number, projected state и
ticket digest; remote shell/prompt transport отсутствует.

Terminal Mac B callback становится Issue event. Следующий Mac A heartbeat
поднимает ту же Mac A task. Если candidate требует detached live Lab host,
Каждый Mac B ticket после implementation пишет intermediate `HANDOFF_READY`
только для remote-verified `master` в `Glera/swipe-generator` или
`Glera/playables`; direct Mac B terminal READY запрещён. Mac A
с exact callback task binding хостит тот же handed-off head и только затем
пишет terminal `READY_TO_PLAY` с проверенным HTTPS candidate либо typed
`NEEDS_HELP`. После terminal evidence Mac A
использует existing system-specific Telegram notification path. Bot credential
не передаётся на Mac B. Missing binding/task даёт typed `NEEDS_HELP` и никогда
не создаёт произвольную новую task.

Каждый `HANDOFF_READY`/terminal callback, разрешающий следующую работу, обязан
в том же append-only Issue event содержать typed discoverable wake. Evidence и
wake нельзя разделять между комментариями: evidence без wake не является
dispatch, а wake без exact evidence fail closed.

Review следует реально затронутой authority-границе. Один review-раунд — один
blind discovery со всей партией findings, одна общая коррекция P1/P2 и один
узкий author-blind delta-verification нового exact head; P3 не блокируют по
умолчанию. Для Tier 2 delta-подпись обязательна. Новый полный discovery —
только по явному запросу оператора либо при scope/authority expansion.

## 9. Explicit non-scope

- background/general runner or scheduler;
- arbitrary remote-command API;
- AI router, provider/subscription/quota optimizer;
- distributed lease/repo lock/merge queue/shared task DB;
- common agent platform или `swipe-agents` integration;
- accept/reject за оператора;
- publication/activation/catalog/roster writes;
- Arrows parked-candidate mutation;
- Labs visual/performance/mobile polish до terminal Phase 0.
- новый bridge/dispatcher, task-store/DB, merge queue, repo-lock/lease или
  quota optimizer до operator review метрик 10–20 реальных bridge tickets.

## 10. Ordering и acceptance

Mac B single author slot: Two Dots #91 → Smash #82 → Generator bridge, если
владелец Mac B не записал другую сериализацию durable comment-ом.
При конфликте portfolio-приоритетов последнее слово принадлежит оператору.

Phase 0 `DONE` только после:

1. zero-transfer A → B → A smoke с exact ticket/request/parent/source identity;
2. correct-task wake на обеих физических машинах;
3. replay/stale/fork/duplicate/offline/task-missing fail-closed proof;
4. one mobile READY/NEEDS_HELP inbox без bot credential на Mac B;
5. Two Dots #91 и Smash #82 через exact merge/runtime handoff до READY;
6. Fast Lane deterministic ten-slot/single-writer suite и attended candidate-only
   smoke: три independent edits together, минимум две concurrent PREPARING,
   independent terminal outcomes, failure isolation, one notification per
   READY, zero publication/decision writes;
7. final closure matrix в #94 без ambiguous materially started work.

Любая новая credential/permission/setting, destructive action, unplanned
migration/restart или publication authority даёт STOP и один consolidated
operator window. Rollback bridge — выключить два local heartbeat; Issues и
events остаются inert evidence, ничего не удаляется и не переписывается.

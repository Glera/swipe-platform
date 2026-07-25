# Security review — native macOS execution broker (`7763d5a`), перед root-install

Дата: 2026-07-21. Ревьюер: внешняя линия. Два Opus-прохода (демон+spawn/launcher;
store/chain/manifest/install/wire) + мои спот-чеки. Спека v2.14 §7.1/§7.2/§9/§10.
Контекст: `sudo … --apply` ставит это root-LaunchDaemon'ом. План прочитан, чистый.

## Вердикт: НЕ green yet. Один короткий targeted фикс-пасс до `sudo --apply`, потом go.
Изоляционное ядро **надёжно** — spawnable privilege-escalation / sandbox-escape в
attended-пути **не найдено** обоими проходами. Это не редизайн, а 3 мелких фикса.

### Что подтверждено крепким (не трогать)
- **privilege-drop**: `qa-launcher.c` — свежий процесс, порядок
  setsid→initgroups→setgid→setuid→[verify no-root]→chdir→umask→setrlimit→signals→
  execve; raw fork в демоне отсутствует. posix_spawn + `POSIX_SPAWN_CLOEXEC_DEFAULT`,
  file-actions ровно 0/1/2+status, env пересобран (только `CLAUDE_CODE_OAUTH_TOKEN`,
  disposable HOME, никаких AGENTS_*/API-key/NODE_OPTIONS/hook/MCP).
- **status-pipe семантика**: payload→spawn_error/126; EOF+observed CLI identity→
  exec_confirmed; EOF без identity→orphaned_spawn_unknown (не «успех»).
- **zero-euid barrier**: proc_listallpids+PROC_PIDTBSDINFO, `pbi_uid||ruid||svuid==child`,
  две пустые выборки, truncation→throw, pre-spawn+pre-release+startup, внутри
  token-window; ошибка→fail-closed.
- **anti-rollback chain**: fsync-до-spawn, полная верификация цепи (Merkle
  previousDigest) на каждом чтении, restore не укорачивает живую chain (код+тест).
- **токен не утекает**: только через no-echo TTY→root 0400, исключён из
  snapshot/receipt/логов, launcher скрабит out/err/status.
- **manifest-пиннинг реальный**: dev+inode+sha256+SecStaticCodeCheckValidity(strict)
  + повторный lstat CLI в launcher; self-check на старте.
- **singleton/FSM**: SQLite partial-unique `one_active_attempt` — реальный гейт
  против второго спауна; flock inode-authority; spawn-FSM/recovery/FAIL-STOPPED
  по §7.1/§10.
- **install.sh**: `_swipe-agents-child` non-login/не-в-runner-группе/без jobs;
  staging root:swipe-agents 2730 (child без read); chain/credential сохраняются
  на reinstall; plan-first; guarded.

### Три отложенных контракта range-1 — статус
- **#2 `attended_authorized`** — ✅ LANDED (`attended-attempt.ts:266-298`, до
  attempt-started и commit, eventId используется везде, dangling-ref закрыт).
- **#3 `context_pinned`** — ✅ LANDED (`drain.ts:409-443`, content-addressed, до
  спауна, retry перечитывает пин).
- **#1 authorization** — ⚠️ ЧАСТИЧНО: auto grant ECDSA/`expiresAt` НЕ реализован
  вовсе, но auto **hard-disabled** (`BrokerCore.swift:224-227` → `auto_not_enabled`)
  — safe-by-disable. Attended `eventRef` инертен (broker его не верифицирует, нет
  DB-доступа) — реальная authority держится на token/authEvidence/barrier
  re-check внутри commit-CAS. Для Phase A приемлемо.

## Фиксы ДО `sudo --apply` (мелкие; это root-демон)
### БЛОКЕР — P2: XPC-пиры не привязаны к серийной authority-очереди
`main.swift:16-35`: listener на `queue`, но каждый peer через
`set_event_handler`+`activate` **без** `xpc_connection_set_target_queue(peer,queue)`
(грепом нет нигде). `core.handle` может идти КОНКУРЕНТНО между пирами; `failStopped`
(Bool) читается/пишется из разных очередей без синхронизации = data race / UB, и
инвариант «authority сериализована» (комментарии `BrokerCore.swift:359,462`) ложен.
Spawn-doubling ловит DB-индекс (defense-in-depth держит), но заявленный инвариант
не установлен. **Фикс — одна строка:** `xpc_connection_set_target_queue(peer, queue)`
до `activate`. На root-демоне ложный safety-инвариант чинится до установки.

### Сделать этим же пассом (дёшево, страховка)
- **Latent-P1 → hard-precondition**: broker обязан отвергать `commit`, если
  `deploymentClass != "phase_a_attended"` (или отказываться собираться без реального
  grant-verifier). Сейчас единственный барьер против forgeable auto-spawn — одна
  строка `executionClass`-чека; при будущем включении auto без grant-верификации
  любой runner-UID caller подделает `grantRef`. Must-before-auto; дёшево сейчас.
- **P3 RLIMIT_NPROC**: `Manifest.swift:131` проверяет `>0`, но не отвергает
  огромные/≈RLIM_INFINITY (§7.2 «RLIM_INFINITY = schema-reject») — fork-bomb-граница
  обходится большим значением манифеста. Добавить верхнюю границу.

## Owner-decision / B1-track (НЕ блокеры установки)
- **P2-1**: broker identity-chain без внешнего monotonic-anchor'а (§10 требует для
  issuer). root удаляет живую chain → restore тихо ставит snapshot-chain с тем же
  chainIdentity на меньшем head → тапл-переисполнение. Root-компрометация chain
  **явно вне threat-model** — остаточный риск. Рекомендация: требовать
  `destructive_recovery` (новый chainIdentity) при отсутствии живой chain, а не
  тихо ставить snapshot-chain. Подтвердить принятие владельцем.
- **auto grant-verifier** (ECDSA P-256 + expiresAt) — реализовать до B1/auto.
- P3: JCS не строгий RFC 8785 + нет кросс-импл golden Swift↔TS; torn-tail chain без
  self-repair (crash-loop до offline-restore); `setState` без from-предиката
  (`BrokerCore.swift:293`); manifest/store не само-верифицируют права; install.sh
  не запрещает `--runner-user root`; QaSpawn.c dup2 target-collision (латентно);
  runtime `chain.append`-fail заклинивает admissions до рестарта.

## Путь к green
1. Фикс XPC serial-queue (P2) + deploymentClass-precondition + RLIMIT_NPROC-reject.
2. `build-release.sh` + `verify:native-broker` + `npm test` зелёные.
3. Повторить plan-mode install, прочитать план.
4. Тогда — `claude setup-token` → `sudo … --apply`.
Enablement всё равно за тихой неделей + A2 + owner sign-off; это green только на
attended-install, не на включение.

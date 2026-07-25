# agents-operator-qa v2.14 + broker-recovery runbook — diff-ревью: GO (design-complete)

Дата: 2026-07-20. Ревьюер: внешняя линия. Файлы читаны целиком (спец +
companion runbook). Нормативный дизайн завершён; единственный оставшийся
гейт — честный внешний (live `setup-token` smoke под ещё не созданным
child-UID), его без отдельного запуска сделать нельзя — согласен.

## Вердикт: GO на дизайн. P1/P2 нет. Все 4 моих P3 закрыты, у строгого пакета — тоже.

### Закрытия моих P3 (проверены по тексту)
- **P3-1 (граница concurrency)** — закрыто почти дословно (стр. 520–526):
  «механическая гарантия охватывает все управляемые role-spawn'ы, но не
  произвольный ручной `claude` владельца под другим UID или на другом
  хосте»; Phase A attended-preflight сканирует Claude-identity на host и
  отказывает при живом чужом CLI; runbook запрещает ручной Claude во
  время drain; неизвестный бинарь/другой host явно вынесены как
  операционная граница до внешнего account-lease. «§9 restored» больше
  не читается шире, чем есть.
- **P3-2 (EOF status-pipe)** — закрыто (шаг 12): EOF сам по себе больше
  НЕ «успех» — требует наблюдённой CLI-identity; `EOF без identity до
  terminal ⇒ orphaned_spawn_unknown`. Плюс введены доказательные
  `spawn_not_started` (syscall не случился, попытка не расходуется) и
  `cancelled_not_spawned` — конфляция «убит до exec» с «exec удался»
  устранена.
- **P3-3 (subscription-материал в child-HOME)** — закрыто сменой всей
  модели: keychain-less `setup-token` → root-owned secret 0400/O_NOFOLLOW
  → единственный env `CLAUDE_CODE_OAUTH_TOKEN`, остальные secret-env в
  denylist; token не в argv/history/receipt/log (только generation + auth
  enum). Механизм подтверждён на CLI 2.1.138 (empty HOME → oauth_token/
  firstParty без Keychain). Верно пойман реальный macOS-подвох: login
  Keychain недоступен non-login child-UID.
- **P3-4 (lstat vs execve)** — как в v2.13, честно подан детекцией;
  несущая гарантия — root-owned immutable путь.

### Корректность ключевых механик (проверено рассуждением)
- `setup-token`/`CLAUDE_CODE_OAUTH_TOKEN` — правильный headless
  subscription-auth примитив; live smoke (`auth status --json` +
  bounded `-p` под child-UID) как enablement-гейт, fail-closed без
  fallback на API-key/runner-UID — верно.
- 13-шаговый claim→exec: точка линеаризации = CAS token reserved→
  committed (шаг 10); финальный zero-euid barrier ВНУТРИ token-window
  (шаг 9), единственный host-admission исключает второй spawn между
  zero-proof и `posix_spawn`. Окно TOCTOU zero→spawn закрыто.
- Zero-proof на `pbi_uid==pbi_ruid==pbi_svuid==childUid` (не только
  euid) + finite `RLIMIT_NPROC` (fork-bomb не обгонит sweep, sweep
  bounded) + p95≤50ms hard gate — три верных усиления.
- Runbook: parted store+chain backup, commit-manifest публикуется
  последним, incomplete → quarantine, **snapshot никогда не укорачивает
  живую chain** (анти-rollback сохранён), destructive recovery требует
  operator-presence + revoke-evidence старого token + zero-overlap.
  Инварианты согласованы со spawn-FSM спеки.

## Остаточные P3 (не блокируют; на CR реализации)
1. **Сетевая граница egress не специфицирована.** child несёт свой
   subscription OAuth в env, а prompt-injected CLI имеет сетевой доступ
   (нужен для inference) — путь эксфильтрации собственного токена.
   Митигация ротацией/revoke есть, но раз v2.14 сделал token-handling
   центральным, стоит явной строкой зафиксировать: ограничен ли egress
   child'а до Anthropic-endpoint, или это принятый residual (как §5
   agent-team). Одна из двух формулировок.
2. **Live-smoke max-age vs revoke-между-smoke-и-use.** Token доказан
   живым в T, использован в T+maxAge; при revoke в промежутке `-p`
   падает на inference (fail-closed — ок), но стоит одной строкой
   назвать это принятым окном, чтобы не читалось как гарантия
   «доказан живым ⇒ жив на момент spawn».
3. Документ достиг 14 ревизий и ~1450 строк с историей §14a–§14n;
   активный контракт консолидирован (основной текст + §13 + runbook) —
   correctness не страдает, но при следующем касании стоит вынести
   §14* changelog-историю в отдельный файл, чтобы нормативная часть
   читалась без археологии.

## ⚠️ Индекс всё ещё заряжен (не изменилось с прошлого раунда)
Staged-откат по-прежнему в индексе: 20 файлов, удаляющих **три
задеплоенные фичи** — agents-m2m-read (миграция `0046`, включена флагом
на Render), catalog_risk_admission (`0047`) и feed_generated_offer, с
тестами. `HEAD`/`origin/master` их содержат (история цела), активной
rebase/merge нет. Любой коммит без явного pathspec в этом checkout
впечатает удаление задеплоенного в историю. До продолжения работы здесь
это надо либо расчистить (`git restore --staged --worktree` по 20
путям), либо синхронизироваться с сессией-источником и понять, почему
свежедеплоенное стирается — как намеренная операция это выглядит крайне
сомнительно. Сам не трогаю: чужая сессия, destructive, без вашей
отмашки.

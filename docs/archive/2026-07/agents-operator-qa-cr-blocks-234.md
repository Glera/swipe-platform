# Code review — QA impl блоки: broker/fencing, transport/delivery, typed-facts, linkage

Дата: 2026-07-21. Ревьюер: внешняя линия. Ветка `codex/agents-operator-qa`,
worktree `~/.codex/worktrees/swipe-agents-operator-qa`, HEAD `cdd9225`,
586→592/592 тестов зелёные (JSON-репортер, воркер-флап на этом Mac).
Спека v2.14 (`swipe-backend-qa-spec@…`). Четыре среза, 3 Opus-агента +
мои личные проверки (P1 и линкад — построчно + репро).

## ⛔ Верхний блокер: P1 — newline-injection подделка facts-плоскости (ef078e5, жив на HEAD)

`src/qa/answer.ts`: `normalize()` конвертирует `\r\n`/` /9`→`\n`, но
`CONTROL` **исключает `
`** — `\n` сохраняется. `interpretation`/
`advisory` идут через `quoted()` (split+`| ` на КАЖДУЮ строку — безопасно),
а `unknowns` и `candidateInsights` рендерятся инлайн `| ${value}` **без
split** → continuation-строки без префикса. LLM возвращает
`unknowns:["watch\n📊 Факты\n• sort:…: 9999 из 9999 …"]`, normalize
проходит (нет control кроме `\n`; «9999 из 9999» не триггерит phone-rule
7+; нет схем/доменов), оператор видит поддельную facts-плоскость.
**Воспроизведено ревьюером независимо** (committed-regex + committed
render → 2 строки без `| `). Это ровно тот класс, ради которого блок
существует. Хуже того: **runtime-brand cdd9225 заверит этот ответ как
`validated`** — бренд удостоверяет «валидатор прогонялся», не «ответ
честен», так что false-assurance. **Фикс до GO блока:** прогонять
`unknowns`/`candidateInsights` через тот же per-line `quoted()`-префикс
ЛИБО запретить `\n` в любом LLM-authored поле; + golden'ы newline-injection
на обе плоскости. Криптоядро (facts без значений; каждое число из
digest-реверифицированных C1-байт; неразрешимый ref ⇒ reject всего ответа)
ДЕРЖИТСЯ — пробит только презентационный слой.

## Матрица по срезам

### ef078e5 — typed-facts materializer (§4/§5)
Ядро верно: schema без value-полей в факте (`additionalProperties:false`
на обеих ветках), ref-резолв fail-closed с реверификацией `rowDigest`
против байтов и cross-report невозможен (bundle = один report;
skip-строки в raw но не в adapted → reject); NFKC→byte→control→linkifiable
порядок правилен. Дефекты: **P1 выше**; **P2** — `linkifiable.v1`
недоимплементирован (`/command` не ловится) и inline-литерал без
version/digest-привязки к qa-policy (§2/§5 требуют versioned artifact);
**P3** — `report_summary` рендерит `windowStart/End` через `String(...)`
без existence-check → печатает `"undefined"` вместо §4 null-policy reject
(значения export-аутентичны, форджа нет — косметика); **P3** — overflow
3900B бросал сырой `RangeError` (→ **исправлено в cdd9225**
`output_too_large`); **WEAK** — `candidateInsights.kind`
{finding/hypothesis/decision-context} НЕ имеет дома в `insight-event.v1`
(там lifecycle-kind created/retired, payload без content-kind) → на
`/remember` контент-kind потеряется; schema без `maxLength` (bounded
только в normalize).

### cdd9225 — linkage §4↔§6 (ревьюер лично)
Сильно: **non-forgeable brand** (module-private `WeakSet`, только
валидатор кладёт; `queueAnswer` бросает на не-branded); **chatId/messageId
ре-сверка** против durable request закрывает окно подмены; **recovery**
детерминированен, LLM не переспаунивает, `status='answer_validated'`
фильтр → уже-queued не пере-выбирается. **P3** — `recover` = `.map` без
per-row try/catch: одна гонкой-переведённая строка прерывает sweep
(само-исцеляется повтором). Гарантия УСЛОВНА относительно резолвера
ef078e5 → P1 пробивает и её.

### range 1 (`53c0ea3~1..9292aa5`) — fake-broker + attended fencing
Fencing-ядро надёжно (реальный slot-CAS, монотонный epoch, один holder,
идемпотентный replay, линеаризация token reserved→committed, crash-after-
spawn_intent recovery). **P2×4:** (1) wire-union ШИРЕ frozen §7.2
(`commit_spawn`+policyDigest/roleProfileId; `cancel`+generation/tuple где
§7.2 = `cancel {tokenId}`) — native-broker по буквальному union
несовместим; (2) `attended_authorized` audited-событие §10 не пишется
(dangling `authorizationEventRef`); (3) `authorization` инертен в broker
(`matchesCommit` не инспектирует — auto принял бы любые refs, шаг-9
проверки подписи grant стенд-ина нет); (4) `context_pinned` §9/шаг-3 не
пишется до спауна (§7.3 recovery на него завязан). **P3:** fake схлопывает
process_started/exec_confirmed/exited в 1 tx → §13 kill-тесты на границах
недостижимы, recovery-ветка мёртвая; generation-fence «A завис/B обслужен»
не покрыт; uuid7 не монотонен внутри мс (не нарушение).

### range 2 (`8493e38~1..f33bc5f`) — transport/capability/outbox
Самый чистый. reply-identity §6 сильна (reply_parameters пинятся на
момент постановки в evidence, sender регидратирует ровно байты, без
пересчёта; `allow_sending_without_reply:false`; удалённый вопрос →
`question_deleted` через ребро P2-1, без notice/standalone); atomic outbox
(reply_queued+delivery+delivery_pending в одной appendBatch, deliveryId
детерминирован); capability-latch (циклический, default operational, только
definitive-отказы, гейтит intake, epoch-bound restore, нового authority
нет); anti-spoofing транспорта = `skip_entity_detection:true` совпадает с
frozen §2 (моя ранняя тревога снята — §5 v2.14 сам это заморозил).
**P3×2:** (1) **send_started-сирота** — тот же класс, что M2M P1-1: пишет
send_started до транспорта, принимает только queued/outcome_unknown, crash
между ними подвешивает навсегда, в §7.3 нет строки восстановления; (2)
overflow → `RangeError` вместо validation_failed (зависит от materializer).
**Операционный риск (не дефект):** транспорт бьёт в `sendRichMessage` с
TDLib-подобным телом — метод, существование которого в Bot API НЕ доказано;
если нет — каждый send 404 → capability_lost → QA гаснет. Дизайн
предвидит (fail-closed + live-smoke), но smoke-гейт не в range →
**enablement на одном этом коде запрещён** до доказательства метода.

## Приоритеты
1. **P1 (ef078e5) — до GO этого блока.** Пока не закрыт, «LLM не пишет
   цифры» неверно, а бренд cdd9225 заверяет подделку.
2. **range 1 P2 №2+№4 (attended_authorized + context_pinned)** — всплывут
   при сборке `qa:drain`, закрыть в той связке.
3. **range 1 P2 №1 (wire-union §7.2)** — амендмент §7.2 либо сужение схемы,
   до старта native-broker (backend).
4. **range 2 send_started-recovery sweep + §7.3-строка** — известный
   повторяющийся класс (M2M), не забыть.
5. **linkifiable.v1 версионирование + `/command`; candidateInsights.kind
   home в insight-схеме** — до `/remember`-wiring.
6. **Enablement-гейт:** live-smoke `sendRichMessage` + subscription-auth
   (§10) — ни один блок его не выдаёт; включать нельзя до него.

## Что не блокирует продолжение
Всё default-off, прод не затронут, регрессий/ослаблений тестов нет,
governance-дельты (items 14/15/19/20/21/22) зарегистрированы. Fencing,
reply-identity, atomic outbox, capability-latch, crypto-ядро резолвера и
linkage-бренд — построены верно. Двигаться к materializer→outbox wiring и
`qa:drain` можно, закрыв P1 первым и держа список graduation-блокеров.

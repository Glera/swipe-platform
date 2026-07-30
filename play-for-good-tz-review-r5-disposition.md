# Disposition R5 (автономная петля codex exec, 30.07.2026) — петля остановлена

Раунд R5 (третий автономный, лимит петли; gpt-5.6-sol xhigh, явные
пины `-c model` / `-c model_reasoning_effort`). Сырой ответ целиком:
`play-for-good-tz-review-r5-raw.md`. Вердикт: не GO (4×P1 + 1×P2).
По протоколу петли — остановка и эскалация оператору; фиксы всех
находок механические (authority-решений не требуют) и внесены в v6.

| # | Finding | Disposition |
|---|---------|-------------|
| 1 | [P1] Freeze несовместим с защитным smoke: block мутирует `island_friendships.removed_at` и пишет `island_meta_events` (api_island_p2.py:281; api_island_moderation.py:214) | **Принято.** Обе таблицы выведены из freeze в allowlist с audit-правилами: friendships — только `removed_at` синхронно с block-актом; meta_events — только строки защитных актов (Stage 0 v6) |
| 2 | [P1] BIGSERIAL не даёт immutable snapshot (меньший seq может закоммититься позже cursor'а); у allocations нет cutoff | **Принято.** Все mission-writers, включая pool-ledger и allocations, — под единым runtime-lock (сериализация присвоения seq и commit); снапшот фиксирует пару cutoff'ов `pool_cursor` + `alloc_cutoff` (у allocations свой монотонный alloc_seq); пересчёт по паре байт-идентичен (Stage 1 v6) |
| 3 | [P1] Предусловие весов не замкнуто: register → крупные веса → ready без ревалидации | **Принято.** Ревалидация на `ready` и `activate`; активация версии весов — под тем же runtime-lock (Stage 1 v6) |
| 4 | [P1] Policy-пин в JSON не enforceable (нет UNIQUE/FK/CHECK) | **Принято.** UNIQUE `(policy_version, policy_digest)` + digest-CHECK + jsonb-CHECK; пин контракта — колонками с composite-FK; CAS-сверка пары при UNLOCKED (Stage 1 v6) |
| 5 | [P2] Read API не обязывал возвращать resolved policy document — «в один тап» не гарантирован | **Принято.** Read API включает resolved `mission_funding_policies.document` (version+digest+документ) в «контракт в один тап» (Stage 1 v6) |

Динамика петли: R3 4 находки → R4 3 → R5 5 (но всё более тонкие:
от неверной классификации роутов к гонкам commit-порядка). Следующий
шаг — по решению оператора: финальная перепроверка v6 в его чат-треде
Codex (накопленный контекст R1–R2) и/или четвёртый автономный раунд.

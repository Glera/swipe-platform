# Disposition R4 (автономная петля codex exec, 30.07.2026)

Раунд R4 (второй автономный; gpt-5.6-sol, effort xhigh — заголовок в
raw). Сырой ответ целиком: `play-for-good-tz-review-r4-raw.md`.

| # | Finding | Disposition |
|---|---------|-------------|
| 1 | [P1] Контракт кейса не фиксирует денежную политику (funding source, eligible pool, формула, snapshot/cursor остаются глобальным текстом) — digest не доказывает политику расчёта | **Принято.** Новая `mission_funding_policies` (immutable versioned, образец 0018): формула, правило cursor'а, определение eligible pool/источников, округление; контракт пинит `(policy_version, policy_digest)` и включает пин в contract_digest; UNLOCKED-receipt пинит и контракт, и политику (Stage 1 v5) |
| 2 | [P1] token_goal-предусловие проверяется только при регистрации против текущих reward-функций; смена номиналов может дать вклад больше максимума и >2 кейсов | **Принято.** Новая `mission_contribution_weights` (versioned, по требованию gap-карты); contribution пинит weights_version; предусловие двустороннее: register-contract против активных весов И регистрация новой версии весов против token_goal всех READY/ACTIVE; runtime-нарушение → retryable-отказ, каскад в v0 запрещён (Stage 1 v5) |
| 3 | [P2] Block на самом деле в `api_island_p2.py:250` (не api_island_social); smoke «весь manifest → 404» противоречит живым защитным роутам | **Принято.** Факт-состояние и контур (c) исправлены; route manifest получил колонку «ожидаемый статус после Этапа 0», smoke проверяется по ней (Stage 0 v5) |

Authority-эскалаций нет. R5 — последний автономный раунд по
заявленному лимиту петли (3); при не-GO — эскалация оператору.

# Disposition R3 (автономная петля codex exec, 30.07.2026)

Раунд: R3, первый автономный (bundled codex-cli 0.146.0-alpha.3.1,
`codex exec -s read-only`, промпт пинит SHA `4738103`; попытка
`codex review --commit <sha> - < prompt` отклонена CLI — в этой версии
`--commit` взаимоисключён с кастомным промптом; отклонение от
предложенного протокола зафиксировано). Сырой ответ целиком:
`play-for-good-tz-review-r3-raw.md` (финальный вердикт — в конце).

| # | Finding | Disposition |
|---|---------|-------------|
| 1 | [P1] artifact-url отнесён к legacy, хотя это closed-delivery resolver (`api_island_social.py:159`); LEGACY_SURFACE=false требовал бы 404 при smoke, требующем signed GET | **Принято.** Контур (b) теперь явно включает artifact-url; факт-состояние и smoke исправлены (Stage 0 v4) |
| 2 | [P1] Потерян пользовательский block: report сохранён, `/island/friends/{user_id}/block` — нет; `island_friend_blocks` во freeze без allowlist | **Принято.** Контур (c) = report И block; `island_friend_blocks` выведен из freeze-списка в allowlist защитных writes с audit-receipts (Stage 0 v4) |
| 3 | [P1] UNIQUE(case_id, kind) допускает READY на v1 / UNLOCKED на v3 — версия не закреплена вдоль цепочки | **Принято.** Новая `mission_case_bindings` (case_id PK ↔ ровно одна contract_version, создаётся при ready, новая версия = новый case_id); все таблицы composite-FK на bindings — расхождение исключено схемой; негативный тест добавлен (Stage 1 v4) |
| 4 | [P2] `pool_cursor` невоспроизводим: у ledger нет монотонного порядка и правила eligible-at-cursor | **Принято.** `ledger.seq` BIGSERIAL, строки immutable и вставляются только settled; cursor = max seq на снапшоте; eligible = seq ≤ cursor; поздние строки в прошлый снапшот не входят by construction (Stage 1 v4) |

Authority-эскалаций нет: ни одна находка не требует правок VISION,
прод-флагов или денег. Следующий раунд R4 — той же петлёй по новому
коммиту.

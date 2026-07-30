# Disposition R6 — чат-раунд (перепроверка в контексте оператора, 30.07.2026)

Раунд R6: перепроверка v6 в чат-треде оператора (накопленный контекст
R1–R2) после остановки автономной петли (R3–R5) на лимите. Вердикт:
не GO, но «продуктового дрейфа относительно VISION и R1–R2 нет; все 12
автономных findings честно отражены и внесены; Stage 0 после
P2-уточнения готов к реализации». Findings: 3×P1 (Stage 1) + 2×P2.

| # | Finding | Disposition |
|---|---------|-------------|
| 1 | [P1] Нет server-owned authority активной версии weights; «активация» упомянута, но не определена; сценарий register→крупные веса→ready без ревалидации | **Принято.** Runtime-пин `active_weights_version+digest` в `mission_runtime`; явная CLI `activate-weights` под runtime-lock с ревалидацией всех READY/ACTIVE; contribution пинит версию из runtime под тем же lock'ом; bootstrap-команды `register-funding-policy`/`register-weights`/`activate-weights`; DB-preflight требует активной policy и весов (Stage 1 v7) |
| 2 | [P1] `alloc_cutoff` заявлен текстом, но отсутствует в схеме allocation и replay-тесте | **Принято.** `alloc_seq` монотонный; `pool_cursor`+`alloc_cutoff` — typed-колонки gift_additional (CHECK, входят в digest); replay-тест по паре, включая поздний READY-reserve (Stage 1 v7) |
| 3 | [P1] Read API не отдавал последний UNLOCKED — игрок, не инициировавший пересечение, терял первую церемонию | **Принято.** `latest UNLOCKED` и `latest FULFILLED` — независимо, каждый с event id + receipt (Stage 1 v7) |
| 4 | [P2] «Каждый apply = case-event» невыполнимо для register/seed | **Принято.** Каждый apply = typed intervention receipt; case-event пишут только lifecycle-команды (Stage 1 v7) |
| 5 | [P2] Acceptance Stage 0 «queued jobs заморожены» противоречил drain | **Принято.** «Очередь полностью drained до выключения runners; после cutoff job-таблицы не меняются» (Stage 0 v7) |

Итог: Stage 0 v7 — ГОТОВ К РЕАЛИЗАЦИИ (ждёт «го» оператора). Stage 1
v7 — фиксы R6 внесены, финальное подтверждение — короткой проверкой
трёх точечных фиксов (чат или CLI, по решению оператора).

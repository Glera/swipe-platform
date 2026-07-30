# Disposition R7 — чат-раунд (30.07.2026): Stage 0 GO, Stage 1 → v8

Вердикт R7: **Stage 0 v7 — GO к реализации** (по явной команде
оператора); Stage 1 — 1×P1 + 1×P2, после фикса достаточно
diff-проверки двух мест. Продуктового дрейфа нет.

| # | Finding | Disposition |
|---|---------|-------------|
| 1 | [P1] Weights-authority не enforceable в БД: нет PK/UNIQUE/digest-CHECK, runtime-пара без composite-FK — может указывать на несуществующую версию или чужой digest | **Принято.** Симметрично policies: PK `weights_version`, `weights_digest` hex-CHECK, UNIQUE `(version, digest)`; runtime-пара nullable только вместе + composite-FK; contribution пинит пару composite-FK'ом, receipt содержит обе; негативный PG-тест mismatched → FK-отказ (Stage 1 v8) |
| 2 | [P2] «Активная funding policy» не существует в модели и не нужна — контракт пинит свою immutable policy | **Принято.** Слово «активная» удалено; bootstrap: policy регистрируется до контрактов; DB-preflight проверяет разрешимость policy-пинов ACTIVE/READY кейсов по composite-FK (Stage 1 v8) |

Решение оператора: **реализацию отдаём Codex** (рокировка ролей:
Codex — implementer, Claude — reviewer; author ≠ reviewer сохранён).
Порядок: Stage 0 (П1→П5 c receipts на каждый шаг) → прод-проверка →
diff-проверка Stage 1 v8 → реализация Stage 1.

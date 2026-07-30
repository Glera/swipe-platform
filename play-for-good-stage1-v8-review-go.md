# Stage 1 v8 — diff-review GO

Дата: 30.07.2026.  
Author спецификации: Claude.  
Reviewer: Codex.  
Exact reviewed commit: `4fd56cf0cdce7fb46674a822b2974949b8da709b`.  
Scope: только два исправления R7, как предписано в
`play-for-good-tz-review-r7-disposition.md`.

Вердикт: **GO Stage 1 spec v8**, findings: 0.

## Проверено

1. `mission_contribution_weights` задаёт PK `weights_version`,
   64-hex CHECK для `weights_digest` и UNIQUE-пару
   `(weights_version, weights_digest)`. `mission_runtime` и
   `mission_contributions` ссылаются на exact пару composite-FK;
   предусмотрен негативный PG-тест чужого digest для существующей
   версии.
2. Глобальной «активной funding policy» в модели нет. Funding policy
   регистрируется до case contract; каждый контракт пинит свою
   immutable пару version+digest, а preflight проверяет разрешимость
   policy-пинов ACTIVE/READY кейсов. Активируется только версия весов.

GO подтверждает инженерную спецификацию, но **не снимает предусловие
реализации**: Stage 1 нельзя начинать до чистого и полностью принятого
Island-off baseline Stage 0.

Роль: независимый ревьюер (author ≠ reviewer), режим только-чтение.

Ревьюируемая идентичность: коммит
f86c489523977dcca8d3959e73e9bcfb9f556c9e. Сначала выполни
`git rev-parse HEAD` и убедись, что HEAD равен этому SHA (untracked
review-файлы допустимы); если не равен — остановись и сообщи об этом
вместо ревью.

Проревьюй два файла этого коммита:
- play-for-good-stage0-island-off-tz.md (v5)
- play-for-good-stage1-mission-slice-tz.md (v5)

Это раунд R5 после твоих findings R1–R4. Проверь прежде всего внесение
findings R4:
(1) mission_funding_policies: денежная политика версионируется,
    контракт пинит (policy_version, policy_digest), UNLOCKED-receipt
    пинит контракт и политику;
(2) mission_contribution_weights: contribution пинит weights_version,
    предусловие token_goal двустороннее (register-contract и
    регистрация новой версии весов), runtime-нарушение → retryable,
    каскад v0 запрещён;
(3) block в api_island_p2.py:250, route manifest с колонкой ожидаемых
    статусов, smoke по ней.
Затем: контрактная целостность против VISION.md (v3.0.1) и
play-for-good-gap-map-v1.md того же коммита; новые противоречия,
внесённые правками v5.

Формат ответа: findings списком с [P1]/[P2]/[P3] и точными
файлами/строками, либо явный вердикт "GO" первым словом, если блокеров
нет. Только ревью — никаких правок файлов.

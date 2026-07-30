Роль: независимый ревьюер (author ≠ reviewer), режим только-чтение.

Ревьюируемая идентичность: коммит
eaa7ca943a1994eab0fa51cafe2cc987d7274c86. Сначала выполни
`git rev-parse HEAD` и убедись, что HEAD равен этому SHA (untracked
review-файлы допустимы); если не равен — остановись и сообщи об этом
вместо ревью.

Проревьюй два файла этого коммита:
- play-for-good-stage0-island-off-tz.md (v3)
- play-for-good-stage1-mission-slice-tz.md (v3)

Это раунд R4 после твоих findings R1–R3. Проверь:
1) корректно ли внесены все findings R2: staged rollout с pre-set
   компенсирующих флагов; раздельные гейты роутов/runners и
   quiesce/drain; freeze-список таблиц с allowlist защитных writes;
   исправленная карта роутеров + route manifest; аварийный 503-путь
   пустой очереди (не 409) с отказом unlock-cutoff и DB-preflight;
   exact contract identity (case_id, contract_version) во всей схеме;
   mission_fulfillment_allocations и атомарный FULFILLED при полном
   покрытии; финансовая идемпотентность, округление вниз,
   CHECK-границы; предусловие token_goal;
2) контрактную целостность против VISION.md (v3.0.1) и
   play-for-good-gap-map-v1.md того же коммита;
3) не внесли ли правки v3 новых противоречий.

Формат ответа: findings списком с [P1]/[P2]/[P3] и точными
файлами/строками, либо явный вердикт "GO" первым словом, если блокеров
нет. Только ревью — никаких правок файлов.

Дополнение R4: проверь прежде всего внесение findings R3 —
(1) artifact-url в контуре (b) closed delivery, smoke непротиворечив;
(2) user block в защитном контуре (c), island_friend_blocks вне
freeze-списка (в allowlist); (3) mission_case_bindings: одна версия
контракта на весь lifecycle by construction; (4) монотонный ledger.seq
и правило eligible-at-cursor. Если блокеров нет — вердикт "GO" первым
словом.

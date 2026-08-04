# R1-A candidate-v4 publication — withdrawn authority request

**Статус:** WITHDRAWN / INVALIDATED · dispatch запрещён

Этот пакет пинил backend
`1b145d441378b884e17938632378542ac3bf2069` и
`expectedPredecessor=0072_mission_ops_receipts`. Он был подготовлен до принятия
patch A и до восстановления Gate C0 в обязательном маршруте.

Пакет нельзя авторизовать или исполнять, потому что:

1. Exact backend source ещё не содержит patch A, принимающий пиннутый production
   start `0070_published_test_delivery` под advisory lock с одной release receipt.
2. Gate C0 ещё не завершён и source-freeze merge ещё не откачен.
3. Финальный post-revert backend master SHA и новая release-policy identity пока
   неизвестны.

Ни прежний advisory self-check, ни review этой tombstone-записи не возвращают
authority. После patch A, terminal Gate C0 и полного freeze revert создаётся
новый файл запроса с новым именем, exact финальным backend SHA, workflow digest,
manifest inputs и самостоятельным независимым review.

Явно запрещены по этому файлу: workflow dispatch/rerun, image publication,
source write/merge, GitHub-environment или Render mutation, deploy, migration,
rehearsal, cutover и Stage 1 runtime action.

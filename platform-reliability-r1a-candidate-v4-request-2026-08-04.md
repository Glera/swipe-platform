# R1-A candidate-v4 publication — withdrawn authority request

**Статус:** WITHDRAWN / INVALIDATED · dispatch запрещён

Эта подготовительная редакция пинит post-patch-A backend
`0e9e940a2a762f0e35f93c3e35f3afcfea6baaa4` и
`expectedPredecessor=0072_mission_ops_receipts`. Он был подготовлен до принятия
Gate C0 в обязательном маршруте и не является финальным candidate packet.

Пакет нельзя авторизовать или исполнять, потому что:

1. Exact backend source содержит patch A, но является только pre-freeze master
   для перепривязанного PR #54, а не финальным post-C0 source.
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

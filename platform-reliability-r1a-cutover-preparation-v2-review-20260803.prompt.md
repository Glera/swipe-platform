# Independent review — R1-A candidate-v2 pre-cutover preparation

Review exact meta commit
`80768ed4bb7b23e5404761b692f62413ed89cf7f`. You have no tools or web.
Return `GO` as the first word only if no P1/P2 remains; otherwise return
`NO-GO` and list every P1/P2 with exact file/field. Keep the complete answer
under 700 words; P3 separately.

Confirm:

1. The v2 request supersedes the blocked successor-v1 request and binds exact
   PR #51/head, accepted candidate-v2, retained baseline and exact payload
   hashes without allowing rebuild/redispatch.
2. Allowed mutations are only one temporary account-wide Render key, GET-only
   capture, one exact `alembic current` job, one GitHub environment with one
   branch policy, one secret and six variables, bounded readback/receipts.
3. Job creation is not contradicted by the persistent-service-mutation ban;
   merge, workflow dispatch, service source/image/config/deploy, migration,
   image publication and Stage 1 remain forbidden.
4. All preflight/stop/cleanup rules fail closed, protect the secret, treat old
   provider values as immutable comparison sentinels and delete/revoke on
   failure or the 60-minute deadline.
5. A successful preparation still cannot authorize merge or cutover; a fresh
   final packet and separate operator GO remain mandatory.
6. JSON, Markdown, runbook and payload have no material cross-file conflict.

A GO accepts only presentation of this request to the operator. It authorizes
no key, environment, Render job, merge, workflow dispatch or deploy.

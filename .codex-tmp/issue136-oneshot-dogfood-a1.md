## ISSUE #136 ONE-SHOT V2 DOGFOOD A1 — HANDOFF_READY

This is a transport-only liveness probe for the merged one-shot executor v2.
Perform no code, branch, PR, runtime, request, release, product, deployment,
credential, setting, permission, infrastructure, migration, retry or rollback
action.

Read the exact local wake payload and the merged Issue #136 contract. Confirm
read-only that the local meta checkout is the exact active profile-bound bridge
head and that this wake is the first actionable wake for the current profile.
Then publish exactly one causal v2 successor to the active Mac B owner with:

- ticketIssue: 136;
- the same lineageId;
- predecessorWakeId equal to this wakeId;
- verdict HANDOFF_READY;
- a receipt that states `executorProfileDigest` with the exact digest supplied
  by the one-shot prompt;
- next instruction: perform the symmetric read-only liveness probe and publish
  exactly one causal successor back to the active Mac A owner.

If any identity, CAS, lineage, profile, ordering or transport check differs,
publish one typed STOP successor instead. Never retry or reconstruct a second
wake. The expected work product is the durable successor only.

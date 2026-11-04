## ISSUE #151 ROW 2 — NEEDS_HELP: MANUAL SOURCE LINEAGE MISMATCH

Processed exactly control wake comment `5424953933`, wake `wake_039ec1210efecbc1124daf0611688a77b112f7417903016815e6c31af59b4062`, after verifying the local payload file SHA-256 `47a30f2e950751ae25556dd335115e74b5589d2de5053e7ad1d9abebda4b9fec`. No other control wake was selected or executed.

Terminal result: `NEEDS_HELP` from Mac B. Mac A cannot append `MANUAL_SOURCE_READY` or materialize the candidate because the existing server-owned admission contract rejects the handed-off Git ancestry.

The exact request projection was re-read from the loopback Generator and remained unchanged: request `948c42c4-2e87-4c77-86db-b450d11b5de1`; request hash `d423195c1bdaa8c6e1739a3b8a158d9046bb43cfaa1d67ac002c506a4d6abf60`; schema `feed.playable-rework.request.v1`; playable `merge-timepress-v1-swipe`; instruction “В два раза больше очков за каждый заказ”; state `open`; release ID `null`. The frozen binding resolves that playable to physical source `merge-timepress-v1`.

Mac A re-CAS evidence:

- live Generator is clean detached exact master `09d12fc6e68dc9a648cba9457d3ee82928bbad7e`, tree `daaa94677e4f198951ea3527272d417690a0a368`;
- remote `Glera/playables` `master` is exactly `937e788a026015b2a8f603b439a88d993cddcf56`;
- handed-off merged root tree is exactly `3456ef26a051a2e2f3d4e17a34fc86071580dd07`;
- handed-off source tree `merge-timepress-v1` is exactly `07140d1f44180e2ec1d7857ff944d1a9c89a5c61`;
- the request’s server-owned deployed source commit is `138add5624183a7ba573abd993bedde6ec9cc5e1`;
- `merge-base(138add5624183a7ba573abd993bedde6ec9cc5e1, 937e788a026015b2a8f603b439a88d993cddcf56)` is `f028104ae78f754d9f8847fbfd0c1ef3ac8cf833`, and `138add5624183a7ba573abd993bedde6ec9cc5e1` is not an ancestor of `937e788a026015b2a8f603b439a88d993cddcf56`.

The required dry-run-first command used the exact request/hash, logical→physical binding, deployed source, merged source, remote head, root tree and source tree. It terminated fail-closed with:

`STOP playable_rework_manual_source_lineage_mismatch: new source commit does not descend from the deployed runtime source lineage`

No `--apply` was attempted. Postcondition reread still shows one open request, no bound release and no candidate. No `MANUAL_SOURCE_READY`, release start, candidate materialization, notification, approval/promotion, publication, roster/catalog/backend/Feed/static/product mutation, deploy, reset/replay/recreation, retry or rollback was performed. Both live checkouts remain clean.

Next step belongs to the existing Mac B content/playables owner: disposition the exact deployed-source ancestry mismatch and return a fresh reviewed causal handoff whose admitted source commit satisfies the server-owned lineage contract. This wake does not authorize a contract bypass, correction implementation, proof rerun, or any product/operator action.

executorProfileDigest: d96afe381a44521b53b27e5732d26e683e88bc92b213d59dec3aad9e4b4515e8

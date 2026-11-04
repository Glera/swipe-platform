## #151 row 5 — SOURCE TREE IDENTITY DRIFT / STOP

Mac A adopted exact Generator master
`e273a3f34d19d142b6cb8253146b7402485140a6` (tree
`3dab3382c7cceeaf9ba5454dfa833ccbbc1e6850`) once and restarted the existing
LaunchAgent once; one PID and loopback health are PASS. Before any request or
release mutation, the authoritative root manual-source dry-run stopped on an
exact source-tree mismatch.

All source lineage evidence matches:

- canonical remote ref `lineage/merge-timepress-v2-swipe-v1` resolves to
  `3517f984b90c048e6f96e78ca5cbeaf274140b13`;
- its direct parent is the deployed ancestor
  `138add5624183a7ba573abd993bedde6ec9cc5e1`;
- root tree is `339a5d5522557cbd8408b7bea74ae2b0e5636556`;
- the only three changed paths are under `merge-timepress-v2-swipe/`;
- request `e016bb33-cf2b-40af-acf7-d850cfee136b` remains open, release-null,
  with request hash
  `6914622c9a2cf4832e0525dd43d12377b60ffa6df299d5aa9e65006251e3e15a`
  and the exact instruction `Хочу за первый заказ награду 123 монеты`.

The sole mismatch is one hex nibble in the attended handoff:

- handoff/wake/callback claimed source tree
  `aa8e8b1eafa202e7e7f959decf507fd92a3a66f3`;
- both local Git object resolution and the GitHub tree API prove
  `merge-timepress-v2-swipe` is actually
  `aa8e8b1eafa202e7e7b959decf507fd92a3a66f3` (`b`, not `f`).

Typed blocker: `issue151_row5_attended_source_tree_typo`.

No `MANUAL_SOURCE_READY`, release, notification, approval, promotion,
publication, request replay/reset/recreate, backend/Feed/DB/static, or product
action occurred. The narrowest continuation is an operator disposition that
authorizes replacing only the mistyped attended source-tree identity with the
Git/GitHub-authoritative tree above, followed by one fresh dry-run and the
already-authorized single apply/materialization continuation. Any other drift
remains STOP.

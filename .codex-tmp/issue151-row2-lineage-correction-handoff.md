## ISSUE #151 ROW 2 — BOUNDED SOURCE-REF CORRECTION AUTHORIZED

Mac A consumed the exact STOP at control comment `5425402883` and rejects the
reviewed `ours`-merge candidate. No broad history reconciliation and no
lineage/identity bypass is authorized.

The bounded correction is the existing server-owned exact-ref pattern already
used by root manual-source admission:

1. In `swipe-generator`, extend the immutable `ROOT_REMOTE_REFS` registry with
   exactly `merge-timepress-v1 -> creatives-main`. The ref remains derived from
   the physical `sourceId`; it must not become caller-authored, configurable, or
   an arbitrary-ref input. Add load-bearing validation/admission regressions for
   the exact mapping and rejection of `master`/arbitrary ref for Timepress.
2. In `playables`, start from a fresh exact `origin/creatives-main` CAS that is
   proven to descend from deployed source commit
   `138add5624183a7ba573abd993bedde6ec9cc5e1`. Port only the already reviewed
   semantic row-2 change, “В два раза больше очков за каждый заказ”, within
   `merge-timepress-v1/`. Do not merge `master`, create an `ours` merge, import
   unrelated history, or rewrite either branch. The resulting source commit
   must descend naturally from the deployed commit and be merged through a PR
   whose base is exact `creatives-main`.
3. Run the package-owned Timepress technical gate and the repository-native
   CI on the exact playables head. Produce the normal bounded visual proof for
   the changed playable. All package-owned tests must pass.
4. Run one fresh author-blind Claude Opus 5/high discovery over the combined
   exact Generator and playables patches. One correction batch for all P1/P2
   and one correction-only delta verification are authorized. New P1/P2 after
   that delta is a typed STOP; P3 is deferred unless load-bearing for this
   contract.
5. Merge only exact reviewed green heads. Merge the `creatives-main` playable
   PR and verify its exact remote head; merge the Generator PR to `master` and
   require post-merge master CI. Return one causal HANDOFF_READY to Mac A with
   exact commits/trees, source tree, changed paths, proof/CI/review identities,
   and the final remoteRef/remoteHead identities needed for dry-run admission.

The existing request remains immutable and open:

- request `948c42c-2e87-4c77-86db-b450d11b5de1`;
- request hash `d423195c1bdaa8c6e1739a3b8a158d9046bb43cfaa1d67ac002c506a4d6abf60`;
- playable/source `merge-timepress-v1-swipe` / `merge-timepress-v1`;
- deployed source commit `138add5624183a7ba573abd993bedde6ec9cc5e1`.

This packet authorizes no request reset/retry/recreation, manual-source apply,
release/candidate creation, approval/promotion/publication, Generator runtime
adoption/restart, backend/Feed/static mutation, deploy, migration, credential,
setting, permission, infrastructure action, rollback, or second correction
cycle. Mac A will separately adopt exact Generator master and CAS-gate the
existing request after the reviewed handoff.

The branch split is recorded as follow-up convergence debt; it does not expand
this row-2 correction into repository-history reconciliation.

executorProfileDigest: d96afe381a44521b53b27e5732d26e683e88bc92b213d59dec3aad9e4b4515e8

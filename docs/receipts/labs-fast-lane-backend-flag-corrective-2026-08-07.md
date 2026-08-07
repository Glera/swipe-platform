# Labs Fast Lane — backend flag corrective

Status: **INDEPENDENT REVIEW GO, P1/P2 none; ready for explicit operator GO.
No production action is authorized by this document alone.**

Authority remains the enabling packet
`docs/receipts/labs-fast-lane-enabling-deploy-packet-2026-08-06.md`, SHA-256
`9db293d7099ad67c1d8ee47c460ce06218349d18bbfec25ba7139f46dadc1b89`.
This corrective closes one omitted enabling action discovered by the first
Telegram update-dogfood; it does not expand the recurring release path.

## 1. Observed failure

The exact operator saw **Доработать механику**, submitted a real instruction
from Telegram, and received the generic client message **Не удалось сохранить
задачу**. No rework request was created.

Direct evidence after the failure:

- production OpenAPI contains neither `/api/operator-playable-reworks` nor
  `/api/admin/operator-playable-reworks` nor the server-owned apply path
  `/api/feed/playable-releases/apply`;
- the same OpenAPI document does contain `/api/operator-level-flags` and
  `/api/admin/operator-level-flags`, proving the sibling player and Lab gate
  chains are live before the missing child flag is enabled;
- local Labs reports `enabled=true`, `reworkAvailable=true`, zero releases and
  `playableReworks=[]`;
- the local service log records
  `playable rework projection failed: operator_flags_lab_response_invalid`;
- production remains healthy on deploy `dep-d9qmm8cs728c73a5lusg`, image
  `sha256:fdd5bab35a5b8892caf47d3f9a5e66f36dff21543fc210f6997321d265e0d0a6`,
  manifest SHA-256
  `36579743f06b2df0690a690a30e8d51bce8732805ff3b8907887c39ca00429a0`;
- the database remains at `0074_feed_playable_release_scope`;
- the temporary Render key and GitHub `RENDER_API_KEY` secret are absent.

The backend mounts each missing router behind its already-live sibling chain
and the additional `settings.enable_feed_playable_release` child gate. The
child setting defaults false.
Reviewed backend source and `render.yaml` already contain the feature and the
literal intended value `ENABLE_FEED_PLAYABLE_RELEASE=true`; the image-backed
cutover changed image/service source but did not apply at least this newly
added Blueprint environment value. This is a one-time enabling omission, not a
content-release failure.

## 2. Bounded corrective action

Operator-only action in the Render dashboard for service
`srv-d95r3bfavr4c73aqsi4g`:

1. Before changing anything, confirm the current live deploy is
   `dep-d9qmm8cs728c73a5lusg`, the service is image-backed, and the same env
   page shows `ENABLE_CATALOG_LAB_AUTH=true`,
   `ENABLE_OPERATOR_LEVEL_FLAGS=true` and
   `ENABLE_OPERATOR_LEVEL_FLAGS_LAB=true`. STOP on any mismatch; the public
   sibling OpenAPI routes above are a second, independent check of those
   chains.
2. Confirm `PLATFORM_RELEASE_OPERATION` is `deploy` or absent, and do not
   change the existing `PLATFORM_RELEASE_MANIFEST_B64`,
   `PLATFORM_RELEASE_MANIFEST_SHA256`, `PLATFORM_DEPLOY_IDENTITY` or
   `PLATFORM_DATABASE_IDENTITY` values. STOP if the operation is another value
   or any required release-manifest value is absent.
3. Add or change exactly one non-secret environment variable:
   `ENABLE_FEED_PLAYABLE_RELEASE=true`.
4. Save the environment change once, allowing Render to create at most one
   deploy of the service's already pinned image.
5. Do not change any other variable, image, source, Blueprint, hook, database,
   GitHub environment, mapping, roster, or feature flag.

No Render API key, GitHub secret, workflow dispatch, image publication, source
merge, manual migration, or retry belongs to this corrective.

## 3. Acceptance and STOP

PASS requires all of the following direct observations:

- exactly one resulting deploy reaches live; on failure STOP without retry;
- live image digest remains
  `sha256:fdd5bab35a5b8892caf47d3f9a5e66f36dff21543fc210f6997321d265e0d0a6`;
- public health remains HTTP 200 / `ok=true`;
- database revision remains `0074_feed_playable_release_scope`;
- production OpenAPI now contains both rework paths
  `/api/operator-playable-reworks` and
  `/api/admin/operator-playable-reworks`, plus the expected server-owned apply
  path `/api/feed/playable-releases/apply`. The third route is inert without a
  separately authorized, release-bound `feed.playable-release:write` grant;
- local Labs projection returns a valid empty list instead of
  `operator_flags_lab_response_invalid`;
- no mapping, roster activation, feed playable-release receipt, or rework row
  is created merely by enabling the flag. The existing platform preDeploy may
  replay its committed platform release receipt (or append one exact
  append-only platform receipt if the deploy identity is new); that is expected
  infrastructure evidence, not a content mutation.

STOP and report literal state if the image digest changes, more than one deploy
is created, health fails, the database revision changes, another environment
variable changes, or any of the three expected routes remains absent after a
live deploy. If Save creates no deploy, STOP without a second Save/retry and
report the literal dashboard state.

## 4. Rollback

If the deploy fails to become live after the change, or the new routes are
unhealthy after it becomes live, the operator sets only
`ENABLE_FEED_PLAYABLE_RELEASE=false` and saves once. That restores physical
route absence while retaining code/schema. Rollback is a separate production
mutation and requires a new operator decision unless the original corrective
GO explicitly pre-authorizes it for either stated failure condition.

## 5. Resume point

After PASS, an in-session retry on the same mounted card replays the exact
pending request. After a TMA reload or occurrence change, the operator re-enters
the instruction and receives a fresh mutation ID; the failed first attempt
created no row, so that cannot duplicate server state. Labs then claims the
request and prepares the update; publication still requires one exact Telegram
approval. The recurring content path contains no Render step.

## 6. Independent review

The first independent read-only review used Claude Opus 5 via the subscription
CLI against meta `f81a549` and exact backend/generator/feed sources. Verdict:
**GO with no P1 and two P2 pre-save checks**. A first delta review against
`c2a678f` verified all original closures, then returned one new P2 because the
acceptance omitted the third child route. The dispositions above:

- prove both sibling gate chains from the same production OpenAPI and require
  their env values on the edit page;
- require deploy/unset release operation and preserve all existing manifest,
  deploy and database identities;
- describe the expected platform preDeploy receipt write precisely;
- broaden rollback to cover a deploy that never becomes live;
- correct the in-memory-only retry claim.
- expect `/api/feed/playable-releases/apply` alongside both rework routes and
  state explicitly that its write grant is separate and release-bound.

The review/disposition receipt is
`docs/receipts/labs-fast-lane-backend-flag-corrective-review-2026-08-07.md`.
The final micro-delta review against exact meta `18b4145` returned **GO,
P1/P2 none** and verified all-three-route enumeration, separate release-bound
write authority, the parent-flag prechecks and the zero-deploy STOP branch.

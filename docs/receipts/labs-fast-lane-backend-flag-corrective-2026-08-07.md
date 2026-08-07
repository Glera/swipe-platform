# Labs Fast Lane — backend flag corrective

Status: **DRAFT FOR INDEPENDENT REVIEW. No production action is authorized by
this document.**

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
  `/api/admin/operator-playable-reworks`;
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

The backend mounts both missing routers only when
`settings.enable_feed_playable_release` is true. The setting defaults false.
Reviewed backend source and `render.yaml` already contain the feature and the
literal intended value `ENABLE_FEED_PLAYABLE_RELEASE=true`; the image-backed
cutover changed image/service source but did not apply Blueprint environment
values. This is a one-time enabling omission, not a content-release failure.

## 2. Bounded corrective action

Operator-only action in the Render dashboard for service
`srv-d95r3bfavr4c73aqsi4g`:

1. Before changing anything, confirm the current live deploy is
   `dep-d9qmm8cs728c73a5lusg` and the service is image-backed.
2. Add or change exactly one non-secret environment variable:
   `ENABLE_FEED_PLAYABLE_RELEASE=true`.
3. Save the environment change once, allowing Render to create at most one
   deploy of the service's already pinned image.
4. Do not change any other variable, image, source, Blueprint, hook, database,
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
- production OpenAPI now contains exactly the player rework path
  `/api/operator-playable-reworks` and Lab path
  `/api/admin/operator-playable-reworks`;
- local Labs projection returns a valid empty list instead of
  `operator_flags_lab_response_invalid`;
- no mapping, roster activation, playable-release receipt, or rework row is
  created merely by enabling the flag.

STOP and report literal state if the image digest changes, more than one deploy
is created, health fails, the database revision changes, another environment
variable changes, or either route remains absent after a live deploy.

## 4. Rollback

If the new routes themselves are unhealthy after the one deploy, the operator
sets only `ENABLE_FEED_PLAYABLE_RELEASE=false` and saves once. That restores
physical route absence while retaining code/schema. Rollback is a separate
production mutation and requires a new operator decision unless the original
corrective GO explicitly pre-authorizes it for the stated failure condition.

## 5. Resume point

After PASS, the operator retries the same real Telegram instruction. The
existing client keeps the exact pending request for an idempotent retry. Labs
then claims it and prepares the update; publication still requires one exact
Telegram approval. The recurring content path contains no Render step.


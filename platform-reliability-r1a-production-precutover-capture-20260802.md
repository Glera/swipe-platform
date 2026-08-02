# Platform Reliability R1-A — production pre-cutover capture

Observed: 2026-08-02, `17:45:53Z`–`19:08:38Z`, across two separately
bounded attended windows.

Status: **PRODUCTION GHCR CREDENTIAL PINNED; CI AND INDEPENDENT REVIEW PASS;
CUTOVER AUTHORITY NOT GRANTED**. This receipt records read-only provider state,
one read-only `alembic current` one-off probe, credential creation, exact code
pinning and verification. It authorizes no merge, image publication, provider
source switch, deploy, migration or Stage 1 action.

Operator authority for this window was limited to production pre-cutover
capture and creation of one least-privilege GHCR registry credential. The
credential did not yet exist at this capture boundary.

## Exact provider boundary

| Resource | Exact identity | Observed state |
| --- | --- | --- |
| Render owner | `tea-d1m4lmali9vc73euvelg` | all exact resources below belong to this owner |
| Blueprint | `exs-d95qo3q8qa3s73ea23p0` | `paused`; Auto Sync `false`; branch `master` |
| web | `srv-d95r3bfavr4c73aqsi4g` | Auto Deploy `off`; `./Dockerfile.bake`; latest `dep-d9mtmabm8hqs73cighmg` `live` |
| sequencing cron | `crn-d9kej0u1egvs73engu7g` | Auto Deploy `off`; `./Dockerfile.bake`; latest `dep-d9mtmabm8hqs73cigjk0` `live` |
| materialize cron | `crn-d9e6vmtaeets73ai8cj0` | Auto Deploy `off`; `./Dockerfile.bake`; latest `dep-d9mtmajm8hqs73cigkc0` `live` |
| PostgreSQL | `dpg-d95r32favr4c73aqs4d0-a` | `available`; PostgreSQL 16; `basic_256mb`; Oregon |
| GHCR registry credentials | owner inventory | empty before the authorized creation |

All three latest deploys bind commit
`09fa0cdc17e207ea21826036b671b1064871fa32`. The ten captured deploy records
per core service contain only `live` or terminal `deactivated` states: no
deploy, preDeploy or source sync was active. The production Blueprint was
paused and the capture verifier returned `mergeSafe=true`.

The exact expected consumer set remains one web service and the two surviving
cron jobs above. The owner also contains nine unrelated services; none uses the
`swipe-backend` repository/Blueprint authority and none is included in the
R1-A coordinator target set.

## Database and environment authority

A Render one-off job `job-d9no8sqjnfac73bgf2ig` ran only
`alembic current`. It succeeded and emitted
`0070_published_test_delivery (head)`. No upgrade, downgrade, schema write or
service restart was requested.

The seven coordinator-owned temporary service keys were each absent by exact
key lookup:

- `PLATFORM_DATABASE_IDENTITY`;
- `PLATFORM_DEPLOY_IDENTITY`;
- `PLATFORM_RELEASE_MANIFEST_B64`;
- `PLATFORM_RELEASE_MANIFEST_SHA256`;
- `PLATFORM_RELEASE_OPERATION`;
- `PLATFORM_ROLLBACK_AUTHORIZATION_B64`;
- `PLATFORM_ROLLBACK_AUTHORIZATION_SHA256`.

## GitHub authority boundary

At capture time:

- backend `master` was
  `a12ca7ecea0f47e8862b4ba91879dff63cb46bfc`;
- draft PR #48 was still `DO NOT MERGE` at pre-pin head
  `7728b89b329318bf59da67c117382e85d3a43ada`;
- the GitHub `production` environment was absent (`404`);
- repository-level `RENDER_*` secrets and variables were absent.

This is an intentional fail-closed boundary. A later, separately reviewed
cutover packet must create the protected environment with only its declared
authority; this capture does not create it.

## Durable digests

| Receipt | SHA-256 |
| --- | --- |
| no-clobber provider capture `platform-reliability-r1a-production-provider-capture-20260802.json` | `eeb3a6ebbaad936cd1f64dee66a03907e3649baa71fb83aa99f6c14a8793a163` |
| extended capture summary | `0fbe1979863c7b3dff52cd4ee94f389076aceb39174eb3bea4d76470b910a1b7` |
| normalized database provider record | `0b088aa50516c4436f2f925d61b5967bef82dc115e624edd347c5565ec923bb5` |
| pre-create registry inventory | `37517e5f3dc66819f61f5a7bb8ace1921282415f10551d2defa5c3eb0985b570` |
| GitHub authority summary | `5071ea1944f7735dd8102c3c486b7f9609067354d234199635992975565643b4` |
| release env-key presence receipt | `f0b65b21bbdbbc69278f691f33e72dbe9b83e1a8b3b231113ec57335b1b3c535` |
| DB revision job creation | `7d540344d0371865f71b418a6dbdbc8db21034c853f3b29d268371958904949e` |
| DB revision job final status | `0963550445c4dd97af223c66ea8f8ca623ce7ca55b9eb828ae11f76fbe5c6072` |
| DB revision job logs | `7428dafe646bfc2257c094e7a075a77d2ac9a0a8a47d7d91b5e215c0ef72d527` |

Raw provider inventories and key-name-only captures remain in the private
attended receipt directory; no API key, PAT, environment value or database
connection secret is copied into git.

## First attended window close

GitHub sudo confirmation was not completed during this attended window, so no
PAT and no Render registry credential were created. A final owner inventory at
window close remained empty and was byte-identical to the pre-create inventory
(`37517e5f3dc66819f61f5a7bb8ace1921282415f10551d2defa5c3eb0985b570`).

The temporary account-wide Render API key
`r1a-production-precutover-20260802` was revoked in the authenticated Render
UI. An immediate API request with the former key returned `401`; revocation
receipt SHA-256 is
`a3d1828acf543f5f5246be2ae20c52b65881a282bfa20805e8d036bbe0765494`.
The local secret file was then explicitly unlinked and is not recoverable from
the attended receipt directory.

The prepared capture files remain uncommitted so they can be batched with the
eventual exact credential pin instead of triggering an otherwise redundant CI
round. Resuming credential creation requires a fresh GitHub sudo code and a
new separately bounded Render-authority window; this closed key cannot be
reused.

## Retry window — credential creation and exact pin

The operator opened a new bounded window and completed fresh GitHub sudo
authentication. One classic GitHub PAT was created with note
`r1a-production-ghcr-read-20260802`, exact scope `read:packages`, and expiry
2026-10-31. GitHub reported identity `Glera`; the API scope response contained
no broader scope, and direct package lookup confirmed that the private
`swipe-backend` package was readable. The PAT value was never written to this
receipt or git.

Using a new temporary Render API key, the owner inventory was first confirmed
empty and then exactly one production registry credential was created:

| Field | Exact value |
| --- | --- |
| credential ID | `rgc-d9np7tajnfac73bi5ib0` |
| name | `swipe-backend-production-ghcr-20260802` |
| registry | `GITHUB` |
| username | `Glera` |
| created/updated | `2026-08-02T19:01:09.561455Z` |

The create response, owner inventory and direct credential lookup agree on all
identity fields. The durable PAT remains encapsulated by this Render
credential because it is the production image-pull dependency; its raw value
is not locally retained.

Backend successor head `11c9bce9891ae5b041215056ac4521551a056cb5`
pins this exact credential ID in the coordinator. Draft PR #48 remains open,
draft and unmerged. The delta also makes the production credential a forbidden
rehearsal target and tests the exact valid pin plus wrong-target rejection.
Local targeted tests passed 50/50 and the broader release set passed 71/71.

Authoritative GitHub CI completed successfully on that exact head:

- Platform release image run `30762502229`, completed at `19:05:09Z`;
- PostgreSQL acceptance run `30762502196`, completed at `19:08:38Z`, including
  all migration roundtrips and downstream reverse-drift verification.

No image was published by this pull-request workflow. No merge or deploy was
performed.

## Post-create provider capture and cleanup

The exact provider capture was rerun after credential creation at
`19:03:32.093657Z`. It returned `PASS`. Its normalized provider state is
byte-identical to the pre-pin capture, and the live deploy identities remained:

- web: `dep-d9mtmabm8hqs73cighmg`;
- sequencing: `dep-d9mtmabm8hqs73cigjk0`;
- materialize: `dep-d9mtmajm8hqs73cigkc0`.

The retry-window temporary Render API key was revoked. An immediate request
with the former key returned `401`. Both local secret files — the temporary
Render key and the GitHub PAT handoff file — were explicitly unlinked. Neither
secret is recoverable from the attended receipt directory.

Independent read-only review returned **GO, no P1/P2 findings** for the exact
pin, authority boundary and evidence identity. The prompt, raw structured
result and durable review summary are committed beside this receipt.

## Retry-window durable digests

| Receipt | SHA-256 |
| --- | --- |
| GitHub identity response headers | `1de957ca2825944e0a2fb02fcdb823ae3b752902684aef16d856d5f0b8e577d1` |
| GitHub identity response body | `779f562efefe8fe12726a86457710edf9161e28b811bd203f1147080b9ccee71` |
| GitHub package response headers | `49eea75e73704cea61b7cea20ddfa7b11af700c1dac5517bd7d786192f3a882d` |
| GitHub package response body | `94bbd5305280032affe5c9941a953055ef79a5641b75b8cc838965666331d4c7` |
| Render credential create response | `8914890f145d5ae0e0926da4268940df29744bc86e98a981f67b2f6c0352a78d` |
| Render credential owner inventory | `cd963c89d6b881ed7112339a7c2691c54f8065cec72360a94a75fe375a871ee6` |
| Render credential direct response | `8b314df1db12b8dab7cbc85d5cdd20e2b18bdd55b04782ccf7ac501c2dd045e3` |
| post-create provider capture | `bf7dcf911946a1a38b82cf31e222d3b3f46db565a26498e573fdb64a2c1215f3` |
| normalized provider state, before and after | `6df8e2f1d819fc3fcee30e01f446ff87bcc0ec9ef2256a92e65fb92176ebc2e8` |
| temporary Render key revocation receipt | `a10de4ca81ecb7f9cb1e19799c6826a886cdd40f7c3f30a3791ea8040e8a432c` |
| post-revocation unauthorized body | `3e7db788e384631f8a9f299d1797e6f8af6d16d643a1c91f9e83ae15212de45c` |

The raw retry-window provider receipts remain outside git because they include
broader provider inventories. The committed documents contain exact resource
identities and digests but no API key, PAT, environment value or database
connection secret.

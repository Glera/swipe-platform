# Platform Reliability R1-A — disposable provider checkpoint

Date: 2026-08-01 (Asia/Nicosia).

Status: **provider provisioning and exact-source proof complete; rehearsal is
not PASS**. Image publication, the GitHub environment, coordinator exercises,
rollback and final cleanup remain pending.

Operator authority: the active task explicitly authorized the disposable
rehearsal up to USD 3 and accepted the temporary account-wide scope of each
short-lived Render API key for this disposable workspace. No production
cutover or production mutation is authorized by this checkpoint.

## Frozen source

- Blueprint repository: `Glera/p4g-workspace-meta`;
- Blueprint branch:
  `codex/r1a-rehearsal-blueprint-v2-20260801`;
- branch SHA: `ccf690d106d7dd1f1d06279972a1851117287053`;
- Blueprint path: `render.r1a-rehearsal.yaml`;
- Git blob: `809aa531176f44890f72dfa4953ee36148113629`;
- file SHA-256:
  `4361c8c826f6868de1d9bd34b2050fc0af1d05e2fa1974f2c832e8790b2c6710`;
- baseline backend ref:
  `codex/r1a-rehearsal-baseline-v2-20260801` at
  `0add5f3fbd2fa60a3a0a3ae2ba6f20ed333dd725`.

The mutation-free Render validation response had `valid=true`, exact services
`swipe-backend`, `swipe-seq-shadow-run`, `swipe-c1-materialize`, exact database
`swipe-db`, no key-value/environment-group resources and `totalActions=4`.
Its exact response SHA-256 is
`a0b4f057313e0b32efffef86aa497cf9bed316b78ab0321ba2df731efbe268ab`.

## Disposable identities

| resource | exact ID | frozen state at checkpoint |
| --- | --- | --- |
| workspace | `tea-d9mu8grm8hqs73d5tnbg` | isolated workspace |
| Blueprint | `exs-d9n0cttaeets73av0i4g` | Auto Sync `false` |
| web | `srv-d9n0s1vlk1mc73dhrvm0` | suspended, Auto Deploy Off |
| sequencing cron | `crn-d9n0rnflk1mc73dhre6g` | suspended, Auto Deploy Off |
| materialize cron | `crn-d9n0rnflk1mc73dhre5g` | suspended, Auto Deploy Off |
| PostgreSQL 16 | `dpg-d9n0rnflk1mc73dhre60-a` | free, available |

The initial web deploy is
`dep-d9n0s2flk1mc73dhs0fg`, trigger `blueprint_sync`, exact commit
`0add5f3fbd2fa60a3a0a3ae2ba6f20ed333dd725`, final status `live` before the
cost-control suspension. The two initial cron source builds were also bound to
that exact commit before suspension.

The canonical disposable provider capture returned `PASS`; exact receipt
SHA-256:
`ed896f76599065bcd6d1a87181b1aa89bddcde9f048a919fd8f85442feacabe0`.
Raw deterministic GET assertions required the disposable owner, exact baseline
branch, `autoDeploy="no"`, `autoDeployTrigger="off"`, `./Dockerfile`, Starter,
Frankfurt, far-future cron schedule `0 0 1 1 *`, and the free Frankfurt
database identity `swipe_r1a_rehearsal`. The attended UI projection bound the
web ID to the same branch/path/preDeploy values and the visible label `Off`;
its projection SHA-256 is
`3993dbbbfa40dd699bab7b9b375b193e7830817f667717bac13c224d8f243177`.

The baseline health response had `ok=true`, `service="swipe-backend"` and
`island.bake_runtime.state="local"`; exact bounded response SHA-256:
`217724c8cca3c2d8b27b88bc63dda11a4aaaad79b2a30a10b1f67add8ef9f9a6`.

## Container exact-SHA proof

Render omits the one-line successful cron stdout from both the Dashboard and
Logs API. No service configuration was weakened to work around this provider
behavior. Instead, an isolated one-off job was created from each cron's latest
successful source build with the no-space shell command
`sh -c cat</app/platform-backend-sha>&2;false`. It prints the immutable image
file to stderr and then deliberately exits non-zero, so `failed` is the
expected typed probe result rather than an application failure.

| cron | probe job | expected status | exact bounded log | created/status/log SHA-256 |
| --- | --- | --- | --- | --- |
| sequencing | `job-d9n19dtaeets73b0pe4g` | `failed` | `0add5f3fbd2fa60a3a0a3ae2ba6f20ed333dd725` | `980c71aa652637eae16635b57283907520cd8566c2a2d68f7733238340172fd9` / `69ff5fc7bf4cb3b68160b0df589c954ee0b7eb157f6bedefe19a2e8a8241a002` / `610587fe3a1340b31cb66637f2ef7df5d0babc36c28d643a72ce2aff3e18e249` |
| materialize | `job-d9n19kp42hec73en0do0` | `failed` | `0add5f3fbd2fa60a3a0a3ae2ba6f20ed333dd725` | `f649852532522f424f46e230d61e0e5b932a478aa8ee3202ffd7a7fa83b6a2be` / `216c7b03319a8f31e3940e1073b7bf4eb6798e65e5c862eacd2b9c6d5d94e2a7` / `c987ce848de8d3025e89606226b91e02ed6fa9f05e4f5364bcd1d3fbd6a3138c` |

Both services remained suspended after the probes.

## Production non-target proof and credential hygiene

Immediately before the probe, the production-name-bound provider capture
returned `PASS` with receipt SHA-256
`189b6c6bb92e9bfb6462537e61bd91a65981c51961a8ec4cc2ccf313c174de95`.
Immediately after the probe, it returned `PASS` with receipt SHA-256
`1bb7960d0a4b81acaeeed166a5fd863492d52c0608411416e257da7d706b28b5`.
After deleting only `observedAt`, both canonical documents are byte-identical
with normalized SHA-256
`6df8e2f1d819fc3fcee30e01f446ff87bcc0ec9ef2256a92e65fb92176ebc2e8`.
The bounded production database responses are also byte-identical, both with
SHA-256
`cd85b3008ee358e224c59ef191d0027d75be087906cef518ea1051d6d97771a9`.

Two short-lived account-wide Render API keys were used in attended windows.
Each was revoked in the Dashboard, verified unusable by exact HTTP `401`, and
its permission-restricted local file was unlinked. No Render API key remains
on disk at this checkpoint.

The disposable deploy hook briefly rendered as plaintext while collecting the
provider-label evidence. It was immediately regenerated; the disclosed value
is invalid and was never used.

## Cost-control pause and remaining gate

The web and both cron services are suspended; the remaining PostgreSQL is on
the free plan. The GitHub `production` environment and Render registry
credential do not yet exist, and the `swipe-backend` GHCR package remains
absent (`404`). GitHub requires a one-time sudo-mode email verification before
the temporary classic PAT with exactly `read:packages` can be created. The
operator has been asked for that code. After it is supplied, the attended
sequence resumes with a fresh short-lived Render key and a fresh production
pre-boundary capture.


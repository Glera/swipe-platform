# Platform Reliability R1-A — executable pre-cutover preparation v2 runbook

Prepared: 2026-08-03 UTC.

Status: **INDEPENDENT REVIEW GO — DO NOT EXECUTE WITHOUT AN OPERATOR GO NAMING
THE EXACT COMMITTED V2 AUTHORITY REQUEST**.

Authority and identities live in
`platform-reliability-r1a-cutover-preparation-v2-authority-request-20260803.{json,md}`.
This runbook narrows execution to that request. It grants no authority itself.

The old request and old branch-policy payload remain historical and
non-executable. Only the v2 request, the plan-compatible environment payload
and the candidate-v2 branch-policy payload named below may be used.

## 0. Single-flight local boundary

Resolve clean worktrees for:

- backend successor ref `codex/r1a-production-cutover-v2-20260803` at exact
  `4714e339b60e3af747d138486ad7eadadec72dac`;
- meta evidence ref `codex/platform-reliability-r1a-evidence` at the exact
  commit named in the operator GO.

Create a new receipt directory using `mktemp -d` and set mode `0700`. Create a
different exclusive temporary key handoff file with mode `0600`. Never put the
Render key in argv, command history, chat, clipboard transcript, receipt or
git. Never reuse a receipt directory or key file from an earlier window.

Before key creation, repeat every action-time check in the v2 JSON. Required
facts include exact meta packet, backend master, PR #51 base/head/draft state,
both CI runs, baseline and candidate run/artifact/GHCR identities, absent
GitHub `production` environment, absent repository `RENDER_*` authority, zero
candidate cutover dispatches, exact Stage 1 heads and no surviving temporary
Render API key. Any mismatch ends the window with no mutation.

The one-time key reveal is a no-observation zone. After submitting the Render
key-creation dialog and until the value is stored and the dialog is closed,
do not request a DOM snapshot, screenshot, body text, console log or clipboard
transcript. Use one non-emitting browser-runtime call to read the already
grounded reveal textbox into process memory, validate shape without printing,
write directly to the pre-created `0600` handoff file, and return no value.
Close the reveal dialog before any next browser observation. Verify only file
mode and non-zero size, never its content or hash.

If any output exposes the key, revoke it immediately, prove the Render key
inventory is empty, remove the handoff, record a bounded failure and stop. No
replacement key is allowed under the same GO.

## 1. Fresh provider and database evidence

Read the temporary key into `RENDER_API_KEY` only inside a subshell and export
it only to the reviewed backend child processes. From the exact successor
worktree run:

```bash
PYTHONPATH=. python scripts/platform-release-provider-capture.py \
  --blueprint-id exs-d95qo3q8qa3s73ea23p0 \
  --web-service-id srv-d95r3bfavr4c73aqsi4g \
  --sequencing-cron-id crn-d9kej0u1egvs73engu7g \
  --materialize-cron-id crn-d9e6vmtaeets73ai8cj0 \
  --output "$r1a_receipt_dir/platform-release-provider-capture.v1.json"
```

Require `status=PASS`. The canonical receipt must bind the exact IDs, resource
names/types, `master` source branch, `./Dockerfile.bake`, Blueprint Auto Sync
false and every Auto Deploy false.

Using the same reviewed `Render` client, capture bounded direct GET projections
for:

- production PostgreSQL `dpg-d95r32favr4c73aqs4d0-a`;
- registry credential `rgc-d9np7tajnfac73bi5ib0`;
- the latest ten deploys of the web and both cron services;
- current web-service jobs.

Require PostgreSQL 16 and `available`, exact credential identity, no
non-terminal deploy/sync/preDeploy/job, and latest live deploys exactly:

- web `dep-d9mtmabm8hqs73cighmg`;
- sequencing `dep-d9mtmabm8hqs73cigjk0`;
- materialize `dep-d9mtmajm8hqs73cigkc0`.

These are stop sentinels. A mismatch cannot be repaired by replacing values in
the packet.

Create exactly one web-service job by POSTing only:

```json
{"startCommand":"alembic current"}
```

to `/services/srv-d95r3bfavr4c73aqsi4g/jobs`. Capture create response, poll
only that job to terminal state, and capture bounded logs. Require terminal
`succeeded` and exact output `0070_published_test_delivery (head)`. No second
job and no other command are authorized. If any provider or DB assertion
fails, skip GitHub environment creation, revoke the key and publish a bounded
FAIL receipt.

## 2. GitHub environment creation

Before use, verify exact payload hashes:

| Payload | SHA-256 |
| --- | --- |
| `platform-reliability-r1a-github-production-environment-payload-v2-20260803.json` | `2a6cb895a3d98f5f17d7c36082cde31d6870476992d28a86f7950a95109cde1e` |
| `platform-reliability-r1a-github-production-branch-policy-payload-v2-20260803.json` | `caee59d6415c614dafda4fe6b4208e2acac761e358f576cc7604351761c7b9b0` |

The environment payload sends only the supported custom-branch selector and
deliberately omits plan-gated reviewer/wait fields. Create the environment and
then its one branch policy:

```bash
gh api --method PUT \
  -H "X-GitHub-Api-Version: 2026-03-10" \
  repos/Glera/swipe-backend/environments/production \
  --input platform-reliability-r1a-github-production-environment-payload-v2-20260803.json

gh api --method POST \
  -H "X-GitHub-Api-Version: 2026-03-10" \
  repos/Glera/swipe-backend/environments/production/deployment-branch-policies \
  --input platform-reliability-r1a-github-production-branch-policy-payload-v2-20260803.json
```

If either call is ambiguous or fails, do not continue. Read back any partial
environment, delete only the shell created by this window, revoke the key and
stop.

Set the only environment secret by stdin:

```bash
gh secret set RENDER_API_KEY \
  --env production \
  --repo Glera/swipe-backend < "$r1a_render_key_file"
```

Set exactly the six non-secret variables from the v2 JSON using `gh variable
set NAME --env production --repo Glera/swipe-backend --body EXACT_VALUE`.
Values are copied literally from the request, never discovered dynamically.

## 3. Mandatory read-after-write verification

Capture exact bounded GET receipts for the environment, its deployment branch
policies, environment secret names, environment variable values, repository
secret names and repository variable names. Require simultaneously:

1. environment name `production`, custom-branch mode, and no wait-timer or
   required-reviewer protection rule;
2. exactly one policy, type `branch`, name
   `codex/r1a-production-cutover-v2-20260803`;
3. environment secret names exactly `{RENDER_API_KEY}`;
4. environment variables exactly the six declared key/value pairs, with no
   missing or extra key;
5. no repository secret or variable beginning `RENDER_`;
6. meta packet, PR #51, backend master, successor ref, Stage 1 refs and both
   immutable images remain unchanged;
7. zero cutover workflow dispatches and zero PR merges;
8. provider resources and database remain at the just-captured exact state.

Names-only secret endpoints do not reveal secret values. Never attempt to read
or echo the environment secret.

The successful environment verification timestamp starts an exact 60-minute
decision deadline.

## 4. Evidence and independent review

Hash every exact receipt. Commit only bounded projections and digests; exclude
raw API keys, database URLs, PATs, environment secret values and broad provider
inventories. Update the production cutover packet with:

- exact fresh provider-capture time and digest;
- current deploy IDs and database revision;
- environment/policy/secret-name/variable receipt digests;
- temporary-key lifecycle state and 60-minute deadline;
- proof of zero merge, workflow dispatch, persistent service
  configuration/source/image mutation, deploy, migration, image publication
  and Stage 1 mutation, plus exactly one authorized revision job.

Run JSON validation, `git diff --check`, docs-boundary lint and the full root
test suite. Obtain independent read-only review of the exact evidence commit.
Stop before merge and before any workflow dispatch.

If review is not GO, the operator declines, or no final cutover GO arrives by
the deadline, immediately perform §5. A later attempt requires a new key,
fresh capture, new environment and new operator GO.

## 5. Bounded cleanup

Deletion is legal only for the `production` environment newly created by this
exact window:

```bash
gh api --method DELETE \
  -H "X-GitHub-Api-Version: 2026-03-10" \
  repos/Glera/swipe-backend/environments/production
```

Then prove environment GET returns `404`. Revoke the temporary Render API key
in the authenticated Render UI, prove the former key returns `401`, verify no
temporary key remains, and unlink the local handoff. Preserve the durable GHCR
registry credential and every service. No source rollback or deploy is needed
because this runbook forbids persistent service mutation.

# Platform Reliability R1-A — executable pre-cutover preparation runbook

Prepared: 2026-08-03 UTC.

Status: **REVIEW CANDIDATE — DO NOT EXECUTE WITHOUT THE OPERATOR GO THAT NAMES
THE COMMITTED AUTHORITY REQUEST**.

Authority and exact identities live in
`platform-reliability-r1a-cutover-preparation-authority-request-20260803.{json,md}`.
This runbook makes that request executable; it does not broaden it. All paths
below are explicit, every write is no-clobber or externally read back, and no
cutover workflow is dispatched.

The first environment payload sent zero-value reviewer/wait fields and was
rejected by GitHub for this private repository's plan. That attempt is
contained in
`platform-reliability-r1a-cutover-preparation-plan-failure-20260803.{json,md}`.
The reviewed v2 payload therefore sends only the supported custom-branch
selector. It does not request a wait timer or required reviewers; the operator
GO remains the human authorization boundary.

GitHub API shapes were checked against the official current documentation for
[environments](https://docs.github.com/en/rest/deployments/environments),
[deployment branch policies](https://docs.github.com/en/rest/deployments/branch-policies),
[Actions secrets](https://docs.github.com/en/rest/actions/secrets) and
[Actions variables](https://docs.github.com/en/rest/actions/variables). The
installed `gh` 2.86.0 supports environment-scoped `secret set` and `variable
set`; secret values are locally encrypted before upload.

## 0. Local boundary

Use the clean exact successor worktree
`/private/tmp/p4g-r1a-prod-successor.0REhzc` and the clean exact meta evidence
worktree `/private/tmp/p4g-r1a-meta.YPUxDz`. Create a new receipt directory
with `mktemp -d`; set its mode to `0700`. Create the Render key handoff as a
different exclusive temporary file with mode `0600`. Never put the key in a
command argument, chat, clipboard transcript, receipt or git.

The one-time Render key reveal is a no-observation zone. After submitting the
key-creation dialog and until the value is stored and that dialog is closed,
do **not** request a DOM snapshot, screenshot, body/element text, console log,
clipboard transcript or any other browser/tool output. Use only the already
grounded unique dialog locator, wait directly for its `code-snippet` textbox,
read its value into process memory without emitting the result, validate its
shape without printing it, and write it directly into the pre-created `0600`
handoff file. Verify only file mode and non-zero size; never print or hash the
value. Close the reveal dialog before any subsequent browser observation.

The read, validation and file write must occur inside one non-emitting local
browser-runtime call. The call source may contain the already-created handoff
path but never the key value. Write through the runtime's filesystem API; do
not pass the value to a shell, subprocess, command argument, tool parameter,
clipboard, returned object, stdout or stderr. Do not call any output helper,
and make the call return no value. The next tool call is permitted only after
the reveal dialog is closed and the `0600` mode/non-zero-size checks have
passed without reading the file contents.

If any browser or tool result contains the full key, treat the key as exposed:
revoke it immediately, verify the API-key list is empty, remove the handoff
file, publish a bounded FAIL receipt and stop. Do not create a replacement key
under the same operator GO.

Before reading the key, repeat every action-time stop in the authority JSON:
exact remote `master`, PR #48/ref, both image runs/artifacts, absent production
environment, absent repository `RENDER_*` keys, and exact frozen Stage 1 heads.
Any difference stops the window before GitHub or Render mutation.

The last accepted Render and DB values are comparison sentinels, never dynamic
defaults. Do not replace them with freshly discovered values after a mismatch.

## 1. Fresh provider and database evidence

In a subshell, read the temporary key from the `0600` handoff file into
`RENDER_API_KEY`, export it only to child processes, and run from the exact
successor worktree:

```bash
PYTHONPATH=. python scripts/platform-release-provider-capture.py \
  --blueprint-id exs-d95qo3q8qa3s73ea23p0 \
  --web-service-id srv-d95r3bfavr4c73aqsi4g \
  --sequencing-cron-id crn-d9kej0u1egvs73engu7g \
  --materialize-cron-id crn-d9e6vmtaeets73ai8cj0 \
  --output "$r1a_receipt_dir/platform-release-provider-capture.v1.json"
```

The command is GET-only and must print `status=PASS`. Verify the canonical
receipt binds the exact IDs, names, service types, source branches and stored
Dockerfile paths, Blueprint Auto Sync false and every Auto Deploy false.

Using the same reviewed Render client and key scope, capture bounded direct
GET projections for the production PostgreSQL record, durable registry
credential and latest ten deploys of each of the three services. Save exact
response bytes and SHA-256, but commit only bounded projections/digests. The
three latest live deploys must remain the stop sentinels in the authority
request and no non-terminal operation may exist.

Create exactly one web-service job with `startCommand="alembic current"`.
Capture its create response, terminal status and bounded logs. Require exact
output `0070_published_test_delivery (head)`. No other job command is legal.

If any provider or DB check fails, do not create the GitHub environment.
Revoke the temporary key and publish a bounded FAIL receipt.

## 2. GitHub environment creation

The two committed payloads are the only accepted request bodies. Before use,
record their SHA-256 and confirm their canonical projections equal the
authority JSON.

- environment payload v2:
  `2a6cb895a3d98f5f17d7c36082cde31d6870476992d28a86f7950a95109cde1e`;
- branch-policy payload:
  `81855b2e11d9c0acf9400c523d4609b4902417d9f7c58ad76620ef772d220cee`.

Create the environment, then the one exact branch policy:

```bash
gh api --method PUT \
  -H "X-GitHub-Api-Version: 2026-03-10" \
  repos/Glera/swipe-backend/environments/production \
  --input platform-reliability-r1a-github-production-environment-payload-v2-20260803.json

gh api --method POST \
  -H "X-GitHub-Api-Version: 2026-03-10" \
  repos/Glera/swipe-backend/environments/production/deployment-branch-policies \
  --input platform-reliability-r1a-github-production-branch-policy-payload-20260803.json
```

Set the secret by stdin from the `0600` handoff file — never `--body`:

```bash
gh secret set RENDER_API_KEY \
  --env production \
  --repo Glera/swipe-backend < "$r1a_render_key_file"
```

Set exactly the six non-secret variables with `gh variable set <NAME> --env
production --repo Glera/swipe-backend --body <EXACT_VALUE>`. The names and
values are copied literally from the authority JSON; do not use an ambient
dotenv file or dynamic provider output.

## 3. Mandatory read-after-write receipt

GET and save bounded receipts for:

- `repos/Glera/swipe-backend/environments/production`;
- its `deployment-branch-policies` collection;
- its Actions secret names;
- its environment variables including exact values;
- repository Actions secret names and repository variable names.

The verifier must require all of the following simultaneously:

1. environment name `production`, exact custom-branch mode, and no
   `wait_timer` or `required_reviewers` protection rule;
2. exactly one policy of type `branch` whose name is the reviewed successor
   ref;
3. environment secret-name set exactly `{RENDER_API_KEY}`;
4. environment variables exactly the six key/value pairs in the authority
   JSON — no missing or extra key;
5. no repository secret or variable whose name begins `RENDER_`;
6. PR #48, backend `master`, exact candidate ref and both build artifacts are
   still unchanged after environment creation;
7. no cutover workflow run exists for the candidate head.

Names-only secret endpoints never reveal the secret value. Do not attempt to
read or echo it.

## 4. Packet, review and stop

Hash every exact receipt, update the production cutover packet with the fresh
observation time/digest, exact web deploy and DB revision, then run boundary
lint and the full root suite. Obtain a new independent review of the entire
final packet.

Stop before merge and before any workflow dispatch. The environment and
temporary key remain a dormant authority pair while the final operator
decision is taken. Record a deadline exactly 60 minutes after the environment
verification timestamp. If the packet fails, the operator declines, or no
separate cutover GO arrives before that deadline, delete the newly created
environment first and revoke the temporary Render key immediately; prove
environment GET `404` and API-key rejection. Preserve the durable GHCR registry
credential. A later attempt starts from a new capture and new key.

## 5. Cleanup command boundary

Deleting `production` is legal only as failure/decline cleanup for the
environment created by this exact window:

```bash
gh api --method DELETE \
  -H "X-GitHub-Api-Version: 2026-03-10" \
  repos/Glera/swipe-backend/environments/production
```

Never delete either pre-existing `master - ...` environment. Render API-key
revocation is performed in the authenticated Render UI and followed by a
bounded `401` proof; no service or registry credential is deleted.

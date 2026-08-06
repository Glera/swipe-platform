# Variant B credential preparation — independent review disposition

- Date: 06.08.2026.
- Owner/orchestrator: Codex Sol.
- Reviewer: independent Claude frontier session, supplied by the operator.
- Verdict: **conditional GO as the second signature for credential
  preparation only**.
- Operator GO: still required after the pre-secret condition below is applied
  and observed.
- This receipt grants no workflow dispatch, Render service mutation, deploy,
  migration, roster write or activation.

## Reviewed authority

- meta master after PR #65:
  `0620b6a3cdde871b1c1c7ccb3da63f35e0cd8fdc`;
- reviewed route head:
  `dad0de345f334b3dfafda1120fe7f9d1adc50ada`;
- route SHA-256:
  `4041942bac4fbb86d918dfa040732e3f6a588110fd3343bfcbb722e377de3a53`;
- GET-only capture SHA-256:
  `dc8f1d46cda2f173df1cabb70457c099cf25da8d5aff847e144d6d523870a25f`;
- backend authority:
  `0e9e940a2a762f0e35f93c3e35f3afcfea6baaa4`;
- candidate image:
  `ghcr.io/glera/swipe-backend@sha256:d7db27136b117c45158f40f9cc261d6807aae413f53ef2d649e4d23079e1b8b4`.

The reviewer independently reproduced the capture SHA, the route SHA and the
14/14 focused tests. Both known unapproved previews are represented in the
route and executable capture. The separate v4 review receipt binds the route,
tool and backend authority.

## Fresh precondition observation

Read-only GitHub API observation on 06.08 showed:

- environment `production` exists;
- `protection_rules=[]`;
- `deployment_branch_policy=null`;
- `can_admins_bypass=true`;
- `master` has no branch protection;
- environment secret list is empty;
- repository variables contain the five stable identities and do not contain
  `RENDER_BLUEPRINT_ID`.

The absent deployment-branch-policy endpoint returns 404 until the environment
is switched to custom branch policies. This matches the GitHub contract:
custom patterns require
`deployment_branch_policy.custom_branch_policies=true` before a branch-policy
row can be created. Official references:

- https://docs.github.com/en/rest/deployments/branch-policies
- https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments

## Conditions accepted by the owner

### 1. Pre-secret branch restriction — operator action

Before creating or writing any credential, the operator changes GitHub
repository `Glera/swipe-backend` → Settings → Environments → `production` →
Deployment branches and tags to **Selected branches and tags**, then adds
exactly one branch rule named `master` and no tag rule.

Codex then verifies read-only that:

```text
deployment_branch_policy.protected_branches = false
deployment_branch_policy.custom_branch_policies = true
branch_policies = [{name: "master", type: "branch"}]
```

The policy is matched against the workflow run's `GITHUB_REF`; therefore an
arbitrary branch's `workflow_dispatch` cannot enter the `production` job and
cannot receive its environment secret. Required reviewers and master branch
protection are not added by this bounded packet: they are not needed for the
exact `ref=master` route and would widen the external change.

Observed PASS on 06.08.2026 after the operator action:

```text
environment protection rule id = 61902030 (branch_policy)
protected_branches = false
custom_branch_policies = true
branch policy id = 56600753
branch policy name = master
branch policy type = branch
environment secrets = 0
repository variables = 5; RENDER_BLUEPRINT_ID absent
```

This closes the only condition that had to be satisfied before key creation.

### 2. Armed-window time box

The 90-minute clock begins when the temporary Render key is created. If Phase
3 has not received its separate operator GO before the deadline, the window is
closed; no dispatch is attempted under an expired capture.

Closure requires the retained exact key bytes to prove
`GET /v1/users -> 401` after operator revocation, deletion of environment
secret `RENDER_API_KEY`, and deletion of the local plaintext holder. A later
window starts from a new key and a new pre-window capture.

### 3. SSH attribution — closed

Render account key `claude-ops` is attributed to the operator-owned local key
pair used for attended Render diagnostics:

```text
public key: /Users/gleb/.ssh/render_ops.pub
private key: /Users/gleb/.ssh/render_ops (mode 0600)
fingerprint: SHA256:FfvzNGvaBsGYN9YcM3Yjpx1OhykuMnoUop2HU+VBahI
comment: claude-ops-2026-07-17
```

It is a separate live access channel and is not closed by Render API-key
revocation. This packet neither uses nor rotates it.

### 4. Render 2FA — operator action before Phase 3

The operator enables 2FA on the Render account and Codex records only the
non-secret enabled-state evidence. No recovery code, seed or authenticator
material enters logs, chat or git. Phase 2 may be prepared before this; Phase 3
GO is forbidden until 2FA is observed enabled.

## Credential-preparation scope after operator GO

Operator-owned external actions:

1. create exactly one temporary account-wide Render API key;
2. retain its exact bytes in one non-emitting local holder;
3. prove exact `GET /v1/users -> 200`;
4. after GET-only pre-window capture PASS, write the same bytes to GitHub
   environment secret `RENDER_API_KEY`;
5. create repository variable `RENDER_BLUEPRINT_ID` with exact value
   `exs-d95qo3q8qa3s73ea23p0`.

Codex owns only read-only verification, capture interpretation and receipt
authoring. Under `AGENTS.md`, agents do not click production/credential
controls and do not type or retain credential plaintext.

No workflow dispatch, Render service mutation, deploy or migration is part of
this credential-preparation scope.

## STOP cleanup for this boundary

If any check fails before Phase 2 dispatch:

1. operator revokes the exact temporary Render key;
2. retained bytes prove `GET /v1/users -> 401`;
3. operator deletes environment secret `RENDER_API_KEY` if it was created;
4. operator deletes `RENDER_BLUEPRINT_ID` if it was created, restoring the
   five-variable minimized pre-state;
5. operator deletes the local plaintext holder;
6. the `master` deployment branch policy remains as a durable security guard;
7. Codex records the literal provider/GitHub state and no dispatch occurs.

After Phase 2 has mutated the service, disposition follows the reviewed v4
route instead; the target variable may then remain release identity evidence.

## Accepted bounded risk

The pinned cutover workflow exposes `RENDER_API_KEY` at job scope and uses
third-party actions by floating major tags. Fixing that would move backend
authority and invalidate the already published candidate. For this one
attended, branch-restricted, 90-minute window the reviewer and owner accept the
risk. The key is revoked at every terminal outcome.

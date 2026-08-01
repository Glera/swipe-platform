# Platform Reliability R1-A — rehearsal start receipt

Observed through: `2026-08-01T14:47:08Z`.

Status: **PAUSED before paid provisioning**. Render requires a payment method
on the isolated workspace before it will create the reviewed Starter services.
No service, database, Blueprint instance, GitHub environment, GHCR package or
workflow run was created. Estimated/actual external charge so far: **USD 0**.

## Authority and independent gate

- R12: **GO for the authorized disposable rehearsal only** —
  <https://claude.ai/chat/2b5dbc26-0a72-4cbc-a257-d815ea7c9883>;
- operator: “Да, запускай rehearsal до $3; принимаю временный account-wide
  scope Render API key только для disposable workspace”;
- ceiling: USD 3.00;
- production cutover: not authorized and rejected by candidate v4 code.

## Frozen publication

- backend candidate ref resolved from origin to
  `9ca101ad63627a98faa00a0fb4a03b1bccc352fa`;
- meta evidence branch resolved to
  `2372ec7a5b9efe4b2bb2603169029a1ddf17c28e`;
- rehearsal Blueprint ref remained
  `ccf690d106d7dd1f1d06279972a1851117287053`.

## Isolated owner and read-only boundary

Existing workspace `R1-A Rehearsal 2026-08-01` was reused because it was empty:

- owner: `tea-d9mu8grm8hqs73d5tnbg`;
- visible owners: exact set `{tea-d1m4lmali9vc73euvelg,
  tea-d9mu8grm8hqs73d5tnbg}`;
- disposable services: 0;
- disposable databases: 0;
- owners raw SHA-256:
  `bf6b42af7302bed5d0213f49a096c44da53f3c714bdc82cb538c149f9dc3834d`;
- empty services/databases raw SHA-256:
  `37517e5f3dc66819f61f5a7bb8ace1921282415f10551d2defa5c3eb0985b570`.

The Render repository chooser showed 31 GitHub repositories and included both
`Glera/p4g-workspace-meta` and `Glera/swipe-backend`; no additive GitHub App
permission was needed. The exact repository/branch/path selection reached the
planning page as:

- `Glera/p4g-workspace-meta`;
- `codex/r1a-rehearsal-blueprint-v2-20260801`;
- `render.r1a-rehearsal.yaml`;
- destination owner `tea-d9mu8grm8hqs73d5tnbg`.

The payment-information dialog appeared before any Blueprint deployment.

## Production non-target capture

Immediately after temporary-key creation and before any provider mutation:

- production provider capture: PASS at
  `2026-08-01T14:41:39.260568Z`, SHA-256
  `fd9902418dd87bdb9dfa13237ebce1bb94ff46e9ba688d1abff3f4b093ac1b80`;
- production database raw projection SHA-256:
  `cd85b3008ee358e224c59ef191d0027d75be087906cef518ea1051d6d97771a9`;
- production owner/database IDs matched their reviewed exact identities.

This capture will be repeated with a fresh temporary key immediately before
paid provisioning resumes; it is not reused as a stale before-window proof.

## GitHub/package preflight

- environments were exactly `master - swipe-backend`, `master - swipe-db`;
  no `production` environment;
- repository secrets were exactly `GENERATOR_DEPLOY_KEY`,
  `SWIPE_UGC_DEPLOY_KEY`; variables were empty; no repository `RENDER_*` name;
- GitHub environment/secrets/variables receipt SHA-256 values:
  `8036d09821a03b708e7b694d5926b471dc1e171e880d6f46ce218faddc79760d`,
  `0bcafa2828bac6a4bc3f93da8c93ca39daf8351b61e1f8b50a799e6e1df74c6a`,
  `8fb236d9855d43b214ea37db3296df40b54f11ee84dd9c96394813c4fbdf6423`;
- GHCR `swipe-backend` package lookup returned exact HTTP 404 (package absent),
  stderr receipt SHA-256
  `3f0c085adbaeede99de4ebfdc0c8e7aa9b24940a3e72baff5765a7468d52dbdb`.

## Credential containment

The first temporary Render key was displayed in an agent-visible UI snapshot.
It was treated as exposed, never used, and revoked immediately. A replacement
key was created without displaying its value, used only for the GET-only
captures above, then revoked before this pause. Its permission-restricted local
file was unlinked and verified absent. No account-wide Render key remains from
this attempt.

## Resume condition

The operator must add a payment method to the isolated workspace billing page
and report `готово`. Resume then starts with a new temporary key, a fresh
production/disposable read-only boundary, and the same USD 3 stop gate. Card
details never enter repository, chat or agent tooling.

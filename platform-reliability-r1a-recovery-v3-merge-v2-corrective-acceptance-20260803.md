# R1-A recovery-v3 merge-window v2 — operator corrective acceptance

Accepted: 2026-08-03 UTC.

Status: **ACCEPTED FOR DISPOSITION ONLY; NO OPERATIONAL AUTHORITY**.

The operator accepted the independently reviewed corrective disposition at
exact meta commit
`f0811ed1c5f5f205f7c5da022557e8e6e8dbae79`:

- NC-1 is an authority-document defect; the settled pre-cutover production
  baseline is backend branch `master` with `./Dockerfile.bake`;
- NC-2 is a contained process nonconformity without credential exposure;
- NC-3 is a local bootstrap note;
- backend merge `f2a840517956c4f480fc9d8aaf6f832ebde489d9` is valid source
  authority for preparing a separately reviewed candidate-publication
  request.

This acceptance grants no workflow dispatch, image publication, Render key or
provider mutation, GitHub-environment mutation, deploy, migration, rehearsal,
cutover or Stage 1 runtime action.

The operator's exact decision text was:

> ACCEPT R1-A recovery-v3 merge-window v2 corrective disposition for packet
> f0811ed1c5f5f205f7c5da022557e8e6e8dbae79 only. Accept NC-1 as an
> authority-document defect with settled pre-cutover baseline master +
> ./Dockerfile.bake; accept NC-2 as a contained process nonconformity without
> credential exposure; accept NC-3 as a local bootstrap note. Treat backend
> merge f2a840517956c4f480fc9d8aaf6f832ebde489d9 as valid source authority
> for preparing a separately reviewed candidate-publication request. This
> grants no workflow dispatch, image publication, Render key or provider
> mutation, GitHub-environment mutation, deploy, migration, rehearsal,
> cutover or Stage 1 runtime action.

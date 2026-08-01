# Proposed sentinel PR

Title:

`ci(release): register inert R1-A workflow dispatch sentinels`

Body:

```markdown
## Purpose

Register the two R1-A workflow paths on backend `master` so a later attended
rehearsal can select the independently reviewed full workflow from an exact
non-default ref. GitHub requires a `workflow_dispatch` workflow to exist on
the default branch before it can be selected at another ref.

This PR is registration only. It is not backend PR #33 and does not grant
rehearsal, image-publication, provider-mutation or production-cutover
authority.

## Exact scope

- head: `5ef857f493016501a0eaa733d174eb39ba221d2a`;
- base: `058c772ed5e0d46cf0e7ec4fcddf4f217b3f9ab2`;
- two new files, 118 added lines, no deletion:
  - `.github/workflows/platform-release-image.yml`;
  - `.github/workflows/platform-release-cutover.yml`.

Both sentinels preserve the reviewed full workflow input schemas, use only
`permissions: contents: read`, do not checkout code, reference secrets,
environments, packages or providers, and unconditionally exit 2. Their only
possible execution is a fail-closed refusal.

## Review and CI

- independent local R9: GO, no P1/P2;
- remote branch exact SHA verified through the Git References API;
- expected PR CI: one PostgreSQL acceptance run only;
- recent PostgreSQL PR runs complete in approximately 4.5–6.5 minutes; workflow
  timeout remains 35 minutes.

## Merge gate

Do **not** merge from this PR alone. Immediately before merge, capture fresh
read-only production Render state proving Blueprint Auto Sync and web plus both
surviving cron Auto Deploy settings are OFF, with exact stored branch and
Dockerfile paths. That receipt is single-use for this merge. Merge requires a
separate explicit operator GO after the capture passes.

Stage 1 is outside this PR and remains unmerged.
```

# Platform Reliability R1-A — GitHub rehearsal preflight

Observed: `2026-08-01T13:14:38Z`  
Method: authenticated read-only GitHub API through `gh`

Repository: `Glera/swipe-backend`; observed `master`
`9277047852c0d73f4d3b9a081e1b0b586f48ae3c`.

- environments present: `master - swipe-backend`, `master - swipe-db`;
- no environment named `production` exists;
- repository Actions secrets present: `GENERATOR_DEPLOY_KEY`,
  `SWIPE_UGC_DEPLOY_KEY`;
- repository Actions variables: none;
- therefore no repository secret or variable name begins with `RENDER_`.

Only names were read; no secret value is readable through the API or included
in this receipt. This is a pre-provision boundary check. It creates no
environment and grants no workflow, provider or deployment authority. The
same assertions must be repeated immediately before the temporary GitHub
`production` environment is created, after disposable Render IDs exist.

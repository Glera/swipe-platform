# Platform Reliability R1-A — Blueprint v2 publication receipt

Observed: `2026-08-01T13:17:13Z`  
Repository: `Glera/p4g-workspace-meta`

The immutable rehearsal Blueprint ref was created without rewriting the v1
ref and then resolved back from origin:

- ref: `codex/r1a-rehearsal-blueprint-v2-20260801`;
- remote commit:
  `ccf690d106d7dd1f1d06279972a1851117287053`;
- custom Blueprint path: `render.r1a-rehearsal.yaml`;
- reviewed Git blob: `809aa531176f44890f72dfa4953ee36148113629`;
- file SHA-256:
  `4361c8c826f6868de1d9bd34b2050fc0af1d05e2fa1974f2c832e8790b2c6710`.

The YAML pins all three disposable services to backend ref
`codex/r1a-rehearsal-baseline-v2-20260801`. The backend successor refs were
also resolved from origin in the same read-only verification:

- baseline: `0add5f3fbd2fa60a3a0a3ae2ba6f20ed333dd725`;
- candidate: `d0a9fa11cd88e3ae4202f7cafa631a319b622492`.

No pull request, workflow dispatch, GHCR publication, Render resource,
environment or deployment was created by this publication. Moving this ref is
forbidden; any source change requires a new reviewed ref name and receipt.

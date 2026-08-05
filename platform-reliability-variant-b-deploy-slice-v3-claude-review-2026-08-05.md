# Independent Claude review — Variant B deploy slice v3

- Date: 05.08.2026.
- Reviewer: Claude Code, fresh read-only Fable session.
- Meta target: `5b1a6050a51ac911a5a9792302f8a9feef8835c0`.
- Target file SHA-256:
  `269c0400a290648485c98a37d7d3afa8bee50b51f2b9c51a9e2c3a2d2fc60f69`.
- Executable backend target:
  `0e9e940a2a762f0e35f93c3e35f3afcfea6baaa4`.
- Mode: detached clean worktrees, read-only tools; no dispatch, merge, Render
  mutation, migration or production write.
- Verdict: **GO**.

## Closure of the v2 NO-GO

### Inter-phase exact configuration CAS — closed

Section 7 now mandates a GET-only exact projection immediately after
`prepare-source` and immediately before `deploy`. It covers Blueprint
auto-sync, service identity/type/owner, image runtime, auto-deploy, exact
candidate image path, registry credential, health path, preDeploy command and
the original live deploy CAS. A field that Render does not expose is a STOP,
not permission to assume equality.

The residual seconds-window before dispatch is acceptable for the explicit
zero-audience posture: deploy POST names the immutable candidate digest;
removing preDeploy prevents a committed release receipt, and
`verify-applied-db` fails with `applied_receipt_missing`. The candidate accepts
schema `0070..0073`, so the bounded worst case is a live candidate on a
compatible `0070`, followed by terminal NO-GO before roster work.

### Ambiguous remote failures — closed

Section 9 classifies read-back state rather than assuming where an HTTP or
workflow failure occurred. It distinguishes unchanged/exact/partial
prepare-source outcomes, no-deploy/in-progress/terminal-failed/live-but-late-
verification deploy outcomes, and includes explicit phase-4 and cleanup
failure branches. There is no retry before classification and no second deploy
while an async outcome is unresolved.

### Exact-key revocation proof — closed

The same key bytes are retained in a non-emitting local holder, prove
`GET /v1/users → 200` before the window, and prove `401` after operator revoke.
Only then are the GitHub secret and local holder removed. This proves the
revoked key, not a newly created key.

### Restart versus deploy — closed

The route now states literally that Render Restart keeps the live instance
configuration/commit, while a standard deploy after the PATCH consumes the
current image-backed configuration. Both are forbidden in the inter-phase
gap.

## Executable cross-checks

- Image workflow inputs in the route match
  `.github/workflows/platform-release-image.yml`; it contains no Render
  credential or Render API access.
- The migration graph is the exact linear `0070→0071→0072→0073` chain; the
  manifest range required by patch A matches it.
- Coordinator performs bounded env staging with source CAS, one immutable
  image deploy POST, poll-to-live, `verify-applied-db` job and health check.
- preDeploy upgrades under one advisory lock and writes one bound receipt;
  `verify-applied-db` rechecks receipt identity, revision and schema
  capability against the live DB.
- rollback authorization keys are deleted by a deploy operation and rollback
  is a distinct operation never launched implicitly.

## P3 observations — do not block this route

1. Staged `PLATFORM_RELEASE_*` values persist after success or after a failure
   occurring beyond the env-staging helper. The route records their names;
   removing stale values can be considered in a later cleanup pass.
2. The workflow timeout is 35 minutes while deploy and verification polls can
   each consume up to 20 minutes. A slow release may enter the already-defined
   manual classification branch more often than necessary.
3. Coordinator health smoke proves service identity, not backend build
   identity. Phase-4 build identity remains an explicit operator/read-only
   deploy-image check.
4. If Render omits registry/preDeploy association from the service GET, the
   exact-projection phase stops safely and requires observable proof or a
   separately reviewed coordinator patch.

## Review boundary

The GO binds the target file hash and backend SHA above. It remains valid for
receipt-only/status edits. It burns if executable workflow/coordinator files,
immutable pins, dispatch inputs or failure semantics change.

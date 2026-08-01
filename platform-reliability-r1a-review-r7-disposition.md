# Platform Reliability R1-A — rehearsal delta review R7 disposition

Status: all specification/code findings are addressed locally. The external
GitHub-plan prerequisite and publication of the accepted new refs remain
unperformed. Another independent review is required before publication or an
operator action request.

| Finding | Disposition |
| --- | --- |
| P1-1 GitHub Free environment unavailable | Accepted. The contract now requires GitHub Pro (or approved Team) before the sentinel merge and rehearsal, followed by a read-only capability receipt. Repository-scoped Render secrets are explicitly rejected as non-equivalent. This remains an operator-owned paid prerequisite. |
| P1-2 exact refs absent | Accepted. Added an ordered publication step using new immutable dated ref names for baseline, candidate, client evidence, sentinel and frozen meta Blueprint source. Old R4/R5 refs are never force-pushed. Publication waits for follow-up review. |
| P2-1 Blueprint triple | Accepted. The contract pins Glera/p4g-workspace-meta, a frozen dated branch and custom render.r1a-rehearsal.yaml path; mutation-free Render validation must prove the exact four-resource plan before creation. |
| P2-2 shared GHCR package | Accepted. The shared package is now the sole declared production namespace in rehearsal. Exact baseline/candidate versions, attestations and sidecars are retained as rehearsed cutover artifacts. Render pull uses an operator classic PAT with read:packages only; credential and PAT are revoked after rehearsal. |
| P2-3 sentinel production gate | Accepted. A fresh single-use production provider capture is mandatory immediately before the sentinel merge, independently repeated later for PR 33. |

P3 dispositions:

- exact workflow path/ref and a fail-closed baseline semantics probe are now
  explicit;
- dashboard Off evidence is bound to IDs/time;
- the Blueprint source ref is frozen before creation;
- the unreviewed post-image snapshot was removed in favor of the coordinator's
  fresh GET receipt;
- every cutover operation pins the dated candidate ref;
- release publication forbids blind reruns; recovery requires proof that no
  image/artifact exists and a new independent approval;
- exact health bytes plus SHA-256 are separate evidence;
- the remaining positive-control and legacy-path observations stay
  non-blocking and do not weaken fail-closed behavior.

No external state changed in this disposition.

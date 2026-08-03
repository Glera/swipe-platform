# Independent review — R1-A recovery v3 merge window

Review exact meta commit
`b285d3085bb24facd4396f9d040224e9ec0b1399` in
`/private/tmp/p4g-r1a-meta.YPUxDz`, focusing on:

- `platform-reliability-r1a-recovery-v3-merge-authority-request-20260803.md`;
- `platform-reliability-r1a-recovery-v3-merge-runbook-20260803.md`.

Read-only review: do not edit files, use web tools or call mutation APIs.

Return `GO` first only if no P1/P2 remains; otherwise `NO-GO` and every P1/P2
with exact file/line. List P3 separately. Keep the answer under 700 words.

Context:

- backend PR #52 exact base is `f0cc933...`, exact head `8ea6f1d...`, exact
  tree `a7e4c64...`;
- independent implementation review is already GO and fresh PR CI is 28/28;
- operator selected option A, authorizing recovery branch/draft PR only;
- merge/deploy/publication/cutover were still forbidden, so this packet must
  request a new, narrow operator GO;
- prior concurrent master drift was caught during an earlier preparation
  window, so exact CAS and cleanup are essential;
- production Auto Sync and all Auto Deploy controls must be read fresh and
  remain off before source merge;
- no active Render API key exists; a temporary account-wide key would be
  created and revoked inside the authorized attended window;
- source merge must not deploy because Render Auto Deploy is off;
- candidate publication from the eventual merge result is later and must run
  the exact private OCI LKG gate before build/publication.

Verify:

1. The authority boundary is narrow, unambiguous and does not silently grant
   workflow dispatch, publication, Render mutation, deploy, DB job/migration,
   rehearsal, cutover or Mission runtime action.
2. Every external mutation in the proposed window is explicitly named and
   cleanup is complete on all failure paths.
3. GitHub PR/master/check CAS, Render provider capture and the post-merge
   parent/tree proof are sufficient and internally consistent.
4. The `gh` commands are valid for a draft PR and do not accidentally enable
   auto-merge or queue a later merge.
5. The residual lack of exact-base input in GitHub's merge API is disclosed
   and handled as strongly as possible without adding persistent authority.
6. Old candidate-v2 cannot be mistaken for the candidate derived from the
   recovery merge.
7. The exact operator form matches the body and is safe to execute only when
   it names the packet commit.

A GO accepts only this authority request/runbook for operator decision. It
does not itself authorize execution.

# Historical process artifacts — index (13.08.2026)

Operator decision S3 removed redundant review rounds from the active tree.
Nothing was erased from git history. The pre-compaction snapshot is commit
[`d9c6d6d47cd527e5deacd7ebb2af4823e7a8273d`](https://github.com/Glera/p4g-workspace-meta/tree/d9c6d6d47cd527e5deacd7ebb2af4823e7a8273d).

Retrieve a known artifact with:

```sh
git show d9c6d6d47cd527e5deacd7ebb2af4823e7a8273d:<root-file>
```

List the compacted review material with:

```sh
git ls-tree --name-only d9c6d6d47cd527e5deacd7ebb2af4823e7a8273d \
  | rg 'review|disposition|prompt|raw'
```

Compacted series (77 tracked root files):

- cohort observability review request/findings/dispositions;
- Island Social core P1–P4 review packets and repeated Codex rounds;
- mechanic onboarding and Minesweeper roster review notes;
- Mobile Review performance/fix packets and seven review rounds;
- Phase B0 bounded tooling, sync and six stack cross-review rounds;
- platform reliability cross-review, ordering and Variant B review rounds;
- Play for Good stage 0/1/TZ prompts, raw outputs, dispositions and GO notes;
- Share Challenge review packets.

Canonical core/release receipts, execution evidence and operating-model
handoffs remain in the active tree. From this decision onward, Tier 0/1 review,
ordinary CI and handoff evidence belongs in its GitHub Issue/PR or task output;
new standalone root review files are not created.

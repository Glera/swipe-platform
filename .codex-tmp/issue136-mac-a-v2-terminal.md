## #136 one-shot executor v2 — Mac A ACTIVE / A→B proof complete

- implementation: [PR #205](https://github.com/Glera/p4g-workspace-meta/pull/205)
  merged as `dd4d4a92c6ca21af11ae0d798c9d22c24ad1e5b9`, tree
  `d9e18e7868948d175e1cc03393de758d5fceb806`;
- PR CI `32940565032` and master CI `32940614559`: SUCCESS;
- full local suite: 329/329 PASS;
- final correction-only Opus 5/high delta: PASS, P1=0/P2=0;
- legacy Mac A binding `88ec705f…3494` is append-only HOLD;
- active Mac A executor profile digest:
  `d96afe381a44521b53b27e5732d26e683e88bc92b213d59dec3aad9e4b4515e8`;
- active binding digest:
  `c750428f79f72baad469db0f40c9a628e000a3384d3cdf407484cc1c625aba01`;
- exact merged runtime checkout and mode-0600 v2 config verified;
- first ordinary empty tick: `idle`, exit 0, AI calls 0;
- source dogfood wake:
  [#94 comment 5421797151](https://github.com/Glera/p4g-workspace-meta/issues/94#issuecomment-5421797151);
- one fresh `gpt-5.6-sol/xhigh` job claimed it exactly once, produced one valid
  JSONL terminal, then atomically published the causal successor
  [#94 comment 5421839018](https://github.com/Glera/p4g-workspace-meta/issues/94#issuecomment-5421839018);
- gate verified the successor and advanced consumed cursor to `5421797151`;
  pending/attention are null, exit 0, retry 0.

This proves the Mac A half of the new last meter without any live-session,
writer-lock or app-server resume dependency. The successor is assigned to the
existing active Mac B owner and carries the exact profile receipt line.

The one remaining physical boundary is the one-time Mac B profile bootstrap.
Exact no-reconstruction packet:
[comment 5421857565](https://github.com/Glera/p4g-workspace-meta/issues/136#issuecomment-5421857565).
After it succeeds, the gates—not the operator—must carry the remaining two
A→B→A dogfood rounds and subsequent #151 work.

No product, deployment, migration, credential, setting, permission or
infrastructure action occurred.

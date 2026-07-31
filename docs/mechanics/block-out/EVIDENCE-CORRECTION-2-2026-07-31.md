# Block Out v1 — evidence correction 2

- Process: `reference-replication.v3`
- Primary: Falcon/CYLINDER Android `1.0.177+177`
- Playables commit: `63eca7617b662e0d5d82011afd6939f042b72083`
- Status: **machine-pass; final causal operator review pending**

## Why work continued

The two-round cap was an internal stop rule, not an operator requirement. It
now limits blind/unmeasured taste tuning only. When a failed MUST/MAJOR has a
measured causal delta, correction remains part of the original replication
goal until parity or a real blocker.

Correction-1 identification was not a fair final verdict. The channel included
pre-takeover motion (continuous native drag versus a shorter Twin input), used
texture-sensitive adjacent-frame energy, and did not match gate scale/crop.
Those factors made Reference identifiable without isolating consume feel.

## Measured implementation correction

Native/Twin frame ledgers localized a genuine presentation delta as well:

- Twin accelerated into a late whole-block burst; native takeover is
  front-loaded;
- future Twin fragments were visible inside the intact block;
- all Twin depth layers appeared too synchronously;
- Twin added an active gate glow/stream absent from the native consume;
- the post-body cloud was sparse and its fade too back-loaded.

The shipping profile/runtime now:

- uses front-loaded cubic-out body travel and scale;
- emits fragments progressively from gate-facing to rear material during pull;
- reveals each fragment only when its leading edge crosses the gate plane;
- moves emitted fragments continuously through throat and exhaust;
- linearly fades the tail from the measured `705 ms` throat to `1,565 ms` end;
- uses `0.29 cell ±35%` chunks and removes active-consume gate glow.

Twin and Production Original still consume the same presentation profile. The
production graph still denies the internal Twin dataset and Falcon identifiers.

## Causal review channel

`causal-occupancy-v3` uses only the 1.6 s post-takeover segment, sampled at
20 fps. Each source is background-subtracted using its own stable post-event
frame; activity is the maximum RGB-channel delta over threshold 40, reduced to
16×16, lightly blurred and expanded to 500×500. The spatial crop is anchored
to measured gate center and width. Both clips receive the same 300 ms black
pre-roll.

This suppresses static identity, palette, texture, pre-takeover gesture path
and unmatched gate scale while preserving causal occupancy and cadence.

| Artifact | SHA-256 |
| --- | --- |
| final raw Twin capture | `0021ea38520d51ffb06c00b42e4539aaaa73cce7e353156ce6ea1433ac60d70e` |
| raw capture receipt | `b5c881edf10d040a4e79c057678bf39caeeab3bf47f1219c3245d00325a8da06` |
| Reference causal clip | `7d917735accc184c112999e9f2a91a90e05d71f16f68965368c5a53989dd9fe0` |
| Twin causal clip | `0af3132ff69b5f724772b25b00f8241962dfd025b4585970cb6618d168c00cba` |
| Review config | `fc273bb194424305d47040ae866e42206d330829875c9fb34cd9866ac37f2d91` |
| Review page | `27a819645470ae31d2a3548a65ed96f9cad31e88f873d7e5aff36dc7d16d5392` |

Post-pre-roll metrics:

- overall Pearson correlation: `0.945`;
- overall normalized RMSE: `0.106`;
- total occupancy-area ratio Twin/Reference: `0.875`;
- particle-only Pearson correlation: `0.801`;
- particle-only normalized RMSE: `0.218`;
- particle-only occupancy-area ratio: `0.841`.

Reference/Twin start peaks are effectively matched (`31.12` versus `30.86`).

## Verification

- Block Out tests: `30/30` pass.
- TypeScript: pass.
- AppLovin and SWIPE production builds rebuilt from the restored production
  entrypoint; production deny passes.
- Review 4 receipt SHA-256:
  `db17c3f583a3b7da637f142cccb723e50942f5bd8208aff712061351ea3b70da`.
- Browser cadence: median/p95 `16.7/16.7 ms`, `0/497` frames over `50 ms`;
  pickup changes `18,203` sampled pixels on first rAF; no page errors.
- Final review page QA: both sources load at `500×500`, `1.9 s`; synchronized
  playback drift is below `1 ms`; two decisions enable receipt export; no page
  warnings or errors.

The only remaining action is the repeat-consistent two-choice operator receipt
on the final causal Reference→Twin surface. Twin→Original is not repeated:
round 1 already returned `same / same`, and both paths share this profile.

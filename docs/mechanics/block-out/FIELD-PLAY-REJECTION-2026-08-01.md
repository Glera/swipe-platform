# Block Out field-play rejection — 01.08.2026

- Authority: operator (`O`)
- Reference: Falcon/CYLINDER Android `1.0.177+177`
- Rejected implementation commit: `4e130fd2c8b09f34b045ab8e795c940c13b6b8d1`
- Prior disposition: `accepted`
- Current disposition: `superseded/false-positive`
- Process revision: `reference-replication.v3.1`

## Observed MUST/MAJOR failures

1. A rear figure can be removed through the head of another figure standing at
   the gate. Reference gate takeover is physically blocked by that figure.
2. Consume is visibly different: the implementation shrinks and draws the
   intact body over the gate. Reference keeps body scale, progressively hides
   it at the gate boundary and emits particles at that boundary, producing a
   grinding read. Production should implement this by drawing the body below
   gate foreground art, not by allocating a resource mask.
3. A figure can sometimes exit through a gate of the wrong colour/role.
4. A figure can sometimes fail to return through a corridor it just traversed;
   the carried highlight/outline appears to catch.

The operator disposition is that overall game feel remains far from the
reference. This is not a MINOR polish delta and reopens the replication goal.

## False-positive diagnosis

The final Reference→Twin review used one positive gate-consume micro-scenario
and a lossy normalized causal occupancy projection. That surface was useful to
compare gross timing but could not observe:

- exact intact-body scale;
- gate/body foreground order and progressive occlusion;
- boundary-local particle emission in the raw clean frame;
- blocked-throat and wrong-role negative rules;
- reverse-corridor browser input behavior.

The old receipts remain immutable records of that limited comparison. They no
longer satisfy acceptance.

## Mandatory regressions before implementation changes

| Scenario | Model | Real browser pointer | Raw raster | Diagnostic |
| --- | --- | --- | --- | --- |
| `BO-GS-07` blocked gate throat | required | required | state/visual persistence | optional |
| `BO-GS-08` wrong-role gate | required | required | role/gate congruence | optional |
| `BO-GS-09` reverse corridor | required with alternate segmentation | required | carried bounds = collision bounds | path overlay |
| `BO-GS-10` gate grinding | cadence/scale invariant | actual exit gesture | required at five keyframes | edge/motion supplemental |

No normalized/downsampled channel can be the sole verdict. A final review must
exercise the complete field-play matrix, not only the corrected consume clip.

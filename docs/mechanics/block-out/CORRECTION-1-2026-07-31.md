# Block Out v1 — correction round 1

- Process: `reference-replication.v3`
- Primary: Falcon/CYLINDER Android `1.0.177+177`
- Playables commit: `95b568e`
- Status: **operator disposition required; automatic correction budget exhausted**

## Round-1 operator receipts

| Comparison | Repeat result | Disposition | Receipt SHA-256 |
| --- | --- | --- | --- |
| Reference→Twin | Reference selected `2/2` | correction required | `d917a4c053fc2f652b1ad0df6c5cdaab28cd0c6022236eaffa9407b65e2360b8` |
| Twin→Original | `same / same` | feel preserved | `3fdba2874561cbbc57746f4a665a79c921564754b1fe3167820cbeef001d0c4e` |

The first Reference→Twin channel retained the complete static board/layout in
an edge rendering. It therefore allowed identity-based classification and did
not isolate motion strongly enough. The result still correctly triggered a
bounded correction, but it is not used as proof of a specific motion delta.

## Derived correction

Frame-level motion analysis and the native contact sheets exposed a real delta
inside the same scenario:

- native uses roughly a few dozen large irregular chunks; the candidate used
  `80` small regular squares for a 2×2 block;
- native shows the gate-facing layer in the particle zone about `99 ms` after
  takeover;
- the candidate held all fragment starts near the source body until the global
  `705 ms` throat phase.

Correction 1 keeps the measured `75/705/1565 ms` aggregate cadence, but changes
the spatial projection to:

- `3×3` fragments per cell instead of `5×4`;
- `0.23 cell ±35%` irregular rotating chunks;
- `1.6 cell` tangent scatter and a longer randomized exhaust envelope;
- front-to-back breakup: the gate-facing layer can exhaust at onset while the
  rear layer still converges at the measured throat.

Twin and Production Original consume the same corrected presentation profile.
The exact internal Twin dataset remains denied from both production bundles.

## Review-surface correction

Reference→Twin now fails closed unless its config declares:

- `motion-energy-v2`;
- static identity suppression;
- spatial alignment.

The new channels use adjacent-frame temporal difference, matched gate-centred
crops, 16×16 motion-energy reduction and equal 500×500 output. Static board,
palette, UI, text and layout no longer answer the identification question.

| Artifact | SHA-256 |
| --- | --- |
| `reference-motion-energy-v2.mp4` | `52395d6e3196d26612d0ddef804c78f157524bfce5307ff99a362c19214bc402` |
| `twin-motion-energy-v2.mp4` | `501a0c751cb8a0857dc1e6a4542e3725eb31f7b74652f4fc03be7df308788a41` |
| `reference-twin-correction-1.review.json` | `2ffded3747621d0855bb0b6befd7c9cc9fdaebe14bf6e0c530f6ad9692012d4f` |
| `reference-twin-correction-1.html` | `6e336f945a59feff826e34e86242c8ab6dd0ae51159dc80314d78083292b7cc0` |
| corrected Twin raw capture | `ddc01a9b8cbeb334f9ed18645e6bd17f4c671621a5463dabdabc694163887cdb` |

The page was loaded through a local HTTP server: both videos report
`500×500`, `1.966667 s`, all choices mount, export begins disabled and page
errors are empty.

## Machine receipts

- Block Out tests: `28/28` pass.
- Meta review/lab tests: `19/19` pass.
- Review 4 browser receipt:
  `38042c1133fae0aeeacafdc278ad1ef65d911a52703d38390f30a539f6186d6d`.
- Correction visual proof against `9d7f203`: both before and after reach real
  wins; patch SHA-256
  `51ea1ee74e677f7431932c91842f2796f63028e0734ef31223bc01264e86e780`;
  result SHA-256
  `ab920a435d3b3080585260ddf51a4d35020f7e05a27bc63f2ca53442012b89a5`.

## Correction-1 operator receipt

- Receipt SHA-256:
  `86adeae753763693d68e4bc1efdb583a6e49ea3bc1d3b9fd16718d9288b3aacc`.
- Immutable choices: `B`, then `A` after the hidden A/B mapping reversal.
- Semantic selection: Reference `2/2`.
- Hidden repeat: consistent.
- Machine disposition: `correction-required`.

The normalized channels still expose a front-loaded Reference envelope versus
a staged Twin envelope. On the review clips, Reference peaks near `600 ms` and
Twin near `833 ms`; Twin's strongest motion sits lower in the gate-centred crop
and retains a late tail. The pre-takeover motion envelope also differs, so the
receipt proves remaining distinguishability but does not by itself attribute
all of it to shipping presentation rather than capture alignment.

No further automatic correction round is authorized. The remaining gate is an
explicit operator choice between accepting the known delta, authorizing a
diagnostic-only re-alignment, or granting an exceptional additional correction
round after diagnosis.

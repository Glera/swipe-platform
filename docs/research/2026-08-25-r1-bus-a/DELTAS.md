# Bus A — R0 clone pack → R1 native deltas

| R0 question / assumption | Native R1 result | Disposition |
| --- | --- | --- |
| `com.rollic.busjam` guessed; `com.nt.games.busjam` treated as another publisher | Sensor Tower unified identity and installed build confirm `com.nt.games.busjam` as Bus Jam / Rollic Games | corrected and frozen |
| Native staging capacity unknown (`2/5/8` family spread) | exactly `5` visible staging tiles | resolved |
| Capacity three inferred from clones/editor evidence | every receiver has three seats and leaves on the third passenger | confirmed |
| Clone exposed the whole receiver sequence | native levels 1–8 expose active plus one next preview; later order was not visible | R0 assumption rejected |
| Fail could be full-buffer or true deadlock | fifth staged passenger opens `Out Of Tiles` while matching moves still exist | native capacity-full fail confirmed |
| Auto-board from staging expected | staged matching passengers board automatically after receiver change | confirmed |
| Staging order may be a multiset | visible leftmost placement is ordered; over-capacity matching case untested | keep ordered in solver key |
| No native timing | passenger-to-receiver `0.8–1.0 s`; staging `0.4–0.7 s`; receiver swap `2.2 s` | resolved as PTS bands, not shipping tolerance |
| Early ramp known only from clone levels 1–4 | native levels 1–8 add interleaving, three/four/five colors, irregular masks, counted tunnels and Undo | expanded |
| Hidden passengers described only by text | counted tunnels reveal hidden sequence entries as outlets clear | mechanically observed; exact count ABI open |
| Fail/restart economy unknown | five lives, `-1` give-up, 30-minute refill, `500` soft-currency +2 continuation | observed and excluded from Original |
| Hint unknown | first observed assist is Undo at level 8; no explain-hint observed | classify as assist, not solver hint |
| Gameplay timer uncertain | none observed through level 8 | provisional absence |

## R0 recommendations retained

- copy the bounded-buffer planning rule, not transport identity;
- fixed receiver capacity and per-color multiples of three;
- original secondary cues beyond color;
- no lives, rewarded continuation or purchase pressure in a feed slice;
- exact layouts are evidence/Twin-only, never a shipping level bank;
- organic novice timing remains an operator taste gate.

## Material first-party decision

Native capacity-full failure is causally clear but punitive. R0 recommended
rejecting overflow and failing only on true deadlock. R1 does not decide this
product choice: a neutral Twin may reproduce native behavior for causal proof,
while an Original taste session compares the fairer policy on the same logical
state.

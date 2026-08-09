# BS-R — Bubble Witch 3 reference packet

- Дата записи: **2026-08-09**
- Primary reference: **Bubble Witch 3 Saga**
- Android package: `com.king.bubblewitch3`
- Version: `10.16.1.0` (`versionCode=1001601000`)
- Device: Samsung `SM-A326B`, Android `11`, `720×1600`, `300 dpi`, `60 Hz`
- Исследованный диапазон: onboarding Levels `1–2`
- Локальная запись: [`evidence/reference/`](evidence/reference/)

`R` ниже означает непосредственно наблюдённый reference-факт. `P` означает
собственное числовое решение bounded-прототипа. Brand, characters, copy, music,
backgrounds and bubble-face art are evidence only and are excluded from every
prototype build.

## Выбранный класс правила

Эталон — portrait bubble-cluster shooter с дискретным hex-grid settle:

1. удержание задаёт непрерывную траекторию с максимум одним отражением от стены;
2. отпускание запускает текущий цветной шар по показанной траектории;
3. столкновение всегда завершается в одной свободной hex-ячейке;
4. связный кластер из `3+` шаров цвета выстрела лопается;
5. все элементы, потерявшие связь с потолком, отделяются одним causal batch и
   падают;
6. целевые существа спасаются, если их содержащий bubble лопнул или отделился;
7. уровень выигрывается после спасения всех целей, а не после очистки любого
   произвольного подмножества поля;
8. запас выстрелов уменьшается на release; исчерпание запаса при незавершённой
   цели — fail.

Level 1 нужен как эталон `match → unsupported drop → six-target terminal`.
Level 2 нужен как эталон отражения, no-match settle и нетерминального rescue.

## Захваченные сценарии

| Scenario | Action script | Evidence | Наблюдение |
| --- | --- | --- | --- |
| Level 1 success | yellow straight shot в нижнюю жёлтую опору | `bubble-level1-success.mp4`, `bubble-level1-shot1-contact-10fps.png` | один выстрел лопает опору; оторванное поле падает; шесть targets засчитываются последовательно; terminal начинается после rescue settle |
| Level 2 bounce | red shot через левую стену в красную опору | `bubble-level2-reference.mp4`, `bubble-level2-bounce-contact-10fps.png` | preview и фактический путь совпадают на отражении; match отделяет нижний blue subtree; `0/6 → 2/6` |
| Level 2 no-match | red shot под blue subtree | `bubble-level2-no-match.png`, `bubble-level2-two-reds.png` | первые два red закрепляются и расходуют выстрелы без pop |
| Level 2 match after build-up | третий red в созданную пару | `bubble-level2-match3-effect.png` | ровно созданный кластер исчезает, неподдерживаемая верхняя часть не меняется |
| Fail/retry | Quit Level → confirm life loss → skip fail → Retry | `bubble-fail-restart-reference.mp4`, `bubble-fail-result.png`, `bubble-after-retry.png` | fail presentation отделён от retry; retry восстанавливает точный initial board, shots и objective |

## Геометрия и feel — числа до Engine

Координаты `R` относятся к физическому capture `720×1600`; игровой surface в
activity занимает `720×1465`. Prototype targets даны в logical `390×700`.

| Параметр ощущения | R: reference | P: prototype target | Источник / оговорка |
| --- | ---: | ---: | --- |
| Bubble diameter | `62–65 px` | `34 px` | Level 1/2 screenshots; uniform scale `~0.54` |
| Hex horizontal pitch | `64±1 px` | `34 px` | adjacent centers in opening row |
| Hex vertical pitch | `55–56 px` | `29.5 px` | `sqrt(3)/2` projection |
| Shooter center | `(360,1085) px` | `(195,590)` logical | ready screenshots; layout may lift in compact landscape |
| Board ceiling | `y=218±4 px` | `y=82` logical | first playable row below HUD wave |
| Side collision rail | `x≈31–33` / `687–689 px` for center | `x=18` / `372` | one radius from physical edges |
| Touch-to-aim response | first changed frame, `≤35 ms` | `≤33 ms` | full-rate H.264 is `55.8 fps`; two-frame conservative bound |
| Aim stroke | `4–6 px`, cyan/white glow | `3 px` core + `8 px` glow | screenshots and tutorial loop |
| Preview reach | to first grid collision after at most one bounce | same discrete collider as shot | Level 2 tutorial and live aim |
| Direct shot speed | `~1.55–1.80 kpx/s` | `900 logical px/s` | Level 1 `10 fps` contact sheet; ±`100 ms` measurement error |
| Bounce shot speed | visually constant across both legs | same `900 logical px/s` | Level 2 contact sheet; no easing observed |
| Wall reflection | specular, no pause at wall | `≤17 ms` direction change | no held frame at bounce in full-rate clip |
| Collision-to-snap | `≤100 ms` | `80 ms` ease-out | contact sheet resolution bound |
| Collision-to-pop onset | `≤100 ms` | `50 ms` | match begins in next `10 fps` cell |
| Match core burst | `~350–550 ms` | `440 ms` | opacity/scale burst before long sparkle tail |
| Match sparkle tail | `~0.8–1.2 s` | `900 ms`, low tier `420 ms` | Level 1/2 effect sequence |
| Unsupported-drop onset | `~150–300 ms` after match onset | `180 ms` | support disappears before detached bodies accelerate |
| Detached fall | `~1.0–1.5 s` through gameplay surface | gravity `1800 logical px/s²`, cap `1200 px/s` | Level 1/2 contact sheets |
| Rescue cadence | `~180–260 ms` per target in mass batch | `220 ms` stagger | Level 1 six-target sequential count |
| Next-bubble promotion | `~180–260 ms` | `220 ms` | shooter replenishment after non-terminal shot |
| No-match input lock | no visible lock after snap, conservative `≤300 ms` | `220 ms` settle lock | screenshots before/after consecutive shots |
| Terminal gameplay settle | `~3.0–4.0 s` from mass impact to full celebration | `3200 ms` from last target detach | Level 1 contact sheet |
| Win-score presentation | multi-second count-up after terminal | bounded prototype ends after `900 ms` win hold | product delta: feed round must not inherit meta score count-up |
| Fail-to-retry card | `≤1.0 s` after skipping fail scene | `650 ms` fail hold, immediate Restart affordance | `bubble-fail-restart-reference.mp4` |
| Restart state | exact Level 2 board, `32` shots, `0/6` | exact LevelSpec snapshot | `bubble-after-retry.png` |

Timing error bars are explicit: contact sheets prove `100 ms` buckets; values
below `100 ms` come from full-rate frame inspection and keep a conservative
two-frame bound. A future Review 4 may tighten numbers but may not silently
change event order.

## Transition parity matrix

| Pre-state | Input / action script | Reaction checkpoint | Settle / effect checkpoint | Final state | Naive failure caught | Reference evidence | Executable fixture |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Level 1 opening, yellow current, yellow bridge supports all six targets | hold straight upward, release once | shot counter `30→29` at release; projectile follows preview; collision flashes before any removal | yellow match bursts first; every now-unanchored identity enters one `dropBatchId`; six targets rescue at `220 ms` cadence | objective `6/6`, no live target, terminal only after last rescue settles | clearing only the three matched bubbles and leaving unsupported bubbles suspended; or declaring win at collision before drop/rescue | `bubble-level1-success.mp4`; `bubble-level1-shot1-contact-10fps.png` | `bubble-shooter-engine.test.mjs / terminal support-cut emits ordered match-drop-rescue-win trace` |
| Level 2 opening, red current, lower blue subtree blocks a direct lane | hold to left rail until preview has one bounce, release | preview and shot share exact wall contact and reflected segment; no pause at wall | collided red cluster bursts; disconnected lower blue identities fall as one causal batch; two target ids rescue | objective `2/6`; upper ceiling-connected component remains; next shot becomes ready | renderer-only reflection differing from engine collision; snapping projectile to nearest screen bubble instead of predicted cell | `bubble-level2-reference.mp4`; `bubble-level2-bounce-contact-10fps.png` | `bubble-shooter-presentation.test.mjs / bounce preview and shot resolve the same landing cell` |
| Level 2 after bounce, no adjacent red pair at intended blue boundary | shoot red at blue-supported empty neighbor | shot travels and snaps; no pop event exists | `220 ms` settle completes; board contains the incoming red id; next bubble promotes | shots decrement by one; target count unchanged; phase returns `ready` | treating two total reds or Euclidean near-colors as match-3; deleting incoming bubble because no match | `bubble-level2-no-match.png` | `bubble-shooter-engine.test.mjs / no-match appends exactly one stable cell` |
| Same boundary after two consecutive red no-match shots form a connected pair | shoot third red into either legal neighbor of the pair | snap event names incoming id and exact cell; connected-color flood includes exactly three created reds | three ids enter `popBatchId`; ceiling-connected survivors stay fixed; particles do not mutate reducer | created reds absent; objective and unrelated board identities unchanged | global color deletion; unsupported calculation before removing the match; same final count with wrong identities | `bubble-level2-two-reds.png`; `bubble-level2-match3-effect.png` | `bubble-shooter-engine.test.mjs / third red pops only its connected component` |
| Failed Level 2 attempt with mutated board and `28` remaining shots | confirm Quit, skip fail scene, tap Retry | fail state freezes gameplay and presents retry separately | restart discards all transient shot/pop/drop ids and restores LevelSpec snapshot | opening board, `32` shots, objective `0/6`, initial current/next queue | restarting only counters while retaining changed cells; replaying stale settle after restart | `bubble-fail-restart-reference.mp4`; `bubble-after-retry.png` | `bubble-shooter-engine.test.mjs / restart invalidates stale transitions and restores snapshot` |

## Reference parity checklist

- [ ] Aim feedback appears within `33 ms` of an accepted hold.
- [ ] Aim preview uses the same wall radius and collision authority as the shot.
- [ ] Preview stops at the first legal landing collision.
- [ ] At most one wall bounce is shown in the bounded prototype.
- [ ] Releasing outside the shooter still commits the currently previewed shot.
- [ ] The shot counter decrements at release, not at settle.
- [ ] Projectile speed is constant along direct and reflected segments.
- [ ] Wall reflection has no visible dwell.
- [ ] Shot lands in one deterministic hex cell on all FPS tiers.
- [ ] A connected cluster of two does not pop.
- [ ] A connected cluster of three or more starts pop within `50 ms` of snap.
- [ ] Only the connected same-color cluster pops; same colors elsewhere survive.
- [ ] Unsupported detection runs after match removal.
- [ ] Every detached identity is named in a typed drop batch.
- [ ] Detached bubbles accelerate rather than move at constant speed.
- [ ] Targets rescued by a support cut are counted from the drop batch.
- [ ] Multi-target rescue uses `220±40 ms` visible cadence.
- [ ] Next bubble promotion settles in `220±40 ms`.
- [ ] No-match returns to ready within `300 ms` after snap.
- [ ] Input during flight/pop structural lock is discarded, never queued.
- [ ] Terminal state waits for the final target rescue settle.
- [ ] Fail cannot happen while a structural effect from the last legal shot is pending.
- [ ] Restart restores cells, queue, shots and target count exactly.
- [ ] Pause freezes shot, pop, drop, rescue and terminal remaining time.
- [ ] Low tier changes particle density only, not trajectory or event timing.
- [ ] Portrait and compact landscape preserve `≥44 px` effective touch targets.

## Essential juice

- bright aim line with a softer outer glow;
- immediate launcher tension on hold and release recoil;
- contact flash before structural resolution;
- radial pop shards plus a longer low-opacity sparkle tail;
- gravity-accelerated unsupported bubbles with small per-body lateral variance
  derived from stable identity, never random gameplay physics;
- target rescue lift/wing proxy before the count changes;
- next bubble arcs into the launcher rather than teleporting;
- brief screen/board pulse on large support cuts;
- success is layered: last rescue → short anticipation → radial celebration.

Audio and haptics are semantic drafts only: aim is silent, release is light,
match is medium, support-cut uses one heavy pulse, terminal uses rigid→heavy.
No reference sound or waveform is copied.

## Rights boundary

Do not ship or reconstruct King/Bubble Witch names, logo, characters, owls,
witch, cat, backgrounds, typography, bubble faces, UI cards, score numbers,
music, SFX or level-map trade dress. The prototype uses an original
`Signal Garden` code-drawn skin: abstract nodes, sprouts as targets, geometric
launcher, neutral copy and own palette. Reference recordings stay outside the
bundle and exist only as private evaluation evidence.

## Known reference gaps

- The current/next color swap was not captured with different colors; baseline
  excludes it rather than inventing its timing.
- Natural exhaustion-of-shots fail was not reached; fail/restart ordering is
  evidenced through the app's explicit Quit flow.
- Later blockers, boosters, ceiling descent, streak systems and meta economy
  are outside Levels 1–2 and outside this bounded class.
- Audio/haptic waveforms were not extracted. Prototype uses own synthesized
  semantic cues and requires sound-off parity.

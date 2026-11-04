# GAMES segment: sub-genre market map, growth drivers, openings, prototype hypotheses

Data room: `/Users/gleb/Documents/Codex/2026-10-10/sensor-tower/analysis/out/` (Sensor Tower exports, prepared 2026-10-10).
Windows: current 12m = 2025-10..2026-09, prior 12m = 2024-10..2025-09; H2/H1 = 2026-04..09 vs 2025-10..2026-03; last3m = Jul-Sep 2026 vs Jul-Sep 2025.
Classes: rev_yoy >= +10% growing, <= -5% declining, otherwise flat; momentum from H2/H1 at +-5%.
All computations: `python3 -I` with stdlib csv over the CSVs (scripts kept in the session scratchpad; every number below names its file and column).

## 0. Measurement boundary (read this first)

- Revenue = Sensor Tower **store** estimates: App Store + Google Play in-app purchases and paid downloads only. **No ad revenue, no web/D2C shops, no third-party Android stores (mainland-China Android largely missing), no PC/console.**
- Consequences for this segment:
  - Ad-monetized puzzle/arcade (Sort "arrows" games, Riddle, Jigsaw, Numbers, .io, Platformer/Runner) are heavily **under-valued**. Downloads (`dl_*`) and US time spent (`ts_*`) are the proxies. Example: in niche_top_apps.csv, the 55 game apps with "arrow" in the name have 359.5M current downloads but only $1.5M IAP revenue.
  - Big incumbents can show store declines that are partly a **shift to web shops**, which this data cannot see. Candidates are MONOPOLY GO! (-17%), Royal Match (-18%) and Roblox (-26% store revenue, while Sandbox US time spent is +23% and Roblox H2/H1 is +12%). The data cannot separate demand loss from D2C migration, so read "incumbent weakening" claims for these titles as an upper bound.
  - China Android is largely missing, which under-states Chinese mid-core (MMORPG, MOBA, Beat 'em Up).
- Taxonomy: the per-niche top-100 lists in niche_top_apps.csv apply one current sub-genre tag per app in both periods. I found 0 of 7,404 apps whose tag differs between periods. **So growth inside the top-100 cannot come from re-tagging between periods.** But the count of tagged apps changes a lot (`total_count_cur` vs `total_count_prior` in niche_leaders_full_game_sub_genre.csv): Sort went from 4,043 to 6,921 apps, Real-Time Puzzle from 230 to 2,619, Open World Adventure from 48 to 214 and Screw from 237 to 692. That means some tags were newly applied. Where it matters, I check whether named top apps grew (decomposition into both/entrants/exits, and app-level deltas).
- `new entrant` = released on or after 2024-07-01 (summary.json `thresholds.new_entrant_release_gte`).

## 1. Segment totals

| Metric | Value | Source |
|---|---|---|
| Games revenue, cur 12m | $56,280.5M | summary.json `totals_ww.game_sub_genre_sum.rev_cur_usd` |
| Games revenue, prior 12m | $57,676.0M (YoY **-2.4%**) | same, `rev_prior_usd`, `rev_yoy` |
| Games downloads cur / YoY | 46.26B / **-10.6%** | same, `dl_cur`, `dl_yoy` |
| Non-game apps YoY (for contrast) | +16.7% | summary.json `totals_ww.app_category_sum_non_games_app_iq.rev_yoy` |
| Sub-genre class counts | 27 growing / 29 flat / 47 declining; momentum 27 accelerating / 51 decelerating | summary.json `niche_counts_by_class.game_sub_genre` |

Genre level (niche_dynamics_game_genre.csv). Puzzle is the only large genre growing: **$11,271M, +17%, +$1,678M**. Strategy is $13,110M, -5%. RPG is $8,667M, -12% (-$1,229M). Casino is $4,505M, -10%. Action is $2,039M, -23%. Tabletop is $1,181M, +15%. Sports is $2,084M, +9% and accelerating. The Puzzle gain comes from Match Merge 2 (+$1,247M) and Sort (+$557M), which together exceed the whole genre delta. The rest of Puzzle is net negative.

## 2. Market map of sub-genres (niche_dynamics_game_sub_genre.csv + niche_leaders_full_game_sub_genre.csv)

Columns: `rev_cur_usd`, `rev_prior_usd`, `rev_yoy`, `rev_abs_delta_usd`, `rev_h2_h1`, `rev_last3m_yoy`, `rev_class`, `rev_momentum`, `dl_cur`, `dl_yoy`. Top1/top3 = `top1_share_of_top100`, `top3_share`. New-entrant share = `new_entrants_share_of_top100` (leaders_full). All 103 complete sub-genres have status=complete. The 14 zero_rows niches (Blast, Card, Chain, Swap, Match Merge, etc.) are legacy duplicate tag values and are excluded.

### Table 1a. 15 largest game sub-genres by current-12m revenue

| # | Sub-genre | Rev cur $M | Rev prior $M | YoY | Δ $M | H2/H1 | Last3m YoY | Class / momentum | DL cur M | DL YoY | Top1 share | Top3 share | New-entrant share |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 4X Strategy | 7584 | 7415 | +2% | +169 | -18% | -21% | flat / decelerating | 859 | +9% | 18% | 48% | 23% |
| 2 | Match Swap | 5150 | 5274 | -2% | -124 | -7% | -9% | flat / decelerating | 624 | -18% | 24% | 55% | 1% |
| 3 | Match Merge 2 | 2666 | 1419 | +88% | +1247 | +27% | +79% | growing / accelerating | 567 | +6% | 42% | 61% | 16% |
| 4 | Coin Looters | 2503 | 2724 | -8% | -221 | -10% | -17% | declining / decelerating | 144 | +4% | 47% | 88% | 5% |
| 5 | Slots | 2363 | 2831 | -17% | -468 | -14% | -22% | declining / decelerating | 410 | +15% | 9% | 23% | 1% |
| 6 | MMORPG | 2226 | 2948 | -24% | -721 | -6% | -20% | declining / decelerating | 148 | -38% | 12% | 26% | 30% |
| 7 | MOBA | 1935 | 2061 | -6% | -126 | -0% | +3% | declining / steady | 225 | +2% | 74% | 95% | 1% |
| 8 | Battle Royale | 1880 | 1980 | -5% | -100 | +4% | -7% | declining / steady | 645 | -5% | 36% | 91% | 1% |
| 9 | FPS / 3PS | 1603 | 1205 | +33% | +398 | -10% | -3% | growing / decelerating | 1011 | -17% | 35% | 72% | 53% |
| 10 | Turn-based RPG | 1578 | 2062 | -23% | -484 | -14% | -33% | declining / decelerating | 83 | -16% | 19% | 41% | 13% |
| 11 | Tycoon / Crafting | 1531 | 1510 | +1% | +21 | -3% | +1% | flat / steady | 495 | -18% | 36% | 55% | 19% |
| 12 | Realistic Sports | 1492 | 1317 | +13% | +175 | +12% | +29% | growing / accelerating | 1263 | +1% | 36% | 66% | 7% |
| 13 | Idle RPG | 1402 | 1343 | +4% | +59 | -13% | +4% | flat / decelerating | 172 | -27% | 24% | 36% | 52% |
| 14 | Squad RPG | 1204 | 1520 | -21% | -316 | -13% | -24% | declining / decelerating | 167 | -28% | 21% | 37% | 20% |
| 15 | Open World Adventure | 1020 | 727 | +40% | +293 | +14% | +51% | growing / accelerating | 108 | +56% | 34% | 66% | 39% |

### Table 1b. Big movers: |rev_yoy| >= 20% and rev_prior >= $50M (sorted by YoY)

| # | Sub-genre | Rev cur $M | Rev prior $M | YoY | Δ $M | H2/H1 | Last3m YoY | Class / momentum | DL cur M | DL YoY | Top1 share | Top3 share | New-entrant share |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 21 | Sort | 754 | 197 | +283% | +557 | +62% | +272% | growing / accelerating | 1728 | +53% | 25% | 44% | 76% |
| 3 | Match Merge 2 | 2666 | 1419 | +88% | +1247 | +27% | +79% | growing / accelerating | 567 | +6% | 42% | 61% | 16% |
| 59 | Eat & Grow | 179 | 96 | +87% | +84 | +29% | +48% | growing / accelerating | 276 | -7% | 55% | 71% | 33% |
| 67 | Action Sandbox | 104 | 56 | +87% | +48 | +22% | +83% | growing / accelerating | 1209 | -6% | 62% | 77% | 7% |
| 53 | Block | 214 | 135 | +58% | +78 | +31% | +19% | growing / accelerating | 826 | +7% | 47% | 77% | 52% |
| 66 | Physics | 107 | 70 | +54% | +38 | +27% | +84% | growing / accelerating | 490 | -0% | 50% | 69% | 33% |
| 56 | Survival | 190 | 131 | +45% | +59 | -16% | -10% | growing / decelerating | 319 | -11% | 46% | 65% | 54% |
| 15 | Open World Adventure | 1020 | 727 | +40% | +293 | +14% | +51% | growing / accelerating | 108 | +56% | 34% | 66% | 39% |
| 28 | Solitaire | 455 | 330 | +38% | +125 | +18% | +18% | growing / accelerating | 356 | +7% | 51% | 82% | 62% |
| 34 | Avatar Life | 377 | 282 | +34% | +95 | +5% | +35% | growing / steady | 341 | -10% | 27% | 46% | 29% |
| 9 | FPS / 3PS | 1603 | 1205 | +33% | +398 | -10% | -3% | growing / decelerating | 1011 | -17% | 35% | 72% | 53% |
| 51 | Screw | 229 | 172 | +33% | +57 | -13% | -18% | growing / decelerating | 259 | -40% | 45% | 63% | 91% |
| 48 | Social Party | 245 | 197 | +24% | +48 | +6% | +18% | growing / accelerating | 629 | +41% | 39% | 55% | 11% |
| 64 | Platformer / Runner | 115 | 92 | +24% | +22 | +2% | +25% | growing / steady | 3194 | -19% | 18% | 36% | 24% |
| 16 | Sandbox | 885 | 1107 | -20% | -222 | +11% | +12% | declining / accelerating | 1384 | -6% | 79% | 98% | 1% |
| 14 | Squad RPG | 1204 | 1520 | -21% | -316 | -13% | -24% | declining / decelerating | 167 | -28% | 21% | 37% | 20% |
| 26 | Brawl | 504 | 652 | -23% | -148 | +6% | -13% | declining / accelerating | 108 | -13% | 73% | 97% | 1% |
| 10 | Turn-based RPG | 1578 | 2062 | -23% | -484 | -14% | -33% | declining / decelerating | 83 | -16% | 19% | 41% | 13% |
| 65 | Time Management | 110 | 146 | -24% | -35 | -18% | -30% | declining / decelerating | 362 | -25% | 11% | 31% | 10% |
| 6 | MMORPG | 2226 | 2948 | -24% | -721 | -6% | -20% | declining / decelerating | 148 | -38% | 12% | 26% | 30% |
| 24 | Interactive Story | 515 | 694 | -26% | -180 | -21% | -46% | declining / decelerating | 140 | -30% | 50% | 59% | 8% |
| 73 | Kart Racing | 72 | 98 | -26% | -25 | -16% | -26% | declining / decelerating | 82 | -9% | 55% | 92% | 0% |
| 84 | Other Strategy | 42 | 58 | -28% | -16 | -15% | -21% | declining / decelerating | 44 | -17% | 63% | 71% | 13% |
| 55 | Match Merge 3 | 195 | 272 | -28% | -77 | -30% | -45% | declining / decelerating | 16 | -42% | 26% | 54% | 5% |
| 76 | Realistic Racing | 56 | 78 | -29% | -22 | -20% | -36% | declining / decelerating | 444 | -16% | 80% | 85% | 8% |
| 32 | Shoot 'em Up | 397 | 578 | -31% | -181 | -17% | -38% | declining / decelerating | 264 | -25% | 15% | 37% | 15% |
| 60 | Empire Simulation | 157 | 229 | -31% | -72 | -16% | -28% | declining / decelerating | 19 | -23% | 17% | 35% | 13% |
| 62 | Asymmetric Battle | 126 | 188 | -33% | -62 | +6% | -12% | declining / accelerating | 240 | -33% | 89% | 96% | 1% |
| 40 | Beat 'em Up | 314 | 532 | -41% | -218 | -26% | -37% | declining / decelerating | 46 | -35% | 49% | 92% | 5% |
| 20 | Card Battler | 771 | 1362 | -43% | -591 | -25% | -35% | declining / decelerating | 89 | -40% | 43% | 56% | 52% |

### Table 1c. Other growing sub-genres (rev_class = growing) not shown above — mostly small bases

| # | Sub-genre | Rev cur $M | Rev prior $M | YoY | Δ $M | H2/H1 | Last3m YoY | Class / momentum | DL cur M | DL YoY | Top1 share | Top3 share | New-entrant share |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 18 | Tower Defense | 851 | 723 | +18% | +128 | +10% | +28% | growing / accelerating | 374 | +1% | 17% | 35% | 41% |
| 58 | Action RPG | 183 | 152 | +20% | +30 | +48% | +14% | growing / accelerating | 84 | -11% | 14% | 30% | 50% |
| 70 | Drawing & Coloring | 90 | 76 | +18% | +14 | -1% | +10% | growing / steady | 780 | -19% | 18% | 42% | 8% |
| 79 | Artillery Shooter (base<$50M) | 53 | 16 | +224% | +36 | +184% | +225% | growing / accelerating | 123 | +15% | 65% | 78% | 79% |
| 80 | Okey (base<$50M) | 51 | 42 | +21% | +9 | +5% | +22% | growing / accelerating | 19 | +2% | 32% | 58% | 1% |
| 81 | Sniper (base<$50M) | 49 | 37 | +31% | +12 | +2% | +16% | growing / steady | 442 | -2% | 28% | 60% | 40% |
| 91 | Riddle (base<$50M) | 23 | 12 | +96% | +11 | +33% | +70% | growing / accelerating | 1049 | -2% | 26% | 55% | 76% |
| 94 | Jigsaw (base<$50M) | 19 | 13 | +41% | +5 | +70% | +109% | growing / accelerating | 290 | +21% | 37% | 57% | 40% |
| 97 | Other Casino (base<$50M) | 13 | 12 | +11% | +1 | +2% | -6% | growing / steady | 133 | +16% | 18% | 40% | 20% |
| 98 | Mini-game Hub (base<$50M) | 11 | 10 | +18% | +2 | +11% | +21% | growing / accelerating | 856 | -21% | 25% | 62% | 6% |
| 99 | Maze (base<$50M) | 9 | 8 | +19% | +1 | +13% | +29% | growing / accelerating | 86 | +5% | 73% | 87% | 26% |
| 101 | Real-Time Puzzle (base<$50M) | 4 | 2 | +77% | +2 | -26% | +53% | growing / decelerating | 36 | +47% | 61% | 74% | 81% |

### Table 1d. Full list (all 103 sub-genres, compact)

| # | Sub-genre | Rev cur $M | YoY | H2/H1 | Class | Momentum | DL YoY | RPD $ | US imp share | Δ imp pp | ad_intensity_us (rank) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 4X Strategy | 7584 | +2% | -18% | flat | decelerating | +9% | 8.83 | 7.30% | -1.22 | 0.492 (60) |
| 2 | Match Swap | 5150 | -2% | -7% | flat | decelerating | -18% | 8.25 | 4.24% | -2.87 | 0.328 (77) |
| 3 | Match Merge 2 | 2666 | +88% | +27% | growing | accelerating | +6% | 4.70 | 6.78% | +1.38 | 1.255 (36) |
| 4 | Coin Looters | 2503 | -8% | -10% | declining | decelerating | +4% | 17.37 | 2.09% | -1.28 | 0.297 (78) |
| 5 | Slots | 2363 | -17% | -14% | declining | decelerating | +15% | 5.76 | 3.36% | +1.40 | 0.369 (72) |
| 6 | MMORPG | 2226 | -24% | -6% | declining | decelerating | -38% | 15.01 | 0.33% | +0.03 | 0.490 (61) |
| 7 | MOBA | 1935 | -6% | -0% | declining | steady | +2% | 8.61 | 0.03% | -0.01 | 0.090 (87) |
| 8 | Battle Royale | 1880 | -5% | +4% | declining | steady | -5% | 2.92 | 0.55% | +0.37 | 0.235 (79) |
| 9 | FPS / 3PS | 1603 | +33% | -10% | growing | decelerating | -17% | 1.58 | 0.45% | +0.04 | 0.394 (70) |
| 10 | Turn-based RPG | 1578 | -23% | -14% | declining | decelerating | -16% | 18.94 | 0.86% | -0.21 | 0.472 (62) |
| 11 | Tycoon / Crafting | 1531 | +1% | -3% | flat | steady | -18% | 3.09 | 1.30% | -0.42 | 0.410 (67) |
| 12 | Realistic Sports | 1492 | +13% | +12% | growing | accelerating | +1% | 1.18 | 0.93% | +0.20 | 0.635 (57) |
| 13 | Idle RPG | 1402 | +4% | -13% | flat | decelerating | -27% | 8.16 | 2.09% | +1.11 | 1.391 (33) |
| 14 | Squad RPG | 1204 | -21% | -13% | declining | decelerating | -28% | 7.20 | 0.98% | -0.13 | 0.828 (51) |
| 15 | Open World Adventure | 1020 | +40% | +14% | growing | accelerating | +56% | 9.47 | 0.63% | +0.43 | 1.013 (46) |
| 16 | Sandbox | 885 | -20% | +11% | declining | accelerating | -6% | 0.64 | 0.66% | +0.29 | 0.425 (66) |
| 17 | Puzzle RPG | 865 | -15% | -13% | declining | decelerating | -15% | 12.23 | 0.33% | -0.28 | 0.333 (76) |
| 18 | Tower Defense | 851 | +18% | +10% | growing | accelerating | +1% | 2.28 | 1.30% | +0.50 | 1.555 (31) |
| 19 | Geolocation | 800 | -2% | +18% | flat | accelerating | -13% | 17.53 | 2.51% | -0.53 | 1.584 (30) |
| 20 | Card Battler | 771 | -43% | -25% | declining | decelerating | -40% | 8.71 | 0.46% | -0.30 | 0.359 (73) |
| 21 | Sort | 754 | +283% | +62% | growing | accelerating | +53% | 0.44 | 10.86% | +5.29 | 3.993 (10) |
| 22 | Real-Time Strategy | 707 | -7% | -47% | declining | decelerating | -12% | 2.07 | 0.85% | -0.37 | 0.633 (58) |
| 23 | Match Pair | 600 | -5% | -15% | flat | decelerating | +15% | 0.49 | 4.75% | +0.17 | 2.067 (25) |
| 24 | Interactive Story | 515 | -26% | -21% | declining | decelerating | -30% | 3.67 | 0.74% | -0.21 | 1.055 (42) |
| 25 | Match Blast | 514 | -0% | -7% | flat | decelerating | +3% | 6.88 | 0.37% | -0.19 | 0.234 (80) |
| 26 | Brawl | 504 | -23% | +6% | declining | accelerating | -13% | 4.68 | 0.30% | -0.61 | 0.669 (55) |
| 27 | Simulator | 480 | -9% | -17% | declining | decelerating | -16% | 0.18 | 2.19% | -0.25 | 3.840 (12) |
| 28 | Solitaire | 455 | +38% | +18% | growing | accelerating | +7% | 1.28 | 2.33% | +0.45 | 1.752 (29) |
| 29 | Poker | 432 | -6% | -4% | declining | steady | -24% | 8.48 | 0.12% | -0.53 | 0.167 (84) |
| 30 | Bingo | 424 | -3% | -11% | flat | decelerating | -4% | 7.08 | 0.75% | -0.48 | 0.516 (59) |
| 31 | Customization | 406 | -3% | -3% | flat | steady | -15% | 0.24 | 1.32% | +0.13 | 1.194 (37) |
| 32 | Shoot 'em Up | 397 | -31% | -17% | declining | decelerating | -25% | 1.50 | 0.37% | -0.43 | 0.644 (56) |
| 33 | Build & Battle | 382 | -20% | -12% | declining | decelerating | -15% | 7.98 | 0.10% | -0.11 | 0.120 (86) |
| 34 | Avatar Life | 377 | +34% | +5% | growing | steady | -10% | 1.10 | 0.46% | -0.02 | 0.840 (50) |
| 35 | Auto Chess | 369 | -4% | -28% | flat | decelerating | -16% | 9.02 | 0.01% | -0.01 | 0.405 (69) |
| 36 | Idler | 359 | -4% | +2% | flat | steady | -15% | 0.32 | 2.42% | -2.06 | 2.609 (21) |
| 37 | Board | 357 | +3% | -2% | flat | steady | -18% | 0.36 | 0.31% | -0.05 | 0.445 (64) |
| 38 | Music / Rhythm | 320 | -8% | +30% | declining | accelerating | -17% | 0.36 | 0.61% | +0.16 | 3.939 (11) |
| 39 | Fish Shooting | 318 | -1% | +1% | flat | steady | -6% | 28.87 | n/a | n/a | n/a (-) |
| 40 | Beat 'em Up | 314 | -41% | -26% | declining | decelerating | -35% | 6.79 | 0.00% | -0.00 | 0.224 (82) |
| 41 | Turn-Based Tactics | 312 | -12% | -23% | declining | decelerating | -39% | 29.89 | 0.16% | +0.05 | 0.736 (53) |
| 42 | Sports Manager | 307 | +5% | +14% | flat | accelerating | -1% | 2.14 | 0.09% | +0.02 | 0.465 (63) |
| 43 | Virtual Casino | 291 | +10% | +3% | flat | steady | +38% | 2.76 | 2.09% | +1.31 | 12.72 (3) |
| 44 | Arcade Sports | 285 | -5% | -1% | declining | steady | -15% | 0.49 | 0.51% | -0.07 | 0.804 (52) |
| 45 | Hack and Slash | 280 | -17% | -9% | declining | decelerating | -9% | 4.41 | 0.06% | -0.05 | 0.220 (83) |
| 46 | Tabletop Cards | 280 | +3% | -0% | flat | steady | -16% | 1.05 | 0.63% | -0.50 | 1.475 (32) |
| 47 | Fighting | 262 | -14% | -7% | declining | decelerating | -17% | 0.78 | 0.25% | -0.04 | 0.334 (75) |
| 48 | Social Party | 245 | +24% | +6% | growing | accelerating | +41% | 0.39 | 0.11% | +0.08 | 0.392 (71) |
| 49 | Word | 236 | -6% | -1% | declining | steady | -20% | 0.38 | 3.60% | -0.94 | 3.642 (13) |
| 50 | Hidden Objects | 232 | -19% | -14% | declining | decelerating | -24% | 0.84 | 1.35% | -0.07 | 2.222 (23) |
| 51 | Screw | 229 | +33% | -13% | growing | decelerating | -40% | 0.88 | 1.36% | -1.11 | 1.897 (27) |
| 52 | Mahjong | 228 | +3% | +7% | flat | accelerating | +41% | 6.93 | 0.09% | n/a | 5.711 (9) |
| 53 | Block | 214 | +58% | +31% | growing | accelerating | +7% | 0.26 | 2.21% | -0.35 | 3.212 (17) |
| 54 | Vehicular Shooter | 204 | -12% | -14% | declining | decelerating | -19% | 1.33 | 0.39% | -0.08 | 1.045 (43) |
| 55 | Match Merge 3 | 195 | -28% | -30% | declining | decelerating | -42% | 12.09 | 0.27% | -0.24 | 0.436 (65) |
| 56 | Survival | 190 | +45% | -16% | growing | decelerating | -11% | 0.60 | 0.21% | -0.02 | 1.169 (39) |
| 57 | Party Royale | 186 | +3% | +2% | flat | steady | -17% | 0.83 | 0.10% | -0.04 | 1.183 (38) |
| 58 | Action RPG | 183 | +20% | +48% | growing | accelerating | -11% | 2.17 | 0.09% | +0.01 | 1.037 (44) |
| 59 | Eat & Grow | 179 | +87% | +29% | growing | accelerating | -7% | 0.65 | 0.65% | -0.24 | 0.944 (48) |
| 60 | Empire Simulation | 157 | -31% | -16% | declining | decelerating | -23% | 8.34 | 0.06% | -0.04 | 0.234 (81) |
| 61 | Landlord | 152 | -18% | -7% | declining | decelerating | -20% | 11.03 | n/a | n/a | n/a (-) |
| 62 | Asymmetric Battle | 126 | -33% | +6% | declining | accelerating | -33% | 0.52 | 0.07% | -0.02 | 1.376 (34) |
| 63 | Match Chain | 124 | -5% | -24% | flat | decelerating | +21% | 2.35 | 0.09% | +0.02 | 0.993 (47) |
| 64 | Platformer / Runner | 115 | +24% | +2% | growing | steady | -19% | 0.04 | 1.58% | -0.24 | 8.109 (5) |
| 65 | Time Management | 110 | -24% | -18% | declining | decelerating | -25% | 0.30 | 0.20% | -0.14 | 0.678 (54) |
| 66 | Physics | 107 | +54% | +27% | growing | accelerating | -0% | 0.22 | 1.11% | +0.59 | 2.909 (19) |
| 67 | Action Sandbox | 104 | +87% | +22% | growing | accelerating | -6% | 0.09 | 0.20% | +0.09 | 1.023 (45) |
| 68 | Casino Cards | 104 | -14% | -1% | declining | steady | -47% | 1.05 | 0.07% | +0.03 | 0.334 (74) |
| 69 | Breeding | 98 | +1% | +20% | flat | accelerating | -14% | 1.58 | 0.30% | +0.11 | 1.284 (35) |
| 70 | Drawing & Coloring | 90 | +18% | -1% | growing | steady | -19% | 0.12 | 2.41% | +0.84 | 7.791 (6) |
| 71 | Virtual Pet | 87 | +0% | -3% | flat | steady | -17% | 0.10 | 0.27% | -0.20 | 2.281 (22) |
| 72 | Dominoes | 84 | -5% | -13% | declining | decelerating | -36% | 2.84 | 0.06% | -0.04 | 0.410 (68) |
| 73 | Kart Racing | 72 | -26% | -16% | declining | decelerating | -9% | 0.88 | n/a | n/a | n/a (-) |
| 74 | Bubble Shooter | 72 | -13% | -24% | declining | decelerating | -35% | 0.26 | 0.76% | -0.21 | 3.387 (14) |
| 75 | Driving / Flight Simulator | 58 | -7% | -1% | declining | steady | -6% | 0.02 | 0.19% | -0.02 | 2.043 (26) |
| 76 | Realistic Racing | 56 | -29% | -20% | declining | decelerating | -16% | 0.13 | 0.05% | +0.03 | 2.205 (24) |
| 77 | Arcade Racing | 55 | -18% | -7% | declining | decelerating | -24% | 0.06 | 0.20% | +0.03 | 3.219 (16) |
| 78 | Adventure | 53 | -5% | -7% | flat | decelerating | +1% | 0.32 | 0.14% | +0.02 | 0.916 (49) |
| 79 | Artillery Shooter | 53 | +224% | +184% | growing | accelerating | +15% | 0.43 | 0.19% | +0.05 | 1.897 (-) |
| 80 | Okey | 51 | +21% | +5% | growing | accelerating | +2% | 2.74 | n/a | n/a | n/a (-) |
| 81 | Sniper | 49 | +31% | +2% | growing | steady | -2% | 0.11 | 0.35% | -0.03 | 2.728 (20) |
| 82 | Trivia | 45 | +2% | -3% | flat | steady | -19% | 0.15 | 0.18% | +0.03 | 1.784 (28) |
| 83 | Drag Racing | 43 | -12% | -12% | declining | decelerating | -33% | 1.23 | 0.42% | +0.14 | 2.947 (18) |
| 84 | Other Strategy | 42 | -28% | -15% | declining | decelerating | -17% | 0.96 | 0.08% | -0.04 | 1.063 (41) |
| 85 | Pachinko | 37 | +8% | -11% | flat | decelerating | +47% | 4.67 | 0.00% | +0.00 | 0.082 (88) |
| 86 | Other Arcade | 34 | -4% | -15% | flat | decelerating | -28% | 0.05 | 0.58% | +0.11 | 9.235 (4) |
| 87 | Arcade Driving | 33 | +4% | -6% | flat | decelerating | -3% | 0.04 | 0.27% | +0.02 | 3.384 (15) |
| 88 | Other Puzzle | 31 | +9% | -1% | flat | steady | -13% | 0.07 | 0.59% | +0.25 | 7.148 (7) |
| 89 | Environmental | 25 | -3% | -18% | flat | decelerating | -22% | 0.05 | 0.03% | -0.01 | 1.109 (40) |
| 90 | Numbers | 24 | -15% | -15% | declining | decelerating | +0% | 0.08 | 2.41% | +0.94 | 40.54 (2) |
| 91 | Riddle | 23 | +96% | +33% | growing | accelerating | -2% | 0.02 | 1.46% | -0.16 | 21.63 (-) |
| 92 | .io | 22 | -16% | -1% | declining | steady | -15% | 0.04 | 1.12% | +0.26 | 70.11 (1) |
| 93 | Claw Machine | 19 | -16% | -10% | declining | decelerating | +50% | 1.55 | 0.00% | -0.01 | 0.145 (85) |
| 94 | Jigsaw | 19 | +41% | +70% | growing | accelerating | +21% | 0.06 | 1.12% | +0.44 | 19.23 (-) |
| 95 | Pinball / Brick Breaker | 16 | -35% | -28% | declining | decelerating | -28% | 0.39 | 0.36% | +0.19 | 6.703 (8) |
| 96 | Arcade Combat | 14 | -25% | -23% | declining | decelerating | -19% | 0.02 | 0.68% | +0.18 | 17.14 (-) |
| 97 | Other Casino | 13 | +11% | +2% | growing | steady | +16% | 0.10 | 0.79% | +0.08 | 19.33 (-) |
| 98 | Mini-game Hub | 11 | +18% | +11% | growing | accelerating | -21% | 0.01 | 0.80% | +0.27 | 38.66 (-) |
| 99 | Maze | 9 | +19% | +13% | growing | accelerating | +5% | 0.11 | 0.08% | +0.00 | 2.795 (-) |
| 100 | Teen Patti | 6 | -4% | +2% | flat | steady | -30% | 0.13 | n/a | n/a | n/a (-) |
| 101 | Real-Time Puzzle | 4 | +77% | -26% | growing | decelerating | +47% | 0.12 | 0.07% | +0.02 | 6.665 (-) |
| 102 | Ultracasual | 3 | -40% | -19% | declining | decelerating | -18% | 0.01 | 0.39% | -0.76 | 52.13 (-) |
| 103 | Coin Pusher | 3 | -16% | +12% | declining | accelerating | -7% | 0.47 | 0.02% | n/a | 8.008 (-) |
### Reading the map

- **The growth pool is narrow.** Only 6 sub-genres add more than $100M: Match Merge 2 (+$1,247M), Sort (+$557M), FPS/3PS (+$398M), Open World Adventure (+$293M), Realistic Sports (+$175M) and 4X Strategy (+$169M, which is decelerating). Tower Defense (+$128M) and Solitaire (+$125M) are just below that line. Against this, MMORPG (-$721M), Card Battler (-$591M), Turn-based RPG (-$484M), Slots (-$468M) and Squad RPG (-$316M) shrink.
- **Casual-puzzle trend niches** (Sort, Block, Screw, Eat & Grow, Physics) are the only cluster where growth comes from new apps and where the top1 share is moderate.
  - Sort: 76% of top-100 revenue is from apps released since 2024-07; top1 share 25%; HHI 0.093.
  - Screw: 91% new-entrant share.
  - Block: 52% new-entrant share.
- **Accelerating and large:** Match Merge 2 (H2/H1 +27%, last3m +79%), Sort (+62%, +272%), Open World Adventure (+14%, +51%), Realistic Sports (+12%, +29%), Tower Defense (+10%, +28%), Solitaire (+18%, +18%) and Eat & Grow (+29%, +48%).
- **Large and decelerating:** 4X Strategy has +2% YoY but H2/H1 -18% and last3m -21%. Last War: Survival is -21% with last3m -61% (leaders.csv `s_rev_last3m_yoy`). Real-Time Strategy has H2/H1 -47%. Match Swap is at H2/H1 -7% and its US impression share fell 2.87 pp.
- **Monthly run-rates** (niche_monthly_game_sub_genre.csv, `rev_usd` for 2026-09):
  - Sort went from $58M (2026-01) to $93M (2026-09), about $1.1B annualized.
  - Match Merge 2 went from $206M (2026-01) to $266M (2026-09), about $3.2B annualized.
  - Quarterly Sort revenue grew in every quarter of the 24-month window: $37.1M → $43.0M → $48.8M → $68.0M → $104.8M → $182.8M → $213.4M → $252.9M.

## 3. Who drives growth and decline (niche_leaders_full_game_sub_genre.csv + niche_top_apps.csv)

How to read the tables:
- `Decomp` uses `growth_decomp_both_usd` / `growth_decomp_entrants_usd` / `growth_decomp_exits_usd`. "both" = apps in the top-100 in both periods; "entrants" = apps that entered the top-100.
- "Top contributor to Δ" is computed from niche_top_apps.csv (field=game_sub_genre, order=revenue) as current minus prior revenue per app. An app absent from the prior top-100 counts as $0 prior.
- **single-app** = one app explains at least 70% of the niche delta.
- Driver label: "entrants" if entrants > both. "leaders" if both >= 2x entrants. Otherwise "mixed".

### Table 2a. Growing sub-genres: who drives growth

| Sub-genre | Rev cur $M (YoY) | Δ $M | Decomp: both / entrants / exits $M | Driver | Top contributor to Δ (share of Δ) | Top1 (share of top100) | Top3 | New entrants: n, share of top100 rev |
|---|---|---|---|---|---|---|---|---|
| Match Merge 2 | 2666 (+88%) | +1247 | +1072 / +176 / -10 | leaders | Gossip Harbor: Merge & Story [2022-06] +605M (48%) | Gossip Harbor: Merge & Story (42%) | 61% | 48, 16% |
| Sort | 754 (+283%) | +557 | +94 / +464 / -13 | entrants | Pixel Flow! [2025-08] +185M (33%) | Pixel Flow! (25%) | 44% | 76, 76% |
| FPS / 3PS | 1603 (+33%) | +398 | +356 / +44 / -2 | leaders **single-app** | Delta Force [2024-09] +354M (89%) | Delta Force (35%) | 72% | 17, 53% |
| Open World Adventure | 1020 (+40%) | +293 | +53 / +240 / -0 | entrants | Arknights: Endfield [2025-11] +89M (30%) | Genshin Impact (34%) | 66% | 83, 39% |
| Realistic Sports | 1492 (+13%) | +175 | +152 / +28 / -6 | leaders **single-app** | eFootball [2016-12] +140M (80%) | eFootball (36%) | 66% | 26, 7% |
| Tower Defense | 851 (+18%) | +128 | +22 / +130 / -37 | entrants | 永远的蔚蓝星球-周杰伦代言 [2025-05] +41M (32%) | 明日方舟 (17%) | 35% | 55, 41% |
| Solitaire | 455 (+38%) | +125 | +77 / +48 / -1 | mixed **single-app** | Disney Solitaire [2024-11] +164M (132%) | Disney Solitaire (51%) | 82% | 21, 62% |
| Avatar Life | 377 (+34%) | +95 | +92 / +4 / -0 | leaders **single-app** | Heartopia [2024-07] +78M (82%) | Heartopia (27%) | 46% | 27, 29% |
| Eat & Grow | 179 (+87%) | +84 | +77 / +6 / -0 | leaders | All in Hole: Black Hole Game [2023-06] +38M (46%) | All in Hole: Black Hole Game (55%) | 71% | 77, 33% |
| Block | 214 (+58%) | +78 | +23 / +56 / -1 | entrants | Block Out! - Color Sort Puzz [2025-09] +49M (62%) | Color Block Jam (47%) | 77% | 71, 52% |
| Survival | 190 (+45%) | +59 | +50 / +10 / -1 | leaders **single-app** | Tomb Busters [2024-07] +56M (95%) | Tomb Busters (46%) | 65% | 34, 54% |
| Screw | 229 (+33%) | +57 | +45 / +12 / -1 | leaders | Screwdom [2024-12] +38M (68%) | Screwdom (45%) | 63% | 81, 91% |
| Social Party | 245 (+24%) | +48 | +41 / +6 / -1 | leaders | 鹅鸭杀 [2021-10] +24M (51%) | WePlay - 線上桌遊吧 (39%) | 55% | 21, 11% |
| Physics | 107 (+54%) | +38 | +20 / +18 / -1 | mixed | Angry Birds 2 [2015-03] +8M (22%) | Angry Birds 2 (50%) | 69% | 51, 33% |
| Action Sandbox | 104 (+87%) | +48 | +45 / +4 / -0 | leaders **single-app** | OneState RP: Role Play Onlin [2022-03] +35M (73%) | OneState RP: Role Play Onlin (62%) | 77% | 37, 7% |
| Artillery Shooter (base<$50M) | 53 (+224%) | +36 | +0 / +36 / -0 | entrants **single-app** | Castle Clashers! [2025-05] +34M (95%) | Castle Clashers! (65%) | 78% | 38, 79% |
| Action RPG | 183 (+20%) | +30 | -38 / +85 / -20 | entrants **single-app** | ドラゴンクエストスマッシュグロウ ドラクエローグライトR [2026-04] +24M (79%) | ドラゴンクエストスマッシュグロウ ドラクエローグライトR (14%) | 30% | 42, 50% |
| Platformer / Runner | 115 (+24%) | +22 | +5 / +19 / -3 | entrants | Sled Surfers [2025-04] +7M (30%) | 쿠키런: 오븐브레이크 (18%) | 36% | 24, 24% |
| Riddle (base<$50M) | 23 (+96%) | +11 | -1 / +12 / -0 | entrants | Connect Master - Match Puzzl [2025-05] +6M (52%) | Connect Master - Match Puzzl (26%) | 55% | 65, 76% |

### Table 2b. Declining sub-genres: who drives decline

| Sub-genre | Rev cur $M (YoY) | Δ $M | Decomp: both / entrants / exits $M | Driver | Top contributor to Δ (share of Δ) | Top1 (share of top100) | Top3 | New entrants: n, share of top100 rev |
|---|---|---|---|---|---|---|---|---|
| MMORPG | 2226 (-24%) | -721 | -752 / +311 / -212 | incumbents shrinking | 리니지M [2017-06] -141M (20%) | 梦幻西游 (12%) | 26% | 35, 30% |
| Card Battler | 771 (-43%) | -591 | -608 / +22 / -6 | incumbents shrinking **single-app** | Pokémon TCG Pocket [2024-08] -520M (88%) | Pokémon TCG Pocket (43%) | 56% | 37, 52% |
| Turn-based RPG | 1578 (-23%) | -484 | -548 / +82 / -19 | incumbents shrinking | Honkai: Star Rail [2023-01] -112M (23%) | Honkai: Star Rail (19%) | 41% | 20, 13% |
| Slots | 2363 (-17%) | -468 | -479 / +32 / -18 | incumbents shrinking | DoubleDown™ Casino Vegas Slo [2012-03] -51M (11%) | Lightning Link Casino Slots (9%) | 23% | 4, 1% |
| Squad RPG | 1204 (-21%) | -316 | -257 / +90 / -116 | incumbents shrinking | CookieRun: Kingdom [2020-11] -49M (15%) | GODDESS OF VICTORY: NIKKE (21%) | 37% | 32, 20% |
| Coin Looters | 2503 (-8%) | -221 | -221 / +0 / -0 | incumbents shrinking **single-app** | MONOPOLY GO! [2022-06] -247M (112%) | MONOPOLY GO! (47%) | 88% | 29, 5% |
| Sandbox | 885 (-20%) | -222 | -222 / +1 / -1 | incumbents shrinking **single-app** | Roblox [2011-05] -243M (110%) | Roblox (79%) | 98% | 22, 1% |
| Beat 'em Up | 314 (-41%) | -218 | -231 / +13 / -0 | incumbents shrinking **single-app** | 地下城与勇士：起源 [2021-11] -242M (111%) | 地下城与勇士：起源 (49%) | 92% | 50, 5% |
| Interactive Story | 515 (-26%) | -180 | -196 / +29 / -11 | incumbents shrinking **single-app** | Love and Deepspace [2023-09] -129M (72%) | Love and Deepspace (50%) | 59% | 22, 8% |
| Shoot 'em Up | 397 (-31%) | -181 | -213 / +37 / -9 | incumbents shrinking | Archero 2 [2024-06] -86M (48%) | Archero 2 (15%) | 37% | 41, 15% |
| Puzzle RPG | 865 (-15%) | -148 | -168 / +21 / -2 | incumbents shrinking | モンスターストライク [2013-09] -54M (37%) | モンスターストライク (25%) | 60% | 28, 3% |
| Brawl | 504 (-23%) | -148 | -153 / +6 / -1 | incumbents shrinking **single-app** | Brawl Stars [2017-06] -118M (80%) | Brawl Stars (73%) | 97% | 44, 1% |
| Match Swap | 5150 (-2%) | -124 | -121 / +15 / -12 | incumbents shrinking **single-app** | Royal Match [2020-07] -263M (212%) | Royal Match (24%) | 55% | 11, 1% |
| Match Merge 3 | 195 (-28%) | -77 | -77 / +0 / -0 | incumbents shrinking | Merge Dragons! [2017-03] -23M (31%) | Merge Dragons! (26%) | 54% | 20, 5% |
| Empire Simulation | 157 (-31%) | -72 | -75 / +4 / -1 | incumbents shrinking | 如鸢 [2023-03] -22M (31%) | King's Choice (17%) | 35% | 33, 13% |
| Asymmetric Battle | 126 (-33%) | -62 | -62 / +1 / -1 | incumbents shrinking **single-app** | 第五人格 [2018-03] -65M (105%) | 第五人格 (89%) | 96% | 35, 1% |
| Hidden Objects | 232 (-19%) | -54 | -58 / +4 / -1 | incumbents shrinking | June's Journey: Hidden Objec [2017-02] -29M (53%) | June's Journey: Hidden Objec (50%) | 71% | 26, 3% |
| Match Pair | 600 (-5%) | -28 | -55 / +38 / -11 | incumbents shrinking **single-app** | Triple Match 3D [2022-04] -26M (91%) | Match Factory! (36%) | 57% | 32, 17% |
| Time Management | 110 (-24%) | -35 | -35 / +2 / -2 | incumbents shrinking | Happy Hospital: ASMR Blast [2022-12] -8M (23%) | Cooking Diary Restaurant Gam (11%) | 31% | 26, 10% |
### Narrative by niche (names and numbers)

**Growing**

- **Match Merge 2** ($2,666M, +88%). This is incumbent-led: "both" is +$1,072M (86% of |Δ|).
  - Gossip Harbor (released 2022-06, China): $1,107.2M, +120%, last3m +69%. It alone is +$605M, 48% of the niche Δ.
  - Tasty Travels: $269.8M, +712%.
  - Merge Cooking: $149.5M, +142%.
  - New entrants still reach scale: Flambé: Merge & Cook ($135.7M, released 2024-10), Mystery Town ($87.3M, 2024-07), Hollywood Merge ($44.7M, 2025-08), Foodstars ($21.6M, 2025-08). Together, new entrants are 16% of top-100 revenue.
  - Publisher mix is China 67.3% of top-5 revenue.
  - Older leaders fade: Travel Town -3% (last3m -23%), Seaside Escape -9%, Merge Mansion -15% (leaders.csv).
  - Theme cross-check: game_theme "Cooking / Food" is +$489M (+122%) and "Drama" is +$590M (+87%). That is consistent with Tasty Travels + Flambé + Merge Cooking (≈ +$445M combined) and with Gossip Harbor (+$605M). This is an *inference*, because app-level theme tags are not in the data room.
- **Sort** ($754M, +283%, prior $197M). This is entrant-led: entrants +$464M (85% of |Δ|).
  - Pixel Flow! (Turkey, 2025-08): $185.1M, 25% of the top-100.
  - Magic Sort! (2024-04): $94.8M, +204%.
  - Yarn Loop (2025-11): $43.2M.
  - Marble Sort! (France, 2025-10): $31.0M.
  - Gecko Out: $29.9M.
  - Sand Loop: $21.9M.
  - Hexa Away: $18.1M, +593%.
  - Publishers: Turkey 56.6% of top-5 revenue.
  - US is $463.5M of the $754M (61%, country_niche_dynamics.csv).
  - Downloads are 1,728M, +53% (last3m +113%). The download leaders are ad-monetized "arrows" games (Arrows Puzzle Escape 140.5M dl, Arrows GO! 99.0M dl), so true demand is larger than IAP shows.
  - **UA arms race:** Sort holds 10.86% of US game ad impressions (+5.29 pp YoY, the largest gain of any sub-genre) against a 2.7% US revenue share. `ad_intensity_us_cur` is 3.99 (rank 10).
  - Biggest decliners are the 2024 wave: Seat Away -86%, Bus Frenzy -83%, Bus Jam -78%, Twisted Tangle -82%.
- **FPS/3PS** (+$398M): **single-app**, Chinese. Delta Force is +$354M (89% of Δ). 无畏契约：源能行动 is +$224M. Call of Duty Mobile is -19%. Not accessible to a small team.
- **Open World Adventure** (+$293M): entrants from Chinese AAA studios (Arknights: Endfield $88.9M, 洛克王国：世界 $71.7M, NTE $52.9M, Where Winds Meet $119.2M). The tagged-app count rose from 48 to 214, so partly a new tag. Not accessible.
- **Realistic Sports** (+$175M): **single-app**. eFootball is +$140M (80% of Δ).
- **Tower Defense** ($851M, +18%, accelerating). Entrant-led: entrants +$130M versus both +$22M.
  - Fragmented: top1 明日方舟 has 17% share, HHI 0.064, new entrants hold 41%.
  - Names: Clash of Critters ($40.2M, 2024-12), セルサバイバー ($39.2M, 2025-06), 협타디 ($29.9M, +1114%), Galaxy Defense ($21.1M, +105%), Boom Castle (+68%).
  - The decliners are also hybridcasual: BangBang Survivor -40%, 守塔不能停 -81%. Publishers are Asian-heavy (China 48.1%, Hong Kong 16.8%, South Korea 14.0%).
- **Solitaire** ($455M, +38%): **single-app**. Disney Solitaire (Israel, 2024-11) is $232.6M, +241%, and +$164M = 132% of Δ.
  - Solitaire Associations Journey (US, 2025-08) reaches $43.8M with 82.6M downloads. It is a non-licensed word-association hybrid.
  - Old incumbents shrink: Solitaire Grand Harvest -43%, Tiki Solitaire -25%, Fishdom Solitaire -52%.
- **Eat & Grow** ($179M, +87%, prior $96M). Led by the leader, All in Hole ($98.0M, +64%, 55% share, HHI 0.319). Israeli newcomers Hole It 3D and Hole Stars reach $14.6M each in under a year.
- **Block** ($214M, +58%). A changing of the guard:
  - Former leader Color Block Jam is -6% YoY, H2/H1 -16%, last3m -46%.
  - Block Out! (Turkey, 2025-09) is +$49M, 62% of Δ.
  - Turkey is 80.8% of top-5 revenue.
- **Screw** ($229M, +33%) is **already decelerating** (H2/H1 -13%, last3m -18%; downloads -40%).
  - Screwdom (Vietnam, 2024-12) is $102.9M, but last3m -30%.
  - The 2024 screw wave collapsed: Screw Pin Puzzle -98%, Screwscapes -96%.
- **Social Party** ($245M, +24%; downloads 629M, +41%; US time spent +51%).
  - The leaders are Asian: WePlay $93.0M, -5%; 鹅鸭杀 +3,068%.
  - Western one-phone impostor/charades apps are rising: Imposter Game — Fakeit (Poland, 2025-08) $8.6M; Splash - Impostor Game (Germany) $4.9M, +177%; Imposter Who? (US) $2.8M; Charades Guess Game +146%.
- **Physics** ($107M, +54%, last3m +84%). Angry Birds 2 is +$8M. Newcomers carry the rest: Wool Escape 3D ($8.0M), Smash Fest! ($5.8M), Royal Smash! ($5.2M, 2026-06), Unravel Master (+272%).
- **Single-app or tiny-base growth to discount:**
  - Avatar Life: Heartopia is 82% of Δ.
  - Survival: Tomb Busters is 95% of Δ.
  - Action Sandbox: OneState RP is 73% of Δ.
  - Artillery Shooter (prior $16M): Castle Clashers! is 95% of Δ.
  - Action RPG: a Dragon Quest roguelite is 79% of Δ.
  - Riddle (prior $12M) and Jigsaw (prior $13M) sit on bases under $50M.

**Declining**

- **Mid-core gacha/MMO** (MMORPG -$721M, Turn-based RPG -$484M, Squad RPG -$316M, Card Battler -$591M). Incumbents are shrinking across the board.
  - All 10 prior top-10 apps are down in Turn-based RPG (aggregate -29%). Nine of 10 are down in MMORPG (aggregate -35%).
  - Card Battler is **single-app**: Pokémon TCG Pocket is -$520M (88% of Δ), and its peak month was 2024-11.
  - New entrants exist but do not offset the decline (MMORPG entrants +$311M versus both -$752M).
- **Slots** ($2,363M, -17%). A broad decline: 9 of the prior top-10 are down. Top1 share is only 9%, and new entrants hold 1%. The US impression share *rises* 1.40 pp while revenue falls, so UA spend goes up as payers shrink.
- **Coin Looters** ($2,503M, -8%). MONOPOLY GO! is -$247M, -17%, 112% of Δ. Dice Dreams is -30%.
  - Newcomers are already in the top-100: Top Tycoon (+916%, $81.0M) and Coin Master - Board Adventure ($51.8M).
  - Top3 share is 88%. Possible web-shop effect (see section 0).
- **Match Swap** ($5,150M, -2%).
  - Royal Match is -$263M (-18%, last3m -24%). Royal Kingdom, also from a Turkey-based publisher (leaders.csv `publisher_country`), is +121% to $458.8M. Candy Crush is -6%.
  - New entrants hold only 1% of top-100 revenue. This is a closed market.
- **Interactive Story** (-26%): Love and Deepspace is 72% of Δ.
- **Shoot 'em Up** (-31%): the Archero 2 / Survivor!.io wave is fading (-59% and -42%).
- **Hidden Objects** (-19%): 9 of 10 incumbents are down. New entrants hold 3%.
- **Match Merge 3** (-28%): 9 of 10 incumbents are down. Entrants contribute $0.


## 4. Cross-dimension patterns (niche_dynamics_game_* and niche_monthly_game_*)

### Table 3. Product model, class, art style, camera and setting (rev in $M, cur 12m)

| Dimension | Value | Rev cur | Rev prior | YoY | H2/H1 | Last3m | Class / momentum | DL YoY | Note |
|---|---|---|---|---|---|---|---|---|---|
| product_model | Mid-core | 29,102 | 31,571 | -8% | -10% | -14% | declining / decelerating | -7% | -$2,469M, the biggest loser |
| product_model | Casual | 23,207 | 23,009 | +1% | -3% | -2% | flat / steady | -12% | RPD $1.48 → $1.71 |
| product_model | **Hybridcasual** | 3,309 | 2,661 | **+24%** | +21% | +38% | growing / **accelerating** | -12% | Quarterly rev $598M (Q4-24) → $957M (Q3-26). RPD $0.40 → $0.57 |
| product_model | Hypercasual | 660 | 429 | +54% | +3% | +24% | growing / steady | -10% | IAP only; RPD $0.018 → $0.030 |
| game_class | Lifestyle & Puzzle | 21,913 | 20,610 | +6% | +1% | +5% | flat / steady | -10% | only positive large class |
| game_class | Action & Strategy | 27,552 | 29,836 | -8% | -11% | -16% | declining / decelerating | -11% | |
| game_class | Sports & Racing | 2,310 | 2,203 | +5% | +8% | +14% | flat / accelerating | -12% | eFootball-driven |
| game_class | Casino | 4,505 | 5,028 | -10% | -9% | -14% | declining / decelerating | -3% | |
| art_style | **Hypercasual** | 1,303 | 819 | **+59%** | +34% | +52% | growing / accelerating | -22% | Quarterly $134M → $406M. RPD $0.084 → $0.173 |
| art_style | 3D Realistic | 7,182 | 6,734 | +7% | -5% | -3% | flat / steady | -7% | shooters, sports |
| art_style | 2D Cartoon | 17,518 | 17,565 | -0% | -4% | -3% | flat / steady | -9% | largest; flat |
| art_style | 3D Cartoon | 11,512 | 11,449 | +1% | -12% | -16% | flat / decelerating | -9% | |
| art_style | 3D Anime | 4,686 | 5,409 | -13% | -7% | -21% | declining | -19% | gacha fatigue |
| art_style | 2D Realistic | 2,927 | 3,645 | -20% | -10% | -20% | declining | -11% | slots |
| art_style | Pixel | 534 | 741 | -28% | -4% | -12% | declining | -10% | |
| art_style | Low Poly | 869 | 1,117 | -22% | +5% | +3% | declining / steady | -2% | |
| camera | First Person | 2,247 | 1,739 | +29% | -9% | +2% | growing / decelerating | -16% | Delta Force effect |
| camera | Dynamic | 7,843 | 7,591 | +3% | +8% | +13% | flat / accelerating | -11% | |
| camera | Top-Down | 19,114 | 19,352 | -1% | -7% | -10% | flat / decelerating | -7% | puzzle boards |
| camera | Side | 15,071 | 15,574 | -3% | -7% | -7% | flat / decelerating | -11% | |
| camera | Isometric | 4,538 | 5,307 | -14% | -12% | -19% | declining | -9% | 4X/city builders |
| setting | Modern | 14,021 | 12,918 | +9% | +2% | +7% | flat / steady | -9% | +$1,104M |
| setting | High Fantasy | 14,651 | 15,961 | -8% | -11% | -13% | declining | -6% | -$1,309M |
| setting | Sci-Fi | 7,651 | 8,251 | -7% | -17% | -26% | declining / decelerating | -17% | |
| setting | Cartoon Fantasy | 6,041 | 6,492 | -7% | +0% | +4% | declining / steady | -12% | |
| setting | Historical | 3,690 | 3,590 | +3% | -9% | -14% | flat | -16% | |

Sources: niche_dynamics_game_product_model.csv, _game_class.csv, _game_art_style.csv, _game_camera.csv and _game_setting.csv (`rev_cur_usd`, `rev_prior_usd`, `rev_yoy`, `rev_h2_h1`, `rev_last3m_yoy`, `dl_yoy`, `rpd_cur_usd`, `rpd_prior_usd`). Quarterly figures are from niche_monthly_game_product_model.csv and niche_monthly_game_art_style.csv.

### Table 4. Themes: large and big movers (niche_dynamics_game_theme.csv, rev_prior >= $50M and |YoY| >= 20%, plus the largest themes)

| Theme | Rev cur $M | Rev prior $M | YoY | Δ $M | H2/H1 | Last3m |
|---|---|---|---|---|---|---|
| Cooking / Food | 891 | 402 | +122% | +489 | +37% | +112% |
| Theme Park | 151 | 76 | +98% | +75 | -15% | +5% |
| Drama | 1,265 | 675 | +87% | +590 | +14% | +56% |
| Hypercasual (theme) | 1,017 | 582 | +75% | +436 | +15% | +53% |
| Music | 132 | 80 | +66% | +53 | +143% | +307% |
| Abstract | 155 | 102 | +52% | +53 | +46% | +61% |
| Art | 106 | 80 | +32% | +26 | +29% | +77% |
| Chibi Creature | 345 | 266 | +30% | +79 | +7% | +25% |
| Business | 223 | 175 | +27% | +48 | +43% | +78% |
| Sports - Soccer | 1,184 | 970 | +22% | +213 | +28% | +42% |
| Vehicles - Car | 133 | 109 | +22% | +24 | +17% | +11% |
| Empire Building (large) | 2,422 | 2,092 | +16% | +330 | -6% | -6% |
| Combat Arena (largest) | 5,503 | 5,717 | -4% | -214 | +2% | -1% |
| Money / Treasure | 3,982 | 4,480 | -11% | -498 | -11% | -17% |
| Adventure | 3,887 | 4,703 | -17% | -816 | -5% | -11% |
| Zombie | 2,537 | 2,744 | -8% | -208 | -36% | -42% |
| Pokémon / Battle Creatures | 1,540 | 1,940 | -21% | -400 | +5% | +15% |
| Otome | 498 | 675 | -26% | -177 | -24% | -46% |
| Idol | 274 | 402 | -32% | -128 | -12% | -37% |
| Magic | 235 | 327 | -28% | -91 | -28% | -34% |
| Norse Mythos | 103 | 171 | -40% | -68 | -5% | -37% |

### Patterns

1. **Hybridcasual is where casual players' spending deepens.** The product model grows +24% and accelerates (last3m +38%) while its downloads fall 12%. Revenue per download rises from $0.40 to $0.57 (+42%). The "Hypercasual" art style triples its quarterly revenue. **Growth comes from monetization depth (IAP layered on simple mechanics), not from more installs.** This matches the Sort, Block, Eat & Grow and Screw apps (simple 3D-cartoon/hypercasual art, top-down board, IAP plus ads).
2. **Mid-core, High Fantasy, Sci-Fi, 3D Anime and Isometric all decline.** Gacha/MMO/4X production values are not where the money is growing. 4X (Empire Building theme +16%) is the exception, but it is decelerating.
3. **"Modern" setting (+$1,104M) and "Cooking/Food" + "Drama" themes** carry the merge/narrative wave (Gossip Harbor, Tasty Travels, Flambé). These are real-life, relatable themes with story hooks, not fantasy.
4. **Music theme** (+66%, H2/H1 +143%) comes from a small base and largely from one launch, hololive Dreams ($52.6M, released 2026-07, in the Music/Rhythm sub-genre). Do not over-read it.
5. **Camera:** top-down/side (puzzle boards) is flat in aggregate. Growth sits inside specific mechanics, not in the camera type.

## 5. Stagnating-but-large niches where incumbents weaken (openings)

Method (niche_top_apps.csv): take the prior-period top-10 apps of each flat or declining sub-genre with current revenue of at least $150M. Count how many of them are down, and compute their aggregate YoY. Then list the apps released since 2024-07 that are already in the current top-10.

### Table 5. Incumbent weakness in flat/declining large sub-genres

| Sub-genre | Rev cur $M | YoY | H2/H1 | Prior top-10: down / agg YoY | New-entrant share | Entrants already in current top-10 | Reading |
|---|---|---|---|---|---|---|---|
| Match Pair | 600 | -5% | -15% | 9/10, -11% | 17% | Car Match ($22.6M), Goods Puzzle 3D ($8.9M), Box Jam ($7.9M) | **Opening.** Demand holds (DL 1,224M, +15%; US ts +15%), incumbents fade (Triple Match 3D -33%, Zen Match -44%), newcomers get in |
| Tycoon / Crafting | 1,531 | +1% | -3% | 8/10, -12% | 19% | My Garden Tale ($105.2M, 2025-08), Palmon: Survival ($45.6M), 时尚百货城 ($45.4M) | **Opening.** Family Island -38%, Klondike Adventures -45%. China in-country +146% |
| Idler | 359 | -4% | +2% | 10/10, -36% | 21% | Paranoize ($13.8M, 2026-03), XP Hero ($10.9M) | **Opening, fragmented** (top1 7%, HHI 0.028). Gold and Goblins -46% |
| Word | 236 | -6% | -1% | 7/10, -12% | 8% | Bubble Word Jam ($4.4M) | Partial. Wordscapes -27% and Words With Friends -47%, but NYT Games +27% ($66.6M) is a subscription bundle |
| Coin Looters | 2,503 | -8% | -10% | 8/10, -13% | 5% | Top Tycoon ($81.0M), Coin Master - Board Adventure ($51.8M) | Incumbents weaken, but top3 is 88% and UA is costly. Possible D2C effect |
| Slots | 2,363 | -17% | -14% | 9/10, -13% | 1% | none | Shrinking demand, not an opening (rising US UA share, new-entrant share 1%) |
| Match Swap | 5,150 | -2% | -7% | 7/10, -4% | 1% | none | Closed. Royal Kingdom (+121%) captures what Royal Match loses |
| Hidden Objects | 232 | -19% | -14% | 9/10, -21% | 3% | none | Demand decline (DL -24%), no entrant traction. Not an opening |
| Match Blast | 514 | -0% | -7% | 8/10, +1% | 0% | none | Toon Blast +16% holds 72%. Closed |
| Bingo | 424 | -3% | -11% | 7/10, -3% | 3% | MONOPOLY: Bingo! ($14.0M) | Share shifts between incumbents (Bingo Blitz -30%, Bingo Voyage +124%) |
| Customization | 406 | -3% | -3% | 6/10, -10% | 3% | none | Design Home -27%. Low entrant traction |
| Board | 357 | +3% | -2% | 5/10, +1% | 3% | none | Stable. Chess.com +32%, TopTop +42% |
| Tabletop Cards | 280 | +3% | -0% | 5/10, -2% | 7% | Jackaroo King ($10.3M) | Stable. Phase 10 -34%, UNO -11% |
| Interactive Story | 515 | -26% | -21% | 10/10, -32% | 8% | キャラぷ (AI chat story, $11.6M) | Decline led by single app, but the AI-chat story entrant is a signal |
| 4X Strategy | 7,584 | +2% | -18% | 7/10, +5% | 23% | Kingshot ($956.2M) | Leadership rotates to newcomers (Kingshot +231%, Tiles Survive! +939% with a tile-match front end). Not small-team scale |

Sources: niche_top_apps.csv (prior/current revenue per app), niche_leaders_full_game_sub_genre.csv (`new_entrants_share_of_top100`), niche_dynamics_game_sub_genre.csv, leaders.csv (app YoY).

## 6. Lifecycle check: how long do casual-puzzle hits last? (app_series_features.csv + leaders.csv)

Sample: apps released on or after 2024-07 (leaders.csv `release_date`) with current revenue of at least $3M. For each app, I took the months from `first_month_with_revenue` to `peak_month_rev`.

| Group | New-entrant apps | Median months to peak | Peaked by 2026-03 (at least 6 months before the window end) |
|---|---|---|---|
| Casual-puzzle trend niches (Sort, Block, Screw, Eat & Grow, Physics, Match Pair, Riddle) | 52 | 7 | 26 (50%), e.g. Screwdom (peak 2025-07), Knit Out (2025-09), Happy Screw Trip 3D (2026-01), Pixel Flow! (2026-03) |
| Merge-2 / Solitaire / Match Swap / Match Blast | 15 | 12 | 1 (7%) |
| Mid-core (4X, RPGs, shooters, TD) | 108 | 2.5 | 75 (69%) |

Implication: casual-puzzle trend mechanics reach peak in about 7 months, and half of the 2024-26 cohort is already past peak. **Windows are short but repeatable.** Each new mechanic (screw → block jam → pixel/yarn/sand sort) opens a fresh window. That favors a team that can prototype and validate creatives in weeks. Merge-2 and Solitaire hits build for about a year and hold, which rewards LiveOps depth over speed.

Mechanic name clusters across all per-niche top-100 lists (niche_top_apps.csv, regex on app name, deduplicated by app, so approximate):
- yarn/wool/knit/tangle/rope: 94 apps, $142.9M vs $39.9M (+258%).
- pixel/flow: 140 apps, $248.2M vs $52.8M (+370%; Pixel Flow! alone is $185.1M).
- sand: $43.2M vs $15.3M.
- marble/ball sort: $38.0M vs $11.5M.
- hole: $169.6M vs $84.9M (+100%).
- screw/pin/bolt: $195.3M vs $165.3M (+18%, mature).
- "merge" in name: $2,944.8M vs $1,772.5M (+66%).


## 7. Hypotheses for prototypes (ranked by fit × evidence)

Reader fit: a small studio strong in casual puzzle and merge mechanics, playable ads and a micro-game feed. "Accessibility" reflects concentration (top1/top3/HHI), new-entrant share and production scale. The pass/kill thresholds in the revenue tests are the team's own pre-registered bars, **not** benchmarks from this dataset. The dataset has no CPI, retention or ad-revenue data.

### games-01: Next "Sort-family" mechanic (fast follow in the post-Pixel-Flow window)
- **Claim:** In Sort, revenue is still being created by new mechanics, not by incumbents. A new sort/flow variant (yarn, sand, marble, pixel) built in 2-3 weeks can beat the team's IPM bar in a playable-ad test. A falsifying result would be all variants failing that bar while a Pixel Flow-style control passes.
- **Evidence:**
  - Sort: rev $754M vs $197M (+283%), H2/H1 +62%, last3m +272%. Sep-2026 is $93M/month (niche_dynamics/niche_monthly_game_sub_genre.csv).
  - Entrants are +$464M of +$557M; new-entrant share is 76%; top1 Pixel Flow! has 25%; HHI 0.093 (niche_leaders_full_game_sub_genre.csv).
  - US ad impression share is 10.86%, +5.29 pp (the largest gain), with ad_intensity_us 3.99 (rank 10). Downloads are 1,728M, +53% (niche_dynamics_game_sub_genre.csv).
  - Half of 52 casual-puzzle entrants peaked within about 7 months (app_series_features.csv `peak_month_rev`).
- **Driver:** entrants. **Accessibility:** high on build (2D/3D-cartoon boards, top-down). Hard on UA (Turkey has 56.6% of top-5 revenue, and the impression arms race). Playable-ad skill is the edge.
- **Prototype:** 3 mechanic variants (e.g. yarn-pull sort, sand-pour sort, marble-track sort) × 2 creatives each, built as playable ads plus a 20-level vertical slice in the micro-game feed.
- **Revenue test (≤4 weeks):**
  - Weeks 1-2: playable-ad A/B on AppLovin/Unity in US/CA. Kill below the team's IPM/CTR bar relative to a Pixel Flow-style control creative.
  - Weeks 3-4: Android soft launch of the winner in CA/AU with hybrid IAP (remove-ads + boosters) plus rewarded ads. Measure D1/D7 and ARPDAU against a pre-set LTV/CPI ratio.
- **Risks:** the window closes fast (Seat Away -86%, Bus Jam -78% after their wave). Rising CPI from the impression race. Clones get copied within weeks. IAP figures under-state ad revenue, so the category is bigger than shown.
- **Confidence:** 0.60

### games-02: Merge-2 with cooking/drama meta (narrative merge)
- **Claim:** Merge-2 demand is growing faster than any large sub-genre, and newcomers with food or drama themes still reach $20-135M. A merge-2 board with a short-drama episodic hook will show a higher playable-ad CTR and "next episode" fake-door conversion than a plain merge-2 control.
- **Evidence:**
  - Match Merge 2 is $2,666M vs $1,419M (+88%), H2/H1 +27%, last3m +79% (niche_dynamics_game_sub_genre.csv).
  - New entrants: Flambé $135.7M (2024-10), Mystery Town $87.3M, Hollywood Merge $44.7M (2025-08), Foodstars $21.6M. New-entrant share is 16% (niche_leaders_full_game_sub_genre.csv).
  - Themes: Cooking/Food +$489M (+122%) and Drama +$590M (+87%) (niche_dynamics_game_theme.csv).
  - Gossip Harbor is +$605M = 48% of the niche Δ (niche_top_apps.csv).
- **Driver:** leaders (86% of Δ from apps in both periods), with a credible entrant tail.
- **Accessibility:** medium-low. Top1 42%, top3 61%, China 67% of top-5 revenue. RPD $4.70 means deep LiveOps and content cost. The studio's merge and short-drama assets reduce build cost.
- **Prototype:** a merge-2 orders board in a cooking setting. Each completed order chain unlocks a 20-30 s vertical drama clip. The studio already has merge mechanics and a short-drama swipe format.
- **Revenue test:**
  - Playable-ad CTR/IPM in US for a drama-hook creative vs a plain-merge creative.
  - A 2-week US iOS store-page test (custom product pages) measuring page conversion.
  - An in-feed fake-door "unlock next episode $1.99", measuring tap-to-purchase intent.
- **Risks:** incumbent-led growth (Gossip Harbor alone is 42% of the top-100). High UA bids from Chinese publishers. Content treadmill. Older merge leaders fade (Travel Town last3m -23%), so retention-content cost is high.
- **Confidence:** 0.45

### games-03: Hybridcasual tower-defense / roguelite defense
- **Claim:** Tower Defense growth is carried by new hybridcasual entrants, and the market is fragmented. A simple lane-defense roguelite with merge-upgrade meta can hit an acceptable CPI and D7 in a one-country soft launch.
- **Evidence:**
  - Tower Defense is $851M vs $723M (+18%), H2/H1 +10%, last3m +28% (niche_dynamics_game_sub_genre.csv).
  - Entrants are +$130M versus +$22M from apps in both periods. New-entrant share is 41%; top1 17%; HHI 0.064 (niche_leaders_full_game_sub_genre.csv).
  - Named entrants: Clash of Critters $40.2M, セルサバイバー $39.2M, 협타디 $29.9M (+1114%), Galaxy Defense $21.1M (+105%).
  - Hybridcasual product model is $3,309M (+24%), with RPD from $0.40 to $0.57 (niche_dynamics_game_product_model.csv).
- **Driver:** entrants. **Accessibility:** medium-high. Fragmented, and the 2D/top-down build is feasible in weeks. Asian publishers dominate (China 48.1%, Hong Kong 16.8%, South Korea 14.0%).
- **Prototype:** one-lane defense where merging two identical towers upgrades them (merge-skill transfer), with roguelite card picks between waves and 10 waves.
- **Revenue test:** playable-ad IPM test in US + DE (2 weeks). Then a 2-week Android soft launch in PH/CA, measuring D1/D7 and IAP conversion on a starter pack.
- **Risks:** fast lifecycle (BangBang Survivor -40%, 守塔不能停 -81%). Mid-core-like monetization needs balance tuning beyond 4 weeks. US ad intensity is rank 31, which means moderate UA competition.
- **Confidence:** 0.45

### games-04: Solitaire hybrid without a license (association/sort twist)
- **Claim:** Solitaire growth is mostly one licensed hit, but a non-licensed hybrid (Solitaire Associations Journey) reached $43.8M within about a year. A solitaire-plus-twist prototype with a casual meta can pass a store-page and playable-ad test in the US 35+ audience.
- **Evidence:**
  - Solitaire is $455M vs $330M (+38%), H2/H1 +18% (niche_dynamics_game_sub_genre.csv).
  - Disney Solitaire is +$164M = 132% of Δ; Solitaire Associations Journey is $43.8M, 2025-08, US, 82.6M downloads (niche_top_apps.csv, leaders.csv).
  - Incumbents fade: Solitaire Grand Harvest -43%, Tiki Solitaire -25% (niche_leaders_full_game_sub_genre.csv).
  - Country: JP +178% ($36.1M), GB +94%, KR +276% (country_niche_dynamics.csv).
- **Driver:** mixed (single-app plus entrants). **Accessibility:** medium. Top1 51%, top3 82%, but old incumbents are shrinking and new-entrant share is 62% (mostly Disney).
- **Prototype:** TriPeaks with a sort or association goal layer (cards grouped by color/category to clear) and a light decoration meta.
- **Revenue test:** playable-ad CTR in US/GB targeted at 35+. A 2-week iOS soft launch in GB, measuring D7 and the share of payers buying a $2.99 booster pack.
- **Risks:** license-driven growth is not replicable. The 35+ audience is expensive in UA. The category depends heavily on ads, which this data cannot see.
- **Confidence:** 0.40

### games-05: Eat & Grow / hole puzzle (puzzle-ified hole mechanic)
- **Claim:** Hole games moved from hypercasual to IAP puzzle levels (All in Hole RPD ≈ $8.7). Newcomers reach $15M in under a year. A hole-puzzle prototype with level goals and a booster economy will find a profitable CPI band in one soft-launch country.
- **Evidence:**
  - Eat & Grow is $179M vs $96M (+87%), H2/H1 +29%, last3m +48% (niche_dynamics_game_sub_genre.csv).
  - All in Hole is $98.0M (+64%, 55% share). Hole It 3D and Hole Stars are $14.6M each, released 2025 (niche_leaders_full_game_sub_genre.csv).
  - "hole" name cluster: $169.6M vs $84.9M (+100%) (niche_top_apps.csv).
  - US is $117.2M, +77% (country_niche_dynamics.csv).
- **Driver:** leaders (both +$77M vs entrants +$6M) with a small entrant tail. **Accessibility:** medium. HHI 0.319 and top1 55% (concentrated), but the mechanic is cheap to build and playable-ad friendly. Base under $200M.
- **Prototype:** a hole level-puzzle where objects must be eaten in color order to fill goal jars (a sort + hole hybrid), 30 levels.
- **Revenue test:** playable-ad IPM vs an All-in-Hole-style control (US). A 2-week Android soft launch in CA, measuring D1/D7 and booster IAP conversion.
- **Risks:** concentrated niche with 2 Israeli/French publishers dominating. Hole People shows decay (H2/H1 -77%).
- **Confidence:** 0.40

### games-06: Yarn/rope "untangle" physics-puzzle theme as a cross-mechanic skin
- **Claim:** Textile/rope themes are a growing creative motif across Sort, Screw and Physics. Re-skinning one existing studio mechanic with yarn/untangle visuals raises playable-ad CTR versus the same mechanic in its current skin.
- **Evidence:**
  - Yarn/wool/knit/tangle/rope name cluster: $142.9M vs $39.9M (+258%), 352.3M downloads (niche_top_apps.csv).
  - Physics is $107M vs $70M (+54%), last3m +84%. Wool Escape 3D $8.0M, Unravel Master +272% (niche_dynamics/niche_leaders_full_game_sub_genre.csv).
  - Yarn Loop $43.2M (Sort, 2025-11); Yarn Fever $16.6M, Knit Away $10.0M (Screw) (niche_leaders_full_game_sub_genre.csv).
  - Physics US ad impression share is +0.59 pp (niche_dynamics_game_sub_genre.csv).
- **Driver:** entrants. **Accessibility:** high. Physics top1 is Angry Birds 2 at 50%, but the yarn apps are new and fragmented.
- **Prototype:** take the studio's existing screw/pins mechanic and replace pins with yarn spools and ropes (soft-body visuals), 15 levels, as a playable ad plus a feed card.
- **Revenue test:** a 1-2 week paired creative test (same mechanic, two skins) on AppLovin US, measuring CTR/IPM. If it wins, add a 2-week soft launch.
- **Risks:** theme fatigue is fast (Wool Craze H2/H1 -69%, Knit Away -63%). The cluster comes from name matching, so it is approximate. Some apps are ad-monetized.
- **Confidence:** 0.40

### games-07: One-phone party game (impostor / charades) with a subscription pack store
- **Claim:** Western one-phone party games are growing on small bases with IAP/subscription packs. A pass-and-play impostor/word party game can reach a fake-door subscription intent rate that justifies a build.
- **Evidence:**
  - Social Party is $245M vs $197M (+24%), downloads 629M (+41%), US time spent +51% (niche_dynamics_game_sub_genre.csv).
  - Imposter Game — Fakeit is $8.6M (2025-08, Poland, +10,440%); Splash - Impostor Game $4.9M (+177%); Imposter Who? $2.8M; Charades Guess Game +146% (niche_leaders_full_game_sub_genre.csv).
  - Country: GB +102%, DE +69%, US +35% (country_niche_dynamics.csv).
  - ad_intensity_us 0.39 (rank 71), so IAP-heavy rather than ad-heavy (niche_dynamics_game_sub_genre.csv).
- **Driver:** leaders by dollars (both +$41M, with 鹅鸭杀 51% of Δ, Asian). The **Western entrant tail is the signal**. **Accessibility:** high build feasibility (no art-heavy content, word lists). Top-10 excluding WePlay is fragmented. The base is small for Western apps.
- **Prototype:** a pass-the-phone impostor word game with 10 free category packs, weekly subscription for 100+ packs, and TikTok-friendly party clips.
- **Revenue test:** TikTok/Meta paid UA to a store page or landing page in US/GB for 2 weeks (CPI, page conversion). Fake-door "Party Pass $3.99/week" with a pre-set intent threshold.
- **Risks:** viral/seasonal demand. Copycats are easy. Top revenue is in Asia (WePlay, 鹅鸭杀), which is a different market. Low RPD ($0.39).
- **Confidence:** 0.45

### games-08: Refresh of a stagnating large niche: Match Pair (triple-match 3D) with a new goal mechanic
- **Claim:** Match Pair demand is intact but incumbents are weakening. A triple-match variant with a new goal structure (e.g. goods sorting into shelves or a car-match traffic layer) can take share. That is what Car Match ($22.6M) and Box Jam did.
- **Evidence:**
  - Match Pair is $600M (-5%, H2/H1 -15%) but downloads are 1,224M (+15%) and US time spent +15% (niche_dynamics_game_sub_genre.csv).
  - 9/10 prior top-10 apps are down, aggregate -11%. Triple Match 3D is -33%, Zen Match -44% (niche_top_apps.csv, leaders.csv).
  - New-entrant share is 17%: Car Match $22.6M (+189%), Box Jam +407%, Goods Puzzle 3D $8.9M (niche_leaders_full_game_sub_genre.csv).
  - ad_intensity_us 2.07 (rank 25) (niche_dynamics_game_sub_genre.csv).
- **Driver:** mixed (both -$55M, entrants +$38M). **Accessibility:** medium-high. Top1 Match Factory! has 36%, top3 57%.
- **Prototype:** a 3D goods-sort triple-match where cleared triples fill customer orders (light merge/order meta), 30 levels, in the feed first.
- **Revenue test:** in-feed engagement A/B (completion and replay rate vs the studio's existing puzzle cards), plus a playable-ad IPM test in US. A 2-week soft launch only if both pass.
- **Risks:** a mature niche with expensive UA. The revenue decline may reflect true saturation. Match Factory! is still $213.7M.
- **Confidence:** 0.35

### games-09: Block-escape replacement window (leader fading)
- **Claim:** Block revenue keeps accelerating while the former leader declines. The niche rewards each new jam/escape variant. A block-escape prototype with a novel exit rule can win playable-ad tests against current Block Out!-style creatives.
- **Evidence:**
  - Block is $214M vs $135M (+58%), H2/H1 +31% (niche_dynamics_game_sub_genre.csv).
  - Color Block Jam is $99.0M, -6%, last3m -46%. Block Out! (2025-09) is +$49M = 62% of Δ (leaders.csv, niche_top_apps.csv).
  - New-entrant share is 52%; Turkey has 80.8% of top-5 revenue (niche_leaders_full_game_sub_genre.csv).
  - Downloads are 826M (+7%); ad_intensity_us 3.21 (rank 17) (niche_dynamics_game_sub_genre.csv).
- **Driver:** entrants. **Accessibility:** medium. Top1 47%, top3 77%. Turkish publishers iterate quickly.
- **Prototype:** block-slide escape where blocks exit only through gates matching color *and* shape, with a timer-free mode, 20 levels.
- **Revenue test:** a 2-week playable-ad IPM/CTR test (US/GB) vs a Block Out!-style control. Kill or continue on a pre-set bar.
- **Risks:** short lifecycle (Drop Away H2/H1 -55%, Water Out -65%). Dominated by experienced Turkish teams.
- **Confidence:** 0.35

### games-10: Hybrid monetization layer for the micro-game feed (hybridcasual depth)
- **Claim:** Casual spending is deepening per install (hybridcasual RPD +42%). Adding an IAP progression layer (remove-ads + booster pass + collection meta) to the studio's micro-game feed will lift revenue per user without reducing play sessions.
- **Evidence:**
  - Hybridcasual product model is $3,309M vs $2,661M (+24%), last3m +38%. RPD $0.40 → $0.57 while downloads fall 12% (niche_dynamics_game_product_model.csv).
  - Quarterly hybridcasual revenue went from $598M to $957M (niche_monthly_game_product_model.csv).
  - Hypercasual art style is $1,303M (+59%), RPD $0.084 → $0.173 (niche_dynamics_game_art_style.csv).
  - Games downloads overall are -10.6% (summary.json): growth must come from depth, not reach.
- **Driver:** mixed. **Accessibility:** high, because it reuses existing studio infrastructure.
- **Prototype:** a feed-level "Pass" (no ads + daily boosters + exclusive skins) and a collection meta across micro-games.
- **Revenue test:** a 4-week in-feed fake-door/price test (two price points), measuring tap-through, purchase intent and the session-length delta vs control.
- **Risks:** feed audiences may be ad-tolerant but IAP-averse. The macro trend does not guarantee feed-level conversion.
- **Confidence:** 0.40

### games-11: Daily-puzzle subscription bundle (word/logic) against aging word incumbents
- **Claim:** Within a declining Word niche, the subscription bundle (NYT Games +27%) gains while ad/IAP word apps shrink. A daily logic + word bundle (Connect-style, seat logic, cryptogram) can convert a measurable share of trial users to subscription.
- **Evidence:**
  - Word is $236M (-6%). NYT Games is $66.6M (+27%), Wordscapes -27%, Words With Friends -47% (niche_leaders_full_game_sub_genre.csv).
  - Riddle is $23M vs $12M (+96%, **base under $50M**). New-entrant share is 76%: Connect Master $5.8M, That's My Seat $3.9M, Cryptogram $1.1M (niche_leaders_full_game_sub_genre.csv).
  - Riddle downloads are 1,049M, with ad_intensity_us 21.6. That is mostly ad-monetized, so under-valued (niche_dynamics_game_sub_genre.csv).
  - Word in GB is +15% ($24.2M) while US is -11% (country_niche_dynamics.csv).
- **Driver:** entrants (Riddle), leaders (NYT). **Accessibility:** high build feasibility, low revenue ceiling outside a strong brand.
- **Prototype:** 3 daily puzzles (association grid, seat logic, cryptogram) with streaks; free daily plus an archive and hints subscription.
- **Revenue test:** a 3-4 week fake-door subscription ($2.99/month) via paid social to a landing page plus TestFlight in US/GB, measuring trial-start rate.
- **Risks:** NYT brand advantage. Tiny IAP base. Most value is ad revenue, which this dataset cannot see.
- **Confidence:** 0.30

### games-12: Coin-looter-lite meta on a puzzle core (contrarian)
- **Claim:** Coin Looters is a $2.5B niche whose two incumbents are weakening, and newcomers (Top Tycoon, a board-adventure spin-off) reached $50-80M. A puzzle-core game with a dice/board raid meta could show a higher ARPDAU proxy (fake-door spend intent) than a plain puzzle meta.
- **Evidence:**
  - Coin Looters is $2,503M (-8%, H2/H1 -10%) (niche_dynamics_game_sub_genre.csv).
  - MONOPOLY GO! is -$247M (-17%), Dice Dreams -30%; 8/10 prior top-10 are down (niche_top_apps.csv, leaders.csv).
  - Top Tycoon is $81.0M (+916%, 2025-01); Coin Master - Board Adventure is $51.8M (niche_leaders_full_game_sub_genre.csv).
  - Top3 share is 88%; US impression share -1.28 pp, so incumbents are pulling back UA (niche_dynamics_game_sub_genre.csv).
- **Driver:** leaders (decline), with an entrant tail. **Accessibility:** low. High concentration, social-casino-level LiveOps, and possible D2C migration of incumbents (invisible here).
- **Prototype:** a merge or sort puzzle that earns dice rolls; a board meta with raid/steal events; 2-week build.
- **Revenue test:** an in-feed fake-door "dice pack" offer vs a "booster pack" offer, comparing intent rates (4 weeks).
- **Risks:** heavy UA and LiveOps. Regulatory scrutiny of loot-like mechanics. The decline may be partly a web-shop shift rather than weakness.
- **Confidence:** 0.20

## 8. What not to chase (small-team lens)

- **FPS/3PS, Open World, MMORPG, MOBA, Battle Royale.** Growth is single-app or AAA and Chinese-led (Delta Force is 89% of FPS Δ). Top3 shares run 72-95%.
- **Slots, Hidden Objects, Match Blast, Match Swap.** Either shrinking demand or a closed market (new-entrant share 0-3%).
- **Artillery Shooter, Riddle, Jigsaw, Action Sandbox, Survival** as revenue theses. Each sits on a base under $50M or rests on one app (Castle Clashers 95% of Δ, Tomb Busters 95%, OneState RP 73%).

## 9. Files and columns used

- niche_dynamics_game_sub_genre.csv: rev_cur_usd, rev_prior_usd, rev_yoy, rev_abs_delta_usd, rev_h2_h1, rev_last3m_yoy, rev_class, rev_momentum, dl_cur, dl_yoy, dl_h2_h1, dl_last3m_yoy, rpd_cur_usd, ts_yoy, ts_per_user_yoy, imp_cur, imp_delta_pp, rev_share_us_cur, ad_intensity_us_cur, ad_intensity_us_rank.
- niche_dynamics_game_genre / _game_product_model / _game_class / _game_art_style / _game_camera / _game_setting / _game_theme.csv: same revenue and download columns plus rpd_prior_usd.
- niche_monthly_game_sub_genre / _game_product_model / _game_art_style / _game_camera.csv: rev_usd and dl by month.
- niche_leaders_full_game_sub_genre.csv: top1_name, top1_share_of_top100, top3_share, top10_share, hhi_top100, n_new_entrants_top100, new_entrants_share_of_top100, growth_decomp_*, leaders_top5, new_entrants_top5, fastest_growers_top5, biggest_decliners_top5, publisher_country_mix_top5, total_count_cur/prior, status.
- niche_top_apps.csv (field = game_sub_genre): app-level current/prior revenue for the Δ contributors, the incumbent top-10 analysis and the name clusters.
- leaders.csv (is_game = true, 2,122 apps): rev_cur_best_usd, rev_prior_best_usd, rev_yoy_best, s_rev_h2_h1, s_rev_last3m_yoy, release_date, publisher_country.
- app_series_features.csv: first_month_with_revenue, peak_month_rev.
- country_niche_dynamics.csv (dim = game_sub_genre): country split.
- summary.json: totals, thresholds, class counts.

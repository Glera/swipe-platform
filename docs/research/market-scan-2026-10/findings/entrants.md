# New players and drivers (segment: ENTRANTS)

Data room: `/Users/gleb/Documents/Codex/2026-10-10/sensor-tower/analysis/out/` (generated 2026-10-10). Windows: current 12m = 2025-10..2026-09, prior 12m = 2024-10..2025-09, H2/H1 = 2026-04..09 vs 2025-10..2026-03.

## 0. Measurement boundary and method (read first)

- **What "revenue" means here.** Sensor Tower store estimates = App Store + Google Play in-app purchases and paid downloads only. This excludes advertising revenue, web/D2C payments (including web shops), third-party Android stores (mainland China Android is largely absent), and PC/console/web. As a result:
  - Ad-monetized entrants (arrows/logic puzzles, Block Blast!, free short-drama apps) show huge downloads and almost no revenue. For them, downloads are the only proxy.
  - Chinese titles look iOS-heavy because the China Android stores are missing. Delta Force has an iOS share of 0.98 (`leaders.csv` `s_ios_rev_share_cur`).
  - Part of the decline at large incumbents (Royal Match, MONOPOLY GO!, Last War, Disney+, Audible, Bumble) may be payments moving to web shops, which this data cannot see. Treat "decliner" as "store revenue declined".
- **Entrant definition.** An entrant is an app with `release_date >= 2024-07-01` in `leaders.csv` and either `rev_cur_best_usd >= $10M` or `dl_cur >= 50M`. `leaders.csv` is the union of the global top-2000 by revenue and by downloads in both periods (4,455 apps), so every app above these thresholds is included. 191 apps qualify: 166 by revenue, 32 by downloads, 7 by both.
- **Trajectories.** These come from the monthly per-app series that also built `app_series_features.csv`: the local raw files `data/raw/app_series_*.json` (Sensor Tower `sales_report_estimates`, WW, monthly, 2024-10..2026-09, cents/100; no API call made). Check: for every app above $1M, the 12-month sum of the series is within 2% of `leaders.csv` `rev_cur_best_usd` (0 mismatches).
  - "Months to $1M/mo" = months from the first month with revenue to the first month at or above $1M.
  - "Months to peak" = months from the first month with revenue to the peak revenue month.
  - "Sep-26/peak" = Sep-2026 revenue / peak month revenue. 1.00 means the app is still at its peak.
  - Apps released 2024-07..09 are left-censored, because the series starts in 2024-10.
- **Incumbent.** Release before 2024-07 and `rev_prior_best_usd >= $1M` (2,176 apps).
- **Niche metrics.**
  - `niche_dynamics_game_sub_genre.csv` provides rev_cur/prior, yoy, H2/H1, dl, ad-intensity rank.
  - `niche_leaders_full_game_sub_genre.csv` / `_app_iq_category.csv` provide new-entrant share of top-100, concentration and growth decomposition.
  - "Pre-2024-07 apps in top-100" sums `niche_top_apps.csv` revenue of apps released before 2024-07 in the prior-period and current-period top-100 lists.
  - Niches with rev_prior < $50M are flagged SMALL BASE.
  - App IQ categories have no WW total in the data (`ww_total_rev_cur_usd` = 0), so app niches use top-100 sums.
- **Taxonomy.** The tags are Sensor Tower's own and can be re-assigned. For every niche-growth claim below I checked whether the growth comes from named new apps or from incumbents, and whether the tagged-app count jumped.
- **No per-app tags for some dimensions.** Product model, theme and art style exist only at niche level (`niche_dynamics_game_product_model/theme/art_style.csv`). Per-app "mechanics" below are inferred from sub-genre plus app names.

## 1. Breakout entrants since 2024-07 (>= $10M current-12m revenue or >= 50M downloads)

**Totals.** 191 apps, of which 144 are games. Together they made $8.54B in current-12m store revenue, $7.01B of it from games. Sources: `leaders.csv`, plus trajectories from `data/raw/app_series_*.json`.

**By release half-year** (apps >= $10M; n, current revenue):

| Release half | Apps | Revenue |
|---|---|---|
| 2024H2 | 56 | $4.68B |
| 2025H1 | 46 | $1.63B |
| 2025H2 | 39 | $1.55B |
| 2026H1 | 22 | $0.57B |
| 2026H2 | 3 | $0.09B |

Younger cohorts have had fewer months in the window, so read this table as a count of breakouts, not as a decline.

**Download-led entrants** (>= 50M dl but < $10M revenue) are ad-monetized or free-to-watch products whose earnings are invisible here:

- Arrows Puzzle Escape: 140.5M dl, $0.7M revenue.
- Arrows GO!: 99.0M dl, $0.0M.
- Arrow Puzzle: Tap Puzzle Games: 81.6M dl.
- Brain Puzzle 2: 82.9M dl.
- Mahjong Blast: 69.7M dl.
- FreeReels: 283.2M dl, $0.2M.
- Melolo: 151.7M dl.
- Story TV: 136.7M dl.
- Block Crazy Robo World: 100.9M dl.

Full list, sorted by current revenue:

| # | App | Niche (sub-genre / App IQ) | Genre | Pub. country | Release | Rev cur $M | Rev prior $M | DL cur M | 1st rev month | Months to $1M/mo | Peak rev month ($M) | Months 1st rev->peak | Sep-26 / peak | iOS rev share | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Kingshot | 4X Strategy | Strategy | China | 2024-08-16 | 956.2 | 289.0 | 72.9 | 2025-02 | 1 | 2026-05 (91.7) | 15 | 0.72 | 0.61 | left-censored (series start 2024-10) |
| 2 | Delta Force | FPS / 3PS | Shooter | China | 2024-09-25 | 560.9 | 207.3 | 49.8 | 2024-10 | 0 | 2026-02 (57.0) | 16 | 0.83 | 0.98 | left-censored (series start 2024-10) |
| 3 | Pokémon TCG Pocket | Card Battler | Strategy | Japan | 2024-08-09 | 333.1 | 852.7 | 25.4 | 2024-10 | 0 | 2024-11 (149.9) | 1 | 0.08 | 0.69 | left-censored (series start 2024-10) |
| 4 | 메이플 키우기 | Idle RPG | RPG | Japan | 2025-04-30 | 297.0 | 0.4 | 7.1 | 2025-05 | 6 | 2025-12 (49.9) | 7 | 0.33 | 0.41 |  |
| 5 | Grok AI | AI Assistant | app | US | 2024-12-20 | 282.9 | 30.3 | 129.3 | 2025-02 | 0 | 2026-09 (41.6) | 19 | 1.00 | 0.72 |  |
| 6 | NetShort - Popular Dramas & TV | Short Drama | app | Singapore | 2024-07-12 | 248.3 | 112.7 | 199.6 | 2024-10 | 0 | 2026-09 (28.7) | 23 | 1.00 | 0.66 | left-censored (series start 2024-10) |
| 7 | 无畏契约：源能行动 | FPS / 3PS | Shooter | China | 2025-08-18 | 245.4 | 21.8 | 19.1 | 2025-08 | 0 | 2026-08 (31.8) | 12 | 0.60 | 1.00 |  |
| 8 | Disney Solitaire | Solitaire | Tabletop | Israel | 2024-11-27 | 232.6 | 68.3 | 31.3 | 2024-12 | 4 | 2026-03 (26.2) | 15 | 0.61 | 0.59 |  |
| 9 | Dramawave | Short Drama | app | US | 2024-09-12 | 227.4 | 103.5 | 156.7 | 2024-10 | 1 | 2026-08 (25.1) | 22 | 0.94 | 0.58 | left-censored (series start 2024-10) |
| 10 | Pixel Flow! | Sort | Puzzle | Turkey | 2025-08-17 | 185.1 | 0.0 | 33.6 | 2025-09 | 2 | 2026-03 (23.0) | 6 | 0.57 | 0.67 |  |
| 11 | SD Gundam G Generation ETERNAL | Turn-Based Tactics | Strategy | Japan | 2025-02-10 | 175.2 | 149.6 | 1.1 | 2025-04 | 0 | 2025-05 (42.5) | 1 | 0.21 | 0.53 |  |
| 12 | Flambé: Merge & Cook | Match Merge 2 | Puzzle | China | 2024-10-14 | 135.7 | 15.3 | 9.6 | 2024-10 | 7 | 2026-08 (15.1) | 22 | 0.94 | 0.55 |  |
| 13 | Where Winds Meet | Open World Adventure | RPG | China | 2024-12-31 | 119.2 | 66.6 | 14.0 | 2025-01 | 0 | 2025-12 (19.3) | 11 | 0.31 | 0.90 |  |
| 14 | My Garden Tale | Tycoon / Crafting | Simulation | Hong Kong | 2025-08-05 | 105.2 | 6.6 | 10.6 | 2025-08 | 0 | 2026-07 (11.9) | 11 | 0.52 | 0.93 |  |
| 15 | Screwdom | Screw | Puzzle | Vietnam | 2024-12-18 | 102.9 | 64.4 | 12.6 | 2025-01 | 2 | 2025-07 (12.2) | 6 | 0.68 | 0.79 |  |
| 16 | Heartopia | Avatar Life | Simulation | China | 2024-07-16 | 102.2 | 24.2 | 22.5 | 2024-10 | 0 | 2026-02 (22.7) | 16 | 0.30 | 0.74 | left-censored (series start 2024-10) |
| 17 | Tiles Survive! | 4X Strategy | Strategy | Switzerland | 2024-11-01 | 97.4 | 9.4 | 31.0 | 2024-11 | 8 | 2026-03 (10.9) | 16 | 0.67 | 0.56 |  |
| 18 | Suno - AI Songs, Music, Lyrics | AI Content Generator | app | US | 2024-07-01 | 91.9 | 17.2 | 48.4 | 2024-10 | 5 | 2026-09 (11.2) | 23 | 1.00 | 0.62 | left-censored (series start 2024-10) |
| 19 | Last Asylum: Plague | 4X Strategy | Strategy | China | 2025-09-05 | 91.7 | 0.0 | 23.3 | 2026-02 | 1 | 2026-09 (18.6) | 7 | 1.00 | 0.36 |  |
| 20 | Arknights: Endfield | Open World Adventure | RPG | China | 2025-11-21 | 88.9 | 0.0 | 8.6 | 2026-01 | 0 | 2026-02 (18.6) | 1 | 0.31 | 0.58 |  |
| 21 | Mystery Town: Merge Games | Match Merge 2 | Puzzle | Hong Kong | 2024-07-16 | 87.3 | 5.2 | 9.0 | 2024-10 | 10 | 2026-09 (11.9) | 23 | 1.00 | 0.48 | left-censored (series start 2024-10) |
| 22 | Tomb Busters | Survival | RPG | China | 2024-07-16 | 86.5 | 30.6 | 7.3 | 2025-01 | 5 | 2026-02 (14.4) | 13 | 0.34 | 0.99 | left-censored (series start 2024-10) |
| 23 | Top Tycoon: Coin Theme Empire | Coin Looters | Party | Hong Kong | 2025-01-17 | 81.0 | 8.0 | 32.6 | 2025-02 | 5 | 2026-01 (7.7) | 11 | 0.82 | 0.56 |  |
| 24 | Lands of Jail | 4X Strategy | Strategy | Hong Kong | 2024-09-18 | 75.8 | 40.7 | 12.4 | 2025-03 | 1 | 2025-10 (8.4) | 7 | 0.50 | 0.47 | left-censored (series start 2024-10) |
| 25 | FlickReels | Short Drama | app | Singapore | 2024-07-12 | 74.7 | 63.3 | 30.0 | 2024-10 | 2 | 2025-08 (9.1) | 10 | 0.86 | 0.58 | left-censored (series start 2024-10) |
| 26 | 洛克王国：世界 | Open World Adventure | RPG | China | 2026-03-22 | 71.7 | 0.0 | 10.1 | 2026-03 | 0 | 2026-04 (21.2) | 1 | 0.27 | 1.00 |  |
| 27 | 뱀피르 | MMORPG | RPG | South Korea | 2025-08-20 | 70.4 | 41.5 | 0.3 | 2025-08 | 0 | 2025-09 (34.3) | 1 | 0.08 | 0.22 |  |
| 28 | Learna AI: English Learning | Language Education | app | United Arab Emirates | 2024-09-24 | 62.9 | 14.3 | 64.2 | 2024-10 | 4 | 2026-09 (7.7) | 23 | 1.00 | 0.78 | left-censored (series start 2024-10) |
| 29 | SOL: enchant | MMORPG | RPG | South Korea | 2026-06-10 | 61.1 | 0.0 | 0.3 | 2026-06 | 0 | 2026-07 (23.3) | 1 | 0.25 | 0.04 |  |
| 30 | 마비노기 모바일 | MMORPG | RPG | Japan | 2025-01-23 | 61.1 | 73.3 | 1.1 | 2025-03 | 0 | 2025-05 (14.9) | 2 | 0.34 | 0.42 |  |
| 31 | X-Clash: Survival Challenge | 4X Strategy | Strategy | China | 2025-04-08 | 58.6 | 0.8 | 73.4 | 2025-06 | 4 | 2026-03 (5.7) | 9 | 0.81 | 0.64 |  |
| 32 | 永远的蔚蓝星球-周杰伦代言 | Tower Defense | Strategy | Hong Kong | 2025-05-27 | 58.1 | 16.9 | 3.3 | 2025-05 | 1 | 2026-06 (7.9) | 13 | 0.48 | 0.87 |  |
| 33 | Tipsy Chat: Live Your Story | AI Companion | app | US | 2024-08-15 | 54.5 | 0.7 | 5.5 | 2024-10 | 16 | 2026-09 (17.8) | 23 | 1.00 | 0.65 | left-censored (series start 2024-10) |
| 34 | Foundation: Galactic Frontier | 4X Strategy | Strategy | Switzerland | 2025-04-03 | 53.6 | 1.9 | 6.8 | 2025-04 | 6 | 2026-04 (5.5) | 12 | 0.82 | 0.57 |  |
| 35 | Chaos Zero Nightmare | Turn-based RPG | RPG | South Korea | 2025-06-17 | 53.4 | 0.0 | 3.8 | 2025-10 | 0 | 2025-12 (10.0) | 2 | 0.19 | 0.46 |  |
| 36 | NTE: Neverness to Everness | Open World Adventure | RPG | Singapore | 2026-01-22 | 52.9 | 0.0 | 11.0 | 2026-04 | 0 | 2026-05 (15.7) | 1 | 0.33 | 0.55 |  |
| 37 | hololive Dreams | Music / Rhythm | Arcade | Japan | 2026-07-09 | 52.6 | 0.0 | 3.7 | 2026-07 | 0 | 2026-08 (23.6) | 1 | 0.52 | 0.57 |  |
| 38 | 세븐나이츠 리버스 - 콜라보 | Turn-based RPG | RPG | South Korea | 2025-05-09 | 52.5 | 80.5 | 2.4 | 2025-05 | 0 | 2025-06 (31.1) | 1 | 0.04 | 0.49 |  |
| 39 | Coin Master - Board Adventure | Coin Looters | Party | Israel | 2025-07-14 | 51.8 | 0.0 | 11.9 | 2025-07 | 7 | 2026-05 (8.0) | 10 | 0.97 | 0.41 |  |
| 40 | Block Out! - Color Sort Puzzle | Block | Puzzle | Turkey | 2025-09-30 | 48.8 | 0.0 | 36.5 | 2025-10 | 5 | 2026-07 (9.7) | 9 | 0.91 | 1.00 |  |
| 41 | 信長の野望 真戦 | 4X Strategy | Strategy | China | 2025-10-07 | 47.1 | 0.0 | 1.3 | 2025-11 | 0 | 2026-03 (6.2) | 4 | 0.43 | 0.71 |  |
| 42 | Palmon: Survival | Tycoon / Crafting | Simulation | Hong Kong | 2024-10-25 | 45.6 | 13.5 | 8.0 | 2024-11 | 6 | 2026-03 (5.4) | 16 | 0.57 | 0.45 |  |
| 43 | 时尚百货城 | Tycoon / Crafting | Simulation | China | 2026-01-28 | 45.4 | 0.0 | 5.2 | 2026-01 | 1 | 2026-09 (7.4) | 8 | 1.00 | 0.99 |  |
| 44 | Hollywood Merge | Match Merge 2 | Puzzle | Ireland | 2025-08-13 | 44.7 | 0.0 | 15.3 | 2026-01 | 2 | 2026-09 (12.4) | 8 | 1.00 | 0.49 |  |
| 45 | Shadowverse: Worlds Beyond | Card Battler | Strategy | Japan | 2025-02-06 | 44.1 | 48.3 | 0.7 | 2025-06 | 0 | 2025-06 (17.9) | 0 | 0.10 | 0.73 |  |
| 46 | Solitaire Associations Journey | Solitaire | Tabletop | US | 2025-08-28 | 43.8 | 0.0 | 82.6 | 2025-10 | 1 | 2026-08 (6.3) | 10 | 0.97 | 0.74 |  |
| 47 | Yarn Loop: Knit Puzzle | Sort | Puzzle | Turkey | 2025-11-21 | 43.2 | 0.0 | 7.5 | 2025-12 | 2 | 2026-08 (7.4) | 8 | 0.93 | 0.53 |  |
| 48 | 三国：冰河时代 | 4X Strategy | Strategy | Singapore | 2024-11-27 | 43.0 | 15.8 | 0.8 | 2024-11 | 4 | 2026-05 (4.4) | 18 | 0.77 | 0.98 |  |
| 49 | Dragon Traveler | Squad RPG | RPG | China | 2025-01-02 | 43.0 | 7.2 | 3.6 | 2025-01 | 0 | 2026-02 (7.9) | 13 | 0.29 | 0.45 |  |
| 50 | StardustTV - Short Drama&Movie | Short Drama | app | Hong Kong | 2024-07-03 | 42.2 | 38.0 | 27.7 | 2024-10 | 0 | 2025-06 (5.0) | 8 | 0.41 | 0.61 | left-censored (series start 2024-10) |
| 51 | Clash of Critters | Tower Defense | Strategy | China | 2024-12-26 | 40.2 | 0.2 | 11.3 | 2025-01 | 16 | 2026-09 (15.2) | 20 | 1.00 | 0.56 |  |
| 52 | セルサバイバー - シューティングゲーム | Tower Defense | Strategy | Singapore | 2025-06-10 | 39.2 | 0.6 | 12.7 | 2025-07 | 5 | 2026-02 (5.5) | 7 | 0.69 | 0.66 |  |
| 53 | Kling AI: AI Image&Video Maker | AI Content Generator | app | Singapore | 2024-11-03 | 38.9 | 12.3 | 47.4 | 2024-11 | 4 | 2026-05 (4.9) | 18 | 0.80 | 0.66 |  |
| 54 | 逆战：未来 | FPS / 3PS | Shooter | China | 2026-01-12 | 37.3 | 0.0 | 3.5 | 2026-01 | 0 | 2026-02 (13.1) | 1 | 0.11 | 1.00 |  |
| 55 | Manus - AI Agent & Automation | AI Assistant | app | Singapore | 2025-03-27 | 36.8 | 5.7 | 16.7 | 2025-03 | 4 | 2026-05 (5.1) | 14 | 0.55 | 0.66 |  |
| 56 | RO仙境傳説：世界之旅 | MMORPG | RPG | South Korea | 2026-01-04 | 36.0 | 0.0 | 2.4 | 2026-01 | 0 | 2026-02 (5.8) | 1 | 0.80 | 0.72 |  |
| 57 | VibeShort: AI Short Dramas | Short Drama | app | Hong Kong | 2026-02-07 | 35.5 | 0.0 | 33.6 | 2026-03 | 1 | 2026-09 (9.3) | 6 | 1.00 | 0.62 |  |
| 58 | キングダム 覇道 | 4X Strategy | Strategy | Japan | 2025-09-29 | 34.8 | 0.0 | 0.4 | 2025-10 | 0 | 2025-12 (4.8) | 2 | 0.34 | 0.72 |  |
| 59 | Castle Clashers! | Artillery Shooter | Action | France | 2025-05-26 | 34.5 | 0.0 | 33.9 | 2025-10 | 5 | 2026-05 (6.8) | 7 | 0.63 | 0.54 |  |
| 60 | FlareFlow | Short Drama | app | Singapore | 2025-03-26 | 33.6 | 20.8 | 20.6 | 2025-04 | 1 | 2025-09 (7.1) | 5 | 0.12 | 0.60 |  |
| 61 | Infinity Nikki | Open World Adventure | RPG | China | 2024-11-26 | 32.7 | 41.8 | 2.8 | 2024-12 | 0 | 2024-12 (9.5) | 0 | 0.17 | 0.87 |  |
| 62 | BLEACH: Soul Resonance | Hack and Slash | Action | China | 2025-09-12 | 32.6 | 0.0 | 6.7 | 2025-11 | 0 | 2025-12 (8.2) | 1 | 0.20 | 0.62 |  |
| 63 | Wizardry Variants Daphne | Turn-based RPG | RPG | Japan | 2024-10-11 | 31.5 | 38.2 | 1.2 | 2024-10 | 0 | 2025-03 (4.6) | 5 | 0.39 | 0.48 |  |
| 64 | Marble Sort! | Sort | Puzzle | France | 2025-10-27 | 31.0 | 0.0 | 16.8 | 2025-12 | 3 | 2026-05 (5.9) | 5 | 0.64 | 0.60 |  |
| 65 | Gecko Out | Sort | Puzzle | Turkey | 2025-01-23 | 29.9 | 2.7 | 7.5 | 2025-05 | 4 | 2026-04 (3.0) | 11 | 0.62 | 0.60 |  |
| 66 | 협타디: 협동 타워 디펜스 | Tower Defense | Strategy | South Korea | 2024-07-25 | 29.9 | 2.5 | 2.3 | 2024-10 | 13 | 2026-09 (3.8) | 23 | 1.00 | 0.51 | left-censored (series start 2024-10) |
| 67 | Top Girl | 4X Strategy | Strategy | Singapore | 2024-11-05 | 29.6 | 44.1 | 4.2 | 2024-11 | 1 | 2025-03 (6.8) | 4 | 0.26 | 0.00 |  |
| 68 | 제우스: 오만의 신 | MMORPG | RPG | South Korea | 2026-08-20 | 29.0 | 0.0 | 0.2 | 2026-08 | 0 | 2026-09 (22.9) | 1 | 1.00 | 0.11 |  |
| 69 | 美职篮全明星 | Realistic Sports | Sports | China | 2025-03-24 | 28.9 | 34.9 | 1.1 | 2025-03 | 0 | 2025-04 (9.9) | 1 | 0.21 | 1.00 |  |
| 70 | StoryReel: Drama Shorts & TV | Short Drama | app | Hong Kong | 2026-04-02 | 27.5 | 0.0 | 30.9 | 2026-05 | 0 | 2026-09 (10.2) | 4 | 1.00 | 0.64 |  |
| 71 | iDrama – Short Dramas & Reels | Short Drama | app | Hong Kong | 2025-01-23 | 27.4 | 7.2 | 21.7 | 2025-02 | 3 | 2026-08 (3.9) | 18 | 0.65 | 0.60 |  |
| 72 | FOX One: Live News, Sports, TV | OTT Streaming | app | US | 2025-08-15 | 26.9 | 0.9 | 10.8 | 2025-08 | 3 | 2026-06 (6.5) | 10 | 0.49 | 0.83 |  |
| 73 | AION2 | MMORPG | RPG | South Korea | 2025-10-20 | 26.1 | 0.0 | 1.5 | 2025-11 | 0 | 2025-12 (4.6) | 1 | 0.26 | 0.29 |  |
| 74 | Happy Screw Trip 3D | Screw | Puzzle | Singapore | 2025-05-27 | 24.8 | 1.2 | 15.5 | 2025-05 | 5 | 2026-01 (2.8) | 8 | 0.64 | 0.64 |  |
| 75 | RF 온라인 넥스트 | MMORPG | RPG | South Korea | 2025-03-14 | 24.8 | 60.8 | 1.5 | 2025-03 | 0 | 2025-04 (16.5) | 1 | 0.13 | 0.32 |  |
| 76 | ドラゴンクエストスマッシュグロウ ドラクエローグライトRPG | Action RPG | RPG | Japan | 2026-04-09 | 24.1 | 0.0 | 2.5 | 2026-04 | 0 | 2026-05 (7.1) | 1 | 0.24 | 0.76 |  |
| 77 | Capybara Go! | Idle RPG | RPG | China | 2024-08-29 | 23.6 | 131.6 | 2.6 | 2024-10 | 0 | 2024-12 (21.7) | 2 | 0.05 | 0.55 | left-censored (series start 2024-10) |
| 78 | Car Match - Traffic Puzzle | Match Pair | Puzzle | Turkey | 2024-07-12 | 22.6 | 7.8 | 6.2 | 2024-10 | 9 | 2026-03 (2.2) | 17 | 0.77 | 0.75 | left-censored (series start 2024-10) |
| 79 | Sand Loop | Sort | Puzzle | France | 2025-10-16 | 21.9 | 0.0 | 8.4 | 2025-12 | 1 | 2026-03 (4.5) | 3 | 0.25 | 0.63 |  |
| 80 | Foodstars: Merge & Cook | Match Merge 2 | Puzzle | Singapore | 2025-08-29 | 21.6 | 0.0 | 7.6 | 2025-09 | 6 | 2026-09 (6.0) | 12 | 1.00 | 0.52 |  |
| 81 | Galaxy Defense: Fortress TD | Tower Defense | Strategy | Hong Kong | 2024-09-28 | 21.1 | 10.3 | 4.6 | 2025-02 | 3 | 2026-02 (2.4) | 12 | 0.57 | 0.48 | left-censored (series start 2024-10) |
| 82 | 即梦AI - 抖音旗下AI图片和视频工具 | AI Content Generator | app | China | 2024-08-05 | 20.8 | 5.0 | 31.0 | 2024-10 | 16 | 2026-09 (2.5) | 23 | 1.00 | 0.98 | left-censored (series start 2024-10) |
| 83 | Resident Evil Survival Unit | 4X Strategy | Strategy | Japan | 2025-07-08 | 20.2 | 0.1 | 8.4 | 2025-09 | 2 | 2025-12 (2.9) | 3 | 0.32 | 0.36 |  |
| 84 | キングダム 頂天 | Simulator | Simulation | Japan | 2024-08-07 | 20.1 | 32.2 | 0.2 | 2024-10 | 0 | 2025-08 (3.3) | 10 | 0.44 | 0.82 | left-censored (series start 2024-10) |
| 85 | I9: 인페르노 나인 | MMORPG | RPG | China | 2024-11-13 | 20.1 | 36.6 | 0.3 | 2025-01 | 0 | 2025-03 (7.9) | 2 | 0.13 | 0.08 |  |
| 86 | ジョジョの奇妙な冒険 オラオラオーバードライブ | Turn-based RPG | RPG | Japan | 2025-09-24 | 19.9 | 1.2 | 0.5 | 2025-09 | 0 | 2025-10 (4.5) | 1 | 0.13 | 0.71 |  |
| 87 | DC: Dark Legion | Squad RPG | RPG | Switzerland | 2024-09-21 | 19.0 | 44.6 | 0.8 | 2025-03 | 0 | 2025-04 (9.2) | 1 | 0.09 | 0.58 | left-censored (series start 2024-10) |
| 88 | Merge Teahouse | Match Merge 2 | Puzzle | China | 2025-10-28 | 18.3 | 0.0 | 1.7 | 2025-11 | 5 | 2026-09 (4.2) | 10 | 1.00 | 0.51 |  |
| 89 | 英雄没有闪 | Idle RPG | RPG | China | 2025-02-26 | 18.2 | 43.8 | 0.3 | 2025-02 | 1 | 2025-03 (13.8) | 1 | 0.06 | 0.98 |  |
| 90 | My Memory Shop | Tycoon / Crafting | Simulation | China | 2024-07-31 | 18.2 | 26.5 | 1.1 | 2024-10 | 0 | 2025-03 (3.8) | 5 | 0.18 | 0.74 | left-censored (series start 2024-10) |
| 91 | Chiến Tuyến Hướng Dương | Tower Defense | Strategy | Hong Kong | 2024-12-05 | 17.8 | 16.4 | 2.8 | 2024-12 | 0 | 2025-02 (2.6) | 2 | 0.43 | 0.96 |  |
| 92 | 아키텍트: 랜드 오브 엑자일 | MMORPG | RPG | South Korea | 2025-09-16 | 17.8 | 0.0 | 0.4 | 2025-10 | 0 | 2025-11 (4.6) | 1 | 0.19 | 0.13 |  |
| 93 | Knit Out | Sort | Puzzle | Turkey | 2025-01-17 | 17.5 | 9.0 | 3.0 | 2025-03 | 3 | 2025-09 (2.5) | 6 | 0.26 | 0.61 |  |
| 94 | 크랙 - 내가 주인공인 웹소설, AI 채팅 | AI Companion | app | South Korea | 2025-03-27 | 17.4 | 4.1 | 1.4 | 2025-04 | 6 | 2026-05 (1.9) | 13 | 0.97 | 0.21 |  |
| 95 | Shortical - Stream Dramas & TV | Short Drama | app | Israel | 2025-03-04 | 17.4 | 0.8 | 3.0 | 2025-04 | 9 | 2026-04 (2.3) | 12 | 0.81 | 0.64 |  |
| 96 | Jelly Busters: Puzzle Game | Sort | Puzzle | Israel | 2026-01-14 | 17.3 | 0.0 | 2.6 | 2026-01 | 6 | 2026-09 (8.0) | 8 | 1.00 | 0.86 |  |
| 97 | Yarn Fever! Unravel Puzzle | Screw | Puzzle | Hong Kong | 2025-06-24 | 16.6 | 0.5 | 22.7 | 2025-07 | 4 | 2026-03 (2.0) | 8 | 0.34 | 0.83 |  |
| 98 | SEGA FOOTBALL CLUB CHAMPIONS | Sports Manager | Sports | Japan | 2025-11-27 | 16.2 | 0.0 | 2.5 | 2026-01 | 0 | 2026-02 (3.7) | 1 | 0.25 | 0.69 |  |
| 99 | CookieRun: Crumble - Idle RPG | Idle RPG | RPG | South Korea | 2026-06-08 | 16.2 | 0.0 | 2.1 | 2026-07 | 1 | 2026-08 (10.8) | 1 | 0.42 | 0.46 |  |
| 100 | Slack Off Survivor | Tower Defense | Strategy | China | 2024-08-12 | 16.2 | 27.8 | 1.4 | 2024-10 | 0 | 2025-03 (2.8) | 5 | 0.34 | 0.80 | left-censored (series start 2024-10) |
| 101 | 스톤에이지 키우기 | Idle RPG | RPG | South Korea | 2025-05-15 | 16.1 | 0.2 | 1.7 | 2025-08 | 7 | 2026-03 (9.4) | 7 | 0.06 | 0.44 |  |
| 102 | Game of Thrones: Dragonfire | 4X Strategy | Strategy | US | 2025-06-16 | 15.9 | 0.1 | 5.1 | 2025-06 | 12 | 2026-08 (5.1) | 14 | 0.77 | 0.67 |  |
| 103 | KAIJU NO. 8 THE GAME | Squad RPG | RPG | Japan | 2025-04-22 | 15.9 | 8.3 | 1.3 | 2025-08 | 1 | 2025-09 (8.0) | 1 | 0.12 | 0.72 |  |
| 104 | Colony Flow! | Sort | Puzzle | Vietnam | 2026-06-11 | 15.9 | 0.0 | 9.1 | 2026-06 | 1 | 2026-09 (8.0) | 3 | 1.00 | 0.77 |  |
| 105 | The Seven Deadly Sins: Origin | Open World Adventure | RPG | South Korea | 2025-04-11 | 15.7 | 0.0 | 2.5 | 2026-03 | 0 | 2026-04 (5.3) | 1 | 0.18 | 0.66 |  |
| 106 | Drop the Cat | Sort | Puzzle | South Korea | 2025-07-23 | 15.6 | 0.0 | 7.3 | 2025-08 | 3 | 2025-12 (1.5) | 4 | 0.70 | 0.76 |  |
| 107 | Crushie Al: Chat & Companion | AI Companion | app | Hong Kong | 2025-02-11 | 15.5 | 0.1 | 1.5 | 2025-03 | 13 | 2026-08 (3.0) | 17 | 1.00 | 0.64 |  |
| 108 | Haunted Merge: Horror Story | Match Merge 2 | Puzzle | Hong Kong | 2025-10-30 | 15.4 | 0.0 | 6.0 | 2025-10 | 3 | 2026-09 (2.0) | 11 | 1.00 | 0.51 |  |
| 109 | Drop Away: Color Puzzle | Block | Puzzle | Turkey | 2024-08-24 | 15.3 | 3.2 | 3.4 | 2025-05 | 3 | 2025-11 (2.2) | 6 | 0.17 | 0.67 | left-censored (series start 2024-10) |
| 110 | Stella Sora | Action RPG | RPG | China | 2025-10-12 | 15.3 | 0.0 | 2.5 | 2025-10 | 0 | 2025-11 (4.2) | 1 | 0.09 | 0.45 |  |
| 111 | Dragon Raja : ReRise | Squad RPG | RPG | Hong Kong | 2024-09-10 | 15.1 | 13.5 | 1.6 | 2024-10 | 0 | 2026-06 (3.4) | 20 | 0.30 | 0.66 | left-censored (series start 2024-10) |
| 112 | Hotel Legacy: Merge Game | Match Merge 2 | Puzzle | Singapore | 2026-01-12 | 15.0 | 0.0 | 4.7 | 2026-01 | 5 | 2026-09 (5.3) | 8 | 1.00 | 0.69 |  |
| 113 | Legend of Elements | Idle RPG | RPG | China | 2025-07-28 | 15.0 | 0.0 | 3.5 | 2025-10 | 0 | 2025-11 (2.8) | 1 | 0.10 | 0.36 |  |
| 114 | Dicero! | Idle RPG | RPG | China | 2025-06-22 | 14.8 | 0.0 | 4.0 | 2026-02 | 2 | 2026-05 (4.4) | 3 | 0.39 | 0.77 |  |
| 115 | Hole It 3D | Eat & Grow | Arcade | Israel | 2025-01-18 | 14.6 | 0.0 | 6.5 | 2025-04 | 11 | 2026-08 (2.1) | 16 | 1.00 | 0.74 |  |
| 116 | Hole Stars: Puzzle Game | Eat & Grow | Arcade | Israel | 2025-07-22 | 14.6 | 0.0 | 7.7 | 2025-07 | 10 | 2026-09 (3.2) | 14 | 1.00 | 0.47 |  |
| 117 | West Game II | 4X Strategy | Strategy | China | 2025-09-14 | 14.4 | 0.0 | 7.1 | 2025-09 | 2 | 2026-01 (1.9) | 4 | 0.42 | 0.47 |  |
| 118 | MONOPOLY: Bingo! | Bingo | Casino | Canada | 2025-01-21 | 14.0 | 4.2 | 4.7 | 2025-01 | 9 | 2025-11 (2.0) | 10 | 0.34 | 0.57 |  |
| 119 | Paranoize | Idler | Simulation | Japan | 2026-03-25 | 13.8 | 0.0 | 1.9 | 2026-03 | 1 | 2026-09 (3.1) | 6 | 1.00 | 0.60 |  |
| 120 | Duck Survival | Tower Defense | Strategy | China | 2025-04-08 | 13.8 | 0.0 | 6.8 | 2025-06 | 12 | 2026-09 (5.4) | 15 | 1.00 | 0.44 |  |
| 121 | Deepsearch AI Search Assistant | Utilities | app | Turkey | 2025-03-13 | 13.7 | 2.9 | 27.8 | 2025-03 | 6 | 2025-12 (1.4) | 9 | 0.94 | 0.41 |  |
| 122 | Camtro | Home Security Apps | app | Hong Kong | 2025-05-29 | 13.6 | 0.0 | 1.8 | 2025-09 | 5 | 2026-03 (1.7) | 6 | 0.94 | 0.67 |  |
| 123 | 聖霊伝説：最強への道 | Idle RPG | RPG | Taiwan | 2025-05-24 | 13.6 | 10.3 | 0.2 | 2025-05 | 1 | 2025-06 (3.4) | 1 | 0.23 | 0.76 |  |
| 124 | High Seas Hero: Dig & Build | Idle RPG | RPG | China | 2024-10-31 | 13.4 | 11.0 | 2.8 | 2025-01 | 1 | 2025-12 (2.0) | 11 | 0.13 | 0.60 |  |
| 125 | 疯狂水世界 | 4X Strategy | Strategy | China | 2026-01-21 | 13.2 | 0.0 | 1.4 | 2026-01 | 2 | 2026-09 (2.8) | 8 | 1.00 | 1.00 |  |
| 126 | 宗师之上 | Action RPG | RPG | China | 2026-05-18 | 13.2 | 0.0 | 1.3 | 2026-05 | 0 | 2026-06 (5.3) | 1 | 0.20 | 1.00 |  |
| 127 | Summary - AI Note Taker | Utilities | app | Spain | 2024-12-19 | 13.2 | 2.2 | 7.8 | 2024-12 | 15 | 2026-09 (1.7) | 21 | 1.00 | 0.80 |  |
| 128 | 변신 키우기 | Idle RPG | RPG | South Korea | 2025-03-28 | 12.8 | 1.9 | 0.6 | 2025-04 | 4 | 2026-04 (1.6) | 12 | 0.68 | 0.35 |  |
| 129 | Genspark AI Workspace | AI Assistant | app | US | 2025-02-28 | 12.7 | 0.7 | 5.7 | 2025-05 | 9 | 2026-04 (1.8) | 11 | 0.56 | 0.65 |  |
| 130 | 龙之谷世界-官方正版手游 | MMORPG | RPG | China | 2025-02-19 | 12.7 | 24.7 | 0.3 | 2025-02 | 0 | 2025-03 (6.6) | 1 | 0.12 | 0.91 |  |
| 131 | Z Route: Redemption | 4X Strategy | Strategy | China | 2025-11-20 | 12.6 | 0.0 | 5.6 | 2026-05 | 2 | 2026-09 (6.6) | 4 | 1.00 | 0.64 |  |
| 132 | 로드나인 | MMORPG | RPG | South Korea | 2024-07-07 | 12.6 | 21.9 | 0.3 | 2024-10 | 0 | 2024-11 (3.1) | 1 | 0.11 | 0.27 | left-censored (series start 2024-10) |
| 133 | Police Chief | Simulator | Simulation | Ireland | 2026-03-12 | 12.5 | 0.0 | 6.6 | 2026-05 | 1 | 2026-09 (4.7) | 4 | 1.00 | 0.45 |  |
| 134 | DISSIDIA DUELLUM FINAL FANTASY | MOBA | Strategy | Japan | 2026-02-25 | 12.4 | 0.0 | 1.0 | 2026-03 | 0 | 2026-04 (2.9) | 1 | 0.30 | 0.60 |  |
| 135 | 永劫无间 | Battle Royale | Shooter | China | 2024-07-22 | 12.3 | 38.4 | 1.3 | 2024-10 | 0 | 2024-11 (5.1) | 1 | 0.10 | 1.00 | left-censored (series start 2024-10) |
| 136 | FAIRY TAIL Wizard Chronicle | Idle RPG | RPG | Japan | 2025-12-02 | 12.1 | 0.0 | 1.0 | 2025-12 | 0 | 2025-12 (4.4) | 0 | 0.05 | 0.76 |  |
| 137 | 갓깨비 키우기-999뽑기 증정 | Idle RPG | RPG | China | 2025-03-19 | 12.1 | 32.8 | 0.4 | 2025-03 | 0 | 2025-05 (8.3) | 2 | 0.06 | 0.28 |  |
| 138 | Heroes of History: Epic Empire | Empire Simulation | Strategy | Germany | 2024-07-24 | 12.0 | 8.1 | 1.0 | 2024-10 | 12 | 2026-03 (1.2) | 17 | 0.74 | 0.54 | left-censored (series start 2024-10) |
| 139 | 问剑长生 | Idle RPG | RPG | Hong Kong | 2024-12-31 | 12.0 | 11.6 | 1.0 | 2025-01 | 0 | 2025-01 (3.9) | 0 | 0.12 | 0.68 |  |
| 140 | Pose: AI Photo Video Generator | Photo Editing | app | Turkey | 2025-02-05 | 11.9 | 1.0 | 9.2 | 2025-02 | 10 | 2026-01 (1.9) | 11 | 0.26 | 0.85 |  |
| 141 | 时光大爆炸 | Tycoon / Crafting | Simulation | China | 2025-01-01 | 11.9 | 20.2 | 0.5 | 2025-01 | 0 | 2025-01 (3.5) | 0 | 0.16 | 0.77 |  |
| 142 | 이클립스: 더 어웨이크닝 | MMORPG | RPG | South Korea | 2026-07-01 | 11.7 | 0.0 | 0.2 | 2026-09 | 0 | 2026-09 (11.7) | 0 | 1.00 | 0.15 |  |
| 143 | 仙遇 | MMORPG | RPG | (blank) | 2024-12-25 | 11.7 | 27.1 | 0.5 | 2024-12 | 1 | 2025-06 (3.7) | 6 | 0.11 | 1.00 |  |
| 144 | イナズマイレブン クロス | Sports Manager | Sports | Japan | 2026-06-04 | 11.7 | 0.0 | 0.8 | 2026-06 | 0 | 2026-06 (4.6) | 0 | 0.32 | 0.87 |  |
| 145 | Butcher Hero: Monster Idle RPG | Hack and Slash | Action | Cyprus | 2025-10-20 | 11.7 | 0.0 | 5.3 | 2025-10 | 9 | 2026-09 (3.7) | 11 | 1.00 | 0.42 |  |
| 146 | Bus Traffic Fever! | Sort | Puzzle | Japan | 2026-02-19 | 11.6 | 0.0 | 49.5 | 2026-03 | 4 | 2026-09 (6.1) | 6 | 1.00 | 0.68 |  |
| 147 | キャラぷ - 物語はキミ次第・AIチャット | Interactive Story | Lifestyle | Japan | 2025-05-23 | 11.6 | 0.2 | 1.2 | 2025-06 | 11 | 2026-09 (2.1) | 15 | 1.00 | 0.68 |  |
| 148 | Rogue Legend - Roguelike RPG | Idle RPG | RPG | Israel | 2025-11-17 | 11.6 | 0.0 | 2.4 | 2025-12 | 5 | 2026-08 (3.3) | 8 | 0.91 | 0.34 |  |
| 149 | スターセイヴァー | Turn-based RPG | RPG | South Korea | 2025-09-23 | 11.5 | 0.0 | 1.8 | 2025-11 | 0 | 2025-12 (2.0) | 1 | 0.60 | 0.32 |  |
| 150 | Overgeared Hero | Puzzle RPG | RPG | South Korea | 2025-12-09 | 11.4 | 0.0 | 2.9 | 2026-03 | 3 | 2026-09 (3.0) | 6 | 1.00 | 0.45 |  |
| 151 | Drama Pops - Reel Shorts TV | Short Drama | app | United Arab Emirates | 2024-08-22 | 11.4 | 7.3 | 1.9 | 2024-10 | 11 | 2025-12 (1.5) | 14 | 0.23 | 0.75 | left-censored (series start 2024-10) |
| 152 | Etheria: Restart | Turn-based RPG | RPG | China | 2024-12-30 | 11.4 | 14.3 | 0.4 | 2025-06 | 0 | 2025-06 (7.0) | 0 | 0.04 | 0.68 |  |
| 153 | Blue Protocol: Star Resonance | MMORPG | RPG | China | 2025-07-16 | 11.0 | 0.9 | 1.7 | 2025-07 | 3 | 2026-01 (1.8) | 6 | 0.14 | 0.57 |  |
| 154 | eBaseball™: MLB PRO SPIRIT | Realistic Sports | Sports | Japan | 2024-10-22 | 11.0 | 17.8 | 0.6 | 2024-10 | 0 | 2024-11 (2.6) | 1 | 0.27 | 0.85 |  |
| 155 | Cube Land Puzzle Game | Sort | Puzzle | Turkey | 2026-01-16 | 11.0 | 0.0 | 5.3 | 2026-03 | 4 | 2026-09 (5.1) | 6 | 1.00 | 0.56 |  |
| 156 | XP Hero | Idler | Simulation | South Korea | 2025-02-21 | 10.9 | 0.2 | 13.4 | 2025-03 | 15 | 2026-08 (2.3) | 17 | 0.86 | 0.47 |  |
| 157 | Food Hunt: Pixel Puzzle | Sort | Puzzle | Singapore | 2026-05-13 | 10.8 | 0.0 | 10.1 | 2026-05 | 2 | 2026-09 (4.8) | 4 | 1.00 | 0.68 |  |
| 158 | SimplyWise: Cost Estimator | Business & Productivity Software | app | US | 2024-09-12 | 10.6 | 1.8 | 1.0 | 2024-10 | 17 | 2026-09 (1.2) | 23 | 1.00 | 0.78 | left-censored (series start 2024-10) |
| 159 | AI Catch: AI Video Generator | Video Editing | app | Hong Kong | 2024-12-30 | 10.6 | 0.2 | 17.8 | 2025-02 | 12 | 2026-05 (1.3) | 15 | 0.75 | 0.75 |  |
| 160 | Jackaroo King - Original | Tabletop Cards | Tabletop | Singapore | 2024-08-26 | 10.3 | 8.2 | 4.9 | 2024-10 | never | 2026-03 (1.0) | 17 | 0.81 | 0.81 | left-censored (series start 2024-10) |
| 161 | ハローキティ：マイドリームストア | Match Merge 2 | Puzzle | South Korea | 2024-12-11 | 10.2 | 2.5 | 4.6 | 2024-12 | never | 2026-09 (1.0) | 21 | 1.00 | 0.72 |  |
| 162 | Color Blaze Shooter | Sort | Puzzle | Vietnam | 2025-10-24 | 10.2 | 0.0 | 6.7 | 2025-11 | 1 | 2026-01 (4.3) | 2 | 0.00 | 0.88 |  |
| 163 | ثمانية | Sports Streaming | app | Saudi Arabia | 2025-07-25 | 10.2 | 3.8 | 9.8 | 2025-08 | 1 | 2025-09 (3.2) | 1 | 0.51 | 0.89 |  |
| 164 | War Drone: 3D Shooting Games | Sniper | Shooter | United Kingdom | 2025-03-31 | 10.1 | 3.1 | 34.0 | 2025-04 | 3 | 2026-03 (1.4) | 11 | 0.38 | 0.57 |  |
| 165 | Universal TV Remote Control＊ | Virtual TV Remotes | app | Spain | 2024-11-19 | 10.1 | 3.7 | 9.2 | 2024-11 | 18 | 2026-07 (1.3) | 20 | 0.94 | 0.94 |  |
| 166 | 美职篮巅峰对决 | Realistic Sports | Sports | China | 2024-08-22 | 10.1 | 11.0 | 0.8 | 2024-10 | 0 | 2026-08 (1.6) | 22 | 0.58 | 1.00 | left-censored (series start 2024-10) |
| 167 | PixVerse Lite | Video Editing | app | Singapore | 2024-09-25 | 8.9 | 7.2 | 50.5 | 2024-12 | 9 | 2025-09 (1.2) | 9 | 0.88 | 0.06 | left-censored (series start 2024-10); DL-led: peak 11.0M dl in 2026-03, Sep-26/peak dl 0.20 |
| 168 | Gemini Notebook | AI Assistant | app | US | 2025-05-02 | 4.6 | 0.1 | 63.3 | 2025-05 | never | 2026-05 (0.6) | 12 | 0.94 | 1.00 | DL-led: peak 7.6M dl in 2026-09, Sep-26/peak dl 1.00 |
| 169 | Melolo - Drama Pendek & Shorts | Short Drama | app | Singapore | 2024-11-15 | 3.8 | 0.2 | 151.7 | 2025-03 | never | 2026-09 (0.6) | 18 | 1.00 | 0.02 | DL-led: peak 15.8M dl in 2025-12, Sep-26/peak dl 0.75 |
| 170 | Kuku TV: Short Dramas & Series | Short Drama | app | India | 2024-09-20 | 1.6 | 0.7 | 95.9 | 2024-11 | never | 2026-06 (0.2) | 19 | 0.55 | 0.55 | left-censored (series start 2024-10); DL-led: peak 23.2M dl in 2025-05, Sep-26/peak dl 0.06 |
| 171 | Seekee - Ai Search & Assistant | AI Assistant | app | Hong Kong | 2024-12-11 | 1.3 | 0.0 | 91.4 | 2025-06 | never | 2026-09 (0.2) | 15 | 1.00 | 0.00 | DL-led: peak 11.5M dl in 2025-08, Sep-26/peak dl 0.52 |
| 172 | Arrows  Puzzle Escape | Sort | Puzzle | Germany | 2025-07-09 | 0.7 | 0.0 | 140.5 | 2025-08 | never | 2026-01 (0.1) | 5 | 0.51 | 0.28 | DL-led: peak 29.8M dl in 2026-05, Sep-26/peak dl 0.13 |
| 173 | Story TV - Watch Short Dramas | Short Drama | app | India | 2025-06-24 | 0.6 | 0.0 | 136.7 | 2025-09 | never | 2026-05 (0.1) | 8 | 0.82 | 1.00 | DL-led: peak 16.0M dl in 2025-12, Sep-26/peak dl 0.42 |
| 174 | QuickTV - Short Drama & Movies | Short Drama | app | India | 2025-02-22 | 0.6 | 0.0 | 83.3 | 2025-04 | never | 2026-05 (0.1) | 13 | 0.66 | 0.02 | DL-led: peak 9.6M dl in 2025-12, Sep-26/peak dl 0.57 |
| 175 | DashReels: Short Movies & TV | Short Drama | app | US | 2025-01-24 | 0.6 | 0.1 | 50.0 | 2025-02 | never | 2025-11 (0.1) | 9 | 0.67 | 0.34 | DL-led: peak 6.5M dl in 2025-12, Sep-26/peak dl 0.31 |
| 176 | vivago.ai - AI Image & Video | Multimedia & Design Software | app | Hong Kong | 2024-09-12 | 0.4 | 0.0 | 57.1 | 2025-01 | never | 2026-05 (0.1) | 16 | 0.32 | 0.16 | left-censored (series start 2024-10); DL-led: peak 8.3M dl in 2026-01, Sep-26/peak dl 0.46 |
| 177 | FreeReels: Dramas and Series | Short Drama | app | US | 2024-11-28 | 0.2 | 0.0 | 283.2 | 2025-01 | never | 2026-09 (0.1) | 20 | 1.00 | 0.06 | DL-led: peak 40.1M dl in 2026-02, Sep-26/peak dl 0.26 |
| 178 | Pop Drama | Short Drama | app | China | 2025-05-13 | 0.2 | 0.0 | 53.6 | 2025-12 | never | 2026-03 (0.0) | 3 | 0.62 | 0.00 | DL-led: peak 8.0M dl in 2025-11, Sep-26/peak dl 0.17 |
| 179 | Arrow Puzzle: Tap Puzzle Games | Sort | Puzzle | Cyprus | 2025-11-14 | 0.1 | 0.0 | 81.6 | 2026-01 | never | 2026-07 (0.0) | 6 | 0.62 | 0.09 | DL-led: peak 18.0M dl in 2026-07, Sep-26/peak dl 0.68 |
| 180 | Photo Editor Video Maker Music | Video Editing | app | India | 2025-07-23 | 0.1 | 0.0 | 50.2 | 2025-09 | never | 2025-12 (0.0) | 3 | 0.18 | 0.00 | DL-led: peak 7.0M dl in 2026-09, Sep-26/peak dl 1.00 |
| 181 | Annoying Uncle Punch Game | Arcade Combat | Arcade | Pakistan | 2024-08-14 | 0.0 | 0.0 | 66.6 | 2025-04 | never | 2026-07 (0.0) | 15 | 0.24 | 0.73 | left-censored (series start 2024-10); DL-led: peak 6.7M dl in 2025-06, Sep-26/peak dl 0.71 |
| 182 | Mahjong Blast | Match Pair | Puzzle | Singapore | 2025-06-23 | 0.0 | 0.0 | 69.7 | 2026-03 | never | 2026-08 (0.0) | 5 | 0.60 | 0.78 | DL-led: peak 9.6M dl in 2025-12, Sep-26/peak dl 0.62 |
| 183 | Brain Puzzle 2: Logic Twist | Riddle | Puzzle | China | 2025-05-21 | 0.0 | 0.0 | 82.9 | 2026-03 | never | 2026-09 (0.0) | 6 | 1.00 | 0.89 | DL-led: peak 14.2M dl in 2026-09, Sep-26/peak dl 1.00 |
| 184 | 抖省省 - 抖音官方团购平台 | Shopping | app | China | 2026-02-10 | 0.0 | 0.0 | 53.1 | 2026-07 | never | 2026-09 (0.0) | 2 | 1.00 | 1.00 | DL-led: peak 9.3M dl in 2026-08, Sep-26/peak dl 0.51 |
| 185 | Edits: Video Editor | Video Editing | app | US | 2025-02-06 | 0.0 | 0.0 | 146.0 | 2026-08 | never | 2026-08 (0.0) | 0 | 0.00 | 0.00 | DL-led: peak 14.4M dl in 2026-01, Sep-26/peak dl 0.87 |
| 186 | Block Crazy Robo World Craft | Sandbox | Simulation | Vietnam | 2024-12-22 | 0.0 | 0.0 | 100.9 | - | never | - (0.0) | - | - | - | DL-led: peak 12.6M dl in 2025-12, Sep-26/peak dl 0.00 |
| 187 | Instamart: Groceries & more | Grocery Delivery | app | India | 2025-01-09 | 0.0 | 0.0 | 52.9 | - | never | - (0.0) | - | - | - | DL-led: peak 5.5M dl in 2026-02, Sep-26/peak dl 0.67 |
| 188 | DeepSeek - Your AI Assistant | AI Assistant | app | China | 2025-01-08 | 0.0 | 0.0 | 67.5 | - | never | - (0.0) | - | - | - | DL-led: peak 35.3M dl in 2025-02, Sep-26/peak dl 0.13 |
| 189 | HotMini: Short Drama & Series | Short Drama | app | Egypt | 2025-05-23 | 0.0 | 0.0 | 68.0 | - | never | - (0.0) | - | - | - | DL-led: peak 10.7M dl in 2026-05, Sep-26/peak dl 0.47 |
| 190 | PineDrama - Short Dramas | Short Drama | app | China | 2025-12-11 | 0.0 | 0.0 | 115.5 | - | never | - (0.0) | - | - | - | DL-led: peak 20.1M dl in 2026-05, Sep-26/peak dl 0.80 |
| 191 | Arrows GO! | Sort | Puzzle | China | 2026-02-04 | 0.0 | 0.0 | 99.0 | - | never | - (0.0) | - | - | - | DL-led: peak 23.4M dl in 2026-05, Sep-26/peak dl 0.39 |
## 2. What the breakout entrants have in common

### 2a. Where the entrant money is (sub-genre / App IQ)

| Game genre / App IQ (entrants) | n | Rev cur $M | DL cur M | examples |
|---|---|---|---|---|
| Game: 4X Strategy | 15 | 1,564.0 | 254.2 | Kingshot; Tiles Survive!; Last Asylum: Plague; Lands of Jail |
| Game: FPS / 3PS | 3 | 843.6 | 72.4 | Delta Force; 无畏契约：源能行动; 逆战：未来 |
| App: Short Drama | 19 | 752.9 | 1,563.7 | NetShort - Popular Drama; Dramawave; FlickReels; StardustTV - Short Drama |
| Game: Idle RPG | 14 | 488.6 | 29.8 | 메이플 키우기; Capybara Go!; 英雄没有闪; CookieRun: Crumble - Idl |
| Game: Sort | 16 | 421.7 | 488.6 | Pixel Flow!; Yarn Loop: Knit Puzzle; Marble Sort!; Gecko Out |
| Game: MMORPG | 14 | 406.1 | 10.9 | 뱀피르; SOL: enchant; 마비노기 모바일; RO仙境傳説：世界之旅 |
| Game: Open World Adventure | 6 | 381.1 | 49.0 | Where Winds Meet; Arknights: Endfield; 洛克王国：世界; NTE: Neverness to Everne |
| Game: Card Battler | 2 | 377.2 | 26.2 | Pokémon TCG Pocket; Shadowverse: Worlds Beyo |
| Game: Match Merge 2 | 8 | 348.3 | 58.5 | Flambé: Merge & Cook; Mystery Town: Merge Game; Hollywood Merge; Foodstars: Merge & Cook |
| App: AI Assistant | 6 | 338.1 | 374.0 | Grok AI; Manus - AI Agent & Autom; Genspark AI Workspace; Gemini Notebook |
| Game: Solitaire | 2 | 276.4 | 113.9 | Disney Solitaire; Solitaire Associations J |
| Game: Tower Defense | 8 | 236.3 | 45.2 | 永远的蔚蓝星球-周杰伦代言; Clash of Critters; セルサバイバー - シューティングゲーム; 협타디: 협동 타워 디펜스 |
| Game: Tycoon / Crafting | 5 | 226.2 | 25.4 | My Garden Tale; Palmon: Survival; 时尚百货城; My Memory Shop |
| Game: Turn-based RPG | 6 | 180.1 | 10.1 | Chaos Zero Nightmare; 세븐나이츠 리버스 - 콜라보; Wizardry Variants Daphne; ジョジョの奇妙な冒険 オラオラオーバードライブ |
| Game: Turn-Based Tactics | 1 | 175.2 | 1.1 | SD Gundam G Generation E |
| App: AI Content Generator | 3 | 151.6 | 126.9 | Suno - AI Songs, Music, ; Kling AI: AI Image&Video; 即梦AI - 抖音旗下AI图片和视频工具 |
| Game: Screw | 3 | 144.2 | 50.7 | Screwdom; Happy Screw Trip 3D; Yarn Fever! Unravel Puzz |
| Game: Coin Looters | 2 | 132.8 | 44.5 | Top Tycoon: Coin Theme E; Coin Master - Board Adve |
| Game: Avatar Life | 1 | 102.2 | 22.5 | Heartopia |
| Game: Squad RPG | 4 | 93.0 | 7.4 | Dragon Traveler; DC: Dark Legion; KAIJU NO. 8 THE GAME; Dragon Raja : ReRise |
| App: AI Companion | 3 | 87.5 | 8.3 | Tipsy Chat: Live Your St; 크랙 - 내가 주인공인 웹소설, AI 채팅; Crushie Al: Chat & Compa |
| Game: Survival | 1 | 86.5 | 7.3 | Tomb Busters |
| Game: Block | 2 | 64.1 | 39.8 | Block Out! - Color Sort ; Drop Away: Color Puzzle |
| App: Language Education | 1 | 62.9 | 64.2 | Learna AI: English Learn |
| Game: Music / Rhythm | 1 | 52.6 | 3.7 | hololive Dreams |
| Game: Action RPG | 3 | 52.5 | 6.3 | ドラゴンクエストスマッシュグロウ ドラクエローグ; Stella Sora; 宗师之上 |
| Game: Realistic Sports | 3 | 50.0 | 2.5 | 美职篮全明星; eBaseball™: MLB PRO SPIR; 美职篮巅峰对决 |
| Game: Hack and Slash | 2 | 44.3 | 12.0 | BLEACH: Soul Resonance; Butcher Hero: Monster Id |
| Game: Artillery Shooter | 1 | 34.5 | 33.9 | Castle Clashers! |
| Game: Simulator | 2 | 32.7 | 6.9 | キングダム 頂天; Police Chief |
| Game: Eat & Grow | 2 | 29.2 | 14.2 | Hole It 3D; Hole Stars: Puzzle Game |
| Game: Sports Manager | 2 | 27.9 | 3.3 | SEGA FOOTBALL CLUB CHAMP; イナズマイレブン クロス |
| App: OTT Streaming | 1 | 26.9 | 10.8 | FOX One: Live News, Spor |
| App: Utilities | 2 | 26.8 | 35.6 | Deepsearch AI Search Ass; Summary - AI Note Taker |
| Game: Idler | 2 | 24.7 | 15.3 | Paranoize; XP Hero |
| Game: Match Pair | 2 | 22.7 | 75.9 | Car Match - Traffic Puzz; Mahjong Blast |
| App: Video Editing | 4 | 19.5 | 264.5 | AI Catch: AI Video Gener; PixVerse Lite; Photo Editor Video Maker; Edits: Video Editor |
| Game: Bingo | 1 | 14.0 | 4.7 | MONOPOLY: Bingo! |
| App: Home Security Apps | 1 | 13.6 | 1.8 | Camtro |
| Game: MOBA | 1 | 12.4 | 1.0 | DISSIDIA DUELLUM FINAL F |
**Reading.** Entrant revenue sits in two places:

1. **Mid-core with big budgets.** These are 4X Strategy, FPS, open-world, MMORPG and Idle RPG:
   - 4X Strategy: $1.56B from 15 apps, with Kingshot alone at $956M.
   - FPS: $844M from 3 apps.
   - MMORPG: $406M from 14 apps.
   - Idle RPG: $489M from 14 apps.
2. **Casual puzzle mechanics with fast iteration.** These are Sort, Match Merge 2, Solitaire, Screw, Block and Eat & Grow:
   - 34 apps at or above $10M, with $1.45B combined.

Among apps, three formats dominate the entrants:

- Short Drama: 19 apps, $753M revenue and 1.56B downloads.
- AI assistants, generators and companions: 12 apps, about $577M.
- AI learning and creator utilities.

### 2b. Trajectory and platform split by cluster (entrants >= $10M; series = `data/raw/app_series_*.json`; incumbents from `leaders.csv`)

| Cluster (entrants >= $10M) | n | Rev cur $M | DL cur M | Median months 1st rev -> $1M/mo (n, releases >= 2024-10) | Median months 1st rev -> peak | Share with Sep-26 >= 80% of peak | Share with Sep-26 < 40% of peak | Rev-weighted iOS share, entrants | Rev-weighted iOS share, incumbents >= $1M same niches (n) |
|---|---|---|---|---|---|---|---|---|---|
| Casual puzzle | 34 | 1,453 | 500 | 4.0 (30) | 8 | 59% | 18% | 0.63 | 0.55 (89) |
| 4X Strategy | 15 | 1,564 | 254 | 2 (13) | 7 | 33% | 20% | 0.59 | 0.58 (73) |
| MMORPG | 14 | 406 | 11 | 0 (13) | 1 | 21% | 79% | 0.31 | 0.63 (67) |
| Idle RPG / Idler | 16 | 513 | 45 | 1 (15) | 3 | 19% | 69% | 0.48 | 0.54 (60) |
| Other RPG / Open World / Card | 25 | 1,315 | 115 | 0.0 (22) | 1.0 | 8% | 88% | 0.66 | 0.59 (134) |
| Tower Defense / Survival / Tycoon / Avatar | 15 | 651 | 100 | 1 (9) | 11 | 27% | 33% | 0.78 | 0.63 (69) |
| Shooter (FPS/BR) | 4 | 856 | 74 | 0.0 (2) | 6.5 | 25% | 50% | 0.99 | 0.73 (23) |
| Short Drama (app) | 10 | 745 | 526 | 1 (5) | 6 | 60% | 20% | 0.62 | 0.64 (25) |
| AI & creator apps | 15 | 695 | 415 | 9 (11) | 15 | 67% | 7% | 0.69 | 0.80 (174) |
| Other | 18 | 314 | 124 | 1 (13) | 1 | 28% | 33% | 0.72 | - (0) |
**Common traits, computed:**

1. **Casual entrants ramp up and hold their level; mid-core entrants spike at launch and then decay.**
   - Casual puzzle entrants:
     - Median of 4 months from first revenue to $1M/month (n=30), and 8 months to peak.
     - 59% were still at or above 80% of their peak in Sep-2026.
   - MMORPG and other RPG entrants:
     - Median of 0 months to $1M and 1 month to peak.
     - 79% (MMORPG) and 88% (other RPG) had fallen below 40% of peak by Sep-2026.
   - Example curves ($M/month, raw series):
     - Pixel Flow!: 0.7 (Oct-25), 5.2, 10.8, 19.0, 20.7, then 23.0 (Mar-26 peak), then 13.1 (Sep-26).
     - Hollywood Merge: 0.5 (Feb-26), 1.3, 2.1, 3.7, 5.6, 7.9, 11.2, then 12.4 (Sep-26, still rising).
     - Flambé: Merge & Cook: 0.4 (Apr-25), then 14.2 (Sep-26), a slow 18-month climb.
   - This is consistent with LTV-driven paid user acquisition, where spend scales up as the payback curve gets proven.
2. **iOS-first for casual.** Revenue-weighted iOS share is 0.63 for casual puzzle entrants vs 0.55 for incumbents in the same sub-genres.
   - Several entrants are almost iOS-only:
     - Block Out!: Android revenue of $2.9K of $48.8M, and 1.0M of 36.5M downloads.
     - Jelly Busters: 0.86 iOS.
     - Color Blaze Shooter: 0.88.
     - Hexa Away: 0.90.
   - Chinese mid-core shows iOS ~1.0 (Delta Force 0.98, 无畏契约 1.0) only because China Android is not covered.
   - Korean MMORPG entrants are Android-heavy (iOS 0.31 vs 0.63 for incumbents).
3. **Product model and theme tailwinds** (niche level, `niche_dynamics_game_product_model.csv`, `..._game_theme.csv`).

   | Dimension | Prior → current revenue | YoY | H2/H1 |
   |---|---|---|---|
   | Hybridcasual (product model) | $2.66B → $3.31B | +24% | +21% |
   | Hypercasual (IAP only; the ad revenue is invisible) | $429M → $660M | +54% | n/a |
   | Casual | flat at $23.2B | +1% | n/a |
   | Mid-core | $31.57B → $29.10B | -8% | n/a |
   | Theme: Cooking / Food | $402M → $891M | +122% | n/a |
   | Theme: Drama | $675M → $1,265M | +87% | n/a |
   | Theme: Hypercasual | $582M → $1,017M | +75% | n/a |

   The entrants match these tailwinds: merge-and-cook titles (Flambé, Foodstars, Merge Teahouse), merge-and-story titles (Mystery Town, Hollywood Merge, Haunted Merge), and hybridcasual puzzles (Sort, Block, Eat & Grow).
4. **Material skins move across mechanics.** One tactile material gets transplanted across adjacent sub-genres.
   - Fiber materials: 40 new releases since 2024-07 have yarn/knit/wool/unravel/tangle/rope in the name. They sit across Sort, Screw and Physics, made $137.6M current revenue, and 14 of them make at least $1M (`niche_top_apps.csv`). Examples:
     - Yarn Loop: $43.2M (Sort, TR).
     - Knit Out: $17.5M (Sort, TR).
     - Yarn Fever!: $16.6M (Screw, HK).
     - Knit Away: $10.0M (Screw, VN).
     - Wool Escape 3D: $8.0M (Physics, SG).
   - Pixel: "pixel" names add up to $196M; Pixel Flow! alone is $185.1M.
   - Marble, sand and food each have their own breakout: Marble Sort! $31.0M, Sand Loop $21.9M, Food Hunt $10.8M.
5. **Countries of origin.** The casual-puzzle entrant wave is not Chinese; the mid-core wave is.
   - In casual sub-genre top-100s, new releases (since 2024-07) made $2.01B. The country split of that total:

     | Country | Share | Apps >= $1M |
     |---|---|---|
     | Turkey | 22.1% | 25 |
     | Israel | 17.6% | 11 |
     | Hong Kong | 14.6% | 28 |
     | Vietnam | 9.8% | 19 |
     | Mainland China | 9.6% | 10 |
     | Singapore | 8.5% | 28 |
     | France | 4.5% | 10 |

   - Across all game sub-genres, mainland China takes 39.5% of new-release top-100 revenue (`niche_top_apps.csv`).
   - Hong Kong and Singapore registrations often front Chinese capital. The data has only the registered country, so this cannot be verified.

### 2c. Entrants by publisher country (`leaders.csv`)

| Publisher country | n entrants | of which games | Rev cur $M | share of entrant rev | DL cur M | Main niches (by rev) |
|---|---|---|---|---|---|---|
| China | 48 | 43 | 3,166.7 | 37.1% | 896.4 | 4X Strategy, FPS / 3PS, Open World Adventure, Match Merge 2 |
| Japan | 21 | 21 | 1,230.2 | 14.4% | 112.3 | Card Battler, Idle RPG, Turn-Based Tactics, MMORPG |
| US | 13 | 2 | 771.9 | 9.0% | 987.6 | AI Assistant, Short Drama, AI Content Generator, AI Companion |
| Hong Kong | 21 | 12 | 725.0 | 8.5% | 398.3 | Tycoon / Crafting, Short Drama, Match Merge 2, Tower Defense |
| Singapore | 17 | 10 | 692.2 | 8.1% | 657.8 | Short Drama, 4X Strategy, Open World Adventure, Tower Defense |
| South Korea | 22 | 21 | 563.1 | 6.6% | 53.8 | MMORPG, Turn-based RPG, Idle RPG, Tower Defense |
| Turkey | 10 | 8 | 399.0 | 4.7% | 139.9 | Sort, Block, Match Pair, Utilities |
| Israel | 7 | 6 | 359.8 | 4.2% | 65.4 | Solitaire, Coin Looters, Eat & Grow, Short Drama |
| Switzerland | 3 | 3 | 169.9 | 2.0% | 38.7 | 4X Strategy, Squad RPG |
| Vietnam | 4 | 4 | 128.9 | 1.5% | 129.3 | Screw, Sort, Sandbox |
| France | 3 | 3 | 87.4 | 1.0% | 59.0 | Sort, Artillery Shooter |
| United Arab Emirates | 2 | 0 | 74.3 | 0.9% | 66.1 | Language Education, Short Drama |
| Ireland | 2 | 2 | 57.2 | 0.7% | 21.9 | Match Merge 2, Simulator |
| Spain | 2 | 0 | 23.3 | 0.3% | 17.0 | Utilities, Virtual TV Remotes |
| Canada | 1 | 1 | 14.0 | 0.2% | 4.7 | Bingo |
| Taiwan | 1 | 1 | 13.6 | 0.2% | 0.2 | Idle RPG |
| Germany | 2 | 2 | 12.7 | 0.1% | 141.6 | Empire Simulation, Sort |
| Cyprus | 2 | 2 | 11.7 | 0.1% | 86.9 | Hack and Slash, Sort |
| (blank) | 1 | 1 | 11.7 | 0.1% | 0.5 | MMORPG |
| Saudi Arabia | 1 | 0 | 10.2 | 0.1% | 9.8 | Sports Streaming |
| United Kingdom | 1 | 1 | 10.1 | 0.1% | 34.0 | Sniper |
| India | 5 | 0 | 2.9 | 0.0% | 419.0 | Short Drama, Video Editing, Grocery Delivery |
| Pakistan | 1 | 1 | 0.0 | 0.0% | 66.6 | Arcade Combat |
| Egypt | 1 | 0 | 0.0 | 0.0% | 68.0 | Short Drama |
## 3. Fastest growers among incumbents (released before 2024-07, prior >= $1M; `leaders.csv` `rev_*_best_usd`, `s_rev_h2_h1`)

### 3a. Largest absolute gains (all apps)

| App | Niche | Pub. country | Released | Rev prior $M | Rev cur $M | Delta $M | YoY | H2/H1 |
|---|---|---|---|---|---|---|---|---|
| ChatGPT | AI Assistant | US | 2023-05 | 1,754.7 | 4,065.3 | +2,310.6 | +132% | +25% |
| Google One | Cloud Storage | US | 2018-05 | 2,214.5 | 3,362.2 | +1,147.8 | +52% | +16% |
| Gossip Harbor: Merge & Story | Match Merge 2 | China | 2022-06 | 502.5 | 1,107.2 | +604.6 | +120% | +16% |
| Claude by Anthropic | AI Assistant | US | 2023-11 | 24.0 | 525.5 | +501.5 | +2094% | +600% |
| CapCut: Photo & Video Editor | Video Editing | China | 2019-05 | 730.0 | 1,142.0 | +412.1 | +56% | +12% |
| Snapchat | Social Media | US | 2011-07 | 506.1 | 900.0 | +393.8 | +78% | +30% |
| Last Z: Survival Shooter | 4X Strategy | Singapore | 2023-12 | 163.5 | 508.4 | +344.9 | +211% | -34% |
| Royal Kingdom | Match Swap | Turkey | 2023-03 | 208.0 | 458.8 | +250.8 | +121% | -3% |
| Tasty Travels: Merge Game | Match Merge 2 | China | 2023-12 | 33.2 | 269.8 | +236.6 | +712% | +68% |
| Paramount+ | OTT Streaming | US | 2013-03 | 504.6 | 681.0 | +176.4 | +35% | +21% |
| Peacock TV: Stream TV & Movies | OTT Streaming | US | 2020-07 | 532.9 | 700.6 | +167.7 | +31% | +10% |
| Crunchyroll | OTT Streaming | US | 2009-12 | 465.0 | 620.3 | +155.3 | +33% | +22% |
| YouTube | Social Media | US | 2010-10 | 2,193.4 | 2,334.7 | +141.3 | +6% | +7% |
| eFootball | Realistic Sports | Japan | 2016-12 | 395.7 | 535.8 | +140.1 | +35% | +42% |
| Amazon Prime Video | OTT Streaming | US | 2011-09 | 487.2 | 624.7 | +137.5 | +28% | +14% |
| Telegram | Social Messaging | United Arab Emirates | 2013-08 | 217.8 | 354.9 | +137.1 | +63% | +11% |
| Spotify: Music and Podcasts | Music & Podcasts | Sweden | 2009-09 | 264.5 | 372.8 | +108.3 | +41% | +31% |
| Alipay | Digital Wallets & P2P Payments | China | 2009-10 | 4.3 | 105.2 | +100.9 | +2355% | +64% |
| Amazon Shopping | Shopping | US | 2008-12 | 478.6 | 575.8 | +97.2 | +20% | -7% |
| TikTok | Social Media | China | 2014-04 | 4,821.8 | 4,915.6 | +93.9 | +2% | -1% |
| YouTube Music | Music & Podcasts | US | 2015-11 | 335.0 | 425.1 | +90.1 | +27% | +14% |
| 汽水音乐 | Music & Podcasts | China | 2022-03 | 40.9 | 129.9 | +89.0 | +218% | +68% |
| Merge Cooking | Match Merge 2 | Singapore | 2022-02 | 61.7 | 149.5 | +87.8 | +142% | +26% |
| LINE | Social Messaging | Japan | 2011-06 | 146.5 | 230.2 | +83.7 | +57% | +38% |
| Duolingo: Learn Languages | Language Education | US | 2012-11 | 617.6 | 698.1 | +80.6 | +13% | +1% |
### 3b. Largest absolute gains (games)

| App | Niche | Pub. country | Released | Rev prior $M | Rev cur $M | Delta $M | YoY | H2/H1 |
|---|---|---|---|---|---|---|---|---|
| Gossip Harbor: Merge & Story | Match Merge 2 | China | 2022-06 | 502.5 | 1,107.2 | +604.6 | +120% | +16% |
| Last Z: Survival Shooter | 4X Strategy | Singapore | 2023-12 | 163.5 | 508.4 | +344.9 | +211% | -34% |
| Royal Kingdom | Match Swap | Turkey | 2023-03 | 208.0 | 458.8 | +250.8 | +121% | -3% |
| Tasty Travels: Merge Game | Match Merge 2 | China | 2023-12 | 33.2 | 269.8 | +236.6 | +712% | +68% |
| eFootball | Realistic Sports | Japan | 2016-12 | 395.7 | 535.8 | +140.1 | +35% | +42% |
| Merge Cooking | Match Merge 2 | Singapore | 2022-02 | 61.7 | 149.5 | +87.8 | +142% | +26% |
| Magic Sort! | Sort | Turkey | 2024-04 | 31.2 | 94.8 | +63.6 | +204% | +13% |
| Anipop ™ | Match Swap | China | 2014-02 | 89.9 | 149.7 | +59.7 | +66% | +15% |
| Sword x Staff | Idle RPG | China | 2024-05 | 40.3 | 100.0 | +59.7 | +148% | +78% |
| Total Battle: War Strategy | 4X Strategy | Cyprus | 2017-10 | 183.4 | 236.1 | +52.7 | +29% | +8% |
| Bingo Voyage: Live Bingo Games | Bingo | US | 2023-06 | 42.3 | 94.8 | +52.5 | +124% | -0% |
| Toon Blast | Match Blast | Turkey | 2017-01 | 318.1 | 368.7 | +50.6 | +16% | -2% |
| Fortnite | Battle Royale | US | 2018-03 | 14.1 | 60.6 | +46.5 | +330% | +35% |
| Pokémon GO | Geolocation | US | 2016-04 | 545.8 | 587.8 | +42.0 | +8% | +20% |
| Match Villains | Match Swap | Turkey | 2024-04 | 18.9 | 57.7 | +38.9 | +206% | -27% |
| All in Hole: Black Hole Games | Eat & Grow | France | 2023-06 | 59.9 | 98.0 | +38.1 | +64% | +16% |
| Garena Free Fire | Battle Royale | Singapore | 2017-10 | 564.3 | 599.9 | +35.6 | +6% | +5% |
| OneState RP: Role Play Online | Action Sandbox | Cyprus | 2022-03 | 29.5 | 64.9 | +35.5 | +120% | +41% |
| Wuthering Waves | Open World Adventure | China | 2024-02 | 174.1 | 208.4 | +34.2 | +20% | +11% |
| Triple Match City | Match Pair | United Arab Emirates | 2022-06 | 32.1 | 65.3 | +33.3 | +104% | -1% |
### 3c. Highest YoY (prior >= $1M and current >= $5M)

| App | Niche | Pub. country | Released | Rev prior $M | Rev cur $M | Delta $M | YoY | H2/H1 |
|---|---|---|---|---|---|---|---|---|
| Alipay | Digital Wallets & P2P Payments | China | 2009-10 | 4.3 | 105.2 | +100.9 | +2355% | +64% |
| Claude by Anthropic | AI Assistant | US | 2023-11 | 24.0 | 525.5 | +501.5 | +2094% | +600% |
| zeta - AIキャラ・あなたの推しとロールプレイチャット | AI Companion | South Korea | 2022-05 | 3.7 | 47.8 | +44.0 | +1183% | +344% |
| 红果短剧 | Short Drama | China | 2023-08 | 1.3 | 11.7 | +10.4 | +793% | +91% |
| Tasty Travels: Merge Game | Match Merge 2 | China | 2023-12 | 33.2 | 269.8 | +236.6 | +712% | +68% |
| Calo: AI Food Calorie Counter | Nutrition & Diet | China | 2023-04 | 1.1 | 8.1 | +7.0 | +650% | +44% |
| Google Gemini | AI Assistant | US | 2024-02 | 5.3 | 39.0 | +33.7 | +638% | -33% |
| Merge Cruise: Mystery Puzzle | Match Merge 2 | Israel | 2023-09 | 1.2 | 8.7 | +7.4 | +596% | -37% |
| Hexa Away | Sort | Japan | 2024-05 | 2.6 | 18.1 | +15.5 | +593% | +119% |
| Emochi: Chat With Character | AI Companion | US | 2024-01 | 1.7 | 11.7 | +10.0 | +573% | +104% |
| Tile Explorer - Triple Match | Match Pair | China | 2024-05 | 1.0 | 6.2 | +5.1 | +495% | +12% |
| Scanner App - Scan PDF & Docs | Business & Productivity Software | Turkey | 2021-12 | 4.3 | 22.1 | +17.8 | +412% | +114% |
| Hume Health | Personal Health & Fitness | Canada | 2019-09 | 5.4 | 27.2 | +21.9 | +408% | +40% |
| Color Slide - Hexa Puzzle | Sort | Cyprus | 2024-04 | 1.9 | 9.6 | +7.6 | +399% | +20% |
| Card Ladder | Lifestyle & Services | US | 2021-02 | 2.0 | 9.7 | +7.7 | +397% | +141% |
| QR Code Reader＋Barcode Scanner | QR Scanners | Cyprus | 2024-05 | 1.2 | 5.8 | +4.6 | +371% | +25% |
| Vigloo - Premier Short Dramas | Short Drama | South Korea | 2024-06 | 4.9 | 22.1 | +17.3 | +356% | +79% |
| Clean Up Phone Storage: CleanX | File Management | Turkey | 2021-08 | 1.3 | 6.1 | +4.8 | +355% | +60% |
| Venue: Relaxing Design Game | Customization | US | 2023-06 | 1.5 | 6.5 | +5.0 | +341% | +17% |
| Bevel: AI Health Coach | Personal Health & Fitness | US | 2024-01 | 1.6 | 7.1 | +5.5 | +340% | +156% |
| Idle Obelisk Miner | Idler | United Kingdom | 2023-02 | 2.9 | 12.4 | +9.5 | +331% | +104% |
| Fortnite | Battle Royale | US | 2018-03 | 14.1 | 60.6 | +46.5 | +330% | +35% |
| Chatta - Live Meet Friends | Dating | Singapore | 2024-05 | 1.3 | 5.3 | +4.0 | +307% | +77% |
| 쿠팡플레이 | OTT Streaming | South Korea | 2020-12 | 6.5 | 26.4 | +19.8 | +304% | +11% |
| Apple TV: Shows, Movies & More | OTT Streaming | US | 2016-12 | 8.5 | 33.9 | +25.4 | +301% | +59% |
**Reading (incumbent growers).**

- **AI assistants dominate dollar growth.**
  - ChatGPT: +$2.31B, to $4.07B.
  - Claude: +$501M, from a $24M base.
  - Gemini: +$34M.
- **Narrative merge is the biggest game growth engine, and it is concentrated.**
  - Gossip Harbor: +$605M, to $1.11B.
  - Tasty Travels: +$237M (+712%).
  - Merge Cooking: +$88M.
  - Together these three are +$930M, which is 75% of the Match Merge 2 niche's +$1,247M.
- **Turkish match and sort incumbents keep compounding.**
  - Royal Kingdom: +$251M.
  - Magic Sort!: +$64M (+204%).
  - Match Villains: +$39M.
  - Hexa Away: +593% on a $2.6M base.
- **4X Strategy.**
  - Last Z: +$345M. Its H2/H1 is already -34%.
- **Idle RPG.**
  - Sword x Staff: +$60M.
  - Trickcal: +$29M.
- **Caveats.**
  - Fortnite (+330%, $14M → $61M) and Alipay (+2,355%, $4.3M → $105M) look like distribution or measurement events rather than demand. Fortnite returned to iOS; Alipay's growth looks like a change in billing or classification. Do not read either as a product pattern.
  - Several streaming apps grew 28-35% (Paramount+, Peacock, Crunchyroll, Prime Video). This is price increases plus in-app billing, not entry opportunities.

## 4. Biggest decliners and niches where incumbents lose share

### 4a. Largest absolute store-revenue declines (incumbents, all apps)

As stated in section 0, part of these declines may be payments moving to web shops or D2C, which the store data cannot see. Disney+, Audible, Bumble and Tinder are subscription apps, and Royal Match, MONOPOLY GO! and Last War are known web-shop adopters. Treat these rows as store-revenue declines.

| App | Niche | Pub. country | Released | Rev prior $M | Rev cur $M | Delta $M | YoY | H2/H1 |
|---|---|---|---|---|---|---|---|---|
| Disney+ | OTT Streaming | US | 2019-03 | 1,377.4 | 970.1 | -407.3 | -30% | -16% |
| Last War:Survival | 4X Strategy | Singapore | 2023-06 | 1,655.3 | 1,303.6 | -351.7 | -21% | -49% |
| Royal Match | Match Swap | Turkey | 2020-07 | 1,502.7 | 1,239.6 | -263.1 | -18% | -11% |
| MONOPOLY GO! | Coin Looters | US | 2022-06 | 1,419.7 | 1,172.9 | -246.8 | -17% | -17% |
| Roblox | Sandbox | US | 2011-05 | 944.4 | 701.2 | -243.2 | -26% | +12% |
| 地下城与勇士：起源 | Beat 'em Up | China | 2021-11 | 397.0 | 154.7 | -242.3 | -61% | -52% |
| Whiteout Survival | 4X Strategy | China | 2022-12 | 1,496.7 | 1,266.9 | -229.9 | -15% | -10% |
| Audible: Audiobooks & Podcasts | Books & Comics | US | 2010-07 | 546.6 | 356.0 | -190.5 | -35% | -6% |
| Tinder Dating App: Date & Chat | Dating | US | 2012-08 | 1,226.5 | 1,063.4 | -163.1 | -13% | -3% |
| Bumble Dating App: Meet & Date | Dating | US | 2014-11 | 494.9 | 334.3 | -160.6 | -32% | -17% |
| 리니지M | MMORPG | South Korea | 2017-06 | 335.3 | 194.1 | -141.2 | -42% | -17% |
| Love and Deepspace | Interactive Story | China | 2023-09 | 379.9 | 251.4 | -128.5 | -34% | -36% |
| Brawl Stars | Brawl | Finland | 2017-06 | 487.2 | 369.0 | -118.3 | -24% | +20% |
| Honkai: Star Rail | Turn-based RPG | China | 2023-01 | 402.9 | 290.9 | -112.0 | -28% | +25% |
| 和平精英 | Battle Royale | China | 2018-02 | 776.7 | 667.4 | -109.3 | -14% | +5% |
| iQIYI - Drama, Anime, Show | OTT Streaming | China | 2010-09 | 418.4 | 310.8 | -107.6 | -26% | -7% |
| Hulu: Stream TV shows & movies | OTT Streaming | US | 2010-06 | 319.8 | 215.3 | -104.5 | -33% | -9% |
| CrossFire: Legends | FPS / 3PS | China | 2015-12 | 216.8 | 125.4 | -91.4 | -42% | -50% |
| Fate/Grand Order | Turn-based RPG | Japan | 2015-07 | 311.0 | 223.4 | -87.5 | -28% | -8% |
| Archero 2 | Shoot 'em Up | China | 2024-06 | 145.5 | 59.6 | -85.9 | -59% | -34% |
| Hinge Dating App: Match & Date | Dating | US | 2013-02 | 452.5 | 369.3 | -83.2 | -18% | +7% |
| Call of Duty®: Mobile | FPS / 3PS | US | 2018-12 | 432.0 | 349.4 | -82.6 | -19% | -14% |
| Clash of Clans | Build & Battle | Finland | 2012-06 | 404.3 | 323.8 | -80.5 | -20% | -12% |
| ESPN: Live Sports & Scores | Sports Streaming | US | 2009-06 | 172.9 | 94.0 | -79.0 | -46% | -21% |
| Google Photos: Backup & Edit | Photo Galleries | US | 2015-05 | 247.3 | 171.7 | -75.6 | -31% | -71% |
### 4b. Sub-genres where pre-2024-07 apps lose ground to new releases (rev_prior >= $50M; pre-2024-07 apps' top-100 revenue fell and new releases hold >= 15% of top-100)

Sources: `niche_dynamics_game_sub_genre.csv`, `niche_leaders_full_game_sub_genre.csv` and `niche_top_apps.csv`.

| Sub-genre | Rev prior $M | Rev cur $M | YoY | H2/H1 | Pre-2024-07 apps in top-100, $M prior -> cur | New-release share of top-100 rev | New releases >= $1M / >= $5M | Top-3 share | HHI | Tagged apps prior -> cur | US ad-intensity rank | Flag |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Screw | 172 | 229 | +33% | -13% | 61 -> 21 (-66%) | 91% | 19 / 8 | 63% | 0.228 | 237 -> 692 | 27 |  |
| Solitaire | 330 | 455 | +38% | +18% | 260 -> 172 (-34%) | 62% | 2 / 2 | 82% | 0.322 | 3133 -> 3494 | 29 |  |
| Turn-Based Tactics | 355 | 312 | -12% | -23% | 203 -> 130 (-36%) | 58% | 4 / 1 | 76% | 0.341 | 228 -> 430 | 53 |  |
| Survival | 131 | 190 | +45% | -16% | 93 -> 86 (-7%) | 54% | 7 / 1 | 65% | 0.239 | 752 -> 979 | 39 |  |
| FPS / 3PS | 1,205 | 1,603 | +33% | -10% | 957 -> 744 (-22%) | 53% | 4 / 4 | 72% | 0.206 | 4932 -> 4503 | 70 |  |
| Block | 135 | 214 | +58% | +31% | 110 -> 101 (-8%) | 52% | 13 / 5 | 77% | 0.279 | 3396 -> 4061 | 17 |  |
| Card Battler | 1,362 | 771 | -43% | -25% | 456 -> 368 (-19%) | 52% | 7 / 4 | 56% | 0.209 | 821 -> 1021 | 73 |  |
| Idle RPG | 1,343 | 1,402 | +4% | -13% | 797 -> 594 (-26%) | 52% | 51 / 21 | 36% | 0.075 | 2959 -> 2701 | 33 |  |
| Action RPG | 152 | 183 | +20% | +48% | 135 -> 88 (-35%) | 50% | 7 / 5 | 30% | 0.052 | 757 -> 1062 | 44 |  |
| Tower Defense | 723 | 851 | +18% | +10% | 590 -> 482 (-18%) | 41% | 40 / 11 | 35% | 0.064 | 2369 -> 2982 | 31 |  |
| MMORPG | 2,948 | 2,226 | -24% | -6% | 1,981 -> 1,268 (-36%) | 30% | 35 / 28 | 26% | 0.039 | 2472 -> 2343 | 61 |  |
| 4X Strategy | 7,415 | 7,584 | +2% | -18% | 6,735 -> 5,657 (-16%) | 23% | 29 / 25 | 48% | 0.090 | 1501 -> 1511 | 60 |  |
| Idler | 376 | 359 | -4% | +2% | 323 -> 251 (-22%) | 21% | 15 / 4 | 20% | 0.028 | 4027 -> 5073 | 21 |  |
| Squad RPG | 1,520 | 1,204 | -21% | -13% | 1,110 -> 808 (-27%) | 20% | 32 / 9 | 37% | 0.069 | 2657 -> 3275 | 51 |  |
| Hack and Slash | 337 | 280 | -17% | -9% | 334 -> 226 (-32%) | 19% | 4 / 2 | 69% | 0.286 | 148 -> 300 | 83 |  |
| Tycoon / Crafting | 1,510 | 1,531 | +1% | -3% | 1,371 -> 1,196 (-13%) | 19% | 16 / 8 | 55% | 0.157 | 3201 -> 3529 | 67 |  |
| Music / Rhythm | 349 | 320 | -8% | +30% | 341 -> 259 (-24%) | 18% | 1 / 1 | 52% | 0.117 | 4058 -> 3994 | 11 |  |
| Match Pair | 629 | 600 | -5% | -15% | 594 -> 489 (-18%) | 17% | 18 / 7 | 57% | 0.161 | 5198 -> 7315 | 25 |  |
| Sports Manager | 292 | 307 | +5% | +14% | 280 -> 254 (-9%) | 15% | 7 / 2 | 39% | 0.076 | 779 -> 1273 | 63 |  |
| Shoot 'em Up | 578 | 397 | -31% | -17% | 533 -> 330 (-38%) | 15% | 12 / 5 | 37% | 0.064 | 2618 -> 4181 | 56 |  |
| Breeding | 98 | 98 | +1% | +20% | 97 -> 84 (-14%) | 15% | 3 / 1 | 50% | 0.115 | 118 -> 210 | 35 |  |
**Reading (share shifts).**

- **Screw: replacement, not growth.**
  - Pre-2024-07 apps in the top-100 fell from $61M to $21M (-66%).
  - Screwdom (VN, Dec-2024) is 45% of the top-100.
  - The niche is past its peak: H2/H1 -13%, last3m yoy -18%, downloads yoy -40%.
  - The tagged-app count jumped from 237 to 692, so part of the measured niche growth may be tagging.
- **Solitaire: replacement driven by one app.**
  - Pre-2024-07 apps fell from $260M to $172M; Solitaire Grand Harvest alone is -43%.
  - Disney Solitaire is $232.6M (51% of top-100); Solitaire Associations Journey is $43.8M.
  - Only 2 new apps made at least $5M.
- **Sort: genuinely new demand, with incumbents also growing.**
  - Pre-2024-07 apps grew from $132M to $175M (Magic Sort! +204%).
  - New releases still took 76% of the top-100, from 45 apps at or above $1M.
  - The tagged-app count grew from 4,043 to 6,921. The revenue is in named new apps (Pixel Flow!, Yarn Loop, Marble Sort!, Gecko Out, Sand Loop), so this is not a relabelling of old apps.
- **FPS / 3PS** (+33%): the growth comes from three Chinese entrants (Delta Force $561M, 无畏契约 $245M, 逆战 $37M). Pre-2024-07 apps fell from $957M to $744M.
- **Idle RPG** (+4%): incumbents fell from $797M to $594M and new releases took 52% of the top-100 (메이플 키우기 $297M). This is a share transfer inside a flat market.
- **MMORPG** (-24%), **Card Battler** (-43%) and **Turn-Based Tactics** (-12%) are declining markets where launch spikes hold up the new-release share:
  - Pokémon TCG Pocket peaked at $149.9M in Nov-2024 and was at 0.08 of peak in Sep-2026.
  - SD Gundam G Generation peaked at $42.5M and was at 0.21 of peak.
  - Korean MMORPG launches are at 0.0-0.3 of peak.
- **4X Strategy** ($7.6B, flat): pre-2024-07 apps fell from $6.74B to $5.66B (-16%). New releases (Kingshot, Last Asylum, Tiles Survive!, X-Clash) took 23% of the top-100.
- **Declining niches with almost no entrants.** In Slots, Sandbox, Coin Looters, Beat 'em Up, Brawl, MOBA, Battle Royale and Build & Battle, new releases hold 0-5% of the top-100 and top-3 concentration is 88-98%. These markets shrink without opening a door.

### 4c. Declining sub-genres (rev_prior >= $50M, yoy <= -5%), sorted by dollar loss

| Sub-genre | Rev prior $M | Rev cur $M | YoY | H2/H1 | Pre-2024-07 apps in top-100, $M prior -> cur | New-release share of top-100 rev | New releases >= $1M / >= $5M | Top-3 share | HHI | Tagged apps prior -> cur | US ad-intensity rank | Flag |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| MMORPG | 2,948 | 2,226 | -24% | -6% | 1,981 -> 1,268 (-36%) | 30% | 35 / 28 | 26% | 0.039 | 2472 -> 2343 | 61 |  |
| Card Battler | 1,362 | 771 | -43% | -25% | 456 -> 368 (-19%) | 52% | 7 / 4 | 56% | 0.209 | 821 -> 1021 | 73 |  |
| Turn-based RPG | 2,062 | 1,578 | -23% | -14% | 1,897 -> 1,363 (-28%) | 13% | 10 / 7 | 41% | 0.075 | 582 -> 965 | 62 |  |
| Slots | 2,831 | 2,363 | -17% | -14% | 2,747 -> 2,271 (-17%) | 1% | 4 / 1 | 23% | 0.035 | 5324 -> 7783 | 72 |  |
| Squad RPG | 1,520 | 1,204 | -21% | -13% | 1,110 -> 808 (-27%) | 20% | 32 / 9 | 37% | 0.069 | 2657 -> 3275 | 51 |  |
| Sandbox | 1,107 | 885 | -20% | +11% | 1,103 -> 879 (-20%) | 1% | 2 / 0 | 98% | 0.659 | 1882 -> 2232 | 66 |  |
| Coin Looters | 2,724 | 2,503 | -8% | -10% | 2,716 -> 2,369 (-13%) | 5% | 2 / 2 | 88% | 0.354 | 175 -> 214 | 78 |  |
| Beat 'em Up | 532 | 314 | -41% | -26% | 529 -> 298 (-44%) | 5% | 3 / 1 | 92% | 0.405 | 145 -> 213 | 82 |  |
| Shoot 'em Up | 578 | 397 | -31% | -17% | 533 -> 330 (-38%) | 15% | 12 / 5 | 37% | 0.064 | 2618 -> 4181 | 56 |  |
| Interactive Story | 694 | 515 | -26% | -21% | 669 -> 462 (-31%) | 8% | 6 / 3 | 59% | 0.262 | 3703 -> 3523 | 42 |  |
| Puzzle RPG | 1,014 | 865 | -15% | -13% | 1,007 -> 837 (-17%) | 3% | 8 / 1 | 60% | 0.140 | 380 -> 460 | 76 |  |
| Brawl | 652 | 504 | -23% | +6% | 651 -> 497 (-24%) | 1% | 2 / 0 | 97% | 0.570 | 229 -> 385 | 55 |  |
| MOBA | 2,061 | 1,935 | -6% | -0% | 2,057 -> 1,918 (-7%) | 1% | 2 / 1 | 95% | 0.566 | 136 -> 113 | 87 |  |
| Battle Royale | 1,980 | 1,880 | -5% | +4% | 1,940 -> 1,867 (-4%) | 1% | 1 / 1 | 91% | 0.287 | 262 -> 218 | 79 |  |
| Build & Battle | 475 | 382 | -20% | -12% | 474 -> 381 (-20%) | 0% | 0 / 0 | 91% | 0.724 | 141 -> 163 | 86 |  |
| Match Merge 3 | 272 | 195 | -28% | -30% | 269 -> 185 (-31%) | 5% | 2 / 1 | 54% | 0.130 | 150 -> 224 | 65 |  |
| Empire Simulation | 229 | 157 | -31% | -16% | 218 -> 136 (-38%) | 13% | 2 / 1 | 35% | 0.070 | 388 -> 411 | 81 |  |
| Asymmetric Battle | 188 | 126 | -33% | +6% | 188 -> 125 (-33%) | 1% | 0 / 0 | 96% | 0.795 | 169 -> 243 | 34 |  |
| Hack and Slash | 337 | 280 | -17% | -9% | 334 -> 226 (-32%) | 19% | 4 / 2 | 69% | 0.286 | 148 -> 300 | 83 |  |
| Real-Time Strategy | 764 | 707 | -7% | -47% | 751 -> 682 (-9%) | 3% | 3 / 1 | 77% | 0.373 | 1097 -> 1204 | 58 |  |
## 5. Publisher-country shifts

### 5a. Country share of per-niche top-100 game revenue (all 103 game sub-genres; apps deduplicated; `niche_top_apps.csv`, field=game_sub_genre, order=revenue)

| Country | Current $M | Share | Prior $M | Share | Change (pp) | YoY |
|---|---|---|---|---|---|---|
| China | 17,519 | 32.0% | 17,453 | 31.1% | +0.9 | +0% |
| US | 7,187 | 13.1% | 8,215 | 14.6% | -1.5 | -13% |
| Japan | 5,237 | 9.6% | 5,956 | 10.6% | -1.0 | -12% |
| Singapore | 3,690 | 6.7% | 3,370 | 6.0% | +0.7 | +9% |
| Turkey | 3,210 | 5.9% | 2,725 | 4.9% | +1.0 | +18% |
| Israel | 2,497 | 4.6% | 2,615 | 4.7% | -0.1 | -5% |
| South Korea | 2,317 | 4.2% | 2,606 | 4.6% | -0.4 | -11% |
| Hong Kong | 1,882 | 3.4% | 1,634 | 2.9% | +0.5 | +15% |
| Finland | 1,663 | 3.0% | 1,942 | 3.5% | -0.4 | -14% |
| France | 521 | 1.0% | 352 | 0.6% | +0.3 | +48% |

Totals: $54.71B current vs $56.11B prior.

### 5b. New releases (since 2024-07) in current game top-100s, by publisher country (total $9.00B; `niche_top_apps.csv`)

| Country | New apps in top-100s | Revenue $M | Share | Where (top niches by $) |
|---|---|---|---|---|
| China | 363 | 3,552 | 39.5% | 4X Strategy 1,217; FPS/3PS 853; Open World 320; Match Merge 2 175; Idle RPG 134 |
| Japan | 184 | 1,376 | 15.3% | Card Battler 378; Idle RPG 330; Turn-Based Tactics 175; Turn-based RPG 64; MMORPG 61 |
| Hong Kong | 332 | 855 | 9.5% | Tycoon/Crafting 166; Match Merge 2 123; Tower Defense 112; 4X 109; Coin Looters 82 |
| South Korea | 180 | 714 | 7.9% | MMORPG 320; Turn-based RPG 118; Idle RPG 92; Tower Defense 43; Idler 19 |
| Turkey | 161 | 463 | 5.1% | Sort 304; Block 73; Match Pair 28; Physics 15; Riddle 10 |
| Singapore | 133 | 408 | 4.5% | 4X 99; Open World 55; Match Merge 2 50; Screw 49; Tower Defense 43 |
| Israel | 36 | 368 | 4.1% | Solitaire 233; Coin Looters 52; Eat & Grow 29; Sort 18; Idle RPG 12 |
| Vietnam | 314 | 221 | 2.5% | Screw 121; Sort 44; Match Pair 23; Customization 5; Artillery 5 |
| US | 289 | 202 | 2.2% | Solitaire 45; Block 18; Realistic Sports 17; 4X 16; Squad RPG 14 |
| Switzerland | 14 | 175 | 1.9% | 4X 151; Squad RPG 19 |
| France | 78 | 154 | 1.7% | Sort 76; Artillery Shooter 35; Card Battler 7; Bubble Shooter 5 |

App side (App IQ top-100s; new-release revenue $3.07B):

| Country | Share | Revenue in main niches |
|---|---|---|
| US | 32.5% | AI Assistant $313M, Short Drama $238M, AI Content Generator $116M, AI Companion $84M |
| Singapore | 18.1% | Short Drama $371M |
| Hong Kong | 10.9% | Short Drama $152M |
| Turkey | 5.1% | spread across photo, utility and video tools |
| UAE | 3.9% | Language Education $63M (Learna AI) |
| South Korea | 1.6% | AI Companion $36M |

### 5c. Per-niche share shifts (top-100 revenue share, prior → current; niches with rev_prior >= $50M)

| Country | Gains | Losses |
|---|---|---|
| **China** | Survival 35% → 54% (+19pp); Avatar Life 10% → 28% (+18pp); FPS/3PS 57% → 73% (+16pp); Match Merge 2 56% → 67% (+11pp); Virtual Casino 11% → 19% (+8pp) | Idle RPG 58% → 35% (-23pp), lost to Japan's 메이플 키우기 |
| **Turkey** | Sort 43% → 57% (+14pp); Physics 0% → 14% (+14pp); Match Blast 81% → 87% (+6pp); Driving/Flight Sim 11% → 16% (+4pp) | Screw 8% → 1%; Eat & Grow 12% → 6% |
| **Vietnam** | Screw (Screwdom; Vietnam is 54% of Screw's top-5 country mix) | Sort 12% → 7%; Block 6% → 1% |
| **Hong Kong / Singapore** | Screw +8pp each; Tycoon/Crafting +6pp (HK); Physics, Open World and Tower Defense +5-8pp (SG) | – |
| **South Korea** | Breeding +7pp; Poker +5pp; Turn-based RPG +5pp | Hack and Slash -9pp |
| **Japan** | Idle RPG 9% → 33% (+24pp) | Card Battler 74% → 61%; Avatar Life 40% → 25% |
| **Israel** | Solitaire 21% → 51% (+31pp); Eat & Grow 0% → 16% (+16pp) | Match Merge 2 21% → 11% |
| **France** | Sort 1% → 10% (+10pp); Bubble Shooter +5pp | – |
| **US** | Geolocation +8pp; Block +7pp; Card Battler +7pp | FPS/3PS 36% → 22% (-14pp); Sort 18% → 5% (-14pp) |

Notes:

- Turkey's casual share shifted inside the casual puzzle niches.
- Vietnam's casual footprint now runs through screw/sort hits plus many small apps: 314 new apps for $221M.
- South Korea's entry is mid-core RPG (MMORPG $320M) plus AI companion apps.

**Summary of shifts.**

- Chinese publishers (mainland plus HK/SG registrations) take most of the new **mid-core** money: 4X, FPS, open-world, Match Merge 2, tycoon and Tower Defense.
- Turkish, Vietnamese, Israeli and French studios take the new **casual puzzle** money: Sort, Block, Screw, Solitaire, Physics and Eat & Grow.
- Korean and Japanese entrants concentrate in RPG/MMO launches, which spike and decay.
- US publishers' share of game top-100 revenue fell by 1.5pp, but on the app side US publishers took 32.5% of new-release revenue, driven by AI.

## 6. Accessibility map: casual and hybrid sub-genres

Sources: `niche_dynamics_game_sub_genre.csv`, `niche_leaders_full_game_sub_genre.csv`, `niche_top_apps.csv`. US ad-intensity rank: 1 = most ad-heavy among niches with prior revenue >= $20M; it is blank for smaller niches. Store IAP only.

| Sub-genre | Rev prior $M | Rev cur $M | YoY | H2/H1 | Pre-2024-07 apps in top-100, $M prior -> cur | New-release share of top-100 rev | New releases >= $1M / >= $5M | Top-3 share | HHI | Tagged apps prior -> cur | US ad-intensity rank | Flag |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Sort | 197 | 754 | +283% | +62% | 132 -> 175 (+33%) | 76% | 45 / 22 | 44% | 0.093 | 4043 -> 6921 | 10 |  |
| Screw | 172 | 229 | +33% | -13% | 61 -> 21 (-66%) | 91% | 19 / 8 | 63% | 0.228 | 237 -> 692 | 27 |  |
| Block | 135 | 214 | +58% | +31% | 110 -> 101 (-8%) | 52% | 13 / 5 | 77% | 0.279 | 3396 -> 4061 | 17 |  |
| Match Merge 2 | 1,419 | 2,666 | +88% | +27% | 1,376 -> 2,221 (+61%) | 16% | 30 / 13 | 61% | 0.208 | 5476 -> 4639 | 36 |  |
| Solitaire | 330 | 455 | +38% | +18% | 260 -> 172 (-34%) | 62% | 2 / 2 | 82% | 0.322 | 3133 -> 3494 | 29 |  |
| Eat & Grow | 96 | 179 | +87% | +29% | 83 -> 120 (+44%) | 33% | 12 / 2 | 71% | 0.319 | 464 -> 862 | 48 |  |
| Physics | 70 | 107 | +54% | +27% | 66 -> 71 (+7%) | 33% | 7 / 4 | 69% | 0.279 | 2963 -> 3697 | 19 |  |
| Match Pair | 629 | 600 | -5% | -15% | 594 -> 489 (-18%) | 17% | 18 / 7 | 57% | 0.161 | 5198 -> 7315 | 25 |  |
| Riddle | 12 | 23 | +96% | +33% | - | 76% | 4 / 1 | 55% | 0.122 | 2205 -> 2981 | - | SMALL BASE |
| Jigsaw | 13 | 19 | +41% | +70% | - | 40% | 1 / 1 | 57% | 0.166 | 2964 -> 3609 | - | SMALL BASE |
| Artillery Shooter | 16 | 53 | +224% | +184% | - | 79% | 2 / 1 | 78% | 0.439 | 355 -> 698 | - | SMALL BASE |
| Match Swap | 5,274 | 5,150 | -2% | -7% | 5,235 -> 5,098 (-3%) | 1% | 6 / 2 | 55% | 0.131 | 3540 -> 3970 | 77 |  |
| Match Blast | 515 | 514 | -0% | -7% | 514 -> 512 (-0%) | 0% | 0 / 0 | 91% | 0.541 | 1414 -> 1582 | 80 |  |
| Coin Looters | 2,724 | 2,503 | -8% | -10% | 2,716 -> 2,369 (-13%) | 5% | 2 / 2 | 88% | 0.354 | 175 -> 214 | 78 |  |
| Tower Defense | 723 | 851 | +18% | +10% | 590 -> 482 (-18%) | 41% | 40 / 11 | 35% | 0.064 | 2369 -> 2982 | 31 |  |
| Survival | 131 | 190 | +45% | -16% | 93 -> 86 (-7%) | 54% | 7 / 1 | 65% | 0.239 | 752 -> 979 | 39 |  |
| Tycoon / Crafting | 1,510 | 1,531 | +1% | -3% | 1,371 -> 1,196 (-13%) | 19% | 16 / 8 | 55% | 0.157 | 3201 -> 3529 | 67 |  |
| Idle RPG | 1,343 | 1,402 | +4% | -13% | 797 -> 594 (-26%) | 52% | 51 / 21 | 36% | 0.075 | 2959 -> 2701 | 33 |  |
| Idler | 376 | 359 | -4% | +2% | 323 -> 251 (-22%) | 21% | 15 / 4 | 20% | 0.028 | 4027 -> 5073 | 21 |  |
| Platformer / Runner | 92 | 115 | +24% | +2% | 78 -> 78 (+1%) | 24% | 6 / 2 | 36% | 0.068 | 20847 -> 21479 | 5 |  |
| Action Sandbox | 56 | 104 | +87% | +22% | 54 -> 97 (+78%) | 7% | 3 / 0 | 77% | 0.404 | 2955 -> 2852 | 45 |  |
| Word | 251 | 236 | -6% | -1% | 236 -> 202 (-14%) | 8% | 5 / 0 | 48% | 0.116 | 12863 -> 15953 | 13 |  |
| Bubble Shooter | 83 | 72 | -13% | -24% | 80 -> 66 (-18%) | 8% | 1 / 0 | 38% | 0.075 | 1964 -> 2072 | 14 |  |
| Time Management | 146 | 110 | -24% | -18% | 140 -> 98 (-30%) | 10% | 2 / 0 | 31% | 0.053 | 1415 -> 1707 | 54 |  |
**How to read this for a small team.**

- **Most open:**
  - Sort: 45 new releases at or above $1M, top-3 share 44%, HHI 0.09.
  - Tower Defense: 40 new at or above $1M, top-3 35%.
  - Idle RPG: 51 new at or above $1M, top-3 36%.
  - Screw: 19 new at or above $1M, but the niche is post-peak.
  - Match Merge 2 and Match Pair: open in breadth, but held by big incumbents.
- **Winner-take-most:** Solitaire (top-3 82%; only 2 new apps at or above $5M), Coin Looters (88%), Match Swap and Match Blast. Entry there needs IP or a large budget.
- **UA arms race:** Sort has the 10th-highest US ad intensity and impression share up +5.29pp (`imp_delta_pp`). Block ranks 17th and Physics 19th. Winning in these niches requires creative throughput, which is where a playable-ads studio has an advantage.

## 7. Hypotheses: repeatable entry patterns

Each hypothesis states a falsifiable claim, evidence with sources, and a test that fits in 4 weeks or less. Revenue figures are store IAP only (section 0).

**entrants-01: The Sort "variant sprint" still works.** A new colour/pixel sort variant with a fresh physical metaphor can reach $1M/month within 4 months of first revenue.
- Evidence:
  - Sort grew $197M → $754M (+283%), H2/H1 +62%, last3m +272% (`niche_dynamics_game_sub_genre.csv`).
  - New releases hold 76% of the top-100 (76 apps). 45 new apps make at least $1M and 22 at least $5M. Top-3 share is 44%, HHI 0.093 (`niche_leaders_full_game_sub_genre.csv`, `niche_top_apps.csv`).
  - Casual entrants take a median of 4 months to reach $1M/month (raw series):
    - Colony Flow!: 1 month to $1M, then $8.0M in Sep-26.
    - Food Hunt: 2 months, then $4.8M.
    - Bus Traffic Fever!: 4 months, then $6.1M.
- Growth driver: entrants. Growth decomposition: entrants +$464M vs both-period apps +$94M.
- Accessibility: high for prototyping and medium for scale. Turkey holds 57% of the top-5 country mix. Sort ranks 10th in US ad intensity, and impression share rose +5.29pp.
- Decay risk:
  - Sand Loop was at 0.25 of peak 6 months after its peak.
  - Pixel Flow! was at 0.57 of peak.
- Test: run 3 sort variants as playable ads at a fixed budget in US/CA. Measure IPM, CTR and CPI against Sort benchmarks. Take the best variant into an iOS soft launch in CA for 2 weeks and measure D1/D7 and ARPDAU.
- Confidence: 0.65.

**entrants-02: Material-skin transplant is a repeatable lever.** Moving a tactile material (yarn, pixels, marbles, sand, food) onto an adjacent sorting or screw mechanic produces new $10M+ apps faster than inventing a new mechanic.
- Evidence:
  - 40 fiber-named new releases made $137.6M across Sort, Screw and Physics, and 14 of them make at least $1M (`niche_top_apps.csv`).
  - Examples: Yarn Loop $43.2M (2 months to $1M/month), Knit Out $17.5M, Yarn Fever! $16.6M, Knit Away $10.0M, Wool Escape 3D $8.0M.
  - Pixel: Pixel Flow! $185.1M and Food Hunt: Pixel Puzzle $10.8M.
  - Marble Sort! $31.0M and Sand Loop $21.9M.
- Test: build one core loop with 4 material skins as playable ads. An A/B on IPM and CPI in 2 weeks shows which material carries.
- Risk: name keywords are a crude proxy for the mechanic, and skins get copied quickly.
- Confidence: 0.55.

**entrants-03: Ad-monetized logic/arrows puzzles are a large, invisible market.** They are reachable by a small team, but the trend cycle is about 3 months.
- Evidence:
  - Arrows Puzzle Escape: 140.5M downloads and $0.7M IAP. Its monthly downloads went 0.8M (Sep-25) → 29.8M (May-26) → 3.8M (Sep-26).
  - Arrows GO!: 99.0M downloads and $0.
  - Arrow Puzzle: 81.6M downloads.
  - Brain Puzzle 2: 82.9M downloads (Riddle: $23M IAP on 1.05B downloads, RPD $0.02).
  - Sort downloads: 1.73B, +53%.
  - Block Blast!: 339.5M downloads and $0.1M IAP.
- Test: on Android, measure ad ARPDAU times retention against CPI within 2-3 weeks of launch.
- Risk: revenue is unmeasured here, and the trend window is short.
- Confidence: 0.5.

**entrants-04: Themed narrative merge (Merge-2 plus story/cooking) is the largest growing casual pool.** New entrants can still reach $10-20M, but by slow ramps that need LTV-backed user acquisition. The test for a small team is the theme, not the scale.
- Evidence:
  - Match Merge 2 grew $1.42B → $2.67B (+88%). Three incumbents explain 75% of the growth: Gossip Harbor +$605M, Tasty Travels +$237M, Merge Cooking +$88M. New releases hold only 16% of the top-100.
  - Entrants and their months to $1M/month:

    | Entrant | Revenue | Months to $1M/mo |
    |---|---|---|
    | Flambé | $135.7M | 7 |
    | Mystery Town | $87.3M | 10 |
    | Hollywood Merge | $44.7M | 2 |
    | Foodstars | $21.6M | 6 |
    | Merge Teahouse | $18.3M | 5 |
    | Haunted Merge | $15.4M | 3 |
    | Hotel Legacy | $15.0M | 5 |

    All of them were at 94-100% of peak in Sep-26.
  - Themes: Cooking/Food +122%, Drama +87%. Revenue per download is $4.70.
- Test: fake-door theme test. Run 3 theme creatives and measure CTR and store-page conversion.
- Risk: China holds 67% of the top-5 country mix, live-ops content cost is high, and the payback cycle is long.
- Confidence: 0.55.

**entrants-05: Hole / Eat & Grow level-based puzzles are an expanding hybridcasual niche** where entrants and incumbents both grow.
- Evidence:
  - Eat & Grow grew $96M → $179M (+87%), H2/H1 +29%, last3m +48%.
  - The incumbent All in Hole grew +64% to $98M.
  - Hole It 3D and Hole Stars each make $14.6M and are still at peak. They took 10-11 months to reach $1M/month.
  - The hybridcasual product model is +24%.
- Accessibility: medium. Top-1 share is 55%, France holds 59.6% of the country mix, and US ad-intensity rank is 48.
- Test: playable-ad IPM, then a soft launch.
- Confidence: 0.5.

**entrants-06: Classic mechanic plus a new rule twist breaks into concentrated classic niches without IP.**
- Evidence:
  - Solitaire Associations Journey: $43.8M and 82.6M downloads. It reached $1M/month in 1 month and is at 97% of peak.
  - Solitaire grew $330M → $455M (+38%).
  - New releases hold 62% of the top-100, but top-3 share is 82%.
  - Disney Solitaire ($232.6M) shows that the other route is IP.
- Test: an English-language soft launch in US/CA.
- Risk: only 2 new Solitaire apps make at least $5M.
- Confidence: 0.45.

**entrants-07: iOS-first launch is enough to break out in casual puzzle.** The Android port can wait until there is proof.
- Evidence:
  - Revenue-weighted iOS share is 0.63 for casual entrants vs 0.55 for incumbents.
  - Block Out! made $48.8M with $2.9K Android revenue and 1.0M of 36.5M downloads on Android.
  - Jelly Busters 0.86, Color Blaze Shooter 0.88, Hexa Away 0.90.
- Test: a 4-week iOS-only soft launch in one market.
- Risk: the evidence comes from a few apps, and Android scale still matters for downloads.
- Confidence: 0.45.

**entrants-08: Physics puzzle hybrids (rope/tangle/smash, artillery castle) are a small but accelerating door.**
- Evidence:
  - Physics grew $70M → $107M (+54%), H2/H1 +27%, last3m +84%. Turkey's share of the top-100 went 0% → 14%.
  - New entrants include Royal Smash! (17.1M downloads in about 4 months) and Smash Fest! (22.8M downloads, $5.8M).
  - Castle Clashers! made $34.5M and 33.9M downloads. Its niche, Artillery Shooter, grew $16M → $53M, but that is a SMALL BASE and Castle Clashers! is 65% of it.
- Risk: Angry Birds holds 50% of Physics as top-1, and both niches are small.
- Confidence: 0.45.

**entrants-09: Casual/hybrid Tower Defense rewards slow-burn hybridcasual entrants.** The market is fragmented.
- Evidence:
  - Tower Defense grew $723M → $851M (+18%), H2/H1 +10%, last3m +28%.
  - Top-3 share is 35%, HHI 0.064, and 40 new apps make at least $1M.
  - Clash of Critters took 16 months to reach $1M/month and then made $15.2M in Sep-26.
  - Duck Survival took 12 months and then made $5.4M in Sep-26.
  - China holds 48% of the country mix.
- Accessibility: medium. The meta layer is heavier than a puzzle's.
- Confidence: 0.45.

**entrants-10: AI companion / character-story apps are a fragmented, fast-growing market** that a small team can prototype in weeks.
- Evidence:
  - AI Companion top-100 grew $171M → $474M (+178%).
  - New releases hold 49% of the top-100, from 50 apps at or above $1M. Top-3 share is 29%.
  - Tipsy Chat: $54.5M. It took 16 months to reach $1M/month and then made $17.8M in Sep-26.
  - zeta: +1,183%.
- Measurement note: web subscriptions are invisible, so the market is likely undervalued.
- Test: fake-door subscription. Paid social drives traffic to a landing page or TestFlight build with a paywall.
- Risk: moderation, store policy and LLM COGS.
- Confidence: 0.5.

**entrants-11: AI-lowered content cost reopens Short Drama for new labels.**
- Evidence:
  - VibeShort ("AI Short Dramas", HK, Feb-2026): $35.5M, 1 month to $1M/month, at peak.
  - StoryReel: $27.5M within 5 months.
  - Short Drama top-100 grew $1.84B → $2.24B (+22%).
  - New releases hold 39% of the top-100, and 17 make at least $5M.
  - The free model is huge on downloads: FreeReels 283M downloads, $0.2M IAP.
- Fit with the reader's studio: vertical-feed UX, close to a micro-game feed.
- Risk: SG/US/HK hold 87% of the country mix, and the user-acquisition arms race is intense.
- Confidence: 0.4.

**entrants-12: 4X / SLG still admits entrants, but only Chinese-backed, budget-heavy ones.** For a small studio, the repeatable entry is as a creative/playable vendor to these publishers, not as a 4X publisher.
- Evidence:
  - 4X grew $7.42B → $7.58B (+2%), H2/H1 -18%.
  - New releases make $1.65B (23% of the top-100). 25 make at least $5M and 11 at least $20M.
  - Pre-2024-07 apps fell -16%.
  - Kingshot: $956M. Last Asylum: $0 → $18.6M/month in 7 months.
  - 4X ranks 60th in US ad intensity, with impression share 7.3%. That is a large absolute UA spend.
- Caveat: this data has no B2B creative-spend figures, so this is a channel hypothesis.
- Confidence: 0.35.

## 8. Scripts and reproducibility

All computations used `python3 -I` with the stdlib only. In order:

1. Flatten the raw per-app monthly series (`data/raw/app_series_*.json`).
2. Build the entrant list and trajectories from `leaders.csv` plus the series.
3. Compute cluster and country aggregates.
4. Rank incumbents (`leaders.csv`).
5. Compute niche growth decomposition and share shifts (`niche_dynamics_game_sub_genre.csv`, `niche_leaders_full_*.csv`, `niche_top_apps.csv`).
6. Look up keywords and material skins (`niche_top_apps.csv`).

Every number above can be traced to these files and columns.

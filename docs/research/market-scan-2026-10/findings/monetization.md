# Monetization and product models: findings

Segment: MONETIZATION. Data room: `/Users/gleb/Documents/Codex/2026-10-10/sensor-tower/analysis/out/` (files as of 2026-10-10 11:11). All numbers were computed with `python3 -I` stdlib scripts over these CSVs. Each number names its file and column. Revenue is in USD and dl means downloads. "cur" is 2025-10..2026-09, "prior" is 2024-10..2025-09, H1 is 2025-10..2026-03, H2 is 2026-04..09, and last3m is Jul-Sep 2026 vs Jul-Sep 2025.

## 0. Measurement boundary (read first)

- Sensor Tower store estimates cover **App Store and Google Play in-app purchases plus paid downloads only**. They exclude advertising revenue, web/D2C payments, third-party Android stores (mainland-China Android is largely missing), and PC, console and web products.
- As a result, **hyper-casual, ad-supported puzzle, "mini-game hub", free short-drama and utility products are heavily undervalued** here. Their "revenue" is IAP only, and their real business is ads. In these niches, downloads and US time spent (`ts_*`, US only, opaque units, read only as YoY) are the demand proxies.
- RPD (revenue per download) = 12-month IAP revenue / 12-month downloads. It mixes new installs with revenue from the installed base, so an aging, shrinking-install title shows a rising RPD even when nothing about pricing changes. Section 1 separates these effects.
- Apple Arcade, Netflix Games and other platform subscriptions are not IAP. The `Exclusive Access` product model (IAP $2.4M, -53.9%) is therefore no evidence about subscription games.
- App IQ / Game IQ tags are Sensor Tower's own and can change. Wherever a claim rests on a niche's growth, I check whether named apps grew and whether the growth came from stayers or entrants (`niche_leaders_full_*`, `niche_top_apps.csv`).
- Base-size rule: niches with `rev_prior_usd` < $50M are flagged **[small base]**.

## 1. Where RPD rises or falls, and why (mix shift vs pricing)

### 1a. Aggregate decomposition (shift-share over each dimension's niches)

ΔRPD is split into **mix** = Σ(dl_share_cur − dl_share_prior)·RPD_prior_i and **within** = Σ dl_share_cur·(RPD_cur_i − RPD_prior_i). Inputs are the `niche_dynamics_<dim>.csv` columns rev_cur_usd, rev_prior_usd, dl_cur and dl_prior.

| Universe (dimension used) | RPD prior → cur | Δ | mix | within | Revenue prior → cur | Downloads prior → cur |
|---|---|---|---|---|---|---|
| Games (game_sub_genre, 103) | $1.115 → $1.217 | +9.1% | +0.027 | +0.074 | $57,676M → $56,281M (−2.4%) | 51.72B → 46.26B (−10.6%) |
| Games (game_product_model, 5) | same | +9.1% | +0.014 | +0.088 | same | same |
| Non-games (app_sub_category, 83) | $0.606 → $0.682 | +12.5% | +0.012 | +0.064 | $56,791M → $66,258M (+16.7%) | 93.67B → 97.14B (+3.7%) |
| All apps (unified_app_primary_category) | $0.769 → $0.826 | +7.3% | −0.017 | +0.073 | $114,881M → $123,139M (+7.2%) | 149.32B → 149.15B (−0.1%) |
| Device (iphone/android/ipad) | same | +7.3% | +0.001 | +0.056 | same | same |

Reading:
- **Games: RPD rose because downloads fell, not because players paid more.** Log split: ln(rev ratio) = −0.025 and −ln(dl ratio) = +0.112, so the download decline explains more than 100% of the +9.1% RPD gain. Most of the change is "within" (+0.074, against +0.027 of mix). Individual niches are harvesting smaller install flows.
- **Non-games: RPD rose because revenue rose** (+16.7% revenue on +3.7% downloads). This is real pricing and depth: subscriptions, AI, cloud storage (see 1d).
- Mix effects are small at every level, so the RPD story is about within-niche behaviour, not about downloads moving to pricier niches.

### 1b. Product model and class RPD (`niche_dynamics_game_product_model.csv`, `niche_dynamics_game_class.csv`, `niche_dynamics_device.csv`)

| Niche | Rev cur | Rev yoy | Dl cur | Dl yoy | RPD prior → cur | Driver |
|---|---|---|---|---|---|---|
| Mid-core | $29,102M | −7.8% | 5.38B | −7.1% | 5.45 → 5.41 (−0.8%) | volume decline, flat pricing |
| Casual | $23,207M | +0.9% | 13.59B | −12.4% | 1.48 → 1.71 (+15.1%) | download attrition (harvest) |
| Hybridcasual | $3,309M | +24.3% | 5.79B | −12.3% | 0.40 → 0.57 (+41.8%) | revenue up and downloads down: real depth gain |
| Hypercasual | $660M | +54.0% | 21.45B | −9.6% | 0.018 → 0.031 (+70.4%) | IAP layered onto ad games, tiny base per download |
| Exclusive Access | $2.4M | −53.9% | 0.05B | −46.7% | 0.060 → 0.052 | [small base]; not subscription evidence |
| Action & Strategy (class) | $27,552M | −7.7% | 7.84B | −11.3% | 3.38 → 3.51 | attrition |
| Lifestyle & Puzzle (class) | $21,913M | +6.3% | 33.98B | −10.4% | 0.54 → 0.64 (+18.7%) | revenue up and downloads down |
| Casino (class) | $4,505M | −10.4% | 1.03B | −3.1% | 4.74 → 4.39 (−7.5%) | real monetization decline |
| iPhone (device) | $74,471M | +5.5% | 32.87B | +0.7% | 2.16 → 2.27 (+4.7%) | pricing |
| Android (device) | $40,503M | +12.1% | 113.81B | −0.2% | 0.317 → 0.356 (+12.3%) | pricing / payment adoption |
| iPad (device) | $8,164M | +0.4% | 2.47B | −6.1% | 3.09 → 3.31 | attrition |

### 1c. Game sub-genres: RPD movers and their driver (`niche_dynamics_game_sub_genre.csv`; driver = whichever of |ln rev ratio| and |ln dl ratio| is larger)

Of the 79 sub-genres with prior revenue ≥ $50M, **53 raised RPD, but only 15 did so with growing revenue as the main driver** (combined $9,595M current revenue). The other 38 raised RPD because downloads fell faster than revenue. 26 sub-genres lowered RPD.

Rev-driven RPD risers (healthy depth gains): Match Merge 2, FPS/3PS, Realistic Sports, Tower Defense, Sort, Solitaire, Avatar Life, Sports Manager, Block, Survival, Action RPG, Eat & Grow, Platformer/Runner, Physics, Action Sandbox.

| Sub-genre | Rev prior → cur ($M) | Rev yoy | Dl yoy | RPD prior → cur | RPD Δ | Driver |
|---|---|---|---|---|---|---|
| Sort | 196.9 → 753.9 | +282.8% | +53.3% | 0.175 → 0.436 | +149.7% | rev |
| Screw | 172.4 → 229.0 | +32.8% | −39.8% | 0.401 → 0.883 | +120.5% | dl (installs collapsing) |
| Eat & Grow | 95.8 → 179.3 | +87.3% | −7.1% | 0.323 → 0.651 | +101.5% | rev |
| Match Merge 2 | 1,418.6 → 2,666.0 | +87.9% | +5.8% | 2.645 → 4.699 | +77.6% | rev |
| FPS / 3PS | 1,204.5 → 1,602.6 | +33.0% | −16.8% | 0.990 → 1.585 | +60.0% | rev (Delta Force, 无畏契约 entrants) |
| Physics | 69.7 → 107.2 | +53.8% | −0.5% | 0.141 → 0.219 | +54.6% | rev |
| Block | 135.4 → 213.5 | +57.7% | +7.1% | 0.175 → 0.258 | +47.3% | rev |
| Idle RPG | 1,343.0 → 1,401.7 | +4.4% | −26.8% | 5.72 → 8.16 | +42.7% | dl |
| Turn-Based Tactics | 355.3 → 312.4 | −12.1% | −38.7% | 20.84 → 29.89 | +43.4% | dl |
| Match Swap | 5,274.5 → 5,150.5 | −2.4% | −17.7% | 6.95 → 8.25 | +18.7% | dl (harvest) |
| MMORPG | 2,947.7 → 2,226.4 | −24.5% | −37.9% | 12.33 → 15.01 | +21.7% | dl (harvest) |
| Slots | 2,830.8 → 2,362.9 | −16.5% | +15.2% | 7.96 → 5.76 | −27.6% | rev (real decline) |
| Mahjong | 220.8 → 227.5 | +3.0% | +41.3% | 9.51 → 6.93 | −27.1% | dl (tile-match apps entering the tag) |
| Virtual Casino | 265.5 → 291.3 | +9.7% | +37.9% | 3.47 → 2.76 | −20.4% | dl |
| Match Chain | 129.4 → 123.5 | −4.6% | +21.0% | 2.98 → 2.35 | −21.1% | dl |
| Match Pair | 628.6 → 600.2 | −4.5% | +15.0% | 0.591 → 0.490 | −17.0% | dl (ad-monetized tile games) |
| Coin Looters | 2,724.1 → 2,503.4 | −8.1% | +3.6% | 19.59 → 17.37 | −11.3% | rev (pricing/engagement softness) |
| Open World Adventure | 726.9 → 1,019.9 | +40.3% | +55.8% | 10.52 → 9.47 | −9.9% | dl (launches) |

The same pattern appears in other tag dimensions: `game_theme` Cooking/Food $401.8M → $891.0M (+121.7%, RPD +154%, rev-driven), Hypercasual theme $581.8M → $1,017.3M (+74.9%, RPD +106%) and Drama $675.1M → $1,265.4M (+87.4%). `game_camera` First Person +29.2%. `game_genre` Puzzle $9,593M → $11,271M (+17.5%) with downloads −0.9% and RPD +18.5%, rev-driven. **Among the game genres, only Puzzle and the much smaller Sports ($2,084M, +9.1%, RPD +13.9%) raised RPD on revenue rather than on download decline.**

### 1d. Inside the niche: stayers' pricing vs entrant mix (`niche_top_apps.csv`, revenue-ordered top-100 for cur and prior)

For each niche's revenue top-100, ΔRPD = **within-stayers** (apps in both lists: change in their RPD × their download share) + **mix** (entrants/exits and share shifts). The "stayers dl yoy" column tells harvesting (stayer downloads falling) apart from genuine deepening (stayer revenue rising while downloads hold).

| Niche (top-100) | Top-100 rev prior → cur ($M) | RPD p → c | within | mix | Stayers rev yoy | Stayers dl yoy | Entrant share of rev | Entrant RPD |
|---|---|---|---|---|---|---|---|---|
| Sort | 194.1 → 738.9 | 0.31 → 0.87 | +0.19 | **+0.36** | +51.9% | −40.0% | 63% | 0.83 |
| Screw | 172.4 → 228.9 | 0.42 → 0.97 | +0.54 | +0.01 | +26.4% | −47.9% | 5% | 0.34 |
| Eat & Grow | 95.8 → 179.3 | 0.33 → 0.67 | +0.32 | +0.02 | **+81.1%** | −8.8% | 4% | 0.68 |
| Match Merge 2 | 1,411.3 → 2,649.6 | 5.81 → 7.58 | +1.89 | −0.13 | **+76.5%** | **+29.3%** | 7% | 2.15 |
| Physics | 69.5 → 106.5 | 0.30 → 0.44 | +0.08 | +0.06 | +28.8% | +0.9% | 17% | 0.20 |
| Action Sandbox | 55.6 → 104.0 | 0.09 → 0.19 | +0.09 | 0.00 | +81.2% | −9.9% | 4% | 0.04 |
| FPS / 3PS | 1,200.5 → 1,598.3 | 1.77 → 3.01 | +1.10 | +0.13 | +29.7% | −19.3% | 3% | 2.46 |
| Match Swap | 5,243.6 → 5,125.9 | 9.09 → 10.73 | +1.78 | −0.14 | −2.3% | −18.5% | 0% | 1.28 |
| Turn-Based Tactics | 355.3 → 312.4 | 22.5 → 34.5 | +12.77 | −0.85 | −13.0% | −45.6% | 1% | 3.25 |
| Idle RPG | 1,183.9 → 1,226.7 | 8.90 → 11.51 | +1.35 | +1.26 | −31.5% | −45.1% | 41% | 11.16 |
| Block | 134.9 → 212.8 | 0.74 → 0.43 | +0.16 | **−0.47** | +17.0% | −43.5% | 26% | 0.14 |
| Solitaire | 328.8 → 453.0 | 2.40 → 2.17 | +0.52 | −0.76 | +23.6% | −9.9% | 11% | 0.48 |
| Coin Looters | 2,724.1 → 2,503.4 | 19.66 → 17.48 | −2.15 | −0.03 | −8.1% | +3.2% | 0% | 0.15 |
| Music / Rhythm | 343.1 → 315.0 | 1.42 → 1.16 | −0.26 | 0.00 | −22.5% | −1.3% | 18% | 1.48 |
| **Apps:** AI Companion | 170.7 → 473.8 | 0.87 → 2.31 | +1.10 | +0.34 | +143.6% | −7.5% | 23% | 2.97 |
| AI Assistant | 2,193.8 → 5,365.1 | 1.23 → 2.11 | +1.06 | −0.17 | +144.7% | +20.8% | 1% | 0.14 |
| Cloud Storage | 2,779.0 → 3,988.4 | 5.56 → 8.60 | +3.09 | −0.06 | +43.5% | −8.2% | 0% | 0.20 |
| Video Editing | 1,169.3 → 1,604.1 | 1.01 → 1.43 | +0.40 | +0.02 | +35.6% | −3.7% | 3% | 0.90 |
| Short Drama | 1,840.9 → 2,241.4 | 1.57 → 1.38 | −0.02 | −0.16 | +17.3% | **+19.3%** | 7% | 0.60 |

Conclusions for (1):
1. **Games, mid-core and match-3 (Match Swap, MMORPG, Turn-Based Tactics, Idle RPG):** the RPD gains are harvest. Stayer revenue is flat to down while stayer downloads fall 18–46%. Prices did not rise; the funnel shrank.
2. **Real depth gains are concentrated in casual/hybrid puzzle.** In Match Merge 2, stayers grew both revenue and downloads (Gossip Harbor $502.5M → $1,107.2M, `leaders.csv` s_rev_*). Eat & Grow (All in Hole $59.9M → $98.0M) and Physics also show stayer revenue up on roughly flat installs.
3. **Sort is a mix story.** About 0.36 of its +0.56 RPD gain comes from new entrants monetizing at $0.83/dl, against a niche RPD of $0.31 a year earlier (Pixel Flow! $185.1M at RPD $5.50 vs Arrows Puzzle Escape 140.5M dl at $0.7M IAP).
4. **Block is the reverse.** New entrants (Block Out! etc.) earn only $0.14/dl, and the top-100 RPD fell 42% even though niche revenue grew 57.7%.
5. **Non-game apps raise prices for real.** AI Assistant, AI Companion, Cloud Storage and Video Editing stayers grew revenue 36–145% on flat or rising installs. Short Drama is the counter-case: downloads rise (+19.3% for stayers) while RPD falls (−12%), the signature of free/ad tiers (see 2).

## 2. Downloads up, revenue flat or down: ad-monetized or under-monetized demand

**IAP-only blind spot:** every niche below may be earning well through ads. The store data shows only that the extra downloads are not paying in-store. Where `ad_intensity_us_cur` (US ad-impression share / US revenue share) is high, the demand is almost certainly ad-monetized and/or a UA arms race. That ratio is a relative proxy and never measures dollars.

### 2a. Divergence screen (all `niche_dynamics_*`; dl_yoy ≥ +5% and rev_yoy ≤ +2%, or dl_yoy ≥ +10% and the gap ≥ 10pp; dl_cur ≥ 20M)

| Dim / niche | Rev prior → cur ($M) | Rev yoy | Dl prior → cur (M) | Dl yoy | RPD p → c | ts_yoy (US) | ad_int_US (rank) | Note |
|---|---|---|---|---|---|---|---|---|
| app_sub / Movies & TV Shows | 10,056.8 → 10,647.2 | +5.9% | 4,853 → 6,492 | +33.8% | 2.07 → 1.64 | −2.2% | 0.26 (37) | Free short-drama apps: FreeReels 283.2M dl and $0.2M IAP; Melolo 151.7M dl and $3.8M |
| game_genre / Party | 3,101.7 → 2,934.6 | −5.4% | 853 → 996 | +16.8% | 3.64 → 2.95 | – | – | social party/imposter downloads |
| game_sub / Slots | 2,830.8 → 2,362.9 | −16.5% | 356 → 410 | +15.2% | 7.96 → 5.76 | −17.4% | 0.37 (72) | real IAP decline; sweepstakes/web payments likely invisible |
| game_sub / Match Pair | 628.6 → 600.2 | −4.5% | 1,064 → 1,224 | +15.0% | 0.59 → 0.49 | +15.5% | 2.07 (25) | Vita Mahjong 149.5M dl / $1.8M; Tile Explorer 101.6M dl / $6.2M |
| game_sub / Social Party | 197.5 → 245.3 | +24.2% | 445 → 629 | +41.3% | 0.44 → 0.39 | +50.9% | 0.39 (71) | imposter games: Imposter Game–Spy Undercover 31.6M dl / $1.4M |
| game_sub / Open World Adventure | 726.9 → 1,019.9 | +40.3% | 69 → 108 | +55.8% | 10.5 → 9.5 | −2.5% | 1.01 (46) | launches; revenue still up |
| game_sub / Virtual Casino | 265.5 → 291.3 | +9.7% | 77 → 106 | +37.9% | 3.47 → 2.76 | +51.5% | 12.72 (3) | ad-heavy |
| game_sub / Mahjong | 220.8 → 227.5 | +3.0% | 23 → 33 | +41.3% | 9.51 → 6.93 | **+377.6%** | 5.71 (9) | **reclassification suspect**: tag count 443 → 638; Jade Mahjong / Mahjong Voyage tile-match apps entering |
| game_sub / Match Chain | 129.4 → 123.5 | −4.6% | 43 → 53 | +21.0% | 2.98 → 2.35 | −62.2% | 0.99 (47) | |
| app_sub / Sports Entertainment | 987.2 → 980.5 | −0.7% | 849 → 985 | +16.1% | 1.16 → 1.00 | +3.5% | 0.13 (41) | |
| app_sub / Budget & Expense Tracking | 113.2 → 136.3 | +20.5% | 185 → 243 | +31.3% | 0.61 → 0.56 | +4.7% | 5.11 (6) | |
| app_sub / Buy & Sell | 55.6 → 55.1 | −1.0% | 523 → 585 | +11.8% | 0.11 → 0.09 | +24.9% | 24.65 (5) | commerce: earns outside the store |
| game_theme / Bubbles-Tiles-Colors | 2,765.6 → 2,801.5 | +1.3% | 1,493 → 1,606 | +7.5% | 1.85 → 1.75 | – | – | |
| game_art_style / Flat | 729.2 → 741.9 | +1.7% | 3,385 → 3,608 | +6.6% | 0.215 → 0.206 | – | – | |
| app_sub / Financial Services [small base] | 21.4 → 22.0 | +2.8% | 335 → 455 | +35.5% | 0.064 → 0.048 | +44.9% | 31.39 (3) | non-IAP business |
| app_sub / Law & Government [small base] | 26.6 → 28.0 | +5.4% | 1,743 → 2,133 | +22.4% | – | +0.7% | 2.09 (12) | public services |

### 2b. Under-monetized download pools inside game niches (`niche_top_apps.csv`, current downloads-ordered top-100 vs current revenue-ordered top-10)

The share of a niche's top-100 downloads sitting in apps with RPD < $0.10 shows how much demand is effectively ad-only. The gap column = RPD of the top-10 earners / RPD of the top-20 download leaders.

| Sub-genre | Top-100-by-dl downloads (M) | Their IAP ($M) | % of dl in apps with RPD < $0.10 | RPD top-20 by dl | RPD top-10 by revenue | Gap ×  |
|---|---|---|---|---|---|---|
| Platformer / Runner | 2,114 | 42.1 | 94% | 0.025 | 0.19 | 8 |
| Simulator | 1,509 | 54.7 | 94% | 0.013 | 2.92 | 216 |
| Sort | 1,336 | 620.1 | 62% | 0.454 | 2.55 | 6 |
| Sandbox | 1,199 | 873.6 | 62% | 0.970 | 1.67 | 2 |
| Customization | 1,184 | 225.5 | 80% | 0.303 | 1.40 | 5 |
| Match Pair | 994 | 480.4 | 81% | 0.397 | 4.25 | 11 |
| Riddle | 959 | 17.6 | 97% | 0.004 | 0.17 | 41 |
| Idler | 892 | 181.7 | 72% | 0.118 | 2.14 | 18 |
| Mini-game Hub | 831 | 8.4 | 99% | 0.003 | 0.07 | 23 |
| Music / Rhythm | 795 | 135.7 | 93% | 0.033 | 1.89 | 57 |
| Block | 768 | 199.4 | 88% | 0.253 | 2.37 | 9 |
| Drawing & Coloring | 689 | 73.5 | 80% | 0.084 | 0.55 | 6 |
| Word | 463 | 187.6 | 65% | 0.404 | 2.38 | 6 |
| Physics | 440 | 101.1 | 74% | 0.305 | 0.89 | 3 |
| Solitaire | 299 | 387.9 | 53% | 1.818 | 3.58 | 2 |
| Jigsaw | 271 | 14.6 | 94% | 0.056 | 0.18 | 3 |
| Bubble Shooter | 264 | 55.7 | 80% | 0.092 | 1.55 | 17 |

Named extremes (from `leaders.csv`, s_rev_cur_usd / s_dl_cur):
- Block Blast!: 339.5M dl and $0.1M IAP.
- Arrows Puzzle Escape: 140.5M dl and $0.7M.
- Arrows GO!: 99.0M dl and ~$0.
- Brain Puzzle 2: 82.9M dl and ~$0.
- Stickman Party 234 MiniGames: 84.6M dl and $0.1M.
- Pizza Ready!: 166.5M dl and $1.7M.
- Vita Mahjong: 149.5M dl and $1.8M.

Same-niche IAP-deep peers:
- Pixel Flow!: $185.1M at $5.50/dl.
- Match Factory!: $213.7M at $12.79/dl.
- Color Block Jam: $99.0M at $3.98/dl.
- Disney Solitaire: $232.6M at $7.43/dl.

**The same mechanic family spans three orders of magnitude of RPD, depending on whether it carries an IAP economy.**

At the hyper-casual level (`niche_dynamics_game_product_model.csv`), Hypercasual holds 46.4% of game downloads (dl_share_cur) but 1.17% of game IAP (rev_share_cur). The ad business of the whole product model is outside this dataset.

### 2c. Engagement up, IAP not (`ts_yoy` minus `rev_yoy`, `niche_dynamics_game_sub_genre.csv`)

| Sub-genre | Rev yoy | Dl yoy | ts_yoy (US) | ts per user yoy | Gap (pp) |
|---|---|---|---|---|---|
| Mahjong (reclass suspect) | +3.0% | +41.3% | +377.6% | −8.3% | 375 |
| Turn-Based Tactics | −12.1% | −38.7% | +40.3% | +6.0% | 52 |
| Sandbox | −20.1% | −6.0% | +23.2% | +8.8% | 43 |
| Virtual Casino | +9.7% | +37.9% | +51.5% | −3.8% | 42 |
| MMORPG | −24.5% | −37.9% | +13.5% | +31.9% | 38 |
| Social Party | +24.2% | +41.3% | +50.9% | +2.9% | 27 |
| Match Pair | −4.5% | +15.0% | +15.5% | +5.9% | 20 |
| Avatar Life | +33.7% | −9.9% | +53.3% | +17.5% | 20 |

Sort leads all large game niches on usage growth (ts_yoy +97.3%, ts per user +34.1%), and its revenue is growing too, so it is no longer under-monetized.

## 3. Hybrid-casual vs hyper-casual vs mid-core trajectories (`niche_dynamics_game_product_model.csv`, `niche_monthly_game_product_model.csv`)

| Model | Rev prior → cur | Rev yoy | H2/H1 | last3m yoy | Share of game rev cur | Dl yoy | Share of game dl | RPD p → c |
|---|---|---|---|---|---|---|---|---|
| Mid-core | $31,571M → $29,102M | −7.8% | −10.5% | −14.4% | 51.7% | −7.1% | 11.6% | 5.45 → 5.41 |
| Casual | $23,009M → $23,207M | +0.9% | −3.0% | −2.3% | 41.2% | −12.4% | 29.4% | 1.48 → 1.71 |
| Hybridcasual | $2,661M → $3,309M | **+24.3%** | **+21.0%** | **+38.0%** | 5.9% | −12.3% | 12.5% | 0.40 → 0.57 |
| Hypercasual | $429M → $660M | +54.0% | +3.0% | +24.4% | 1.2% | −9.6% | 46.4% | 0.018 → 0.031 |

Quarterly IAP revenue (sum of monthly `rev_usd`, $M; quarters start 2024-10, 2025-01, …, 2026-07):
- Hybridcasual: 598, 669, 700, 694, 707, 790, 854, **957**. Steady and accelerating, with no step that would suggest a re-tag. The largest monthly jump (+20.2% in 2025-03) coincides with +12.8% for Casual in the same month, which is calendar (Feb→Mar), not reclassification.
- Hypercasual: 83, 91, 113, 142, 161, 164, 159, 176. The growth happened in 2025 and has **plateaued for four quarters** (H2/H1 +3.0%).
- Mid-core: 7,981, 7,864, 7,684, 8,042, 7,773, 7,584, 6,863, 6,882. A step down in 2026-Q2/Q3.
- Casual: 5,696 … 5,730. Flat while downloads fall.

Interpretation:
- **The IAP money is moving into hybrid-casual, and its RPD rises because of revenue, not attrition** (+24.3% revenue on −12.3% downloads). The product model cannot be joined to app-level tags in this data room (leaders.csv has no product-model column). The sub-genres that look hybrid-casual (Sort, Block, Screw, Eat & Grow, Physics) together grew $670.2M → $1,482.9M (+121.3%), and their downloads rose +14.8% (3,119M → 3,579M).
- **Hyper-casual IAP (remove-ads, light packs) is saturating.** +54% yoy, but flat for the last four quarters at an RPD of $0.03. Pure IAP-light hyper-casual is not where IAP growth is. Its ad revenue is invisible here.
- **Mid-core is in volume decline with flat pricing.** It is also the most concentrated and UA-expensive segment and fits a small team poorly. Exceptions are launch-driven: FPS/3PS entrants from China (Delta Force $560.9M +171%), and Open World Adventure entrants (Where Winds Meet, Arknights: Endfield).
- Within hybrid-casual-like puzzle, momentum differs (`niche_dynamics_game_sub_genre.csv` rev_h2_h1 / rev_last3m_yoy):
  - Sort +62.1% / +272.1%
  - Match Merge 2 +26.9% / +78.7%
  - Block +31.4% / +19.4%
  - Eat & Grow +29.3% / +48.4%
  - Physics +27.0% / +84.0%
  - Solitaire +17.8% / +18.3%
  - **Screw −13.3% / −18.2% (peaked)**
  - Match Pair −14.9% / −20.4% (declining)

## 4. iOS vs Android revenue mix and where to test

- **Worldwide (`niche_dynamics_device.csv`):**
  - iPhone $74,471M (60.5% of all IAP, +5.5%), iPad $8,164M (6.6%, +0.4%), Android $40,503M (32.9%, **+12.1%**).
  - Android holds 76.3% of downloads at RPD $0.356 (+12.3%), against $2.27 on iPhone. **Android revenue grows about twice as fast as iPhone revenue.** Mainland-China Android is excluded, so true Android is larger.
- **Leaders cohort (`leaders.csv`, s_ios_rev_share_cur weighted by s_rev_cur_usd, iOS = iPhone + iPad):**
  - games 63.4% iOS (2,008 apps, $51,081M) vs non-games 70.6%;
  - new-entrant games 65.0% vs incumbent games 63.1%.
- By sub-genre (iOS share of revenue):
  - Sort 66.4%, Screw 73.9%, Block 79.3%, Match Pair 67.0%, Word 76.0%, Social Party 75.9%, Interactive Story 79.7%
  - Eat & Grow 59.5%, Match Merge 2 59.8%, Solitaire 57.4%, 4X Strategy 58.4%, Coin Looters 47.2%
  - AI Companion 51.6%, Short Drama 63.2%
  - outliers: Sandbox 22.0%, Cloud Storage 10.8% (Google One); China-published apps 77.7% (Android China missing).
- **US ad impressions (`niche_dynamics_game_sub_genre.csv` imp_*_cur):**
  - Sort holds 14.3% of all US Android game ad impressions (+6.9pp) and 7.4% on iOS (+3.7pp). It is the #1 sub-genre on Android and #2 on iOS, with ad_intensity_us 3.99 (rank 10). **Sort is in a UA arms race.**
  - Match Merge 2: iOS 7.0% (+2.4pp).
  - Drawing & Coloring, Riddle, Jigsaw and Platformer/Runner buy Android impressions 2–6× their iOS share, a sign of ad-monetized Android funnels.
- **The US dominates the casual puzzle IAP pool** (`country_niche_dynamics.csv` game_sub_genre, US rev_cur / WW rev_cur):
  - Sort 61% ($463.5M)
  - Eat & Grow 65% ($117.2M)
  - Match Pair 65% ($391.2M)
  - Block 55%, Screw 53%
  - Solitaire 50%
  - Match Merge 2 35% (JP $231.5M, KR $187.0M, DE $169.9M matter more there).
- **Tier-1 English proxies have comparable RPD** (sub-genre rev_cur / dl_cur by country), so they work for cheap soft launches:
  - Sort: US 2.06, AU 1.91, GB 1.47, CA 1.14, NO 2.62
  - Screw: US 3.46, AU 4.06, GB 2.76, CA 2.32
  - Eat & Grow: US 3.95, AU 2.35, GB 2.31, CA 1.89
  - Emerging markets are 10–60× lower (Sort: BR 0.05, MX 0.07, TR 0.11).
- **Implication:**
  - Run creative, CTR and CPI tests on Android, where impressions are cheaper and RPD is ~1/6 of iOS.
  - Read revenue (IAP conversion, ARPPU, D7 RPD) on iOS in CA/AU/GB. iOS is ~60–80% of IAP in the target niches, and a revenue test run on Android alone will understate IAP by roughly 2×.
  - Android's faster growth (+12.1%) argues for keeping an Android IAP build from day one. Even so, Android in IAP-poor markets can only validate retention and ad ARPDAU (not observable here).

## 5. Hypotheses

Each item lists claim, evidence, market size, accessibility, prototype, a test of four weeks or less, risks and confidence.

### monetization-01: IAP depth on ad-only sort/arrow/block puzzles
- **Claim:** In the Sort/Block family, a casual puzzle that adds an IAP economy (lives, boosters, coin packs, a level map) on top of rewarded ads reaches ≥ $0.50 IAP RPD in US/CA/AU. Ad-only clones of the same mechanics earn < $0.01. Falsified if the soft-launch iOS IAP RPD by D14 stays < $0.10.
- **Evidence:**
  - Sort revenue $196.9M → $753.9M (+282.8%), RPD 0.175 → 0.436; entrants hold 63% of top-100 revenue at RPD $0.83 (niche_dynamics_game_sub_genre; niche_top_apps).
  - Pixel Flow! $185.1M at RPD $5.50 vs Arrows Puzzle Escape 140.5M dl / $0.7M (leaders.csv).
  - 62% of Sort and 88% of Block top-100 downloads sit in apps with RPD < $0.10 (niche_top_apps).
  - Block Blast! 339.5M dl / $0.1M IAP.
- **Market:** Sort $753.9M (+282.8%, H2/H1 +62.1%); Block $213.5M (+57.7%).
- **Accessibility:**
  - Sort: top1 25.0%, top10 64.2%, HHI 0.093; new entrants 76.3% of top-100 revenue. Entrants added $463.6M vs stayers $94.0M (niche_leaders_full_game_sub_genre).
  - Block: top1 46.5%, HHI 0.279, new entrants 52.4%.
  - High fit with the merge/puzzle skill set. But Sort is the #1 US Android ad-impression niche (14.3%, +6.9pp), so expect rising CPIs.
- **Prototype:** A sort or arrow-escape mechanic taken from the feed's existing micro-games, plus a 60-level map, lives, three boosters, a coin store and rewarded ads. Build time 3–4 weeks.
- **Revenue test:**
  - Week 1–2: three playable-ad variants on Android US, target CPI < $0.60 and IPM.
  - Week 3–4: iOS + Android soft launch in CA/AU at about $5k UA. Read the D7 IAP conversion rate (target ≥ 1.5%) and IAP RPD vs ad ARPDAU.
- **Risks:** UA arms race; clone saturation (6,921 Sort-tagged apps vs 4,043 a year earlier); Turkey-based studios (56.6% of top-5 revenue) iterate quickly.
- **Confidence:** 0.6

### monetization-02: "Physical" puzzle mechanics (hole, unravel, rope, yarn, physics) beat screw on depth and momentum
- **Claim:** The physical-puzzle segment that is still accelerating (Eat & Grow, Physics/unravel) monetizes through stayer deepening, not install volume. A new mechanic from this family can match Screw-level RPD (US ≈ $3.5) with better momentum. Screw itself is past peak. Falsified if a prototype's playable-ad CTR or IPM lands below a screw-jam control creative, or if Eat & Grow/Physics H2/H1 turns negative by the next refresh.
- **Evidence:**
  - Eat & Grow stayers grew revenue +81.1% on −8.8% downloads; All in Hole $59.9M → $98.0M at RPD $8.73.
  - Physics $69.7M → $107.2M, last3m +84.0%.
  - Screw H2/H1 −13.3%, last3m −18.2%, downloads −39.8%.
  - US RPD: Eat & Grow 3.95, Screw 3.46 (country_niche_dynamics).
- **Market:** Eat & Grow + Physics + Screw: $337.8M → $515.5M (+52.6%). Each prior base is ≥ $50M except Physics ($69.7M).
- **Accessibility:**
  - Eat & Grow: top1 54.7%, HHI 0.319, new entrants 33.2%.
  - Physics: top1 50.2% (Angry Birds 2), new entrants 33.4%.
  - Screw: top1 44.9%, new entrants 90.9%.
  - Ad intensity is moderate (Eat & Grow rank 48, Physics rank 19).
- **Prototype:** A tangle/unravel or "hole collects objects" level puzzle with a timer, boosters and a meta collection. Reuse the playable-ad pipeline.
- **Revenue test:** Run an A/B/C playable-ad CTR/IPM test (unravel vs hole vs screw control) on Android US/GB within 2 weeks. Then soft launch the winner in AU for 2 weeks with a D3/D7 IAP RPD read.
- **Risks:** Leader concentration; physics feel is hard to reach in weeks; the single-app effect (All in Hole is 54.7% of Eat & Grow).
- **Confidence:** 0.5

### monetization-03: A meta/IP layer turns classic ad-monetized formats into IAP businesses
- **Claim:** A progression/meta layer on classic formats (solitaire, tile-match/mahjong, jigsaw) raises RPD by more than 5× vs classic ad versions. Falsified if a meta-layer variant's soft-launch IAP RPD is < 2× the plain classic variant.
- **Evidence:**
  - Solitaire $330.0M → $454.7M (+37.8%), rev-driven; Disney Solitaire $68.3M → $232.6M at RPD $7.43.
  - Match Pair top-10 earners RPD 4.25 vs top-20 download leaders 0.397 (11× gap); 81% of downloads are in low-RPD apps.
  - Vita Mahjong 149.5M dl / $1.8M vs Match Factory! 16.7M dl / $213.7M.
  - Jigsaw Block Sort $6.6M as a new entrant.
- **Market:** Solitaire + Match Pair + Jigsaw: $971.8M → $1,073.4M (+10.5%), downloads +14.4%.
- **Accessibility:**
  - Solitaire: top1 51.3%, top3 81.7%, new entrants 61.9% (two hits).
  - Match Pair: top1 36.4%, HHI 0.161, new entrants 16.6%, and declining (−4.5%, H2/H1 −14.9%).
  - Jigsaw: [small base] $13.2M prior.
- **Prototype:** Tile-match or solitaire with a light story/decoration meta and limited-time events, built on an existing engine.
- **Revenue test:** Fake-door the meta (screens and store) in a 2-week soft launch in CA (iOS + Android). Compare IAP conversion between a plain classic build and a meta build.
- **Risks:** Licensed IP drove the biggest win (Disney); Match Pair is already declining; the meta-layer art cost is high.
- **Confidence:** 0.45

### monetization-04: A micro-game hub can earn IAP or subscription on top of ad-only "mini-games" demand
- **Claim:** The mini-game-hub and riddle download pools are effectively IAP-zero today. A curated feed with an ad-free / premium pass can convert ≥ 1% of D7 users. Falsified if a fake-door pass converts < 0.3% of D7 actives.
- **Evidence:**
  - Mini-game Hub: 831M top-100 downloads at RPD $0.003–0.010; 99% of downloads in apps with RPD < $0.10; IAP $11.2M (+17.5%).
  - Riddle: 959M dl, 97% low-RPD; IAP $23.0M (+96.3%).
  - Mini-game Hub ad_intensity_us 38.67 (US impressions 1.19% iOS / 0.41% Android vs US revenue share 0.02%).
  - Budge Kids Games (subscription) $2.8M and PlayJoy $2.7M (+71%) lead hub revenue.
- **Market:** Mini-game Hub + Riddle $34.3M (+60.9%) **[small base, both < $50M prior]**. The IAP pool is tiny; the ad pool is invisible in this data.
- **Accessibility:**
  - Mini-game Hub: top1 25.0%, HHI 0.148.
  - Riddle: top1 25.8%, new entrants 76.0%.
  - Very high fit with the micro-game feed.
- **Prototype:** Package the existing feed as an "offline mini-games" app. Add rewarded ads and a weekly pass (no ads + unlimited premium games + daily challenge).
- **Revenue test:** A store soft launch in CA/GB with a paywall fake door at session 3, or paid UA to a store listing. Measure pass tap-through and trial starts over 2–3 weeks.
- **Risks:** IAP ceilings are low, so ad revenue will dominate; hubs rely on low-intent kids/offline traffic; store discovery is noisy.
- **Confidence:** 0.35

### monetization-05: Daily-puzzle subscriptions work as a ritual bundle, not as "brain training"
- **Claim:** Subscription demand in puzzle products is shifting from self-improvement positioning (brain training) to daily-ritual bundles (NYT-style). A daily bundle landing page beats a brain-training landing page on trial-start rate. Falsified if the brain-training framing converts equally or better.
- **Evidence:**
  - NYT Games $52.4M → $66.6M (+27%), RPD $9.92, iOS 85% (leaders.csv).
  - Brain Training Apps top-100 $85.3M → $58.5M (−31.5%); Impulse −54%, Elevate −12% (niche_leaders_full_app_iq_category).
  - Word sub-genre −6.1% with downloads −19.6%.
- **Market:** Word $235.9M (−6.1%); Brain Training top-100 $58.5M (−31.5%).
- **Accessibility:** Word top1 30.4% (NYT Games), new entrants 7.7%. Brand-led; hard without IP.
- **Prototype:** A "daily 5" puzzle bundle from the feed's micro-games: streaks, archive, subscription.
- **Revenue test:** Paid social (Meta) to two landing-page variants (daily bundle vs brain training) with a fake-door subscription checkout, about $2k each over 2 weeks in the US. Compare CTR → trial-intent rate.
- **Risks:** NYT's success is brand and content driven; a subscription without a habit loop churns.
- **Confidence:** 0.35

### monetization-06: AI-driven narrative/companion subscriptions are taking spend from interactive-story games
- **Claim:** Spend is migrating from choice-story IAP games to AI companion/story apps with subscriptions. An AI-narrative micro-game with a subscription reaches ≥ $1.5 RPD on iOS. Falsified if a fake-door subscription converts < 1% of installs.
- **Evidence:**
  - Interactive Story $694.3M → $514.6M (−25.9%), single-app-heavy: Love and Deepspace $251.4M (−34%) is 50.1% of the top 100. Ex-LADS still about −16%.
  - Chapters −47%, Episode −23%.
  - AI Companion top-100 $170.7M → $473.8M (+177.6%); stayers revenue +143.6% on −7.5% downloads; Tipsy Chat $0.7M → $54.5M at RPD $9.98.
  - Overlap: キャラぷ AI chat appears in both tags.
- **Market:** AI Companion top-100 $473.8M (+177.6%); Generative AI app_sub_category $6,320M (+139.2%).
- **Accessibility:** AI Companion top1 11.5%, HHI 0.044, new entrants 49.3%, so very fragmented. Medium fit (LLM backend needed).
- **Prototype:** A story-driven chat game (characters + light puzzle gates) with gems and a weekly subscription.
- **Revenue test:** iOS soft launch in CA/AU, or TikTok UA to the store, with a paywall after the first story chapter. Read trial starts and D7 RPD over 3 weeks.
- **Risks:** Content moderation and store policy for companion apps; LLM cost per user; the category may be partly retagging from Interactive Story.
- **Confidence:** 0.45

### monetization-07: In feed formats, free + rewarded unlocks win downloads, and IAP must be hybrid
- **Claim:** In feed-native entertainment (short drama, micro-game feeds), ad-supported free tiers capture download growth while IAP RPD falls. A micro-game feed should combine rewarded-ad unlocks with coin packs rather than a hard paywall. Falsified if, in an A/B, the paywall-only arm beats hybrid on revenue per install including ads.
- **Evidence:**
  - Movies & TV Shows downloads +33.8% vs revenue +5.9%, RPD 2.07 → 1.64.
  - Short Drama top-100 revenue +21.8% but RPD 1.57 → 1.38; stayers' downloads +19.3%.
  - FreeReels 283.2M dl / $0.2M; Melolo 151.7M dl / $3.8M (iOS share 1%).
  - DramaBox $391.2M (+14%) still IAP-led.
- **Market:** Short Drama top-100 $2,241.4M (+21.8%); Movies & TV $10,647M (+5.9%).
- **Accessibility:** Short Drama top1 17.5%, HHI 0.092, new entrants 38.6%. Content-heavy; the analogy (not entry) is what matters for this team.
- **Prototype:** A feed of micro-games with a coin economy: free plays, rewarded ad for extra tries, coin packs to unlock series.
- **Revenue test:** A 2-arm A/B (hybrid vs paywall) in the existing feed prototype on a soft-launch cohort (CA/AU, ~5k installs per arm, 3 weeks). Compare IAP + ad revenue per install.
- **Risks:** Ad revenue is not observable in this data; the short-drama analogy may not transfer to games.
- **Confidence:** 0.4

### monetization-08: Test creatives and CPI on Android, read revenue on iOS tier-1 English
- **Claim:** For casual puzzle IAP, an Android soft-launch cohort will show < 50% of the iOS cohort's IAP RPD in the same country, so revenue go/no-go must be read on iOS. Android's faster revenue growth argues for shipping both. Falsified if Android RPD ≥ 70% of iOS in CA/AU.
- **Evidence:**
  - iPhone RPD $2.27 vs Android $0.356; Android revenue +12.1% vs iPhone +5.5% (niche_dynamics_device).
  - iOS share of revenue: Sort 66.4%, Block 79.3%, Screw 73.9%, Eat & Grow 59.5% (leaders.csv).
  - Sort RPD: US 2.06, AU 1.91, GB 1.47, CA 1.14, BR 0.05 (country_niche_dynamics).
  - Sort Android US impression share 14.3% vs iOS 7.4%.
- **Market:** Android IAP $40,503M (+12.1%); iPhone $74,471M (+5.5%).
- **Accessibility:** A test-design hypothesis, available to any team.
- **Prototype:** The same build on both OSes; Android-only creative pre-tests.
- **Revenue test:** Run the monetization-01 soft launch with an equal UA budget split by OS in CA/AU for 3 weeks, comparing IAP RPD D7/D14.
- **Risks:** Small cohorts give noisy RPD; iOS attribution (SKAN) delays reads.
- **Confidence:** 0.6

### monetization-09: Local-multiplayer party games (imposter/charades) monetize with one-off unlocks
- **Claim:** The imposter/party wave is download-led, but one-off pack unlocks earn ≥ $0.30/dl on iOS. A two-week party micro-game can validate this. Falsified if pack conversion stays < 1% after 2 weeks of soft launch.
- **Evidence:**
  - Social Party $197.5M → $245.3M (+24.2%), downloads +41.3%, ts_yoy +50.9%.
  - Imposter Game–Fakeit $0.1M → $8.6M at RPD $0.46 (18.6M dl) vs Imposter Game–Spy Undercover 31.6M dl / $1.4M.
  - iOS share of Social Party revenue 75.9%; ad_intensity_us 0.39 (rank 71, low UA pressure).
- **Market:** Social Party $245.3M (+24.2%).
- **Accessibility:** Top1 38.8% (WePlay), HHI 0.172, new entrants 11.1%, but the imposter sub-wave is all 2025 entrants. Very fast to build.
- **Prototype:** A pass-and-play imposter word game: free starter deck, themed packs, lifetime unlock.
- **Revenue test:** iOS + Android launch in the US/GB with ASO plus $1–2k TikTok creatives. Measure pack conversion and RPD within 2–3 weeks.
- **Risks:** A fad cycle (H2/H1 only +6.5%); the clone flood (tag count 2,562 → 4,941); low LTV.
- **Confidence:** 0.4

### monetization-10: Merge-story monetizes deepest, so a small team should test merge only as a narrow theme wedge
- **Claim:** Match Merge 2 shows the strongest genuine pricing gain in games (stayers revenue +76.5% with downloads +29.3%). A themed merge-lite (cooking/travel + story) playable can reach CTR parity with category leaders, but full-scale entry is UA-gated. Falsified if a merge-story playable's IPM is < 50% of a match-pair control.
- **Evidence:**
  - Match Merge 2 $1,418.6M → $2,666.0M (+87.9%), RPD 2.65 → 4.70, H2/H1 +26.9%, last3m +78.7%.
  - Gossip Harbor $1,107.2M (+120%).
  - game_theme Cooking/Food +121.7%; US RPD 14.38.
  - US iOS ad impressions 7.0% (+2.4pp).
- **Market:** Match Merge 2 $2,666.0M (+87.9%).
- **Accessibility:** Low. Top1 41.8%, top10 89.1%, HHI 0.208, new entrants 16.2%; China publishers 67.3%; ad_intensity rank 36 in a UA arms race. Fits the team's merge skills, but not its UA budget.
- **Prototype:** A merge-cooking playable with a 10-minute story slice, reusing merge playable assets.
- **Revenue test:** A playable-ad CTR/IPM test on Android US/JP/KR vs a control, plus a landing-page pre-registration fake door, over 2 weeks.
- **Risks:** LTV needs months of live-ops; competing against $100M+ UA budgets.
- **Confidence:** 0.3

## 6. Caveats

- Shift-share and stayer decompositions use 12-month aggregates. Stayer RPD rises naturally as titles age, so "within" in mid-core is labelled harvest only when stayer downloads fall.
- `niche_top_apps.csv` has no prior downloads-ordered list, so the download-pool analysis (2b) covers the current period only.
- Product-model trends cannot be attributed to individual apps (no product-model column in leaders.csv). Hybrid-casual statements are cross-checked with sub-genre proxies.
- Mahjong (tag count 443 → 638, ts +377.6%) and Short Drama (1,442 vs 938 tagged apps) are partly reclassification or tag growth. Sort's tag count also rose 4,043 → 6,921, but 76% of its top-100 revenue comes from named 2024–2025 releases, so its growth is genuine.
- Small bases (< $50M prior): Mini-game Hub, Riddle, Jigsaw, Numbers, Artillery Shooter ($16.3M → $52.7M, single-app: Castle Clashers! $34.5M = 65.4% of top 100), Action Sandbox ($55.7M base, OneState RP 62.4%).
- Ad revenue, web payments and China Android are absent throughout.

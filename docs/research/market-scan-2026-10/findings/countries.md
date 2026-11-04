# Local markets (COUNTRIES segment)

Data room: `/Users/gleb/Documents/Codex/2026-10-10/sensor-tower/analysis/out/`. Every number below is computed with `python3 -I` (stdlib csv) from the named file and column. Windows: current 12m = 2025-10..2026-09, prior 12m = 2024-10..2025-09; H2/H1 = 2026-04..09 vs 2025-10..2026-03; last3m = Jul-Sep 2026 vs Jul-Sep 2025.

**Measurement boundary.** Sensor Tower store estimates cover App Store and Google Play in-app purchases and paid downloads only. Ad revenue, web/D2C payments, third-party Android stores (so most of mainland China Android), and PC/console/web are not included. Ad-monetized puzzle genres (Sort, Block, Arrow puzzles, Riddle, Jigsaw) are therefore undervalued in revenue, and downloads are the better demand proxy for them. Revenue is converted to USD, so local-currency moves (ARS, BRL, MXN, TRY, COP) affect USD yoy and are mixed in with real growth. Taxonomy tags (Game IQ / App IQ) can be re-assigned over time. I checked the claims below against the top apps in `country_leaders.csv` and flag them where growth comes from one app or from a re-tag.

**Data caveats found.**
- **Russia.** `country_dynamics.csv` RU has `rev_h2_h1` = -1 and `rev_last3m_yoy` = -1, so H2 revenue is zero. Its -41% yoy ($348.4M -> $207.1M) is a store or estimation cut-off, not a demand signal. RU is excluded from conclusions.
- **Laos.** LA is missing 2024-10..12 (`flags`), so its yoy is blank.
- **Taiwan.** TW has local niche data but no `country_leaders` rows, so it has no publisher or new-entrant analysis.
- **Pakistan.** PK local niches are tiny: the whole games dim is $14.1M. Outperformers there use a $0.3M/$1M floor and are marked TINY.
- **Publisher country.** `publisher_country` is Sensor Tower's HQ attribution and can mislead. Examples: MapleStory Idle (메이플 키우기, Nexon) counts as Japan, so it is "foreign" in KR. Playrix (Township, Gardenscapes) counts as Ireland. Belote.com and Tarot Classique count as Germany in France.
- **Baselines.** The WW baselines are `niche_dynamics_game_sub_genre.csv` and `niche_dynamics_app_sub_category.csv`. WW games are -2.4% yoy ($57.68B -> $56.28B) and WW non-game apps +16.7% ($56.79B -> $66.26B) (`summary.json` totals_ww).
- **Sum of countries.** The sum over 112 countries is $123.14B, +7.2% yoy, with downloads flat (-0.05%) and RPD $0.83 (`country_dynamics.csv`, summed).

---

## 1. Country growth map

### 1.1 What drives country growth

Downloads are flat or falling almost everywhere. Revenue growth comes from revenue per download (RPD, `rpd_cur_usd` vs `rpd_prior_usd`), and much of it is non-game:

- **AI assistants.** In the 28 countries with local data, the Generative AI sub-category explains 11-48% of the revenue delta in the growing countries. In US and JP it exceeds 100% of the delta (378% and 219%) and in KR it is 65%, offsetting game declines. Examples: SA 48%, AE 48%, BR 39%, CA 37%, FR 30% (`country_niche_dynamics.csv`, app_sub_category, Generative AI, `rev_cur_usd - rev_prior_usd` divided by the country delta).
- **Google One.** The Utilities sub-category spikes are almost entirely Google One, which is single-app and likely an AI-bundle effect. `country_leaders.csv` shows Google One at JP $99.9M -> $348.3M, KR $26.6M -> $251.8M, DE $94.9M -> $264.6M and TH $28.2M -> $109.3M. In TH, Utilities is 47% of the delta. "Utilities is growing faster than WW" is therefore not a niche signal.

**Games-only growth by country** (sum of `country_niche_dynamics.csv` game_sub_genre; WW games = -2.4%):

| Country | Games rev cur $M | Games yoy | Games $ delta $M | Game dl yoy | Games RPD $ | Country total yoy | Apps yoy |
|---|---|---|---|---|---|---|---|
| HU | 92 | +31.3% | +22 | -14% | 1.11 | +37% | +41% |
| CO | 62 | +28.4% | +14 | -6% | 0.10 | +44% | +49% |
| ZA | 120 | +26.6% | +25 | +10% | 0.23 | +39% | +47% |
| NO | 185 | +22.1% | +34 | -7% | 6.09 | +27% | +30% |
| AR | 70 | +19.7% | +12 | -15% | 0.11 | +40% | +49% |
| TR | 524 | +17.0% | +76 | -13% | 0.36 | +24% | +30% |
| IE | 90 | +13.8% | +11 | -14% | 2.71 | +27% | +33% |
| BR | 478 | +11.3% | +48 | -13% | 0.16 | +18% | +21% |
| IN | 298 | +11.1% | +30 | -8% | 0.04 | +31% | +44% |
| MX | 550 | +9.7% | +48 | -15% | 0.31 | +29% | +42% |
| GB | 1,932 | +7.9% | +142 | -10% | 3.19 | +16% | +21% |
| AU | 1,072 | +6.7% | +67 | -12% | 5.18 | +17% | +25% |
| FR | 1,155 | +5.3% | +58 | -9% | 1.83 | +18% | +28% |
| DE | 2,153 | +5.2% | +107 | -17% | 3.50 | +15% | +25% |
| TH | 538 | +4.9% | +25 | -19% | 0.86 | +18% | +31% |
| SA | 332 | +4.5% | +14 | -14% | 0.62 | +15% | +21% |
| CA | 1,181 | +0.6% | +7 | -13% | 3.81 | +10% | +18% |
| ID | 309 | +0.5% | +2 | -10% | 0.11 | +0% | -0% |
| TW | 1,758 | -0.4% | -7 | -13% | 9.36 | +7% | +30% |
| CN | 8,801 | -2.1% | -185 | -14% | 12.62 | +5% | +14% |
| PK | 14 | -2.6% | -0 | -7% | 0.01 | +12% | +19% |
| AE | 202 | -3.3% | -7 | -2% | 1.62 | +10% | +18% |
| KR | 3,473 | -5.7% | -210 | -12% | 8.75 | +7% | +42% |
| US | 17,043 | -7.0% | -1,282 | -8% | 4.91 | +1% | +7% |
| JP | 7,003 | -9.3% | -717 | -4% | 11.66 | +1% | +21% |
| PH | 229 | -10.7% | -27 | -14% | 0.19 | -2% | +5% |
| VN | 163 | -18.0% | -36 | -16% | 0.14 | -4% | +14% |
| RU | 111 | -38.5% | -69 | -13% | 0.06 | -41% | -43% (data cut-off) |

Reading: **the three largest game markets (US, JP, KR) shrank by a combined -$2.2B. Every Western-European, Nordic, LatAm, Turkish and South African game market grew.** The fastest game growth sits in mid-size and small markets (HU, CO, ZA, NO, AR, TR). There, revenue rises while game downloads fall, so it comes from payer conversion and price, and partly from FX.

### 1.2 Fast-growing mid-size markets ($100M-$2B total revenue, `country_dynamics.csv`)

| Country | Rev prior -> cur $M | yoy | +$M | H2/H1 | last3m yoy | Downloads M (yoy) | RPD $ (yoy) | Local niche data |
|---|---|---|---|---|---|---|---|---|
| CO Colombia | 185 -> 267 | +44% | +82 | +24% | +59% | 2,038 (+3%) | 0.13 (+39%) | yes |
| AR Argentina | 202 -> 284 | +41% | +82 | +20% | +25% | 1,716 (-2%) | 0.17 (+44%) | yes (FX caveat) |
| ZA South Africa | 260 -> 364 | +40% | +104 | +11% | +33% | 1,607 (+12%) | 0.23 (+24%) | yes |
| HU Hungary | 161 -> 220 | +37% | +59 | +16% | +38% | 253 (-3%) | 0.87 (+42%) | yes |
| IN India | 688 -> 905 | +32% | +217 | +17% | +32% | 26,056 (+4%) | 0.03 (+27%) | yes |
| MX Mexico | 1,259 -> 1,628 | +29% | +369 | +7% | +23% | 5,003 (-3%) | 0.33 (+34%) | yes |
| NO Norway | 397 -> 504 | +27% | +107 | +17% | +25% | 146 (-2%) | 3.45 (+29%) | yes |
| IE Ireland | 247 -> 313 | +27% | +66 | +3% | +14% | 150 (-1%) | 2.09 (+29%) | yes |
| DK Denmark | 365 -> 456 | +25% | +90 | +1% | +9% | 148 (-11%) | 3.07 (+40%) | no |
| TR Turkey | 900 -> 1,118 | +24% | +219 | +7% | +18% | 3,573 (-5%) | 0.31 (+31%) | yes (FX caveat) |
| IL Israel | 503 -> 624 | +24% | +121 | +9% | +19% | 339 (-2%) | 1.84 (+26%) | no |
| PL Poland | 670 -> 829 | +24% | +159 | +3% | +17% | 976 (-3%) | 0.85 (+28%) | no |
| BE Belgium | 426 -> 524 | +23% | +98 | +7% | +16% | 336 (-2%) | 1.56 (+25%) | no |
| UA Ukraine | 422 -> 519 | +23% | +97 | -1% | +16% | 870 (-6%) | 0.60 (+31%) | no |
| MY Malaysia | 564 -> 683 | +21% | +119 | +2% | +13% | 1,317 (+0%) | 0.52 (+20%) | no |
| NL Netherlands | 828 -> 997 | +20% | +169 | +7% | +12% | 607 (+4%) | 1.64 (+16%) | no |
| BR Brazil | 1,638 -> 1,946 | +19% | +308 | +8% | +18% | 9,378 (-2%) | 0.21 (+21%) | yes |
| TH Thailand | 1,006 -> 1,188 | +18% | +182 | +11% | +20% | 2,052 (-3%) | 0.58 (+21%) | yes |
| IT Italy | 1,255 -> 1,479 | +18% | +224 | +1% | +12% | 1,511 (-0%) | 0.98 (+18%) | no |
| SA Saudi Arabia | 897 -> 1,039 | +16% | +142 | +7% | +8% | 1,974 (-0%) | 0.53 (+16%) | yes |
| AE UAE | 579 -> 641 | +11% | +62 | +3% | +3% | 630 (+7%) | 1.02 (+4%) | yes |
| ID Indonesia | 736 -> 739 | +0% | +3 | +1% | +7% | 8,146 (+2%) | 0.09 (-2%) | yes |
| PH Philippines | 536 -> 525 | -2% | -11 | +2% | +4% | 3,592 (+3%) | 0.15 (-5%) | yes |
| VN Vietnam | 355 -> 344 | -3% | -11 | +10% | +1% | 2,776 (-4%) | 0.12 (+1%) | yes |

**Large markets (> $2B):**

| Market | Revenue $M (yoy) | +$M |
|---|---|---|
| US | 40,962 (+1.0%) | +407 |
| CN | 16,302 (+4.5%) | +707 |
| JP | 11,831 (+1.1%) | +127 |
| KR | 5,281 (+6.8%) | +334 |
| GB | 4,959 (+15.6%) | +669 |
| DE | 4,876 (+15.4%) | +649 |
| FR | 3,100 (+18.2%) | +478 |
| CA | 2,772 (+10.2%) | +256 |
| AU | 2,662 (+16.8%) | +382 |
| TW | 2,487 (+7.3%) | +170 |

GB, DE and FR together added more dollars (+$1.80B) than the US, CN and JP combined (+$1.24B).

**Small but fast ($20-100M, yoy >= +25%, no local niche data):**

| Market | Revenue $M | yoy | last3m yoy |
|---|---|---|---|
| Morocco | 48 | +55% | +69% |
| Iraq | 85 | +45% | +47% |
| Jordan | 67 | +35% | +77% |
| Sri Lanka | 25 | +33% | n/a |
| Paraguay | 33 | +32% | n/a |
| Serbia | 45 | +29% | n/a |
| Egypt | 93 | +28% | n/a |
| Uzbekistan | 26 | +27% | n/a |
| Georgia | 26 | +26% | n/a |
| Lithuania | 61 | +25% | n/a |

These are too small to target alone, but MENA (MA, IQ, JO, EG) is an add-on to a Gulf/Arabic localization.

**Mid-size markets that fit a small team.** Each is growing fast, has a mid-size base, and has almost no local publishers (`local_publisher_share_top300_rev`):

| Market | Total revenue | Games | Local publisher share of top-300 |
|---|---|---|---|
| MX | $1.63B (+29%) | +9.7% | 0.8% |
| TR | $1.12B (+24%) | +17% | 7.2% (but Turkey is the global hub of casual puzzle publishers) |
| NO | $504M (+27%) | +22% | 3.2% |
| ZA | $364M (+40%) | +27% | 1.1% |
| HU | $220M (+37%) | +31% | 0.8% |
| CO | $267M (+44%) | +28% | 0.9% |
| AR | $284M (+41%) | +20% | 0.2% (FX) |

PL, NL, BE, IL and DK grow at +20-25% but have no local niche extraction here.

---

## 2. Local vs WW niche performance (28 countries, summary)

### 2.1 Method

1. **Outperformance.** For each country x niche in `country_niche_dynamics.csv`, the gap = local `rev_yoy` minus WW `rev_yoy` (same niche, `niche_dynamics_*.csv`). The size filter is local `rev_prior_usd` >= $2M and `rev_cur_usd` >= $5M (TINY fallback $0.3M/$1M), with local yoy > 0. Niches are ranked by **excess dollars** = local prior x (local yoy - WW yoy), which is how much more the niche added locally than it would have at the WW rate. WW niches with `rev_prior_usd` < $50M are flagged.
2. **Under-penetration.** The penetration index (PI) = the niche's share of the country's dim revenue divided by its share in a baseline. The baseline is WW minus the country itself, and for game sub-genres also minus China. China's iOS-heavy, mid-core mix ($8.8B of $56.3B games) otherwise makes every Western casual niche look "under-penetrated" in Asia and vice versa. A download PI is computed the same way on `dl_cur`.
   - Only WW-growing niches count (WW yoy >= +10%, baseline revenue >= $100M).
   - Commerce and service app niches (Shopping, Transportation, Tax, Wallets, etc.) are excluded because they earn almost nothing in-store.
   - Rev PI << dl PI means players install but do not pay in-store. That is either an IAP monetization gap or an ad-monetized genre.

### 2.2 Cross-country patterns

**1. Match Merge 2 grows faster than WW (+88%, $1,418.6M -> $2,666.0M) in nearly every country.** Local yoy and H2/H1 momentum (`country_niche_dynamics.csv`):

| Country | Revenue $M (prior -> cur) | yoy | H2/H1 |
|---|---|---|---|
| DE | 76.7 -> 169.9 | +122% | +25% |
| FR | 44.9 -> 94.7 | +111% | +27% |
| MX | 11.6 -> 28.3 | +143% | +40% |
| HU | 3.1 -> 8.3 | +166% | +58% |
| IN | 3.6 -> 9.6 | +169% | n/a |
| ZA | 6.0 -> 14.0 | +133% | n/a |
| TH | 11.1 -> 25.7 | +131% | n/a |
| NO | 9.3 -> 19.9 | +114% | n/a |

Concentration:
- **Within countries:** local publishers hold 0% of the niche's top-300 revenue everywhere except IE (3%). China-HQ publishers hold 60-90% of it (`country_leaders.csv`).
- **WW:**
  - **Gossip Harbor** (Microfun) is 41.7% of the WW top-100 (`niche_leaders_full_game_sub_genre.csv` `top1_share_of_top100`).
  - **New entrants** are 16.1% of the top-100. The largest are Flambé $135.7M, Mystery Town $87.3M and Hollywood Merge $44.7M.
  - **Growth split:** 87% of the niche's growth comes from apps in the top-100 in both periods, and 14% from entrants.

The growth is real but incumbent-led.

**2. Sort is a US-led wave that other markets join with a lag, mostly through downloads.**

WW Sort grew $196.9M -> $753.9M (+283%); WW `dl_yoy` +53%; `ad_intensity_us_rank` 10 (very ad-heavy).

| Market | Sort revenue $M (yoy) | Rev PI (ex-country, ex-CN) |
|---|---|---|
| US | 463.5 (+269%) | 2.85 |
| GB | 55.7 (+324%) | n/a |
| DE | 35.0 (+359%) | n/a |
| FR | 12.8 (+372%) | n/a |

Outside the West, Sort is installed far more than it is paid for:

| Market | Sort revenue $M (yoy) | Rev PI | Download PI | Downloads (yoy) |
|---|---|---|---|---|
| JP | 18.9 (+206%) | 0.15 | 2.15 | 48.1M (+75%) |
| KR | 9.5 (+321%) | 0.16 | 1.66 | n/a |
| TW | 2.5 | 0.09 | 1.28 | n/a |
| MX | 4.5 | 0.51 | 0.93 | n/a |
| BR | 5.0 | 0.66 | 0.82 | n/a |
| IN | 1.4 | 0.29 | 1.01 | 282M (+65%) |
| ID | 1.3 | 0.26 | 0.64 | n/a |

- **No Sort app reaches JP's top-300 revenue cutoff ($5.4M).** JP's largest Sort apps by downloads are foreign: Arrows Puzzle Escape (DE), Wool Crush (SG), Water Match (HK) and Magic Sort! (TR, $1.5M).
- **WW structure:** new entrants are 76.3% of the Sort top-100; top-1 Pixel Flow! has 25.0%; HHI 0.092; publisher mix Turkey 56.6%, France 10.3%, Vietnam 6.6%.

**3. Solitaire is IP- and single-app-driven.**

- **WW:** +38% ($330.0M -> $454.7M). Disney Solitaire is 51.3% of the top-100 and the top-3 hold 81.7%.
- **Single app in Asia:**

  | Market | Solitaire revenue $M | yoy | Disney Solitaire $M | Disney share |
  |---|---|---|---|---|
  | JP | 36.1 | +178% | 33.6 | 93% |
  | KR | 9.3 | +276% | 7.7 | 83% |

  JP Solitaire downloads fell -10%.
- **Europe:** GB +94% ($17.5M -> $33.9M), FR +101% ($6.6M -> $13.2M) and DE +40% ($21.5M -> $30.2M). In GB, Disney Solitaire is $20.9M of $33.9M.
- **New-entrant share is 61.9% WW.** Disney Solitaire (2024-11) and Solitaire Associations Journey (2025-08, $43.8M WW, 17.8M US downloads) show that hybrids enter quickly.

**4. Tower Defense is the most open growing mid-core niche, and the growth is in East Asia.**

| Market | TD revenue $M (prior -> cur) | yoy | Rev PI |
|---|---|---|---|
| KR | 84.6 -> 122.5 | +45% | 3.26 |
| TW | 41.3 -> 58.8 | +43% | 2.83 |
| JP | 77.3 -> 105.4 | +36% | n/a |
| WW | 723.0 -> 850.9 | +18% | n/a |

- **WW structure:** new entrants are 41.0% of the top-100, HHI is 0.064 and top-1 has 17.4%.
- **KR is local-led:** 75% of the niche's top-300 revenue is local (Lucky Defense $49.1M, 협타디 $16.9M).
- **JP is China/SG-led:** Arknights (明日方舟) $43.9M and セルサバイバー $18.4M.

**5. Classic national card and table games are local over-indexers with modest growth but fragmented incumbents.** Tabletop Cards rev PI and local yoy:

| Market | Rev PI | Revenue $M | yoy |
|---|---|---|---|
| FR | 4.98 | 26.4 | +15% |
| DE | 2.26 | 23.1 | +11% |
| SA | 8.85 | 14.0 | +10% |
| AE | 5.83 | 5.8 | -1% |

- **WW:** +3%, HHI 0.066, top-10 hold 68.6%.
- **TR Okey** is $37.1M -> $45.3M (+22%), almost entirely a Turkish market. New-entrant share in WW Okey is only 0.7%.

**6. Single-app or re-tag growth that should not be read as niche demand:**

| Country / niche | Growth | Driver | Note |
|---|---|---|---|
| ID Virtual Casino | $13.6M -> $37.0M, +173% | Higgs Games Island $36.4M | social-casino |
| TH Avatar Life | $2.5M -> $10.9M, +327% | Heartopia $9.0M | |
| KR Idle RPG | $222.7M -> $376.1M, +69% | MapleStory Idle $194.1M | H2/H1 -33% |
| MX Real-Time Strategy | +188% | Clash Royale $6.7M -> $21.7M | H2/H1 -63% (an event spike) |
| BR Real-Time Strategy | +82% | Clash Royale | H2/H1 -62% |
| CN Tycoon/Crafting | +146% | My Garden Tale $88.1M | |
| CN FPS | +96% | Delta Force $537.3M + 无畏契约 $245.4M | |
| GB Shopping | +176% | Amazon Shopping $15.8M -> $45.4M | |
| CN Digital Wallets | $4.3M -> $105.1M | Alipay entering the list | WW prior only $7.7M (< $50M flag) |
| WW Mahjong | downloads +41% | new zero-revenue tile-match apps tagged Mahjong: Jade Mahjong 7.2M dl, $0; Mahjong Voyage 3.8M dl; Mahjong Cash 1.8M dl (`niche_top_apps.csv`) | partly a tagging artifact |
| Utilities (JP/KR/DE/TH/MX/ZA) | | Google One | see 1.1 |

### 2.3 Casual-puzzle penetration matrix

Local revenue $M, local yoy, then rev PI / dl PI, from `country_niche_dynamics.csv`. PI uses the WW ex-CN baseline, including the country itself in the baseline; section 3 uses the stricter ex-country baseline, so its values differ slightly.

| Country | Sort | Match Merge 2 | Solitaire | Eat & Grow | Block | Screw |
|---|---|---|---|---|---|---|
| US | 463.5, +269%, 1.71/1.72 | 920.0, +72%, 0.97/1.49 | 226.6, +14%, 1.39/4.25 | 117.2, +77%, 1.82/1.42 | 117.4, +50%, 1.54/1.38 | 122.1, +29%, 1.49/1.80 |
| GB | 55.7, +324%, 1.82/1.65 | 137.7, +61%, 1.28/1.87 | 33.9, +94%, 1.83/3.34 | 12.6, +95%, 1.73/1.50 | 17.5, +68%, 2.02/1.43 | 17.7, +35%, 1.90/1.88 |
| DE | 35.0, +359%, 1.03/1.75 | 169.9, +122%, 1.42/2.07 | 30.2, +40%, 1.46/2.88 | 7.1, +79%, 0.88/1.38 | 7.9, +54%, 0.82/1.31 | 10.8, +36%, 1.04/2.01 |
| FR | 12.8, +372%, 0.70/1.59 | 94.7, +111%, 1.48/1.97 | 13.2, +101%, 1.19/2.61 | 3.3, +89%, 0.76/1.26 | 4.0, +66%, 0.77/1.49 | 4.8, +60%, 0.86/1.90 |
| JP | 18.9, +206%, 0.17/2.12 | 231.5, +96%, 0.60/2.67 | 36.1, +178%, 0.54/2.22 | 6.1, +86%, 0.23/1.14 | 7.6, +26%, 0.24/1.94 | 10.2, +26%, 0.30/3.35 |
| KR | 9.5, +321%, 0.17/1.65 | 187.0, +93%, 0.97/2.96 | 9.3, +276%, 0.28/1.08 | 1.7, +172%, 0.13/0.94 | 2.8, +58%, 0.18/1.94 | 4.7, +38%, 0.28/2.30 |
| BR | 5.0, +334%, 0.66/0.83 | 41.1, +87%, 1.55/0.88 | 2.5, +100%, 0.54/0.77 | 1.0, +187%, 0.57/0.90 | 1.9, +95%, 0.88/1.27 | 2.1, +51%, 0.93/1.11 |
| MX | 4.5, +299%, 0.52/0.93 | 28.3, +143%, 0.93/0.79 | 2.0, +121%, 0.38/0.75 | 0.9, +179%, 0.45/1.09 | 2.6, +86%, 1.05/0.92 | 2.0, +74%, 0.74/1.24 |
| TR | 3.9, +511%, 0.47/0.62 | 32.5, +68%, 1.12/0.97 | 1.4, +41%, 0.29/0.39 | 1.2, +380%, 0.62/1.12 | 2.0, +147%, 0.87/1.23 | 1.7, +125%, 0.69/0.91 |
| IN | 1.4, +271%, 0.29/1.00 | 9.6, +169%, 0.58/0.52 | 0.5, +13%, 0.19/0.20 | 0.3, +174%, 0.25/0.84 | 0.8, +726%, 0.63/0.46 | 0.4, +19%, 0.25/0.56 |
| NO | 5.6, +353%, 1.90/1.86 | 19.9, +114%, 1.93/1.93 | 2.0, +33%, 1.14/2.74 | 0.7, +172%, 1.07/1.35 | 1.8, +77%, 2.12/1.73 | 2.0, +40%, 2.23/1.73 |
| SA | 3.0, +281%, 0.57/0.89 | 11.4, +82%, 0.62/0.76 | 0.5, +61%, 0.17/0.28 | 0.6, +263%, 0.45/1.07 | 1.7, +145%, 1.15/0.80 | 0.6, -13%, 0.39/0.74 |

WW reference:

| Niche | WW $M (yoy) | WW top-100 new-entrant share | HHI | `ad_intensity_us_rank` |
|---|---|---|---|---|
| Sort | 753.9 (+283%) | 76% | 0.092 | 10 |
| Match Merge 2 | 2,666.0 (+88%) | 16% | 0.208 | 36 |
| Solitaire | 454.7 (+38%) | 62% | 0.321 | 29 |
| Eat & Grow | 179.3 (+87%) | 33% | 0.318 | 48 |
| Block | 213.5 (+58%) | 52% | 0.278 | 17 |
| Screw | 229.0 (+33%) | 91% | 0.227 | 27 |

Screw WW downloads are -40% and H2/H1 -13%, so that wave is rolling over.

---

## 3. Local vs foreign publishers

### 3.1 Local-publisher share of top-300 revenue

`country_leader_summary.csv` `local_publisher_share_top300_rev`; games share recomputed from `country_leaders.csv` (current revenue list, `publisher_country` mapped to the country).

| Country | Top-300 $M | Coverage of country | Local share (all) | Local share (games) | Top games publisher countries |
|---|---|---|---|---|---|
| CN | 14,686 | 90% | 94.2% | 91.5% | China 92% |
| US | 28,690 | 70% | 57.7% | 26.1% | US 26%, China 16%, Turkey 13%, Singapore 10% |
| JP | 9,664 | 82% | 52.1% | 51.3% | Japan 51%, China 27% |
| KR | 4,392 | 83% | 36.9% | 35.0% | Korea 35%, China 30%, Japan 12% |
| RU | 168 | 81% | 14.0% | 6.7% | China 30% (data cut-off) |
| VN | 249 | 73% | 12.7% | 14.3% | China 32%, Singapore 24%, Vietnam 14% |
| FR | 2,435 | 79% | 11.5% | 1.1% | China 21%, Israel 15%, US 15% |
| DE | 3,673 | 75% | 9.2% | 3.6% | China 19%, Israel 14%, US 11% |
| IN | 737 | 81% | 7.8% | 3.2% | Singapore 36%, Korea 13% |
| GB | 3,582 | 72% | 7.5% | 7.6% | US 19%, Israel 16%, China 15%, Turkey 12% |
| BR | 1,512 | 78% | 7.4% | 1.0% | China 20%, US 12%, Finland 11% |
| TR | 826 | 74% | 7.2% | 7.2% | China 32%, US 10%, Singapore 10% |
| AE | 512 | 80% | 7.3% | 5.5% | China 33%, Singapore 18% |
| CA | 1,916 | 69% | 5.1% | 0.0% | US 24%, China 20% |
| AU | 1,889 | 71% | 4.8% | 0.0% | US 30%, China 19% |
| TH | 982 | 83% | 4.6% | 0.6% | China 23%, Japan 20% |
| ID | 575 | 78% | 4.4% | 0.0% | China 43% |
| IE | 231 | 74% | 3.9% | 8.2% (Playrix) | China 20%, US 19% |
| SA | 877 | 84% | 3.8% | 2.4% | China 34%, Singapore 20% |
| NO | 369 | 73% | 3.2% | 0.3% | China 21%, US 13% |
| PH | 411 | 78% | 1.4% | 0.0% | China 43%, US 22% |
| ZA | 237 | 65% | 1.1% | 0.0% | China 23%, US 22% |
| CO | 190 | 71% | 0.9% | 0.0% | China 19%, US 18% |
| MX | 1,336 | 82% | 0.8% | 0.0% | Singapore 27%, US 22%, China 15% |
| HU | 173 | 79% | 0.8% | 0.0% | China 18%, US 12% |
| PK | 39 | 76% | 0.4% | 0.0% | China 26% |
| AR | 203 | 71% | 0.2% | 0.0% | China 21%, US 13% |

**Outside CN, US, JP and KR, local game publishers are essentially absent from the top-300.** China-HQ publishers are the largest single group in game revenue in 19 of the 27 countries with leader lists (18 excluding China itself). Local champions are almost all non-game:

- Media and streaming: Globoplay BR $51.7M, Crave CA $36.6M, Kayo AU $34.7M, Deezer FR $98.7M, Shahid AE $15.7M.
- Utilities and lifestyle: Yazio DE $44.2M, komoot DE $21.2M.

The exceptions are local card, table and sports games:

| App | Market | Revenue $M | yoy |
|---|---|---|---|
| Kammelna (Baloot) | SA | 6.1 | +13% |
| Rummy - Fun & Friends | DE | 10.3 | n/a |
| Kickbase | DE | 6.3 | n/a |
| Teen Patti Octro | IN | 3.1 | n/a |
| eFootball / Pro Baseball Spirits A (プロ野球スピリッツＡ) | JP | 204.9 / 136.2 | n/a |
| Lucky Defense | KR | 49.1 | n/a |
| Hangame Poker (한게임 포커) | KR | 27.6 | n/a |
| Royal Match / Royal Kingdom | TR | 13.8 / 5.5 | Royal Kingdom +364% |

### 3.2 Where foreign publishers dominate growing local demand

Local niche yoy >= +10% and local revenue >= $3M; the local share is of the niche's top-300 revenue in `country_leaders.csv`.

| Country / niche | Local niche $M (yoy) | Local publisher share | Who holds it |
|---|---|---|---|
| JP Match Merge 2 | 231.5 (+96%) | 0% | China 74% (Gossip Harbor $89.0M, Tasty Travels $30.3M) |
| JP Open World Adventure | 225.5 (+38%) | 0% | China 87% (Genshin $84.0M, Wuthering Waves $69.5M) |
| JP Tower Defense | 105.4 (+36%) | 0% | China 74%, Singapore 26% |
| JP Solitaire | 36.1 (+178%) | 0% | Israel 100% (Disney Solitaire) |
| KR Match Merge 2 | 187.0 (+93%) | 0% | China 80% |
| KR Idle RPG | 376.1 (+69%) | 26% | "Japan" 64% (MapleStory Idle; Nexon is Korean-founded, so this attribution is misleading) |
| DE Match Merge 2 | 169.9 (+122%) | 0% | China 73%, Israel 12% |
| DE Sort | 35.0 (+359%) | 0% | Turkey 100% |
| DE Solitaire | 30.2 (+40%) | 0% | Israel 59%, Austria 41% |
| GB Sort | 55.7 (+324%) | 0% | Turkey 91% |
| GB Screw | 17.7 (+35%) | 0% | Vietnam 100% (Screwdom) |
| FR Match Merge 2 | 94.7 (+111%) | 0% | China 79% |
| FR Tabletop Cards | 26.4 (+15%) | 10% | Germany 79% (Belote.com $8.2M, Tarot Classique $5.0M) |
| MX Match Merge 2 | 28.3 (+143%) | 0% | China 88% |
| MX Real-Time Strategy | 23.3 (+188%) | 0% | Finland 100% (Clash Royale) |
| BR Match Merge 2 | 41.1 (+87%) | 0% | China 72%, Israel 21% |
| BR Realistic Sports | 27.4 (+24%) | 0% | Japan 50%, US 26% |
| TR Okey | 45.3 (+22%) | 10% | US 45%, China 23%, UAE 16% |
| TR 4X Strategy | 95.9 (+14%) | 0% | China 58%, Singapore 29% |
| SA 4X Strategy | 96.3 (+12%) | 0% | Singapore 49%, China 43% |
| TH Avatar Life | 10.9 (+327%) | 0% | China 93% (Heartopia) |
| ID Virtual Casino | 37.0 (+173%) | 0% | China 99% (Higgs Games Island) |
| ZA Match Merge 2 | 14.0 (+133%) | 0% | China 85% |

Counter-examples where locals hold growing demand:
- **KR Tower Defense** ($122.5M, +45%): 75% local.
- **KR Poker** ($88.6M, +23%): 100% local.
- **JP Realistic Sports** ($376.8M, +17%) and **JP Sports Manager** ($77.4M, +22%): 100% local.
- **DE Tabletop Cards**: 68% local.
- **DE Sports Manager**: 41% local.
- **TR Match Swap**: 44% local.

---

## 4. New entrants per country

New entrants are apps released >= 2024-07-01 (`summary.json` thresholds.new_entrant_release_gte), counted in the current top-300 revenue list from `country_leader_summary.csv` (all apps) and `country_leaders.csv` (games).

| Country | New entrants (all) n / $M / share | Game entrants n / $M | Casual-puzzle entrants n / $M | Largest game entrants |
|---|---|---|---|---|
| KR | 78 / 992.9 / 22.6% | 68 / 916.5 | 6 / 35.7 | MapleStory Idle $194.1M, Kingshot $99.9M, SOL: enchant $61.1M |
| VN | 89 / 41.6 / 16.6% | 72 / 28.2 | 1 / 0.2 | MU: VĨNH HẰNG $1.5M |
| PH | 64 / 48.5 / 11.8% | 44 / 32.5 | 2 / 1.2 | Kingshot $6.9M, Heartopia $3.3M |
| CN | 51 / 1,696.1 / 11.5% | 45 / 1,648.7 | 2 / 11.9 | Delta Force $537.3M, 无畏契约 $245.4M |
| TH | 73 / 102.4 / 10.4% | 54 / 68.4 | 8 / 6.5 | Heartopia $9.0M, Seven Knights Re:BIRTH (세븐나이츠 리버스) $7.4M |
| JP | 50 / 991.2 / 10.3% | 45 / 918.6 | 7 / 83.3 | Pokémon TCG Pocket $129.1M, SD Gundam G Gen $113.4M, Disney Solitaire $33.6M |
| TR | 42 / 74.1 / 9.0% | 22 / 35.8 | 9 / 10.9 | Kingshot $11.2M, Top Tycoon $4.0M |
| ID | 54 / 50.9 / 8.8% | 34 / 25.3 | 7 / 4.1 | Kingshot $5.2M |
| IN | 53 / 53.2 / 7.2% | 7 / 10.1 | 4 / 3.3 | Kingshot $5.3M |
| SA | 40 / 57.6 / 6.6% | 13 / 28.0 | 7 / 7.3 | Kingshot $17.0M, Jackaroo King $3.5M |
| AE | 31 / 32.8 / 6.4% | 13 / 18.6 | 5 / 4.6 | Kingshot $10.7M, Jackaroo King $2.5M |
| ZA | 30 / 14.6 / 6.1% | 15 / 6.4 | 8 / 2.9 | Kingshot $2.0M |
| CA | 26 / 115.1 / 6.0% | 18 / 85.2 | 9 / 32.4 | Kingshot $25.5M, Disney Solitaire $9.5M, Pixel Flow! $6.3M |
| NO | 34 / 21.0 / 5.7% | 24 / 14.9 | 15 / 8.2 | Kingshot $3.5M, Pixel Flow! $1.6M, Screwdom $1.1M |
| AR | 31 / 11.6 / 5.7% | 9 / 3.3 | 4 / 1.1 | n/a |
| GB | 27 / 200.3 / 5.6% | 20 / 163.5 | 13 / 95.8 | Kingshot $39.0M, Disney Solitaire $20.9M, Pixel Flow! $12.6M |
| AU | 27 / 101.5 / 5.4% | 19 / 74.5 | 10 / 30.5 | Kingshot $24.3M, Disney Solitaire $6.5M, Pixel Flow! $6.4M |
| US | 26 / 1,514.5 / 5.3% | 18 / 1,104.7 | 9 / 448.2 | Kingshot $356.2M, Pixel Flow! $119.6M, Disney Solitaire $93.9M, Screwdom $50.4M |
| CO | 35 / 9.7 / 5.1% | 10 / 1.7 | 4 / 0.5 | n/a |
| DE | 23 / 186.1 / 5.1% | 18 / 149.3 | 9 / 60.3 | Kingshot $40.0M, Disney Solitaire $14.9M, Pixel Flow! $8.2M |
| BR | 36 / 74.2 / 4.9% | 14 / 22.3 | 7 / 8.9 | Kingshot $6.5M |
| FR | 27 / 119.1 / 4.9% | 19 / 89.8 | 8 / 30.7 | Kingshot $21.1M, Pokémon TCG Pocket $16.8M, Disney Solitaire $9.0M |
| HU | 32 / 8.1 / 4.7% | 18 / 5.6 | 9 / 3.3 | n/a |
| PK | 28 / 1.7 / 4.3% | 6 / 0.5 | 2 / 0.1 | n/a |
| IE | 25 / 8.9 / 3.8% | 16 / 6.5 | 9 / 3.4 | n/a |
| MX | 30 / 49.3 / 3.7% | 12 / 14.9 | 6 / 6.2 | FOX One MX $7.5M (the only local new entrant) |

Notes:
- **Revenue entry by new games is hardest in MX, IE, BR, FR and DE** (< 5.1% new-entrant share). It is easiest in KR, JP, CN, VN, TH and PH, but those are mid-core-dominated.
- **The same handful of global new entrants appears everywhere:** Kingshot, Disney Solitaire, Pixel Flow!, Flambé, Mystery Town, Top Tycoon, Screwdom. Local-specific new entrants in revenue are rare: Jackaroo King in the Gulf, 협타디 and SOL: enchant in KR, MU: VĨNH HẰNG in VN, CookieRun Classic in TH.
- **By downloads, the Arrow-puzzle wave is the biggest new-game event in emerging markets, and it earns almost no IAP:**
  - India: Arrow Puzzle: Tap 45.6M, Arrows Puzzle Escape 31.0M, Arrows GO! 26.1M.
  - Pakistan: 5.9M, 4.9M, 5.5M.
  - The same titles are in the top download entrants in AE, AR, BR, CO, HU, ID, KR, JP, PH, RU, SA and TR.
- **Short-drama apps are the biggest non-game download entrants:** NetShort, Dramawave, FreeReels, Melolo, PineDrama (e.g., Story TV 136.7M dl and Kuku TV 93.3M dl in IN). This matches Movies & TV Shows beating WW in TR (+67%), VN (+64%), IN (+50%), AR (+43%) and CO (+38%).

---

## 5. Hypotheses (local-market entries)

Each hypothesis is falsifiable within <= 4 weeks. Sizes are local niche revenue (IAP only). For ad-monetized niches the true market is larger than shown.

### countries-01 — JP and KR are under-served on Sort and Arrow puzzles; a Japan-localized Sort can buy installs at near-US efficiency
- **Claim:** In JP, Sort is installed at 2.15x its share elsewhere but earns only 0.15x in-store, and no Sort app clears the JP top-300 cutoff ($5.4M). In a 2-week paid-UA test, a JP-localized Sort prototype should reach CPI <= 1.3x the same build's US CPI with D1 >= 35%. Otherwise the gap is cultural, not supply.
- **Evidence:**
  - JP Sort $6.2M -> $18.9M (+206%), H2/H1 +63%, downloads 27.4M -> 48.1M (+75%), 8.0% of JP game downloads (`country_niche_dynamics.csv`).
  - Rev PI 0.15 vs dl PI 2.15; KR 0.16 / 1.66 (computed).
  - JP Sort download leaders are all foreign and earn little: Arrows Puzzle Escape (DE), Wool Crush (SG), Water Match (HK), Magic Sort! (TR) $1.5M (`country_leaders.csv`).
  - WW Sort new-entrant share 76.3%, HHI 0.092 (`niche_leaders_full_game_sub_genre.csv`).
- **Why now:** WW Sort last3m yoy +272% and H2/H1 +62% (`niche_dynamics_game_sub_genre.csv`).
- **Who to beat:** Magic Sort!, Pixel Flow! (TR) and Arrows Puzzle Escape, none localized for JP.
- **Risk:** US ad-intensity rank 10 means a UA arms race.

### countries-02 — Merge-2 growth in Europe's high-RPD markets is open to a themed entrant (DE, FR, Nordics, HU)
- **Claim:** Match Merge 2 grows 1.3-1.9x faster locally than WW in DE, FR, NO and HU, and no local publisher competes. A European-themed merge-2 prototype (village or bakery restoration, localized story) should beat a generic merge creative on playable-ad IPM in DE/FR by >= 20%.
- **Evidence:**
  - DE $76.7M -> $169.9M (+122%, H2/H1 +25%); FR $44.9M -> $94.7M (+111%, H2/H1 +27%); NO +114% (H2/H1 +40%); HU +166% (H2/H1 +58%), vs WW +88% (`country_niche_dynamics.csv`, `niche_dynamics_game_sub_genre.csv`).
  - Local-publisher share of the niche's top-300 revenue is 0% in DE, FR, NO and HU. China-HQ publishers hold 73% in DE and 79% in FR (`country_leaders.csv`).
  - WW top-1 Gossip Harbor 41.7%, HHI 0.208; new entrants 16.1% (Flambé $135.7M, Hollywood Merge $44.7M) (`niche_leaders_full_game_sub_genre.csv`).
  - WW RPD $4.70, so merge monetizes deeply once retained.

### countries-03 — KR, TW and JP Tower Defense: a light merge-defense hybrid can enter the most fragmented growing mid-core niche
- **Claim:** TD is growing +36-45% in KR, TW and JP with the lowest concentration of any growing game niche. A co-op or random merge-defense (Lucky Defense-like) prototype should reach playable-ad CTR within 20% of Lucky Defense-style creatives in KR and TW, and D1 >= 40% in a 3-week KR/TW soft launch.
- **Evidence:**
  - KR TD $84.6M -> $122.5M (+45%); TW $41.3M -> $58.8M (+43%); JP $77.3M -> $105.4M (+36%); WW $723.0M -> $850.9M (+18%) (`country_niche_dynamics.csv`, `niche_dynamics_game_sub_genre.csv`).
  - Rev PI KR 3.26, TW 2.83 (computed).
  - WW TD new-entrant share 41.0%, HHI 0.064, top-1 17.4% (`niche_leaders_full_game_sub_genre.csv`).
  - KR TD top-300: Lucky Defense $49.1M and 협타디 $16.9M, 75% local. JP: Arknights $43.9M, セルサバイバー $18.4M (`country_leaders.csv`).
- **Risk:** KR incumbents are local and live-ops heavy.

### countries-04 — Hybrid solitaire in GB, DE and FR: new entrants take the growth
- **Claim:** Solitaire's European growth comes from 2024-25 entrants. A solitaire-plus-merge (or word) hybrid can reach CPI <= $2.50 and D7 >= 15% in a GB soft launch. A failure means Disney IP and incumbents' UA budgets lock the niche.
- **Evidence:**
  - GB $17.5M -> $33.9M (+94%, H2/H1 +38%); FR $6.6M -> $13.2M (+101%); DE $21.5M -> $30.2M (+40%) vs WW +38% (`country_niche_dynamics.csv`).
  - WW new-entrant share 61.9%; Disney Solitaire $232.6M; Solitaire Associations Journey (2025-08) $43.8M WW and 17.8M US downloads (`niche_leaders_full_game_sub_genre.csv`, `country_leader_summary.csv`).
  - Concentration: top-3 81.7%, HHI 0.321.

### countries-05 — National card games in FR and DE: fragmented, local-skewed, monetizing better each year
- **Claim:** Tarot, Belote, Rummy and Skat players in FR and DE spend more per download each year while downloads fall. A single-player-vs-AI Tarot or Belote app with a daily-challenge meta should convert >= 3% of D7 users to a 4.99/mo no-ads plus coach subscription in a 4-week FR soft launch.
- **Evidence:**
  - FR Tabletop Cards $23.0M -> $26.4M (+15%), rev PI 4.98; DE $20.8M -> $23.1M (+11%), rev PI 2.26, vs WW +3% (`country_niche_dynamics.csv`).
  - Downloads FR -24% and DE -26%, so RPD is rising.
  - Leaders: FR Belote.com $8.2M, Tarot Classique $5.0M (German publisher, 2024-05 release), Fun Bridge $2.4M; DE Rummy - Fun & Friends $10.3M, 68% local (`country_leaders.csv`).
  - WW HHI 0.066, top-10 68.6% (`niche_leaders_full_game_sub_genre.csv`).
- **Note:** A 2024 entrant (Tarot Classique) already reached $5.0M in FR.

### countries-06 — Gulf card games (SA, AE): a 2024 entrant proved a new-title path
- **Claim:** Jackaroo King (released 2024-08) reached $3.5M in SA and $10.3M WW, which shows Gulf card players switch to new apps. An Arabic-first Jackaroo or Baloot variant with bots and friend rooms should hit CPI <= $1.50 in SA/AE and >= 5% D1 payer-or-ad-engaged users.
- **Evidence:**
  - SA Tabletop Cards $12.8M -> $14.0M (+10%, H2/H1 +13%, accelerating), rev PI 8.85 (`country_niche_dynamics.csv`).
  - SA Kammelna (local) $6.1M (+13%); Jackaroo King $3.5M (SA) and $2.5M (AE) (`country_leaders.csv`, `country_leader_summary.csv`).
  - SA games local-publisher share is 2.4%.
  - SA Board $39.2M -> $34.6M (-12%) as Yalla Ludo fell $17.3M -> $12.0M, so incumbents are losing share.
- **Risk:** Multiplayer liquidity, and growth is modest.

### countries-07 — India, Pakistan and Indonesia as a near-free install pool for ad-monetized puzzle validation (Arrow and Sort)
- **Claim:** Arrow and Sort puzzles are the largest new-game download wave in South and Southeast Asia, with almost no IAP. A prototype can reach CPI <= $0.05 in IN/PK and reveal retention within 7 days. Ad ARPDAU (not measured by Sensor Tower) decides viability.
- **Evidence:**
  - IN Sort downloads 171.2M -> 282.1M (+65%); PK 26.1M -> 44.3M (+70%); ID 37.1M -> 69.2M (+87%); IN Sort IAP only $1.4M (`country_niche_dynamics.csv`).
  - IN download entrants: Arrow Puzzle: Tap 45.6M, Arrows Puzzle Escape 31.0M, Arrows GO! 26.1M, all ~$0 IAP (`country_leaders.csv`).
  - IN game RPD $0.04 and country RPD $0.034 (`country_dynamics.csv`).

### countries-08 — LatAm casual IAP is rising per download; MX and CO are cheap merge/match soft-launch markets
- **Claim:** LatAm game revenue grows through payer conversion while installs shrink, with no local publishers. A Spanish-localized merge or match prototype soft-launched in MX and CO should reach D7 ROAS >= 60% of its GB D7 ROAS at less than half the CPI.
- **Evidence:**
  - MX games $550M (+9.7%) with game downloads -15%; CO games $62M (+28%); AR $70M (+20%). Country RPD MX +34%, CO +39% (`country_dynamics.csv`, `country_niche_dynamics.csv`).
  - MX Match Merge 2 $11.6M -> $28.3M (+143%, H2/H1 +40%); Match Swap AR +29%, CO +18%, BR +13% vs WW -2%.
  - Local game-publisher share is 0% in MX, CO and AR (`country_leaders.csv`).
- **Risk:** FX inflates USD yoy (AR especially), and absolute size is small.

### countries-09 — GB daily word puzzles: a local over-index that grows while WW Word shrinks
- **Claim:** GB Word spending grows +15% against WW -6%, carried by newspaper-brand daily puzzles. A daily-puzzle bundle (word plus logic plus mini-crossword) fake-door subscription page should get >= 4% trial-intent from GB paid social at CPC <= £0.60.
- **Evidence:**
  - GB Word $21.0M -> $24.2M (+15%, H2/H1 +8%), rev PI 2.70, vs WW $251.2M -> $235.9M (-6%) (`country_niche_dynamics.csv`, `niche_dynamics_game_sub_genre.csv`).
  - GB Word top-300: NYT Games $6.7M, The Telegraph $5.6M; local share 46% (`country_leaders.csv`).
  - WW Word US ad-intensity rank 13 (ad-heavy).

### countries-10 — Turkish Okey is closed to multiplayer entrants; only a solo "Okey puzzle" variant might enter
- **Claim:** Okey is a $45M, +22% Turkey-only market, but no 2024+ entrant has passed $0.3M WW. A multiplayer clone will fail. A single-player Okey-tile puzzle (rummy-meld as a level-based puzzle) should show playable-ad CTR in TR >= the TR benchmark for Match Swap creatives.
- **Evidence:**
  - TR Okey $37.1M -> $45.3M (+22%, H2/H1 +8%), downloads +4% (`country_niche_dynamics.csv`).
  - WW Okey new-entrant share 0.7% (largest entrant $0.3M); top-10 91.3% (`niche_leaders_full_game_sub_genre.csv`).
  - TR Okey top-300: 101 Okey Plus $15.1M (US-HQ), 101 Okey Yalla $6.9M (AE), Soho $5.4M (CN); local 10% (`country_leaders.csv`).

---

## 6. Per-country detail (28 countries)

Each block has four parts:
- **Size and growth line:** from `country_dynamics.csv`, plus the games/apps split.
- **Outperformer table:** local yoy vs WW yoy for the same niche (filters in section 2). "Top app share" is the largest app in that niche in the country's top-300 revenue list divided by the local niche revenue. A value >= 50% means single-app driven.
- **Under-penetrated WW-growing niches:** ex-country and, for games, ex-China baseline.
- **Publisher and new-entrant lines.**

### US — United States

- Size/growth (`country_dynamics.csv`): revenue $40962.2M (prior $40554.8M, +1%; H2/H1 -2%; last3m -3%), downloads 12472.5M (-2%), RPD $3.28 (prior $3.20). Games (sum of `country_niche_dynamics` game_sub_genre) $17043.1M -7% vs WW games -2.4%; apps $23708.4M +7% vs WW apps +16.7%.
- Top-300 (`country_leader_summary.csv`): $28690.1M, coverage 70% of country, local-publisher share 57.7%, new entrants (released >= 2024-07) 26 apps / $1514.5M (5.3%), games share of top-300 41%.

| Niche (dim) | Local prior -> cur $M | Local yoy | WW yoy (WW prior $M) | Gap pp | Excess $M | Local H2/H1 | Top app share of local niche |
|---|---|---|---|---|---|---|---|
| Battle Royale (game) | 342.8 -> 396.1 | +16% | -5% (1980.3) | +21 | 70.7 | -1% | Garena Free Fire 59% |
| Idle RPG (game) | 208.5 -> 256.0 | +23% | +4% (1343.0) | +18 | 38.4 | +16% | 메이플 키우기 19% |
| Simulator (game) | 89.8 -> 97.0 | +8% | -9% (526.1) | +17 | 15.0 | -21% | Umamusume: Pretty Derby 40% |
| Tower Defense (game) | 110.7 -> 142.8 | +29% | +18% (723.0) | +11 | 12.6 | +14% |  |
| Transportation (app) | 88.5 -> 121.2 | +37% | +26% (351.7) | +11 | 9.5 | +24% |  |
| Food Blogs, Coupons & Recipe Resources (app) | 23.9 -> 32.6 | +36% | +26% (88.1) | +10 | 2.5 | +18% |  |
| Financial Services (app) | 11.6 -> 13.7 | +18% | +3% (21.4 FLAG<$50M) | +15 | 1.8 | -31% |  |

Under-penetrated WW-growing niches (WW yoy >= +10%, baseline rev >= $100M; PI = niche share of country dim revenue / share in baseline; baseline = WW minus this country minus China for games):

| Niche | Local $M (yoy) | Rev PI | Download PI | WW $M (yoy) |
|---|---|---|---|---|
| Action RPG (game) | 14.6 (-19%) | 0.23 | 1.02 | 182.7 (+20%) |
| Open World Adventure (game) | 106.4 (+14%) | 0.39 | 1.67 | 1019.9 (+40%) |
| Realistic Sports (game) | 248.4 (+10%) | 0.42 | 0.66 | 1491.9 (+13%) |
| Social Party (game) | 46.6 (+35%) | 0.55 | 1.30 | 245.3 (+24%) |

- Games in top-300 revenue (`country_leaders.csv`): $11831.2M, local publishers 26.1%; publisher-country mix: US 26%; China 16%; Turkey 13%; Singapore 10%.
- Local champions (top local-publisher apps, `country_leader_summary.local_publishers_top5`): ChatGPT ($1,380.7M); YouTube ($979.7M); Google One ($933.8M); MONOPOLY GO! ($856.8M); Peacock TV: Stream TV & Movies ($700.6M)
- New game entrants (release >= 2024-07) in top-300 revenue: 18 apps, $1104.7M (9.3% of games top-300); largest: Kingshot [4X Strategy, China] $356.2M; Pixel Flow! [Sort, Turkey] $119.6M; Pokémon TCG Pocket [Card Battler, Japan] $99.4M; Disney Solitaire [Solitaire, Israel] $93.9M

### CN — China

- Size/growth (`country_dynamics.csv`): revenue $16302.3M (prior $15595.5M, +5%; H2/H1 +6%; last3m +8%), downloads 5989.9M (-3%), RPD $2.72 (prior $2.53). Games (sum of `country_niche_dynamics` game_sub_genre) $8801.1M -2% vs WW games -2.4%; apps $7317.9M +14% vs WW apps +16.7%.
- Top-300 (`country_leader_summary.csv`): $14686.0M, coverage 90% of country, local-publisher share 94.2%, new entrants (released >= 2024-07) 51 apps / $1696.1M (11.5%), games share of top-300 54%.

| Niche (dim) | Local prior -> cur $M | Local yoy | WW yoy (WW prior $M) | Gap pp | Excess $M | Local H2/H1 | Top app share of local niche |
|---|---|---|---|---|---|---|---|
| FPS / 3PS (game) | 527.7 -> 1033.6 | +96% | +33% (1204.5) | +63 | 331.5 | -7% | Delta Force 52% |
| Tycoon / Crafting (game) | 77.0 -> 189.9 | +146% | +1% (1509.9) | +145 | 111.8 | +37% | My Garden Tale 46% |
| Match Swap (game) | 153.5 -> 224.6 | +46% | -2% (5274.5) | +49 | 74.7 | +11% | Anipop ™ 66% |
| Survival (game) | 38.4 -> 94.8 | +147% | +45% (131.1) | +102 | 39.2 | -26% | Tomb Busters 88% |
| Multimedia & Design Software (app) | 555.1 -> 740.7 | +33% | +18% (3851.9) | +15 | 84.6 | +17% |  |
| Dating & Social Discovery (app) | 237.3 -> 276.9 | +17% | -7% (5290.1) | +24 | 57.1 | +21% |  |
| Music & Podcasts (app) | 947.5 -> 1156.8 | +22% | +17% (2732.8) | +5 | 50.8 | +11% |  |

Under-penetrated WW-growing niches (WW yoy >= +10%, baseline rev >= $100M; PI = niche share of country dim revenue / share in baseline; baseline = WW minus this country):

| Niche | Local $M (yoy) | Rev PI | Download PI | WW $M (yoy) |
|---|---|---|---|---|
| Screw (game) | 0.0 (-27%) | 0.00 | 0.51 | 229.0 (+33%) |
| Sort (game) | 0.1 (-34%) | 0.00 | 0.35 | 753.9 (+283%) |
| Action Sandbox (game) | 0.0 (+6%) | 0.00 | 0.07 | 104.2 (+87%) |
| Solitaire (game) | 0.1 (+36%) | 0.00 | 0.38 | 454.7 (+38%) |
| News & Magazines (app) | 0.5 (-24%) | 0.01 | 0.99 | 599.2 (+11%) |
| Religion & Spirituality (app) | 0.2 (-46%) | 0.01 | 0.02 | 152.6 (+29%) |

- Games in top-300 revenue (`country_leaders.csv`): $7988.5M, local publishers 91.5%; publisher-country mix: China 92%; Hong Kong 2%; US 2%; n/a 1%.
- Local champions (top local-publisher apps, `country_leader_summary.local_publishers_top5`): TikTok ($1,464.4M); Honor of Kings ($1,397.0M); WeTV: Asian & Local Dramas ($702.7M); 和平精英 ($667.4M); Delta Force ($537.3M)
- New game entrants (release >= 2024-07) in top-300 revenue: 45 apps, $1648.7M (20.6% of games top-300); largest: Delta Force [FPS / 3PS, China] $537.3M; 无畏契约：源能行动 [FPS / 3PS, China] $245.4M; My Garden Tale [Tycoon / Crafting, Hong Kong] $88.1M; Where Winds Meet [Open World Adventure, China] $84.1M

### JP — Japan

- Size/growth (`country_dynamics.csv`): revenue $11831.2M (prior $11704.0M, +1%; H2/H1 -1%; last3m +1%), downloads 2720.8M (+4%), RPD $4.35 (prior $4.47). Games (sum of `country_niche_dynamics` game_sub_genre) $7002.6M -9% vs WW games -2.4%; apps $4832.1M +21% vs WW apps +16.7%.
- Top-300 (`country_leader_summary.csv`): $9664.0M, coverage 82% of country, local-publisher share 52.1%, new entrants (released >= 2024-07) 50 apps / $991.2M (10.3%), games share of top-300 59%.

| Niche (dim) | Local prior -> cur $M | Local yoy | WW yoy (WW prior $M) | Gap pp | Excess $M | Local H2/H1 | Top app share of local niche |
|---|---|---|---|---|---|---|---|
| 4X Strategy (game) | 897.1 -> 960.8 | +7% | +2% (7414.6) | +5 | 43.2 | -20% | Last War:Survival 22% |
| Solitaire (game) | 13.0 -> 36.1 | +178% | +38% (330.0) | +140 | 18.2 | +12% | Disney Solitaire 93% |
| Action RPG (game) | 32.9 -> 55.1 | +68% | +20% (152.3) | +48 | 15.6 | +80% | ドラゴンクエストスマッシュグロウ ドラクエローグライ 38% |
| Tower Defense (game) | 77.3 -> 105.4 | +36% | +18% (723.0) | +19 | 14.4 | +1% | 明日方舟 42% |
| Utilities (app) | 198.9 -> 459.9 | +131% | +34% (5011.0) | +97 | 193.8 | +11% |  |
| Generative AI (app) | 111.1 -> 402.9 | +263% | +139% (2642.4) | +123 | 137.2 | +109% |  |
| Books & Comics (app) | 1010.0 -> 1071.0 | +6% | -5% (2965.8) | +11 | 112.2 | -3% |  |

Under-penetrated WW-growing niches (WW yoy >= +10%, baseline rev >= $100M; PI = niche share of country dim revenue / share in baseline; baseline = WW minus this country minus China for games):

| Niche | Local $M (yoy) | Rev PI | Download PI | WW $M (yoy) |
|---|---|---|---|---|
| Action Sandbox (game) | 1.6 (+19%) | 0.09 | 0.12 | 104.2 (+87%) |
| Physics (game) | 2.3 (+186%) | 0.13 | 1.17 | 107.2 (+54%) |
| Sort (game) | 18.9 (+206%) | 0.15 | 2.15 | 753.9 (+283%) |
| Eat & Grow (game) | 6.1 (+86%) | 0.20 | 1.14 | 179.3 (+87%) |
| Jobs & Careers (app) | 2.4 (-18%) | 0.03 | 3.51 | 1015.7 (+14%) |
| Religion & Spirituality (app) | 0.6 (+42%) | 0.05 | 0.04 | 152.6 (+29%) |

- Games in top-300 revenue (`country_leaders.csv`): $5744.3M, local publishers 51.3%; publisher-country mix: Japan 51%; China 27%; Singapore 6%; Turkey 3%.
- Local champions (top local-publisher apps, `country_leader_summary.local_publishers_top5`): ピッコマ ($428.9M); LINEマンガ ($375.4M); モンスターストライク ($207.2M); eFootball ($204.9M); LINE ($165.4M)
- New game entrants (release >= 2024-07) in top-300 revenue: 45 apps, $918.6M (16.0% of games top-300); largest: Pokémon TCG Pocket [Card Battler, Japan] $129.1M; SD Gundam G Generation ETERN [Turn-Based Tactics, Japan] $113.4M; Kingshot [4X Strategy, China] $63.7M; Shadowverse: Worlds Beyond [Card Battler, Japan] $39.7M

### KR — South Korea

- Size/growth (`country_dynamics.csv`): revenue $5281.2M (prior $4947.2M, +7%; H2/H1 +8%; last3m +12%), downloads 1848.3M (-8%), RPD $2.86 (prior $2.48). Games (sum of `country_niche_dynamics` game_sub_genre) $3473.5M -6% vs WW games -2.4%; apps $1799.0M +42% vs WW apps +16.7%.
- Top-300 (`country_leader_summary.csv`): $4392.0M, coverage 83% of country, local-publisher share 36.9%, new entrants (released >= 2024-07) 78 apps / $992.9M (22.6%), games share of top-300 66%.

| Niche (dim) | Local prior -> cur $M | Local yoy | WW yoy (WW prior $M) | Gap pp | Excess $M | Local H2/H1 | Top app share of local niche |
|---|---|---|---|---|---|---|---|
| Idle RPG (game) | 222.7 -> 376.1 | +69% | +4% (1343.0) | +65 | 143.7 | -33% | 메이플 키우기 52% |
| Tower Defense (game) | 84.6 -> 122.5 | +45% | +18% (723.0) | +27 | 23.0 | +10% | Lucky Defense 40% |
| Poker (game) | 71.8 -> 88.6 | +23% | -6% (459.3) | +29 | 21.1 | +21% | 한게임 포커 31% |
| Solitaire (game) | 2.5 -> 9.3 | +276% | +38% (330.0) | +238 | 5.9 | +78% | Disney Solitaire 83% |
| Utilities (app) | 58.2 -> 289.7 | +397% | +34% (5011.0) | +364 | 211.8 | +139% |  |
| Generative AI (app) | 125.0 -> 335.7 | +169% | +139% (2642.4) | +29 | 36.7 | +84% |  |
| Movies & TV Shows (app) | 192.7 -> 229.4 | +19% | +6% (10056.8) | +13 | 25.3 | +17% |  |

Under-penetrated WW-growing niches (WW yoy >= +10%, baseline rev >= $100M; PI = niche share of country dim revenue / share in baseline; baseline = WW minus this country minus China for games):

| Niche | Local $M (yoy) | Rev PI | Download PI | WW $M (yoy) |
|---|---|---|---|---|
| Action Sandbox (game) | 0.8 (+399%) | 0.10 | 0.13 | 104.2 (+87%) |
| Eat & Grow (game) | 1.7 (+172%) | 0.12 | 0.94 | 179.3 (+87%) |
| FPS / 3PS (game) | 7.1 (-12%) | 0.16 | 0.28 | 1602.6 (+33%) |
| Sort (game) | 9.5 (+321%) | 0.16 | 1.66 | 753.9 (+283%) |
| Food Blogs, Coupons & Recipe Resources (app) | 0.1 (-5%) | 0.05 | 0.88 | 111.0 (+26%) |
| News & Magazines (app) | 1.0 (+18%) | 0.06 | 0.77 | 599.2 (+11%) |

- Games in top-300 revenue (`country_leaders.csv`): $2894.8M, local publishers 35.0%; publisher-country mix: South Korea 35%; China 30%; Japan 12%; Singapore 8%.
- Local champions (top local-publisher apps, `country_leader_summary.local_publishers_top5`): 리니지M ($148.1M); WEBTOON: Manga, Comics, Manhwa ($89.1M); KakaoTalk : Messenger ($77.6M); TVING ($66.5M); SOL: enchant ($61.1M)
- New game entrants (release >= 2024-07) in top-300 revenue: 68 apps, $916.5M (31.7% of games top-300); largest: 메이플 키우기 [Idle RPG, Japan] $194.1M; Kingshot [4X Strategy, China] $99.9M; SOL: enchant [MMORPG, South Korea] $61.1M; 뱀피르 [MMORPG, South Korea] $59.8M

### GB — United Kingdom

- Size/growth (`country_dynamics.csv`): revenue $4958.7M (prior $4289.3M, +16%; H2/H1 +5%; last3m +11%), downloads 2392.8M (+0%), RPD $2.07 (prior $1.80). Games (sum of `country_niche_dynamics` game_sub_genre) $1932.5M +8% vs WW games -2.4%; apps $3001.4M +21% vs WW apps +16.7%.
- Top-300 (`country_leader_summary.csv`): $3582.5M, coverage 72% of country, local-publisher share 7.5%, new entrants (released >= 2024-07) 27 apps / $200.3M (5.6%), games share of top-300 37%.

| Niche (dim) | Local prior -> cur $M | Local yoy | WW yoy (WW prior $M) | Gap pp | Excess $M | Local H2/H1 | Top app share of local niche |
|---|---|---|---|---|---|---|---|
| Coin Looters (game) | 209.6 -> 229.3 | +9% | -8% (2724.1) | +17 | 36.7 | -2% | Coin Master 48% |
| 4X Strategy (game) | 222.2 -> 248.2 | +12% | +2% (7414.6) | +9 | 20.9 | -11% | Kingshot 16% |
| Solitaire (game) | 17.5 -> 33.9 | +94% | +38% (330.0) | +56 | 9.8 | +38% | Disney Solitaire 62% |
| Sort (game) | 13.1 -> 55.7 | +324% | +283% (196.9) | +41 | 5.4 | +62% | Pixel Flow! 23% |
| Dating & Social Discovery (app) | 285.2 -> 310.7 | +9% | -7% (5290.1) | +16 | 46.6 | +4% |  |
| Social Media (app) | 379.4 -> 443.2 | +17% | +10% (10745.0) | +7 | 27.0 | +10% |  |
| Shopping (app) | 16.9 -> 46.6 | +176% | +21% (498.6) | +154 | 26.1 | +44% |  |

Under-penetrated WW-growing niches (WW yoy >= +10%, baseline rev >= $100M; PI = niche share of country dim revenue / share in baseline; baseline = WW minus this country minus China for games):

| Niche | Local $M (yoy) | Rev PI | Download PI | WW $M (yoy) |
|---|---|---|---|---|
| Action RPG (game) | 1.0 (-25%) | 0.18 | 0.80 | 182.7 (+20%) |
| Open World Adventure (game) | 7.4 (+20%) | 0.29 | 1.12 | 1019.9 (+40%) |
| FPS / 3PS (game) | 10.0 (-16%) | 0.42 | 0.45 | 1602.6 (+33%) |
| Realistic Sports (game) | 28.8 (+6%) | 0.53 | 0.72 | 1491.9 (+13%) |

- Games in top-300 revenue (`country_leaders.csv`): $1336.8M, local publishers 7.6%; publisher-country mix: US 19%; Israel 16%; China 15%; Turkey 12%.
- Local champions (top local-publisher apps, `country_leader_summary.local_publishers_top5`): Candy Crush Saga ($70.2M); NOW: TV, Movies, Live Sport ($29.7M); ITVX ($18.1M); Calorie Counter + ($16.2M); The Guardian - UK & World News ($15.0M)
- New game entrants (release >= 2024-07) in top-300 revenue: 20 apps, $163.5M (12.2% of games top-300); largest: Kingshot [4X Strategy, China] $39.0M; Disney Solitaire [Solitaire, Israel] $20.9M; Pixel Flow! [Sort, Turkey] $12.6M; Pokémon TCG Pocket [Card Battler, Japan] $11.3M

### DE — Germany

- Size/growth (`country_dynamics.csv`): revenue $4876.4M (prior $4227.3M, +15%; H2/H1 -0%; last3m +8%), downloads 2421.8M (-6%), RPD $2.01 (prior $1.65). Games (sum of `country_niche_dynamics` game_sub_genre) $2152.9M +5% vs WW games -2.4%; apps $2707.5M +25% vs WW apps +16.7%.
- Top-300 (`country_leader_summary.csv`): $3673.2M, coverage 75% of country, local-publisher share 9.2%, new entrants (released >= 2024-07) 23 apps / $186.1M (5.1%), games share of top-300 43%.

| Niche (dim) | Local prior -> cur $M | Local yoy | WW yoy (WW prior $M) | Gap pp | Excess $M | Local H2/H1 | Top app share of local niche |
|---|---|---|---|---|---|---|---|
| Match Merge 2 (game) | 76.7 -> 169.9 | +122% | +88% (1418.6) | +34 | 25.8 | +25% | Gossip Harbor: Merge & Sto 50% |
| Coin Looters (game) | 198.3 -> 206.1 | +4% | -8% (2724.1) | +12 | 23.9 | -2% | Coin Master 63% |
| Sandbox (game) | 32.8 -> 37.1 | +13% | -20% (1106.6) | +33 | 10.9 | -12% | Roblox 85% |
| Sort (game) | 7.6 -> 35.0 | +359% | +283% (196.9) | +76 | 5.8 | +65% | Pixel Flow! 23% |
| Utilities (app) | 156.1 -> 338.8 | +117% | +34% (5011.0) | +83 | 130.0 | +22% |  |
| Dating & Social Discovery (app) | 240.2 -> 252.6 | +5% | -7% (5290.1) | +13 | 30.1 | -2% |  |
| Personal Health & Fitness (app) | 158.0 -> 193.9 | +23% | +8% (2910.3) | +14 | 22.8 | +11% |  |

Under-penetrated WW-growing niches (WW yoy >= +10%, baseline rev >= $100M; PI = niche share of country dim revenue / share in baseline; baseline = WW minus this country minus China for games):

| Niche | Local $M (yoy) | Rev PI | Download PI | WW $M (yoy) |
|---|---|---|---|---|
| Action RPG (game) | 1.7 (-36%) | 0.27 | 1.04 | 182.7 (+20%) |
| Realistic Sports (game) | 26.3 (+13%) | 0.43 | 0.59 | 1491.9 (+13%) |
| Open World Adventure (game) | 12.6 (+29%) | 0.45 | 1.40 | 1019.9 (+40%) |
| FPS / 3PS (game) | 14.6 (-10%) | 0.55 | 0.60 | 1602.6 (+33%) |
| Religion & Spirituality (app) | 2.0 (+42%) | 0.32 | 0.39 | 152.6 (+29%) |
| Jobs & Careers (app) | 23.1 (+23%) | 0.55 | 0.87 | 1015.7 (+14%) |

- Games in top-300 revenue (`country_leaders.csv`): $1578.7M, local publishers 3.6%; publisher-country mix: China 19%; Israel 14%; US 11%; Turkey 9%.
- Local champions (top local-publisher apps, `country_leader_summary.local_publishers_top5`): AI Calorie Tracker by Yazio ($44.2M); komoot - Wandern und Radfahren ($21.2M); RTL+ ($17.9M); Joyn | deine Streaming App ($17.2M); Finanzguru - Konten & Verträge ($14.3M)
- New game entrants (release >= 2024-07) in top-300 revenue: 18 apps, $149.3M (9.5% of games top-300); largest: Kingshot [4X Strategy, China] $40.0M; Disney Solitaire [Solitaire, Israel] $14.9M; Pokémon TCG Pocket [Card Battler, Japan] $12.2M; Tiles Survive! [4X Strategy, Switzerland] $9.6M

### FR — France

- Size/growth (`country_dynamics.csv`): revenue $3100.3M (prior $2622.6M, +18%; H2/H1 +5%; last3m +9%), downloads 2232.6M (+1%), RPD $1.39 (prior $1.18). Games (sum of `country_niche_dynamics` game_sub_genre) $1154.7M +5% vs WW games -2.4%; apps $1940.0M +28% vs WW apps +16.7%.
- Top-300 (`country_leader_summary.csv`): $2435.4M, coverage 79% of country, local-publisher share 11.5%, new entrants (released >= 2024-07) 27 apps / $119.1M (4.9%), games share of top-300 35%.

| Niche (dim) | Local prior -> cur $M | Local yoy | WW yoy (WW prior $M) | Gap pp | Excess $M | Local H2/H1 | Top app share of local niche |
|---|---|---|---|---|---|---|---|
| Coin Looters (game) | 144.3 -> 157.7 | +9% | -8% (2724.1) | +17 | 25.1 | -4% | Coin Master 53% |
| Match Merge 2 (game) | 44.9 -> 94.7 | +111% | +88% (1418.6) | +23 | 10.3 | +27% | Gossip Harbor: Merge & Sto 55% |
| Match Swap (game) | 117.9 -> 123.6 | +5% | -2% (5274.5) | +7 | 8.5 | -0% | Candy Crush Saga 23% |
| Sandbox (game) | 14.9 -> 18.8 | +26% | -20% (1106.6) | +46 | 6.9 | -1% | Roblox 92% |
| Utilities (app) | 110.8 -> 184.9 | +67% | +34% (5011.0) | +33 | 36.7 | +7% |  |
| Dating & Social Discovery (app) | 192.9 -> 211.8 | +10% | -7% (5290.1) | +17 | 33.2 | +12% |  |
| Personal Health & Fitness (app) | 88.9 -> 115.3 | +30% | +8% (2910.3) | +22 | 19.1 | +19% |  |

Under-penetrated WW-growing niches (WW yoy >= +10%, baseline rev >= $100M; PI = niche share of country dim revenue / share in baseline; baseline = WW minus this country minus China for games):

| Niche | Local $M (yoy) | Rev PI | Download PI | WW $M (yoy) |
|---|---|---|---|---|
| Action RPG (game) | 1.3 (-30%) | 0.40 | 1.11 | 182.7 (+20%) |
| Realistic Sports (game) | 15.9 (+25%) | 0.49 | 0.65 | 1491.9 (+13%) |
| Open World Adventure (game) | 7.7 (+37%) | 0.52 | 1.79 | 1019.9 (+40%) |
| Financial News (app) | 1.6 (+15%) | 0.49 | 0.59 | 111.1 (+22%) |

- Games in top-300 revenue (`country_leaders.csv`): $851.3M, local publishers 1.1%; publisher-country mix: China 21%; Israel 15%; US 15%; Finland 7%.
- Local champions (top local-publisher apps, `country_leader_summary.local_publishers_top5`): Deezer: Music Player, Podcast ($98.7M); Le Monde, Actualités en direct ($18.3M); TF1+ : Streaming, TV en Direct ($13.1M); Meetic - Appli de rencontre ($11.7M); happn: dating app ($10.2M)
- New game entrants (release >= 2024-07) in top-300 revenue: 19 apps, $89.8M (10.5% of games top-300); largest: Kingshot [4X Strategy, China] $21.1M; Pokémon TCG Pocket [Card Battler, Japan] $16.8M; Disney Solitaire [Solitaire, Israel] $9.0M; Flambé: Merge & Cook [Match Merge 2, China] $4.8M

### CA — Canada

- Size/growth (`country_dynamics.csv`): revenue $2771.6M (prior $2515.8M, +10%; H2/H1 +3%; last3m +8%), downloads 1120.3M (-6%), RPD $2.47 (prior $2.11). Games (sum of `country_niche_dynamics` game_sub_genre) $1180.9M +1% vs WW games -2.4%; apps $1575.1M +18% vs WW apps +16.7%.
- Top-300 (`country_leader_summary.csv`): $1916.1M, coverage 69% of country, local-publisher share 5.1%, new entrants (released >= 2024-07) 26 apps / $115.1M (6.0%), games share of top-300 43%.

| Niche (dim) | Local prior -> cur $M | Local yoy | WW yoy (WW prior $M) | Gap pp | Excess $M | Local H2/H1 | Top app share of local niche |
|---|---|---|---|---|---|---|---|
| Idle RPG (game) | 19.2 -> 26.2 | +36% | +4% (1343.0) | +32 | 6.1 | +7% | 메이플 키우기 28% |
| Hidden Objects (game) | 17.8 -> 18.4 | +3% | -19% (286.5) | +22 | 4.0 | -11% | June's Journey: Hidden Obj 72% |
| Solitaire (game) | 12.7 -> 19.8 | +56% | +38% (330.0) | +19 | 2.4 | +23% | Disney Solitaire 48% |
| Battle Royale (game) | 17.6 -> 18.5 | +5% | -5% (1980.3) | +10 | 1.8 | +22% | PUBG MOBILE 72% |
| Movies & TV Shows (app) | 202.9 -> 238.1 | +17% | +6% (10056.8) | +12 | 23.3 | +14% |  |
| Dating & Social Discovery (app) | 138.4 -> 139.8 | +1% | -7% (5290.1) | +8 | 11.6 | +6% |  |
| Social Media (app) | 209.8 -> 238.8 | +14% | +10% (10745.0) | +4 | 8.6 | +14% |  |

Under-penetrated WW-growing niches (WW yoy >= +10%, baseline rev >= $100M; PI = niche share of country dim revenue / share in baseline; baseline = WW minus this country minus China for games):

| Niche | Local $M (yoy) | Rev PI | Download PI | WW $M (yoy) |
|---|---|---|---|---|
| Action RPG (game) | 1.2 (-25%) | 0.36 | 1.09 | 182.7 (+20%) |
| Action Sandbox (game) | 1.2 (+35%) | 0.44 | 0.30 | 104.2 (+87%) |
| Realistic Sports (game) | 17.1 (+17%) | 0.52 | 0.68 | 1491.9 (+13%) |
| Music & Podcasts (app) | 42.6 (+12%) | 0.56 | 1.03 | 3189.9 (+17%) |

- Games in top-300 revenue (`country_leaders.csv`): $818.1M, local publishers 0.0%; publisher-country mix: US 24%; China 20%; Turkey 8%; Israel 8%.
- Local champions (top local-publisher apps, `country_leader_summary.local_publishers_top5`): Crave ($36.6M); Sportsnet ($21.6M); TSN: Live Sports, News, Scores ($14.9M); ICI TOU.TV ($6.9M); TextNow: Call + Text Unlimited ($3.8M)
- New game entrants (release >= 2024-07) in top-300 revenue: 18 apps, $85.2M (10.4% of games top-300); largest: Kingshot [4X Strategy, China] $25.5M; Disney Solitaire [Solitaire, Israel] $9.5M; Pokémon TCG Pocket [Card Battler, Japan] $7.8M; 메이플 키우기 [Idle RPG, Japan] $7.3M

### AU — Australia

- Size/growth (`country_dynamics.csv`): revenue $2662.4M (prior $2280.0M, +17%; H2/H1 +4%; last3m +12%), downloads 859.3M (-2%), RPD $3.10 (prior $2.61). Games (sum of `country_niche_dynamics` game_sub_genre) $1071.9M +7% vs WW games -2.4%; apps $1568.1M +25% vs WW apps +16.7%.
- Top-300 (`country_leader_summary.csv`): $1889.5M, coverage 71% of country, local-publisher share 4.8%, new entrants (released >= 2024-07) 27 apps / $101.5M (5.4%), games share of top-300 40%.

| Niche (dim) | Local prior -> cur $M | Local yoy | WW yoy (WW prior $M) | Gap pp | Excess $M | Local H2/H1 | Top app share of local niche |
|---|---|---|---|---|---|---|---|
| Slots (game) | 201.1 -> 209.1 | +4% | -17% (2830.8) | +21 | 41.3 | -3% | Lightning Link Casino Slot 36% |
| 4X Strategy (game) | 132.2 -> 143.9 | +9% | +2% (7414.6) | +7 | 8.6 | -13% | Kingshot 17% |
| Coin Looters (game) | 30.0 -> 32.9 | +10% | -8% (2724.1) | +18 | 5.4 | +7% | MONOPOLY GO! 42% |
| Match Merge 2 (game) | 35.1 -> 70.9 | +102% | +88% (1418.6) | +14 | 5.0 | +33% | Gossip Harbor: Merge & Sto 48% |
| Social Media (app) | 170.3 -> 225.8 | +33% | +10% (10745.0) | +23 | 39.0 | +5% |  |
| Movies & TV Shows (app) | 221.5 -> 265.2 | +20% | +6% (10056.8) | +14 | 30.7 | +9% |  |
| Dating & Social Discovery (app) | 150.8 -> 161.3 | +7% | -7% (5290.1) | +14 | 21.7 | +4% |  |

Under-penetrated WW-growing niches (WW yoy >= +10%, baseline rev >= $100M; PI = niche share of country dim revenue / share in baseline; baseline = WW minus this country minus China for games):

| Niche | Local $M (yoy) | Rev PI | Download PI | WW $M (yoy) |
|---|---|---|---|---|
| Action RPG (game) | 0.9 (-15%) | 0.31 | 0.97 | 182.7 (+20%) |
| Action Sandbox (game) | 1.1 (+53%) | 0.46 | 0.32 | 104.2 (+87%) |
| Realistic Sports (game) | 13.9 (+13%) | 0.46 | 0.72 | 1491.9 (+13%) |
| Music & Podcasts (app) | 33.4 (+12%) | 0.44 | 0.91 | 3189.9 (+17%) |

- Games in top-300 revenue (`country_leaders.csv`): $752.7M, local publishers 0.0%; publisher-country mix: US 30%; China 19%; Turkey 8%; Israel 7%.
- Local champions (top local-publisher apps, `country_leader_summary.local_publishers_top5`): Kayo Sports ($34.7M); Binge ($10.3M); Canva AI Photo & Video Editor ($9.9M); Reading Eggs - Learn to Read ($5.0M); Invoice2go: Easy Invoice Maker ($3.7M)
- New game entrants (release >= 2024-07) in top-300 revenue: 19 apps, $74.5M (9.9% of games top-300); largest: Kingshot [4X Strategy, China] $24.3M; Disney Solitaire [Solitaire, Israel] $6.5M; Pixel Flow! [Sort, Turkey] $6.4M; Pokémon TCG Pocket [Card Battler, Japan] $5.1M

### TW — Taiwan

- Size/growth (`country_dynamics.csv`): revenue $2487.0M (prior $2317.2M, +7%; H2/H1 -5%; last3m -5%), downloads 663.0M (-3%), RPD $3.75 (prior $3.40). Games (sum of `country_niche_dynamics` game_sub_genre) $1757.8M -0% vs WW games -2.4%; apps $734.9M +30% vs WW apps +16.7%.
- No country leaders file for TW (only local niche data).

| Niche (dim) | Local prior -> cur $M | Local yoy | WW yoy (WW prior $M) | Gap pp | Excess $M | Local H2/H1 | Top app share of local niche |
|---|---|---|---|---|---|---|---|
| Geolocation (game) | 20.0 -> 42.1 | +111% | -2% (818.5) | +113 | 22.6 | +93% |  |
| 4X Strategy (game) | 213.1 -> 233.5 | +10% | +2% (7414.6) | +7 | 15.5 | -25% |  |
| Match Merge 2 (game) | 24.5 -> 58.8 | +140% | +88% (1418.6) | +52 | 12.7 | +39% |  |
| Tower Defense (game) | 41.3 -> 58.8 | +43% | +18% (723.0) | +25 | 10.3 | +7% |  |
| Utilities (app) | 48.1 -> 96.3 | +100% | +34% (5011.0) | +66 | 32.0 | +11% |  |
| Movies & TV Shows (app) | 64.5 -> 85.4 | +32% | +6% (10056.8) | +27 | 17.1 | -9% |  |
| Social Media (app) | 184.4 -> 208.7 | +13% | +10% (10745.0) | +3 | 6.4 | +6% |  |

Under-penetrated WW-growing niches (WW yoy >= +10%, baseline rev >= $100M; PI = niche share of country dim revenue / share in baseline; baseline = WW minus this country minus China for games):

| Niche | Local $M (yoy) | Rev PI | Download PI | WW $M (yoy) |
|---|---|---|---|---|
| Solitaire (game) | 1.3 (+41%) | 0.08 | 0.95 | 454.7 (+38%) |
| Sort (game) | 2.5 (+179%) | 0.09 | 1.28 | 753.9 (+283%) |
| Action Sandbox (game) | 0.4 (+19%) | 0.11 | 0.19 | 104.2 (+87%) |
| Eat & Grow (game) | 0.8 (+90%) | 0.11 | 0.96 | 179.3 (+87%) |
| Jobs & Careers (app) | 1.4 (+6%) | 0.12 | 1.10 | 1015.7 (+14%) |
| Religion & Spirituality (app) | 0.3 (+19%) | 0.15 | 0.17 | 152.6 (+29%) |

### BR — Brazil

- Size/growth (`country_dynamics.csv`): revenue $1945.9M (prior $1638.2M, +19%; H2/H1 +8%; last3m +18%), downloads 9378.4M (-2%), RPD $0.21 (prior $0.17). Games (sum of `country_niche_dynamics` game_sub_genre) $478.2M +11% vs WW games -2.4%; apps $1458.9M +21% vs WW apps +16.7%.
- Top-300 (`country_leader_summary.csv`): $1512.5M, coverage 78% of country, local-publisher share 7.4%, new entrants (released >= 2024-07) 36 apps / $74.2M (4.9%), games share of top-300 22%.

| Niche (dim) | Local prior -> cur $M | Local yoy | WW yoy (WW prior $M) | Gap pp | Excess $M | Local H2/H1 | Top app share of local niche |
|---|---|---|---|---|---|---|---|
| Real-Time Strategy (game) | 8.7 -> 15.8 | +82% | -7% (763.6) | +90 | 7.8 | -62% | Clash Royale 87% |
| Match Swap (game) | 48.3 -> 54.4 | +13% | -2% (5274.5) | +15 | 7.2 | +8% | Candy Crush Saga 25% |
| Coin Looters (game) | 16.2 -> 19.4 | +20% | -8% (2724.1) | +28 | 4.6 | +10% | Coin Master 74% |
| Realistic Sports (game) | 22.1 -> 27.4 | +24% | +13% (1316.7) | +11 | 2.4 | +31% | eFootball 46% |
| Movies & TV Shows (app) | 209.5 -> 246.4 | +18% | +6% (10056.8) | +12 | 24.5 | +12% |  |
| Dating & Social Discovery (app) | 78.2 -> 90.8 | +16% | -7% (5290.1) | +24 | 18.4 | +8% |  |
| Personal Health & Fitness (app) | 38.1 -> 47.6 | +25% | +8% (2910.3) | +17 | 6.4 | +5% |  |

Under-penetrated WW-growing niches (WW yoy >= +10%, baseline rev >= $100M; PI = niche share of country dim revenue / share in baseline; baseline = WW minus this country minus China for games):

| Niche | Local $M (yoy) | Rev PI | Download PI | WW $M (yoy) |
|---|---|---|---|---|
| Solitaire (game) | 2.5 (+100%) | 0.54 | 0.76 | 454.7 (+38%) |
| Eat & Grow (game) | 1.0 (+187%) | 0.57 | 0.89 | 179.3 (+87%) |
| Physics (game) | 0.6 (+49%) | 0.58 | 0.88 | 107.2 (+54%) |
| News & Magazines (app) | 3.0 (+13%) | 0.22 | 0.46 | 599.2 (+11%) |
| Food Blogs, Coupons & Recipe Resources (app) | 0.8 (+6%) | 0.32 | 0.43 | 111.0 (+26%) |

- Games in top-300 revenue (`country_leaders.csv`): $329.2M, local publishers 1.0%; publisher-country mix: China 20%; US 12%; Finland 11%; Singapore 10%.
- Local champions (top local-publisher apps, `country_leader_summary.local_publishers_top5`): Globoplay: séries, novelas e + ($51.7M); Serasa: Consulta CPF e Score ($10.0M); Afya Whitebook: App Medicina ($8.6M); Premiere: Jogos ao vivo ($5.3M); Intelbras Mibo Smart ($3.7M)
- New game entrants (release >= 2024-07) in top-300 revenue: 14 apps, $22.3M (6.8% of games top-300); largest: Kingshot [4X Strategy, China] $6.5M; Pokémon TCG Pocket [Card Battler, Japan] $2.5M; Flambé: Merge & Cook [Match Merge 2, China] $2.4M; Disney Solitaire [Solitaire, Israel] $1.6M

### MX — Mexico

- Size/growth (`country_dynamics.csv`): revenue $1627.7M (prior $1258.7M, +29%; H2/H1 +7%; last3m +23%), downloads 5002.8M (-3%), RPD $0.33 (prior $0.24). Games (sum of `country_niche_dynamics` game_sub_genre) $549.7M +10% vs WW games -2.4%; apps $1070.9M +42% vs WW apps +16.7%.
- Top-300 (`country_leader_summary.csv`): $1336.5M, coverage 82% of country, local-publisher share 0.8%, new entrants (released >= 2024-07) 30 apps / $49.3M (3.7%), games share of top-300 34%.

| Niche (dim) | Local prior -> cur $M | Local yoy | WW yoy (WW prior $M) | Gap pp | Excess $M | Local H2/H1 | Top app share of local niche |
|---|---|---|---|---|---|---|---|
| Real-Time Strategy (game) | 8.1 -> 23.3 | +188% | -7% (763.6) | +195 | 15.8 | -63% | Clash Royale 93% |
| Match Merge 2 (game) | 11.6 -> 28.3 | +143% | +88% (1418.6) | +55 | 6.4 | +40% | Gossip Harbor: Merge & Sto 61% |
| 4X Strategy (game) | 26.8 -> 33.2 | +24% | +2% (7414.6) | +22 | 5.8 | -14% | Last War:Survival 19% |
| Match Swap (game) | 43.9 -> 46.4 | +6% | -2% (5274.5) | +8 | 3.5 | +4% | Candy Crush Saga 34% |
| Movies & TV Shows (app) | 206.2 -> 250.9 | +22% | +6% (10056.8) | +16 | 32.6 | +18% |  |
| Utilities (app) | 121.1 -> 189.3 | +56% | +34% (5011.0) | +23 | 27.4 | +3% |  |
| Social Media (app) | 103.8 -> 134.7 | +30% | +10% (10745.0) | +20 | 20.8 | +3% |  |

Under-penetrated WW-growing niches (WW yoy >= +10%, baseline rev >= $100M; PI = niche share of country dim revenue / share in baseline; baseline = WW minus this country minus China for games):

| Niche | Local $M (yoy) | Rev PI | Download PI | WW $M (yoy) |
|---|---|---|---|---|
| Action RPG (game) | 0.4 (-14%) | 0.28 | 0.86 | 182.7 (+20%) |
| Solitaire (game) | 2.0 (+121%) | 0.37 | 0.74 | 454.7 (+38%) |
| Tower Defense (game) | 3.0 (+67%) | 0.43 | 1.42 | 850.9 (+18%) |
| Eat & Grow (game) | 0.9 (+179%) | 0.44 | 1.09 | 179.3 (+87%) |
| Food Blogs, Coupons & Recipe Resources (app) | 0.6 (+24%) | 0.32 | 0.39 | 111.0 (+26%) |
| Jobs & Careers (app) | 5.9 (+57%) | 0.36 | 0.59 | 1015.7 (+14%) |

- Games in top-300 revenue (`country_leaders.csv`): $450.7M, local publishers 0.0%; publisher-country mix: Singapore 27%; US 22%; China 15%; Finland 9%.
- Local champions (top local-publisher apps, `country_leader_summary.local_publishers_top5`): FOX One MX ($7.5M); SkyAlert: Alerta Sísmica MX ($0.6M); REFORMA ($0.6M); Los Reyes ($0.6M); EL NORTE ($0.5M)
- New game entrants (release >= 2024-07) in top-300 revenue: 12 apps, $14.9M (3.3% of games top-300); largest: Kingshot [4X Strategy, China] $3.0M; Pokémon TCG Pocket [Card Battler, Japan] $2.7M; Disney Solitaire [Solitaire, Israel] $1.4M; Screwdom [Screw, Vietnam] $1.3M

### TH — Thailand

- Size/growth (`country_dynamics.csv`): revenue $1188.5M (prior $1006.1M, +18%; H2/H1 +11%; last3m +20%), downloads 2052.5M (-3%), RPD $0.58 (prior $0.48). Games (sum of `country_niche_dynamics` game_sub_genre) $538.5M +5% vs WW games -2.4%; apps $649.9M +31% vs WW apps +16.7%.
- Top-300 (`country_leader_summary.csv`): $981.7M, coverage 83% of country, local-publisher share 4.6%, new entrants (released >= 2024-07) 73 apps / $102.4M (10.4%), games share of top-300 43%.

| Niche (dim) | Local prior -> cur $M | Local yoy | WW yoy (WW prior $M) | Gap pp | Excess $M | Local H2/H1 | Top app share of local niche |
|---|---|---|---|---|---|---|---|
| Sandbox (game) | 30.5 -> 36.0 | +18% | -20% (1106.6) | +38 | 11.7 | +26% | Roblox 92% |
| Battle Royale (game) | 31.7 -> 38.0 | +20% | -5% (1980.3) | +25 | 7.9 | +63% | Garena Free Fire 83% |
| Avatar Life (game) | 2.5 -> 10.9 | +327% | +34% (281.9) | +294 | 7.5 | +5% | Heartopia 83% |
| Turn-based RPG (game) | 11.2 -> 15.1 | +35% | -23% (2061.6) | +58 | 6.5 | -56% | 세븐나이츠 리버스 - 콜라보 49% |
| Utilities (app) | 47.8 -> 131.9 | +176% | +34% (5011.0) | +142 | 67.9 | +89% |  |
| Movies & TV Shows (app) | 102.2 -> 123.0 | +20% | +6% (10056.8) | +14 | 14.8 | +13% |  |
| Dating & Social Discovery (app) | 22.4 -> 26.1 | +16% | -7% (5290.1) | +24 | 5.3 | +6% |  |

Under-penetrated WW-growing niches (WW yoy >= +10%, baseline rev >= $100M; PI = niche share of country dim revenue / share in baseline; baseline = WW minus this country minus China for games):

| Niche | Local $M (yoy) | Rev PI | Download PI | WW $M (yoy) |
|---|---|---|---|---|
| Solitaire (game) | 0.7 (+72%) | 0.14 | 0.24 | 454.7 (+38%) |
| Eat & Grow (game) | 0.3 (+96%) | 0.16 | 0.94 | 179.3 (+87%) |
| Sort (game) | 1.6 (+194%) | 0.19 | 0.72 | 753.9 (+283%) |
| Block (game) | 0.5 (+69%) | 0.19 | 1.17 | 213.5 (+58%) |
| Food Blogs, Coupons & Recipe Resources (app) | 0.1 (+103%) | 0.07 | 0.18 | 111.0 (+26%) |
| News & Magazines (app) | 0.6 (-5%) | 0.10 | 0.19 | 599.2 (+11%) |

- Games in top-300 revenue (`country_leaders.csv`): $426.0M, local publishers 0.6%; publisher-country mix: China 23%; Japan 20%; Singapore 15%; US 15%.
- Local champions (top local-publisher apps, `country_leader_summary.local_publishers_top5`): Monomax บริการดูหนังออนไลน์ ($17.4M); Meb : หนังสือดี นิยายดัง ($7.1M); SUGO-Online Chat Party ($3.4M); readAwrite – รี้ดอะไร้ต์ ($2.9M); oneD ($2.9M)
- New game entrants (release >= 2024-07) in top-300 revenue: 54 apps, $68.4M (16.1% of games top-300); largest: Heartopia [Avatar Life, China] $9.0M; 세븐나이츠 리버스 - 콜라보 [Turn-based RPG, South Korea] $7.4M; Kingshot [4X Strategy, China] $6.1M; CookieRun Classic [Platformer / Runner, South Korea] $4.9M

### TR — Turkey

- Size/growth (`country_dynamics.csv`): revenue $1118.1M (prior $899.5M, +24%; H2/H1 +7%; last3m +18%), downloads 3572.8M (-5%), RPD $0.31 (prior $0.24). Games (sum of `country_niche_dynamics` game_sub_genre) $523.8M +17% vs WW games -2.4%; apps $594.5M +30% vs WW apps +16.7%.
- Top-300 (`country_leader_summary.csv`): $826.2M, coverage 74% of country, local-publisher share 7.2%, new entrants (released >= 2024-07) 42 apps / $74.1M (9.0%), games share of top-300 49%.

| Niche (dim) | Local prior -> cur $M | Local yoy | WW yoy (WW prior $M) | Gap pp | Excess $M | Local H2/H1 | Top app share of local niche |
|---|---|---|---|---|---|---|---|
| 4X Strategy (game) | 83.8 -> 95.9 | +14% | +2% (7414.6) | +12 | 10.1 | -5% | Whiteout Survival 15% |
| Match Swap (game) | 39.6 -> 45.8 | +16% | -2% (5274.5) | +18 | 7.2 | +7% | Royal Match 30% |
| MMORPG (game) | 16.0 -> 16.3 | +2% | -24% (2947.7) | +27 | 4.3 | -15% | Wartune Ultra 15% |
| Coin Looters (game) | 8.4 -> 11.4 | +35% | -8% (2724.1) | +43 | 3.6 | +3% | Top Tycoon: Coin Theme Emp 35% |
| Movies & TV Shows (app) | 34.3 -> 57.1 | +67% | +6% (10056.8) | +61 | 20.9 | +23% |  |
| Dating & Social Discovery (app) | 122.2 -> 125.5 | +3% | -7% (5290.1) | +10 | 12.3 | -7% |  |
| Multimedia & Design Software (app) | 40.3 -> 59.9 | +48% | +18% (3851.9) | +30 | 12.2 | +14% |  |

Under-penetrated WW-growing niches (WW yoy >= +10%, baseline rev >= $100M; PI = niche share of country dim revenue / share in baseline; baseline = WW minus this country minus China for games):

| Niche | Local $M (yoy) | Rev PI | Download PI | WW $M (yoy) |
|---|---|---|---|---|
| Solitaire (game) | 1.4 (+41%) | 0.29 | 0.38 | 454.7 (+38%) |
| Open World Adventure (game) | 1.9 (+40%) | 0.29 | 0.44 | 1019.9 (+40%) |
| Action RPG (game) | 0.7 (-3%) | 0.46 | 0.83 | 182.7 (+20%) |
| Sort (game) | 3.9 (+511%) | 0.46 | 0.61 | 753.9 (+283%) |
| News & Magazines (app) | 1.0 (+45%) | 0.18 | 0.46 | 599.2 (+11%) |
| Music & Podcasts (app) | 10.3 (+40%) | 0.36 | 1.02 | 3189.9 (+17%) |

- Games in top-300 revenue (`country_leaders.csv`): $403.8M, local publishers 7.2%; publisher-country mix: China 32%; US 10%; Singapore 10%; Turkey 7%.
- Local champions (top local-publisher apps, `country_leader_summary.local_publishers_top5`): Royal Match ($13.8M); tabii ($7.6M); Royal Kingdom ($5.5M); Connected2.me ($5.0M); TV+: Film, Dizi & Canlı TV ($4.3M)
- New game entrants (release >= 2024-07) in top-300 revenue: 22 apps, $35.8M (8.9% of games top-300); largest: Kingshot [4X Strategy, China] $11.2M; Top Tycoon: Coin Theme Empir [Coin Looters, Hong Kong] $4.0M; Lands of Jail [4X Strategy, Hong Kong] $3.1M; Mystery Town: Merge Games [Match Merge 2, Hong Kong] $2.2M

### SA — Saudi Arabia

- Size/growth (`country_dynamics.csv`): revenue $1038.6M (prior $897.0M, +16%; H2/H1 +7%; last3m +8%), downloads 1973.8M (-0%), RPD $0.53 (prior $0.45). Games (sum of `country_niche_dynamics` game_sub_genre) $332.3M +4% vs WW games -2.4%; apps $716.1M +21% vs WW apps +16.7%.
- Top-300 (`country_leader_summary.csv`): $876.7M, coverage 84% of country, local-publisher share 3.8%, new entrants (released >= 2024-07) 40 apps / $57.6M (6.6%), games share of top-300 32%.

| Niche (dim) | Local prior -> cur $M | Local yoy | WW yoy (WW prior $M) | Gap pp | Excess $M | Local H2/H1 | Top app share of local niche |
|---|---|---|---|---|---|---|---|
| 4X Strategy (game) | 86.3 -> 96.3 | +12% | +2% (7414.6) | +9 | 8.1 | -15% | Last War:Survival 39% |
| Match Swap (game) | 25.9 -> 27.7 | +7% | -2% (5274.5) | +9 | 2.4 | +16% | Royal Match 48% |
| Tabletop Cards (game) | 12.8 -> 14.0 | +10% | +3% (271.2) | +7 | 0.9 | +13% | كملنا - Kammelna 44% |
| Realistic Sports (game) | 5.6 -> 7.0 | +25% | +13% (1316.7) | +11 | 0.6 | -4% | EA SPORTS FC Mobile Soccer 32% |
| Social Media (app) | 202.0 -> 238.5 | +18% | +10% (10745.0) | +8 | 16.9 | +31% |  |
| Jobs & Careers (app) | 15.3 -> 25.5 | +67% | +14% (890.5) | +53 | 8.0 | +46% |  |
| Sports Entertainment (app) | 3.7 -> 9.0 | +145% | -1% (987.2) | +145 | 5.3 | -2% |  |

Under-penetrated WW-growing niches (WW yoy >= +10%, baseline rev >= $100M; PI = niche share of country dim revenue / share in baseline; baseline = WW minus this country minus China for games):

| Niche | Local $M (yoy) | Rev PI | Download PI | WW $M (yoy) |
|---|---|---|---|---|
| Action RPG (game) | 0.1 (-30%) | 0.13 | 0.82 | 182.7 (+20%) |
| Solitaire (game) | 0.5 (+61%) | 0.17 | 0.27 | 454.7 (+38%) |
| Open World Adventure (game) | 1.5 (+9%) | 0.36 | 0.80 | 1019.9 (+40%) |
| Tower Defense (game) | 1.6 (-5%) | 0.37 | 0.40 | 850.9 (+18%) |
| News & Magazines (app) | 0.4 (+10%) | 0.07 | 0.34 | 599.2 (+11%) |
| Music & Podcasts (app) | 6.2 (+0%) | 0.18 | 0.42 | 3189.9 (+17%) |

- Games in top-300 revenue (`country_leaders.csv`): $280.5M, local publishers 2.4%; publisher-country mix: China 34%; Singapore 20%; US 8%; Turkey 7%.
- Local champions (top local-publisher apps, `country_leader_summary.local_publishers_top5`): ثمانية ($8.1M); JACO بث مباشر :جاكو ($7.5M); كملنا - Kammelna ($6.1M); فضفض - دردشه و شات تعارف ($2.4M); إدارة الملفات (حمّل) ($1.3M)
- New game entrants (release >= 2024-07) in top-300 revenue: 13 apps, $28.0M (10.0% of games top-300); largest: Kingshot [4X Strategy, China] $17.0M; Jackaroo King - Original [Tabletop Cards, Singapore] $3.5M; Tiles Survive! [4X Strategy, Switzerland] $1.4M; Lands of Jail [4X Strategy, Hong Kong] $1.3M

### IN — India

- Size/growth (`country_dynamics.csv`): revenue $905.2M (prior $688.2M, +32%; H2/H1 +17%; last3m +32%), downloads 26056.2M (+4%), RPD $0.03 (prior $0.03). Games (sum of `country_niche_dynamics` game_sub_genre) $297.5M +11% vs WW games -2.4%; apps $604.8M +44% vs WW apps +16.7%.
- Top-300 (`country_leader_summary.csv`): $736.7M, coverage 81% of country, local-publisher share 7.8%, new entrants (released >= 2024-07) 53 apps / $53.2M (7.2%), games share of top-300 35%.

| Niche (dim) | Local prior -> cur $M | Local yoy | WW yoy (WW prior $M) | Gap pp | Excess $M | Local H2/H1 | Top app share of local niche |
|---|---|---|---|---|---|---|---|
| Battle Royale (game) | 108.4 -> 111.6 | +3% | -5% (1980.3) | +8 | 8.6 | +2% | Garena Free Fire 70% |
| Match Swap (game) | 21.1 -> 28.9 | +37% | -2% (5274.5) | +39 | 8.3 | +13% | Candy Crush Saga 40% |
| 4X Strategy (game) | 21.2 -> 25.7 | +21% | +2% (7414.6) | +19 | 4.1 | -18% | Kingshot 21% |
| Coin Looters (game) | 18.2 -> 20.4 | +12% | -8% (2724.1) | +20 | 3.6 | +16% | Coin Master 75% |
| Movies & TV Shows (app) | 61.3 -> 92.0 | +50% | +6% (10056.8) | +44 | 27.1 | +34% |  |
| Social Media (app) | 54.2 -> 80.8 | +49% | +10% (10745.0) | +39 | 21.3 | +3% |  |
| Utilities (app) | 74.9 -> 119.1 | +59% | +34% (5011.0) | +25 | 18.9 | +23% |  |

Under-penetrated WW-growing niches (WW yoy >= +10%, baseline rev >= $100M; PI = niche share of country dim revenue / share in baseline; baseline = WW minus this country minus China for games):

| Niche | Local $M (yoy) | Rev PI | Download PI | WW $M (yoy) |
|---|---|---|---|---|
| Action RPG (game) | 0.1 (+30%) | 0.14 | 0.64 | 182.7 (+20%) |
| Tower Defense (game) | 0.6 (+14%) | 0.17 | 0.53 | 850.9 (+18%) |
| Solitaire (game) | 0.5 (+13%) | 0.19 | 0.17 | 454.7 (+38%) |
| Eat & Grow (game) | 0.3 (+174%) | 0.24 | 0.81 | 179.3 (+87%) |
| Music & Podcasts (app) | 7.7 (+29%) | 0.26 | 0.75 | 3189.9 (+17%) |
| Religion & Spirituality (app) | 0.6 (+46%) | 0.41 | 0.78 | 152.6 (+29%) |

- Games in top-300 revenue (`country_leaders.csv`): $257.6M, local publishers 3.2%; publisher-country mix: Singapore 36%; South Korea 13%; US 10%; Israel 8%.
- Local champions (top local-publisher apps, `country_leader_summary.local_publishers_top5`): Sony LIV: Sports & Entmt ($12.7M); JioHotstar ($8.3M); ZEE5 Movies, Web Series, Shows ($4.3M); Teen Patti Octro Poker & Rummy ($3.1M); CricHeroes-Cricket Scoring App ($1.6M)
- New game entrants (release >= 2024-07) in top-300 revenue: 7 apps, $10.1M (3.9% of games top-300); largest: Kingshot [4X Strategy, China] $5.3M; Top Tycoon: Coin Theme Empir [Coin Looters, Hong Kong] $1.4M; Flambé: Merge & Cook [Match Merge 2, China] $1.2M; Lands of Jail [4X Strategy, Hong Kong] $0.9M

### ID — Indonesia

- Size/growth (`country_dynamics.csv`): revenue $738.7M (prior $735.6M, +0%; H2/H1 +1%; last3m +7%), downloads 8146.3M (+2%), RPD $0.09 (prior $0.09). Games (sum of `country_niche_dynamics` game_sub_genre) $309.0M +1% vs WW games -2.4%; apps $425.3M -0% vs WW apps +16.7%.
- Top-300 (`country_leader_summary.csv`): $575.1M, coverage 78% of country, local-publisher share 4.4%, new entrants (released >= 2024-07) 54 apps / $50.9M (8.8%), games share of top-300 42%.

| Niche (dim) | Local prior -> cur $M | Local yoy | WW yoy (WW prior $M) | Gap pp | Excess $M | Local H2/H1 | Top app share of local niche |
|---|---|---|---|---|---|---|---|
| Virtual Casino (game) | 13.6 -> 37.0 | +173% | +10% (265.5) | +163 | 22.1 | +82% | Higgs Games Island 98% |
| Sandbox (game) | 24.8 -> 25.4 | +2% | -20% (1106.6) | +23 | 5.6 | -39% | Roblox 92% |
| Battle Royale (game) | 18.2 -> 20.2 | +11% | -5% (1980.3) | +16 | 2.9 | -1% | Garena Free Fire 75% |
| Match Merge 2 (game) | 7.8 -> 16.1 | +106% | +88% (1418.6) | +18 | 1.4 | +40% | Gossip Harbor: Merge & Sto 43% |
| Multimedia & Design Software (app) | 34.5 -> 44.3 | +28% | +18% (3851.9) | +10 | 3.5 | +6% |  |
| Business & Productivity Software (app) | 14.4 -> 18.4 | +28% | +15% (1895.1) | +13 | 1.8 | +7% |  |
| Dating & Social Discovery (app) | 17.2 -> 17.3 | +1% | -7% (5290.1) | +8 | 1.4 | -3% |  |

Under-penetrated WW-growing niches (WW yoy >= +10%, baseline rev >= $100M; PI = niche share of country dim revenue / share in baseline; baseline = WW minus this country minus China for games):

| Niche | Local $M (yoy) | Rev PI | Download PI | WW $M (yoy) |
|---|---|---|---|---|
| Solitaire (game) | 0.7 (+47%) | 0.22 | 0.15 | 454.7 (+38%) |
| Eat & Grow (game) | 0.3 (+88%) | 0.26 | 0.75 | 179.3 (+87%) |
| Sort (game) | 1.3 (+188%) | 0.26 | 0.64 | 753.9 (+283%) |
| Physics (game) | 0.2 (+32%) | 0.32 | 0.94 | 107.2 (+54%) |
| Jobs & Careers (app) | 1.6 (+17%) | 0.24 | 0.84 | 1015.7 (+14%) |
| Music & Podcasts (app) | 5.2 (-10%) | 0.25 | 1.02 | 3189.9 (+17%) |

- Games in top-300 revenue (`country_leaders.csv`): $238.7M, local publishers 0.0%; publisher-country mix: China 43%; US 15%; Singapore 13%; Japan 7%.
- Local champions (top local-publisher apps, `country_leader_summary.local_publishers_top5`): Vidio: Sports, Movies, Series ($18.7M); Vision+: Live, Sports & Series ($1.9M); RTI Business ($0.9M); KaryaKarsa: Baca & Buat Cerita ($0.7M); MaxNovel-Baca Novel Online ($0.7M)
- New game entrants (release >= 2024-07) in top-300 revenue: 34 apps, $25.3M (10.6% of games top-300); largest: Kingshot [4X Strategy, China] $5.2M; Heartopia [Avatar Life, China] $2.3M; Magic Chess: Go Go [Auto Chess, Singapore] $2.2M; Flambé: Merge & Cook [Match Merge 2, China] $1.6M

### AE — United Arab Emirates

- Size/growth (`country_dynamics.csv`): revenue $640.9M (prior $578.6M, +11%; H2/H1 +3%; last3m +3%), downloads 630.3M (+7%), RPD $1.02 (prior $0.98). Games (sum of `country_niche_dynamics` game_sub_genre) $201.7M -3% vs WW games -2.4%; apps $439.7M +18% vs WW apps +16.7%.
- Top-300 (`country_leader_summary.csv`): $512.1M, coverage 80% of country, local-publisher share 7.3%, new entrants (released >= 2024-07) 31 apps / $32.8M (6.4%), games share of top-300 32%.

| Niche (dim) | Local prior -> cur $M | Local yoy | WW yoy (WW prior $M) | Gap pp | Excess $M | Local H2/H1 | Top app share of local niche |
|---|---|---|---|---|---|---|---|
| Match Swap (game) | 20.4 -> 21.4 | +5% | -2% (5274.5) | +7 | 1.5 | -4% | Royal Match 39% |
| Realistic Sports (game) | 3.7 -> 5.1 | +38% | +13% (1316.7) | +25 | 0.9 | +9% | eFootball 38% |
| Match Merge 2 (game) | 4.4 -> 8.9 | +102% | +88% (1418.6) | +14 | 0.6 | +24% | Gossip Harbor: Merge & Sto 51% |
| Movies & TV Shows (app) | 46.2 -> 59.1 | +28% | +6% (10056.8) | +22 | 10.2 | +18% |  |
| Sports Entertainment (app) | 6.9 -> 13.4 | +94% | -1% (987.2) | +95 | 6.5 | +61% |  |
| Multimedia & Design Software (app) | 24.3 -> 30.9 | +28% | +18% (3851.9) | +9 | 2.3 | -2% |  |

Under-penetrated WW-growing niches (WW yoy >= +10%, baseline rev >= $100M; PI = niche share of country dim revenue / share in baseline; baseline = WW minus this country minus China for games):

| Niche | Local $M (yoy) | Rev PI | Download PI | WW $M (yoy) |
|---|---|---|---|---|
| Action RPG (game) | 0.1 (-31%) | 0.26 | 0.86 | 182.7 (+20%) |
| Solitaire (game) | 0.5 (-7%) | 0.27 | 0.49 | 454.7 (+38%) |
| Screw (game) | 0.4 (-11%) | 0.44 | 0.91 | 229.0 (+33%) |
| Open World Adventure (game) | 1.2 (+21%) | 0.46 | 1.16 | 1019.9 (+40%) |
| Music & Podcasts (app) | 5.8 (+24%) | 0.27 | 0.54 | 3189.9 (+17%) |
| Food Blogs, Coupons & Recipe Resources (app) | 0.3 (+25%) | 0.34 | 0.70 | 111.0 (+26%) |

- Games in top-300 revenue (`country_leaders.csv`): $164.1M, local publishers 5.5%; publisher-country mix: China 33%; Singapore 18%; Turkey 9%; US 7%.
- Local champions (top local-publisher apps, `country_leader_summary.local_publishers_top5`): Shahid ($15.7M); Yalla Ludo - Ludo&Domino ($6.9M); Telegram ($6.1M); STARZPLAY ستارزبلاي ($2.9M); Jawaker: Games & Friends ($2.1M)
- New game entrants (release >= 2024-07) in top-300 revenue: 13 apps, $18.6M (11.4% of games top-300); largest: Kingshot [4X Strategy, China] $10.7M; Jackaroo King - Original [Tabletop Cards, Singapore] $2.5M; Lands of Jail [4X Strategy, Hong Kong] $0.9M; Castle Clashers! [Artillery Shooter, France] $0.6M

### PH — Philippines

- Size/growth (`country_dynamics.csv`): revenue $525.4M (prior $536.3M, -2%; H2/H1 +2%; last3m +4%), downloads 3591.9M (+3%), RPD $0.15 (prior $0.15). Games (sum of `country_niche_dynamics` game_sub_genre) $228.6M -11% vs WW games -2.4%; apps $295.1M +5% vs WW apps +16.7%.
- Top-300 (`country_leader_summary.csv`): $410.7M, coverage 78% of country, local-publisher share 1.4%, new entrants (released >= 2024-07) 64 apps / $48.5M (11.8%), games share of top-300 44%.

| Niche (dim) | Local prior -> cur $M | Local yoy | WW yoy (WW prior $M) | Gap pp | Excess $M | Local H2/H1 | Top app share of local niche |
|---|---|---|---|---|---|---|---|
| Match Merge 2 (game) | 4.6 -> 10.5 | +127% | +88% (1418.6) | +39 | 1.8 | +27% | Gossip Harbor: Merge & Sto 59% |
| Build & Battle (game) | 6.6 -> 6.9 | +5% | -20% (474.6) | +24 | 1.6 | -2% | Clash of Clans 98% |
| Multimedia & Design Software (app) | 29.7 -> 35.8 | +21% | +18% (3851.9) | +2 | 0.7 | -7% |  |
| Generative AI (app) | 8.7 -> 21.2 | +144% | +139% (2642.4) | +5 | 0.4 | +92% |  |

Under-penetrated WW-growing niches (WW yoy >= +10%, baseline rev >= $100M; PI = niche share of country dim revenue / share in baseline; baseline = WW minus this country minus China for games):

| Niche | Local $M (yoy) | Rev PI | Download PI | WW $M (yoy) |
|---|---|---|---|---|
| Solitaire (game) | 0.4 (+40%) | 0.16 | 0.39 | 454.7 (+38%) |
| Realistic Sports (game) | 1.1 (-49%) | 0.17 | 0.58 | 1491.9 (+13%) |
| Physics (game) | 0.1 (-8%) | 0.17 | 1.00 | 107.2 (+54%) |
| Sort (game) | 0.8 (+102%) | 0.21 | 0.64 | 753.9 (+283%) |
| News & Magazines (app) | 0.6 (-10%) | 0.21 | 0.17 | 599.2 (+11%) |
| Music & Podcasts (app) | 3.3 (+14%) | 0.23 | 0.63 | 3189.9 (+17%) |

- Games in top-300 revenue (`country_leaders.csv`): $180.2M, local publishers 0.0%; publisher-country mix: China 43%; US 22%; South Korea 10%; Singapore 8%.
- Local champions (top local-publisher apps, `country_leader_summary.local_publishers_top5`): Vivamax (VMX) ($2.5M); Viva One ($1.5M); Cignal Play ($0.9M); iWantTFC ($0.7M); SeriousMD Doctors EMR/EHR ($0.3M)
- New game entrants (release >= 2024-07) in top-300 revenue: 44 apps, $32.5M (18.0% of games top-300); largest: Kingshot [4X Strategy, China] $6.9M; Heartopia [Avatar Life, China] $3.3M; RO仙境傳説：世界之旅 [MMORPG, South Korea] $2.3M; 레전드 오브 이미르 [MMORPG, South Korea] $1.9M

### NO — Norway

- Size/growth (`country_dynamics.csv`): revenue $503.8M (prior $396.7M, +27%; H2/H1 +17%; last3m +25%), downloads 145.9M (-2%), RPD $3.45 (prior $2.68). Games (sum of `country_niche_dynamics` game_sub_genre) $185.1M +22% vs WW games -2.4%; apps $314.9M +30% vs WW apps +16.7%.
- Top-300 (`country_leader_summary.csv`): $369.5M, coverage 73% of country, local-publisher share 3.2%, new entrants (released >= 2024-07) 34 apps / $21.0M (5.7%), games share of top-300 35%.

| Niche (dim) | Local prior -> cur $M | Local yoy | WW yoy (WW prior $M) | Gap pp | Excess $M | Local H2/H1 | Top app share of local niche |
|---|---|---|---|---|---|---|---|
| Match Swap (game) | 25.8 -> 29.5 | +14% | -2% (5274.5) | +17 | 4.3 | +0% | Candy Crush Saga 36% |
| 4X Strategy (game) | 20.9 -> 25.6 | +23% | +2% (7414.6) | +20 | 4.2 | +0% | Last War:Survival 16% |
| Geolocation (game) | 5.1 -> 7.9 | +54% | -2% (818.5) | +57 | 2.9 | +102% | Pokémon GO 97% |
| Coin Looters (game) | 8.2 -> 10.1 | +24% | -8% (2724.1) | +32 | 2.6 | +10% | Coin Master 62% |
| Social Media (app) | 36.8 -> 46.5 | +26% | +10% (10745.0) | +17 | 6.1 | +15% |  |
| Personal Health & Fitness (app) | 22.3 -> 29.6 | +33% | +8% (2910.3) | +25 | 5.5 | +33% |  |
| Movies & TV Shows (app) | 48.4 -> 56.2 | +16% | +6% (10056.8) | +10 | 5.0 | +11% |  |

Under-penetrated WW-growing niches (WW yoy >= +10%, baseline rev >= $100M; PI = niche share of country dim revenue / share in baseline; baseline = WW minus this country minus China for games):

| Niche | Local $M (yoy) | Rev PI | Download PI | WW $M (yoy) |
|---|---|---|---|---|
| Action RPG (game) | 0.1 (+19%) | 0.27 | 0.84 | 182.7 (+20%) |
| FPS / 3PS (game) | 0.7 (+1%) | 0.33 | 0.45 | 1602.6 (+33%) |
| Realistic Sports (game) | 1.9 (+25%) | 0.38 | 0.61 | 1491.9 (+13%) |
| Open World Adventure (game) | 0.9 (+62%) | 0.38 | 1.14 | 1019.9 (+40%) |
| Food Blogs, Coupons & Recipe Resources (app) | 0.2 (+31%) | 0.45 | 2.56 | 111.0 (+26%) |
| Religion & Spirituality (app) | 0.4 (+75%) | 0.50 | 0.36 | 152.6 (+29%) |

- Games in top-300 revenue (`country_leaders.csv`): $130.6M, local publishers 0.3%; publisher-country mix: China 21%; US 13%; United Kingdom 10%; Turkey 10%.
- Local champions (top local-publisher apps, `country_leader_summary.local_publishers_top5`): VG ($2.6M); Min Sky - Bildelagring ($1.9M); TIDAL Music: HiFi Sound ($1.9M); Dagbladet Nyheter ($0.8M); DrivstoffAppen ($0.8M)
- New game entrants (release >= 2024-07) in top-300 revenue: 24 apps, $14.9M (11.4% of games top-300); largest: Kingshot [4X Strategy, China] $3.5M; Pixel Flow! [Sort, Turkey] $1.6M; Screwdom [Screw, Vietnam] $1.1M; Flambé: Merge & Cook [Match Merge 2, China] $0.9M

### ZA — South Africa

- Size/growth (`country_dynamics.csv`): revenue $363.6M (prior $259.9M, +40%; H2/H1 +11%; last3m +33%), downloads 1607.3M (+12%), RPD $0.23 (prior $0.18). Games (sum of `country_niche_dynamics` game_sub_genre) $119.7M +27% vs WW games -2.4%; apps $239.8M +47% vs WW apps +16.7%.
- Top-300 (`country_leader_summary.csv`): $237.0M, coverage 65% of country, local-publisher share 1.1%, new entrants (released >= 2024-07) 30 apps / $14.6M (6.2%), games share of top-300 35%.

| Niche (dim) | Local prior -> cur $M | Local yoy | WW yoy (WW prior $M) | Gap pp | Excess $M | Local H2/H1 | Top app share of local niche |
|---|---|---|---|---|---|---|---|
| 4X Strategy (game) | 10.1 -> 13.7 | +36% | +2% (7414.6) | +34 | 3.4 | -15% | Kingshot 14% |
| Sandbox (game) | 6.2 -> 8.2 | +33% | -20% (1106.6) | +53 | 3.3 | -31% | Roblox 91% |
| Match Merge 2 (game) | 6.0 -> 14.0 | +133% | +88% (1418.6) | +45 | 2.7 | +26% | Gossip Harbor: Merge & Sto 61% |
| Match Swap (game) | 17.2 -> 17.4 | +1% | -2% (5274.5) | +3 | 0.6 | -2% | Candy Crush Saga 27% |
| Utilities (app) | 28.1 -> 47.1 | +68% | +34% (5011.0) | +34 | 9.5 | +11% |  |
| Movies & TV Shows (app) | 21.4 -> 30.6 | +43% | +6% (10056.8) | +37 | 7.9 | +24% |  |
| Social Media (app) | 15.5 -> 24.4 | +57% | +10% (10745.0) | +48 | 7.4 | +10% |  |

Under-penetrated WW-growing niches (WW yoy >= +10%, baseline rev >= $100M; PI = niche share of country dim revenue / share in baseline; baseline = WW minus this country minus China for games):

| Niche | Local $M (yoy) | Rev PI | Download PI | WW $M (yoy) |
|---|---|---|---|---|
| Action RPG (game) | 0.1 (+17%) | 0.22 | 0.74 | 182.7 (+20%) |
| Open World Adventure (game) | 0.4 (+67%) | 0.28 | 0.48 | 1019.9 (+40%) |
| Tower Defense (game) | 0.7 (+46%) | 0.48 | 0.30 | 850.9 (+18%) |
| Avatar Life (game) | 0.5 (+42%) | 0.55 | 0.82 | 377.0 (+34%) |
| Music & Podcasts (app) | 6.5 (+49%) | 0.56 | 1.44 | 3189.9 (+17%) |

- Games in top-300 revenue (`country_leaders.csv`): $82.3M, local publishers 0.0%; publisher-country mix: China 23%; US 22%; Turkey 11%; United Kingdom 8%.
- Local champions (top local-publisher apps, `country_leader_summary.local_publishers_top5`): News24: Trusted News. First ($1.1M); Netwerk24 – Alles op een plek ($0.9M); Koer: Afrikaanse Dating App ($0.3M); Health-e Simplified ($0.2M); Labs Assistant ($0.1M)
- New game entrants (release >= 2024-07) in top-300 revenue: 15 apps, $6.4M (7.8% of games top-300); largest: Kingshot [4X Strategy, China] $2.0M; Flambé: Merge & Cook [Match Merge 2, China] $0.8M; 메이플 키우기 [Idle RPG, Japan] $0.6M; Top Tycoon: Coin Theme Empir [Coin Looters, Hong Kong] $0.5M

### VN — Vietnam

- Size/growth (`country_dynamics.csv`): revenue $343.8M (prior $355.2M, -3%; H2/H1 +10%; last3m +1%), downloads 2776.3M (-4%), RPD $0.12 (prior $0.12). Games (sum of `country_niche_dynamics` game_sub_genre) $163.0M -18% vs WW games -2.4%; apps $179.2M +14% vs WW apps +16.7%.
- Top-300 (`country_leader_summary.csv`): $249.3M, coverage 73% of country, local-publisher share 12.7%, new entrants (released >= 2024-07) 89 apps / $41.6M (16.7%), games share of top-300 50%.

| Niche (dim) | Local prior -> cur $M | Local yoy | WW yoy (WW prior $M) | Gap pp | Excess $M | Local H2/H1 | Top app share of local niche |
|---|---|---|---|---|---|---|---|
| Squad RPG (game) | 11.5 -> 11.6 | +1% | -21% (1520.4) | +22 | 2.5 | +5% | OMG 2 Samkok 11% |
| Movies & TV Shows (app) | 14.8 -> 24.3 | +64% | +6% (10056.8) | +58 | 8.7 | +54% |  |
| Education & Training (app) | 9.2 -> 10.5 | +14% | +10% (1621.5) | +4 | 0.4 | +37% |  |

Under-penetrated WW-growing niches (WW yoy >= +10%, baseline rev >= $100M; PI = niche share of country dim revenue / share in baseline; baseline = WW minus this country minus China for games):

| Niche | Local $M (yoy) | Rev PI | Download PI | WW $M (yoy) |
|---|---|---|---|---|
| Solitaire (game) | 0.1 (-62%) | 0.07 | 0.12 | 454.7 (+38%) |
| Sort (game) | 0.3 (+154%) | 0.12 | 0.48 | 753.9 (+283%) |
| Block (game) | 0.1 (+67%) | 0.13 | 2.69 | 213.5 (+58%) |
| Eat & Grow (game) | 0.1 (+91%) | 0.22 | 1.00 | 179.3 (+87%) |
| News & Magazines (app) | 0.4 (-3%) | 0.23 | 0.52 | 599.2 (+11%) |
| Religion & Spirituality (app) | 0.1 (+15%) | 0.26 | 0.11 | 152.6 (+29%) |

- Games in top-300 revenue (`country_leaders.csv`): $123.6M, local publishers 14.3%; publisher-country mix: China 32%; Singapore 24%; Vietnam 14%; Israel 6%.
- Local champions (top local-publisher apps, `country_leader_summary.local_publishers_top5`): Zalo ($4.1M); VieON - Top 1 Phim Chu ($1.9M); FPT Play: Phim, Anime, Bóng Đá ($1.5M); MU: VĨNH HẰNG ($1.5M); Zing MP3 ($1.1M)
- New game entrants (release >= 2024-07) in top-300 revenue: 72 apps, $28.2M (22.8% of games top-300); largest: MU: VĨNH HẰNG [MMORPG, Vietnam] $1.5M; My Garden Tale [Tycoon / Crafting, Hong Kong] $1.3M; MU: Blood Blade [MMORPG, China] $1.3M; Nghịch Thủy Hàn [MMORPG, Singapore] $1.2M

### IE — Ireland

- Size/growth (`country_dynamics.csv`): revenue $313.4M (prior $247.0M, +27%; H2/H1 +3%; last3m +14%), downloads 150.1M (-1%), RPD $2.09 (prior $1.62). Games (sum of `country_niche_dynamics` game_sub_genre) $90.1M +14% vs WW games -2.4%; apps $220.7M +33% vs WW apps +16.7%.
- Top-300 (`country_leader_summary.csv`): $230.9M, coverage 74% of country, local-publisher share 3.9%, new entrants (released >= 2024-07) 25 apps / $8.9M (3.8%), games share of top-300 26%.

| Niche (dim) | Local prior -> cur $M | Local yoy | WW yoy (WW prior $M) | Gap pp | Excess $M | Local H2/H1 | Top app share of local niche |
|---|---|---|---|---|---|---|---|
| Coin Looters (game) | 4.3 -> 5.0 | +18% | -8% (2724.1) | +26 | 1.1 | -8% | Coin Master 51% |
| 4X Strategy (game) | 9.6 -> 10.9 | +13% | +2% (7414.6) | +11 | 1.1 | -15% | Kingshot 15% |
| Match Merge 2 (game) | 4.0 -> 8.2 | +103% | +88% (1418.6) | +15 | 0.6 | +34% | Gossip Harbor: Merge & Sto 42% |
| Match Swap (game) | 13.2 -> 13.3 | +1% | -2% (5274.5) | +3 | 0.5 | -10% | Candy Crush Saga 31% |
| Generative AI (app) | 8.2 -> 29.0 | +254% | +139% (2642.4) | +115 | 9.4 | +25% |  |
| Social Media (app) | 21.4 -> 31.4 | +47% | +10% (10745.0) | +38 | 8.0 | +4% |  |
| Dating & Social Discovery (app) | 19.9 -> 22.1 | +11% | -7% (5290.1) | +19 | 3.7 | -2% |  |

Under-penetrated WW-growing niches (WW yoy >= +10%, baseline rev >= $100M; PI = niche share of country dim revenue / share in baseline; baseline = WW minus this country minus China for games):

| Niche | Local $M (yoy) | Rev PI | Download PI | WW $M (yoy) |
|---|---|---|---|---|
| Action RPG (game) | 0.1 (-1%) | 0.28 | 0.84 | 182.7 (+20%) |
| Open World Adventure (game) | 0.5 (+33%) | 0.48 | 0.84 | 1019.9 (+40%) |
| Tower Defense (game) | 0.6 (+26%) | 0.52 | 1.19 | 850.9 (+18%) |
| FPS / 3PS (game) | 0.6 (-13%) | 0.59 | 0.50 | 1602.6 (+33%) |
| Budget & Expense Tracking (app) | 0.2 (+24%) | 0.45 | 0.68 | 136.3 (+20%) |
| Music & Podcasts (app) | 6.4 (+30%) | 0.60 | 1.00 | 3189.9 (+17%) |

- Games in top-300 revenue (`country_leaders.csv`): $60.9M, local publishers 8.2%; publisher-country mix: China 20%; US 19%; Turkey 11%; United Kingdom 8%.
- Local champions (top local-publisher apps, `country_leader_summary.local_publishers_top5`): The Irish Times ($1.7M); Township ($1.6M); Irish Independent News ($1.4M); Gardenscapes ($1.4M); Homescapes ($1.0M)
- New game entrants (release >= 2024-07) in top-300 revenue: 16 apps, $6.5M (10.7% of games top-300); largest: Kingshot [4X Strategy, China] $1.7M; Flambé: Merge & Cook [Match Merge 2, China] $0.6M; Pixel Flow! [Sort, Turkey] $0.5M; Screwdom [Screw, Vietnam] $0.5M

### AR — Argentina

- Size/growth (`country_dynamics.csv`): revenue $283.8M (prior $201.8M, +41%; H2/H1 +20%; last3m +25%), downloads 1716.3M (-2%), RPD $0.17 (prior $0.11). Games (sum of `country_niche_dynamics` game_sub_genre) $70.2M +20% vs WW games -2.4%; apps $211.3M +49% vs WW apps +16.7%.
- Top-300 (`country_leader_summary.csv`): $202.8M, coverage 71% of country, local-publisher share 0.2%, new entrants (released >= 2024-07) 31 apps / $11.6M (5.7%), games share of top-300 23%.

| Niche (dim) | Local prior -> cur $M | Local yoy | WW yoy (WW prior $M) | Gap pp | Excess $M | Local H2/H1 | Top app share of local niche |
|---|---|---|---|---|---|---|---|
| Match Swap (game) | 6.2 -> 8.0 | +29% | -2% (5274.5) | +32 | 2.0 | +15% | Candy Crush Saga 29% |
| 4X Strategy (game) | 6.5 -> 7.9 | +22% | +2% (7414.6) | +19 | 1.3 | +10% | Last Z: Survival Shooter 11% |
| Battle Royale (game) | 4.2 -> 5.1 | +22% | -5% (1980.3) | +27 | 1.1 | +43% | Garena Free Fire 77% |
| Match Merge 2 (game) | 2.3 -> 5.0 | +121% | +88% (1418.6) | +33 | 0.8 | +56% | Gossip Harbor: Merge & Sto 48% |
| Movies & TV Shows (app) | 18.6 -> 26.5 | +43% | +6% (10056.8) | +37 | 6.8 | +27% |  |
| Multimedia & Design Software (app) | 21.5 -> 30.7 | +43% | +18% (3851.9) | +25 | 5.3 | +1% |  |
| Dating & Social Discovery (app) | 14.4 -> 18.2 | +27% | -7% (5290.1) | +34 | 4.9 | +12% |  |

Under-penetrated WW-growing niches (WW yoy >= +10%, baseline rev >= $100M; PI = niche share of country dim revenue / share in baseline; baseline = WW minus this country minus China for games):

| Niche | Local $M (yoy) | Rev PI | Download PI | WW $M (yoy) |
|---|---|---|---|---|
| Physics (game) | 0.1 (+36%) | 0.36 | 1.10 | 107.2 (+54%) |
| Sort (game) | 0.4 (+357%) | 0.38 | 0.93 | 753.9 (+283%) |
| Action RPG (game) | 0.1 (-18%) | 0.38 | 0.88 | 182.7 (+20%) |
| Eat & Grow (game) | 0.1 (+207%) | 0.49 | 1.02 | 179.3 (+87%) |
| News & Magazines (app) | 0.7 (+11%) | 0.38 | 0.15 | 599.2 (+11%) |
| Music & Podcasts (app) | 5.1 (+82%) | 0.50 | 0.89 | 3189.9 (+17%) |

- Games in top-300 revenue (`country_leaders.csv`): $47.5M, local publishers 0.0%; publisher-country mix: China 21%; US 13%; Singapore 13%; Finland 10%.
- Local champions (top local-publisher apps, `country_leader_summary.local_publishers_top5`): Salvador Di Stefano ($0.2M); Ruta Rentable para Conductores ($0.2M)
- New game entrants (release >= 2024-07) in top-300 revenue: 9 apps, $3.3M (6.9% of games top-300); largest: Kingshot [4X Strategy, China] $0.7M; Imposter Game — Fakeit [Social Party, Poland] $0.6M; Pokémon TCG Pocket [Card Battler, Japan] $0.4M; Flambé: Merge & Cook [Match Merge 2, China] $0.3M

### CO — Colombia

- Size/growth (`country_dynamics.csv`): revenue $267.3M (prior $185.3M, +44%; H2/H1 +24%; last3m +59%), downloads 2038.0M (+3%), RPD $0.13 (prior $0.09). Games (sum of `country_niche_dynamics` game_sub_genre) $61.7M +28% vs WW games -2.4%; apps $203.0M +49% vs WW apps +16.7%.
- Top-300 (`country_leader_summary.csv`): $189.9M, coverage 71% of country, local-publisher share 0.9%, new entrants (released >= 2024-07) 35 apps / $9.7M (5.1%), games share of top-300 21%.

| Niche (dim) | Local prior -> cur $M | Local yoy | WW yoy (WW prior $M) | Gap pp | Excess $M | Local H2/H1 | Top app share of local niche |
|---|---|---|---|---|---|---|---|
| Match Swap (game) | 4.3 -> 5.1 | +18% | -2% (5274.5) | +21 | 0.9 | +7% | Candy Crush Saga 26% |
| 4X Strategy (game) | 4.3 -> 5.3 | +21% | +2% (7414.6) | +19 | 0.8 | -12% | Last Z: Survival Shooter 13% |
| Battle Royale (game) | 5.4 -> 5.8 | +7% | -5% (1980.3) | +12 | 0.7 | +27% | Garena Free Fire 75% |
| Movies & TV Shows (app) | 19.4 -> 26.7 | +38% | +6% (10056.8) | +32 | 6.2 | +39% |  |
| Multimedia & Design Software (app) | 17.9 -> 27.0 | +51% | +18% (3851.9) | +33 | 5.9 | +12% |  |
| Generative AI (app) | 7.0 -> 22.7 | +222% | +139% (2642.4) | +83 | 5.9 | +115% |  |

Under-penetrated WW-growing niches (WW yoy >= +10%, baseline rev >= $100M; PI = niche share of country dim revenue / share in baseline; baseline = WW minus this country minus China for games):

| Niche | Local $M (yoy) | Rev PI | Download PI | WW $M (yoy) |
|---|---|---|---|---|
| Eat & Grow (game) | 0.1 (+210%) | 0.40 | 1.01 | 179.3 (+87%) |
| Solitaire (game) | 0.3 (+228%) | 0.51 | 0.59 | 454.7 (+38%) |
| Open World Adventure (game) | 0.4 (+40%) | 0.57 | 1.07 | 1019.9 (+40%) |
| Sort (game) | 0.6 (+367%) | 0.58 | 0.96 | 753.9 (+283%) |
| Food Blogs, Coupons & Recipe Resources (app) | 0.1 (+26%) | 0.20 | 0.72 | 111.0 (+26%) |
| News & Magazines (app) | 0.5 (+43%) | 0.29 | 0.27 | 599.2 (+11%) |

- Games in top-300 revenue (`country_leaders.csv`): $40.6M, local publishers 0.0%; publisher-country mix: China 19%; US 18%; Singapore 14%; Finland 9%.
- Local champions (top local-publisher apps, `country_leader_summary.local_publishers_top5`): silBe: Fitness for her ($0.9M); Treinta - Gestiona tu negocio ($0.5M); Periódico EL TIEMPO - Noticias ($0.2M); Platzi - Cursos online ($0.1M)
- New game entrants (release >= 2024-07) in top-300 revenue: 10 apps, $1.7M (4.2% of games top-300); largest: Kingshot [4X Strategy, China] $0.4M; Imposter Game — Fakeit [Social Party, Poland] $0.2M; Pokémon TCG Pocket [Card Battler, Japan] $0.2M; Top Tycoon: Coin Theme Empir [Coin Looters, Hong Kong] $0.2M

### HU — Hungary

- Size/growth (`country_dynamics.csv`): revenue $220.0M (prior $160.8M, +37%; H2/H1 +16%; last3m +38%), downloads 252.6M (-3%), RPD $0.87 (prior $0.62). Games (sum of `country_niche_dynamics` game_sub_genre) $92.5M +31% vs WW games -2.4%; apps $126.4M +41% vs WW apps +16.7%.
- Top-300 (`country_leader_summary.csv`): $172.9M, coverage 79% of country, local-publisher share 0.8%, new entrants (released >= 2024-07) 32 apps / $8.1M (4.7%), games share of top-300 42%.

| Niche (dim) | Local prior -> cur $M | Local yoy | WW yoy (WW prior $M) | Gap pp | Excess $M | Local H2/H1 | Top app share of local niche |
|---|---|---|---|---|---|---|---|
| Match Swap (game) | 9.1 -> 12.3 | +36% | -2% (5274.5) | +38 | 3.4 | +13% | Gardenscapes 22% |
| 4X Strategy (game) | 6.9 -> 9.7 | +39% | +2% (7414.6) | +37 | 2.6 | -7% | Last War:Survival 13% |
| Match Merge 2 (game) | 3.1 -> 8.3 | +166% | +88% (1418.6) | +78 | 2.4 | +58% | Gossip Harbor: Merge & Sto 42% |
| Coin Looters (game) | 4.2 -> 5.2 | +25% | -8% (2724.1) | +33 | 1.4 | +4% | Coin Master 45% |
| Movies & TV Shows (app) | 15.8 -> 19.8 | +25% | +6% (10056.8) | +20 | 3.1 | +27% |  |
| Generative AI (app) | 5.9 -> 17.0 | +188% | +139% (2642.4) | +49 | 2.9 | +73% |  |
| Dating & Social Discovery (app) | 7.2 -> 9.1 | +27% | -7% (5290.1) | +34 | 2.5 | +46% |  |

Under-penetrated WW-growing niches (WW yoy >= +10%, baseline rev >= $100M; PI = niche share of country dim revenue / share in baseline; baseline = WW minus this country minus China for games):

| Niche | Local $M (yoy) | Rev PI | Download PI | WW $M (yoy) |
|---|---|---|---|---|
| Action RPG (game) | 0.1 (-1%) | 0.36 | 1.14 | 182.7 (+20%) |
| Eat & Grow (game) | 0.1 (+129%) | 0.39 | 1.17 | 179.3 (+87%) |
| Open World Adventure (game) | 0.5 (+31%) | 0.43 | 0.94 | 1019.9 (+40%) |
| Religion & Spirituality (app) | 0.1 (+91%) | 0.41 | 0.17 | 152.6 (+29%) |
| Jobs & Careers (app) | 0.8 (+48%) | 0.42 | 0.60 | 1015.7 (+14%) |

- Games in top-300 revenue (`country_leaders.csv`): $71.8M, local publishers 0.0%; publisher-country mix: China 18%; US 12%; Ireland 10%; Israel 9%.
- Local champions (top local-publisher apps, `country_leader_summary.local_publishers_top5`): GLAMOUR Hungary ($0.4M); likner - Chat without pictures ($0.2M); KönyvKlub: Könyvösszefoglalók ($0.2M); Eromodo - Dorințe în Siguranță ($0.2M); Xeropan: AI Language Learning ($0.2M)
- New game entrants (release >= 2024-07) in top-300 revenue: 18 apps, $5.6M (7.8% of games top-300); largest: Kingshot [4X Strategy, China] $1.1M; Top Tycoon: Coin Theme Empir [Coin Looters, Hong Kong] $0.8M; Flambé: Merge & Cook [Match Merge 2, China] $0.6M; Disney Solitaire [Solitaire, Israel] $0.5M

### RU — Russia

- Size/growth (`country_dynamics.csv`): revenue $207.1M (prior $348.4M, -41%; H2/H1 -100%; last3m -100%), downloads 4645.7M (-6%), RPD $0.04 (prior $0.07). Games (sum of `country_niche_dynamics` game_sub_genre) $111.1M -38% vs WW games -2.4%; apps $96.0M -43% vs WW apps +16.7%.
- Top-300 (`country_leader_summary.csv`): $167.8M, coverage 81% of country, local-publisher share 14.0%, new entrants (released >= 2024-07) 21 apps / $11.2M (6.7%), games share of top-300 54%.

| Niche (dim) | Local prior -> cur $M | Local yoy | WW yoy (WW prior $M) | Gap pp | Excess $M | Local H2/H1 | Top app share of local niche |
|---|---|---|---|---|---|---|---|

Under-penetrated WW-growing niches (WW yoy >= +10%, baseline rev >= $100M; PI = niche share of country dim revenue / share in baseline; baseline = WW minus this country minus China for games):

| Niche | Local $M (yoy) | Rev PI | Download PI | WW $M (yoy) |
|---|---|---|---|---|
| Solitaire (game) | 0.1 (-46%) | 0.13 | 1.45 | 454.7 (+38%) |
| Physics (game) | 0.0 (-15%) | 0.18 | 1.39 | 107.2 (+54%) |
| Realistic Sports (game) | 0.8 (-47%) | 0.26 | 0.44 | 1491.9 (+13%) |
| Eat & Grow (game) | 0.1 (-23%) | 0.34 | 1.18 | 179.3 (+87%) |
| Jobs & Careers (app) | 0.0 (-51%) | 0.01 | 1.37 | 1015.7 (+14%) |
| News & Magazines (app) | 0.2 (-48%) | 0.18 | 0.43 | 599.2 (+11%) |

- Games in top-300 revenue (`country_leaders.csv`): $90.9M, local publishers 6.7%; publisher-country mix: China 30%; Ireland 13%; Turkey 12%; Cyprus 11%.
- Local champions (top local-publisher apps, `country_leader_summary.local_publishers_top5`): Tanks Blitz - PVP MMO ($3.8M); Okko - movies & series online ($2.9M); VK Music: playlists & podcasts ($2.5M); Литрес: Книги и аудиокниги ($1.7M); Yandex Music, Books & Podcasts ($1.0M)
- New game entrants (release >= 2024-07) in top-300 revenue: 17 apps, $10.1M (11.1% of games top-300); largest: Tiles Survive! [4X Strategy, Switzerland] $7.3M; Top Tycoon: Coin Theme Empir [Coin Looters, Hong Kong] $0.7M; Fate War [4X Strategy, China] $0.3M; Perfect World: Ascend [MMORPG, Singapore] $0.3M

### PK — Pakistan

- Size/growth (`country_dynamics.csv`): revenue $50.8M (prior $45.2M, +12%; H2/H1 +4%; last3m +9%), downloads 3678.0M (-4%), RPD $0.01 (prior $0.01). Games (sum of `country_niche_dynamics` game_sub_genre) $14.1M -3% vs WW games -2.4%; apps $36.6M +19% vs WW apps +16.7%.
- Top-300 (`country_leader_summary.csv`): $38.7M, coverage 76% of country, local-publisher share 0.4%, new entrants (released >= 2024-07) 28 apps / $1.7M (4.4%), games share of top-300 28%.

| Niche (dim) | Local prior -> cur $M | Local yoy | WW yoy (WW prior $M) | Gap pp | Excess $M | Local H2/H1 | Top app share of local niche |
|---|---|---|---|---|---|---|---|
| Match Swap (game) (TINY base) | 1.3 -> 1.4 | +7% | -2% (5274.5) | +9 | 0.1 | -2% | Candy Crush Saga 40% |
| Board (game) (TINY base) | 1.5 -> 1.6 | +10% | +3% (347.5) | +7 | 0.1 | -1% | Ludo STAR 63% |
| 4X Strategy (game) (TINY base) | 1.9 -> 2.0 | +6% | +2% (7414.6) | +3 | 0.1 | -25% | Last Z: Survival Shooter 15% |
| Movies & TV Shows (app) (TINY base) | 1.3 -> 2.3 | +83% | +6% (10056.8) | +77 | 1.0 | +40% |  |
| Dating & Social Discovery (app) (TINY base) | 3.1 -> 3.7 | +19% | -7% (5290.1) | +26 | 0.8 | +7% |  |
| Multimedia & Design Software (app) (TINY base) | 3.0 -> 3.7 | +26% | +18% (3851.9) | +7 | 0.2 | -10% |  |

Under-penetrated WW-growing niches (WW yoy >= +10%, baseline rev >= $100M; PI = niche share of country dim revenue / share in baseline; baseline = WW minus this country minus China for games):

| Niche | Local $M (yoy) | Rev PI | Download PI | WW $M (yoy) |
|---|---|---|---|---|
| Action RPG (game) | 0.0 (-46%) | 0.22 | 0.61 | 182.7 (+20%) |
| Screw (game) | 0.0 (+41%) | 0.27 | 0.50 | 229.0 (+33%) |
| Tower Defense (game) | 0.1 (-24%) | 0.29 | 0.30 | 850.9 (+18%) |
| Solitaire (game) | 0.0 (+27%) | 0.30 | 0.13 | 454.7 (+38%) |
| Music & Podcasts (app) | 0.5 (+37%) | 0.27 | 0.75 | 3189.9 (+17%) |
| News & Magazines (app) | 0.1 (+20%) | 0.30 | 0.34 | 599.2 (+11%) |

- Games in top-300 revenue (`country_leaders.csv`): $10.6M, local publishers 0.0%; publisher-country mix: China 26%; Singapore 12%; India 12%; US 11%.
- Local champions (top local-publisher apps, `country_leader_summary.local_publishers_top5`): DigiKhata - Expense Tracker ($0.1M); Islam360: Quran, Hadith, Qibla ($0.0M); Dil Ka Rishta ($0.0M); Quran Majeed – القران الكريم ($0.0M)
- New game entrants (release >= 2024-07) in top-300 revenue: 6 apps, $0.5M (4.4% of games top-300); largest: Kingshot [4X Strategy, China] $0.2M; Top Tycoon: Coin Theme Empir [Coin Looters, Hong Kong] $0.1M; Lands of Jail [4X Strategy, Hong Kong] $0.0M; Castle Clashers! [Artillery Shooter, France] $0.0M

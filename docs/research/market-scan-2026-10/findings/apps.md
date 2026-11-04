# Non-game apps: market map, growth sources and prototype hypotheses

Segment: APPS (non-game). Windows: current 12m = 2025-10..2026-09, prior 12m = 2024-10..2025-09; H2/H1 = 2026-04..09 vs 2025-10..2026-03; last3m = Jul-Sep 2026 vs Jul-Sep 2025. Data room: `/Users/gleb/Documents/Codex/2026-10-10/sensor-tower/analysis/out/`. All numbers come from python3 -I (stdlib csv) scripts over the files cited. "$M" means millions of USD.

## 0. Measurement boundary and method notes

- **What the revenue numbers are.** Sensor Tower store estimates: App Store + Google Play in-app purchases and paid downloads only. They exclude ad revenue, web/D2C payments (web2app subscriptions are common in AI, fitness, dating, and streaming such as Disney+), third-party Android stores (mainland-China Android is mostly missing), and PC/web. So ad-funded categories (Social Media, Utilities' free tools, Prank & Humor, Customization, Navigation) look small in revenue. For them, use downloads and US time spent (`ts_*`).
- **Totals.** Non-game App IQ revenue was $66,258M in cur vs $56,791M prior, +16.7% (`summary.json` totals_ww.app_sub_category_sum). Downloads were 97.1B, +3.7%. The store-category non-games cut is $67,534M, +16.8% (`unified_primary_non_games`). For comparison, games fell -2.4%.
- **Time spent.** `ts_*` is US-only, in opaque units, so only its ratios mean anything (`summary.json` units). I derive "implied users yoy" = (1+ts_yoy)/(1+ts_per_user_yoy)-1. I also compare a sub-category's share of US time (ts_cur over the sum of all sub-categories) with its share of US revenue (`rev_share_us_cur`).
- **Leaf categories.** `niche_leaders_full_app_iq_category.csv` has 384 leaves. 197 are `complete` and 187 are `zero_rows`; the zero-row leaves are legacy duplicate tags, not empty markets. There is no WW total per leaf (ww_total empty), so leaf sizes are **top-100 revenue sums**. Each app has exactly one leaf tag: 0 apps appear in more than one leaf in `niche_top_apps.csv`.
- **Leaf to sub-category mapping.** The data room has no parent mapping. The "inferred parent" column comes from leaf names and from checking that leaf sums add up to the sub-category totals. Examples: AI Assistant 5,365 + AI Companion 474 + AI Content Generator 355 + Generative AI 23 = 6,217 vs the Generative AI sub-category at 6,320. Education leaves add to 1,773 vs Education & Training at 1,777. Treat the mapping as an approximation.
- **Small bases.** 52 of 83 sub-categories have rev_prior < $50M. Together they hold $913M of the $66,258M (1.4%). They are flagged everywhere, and their growth rates should not be read as market signals.
- **Reclassification test design.** A sub-category's yoy can only be inflated by re-tagging if prior-period revenue sits under old tags. Here the prior top-100 lists already contain today's tags. For example, ChatGPT shows $1,755M prior inside AI Assistant (`niche_top_apps.csv`). Monthly sub-category series also show no step changes (section 2.4). So the yoy figures compare like with like on the current taxonomy. The real reclassification risk is a **boundary** risk: the same kind of product sits under different tags (section 2.4).

## 1. Map

### 1.1 App IQ categories (15) — `niche_dynamics_app_category.csv`

| category | rev cur $M | prior $M | yoy | Δ $M | H2/H1 | last3m | class/momentum | dl cur M | dl yoy | US ts yoy |
|---|---|---|---|---|---|---|---|---|---|---|
| Media & Entertainment | 34999 | 33378 | +5% | 1622 | +4% | +5% | flat/steady | 21098 | +5% | +5% |
| Software | 20649 | 14152 | +46% | 6496 | +16% | +37% | growing/accelerating | 36330 | +3% | +11% |
| Health & Wellness | 3328 | 3064 | +9% | 264 | +5% | +3% | flat/steady | 3900 | -3% | +2% |
| Jobs & Education | 2829 | 2555 | +11% | 274 | +6% | +13% | growing/accelerating | 3190 | +6% | +3% |
| Lifestyle & Services | 1853 | 1544 | +20% | 310 | +12% | +11% | growing/accelerating | 3716 | +3% | +6% |
| Shopping | 707 | 596 | +19% | 111 | -6% | +5% | growing/decelerating | 6438 | -1% | +6% |
| Financial Services | 662 | 477 | +39% | 185 | +6% | +30% | growing/accelerating | 8729 | +6% | +0% |
| Travel & Tourism | 525 | 417 | +26% | 109 | +31% | +19% | growing/accelerating | 4539 | +3% | +4% |
| Auto | 252 | 233 | +8% | 19 | +1% | +5% | flat/steady | 1092 | +10% | +6% |
| Religion & Spirituality | 153 | 119 | +29% | 34 | -11% | +24% | growing/decelerating | 1206 | +2% | +7% |
| Food & Dining Services | 148 | 115 | +29% | 33 | +7% | +21% | growing/accelerating | 2373 | +1% | -0% |
| Business & Industrials | 60 | 53 | +13% | 7 | +14% | +23% | growing/accelerating | 553 | +13% | -16% |
| Real Estate | 35 | 34 | +5% | 2 | +9% | +10% | flat/accelerating | 265 | +2% | -2% |
| Telecom | 29 | 28 | +3% | 1 | -5% | -5% | flat/steady | 1575 | -3% | +2% |
| Law & Government | 28 | 27 | +5% | 1 | +6% | -11% | flat/accelerating | 2133 | +22% | +1% |

What the table shows. Software (+$6,496M, +46%) produced 69% of the non-game revenue gain, and Media & Entertainment (+$1,622M, +5%) is the stagnant giant. Shopping, Financial Services and Food & Dining show high US ad-impression intensity with almost no IAP (ad_intensity_cur 16 / 11 / 23). They are commerce funnels and out of scope for IAP products.

### 1.2 Store primary categories (non-games) — `niche_dynamics_unified_app_primary_category.csv`

| store category (id) | rev cur $M | prior $M | yoy | Δ $M | H2/H1 | last3m | class/momentum | dl cur M | dl yoy |
|---|---|---|---|---|---|---|---|---|---|
| Entertainment (6016) | 17504 | 16342 | +7% | 1162 | +5% | +7% | flat/steady | 12632 | +18% |
| Productivity (6007) | 11418 | 6794 | +68% | 4624 | +23% | +53% | growing/accelerating | 11589 | +8% |
| Photo & Video (6008) | 8018 | 6846 | +17% | 1172 | +7% | +16% | growing/accelerating | 8731 | -0% |
| Social Networking (6005) | 5194 | 4689 | +11% | 505 | +7% | +12% | growing/accelerating | 6369 | -4% |
| Music (6011) | 3745 | 3126 | +20% | 619 | +11% | +23% | growing/accelerating | 3573 | -5% |
| Lifestyle (6012) | 3684 | 3767 | -2% | -83 | +4% | -3% | flat/steady | 5104 | +2% |
| Education (6017) | 2806 | 2561 | +10% | 245 | +3% | +11% | flat/steady | 4612 | -1% |
| Health & Fitness (6013) | 2730 | 2554 | +7% | 176 | +3% | +1% | flat/steady | 2735 | -3% |
| Books (6018) | 2435 | 2588 | -6% | -153 | -4% | -12% | declining/steady | 1109 | -9% |
| Utilities (6002) | 2426 | 1953 | +24% | 473 | +8% | +17% | growing/accelerating | 15774 | +9% |
| Business (6000) | 2061 | 1747 | +18% | 313 | +13% | +16% | growing/accelerating | 3755 | +9% |
| Sports (6004) | 1378 | 1336 | +3% | 41 | +10% | +7% | flat/accelerating | 1562 | +12% |
| News (6009) | 807 | 740 | +9% | 67 | -0% | +7% | flat/steady | 635 | -6% |
| Shopping (6024) | 692 | 585 | +18% | 108 | -5% | +6% | growing/decelerating | 6125 | -0% |
| Navigation (6010) | 571 | 469 | +22% | 103 | +25% | +22% | growing/accelerating | 1375 | +4% |
| Graphics & Design (6027) | 521 | 448 | +16% | 73 | -3% | +1% | growing/steady | 1567 | +7% |
| Finance (6015) | 435 | 363 | +20% | 72 | -3% | +12% | growing/steady | 8811 | +8% |
| Reference (6006) | 358 | 294 | +22% | 64 | +1% | +19% | growing/steady | 791 | +3% |
| Weather (6001) | 206 | 186 | +11% | 20 | +12% | +6% | growing/accelerating | 452 | +0% |
| Travel (6003) | 195 | 146 | +34% | 50 | +21% | +20% | growing/accelerating | 3657 | +7% |
| Medical (6020) | 152 | 131 | +16% | 21 | +5% | +9% | growing/steady | 802 | +9% |
| Food & Drink (6023) | 145 | 111 | +31% | 34 | +8% | +25% | growing/accelerating | 2247 | +6% |
| Developer Tools (6026) | 28 | 22 | +28% | 6 | +20% | +27% | growing/accelerating | 104 | +45% |
| Newsstand (6021) | 25 | 24 | +3% | 1 | -8% | -4% | flat/decelerating | 15 | +48% |
| Stickers (6025) | 0 | 0 | +56% | 0 | -45% | -50% | growing/decelerating | 0 | -27% |

Productivity (+$4,624M, +68%) is the store-category view of the AI boom: ChatGPT lists under Productivity. The two taxonomies (App IQ vs store category) agree on the total within 1.9% (`summary.json` consistency_checks).

### 1.3 All 83 App IQ sub-categories — `niche_dynamics_app_sub_category.csv`

Sorted by current revenue. "US imp share" is the niche's share of US ad impressions (`imp_cur`). "ad-int US rank" is 1 = most ad-heavy among niches with prior revenue of at least $20M (blank = not ranked). Small-base rows are flagged.

| # | sub-category | rev cur $M | rev prior $M | yoy | Δ $M | H2/H1 | last3m yoy | class / momentum | dl cur M | dl yoy | RPD $ | US ts yoy | US imp share cur | imp Δpp | ad-int US rank | flag |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Social Media | 11787 | 10745 | +10% | 1042 | +7% | +11% | flat / accelerating | 8127 | -3% | 1.45 | +5% | 18.4% | +1.6 | 20 |  |
| 2 | Movies & TV Shows | 10647 | 10057 | +6% | 590 | +5% | +8% | flat / accelerating | 6492 | +34% | 1.64 | -2% | 5.0% | -0.4 | 37 |  |
| 3 | Utilities | 6702 | 5011 | +34% | 1691 | +11% | +27% | growing / accelerating | 15886 | -2% | 0.42 | +8% | 9.8% | +3.9 | 22 |  |
| 4 | Generative AI | 6320 | 2642 | +139% | 3678 | +47% | +103% | growing / accelerating | 4438 | +36% | 1.42 | +80% | 5.3% | +1.0 | 28 |  |
| 5 | Dating & Social Discovery | 4899 | 5290 | -7% | -391 | -2% | -11% | declining / steady | 2452 | -6% | 2.00 | -6% | 1.6% | -0.3 | 38 |  |
| 6 | Multimedia & Design Software | 4553 | 3852 | +18% | 701 | +0% | +10% | growing / steady | 6644 | -3% | 0.69 | +5% | 3.2% | -0.7 | 29 |  |
| 7 | Music & Podcasts | 3190 | 2733 | +17% | 457 | +10% | +20% | growing / accelerating | 1328 | -9% | 2.40 | -2% | 1.2% | +0.0 | 35 |  |
| 8 | Personal Health & Fitness | 3150 | 2910 | +8% | 239 | +4% | +3% | flat / steady | 2778 | -6% | 1.13 | +2% | 3.6% | -0.5 | 26 |  |
| 9 | Books & Comics | 2816 | 2966 | -5% | -150 | -2% | -9% | declining / steady | 897 | -8% | 3.14 | -2% | 3.9% | +0.5 | 16 |  |
| 10 | Business & Productivity Software | 2183 | 1895 | +15% | 288 | -6% | +3% | growing / decelerating | 5564 | +1% | 0.39 | -0% | 2.0% | +0.2 | 25 |  |
| 11 | Education & Training | 1777 | 1622 | +10% | 155 | +0% | +14% | flat / steady | 2531 | +6% | 0.70 | +4% | 1.5% | -0.4 | 24 |  |
| 12 | Jobs & Careers | 1016 | 890 | +14% | 125 | +17% | +14% | growing / accelerating | 515 | +2% | 1.97 | +3% | 1.5% | +1.1 | 21 |  |
| 13 | Hobbies & Interests Services | 1007 | 890 | +13% | 117 | +13% | +7% | growing / accelerating | 1468 | +1% | 0.69 | +8% | 1.1% | -0.2 | 27 |  |
| 14 | Sports Entertainment | 980 | 987 | -1% | -7 | +6% | +5% | flat / accelerating | 985 | +16% | 1.00 | +3% | 0.3% | +0.2 | 41 |  |
| 15 | Antivirus & Security | 867 | 737 | +18% | 130 | +5% | +10% | growing / steady | 3575 | +8% | 0.24 | +1% | 2.0% | +0.2 | 15 |  |
| 16 | Shopping | 606 | 499 | +21% | 107 | -7% | +6% | growing / decelerating | 2761 | -5% | 0.22 | +4% | 3.8% | -2.7 | 8 |  |
| 17 | News & Magazines | 599 | 539 | +11% | 60 | -1% | +5% | growing / steady | 305 | -22% | 1.96 | -16% | 0.6% | -0.3 | 23 |  |
| 18 | Home & Garden Services | 530 | 399 | +33% | 132 | +9% | +17% | growing / accelerating | 1164 | +6% | 0.46 | -2% | 0.1% | +0.0 | 44 |  |
| 19 | Transportation | 444 | 352 | +26% | 92 | +34% | +20% | growing / accelerating | 3546 | +4% | 0.13 | +4% | 1.1% | +0.1 | 11 |  |
| 20 | Parenting Resources | 154 | 128 | +21% | 27 | +6% | +12% | growing / accelerating | 217 | +5% | 0.71 | +18% | 0.1% | -0.4 | 34 |  |
| 21 | Religion & Spirituality | 153 | 119 | +29% | 34 | -11% | +24% | growing / decelerating | 1206 | +2% | 0.13 | +7% | 0.5% | +0.2 | 17 |  |
| 22 | Tax Preparation & Accounting | 147 | 117 | +26% | 30 | +4% | +22% | growing / steady | 129 | +15% | 1.15 | +22% | 0.6% | +0.0 | 13 |  |
| 23 | Budget & Expense Tracking | 136 | 113 | +20% | 23 | +0% | +17% | growing / steady | 243 | +31% | 0.56 | +5% | 0.9% | -0.7 | 6 |  |
| 24 | Financial News | 111 | 91 | +22% | 20 | -17% | +3% | growing / decelerating | 122 | +27% | 0.91 | +13% | 0.0% | +0.0 | 42 |  |
| 25 | Food Blogs, Coupons & Recipe Resources | 111 | 88 | +26% | 23 | +6% | +19% | growing / accelerating | 75 | -9% | 1.48 | +5% | 0.3% | +0.2 | 9 |  |
| 26 | Digital Wallets & P2P Payments | 111 | 8 | +1339% | 103 | +62% | +726% | growing / accelerating | 1909 | +5% | 0.06 | -1% | 0.9% | -0.5 | - | SMALL BASE (<$50M prior) |
| 27 | Automotive Research | 90 | 78 | +14% | 11 | +13% | +13% | growing / accelerating | 215 | +10% | 0.42 | +11% | 0.1% | -0.0 | 14 |  |
| 28 | Health Media & Publications | 85 | 75 | +13% | 10 | -1% | +4% | growing / steady | 57 | -5% | 1.50 | +46% | 0.0% | +0.0 | 45 |  |
| 29 | Lifestyle & Services | 84 | 51 | +64% | 33 | +28% | +42% | growing / accelerating | 223 | +15% | 0.38 | +63% | 0.3% | +0.1 | 19 |  |
| 30 | Investing & Financial Management | 82 | 83 | -2% | -1 | -8% | -24% | flat / decelerating | 939 | -18% | 0.09 | -17% | 2.8% | -2.3 | 2 |  |
| 31 | Motorsport | 64 | 76 | -16% | -12 | -24% | -26% | declining / decelerating | 18 | -6% | 3.51 | -34% | - | - | - |  |
| 32 | Buy & Sell | 55 | 56 | -1% | -1 | +2% | -7% | flat / steady | 585 | +12% | 0.09 | +25% | 3.5% | +2.8 | 5 |  |
| 33 | Media & Entertainment | 52 | 42 | +24% | 10 | -11% | +9% | growing / decelerating | 125 | +4% | 0.41 | -2% | 0.0% | -0.0 | 39 | SMALL BASE (<$50M prior) |
| 34 | Health & Wellness | 39 | 32 | +23% | 7 | +29% | +13% | growing / accelerating | 86 | -7% | 0.46 | -30% | 0.0% | +0.0 | 40 | SMALL BASE (<$50M prior) |
| 35 | Beauty Services & Spas | 38 | 33 | +13% | 4 | +5% | +7% | growing / accelerating | 203 | -7% | 0.19 | -25% | 0.0% | +0.0 | 36 | SMALL BASE (<$50M prior) |
| 36 | Jobs & Education | 37 | 43 | -14% | -6 | -16% | -24% | declining / decelerating | 144 | +36% | 0.26 | -11% | 0.0% | -0.0 | 30 | SMALL BASE (<$50M prior) |
| 37 | Shipping & Logistics | 36 | 26 | +41% | 10 | +20% | +38% | growing / accelerating | 395 | +13% | 0.09 | +13% | 0.0% | -0.0 | 33 | SMALL BASE (<$50M prior) |
| 38 | Genealogy & Ancestry | 35 | 43 | -18% | -7 | -7% | -17% | declining / decelerating | 14 | +11% | 2.58 | +6% | - | - | - | SMALL BASE (<$50M prior) |
| 39 | Real Estate Trading & Leasing | 34 | 33 | +4% | 1 | +9% | +9% | flat / accelerating | 206 | -1% | 0.17 | -3% | 0.1% | -0.1 | 10 | SMALL BASE (<$50M prior) |
| 40 | Hobbies & Interests Shopping | 34 | 31 | +9% | 3 | +4% | -5% | flat / steady | 1 | +45% | 29.29 | +16% | - | - | - | SMALL BASE (<$50M prior) |
| 41 | Vehicle Parts & Maintenance | 33 | 28 | +18% | 5 | -1% | +5% | growing / steady | 100 | +2% | 0.33 | +7% | 0.1% | -0.0 | 18 | SMALL BASE (<$50M prior) |
| 42 | Tourist Attractions & Destinations | 33 | 28 | +18% | 5 | -13% | +14% | growing / decelerating | 134 | -1% | 0.24 | +5% | 0.0% | +0.0 | 31 | SMALL BASE (<$50M prior) |
| 43 | Vehicle Connect | 31 | 24 | +30% | 7 | +18% | +34% | growing / accelerating | 168 | +6% | 0.19 | +8% | 0.0% | +0.0 | 32 | SMALL BASE (<$50M prior) |
| 44 | Experiences & Events | 29 | 19 | +51% | 10 | +32% | +82% | growing / accelerating | 386 | +7% | 0.08 | +14% | 0.1% | -0.0 | - | SMALL BASE (<$50M prior) |
| 45 | Telecom | 29 | 28 | +3% | 1 | -5% | -5% | flat / steady | 1575 | -3% | 0.02 | +2% | 0.2% | +0.1 | 7 | SMALL BASE (<$50M prior) |
| 46 | Law & Government | 28 | 27 | +5% | 1 | +6% | -11% | flat / accelerating | 2133 | +22% | 0.01 | +1% | 0.2% | +0.1 | 12 | SMALL BASE (<$50M prior) |
| 47 | Credit & Lending | 28 | 20 | +36% | 7 | +22% | +33% | growing / accelerating | 2249 | +13% | 0.01 | +7% | 2.7% | -2.2 | 1 | SMALL BASE (<$50M prior) |
| 48 | Pet Care Services | 23 | 21 | +9% | 2 | -6% | -6% | flat / decelerating | 75 | +22% | 0.30 | +42% | 1.0% | +0.1 | 4 | SMALL BASE (<$50M prior) |
| 49 | Software | 23 | 14 | +57% | 8 | +29% | +60% | growing / accelerating | 222 | +29% | 0.10 | +11% | 0.0% | -0.0 | - | SMALL BASE (<$50M prior) |
| 50 | Accommodations | 22 | 18 | +23% | 4 | +85% | +13% | growing / accelerating | 258 | +3% | 0.09 | -1% | 0.3% | -0.2 | - | SMALL BASE (<$50M prior) |
| 51 | Financial Services | 22 | 21 | +3% | 1 | -14% | +6% | flat / decelerating | 455 | +36% | 0.05 | +45% | 1.8% | +1.5 | 3 | SMALL BASE (<$50M prior) |
| 52 | Prank & Humor Apps | 20 | 13 | +54% | 7 | +21% | +67% | growing / accelerating | 555 | -5% | 0.04 | +3% | 0.1% | +0.1 | - | SMALL BASE (<$50M prior) |
| 53 | Dining & Restaurants | 19 | 13 | +47% | 6 | +23% | +38% | growing / accelerating | 1111 | +2% | 0.02 | +6% | 1.6% | -1.7 | - | SMALL BASE (<$50M prior) |
| 54 | POS (Point-of-sale) Solutions | 19 | 19 | +1% | 0 | +9% | +11% | flat / accelerating | 103 | +32% | 0.19 | +6% | 0.1% | - | - | SMALL BASE (<$50M prior) |
| 55 | Business & Industrials | 19 | 24 | -23% | -6 | -6% | -7% | declining / decelerating | 93 | -8% | 0.20 | -42% | 0.0% | - | 43 | SMALL BASE (<$50M prior) |
| 56 | Health Care Services | 16 | 13 | +22% | 3 | +1% | +4% | growing / steady | 586 | +15% | 0.03 | +10% | 0.2% | -0.1 | - | SMALL BASE (<$50M prior) |
| 57 | Travel & Tourism | 16 | 11 | +40% | 4 | +25% | +22% | growing / accelerating | 74 | +3% | 0.21 | +79% | 0.1% | +0.1 | - | SMALL BASE (<$50M prior) |
| 58 | Auto | 13 | 10 | +30% | 3 | +21% | +32% | growing / accelerating | 145 | -9% | 0.09 | +22% | 0.0% | +0.0 | - | SMALL BASE (<$50M prior) |
| 59 | Food & Dining Services | 12 | 8 | +49% | 4 | +2% | +34% | growing / steady | 85 | +3% | 0.14 | +10% | 0.0% | +0.0 | - | SMALL BASE (<$50M prior) |
| 60 | Travel Booking Services | 11 | 8 | +40% | 3 | +10% | +25% | growing / accelerating | 508 | -2% | 0.02 | +4% | 0.5% | -0.3 | - | SMALL BASE (<$50M prior) |
| 61 | Gas & EV Charging Stations | 9 | 6 | +57% | 3 | +35% | +46% | growing / accelerating | 262 | +32% | 0.04 | +9% | 0.1% | -0.1 | - | SMALL BASE (<$50M prior) |
| 62 | Automotive Marketplaces | 9 | 9 | +4% | 0 | -6% | -11% | flat / decelerating | 134 | +1% | 0.07 | +3% | 0.1% | +0.0 | - | SMALL BASE (<$50M prior) |
| 63 | Coupons & Rebates | 7 | 4 | +60% | 3 | +5% | +44% | growing / accelerating | 757 | +1% | 0.01 | +12% | 7.6% | -0.9 | - | SMALL BASE (<$50M prior) |
| 64 | Food Delivery Services | 7 | 6 | +6% | 0 | -9% | -1% | flat / decelerating | 1102 | +0% | 0.01 | -3% | 3.3% | +0.8 | - | SMALL BASE (<$50M prior) |
| 65 | Agriculture | 5 | 3 | +67% | 2 | +69% | +63% | growing / accelerating | 65 | +75% | 0.08 | +28% | - | - | - | SMALL BASE (<$50M prior) |
| 66 | Banking | 4 | 2 | +64% | 2 | +8% | +47% | growing / accelerating | 2227 | +4% | 0.00 | +5% | 1.2% | -0.4 | - | SMALL BASE (<$50M prior) |
| 67 | Apparel | 3 | 3 | -4% | -0 | +10% | +21% | flat / accelerating | 1029 | +0% | 0.00 | -8% | 1.0% | -0.0 | - | SMALL BASE (<$50M prior) |
| 68 | Motorcycles, Scooters & Mopeds | 2 | 2 | +19% | 0 | +19% | -12% | growing / accelerating | 48 | +44% | 0.05 | +15% | - | - | - | SMALL BASE (<$50M prior) |
| 69 | Property Management | 1 | 1 | +23% | 0 | +21% | +16% | growing / accelerating | 59 | +10% | 0.02 | +44% | 0.0% | +0.0 | - | SMALL BASE (<$50M prior) |
| 70 | Computers & Consumer Electronics | 1 | 1 | +12% | 0 | -16% | +44% | growing / decelerating | 128 | -8% | 0.01 | -15% | 0.0% | -0.0 | - | SMALL BASE (<$50M prior) |
| 71 | Insurance | 1 | 1 | +22% | 0 | +18% | +17% | growing / accelerating | 345 | +9% | 0.00 | +5% | 0.1% | +0.1 | - | SMALL BASE (<$50M prior) |
| 72 | Beauty Retail | 1 | 1 | -45% | -1 | -37% | -55% | declining / decelerating | 232 | -5% | 0.00 | +9% | 0.2% | +0.1 | - | SMALL BASE (<$50M prior) |
| 73 | Payroll Services | 0 | 0 | +33% | 0 | +16% | +40% | growing / accelerating | 7 | +15% | 0.06 | +16% | - | - | - | SMALL BASE (<$50M prior) |
| 74 | Sports & Outdoors | 0 | 0 | -15% | -0 | -9% | -39% | declining / decelerating | 71 | +3% | 0.01 | +11% | 0.1% | +0.1 | - | SMALL BASE (<$50M prior) |
| 75 | Grocery Stores | 0 | 0 | +31% | 0 | -29% | -25% | growing / decelerating | 511 | +4% | 0.00 | +7% | 0.0% | -0.1 | - | SMALL BASE (<$50M prior) |
| 76 | National Medical Service | 0 | 0 | +12% | 0 | +1% | -6% | growing / steady | 191 | +8% | 0.00 | +5% | - | - | - | SMALL BASE (<$50M prior) |
| 77 | Home & Garden Shopping | 0 | 0 | +1% | 0 | -36% | -49% | flat / decelerating | 165 | +4% | 0.00 | +7% | 0.1% | -0.0 | - | SMALL BASE (<$50M prior) |
| 78 | Cruises | 0 | 0 | +61% | 0 | -24% | -54% | growing / decelerating | 18 | +9% | 0.00 | +21% | - | - | - | SMALL BASE (<$50M prior) |
| 79 | Real Estate | 0 | 0 | +518% | 0 | +1398% | +906% | growing / accelerating | 1 | +1145% | 0.01 | - | - | - | - | SMALL BASE (<$50M prior) |
| 80 | Malls & Shopping Centers | 0 | 0 | -67% | -0 | -15% | -56% | declining / decelerating | 53 | +7% | 0.00 | +0% | - | - | - | SMALL BASE (<$50M prior) |
| 81 | Pet Supplies | 0 | 0 | +391% | 0 | -63% | +398% | growing / decelerating | 22 | -0% | 0.00 | +13% | 0.6% | +0.3 | - | SMALL BASE (<$50M prior) |
| 82 | Family & Parenting Shopping | 0 | 0 | -65% | -0 | -2% | -78% | declining / steady | 45 | +9% | 0.00 | +18% | 0.2% | +0.2 | - | SMALL BASE (<$50M prior) |
| 83 | Convenience Stores | 0 | 0 | -100% | -0 | - | - | declining / insufficient_data | 77 | +12% | 0.00 | +21% | 0.0% | -0.0 | - | SMALL BASE (<$50M prior) |

Class counts (computed): of the 31 sub-categories with prior revenue of at least $50M, 21 are growing, 7 flat and 3 declining. Momentum: 14 accelerating, 11 steady, 6 decelerating. Large sub-categories that are both growing and accelerating: Utilities, Generative AI, Music & Podcasts, Jobs & Careers, Hobbies & Interests Services, Home & Garden Services, Transportation, Parenting Resources, Food Blogs/Recipes, Automotive Research, Lifestyle & Services. Large and growing but decelerating: Business & Productivity Software (H2/H1 -6%), Shopping (-7%), Religion & Spirituality (-11%), Financial News (-17%). Downloads are flat or declining in 22 of the 31 large sub-categories. Growth is ARPU-led (pricing, subscriptions, AI tiers), not audience-led.

### 1.4 Leaf categories that matter — `niche_leaders_full_app_iq_category.csv`, plus computed RPD/iOS share

Leaves with top-100 revenue of at least $50M, plus a few small leaves used in the hypotheses. "New-entrant share" = share of top-100 current revenue from apps released on or after 2024-07-01. "Entrants share of abs Δ" = `growth_decomp_entrants_share_of_abs_delta`. RPD = top-100 revenue / their downloads (`niche_top_apps.csv`). iOS share is revenue-weighted over the leaf's apps in `leaders.csv` (s_ios_rev_share_cur), so it only covers apps in the global top 2000.

| leaf (App IQ) | inferred parent sub-category | apps tagged (cur) | top-100 rev cur $M | top-100 prior $M | yoy | top-1 app (share of top-100) | HHI | new-entrant share (rel>=2024-07) | entrants share of abs Δ | RPD $/dl | iOS share | flag |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Social Media | Social Media | 12900 | 9493 | 8827 | +8% | TikTok (52%) | 0.34 | 0.4% | 0.09 | 2.80 | 77% |  |
| OTT Streaming | Movies & TV Shows | 10288 | 8145 | 7998 | +2% | Disney+ (12%) | 0.06 | 0.3% | 0.42 | 6.32 | 76% |  |
| AI Assistant | Generative AI | 4384 | 5365 | 2194 | +145% | ChatGPT (76%) | 0.59 | 7.2% | 0.02 | 2.11 | 77% |  |
| Cloud Storage | Utilities | 209 | 3988 | 2779 | +44% | Google One (84%) | 0.72 | 0.1% | 0.00 | 8.60 | 11% |  |
| Dating | Dating & Social Discovery | 9792 | 3467 | 3821 | -9% | Tinder Dating App: Date &  (31%) | 0.13 | 0.3% | 0.16 | 7.98 | 72% |  |
| Music & Podcasts | Music & Podcasts | 24336 | 3162 | 2707 | +17% | QQ音乐 - 听我想听 (17%) | 0.09 | 0.1% | 0.01 | 3.93 | 78% |  |
| Books & Comics | Books & Comics | 14264 | 2572 | 2718 | -5% | ピッコマ (17%) | 0.08 | 0.3% | 0.18 | 7.01 | 64% |  |
| Short Drama | Movies & TV Shows | 1442 | 2241 | 1841 | +22% | DramaBox - Stream Drama Sh (17%) | 0.09 | 38.6% | 0.37 | 1.38 | 63% |  |
| Video Editing | Multimedia & Design Software | 7842 | 1604 | 1169 | +37% | CapCut: Photo & Video Edit (71%) | 0.51 | 4.2% | 0.12 | 1.43 | 85% |  |
| Social Messaging | Social Media | 4889 | 1492 | 1082 | +38% | Telegram (24%) | 0.12 | 0.5% | 0.02 | 0.75 | 71% |  |
| Language Education | Education & Training | 16437 | 1180 | 1004 | +17% | Duolingo: Learn Languages (59%) | 0.36 | 8.3% | 0.12 | 2.28 | 75% |  |
| Photo Editing | Multimedia & Design Software | 17296 | 1035 | 948 | +9% | 美图秀秀:视频/图片/Live人像精修工具 (14%) | 0.06 | 3.8% | 0.61 | 1.16 | 88% |  |
| Job Boards | Jobs & Careers | 6373 | 1015 | 890 | +14% | LinkedIn: Community & Netw (72%) | 0.57 | 0.2% | 0.01 | 4.34 | 86% |  |
| Gyms & Fitness | Personal Health & Fitness | 30782 | 799 | 731 | +9% | Strava: Run, Bike, Walk (26%) | 0.09 | 1.4% | 0.53 | 2.42 | 83% |  |
| Social Discovery | Dating & Social Discovery | 5821 | 766 | 780 | -2% | SUGO-Online Chat Party (8%) | 0.03 | 7.8% | 5.78 | 1.55 | 58% |  |
| Antivirus & VPN | Antivirus & Security | 5694 | 662 | 554 | +19% | NordVPN: VPN Fast & Secure (24%) | 0.08 | 0.7% | 0.15 | 0.77 | 62% |  |
| Nutrition & Diet | Personal Health & Fitness | 6273 | 610 | 549 | +11% | MyFitnessPal: Calorie Coun (28%) | 0.11 | 6.0% | 0.45 | 3.24 | 79% |  |
| Shopping | ? | 25098 | 604 | 497 | +21% | Amazon Shopping (95%) | 0.91 | 0.3% | 0.02 | 1.66 | 0% |  |
| Poster & Card Design | Multimedia & Design Software | 3027 | 589 | 525 | +12% | Canva AI Photo & Video Edi (80%) | 0.66 | 1.7% | 0.05 | 1.66 | 80% |  |
| Live Streaming | Dating & Social Discovery | 1368 | 578 | 625 | -8% | BIGO LIVE-Live Stream, Go  (23%) | 0.11 | 3.7% | 0.28 | 1.80 | 43% |  |
| Selfie & Beauty Editors | Multimedia & Design Software | 1582 | 559 | 522 | +7% | FaceApp: Perfect Face Edit (32%) | 0.17 | 1.7% | 0.15 | 2.61 | 90% |  |
| File Management | Utilities | 9597 | 509 | 375 | +36% | Cleanup: Phone Storage Cle (27%) | 0.11 | 7.5% | 0.31 | 1.70 | 89% |  |
| News & Magazines | ? | 20927 | 477 | 428 | +11% | NYTimes: US and Global New (16%) | 0.05 | 0.5% | 0.15 | 11.53 | 82% |  |
| AI Companion | Generative AI | 2387 | 474 | 171 | +178% | Tipsy Chat: Live Your Stor (12%) | 0.04 | 49.3% | 0.36 | 2.31 | 52% |  |
| Team Sports & Outdoor Recreation | Hobbies & Interests Services | 20296 | 449 | 387 | +16% | onX Hunt: GPS Hunting Maps (24%) | 0.10 | 1.0% | 0.20 | 6.47 | 75% |  |
| Sports Streaming | Sports Entertainment | 1643 | 439 | 526 | -17% | ESPN: Live Sports & Scores (21%) | 0.09 | 7.4% | 0.04 | 4.12 | 82% |  |
| Location Trackers | Utilities | 3963 | 421 | 345 | +22% | Life360: Family Safety & G (69%) | 0.48 | 3.6% | 0.11 | 1.58 | 70% |  |
| Office Suites | Business & Productivity Software | 815 | 415 | 347 | +19% | Microsoft Word (36%) | 0.20 | 2.3% | 0.08 | 0.69 | 76% |  |
| Musical Instrument Apps | Hobbies & Interests Services | 9898 | 384 | 325 | +18% | Simply Piano: Learn Piano  (17%) | 0.06 | 7.5% | 0.24 | 1.62 | 79% |  |
| Utilities | Utilities | 39293 | 380 | 305 | +25% | 夸克-AI旗舰应用 (26%) | 0.09 | 17.3% | 0.38 | 1.24 | 87% |  |
| Business & Productivity Software | Business & Productivity Software | 51695 | 379 | 276 | +37% | Invoice Maker ▸ Invoice Si (9%) | 0.03 | 3.6% | 0.23 | 0.71 | 73% |  |
| AI Content Generator | Generative AI | 4719 | 355 | 198 | +79% | Suno - AI Songs, Music, Ly (26%) | 0.09 | 58.5% | 0.21 | 1.03 | 69% |  |
| Email | Business & Productivity Software | 760 | 347 | 362 | -4% | Gmail (66%) | 0.47 | 0.1% | 0.01 | 1.26 | 86% |  |
| Document Scanners | Business & Productivity Software | 1195 | 307 | 265 | +16% | CamScanner - PDF Scanner A (37%) | 0.18 | 1.2% | 0.07 | 1.45 | 81% |  |
| Smart Home Apps | Home & Garden Services | 8910 | 302 | 233 | +30% | The Official Wyze App (23%) | 0.15 | 2.0% | 0.02 | 1.31 | 75% |  |
| Meditation & Sleep Trackers | Personal Health & Fitness | 3777 | 289 | 324 | -11% | Calm (20%) | 0.07 | 3.9% | 0.19 | 5.00 | 85% |  |
| Navigation & Maps | Transportation | 14390 | 288 | 235 | +23% | Navionics® Boating (12%) | 0.05 | 1.2% | 0.24 | 1.90 | 66% |  |
| Professional Sports Teams | Sports Entertainment | 4662 | 283 | 248 | +14% | NFL (37%) | 0.24 | 1.4% | 0.03 | 5.90 | 79% |  |
| Personal Health & Fitness | Personal Health & Fitness | 15501 | 273 | 263 | +4% | Google Health (Fitbit) (27%) | 0.10 | 6.7% | 1.49 | 3.29 | 66% |  |
| Object Identification Apps | Lifestyle & Services | 4308 | 252 | 233 | +8% | PictureThis - Plant Identi (43%) | 0.20 | 10.6% | 0.78 | 2.03 | 78% |  |
| Photo Galleries | Multimedia & Design Software | 1130 | 242 | 297 | -19% | Google Photos: Backup & Ed (71%) | 0.52 | 0.4% | 0.01 | 1.22 | 98% |  |
| PDF Editors & Docusign | Business & Productivity Software | 3224 | 240 | 208 | +16% | Acrobat Reader: PDF Editor (64%) | 0.41 | 1.6% | 0.07 | 0.41 | 68% |  |
| Sports News, Statistics & Live Scores | Sports Entertainment | 8058 | 221 | 179 | +24% | GameChanger (48%) | 0.26 | 3.5% | 0.04 | 1.82 | 86% |  |
| Note-Taking | Business & Productivity Software | 2726 | 211 | 193 | +9% | Goodnotes: AI Notes, Docs, (40%) | 0.21 | 10.6% | 0.18 | 1.01 | 93% |  |
| Period Tracking | Personal Health & Fitness | 1655 | 193 | 191 | +1% | Flo Cycle & Period Tracker (66%) | 0.45 | 0.7% | 0.12 | 1.48 | 85% |  |
| Weather | Utilities | 8164 | 177 | 159 | +12% | Clime: NOAA Weather Radar  (15%) | 0.06 | 2.8% | 0.21 | 1.23 | 81% |  |
| Calling & SMS | Utilities | 2122 | 176 | 167 | +5% | Truecaller: Block Spam Cal (17%) | 0.09 | 0.8% | 0.16 | 0.45 | 69% |  |
| Adult Learning | Education & Training | 15538 | 164 | 166 | -2% | Himalaya:Audiobooks & Podc (32%) | 0.13 | 11.4% | 2.44 | 2.47 | 84% |  |
| Digital Art & Drawing | Multimedia & Design Software | 3901 | 157 | 113 | +39% | Simply Draw: Learn to Draw (25%) | 0.11 | 5.5% | 0.08 | 0.64 | 89% |  |
| Parenting Resources | ? | 4022 | 149 | 123 | +21% | Nanit (14%) | 0.05 | 3.6% | 0.10 | 1.43 | 79% |  |
| Karaoke Apps | Music & Podcasts | 791 | 148 | 141 | +5% | WeSing (21%) | 0.10 | 0.3% | 0.05 | 1.16 | 86% |  |
| Translation | Utilities | 5422 | 146 | 135 | +8% | Translate Now - AI Transla (25%) | 0.09 | 14.4% | 0.55 | 1.32 | 99% |  |
| Tax Preparation & Accounting | ? | 3319 | 146 | 116 | +25% | Intuit QuickBooks for Busi (28%) | 0.14 | 1.3% | 0.05 | 8.41 | 84% |  |
| Medical Tracking Apps | Personal Health & Fitness | 7690 | 144 | 121 | +19% | StressWatch: AI压力监测 & 健康习惯 (8%) | 0.03 | 28.7% | 1.16 | 1.67 | 89% |  |
| Customization & Ringtones | Utilities | 38899 | 132 | 130 | +2% | Lovekey (6%) | 0.02 | 8.5% | 6.82 | 0.25 | 83% |  |
| Test Prep, Tutoring, & Studying | Education & Training | 20697 | 129 | 115 | +12% | Quizlet: More than Flashca (30%) | 0.10 | 15.5% | 1.11 | 1.01 | 88% |  |
| Home Security Apps | Home & Garden Services | 4210 | 129 | 93 | +38% | Arlo Secure: Home Security (15%) | 0.07 | 13.8% | 0.46 | 0.87 | 64% |  |
| Religion & Spirituality | ? | 48076 | 127 | 104 | +23% | Hallow: Prayer & Meditatio (24%) | 0.08 | 23.6% | 0.59 | 0.64 | 79% |  |
| Virtual TV Remotes | Utilities | 1621 | 119 | 90 | +31% | TV Remote - Universal Cont (17%) | 0.07 | 18.4% | 0.16 | 0.52 | 92% |  |
| Budget & Expense Tracking | ? | 8951 | 118 | 100 | +18% | 家計簿マネーフォワード ME - 資産管理もこれ一つ (14%) | 0.06 | 6.2% | 0.47 | 1.63 | 69% |  |
| Stress Management & Mental Health Apps | Personal Health & Fitness | 5770 | 115 | 118 | -2% | Finch: Self-Care Pet (25%) | 0.08 | 9.9% | 3.44 | 1.43 | 73% |  |
| Digital Wallets & P2P Payments | ? | 10080 | 111 | 8 | +1342% | Alipay (95%) | 0.90 | 2.6% | 0.00 | 1.98 | 100% | small base |
| QR Scanners | Utilities | 4007 | 110 | 73 | +50% | QR Code Reader＊Barcode Sca (9%) | 0.05 | 33.9% | 0.15 | 0.82 | 87% |  |
| Teaching & Classroom Resources | Education & Training | 16716 | 108 | 140 | -23% | ClassDojo (33%) | 0.13 | 2.5% | 0.04 | 0.91 | 81% |  |
| 2FA & Passwords | Antivirus & Security | 2350 | 108 | 85 | +26% | Keeper Password Manager (13%) | 0.05 | 29.3% | 0.55 | 1.57 | 80% |  |
| Multimedia & Design Software | Multimedia & Design Software | 7682 | 107 | 75 | +43% | ピクトリンク (18%) | 0.05 | 30.2% | 0.81 | 0.73 | 90% |  |
| Food Blogs, Coupons & Recipe Resources | ? | 5136 | 105 | 83 | +27% | ReciMe: Recipes & Meal Pla (20%) | 0.10 | 4.1% | 0.13 | 2.78 | 82% |  |
| Financial News | ? | 5718 | 103 | 85 | +22% | TradingView: Track All Mar (45%) | 0.23 | 2.9% | 0.15 | 2.00 | 63% |  |
| Browsers & Search Engines | Utilities | 1933 | 100 | 84 | +19% | UC浏览器-随心搜·畅快看 (59%) | 0.37 | 1.5% | 0.06 | 0.15 | 90% |  |
| Home & Garden Services | Home & Garden Services | 3902 | 94 | 69 | +36% | AI Home Design: Interior D (20%) | 0.10 | 17.8% | 0.34 | 0.94 | 80% |  |
| Calendars & Tasks | Business & Productivity Software | 9791 | 90 | 83 | +8% | Liven: AI Life Coach (11%) | 0.04 | 4.2% | 0.38 | 0.71 | 78% |  |
| Business Communication | Business & Productivity Software | 3457 | 87 | 72 | +21% | Zoom Workplace (71%) | 0.55 | 0.5% | 0.04 | 0.27 | 84% |  |
| Drivers Education | Education & Training | 3884 | 80 | 72 | +11% | 驾考宝典-2026驾校学车考驾照 (13%) | 0.05 | 4.8% | 0.38 | 1.91 | 98% |  |
| Lifestyle & Services | Lifestyle & Services | 16940 | 77 | 48 | +61% | CoinIn: Coin Scan Identifi (13%) | 0.06 | 25.5% | 0.39 | 1.59 | 73% | small base |
| Astrology Apps | Hobbies & Interests Services | 4596 | 77 | 92 | -16% | CHANI: Your Astrology Guid (10%) | 0.04 | 3.8% | 0.24 | 1.75 | 80% |  |
| Screen & Voice Recorders | Utilities | 2455 | 74 | 65 | +13% | TapeACall: Call Recorder (7%) | 0.04 | 8.2% | 0.71 | 0.38 | 88% |  |
| Air Travel | Transportation | 2290 | 67 | 50 | +34% | Flightradar24 | Flight Tra (42%) | 0.23 | 6.2% | 0.19 | 1.09 | 80% | small base |
| Hobbies & Interests Services | Hobbies & Interests Services | 6932 | 66 | 39 | +68% | D&D Beyond (19%) | 0.07 | 40.8% | 0.37 | 1.67 | 65% | small base |
| Motorsport | ? | 1541 | 63 | 76 | -16% | F1 TV (77%) | 0.61 | 1.0% | 0.03 | 7.49 | 70% |  |
| Antivirus & Security | Antivirus & Security | 2054 | 59 | 54 | +8% | Secret Photo Vault: Keepsa (21%) | 0.11 | 14.5% | 0.96 | 0.42 | 79% |  |
| Brain Training Apps | Personal Health & Fitness | 780 | 58 | 85 | -32% | Impulse - Brain Training (37%) | 0.23 | 2.9% | 0.02 | 1.60 | 79% |  |
| Screen Casting | Utilities | 1575 | 57 | 50 | +14% | Screen Mirroring | Cast to (15%) | 0.07 | 19.3% | 0.32 | 0.34 | 90% | small base |
| Buy & Sell | ? | 5974 | 55 | 55 | -1% | OfferUp Buy & Sell Marketp (46%) | 0.23 | 9.1% | 1.64 | 1.16 | 77% |  |
| Media & Entertainment | ? | 6535 | 50 | 41 | +22% | DMM TV アニメ・ドラマ・映画・バラエティなどが (19%) | 0.07 | 7.0% | 0.47 | 1.42 | 87% | small base |
| Generative AI | Generative AI | 15 | 23 | 24 | -4% | invideo: AI Video Editor (37%) | 0.25 | 49.7% | 0.00 | 0.54 | 74% | small base |

## 2. Where growth comes from

### 2.1 A few apps drive the headline

Non-game revenue grew by +$9,467M. By sub-category (computed from `niche_dynamics_app_sub_category.csv`): Generative AI 38.8%, Utilities 17.9%, Social Media 11.0%, Multimedia & Design 7.4%, Movies & TV 6.2%, Music 4.8%. Inside those, growth is concentrated in single apps (`leaders.csv`, rev_*_best_usd):

| sub-category | Δ $M | main contributor(s) | contributor Δ $M | share of sub-cat Δ | sub-cat yoy ex contributor(s) |
|---|---|---|---|---|---|
| Generative AI | +3,678 | ChatGPT / Claude / Grok | +2,311 / +502 / +253 | 63% / 14% / 7% (top-3 = 83%) | ex ChatGPT +154%; ex top-3 +74% |
| Utilities | +1,691 | Google One (Cloud Storage) | +1,148 | 68% | +19% |
| Multimedia & Design | +701 | CapCut | +412 | 59% | +9% |
| Social Media | +1,042 | Snapchat (+78%), YouTube, Telegram | +394 / +141 / +137 | 38% / 14% / 13% | ex Snapchat +6% |
| Movies & TV Shows | +590 | Paramount+ (+176), short-drama apps (+400 top-100); Disney+ -407 | | | |
| Dating & Social Discovery | -391 | Tinder -163, Bumble -161, Hinge -83 | | | |

Non-game yoy is +16.7% overall, +10.7% ex Generative AI, +8.9% ex Generative AI and Google One, and +7.6% if CapCut and Snapchat are also removed. So the mid-market of apps grows roughly 7-9%. That is healthy, but it is not a boom.

### 2.2 Leaders vs entrants by leaf

From `niche_leaders_full_app_iq_category.csv` and the per-leaf decomposition I computed over `niche_top_apps.csv`:

- **Leader-driven (incumbents grow; entrants under 10% of growth).** AI Assistant (ChatGPT alone is 73% of the leaf Δ; entrants share of abs Δ 0.02). Cloud Storage (Google One 95%). Video Editing (CapCut 95%). Shopping (Amazon 91%). Location Trackers (Life360 81%). Job Boards (BOSS直聘 53%). Digital Wallets (Alipay 98%). Social Media (Snapchat 59%). Language Education (Duolingo 46%; but see the AI tutors in 2.4). These leaves are not accessible: the top 1 holds 59-95% of the top 100 and HHI is 0.36-0.91.
- **Entrant-driven (new apps take most of the revenue).** AI Content Generator: new-entrant share 58.5%, 40 new apps in the top 100, HHI 0.09. AI Companion: 49.3%, 68 new, HHI 0.04, top-1 only 12%. Short Drama: 38.6%, 61 new, 43 entrants into the top 100, HHI 0.09. Hobbies & Interests Services: 40.8% (small: $66M). QR Scanners 33.9%. Multimedia & Design leaf 30.2%. 2FA & Passwords 29.3%. Medical Tracking 28.7% (entrants share of abs Δ 1.16, so incumbents shrank). Lifestyle & Services 25.5%. Religion & Spirituality 23.6% (entrants share of abs Δ 0.59). Utilities leaf 17.3%. Home & Garden Services 17.8%. Virtual TV Remotes 18.4%.
- **Challenger-driven, mixed.** Nutrition & Diet: entrants share of abs Δ 0.45; MyFitnessPal -4%, Lose It -27% vs Yazio +45%, Cal AI +50%, Foodvisor +65%, Calo +650%. File Management: Cleanup +86% to $136.6M, entrants 0.31. Digital Art & Drawing: Simply Draw +216% to $39.1M.

### 2.3 Subscription-heavy categories (proxy)

Sensor Tower does not split subscription from consumable IAP. As proxies I use high revenue per download and a high iOS revenue share (iOS is where hard-paywall subscriptions monetize).

- **High RPD with high iOS share (subscription-like).** News & Magazines RPD $11.53, iOS 82%. Tax Prep $8.41, 84%. Health Media $7.87. Dating $7.98, 72%. Books & Comics $7.01. OTT $6.32. Meditation $5.00, 85%. Job Boards $4.34, 86%. Nutrition $3.24, 79%. These are mature subscription markets, and most are flat or declining (section 4).
- **Low RPD but almost 100% iOS share (cheap-install, hard-paywall weekly-sub utilities).** Translation iOS 99% (RPD $1.32). Photo Galleries 98%. Drivers Education 98%. Note-Taking 93%. Virtual TV Remotes 92% ($0.52). QR Scanners 87% ($0.82). File Management 89%. Utilities leaf 87%. Test Prep 88%. This is the classic "paywall utility" model and the most accessible build for a small team (section 5, apps-03).
- **AI subscriptions.** AI Assistant RPD $2.11, iOS 77%. AI Companion $2.31, 52% (Android-heavy, Korean/Japanese publishers). AI Content Generator $1.03, 69%.
- **Cloud Storage iOS share is only 11%.** Google One bills mostly on Android, so its +$1,148M is a Google-billing story, not an iOS subscription trend.

### 2.4 AI-driven reclassification and boundary risk (Generative AI, Utilities, Photo & Video, Education)

1. **Generative AI: real growth, not re-tagging.** The monthly series (`niche_monthly_app_sub_category.csv`) rises smoothly from $110M (2024-10) to $631M (2026-09). The largest month-on-month jump is +27% (2025-04), with no step. The prior lists already include ChatGPT, Claude and Grok. But the growth is **single-app**: ChatGPT +$2,311M is 63% of it. The long tail of AI assistant wrappers is shrinking: ChatOn -39%, ChatBox -64%, Chat AI: Ask Agent -35% (`leaders.csv`). The "Generative AI" leaf itself is a residual tag of 15 apps and $23M (-4%).
2. **AI products sit outside the Generative AI tags.** Apps with "AI/GPT/Copilot..." in their names, outside the four GenAI leaves, earned $2,659M cur vs $2,107M prior (+26%, 874 app-rows in top-100 lists). The biggest leaves:
   - Photo Editing: $567M of $1,035M (Hypic +67%, Meitu +59%).
   - Poster & Card: $482M, almost all Canva. The app was renamed "Canva AI", which is a name change, not a new product.
   - Video Editing: $195M.
   - Nutrition: $187M vs $127M.
   - Note-Taking: $165M.
   - Language Education: $141M vs $48M (+194%).
   - Translation: $86M.
   - Home & Garden Services: $82M of $94M.

   The 夸克 "AI flagship app" ($98.9M, Utilities leaf) is tagged Utilities. AI music generators are split: AI Content Generator holds $126.4M (Suno and others), while Musical Instrument Apps holds $48.2M (Rythmix, MyTunes, Mureka, Beatron). The name-matched cluster is +211% (`niche_top_apps.csv`, my regex). Collectible and card scanners are spread over 8 leaves. **Implication:** no single tag measures the "AI app market". Growth attributed to Photo & Video, Education or Utilities is partly AI products, and partly renames where nothing changed (Canva).
3. **Utilities: a billing-attribution artifact, not demand.** Utilities' +$1,691M is 68% Google One (+$1,148M, +52%). In the same period Google Photos fell -$76M (H2/H1 -71%) and Gmail fell -$54M (H2/H1 -77%) (`leaders.csv` s_rev_h2_h1). That pattern looks like Google moving subscription billing into Google One and bundling AI plans there, not new consumer demand for storage. Utilities ex Google One is +19%, and that +19% is the number to use for the market.
4. **Photo & Video (store category 6008, +17%; App IQ Multimedia & Design +18%).** Without CapCut the sub-category is +9%. Classic AI photo enhancers are shrinking: Remini -25% (H2/H1 -29%), Photoroom -17%. Growth goes to the Chinese super-editors (Meitu +59%, Hypic +67%, both 95-98% iOS).
5. **Education (store category +10%, App IQ Education & Training +10%, flat).** AI is a substitute here, not a tailwind for incumbents. Teaching & Classroom fell -23% as homework-help apps collapsed: Chegg -68%, Photomath -59%, Brainly -61%; Gauth (+58%) is the exception. Adult Learning incumbents fell -11% (Udemy -32%, Coursera -42%). The growth sits in AI speaking tutors: Learna AI went from $14.3M to $62.9M (released 2024-09), Praktika +62%, Loora +90%.
6. **Single-app artifacts to ignore.** Digital Wallets & P2P Payments: +1,339% on an $8M base; Alipay is +$101M, 98% of the leaf. Real Estate, Pet Supplies and Buy Now Pay Later: +391% to +1862% on bases under $1M.

## 3. Time spent vs revenue (US time spent; `ts_*`)

US time is very concentrated. Social Media holds 60.4% of US non-game time but 15.5% of US non-game IAP revenue. Total US time grew +5.8% (sum of ts_cur / ts_prior). Selected divergences (computed; implied users = (1+ts_yoy)/(1+ts_per_user_yoy)-1):

| sub-category | rev cur $M (prior) | rev yoy | US ts yoy | ts/user yoy | implied users | dl yoy | US time share / US rev share | reading |
|---|---|---|---|---|---|---|---|---|
| Social Media | 11,787 (10,745) | +10% | +5% | +5% | +0% | -3% | 60.4% / 15.5% | Attention is ad-monetized. IAP growth is Snapchat+ / TikTok coins |
| Utilities | 6,702 (5,011) | +34% | +8% | +3% | +4% | -2% | 17.8% / 10.1% | Attention grows. US ad impressions +3.9pp to 9.8%, the largest UA build-up of any sub-category |
| Transportation | 444 (352) | +26% | +4% | +0% | +3% | +4% | 4.2% / 0.5% | Navigation is free attention (ad/OEM-funded) |
| Generative AI | 6,320 (2,642) | +139% | +80% | -10% | +100% | +36% | 2.2% / 9.4% | US users double while minutes per user fall: new users are lighter. Very high revenue per minute |
| Movies & TV Shows | 10,647 (10,057) | +6% | -2% | -4% | +2% | +34% | 3.1% / 19.1% | Downloads +34% (short-drama UA churn) with no added US time |
| Music & Podcasts | 3,190 (2,733) | +17% | -2% | -0% | -2% | -9% | 1.8% / 4.1% | Revenue without attention: price increases (Spotify +41%, YouTube Music +27%) |
| News & Magazines | 599 (539) | +11% | -16% | -2% | -14% | -22% | 0.3% / 0.9% | Shrinking audience, rising paywall ARPU |
| Home & Garden Services | 530 (399) | +33% | -2% | -2% | +0% | +6% | 0.2% / 1.2% | Pricing/AI-feature led, not usage led |
| Buy & Sell | 55 (56) | -1% | +25% | +12% | +12% | +12% | 0.3% / 0.1% | **Attention growing without IAP.** Commerce, monetized by fees and ads. Ad-intensity rank 5 |
| Financial Services | 22 (21) SMALL | +3% | +45% | +29% | +12% | +36% | 0.05% / 0.06% | Attention without IAP. Ad-intensity rank 3 |
| Pet Care Services | 23 (21) SMALL | +9% | +42% | +8% | +31% | +22% | 0.02% / 0.04% | Attention without IAP. Ad-intensity rank 4 |
| Health Media & Publications | 85 (75) | +13% | +46% | +14% | +28% | -5% | 0.01% / 0.14% | Attention growing faster than IAP |
| Lifestyle & Services | 84 (51) | +64% | +63% | +25% | +30% | +15% | 0.02% / 0.20% | Attention and revenue rise together (collector apps; see apps-06) |
| Parenting Resources | 154 (128) | +21% | +18% | +16% | +2% | +5% | 0.07% / 0.29% | Engagement deepening per user |
| Genealogy & Ancestry | 35 (43) SMALL | -18% | +6% | +4% | +2% | +11% | ~0 | Usage holds while IAP falls (Ancestry -$9M) |
| Dating & Social Discovery | 4,899 (5,290) | -7% | -6% | -1% | -5% | -6% | 0.3% / 6.3% | Users are actually leaving; the drop is not just pricing |

**Download-heavy, IAP-light leaves** (attention monetized by ads; Sensor Tower undercounts them). Customization & Ringtones: 1,443M downloads by the top 100, $132M top-100 IAP (+2%), RPD $0.25. Its fastest download entrants are game-like launchers: Candy Race Launcher 33.2M dl, Pillow Chase Home App 31.0M dl, iControl widgets 45.1M dl. Prank & Humor: $20M revenue (SMALL) but 555M downloads; Haircut Prank 25.8M dl, Reverse Song & Voice Challenge 16.5M dl (2025-10). Media Players: 1,163M dl, RPD $0.07. Browsers: 1,215M dl, $0.15. These are the niches where a feed of micro-games or toys can win installs cheaply. The money there is ad revenue that this dataset cannot see.

## 4. Stagnating large categories with weakening incumbents

The top-5 incumbents are the top 5 by prior revenue in each leaf's prior top-100. "Challengers" are the other apps present in both the cur and prior top-100 lists. Source: `niche_top_apps.csv`; current revenue for incumbents that dropped out of the top 100 comes from `leaders.csv`.

| leaf | top-100 prior → cur $M | yoy | top-5 incumbents yoy | challengers yoy (same apps) | new-release rev cur $M | weakest incumbents (`leaders.csv` yoy; H2/H1) |
|---|---|---|---|---|---|---|
| Dating | 3,821 → 3,467 | -9% | -14% | +0% | 10 | Bumble -32% (-17%), Hinge -18%, Tinder -13% (-3%); Grindr +24%, PURE +94% |
| OTT Streaming | 7,998 → 8,145 | +2% | -2% | +5% | 27 | Disney+ -30% (H2/H1 -16%), Netflix -16% (both likely moving billing to web); Paramount+ +35% |
| Books & Comics | 2,718 → 2,572 | -5% | -6% | -5% | 8 | Audible -35%, KakaoPage -26%; Pocket FM +49%, WEBTOON +14% |
| Social Discovery | 780 → 766 | -2% | -10% | -3% | 60 | Azar -41% (H2/H1 -46%); SUGO +38% |
| Live Streaming | 625 → 578 | -8% | -3% | -15% | 21 | whole leaf declining |
| Sports Streaming | 526 → 439 | -17% | -29% | +14% | 32 | ESPN -$79M |
| Meditation & Sleep | 324 → 289 | -11% | -9% | -15% | 11 | Calm -11% (H2/H1 -24%), Headspace -15%, Sleep Cycle -21%, BetterSleep -18% |
| Photo Galleries | 297 → 242 | -19% | -20% | +26% | 1 | Google Photos -31% (billing shift, see 2.4) |
| Personal Health & Fitness (leaf) | 263 → 273 | +4% | -8% | +16% | 18 | incumbents (Fitbit, BetterMe) lose to challengers |
| Adult Learning | 166 → 164 | -2% | -11% | +12% | 19 | Udemy -32%, Coursera -42% |
| Teaching & Classroom | 140 → 108 | -23% | -23% | -24% | 3 | Chegg -68%, Photomath -59%, Brainly -61% (AI substitution) |
| Stress & Mental Health | 118 → 115 | -2% | -5% | -7% | 11 | Finch +3% but H2/H1 -22% |
| Astrology | 92 → 77 | -16% | -7% | -22% | 3 | Nebula -26% |
| Brain Training (SMALL top-100 < $100M) | 85 → 58 | -32% | -37% | +17% | 2 | Impulse -54% (H2/H1 -34%), Elevate -12% (H2/H1 -40%), Lumosity -8% |
| Buy & Sell (SMALL) | 55 → 55 | -1% | -16% | +31% | 5 | OfferUp, Carousell |

At the sub-category level (≥ $50M prior), the stagnant giants are Dating & Social Discovery ($4,899M, -7%, US time -6%), Books & Comics ($2,816M, -5%), Movies & TV ($10,647M, +6%), Personal Health & Fitness ($3,150M, +8%, flat/steady, downloads -6%), Sports Entertainment ($980M, -1%) and Education & Training ($1,777M, +10%, H2/H1 0%). Two patterns follow:
- **(a) Subscription fatigue at the incumbents** (Dating, Meditation, Adult Learning, Brain Training). Challengers inside the same leaf still grow (Personal H&F challengers +16%, Adult Learning +12%, Brain Training +17%, Buy & Sell +31%), so demand has not died. The incumbents' products have.
- **(b) AI substitution** (homework help, generic AI chat wrappers, AI photo enhancers).

Both are openings for a small team. Pattern (a) can be attacked with a fresher, game-like product; pattern (b) cannot be attacked by building more of the same.

## 5. Hypotheses for digital-product prototypes

Fit for this team (puzzle/merge mechanics, playable ads, micro-game feed) is noted in each. Accessibility signals: HHI of the top 100, top-1 share, new-entrant share (`niche_leaders_full_app_iq_category.csv`). The revenue tests are designed to run in 4 weeks or less.

| id | title | market size cur (yoy) | driver | confidence |
|---|---|---|---|---|
| apps-01 | Playable AI-character stories (AI Companion x micro-game beats) | $474M (+178%) | entrants | 0.55 |
| apps-02 | Photo calorie tracker with game-loop retention | $610M (+11%) | mixed | 0.45 |
| apps-03 | Hard-paywall utility with a swipe-game UX (phone/photo cleaner family) | $509M (+36%) | mixed | 0.50 |
| apps-04 | AI speaking tutor built as role-play micro-games | $1180M (+17%) | mixed | 0.45 |
| apps-05 | Personalized AI song/meme gift product | $355M (+79%) | entrants | 0.40 |
| apps-06 | Collector scanner + 'binder' (TCG / sports cards / coins) | $87M (+102%) | entrants | 0.45 |
| apps-07 | Learn-to-draw / craft as a gamified micro-lesson feed | $157M (+39%) | leaders | 0.45 |
| apps-08 | Brain-training reboot on puzzle-game mechanics | $58M (-32%) | unknown | 0.30 |
| apps-09 | Gamified self-care pet / habit companion | $404M (-9%) | mixed | 0.35 |
| apps-10 | AI room redesign sold with renovation-style playable ads | $94M (+36%) | mixed | 0.40 |
| apps-11 | Faith devotional micro-content + trivia streak | $153M (+29%) | entrants | 0.40 |
| apps-12 | AI-produced interactive micro-drama inside a micro-game feed | $2241M (+22%) | entrants | 0.35 |

### apps-01 — Playable AI-character stories (AI Companion x micro-game beats)

- **Market:** AI Companion leaf (inside Generative AI sub-category). Size $474M, yoy +178%. Growth driver: entrants.
- **Claim (falsifiable):** AI-companion revenue is entrant-driven and unconcentrated. A new app that interleaves short playable beats (choices, mini-puzzles) with AI character chat can reach paywall conversion comparable to chat-only companions, and playable-ad CPIs below those of chat-only creatives. Falsified if the test shows web-paywall intent under 2% of landing visitors or playable creatives fail to beat static/video creatives on CTR.
- **Evidence:**
  - AI Companion top-100 revenue cur vs prior: $474M vs $171M (+178%) (`niche_leaders_full_app_iq_category.csv`)
  - new-entrant share of top-100 / HHI / top-1 share: 49.3% / 0.04 / 12% (Tipsy Chat) (`niche_leaders_full_app_iq_category.csv`)
  - entrant examples: Tipsy Chat $54.5M from $0.7M (rel 2024-08); OOC: The Playable Anime $7.6M (rel 2026-04); Crushie AI $15.5M (rel 2025-02) (`leaders.csv / niche_leaders_full_app_iq_category.csv new_entrants_top5`)
  - parent sub-category Generative AI: $6,320M cur, +139%, H2/H1 +47%, US ad-intensity rank 28 (low) (`niche_dynamics_app_sub_category.csv`)
- **Accessibility for a small team:** High: HHI 0.04, top-1 12%, 79 top-100 apps over $1M, 68 new entrants in the top 100. Team fit: strong (micro-game feed + playable ads). Needs LLM integration and moderation.
- **Prototype:** Feed of 30-60 s story scenes. Each scene ends in a one-tap mini-game (merge to unlock a memory, sort to pick a gift) that changes the AI character's reply. Weekly subscription for unlimited chat and new episodes; 3-4 characters in one genre (romantasy).
- **Revenue test (≤ 4 weeks):** Weeks 1-2: build 3 playable ads (scene + mini-game) and 3 video controls, and run $3-5k on TikTok/Meta/AppLovin to a web landing with a fake-door $7.99/week paywall (US + one Tier-2 market). Weeks 3-4: TestFlight/Android closed build for the top cohort. Pass: playable CTR at least 1.3x control, landing-to-paywall-tap at least 8%, paywall-tap-to-checkout-intent at least 2%.
- **Risks:** Store/ad-network policy on companion content and age-rating; per-message LLM cost vs $2.31 RPD; novelty churn (Linky AI H2/H1 -59%, LoveyDovey -33% yoy); Android-heavy revenue (iOS share 52%) means lower ARPU.
- **Confidence:** 0.55

### apps-02 — Photo calorie tracker with game-loop retention

- **Market:** Nutrition & Diet leaf (Personal Health & Fitness sub-category). Size $610M, yoy +11%. Growth driver: mixed.
- **Claim (falsifiable):** In nutrition, share is moving from legacy loggers to AI photo trackers. A photo-first tracker with a game-loop retention layer (streak garden / merge rewards) can reach trial-start rates at least matching category norms at a CPI that pays back on a 12-month subscription. Falsified if fake-door trial intent is under 5% of installs or CPI is over $4 in the test market.
- **Evidence:**
  - Nutrition & Diet top-100 revenue: $610M vs $549M (+11%); entrants share of abs delta 0.446 (`niche_leaders_full_app_iq_category.csv`)
  - calorie-tracker name cluster across leaves: $520.5M vs $431.4M (+21%) (`niche_top_apps.csv (regex cluster)`)
  - incumbents vs challengers: MyFitnessPal -4%, Lose It -27% vs Yazio +45%, Cal AI +50%, Foodvisor +65% (`leaders.csv rev_yoy_best`)
  - fastest growers: Calo +650%, BitePal +299%, Numify +212% (`niche_leaders_full_app_iq_category.csv fastest_growers_top5`)
- **Accessibility for a small team:** Medium: HHI 0.11, top-1 MyFitnessPal 28%, new-entrant share only 6% (crowded with AI clones, but they are entering the top 100: 27 entrants). Parent sub-category is $3,150M, +8% flat. Team fit: medium (game-loop retention is the differentiator).
- **Prototype:** Snap a meal, get AI calories, and the meal 'feeds' a pet/garden that grows with streaks and protein targets (merge-style upgrades). Hard paywall after a 3-day trial, yearly plan as anchor.
- **Revenue test (≤ 4 weeks):** A 2-week build (vision API + simple game layer). Soft launch on iOS in Canada or the UK with $3k of Meta/TikTok UA. Measure CPI, install-to-trial and D7 retention. Run a parallel web quiz funnel (web2app) to compare. Pass: CPI ≤ $3, trial start ≥ 8%, D7 ≥ 20%.
- **Risks:** Many AI clones with heavy UA; accuracy and health claims; much category revenue goes through web2app funnels Sensor Tower does not see; Cal AI H2/H1 -7% shows fast app-level decay.
- **Confidence:** 0.45

### apps-03 — Hard-paywall utility with a swipe-game UX (phone/photo cleaner family)

- **Market:** Utilities sub-category ex Google One; File Management, QR, TV-remote, 2FA leaves. Size $509M, yoy +36%. Growth driver: mixed.
- **Claim (falsifiable):** Single-purpose iOS utilities with weekly subscriptions still let new entrants into the top 100. A cleaner built around a swipe-to-keep/delete game loop can reach paid conversion that recovers CPI within 60 days. Falsified if blended CPI × (1 / install-to-paid) exceeds 60-day ARPPU in a 4-week US test.
- **Evidence:**
  - Utilities sub-category: $6,702M, +34%; ex Google One +19%; H2/H1 +11% (`niche_dynamics_app_sub_category.csv; leaders.csv (Google One $3,362M vs $2,214M)`)
  - File Management top-100: $509M, +36%; Cleanup $136.6M (+86%); Swipewipe $16.8M (`niche_leaders_full_app_iq_category.csv; leaders.csv`)
  - new-entrant share in small utility leaves: QR 33.9% ($110M, +50%), 2FA 29.3% ($108M, +26%), TV Remotes 18.4% ($119M, +31%), Utilities leaf 17.3% (`niche_leaders_full_app_iq_category.csv`)
  - iOS revenue share: File Mgmt 89%, QR 87%, TV Remotes 92%, Translation 99% (`leaders.csv s_ios_rev_share_cur (rev-weighted)`)
  - UA pressure: Utilities US ad-impression share 9.8%, +3.9pp yoy (largest rise of any sub-category) (`niche_dynamics_app_sub_category.csv imp_cur / imp_delta_pp`)
- **Accessibility for a small team:** High to build (2 weeks), medium to win: HHI 0.05-0.11 in these leaves, but the UA arms race is intensifying (+3.9pp impression share). Team fit: swipe-feed UX and playable ads are a direct edge.
- **Prototype:** 'Swipe Clean': photo/video cleaner as a game (swipe left/right, combos, daily 'storage freed' goal, duplicate-merge animation). $6.99/week or $29.99/year hard paywall after the first 100 swipes.
- **Revenue test (≤ 4 weeks):** Ship to the App Store in 2 weeks. Run Apple Search Ads on 'cleaner/storage' keywords plus a playable ad on AppLovin/Unity for 2 weeks, US only, $4k. Pass: CPI ≤ $2.5, install-to-trial ≥ 10%, trial-to-paid ≥ 25%.
- **Risks:** App Review crackdowns on deceptive subscriptions; refund rates; rising CPIs; Apple/Google adding native cleaners; low retention.
- **Confidence:** 0.50

### apps-04 — AI speaking tutor built as role-play micro-games

- **Market:** Language Education leaf (Education & Training sub-category). Size $1180M, yoy +17%. Growth driver: mixed.
- **Claim (falsifiable):** Growth outside Duolingo in language learning comes from AI speaking tutors launched in the last two years. A role-play speaking game ('survive the job interview') can match their install-to-trial conversion. Falsified if D1 retention is under 30% or trial start is under 5% in a single-country soft launch.
- **Evidence:**
  - Language Education top-100: $1,180M vs $1,004M (+17%); Duolingo 59% share, HHI 0.36 (`niche_leaders_full_app_iq_category.csv`)
  - AI-named language apps in top-100: $141M vs $48M (+194%) (`niche_top_apps.csv (regex)`)
  - Learna AI (rel 2024-09): $62.9M vs $14.3M (+339%), 64.2M downloads (`leaders.csv`)
  - other AI tutors: Praktika +62% ($23.0M), Loora +90% ($19.3M); Babbel -20% (`leaders.csv rev_yoy_best`)
  - parent Education & Training: $1,777M, +10%, H2/H1 0%, last3m +14% (`niche_dynamics_app_sub_category.csv`)
- **Accessibility for a small team:** Medium: Duolingo dominates (59%), but $371M sits outside the top 3 and the new-entrant share is 8.3%. Spoken-English entrants show demand in emerging markets (English Seekho 27.9M dl, Supernova 22.4M dl). Team fit: medium-high (scenario mini-games).
- **Prototype:** 10 role-play scenes (cafe, interview, date, airport) as 2-minute voice mini-games with an AI partner, star ratings and a skill map. Weekly subscription for unlimited scenes.
- **Revenue test (≤ 4 weeks):** A 3-week build on a speech API. Soft launch one country (e.g. Brazil or the Philippines; the choice is a judgement call, not from the data) plus a US iOS cohort, with $3k of TikTok UA. Pass: D1 ≥ 30%, trial start ≥ 6%, cost per trial ≤ $8 in the US.
- **Risks:** Duolingo shipping the same AI features; voice-LLM cost; low ARPU in emerging markets; Learna AI's growth may be UA-subsidized.
- **Confidence:** 0.45

### apps-05 — Personalized AI song/meme gift product

- **Market:** AI Content Generator leaf + AI music apps tagged elsewhere. Size $355M, yoy +79%. Growth driver: entrants.
- **Claim (falsifiable):** Demand for AI music creation is new-app-driven and split across tags. A 'song for a person' gift product sold per-song (not per subscription) can reach a paid conversion of at least 3% of landing visitors from paid social. Falsified if checkout intent is under 1.5%.
- **Evidence:**
  - AI Content Generator top-100: $355M vs $198M (+79%), new-entrant share 58.5%, HHI 0.09 (`niche_leaders_full_app_iq_category.csv`)
  - AI music cluster across 9 leaves: $185.7M vs $59.7M (+211%), 67% from apps released ≥2024-07 (`niche_top_apps.csv (regex cluster)`)
  - Suno: $91.9M vs $17.2M (+434%), H2/H1 +62% (`leaders.csv`)
  - music generators tagged as Musical Instrument Apps: $48.2M (Rythmix $7.0M, Mureka $3.4M, Beatron $2.4M) (`niche_top_apps.csv; niche_leaders_full_app_iq_category.csv`)
- **Accessibility for a small team:** Medium-high: HHI 0.09, but Suno takes 26% of the top 100. Generation runs on third-party models (Suno/Udio/other APIs) or open models. Team fit: medium (viral/share mechanics, playable ad of 'press to make a song').
- **Prototype:** Enter a name, an occasion and 3 facts, get a 30 s song with a lyric video and a shareable link. $3.99 per song, $9.99 for 3-pack. Built-in share loop ('make one back').
- **Revenue test (≤ 4 weeks):** Web landing plus paid TikTok/Meta for 2 weeks around a gifting moment, $2k, with real checkout through Stripe on the web (outside the store). Pass: landing-to-checkout ≥ 3%, organic share rate ≥ 0.3 links per buyer.
- **Risks:** Model licensing and copyright disputes; per-song cost; fad decay (Donna H2/H1 +2%, Mozart H2/H1 -23%); web revenue is outside Sensor Tower, so market comparisons are rough.
- **Confidence:** 0.40

### apps-06 — Collector scanner + 'binder' (TCG / sports cards / coins)

- **Market:** Collectible-scanner cluster spread across Lifestyle & Services, Object Identification, Hobbies & Interests leaves. Size $87M, yoy +102%. Growth driver: entrants.
- **Claim (falsifiable):** Collector scanning and pricing is a fast-growing, fragmented niche without a dominant app. A scanner plus collection-completion product (gamified binder) can reach top-100 revenue in its leaf within 12 months. Falsified if a 4-week US iOS test gives install-to-trial under 8% or ASA CPI over $3.
- **Evidence:**
  - collectible-scanner cluster across 8 leaves: $86.7M vs $42.9M (+102%) (`niche_top_apps.csv (regex cluster)`)
  - app examples: Card Ladder $9.7M (+397%), Collectr $7.8M (+145%), HoloDex $3.5M (rel 2025-08), Cardly AI $2.2M (rel 2025-07) (`leaders.csv; niche_leaders_full_app_iq_category.csv`)
  - Lifestyle & Services sub-category: $84M vs $51M (+64%), H2/H1 +28%, US time +63% (base just above $50M) (`niche_dynamics_app_sub_category.csv`)
  - Lifestyle & Services leaf new-entrant share / HHI: 25.5% / 0.06 (`niche_leaders_full_app_iq_category.csv`)
- **Accessibility for a small team:** High: fragmented (HHI 0.06-0.07), small apps over $2M within a year. Small absolute market (~$87M top-100 cluster), so this is a niche business, not a venture-scale one. Team fit: strong (collections/completion mechanics).
- **Prototype:** Scan a card, identify it, show price history, and file it in a virtual binder with set-completion progress, rarity reveals and a weekly 'value up' digest. $4.99/week or $39.99/year.
- **Revenue test (≤ 4 weeks):** A 3-week build on an image-recognition API and a public price feed. US iOS launch with $2k ASA ('card scanner', 'pokemon card value') plus TikTok creatives showing a pack-opening scan. Pass: CPI ≤ $3, trial ≥ 8%, D7 ≥ 25%.
- **Risks:** Price-data licensing; recognition accuracy; collector fads (TCG cycle); IP use of card images; small total market.
- **Confidence:** 0.45

### apps-07 — Learn-to-draw / craft as a gamified micro-lesson feed

- **Market:** Digital Art & Drawing leaf, learn-to-draw cluster, Musical Instrument and Hobbies leaves. Size $157M, yoy +39%. Growth driver: leaders.
- **Claim (falsifiable):** Skill-learning hobby apps with step-by-step guided lessons are growing fast on challenger products. A playable-ad-led drawing/craft app can reach CPI and trial rates close to Simply Draw-type products. Falsified if playable-ad CPI is over $2.5 or trial start under 6%.
- **Evidence:**
  - learn-to-draw / AR tracing cluster: $80.8M vs $37.0M (+119%) (`niche_top_apps.csv (regex cluster)`)
  - Digital Art & Drawing top-100: $157M vs $113M (+39%), HHI 0.11 (`niche_leaders_full_app_iq_category.csv`)
  - challengers: Simply Draw $39.1M (+216%), ArtWorkout +102%, AR Drawing +110%; Procreate -15% (`leaders.csv`)
  - craft entrant: YarnPal $7.1M from $0.3M (rel 2024-12), Hobbies & Interests leaf new-entrant share 40.8% (`leaders.csv; niche_leaders_full_app_iq_category.csv`)
- **Accessibility for a small team:** Medium: growth comes mostly from existing challengers (entrants share of abs delta 0.08 in Digital Art), but HHI is 0.11. AR-tracing entrants hit 34.9M downloads (Draw Anime, rel 2024-09). Team fit: strong (playable ad = 'trace one stroke').
- **Prototype:** Daily 5-minute guided drawing (or crochet) lessons as a vertical feed, each lesson a tracing mini-game with a score, plus a weekly 'masterpiece' challenge. Weekly/yearly subscription.
- **Revenue test (≤ 4 weeks):** Two weeks: 3 playable ads (trace a cat) to an App Store or TestFlight build, US/UK, $3k. Pass: playable CTR ≥ 1.5%, CPI ≤ $2.5, trial ≥ 6%.
- **Risks:** Simply (Israel) out-spends on UA; tracing apps monetize mostly via ads (low RPD $0.64 leaf); content production cost for lessons.
- **Confidence:** 0.45

### apps-08 — Brain-training reboot on puzzle-game mechanics

- **Market:** Brain Training Apps leaf (+ IQ apps tagged in Education & Training). Size $58M, yoy -32%. Growth driver: unknown.
- **Claim (falsifiable):** The brain-training collapse is specific to the incumbents, not the end of demand. A puzzle-mechanic daily brain workout with modern game feel can acquire users at CPI under $2 and convert at least 4% to trial. Falsified if CPI is over $3 or trial under 3% (that would mean demand has moved to puzzle games).
- **Evidence:**
  - Brain Training top-100: $58M vs $85M (-32%) SMALL BASE (`niche_leaders_full_app_iq_category.csv`)
  - top-5 incumbents vs challengers: incumbents -37%; challengers (same apps) +17% (`niche_top_apps.csv + leaders.csv (computed)`)
  - incumbent decline: Impulse $21.7M (-54%, H2/H1 -34%), Elevate -12% (H2/H1 -40%), Lumosity -8% (`leaders.csv`)
  - download demand of new entrants: Matiks 7.1M dl (rel 2024-08), Brainova 3.6M dl; IQ Masters $8.5M tagged in Education & Training (`niche_leaders_full_app_iq_category.csv; niche_top_apps.csv`)
- **Accessibility for a small team:** High (incumbents weakening, HHI 0.23, US publishers 80%), but the market is small and shrinking. Team fit: highest of all hypotheses (puzzle mechanics + playable ads).
- **Prototype:** 5 daily puzzle drills (sort, merge-math, pattern) with a 'brain age' score and weekly progress report. Subscription positioned as 'focus training', with a free daily drill feed.
- **Revenue test (≤ 4 weeks):** Reuse existing puzzle mechanics; 2-week build; playable ads on AppLovin/Unity, US, $3k; paywall after day 1. Pass: CPI ≤ $2, trial ≥ 4%, D7 ≥ 20%.
- **Risks:** Declining category (demand may have moved to free puzzle games); 'brain' health claims; small upside even if it works.
- **Confidence:** 0.30

### apps-09 — Gamified self-care pet / habit companion

- **Market:** Meditation & Sleep, Stress & Mental Health, Personal Health & Fitness leaves. Size $404M, yoy -9%. Growth driver: mixed.
- **Claim (falsifiable):** Wellness incumbents (Calm, Headspace) are losing revenue while challengers grow. A self-care app whose core loop is a merge/garden game tied to small daily habits can reach Finch-like trial conversion at a CPI below $2.5. Falsified if D7 retention is under 20% or trial under 5%.
- **Evidence:**
  - Meditation & Sleep top-100: $289M vs $324M (-11%); Calm -11% (H2/H1 -24%), Headspace -15% (`niche_leaders_full_app_iq_category.csv; leaders.csv`)
  - Personal Health & Fitness leaf incumbents vs challengers: top-5 -8% vs challengers +16% (`niche_top_apps.csv + leaders.csv (computed)`)
  - Finch: Self-Care Pet: $28.9M (+3%, H2/H1 -22%) — the pet loop works but has stalled (`leaders.csv`)
  - parent Personal Health & Fitness sub-category: $3,150M, +8% (flat/steady), dl -6% (`niche_dynamics_app_sub_category.csv`)
- **Accessibility for a small team:** Medium-high: HHI 0.07-0.08 in Meditation and Stress leaves; new-entrant share 4-10%. Entrants like Catzy (3.4M dl) show demand for game-like self-care. Team fit: strong (merge/garden loops).
- **Prototype:** A pet whose island grows when you finish 3 micro-habits (water, 2-min breathing, journaling prompt); merge decorations earned from habits; soft AI journaling. Yearly subscription.
- **Revenue test (≤ 4 weeks):** Playable ad ('merge to calm your pet') plus fake-door subscription on a TestFlight/Android build, US, $3k, 3 weeks. Pass: CPI ≤ $2.5, trial ≥ 5%, D7 ≥ 20%.
- **Risks:** Shrinking leaf revenue; Finch already owns the concept; mental-health claims and store policy; web2app revenue in this category is invisible to the data.
- **Confidence:** 0.35

### apps-10 — AI room redesign sold with renovation-style playable ads

- **Market:** Home & Garden Services leaf / AI interior-design cluster. Size $94M, yoy +36%. Growth driver: mixed.
- **Claim (falsifiable):** AI interior redesign is a growing IAP niche in a sub-category with the lowest US ad intensity. 'Renovate this room' playable ads (an existing studio competence) can lower CPI vs current static before/after creatives. Falsified if playable CPI is not at least 20% below a video control or trial is under 5%.
- **Evidence:**
  - Home & Garden Services sub-category: $530M vs $399M (+33%), H2/H1 +9%, ad_intensity_us_rank 44 (least ad-heavy) (`niche_dynamics_app_sub_category.csv`)
  - AI interior/garden cluster: $89.1M vs $63.8M (+40%), new-release share 18% (`niche_top_apps.csv (regex cluster)`)
  - Home & Garden Services leaf: $94M vs $69M (+36%), HHI 0.10, new-entrant share 17.8% (`niche_leaders_full_app_iq_category.csv`)
  - app-level momentum: AI Home Design H2/H1 -25%, Home AI -10%, AI Remodel +57% (+133% yoy) (`leaders.csv`)
- **Accessibility for a small team:** High: fragmented (HHI 0.10), entrants reach $1-3M in months; generation via image APIs. Team fit: strong (renovate/merge playable ads already in the portfolio).
- **Prototype:** Photo of a room, then 6 AI styles, then a 'renovate' swipe reveal; save/export behind a weekly subscription; garden/exterior as upsell.
- **Revenue test (≤ 4 weeks):** One-week web prototype plus 3 playable ads vs 3 video ads on Meta/AppLovin, US, $3k; fake-door paywall on export. Pass: playable CPI/CPL ≥ 20% below video, paywall-tap ≥ 10%, checkout intent ≥ 3%.
- **Risks:** Commoditized (several leaders already decaying H2/H1); image-model cost; the sub-category total includes smart-home/security apps (mapping inferred), so the AI niche itself is ~$90M.
- **Confidence:** 0.40

### apps-11 — Faith devotional micro-content + trivia streak

- **Market:** Religion & Spirituality sub-category / leaf. Size $153M, yoy +29%. Growth driver: entrants.
- **Claim (falsifiable):** Faith apps are growing on new entrants with widget and AI-chat formats. A daily devotional built around a 2-minute verse-trivia streak game can reach trial conversion of at least 5% at CPI ≤ $1.5 in the US. Falsified otherwise.
- **Evidence:**
  - Religion & Spirituality sub-category: $153M vs $119M (+29%), but H2/H1 -11% (decelerating), US time +7% (`niche_dynamics_app_sub_category.csv`)
  - leaf new-entrant share / entrants share of abs delta: 23.6% / 0.588; HHI 0.08 (`niche_leaders_full_app_iq_category.csv`)
  - fastest growers: Bible Path +298%, Duomo +171%, Bible Chat +81% ($14.0M); Hallow -19% (`niche_leaders_full_app_iq_category.csv; leaders.csv`)
  - devotional cluster: $114.1M vs $93.5M (+22%), 21% from apps released ≥2024-07 (`niche_top_apps.csv (regex cluster)`)
- **Accessibility for a small team:** High: HHI 0.08, 29 entrants into the top 100, US publishers 68%. Team fit: medium (trivia/streak micro-games, widgets).
- **Prototype:** Daily verse widget, then a 3-question trivia mini-game, then a reflective AI prompt; streak flames and a family leaderboard. Annual subscription plus a lifetime plan.
- **Revenue test (≤ 4 weeks):** A 2-week build; Meta/TikTok faith-interest targeting in the US, $2k; paywall on day 2. Pass: CPI ≤ $1.5, trial ≥ 5%, D7 ≥ 25%.
- **Risks:** Decelerating momentum (H2/H1 -11%); sensitive content and doctrinal trust; cheap clones; widget novelty decay (Bible Chat H2/H1 -44%).
- **Confidence:** 0.40

### apps-12 — AI-produced interactive micro-drama inside a micro-game feed

- **Market:** Short Drama leaf (Movies & TV Shows sub-category). Size $2241M, yoy +22%. Growth driver: entrants.
- **Claim (falsifiable):** Short-drama revenue is entrant-driven but run as a UA arms race. AI-produced episodes lower content cost enough for a small team, and interactive branching (a mini-game at each cliffhanger) lifts pay-to-unlock rates vs linear drama. Falsified if the unlock rate on a web test is under 2% of viewers or CTR is under linear-drama benchmarks.
- **Evidence:**
  - Short Drama top-100: $2,241M vs $1,841M (+22%), new-entrant share 38.6%, 43 entrants into top 100, HHI 0.09 (`niche_leaders_full_app_iq_category.csv`)
  - entrant winners: NetShort $248.3M (+120%), Dramawave $227.4M (+120%); VibeShort: AI Short Dramas $35.5M (rel 2026-02) (`leaders.csv`)
  - incumbent fatigue: ReelShort -8% (H2/H1 -14%), ShortMax -30%, GoodShort H2/H1 -10% (`leaders.csv`)
  - Movies & TV Shows sub-category: downloads +34% but US time -2%, revenue +6% (`niche_dynamics_app_sub_category.csv`)
- **Accessibility for a small team:** Low-medium: unconcentrated (HHI 0.09) but entry needs big UA budgets (Singapore/HK publishers hold 60% of the top 5 mix). The small-team angle is AI production plus interactivity, not out-spending. Team fit: medium-high (micro-game feed).
- **Prototype:** A 10-episode AI-generated romance micro-drama, 60 s per episode; at each cliffhanger the viewer plays a 15 s mini-game to choose the branch; coins unlock episodes 4+.
- **Revenue test (≤ 4 weeks):** Produce 3 episodes in 2 weeks and run them as in-feed ads to a web player with coin unlock (web checkout), $3k, US + PH. Pass: episode-1 completion ≥ 60%, unlock rate ≥ 2% of viewers, CAC per payer ≤ first-week revenue per payer.
- **Risks:** Content quality of AI video; store review of AI content; incumbents' UA spend; revenue concentrated in a few markets; attention not growing in the US (ts -2%).
- **Confidence:** 0.35


## 6. Things to not build (and why)

- **Generic AI chat assistant or wrapper.** The AI Assistant leaf has HHI 0.59 and ChatGPT holds 76% of its top 100. Wrappers are shrinking: ChatOn -39%, ChatBox -64%.
- **Homework helper.** Teaching & Classroom is -23%; Chegg -68%, Photomath -59%.
- **Dating app.** -9%, and the incumbents themselves are losing users (US time -6%).
- **OTT or long-form streaming.** HHI 0.06, but revenue per download is $6.32 and the business needs a content budget.
- **Cloud storage, email, galleries.** Platform-owned: Google One holds 84% of Cloud Storage.

## 7. Caveats

- Revenue covers store IAP only. Ad-funded attention (sections 3 and 1.3) is invisible in the revenue columns, and web-billed subscriptions are invisible too. Disney+, Netflix and the AI fitness/nutrition web funnels are probably understated, and their "declines" may partly be billing moving to the web.
- Leaf sizes are top-100 sums, not leaf totals, and the leaf-to-sub-category mapping is inferred.
- The "AI-named" and product-cluster cuts use name regexes over the top-100 lists. They are approximate and include renames (Canva).
- New-entrant definition: release_date ≥ 2024-07-01 (`summary.json` thresholds).
- US time spent covers the US only. Global attention trends can differ (for example, short drama is Asia/SEA-led).

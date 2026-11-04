# CROSSCHECK: our tables vs the parallel Codex analysis

Segment: crosscheck. Date: 2026-10-10.
Our data: `analysis/out/*.csv` and `summary.json`.
Codex files (read as data only): `data/market_analysis.json` (schema_version 1, generated 2026-10-10T07:49Z) and `data/quality_audit.json`.
Method: python3 -I with the stdlib only. Scripts are in the session scratchpad (`cmp2.py` to `cmp7.py`). No API calls, and `.env` was not read.

**Measurement boundary (applies to every dollar figure below).** These are Sensor Tower store estimates: App Store plus Google Play IAP and paid downloads only. They exclude ad revenue, web/D2C payments, third-party Android stores (mainland China Android is largely missing) and PC/console/web. Ad-monetized niches such as arrow puzzles, hyper-casual and utilities are undervalued in revenue, so downloads and US impression share are the proxies used for them. Taxonomy tags are Sensor Tower's own and can be re-assigned over time.

**New boundary finding.** The dollar levels in our CSVs are about 70% of Sensor Tower's *published* figures:
- Calendar 2025: $117.52B summed from `niche_monthly_unified_app_primary_category.csv`, against the public $167B. Ratio 0.704.
- Q2 2026: $30.43B summed over Game IQ plus App IQ in the `niche_monthly_*` files, against the public $43.6B.

The growth rates, however, match the public Q2-2026 index almost to the decimal (table T2c). The CSV revenue is therefore most likely **net of the store fee** (or another definition that differs from the public gross number). Codex's own `quality_audit.json` already notes that local schemas "do NOT explicitly name ... gross/net". For any revenue test, our dollars should be read as roughly net, about 1/0.7 = 1.43x below gross consumer spend. Growth comparisons are unaffected.

---

## 1. Niche statuses: Codex "рост / стагнация / снижение" (+-5%) vs our rev_class (+10% / -5%)

**The underlying numbers are identical.** For all 186 niches (83 app_sub_category plus 103 game_sub_genre), Codex `revenue_usd.current`, `prior` and `growth` equal our `rev_cur_usd`, `rev_prior_usd` and `rev_yoy`:
- the largest current-revenue difference is $0;
- no growth figure differs by more than 0.1 pp;
- Codex `growth_3m` equals our `rev_last3m_yoy` to within 5e-7.

Both pipelines read the same raw pulls: `store_app_sub_category_WW-0a58e6fbd22a.json` and `store_game_sub_genre_WW-995490baa1be.json`.

Cross-tab of 186 niches (Codex status by our class):

| | ours growing | ours flat | ours declining |
|---|---|---|---|
| Codex рост (growing) | 81 (54 app + 27 game) | **12** (8 app + 4 game) | 0 |
| Codex стагнация (flat) | 0 | 35 (10 + 25) | 0 |
| Codex снижение (declining) | 0 | 0 | 58 (11 + 47) |

All 12 disagreements come from the threshold rule alone: the niches with +5% < yoy < +10% are "рост" for Codex and "flat" for us. On the declining side the rules coincide in practice; Codex uses < -5% and we use <= -5%, and no niche sits exactly at -5%.

### Table T1: the 12 disagreements (same yoy, different label)

Base sizes are from `niche_dynamics_*.csv`. Momentum is our H2/H1; last3m is the Jul-Sep YoY. Niches flagged **<$50M** have a small base.

| dim | niche | rev_prior | rev_cur | yoy (both) | Codex | ours | H2/H1 | last3m YoY | read |
|---|---|---|---|---|---|---|---|---|---|
| app | Social Media | $10,745M | $11,787M | +9.7% | рост | flat | +6.9% (accel) | +11.3% | near threshold and accelerating; TikTok is 51.8% of top-100 |
| app | Movies & TV Shows | $10,057M | $10,647M | +5.9% | рост | flat | +5.0% (accel) | +8.0% | parent is flat, but the **Short Drama** leaf is +21.8% (top-100) with downloads +101% (Codex leaf); see H-02 |
| app | Personal Health & Fitness | $2,910M | $3,150M | +8.2% | рост | flat | +4.5% (steady) | +2.5% | US +0.2% vs DE +22.7% and FR +29.7%; see H-04 |
| app | Education & Training | $1,622M | $1,777M | +9.6% | рост | flat | +0.5% (steady) | +13.6% | Language Education leaf +18.1% (Duolingo is 59% of top-100) |
| app | Hobbies & Interests Shopping | $31M | $34M | +8.8% | рост | flat | +4.1% | -5.4% | **<$50M**; Android impressions absent |
| app | Law & Government | $27M | $28M | +5.4% | рост | flat | +6.2% | -11.4% | **<$50M** |
| app | Pet Care Services | $21M | $23M | +9.1% | рост | flat | -6.0% (decel) | -5.7% | **<$50M**, decelerating |
| app | Food Delivery Services | $6M | $7M | +5.7% | рост | flat | -9.0% (decel) | -0.6% | **<$50M**, essentially no IAP market |
| game | Sports Manager | $292M | $307M | +5.1% | рост | flat | +13.8% (accel) | +16.8% | acceleration is entrant/IP-driven (SEGA Football Club Champions $16.2M, Inazuma Eleven $11.7M; JP +21.6%). Tagged apps 779 -> 1,273 (+63%), so reclassification is possible |
| game | Virtual Casino | $266M | $291M | +9.7% | рост | flat | +2.8% | +3.9% | **tagged-app count 297 -> 1,685 (x5.7)**: likely reclassification; top-100 growth is "both" ($23.7M) and entrants add only $2.1M |
| game | Pachinko | $34M | $37M | +8.3% | рост | flat | -11.0% (decel) | +1.4% | **<$50M**, decelerating |
| game | Other Puzzle | $28M | $31M | +9.2% | рост | flat | -0.6% | +12.3% | **<$50M**, ad-heavy (ad_intensity_us rank 7) |

Category level (`niche_dynamics_app_category.csv` and `niche_dynamics_game_genre.csv` against Codex `categories`): 6 of 29 disagree, all inside the +5..+10% band:

| category | yoy (both) |
|---|---|
| Health & Wellness | +8.6% |
| Auto | +8.0% |
| Law & Government | +5.4% |
| Shooter | +8.2% |
| Sports | +9.1% |
| Arcade | +8.0% |

Local niches (Codex `local_niches` against our `country_niche_dynamics.csv`): of 5,207 rows, values are identical, 4,763 labels agree, 290 are "рост vs flat" from the same threshold, and 154 are insufficient-data in both.

**Reading.** None of the disagreements are factual. A "+5..10%" niche is close to inflation-plus-price-increase growth, and our 10% bar is deliberately stricter. The only threshold niches worth a second look are the ones that are *accelerating* (Social Media, Movies & TV Shows via Short Drama, and Sports Manager), plus parents whose leaves diverge (Personal Health & Fitness via Nutrition, Education via Language).

## 2. Totals: WW, games vs non-games, countries

### Table T2a: WW and split (USD, store IAP and paid only)

| measure | Codex | ours (file / key) | match |
|---|---|---|---|
| WW revenue cur / prior | $123,138.94M / $114,880.69M, +7.19%, status "рост" | `summary.json` totals_ww.region_WW_total: $123,138.94M / $114,880.69M, +7.19% (our class: **flat**) | identical; label differs by threshold |
| WW downloads cur / prior | 149.151B / 149.322B, -0.11% | same | identical |
| Sum of 112 countries | prior $114,877.79M (LA missing Oct-Dec 2024) | region_sum_of_countries: $123,138.94M / $114,877.79M, +7.19% | identical; LA gap = $2.9M |
| Non-games (App IQ) | 15 app_category sum: $66,258.23M / $56,790.93M, +16.67% | app_category_sum_non_games_app_iq: same, +16.67% | identical |
| Games (Game IQ) | 14 game_genre sum: $56,280.51M / $57,676.00M, -2.42% | game_genre_sum_games: same, -2.42% | identical |
| Games (store primary 6014) | n/a (Codex does not report it) | $55,604.72M / $57,059.51M, -2.55%; games share of WW = 45.2% | ours only |
| Non-games (store primary != 6014) | n/a | $67,534.22M / $57,821.17M, +16.80% | ours only |
| App IQ + Game IQ vs WW | quality_audit: taxonomy sum = 99.5% of WW revenue, 96.1% of downloads | app_category_plus_game_genre: $122,538.74M (-0.49% vs WW) | consistent |

Codex frames the market as "non-game spending overtook games", citing the public `st_mobile_2026` report. Our tables confirm this on both taxonomies: non-games are 54.8% of current WW revenue by store primary category (67,534 / 123,139).

### Table T2b: countries

| check | result |
|---|---|
| Country set | 112 vs 112, the same codes |
| Current revenue per country | max abs diff $0 |
| Status agreement | 81 growing/growing, 15 flat/flat, 3 declining/declining (RU -40.5%, VE -16.4%, AO -18.9%), 1 insufficient (LA) |
| Disagreements (12, all +5..10%) | KR +6.8% ($4,947M -> $5,281M, accelerating); TW +7.3% ($2,317M -> $2,487M); SG +7.2% ($458M -> $491M); SK +5.2%; NG +6.5%; HR +8.9%; DO +6.2%; PA +7.9%; UY +9.4%; SI +9.7%; SV +8.4%; KE +5.5%. Every one from SK down is **<$100M**, and SV/KE are **<$50M** |
| Top 3 markets | US $40.96B +1.0% (flat in both); CN $16.30B +4.5% (flat in both; App Store only, no Android third-party); JP $11.83B +1.1% (flat in both) |
| Local-market selection | Codex 28 (13 mandatory incl. TW plus top-10 plus 6 emerging); ours 27 `selected_local_market=true` (TW has local niche data but no country leaders) |

### Table T2c: our CSVs vs the public Sensor Tower Q2-2026 index that Codex cites

| measure | public (Codex `public.observations`) | ours (Apr-Jun 2026 vs Apr-Jun 2025 from `niche_monthly_*`) |
|---|---|---|
| All mobile | $43.6B, +5.3% | $30.43B, +5.23% (App IQ + Game IQ) |
| Non-game apps | $24.4B, +14.6% | $16.85B, +14.68% |
| Games | -4.5% | $13.57B, -4.53% |
| Puzzle games | $4.0B, +17% | $2.83B, +17.03% |
| CY2025 all mobile | $167B, +10.6% | $117.52B (ratio 0.704) |

Growth agrees to within 0.1 pp; levels are about 0.70x. See the boundary note at the top.

## 3. Codex hypotheses (a neutral list with their stated evidence)

### 3a. `public.opportunity_hypotheses` (8, all status "untested_inference")

| id | niche | hypothesis (paraphrased) | stated sources / evidence | candidate markets | Codex's own validation list | our-table check |
|---|---|---|---|---|---|---|
| vertical_ai_workflows | Specialized AI workflows | Specialized recurring workflows with integrations and owned data may retain better than general chatbot wrappers | st_ai_2026 (assistant concentration), st_q2_index_2026 (GenAI Q2 spend $1.4B, +82%), ChartMogul (AI-native median GRR 40%, NRR 48%; >$250/mo GRR 70%), RevenueCat (AI Y1 LTV/payer $30.16 vs $21.37; annual retention 21.1% vs 30.7%) | WW, US, Europe | payer retention, switching costs, post-inference margin, concentration | AI Assistant top-100 $5,365M (+145%), ChatGPT 75.8%, top3 90.8%, new entrants 7.2%: the assistant layer is closed. B2B retention cannot be checked in store data |
| nutrition_training | Nutrition tracking and personalized training | A narrow recurring health goal may support personalization and payer retention | st_health_ai_2026 (H&F 2025 IAP $4.5B, +13%; downloads +0.8%), RevenueCat | US, Europe, WW localized | concentration, seasonality, retention, UA economics | **confirmed in part**, see H-04 |
| localized_short_drama | Localized short drama and content infrastructure | Local storytelling, languages and hybrid monetization; production/localization tools as an adjacent route | st_short_drama_2026 (Q1-26 downloads 850M, +140%; IAP $750M, +20%; SEA+LATAM+IN = 75% of downloads), st_india_2026 | SEA, LATAM, IN | revenue vs download geography, content cost, retention by language, UA dependence | **confirmed**, see H-02 |
| puzzle_breakouts | Puzzle and arrow puzzle games | Recent puzzle growth warrants testing differentiated mechanics and monetization | st_q2_index_2026 (Puzzle Q2 $4.0B, +17%; downloads +1%) | WW, UK, CA, SA, AE | arrow-subgenre share of growth, cohorts, ad monetization, CPI saturation | **confirmed for the download wave; SA/AE bases are tiny**, see H-01 |
| creative_operations | Creative production, testing, localization tools | Increasing creative iteration may create demand for tools tied to testing throughput | st_digital_ads_2026 (US tracked ad spend $201B, +15%; gaming top advertisers' unique creatives +54%) | US, WW advertisers | WTP, integration, incrementality, density | B2B; not measurable here. Our US impression shift (Sort +5.29 pp, Match Merge 2 +1.38 pp) shows *where* creative demand is rising |
| ai_discovery | AI discovery, referral analytics, lead gen | High-intent AI discovery may support measurement/acquisition products | st_web_2026 (AI assistant web visits +86%; AI referrals about 1% of web traffic) | US, Europe, WW | conversion, distribution, incrementality | web layer; outside our CSVs |
| local_distribution_india | Localized products with partnership distribution | Distribution partnerships and local fit may beat broad download-led launches in India | st_india_2026 (IN IAP +34% H1-26, downloads +3%; Religion/astrology MAU 80M; AI assistant MAU 14M) | IN | post-promo activity, rev share, language, partner access | **IAP growth confirmed (+31.5% TTM); the faith MAU does not translate into IAP**, see H-05 and H-06 |
| premium_games_tools | Premium action, co-op, game-production tools | Action/strategy engagement growth merits creator-friendly gameplay and tools | st_premium_games_2026 (PC/console premium H1-26 $13.8B, +5%; Steam action time +28%, strategy +24%, RPG -14%) | WW | new vs catalog, concentration, dev cost, creator reach | PC/console are outside our data. Mobile analogues: Action -23.4% and RPG -12.4% decline; Strategy -5.2% |

### 3b. `b2b.opportunity_priority_hypotheses` (4)

These rest on Gartner, Synergy and company disclosures (Salesforce, ServiceNow, Snowflake, Databricks, Datadog, Shopify, CrowdStrike, Zscaler). None of it is checkable in Sensor Tower store data.

| niche | why (Codex) | signals | first validation (Codex) |
|---|---|---|---|
| Vertical workflow automation with audited actions | CRM/workflow demand plus a need for measurable outcomes | enterprise_crm_agents, enterprise_workflow_automation | 10 interviews with one process owner; compare manual cost to implementation price; paid pilot |
| AI data context, evaluation and cost controls | data-platform growth needs quality/cost control | cloud_infrastructure_market, data_cloud_enterprise_ai, private_data_platform_challenger, observability_and_agent_ops | find teams with production AI workloads; measure error/request cost |
| Local/cross-border merchant operations | Shopify gives a paying merchant channel | commerce_infrastructure | pick a country and segment; test WTP for reconciliation/returns |
| AI identity and data security operations | platform security monetizes; agent permissions create workflows | endpoint_identity_cloud_security, zero_trust_security, enterprise_workflow_automation | security-owner interviews; controlled pilot |

Codex's own `b2b.coverage_gaps` admit that none of these has a TAM proof and that Sensor Tower audience does not substitute for enterprise revenue. For a casual-games/playables studio, only `creative_operations` touches existing strengths (playable ads as a service).

### 3c. Niche-level `driver_ids` / `new_release_ids` claims

Codex attaches to each niche 10 `leader_ids`, 10 `driver_ids` (largest positive app delta in the 4,455-app cohort) and `new_release_ids` (apps released **on or after 2025-10-01**, i.e. inside the current window). Its largest niches by delta, with our cross-check from `niche_leaders_full_*.csv`, are in Table T3.

### Table T3: Codex drivers vs our per-niche top-100 decomposition (selected)

| niche | prior -> cur | Codex: # new releases, their cur rev, share of delta | ours: new-entrant (release >= 2024-07) share of top-100 rev | ours: entrants' share of abs delta | top1 (share of top-100) |
|---|---|---|---|---|---|
| Sort (game) | $197M -> $754M | 10, $182M, 0.33 | 76.3% | 85.1% | Pixel Flow! 25.0% |
| Match Merge 2 | $1,419M -> $2,666M | 5, $56M, 0.05 | 16.2% | 14.2% | Gossip Harbor 41.8% |
| Open World Adventure | $727M -> $1,020M | 3, $214M, 0.73 | 38.9% | 81.8% | Genshin Impact 34.0% |
| Idle RPG | $1,343M -> $1,402M | 5, $56M, 0.95 | 51.6% | 1,166% (incumbents -$335M) | 메이플 키우기 24.2% |
| 4X Strategy | $7,415M -> $7,584M | 7, $103M, 0.61 | 22.6% | 312% (incumbents -$163M) | Last War 17.8% |
| Solitaire | $330M -> $455M | 0, $0 | 61.9% | 38.6% | Disney Solitaire 51.3% |
| Generative AI (app) | $2,642M -> $6,320M | 6, $20M, 0.01 | n/a (leaf-split; see AI Assistant / AI Companion) | | |

**A systematic Codex blind spot.** Codex computes an app's TTM sum only when all 12 months are non-null. Apps launched *during the prior window* (Oct 2024 to Sep 2025) therefore get `revenue_usd.prior = None` and `delta = None`. They fall out of `driver_ids`, and they are not `new_release` either, because they were released before 2025-10-01. There are **331 such apps with $1,575M of current revenue**, which are exactly the hottest launches of the last 18 months. The biggest are:

| app | niche | release | current revenue |
|---|---|---|---|
| 메이플 키우기 | Idle RPG | 2025-04 | $297.0M |
| **Pixel Flow!** (the #1 app in Sort) | Sort | 2025-08 | $185.1M |
| Last Asylum | 4X | 2025-09 | $91.7M |
| X-Clash | | | $58.6M |
| Chaos Zero Nightmare | | | $53.4M |
| **Hollywood Merge** | Match Merge 2 | 2025-08 | $44.7M |
| Solitaire Associations Journey | | 2025-08 | $43.8M |
| Clash of Critters | | | $40.2M |
| Castle Clashers! | | | $34.5M |
| **Gecko Out** | Sort | | $29.9M |
| **Foodstars: Merge & Cook** | | 2025-08 | $21.6M |

As a result, Codex understates entrant-driven growth: Sort's new-release share of delta is 0.33 in Codex against 0.85 for entrants in our top-100 decomposition. Codex's `cohort_revenue_coverage` and `top3_product_revenue_share` are also cohort-only. For game sub-genres they match our top-100 top-3 share closely (median absolute difference 0.008). They diverge only in tiny niches where the cohort holds 0 to 3 apps (Real-Time Puzzle 0.07 vs 0.74, Teen Patti 0.39 vs 0.97, Claw Machine 0.00 vs 0.43; all under $20M).

## 4. Methodological differences

| topic | Codex | ours | consequence |
|---|---|---|---|
| Status thresholds | > +5% growing, < -5% declining | >= +10% growing, <= -5% declining | 12/186 niches, 6/29 categories, 12/112 countries and 290/5,207 local rows are "рост" for Codex and flat for us. No factual conflict |
| WW label | "рост" at +7.19% | flat at +7.19% | headline wording differs, numbers identical |
| 6-month measure | `growth_6m` = Apr-Sep 2026 vs Apr-Sep 2025 (YoY) | `rev_h2_h1` = Apr-Sep 2026 vs Oct 2025-Mar 2026 (sequential) | ours is seasonality-exposed but catches turning points sooner. Not comparable column to column |
| 3-month measure | `growth_3m` Jul-Sep YoY | `rev_last3m_yoy` Jul-Sep YoY | identical (diff < 5e-7) |
| "New" | `new_release` = released >= 2025-10-01 (167 apps) | `is_new_entrant` = released >= 2024-07-01 (801 in leaders.csv) | Codex misses the 2025 launch wave |
| App TTM with gaps | prior = None if any month null, so dropped from drivers | `rev_*_best` fallbacks; per-niche top-100 lists pulled directly per period | 331 apps / $1,575M invisible as drivers in Codex |
| Leaders | cohort-only: union of global top-2000 (4,455 apps), 10 leaders per niche | true per-niche top-100 per period (`niche_leaders_full_*`), with WW coverage, HHI, entrants/exits decomposition | ours is valid for small niches; Codex's leaders thin out below about $50M |
| App niches | 83 app_sub_category plus 51 App IQ "leaf" niches with their own series (`leaf_niches`) | 83 app_sub_category series; App IQ leaves only through top-100 lists (`niche_leaders_full_app_iq_category.csv`, no WW series) | **Codex has leaf-level WW series we lack** (e.g. Short Drama +23.1%, AI Companion +179%, Nutrition & Diet +12.2%); we can confirm them only through top-100 sums, which cover 97-99% of those leaves' Codex totals |
| Usage | US total time spent per niche | `ts_*` columns (same source) | same |
| Ad proxies | none | US impression share and ad_intensity_us | ours only; needed for ad-monetized niches |
| Reclassification | not checked | `total_count_cur/prior` per tag | e.g. Virtual Casino 297 -> 1,685 tagged apps, Sports Manager 779 -> 1,273, Sort 4,043 -> 6,921 |
| Quality audit | Codex flags gross/net as unconfirmed; leaf-to-parent game mismatch up to 355,744,651,310 cents/month in its own mapping (an internal mapping check, not visible in the store totals) | consistency checks all within 2% | see the gross/net note at the top |

## 5. Cross-check hypotheses

These are cases where Codex's data or public evidence points somewhere that our CSVs confirm but a standard read of our niche tables could miss, mostly because a niche sits under a flat parent or in the +5..10% band, or because the signal lives in downloads rather than IAP.

### H-01 (crosscheck-01): Arrow-escape puzzles are an ad-monetized download wave that IAP tables underweight
- **Claim.** In Sort, the 2025-26 download growth is carried by near-zero-IAP arrow-escape titles. A playable/feed studio can capture this with ad monetization and cheap CPI rather than IAP. The claim is falsified if arrow-mechanic playables do not beat the Sort-genre CTR/CPI baseline.
- **Evidence**
  - Sort `niche_dynamics_game_sub_genre.csv`: rev $196.9M -> $753.9M (+282.8%); dl 1,127.2M -> 1,727.9M (+53.3%; last3m +112.8%); ts_yoy +97.3%.
  - `niche_top_apps.csv`, three arrow titles in the Sort top-100:

    | title | release | downloads | IAP |
    |---|---|---|---|
    | Arrows Puzzle Escape | 2025-07 | 140.5M | $0.69M |
    | Arrows GO! | 2026-02 | 99.0M | $0 |
    | Arrow Puzzle: Tap Puzzle Games | 2025-11 | 81.6M | $0.09M |

    Together they hold 321.1M downloads, **53% of Sort's +600.7M download delta**.
  - Across puzzle sub-genres, 43 arrow-titled games released since 2025-07 have 348.9M downloads and only $1.19M IAP.
  - US impression share for Sort is 10.86%, a **+5.29 pp** shift, the largest of any game sub-genre (next: Slots +1.40 pp).
  - Codex `puzzle_breakouts` cites the Q2 index (Puzzle +17%, downloads +1%); ours: Puzzle Q2 +17.03%.
- **Accessibility.** High. The Sort top-100 is 76% new entrants, with top1 Pixel Flow! at 25.0% and HHI 0.093. Codex's SA and AE candidate markets have tiny bases: SA Sort $0.8M -> $3.0M and AE $0.5M -> $2.0M, against GB $13.1M -> $55.7M and CA $6.4M -> $23.9M.
- **Test (<= 4 weeks).** Three arrow-escape playable variants (classic, color-gated, timed), plus one control from the existing Sort/merge set. Run a US+GB+CA paid test and measure CTR, IPM and CPI; also measure rewarded-ad ARPDAU in a 1-country feed cohort.
- **Risks.** A clone flood: 22 arrow titles already sit in the Maze top-100. Ad revenue is invisible in Sensor Tower, so monetization stays unproven. The arrows are tagged across Sort, Maze and Riddle (a taxonomy split).

### H-02 (crosscheck-02): Short Drama grows inside a "flat" parent; SEA downloads outrun IAP
- **Claim.** Short drama is growing (top-100 IAP +21.8%), but Movies & TV Shows reads flat in our class (+5.9%). In SEA, downloads are growing 2 to 10x faster than IAP, so demand there is ad/hybrid-monetized.
- **Evidence**
  - `niche_leaders_full_app_iq_category.csv` Short Drama: top-100 $1,840.9M -> $2,241.4M (+21.8%); new entrants 38.6% of top-100; top1 DramaBox 17.5%; HHI 0.092; decomposition both +$308.0M, entrants +$148.3M, exits -$55.8M.
  - Codex leaf: $1,855M -> $2,284M (+23.1%), downloads +101.2%.
  - `country_niche_dynamics.csv` Movies & TV Shows:

    | country | downloads | revenue |
    |---|---|---|
    | ID | +130% | -6.7% ($92.6M -> $86.4M) |
    | PH | +115% | +4.0% |
    | VN | +97% | +64% ($14.8M -> $24.3M, **<$50M**) |
    | IN | | +50% ($61.3M -> $92.0M) |

  - `country_leader_summary.csv`: the download new-entrant top-5 in ID, PH, TH, BR and IN are dominated by short-drama apps (ID: Melolo 100.3M, FreeReels 80.9M, PineDrama 52.5M; IN: Story TV 136.7M, Kuku TV 93.3M, QuickTV 77.4M).
- **Accessibility.** Medium-low for content (production cost) and higher for interactive formats. Publishers are concentrated: SG 44.6%, US 27.3%, HK 14.9%.
- **Test.** An interactive "choose-the-next-scene" micro-drama, built as a feed card with a puzzle gate between episodes. Soft launch in PH with rewarded ads plus an episode-unlock IAP for 4 weeks; measure D1/D7, ad ARPDAU and unlock conversion.
- **Risks.** Content cost. The incumbents have libraries. IAP in SEA is falling or flat, so revenue depends on ad eCPM, which is low in SEA.

### H-03 (crosscheck-03): AI Companion is the fragmented, entrant-driven part of GenAI
- **Claim.** Behind the ChatGPT-dominated GenAI numbers, AI Companion is a fragmented niche where new entrants reach the top-100 within a year. A story/character product can enter here, unlike in assistants.
- **Evidence**
  - `niche_leaders_full_app_iq_category.csv` AI Companion: top-100 $170.7M -> $473.8M (+177.6%); top1 Tipsy Chat 11.5%; top3 29.4%; HHI 0.044; new entrants 49.3% of top-100; 39 entrants into the top-100; decomposition both +$215.0M, entrants +$108.1M.
  - By contrast, AI Assistant: ChatGPT 75.8%, top3 90.8%, new entrants 7.2%.
  - Codex leaf AI Companion: $190M -> $531M (+179%).
- **Accessibility.** Medium. The tech is commoditized; the costs are inference and moderation/store policy. Publishers: US 44.2%, KR 19.6%.
- **Test.** A character companion that plays micro-puzzles with the user (a "story-puzzle" hybrid). Fake-door subscription at $7.99/week in US paid social; measure CTR, store-page conversion and paywall intent over 2 weeks.
- **Risks.** Store-policy and age-rating risk. Retention for AI apps is weak (Codex cites RevenueCat: annual retention 21.1% vs 30.7% for non-AI). Inference cost against ARPPU.

### H-04 (crosscheck-04): AI nutrition trackers grow in DE/FR while the US and the incumbent stall
- **Claim.** Personal Health & Fitness is flat for us (+8.2%) but growing in Codex. The growth is in Europe and in AI photo-calorie trackers that take share from MyFitnessPal. A localized AI tracker with a gamified layer can win paid users in DE/FR.
- **Evidence**
  - `country_niche_dynamics.csv` Personal Health & Fitness: DE $158.0M -> $193.9M (+22.7%), FR $88.9M -> $115.3M (+29.7%), US $1,477.7M -> $1,481.0M (+0.2%).
  - `niche_leaders_full_app_iq_category.csv` Nutrition & Diet: top-100 $549.3M -> $610.1M (+11.1%). MyFitnessPal is -4% at 28.5%; Yazio +45%, MacroFactor +50%, Cal AI +50%, Foodvisor +65%; fastest growers Calo +650% and BitePal +299%. Entrants are 44.7% of abs delta.
  - Codex leaf Nutrition & Diet: +12.2%, downloads -8.8%.
- **Accessibility.** Medium. New entrants hold only 6.0% of top-100 revenue; top3 47.9%; publishers US 55.8%, DE 15.1%.
- **Test.** A DE/FR landing page for an "AI photo calorie + streak mini-game" with a fake-door €4.99/week paywall. Meta ads at €2-3k; measure CTR, signup and paywall-click rate against a US control.
- **Risks.** The country data is the *parent* sub-category, so it cannot be proven nutrition-specific. CAC is high. The incumbents (Yazio) are themselves German.

### H-05 (crosscheck-05): Faith/devotional apps form an entrant-driven niche, but India is a download market, not an IAP one
- **Claim.** Religion & Spirituality grows on new devotional and widget apps in the US and LatAm. Codex's India faith signal (80M MAU) does not convert to store IAP.
- **Evidence**
  - `niche_dynamics_app_sub_category.csv`: $118.6M -> $152.6M (+28.6%); last3m +24.5%; H2/H1 -11.3% (Lent seasonality in H1). The niche is ad-heavy (ad_intensity_us rank 17).
  - Top-100: entrants are 58.8% of delta. Hallow is -19% at 23.8%; Bible Path +298%, Duomo +171%, Bible Chat +81%.
  - `country_niche_dynamics.csv`:

    | country | revenue | downloads |
    |---|---|---|
    | US | $78.5M -> $94.1M (+19.9%) | |
    | BR | $2.8M -> $4.9M | |
    | MX | $1.3M -> $2.2M | |
    | IN | $0.4M -> $0.6M | 177.7M |

    BR, MX and IN are all **<$50M**.
  - Codex cohort coverage for this niche is only 31.5% (long tail).
- **Accessibility.** High. The top1 share is low, 29 entrants entered the top-100, and the products are simple (widgets, daily verse, chat).
- **Test.** A "daily verse word-puzzle" (a scripture crossword or sort mechanic) plus a home-screen widget. US paid UA test to a store listing or fake door, with a $2.99/month or $29.99/year paywall; measure CPI and trial-intent.
- **Risks.** Seasonality (Lent/Easter). Sensitivity of the subject. A $153M niche caps the upside.

### H-06 (crosscheck-06): India is the fastest-growing large IAP market, driven by apps and short drama, not local publishers
- **Claim.** India's IAP growth (Codex public +34% in H1-26) is real and broad. It is not yet a games-IAP market, so it suits tests of low-price subscriptions or IAP and not revenue scale.
- **Evidence**
  - `country_dynamics.csv` IN: $688.2M -> $905.2M (+31.5%; last3m +32.2%; downloads +3.8%). This is the fastest yoy among markets above $500M (MX +29.3%, NO +27.0%).
  - The largest IN deltas (`country_niche_dynamics.csv`):

    | sub-category | change |
    |---|---|
    | Utilities | +$44.2M |
    | Generative AI | +$39.5M (+150%) |
    | Movies & TV Shows | +$30.7M |
    | Social Media | +$26.6M |
    | Match Swap (games) | +$7.8M (+36.8%, base $21.1M) |

  - `country_leader_summary.csv` IN: local publishers hold 7.8% of top-300 revenue; games are 35.0% of top-300 revenue.
- **Accessibility.** High for testing (low CPI), low for revenue (IN = 0.7% of WW).
- **Test.** Run an India arm of the micro-game feed with an INR 29-49 weekly pass or ad-removal SKU; compare payer conversion per 1k installs with a BR control.
- **Risks.** Low ARPPU. Payments friction. Revenue scale is too small to justify a dedicated product.

### H-07 (crosscheck-07): Narrative/cooking merge still admits $20-45M entrants within a year, invisible in Codex's driver lists
- **Claim.** Match Merge 2 growth is incumbent-led, but mid-2025 cooking/story merge launches reached $20-45M TTM. Codex's null-prior rule hides them.
- **Evidence**
  - `niche_dynamics_game_sub_genre.csv` Match Merge 2: $1,418.6M -> $2,666.0M (+87.9%); H2/H1 +26.9%; rpd $4.70; US impressions +1.38 pp.
  - `niche_leaders_full_game_sub_genre.csv`: decomposition both +$1,072.1M and entrants +$176.4M (14.2%). Top1 Gossip Harbor 41.8%. Tagged apps 5,476 -> 4,639 (a shrinking tag, not reclassification inflation).
  - Entrants:

    | app | current revenue | release |
    |---|---|---|
    | Flambé | $135.7M | 2024-10 |
    | Mystery Town | $87.3M | 2024-07 |
    | Hollywood Merge | $44.7M | 2025-08 |
    | Foodstars | $21.6M | 2025-08 |
    | Merge Teahouse | $18.3M | 2025-10 |

    Codex `apps`: Hollywood Merge and Foodstars have prior=None and are not among the drivers.
- **Accessibility.** Medium-low. LTV-driven UA (rpd $4.70), heavy live-ops, and publishers concentrated in China (67.3% of top-5 mix).
- **Test.** Two merge-cooking or narrative playable ads, plus one board variant in the feed. Run a US playable CTR/IPM/CPI test against a published merge benchmark; go only if CPI < $3 and IPM is above the median.
- **Risks.** The incumbents' UA budgets. A small team cannot fund the live-ops cadence. Entrant share is falling.

## 6. What our analysts should not import from Codex

- "рост" labels for niches in the +5..10% band, especially the **<$50M** ones (Hobbies & Interests Shopping, Law & Government, Pet Care, Food Delivery, Pachinko, Other Puzzle) and **Virtual Casino**, where the tagged-app count rose 5.7x (likely reclassification).
- Codex `driver_ids` / `new_release_ids` as an entrant measure. They omit 331 apps and $1.575B launched in the prior window.
- B2B and PC/console hypotheses, which have no support in store data.
- The India faith "80M MAU" as a revenue signal: IN Religion IAP is $0.6M.

# Play for Good Stage 0 — final acceptance receipt

Статус: **DRAFT — не является GO до закрытия всех `PENDING`**.  
Authority: `play-for-good-stage0-island-off-tz.md` v7 at
`4fd56cf0cdce7fb46674a822b2974949b8da709b`.

Этот receipt сводит независимые evidence-источники, но не заменяет их.
Изменчивый rollout-status после финального GO фиксируется в
`swipe-backend/docs/specs/IMPLEMENTATION-STATUS.md`; durable-решение — в
корневом `CLAUDE.md`.

## Матрица требований

| Требование Stage 0 | Authority evidence | Статус |
| --- | --- | --- |
| P1: перед изменением зафиксированы три client env-gate | `Glera/playables` `docs/receipts/play-for-good-stage0-p1-client-baseline.md`; source commit `acc872fd14c6907a4a3636f01bf35f2948a9af25` | PROVEN |
| P1: свежий клиент не показывает Island и не делает `/api/island/*` | тот же P1 receipt: browser smoke с `?island=` и `tgWebAppStartParam=f_*`; production release profile `44298d1a…` | PROVEN |
| P2.0: полный route manifest с контуром и expected status | `swipe-backend/docs/specs/island-off-route-manifest.md`; backend PR #27, merge `61b5542ac7e3df8befc671329360f5fcc187f081`; verifier PR #32, merge `86348f9164fea77578d634b3f84034948d4c5967` | PROVEN |
| P2.1: legacy / closed delivery / protective / moderation физически независимы | backend PR #27; `app/island_surface.py`; `tests/test_island_surface.py` | PROVEN |
| P2.2: legacy surface и generation runners имеют независимые default-off gates | backend PR #27; `app/config.py`; `app/island_surface.py`; `tests/test_island_{p2,surface}.py` | PROVEN |
| P2.3: cross-flag validator покрывает pre-set, quiesce и final combinations | `tests/test_island_p2.py::test_stage0_island_flag_combinations_validate` | PROVEN |
| P2: при legacy-off контур (a) отсутствует; protective и closed delivery живы | unit/PostgreSQL suites в backend PR #27 и production route-manifest/protective smoke receipts | PROVEN |
| P2: при runners-off bake/theme tasks не стартуют | `tests/test_island_surface.py::test_generation_runners_do_not_start_while_gate_is_off`; production gate receipt | PROVEN |
| P2: rollback вне production проверен обратным включением | `tests/test_island_surface.py::test_generation_runners_start_and_stop_under_independent_gate` и pre-set-вариант `test_stage0_island_flag_combinations_validate` | PROVEN |
| P3: неизменённый cached production client тихо деградирует на legacy 404 | `Glera/playables` `docs/receipts/play-for-good-stage0-p3-cached-client.md`: exact client `3886a479…`, feed `815ea74f…`, backend `9ff13fa`; серия до chest, qualified result 200, one-shot 404, no retry-loop/pageerror | PROVEN |
| P4.1: pre-set gates deployed before backend split became behavior-changing | backend PR #28, merge `43e73009834dc56fc46a9b21ad494613c1a6759b`; PR receipts/checks | PROVEN |
| P4.2: social/bots/visit awards/notifications/rewards/legacy surface off | backend PR #29, merge `a42c925d88353cce6ebbbecf74bdc38bf5f3210a`; production manifest gate snapshot | PROVEN |
| P4.3: bake/theme queue fully drained before runners-off | production drain receipt in backend PR #31: `bake_nonterminal=0`, `theme_nonterminal=0` at `2026-07-30T13:17:20.868543Z` | PROVEN |
| P4.4: generation runners off only after drain | backend PR #31, merge `d1db4a702f8be1d6060920cee563a853e1a2bc77`; production gate snapshot | PROVEN |
| P4.5: legacy routes 404; closed delivery/report/block/moderation live | exact production apply receipt `swipe-backend/docs/receipts/stage0-island-off-protective-smoke-apply.json`, SHA-256 `f9b34b0e4782b8c5b1f41baf148b0d16a9cf693ee599f4bc55d93cb35594ff99`; independent GO receipt; merge `6f471a0d64372d33f04cab0eaaa84d66978cdd89` | PROVEN |
| P4.5: no bot/notification/bake/theme runner activity during observation window | `swipe-backend/docs/receipts/stage0-island-off-24h-log-check.md`: exact freeze interval, four source-known signatures, zero Render rows; primary proof remains gates + startup guards + DB freeze | PROVEN |
| P5.1: initial manifest after drain is immutable and independently reviewed | `swipe-backend/docs/receipts/stage0-island-off-initial.json`, DB time `2026-07-30T15:12:16.072206Z`, SHA-256 `d0bbe8d7ea98f1bff66520ba793c6a27710783e9b5d7963dd06d881ea47279c1`; independent GO receipt | PROVEN |
| P5.1: after ≥24h freeze tables unchanged; protective writes match audit allowlist; no data deleted | `swipe-backend/docs/receipts/stage0-island-off-24h-verification.json`: elapsed `24.13442h`, `status=clean`, 15 freeze + 5 protective tables, zero violations; receipt SHA-256 `c050df86852ac606faa00033aa2ec98ec42efac3fcd257b7b039910b4ef4915c` | PROVEN |
| P5.2: platform-scheme rebuilt from VISION v3.0.1 and preserved as private Artifact | `play-for-good-stage0-platform-scheme-publication.md`: build/provenance digests, local + Claude preview validation, permanent authenticated private URL; public `Publish artifact` path intentionally not used | PROVEN |
| P5.3: mutable rollout status and durable decision updated at correct authorities | final patches to backend `IMPLEMENTATION-STATUS.md` and root `CLAUDE.md`; docs-boundary lint | **PENDING** |
| Common: Stage 1 spec v8 accepted, but implementation has not started | `play-for-good-stage1-v8-review-go.md`; spec source `4fd56cf0…`; no Stage 1 implementation package in this rollout | PROVEN |

## Финальный gate

Stage 0 получает `GO` только если одновременно:

1. T+24 verifier возвращает `status=clean`, подтверждает исходный baseline
   SHA-256 и интервал не менее 24 часов.
2. Supplementary log-check не показывает island runner activity/errors за
   интервал; основной proof остаётся композицией production gates,
   source-level guards и DB freeze.
3. Status/durable docs проходят `docs-boundary-lint`.
4. Platform scheme собрана из финального source commit, визуально проверена и
   сохранена приватным Artifact с постоянным authenticated URL. Публичный
   publish не используется.
5. Свежая read-only Claude-сессия проверяет exact final commits, receipts,
   publication URL и эту матрицу и возвращает `GO` без P1/P2.

До этого момента Stage 1 не начинается.

OpenAI Codex v0.146.0-alpha.3.1
--------
workdir: /Users/gleb/My projects/p4g-platform-workspace
model: gpt-5.6-sol
provider: openai
approval: never
sandbox: read-only
reasoning effort: xhigh
reasoning summaries: none
session id: 019fb2a2-992a-7281-aae4-32521efd5854
--------
user
Роль: независимый ревьюер (author ≠ reviewer), режим только-чтение.

Ревьюируемая идентичность: коммит
eaa7ca943a1994eab0fa51cafe2cc987d7274c86. Сначала выполни
`git rev-parse HEAD` и убедись, что HEAD равен этому SHA (untracked
review-файлы допустимы); если не равен — остановись и сообщи об этом
вместо ревью.

Проревьюй два файла этого коммита:
- play-for-good-stage0-island-off-tz.md (v3)
- play-for-good-stage1-mission-slice-tz.md (v3)

Это раунд R4 после твоих findings R1–R3. Проверь:
1) корректно ли внесены все findings R2: staged rollout с pre-set
   компенсирующих флагов; раздельные гейты роутов/runners и
   quiesce/drain; freeze-список таблиц с allowlist защитных writes;
   исправленная карта роутеров + route manifest; аварийный 503-путь
   пустой очереди (не 409) с отказом unlock-cutoff и DB-preflight;
   exact contract identity (case_id, contract_version) во всей схеме;
   mission_fulfillment_allocations и атомарный FULFILLED при полном
   покрытии; финансовая идемпотентность, округление вниз,
   CHECK-границы; предусловие token_goal;
2) контрактную целостность против VISION.md (v3.0.1) и
   play-for-good-gap-map-v1.md того же коммита;
3) не внесли ли правки v3 новых противоречий.

Формат ответа: findings списком с [P1]/[P2]/[P3] и точными
файлами/строками, либо явный вердикт "GO" первым словом, если блокеров
нет. Только ревью — никаких правок файлов.

Дополнение R4: проверь прежде всего внесение findings R3 —
(1) artifact-url в контуре (b) closed delivery, smoke непротиворечив;
(2) user block в защитном контуре (c), island_friend_blocks вне
freeze-списка (в allowlist); (3) mission_case_bindings: одна версия
контракта на весь lifecycle by construction; (4) монотонный ledger.seq
и правило eligible-at-cursor. Если блокеров нет — вердикт "GO" первым
словом.

codex
Сначала проверяю точную идентичность HEAD. Если SHA не совпадёт, остановлюсь без анализа файлов. Skill `auto-review` в текущем наборе недоступен, поэтому проведу независимое read-only ревью напрямую.
exec
/bin/zsh -lc 'git rev-parse HEAD' in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 0ms:
eaa7ca943a1994eab0fa51cafe2cc987d7274c86

codex
HEAD совпадает с `eaa7ca943a1994eab0fa51cafe2cc987d7274c86`. Теперь сопоставляю оба v3-документа с `VISION.md` v3.0.1 и gap map именно из этого коммита, отдельно проверяя четыре пункта R3 и отсутствие новых противоречий.
exec
/bin/zsh -lc "rg --files | rg '("'^|/)(play-for-good-stage0-island-off-tz'"\\.md|play-for-good-stage1-mission-slice-tz\\.md|play-for-good-gap-map-v1\\.md|VISION\\.md)"'$'"'" in /Users/gleb/My projects/p4g-platform-workspace
 exited 127 in 0ms:
zsh:1: command not found: rg
zsh:1: command not found: rg

exec
/bin/zsh -lc "find . -type f \\( -name 'play-for-good-stage0-island-off-tz.md' -o -name 'play-for-good-stage1-mission-slice-tz.md' -o -name 'play-for-good-gap-map-v1.md' -o -name 'VISION.md' \\) -print" in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 3761ms:
./.claude/worktrees/xenodochial-chatterjee-eabcfa/VISION.md
./.claude/worktrees/festive-cohen-8d02b6/VISION.md
./play-for-good-stage0-island-off-tz.md
./play-for-good-stage1-mission-slice-tz.md
./VISION.md
./play-for-good-gap-map-v1.md

exec
/bin/zsh -lc 'git show --stat --oneline --decorate=short eaa7ca943a1994eab0fa51cafe2cc987d7274c86 && wc -l VISION.md play-for-good-gap-map-v1.md play-for-good-stage0-island-off-tz.md play-for-good-stage1-mission-slice-tz.md' in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 0ms:
eaa7ca9 (HEAD -> master, origin/master) docs: ТЗ Этапов 0/1 v4 после автономного R3 (3×P1+1×P2) + receipts петли
 play-for-good-stage0-island-off-tz.md     |   50 +-
 play-for-good-stage1-mission-slice-tz.md  |   46 +-
 play-for-good-tz-review-r3-disposition.md |   19 +
 play-for-good-tz-review-r3-prompt.md      |   29 +
 play-for-good-tz-review-r3-raw.md         | 2880 +++++++++++++++++++++++++++++
 5 files changed, 2991 insertions(+), 33 deletions(-)
     616 VISION.md
     309 play-for-good-gap-map-v1.md
     188 play-for-good-stage0-island-off-tz.md
     245 play-for-good-stage1-mission-slice-tz.md
    1358 total

exec
/bin/zsh -lc 'git status --short --untracked-files=all && nl -ba play-for-good-stage0-island-off-tz.md && nl -ba play-for-good-stage1-mission-slice-tz.md' in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 0ms:
 M AGENTS.md
 M CLAUDE.md
 M docs/mechanics/CLASS-BRIEF-TEMPLATE.md
 M docs/mechanics/README.md
 M docs/mechanics/arrows/CLASS-BRIEF.md
 M docs/mechanics/arrows/REFERENCE-PACKET.md
?? SHARE_FEATURE_PLAN_V1.html
?? SWIPE_PLATFORM_PITCH_V3.html
?? SWIPE_W5_BACKLOG_WEEKS1-3_V1.html
?? VARIATION_GEN_RESEARCH_V1.html
?? docs/mechanics/RECOVERY-ZEN-MATCH-BLOCK-OUT.md
?? docs/mechanics/REFERENCE-DEVICE-LAB.md
?? docs/mechanics/REFERENCE-REPLICATION-PROCESS.md
?? feed-sequencing-orchestration-handoff-2026-07-27.md
?? first-sort-curriculum.v1.json
?? mobile-review-r6-review-packet-2026-07-30.md
?? package-lock.json
?? package.json
?? pins-ftue-L1-video-compliance.pdf
?? play-for-good-tz-review-r4-prompt.md
?? play-for-good-tz-review-r4-raw.md
?? playable-tickets.html
?? playables-status.html
?? scratchpad/auto-review-generated-feed-client.json
?? scratchpad/auto-review-raster-canary-backend.json
?? scratchpad/codex-island-review-r2.md
?? scratchpad/codex-island-review.md
?? scratchpad/codex-p1-impl-review-r1.md
?? scratchpad/generated-offer-backend-auto-review.json
?? scratchpad/generated-offer-frontend-auto-review.json
?? scratchpad/handoff.md
?? scratchpad/island-social-core-p1-codex-review-r2.md
?? scratchpad/island-social-core-p3-codex-review-r1.md
?? scratchpad/island-social-core-p4-codex-review-r1.md
?? scratchpad/lab-performance-isolated-2026-07-29-r2.json
?? scratchpad/pg-e2e-real/data/PG_VERSION
?? scratchpad/pg-e2e-real/data/base/1/112
?? scratchpad/pg-e2e-real/data/base/1/113
?? scratchpad/pg-e2e-real/data/base/1/1247
?? scratchpad/pg-e2e-real/data/base/1/1247_fsm
?? scratchpad/pg-e2e-real/data/base/1/1247_vm
?? scratchpad/pg-e2e-real/data/base/1/1249
?? scratchpad/pg-e2e-real/data/base/1/1249_fsm
?? scratchpad/pg-e2e-real/data/base/1/1249_vm
?? scratchpad/pg-e2e-real/data/base/1/1255
?? scratchpad/pg-e2e-real/data/base/1/1255_fsm
?? scratchpad/pg-e2e-real/data/base/1/1255_vm
?? scratchpad/pg-e2e-real/data/base/1/1259
?? scratchpad/pg-e2e-real/data/base/1/1259_fsm
?? scratchpad/pg-e2e-real/data/base/1/1259_vm
?? scratchpad/pg-e2e-real/data/base/1/13838
?? scratchpad/pg-e2e-real/data/base/1/13838_fsm
?? scratchpad/pg-e2e-real/data/base/1/13838_vm
?? scratchpad/pg-e2e-real/data/base/1/13841
?? scratchpad/pg-e2e-real/data/base/1/13842
?? scratchpad/pg-e2e-real/data/base/1/13843
?? scratchpad/pg-e2e-real/data/base/1/13843_fsm
?? scratchpad/pg-e2e-real/data/base/1/13843_vm
?? scratchpad/pg-e2e-real/data/base/1/13846
?? scratchpad/pg-e2e-real/data/base/1/13847
?? scratchpad/pg-e2e-real/data/base/1/13848
?? scratchpad/pg-e2e-real/data/base/1/13848_fsm
?? scratchpad/pg-e2e-real/data/base/1/13848_vm
?? scratchpad/pg-e2e-real/data/base/1/13851
?? scratchpad/pg-e2e-real/data/base/1/13852
?? scratchpad/pg-e2e-real/data/base/1/13853
?? scratchpad/pg-e2e-real/data/base/1/13853_fsm
?? scratchpad/pg-e2e-real/data/base/1/13853_vm
?? scratchpad/pg-e2e-real/data/base/1/13856
?? scratchpad/pg-e2e-real/data/base/1/13857
?? scratchpad/pg-e2e-real/data/base/1/1417
?? scratchpad/pg-e2e-real/data/base/1/1418
?? scratchpad/pg-e2e-real/data/base/1/174
?? scratchpad/pg-e2e-real/data/base/1/175
?? scratchpad/pg-e2e-real/data/base/1/2187
?? scratchpad/pg-e2e-real/data/base/1/2224
?? scratchpad/pg-e2e-real/data/base/1/2228
?? scratchpad/pg-e2e-real/data/base/1/2328
?? scratchpad/pg-e2e-real/data/base/1/2336
?? scratchpad/pg-e2e-real/data/base/1/2337
?? scratchpad/pg-e2e-real/data/base/1/2579
?? scratchpad/pg-e2e-real/data/base/1/2600
?? scratchpad/pg-e2e-real/data/base/1/2600_fsm
?? scratchpad/pg-e2e-real/data/base/1/2600_vm
?? scratchpad/pg-e2e-real/data/base/1/2601
?? scratchpad/pg-e2e-real/data/base/1/2601_fsm
?? scratchpad/pg-e2e-real/data/base/1/2601_vm
?? scratchpad/pg-e2e-real/data/base/1/2602
?? scratchpad/pg-e2e-real/data/base/1/2602_fsm
?? scratchpad/pg-e2e-real/data/base/1/2602_vm
?? scratchpad/pg-e2e-real/data/base/1/2603
?? scratchpad/pg-e2e-real/data/base/1/2603_fsm
?? scratchpad/pg-e2e-real/data/base/1/2603_vm
?? scratchpad/pg-e2e-real/data/base/1/2604
?? scratchpad/pg-e2e-real/data/base/1/2605
?? scratchpad/pg-e2e-real/data/base/1/2605_fsm
?? scratchpad/pg-e2e-real/data/base/1/2605_vm
?? scratchpad/pg-e2e-real/data/base/1/2606
?? scratchpad/pg-e2e-real/data/base/1/2606_fsm
?? scratchpad/pg-e2e-real/data/base/1/2606_vm
?? scratchpad/pg-e2e-real/data/base/1/2607
?? scratchpad/pg-e2e-real/data/base/1/2607_fsm
?? scratchpad/pg-e2e-real/data/base/1/2607_vm
?? scratchpad/pg-e2e-real/data/base/1/2608
?? scratchpad/pg-e2e-real/data/base/1/2608_fsm
?? scratchpad/pg-e2e-real/data/base/1/2608_vm
?? scratchpad/pg-e2e-real/data/base/1/2609
?? scratchpad/pg-e2e-real/data/base/1/2609_fsm
?? scratchpad/pg-e2e-real/data/base/1/2609_vm
?? scratchpad/pg-e2e-real/data/base/1/2610
?? scratchpad/pg-e2e-real/data/base/1/2610_fsm
?? scratchpad/pg-e2e-real/data/base/1/2610_vm
?? scratchpad/pg-e2e-real/data/base/1/2611
?? scratchpad/pg-e2e-real/data/base/1/2612
?? scratchpad/pg-e2e-real/data/base/1/2612_fsm
?? scratchpad/pg-e2e-real/data/base/1/2612_vm
?? scratchpad/pg-e2e-real/data/base/1/2613
?? scratchpad/pg-e2e-real/data/base/1/2615
?? scratchpad/pg-e2e-real/data/base/1/2615_fsm
?? scratchpad/pg-e2e-real/data/base/1/2615_vm
?? scratchpad/pg-e2e-real/data/base/1/2616
?? scratchpad/pg-e2e-real/data/base/1/2616_fsm
?? scratchpad/pg-e2e-real/data/base/1/2616_vm
?? scratchpad/pg-e2e-real/data/base/1/2617
?? scratchpad/pg-e2e-real/data/base/1/2617_fsm
?? scratchpad/pg-e2e-real/data/base/1/2617_vm
?? scratchpad/pg-e2e-real/data/base/1/2618
?? scratchpad/pg-e2e-real/data/base/1/2618_fsm
?? scratchpad/pg-e2e-real/data/base/1/2618_vm
?? scratchpad/pg-e2e-real/data/base/1/2619
?? scratchpad/pg-e2e-real/data/base/1/2619_fsm
?? scratchpad/pg-e2e-real/data/base/1/2619_vm
?? scratchpad/pg-e2e-real/data/base/1/2620
?? scratchpad/pg-e2e-real/data/base/1/2650
?? scratchpad/pg-e2e-real/data/base/1/2651
?? scratchpad/pg-e2e-real/data/base/1/2652
?? scratchpad/pg-e2e-real/data/base/1/2653
?? scratchpad/pg-e2e-real/data/base/1/2654
?? scratchpad/pg-e2e-real/data/base/1/2655
?? scratchpad/pg-e2e-real/data/base/1/2656
?? scratchpad/pg-e2e-real/data/base/1/2657
?? scratchpad/pg-e2e-real/data/base/1/2658
?? scratchpad/pg-e2e-real/data/base/1/2659
?? scratchpad/pg-e2e-real/data/base/1/2660
?? scratchpad/pg-e2e-real/data/base/1/2661
?? scratchpad/pg-e2e-real/data/base/1/2662
?? scratchpad/pg-e2e-real/data/base/1/2663
?? scratchpad/pg-e2e-real/data/base/1/2664
?? scratchpad/pg-e2e-real/data/base/1/2665
?? scratchpad/pg-e2e-real/data/base/1/2666
?? scratchpad/pg-e2e-real/data/base/1/2667
?? scratchpad/pg-e2e-real/data/base/1/2668
?? scratchpad/pg-e2e-real/data/base/1/2669
?? scratchpad/pg-e2e-real/data/base/1/2670
?? scratchpad/pg-e2e-real/data/base/1/2673
?? scratchpad/pg-e2e-real/data/base/1/2674
?? scratchpad/pg-e2e-real/data/base/1/2675
?? scratchpad/pg-e2e-real/data/base/1/2678
?? scratchpad/pg-e2e-real/data/base/1/2679
?? scratchpad/pg-e2e-real/data/base/1/2680
?? scratchpad/pg-e2e-real/data/base/1/2681
?? scratchpad/pg-e2e-real/data/base/1/2682
?? scratchpad/pg-e2e-real/data/base/1/2683
?? scratchpad/pg-e2e-real/data/base/1/2684
?? scratchpad/pg-e2e-real/data/base/1/2685
?? scratchpad/pg-e2e-real/data/base/1/2686
?? scratchpad/pg-e2e-real/data/base/1/2687
?? scratchpad/pg-e2e-real/data/base/1/2688
?? scratchpad/pg-e2e-real/data/base/1/2689
?? scratchpad/pg-e2e-real/data/base/1/2690
?? scratchpad/pg-e2e-real/data/base/1/2691
?? scratchpad/pg-e2e-real/data/base/1/2692
?? scratchpad/pg-e2e-real/data/base/1/2693
?? scratchpad/pg-e2e-real/data/base/1/2696
?? scratchpad/pg-e2e-real/data/base/1/2699
?? scratchpad/pg-e2e-real/data/base/1/2701
?? scratchpad/pg-e2e-real/data/base/1/2702
?? scratchpad/pg-e2e-real/data/base/1/2703
?? scratchpad/pg-e2e-real/data/base/1/2704
?? scratchpad/pg-e2e-real/data/base/1/2753
?? scratchpad/pg-e2e-real/data/base/1/2753_fsm
?? scratchpad/pg-e2e-real/data/base/1/2753_vm
?? scratchpad/pg-e2e-real/data/base/1/2754
?? scratchpad/pg-e2e-real/data/base/1/2755
?? scratchpad/pg-e2e-real/data/base/1/2756
?? scratchpad/pg-e2e-real/data/base/1/2757
?? scratchpad/pg-e2e-real/data/base/1/2830
?? scratchpad/pg-e2e-real/data/base/1/2831
?? scratchpad/pg-e2e-real/data/base/1/2832
?? scratchpad/pg-e2e-real/data/base/1/2833
?? scratchpad/pg-e2e-real/data/base/1/2834
?? scratchpad/pg-e2e-real/data/base/1/2835
?? scratchpad/pg-e2e-real/data/base/1/2836
?? scratchpad/pg-e2e-real/data/base/1/2836_fsm
?? scratchpad/pg-e2e-real/data/base/1/2836_vm
?? scratchpad/pg-e2e-real/data/base/1/2837
?? scratchpad/pg-e2e-real/data/base/1/2838
?? scratchpad/pg-e2e-real/data/base/1/2838_fsm
?? scratchpad/pg-e2e-real/data/base/1/2838_vm
?? scratchpad/pg-e2e-real/data/base/1/2839
?? scratchpad/pg-e2e-real/data/base/1/2840
?? scratchpad/pg-e2e-real/data/base/1/2840_fsm
?? scratchpad/pg-e2e-real/data/base/1/2840_vm
?? scratchpad/pg-e2e-real/data/base/1/2841
?? scratchpad/pg-e2e-real/data/base/1/2995
?? scratchpad/pg-e2e-real/data/base/1/2996
?? scratchpad/pg-e2e-real/data/base/1/3079
?? scratchpad/pg-e2e-real/data/base/1/3079_fsm
?? scratchpad/pg-e2e-real/data/base/1/3079_vm
?? scratchpad/pg-e2e-real/data/base/1/3080
?? scratchpad/pg-e2e-real/data/base/1/3081
?? scratchpad/pg-e2e-real/data/base/1/3085
?? scratchpad/pg-e2e-real/data/base/1/3118
?? scratchpad/pg-e2e-real/data/base/1/3119
?? scratchpad/pg-e2e-real/data/base/1/3164
?? scratchpad/pg-e2e-real/data/base/1/3256
?? scratchpad/pg-e2e-real/data/base/1/3257
?? scratchpad/pg-e2e-real/data/base/1/3258
?? scratchpad/pg-e2e-real/data/base/1/3350
?? scratchpad/pg-e2e-real/data/base/1/3351
?? scratchpad/pg-e2e-real/data/base/1/3379
?? scratchpad/pg-e2e-real/data/base/1/3380
?? scratchpad/pg-e2e-real/data/base/1/3381
?? scratchpad/pg-e2e-real/data/base/1/3394
?? scratchpad/pg-e2e-real/data/base/1/3394_fsm
?? scratchpad/pg-e2e-real/data/base/1/3394_vm
?? scratchpad/pg-e2e-real/data/base/1/3395
?? scratchpad/pg-e2e-real/data/base/1/3429
?? scratchpad/pg-e2e-real/data/base/1/3430
?? scratchpad/pg-e2e-real/data/base/1/3431
?? scratchpad/pg-e2e-real/data/base/1/3433
?? scratchpad/pg-e2e-real/data/base/1/3439
?? scratchpad/pg-e2e-real/data/base/1/3440
?? scratchpad/pg-e2e-real/data/base/1/3455
?? scratchpad/pg-e2e-real/data/base/1/3456
?? scratchpad/pg-e2e-real/data/base/1/3456_fsm
?? scratchpad/pg-e2e-real/data/base/1/3456_vm
?? scratchpad/pg-e2e-real/data/base/1/3466
?? scratchpad/pg-e2e-real/data/base/1/3467
?? scratchpad/pg-e2e-real/data/base/1/3468
?? scratchpad/pg-e2e-real/data/base/1/3501
?? scratchpad/pg-e2e-real/data/base/1/3502
?? scratchpad/pg-e2e-real/data/base/1/3503
?? scratchpad/pg-e2e-real/data/base/1/3534
?? scratchpad/pg-e2e-real/data/base/1/3541
?? scratchpad/pg-e2e-real/data/base/1/3541_fsm
?? scratchpad/pg-e2e-real/data/base/1/3541_vm
?? scratchpad/pg-e2e-real/data/base/1/3542
?? scratchpad/pg-e2e-real/data/base/1/3574
?? scratchpad/pg-e2e-real/data/base/1/3575
?? scratchpad/pg-e2e-real/data/base/1/3576
?? scratchpad/pg-e2e-real/data/base/1/3596
?? scratchpad/pg-e2e-real/data/base/1/3597
?? scratchpad/pg-e2e-real/data/base/1/3598
?? scratchpad/pg-e2e-real/data/base/1/3599
?? scratchpad/pg-e2e-real/data/base/1/3600
?? scratchpad/pg-e2e-real/data/base/1/3600_fsm
?? scratchpad/pg-e2e-real/data/base/1/3600_vm
?? scratchpad/pg-e2e-real/data/base/1/3601
?? scratchpad/pg-e2e-real/data/base/1/3601_fsm
?? scratchpad/pg-e2e-real/data/base/1/3601_vm
?? scratchpad/pg-e2e-real/data/base/1/3602
?? scratchpad/pg-e2e-real/data/base/1/3602_fsm
?? scratchpad/pg-e2e-real/data/base/1/3602_vm
?? scratchpad/pg-e2e-real/data/base/1/3603
?? scratchpad/pg-e2e-real/data/base/1/3603_fsm
?? scratchpad/pg-e2e-real/data/base/1/3603_vm
?? scratchpad/pg-e2e-real/data/base/1/3604
?? scratchpad/pg-e2e-real/data/base/1/3605
?? scratchpad/pg-e2e-real/data/base/1/3606
?? scratchpad/pg-e2e-real/data/base/1/3607
?? scratchpad/pg-e2e-real/data/base/1/3608
?? scratchpad/pg-e2e-real/data/base/1/3609
?? scratchpad/pg-e2e-real/data/base/1/3712
?? scratchpad/pg-e2e-real/data/base/1/3764
?? scratchpad/pg-e2e-real/data/base/1/3764_fsm
?? scratchpad/pg-e2e-real/data/base/1/3764_vm
?? scratchpad/pg-e2e-real/data/base/1/3766
?? scratchpad/pg-e2e-real/data/base/1/3767
?? scratchpad/pg-e2e-real/data/base/1/3997
?? scratchpad/pg-e2e-real/data/base/1/4143
?? scratchpad/pg-e2e-real/data/base/1/4144
?? scratchpad/pg-e2e-real/data/base/1/4145
?? scratchpad/pg-e2e-real/data/base/1/4146
?? scratchpad/pg-e2e-real/data/base/1/4147
?? scratchpad/pg-e2e-real/data/base/1/4148
?? scratchpad/pg-e2e-real/data/base/1/4149
?? scratchpad/pg-e2e-real/data/base/1/4150
?? scratchpad/pg-e2e-real/data/base/1/4151
?? scratchpad/pg-e2e-real/data/base/1/4152
?? scratchpad/pg-e2e-real/data/base/1/4153
?? scratchpad/pg-e2e-real/data/base/1/4154
?? scratchpad/pg-e2e-real/data/base/1/4155
?? scratchpad/pg-e2e-real/data/base/1/4156
?? scratchpad/pg-e2e-real/data/base/1/4157
?? scratchpad/pg-e2e-real/data/base/1/4158
?? scratchpad/pg-e2e-real/data/base/1/4159
?? scratchpad/pg-e2e-real/data/base/1/4160
?? scratchpad/pg-e2e-real/data/base/1/4163
?? scratchpad/pg-e2e-real/data/base/1/4164
?? scratchpad/pg-e2e-real/data/base/1/4165
?? scratchpad/pg-e2e-real/data/base/1/4166
?? scratchpad/pg-e2e-real/data/base/1/4167
?? scratchpad/pg-e2e-real/data/base/1/4168
?? scratchpad/pg-e2e-real/data/base/1/4169
?? scratchpad/pg-e2e-real/data/base/1/4170
?? scratchpad/pg-e2e-real/data/base/1/4171
?? scratchpad/pg-e2e-real/data/base/1/4172
?? scratchpad/pg-e2e-real/data/base/1/4173
?? scratchpad/pg-e2e-real/data/base/1/4174
?? scratchpad/pg-e2e-real/data/base/1/5002
?? scratchpad/pg-e2e-real/data/base/1/548
?? scratchpad/pg-e2e-real/data/base/1/549
?? scratchpad/pg-e2e-real/data/base/1/6102
?? scratchpad/pg-e2e-real/data/base/1/6104
?? scratchpad/pg-e2e-real/data/base/1/6106
?? scratchpad/pg-e2e-real/data/base/1/6110
?? scratchpad/pg-e2e-real/data/base/1/6111
?? scratchpad/pg-e2e-real/data/base/1/6112
?? scratchpad/pg-e2e-real/data/base/1/6113
?? scratchpad/pg-e2e-real/data/base/1/6116
?? scratchpad/pg-e2e-real/data/base/1/6117
?? scratchpad/pg-e2e-real/data/base/1/6175
?? scratchpad/pg-e2e-real/data/base/1/6176
?? scratchpad/pg-e2e-real/data/base/1/6228
?? scratchpad/pg-e2e-real/data/base/1/6229
?? scratchpad/pg-e2e-real/data/base/1/6237
?? scratchpad/pg-e2e-real/data/base/1/6238
?? scratchpad/pg-e2e-real/data/base/1/6239
?? scratchpad/pg-e2e-real/data/base/1/826
?? scratchpad/pg-e2e-real/data/base/1/827
?? scratchpad/pg-e2e-real/data/base/1/828
?? scratchpad/pg-e2e-real/data/base/1/PG_VERSION
?? scratchpad/pg-e2e-real/data/base/1/pg_filenode.map
?? scratchpad/pg-e2e-real/data/base/4/112
?? scratchpad/pg-e2e-real/data/base/4/113
?? scratchpad/pg-e2e-real/data/base/4/1247
?? scratchpad/pg-e2e-real/data/base/4/1247_fsm
?? scratchpad/pg-e2e-real/data/base/4/1247_vm
?? scratchpad/pg-e2e-real/data/base/4/1249
?? scratchpad/pg-e2e-real/data/base/4/1249_fsm
?? scratchpad/pg-e2e-real/data/base/4/1249_vm
?? scratchpad/pg-e2e-real/data/base/4/1255
?? scratchpad/pg-e2e-real/data/base/4/1255_fsm
?? scratchpad/pg-e2e-real/data/base/4/1255_vm
?? scratchpad/pg-e2e-real/data/base/4/1259
?? scratchpad/pg-e2e-real/data/base/4/1259_fsm
?? scratchpad/pg-e2e-real/data/base/4/1259_vm
?? scratchpad/pg-e2e-real/data/base/4/13838
?? scratchpad/pg-e2e-real/data/base/4/13838_fsm
?? scratchpad/pg-e2e-real/data/base/4/13838_vm
?? scratchpad/pg-e2e-real/data/base/4/13841
?? scratchpad/pg-e2e-real/data/base/4/13842
?? scratchpad/pg-e2e-real/data/base/4/13843
?? scratchpad/pg-e2e-real/data/base/4/13843_fsm
?? scratchpad/pg-e2e-real/data/base/4/13843_vm
?? scratchpad/pg-e2e-real/data/base/4/13846
?? scratchpad/pg-e2e-real/data/base/4/13847
?? scratchpad/pg-e2e-real/data/base/4/13848
?? scratchpad/pg-e2e-real/data/base/4/13848_fsm
?? scratchpad/pg-e2e-real/data/base/4/13848_vm
?? scratchpad/pg-e2e-real/data/base/4/13851
?? scratchpad/pg-e2e-real/data/base/4/13852
?? scratchpad/pg-e2e-real/data/base/4/13853
?? scratchpad/pg-e2e-real/data/base/4/13853_fsm
?? scratchpad/pg-e2e-real/data/base/4/13853_vm
?? scratchpad/pg-e2e-real/data/base/4/13856
?? scratchpad/pg-e2e-real/data/base/4/13857
?? scratchpad/pg-e2e-real/data/base/4/1417
?? scratchpad/pg-e2e-real/data/base/4/1418
?? scratchpad/pg-e2e-real/data/base/4/174
?? scratchpad/pg-e2e-real/data/base/4/175
?? scratchpad/pg-e2e-real/data/base/4/2187
?? scratchpad/pg-e2e-real/data/base/4/2224
?? scratchpad/pg-e2e-real/data/base/4/2228
?? scratchpad/pg-e2e-real/data/base/4/2328
?? scratchpad/pg-e2e-real/data/base/4/2336
?? scratchpad/pg-e2e-real/data/base/4/2337
?? scratchpad/pg-e2e-real/data/base/4/2579
?? scratchpad/pg-e2e-real/data/base/4/2600
?? scratchpad/pg-e2e-real/data/base/4/2600_fsm
?? scratchpad/pg-e2e-real/data/base/4/2600_vm
?? scratchpad/pg-e2e-real/data/base/4/2601
?? scratchpad/pg-e2e-real/data/base/4/2601_fsm
?? scratchpad/pg-e2e-real/data/base/4/2601_vm
?? scratchpad/pg-e2e-real/data/base/4/2602
?? scratchpad/pg-e2e-real/data/base/4/2602_fsm
?? scratchpad/pg-e2e-real/data/base/4/2602_vm
?? scratchpad/pg-e2e-real/data/base/4/2603
?? scratchpad/pg-e2e-real/data/base/4/2603_fsm
?? scratchpad/pg-e2e-real/data/base/4/2603_vm
?? scratchpad/pg-e2e-real/data/base/4/2604
?? scratchpad/pg-e2e-real/data/base/4/2605
?? scratchpad/pg-e2e-real/data/base/4/2605_fsm
?? scratchpad/pg-e2e-real/data/base/4/2605_vm
?? scratchpad/pg-e2e-real/data/base/4/2606
?? scratchpad/pg-e2e-real/data/base/4/2606_fsm
?? scratchpad/pg-e2e-real/data/base/4/2606_vm
?? scratchpad/pg-e2e-real/data/base/4/2607
?? scratchpad/pg-e2e-real/data/base/4/2607_fsm
?? scratchpad/pg-e2e-real/data/base/4/2607_vm
?? scratchpad/pg-e2e-real/data/base/4/2608
?? scratchpad/pg-e2e-real/data/base/4/2608_fsm
?? scratchpad/pg-e2e-real/data/base/4/2608_vm
?? scratchpad/pg-e2e-real/data/base/4/2609
?? scratchpad/pg-e2e-real/data/base/4/2609_fsm
?? scratchpad/pg-e2e-real/data/base/4/2609_vm
?? scratchpad/pg-e2e-real/data/base/4/2610
?? scratchpad/pg-e2e-real/data/base/4/2610_fsm
?? scratchpad/pg-e2e-real/data/base/4/2610_vm
?? scratchpad/pg-e2e-real/data/base/4/2611
?? scratchpad/pg-e2e-real/data/base/4/2612
?? scratchpad/pg-e2e-real/data/base/4/2612_fsm
?? scratchpad/pg-e2e-real/data/base/4/2612_vm
?? scratchpad/pg-e2e-real/data/base/4/2613
?? scratchpad/pg-e2e-real/data/base/4/2615
?? scratchpad/pg-e2e-real/data/base/4/2615_fsm
?? scratchpad/pg-e2e-real/data/base/4/2615_vm
?? scratchpad/pg-e2e-real/data/base/4/2616
?? scratchpad/pg-e2e-real/data/base/4/2616_fsm
?? scratchpad/pg-e2e-real/data/base/4/2616_vm
?? scratchpad/pg-e2e-real/data/base/4/2617
?? scratchpad/pg-e2e-real/data/base/4/2617_fsm
?? scratchpad/pg-e2e-real/data/base/4/2617_vm
?? scratchpad/pg-e2e-real/data/base/4/2618
?? scratchpad/pg-e2e-real/data/base/4/2618_fsm
?? scratchpad/pg-e2e-real/data/base/4/2618_vm
?? scratchpad/pg-e2e-real/data/base/4/2619
?? scratchpad/pg-e2e-real/data/base/4/2619_fsm
?? scratchpad/pg-e2e-real/data/base/4/2619_vm
?? scratchpad/pg-e2e-real/data/base/4/2620
?? scratchpad/pg-e2e-real/data/base/4/2650
?? scratchpad/pg-e2e-real/data/base/4/2651
?? scratchpad/pg-e2e-real/data/base/4/2652
?? scratchpad/pg-e2e-real/data/base/4/2653
?? scratchpad/pg-e2e-real/data/base/4/2654
?? scratchpad/pg-e2e-real/data/base/4/2655
?? scratchpad/pg-e2e-real/data/base/4/2656
?? scratchpad/pg-e2e-real/data/base/4/2657
?? scratchpad/pg-e2e-real/data/base/4/2658
?? scratchpad/pg-e2e-real/data/base/4/2659
?? scratchpad/pg-e2e-real/data/base/4/2660
?? scratchpad/pg-e2e-real/data/base/4/2661
?? scratchpad/pg-e2e-real/data/base/4/2662
?? scratchpad/pg-e2e-real/data/base/4/2663
?? scratchpad/pg-e2e-real/data/base/4/2664
?? scratchpad/pg-e2e-real/data/base/4/2665
?? scratchpad/pg-e2e-real/data/base/4/2666
?? scratchpad/pg-e2e-real/data/base/4/2667
?? scratchpad/pg-e2e-real/data/base/4/2668
?? scratchpad/pg-e2e-real/data/base/4/2669
?? scratchpad/pg-e2e-real/data/base/4/2670
?? scratchpad/pg-e2e-real/data/base/4/2673
?? scratchpad/pg-e2e-real/data/base/4/2674
?? scratchpad/pg-e2e-real/data/base/4/2675
?? scratchpad/pg-e2e-real/data/base/4/2678
?? scratchpad/pg-e2e-real/data/base/4/2679
?? scratchpad/pg-e2e-real/data/base/4/2680
?? scratchpad/pg-e2e-real/data/base/4/2681
?? scratchpad/pg-e2e-real/data/base/4/2682
?? scratchpad/pg-e2e-real/data/base/4/2683
?? scratchpad/pg-e2e-real/data/base/4/2684
?? scratchpad/pg-e2e-real/data/base/4/2685
?? scratchpad/pg-e2e-real/data/base/4/2686
?? scratchpad/pg-e2e-real/data/base/4/2687
?? scratchpad/pg-e2e-real/data/base/4/2688
?? scratchpad/pg-e2e-real/data/base/4/2689
?? scratchpad/pg-e2e-real/data/base/4/2690
?? scratchpad/pg-e2e-real/data/base/4/2691
?? scratchpad/pg-e2e-real/data/base/4/2692
?? scratchpad/pg-e2e-real/data/base/4/2693
?? scratchpad/pg-e2e-real/data/base/4/2696
?? scratchpad/pg-e2e-real/data/base/4/2699
?? scratchpad/pg-e2e-real/data/base/4/2701
?? scratchpad/pg-e2e-real/data/base/4/2702
?? scratchpad/pg-e2e-real/data/base/4/2703
?? scratchpad/pg-e2e-real/data/base/4/2704
?? scratchpad/pg-e2e-real/data/base/4/2753
?? scratchpad/pg-e2e-real/data/base/4/2753_fsm
?? scratchpad/pg-e2e-real/data/base/4/2753_vm
?? scratchpad/pg-e2e-real/data/base/4/2754
?? scratchpad/pg-e2e-real/data/base/4/2755
?? scratchpad/pg-e2e-real/data/base/4/2756
?? scratchpad/pg-e2e-real/data/base/4/2757
?? scratchpad/pg-e2e-real/data/base/4/2830
?? scratchpad/pg-e2e-real/data/base/4/2831
?? scratchpad/pg-e2e-real/data/base/4/2832
?? scratchpad/pg-e2e-real/data/base/4/2833
?? scratchpad/pg-e2e-real/data/base/4/2834
?? scratchpad/pg-e2e-real/data/base/4/2835
?? scratchpad/pg-e2e-real/data/base/4/2836
?? scratchpad/pg-e2e-real/data/base/4/2836_fsm
?? scratchpad/pg-e2e-real/data/base/4/2836_vm
?? scratchpad/pg-e2e-real/data/base/4/2837
?? scratchpad/pg-e2e-real/data/base/4/2838
?? scratchpad/pg-e2e-real/data/base/4/2838_fsm
?? scratchpad/pg-e2e-real/data/base/4/2838_vm
?? scratchpad/pg-e2e-real/data/base/4/2839
?? scratchpad/pg-e2e-real/data/base/4/2840
?? scratchpad/pg-e2e-real/data/base/4/2840_fsm
?? scratchpad/pg-e2e-real/data/base/4/2840_vm
?? scratchpad/pg-e2e-real/data/base/4/2841
?? scratchpad/pg-e2e-real/data/base/4/2995
?? scratchpad/pg-e2e-real/data/base/4/2996
?? scratchpad/pg-e2e-real/data/base/4/3079
?? scratchpad/pg-e2e-real/data/base/4/3079_fsm
?? scratchpad/pg-e2e-real/data/base/4/3079_vm
?? scratchpad/pg-e2e-real/data/base/4/3080
?? scratchpad/pg-e2e-real/data/base/4/3081
?? scratchpad/pg-e2e-real/data/base/4/3085
?? scratchpad/pg-e2e-real/data/base/4/3118
?? scratchpad/pg-e2e-real/data/base/4/3119
?? scratchpad/pg-e2e-real/data/base/4/3164
?? scratchpad/pg-e2e-real/data/base/4/3256
?? scratchpad/pg-e2e-real/data/base/4/3257
?? scratchpad/pg-e2e-real/data/base/4/3258
?? scratchpad/pg-e2e-real/data/base/4/3350
?? scratchpad/pg-e2e-real/data/base/4/3351
?? scratchpad/pg-e2e-real/data/base/4/3379
?? scratchpad/pg-e2e-real/data/base/4/3380
?? scratchpad/pg-e2e-real/data/base/4/3381
?? scratchpad/pg-e2e-real/data/base/4/3394
?? scratchpad/pg-e2e-real/data/base/4/3394_fsm
?? scratchpad/pg-e2e-real/data/base/4/3394_vm
?? scratchpad/pg-e2e-real/data/base/4/3395
?? scratchpad/pg-e2e-real/data/base/4/3429
?? scratchpad/pg-e2e-real/data/base/4/3430
?? scratchpad/pg-e2e-real/data/base/4/3431
?? scratchpad/pg-e2e-real/data/base/4/3433
?? scratchpad/pg-e2e-real/data/base/4/3439
?? scratchpad/pg-e2e-real/data/base/4/3440
?? scratchpad/pg-e2e-real/data/base/4/3455
?? scratchpad/pg-e2e-real/data/base/4/3456
?? scratchpad/pg-e2e-real/data/base/4/3456_fsm
?? scratchpad/pg-e2e-real/data/base/4/3456_vm
?? scratchpad/pg-e2e-real/data/base/4/3466
?? scratchpad/pg-e2e-real/data/base/4/3467
?? scratchpad/pg-e2e-real/data/base/4/3468
?? scratchpad/pg-e2e-real/data/base/4/3501
?? scratchpad/pg-e2e-real/data/base/4/3502
?? scratchpad/pg-e2e-real/data/base/4/3503
?? scratchpad/pg-e2e-real/data/base/4/3534
?? scratchpad/pg-e2e-real/data/base/4/3541
?? scratchpad/pg-e2e-real/data/base/4/3541_fsm
?? scratchpad/pg-e2e-real/data/base/4/3541_vm
?? scratchpad/pg-e2e-real/data/base/4/3542
?? scratchpad/pg-e2e-real/data/base/4/3574
?? scratchpad/pg-e2e-real/data/base/4/3575
?? scratchpad/pg-e2e-real/data/base/4/3576
?? scratchpad/pg-e2e-real/data/base/4/3596
?? scratchpad/pg-e2e-real/data/base/4/3597
?? scratchpad/pg-e2e-real/data/base/4/3598
?? scratchpad/pg-e2e-real/data/base/4/3599
?? scratchpad/pg-e2e-real/data/base/4/3600
?? scratchpad/pg-e2e-real/data/base/4/3600_fsm
?? scratchpad/pg-e2e-real/data/base/4/3600_vm
?? scratchpad/pg-e2e-real/data/base/4/3601
?? scratchpad/pg-e2e-real/data/base/4/3601_fsm
?? scratchpad/pg-e2e-real/data/base/4/3601_vm
?? scratchpad/pg-e2e-real/data/base/4/3602
?? scratchpad/pg-e2e-real/data/base/4/3602_fsm
?? scratchpad/pg-e2e-real/data/base/4/3602_vm
?? scratchpad/pg-e2e-real/data/base/4/3603
?? scratchpad/pg-e2e-real/data/base/4/3603_fsm
?? scratchpad/pg-e2e-real/data/base/4/3603_vm
?? scratchpad/pg-e2e-real/data/base/4/3604
?? scratchpad/pg-e2e-real/data/base/4/3605
?? scratchpad/pg-e2e-real/data/base/4/3606
?? scratchpad/pg-e2e-real/data/base/4/3607
?? scratchpad/pg-e2e-real/data/base/4/3608
?? scratchpad/pg-e2e-real/data/base/4/3609
?? scratchpad/pg-e2e-real/data/base/4/3712
?? scratchpad/pg-e2e-real/data/base/4/3764
?? scratchpad/pg-e2e-real/data/base/4/3764_fsm
?? scratchpad/pg-e2e-real/data/base/4/3764_vm
?? scratchpad/pg-e2e-real/data/base/4/3766
?? scratchpad/pg-e2e-real/data/base/4/3767
?? scratchpad/pg-e2e-real/data/base/4/3997
?? scratchpad/pg-e2e-real/data/base/4/4143
?? scratchpad/pg-e2e-real/data/base/4/4144
?? scratchpad/pg-e2e-real/data/base/4/4145
?? scratchpad/pg-e2e-real/data/base/4/4146
?? scratchpad/pg-e2e-real/data/base/4/4147
?? scratchpad/pg-e2e-real/data/base/4/4148
?? scratchpad/pg-e2e-real/data/base/4/4149
?? scratchpad/pg-e2e-real/data/base/4/4150
?? scratchpad/pg-e2e-real/data/base/4/4151
?? scratchpad/pg-e2e-real/data/base/4/4152
?? scratchpad/pg-e2e-real/data/base/4/4153
?? scratchpad/pg-e2e-real/data/base/4/4154
?? scratchpad/pg-e2e-real/data/base/4/4155
?? scratchpad/pg-e2e-real/data/base/4/4156
?? scratchpad/pg-e2e-real/data/base/4/4157
?? scratchpad/pg-e2e-real/data/base/4/4158
?? scratchpad/pg-e2e-real/data/base/4/4159
?? scratchpad/pg-e2e-real/data/base/4/4160
?? scratchpad/pg-e2e-real/data/base/4/4163
?? scratchpad/pg-e2e-real/data/base/4/4164
?? scratchpad/pg-e2e-real/data/base/4/4165
?? scratchpad/pg-e2e-real/data/base/4/4166
?? scratchpad/pg-e2e-real/data/base/4/4167
?? scratchpad/pg-e2e-real/data/base/4/4168
?? scratchpad/pg-e2e-real/data/base/4/4169
?? scratchpad/pg-e2e-real/data/base/4/4170
?? scratchpad/pg-e2e-real/data/base/4/4171
?? scratchpad/pg-e2e-real/data/base/4/4172
?? scratchpad/pg-e2e-real/data/base/4/4173
?? scratchpad/pg-e2e-real/data/base/4/4174
?? scratchpad/pg-e2e-real/data/base/4/5002
?? scratchpad/pg-e2e-real/data/base/4/548
?? scratchpad/pg-e2e-real/data/base/4/549
?? scratchpad/pg-e2e-real/data/base/4/6102
?? scratchpad/pg-e2e-real/data/base/4/6104
?? scratchpad/pg-e2e-real/data/base/4/6106
?? scratchpad/pg-e2e-real/data/base/4/6110
?? scratchpad/pg-e2e-real/data/base/4/6111
?? scratchpad/pg-e2e-real/data/base/4/6112
?? scratchpad/pg-e2e-real/data/base/4/6113
?? scratchpad/pg-e2e-real/data/base/4/6116
?? scratchpad/pg-e2e-real/data/base/4/6117
?? scratchpad/pg-e2e-real/data/base/4/6175
?? scratchpad/pg-e2e-real/data/base/4/6176
?? scratchpad/pg-e2e-real/data/base/4/6228
?? scratchpad/pg-e2e-real/data/base/4/6229
?? scratchpad/pg-e2e-real/data/base/4/6237
?? scratchpad/pg-e2e-real/data/base/4/6238
?? scratchpad/pg-e2e-real/data/base/4/6239
?? scratchpad/pg-e2e-real/data/base/4/826
?? scratchpad/pg-e2e-real/data/base/4/827
?? scratchpad/pg-e2e-real/data/base/4/828
?? scratchpad/pg-e2e-real/data/base/4/PG_VERSION
?? scratchpad/pg-e2e-real/data/base/4/pg_filenode.map
?? scratchpad/pg-e2e-real/data/base/5/112
?? scratchpad/pg-e2e-real/data/base/5/113
?? scratchpad/pg-e2e-real/data/base/5/1247
?? scratchpad/pg-e2e-real/data/base/5/1247_fsm
?? scratchpad/pg-e2e-real/data/base/5/1247_vm
?? scratchpad/pg-e2e-real/data/base/5/1249
?? scratchpad/pg-e2e-real/data/base/5/1249_fsm
?? scratchpad/pg-e2e-real/data/base/5/1249_vm
?? scratchpad/pg-e2e-real/data/base/5/1255
?? scratchpad/pg-e2e-real/data/base/5/1255_fsm
?? scratchpad/pg-e2e-real/data/base/5/1255_vm
?? scratchpad/pg-e2e-real/data/base/5/1259
?? scratchpad/pg-e2e-real/data/base/5/1259_fsm
?? scratchpad/pg-e2e-real/data/base/5/1259_vm
?? scratchpad/pg-e2e-real/data/base/5/13838
?? scratchpad/pg-e2e-real/data/base/5/13838_fsm
?? scratchpad/pg-e2e-real/data/base/5/13838_vm
?? scratchpad/pg-e2e-real/data/base/5/13841
?? scratchpad/pg-e2e-real/data/base/5/13842
?? scratchpad/pg-e2e-real/data/base/5/13843
?? scratchpad/pg-e2e-real/data/base/5/13843_fsm
?? scratchpad/pg-e2e-real/data/base/5/13843_vm
?? scratchpad/pg-e2e-real/data/base/5/13846
?? scratchpad/pg-e2e-real/data/base/5/13847
?? scratchpad/pg-e2e-real/data/base/5/13848
?? scratchpad/pg-e2e-real/data/base/5/13848_fsm
?? scratchpad/pg-e2e-real/data/base/5/13848_vm
?? scratchpad/pg-e2e-real/data/base/5/13851
?? scratchpad/pg-e2e-real/data/base/5/13852
?? scratchpad/pg-e2e-real/data/base/5/13853
?? scratchpad/pg-e2e-real/data/base/5/13853_fsm
?? scratchpad/pg-e2e-real/data/base/5/13853_vm
?? scratchpad/pg-e2e-real/data/base/5/13856
?? scratchpad/pg-e2e-real/data/base/5/13857
?? scratchpad/pg-e2e-real/data/base/5/1417
?? scratchpad/pg-e2e-real/data/base/5/1418
?? scratchpad/pg-e2e-real/data/base/5/174
?? scratchpad/pg-e2e-real/data/base/5/175
?? scratchpad/pg-e2e-real/data/base/5/2187
?? scratchpad/pg-e2e-real/data/base/5/2224
?? scratchpad/pg-e2e-real/data/base/5/2228
?? scratchpad/pg-e2e-real/data/base/5/2328
?? scratchpad/pg-e2e-real/data/base/5/2336
?? scratchpad/pg-e2e-real/data/base/5/2337
?? scratchpad/pg-e2e-real/data/base/5/2579
?? scratchpad/pg-e2e-real/data/base/5/2600
?? scratchpad/pg-e2e-real/data/base/5/2600_fsm
?? scratchpad/pg-e2e-real/data/base/5/2600_vm
?? scratchpad/pg-e2e-real/data/base/5/2601
?? scratchpad/pg-e2e-real/data/base/5/2601_fsm
?? scratchpad/pg-e2e-real/data/base/5/2601_vm
?? scratchpad/pg-e2e-real/data/base/5/2602
?? scratchpad/pg-e2e-real/data/base/5/2602_fsm
?? scratchpad/pg-e2e-real/data/base/5/2602_vm
?? scratchpad/pg-e2e-real/data/base/5/2603
?? scratchpad/pg-e2e-real/data/base/5/2603_fsm
?? scratchpad/pg-e2e-real/data/base/5/2603_vm
?? scratchpad/pg-e2e-real/data/base/5/2604
?? scratchpad/pg-e2e-real/data/base/5/2605
?? scratchpad/pg-e2e-real/data/base/5/2605_fsm
?? scratchpad/pg-e2e-real/data/base/5/2605_vm
?? scratchpad/pg-e2e-real/data/base/5/2606
?? scratchpad/pg-e2e-real/data/base/5/2606_fsm
?? scratchpad/pg-e2e-real/data/base/5/2606_vm
?? scratchpad/pg-e2e-real/data/base/5/2607
?? scratchpad/pg-e2e-real/data/base/5/2607_fsm
?? scratchpad/pg-e2e-real/data/base/5/2607_vm
?? scratchpad/pg-e2e-real/data/base/5/2608
?? scratchpad/pg-e2e-real/data/base/5/2608_fsm
?? scratchpad/pg-e2e-real/data/base/5/2608_vm
?? scratchpad/pg-e2e-real/data/base/5/2609
?? scratchpad/pg-e2e-real/data/base/5/2609_fsm
?? scratchpad/pg-e2e-real/data/base/5/2609_vm
?? scratchpad/pg-e2e-real/data/base/5/2610
?? scratchpad/pg-e2e-real/data/base/5/2610_fsm
?? scratchpad/pg-e2e-real/data/base/5/2610_vm
?? scratchpad/pg-e2e-real/data/base/5/2611
?? scratchpad/pg-e2e-real/data/base/5/2612
?? scratchpad/pg-e2e-real/data/base/5/2612_fsm
?? scratchpad/pg-e2e-real/data/base/5/2612_vm
?? scratchpad/pg-e2e-real/data/base/5/2613
?? scratchpad/pg-e2e-real/data/base/5/2615
?? scratchpad/pg-e2e-real/data/base/5/2615_fsm
?? scratchpad/pg-e2e-real/data/base/5/2615_vm
?? scratchpad/pg-e2e-real/data/base/5/2616
?? scratchpad/pg-e2e-real/data/base/5/2616_fsm
?? scratchpad/pg-e2e-real/data/base/5/2616_vm
?? scratchpad/pg-e2e-real/data/base/5/2617
?? scratchpad/pg-e2e-real/data/base/5/2617_fsm
?? scratchpad/pg-e2e-real/data/base/5/2617_vm
?? scratchpad/pg-e2e-real/data/base/5/2618
?? scratchpad/pg-e2e-real/data/base/5/2618_fsm
?? scratchpad/pg-e2e-real/data/base/5/2618_vm
?? scratchpad/pg-e2e-real/data/base/5/2619
?? scratchpad/pg-e2e-real/data/base/5/2619_fsm
?? scratchpad/pg-e2e-real/data/base/5/2619_vm
?? scratchpad/pg-e2e-real/data/base/5/2620
?? scratchpad/pg-e2e-real/data/base/5/2650
?? scratchpad/pg-e2e-real/data/base/5/2651
?? scratchpad/pg-e2e-real/data/base/5/2652
?? scratchpad/pg-e2e-real/data/base/5/2653
?? scratchpad/pg-e2e-real/data/base/5/2654
?? scratchpad/pg-e2e-real/data/base/5/2655
?? scratchpad/pg-e2e-real/data/base/5/2656
?? scratchpad/pg-e2e-real/data/base/5/2657
?? scratchpad/pg-e2e-real/data/base/5/2658
?? scratchpad/pg-e2e-real/data/base/5/2659
?? scratchpad/pg-e2e-real/data/base/5/2660
?? scratchpad/pg-e2e-real/data/base/5/2661
?? scratchpad/pg-e2e-real/data/base/5/2662
?? scratchpad/pg-e2e-real/data/base/5/2663
?? scratchpad/pg-e2e-real/data/base/5/2664
?? scratchpad/pg-e2e-real/data/base/5/2665
?? scratchpad/pg-e2e-real/data/base/5/2666
?? scratchpad/pg-e2e-real/data/base/5/2667
?? scratchpad/pg-e2e-real/data/base/5/2668
?? scratchpad/pg-e2e-real/data/base/5/2669
?? scratchpad/pg-e2e-real/data/base/5/2670
?? scratchpad/pg-e2e-real/data/base/5/2673
?? scratchpad/pg-e2e-real/data/base/5/2674
?? scratchpad/pg-e2e-real/data/base/5/2675
?? scratchpad/pg-e2e-real/data/base/5/2678
?? scratchpad/pg-e2e-real/data/base/5/2679
?? scratchpad/pg-e2e-real/data/base/5/2680
?? scratchpad/pg-e2e-real/data/base/5/2681
?? scratchpad/pg-e2e-real/data/base/5/2682
?? scratchpad/pg-e2e-real/data/base/5/2683
?? scratchpad/pg-e2e-real/data/base/5/2684
?? scratchpad/pg-e2e-real/data/base/5/2685
?? scratchpad/pg-e2e-real/data/base/5/2686
?? scratchpad/pg-e2e-real/data/base/5/2687
?? scratchpad/pg-e2e-real/data/base/5/2688
?? scratchpad/pg-e2e-real/data/base/5/2689
?? scratchpad/pg-e2e-real/data/base/5/2690
?? scratchpad/pg-e2e-real/data/base/5/2691
?? scratchpad/pg-e2e-real/data/base/5/2692
?? scratchpad/pg-e2e-real/data/base/5/2693
?? scratchpad/pg-e2e-real/data/base/5/2696
?? scratchpad/pg-e2e-real/data/base/5/2699
?? scratchpad/pg-e2e-real/data/base/5/2701
?? scratchpad/pg-e2e-real/data/base/5/2702
?? scratchpad/pg-e2e-real/data/base/5/2703
?? scratchpad/pg-e2e-real/data/base/5/2704
?? scratchpad/pg-e2e-real/data/base/5/2753
?? scratchpad/pg-e2e-real/data/base/5/2753_fsm
?? scratchpad/pg-e2e-real/data/base/5/2753_vm
?? scratchpad/pg-e2e-real/data/base/5/2754
?? scratchpad/pg-e2e-real/data/base/5/2755
?? scratchpad/pg-e2e-real/data/base/5/2756
?? scratchpad/pg-e2e-real/data/base/5/2757
?? scratchpad/pg-e2e-real/data/base/5/2830
?? scratchpad/pg-e2e-real/data/base/5/2831
?? scratchpad/pg-e2e-real/data/base/5/2832
?? scratchpad/pg-e2e-real/data/base/5/2833
?? scratchpad/pg-e2e-real/data/base/5/2834
?? scratchpad/pg-e2e-real/data/base/5/2835
?? scratchpad/pg-e2e-real/data/base/5/2836
?? scratchpad/pg-e2e-real/data/base/5/2836_fsm
?? scratchpad/pg-e2e-real/data/base/5/2836_vm
?? scratchpad/pg-e2e-real/data/base/5/2837
?? scratchpad/pg-e2e-real/data/base/5/2838
?? scratchpad/pg-e2e-real/data/base/5/2838_fsm
?? scratchpad/pg-e2e-real/data/base/5/2838_vm
?? scratchpad/pg-e2e-real/data/base/5/2839
?? scratchpad/pg-e2e-real/data/base/5/2840
?? scratchpad/pg-e2e-real/data/base/5/2840_fsm
?? scratchpad/pg-e2e-real/data/base/5/2840_vm
?? scratchpad/pg-e2e-real/data/base/5/2841
?? scratchpad/pg-e2e-real/data/base/5/2995
?? scratchpad/pg-e2e-real/data/base/5/2996
?? scratchpad/pg-e2e-real/data/base/5/3079
?? scratchpad/pg-e2e-real/data/base/5/3079_fsm
?? scratchpad/pg-e2e-real/data/base/5/3079_vm
?? scratchpad/pg-e2e-real/data/base/5/3080
?? scratchpad/pg-e2e-real/data/base/5/3081
?? scratchpad/pg-e2e-real/data/base/5/3085
?? scratchpad/pg-e2e-real/data/base/5/3118
?? scratchpad/pg-e2e-real/data/base/5/3119
?? scratchpad/pg-e2e-real/data/base/5/3164
?? scratchpad/pg-e2e-real/data/base/5/3256
?? scratchpad/pg-e2e-real/data/base/5/3257
?? scratchpad/pg-e2e-real/data/base/5/3258
?? scratchpad/pg-e2e-real/data/base/5/3350
?? scratchpad/pg-e2e-real/data/base/5/3351
?? scratchpad/pg-e2e-real/data/base/5/3379
?? scratchpad/pg-e2e-real/data/base/5/3380
?? scratchpad/pg-e2e-real/data/base/5/3381
?? scratchpad/pg-e2e-real/data/base/5/3394
?? scratchpad/pg-e2e-real/data/base/5/3394_fsm
?? scratchpad/pg-e2e-real/data/base/5/3394_vm
?? scratchpad/pg-e2e-real/data/base/5/3395
?? scratchpad/pg-e2e-real/data/base/5/3429
?? scratchpad/pg-e2e-real/data/base/5/3430
?? scratchpad/pg-e2e-real/data/base/5/3431
?? scratchpad/pg-e2e-real/data/base/5/3433
?? scratchpad/pg-e2e-real/data/base/5/3439
?? scratchpad/pg-e2e-real/data/base/5/3440
?? scratchpad/pg-e2e-real/data/base/5/3455
?? scratchpad/pg-e2e-real/data/base/5/3456
?? scratchpad/pg-e2e-real/data/base/5/3456_fsm
?? scratchpad/pg-e2e-real/data/base/5/3456_vm
?? scratchpad/pg-e2e-real/data/base/5/3466
?? scratchpad/pg-e2e-real/data/base/5/3467
?? scratchpad/pg-e2e-real/data/base/5/3468
?? scratchpad/pg-e2e-real/data/base/5/3501
?? scratchpad/pg-e2e-real/data/base/5/3502
?? scratchpad/pg-e2e-real/data/base/5/3503
?? scratchpad/pg-e2e-real/data/base/5/3534
?? scratchpad/pg-e2e-real/data/base/5/3541
?? scratchpad/pg-e2e-real/data/base/5/3541_fsm
?? scratchpad/pg-e2e-real/data/base/5/3541_vm
?? scratchpad/pg-e2e-real/data/base/5/3542
?? scratchpad/pg-e2e-real/data/base/5/3574
?? scratchpad/pg-e2e-real/data/base/5/3575
?? scratchpad/pg-e2e-real/data/base/5/3576
?? scratchpad/pg-e2e-real/data/base/5/3596
?? scratchpad/pg-e2e-real/data/base/5/3597
?? scratchpad/pg-e2e-real/data/base/5/3598
?? scratchpad/pg-e2e-real/data/base/5/3599
?? scratchpad/pg-e2e-real/data/base/5/3600
?? scratchpad/pg-e2e-real/data/base/5/3600_fsm
?? scratchpad/pg-e2e-real/data/base/5/3600_vm
?? scratchpad/pg-e2e-real/data/base/5/3601
?? scratchpad/pg-e2e-real/data/base/5/3601_fsm
?? scratchpad/pg-e2e-real/data/base/5/3601_vm
?? scratchpad/pg-e2e-real/data/base/5/3602
?? scratchpad/pg-e2e-real/data/base/5/3602_fsm
?? scratchpad/pg-e2e-real/data/base/5/3602_vm
?? scratchpad/pg-e2e-real/data/base/5/3603
?? scratchpad/pg-e2e-real/data/base/5/3603_fsm
?? scratchpad/pg-e2e-real/data/base/5/3603_vm
?? scratchpad/pg-e2e-real/data/base/5/3604
?? scratchpad/pg-e2e-real/data/base/5/3605
?? scratchpad/pg-e2e-real/data/base/5/3606
?? scratchpad/pg-e2e-real/data/base/5/3607
?? scratchpad/pg-e2e-real/data/base/5/3608
?? scratchpad/pg-e2e-real/data/base/5/3609
?? scratchpad/pg-e2e-real/data/base/5/3712
?? scratchpad/pg-e2e-real/data/base/5/3764
?? scratchpad/pg-e2e-real/data/base/5/3764_fsm
?? scratchpad/pg-e2e-real/data/base/5/3764_vm
?? scratchpad/pg-e2e-real/data/base/5/3766
?? scratchpad/pg-e2e-real/data/base/5/3767
?? scratchpad/pg-e2e-real/data/base/5/3997
?? scratchpad/pg-e2e-real/data/base/5/4143
?? scratchpad/pg-e2e-real/data/base/5/4144
?? scratchpad/pg-e2e-real/data/base/5/4145
?? scratchpad/pg-e2e-real/data/base/5/4146
?? scratchpad/pg-e2e-real/data/base/5/4147
?? scratchpad/pg-e2e-real/data/base/5/4148
?? scratchpad/pg-e2e-real/data/base/5/4149
?? scratchpad/pg-e2e-real/data/base/5/4150
?? scratchpad/pg-e2e-real/data/base/5/4151
?? scratchpad/pg-e2e-real/data/base/5/4152
?? scratchpad/pg-e2e-real/data/base/5/4153
?? scratchpad/pg-e2e-real/data/base/5/4154
?? scratchpad/pg-e2e-real/data/base/5/4155
?? scratchpad/pg-e2e-real/data/base/5/4156
?? scratchpad/pg-e2e-real/data/base/5/4157
?? scratchpad/pg-e2e-real/data/base/5/4158
?? scratchpad/pg-e2e-real/data/base/5/4159
?? scratchpad/pg-e2e-real/data/base/5/4160
?? scratchpad/pg-e2e-real/data/base/5/4163
?? scratchpad/pg-e2e-real/data/base/5/4164
?? scratchpad/pg-e2e-real/data/base/5/4165
?? scratchpad/pg-e2e-real/data/base/5/4166
?? scratchpad/pg-e2e-real/data/base/5/4167
?? scratchpad/pg-e2e-real/data/base/5/4168
?? scratchpad/pg-e2e-real/data/base/5/4169
?? scratchpad/pg-e2e-real/data/base/5/4170
?? scratchpad/pg-e2e-real/data/base/5/4171
?? scratchpad/pg-e2e-real/data/base/5/4172
?? scratchpad/pg-e2e-real/data/base/5/4173
?? scratchpad/pg-e2e-real/data/base/5/4174
?? scratchpad/pg-e2e-real/data/base/5/5002
?? scratchpad/pg-e2e-real/data/base/5/548
?? scratchpad/pg-e2e-real/data/base/5/549
?? scratchpad/pg-e2e-real/data/base/5/6102
?? scratchpad/pg-e2e-real/data/base/5/6104
?? scratchpad/pg-e2e-real/data/base/5/6106
?? scratchpad/pg-e2e-real/data/base/5/6110
?? scratchpad/pg-e2e-real/data/base/5/6111
?? scratchpad/pg-e2e-real/data/base/5/6112
?? scratchpad/pg-e2e-real/data/base/5/6113
?? scratchpad/pg-e2e-real/data/base/5/6116
?? scratchpad/pg-e2e-real/data/base/5/6117
?? scratchpad/pg-e2e-real/data/base/5/6175
?? scratchpad/pg-e2e-real/data/base/5/6176
?? scratchpad/pg-e2e-real/data/base/5/6228
?? scratchpad/pg-e2e-real/data/base/5/6229
?? scratchpad/pg-e2e-real/data/base/5/6237
?? scratchpad/pg-e2e-real/data/base/5/6238
?? scratchpad/pg-e2e-real/data/base/5/6239
?? scratchpad/pg-e2e-real/data/base/5/826
?? scratchpad/pg-e2e-real/data/base/5/827
?? scratchpad/pg-e2e-real/data/base/5/828
?? scratchpad/pg-e2e-real/data/base/5/PG_VERSION
?? scratchpad/pg-e2e-real/data/base/5/pg_filenode.map
?? scratchpad/pg-e2e-real/data/global/1213
?? scratchpad/pg-e2e-real/data/global/1213_fsm
?? scratchpad/pg-e2e-real/data/global/1213_vm
?? scratchpad/pg-e2e-real/data/global/1214
?? scratchpad/pg-e2e-real/data/global/1232
?? scratchpad/pg-e2e-real/data/global/1233
?? scratchpad/pg-e2e-real/data/global/1260
?? scratchpad/pg-e2e-real/data/global/1260_fsm
?? scratchpad/pg-e2e-real/data/global/1260_vm
?? scratchpad/pg-e2e-real/data/global/1261
?? scratchpad/pg-e2e-real/data/global/1261_fsm
?? scratchpad/pg-e2e-real/data/global/1261_vm
?? scratchpad/pg-e2e-real/data/global/1262
?? scratchpad/pg-e2e-real/data/global/1262_fsm
?? scratchpad/pg-e2e-real/data/global/1262_vm
?? scratchpad/pg-e2e-real/data/global/2396
?? scratchpad/pg-e2e-real/data/global/2396_fsm
?? scratchpad/pg-e2e-real/data/global/2396_vm
?? scratchpad/pg-e2e-real/data/global/2397
?? scratchpad/pg-e2e-real/data/global/2671
?? scratchpad/pg-e2e-real/data/global/2672
?? scratchpad/pg-e2e-real/data/global/2676
?? scratchpad/pg-e2e-real/data/global/2677
?? scratchpad/pg-e2e-real/data/global/2694
?? scratchpad/pg-e2e-real/data/global/2695
?? scratchpad/pg-e2e-real/data/global/2697
?? scratchpad/pg-e2e-real/data/global/2698
?? scratchpad/pg-e2e-real/data/global/2846
?? scratchpad/pg-e2e-real/data/global/2847
?? scratchpad/pg-e2e-real/data/global/2964
?? scratchpad/pg-e2e-real/data/global/2965
?? scratchpad/pg-e2e-real/data/global/2966
?? scratchpad/pg-e2e-real/data/global/2967
?? scratchpad/pg-e2e-real/data/global/3592
?? scratchpad/pg-e2e-real/data/global/3593
?? scratchpad/pg-e2e-real/data/global/4060
?? scratchpad/pg-e2e-real/data/global/4061
?? scratchpad/pg-e2e-real/data/global/4175
?? scratchpad/pg-e2e-real/data/global/4176
?? scratchpad/pg-e2e-real/data/global/4177
?? scratchpad/pg-e2e-real/data/global/4178
?? scratchpad/pg-e2e-real/data/global/4181
?? scratchpad/pg-e2e-real/data/global/4182
?? scratchpad/pg-e2e-real/data/global/4183
?? scratchpad/pg-e2e-real/data/global/4184
?? scratchpad/pg-e2e-real/data/global/4185
?? scratchpad/pg-e2e-real/data/global/4186
?? scratchpad/pg-e2e-real/data/global/6000
?? scratchpad/pg-e2e-real/data/global/6001
?? scratchpad/pg-e2e-real/data/global/6002
?? scratchpad/pg-e2e-real/data/global/6100
?? scratchpad/pg-e2e-real/data/global/6114
?? scratchpad/pg-e2e-real/data/global/6115
?? scratchpad/pg-e2e-real/data/global/6243
?? scratchpad/pg-e2e-real/data/global/6244
?? scratchpad/pg-e2e-real/data/global/6245
?? scratchpad/pg-e2e-real/data/global/6246
?? scratchpad/pg-e2e-real/data/global/6247
?? scratchpad/pg-e2e-real/data/global/pg_control
?? scratchpad/pg-e2e-real/data/global/pg_filenode.map
?? scratchpad/pg-e2e-real/data/pg_hba.conf
?? scratchpad/pg-e2e-real/data/pg_ident.conf
?? scratchpad/pg-e2e-real/data/pg_logical/replorigin_checkpoint
?? scratchpad/pg-e2e-real/data/pg_multixact/members/0000
?? scratchpad/pg-e2e-real/data/pg_multixact/offsets/0000
?? scratchpad/pg-e2e-real/data/pg_stat/pgstat.stat
?? scratchpad/pg-e2e-real/data/pg_subtrans/0000
?? scratchpad/pg-e2e-real/data/pg_wal/000000010000000000000001
?? scratchpad/pg-e2e-real/data/pg_xact/0000
?? scratchpad/pg-e2e-real/data/postgresql.auto.conf
?? scratchpad/pg-e2e-real/data/postgresql.conf
?? scratchpad/pg-e2e-real/initdb.log
?? scratchpad/pg-e2e-real/seed_manifest.json
?? scratchpad/pg-e2e-real/serve.log
?? scratchpad/pg-e2e-real/uvicorn.log
?? scratchpad/pr3.diff
?? scratchpad/pr7.diff
?? scratchpad/pr8.diff
?? series-order-compression-followups-review-packet.md
?? series-order-operator-compression-review-packet.md
?? series-order-operator-compression-review-r1.md
?? smoke-test.js
     1	# ТЗ Этап 0 — полное выключение legacy-острова (Island-off baseline) — v4
     2	
     3	Статус: **DRAFT v4 после кросс-ревью R3** (author: Claude; reviewer:
     4	Codex; R1–R2 внесены ранее; R3: artifact-url переклассифицирован в
     5	closed-delivery контур (b); user block добавлен в защитный контур (c),
     6	`island_friend_blocks` выведен из freeze-списка в allowlist).
     7	Основание: VISION v3.0.1 (`96df90a`), gap-карта v2 §4.
     8	
     9	Цель: обратимо вывести legacy-остров из прода целиком — клиентскую
    10	поверхность, backend-writers и генерационные runners — сохранив
    11	защитные контуры (closed delivery, public report, операторская
    12	модерация/takedown, recall) и не удаляя данных. Результат — «чистый
    13	Island-off baseline», предусловие реализации Этапа 1.
    14	
    15	Не-цели: удаление кода/таблиц/данных; ретеминг в приют; изменения
    16	feed/каталога/challenge; mission-функциональность.
    17	
    18	Инварианты пакета: данные не удаляются нигде; каждый шаг обратим одним
    19	env-flip или откатом билда; closed delivery, public report, модерация
    20	и recall работают на каждом шаге (проверяется в acceptance каждого
    21	шага, где применимо).
    22	
    23	Фактическое состояние (проверено 30.07.2026, уточнено R2):
    24	`app/main.py` — `island_state_router` и `island_social_router`
    25	смонтированы безусловно (:193–194); **модерация смонтирована внутри
    26	`if settings.enable_island_social:`** (:195–200) и авторизуется
    27	server-side allowlist'ом `ISLAND_MODERATOR_IDS` (не Lab auth);
    28	`island_router` из `api_island.py` — **theme/bake generation**;
    29	`api_island_social.py` — public, visits, likes, user-block, и
    30	**artifact-url (:159), который является closed-delivery resolver'ом,
    31	а НЕ legacy-поверхностью**;
    32	`start_bake_runner()` / `start_theme_runner()` вызываются безусловно в
    33	`lifespan` (:76–77). Поэтому простое `ENABLE_ISLAND_SOCIAL=false`
    34	одновременно убило бы модерацию и не остановило бы ни legacy-роуты,
    35	ни генерационные runners. **Первый деливерабл П2 — точный route
    36	manifest**: каждый island-маршрут → файл → целевой контур; физическое
    37	разделение выполняется только по manifest'у, не по памяти.
    38	
    39	---
    40	
    41	## П1 — снятие клиентской поверхности
    42	
    43	Изменения: релиз feed-prototype с выключенными `VITE_ISLAND_ENABLED`,
    44	`VITE_ISLAND_VISIT_AWARDS_ENABLED`, `VITE_ISLAND_NOTIFICATIONS_ENABLED`
    45	(предварительно зафиксировать фактические значения деплой-окружения в
    46	receipt). Код не меняется — поверхность уже за флагами
    47	(`src/feed.ts:202-210`, deep-links в `src/main.ts`).
    48	
    49	Acceptance: свежая сессия — нет вкладки «мета», друзей в HUD,
    50	island-обработки deep-links; ноль запросов `/api/island/*`.
    51	Rollback: предыдущий клиентский билд.
    52	
    53	## П2 — backend-код: физическое разделение контуров + гейты runners
    54	
    55	Изменения (одна PR в swipe-backend; прод-деплой — только в П4, после
    56	pre-set компенсирующих флагов):
    57	
    58	0. **Route manifest** (деливерабл до кода): полный список
    59	   island-маршрутов с файлом-источником и целевым контуром.
    60	1. **Разделить роутеры на четыре независимых контура** (по
    61	   manifest'у):
    62	   a) legacy: state (`api_island_state`), public/visits/likes
    63	      (`api_island_social` БЕЗ artifact-url и block), theme/bake
    64	      generation (`api_island`);
    65	   b) closed-delivery resolver — **включая artifact-url endpoint
    66	      (`api_island_social.py:159`)**: это выдача signed GET на уже
    67	      опубликованные артефакты, не legacy;
    68	   c) защитный пользовательский контур: **public report И user block**
    69	      (`/island/friends/{user_id}/block`) — VISION требует report/block
    70	      вместе;
    71	   d) operator moderation/takedown (allowlist `ISLAND_MODERATOR_IDS`).
    72	   Контуры (b), (c), (d) выводятся из-под `ENABLE_ISLAND_SOCIAL` и
    73	   получают собственные гейты: (b) — существующий
    74	   `ENABLE_ISLAND_CLOSED_DELIVERY`; (c) и (d) — новый
    75	   `ENABLE_ISLAND_PROTECTIVE_SURFACE` (default **true**: защитный
    76	   контур не должен выключаться случайно).
    77	2. **Два раздельных гейта вместо одного** (нужны для quiesce):
    78	   `ENABLE_ISLAND_LEGACY_SURFACE` (default false) — роуты контура (a);
    79	   `ENABLE_ISLAND_GENERATION_RUNNERS` (default false) — запуск/claim
    80	   `start_bake_runner()` / `start_theme_runner()` в `lifespan`.
    81	   Раздельность позволяет состояние «роуты закрыты, runners доживают
    82	   очередь».
    83	3. Cross-flag валидатор: явные ветки на новые комбинации.
    84	
    85	Acceptance (тесты + локально): при `LEGACY_SURFACE=false` все пути
    86	контура (a) → 404; при `GENERATION_RUNNERS=false` runners не стартуют
    87	и **status/attempts существующих queued jobs не изменяются**; при
    88	`SOCIAL=false` — модерация, report и closed delivery продолжают
    89	работать; полный тест-сьют зелёный. Rollback: env-flip
    90	соответствующего флага в true.
    91	
    92	## П3 — pre-prod проверка старого cached-клиента (ДО прод-применения)
    93	
    94	Работы: browser/E2E **старого прод-билда клиента** против локального
    95	backend с выключенными флагами П2: пройти серию до сундука; убедиться,
    96	что island-запросы получают 404 и деградация тихая — лента играет,
    97	крашей нет, поллинг останавливается/уходит в backoff; код-осмотр
    98	обработчиков ошибок island-путей (state sync, `pollIslandActivity`,
    99	visit-award, лайки).
   100	
   101	Acceptance: E2E зелёный. Найденная жёсткая зависимость — blocking
   102	finding: чинится до П4.
   103	
   104	## П4 — прод-применение (staged, каждый под-шаг — receipt + проверка)
   105	
   106	1. **Pre-set (до деплоя кода!):** в `render.yaml` заранее добавить
   107	   `ENABLE_ISLAND_LEGACY_SURFACE=true` и
   108	   `ENABLE_ISLAND_GENERATION_RUNNERS=true` (плюс явные
   109	   `ENABLE_ISLAND_PROTECTIVE_SURFACE=true`,
   110	   `ENABLE_ISLAND_CLOSED_DELIVERY=true`). Затем задеплоить код П2 —
   111	   деплой не меняет поведение прода (default-false флаги
   112	   компенсированы pre-set'ом). Smoke: legacy-роуты отвечают, runners
   113	   работают, модерация работает.
   114	2. **Flip поверхности:** `ENABLE_ISLAND_SOCIAL=false`,
   115	   `ENABLE_ISLAND_BOTS=false`, `ENABLE_ISLAND_VISIT_AWARDS=false`,
   116	   `ENABLE_ISLAND_NOTIFICATIONS=false`, явно
   117	   `ISLAND_REWARDS_ENABLED=false` (default true),
   118	   `ENABLE_ISLAND_LEGACY_SURFACE=false`. Новые theme/bake jobs
   119	   невозможны (роуты закрыты); runners ещё включены.
   120	3. **Quiesce/drain:** дождаться terminal-состояния всех queued/running
   121	   bake/theme jobs (новых нет; bounded wait по lease TTL; job,
   122	   зависший в `generating`, резолвится вручную по runbook'у до
   123	   продолжения). Проверка: ноль незавершённых jobs.
   124	4. **Flip runners:** `ENABLE_ISLAND_GENERATION_RUNNERS=false`
   125	   (рестарт; runners больше не стартуют; ничего не оборвано
   126	   посередине — очередь пуста).
   127	5. **Prod smoke:** curl-набор по route manifest'у → 404; closed
   128	   delivery (artifact-url) выдаёт signed GET на существующий артефакт;
   129	   report, user block и модерационная консоль работают; в логах нет
   130	   bot/notification/bake/theme runner'ов.
   131	
   132	Rollback: обратные env-flip'ы пошагово в обратном порядке; повторное
   133	включение ботов безопасно by design (immutable per-day планы, bounded
   134	catch-up).
   135	
   136	## П5 — snapshot manifest, схема и доки
   137	
   138	1. **Data-manifest с явным freeze-списком** (после drain П4):
   139	   snapshot row counts + max seq/id + digest mutable-state по
   140	   **freeze-списку** legacy/social/economy таблиц: `island_states`,
   141	   `island_building_social`, `island_visits`, `island_building_likes`,
   142	   `island_completion_claims`, `island_completion_outcomes`,
   143	   `island_collect_claims`, `island_visit_awards`, `island_bots`,
   144	   `island_bot_daily_plans`, `island_friend_codes`,
   145	   `island_friendships`,
   146	   `island_notification_outbox`, `island_notification_attempts`,
   147	   `island_meta_events`, `island_bake_jobs`, `island_theme_jobs`.
   148	   Через ≥24 ч: **ноль новых записей в freeze-списке**. Защитные
   149	   таблицы (`island_reports`, `island_moderation_actions`,
   150	   **`island_friend_blocks`** — пользовательский block остаётся живым
   151	   контуром) в freeze-список **не входят**: их writes разрешены и
   152	   проверяются как audit receipts — каждая новая строка соответствует
   153	   конкретному report/block/moderation-акту. Manifest — receipt
   154	   пакета.
   155	2. Пересобрать и переопубликовать `platform-scheme` (провенанс VISION
   156	   v3.0.1).
   157	3. Доки: `IMPLEMENTATION-STATUS.md` (остров выключен: дата, коммиты,
   158	   состав), durable-строка в корневой `CLAUDE.md`, при необходимости
   159	   `AGENTS.md`.
   160	
   161	Acceptance: manifest-проверка чистая; схема опубликована;
   162	`docs-boundary-lint` чистый.
   163	
   164	---
   165	
   166	## Порядок применения
   167	
   168	П1 (клиент) → П2 (код: route manifest + разделение, PR без
   169	прод-деплоя) → П3 (pre-prod E2E старого клиента) → П4 (pre-set →
   170	деплой → staged env-flip'ы → drain → prod smoke) → П5
   171	(manifest/схема/доки). Каждый шаг — отдельный receipt; прод-верификация
   172	до следующего шага.
   173	
   174	## Общий acceptance Этапа 0
   175	
   176	- Свежий клиент: ноль island-запросов.
   177	- Backend: контур (a) → 404; bake/theme/bot/notification runners не
   178	  стартуют; queued jobs заморожены (status/attempts без изменений).
   179	- Closed delivery (artifact-url) / public report / user block /
   180	  модерация / recall — проверены руками, работают.
   181	- Старый cached-клиент: pre-prod E2E пройден до применения, prod smoke
   182	  после.
   183	- Rollback записан; минимум один шаг проверен обратным включением вне
   184	  прода.
   185	- Data-manifest: ноль записей в freeze-списке после cutoff; защитные
   186	  writes — только с audit-receipt; данные не удалены.
   187	
   188	Только после этого acceptance начинается реализация Этапа 1.
     1	# ТЗ Этап 1 — Mission-slice v0 (founder dogfood) — v4
     2	
     3	Статус: **DRAFT v4 после кросс-ревью R3** (author: Claude; reviewer:
     4	Codex; R1–R2 внесены ранее; R3: `mission_case_bindings` — версия
     5	контракта одна на весь lifecycle by construction; монотонный
     6	`ledger.seq` + правило `eligible at cursor` для воспроизводимого
     7	UNLOCKED-снапшота).
     8	Основание: VISION v3.0.1 (`96df90a`), gap-карта v2 §1–2.
     9	**Предусловие реализации: чистый Island-off baseline (Этап 0 применён
    10	и проверен).**
    11	
    12	Цель: один маленький реальный кейс проходит полный честный цикл
    13	`READY → ACTIVE → авто-вклады → UNLOCKED → следующий ACTIVE → реальная
    14	передача → FULFILLED → evidence` на прод-инфраструктуре; игроки —
    15	только enrolled dogfood-пользователи (оператор). Всё default-off;
    16	для не-enrolled пользователей поведение платформы не меняется ни в
    17	чтении, ни в записи.
    18	
    19	Не-цели v0: коллекции и их вклад (Этап 2), приют-карта, campaign
    20	share, «Попросить помочь», holdout, подписка/VIP, голосование,
    21	sponsored-бюджеты, TMA-аппрув кейсов (v0 — internal CLI), автоматика
    22	FULFILLED, мультивалютность (v0 жёстко EUR).
    23	
    24	---
    25	
    26	## Бэкенд: namespace `mission_*` (одна новая миграция)
    27	
    28	Все журналы append-only; образцы — island_completion_claims/outcomes,
    29	island_moderation_actions, feed_policy_config_versions, award_*.
    30	
    31	0. **`mission_case_bindings`** — immutable биндинг «кейс ↔ ровно одна
    32	   версия контракта»: PK `case_id`, `contract_version` (FK на
    33	   contracts; пара UNIQUE), `bound_at`. Создаётся при `ready` и никогда
    34	   не меняется: новая версия потребности = **новый case_id** (в
    35	   культуре «изменение биндинга = новая identity»). Все остальные
    36	   таблицы ссылаются composite-FK `(case_id, contract_version)` на
    37	   bindings, а не на contracts напрямую — расхождение версий вдоль
    38	   lifecycle-цепочки (READY на v1, UNLOCKED на v3) невозможно by
    39	   construction.
    40	1. **`mission_case_contracts`** — immutable контракт кейса:
    41	   PK `(case_id, contract_version)`, `contract_digest` (JCS sha256),
    42	   `document` JSONB schema `mission.case-contract.v1`: получатель;
    43	   потребность `scalable|fixed`; guaranteed deliverable;
    44	   **числовые границы `guaranteed_cents`, `confirmed_need_cents`,
    45	   `stretch_cap_cents`** (без них `min(...)` невычислим); `currency`
    46	   (v0 CHECK `='EUR'`); stretch deliverables; правило rollover;
    47	   `token_goal`; `unlock_share` (v0 — пропорция); `unlock_cutoff_at`;
    48	   `latest_fulfillment_at`; `queue_position`; ожидаемый вид
    49	   подтверждения. `registered_by/at`.
    50	2. **`mission_runtime`** — **singleton-строка** (PK-константа,
    51	   CHECK id=1): пара `active_case_id + active_contract_version`
    52	   (nullable вместе), `updated_seq`.
    53	   **Единая точка сериализации: каждый lifecycle- и
    54	   contribution-writer начинает транзакцию с
    55	   `SELECT … FROM mission_runtime FOR UPDATE`** — двух ACTIVE-кейсов
    56	   не существует by construction, авторитет «какой кейс ACTIVE» —
    57	   эта строка (проекция, воспроизводимая из событий).
    58	3. **`mission_case_events`** — lifecycle: `seq` (nextval
    59	   `mission_case_events_seq` под runtime-lock), пин контракта
    60	   (composite FK), `kind ∈ ready|active|unlocked|fulfilled`,
    61	   `payload`, `receipt_digest`; UNIQUE `(case_id, kind)`. Derived
    62	   state кейса = последний kind по `seq DESC`.
    63	4. **`mission_pool_ledger`** — rolling pool: **монотонный `seq`
    64	   (BIGSERIAL)**; строки immutable и вставляются только уже settled
    65	   (`settled_at` фиксируется при insert, задним числом строки не
    66	   settled-ятся); `source ∈
    67	   seed|revenue_share|partner|subscription_share` (v0 — только seed),
    68	   `amount_cents`, `currency` (CHECK `='EUR'`), `meta`,
    69	   `idempotency_key` UNIQUE. **Правило cursor'а:** `pool_cursor`
    70	   allocation'а = max `ledger.seq` на момент снапшота; `settled
    71	   unallocated eligible pool на cursor` = `sum(ledger.amount при seq ≤
    72	   cursor) − sum(предыдущих allocations)`. Поздние строки получают
    73	   больший `seq` и в прошлый снапшот не входят — immutable
    74	   UNLOCKED-сумма воспроизводима by construction.
    75	5. **`mission_pool_allocations`** — деньги→кейс: `kind ∈
    76	   reserve_guaranteed|gift_additional`, `(case_id,
    77	   contract_version)`, `amount_cents`, `currency` (CHECK `='EUR'`),
    78	   `pool_cursor`, FK на породивший lifecycle event, `receipt`.
    79	   **Финансовая идемпотентность и границы:** UNIQUE idempotency
    80	   identity (`res:{case_id}:{contract_version}` /
    81	   `gift:{case_id}:{contract_version}`); округление
    82	   `unlock_share × cents` — вниз до целых центов; CHECK-и:
    83	   `unlock_share ∈ [0,1]` (в receipt), `guaranteed_cents ≤
    84	   confirmed_need_cents + stretch_cap_cents` (на контракте),
    85	   положительные `amount_cents` в ledger и allocations. Инвариант (в
    86	   транзакции под runtime-lock): `sum(allocations) ≤ sum(settled
    87	   ledger)`. UNLOCKED-снапшот: `gift = min(guaranteed_cents +
    88	   unlock_share(progress) × settled unallocated pool на cursor,
    89	   confirmed_need_cents + stretch_cap_cents)`.
    90	6. **`mission_contributions`** (+ child
    91	   **`mission_contribution_allocations`**) — вклад: `user_id`,
    92	   `source ∈ series|daily`, `amount`, `source_ref`,
    93	   `idempotency_key` UNIQUE: серия — `mc:{run_id}`; дейлик —
    94	   **`mcd:{user_id}:{day}:{quest_id}`, где `day` — player-local
    95	   `DailyQuest.day` (пин точной строки квеста; НЕ utc_date)**;
    96	   `seq` под runtime-lock; receipt в той же транзакции, replay
    97	   byte-identical. Child-allocations (каждая пинит `(case_id,
    98	   contract_version)`): обычно одна строка; при пересечении
    99	   `token_goal` — детерминированно две. **Инвариант
   100	   `sum(child)=amount` — service-level в той же транзакции +
   101	   reconciliation-тест** (обычный SQL CHECK не читает другие строки;
   102	   constraint trigger — опциональное усиление позже).
   103	7. **`mission_fulfillments`** (+ child
   104	   **`mission_fulfillment_allocations`**) — typed transfer receipt
   105	   `mission.fulfillment-receipt.v1`: `(case_id, contract_version)`,
   106	   `amount_cents`, `currency` (CHECK `='EUR'`), `recipient`,
   107	   `transfer_reference`/`transfer_date`, `evidence_digest`, immutable
   108	   content-addressed `artifact_url`. Child-строки связывают receipt с
   109	   **каждой** покрываемой allocation-строкой (обычный перевод
   110	   покрывает две: `reserve_guaranteed` + `gift_additional`). Сервис
   111	   принимает fulfill только при полном покрытии зафиксированного gift
   112	   (`sum(child) = amount_cents = зарезервировано+открыто кейса`);
   113	   `FULFILLED` event пишется атомарно в той же транзакции. Публичное
   114	   «реально передано» проецируется **только** из fulfillment-receipts.
   115	
   116	**Exact contract identity проходит через всю схему:** runtime,
   117	case-events, pool-allocations, contribution-allocations и
   118	fulfillments пинят точную пару `(case_id, contract_version)`
   119	composite-FK **на `mission_case_bindings`** — версия у кейса ровно
   120	одна на весь lifecycle, из каждой строки доказуемо, по какой версии
   121	посчитаны goal и деньги, а расхождение версий между событиями
   122	исключено схемой, не только тестом.
   123	
   124	### State machine и очередь
   125	
   126	`register-contract` → **`ready`** (отдельная CLI-команда: резервирует
   127	гарантию из pool — allocation `reserve_guaranteed` — и пишет
   128	ready-event; кейс встаёт в очередь по `queue_position`) → `activate`
   129	(допустим только при `active_case_id IS NULL`; берёт head очереди
   130	READY) → UNLOCKED (в транзакции пересекающего вклада или CLI
   131	`unlock-cutoff`) **в той же транзакции активирует следующий READY из
   132	очереди**. Правила:
   133	
   134	- Включение `ENABLE_MISSION_CORE` требует **DB-preflight** —
   135	  CLI-команда и startup-проверка, не config-validator (у него нет
   136	  доступа к БД): существует ACTIVE и ≥1 READY-successor.
   137	- Аварийный путь пустой очереди (VISION-совместимый): транзакция
   138	  пересекающего вклада **не коммитится** и возвращает retryable
   139	  **503** — клиентский outbox сохраняет результат и повторит после
   140	  появления READY-кейса. Не 409: существующий result-outbox считает
   141	  409 terminal и удалит запись. `unlock-cutoff` при отсутствующем
   142	  successor отказывает до создания READY-кейса. Операционный
   143	  инвариант — держать очередь непустой; 503-ветка — предохранитель,
   144	  не рабочий режим.
   145	- Предусловие v0 (валидируется при `register-contract`): `token_goal`
   146	  каждого кейса ≥ максимально возможного одиночного вклада (максимум
   147	  серии/дейлика из reward-функций) — пересечение затрагивает максимум
   148	  два кейса, двух child-строк достаточно. Каскадное распределение по N
   149	  кейсам понадобится для крупных collection-наград (Этап 2).
   150	
   151	### Dogfood-изоляция (writers И readers)
   152	
   153	Единый server-owned allowlist `MISSION_DOGFOOD_USER_IDS` применяется:
   154	(а) во врезках `/api/results` и daily-claim — **вклад создаётся только
   155	enrolled-пользователям**, для остальных поведение байт-в-байт прежнее;
   156	(б) в read API; (в) в `/session` отдаётся capability
   157	`mission_dogfood` (образец operator-debug-entry capability) — клиент
   158	монтирует миссию только при `VITE_MISSION_ENABLED && capability`.
   159	
   160	### Врезки и доставка receipt до клиента
   161	
   162	- `POST /api/results` (терминальная серия) и daily-claim: в той же
   163	  транзакции, что RewardLedger, — mission contribution; в ответ
   164	  добавляется **optional блок `mission_contribution`** (receipt: id,
   165	  amount, allocations по кейсам, состояние бара после). Ответ
   166	  фиксируется как обычно; **`_verified_replay_response` восстанавливает
   167	  тот же блок** (replay возвращает committed-байты; у receipts,
   168	  созданных до включения флага, блока нет — это корректно).
   169	- Клиент: `ResultResp → outbox ResultReceipt` расширяется переносом
   170	  `mission_contribution`; церемония вклада в series-win флоу читает
   171	  **только** этот receipt (никакого optimistic). Аналогично для
   172	  daily-ответа.
   173	
   174	### Операторский CLI `python -m app.mission_ops`
   175	
   176	Команды: `register-contract` / `seed-pool` / **`ready`** / `activate` /
   177	`unlock-cutoff` / `fulfill` (typed fulfillment-receipt + evidence
   178	digest + artifact URL). Все dry-run по умолчанию, `--apply` с
   179	обязательными exact-identity аргументами; каждый apply = case-event +
   180	receipt. Отдельный флаг `ENABLE_MISSION_OPS`, HTTP-маршрутов нет;
   181	impact-полномочия не смешиваются с контентными скоупами.
   182	
   183	### Read API
   184	
   185	`ENABLE_MISSION_READ` + capability: `GET /api/mission/case` — текущий
   186	ACTIVE (токен-бар, четыре числа: вклад сообщества / гарантировано /
   187	зарезервировано и открыто / реально передано-из-fulfillments, контракт
   188	в один тап), мой вклад, последний FULFILLED (**с immutable event id для
   189	клиентского watermark**). Ответ — проекция только из receipts.
   190	
   191	### Тесты (PG, обязательные)
   192	
   193	Полный E2E цикл; идемпотентность (`mc:{run_id}`, `mcd:` реплей →
   194	byte-identical); конкуренция под runtime-lock (два вклада добивают
   195	goal — ровно один UNLOCKED, остаток второго — новому ACTIVE);
   196	двух ACTIVE не существует (негативный тест `activate` при занятом
   197	runtime); split-инвариант + reconciliation; pool-инвариант; snapshot
   198	не меняется от поздних settled-строк; fulfillment coverage (transfer =
   199	сумма указанных allocations; чужие allocations → отказ);
   200	**не-enrolled пользователь: `/results`/daily байт-в-байт прежние
   201	(golden), вкладов нет, capability нет**; пустая очередь → 503
   202	retryable, outbox сохраняет и повторяет после появления READY, вклад
   203	не потерян и не задублирован; fulfillment покрывает обе allocation
   204	child-строками, частичное покрытие → отказ без FULFILLED-события;
   205	пин `(case_id, contract_version)` присутствует во всех receipts;
   206	негативный тест расхождения версий (событие/allocation с версией, не
   207	совпадающей с binding → FK-отказ); снапшот воспроизводим из
   208	`ledger.seq ≤ cursor` при любых поздних строках; округление вниз и
   209	границы CHECK-ов; up/down миграции.
   210	
   211	## Клиент (feed-prototype, `VITE_MISSION_ENABLED` + capability)
   212	
   213	- HUD-ретеминг: бейдж пазлов → «лапки»; значение = мой вклад в текущий
   214	  кейс (server-derived). Старый puzzle-баланс уходит с поверхности
   215	  (данные не трогаются). Optimistic ко вкладу не применяется.
   216	- Виджет кейса + экран кейса (четыре числа, контракт, история).
   217	- Церемония вклада в series-win флоу — из `mission_contribution`
   218	  receipt результата (до challenge-пилюли); дейлик-клейм показывает
   219	  лапки из receipt daily-ответа.
   220	- Церемонии UNLOCKED и FULFILLED — по read API; **client watermark по
   221	  immutable event id** (образец island-celebrated-stages): каждая
   222	  церемония показывается один раз, не при каждом входе.
   223	- Прод-сборка не меняется: без capability миссия не монтируется даже
   224	  при включённом VITE-флаге.
   225	
   226	## Операционка (вне кода, owner — оператор)
   227	
   228	Договорённость с локальным приютом; кейс №1 — масштабируемая
   229	потребность (корм), guaranteed ≈ €100 посева; права на фото/видео;
   230	формат мини-отчёта; latest fulfillment date; **кейс №2 доведён до
   231	READY до включения core** (требование preflight).
   232	
   233	## Acceptance Этапа 1 (dogfood)
   234	
   235	Полный реальный цикл: контракт → посев → READY (резервирование) →
   236	ACTIVE → enrolled-оператор играет серии/дейлики, вклады с receipts →
   237	UNLOCKED (snapshot-receipt; кейс №2 ACTIVE) → реальная закупка корма и
   238	передача → FULFILLED с typed transfer receipt и evidence → обе
   239	церемонии показаны один раз (watermark). Все receipts воспроизводимы;
   240	для не-enrolled пользователей не изменилось ничего (проверено golden).
   241	
   242	## Rollback
   243	
   244	Флаги off → поведение платформы прежнее; `mission_*` таблицы остаются
   245	(append-only, ни на что не влияют); миграция down — только вне прода.

exec
/bin/zsh -lc 'git diff --name-only eaa7ca943a1994eab0fa51cafe2cc987d7274c86 -- play-for-good-stage0-island-off-tz.md play-for-good-stage1-mission-slice-tz.md VISION.md play-for-good-gap-map-v1.md; git show eaa7ca943a1994eab0fa51cafe2cc987d7274c86:play-for-good-stage0-island-off-tz.md | nl -ba' in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 0ms:
     1	# ТЗ Этап 0 — полное выключение legacy-острова (Island-off baseline) — v4
     2	
     3	Статус: **DRAFT v4 после кросс-ревью R3** (author: Claude; reviewer:
     4	Codex; R1–R2 внесены ранее; R3: artifact-url переклассифицирован в
     5	closed-delivery контур (b); user block добавлен в защитный контур (c),
     6	`island_friend_blocks` выведен из freeze-списка в allowlist).
     7	Основание: VISION v3.0.1 (`96df90a`), gap-карта v2 §4.
     8	
     9	Цель: обратимо вывести legacy-остров из прода целиком — клиентскую
    10	поверхность, backend-writers и генерационные runners — сохранив
    11	защитные контуры (closed delivery, public report, операторская
    12	модерация/takedown, recall) и не удаляя данных. Результат — «чистый
    13	Island-off baseline», предусловие реализации Этапа 1.
    14	
    15	Не-цели: удаление кода/таблиц/данных; ретеминг в приют; изменения
    16	feed/каталога/challenge; mission-функциональность.
    17	
    18	Инварианты пакета: данные не удаляются нигде; каждый шаг обратим одним
    19	env-flip или откатом билда; closed delivery, public report, модерация
    20	и recall работают на каждом шаге (проверяется в acceptance каждого
    21	шага, где применимо).
    22	
    23	Фактическое состояние (проверено 30.07.2026, уточнено R2):
    24	`app/main.py` — `island_state_router` и `island_social_router`
    25	смонтированы безусловно (:193–194); **модерация смонтирована внутри
    26	`if settings.enable_island_social:`** (:195–200) и авторизуется
    27	server-side allowlist'ом `ISLAND_MODERATOR_IDS` (не Lab auth);
    28	`island_router` из `api_island.py` — **theme/bake generation**;
    29	`api_island_social.py` — public, visits, likes, user-block, и
    30	**artifact-url (:159), который является closed-delivery resolver'ом,
    31	а НЕ legacy-поверхностью**;
    32	`start_bake_runner()` / `start_theme_runner()` вызываются безусловно в
    33	`lifespan` (:76–77). Поэтому простое `ENABLE_ISLAND_SOCIAL=false`
    34	одновременно убило бы модерацию и не остановило бы ни legacy-роуты,
    35	ни генерационные runners. **Первый деливерабл П2 — точный route
    36	manifest**: каждый island-маршрут → файл → целевой контур; физическое
    37	разделение выполняется только по manifest'у, не по памяти.
    38	
    39	---
    40	
    41	## П1 — снятие клиентской поверхности
    42	
    43	Изменения: релиз feed-prototype с выключенными `VITE_ISLAND_ENABLED`,
    44	`VITE_ISLAND_VISIT_AWARDS_ENABLED`, `VITE_ISLAND_NOTIFICATIONS_ENABLED`
    45	(предварительно зафиксировать фактические значения деплой-окружения в
    46	receipt). Код не меняется — поверхность уже за флагами
    47	(`src/feed.ts:202-210`, deep-links в `src/main.ts`).
    48	
    49	Acceptance: свежая сессия — нет вкладки «мета», друзей в HUD,
    50	island-обработки deep-links; ноль запросов `/api/island/*`.
    51	Rollback: предыдущий клиентский билд.
    52	
    53	## П2 — backend-код: физическое разделение контуров + гейты runners
    54	
    55	Изменения (одна PR в swipe-backend; прод-деплой — только в П4, после
    56	pre-set компенсирующих флагов):
    57	
    58	0. **Route manifest** (деливерабл до кода): полный список
    59	   island-маршрутов с файлом-источником и целевым контуром.
    60	1. **Разделить роутеры на четыре независимых контура** (по
    61	   manifest'у):
    62	   a) legacy: state (`api_island_state`), public/visits/likes
    63	      (`api_island_social` БЕЗ artifact-url и block), theme/bake
    64	      generation (`api_island`);
    65	   b) closed-delivery resolver — **включая artifact-url endpoint
    66	      (`api_island_social.py:159`)**: это выдача signed GET на уже
    67	      опубликованные артефакты, не legacy;
    68	   c) защитный пользовательский контур: **public report И user block**
    69	      (`/island/friends/{user_id}/block`) — VISION требует report/block
    70	      вместе;
    71	   d) operator moderation/takedown (allowlist `ISLAND_MODERATOR_IDS`).
    72	   Контуры (b), (c), (d) выводятся из-под `ENABLE_ISLAND_SOCIAL` и
    73	   получают собственные гейты: (b) — существующий
    74	   `ENABLE_ISLAND_CLOSED_DELIVERY`; (c) и (d) — новый
    75	   `ENABLE_ISLAND_PROTECTIVE_SURFACE` (default **true**: защитный
    76	   контур не должен выключаться случайно).
    77	2. **Два раздельных гейта вместо одного** (нужны для quiesce):
    78	   `ENABLE_ISLAND_LEGACY_SURFACE` (default false) — роуты контура (a);
    79	   `ENABLE_ISLAND_GENERATION_RUNNERS` (default false) — запуск/claim
    80	   `start_bake_runner()` / `start_theme_runner()` в `lifespan`.
    81	   Раздельность позволяет состояние «роуты закрыты, runners доживают
    82	   очередь».
    83	3. Cross-flag валидатор: явные ветки на новые комбинации.
    84	
    85	Acceptance (тесты + локально): при `LEGACY_SURFACE=false` все пути
    86	контура (a) → 404; при `GENERATION_RUNNERS=false` runners не стартуют
    87	и **status/attempts существующих queued jobs не изменяются**; при
    88	`SOCIAL=false` — модерация, report и closed delivery продолжают
    89	работать; полный тест-сьют зелёный. Rollback: env-flip
    90	соответствующего флага в true.
    91	
    92	## П3 — pre-prod проверка старого cached-клиента (ДО прод-применения)
    93	
    94	Работы: browser/E2E **старого прод-билда клиента** против локального
    95	backend с выключенными флагами П2: пройти серию до сундука; убедиться,
    96	что island-запросы получают 404 и деградация тихая — лента играет,
    97	крашей нет, поллинг останавливается/уходит в backoff; код-осмотр
    98	обработчиков ошибок island-путей (state sync, `pollIslandActivity`,
    99	visit-award, лайки).
   100	
   101	Acceptance: E2E зелёный. Найденная жёсткая зависимость — blocking
   102	finding: чинится до П4.
   103	
   104	## П4 — прод-применение (staged, каждый под-шаг — receipt + проверка)
   105	
   106	1. **Pre-set (до деплоя кода!):** в `render.yaml` заранее добавить
   107	   `ENABLE_ISLAND_LEGACY_SURFACE=true` и
   108	   `ENABLE_ISLAND_GENERATION_RUNNERS=true` (плюс явные
   109	   `ENABLE_ISLAND_PROTECTIVE_SURFACE=true`,
   110	   `ENABLE_ISLAND_CLOSED_DELIVERY=true`). Затем задеплоить код П2 —
   111	   деплой не меняет поведение прода (default-false флаги
   112	   компенсированы pre-set'ом). Smoke: legacy-роуты отвечают, runners
   113	   работают, модерация работает.
   114	2. **Flip поверхности:** `ENABLE_ISLAND_SOCIAL=false`,
   115	   `ENABLE_ISLAND_BOTS=false`, `ENABLE_ISLAND_VISIT_AWARDS=false`,
   116	   `ENABLE_ISLAND_NOTIFICATIONS=false`, явно
   117	   `ISLAND_REWARDS_ENABLED=false` (default true),
   118	   `ENABLE_ISLAND_LEGACY_SURFACE=false`. Новые theme/bake jobs
   119	   невозможны (роуты закрыты); runners ещё включены.
   120	3. **Quiesce/drain:** дождаться terminal-состояния всех queued/running
   121	   bake/theme jobs (новых нет; bounded wait по lease TTL; job,
   122	   зависший в `generating`, резолвится вручную по runbook'у до
   123	   продолжения). Проверка: ноль незавершённых jobs.
   124	4. **Flip runners:** `ENABLE_ISLAND_GENERATION_RUNNERS=false`
   125	   (рестарт; runners больше не стартуют; ничего не оборвано
   126	   посередине — очередь пуста).
   127	5. **Prod smoke:** curl-набор по route manifest'у → 404; closed
   128	   delivery (artifact-url) выдаёт signed GET на существующий артефакт;
   129	   report, user block и модерационная консоль работают; в логах нет
   130	   bot/notification/bake/theme runner'ов.
   131	
   132	Rollback: обратные env-flip'ы пошагово в обратном порядке; повторное
   133	включение ботов безопасно by design (immutable per-day планы, bounded
   134	catch-up).
   135	
   136	## П5 — snapshot manifest, схема и доки
   137	
   138	1. **Data-manifest с явным freeze-списком** (после drain П4):
   139	   snapshot row counts + max seq/id + digest mutable-state по
   140	   **freeze-списку** legacy/social/economy таблиц: `island_states`,
   141	   `island_building_social`, `island_visits`, `island_building_likes`,
   142	   `island_completion_claims`, `island_completion_outcomes`,
   143	   `island_collect_claims`, `island_visit_awards`, `island_bots`,
   144	   `island_bot_daily_plans`, `island_friend_codes`,
   145	   `island_friendships`,
   146	   `island_notification_outbox`, `island_notification_attempts`,
   147	   `island_meta_events`, `island_bake_jobs`, `island_theme_jobs`.
   148	   Через ≥24 ч: **ноль новых записей в freeze-списке**. Защитные
   149	   таблицы (`island_reports`, `island_moderation_actions`,
   150	   **`island_friend_blocks`** — пользовательский block остаётся живым
   151	   контуром) в freeze-список **не входят**: их writes разрешены и
   152	   проверяются как audit receipts — каждая новая строка соответствует
   153	   конкретному report/block/moderation-акту. Manifest — receipt
   154	   пакета.
   155	2. Пересобрать и переопубликовать `platform-scheme` (провенанс VISION
   156	   v3.0.1).
   157	3. Доки: `IMPLEMENTATION-STATUS.md` (остров выключен: дата, коммиты,
   158	   состав), durable-строка в корневой `CLAUDE.md`, при необходимости
   159	   `AGENTS.md`.
   160	
   161	Acceptance: manifest-проверка чистая; схема опубликована;
   162	`docs-boundary-lint` чистый.
   163	
   164	---
   165	
   166	## Порядок применения
   167	
   168	П1 (клиент) → П2 (код: route manifest + разделение, PR без
   169	прод-деплоя) → П3 (pre-prod E2E старого клиента) → П4 (pre-set →
   170	деплой → staged env-flip'ы → drain → prod smoke) → П5
   171	(manifest/схема/доки). Каждый шаг — отдельный receipt; прод-верификация
   172	до следующего шага.
   173	
   174	## Общий acceptance Этапа 0
   175	
   176	- Свежий клиент: ноль island-запросов.
   177	- Backend: контур (a) → 404; bake/theme/bot/notification runners не
   178	  стартуют; queued jobs заморожены (status/attempts без изменений).
   179	- Closed delivery (artifact-url) / public report / user block /
   180	  модерация / recall — проверены руками, работают.
   181	- Старый cached-клиент: pre-prod E2E пройден до применения, prod smoke
   182	  после.
   183	- Rollback записан; минимум один шаг проверен обратным включением вне
   184	  прода.
   185	- Data-manifest: ноль записей в freeze-списке после cutoff; защитные
   186	  writes — только с audit-receipt; данные не удалены.
   187	
   188	Только после этого acceptance начинается реализация Этапа 1.

exec
/bin/zsh -lc "git show eaa7ca943a1994eab0fa51cafe2cc987d7274c86:play-for-good-stage1-mission-slice-tz.md | nl -ba | sed -n '1,130p'; git show eaa7ca943a1994eab0fa51cafe2cc987d7274c86:play-for-good-stage1-mission-slice-tz.md | nl -ba | sed -n '131,260p'" in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 0ms:
     1	# ТЗ Этап 1 — Mission-slice v0 (founder dogfood) — v4
     2	
     3	Статус: **DRAFT v4 после кросс-ревью R3** (author: Claude; reviewer:
     4	Codex; R1–R2 внесены ранее; R3: `mission_case_bindings` — версия
     5	контракта одна на весь lifecycle by construction; монотонный
     6	`ledger.seq` + правило `eligible at cursor` для воспроизводимого
     7	UNLOCKED-снапшота).
     8	Основание: VISION v3.0.1 (`96df90a`), gap-карта v2 §1–2.
     9	**Предусловие реализации: чистый Island-off baseline (Этап 0 применён
    10	и проверен).**
    11	
    12	Цель: один маленький реальный кейс проходит полный честный цикл
    13	`READY → ACTIVE → авто-вклады → UNLOCKED → следующий ACTIVE → реальная
    14	передача → FULFILLED → evidence` на прод-инфраструктуре; игроки —
    15	только enrolled dogfood-пользователи (оператор). Всё default-off;
    16	для не-enrolled пользователей поведение платформы не меняется ни в
    17	чтении, ни в записи.
    18	
    19	Не-цели v0: коллекции и их вклад (Этап 2), приют-карта, campaign
    20	share, «Попросить помочь», holdout, подписка/VIP, голосование,
    21	sponsored-бюджеты, TMA-аппрув кейсов (v0 — internal CLI), автоматика
    22	FULFILLED, мультивалютность (v0 жёстко EUR).
    23	
    24	---
    25	
    26	## Бэкенд: namespace `mission_*` (одна новая миграция)
    27	
    28	Все журналы append-only; образцы — island_completion_claims/outcomes,
    29	island_moderation_actions, feed_policy_config_versions, award_*.
    30	
    31	0. **`mission_case_bindings`** — immutable биндинг «кейс ↔ ровно одна
    32	   версия контракта»: PK `case_id`, `contract_version` (FK на
    33	   contracts; пара UNIQUE), `bound_at`. Создаётся при `ready` и никогда
    34	   не меняется: новая версия потребности = **новый case_id** (в
    35	   культуре «изменение биндинга = новая identity»). Все остальные
    36	   таблицы ссылаются composite-FK `(case_id, contract_version)` на
    37	   bindings, а не на contracts напрямую — расхождение версий вдоль
    38	   lifecycle-цепочки (READY на v1, UNLOCKED на v3) невозможно by
    39	   construction.
    40	1. **`mission_case_contracts`** — immutable контракт кейса:
    41	   PK `(case_id, contract_version)`, `contract_digest` (JCS sha256),
    42	   `document` JSONB schema `mission.case-contract.v1`: получатель;
    43	   потребность `scalable|fixed`; guaranteed deliverable;
    44	   **числовые границы `guaranteed_cents`, `confirmed_need_cents`,
    45	   `stretch_cap_cents`** (без них `min(...)` невычислим); `currency`
    46	   (v0 CHECK `='EUR'`); stretch deliverables; правило rollover;
    47	   `token_goal`; `unlock_share` (v0 — пропорция); `unlock_cutoff_at`;
    48	   `latest_fulfillment_at`; `queue_position`; ожидаемый вид
    49	   подтверждения. `registered_by/at`.
    50	2. **`mission_runtime`** — **singleton-строка** (PK-константа,
    51	   CHECK id=1): пара `active_case_id + active_contract_version`
    52	   (nullable вместе), `updated_seq`.
    53	   **Единая точка сериализации: каждый lifecycle- и
    54	   contribution-writer начинает транзакцию с
    55	   `SELECT … FROM mission_runtime FOR UPDATE`** — двух ACTIVE-кейсов
    56	   не существует by construction, авторитет «какой кейс ACTIVE» —
    57	   эта строка (проекция, воспроизводимая из событий).
    58	3. **`mission_case_events`** — lifecycle: `seq` (nextval
    59	   `mission_case_events_seq` под runtime-lock), пин контракта
    60	   (composite FK), `kind ∈ ready|active|unlocked|fulfilled`,
    61	   `payload`, `receipt_digest`; UNIQUE `(case_id, kind)`. Derived
    62	   state кейса = последний kind по `seq DESC`.
    63	4. **`mission_pool_ledger`** — rolling pool: **монотонный `seq`
    64	   (BIGSERIAL)**; строки immutable и вставляются только уже settled
    65	   (`settled_at` фиксируется при insert, задним числом строки не
    66	   settled-ятся); `source ∈
    67	   seed|revenue_share|partner|subscription_share` (v0 — только seed),
    68	   `amount_cents`, `currency` (CHECK `='EUR'`), `meta`,
    69	   `idempotency_key` UNIQUE. **Правило cursor'а:** `pool_cursor`
    70	   allocation'а = max `ledger.seq` на момент снапшота; `settled
    71	   unallocated eligible pool на cursor` = `sum(ledger.amount при seq ≤
    72	   cursor) − sum(предыдущих allocations)`. Поздние строки получают
    73	   больший `seq` и в прошлый снапшот не входят — immutable
    74	   UNLOCKED-сумма воспроизводима by construction.
    75	5. **`mission_pool_allocations`** — деньги→кейс: `kind ∈
    76	   reserve_guaranteed|gift_additional`, `(case_id,
    77	   contract_version)`, `amount_cents`, `currency` (CHECK `='EUR'`),
    78	   `pool_cursor`, FK на породивший lifecycle event, `receipt`.
    79	   **Финансовая идемпотентность и границы:** UNIQUE idempotency
    80	   identity (`res:{case_id}:{contract_version}` /
    81	   `gift:{case_id}:{contract_version}`); округление
    82	   `unlock_share × cents` — вниз до целых центов; CHECK-и:
    83	   `unlock_share ∈ [0,1]` (в receipt), `guaranteed_cents ≤
    84	   confirmed_need_cents + stretch_cap_cents` (на контракте),
    85	   положительные `amount_cents` в ledger и allocations. Инвариант (в
    86	   транзакции под runtime-lock): `sum(allocations) ≤ sum(settled
    87	   ledger)`. UNLOCKED-снапшот: `gift = min(guaranteed_cents +
    88	   unlock_share(progress) × settled unallocated pool на cursor,
    89	   confirmed_need_cents + stretch_cap_cents)`.
    90	6. **`mission_contributions`** (+ child
    91	   **`mission_contribution_allocations`**) — вклад: `user_id`,
    92	   `source ∈ series|daily`, `amount`, `source_ref`,
    93	   `idempotency_key` UNIQUE: серия — `mc:{run_id}`; дейлик —
    94	   **`mcd:{user_id}:{day}:{quest_id}`, где `day` — player-local
    95	   `DailyQuest.day` (пин точной строки квеста; НЕ utc_date)**;
    96	   `seq` под runtime-lock; receipt в той же транзакции, replay
    97	   byte-identical. Child-allocations (каждая пинит `(case_id,
    98	   contract_version)`): обычно одна строка; при пересечении
    99	   `token_goal` — детерминированно две. **Инвариант
   100	   `sum(child)=amount` — service-level в той же транзакции +
   101	   reconciliation-тест** (обычный SQL CHECK не читает другие строки;
   102	   constraint trigger — опциональное усиление позже).
   103	7. **`mission_fulfillments`** (+ child
   104	   **`mission_fulfillment_allocations`**) — typed transfer receipt
   105	   `mission.fulfillment-receipt.v1`: `(case_id, contract_version)`,
   106	   `amount_cents`, `currency` (CHECK `='EUR'`), `recipient`,
   107	   `transfer_reference`/`transfer_date`, `evidence_digest`, immutable
   108	   content-addressed `artifact_url`. Child-строки связывают receipt с
   109	   **каждой** покрываемой allocation-строкой (обычный перевод
   110	   покрывает две: `reserve_guaranteed` + `gift_additional`). Сервис
   111	   принимает fulfill только при полном покрытии зафиксированного gift
   112	   (`sum(child) = amount_cents = зарезервировано+открыто кейса`);
   113	   `FULFILLED` event пишется атомарно в той же транзакции. Публичное
   114	   «реально передано» проецируется **только** из fulfillment-receipts.
   115	
   116	**Exact contract identity проходит через всю схему:** runtime,
   117	case-events, pool-allocations, contribution-allocations и
   118	fulfillments пинят точную пару `(case_id, contract_version)`
   119	composite-FK **на `mission_case_bindings`** — версия у кейса ровно
   120	одна на весь lifecycle, из каждой строки доказуемо, по какой версии
   121	посчитаны goal и деньги, а расхождение версий между событиями
   122	исключено схемой, не только тестом.
   123	
   124	### State machine и очередь
   125	
   126	`register-contract` → **`ready`** (отдельная CLI-команда: резервирует
   127	гарантию из pool — allocation `reserve_guaranteed` — и пишет
   128	ready-event; кейс встаёт в очередь по `queue_position`) → `activate`
   129	(допустим только при `active_case_id IS NULL`; берёт head очереди
   130	READY) → UNLOCKED (в транзакции пересекающего вклада или CLI
   131	`unlock-cutoff`) **в той же транзакции активирует следующий READY из
   132	очереди**. Правила:
   133	
   134	- Включение `ENABLE_MISSION_CORE` требует **DB-preflight** —
   135	  CLI-команда и startup-проверка, не config-validator (у него нет
   136	  доступа к БД): существует ACTIVE и ≥1 READY-successor.
   137	- Аварийный путь пустой очереди (VISION-совместимый): транзакция
   138	  пересекающего вклада **не коммитится** и возвращает retryable
   139	  **503** — клиентский outbox сохраняет результат и повторит после
   140	  появления READY-кейса. Не 409: существующий result-outbox считает
   141	  409 terminal и удалит запись. `unlock-cutoff` при отсутствующем
   142	  successor отказывает до создания READY-кейса. Операционный
   143	  инвариант — держать очередь непустой; 503-ветка — предохранитель,
   144	  не рабочий режим.
   145	- Предусловие v0 (валидируется при `register-contract`): `token_goal`
   146	  каждого кейса ≥ максимально возможного одиночного вклада (максимум
   147	  серии/дейлика из reward-функций) — пересечение затрагивает максимум
   148	  два кейса, двух child-строк достаточно. Каскадное распределение по N
   149	  кейсам понадобится для крупных collection-наград (Этап 2).
   150	
   151	### Dogfood-изоляция (writers И readers)
   152	
   153	Единый server-owned allowlist `MISSION_DOGFOOD_USER_IDS` применяется:
   154	(а) во врезках `/api/results` и daily-claim — **вклад создаётся только
   155	enrolled-пользователям**, для остальных поведение байт-в-байт прежнее;
   156	(б) в read API; (в) в `/session` отдаётся capability
   157	`mission_dogfood` (образец operator-debug-entry capability) — клиент
   158	монтирует миссию только при `VITE_MISSION_ENABLED && capability`.
   159	
   160	### Врезки и доставка receipt до клиента
   161	
   162	- `POST /api/results` (терминальная серия) и daily-claim: в той же
   163	  транзакции, что RewardLedger, — mission contribution; в ответ
   164	  добавляется **optional блок `mission_contribution`** (receipt: id,
   165	  amount, allocations по кейсам, состояние бара после). Ответ
   166	  фиксируется как обычно; **`_verified_replay_response` восстанавливает
   167	  тот же блок** (replay возвращает committed-байты; у receipts,
   168	  созданных до включения флага, блока нет — это корректно).
   169	- Клиент: `ResultResp → outbox ResultReceipt` расширяется переносом
   170	  `mission_contribution`; церемония вклада в series-win флоу читает
   171	  **только** этот receipt (никакого optimistic). Аналогично для
   172	  daily-ответа.
   173	
   174	### Операторский CLI `python -m app.mission_ops`
   175	
   176	Команды: `register-contract` / `seed-pool` / **`ready`** / `activate` /
   177	`unlock-cutoff` / `fulfill` (typed fulfillment-receipt + evidence
   178	digest + artifact URL). Все dry-run по умолчанию, `--apply` с
   179	обязательными exact-identity аргументами; каждый apply = case-event +
   180	receipt. Отдельный флаг `ENABLE_MISSION_OPS`, HTTP-маршрутов нет;
   181	impact-полномочия не смешиваются с контентными скоупами.
   182	
   183	### Read API
   184	
   185	`ENABLE_MISSION_READ` + capability: `GET /api/mission/case` — текущий
   186	ACTIVE (токен-бар, четыре числа: вклад сообщества / гарантировано /
   187	зарезервировано и открыто / реально передано-из-fulfillments, контракт
   188	в один тап), мой вклад, последний FULFILLED (**с immutable event id для
   189	клиентского watermark**). Ответ — проекция только из receipts.
   190	
   191	### Тесты (PG, обязательные)
   192	
   193	Полный E2E цикл; идемпотентность (`mc:{run_id}`, `mcd:` реплей →
   194	byte-identical); конкуренция под runtime-lock (два вклада добивают
   195	goal — ровно один UNLOCKED, остаток второго — новому ACTIVE);
   196	двух ACTIVE не существует (негативный тест `activate` при занятом
   197	runtime); split-инвариант + reconciliation; pool-инвариант; snapshot
   198	не меняется от поздних settled-строк; fulfillment coverage (transfer =
   199	сумма указанных allocations; чужие allocations → отказ);
   200	**не-enrolled пользователь: `/results`/daily байт-в-байт прежние
   201	(golden), вкладов нет, capability нет**; пустая очередь → 503
   202	retryable, outbox сохраняет и повторяет после появления READY, вклад
   203	не потерян и не задублирован; fulfillment покрывает обе allocation
   204	child-строками, частичное покрытие → отказ без FULFILLED-события;
   205	пин `(case_id, contract_version)` присутствует во всех receipts;
   206	негативный тест расхождения версий (событие/allocation с версией, не
   207	совпадающей с binding → FK-отказ); снапшот воспроизводим из
   208	`ledger.seq ≤ cursor` при любых поздних строках; округление вниз и
   209	границы CHECK-ов; up/down миграции.
   210	
   211	## Клиент (feed-prototype, `VITE_MISSION_ENABLED` + capability)
   212	
   213	- HUD-ретеминг: бейдж пазлов → «лапки»; значение = мой вклад в текущий
   214	  кейс (server-derived). Старый puzzle-баланс уходит с поверхности
   215	  (данные не трогаются). Optimistic ко вкладу не применяется.
   216	- Виджет кейса + экран кейса (четыре числа, контракт, история).
   217	- Церемония вклада в series-win флоу — из `mission_contribution`
   218	  receipt результата (до challenge-пилюли); дейлик-клейм показывает
   219	  лапки из receipt daily-ответа.
   220	- Церемонии UNLOCKED и FULFILLED — по read API; **client watermark по
   221	  immutable event id** (образец island-celebrated-stages): каждая
   222	  церемония показывается один раз, не при каждом входе.
   223	- Прод-сборка не меняется: без capability миссия не монтируется даже
   224	  при включённом VITE-флаге.
   225	
   226	## Операционка (вне кода, owner — оператор)
   227	
   228	Договорённость с локальным приютом; кейс №1 — масштабируемая
   229	потребность (корм), guaranteed ≈ €100 посева; права на фото/видео;
   230	формат мини-отчёта; latest fulfillment date; **кейс №2 доведён до
   231	READY до включения core** (требование preflight).
   232	
   233	## Acceptance Этапа 1 (dogfood)
   234	
   235	Полный реальный цикл: контракт → посев → READY (резервирование) →
   236	ACTIVE → enrolled-оператор играет серии/дейлики, вклады с receipts →
   237	UNLOCKED (snapshot-receipt; кейс №2 ACTIVE) → реальная закупка корма и
   238	передача → FULFILLED с typed transfer receipt и evidence → обе
   239	церемонии показаны один раз (watermark). Все receipts воспроизводимы;
   240	для не-enrolled пользователей не изменилось ничего (проверено golden).
   241	
   242	## Rollback
   243	
   244	Флаги off → поведение платформы прежнее; `mission_*` таблицы остаются
   245	(append-only, ни на что не влияют); миграция down — только вне прода.

exec
/bin/zsh -lc "git show eaa7ca943a1994eab0fa51cafe2cc987d7274c86:VISION.md | nl -ba | grep -E '"'^ *[0-9]+[[:space:]]+#{1,4} '"'; git show eaa7ca943a1994eab0fa51cafe2cc987d7274c86:play-for-good-gap-map-v1.md | nl -ba | grep -E '"'^ *[0-9]+[[:space:]]+#{1,4} '"'" in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 0ms:
     1	# VISION — Play for Good puzzle platform
    16	## Обещание игроку
    35	## Что мы строим
    58	## Для кого первый продукт (гипотеза ICP)
    73	## Основной продуктовый цикл
    86	### Активный кейс (= текущий сезон)
   135	### Вклад
   159	## Во что мы верим (принципы)
   219	## Куда хотим прийти (целевая картина)
   265	## Сезоны, коллекции и личная память
   290	## Проверяемые продуктовые гипотезы
   323	## North Star tree
   343	## Impact-экономика
   345	### Кто платит
   384	### Что видит игрок
   400	### Остальная экономика
   445	## Виральность
   473	## Trust, safety и rights
   475	### Миссионный контур
   499	### Контентный контур
   518	## Лестница продуктового доказательства
   551	## Что мы сознательно НЕ делаем
   587	## Горизонты (июль 2026)
   602	## Как использовать этот документ (для агентов)
     1	# Gap-карта Play for Good — v2 (30.07.2026)
    13	## TL;DR
    30	## 1. Миссионное ядро — строить (backend: `mission_*` namespace)
    89	## 2. Токены участия «лапки» — решено: UX-ретеминг без миграции ledger
   122	## 3. Коллекции — строить server-owned
   146	## 4. Остров → приют — ретемить, UGC-центр заморозить
   192	## 5. Share/campaign — переякорить challenge-рельс
   209	## 6. Подписка/monetization — не строить
   217	## 7. Holdout и телеметрия — строить по готовому образцу
   238	## 8. Фабрика/консоль/деплой — точечные правки
   258	## 9. Не трогать
   266	## 10. Последовательность
   289	## Решения оператора (30.07.2026, включая кросс-ревью Codex)

exec
/bin/zsh -lc "git show eaa7ca943a1994eab0fa51cafe2cc987d7274c86:VISION.md | nl -ba | sed -n '1,220p'; git show eaa7ca943a1994eab0fa51cafe2cc987d7274c86:VISION.md | nl -ba | sed -n '343,518p'; git show eaa7ca943a1994eab0fa51cafe2cc987d7274c86:VISION.md | nl -ba | sed -n '587,616p'" in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 0ms:
     1	# VISION — Play for Good puzzle platform
     2	
     3	Утверждено юзером 30.07.2026 (v3.0: Play for Good — пользовательский
     4	смысл продукта; один активный кейс = сезон; подарок-модель с
     5	гарантированным минимумом, unlock_share и immutable receipts; коллекции
     6	и приют-монумент вместо генеративной меты как центра;
     7	trust/human-true/no-guilt инварианты; протокол решений —
     8	`vision-patch-play-for-good-proposal.md`; v2.7 и более ранние версии —
     9	в git-истории).
    10	Правки — только через юзера.
    11	
    12	Это продуктовый authority и фильтр триажа: агент, получивший
    13	идею/фичу/фидбек, сверяется с этим документом и отвечает «в направлении» или
    14	«мимо».
    15	
    16	## Обещание игроку
    17	
    18	**Твои любимые пазлы теперь ещё и помогают.**
    19	
    20	Play for Good превращает привычное время отдыха в простой коллективный способ
    21	делать реальное добро. Пользователь играет в короткие любимые пазлы, получает
    22	игровые токены участия и вносит их в один текущий кейс помощи животному или
    23	приюту. Платформа гарантирует реальную помощь независимо от активности
    24	игроков; подтверждённая игра сообщества открывает дополнительную помощь из
    25	заранее описанного impact-бюджета.
    26	
    27	Игрок не жертвует собственные деньги, а токен не притворяется деньгами.
    28	Компания финансирует помощь; игрок своим участием двигает текущий кейс,
    29	видит общий прогресс и получает подтверждение результата.
    30	
    31	У доброго дела нет слишком маленького размера: оно либо честно сделано, либо
    32	нет. «Передали 100 кг корма» — законченный результат. Это не повод называть
    33	его «спасением животного», если фактически сделано именно первое.
    34	
    35	## Что мы строим
    36	
    37	Пользовательская поверхность — социальная лента играбельного контента:
    38	пользователь свайпает короткие игровые моменты так же легко, как видео, но
    39	каждый момент можно **играть**. Telegram-first. Автоплей показывает геймплей
    40	до касания; перехват управления происходит незаметно, в том же темпе.
    41	
    42	Над лентой находится миссионный слой:
    43	
    44	1. в каждый момент времени на поверхности один конкретный активный кейс;
    45	2. завершённая серия даёт сундук и токены участия;
    46	3. коллекции дают те же токены и являются более сильным источником вклада;
    47	4. заработанный вклад заметно двигает общий прогресс к token goal;
    48	5. достижение token goal активирует подарок и первую церемонию;
    49	   реальная передача помощи подтверждается evidence и становится второй;
    50	6. результат остаётся в общем приюте-монументе и в личной истории игрока.
    51	
    52	Под лентой — **самоподдерживающийся продакшен**: платформа сама производит,
    53	отбирает и продвигает игровые механики. Человек остаётся источником эталонов
    54	и вкуса; всё остальное — конвейер. Фабрика контента — supply-moat и способ
    55	давать игроку любимые пазлы без голодания ленты, но не пользовательский смысл
    56	продукта.
    57	
    58	## Для кого первый продукт (гипотеза ICP)
    59	
    60	Кор-аудитория пазлового жанра: преимущественно женская, 30+, привычная к
    61	коротким лентам. Telegram — преимущество, потому что эта аудитория уже живёт
    62	в чатах/каналах и вход не требует установки: ссылка открывает играбельный
    63	момент мгновенно.
    64	
    65	Пересечение этой аудитории с Instagram-паттерном потребления и её отклик на
    66	миссию помощи животным — проверяемые гипотезы, не свойства пола или возраста,
    67	объявленные фактом.
    68	
    69	Friend cohort стремимся набирать из этого профиля. Удобная выборка «просто
    70	друзья» доказывает понятность UX, но не спрос — это ограничение фиксируем
    71	честно при чтении её результатов.
    72	
    73	## Основной продуктовый цикл
    74	
    75	`лента → любимая механика → серия → сундук/коллекция → вклад → текущий
    76	сезон-кейс → подарок (UNLOCKED) → подтверждённая передача (FULFILLED) →
    77	память`
    78	
    79	Qualified play = **сыгранная до конца серия** (до сундука). Всё дерево
    80	игровых метрик считается от этого акта.
    81	
    82	Mission contribution = server-owned contribution receipt о зачислении
    83	заработанных токенов участия в текущий публичный кейс. Это не денежный
    84	перевод игрока и не обещание фиксированной денежной стоимости токена.
    85	
    86	### Активный кейс (= текущий сезон)
    87	
    88	- В v1 одновременно активен один публичный кейс, и он же — текущий
    89	  сезон: сезон носит имя своего кейса и несёт его коллекции и кипсейк.
    90	  Кейс — одно животное или одна точно описанная потребность приюта.
    91	- Кейс всегда доступен с основной поверхности и не спрятан за выбором
    92	  между несколькими получателями.
    93	- Жизненный цикл: `READY (потребность проверена, гарантированный
    94	  подарок зарезервирован) → ACTIVE (сезон публичен, сообщество копит
    95	  токены) → UNLOCKED (сумма подарка зафиксирована immutable receipt) →
    96	  FULFILLED (помощь реально передана, evidence опубликован)`. Кейс
    97	  публикуется только из READY: активный кейс всегда уже обеспечен
    98	  деньгами. UNLOCKED наступает либо при достижении token goal, либо по
    99	  опубликованному unlock cutoff с фактическим частичным прогрессом —
   100	  дальше обе ветки одинаковы. После UNLOCKED сразу стартует следующий
   101	  сезон; после FULFILLED предыдущий появляется постоянной точкой в
   102	  приюте.
   103	- Публичный контракт фиксирует: получателя, потребность,
   104	  гарантированный deliverable, допустимые stretch deliverables, правило
   105	  rollover излишков (токенов и денег) следующему сезону, token goal,
   106	  правило pool-снапшота на UNLOCKED (settled unallocated eligible pool
   107	  + cursor), unlock cutoff (момент открытия подарка, если token goal
   108	  не достигнут раньше), latest fulfillment date реальной передачи (без
   109	  тревожного countdown) и ожидаемый вид подтверждения.
   110	- Потребности двух типов: масштабируемая (корм, лекарства, расходники —
   111	  точная денежная цель заранее не объявляется, размер подарка
   112	  определяет количество; якорь честности — receipt передачи) и
   113	  фиксированная (например, операция известной стоимости — денежная цель
   114	  декларируется).
   115	- Недостигнутый token goal не создаёт failure-состояния: по unlock
   116	  cutoff кейс всё равно проходит UNLOCKED с фактическим частичным
   117	  прогрессом — гарантированный подарок плюс открытая прогрессом часть
   118	  допсуммы, церемония позитивна и точна по состоянию: «платформа
   119	  гарантировала и зарезервировала подарок, сообщество открыло ещё X».
   120	  «Передали» звучит только на FULFILLED. Следующий сезон стартует как
   121	  обычно.
   122	- Кейс закрыт (FULFILLED) только после реального выполнения и проверки
   123	  обещанного действия. Заполненный игровой progress bar сам по себе
   124	  кейс не закрывает.
   125	- Темп сезона задаёт token goal — отдельный versioned-параметр, а не
   126	  денежный размер потребности: потребность и длительность сезона
   127	  настраиваются независимо. Для пилота предпочтительны небольшие
   128	  проверяемые потребности, позволяющие быстро пройти полный trust-loop.
   129	
   130	Выбор между параллельными кейсами не входит в v1: он размазывает общий
   131	прогресс и создаёт лишний моральный груз. Голосование за **следующий** кейс —
   132	отложенная гипотеза: оно меняет порядок очереди, а не отказывает кому-то в
   133	помощи.
   134	
   135	### Вклад
   136	
   137	- Вклад автоматический, но переживается как дискретный акт (решение
   138	  оператора 30.07.2026, заменяет прежнюю manual-vs-auto
   139	  pilot-гипотезу): каждая завершённая qualified-серия, дейлик или
   140	  завершение коллекции создаёт server-owned contribution receipt, и
   141	  лапки сразу попадают в текущий ACTIVE-кейс. Личного кошелька,
   142	  ручного «внести» и «неиспользованных токенов» нет.
   143	- Игрок видит отдельную церемонию вклада («ты принёс 20 лапок» — общий
   144	  бар сдвинулся); публичный бар двигается только после server receipt,
   145	  без optimistic-отрисовки. Если результат принят сервером после
   146	  запуска следующего кейса, вклад идёт в текущий ACTIVE-кейс, и
   147	  receipt явно это показывает.
   148	- Вклад, пересекающий token goal, делится детерминированно: часть до
   149	  цели зачисляется текущему кейсу (он проходит UNLOCKED, следующий
   150	  становится ACTIVE), остаток зачисляется новому ACTIVE-кейсу; один
   151	  receipt показывает обе allocation-строки.
   152	- Первый вклад должен быть достижим рано, чтобы миссия была пережита до
   153	  гринда; номиналы источников — versioned config.
   154	- Серии и дейлики дают обычный вклад; завершение коллекции даёт
   155	  существенно больший и отдельную церемонию.
   156	- Пользовательский язык — «твой вклад», «двинуть общее дело», «поиграй с
   157	  нами — это помогает». Не используем «право помочь нужно заслужить».
   158	
   159	## Во что мы верим (принципы)
   160	
   161	1. **Миссия — смысл, игра — любимый ритуал.** Play for Good не прикручивает
   162	   благотворительность сбоку: реальные закрытые кейсы являются продуктовой
   163	   петлёй наряду с поиском любимой механики и возвращением за новой серией.
   164	2. **Сострадание без давления.** Гарантированный минимум не зависит от
   165	   активности. Игра открывает дополнительное добро, а не спасает животное от
   166	   бездействия платформы. Никаких guilt-trip, tragedy porn и тревожных
   167	   сообщений «без тебя не успеем».
   168	3. **Спрос выводится из поведения, а не запрашивается.** Никаких кнопок
   169	   «ещё такого» — сигналом служит сама игра: досмотры, перехваты, серии,
   170	   сундуки, коллекции, вклады и возвраты к текущему кейсу.
   171	4. **Продакшн детерминирован; модели — фоновое R&D.** В пользовательском
   172	   запросе не существует синхронного model-response: всё модельное — это
   173	   отдельный generation job → валидация trusted-компилятором → typed pack →
   174	   уведомление о готовности. LLM никогда не участвуют в gameplay, control,
   175	   выдаче ленты или расчёте миссионного вклада.
   176	5. **Контент попадает к аудитории только после явного решения
   177	   соответствующего человека, привязанного к точной identity.**
   178	
   179	   | Контент | Кто решает | Что именно утверждает | Аудитория |
   180	   |---|---|---|---|
   181	   | First-party серия/скин | оператор-публикатор | exact promotion-binding | вся лента |
   182	   | UGC-рескин | автор-игрок — initial publish exact artifact; оператор — moderation/takedown exact artifact revision | Build + machine playability gate; до первого гостевого показа действуют report/takedown и операторская очередь пост-модерации | все пользователи при live post-moderation контуре (решение оператора 25.07.2026) |
   183	   | Закупочный плеебл | UA-оператор | exact creative + бюджет кампании | внешняя аудитория |
   184	   | Impact-кейс | impact-оператор; партнёр подтверждает потребность и результат, но не получает platform authority | exact case contract, funding, publication и closure evidence | миссионная поверхность |
   185	   | Recall | оператор recall-полномочия | exact entry/runtime/case scope | — |
   186	
   187	   Зелёная метрика — evidence, не authority. Автор-игрок не получает
   188	   публикации в общую ленту; first-party и impact-гейты не ослабляются
   189	   ничем.
   190	6. **Вкус — узкое место, и это нормально.** Инструменты (ревью-очереди,
   191	   visual-proof, мгновенные play-ссылки) существуют, чтобы дешевле кормить
   192	   человеческий вкус, а не чтобы заменить его.
   193	7. **Бесконечность контента = серии + вариации + фабрика + регулярный
   194	   ручной ввод топовых механик с рынка.** Фабрика масштабирует, но не
   195	   заменяет кураторский ввод. Единица потребления — серия, а не одиночный
   196	   уровень (продуктово `1..N` уровней + сундук; пилотный delivery-контракт
   197	   `1..6`; текущий шаблон кампаний обычно 5).
   198	8. **Один factory kernel — много исполнителей.** Общие для всего
   199	   генеративного: identity, формат brief, бюджеты/квоты, provenance,
   200	   интерфейс trusted-компилятора, QA-квитанции и человеческий шлюз.
   201	   Lane-исполнители разные — новый контур подключается к ядру, а не
   202	   изобретает свои правила.
   203	9. **Агенты экономят внимание, не забирают authority.** Команда агентов
   204	   (роли — `AGENT-ROLES.md`) обслуживает аналитику, продакшен, ресерч,
   205	   инфраструктуру и read-only финансовый контроль; каждый
   206	   публикационный, финансовый, impact- и продуктовый акт остаётся за
   207	   человеком.
   208	10. **Trust-loop — часть продукта.** Кейс не заканчивается переводом:
   209	    проверка партнёра → публичный контракт → append-only вклады →
   210	    финансирование → подтверждение выполнения → продолжение истории. Без
   211	    последнего шага петля не закрыта.
   212	11. **Публичная миссия human-true.** Боты могут тестировать только явно
   213	    непубличные тестовые кейсы. Они не влияют на публичные progress bar,
   214	    истории активности, деньги, отчётность или продуктовые метрики.
   215	12. **Добро не оправдывает рекламную нагрузку.** Ad load подчинён
   216	    удержанию и качеству опыта. Нельзя повышать его под лозунгом «больше
   217	    рекламы — больше помощи».
   218	
   219	## Куда хотим прийти (целевая картина)
   220	
   343	## Impact-экономика
   344	
   345	### Кто платит
   346	
   347	- Платформа, а не игрок, является источником денежной помощи.
   348	- Глобального cap помощи нет: `impact pool += X% × eligible net
   349	  revenue` (реклама, подписка, будущие партнёрские поступления;
   350	  буквальное определение eligible net revenue — комиссии платформ,
   351	  налоги, refunds — фиксируется на monetization/legal гейте). X% и
   352	  token goal версионируются и меняются только для будущих сезонов,
   353	  никогда задним числом.
   354	- Каждый кейс получает гарантированный подарок независимо от
   355	  активности: он резервируется из посева/pool до публикации кейса
   356	  (READY). Кейс, который платформа не может гарантировать, не
   357	  публикуется.
   358	- Дополнительная сумма заранее числом не объявляется — объявляется
   359	  правило. При UNLOCKED размер подарка фиксируется immutable receipt:
   360	  `gift = min(guaranteed minimum + unlock_share(token-прогресс) ×
   361	  settled unallocated eligible pool на снапшоте UNLOCKED,
   362	  подтверждённая потребность + stretch)`. Receipt фиксирует
   363	  snapshot/cursor пула; всё, что settled позже cursor'а, достаётся
   364	  следующим кейсам — отдельного «окна выручки сезона» не существует.
   365	  `unlock_share` — опубликованная детерминированная функция прогресса
   366	  к token goal (пропорция или ступени; при достигнутой цели = 100%):
   367	  игра действительно открывает дополнительную помощь, и частичный
   368	  прогресс открывает её частично. Неоткрытая и превышающая потребность
   369	  части остаются в pool и переходят следующему сезону. Считается
   370	  только settled/recognized выручка; поздние корректировки никогда не
   371	  уменьшают открытый подарок — они учитываются в следующих кейсах.
   372	- Излишек сверх подтверждённой потребности идёт в stretch deliverables
   373	  кейса и далее по правилу rollover следующему сезону. Это граница
   374	  потребности конкретного кейса, не cap добра.
   375	- Денежная часть подарка никогда не случайна и не зависит от скрытой
   376	  вероятности (charity-lootbox запрещён). Сюрприз — только неизвестная
   377	  заранее будущая выручка и церемония; формула доступна в один тап.
   378	- Токены не создают глобального курса «токен → деньги».
   379	- На старте гарантированный подарок и первые кейсы могут полностью
   380	  сидироваться основателем. Это не маскируется под вклад рекламной выручки.
   381	- В будущем impact-бюджет может финансироваться партнёром или спонсором, но
   382	  это не даёт ему publication authority и требует той же прозрачности.
   383	
   384	### Что видит игрок
   385	
   386	- Основная поверхность показывает связанные, но разные факты: игровой
   387	  вклад сообщества (токены к token goal), гарантировано платформой,
   388	  зарезервировано и открыто, реально передано. Токен-бар никогда не
   389	  выдаётся за деньги.
   390	- Рядом доступен полный публичный контракт: источник, определение
   391	  eligible revenue, формула, snapshot/cursor пула, гарантированный и
   392	  stretch deliverables, правило rollover, получатель и closure
   393	  evidence.
   394	- Игровой токен не имеет денежного курса, не redeemable и не является
   395	  собственностью, пожертвованием или платёжным инструментом игрока.
   396	- Нельзя обещать причинность, которой нет: если деньги уже гарантированы,
   397	  говорим, что игра двигает общий прогресс и открывает дополнительное, а не
   398	  что без конкретного игрока животное останется без помощи.
   399	
   400	### Остальная экономика
   401	
   402	- **Реклама остаётся основой.** Рекламная единица может быть контентной
   403	  единицей: playable рекламодателя — обычная играбельная карточка ленты плюс
   404	  видео-формат. Продаём CPE, а не показы; append-only телеметрия даёт
   405	  evidence-backed отчёт. Impact-бюджет не является разрешением увеличить
   406	  рекламную частоту.
   407	- **Подписка отменяет рекламу и участвует в миссии двумя контурами.**
   408	  (1) Безусловная раскрытая доля цены каждой ступени подписки поступает
   409	  в impact pool — это единственное благотворительное обещание подписки;
   410	  ad-free игрок не становится менее ценным участником миссии. (2)
   411	  VIP-бонус — чисто игровой перк, возможно в нескольких ступенях:
   412	  каждая ступень добавляет к каждой завершённой qualified-серии
   413	  фиксированную или процентную прибавку токенов (например VIP +10,
   414	  Super VIP +20; или +10% / +25%; «+10 лапок за серию · +10 VIP»).
   415	  Бонус прикрепляется только к завершённым сериям — не к отдельным
   416	  уровням, и без игры подписка токенов не даёт; неиспользованный
   417	  потенциал не несёт семантики «потерянная помощь», потому что деньги
   418	  от игры не зависят никогда. Размеры бонусов, ступени и возможные
   419	  капы — versioned config; включение — отдельная monetization-гипотеза
   420	  после legal review. VIP-бонус двигает общий бар кейса; личный уровень
   421	  и keepsake считаются от базовой игровой активности — без покупки
   422	  морального статуса и без рейтингов платящих.
   423	- **Токены участия («лапки»)** зарабатываются сериями, дейликами и
   424	  коллекциями и автоматически поступают во вклад текущего кейса
   425	  отдельными server-owned contribution receipts; исторический
   426	  puzzle-баланс вкладом не становится. Токены больше не являются
   427	  центральной валютой генерации/кастомизации механик и локаций.
   428	- Токены участия нельзя купить напрямую за деньги/Stars: миссионный
   429	  вклад подтверждает игру и коллекционный прогресс, а не покупку
   430	  добродетели. Подписочный VIP-бонус не является продажей токенов — он
   431	  прикрепляется исключительно к завершённым qualified-сериям и без
   432	  игры ничего не начисляет.
   433	- **Личная прогрессия** питается коллекциями, уровнем участия, keepsakes и
   434	  историей закрытых кейсов, а не обязательной decoration-экономикой.
   435	- Прямые денежные пожертвования игроков не входят в v1 и потребуют отдельного
   436	  продуктового, платёжного и юридического решения.
   437	- Монетизационные тесты включаются не раньше числовых когорт и только явным
   438	  решением оператора. Джокеры, near-miss и вероятность редкости,
   439	  подстраиваемая под платёж, отложены: они конфликтуют с guardrail «без вреда
   440	  игроку» и граничат с loot-box регулированием.
   441	- Attribution закупки и продажи переходов остаётся симметричным
   442	  identity-JOIN-контрактом; production-затраты моделей — квотируемый
   443	  R&D-бюджет.
   444	
   445	## Виральность
   446	
   447	- **Главная виральная единица — campaign-first playable link.** Получатель
   448	  видит текущий кейс и сразу попадает в autoplay → перехват. Позитивная
   449	  рамка: «поиграй с нами — это помогает», а не «от тебя зависит жизнь».
   450	- **Играбельный challenge сохраняется.** Exact identity уровня делает
   451	  соревнование честным; challenge и campaign используют один attribution
   452	  kernel. Ghost-повтор отправителя остаётся отложенной гипотезой.
   453	- **Закрытие кейса — естественный share-момент.** Делимся подтверждённым
   454	  результатом и общей радостью, не тревожным незакрытым сбором.
   455	- **Приют и коллекции — социальная память.** Игрок может показать личную
   456	  витрину и общий масштаб закрытых кейсов.
   457	- **Друзья помогают коллекциям (positive-sum).** Друзья могут ускорять
   458	  закрытие коллекций и усиливать общий вклад; любая коллекция
   459	  закрываема соло — друзья ускоряют, но не являются gate. Направление
   460	  v1 — «Попросить помочь»: ссылка на конкретную карточку, помощь
   461	  засчитывается только за завершённую qualified-серию друга, с капами
   462	  и идемпотентностью. Обязательные social-only коллекции — отдельная
   463	  гипотеза после наблюдения реального sharing.
   464	- **Рефералка — TG-native и evidence-bound.** Награда возможна только за
   465	  qualified-активность приведённого, не за клик/рассылку.
   466	- **Guardrails.** Шаринг только по явному действию; никаких наград за
   467	  массовую рассылку и сообщений, эксплуатирующих страх, вину или срочность.
   468	- **Метрики.** K-factor, acceptance, qualified activity и share закрытых
   469	  кейсов считаются отдельно; friend cohort даёт directional-сигнал, причинный
   470	  эффект требует достаточной когорты/holdout. Закупка, рефералка, challenge и
   471	  campaign-first share используют один identity-JOIN kernel.
   472	
   473	## Trust, safety и rights
   474	
   475	### Миссионный контур
   476	
   477	- **Операционный контур помощи — функция продукта.** Верификация приюта и
   478	  потребности, договорённость, funding, передача, документы, права на
   479	  историю/медиа и follow-up имеют владельца, очередь и наблюдаемый SLA.
   480	- **Append-only evidence.** Case contract, изменения, игровые вклады,
   481	  funding, payout и closure receipts сохраняются как воспроизводимые факты.
   482	  Исправление не переписывает историю молча.
   483	- **Точность заявления.** Публичное описание равно подтверждаемому действию:
   484	  корм — это корм, вакцинация — вакцинация, операция — операция.
   485	- **Достоинство без tragedy porn.** Используем конкретное имя и историю, но
   486	  не максимизируем distress, не драматизируем страдание и не превращаем
   487	  срочность в retention-механику.
   488	- **Human-true production.** Публичный вклад и публичная активность могут
   489	  исходить только от реального пользователя. Бот-тесты живут в отдельном
   490	  непубличном case scope и исключены из денег, проекций и метрик.
   491	- **Юридическая граница.** Модель «компания платит» не объявляется
   492	  автоматическим освобождением от требований к коммерческим благотворительным
   493	  партнёрствам, рекламе, отчётности, налогам, данным и медиа. Перед публичным
   494	  запуском проводится review по целевым юрисдикциям. Транзакционное
   495	  обещание («доля цены подписки идёт в impact pool») допускается только
   496	  точным, финансово обеспеченным, публично раскрытым и прошедшим review
   497	  целевых юрисдикций; скрывать существенное правило нельзя.
   498	
   499	### Контентный контур
   500	
   501	- **UGC-модерация — staged post-moderation (решение оператора
   502	  24.07.2026).** Автор может опубликовать exact UGC-артефакт после машинного
   503	  гейта проходимости. Этот гейт доказывает только техническую играбельность,
   504	  не безопасность содержания. До первого показа гостю обязательны:
   505	  report/block, мгновенный takedown по exact artifact revision,
   506	  операторская очередь новых публикаций с наблюдаемым review SLA и
   507	  отзываемая доставка артефакта.
   508	- Аудитория UGC расширена до всех пользователей явным решением оператора
   509	  25.07.2026; защитный контур этого решения остаётся обязательным, даже
   510	  когда UGC больше не является центром меты. Автоматизация moderation —
   511	  отдельное явное решение с fraud/abuse и safety evidence.
   512	- **Report/takedown** обязателен до любого расширения аудитории UGC.
   513	- **IP/бренды в промптах**: политика сознательно отложена; до решения — не
   514	  блокируем и не рекламируем; вопрос открыт.
   515	- **Anti-abuse:** игровые и миссионные награды выводятся из server-owned
   516	  evidence и фиксированных пулов, а не caller-authored событий.
   517	
   518	## Лестница продуктового доказательства
   587	## Горизонты (июль 2026)
   588	
   589	- **Сейчас:** friend cohort и подготовка минимального mission-slice: один
   590	  локальный shelter-партнёр, один небольшой сидированный кейс, публичный
   591	  контракт, вклад, реальное закрытие и evidence. Параллельно завершаются уже
   592	  взятые обязательства базовой ленты.
   593	- **Следом:** сезон/коллекции как миссионное топливо (server-owned
   594	  коллекции — предпосылка соц-помощи и токенов из коллекций); shelter
   595	  surface v1 (текущий кейс + общий архив + личная витрина); когорта
   596	  30–50 и holdout; campaign-first share/deep-link; «Попросить помочь».
   597	- **Дальше:** расширенная карта приюта; голосование за следующий
   598	  сезон-кейс как отдельная гипотеза; географические сезоны; sponsored
   599	  impact-бюджеты; mechanic-matched acquisition; Phase B только после
   600	  соответствующих гейтов.
   601	
   602	## Как использовать этот документ (для агентов)
   603	
   604	При триаже идеи ответь на пять вопросов:
   605	
   606	1. Усиливает ли она обещание «любимые пазлы теперь ещё и помогают»?
   607	2. Как она влияет на основной цикл от qualified play до подтверждённого
   608	   закрытия кейса?
   609	3. Не превращает ли она сострадание в давление, токен — в ложные деньги, а
   610	   рекламу — в моральную обязанность?
   611	4. В какой уровень лестницы доказательства и горизонт она попадает?
   612	5. Требует ли она человеческого вкуса, impact-, publication- или financial
   613	   authority — и где записан этот гейт?
   614	
   615	Нарушение trust/human-true/no-guilt инвариантов, раздела «НЕ делаем» или
   616	моратория — повод отклонить без эскалации.

exec
/bin/zsh -lc "git show eaa7ca943a1994eab0fa51cafe2cc987d7274c86:VISION.md | nl -ba | sed -n '219,399p'; git show eaa7ca943a1994eab0fa51cafe2cc987d7274c86:VISION.md | nl -ba | sed -n '518,586p'" in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 0ms:
   219	## Куда хотим прийти (целевая картина)
   220	
   221	- **Ежедневный Play for Good-ритуал.** Игрок приходит за любимыми пазлами,
   222	  видит один понятный кейс, регулярно вносит заработанный вклад и возвращается
   223	  увидеть его реальное завершение.
   224	- **Сезоны добра.** Сезон = кейс: у каждого сезона имя и история его
   225	  животного, свои коллекции и кипсейк. Сезоны идут встык — UNLOCKED
   226	  предыдущего открывает следующий. Это нарративная дуга, а не deadline
   227	  для помощи. Позднее возможны географические сезоны (локально
   228	  актуальный кейс для игрока) — не раньше масштабирования
   229	  операционного контура помощи.
   230	- **Приют как общая мета.** Нынешняя идея острова переосмысляется в
   231	  приют-карту: текущий кейс, общий монумент закрытых кейсов и личная витрина
   232	  коллекций/достижений. Это виртуальная карта памяти, а не заявление о
   233	  строительстве реального объекта без соответствующего evidence. Закрытые
   234	  результаты не исчезают с окончанием сезона.
   235	- **Ступень 1 — фабрики от эталона.** Оператор отдаёт эталонную механику.
   236	  Фабрика левел-дизайна и фабрика сеттинга/стиля собирают серии этой
   237	  механики в разных сеттингах. Ночь генерит → утренний пакет → человеческий
   238	  шлюз → каталог → лента. Exit-критерий: серия, собранная фабрикой без
   239	  ручной сборки уровней, регулярно проходит шлюз и живёт в ленте.
   240	- **Ступень 2 — платформа сама находит вариации механик.** Experiment-lane
   241	  предлагает новые вариации; дальше — те же фабрики и тот же шлюз.
   242	  Exit-критерий: вариация, предложенная платформой, прошла шлюз и показала
   243	  qualified plays у реальных игроков.
   244	- **Рост через собственный продакшен.** Каждая механика рождается
   245	  playable-совместимой; platform identity связывает закупочный playable,
   246	  deep-link, первый слот и миссионную кампанию без подмены фактов. Платформа
   247	  встречает игрока той же механикой, из которой он пришёл.
   248	- **Learning loop.** Append-only факты → evidence-отчёты → матрица спроса,
   249	  отвалов и миссионного эффекта → briefs фабрикам и решения impact-оператора.
   250	- **Самодостаточная система.** Платформа предлагает следующие цели из
   251	  VISION, состояния, scoreboard и контекста; оператор утверждает подмножество;
   252	  дорогая модель оркестрирует, дешёвые модели исполняют; author ≠ reviewer;
   253	  evidence возвращается в scoreboard. Агентные роли проходят явную лестницу
   254	  автономии: attended → deterministic cron → supervised LLM → выделенный
   255	  Phase-B host; каждая ступень открывается acceptance-гейтом, а не дрейфом.
   256	- **Экономика.** Закупка окупается удержанием; выручка — реклама, подписка и
   257	  будущие партнёрские impact-бюджеты. Часть экономики финансирует
   258	  гарантированный и дополнительный impact-контур.
   259	
   260	UGC, генерация механик игроками и механики-как-здания больше не являются
   261	центром пользовательской меты. Построенные контуры сохраняют свои safety- и
   262	authority-инварианты, но их дальнейшее расширение должно отдельно доказать,
   263	что оно помогает Play for Good, а не конкурирует с ним за внимание.
   264	
   265	## Сезоны, коллекции и личная память
   266	
   267	- Сезон и кейс — одно целое: один активный сезон-кейс, следующий
   268	  стартует сразу после UNLOCKED предыдущего.
   269	- Коллекции остаются самостоятельной игровой мотивацией и сильным источником
   270	  токенов участия. Их core-loop сохраняется, но reward-семантика
   271	  переякоривается на миссию.
   272	- Завершённая сезонная коллекция даёт заметный вклад и evidence-bearing
   273	  keepsake: память не только о виртуальной редкости, но и о реальных итогах
   274	  сезона.
   275	- Личная витрина показывает собранные коллекции, keepsakes, историю участия и
   276	  уровень. Общая карта показывает совокупный масштаб сделанного.
   277	- Уровень — мера игровой причастности, а не добродетели человека. Не
   278	  строим рейтинги «кто добрее» и не превращаем объём вклада в моральный
   279	  статус. Личный уровень и keepsake считаются от базовой игровой
   280	  активности; подписочный VIP-бонус двигает общий бар кейса и виден
   281	  отдельной строкой, но личный показатель причастности не покупает.
   282	- Завершение сезона мягкое: игрок сохраняет то, что успел сделать, без
   283	  наказания и стыда. Прошлая коллекция уходит в архив и остаётся
   284	  completable (обычные дропы, универсальные фрагменты, помощь друзей);
   285	  позднее завершение обновляет keepsake прошлого сезона. Никакого «не
   286	  успела — потеряла навсегда». Реальная помощь не обрывается из-за
   287	  календаря: FULFILLED-подтверждения пополняют монумент и кипсейки
   288	  задним числом.
   289	
   290	## Проверяемые продуктовые гипотезы
   291	
   292	Первые гипотезы проверяются на friend cohort:
   293	
   294	1. **Autoplay → быстрый первый восторг:** автоплей с незаметным перехватом
   295	   сокращает время до первого qualified play против «нажми чтобы играть».
   296	2. **Серия → возврат:** игрок, прошедший серию, возвращается сам, чтобы
   297	   найти и пройти ещё одну.
   298	3. **Миссия понятна без объяснения:** игрок различает игровой токен, вклад
   299	   платформы и реальную помощь; не считает, что пожертвовал собственные
   300	   деньги или что токен имеет заявленный денежный курс.
   301	4. **Миссия ощущается, а не декларируется:** ранний вклад, видимый прогресс и
   302	   подтверждённое закрытие создают причастность без чувства давления.
   303	
   304	Каузальный эффект миссии на retention и share доказывается не retention
   305	самих вкладчиков: они уже являются self-selected вовлечённой группой.
   306	Доказательство — versioned holdout «миссионный слой против базового
   307	продукта» на достаточной когорте. Friend cohort даёт качественный и
   308	directional-сигнал, но не причинный вывод. Holdout изолирует exposure к
   309	миссионному UX, а не уменьшает уже обещанный животному гарантированный
   310	минимум или меняет публичный funding-контракт. Holdout — delayed:
   311	контрольная группа получает миссионный слой после окна сравнения, никто
   312	не остаётся в продукте без миссии постоянно. Пользователи, пришедшие по
   313	campaign-ссылке конкретного кейса, в holdout не попадают — им уже
   314	обещан миссионный опыт. Causal-вывод требует рассчитанного sample-size
   315	gate от baseline retention и минимального эффекта (возможно, сотни
   316	пользователей и больше).
   317	
   318	Очередь гипотез после: миссионный слой → incremental active days/retention;
   319	закрытие кейса → organic share; сезонные коллекции → возвраты; разнообразие
   320	→ active days; mechanic-match закупка > generic landing; human-good/min
   321	растёт без ухудшения player outcome.
   322	
   323	## North Star tree
   324	
   325	- **Outcome:** incremental удержание qualified-игроков, создаваемое Play for
   326	  Good, относительно holdout. На пилоте до достаточной когорты остаются
   327	  active days и «вернулся за новой серией/текущим кейсом без пинга».
   328	- **Leading gameplay:** time-to-first-qualified-play; сколько механик
   329	  посмотрел до любимой; series completion; возврат за следующей серией.
   330	- **Leading mission:** time-to-first-contribution; доля игроков, увидевших
   331	  реальный progress move; возврат к тому же кейсу; просмотр closure evidence;
   332	  завершение коллекций; campaign-first share.
   333	- **Supply:** свежий eligible runway на любимый сегмент.
   334	- **Impact operations:** case cycle time; доля закрытий с полным evidence;
   335	  payout/reconciliation completeness; partner/closure SLA.
   336	- **Guardrails:** loader/runtime failure rate; content starvation; review
   337	  backlog; cost per human-good; mission comprehension; trust complaints;
   338	  guilt/distress feedback; fraud/bot leakage; ad load.
   339	- **Anti-metrics:** сумма помощи, число выпущенных токенов, ad views,
   340	  retention вкладчиков и заполнение progress bar сами по себе успехом не
   341	  считаются. Все они управляемы платформой или подвержены selection bias.
   342	
   343	## Impact-экономика
   344	
   345	### Кто платит
   346	
   347	- Платформа, а не игрок, является источником денежной помощи.
   348	- Глобального cap помощи нет: `impact pool += X% × eligible net
   349	  revenue` (реклама, подписка, будущие партнёрские поступления;
   350	  буквальное определение eligible net revenue — комиссии платформ,
   351	  налоги, refunds — фиксируется на monetization/legal гейте). X% и
   352	  token goal версионируются и меняются только для будущих сезонов,
   353	  никогда задним числом.
   354	- Каждый кейс получает гарантированный подарок независимо от
   355	  активности: он резервируется из посева/pool до публикации кейса
   356	  (READY). Кейс, который платформа не может гарантировать, не
   357	  публикуется.
   358	- Дополнительная сумма заранее числом не объявляется — объявляется
   359	  правило. При UNLOCKED размер подарка фиксируется immutable receipt:
   360	  `gift = min(guaranteed minimum + unlock_share(token-прогресс) ×
   361	  settled unallocated eligible pool на снапшоте UNLOCKED,
   362	  подтверждённая потребность + stretch)`. Receipt фиксирует
   363	  snapshot/cursor пула; всё, что settled позже cursor'а, достаётся
   364	  следующим кейсам — отдельного «окна выручки сезона» не существует.
   365	  `unlock_share` — опубликованная детерминированная функция прогресса
   366	  к token goal (пропорция или ступени; при достигнутой цели = 100%):
   367	  игра действительно открывает дополнительную помощь, и частичный
   368	  прогресс открывает её частично. Неоткрытая и превышающая потребность
   369	  части остаются в pool и переходят следующему сезону. Считается
   370	  только settled/recognized выручка; поздние корректировки никогда не
   371	  уменьшают открытый подарок — они учитываются в следующих кейсах.
   372	- Излишек сверх подтверждённой потребности идёт в stretch deliverables
   373	  кейса и далее по правилу rollover следующему сезону. Это граница
   374	  потребности конкретного кейса, не cap добра.
   375	- Денежная часть подарка никогда не случайна и не зависит от скрытой
   376	  вероятности (charity-lootbox запрещён). Сюрприз — только неизвестная
   377	  заранее будущая выручка и церемония; формула доступна в один тап.
   378	- Токены не создают глобального курса «токен → деньги».
   379	- На старте гарантированный подарок и первые кейсы могут полностью
   380	  сидироваться основателем. Это не маскируется под вклад рекламной выручки.
   381	- В будущем impact-бюджет может финансироваться партнёром или спонсором, но
   382	  это не даёт ему publication authority и требует той же прозрачности.
   383	
   384	### Что видит игрок
   385	
   386	- Основная поверхность показывает связанные, но разные факты: игровой
   387	  вклад сообщества (токены к token goal), гарантировано платформой,
   388	  зарезервировано и открыто, реально передано. Токен-бар никогда не
   389	  выдаётся за деньги.
   390	- Рядом доступен полный публичный контракт: источник, определение
   391	  eligible revenue, формула, snapshot/cursor пула, гарантированный и
   392	  stretch deliverables, правило rollover, получатель и closure
   393	  evidence.
   394	- Игровой токен не имеет денежного курса, не redeemable и не является
   395	  собственностью, пожертвованием или платёжным инструментом игрока.
   396	- Нельзя обещать причинность, которой нет: если деньги уже гарантированы,
   397	  говорим, что игра двигает общий прогресс и открывает дополнительное, а не
   398	  что без конкретного игрока животное останется без помощи.
   399	
   518	## Лестница продуктового доказательства
   519	
   520	Каждый шаг имеет записанные exit/kill критерии; переход — явное решение
   521	оператора.
   522	
   523	1. **Founder dogfood базовой ленты** — пройдено: полный цикл
   524	   фабрика→шлюз→лента→сундук работает на операторе. Mission-slice сначала
   525	   проходит собственный founder dogfood: один сидированный локальный кейс,
   526	   вклад, закрытие и evidence.
   527	2. **3–10 друзей** (стремимся к профилю ICP). Проверяем понятность ленты и
   528	   миссии, ранний вклад, отсутствие ложного понимания «я пожертвовал деньги»,
   529	   доверие к закрытию и желание вернуться. Exit — «хочется возвращаться»,
   530	   «всё понятно», qualified play у большинства и самостоятельные возвраты за
   531	   новой серией/кейсом без пинга; числовой порог сознательно не фиксируется.
   532	   Kill — устойчивые «непонятно / неинтересно / не верю / чувствую давление»
   533	   после честных итераций. Маленькая когорта не доказывает causal retention
   534	   effect.
   535	3. **30–50 закрытых пользователей.** Включаются числовые пороги, SLA
   536	   контента/impact, D7/active days и versioned holdout миссионного слоя.
   537	   Holdout здесь запускается технически и даёт directional-сигнал;
   538	   causal-доказательство — только при рассчитанном sample-size gate.
   539	4. **Первая mechanic/campaign-matched acquisition cohort.** Identity-JOIN
   540	   встреча, сравнение с generic landing, проверка campaign-first share и
   541	   paid acquisition без guilt framing.
   542	5. **Только затем** расширенная shelter-мета, C2-driven production и Phase B
   543	   autonomy.
   544	
   545	**Мораторий:** до прохождения шага 2 не открываем новые платформенные
   546	контуры. Минимальный mission-slice является новым ядром продукта и заменяет,
   547	а не дополняет прежнее расширение Island/UGC; до causal evidence не строим
   548	полный виртуальный приют и decoration-систему. Любое другое исключение —
   549	только через явный апрув оператора.
   550	
   551	## Что мы сознательно НЕ делаем
   552	
   553	- Не называем токены деньгами, пожертвованиями игрока или валютой с
   554	  подразумеваемым курсом.
   555	- Не продаём миссионные токены и не превращаем денежную покупку в публичный
   556	  показатель доброты.
   557	- Не запускаем несколько параллельных публичных кейсов в v1.
   558	- Не используем guilt-trip, tragedy porn, жёсткий mission-FOMO и
   559	  тревожные сообщения «без тебя не успеем».
   560	- Не строим публичный рейтинг доброты и не приравниваем уровень к моральной
   561	  ценности человека.
   562	- Не повышаем ad load ради impact-метрики.
   563	- Не закрываем кейс игровым progress bar без реального closure evidence и не
   564	  преувеличиваем сделанное.
   565	- Не делаем денежную часть подарка случайной или зависящей от скрытой
   566	  вероятности (charity-lootbox) и не уменьшаем задним числом уже
   567	  открытый подарок.
   568	- Не изображаем виртуальный приют как реально построенный объект, если это не
   569	  подтверждено case evidence.
   570	- Не показываем ботов на публичных миссионных поверхностях.
   571	- Не строим классическую decoration-мету как обязательный sink для токенов.
   572	- Не возвращаем генерацию механик/локаций игроком в центр без отдельного
   573	  доказательства пользы для Play for Good.
   574	- Не строим UI запроса предпочтений контента в ленте; UGC-промпты и
   575	  операторские заказы фабрике остаются отдельными разрешёнными контурами.
   576	- Не пускаем модели в production-runtime и автопубликацию.
   577	- Не делаем внутренние циклы уровней в фид-механиках: лента ведёт, механика
   578	  играет один раунд.
   579	- Не смешиваем evaluation, publication, impact и financial authority.
   580	- Не promote'им QA-артефакты в production по конвенции имени: разные
   581	  полномочия используют разные креды и явные гейты.
   582	- Не оптимизируем метрики, которые нельзя воспроизвести из append-only
   583	  фактов.
   584	- Не даём агентам publication, financial, impact или scheduling authority
   585	  сверх явно выданной server-owned policy.
   586	

exec
/bin/zsh -lc "git show eaa7ca943a1994eab0fa51cafe2cc987d7274c86:play-for-good-gap-map-v1.md | nl -ba | sed -n '1,121p'; git show eaa7ca943a1994eab0fa51cafe2cc987d7274c86:play-for-good-gap-map-v1.md | nl -ba | sed -n '122,216p'; git show eaa7ca943a1994eab0fa51cafe2cc987d7274c86:play-for-good-gap-map-v1.md | nl -ba | sed -n '238,309p'" in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 0ms:
     1	# Gap-карта Play for Good — v2 (30.07.2026)
     2	
     3	Основание: VISION v3.0 (workspace `cbe08ac`) + протокол решений
     4	`vision-patch-play-for-good-proposal.md`. Метод: три параллельные
     5	read-only разведки 30.07.2026 (swipe-backend / feed-prototype /
     6	остальной воркспейс). v2: внесены поправки кросс-ревью Codex (§18 в
     7	`play-for-good-gap-map-codex-research.md`) и решения оператора
     8	30.07.2026 (авто-вклад, полный пакет выключения острова, лапки без
     9	миграции ledger). Формат: по контурам — что есть → что требует
    10	v3.0 → вердикт (**строить / переиспользовать / ретемить / заморозить /
    11	не трогать**).
    12	
    13	## TL;DR
    14	
    15	| Контур | Вердикт |
    16	|---|---|
    17	| Миссионное ядро (кейсы/сезоны/подарки/pool) | **Строить с нуля** — на бэкенде 0 совпадений по season/impact/mission; но все паттерны готовы в island_*/feed_* |
    18	| Токены участия («лапки») | **Решено**: UX-ретеминг puzzles→лапки БЕЗ миграции старого ledger; вклад — новые human-true contribution receipts |
    19	| Вклад | **Решено: автоматический** — server-owned receipt за серию/дейлик/коллекцию, без кошелька/spend и без optimistic UI; церемония дискретна |
    20	| Коллекции | **Строить server-owned** — клиент чисто презентационный, сервер: 0 таблиц |
    21	| Остров → приют | **Ретемить с крупным реюзом**; UGC-центр — заморозить |
    22	| Share/campaign | **Переякорить** готовый challenge-рельс |
    23	| Holdout/телеметрия | **Строить по образцу** `feed_policy_assignments` |
    24	| Подписка/monetization | **Ничего не делать** до monetization-гейта |
    25	| Фабрика/консоль/деплой | **Точечные правки**, ядро не трогается |
    26	| Legacy (p4g-platform, play4good, liveops-shared, platform-bot) | **Не трогать** |
    27	
    28	---
    29	
    30	## 1. Миссионное ядро — строить (backend: `mission_*` namespace)
    31	
    32	Сейчас: `grep season|impact|mission|donation` по `swipe-backend/app/` —
    33	0 совпадений. Есть два per-user ledger'а (`reward_ledger` stars,
    34	`puzzle_ledger` puzzles), пула нет.
    35	
    36	Строить, с прямыми образцами из существующего кода:
    37	
    38	- **Контракт кейса** — immutable versioned документ с digest; образец:
    39	  `feed_policy_config_versions` (composite PK kind/version, digest-CHECK,
    40	  жёсткая связка kind↔schema, composite-FK «пин» из потребителей).
    41	- **Lifecycle READY→ACTIVE→UNLOCKED→FULFILLED** — append-only журнал
    42	  переходов + derived state по `seq DESC`; образец:
    43	  `island_moderation_actions` (commit-order truth, никакого мутабельного
    44	  статуса).
    45	- **Журнал вкладов** — `seq` из sequence под row-lock кейса + immutable
    46	  terminal receipt в той же транзакции (byte-identical replay); образец:
    47	  пара `island_completion_claims` + `island_completion_outcomes`
    48	  (docstring контракта в `app/api_island_social_core.py:1-10`).
    49	- **Impact pool ledger** — новый append-only журнал rolling-пула
    50	  (источники: seed / revenue_share / partner / subscription_share) +
    51	  receipt резервирования гарантированного подарка при READY;
    52	  UNLOCKED-receipt фиксирует снапшот пула:
    53	  `gift = min(guaranteed + unlock_share(progress) × settled unallocated
    54	  eligible pool at UNLOCKED snapshot, need + stretch)` — receipt хранит
    55	  snapshot/cursor, всё settled позже cursor'а достаётся следующим
    56	  кейсам; отдельного «окна сезона» нет; излишки остаются в pool.
    57	  Писать идемпотентными writer'ами по паттерну
    58	  `award_stars_with_status` (`ON CONFLICT DO NOTHING RETURNING`).
    59	- **Evidence FULFILLED** — фото/видео/мини-отчёт; образец хранения:
    60	  `mobile_review_artifacts` (CAS по digest), но потребуется расширение
    61	  типов (сейчас только text/html, ≤4 MiB) или R2-паттерн из island P5.
    62	- **Внешние эффекты/уведомления** («случилось хорошее», выплаты) —
    63	  outbox+attempts; образец: `island_notification_outbox` +
    64	  `island_notification_attempts` (lease, dedup_key, quiet hours).
    65	- **Флаги**: `ENABLE_MISSION_*` default-off, гейтят монтирование
    66	  роутеров + cross-flag валидатор в `config.py` (существующая
    67	  дисциплина).
    68	
    69	**Операторский контур кейса** (публикация/закрытие кейса = human
    70	authority): реюз целиком существующего паттерна — `catalog_lab_auth`
    71	(grant/scope), `mobile_review_bundles/decisions/consumptions`
    72	(server-derived actor, explicit TMA Approve) и
    73	`catalog_operator_promotion` (CLI dry-run-first, CAS + append-only
    74	state log + intervention receipt). Важно: переиспользуется **паттерн**,
    75	а не журнал полномочий — impact-полномочия живут в отдельных scopes и
    76	отдельных `mission_review_*` таблицах, контентный `action_kind` не
    77	расширяется (evaluation / publication / impact / financial authority не
    78	смешиваются — инвариант VISION).
    79	Authority-таблица VISION уже содержит строку «Impact-кейс».
    80	
    81	**Клиент**: поверхности нет вообще. Строить: виджет текущего кейса
    82	(токен-бар к token goal + 4 числа: вклад сообщества / гарантировано /
    83	зарезервировано+открыто / передано), церемония вклада, церемонии
    84	UNLOCKED и FULFILLED. Точки врезки в `feed-prototype/src/feed.ts`:
    85	series-win экран (`showSeriesWinScreen` :4937) и стек CTA после сундука
    86	(сейчас: island-visit-award ИЛИ challenge-пилюля — стек надо
    87	пересобрать с вклад-церемонией).
    88	
    89	## 2. Токены участия «лапки» — решено: UX-ретеминг без миграции ledger
    90	
    91	Сейчас на клиенте три понятия: **stars** (level-ring, server-auth),
    92	**puzzles** (реальная мета-валюта: HUD-бейдж, optimistic+rollback,
    93	`PuzzleLedger`, дейлики платят puzzles), и два мёртвых `tokens`
    94	(зеркало puzzles в острове; мок `metaTokens`).
    95	
    96	Решения (оператор + кросс-ревью, 30.07.2026):
    97	
    98	- **В UX лапки заменяют puzzles.** Переиспользуются иконки, анимации,
    99	  детерминированные reward-функции (`app/rewards.py` /
   100	  `src/rewards.mjs`) и result-интеграция.
   101	- **Исторический `PuzzleLedger` НЕ конвертируется во вклад**: баланс
   102	  загрязнён starter grant 120, старыми daily-наградами, island
   103	  gifts/collect и bot-derived начислениями — он не human-true. Новые
   104	  лапки пишутся отдельными contribution receipts в mission-домене;
   105	  старый puzzle-баланс благотворительным вкладом не становится.
   106	- **Вклад автоматический**: серия / дейлик / завершение коллекции
   107	  создаёт server-owned contribution receipt, лапки сразу попадают в
   108	  текущий ACTIVE-кейс. Личного кошелька, spend-акта и «неиспользованных
   109	  токенов» нет; HUD показывает вклад, а не баланс. Публичный бар
   110	  двигается только после server receipt — optimistic-контур puzzles ко
   111	  вкладу не применяется. Церемония остаётся дискретной: «ты принёс 20
   112	  лапок» → бар сдвинулся. Если результат принят сервером после запуска
   113	  следующего кейса — вклад идёт в новый ACTIVE, и receipt явно это
   114	  показывает. Вклад, пересекающий token goal, делится детерминированно:
   115	  до цели — текущему кейсу (он проходит UNLOCKED), остаток — новому
   116	  ACTIVE; один receipt с двумя allocation-строками. Источник вклада —
   117	  «завершённая qualified-серия» (не отдельный уровень), дейлик,
   118	  завершение коллекции.
   119	- **Дейлики — источник вклада** (решение оператора); веса источников —
   120	  versioned config.
   121	
   122	## 3. Коллекции — строить server-owned
   123	
   124	Сейчас: клиент `src/collections.ts` — один хардкод-набор
   125	(«Золотые хиты», 10 карт), дроп карточек из сундука «presentation-only»
   126	(1–3 карты всегда, прогресс НЕ меняется — комментарий в
   127	`feed.ts:4834`), прогресс в localStorage с демо-предзаполнением; фид
   128	прогресс никогда не пишет. Backend: **0 таблиц, 0 endpoints**.
   129	
   130	Строить:
   131	- Server-owned инвентарь/прогресс + дроп как server-derived receipt
   132	  (детерминированно от run_id, тем же паттерном, что rewards);
   133	  клиентский дроп из сундука перестаёт быть косметикой.
   134	- Сезонная привязка коллекции (коллекция сезона-кейса), архив +
   135	  дозакрытие, универсальные фрагменты.
   136	- Токены за завершение коллекции («заметно больший вклад» + малая
   137	  церемония).
   138	- «Попросить помочь»: ссылка сезон+карточка+отправитель → qualified
   139	  серия друга → receipt: фрагмент владельцу, токены помощнику. Реюз:
   140	  `island_friend_codes`/`island_friendships` (соц-граф уже есть,
   141	  включая `source='challenge'`), deep-link паттерн challenge.
   142	- Контент-пайплайн карточек сезона: первую коллекцию собираем руками
   143	  (как и drop-config), НЕ ставя её в зависимость от setting factory;
   144	  фабричная тематизация — позже, отдельным шагом.
   145	
   146	## 4. Остров → приют — ретемить, UGC-центр заморозить
   147	
   148	Реюз (backend): `island_states` (CAS-снапшот) как образец состояния
   149	карты приюта; social-проекции и журналы; notification outbox; соц-граф
   150	друзей; advisory-lock паттерны. Клиент: `island.ts` (4279 строк) —
   151	SVG-карта, церемонии апгрейда, полёты — годится как каркас
   152	приют-поверхности (карта: текущий кейс + монумент FULFILLED + личная
   153	витрина с коллекциями/кипсейками).
   154	
   155	Заморозить (уходит из центра, код остаётся за флагами):
   156	- UGC-генерация в острове: `bakeAndHost`, `generatePackage`,
   157	  `runExperiment`, `publishExperiment` (island.ts), `island_bake_jobs`,
   158	  `island_theme_jobs`, swipe-ugc воркер — расширение только после
   159	  отдельного доказательства пользы для PFG (VISION).
   160	- Механики-как-здания и рост от чужих плеев; гостевые визиты и
   161	  visit-award карточка после сундука (`island_visit_awards`) —
   162	  отложены до gap-анализа приюта v2.
   163	- **Боты**: bot scheduler (`app/island_bots.py`) — human-true инвариант
   164	  запрещает бот-факты на миссионных поверхностях. Приютские поверхности
   165	  строятся без бот-источников с первого дня; legacy-остров выключается
   166	  полным пакетом Этапа 0 (см. ниже).
   167	- «Кто-то сыграл» поллинг (`pollIslandActivity`, feed.ts:4616) →
   168	  перенастроить на миссионные факты («кто-то внёс», «случилось
   169	  хорошее» после FULFILLED).
   170	
   171	Namespace-решение: **новый `mission_*` рядом, island_* не мигрируем и
   172	не делаем authority приюта** — переиспользуются паттерны и визуальные
   173	компоненты, не семантика данных.
   174	
   175	**Пакет полного выключения острова (Этап 0; решение оператора
   176	30.07.2026, состав дополнен кросс-ревью):** четырёх `ENABLE_ISLAND_*`
   177	флагов недостаточно — в `swipe-backend/app/main.py:193+` безусловно
   178	монтируются `island_state_router`, старые public/visit/like routes,
   179	theme- и bake-generation, а `ISLAND_REWARDS_ENABLED` имеет default
   180	**true**. Полный пакет:
   181	1) выпустить клиент без island/visit/notification-флагов;
   182	2) `ENABLE_ISLAND_SOCIAL/BOTS/VISIT_AWARDS/NOTIFICATIONS = false`;
   183	3) явно выставить `ISLAND_REWARDS_ENABLED = false`;
   184	4) добавить верхнеуровневый gate для state/public/theme/bake routes —
   185	   иначе кэшированный клиент или прямой запрос продолжит ходить в API
   186	   и создавать model/storage cost;
   187	5) данные не удалять.
   188	`ENABLE_ISLAND_CLOSED_DELIVERY` **остаётся включённым** вместе с
   189	moderation/recall — это защитный read-path уже опубликованных
   190	private-UGC артефактов, не engagement-механика.
   191	
   192	## 5. Share/campaign — переякорить challenge-рельс
   193	
   194	Есть и работает: challenge v1 бэкенд (specs/bindings/events/receipts,
   195	`mini_app_deep_link`, share_url), клиентская пилюля на series-win,
   196	`ENABLE_CHALLENGE_V1` off в проде; вход игрока — `swipe-bot`
   197	(startapp).
   198	
   199	Строить/менять:
   200	- Campaign-ссылка текущего кейса — тот же server-issued deep-link
   201	  паттерн; приём startapp-параметра кейса в `main.ts` (рядом с
   202	  `i_`/`f_`/uuid-challenge).
   203	- Пометка campaign-привлечённых юзеров (для исключения из holdout) —
   204	  на моменте первой сессии.
   205	- CTA-стек series-win пересобрать: вклад-церемония (главная) →
   206	  campaign share → challenge (вторичен).
   207	- «Попросить помочь» — третий линк-тип (см. §3).
   208	
   209	## 6. Подписка/monetization — не строить
   210	
   211	Кода подписки нет нигде (ни флага, ни таблицы). По VISION — включение
   212	не раньше числовых когорт, после legal review. Единственное требование
   213	сейчас: impact pool ledger проектировать с полем источника
   214	(seed | revenue_share | partner | subscription_share), чтобы позже не
   215	мигрировать.
   216	
   238	## 8. Фабрика/консоль/деплой — точечные правки
   239	
   240	- **swipe-generator** (фабрика + Lab-консоль): ядро не трогается.
   241	  Позже: сезонная тематизация брифов (`night.series-brief.v1`,
   242	  setting-фабрика под тему кейса), возможный Lab-экран кейсов. TMA
   243	  publish-паттерн (`catalog.promotion-binding`, Approve только в
   244	  Telegram) — реюз для кейсов, см. §1.
   245	- **platform-scheme**: правило репо — после правки VISION.md
   246	  пересобрать и переопубликовать схему (build.mjs вшивает VISION с
   247	  провенансом). **Немедленный долг после `cbe08ac`.**
   248	  `hypotheses.json` (asOf 2026-07-28) — обновить под миссионные
   249	  гипотезы.
   250	- **Корневые доки**: CLAUDE.md — добавить durable-строку о пивоте и
   251	  миссионном контуре (после первых миграций); AGENTS.md — карта нового
   252	  контура; AGENT-ROLES.md — impact-authority уже в VISION.
   253	- **swipe-bot** — точка входа campaign-ссылок (см. §5);
   254	  playables/деплой-контур не затрагивается.
   255	- Мок `?metaworld=1` (Creator District, `metaTokens`) — мёртвый
   256	  прототип, кандидат на удаление при ретеминге бара (вопрос №4).
   257	
   258	## 9. Не трогать
   259	
   260	feed_* shadow/effectful/sequencing контур (≈50 таблиц — ортогонален),
   261	каталожный контур и его гейты (`levelSeries=false` неизменен), legacy:
   262	`p4g-platform`, `play4good`, `play4good_test`, `liveops-shared`,
   263	`platform-bot`, `solitaire-core`/`mahjong-core`/прочие старые пакеты,
   264	`playables-feed-deploy` (stale worktree).
   265	
   266	## 10. Последовательность
   267	
   268	- **Этап 0 (сейчас):** VISION v3.0.1 зафиксирован (`96df90a`:
   269	  авто-вклад, rolling pool); осталось: пересборка platform-scheme;
   270	  полный пакет выключения legacy-острова (§4); durable-запись в
   271	  CLAUDE.md.
   272	- **Этап 1 — Mission-slice v0 (founder dogfood):** backend `mission_*`
   273	  ядро (контракт кейса + посев/резервирование + журнал вкладов +
   274	  UNLOCKED receipt + ручное FULFILLED evidence через операторский
   275	  паттерн), минимальная клиентская поверхность кейса + вклад-церемония;
   276	  всё default-off; реальный маленький кейс с локальным приютом.
   277	  Параллельно (вне кода): договорённость с приютом, права на медиа,
   278	  формат отчёта.
   279	- **Этап 2 — server-owned коллекции:** инвентарь, server-derived дропы,
   280	  сезонная привязка, токены за завершение.
   281	- **Этап 3 — приют v1:** карта (кейс + монумент + витрина) за вкладкой
   282	  «мета» вместо острова.
   283	- **Этап 4 — campaign share + «Попросить помочь».**
   284	- **Этап 5 — holdout-инфра** (перед когортой 30–50).
   285	
   286	Каждый этап — по существующей культуре: default-off флаги, append-only
   287	receipts, dry-run CLI, author≠reviewer, операторские гейты.
   288	
   289	## Решения оператора (30.07.2026, включая кросс-ревью Codex)
   290	
   291	1. **Валюта вклада: puzzles → «лапки» в UX, без миграции ledger** —
   292	   исторический puzzle-баланс вкладом не становится; новые лапки =
   293	   отдельные contribution receipts (§2).
   294	2. **Вклад — автоматический**: server-owned receipt за завершённую
   295	   qualified-серию / дейлик / коллекцию, без личного кошелька и
   296	   spend-акта, без optimistic UI; церемония дискретна. Зафиксировано в
   297	   VISION v3.0.1 (`96df90a`).
   298	3. **Legacy-остров выключить сейчас полным пакетом** (см. §4:
   299	   +`ISLAND_REWARDS_ENABLED=false`, +верхнеуровневый gate безусловно
   300	   смонтированных routes; closed delivery + moderation/recall остаются
   301	   включёнными; данные не удаляются).
   302	4. **Дейлики — источник вклада: да**; веса — versioned config.
   303	5. **`?metaworld=1`** — подтверждено: удалить при ретеминге бара
   304	   (Этап 3).
   305	6. **Параметры карточных дропов и первая коллекция** — руками в
   306	   versioned config, без зависимости от setting factory.
   307	
   308	Следующий шаг: ТЗ Этапа 1 (mission-slice v0) + пакет выключения
   309	острова (Этап 0).

exec
/bin/zsh -lc 'git show eaa7ca943a1994eab0fa51cafe2cc987d7274c86:play-for-good-tz-review-r3-disposition.md | nl -ba; git show eaa7ca943a1994eab0fa51cafe2cc987d7274c86''^:play-for-good-tz-review-r3-raw.md >/dev/null 2>&1 || true; git show eaa7ca943a1994eab0fa51cafe2cc987d7274c86:play-for-good-tz-review-r3-raw.md | grep -n -E '"'\\[P[123]\\]|GO' | tail -40" in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 0ms:
     1	# Disposition R3 (автономная петля codex exec, 30.07.2026)
     2	
     3	Раунд: R3, первый автономный (bundled codex-cli 0.146.0-alpha.3.1,
     4	`codex exec -s read-only`, промпт пинит SHA `4738103`; попытка
     5	`codex review --commit <sha> - < prompt` отклонена CLI — в этой версии
     6	`--commit` взаимоисключён с кастомным промптом; отклонение от
     7	предложенного протокола зафиксировано). Сырой ответ целиком:
     8	`play-for-good-tz-review-r3-raw.md` (финальный вердикт — в конце).
     9	
    10	| # | Finding | Disposition |
    11	|---|---------|-------------|
    12	| 1 | [P1] artifact-url отнесён к legacy, хотя это closed-delivery resolver (`api_island_social.py:159`); LEGACY_SURFACE=false требовал бы 404 при smoke, требующем signed GET | **Принято.** Контур (b) теперь явно включает artifact-url; факт-состояние и smoke исправлены (Stage 0 v4) |
    13	| 2 | [P1] Потерян пользовательский block: report сохранён, `/island/friends/{user_id}/block` — нет; `island_friend_blocks` во freeze без allowlist | **Принято.** Контур (c) = report И block; `island_friend_blocks` выведен из freeze-списка в allowlist защитных writes с audit-receipts (Stage 0 v4) |
    14	| 3 | [P1] UNIQUE(case_id, kind) допускает READY на v1 / UNLOCKED на v3 — версия не закреплена вдоль цепочки | **Принято.** Новая `mission_case_bindings` (case_id PK ↔ ровно одна contract_version, создаётся при ready, новая версия = новый case_id); все таблицы composite-FK на bindings — расхождение исключено схемой; негативный тест добавлен (Stage 1 v4) |
    15	| 4 | [P2] `pool_cursor` невоспроизводим: у ledger нет монотонного порядка и правила eligible-at-cursor | **Принято.** `ledger.seq` BIGSERIAL, строки immutable и вставляются только settled; cursor = max seq на снапшоте; eligible = seq ≤ cursor; поздние строки в прошлый снапшот не входят by construction (Stage 1 v4) |
    16	
    17	Authority-эскалаций нет: ни одна находка не требует правок VISION,
    18	прод-флагов или денег. Следующий раунд R4 — той же петлёй по новому
    19	коммиту.
39:Формат ответа: findings списком с [P1]/[P2]/[P3] и точными
40:файлами/строками, либо явный вердикт "GO" первым словом, если блокеров
2252:Формат ответа: findings списком с [P1]/[P2]/[P3] и точными
2253:файлами/строками, либо явный вердикт "GO" первым словом, если блокеров
2486:f378953 review: R5 mobile-review — NO-GO, но sandbox-класс закрыт по конструкции на обоих движках (42 вектора x 4 конфигурации, WebKit проверен); блокеры: prototype_review без доказательства, 750мс обвиняет честный прототип, нет unmount, 503 выбрасывает Approve, фантомы глушат алерты; несущие границы не закреплены (digest-байты, bridge на пути загрузки, frame-src), WebKit отсутствует в CI
2865:- [P1] [play-for-good-stage0-island-off-tz.md:60](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage0-island-off-tz.md:60>) относит `artifact-url` к legacy-контуру, хотя это и есть closed-delivery resolver ([api_island_social.py:159](</Users/gleb/My projects/p4g-platform-workspace/swipe-backend/app/api_island_social.py:159>)). Поэтому `LEGACY_SURFACE=false` требует для него 404, одновременно smoke требует signed GET ([строки 121–123](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage0-island-off-tz.md:121>)). Оба условия невыполнимы; route manifest уже предписан неверной классификацией.
2867:- [P1] В защитном контуре потерян пользовательский block: четыре контура сохраняют report, но не `/island/friends/{user_id}/block` ([строки 58–70](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage0-island-off-tz.md:58>)), а `island_friend_blocks` включён в freeze без allowlist защитных writes ([строки 132–146](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage0-island-off-tz.md:132>)). Это противоречит обязательному `report/block` и требованию сохранять safety-контур после ухода UGC из центра продукта ([VISION.md:501](</Users/gleb/My projects/p4g-platform-workspace/VISION.md:501>)).
2869:- [P1] Exact contract identity добавлена в отдельные строки, но не закреплена для всей lifecycle-цепочки. `UNIQUE (case_id, kind)` допускает `READY` на v1, `ACTIVE` на v2 и `UNLOCKED` на v3 ([строки 49–53](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:49>)); отдельные composite FK этого не запрещают. Заявление на [строках 99–103](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:99>) и тест лишь присутствия пары не обеспечивают совпадение версии между событиями, runtime и финансовыми allocations.
2871:- [P2] Не определён воспроизводимый cursor rolling pool. `mission_pool_ledger` не задаёт монотонный `seq/id`, тогда как allocation хранит `pool_cursor`, формула зависит от него ([строки 54–72](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:54>)), а тест требует неизменности snapshot после поздних settled-строк ([строка 179](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:179>)). Без точного порядка и правила `eligible at cursor` immutable UNLOCKED-сумма не воспроизводима.
2874:- [P1] [play-for-good-stage0-island-off-tz.md:60](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage0-island-off-tz.md:60>) относит `artifact-url` к legacy-контуру, хотя это и есть closed-delivery resolver ([api_island_social.py:159](</Users/gleb/My projects/p4g-platform-workspace/swipe-backend/app/api_island_social.py:159>)). Поэтому `LEGACY_SURFACE=false` требует для него 404, одновременно smoke требует signed GET ([строки 121–123](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage0-island-off-tz.md:121>)). Оба условия невыполнимы; route manifest уже предписан неверной классификацией.
2876:- [P1] В защитном контуре потерян пользовательский block: четыре контура сохраняют report, но не `/island/friends/{user_id}/block` ([строки 58–70](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage0-island-off-tz.md:58>)), а `island_friend_blocks` включён в freeze без allowlist защитных writes ([строки 132–146](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage0-island-off-tz.md:132>)). Это противоречит обязательному `report/block` и требованию сохранять safety-контур после ухода UGC из центра продукта ([VISION.md:501](</Users/gleb/My projects/p4g-platform-workspace/VISION.md:501>)).
2878:- [P1] Exact contract identity добавлена в отдельные строки, но не закреплена для всей lifecycle-цепочки. `UNIQUE (case_id, kind)` допускает `READY` на v1, `ACTIVE` на v2 и `UNLOCKED` на v3 ([строки 49–53](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:49>)); отдельные composite FK этого не запрещают. Заявление на [строках 99–103](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:99>) и тест лишь присутствия пары не обеспечивают совпадение версии между событиями, runtime и финансовыми allocations.
2880:- [P2] Не определён воспроизводимый cursor rolling pool. `mission_pool_ledger` не задаёт монотонный `seq/id`, тогда как allocation хранит `pool_cursor`, формула зависит от него ([строки 54–72](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:54>)), а тест требует неизменности snapshot после поздних settled-строк ([строка 179](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:179>)). Без точного порядка и правила `eligible at cursor` immutable UNLOCKED-сумма не воспроизводима.

exec
/bin/zsh -lc 'git diff eaa7ca943a1994eab0fa51cafe2cc987d7274c86''^ eaa7ca943a1994eab0fa51cafe2cc987d7274c86 -- play-for-good-stage0-island-off-tz.md play-for-good-stage1-mission-slice-tz.md' in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 0ms:
diff --git a/play-for-good-stage0-island-off-tz.md b/play-for-good-stage0-island-off-tz.md
index e517693..b78f695 100644
--- a/play-for-good-stage0-island-off-tz.md
+++ b/play-for-good-stage0-island-off-tz.md
@@ -1,10 +1,10 @@
-# ТЗ Этап 0 — полное выключение legacy-острова (Island-off baseline) — v3
+# ТЗ Этап 0 — полное выключение legacy-острова (Island-off baseline) — v4
 
-Статус: **DRAFT v3 после кросс-ревью R2** (author: Claude; reviewer:
-Codex; R1: разделение роутеров, runners, порядок проверки, manifest;
-R2: staged rollout с pre-set true, quiesce/drain runners,
-freeze-список вместо «ноль writes», точная карта роутеров — все
-внесены). Основание: VISION v3.0.1 (`96df90a`), gap-карта v2 §4.
+Статус: **DRAFT v4 после кросс-ревью R3** (author: Claude; reviewer:
+Codex; R1–R2 внесены ранее; R3: artifact-url переклассифицирован в
+closed-delivery контур (b); user block добавлен в защитный контур (c),
+`island_friend_blocks` выведен из freeze-списка в allowlist).
+Основание: VISION v3.0.1 (`96df90a`), gap-карта v2 §4.
 
 Цель: обратимо вывести legacy-остров из прода целиком — клиентскую
 поверхность, backend-writers и генерационные runners — сохранив
@@ -26,7 +26,9 @@ env-flip или откатом билда; closed delivery, public report, мо
 `if settings.enable_island_social:`** (:195–200) и авторизуется
 server-side allowlist'ом `ISLAND_MODERATOR_IDS` (не Lab auth);
 `island_router` из `api_island.py` — **theme/bake generation**;
-`api_island_social.py` — **artifact-url, public, visits, likes**;
+`api_island_social.py` — public, visits, likes, user-block, и
+**artifact-url (:159), который является closed-delivery resolver'ом,
+а НЕ legacy-поверхностью**;
 `start_bake_runner()` / `start_theme_runner()` вызываются безусловно в
 `lifespan` (:76–77). Поэтому простое `ENABLE_ISLAND_SOCIAL=false`
 одновременно убило бы модерацию и не остановило бы ни legacy-роуты,
@@ -57,11 +59,15 @@ pre-set компенсирующих флагов):
    island-маршрутов с файлом-источником и целевым контуром.
 1. **Разделить роутеры на четыре независимых контура** (по
    manifest'у):
-   a) legacy: state (`api_island_state`), public/visits/likes/
-      artifact-url (`api_island_social`), theme/bake generation
-      (`api_island`);
-   b) closed-delivery resolver;
-   c) public report (кнопка репорта — защитный контур);
+   a) legacy: state (`api_island_state`), public/visits/likes
+      (`api_island_social` БЕЗ artifact-url и block), theme/bake
+      generation (`api_island`);
+   b) closed-delivery resolver — **включая artifact-url endpoint
+      (`api_island_social.py:159`)**: это выдача signed GET на уже
+      опубликованные артефакты, не legacy;
+   c) защитный пользовательский контур: **public report И user block**
+      (`/island/friends/{user_id}/block`) — VISION требует report/block
+      вместе;
    d) operator moderation/takedown (allowlist `ISLAND_MODERATOR_IDS`).
    Контуры (b), (c), (d) выводятся из-под `ENABLE_ISLAND_SOCIAL` и
    получают собственные гейты: (b) — существующий
@@ -119,8 +125,8 @@ finding: чинится до П4.
    (рестарт; runners больше не стартуют; ничего не оборвано
    посередине — очередь пуста).
 5. **Prod smoke:** curl-набор по route manifest'у → 404; closed
-   delivery выдаёт signed GET на существующий артефакт; report и
-   модерационная консоль работают; в логах нет
+   delivery (artifact-url) выдаёт signed GET на существующий артефакт;
+   report, user block и модерационная консоль работают; в логах нет
    bot/notification/bake/theme runner'ов.
 
 Rollback: обратные env-flip'ы пошагово в обратном порядке; повторное
@@ -136,14 +142,16 @@ catch-up).
    `island_completion_claims`, `island_completion_outcomes`,
    `island_collect_claims`, `island_visit_awards`, `island_bots`,
    `island_bot_daily_plans`, `island_friend_codes`,
-   `island_friendships`, `island_friend_blocks`,
+   `island_friendships`,
    `island_notification_outbox`, `island_notification_attempts`,
    `island_meta_events`, `island_bake_jobs`, `island_theme_jobs`.
    Через ≥24 ч: **ноль новых записей в freeze-списке**. Защитные
-   таблицы (`island_reports`, `island_moderation_actions`) в
-   freeze-список **не входят**: их writes разрешены и проверяются как
-   audit receipts — каждая новая строка соответствует конкретному
-   report/moderation-акту. Manifest — receipt пакета.
+   таблицы (`island_reports`, `island_moderation_actions`,
+   **`island_friend_blocks`** — пользовательский block остаётся живым
+   контуром) в freeze-список **не входят**: их writes разрешены и
+   проверяются как audit receipts — каждая новая строка соответствует
+   конкретному report/block/moderation-акту. Manifest — receipt
+   пакета.
 2. Пересобрать и переопубликовать `platform-scheme` (провенанс VISION
    v3.0.1).
 3. Доки: `IMPLEMENTATION-STATUS.md` (остров выключен: дата, коммиты,
@@ -168,8 +176,8 @@ Acceptance: manifest-проверка чистая; схема опублико
 - Свежий клиент: ноль island-запросов.
 - Backend: контур (a) → 404; bake/theme/bot/notification runners не
   стартуют; queued jobs заморожены (status/attempts без изменений).
-- Closed delivery / public report / модерация / recall — проверены
-  руками, работают.
+- Closed delivery (artifact-url) / public report / user block /
+  модерация / recall — проверены руками, работают.
 - Старый cached-клиент: pre-prod E2E пройден до применения, prod smoke
   после.
 - Rollback записан; минимум один шаг проверен обратным включением вне
diff --git a/play-for-good-stage1-mission-slice-tz.md b/play-for-good-stage1-mission-slice-tz.md
index 3ca0a0f..d97488b 100644
--- a/play-for-good-stage1-mission-slice-tz.md
+++ b/play-for-good-stage1-mission-slice-tz.md
@@ -1,10 +1,10 @@
-# ТЗ Этап 1 — Mission-slice v0 (founder dogfood) — v3
+# ТЗ Этап 1 — Mission-slice v0 (founder dogfood) — v4
 
-Статус: **DRAFT v3 после кросс-ревью R2** (author: Claude; reviewer:
-Codex; R1: dogfood-изоляция, singleton, receipt-доставка, fulfillment,
-инварианты; R2: 503-путь пустой очереди вместо >100%, exact contract
-identity во всей схеме, fulfillment↔N allocations, финансовая
-идемпотентность/округление, предусловие token_goal — все внесены).
+Статус: **DRAFT v4 после кросс-ревью R3** (author: Claude; reviewer:
+Codex; R1–R2 внесены ранее; R3: `mission_case_bindings` — версия
+контракта одна на весь lifecycle by construction; монотонный
+`ledger.seq` + правило `eligible at cursor` для воспроизводимого
+UNLOCKED-снапшота).
 Основание: VISION v3.0.1 (`96df90a`), gap-карта v2 §1–2.
 **Предусловие реализации: чистый Island-off baseline (Этап 0 применён
 и проверен).**
@@ -28,6 +28,15 @@ FULFILLED, мультивалютность (v0 жёстко EUR).
 Все журналы append-only; образцы — island_completion_claims/outcomes,
 island_moderation_actions, feed_policy_config_versions, award_*.
 
+0. **`mission_case_bindings`** — immutable биндинг «кейс ↔ ровно одна
+   версия контракта»: PK `case_id`, `contract_version` (FK на
+   contracts; пара UNIQUE), `bound_at`. Создаётся при `ready` и никогда
+   не меняется: новая версия потребности = **новый case_id** (в
+   культуре «изменение биндинга = новая identity»). Все остальные
+   таблицы ссылаются composite-FK `(case_id, contract_version)` на
+   bindings, а не на contracts напрямую — расхождение версий вдоль
+   lifecycle-цепочки (READY на v1, UNLOCKED на v3) невозможно by
+   construction.
 1. **`mission_case_contracts`** — immutable контракт кейса:
    PK `(case_id, contract_version)`, `contract_digest` (JCS sha256),
    `document` JSONB schema `mission.case-contract.v1`: получатель;
@@ -51,10 +60,18 @@ island_moderation_actions, feed_policy_config_versions, award_*.
    (composite FK), `kind ∈ ready|active|unlocked|fulfilled`,
    `payload`, `receipt_digest`; UNIQUE `(case_id, kind)`. Derived
    state кейса = последний kind по `seq DESC`.
-4. **`mission_pool_ledger`** — rolling pool: `source ∈
+4. **`mission_pool_ledger`** — rolling pool: **монотонный `seq`
+   (BIGSERIAL)**; строки immutable и вставляются только уже settled
+   (`settled_at` фиксируется при insert, задним числом строки не
+   settled-ятся); `source ∈
    seed|revenue_share|partner|subscription_share` (v0 — только seed),
-   `amount_cents`, `currency` (CHECK `='EUR'`), `settled_at`, `meta`,
-   `idempotency_key` UNIQUE.
+   `amount_cents`, `currency` (CHECK `='EUR'`), `meta`,
+   `idempotency_key` UNIQUE. **Правило cursor'а:** `pool_cursor`
+   allocation'а = max `ledger.seq` на момент снапшота; `settled
+   unallocated eligible pool на cursor` = `sum(ledger.amount при seq ≤
+   cursor) − sum(предыдущих allocations)`. Поздние строки получают
+   больший `seq` и в прошлый снапшот не входят — immutable
+   UNLOCKED-сумма воспроизводима by construction.
 5. **`mission_pool_allocations`** — деньги→кейс: `kind ∈
    reserve_guaranteed|gift_additional`, `(case_id,
    contract_version)`, `amount_cents`, `currency` (CHECK `='EUR'`),
@@ -99,8 +116,10 @@ island_moderation_actions, feed_policy_config_versions, award_*.
 **Exact contract identity проходит через всю схему:** runtime,
 case-events, pool-allocations, contribution-allocations и
 fulfillments пинят точную пару `(case_id, contract_version)`
-composite-FK — из каждой строки доказуемо, по какой версии контракта
-посчитаны goal и деньги.
+composite-FK **на `mission_case_bindings`** — версия у кейса ровно
+одна на весь lifecycle, из каждой строки доказуемо, по какой версии
+посчитаны goal и деньги, а расхождение версий между событиями
+исключено схемой, не только тестом.
 
 ### State machine и очередь
 
@@ -184,7 +203,10 @@ retryable, outbox сохраняет и повторяет после появл
 не потерян и не задублирован; fulfillment покрывает обе allocation
 child-строками, частичное покрытие → отказ без FULFILLED-события;
 пин `(case_id, contract_version)` присутствует во всех receipts;
-округление вниз и границы CHECK-ов; up/down миграции.
+негативный тест расхождения версий (событие/allocation с версией, не
+совпадающей с binding → FK-отказ); снапшот воспроизводим из
+`ledger.seq ≤ cursor` при любых поздних строках; округление вниз и
+границы CHECK-ов; up/down миграции.
 
 ## Клиент (feed-prototype, `VITE_MISSION_ENABLED` + capability)
 

exec
/bin/zsh -lc "git ls-tree -r --name-only eaa7ca943a1994eab0fa51cafe2cc987d7274c86 | grep 'play-for-good-tz-review-r[12]'" in /Users/gleb/My projects/p4g-platform-workspace
 exited 1 in 0ms:
codex
Промежуточно: четыре исправления R3 действительно отражены в тексте. Сейчас проверяю, обеспечивают ли новые формулировки заявленные инварианты именно конструкцией схемы — особенно порядок пула при конкурентных транзакциях и неизменность публичного контракта, а не только happy-path.
exec
/bin/zsh -lc "git log --oneline --decorate=short --all -- play-for-good-stage0-island-off-tz.md play-for-good-stage1-mission-slice-tz.md | head -20; git log --oneline --all -- '*play-for-good*review*' | head -30" in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 89ms:
eaa7ca9 (HEAD -> master, origin/master) docs: ТЗ Этапов 0/1 v4 после автономного R3 (3×P1+1×P2) + receipts петли
4738103 docs: ТЗ Этапов 0/1 v3 после кросс-ревью R2 (6×P1 + 3×P2 внесены)
d4a0b93 docs: ТЗ Этапов 0/1 v2 после кросс-ревью R1 (6×P1 + 3×P2 внесены)
1f53046 docs: ТЗ Этапов 0/1 Play for Good + фикс decision log gap-карты
eaa7ca9 docs: ТЗ Этапов 0/1 v4 после автономного R3 (3×P1+1×P2) + receipts петли

exec
/bin/zsh -lc 'for c in d4a0b93 4738103; do echo "$c"; git ls-tree -r --name-only "$c" | grep -E '"'review|disposition|prompt' | grep 'play-for-good' | head -20; done" in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 0ms:
d4a0b93
4738103

exec
/bin/zsh -lc 'git show -s --format=fuller d4a0b93; git show -s --format=fuller 4738103' in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 0ms:
commit d4a0b934971a64dd149737a05c0f115614d51bdd
Author:     Gleb <>
AuthorDate: Thu Jul 30 13:16:05 2026 +0300
Commit:     Gleb <>
CommitDate: Thu Jul 30 13:16:05 2026 +0300

    docs: ТЗ Этапов 0/1 v2 после кросс-ревью R1 (6×P1 + 3×P2 внесены)
    
    Stage 0: физическое разделение island-роутеров на 4 контура (legacy /
    closed delivery / public report / moderation) с независимыми гейтами —
    модерация выводится из-под ENABLE_ISLAND_SOCIAL (факт: смонтирована
    внутри этого if, main.py:195-200); ENABLE_ISLAND_LEGACY_SURFACE гейтит
    также запуск bake/theme runners (безусловны в lifespan);
    pre-prod E2E старого клиента ДО прод-применения; snapshot manifest
    вместо row counts.
    
    Stage 1: mission_runtime singleton как единая точка FOR UPDATE (двух
    ACTIVE не существует by construction) + очередь READY + CLI ready +
    preflight successor; dogfood-изоляция writers и readers через единый
    allowlist + session capability; mission_contribution блок в
    results/daily ответах и в verified replay + перенос через outbox;
    daily-ключ по player-local DailyQuest.day; typed
    mission.fulfillment-receipt.v1 с coverage-проверкой allocations; EUR
    жёстко в v0 + числовые границы need/stretch в контракте; sum(child)
    инвариант service-level + reconciliation; client watermark церемоний.
    
    Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
commit 4738103258e1866ba19a22187098448665612759
Author:     Gleb <>
AuthorDate: Thu Jul 30 13:35:22 2026 +0300
Commit:     Gleb <>
CommitDate: Thu Jul 30 13:35:22 2026 +0300

    docs: ТЗ Этапов 0/1 v3 после кросс-ревью R2 (6×P1 + 3×P2 внесены)
    
    Stage 0: staged rollout — pre-set ENABLE_ISLAND_LEGACY_SURFACE=true +
    GENERATION_RUNNERS=true до деплоя кода (деплой не меняет поведение),
    раздельные гейты роутов и runners для quiesce/drain (роуты закрыты →
    очередь доживает до terminal → flip runners), freeze-список таблиц
    вместо «ноль island-writes» (защитные island_reports /
    island_moderation_actions — по allowlist с audit-receipts), исправлена
    карта роутеров (api_island=theme/bake; api_island_social=artifact-url/
    public/visits/likes) + route manifest как первый деливерабл.
    
    Stage 1: аварийный путь пустой очереди = некоммит + retryable 503
    (не 409 — outbox считает его terminal), unlock-cutoff отказывает без
    successor, DB-preflight вместо config-validator; exact contract
    identity (case_id, contract_version) через runtime/events/allocations/
    contributions/fulfillments; mission_fulfillment_allocations child +
    атомарный FULFILLED только при полном покрытии gift; финансовая
    идемпотентность (res:/gift: identity, FK на lifecycle event),
    округление вниз, CHECK-границы; предусловие token_goal >= max
    одиночного вклада.
    
    Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>

exec
/bin/zsh -lc "find . -maxdepth 3 -type f -iname '*play-for-good*' -o -iname '*tz-review-r[12]*' | sort | head -80" in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 301ms:
./play-for-good-gap-map-codex-research.md
./play-for-good-gap-map-v1.md
./play-for-good-stage0-island-off-tz.md
./play-for-good-stage1-mission-slice-tz.md
./play-for-good-tz-review-r3-disposition.md
./play-for-good-tz-review-r3-prompt.md
./play-for-good-tz-review-r3-raw.md
./play-for-good-tz-review-r4-prompt.md
./play-for-good-tz-review-r4-raw.md
./vision-patch-play-for-good-proposal.md

exec
/bin/zsh -lc "grep -R -n -E 'APIRouter|@router\\.|artifact-url|/block|include_router|start_(bake|theme)_runner|ENABLE_ISLAND|enable_island' swipe-backend/app/main.py swipe-backend/app/api_island.py swipe-backend/app/api_island_state.py swipe-backend/app/api_island_social.py swipe-backend/app/api_island_moderation.py swipe-backend/app/config.py 2>/dev/null | head -260" in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 0ms:
swipe-backend/app/main.py:10:from fastapi import APIRouter, FastAPI
swipe-backend/app/main.py:50:    start_bake_runner,
swipe-backend/app/main.py:51:    start_theme_runner,
swipe-backend/app/main.py:76:    start_bake_runner()
swipe-backend/app/main.py:77:    start_theme_runner()
swipe-backend/app/main.py:107:api = APIRouter(prefix="/api")
swipe-backend/app/main.py:129:api.include_router(session_router)
swipe-backend/app/main.py:130:api.include_router(daily_router)
swipe-backend/app/main.py:131:api.include_router(runs_router)
swipe-backend/app/main.py:132:api.include_router(results_router)
swipe-backend/app/main.py:133:api.include_router(challenges_router)
swipe-backend/app/main.py:134:api.include_router(control_plane_router)
swipe-backend/app/main.py:135:api.include_router(events_router)
swipe-backend/app/main.py:136:api.include_router(stats_router)
swipe-backend/app/main.py:138:    api.include_router(catalog_lab_auth_router)
swipe-backend/app/main.py:139:    api.include_router(catalog_evaluations_router)
swipe-backend/app/main.py:141:        api.include_router(operator_level_flags_lab_router)
swipe-backend/app/main.py:143:        api.include_router(content_analytics_lab_router)
swipe-backend/app/main.py:145:        api.include_router(content_analytics_scheduler_router)
swipe-backend/app/main.py:147:        api.include_router(catalog_publish_router)
swipe-backend/app/main.py:149:        api.include_router(catalog_recall_router)
swipe-backend/app/main.py:151:        api.include_router(catalog_read_router)
swipe-backend/app/main.py:153:        api.include_router(feed_roster_router)
swipe-backend/app/main.py:155:        api.include_router(mobile_reviews_admin_router)
swipe-backend/app/main.py:156:        api.include_router(mobile_reviews_tma_router)
swipe-backend/app/main.py:161:        api.include_router(feed_sequencing_console_router)
swipe-backend/app/main.py:163:            api.include_router(feed_sequencing_console_apply_router)
swipe-backend/app/main.py:168:    api.include_router(agents_content_analytics_router)
swipe-backend/app/main.py:169:    api.include_router(agents_principals_router)
swipe-backend/app/main.py:171:        api.include_router(agents_cohort_watch_router)
swipe-backend/app/main.py:173:    api.include_router(catalog_allocation_router)
swipe-backend/app/main.py:175:    api.include_router(catalog_player_v2_router)
swipe-backend/app/main.py:177:        api.include_router(catalog_canary_dogfood_router)
swipe-backend/app/main.py:179:    api.include_router(feed_effectful_authority_router)
swipe-backend/app/main.py:180:    api.include_router(feed_generated_offer_router)
swipe-backend/app/main.py:184:    api.include_router(feed_sequencing_debug_router)
swipe-backend/app/main.py:186:    api.include_router(catalog_three_level_evidence_router)
swipe-backend/app/main.py:188:    api.include_router(operator_level_flags_router)
swipe-backend/app/main.py:190:    api.include_router(dev_router)
swipe-backend/app/main.py:192:        api.include_router(content_analytics_router)
swipe-backend/app/main.py:193:api.include_router(island_state_router)
swipe-backend/app/main.py:194:api.include_router(island_social_router)
swipe-backend/app/main.py:195:if settings.enable_island_social:
swipe-backend/app/main.py:196:    api.include_router(island_social_core_router)
swipe-backend/app/main.py:197:    api.include_router(island_p2_router)
swipe-backend/app/main.py:200:    api.include_router(island_moderation_router)
swipe-backend/app/main.py:201:api.include_router(island_router)
swipe-backend/app/main.py:202:app.include_router(api)
swipe-backend/app/api_island.py:22:from fastapi import APIRouter, Depends, HTTPException, status
swipe-backend/app/api_island.py:39:router = APIRouter()
swipe-backend/app/api_island.py:337:@router.post("/island/theme", status_code=status.HTTP_202_ACCEPTED)
swipe-backend/app/api_island.py:453:@router.get("/island/theme/{job_id}")
swipe-backend/app/api_island.py:465:@router.delete("/island/theme/{job_id}")
swipe-backend/app/api_island.py:501:    if getattr(get_settings(), "enable_island_closed_delivery", False):
swipe-backend/app/api_island.py:510:    if require_enabled and not settings.enable_island_closed_delivery:
swipe-backend/app/api_island.py:588:        closed_delivery = s.enable_island_closed_delivery
swipe-backend/app/api_island.py:984:def start_theme_runner() -> None:
swipe-backend/app/api_island.py:1003:def start_bake_runner() -> None:
swipe-backend/app/api_island.py:1022:@router.post("/island/bake", status_code=status.HTTP_202_ACCEPTED)
swipe-backend/app/api_island.py:1040:    if s.enable_island_closed_delivery:
swipe-backend/app/api_island.py:1090:@router.get("/island/bake/{job_id}")
swipe-backend/app/api_island_state.py:14:from fastapi import APIRouter, Depends, HTTPException
swipe-backend/app/api_island_state.py:36:router = APIRouter()
swipe-backend/app/api_island_state.py:353:    if get_settings().enable_island_closed_delivery:
swipe-backend/app/api_island_state.py:401:    if get_settings().enable_island_closed_delivery:
swipe-backend/app/api_island_state.py:446:        if building.rel is not None and get_settings().enable_island_closed_delivery:
swipe-backend/app/api_island_state.py:496:@router.get("/island/state")
swipe-backend/app/api_island_state.py:508:@router.put("/island/state")
swipe-backend/app/api_island_state.py:546:        # (§3.2). Gated inside the helper by ENABLE_ISLAND_BOTS; a lazy import
swipe-backend/app/api_island_social.py:8:from fastapi import APIRouter, Depends, HTTPException
swipe-backend/app/api_island_social.py:48:router = APIRouter()
swipe-backend/app/api_island_social.py:122:        if getattr(settings, "enable_island_closed_delivery", False):
swipe-backend/app/api_island_social.py:125:    if getattr(settings, "enable_island_closed_delivery", False):
swipe-backend/app/api_island_social.py:159:@router.get("/island/artifact-url")
swipe-backend/app/api_island_social.py:166:    if not settings.enable_island_closed_delivery:
swipe-backend/app/api_island_social.py:210:@router.get("/island/public/{owner_id}")
swipe-backend/app/api_island_social.py:237:        if get_settings().enable_island_closed_delivery:
swipe-backend/app/api_island_social.py:277:@router.post("/island/visits/start")
swipe-backend/app/api_island_social.py:333:@router.post("/island/visits/{visit_id}/complete")
swipe-backend/app/api_island_social.py:391:@router.put("/island/buildings/{building_id}/like")
swipe-backend/app/api_island_moderation.py:17:All routes mount only behind ``ENABLE_ISLAND_SOCIAL`` (404 when off).
swipe-backend/app/api_island_moderation.py:23:from fastapi import APIRouter, Depends, HTTPException
swipe-backend/app/api_island_moderation.py:58:router = APIRouter()
swipe-backend/app/api_island_moderation.py:157:@router.post("/island/buildings/{building_id}/report")
swipe-backend/app/api_island_moderation.py:240:@router.get("/island/moderation/publications")
swipe-backend/app/api_island_moderation.py:354:@router.get("/island/moderation/reports")
swipe-backend/app/api_island_moderation.py:415:@router.post("/island/moderation/takedown")
swipe-backend/app/api_island_moderation.py:461:@router.post("/island/moderation/restore")
swipe-backend/app/api_island_moderation.py:507:@router.post("/island/moderation/reports/{report_id}/resolve")
swipe-backend/app/config.py:296:    enable_island_closed_delivery: bool = False
swipe-backend/app/config.py:299:    enable_island_artifact_migration: bool = False
swipe-backend/app/config.py:357:    enable_island_social: bool = False
swipe-backend/app/config.py:359:    enable_island_bots: bool = False
swipe-backend/app/config.py:377:    enable_island_visit_awards: bool = False
swipe-backend/app/config.py:384:    enable_island_notifications: bool = False
swipe-backend/app/config.py:624:        if self.enable_island_visit_awards:
swipe-backend/app/config.py:625:            if not self.enable_island_social:
swipe-backend/app/config.py:627:                    "ENABLE_ISLAND_VISIT_AWARDS requires ENABLE_ISLAND_SOCIAL"
swipe-backend/app/config.py:631:                    "ENABLE_ISLAND_VISIT_AWARDS requires "
swipe-backend/app/config.py:634:        if self.enable_island_notifications:
swipe-backend/app/config.py:635:            if not self.enable_island_social:
swipe-backend/app/config.py:637:                    "ENABLE_ISLAND_NOTIFICATIONS requires ENABLE_ISLAND_SOCIAL"
swipe-backend/app/config.py:641:                    "ENABLE_ISLAND_NOTIFICATIONS requires BOT_TOKEN"
swipe-backend/app/config.py:645:                    "ENABLE_ISLAND_NOTIFICATIONS requires "

exec
/bin/zsh -lc "grep -R -n -E '@router\\.(get|post|put|delete|patch).*island|/block' swipe-backend/app/api_island*.py | sort" in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 0ms:
swipe-backend/app/api_island.py:1022:@router.post("/island/bake", status_code=status.HTTP_202_ACCEPTED)
swipe-backend/app/api_island.py:1090:@router.get("/island/bake/{job_id}")
swipe-backend/app/api_island.py:337:@router.post("/island/theme", status_code=status.HTTP_202_ACCEPTED)
swipe-backend/app/api_island.py:453:@router.get("/island/theme/{job_id}")
swipe-backend/app/api_island.py:465:@router.delete("/island/theme/{job_id}")
swipe-backend/app/api_island_moderation.py:157:@router.post("/island/buildings/{building_id}/report")
swipe-backend/app/api_island_moderation.py:240:@router.get("/island/moderation/publications")
swipe-backend/app/api_island_moderation.py:354:@router.get("/island/moderation/reports")
swipe-backend/app/api_island_moderation.py:415:@router.post("/island/moderation/takedown")
swipe-backend/app/api_island_moderation.py:461:@router.post("/island/moderation/restore")
swipe-backend/app/api_island_moderation.py:507:@router.post("/island/moderation/reports/{report_id}/resolve")
swipe-backend/app/api_island_p2.py:250:@router.put("/island/friends/{user_id}/block")
swipe-backend/app/api_island_p2.py:311:@router.post("/island/visit-award/from-chest")
swipe-backend/app/api_island_p2.py:3:This module adds the safety mutations (remove/block), exact chest-bound visit
swipe-backend/app/api_island_p2.py:458:@router.post("/island/visit-award/{roll_id}/accept")
swipe-backend/app/api_island_p2.py:472:@router.post("/island/visit-award/{roll_id}/decline")
swipe-backend/app/api_island_p2.py:486:@router.put("/island/notifications/write-access")
swipe-backend/app/api_island_social.py:159:@router.get("/island/artifact-url")
swipe-backend/app/api_island_social.py:210:@router.get("/island/public/{owner_id}")
swipe-backend/app/api_island_social.py:277:@router.post("/island/visits/start")
swipe-backend/app/api_island_social.py:333:@router.post("/island/visits/{visit_id}/complete")
swipe-backend/app/api_island_social.py:391:@router.put("/island/buildings/{building_id}/like")
swipe-backend/app/api_island_social_core.py:166:@router.get("/island/activity")
swipe-backend/app/api_island_social_core.py:258:@router.post("/island/visits/{visit_id}/result")
swipe-backend/app/api_island_social_core.py:444:@router.post("/island/buildings/{building_id}/collect")
swipe-backend/app/api_island_social_core.py:619:@router.post("/island/friends/code")
swipe-backend/app/api_island_social_core.py:658:@router.post("/island/friends/accept")
swipe-backend/app/api_island_social_core.py:719:@router.get("/island/friends")
swipe-backend/app/api_island_social_core.py:750:@router.delete("/island/friends/{user_id}")
swipe-backend/app/api_island_state.py:496:@router.get("/island/state")
swipe-backend/app/api_island_state.py:508:@router.put("/island/state")

exec
/bin/zsh -lc "nl -ba swipe-backend/app/api_island_social.py | sed -n '145,205p'; nl -ba swipe-backend/app/api_island_p2.py | sed -n '230,280p'; nl -ba swipe-backend/app/main.py | sed -n '185,205p'; nl -ba swipe-backend/app/api_island.py | sed -n '480,610p'" in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 0ms:
   145	    }
   146	
   147	
   148	def _visit_view(db: Session, visit: IslandVisit, social: IslandBuildingSocial) -> dict:
   149	    return {
   150	        "visit_id": str(visit.id),
   151	        "building_id": str(visit.building_id),
   152	        "owner_id": int(visit.owner_id),
   153	        "state": "completed" if visit.completed_at is not None else "active",
   154	        "expires_at": visit.expires_at.isoformat(),
   155	        "social": _social_view(db, social, visit.guest_id),
   156	    }
   157	
   158	
   159	@router.get("/island/artifact-url")
   160	def island_artifact_url(
   161	    building_id: uuid.UUID,
   162	    caller: TmaUser = Depends(require_tma_user),
   163	    db: Session = Depends(get_db),
   164	):
   165	    settings = get_settings()
   166	    if not settings.enable_island_closed_delivery:
   167	        raise HTTPException(status_code=404, detail="closed Island delivery is unavailable")
   168	    get_or_create_user(db, caller)
   169	    social = db.get(IslandBuildingSocial, building_id)
   170	    if social is None:
   171	        raise HTTPException(status_code=404, detail="island building not found")
   172	    owner_id = int(social.owner_id)
   173	    if caller.id != owner_id and blocked_between(db, caller.id, owner_id):
   174	        raise HTTPException(status_code=404, detail="island building not found")
   175	    _, _, building, _ = current_island_building(
   176	        db,
   177	        owner_id=owner_id,
   178	        building_id=building_id,
   179	        viewer_id=caller.id,
   180	    )
   181	    _require_public_artifact(owner_id, building)
   182	    if is_taken_down(db, building_id):
   183	        raise HTTPException(status_code=404, detail="island building not found")
   184	    content_digest = str(building.contentDigest or "")
   185	    try:
   186	        url, expires_at = presign_island_artifact_get(
   187	            settings,
   188	            content_digest=content_digest,
   189	        )
   190	    except (RuntimeError, ValueError) as error:
   191	        # Configuration and identity failures are deliberately non-specific:
   192	        # never reflect storage details or a bearer-bearing provider error.
   193	        raise HTTPException(status_code=503, detail="Island artifact delivery unavailable") from error
   194	    db.commit()
   195	    return JSONResponse(
   196	        content={
   197	            "building_id": str(building_id),
   198	            "rel": building.rel,
   199	            "contentDigest": content_digest,
   200	            "url": url,
   201	            "expires_at": expires_at.isoformat(),
   202	        },
   203	        headers={
   204	            "Cache-Control": "private, no-store, max-age=0",
   205	            "Pragma": "no-cache",
   230	            db,
   231	            owner_id=owner_id,
   232	            guest_id=user_id,
   233	            day=day,
   234	        ):
   235	            continue
   236	        (bots if bot is not None else humans).append(owner_id)
   237	    pool = sorted(humans) or sorted(bots)
   238	    if not pool:
   239	        return None
   240	    index = _bucket(f"{roll_id}:target") % len(pool)
   241	    return pool[index]
   242	
   243	
   244	def _award_response(row: IslandVisitAward) -> dict:
   245	    value = _canonical(dict(row.response))
   246	    value["state"] = row.state
   247	    return value
   248	
   249	
   250	@router.put("/island/friends/{user_id}/block")
   251	def island_friend_block(
   252	    user_id: int,
   253	    body: IslandFriendBlockIn,
   254	    caller: TmaUser = Depends(require_tma_user),
   255	    db: Session = Depends(get_db),
   256	) -> dict:
   257	    get_or_create_user(db, caller)
   258	    if user_id == caller.id:
   259	        raise HTTPException(status_code=400, detail="cannot block yourself")
   260	    if db.get(User, user_id) is None:
   261	        raise HTTPException(status_code=404, detail="user not found")
   262	
   263	    _lock_users(db, caller.id, user_id)
   264	    lo, hi = sorted((caller.id, user_id))
   265	    friendship = db.execute(
   266	        select(IslandFriendship)
   267	        .where(
   268	            IslandFriendship.user_lo == lo,
   269	            IslandFriendship.user_hi == hi,
   270	        )
   271	        .with_for_update()
   272	    ).scalar_one_or_none()
   273	    removed = False
   274	    if body.blocked:
   275	        inserted = db.execute(
   276	            pg_insert(IslandFriendBlock)
   277	            .values(blocker_id=caller.id, blocked_id=user_id)
   278	            .on_conflict_do_nothing()
   279	            .returning(IslandFriendBlock.blocker_id)
   280	        ).scalar_one_or_none()
   185	if settings.enable_catalog_three_level_production_evidence:
   186	    api.include_router(catalog_three_level_evidence_router)
   187	if settings.enable_operator_level_flags:
   188	    api.include_router(operator_level_flags_router)
   189	if settings.enable_dev_routes and settings.dev_user_id_set:
   190	    api.include_router(dev_router)
   191	    if settings.enable_content_analytics:
   192	        api.include_router(content_analytics_router)
   193	api.include_router(island_state_router)
   194	api.include_router(island_social_router)
   195	if settings.enable_island_social:
   196	    api.include_router(island_social_core_router)
   197	    api.include_router(island_p2_router)
   198	    # P3 report + operator moderation (F011/F015). Operator routes additionally
   199	    # enforce the island_moderator_ids allowlist server-side on every request.
   200	    api.include_router(island_moderation_router)
   201	api.include_router(island_router)
   202	app.include_router(api)
   480	    if locked.status in ("ready", "failed"):
   481	        return _theme_job_view(locked)
   482	    now = datetime.now(timezone.utc)
   483	    locked.cancel_requested = True
   484	    locked.status = "failed"
   485	    locked.error = "cancelled"
   486	    locked.lease_owner = None
   487	    locked.lease_expires_at = None
   488	    locked.updated_at = now
   489	    db.commit()
   490	    return _theme_job_view(locked)
   491	
   492	
   493	def _job_view(job: IslandBakeJob) -> dict:
   494	    view = {
   495	        "job_id": str(job.id),
   496	        "status": job.status,
   497	        "rel": job.rel or "",
   498	        "error": job.error or "",
   499	        "ready": job.status == "ready",
   500	    }
   501	    if getattr(get_settings(), "enable_island_closed_delivery", False):
   502	        view["content_digest"] = job.content_digest or ""
   503	    else:
   504	        view["url"] = job.url or ""
   505	    return view
   506	
   507	
   508	def _artifact_worker_env(*, require_enabled: bool = True) -> dict[str, str]:
   509	    settings = get_settings()
   510	    if require_enabled and not settings.enable_island_closed_delivery:
   511	        return {}
   512	    values = {
   513	        "ISLAND_ARTIFACT_S3_ENDPOINT": settings.island_artifact_s3_endpoint.strip(),
   514	        "ISLAND_ARTIFACT_S3_BUCKET": settings.island_artifact_s3_bucket.strip(),
   515	        "ISLAND_ARTIFACT_S3_REGION": settings.island_artifact_s3_region.strip() or "auto",
   516	        "ISLAND_ARTIFACT_S3_ACCESS_KEY_ID": settings.island_artifact_s3_access_key_id.strip(),
   517	        "ISLAND_ARTIFACT_S3_SECRET_ACCESS_KEY": settings.island_artifact_s3_secret_access_key,
   518	        "ISLAND_ARTIFACT_S3_FORCE_PATH_STYLE": (
   519	            "true" if settings.island_artifact_s3_force_path_style else "false"
   520	        ),
   521	    }
   522	    if not all(values.values()):
   523	        raise RuntimeError("private Island storage configuration is incomplete")
   524	    if not values["ISLAND_ARTIFACT_S3_ENDPOINT"].startswith("https://"):
   525	        raise RuntimeError("private Island storage endpoint must use HTTPS")
   526	    return values
   527	
   528	
   529	def _update_job(job_id: uuid.UUID, **values: Any) -> None:
   530	    with SessionLocal() as db:
   531	        job = db.get(IslandBakeJob, job_id)
   532	        if job is None:
   533	            return
   534	        for key, value in values.items():
   535	            setattr(job, key, value)
   536	        job.updated_at = datetime.now(timezone.utc)
   537	        db.commit()
   538	
   539	
   540	def _claim_job() -> uuid.UUID | None:
   541	    now = datetime.now(timezone.utc)
   542	    with SessionLocal() as db:
   543	        job = db.execute(
   544	            select(IslandBakeJob)
   545	            .where(
   546	                or_(
   547	                    IslandBakeJob.status == "queued",
   548	                    and_(
   549	                        IslandBakeJob.status.in_(["baking", "deploying"]),
   550	                        IslandBakeJob.lease_expires_at < now,
   551	                    ),
   552	                )
   553	            )
   554	            .order_by(IslandBakeJob.created_at)
   555	            .with_for_update(skip_locked=True)
   556	            .limit(1)
   557	        ).scalar_one_or_none()
   558	        if job is None:
   559	            return None
   560	        job.status = "baking"
   561	        job.error = None
   562	        job.lease_expires_at = now + timedelta(minutes=15)
   563	        job.updated_at = now
   564	        db.commit()
   565	        return job.id
   566	
   567	
   568	async def _execute_job(job_id: uuid.UUID) -> None:
   569	    proc: asyncio.subprocess.Process | None = None
   570	    try:
   571	        with SessionLocal() as db:
   572	            job = db.get(IslandBakeJob, job_id)
   573	            if job is None:
   574	                return
   575	            user_id = job.user_id
   576	            pack_json = json.dumps(job.pack, separators=(",", ":"), ensure_ascii=False)
   577	            pack_name = str(job.pack.get("name") or "New mechanic")
   578	            prompt = job.prompt
   579	            template = job.template
   580	
   581	        s = get_settings()
   582	        repo = _resolve_path(s.ugc_repo_path)
   583	        worker = repo / "worker" / "bake.mjs"
   584	        if not worker.exists():
   585	            raise RuntimeError("bake runtime files are unavailable")
   586	
   587	        env = os.environ.copy()
   588	        closed_delivery = s.enable_island_closed_delivery
   589	        if closed_delivery:
   590	            env.pop("UGC_BASE_URL", None)
   591	        elif s.ugc_base_url:
   592	            env["UGC_BASE_URL"] = s.ugc_base_url
   593	        env.update(_artifact_worker_env())
   594	        # Production notification belongs to the job runner, after hosting poll.
   595	        # The standalone/dev worker still supports BOT_TOKEN directly.
   596	        env.pop("BOT_TOKEN", None)
   597	        proc = await asyncio.create_subprocess_exec(
   598	            "node",
   599	            str(worker),
   600	            "--pack", pack_json,
   601	            "--prompt", prompt,
   602	            "--user", str(user_id),
   603	            "--tpl", template,
   604	            "--chat", str(user_id),
   605	            cwd=str(repo),
   606	            env=env,
   607	            stdout=asyncio.subprocess.PIPE,
   608	            stderr=asyncio.subprocess.PIPE,
   609	        )
   610	        try:

exec
/bin/zsh -lc "nl -ba swipe-backend/app/api_island_moderation.py | sed -n '145,180p'; nl -ba swipe-backend/app/api_island_moderation.py | sed -n '225,255p'; nl -ba swipe-backend/app/api_island_p2.py | sed -n '1,45p'" in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 0ms:
   145	
   146	
   147	def _report_view(report: IslandReport) -> dict:
   148	    return {
   149	        "report_id": str(report.id),
   150	        "building_id": str(report.building_id),
   151	        "reason": report.reason,
   152	        "status": report.status,
   153	        "created_at": report.created_at.isoformat() if report.created_at else None,
   154	    }
   155	
   156	
   157	@router.post("/island/buildings/{building_id}/report")
   158	def island_report(
   159	    building_id: uuid.UUID,
   160	    body: IslandReportIn,
   161	    caller: TmaUser = Depends(require_tma_user),
   162	    db: Session = Depends(get_db),
   163	) -> dict:
   164	    get_or_create_user(db, caller)
   165	    social = db.get(IslandBuildingSocial, building_id)
   166	    if social is None:
   167	        raise HTTPException(status_code=404, detail="island building not found")
   168	    if int(social.owner_id) == caller.id:
   169	        raise HTTPException(status_code=403, detail="owners cannot report their own building")
   170	    # A block hides the building in both directions — same 404 as a missing one.
   171	    if blocked_between(db, caller.id, int(social.owner_id)):
   172	        raise HTTPException(status_code=404, detail="island building not found")
   173	
   174	    # Dedup by UNIQUE(building_id, reporter_id): a repeat report returns the saved
   175	    # row (200) with no new side effect and no rate-limit consumption.
   176	    existing = db.execute(
   177	        select(IslandReport).where(
   178	            IslandReport.building_id == building_id,
   179	            IslandReport.reporter_id == caller.id,
   180	        )
   225	        # over-count on a genuinely simultaneous double submit).
   226	        db.rollback()
   227	        committed = db.execute(
   228	            select(IslandReport).where(
   229	                IslandReport.building_id == building_id,
   230	                IslandReport.reporter_id == caller.id,
   231	            )
   232	        ).scalar_one_or_none()
   233	        if committed is None:
   234	            raise
   235	        return _report_view(committed)
   236	    return _report_view(report)
   237	
   238	
   239	# ── operator: publications feed ──────────────────────────────────────────────
   240	@router.get("/island/moderation/publications")
   241	def moderation_publications(
   242	    caller: TmaUser = Depends(require_tma_user),
   243	    db: Session = Depends(get_db),
   244	    limit: int = 50,
   245	    before: str | None = None,
   246	) -> dict:
   247	    _require_moderator(caller)
   248	    limit = max(1, min(100, int(limit)))
   249	    # Enumerate server-owned social rows (1:1 with buildings) newest first,
   250	    # excluding bot owners so builtin seeds never appear (§2.2). The current
   251	    # building/rel and the publish prompt come from the owner state + bake job.
   252	    #
   253	    # Keyset pagination on the tuple (created_at, building_id) — a bare
   254	    # created_at cursor would drop rows sharing a timestamp (P3-3a). Because bot
   255	    # exclusion + "currently published" is a POST-filter, one DB window can yield
     1	"""Island P2 player API.
     2	
     3	This module adds the safety mutations (remove/block), exact chest-bound visit
     4	card experiment, and Telegram write-access consent.  The already-live P1
     5	surface remains independently usable when both P2 rollout switches are off.
     6	"""
     7	from __future__ import annotations
     8	
     9	import hashlib
    10	import uuid
    11	from datetime import date, datetime, timedelta
    12	
    13	from fastapi import APIRouter, Depends, HTTPException
    14	from pydantic import BaseModel, ConfigDict, Field
    15	from sqlalchemy import delete, func, or_, select
    16	from sqlalchemy.dialects.postgresql import insert as pg_insert
    17	from sqlalchemy.orm import Session
    18	
    19	from .api_island_social import (
    20	    _is_public_artifact,
    21	    blocked_between,
    22	    granted_gift_today,
    23	    is_taken_down,
    24	)
    25	from .api_island_state import _building_id, _read_state
    26	from .api_island_social_core import _canonical, _island_puzzles_today, _record_event
    27	from .auth import TmaUser, require_tma_user
    28	from .config import get_settings
    29	from .content_identity import jcs_sha256
    30	from .db import get_db
    31	from .models import (
    32	    IslandBot,
    33	    IslandFriendBlock,
    34	    IslandFriendship,
    35	    IslandStateRecord,
    36	    IslandVisitAward,
    37	    RewardLedger,
    38	    RunTicket,
    39	    User,
    40	    VerifiedRun,
    41	)
    42	from .run_tickets import utc_now
    43	from .services import get_or_create_user, mini_app_deep_link
    44	
    45	router = APIRouter()

exec
/bin/zsh -lc "nl -ba swipe-backend/app/api_island_p2.py | sed -n '270,310p'; grep -R -n 'class IslandFriendBlock\\|island_friend_blocks' swipe-backend/app/models.py swipe-backend/alembic | head -40" in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 0ms:
   270	        )
   271	        .with_for_update()
   272	    ).scalar_one_or_none()
   273	    removed = False
   274	    if body.blocked:
   275	        inserted = db.execute(
   276	            pg_insert(IslandFriendBlock)
   277	            .values(blocker_id=caller.id, blocked_id=user_id)
   278	            .on_conflict_do_nothing()
   279	            .returning(IslandFriendBlock.blocker_id)
   280	        ).scalar_one_or_none()
   281	        if friendship is not None and friendship.removed_at is None:
   282	            friendship.removed_at = utc_now()
   283	            removed = True
   284	        if inserted is not None:
   285	            _record_event(
   286	                db,
   287	                user_id=caller.id,
   288	                event_type="friend_blocked",
   289	                payload={"blocked_user_id": user_id, "friendship_removed": removed},
   290	            )
   291	    else:
   292	        deleted = db.execute(
   293	            delete(IslandFriendBlock)
   294	            .where(
   295	                IslandFriendBlock.blocker_id == caller.id,
   296	                IslandFriendBlock.blocked_id == user_id,
   297	            )
   298	            .returning(IslandFriendBlock.blocker_id)
   299	        ).scalar_one_or_none()
   300	        if deleted is not None:
   301	            _record_event(
   302	                db,
   303	                user_id=caller.id,
   304	                event_type="friend_unblocked",
   305	                payload={"unblocked_user_id": user_id},
   306	            )
   307	    db.commit()
   308	    return {"blocked": bool(body.blocked), "friendship_removed": removed}
   309	
   310	
grep: swipe-backend/alembic: No such file or directory
swipe-backend/app/models.py:8026:class IslandFriendBlock(Base):
swipe-backend/app/models.py:8027:    __tablename__ = "island_friend_blocks"

exec
/bin/zsh -lc "git show eaa7ca943a1994eab0fa51cafe2cc987d7274c86:play-for-good-stage1-mission-slice-tz.md | grep -n -E 'eligible|formula|формул|source|config|version|cursor|fund|seed|посев|allocation|fulfill|token_goal'; git show eaa7ca943a1994eab0fa51cafe2cc987d7274c86:play-for-good-stage0-island-off-tz.md | grep -n -E 'manifest|block|friend|meta_events|404|artifact|protect|freeze'" in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 0ms:
6:`ledger.seq` + правило `eligible at cursor` для воспроизводимого
29:island_moderation_actions, feed_policy_config_versions, award_*.
32:   версия контракта»: PK `case_id`, `contract_version` (FK на
36:   таблицы ссылаются composite-FK `(case_id, contract_version)` на
41:   PK `(case_id, contract_version)`, `contract_digest` (JCS sha256),
47:   `token_goal`; `unlock_share` (v0 — пропорция); `unlock_cutoff_at`;
48:   `latest_fulfillment_at`; `queue_position`; ожидаемый вид
51:   CHECK id=1): пара `active_case_id + active_contract_version`
60:   (composite FK), `kind ∈ ready|active|unlocked|fulfilled`,
66:   settled-ятся); `source ∈
67:   seed|revenue_share|partner|subscription_share` (v0 — только seed),
69:   `idempotency_key` UNIQUE. **Правило cursor'а:** `pool_cursor`
70:   allocation'а = max `ledger.seq` на момент снапшота; `settled
71:   unallocated eligible pool на cursor` = `sum(ledger.amount при seq ≤
72:   cursor) − sum(предыдущих allocations)`. Поздние строки получают
75:5. **`mission_pool_allocations`** — деньги→кейс: `kind ∈
77:   contract_version)`, `amount_cents`, `currency` (CHECK `='EUR'`),
78:   `pool_cursor`, FK на породивший lifecycle event, `receipt`.
80:   identity (`res:{case_id}:{contract_version}` /
81:   `gift:{case_id}:{contract_version}`); округление
85:   положительные `amount_cents` в ledger и allocations. Инвариант (в
86:   транзакции под runtime-lock): `sum(allocations) ≤ sum(settled
88:   unlock_share(progress) × settled unallocated pool на cursor,
91:   **`mission_contribution_allocations`**) — вклад: `user_id`,
92:   `source ∈ series|daily`, `amount`, `source_ref`,
97:   byte-identical. Child-allocations (каждая пинит `(case_id,
98:   contract_version)`): обычно одна строка; при пересечении
99:   `token_goal` — детерминированно две. **Инвариант
103:7. **`mission_fulfillments`** (+ child
104:   **`mission_fulfillment_allocations`**) — typed transfer receipt
105:   `mission.fulfillment-receipt.v1`: `(case_id, contract_version)`,
109:   **каждой** покрываемой allocation-строкой (обычный перевод
111:   принимает fulfill только при полном покрытии зафиксированного gift
114:   «реально передано» проецируется **только** из fulfillment-receipts.
117:case-events, pool-allocations, contribution-allocations и
118:fulfillments пинят точную пару `(case_id, contract_version)`
127:гарантию из pool — allocation `reserve_guaranteed` — и пишет
135:  CLI-команда и startup-проверка, не config-validator (у него нет
145:- Предусловие v0 (валидируется при `register-contract`): `token_goal`
165:  amount, allocations по кейсам, состояние бара после). Ответ
176:Команды: `register-contract` / `seed-pool` / **`ready`** / `activate` /
177:`unlock-cutoff` / `fulfill` (typed fulfillment-receipt + evidence
187:зарезервировано и открыто / реально передано-из-fulfillments, контракт
198:не меняется от поздних settled-строк; fulfillment coverage (transfer =
199:сумма указанных allocations; чужие allocations → отказ);
203:не потерян и не задублирован; fulfillment покрывает обе allocation
205:пин `(case_id, contract_version)` присутствует во всех receipts;
206:негативный тест расхождения версий (событие/allocation с версией, не
208:`ledger.seq ≤ cursor` при любых поздних строках; округление вниз и
229:потребность (корм), guaranteed ≈ €100 посева; права на фото/видео;
230:формат мини-отчёта; latest fulfillment date; **кейс №2 доведён до
235:Полный реальный цикл: контракт → посев → READY (резервирование) →
4:Codex; R1–R2 внесены ранее; R3: artifact-url переклассифицирован в
5:closed-delivery контур (b); user block добавлен в защитный контур (c),
6:`island_friend_blocks` выведен из freeze-списка в allowlist).
29:`api_island_social.py` — public, visits, likes, user-block, и
30:**artifact-url (:159), который является closed-delivery resolver'ом,
36:manifest**: каждый island-маршрут → файл → целевой контур; физическое
37:разделение выполняется только по manifest'у, не по памяти.
58:0. **Route manifest** (деливерабл до кода): полный список
61:   manifest'у):
63:      (`api_island_social` БЕЗ artifact-url и block), theme/bake
65:   b) closed-delivery resolver — **включая artifact-url endpoint
68:   c) защитный пользовательский контур: **public report И user block**
69:      (`/island/friends/{user_id}/block`) — VISION требует report/block
86:контура (a) → 404; при `GENERATION_RUNNERS=false` runners не стартуют
96:что island-запросы получают 404 и деградация тихая — лента играет,
101:Acceptance: E2E зелёный. Найденная жёсткая зависимость — blocking
127:5. **Prod smoke:** curl-набор по route manifest'у → 404; closed
128:   delivery (artifact-url) выдаёт signed GET на существующий артефакт;
129:   report, user block и модерационная консоль работают; в логах нет
136:## П5 — snapshot manifest, схема и доки
138:1. **Data-manifest с явным freeze-списком** (после drain П4):
140:   **freeze-списку** legacy/social/economy таблиц: `island_states`,
144:   `island_bot_daily_plans`, `island_friend_codes`,
145:   `island_friendships`,
147:   `island_meta_events`, `island_bake_jobs`, `island_theme_jobs`.
148:   Через ≥24 ч: **ноль новых записей в freeze-списке**. Защитные
150:   **`island_friend_blocks`** — пользовательский block остаётся живым
151:   контуром) в freeze-список **не входят**: их writes разрешены и
153:   конкретному report/block/moderation-акту. Manifest — receipt
161:Acceptance: manifest-проверка чистая; схема опубликована;
168:П1 (клиент) → П2 (код: route manifest + разделение, PR без
171:(manifest/схема/доки). Каждый шаг — отдельный receipt; прод-верификация
177:- Backend: контур (a) → 404; bake/theme/bot/notification runners не
179:- Closed delivery (artifact-url) / public report / user block /
185:- Data-manifest: ноль записей в freeze-списке после cutoff; защитные

codex
- [P1] Защитный `user block` всё ещё несовместим с freeze-инвариантом. В freeze остаются [`island_friendships` и `island_meta_events`](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage0-island-off-tz.md:138>), а allowlist охватывает только `island_friend_blocks`. Реальный block обновляет `island_friendships.removed_at` и пишет `island_meta_events` ([api_island_p2.py:281](</Users/gleb/My projects/p4g-platform-workspace/swipe-backend/app/api_island_p2.py:281>)); unblock удаляет строку block и также пишет meta-event ([api_island_p2.py:291](</Users/gleb/My projects/p4g-platform-workspace/swipe-backend/app/api_island_p2.py:291>)). Поэтому работающий защитный контур нарушит 24-часовую freeze-проверку и mutable-state digest.

- [P1] `ledger.seq` не гарантирует заявленную воспроизводимость snapshot. [`BIGSERIAL` и утверждение «поздние строки получают больший seq»](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:63>) неверны при конкурентных транзакциях: транзакция может получить меньший `seq`, остаться незакоммиченной, а после фиксации cursor закоммититься и ретроактивно попасть в `seq ≤ cursor`. Общий runtime-lock предписан только lifecycle/contribution writers ([строки 53–55](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:53>)), но не `seed-pool`. Кроме того, `sum(предыдущих allocations)` не привязан к event/allocation cutoff: более поздний READY reserve способен изменить повторный расчёт старого snapshot при том же ledger cursor.

- [P1] Immutable case contract не фиксирует весь публичный финансовый контракт. Перечень полей [`mission_case_contracts`](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:40>) не содержит funding source, определения eligible pool/revenue, версии полной формулы и правила snapshot/cursor. Эти правила остаются глобальной логикой в [описании ledger/allocations](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:63>), поэтому `(case_id, contract_version)` и digest не доказывают, по какой именно денежной политике рассчитан подарок. Это расходится с обязательным составом контракта в [VISION.md:103](</Users/gleb/My projects/p4g-platform-workspace/VISION.md:103>) и [VISION.md:390](</Users/gleb/My projects/p4g-platform-workspace/VISION.md:390>).

- [P1] Предусловие `token_goal` проверяется только при регистрации против текущих reward-функций ([строки 145–149](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:145>)), но contribution schema не пинит версию reward-config ([строки 90–102](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:90>)). После изменения номинала один вклад может превысить зарегистрированный максимум, пересечь больше двух кейсов и сломать ограничение «двух child-строк достаточно». Gap map прямо требует versioned weights ([play-for-good-gap-map-v1.md:119](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-gap-map-v1.md:119>)).

- [P2] Карта роутеров и smoke остаются неточными. Фактическое состояние ошибочно относит block к `api_island_social.py` ([stage0:29](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage0-island-off-tz.md:29>)); endpoint находится в [api_island_p2.py:250](</Users/gleb/My projects/p4g-platform-workspace/swipe-backend/app/api_island_p2.py:250>). Кроме того, manifest определён как список всех island-маршрутов ([stage0:58](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage0-island-off-tz.md:58>)), но prod smoke требует, чтобы curl-набор «по route manifest» целиком дал 404, одновременно требуя успешные artifact-url/report/block/moderation ([stage0:127](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage0-island-off-tz.md:127>)). Буквально такой acceptance невыполним; ожидаемые статусы должны задаваться по каждому контуру.
tokens used
115,393
- [P1] Защитный `user block` всё ещё несовместим с freeze-инвариантом. В freeze остаются [`island_friendships` и `island_meta_events`](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage0-island-off-tz.md:138>), а allowlist охватывает только `island_friend_blocks`. Реальный block обновляет `island_friendships.removed_at` и пишет `island_meta_events` ([api_island_p2.py:281](</Users/gleb/My projects/p4g-platform-workspace/swipe-backend/app/api_island_p2.py:281>)); unblock удаляет строку block и также пишет meta-event ([api_island_p2.py:291](</Users/gleb/My projects/p4g-platform-workspace/swipe-backend/app/api_island_p2.py:291>)). Поэтому работающий защитный контур нарушит 24-часовую freeze-проверку и mutable-state digest.

- [P1] `ledger.seq` не гарантирует заявленную воспроизводимость snapshot. [`BIGSERIAL` и утверждение «поздние строки получают больший seq»](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:63>) неверны при конкурентных транзакциях: транзакция может получить меньший `seq`, остаться незакоммиченной, а после фиксации cursor закоммититься и ретроактивно попасть в `seq ≤ cursor`. Общий runtime-lock предписан только lifecycle/contribution writers ([строки 53–55](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:53>)), но не `seed-pool`. Кроме того, `sum(предыдущих allocations)` не привязан к event/allocation cutoff: более поздний READY reserve способен изменить повторный расчёт старого snapshot при том же ledger cursor.

- [P1] Immutable case contract не фиксирует весь публичный финансовый контракт. Перечень полей [`mission_case_contracts`](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:40>) не содержит funding source, определения eligible pool/revenue, версии полной формулы и правила snapshot/cursor. Эти правила остаются глобальной логикой в [описании ledger/allocations](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:63>), поэтому `(case_id, contract_version)` и digest не доказывают, по какой именно денежной политике рассчитан подарок. Это расходится с обязательным составом контракта в [VISION.md:103](</Users/gleb/My projects/p4g-platform-workspace/VISION.md:103>) и [VISION.md:390](</Users/gleb/My projects/p4g-platform-workspace/VISION.md:390>).

- [P1] Предусловие `token_goal` проверяется только при регистрации против текущих reward-функций ([строки 145–149](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:145>)), но contribution schema не пинит версию reward-config ([строки 90–102](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:90>)). После изменения номинала один вклад может превысить зарегистрированный максимум, пересечь больше двух кейсов и сломать ограничение «двух child-строк достаточно». Gap map прямо требует versioned weights ([play-for-good-gap-map-v1.md:119](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-gap-map-v1.md:119>)).

- [P2] Карта роутеров и smoke остаются неточными. Фактическое состояние ошибочно относит block к `api_island_social.py` ([stage0:29](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage0-island-off-tz.md:29>)); endpoint находится в [api_island_p2.py:250](</Users/gleb/My projects/p4g-platform-workspace/swipe-backend/app/api_island_p2.py:250>). Кроме того, manifest определён как список всех island-маршрутов ([stage0:58](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage0-island-off-tz.md:58>)), но prod smoke требует, чтобы curl-набор «по route manifest» целиком дал 404, одновременно требуя успешные artifact-url/report/block/moderation ([stage0:127](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage0-island-off-tz.md:127>)). Буквально такой acceptance невыполним; ожидаемые статусы должны задаваться по каждому контуру.

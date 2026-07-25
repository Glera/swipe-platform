# Утренний дайджест аналитика C1 — 2026-07-20 (ручной прогон роли)

Вход: c1-analyst-handoff-2026-07-20.json (5 окон 15–19.07).
Роль: аналитик agent-team (schema-запрет C2-выводов — соблюдён, проверено оркестратором).

## Шапка
Покрытие 15–19.07 (rev 1 все), digests сходятся (92/92 rowDigest).
Freshness: lag ~14ч, missed [], stale=false. Автопилот: cron-receipt 6295d5b4
(2026-07-20 02:30:26Z, Render cron, окно 18.07), replay run-once→noop.

## По окнам
| Окно | rows | вердикты | Σ independent | settled |
|---|---|---|---|---|
| 15.07 | 21 | inconclusive ×21 | 27 | да |
| 16.07 | 26 | inconclusive ×26 | 26 | да |
| 17.07 | 17 | inconclusive ×17 | 18 | да |
| 18.07 | 1 | inconclusive ×1 | 1 | да |
| 19.07 | 27 | inconclusive ×27 | 27 | НЕТ (21.07) — предварительное |

verdictReason 100%: input_projection_incomplete; сопутствующие:
intervention_overlap + below_min_independent_players (max N=3 при пороге 10);
missing_entry_impression/missing_position_evidence 15/17/12/0/11;
missing_skin_cover_identity 5/5/4/0/3.

## Сквозные факты
- builtin sort e2cd2919 во всех 5 окнах, N 3→1→2→1→1.
- 19.07 впервые: merge ×6, pins ×2, drama ×1 (+sort ×18), builtin-строк 10.
- Воронки: Σ impressed=98, win=70, lose=0, abandon=10.
  606ecf79 15.07: L1 imp2/win1/aband1/att5, chest=1.
  18ba76d4 16.07: L1 imp1/win1/att9, chest=1.
- Dwell: p50/p95 = null во всех 92 строках (uncensored=0).

## Data-quality
19.07 досрочное (settledThrough в будущем, rev1 — возможна пере-материализация);
entryAcceptance qualified=0 везде; lose=0 на весь датасет;
manualAcceptedStateChangingActions=0 везде; unattributableDecisions=0;
unattributedLegacyImpressions 47/2/12/0/0.

## Чего в данных нет
Ни одной строки N≥10; ни одного не-inconclusive вердикта; ни одного
uncensored dwell; ни одного lose; ни одного qualified-игрока;
settlement 19.07 не завершён.

Дисциплина: C2-выводов нет.

---
## Приложение оркестратора (вне роли аналитика): инженерные сигналы
1. input_projection_incomplete у 100% строк — систематический пробел входной проекции.
2. Dwell 100% цензурирован — конвейер active-dwell не завершает интервалы.
3. lose=0 при 98 impressed — состояние проигрыша не доезжает до результатов.
4. qualified=0 везде — критерий qualified-play не срабатывает.
Кандидат: диагностический срез «projection completeness» ДО friend cohort.

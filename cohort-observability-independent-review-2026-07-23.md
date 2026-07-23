# Independent review — Cohort Observability Component A + reserve-host A1

Reviewer: Claude (оркестратор). Date: 2026-07-23.
Reviewed heads: swipe-backend PR #7 @ `e583bd6501599ce7e8c5033c137c7e62deacc995`;
swipe-agents PR #2 @ `d88ed17b3c01de6687d92b7b9dc59873f888a184`.
Spec base: meta `98fc826` (handoff v1.1). CI перепроверен независимо:
backend run 30006073356 — все джобы pass (включая migration roundtrip
cohort-observability-0049); agents `verify` — pass.

Все 11 пунктов backend-скоупа и все 6 пунктов ledger-скоупа review-request
проверены по коду и подтверждены; отдельно подтверждено, что varchar(16)-починка
в `test_catalog_artifact_postgres.py` fixture-only (прод-код длинный токен не
писал — падал собственный seed теста), а канонический C1 не изменён
(user_ids-фильтр additive с дефолтом None; новые поля ContentObservation не
входят в canonical-документ).

## Findings

```text
1. [P3] swipe-backend/app/cohort_observability_delivery.py:135 — forbidden-substring
   проверка рендера сканирует всё сообщение, включая операторские cohortSubjectId;
   грамматически валидный subject id вида "runway-a"/"verdict-x" заставит
   render_digest_message падать на каждой попытке и доведёт доставку всего
   когортного дайджеста до failed_terminal. Это операционный dead-end,
   предотвратимый на этапе конфига: запретить forbidden-токены внутри
   cohortSubjectId в валидаторе CohortObservabilityConfigV1.

2. [P3] swipe-backend/app/cohort_observability_delivery.py:140 — лимит 4096
   проверяется только в момент доставки; 50 subject id максимальной длины
   (32 символа) легально превышают его, делая доставку детерминированно
   failed_terminal после исчерпания попыток. Worst-case размер рендера стоит
   валидировать при регистрации конфига (или паджинировать сообщение).
   Операционный риск, не privacy.
```

swipe-agents PR #2: **no P1/P2/P3 findings** — realpath-гарды корректны
(оба entrypoint'а), non-zero проверки закрывают placeholder-инциденты,
`reserve-host-acceptance-2026-07-23.md` честно разделяет verified/not-proved и
не выдаёт ни одну незакрытую позицию за пройденный гейт (включая zero-id
start-line как невалидный якорь, тот же физический диск бэкапа как принятый
attended-риск и то, что установленный релиз предшествует PR #2).

## Verdict

Оба P3 — не блокеры merge (операционные foot-guns, проявляются только на
будущих реальных конфигурациях); прошу авторскую диспозицию fixed/rejected —
config-time фиксы точечные. **P1/P2 отсутствуют.** Merge-решение, релиз A1,
три /bind, физические drills, quiet-week и production N=1 остаются отдельными
человеческими гейтами по packet'у — этим ревью ни один из них не пройден.

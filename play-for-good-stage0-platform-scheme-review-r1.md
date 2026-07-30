# Stage 0 P5 platform-scheme — Claude review R1

Дата: 30.07.2026.  
Reviewer: Claude Code 2.1.220 (`opus`, high effort, read-only).  
Exact reviewed commit: `3b7a528`.  
Вердикт: **EARLY NO-GO** — 2×P1 и 14×P2; публикация не проверялась и
не считается выполненной.

## Disposition

| Finding | Disposition |
|---|---|
| P1: protective surface названа доказанной до authenticated smoke и T+24 | Принято: `proven` ограничен initial manifest/route split; authenticated smoke и T+24 явно остаются gate |
| P1: impact formula потеряла X%, верхнюю границу need+stretch и rollover | Принято: полная формула возвращена в карточку, компактные инварианты — в rail |
| P2: mission помечен frozen при DRAFT v8 | Закрыто authority: отдельная diff-проверка R8 дала GO, статус ТЗ и receipt обновлены |
| P2: safety помечен «спроектировано» при частично живом коде | Принято: `part` |
| P2: `stage 0` не входит в stage-enum | Принято: mission=`spec`, safety=`code`; Stage 0 перенесён в line |
| P2: owner mission указывал только Stage 1 | Принято: Stage 0 v7 + Stage 1 после baseline |
| P2: точные 8 маршрутов без якоря | Принято: добавлен route-manifest и exact commit |
| P2: отсутствовала граница authority партнёра | Принято |
| P2: recall scope не включал case | Принято: `entry/runtime/case` |
| P2: гарантия платформы не видна в шапке | Принято |
| P2: north star не называл incremental/holdout | Принято |
| P2: виральность не начиналась с campaign-first link, а social-only была сужена | Принято: главная единица возвращена; отложены только обязательные social-only коллекции |
| P2: нет отдельной comprehension-гипотезы | Принято: добавлена `mission-comprehension` |
| P2: mission events отсутствовали в funnel | Принято: добавлены contribution/UNLOCKED/FULFILLED и пояснение асинхронности |
| P2: HTML title остался swipe | Принято |
| P2: стрелка mission→feed пересекалась с catalog→feed | Принято: маршрут сдвинут вправо и посажен на нижнюю границу feed |

Non-blocking accessibility observations R1 (SVG accessibility tree,
полные tab semantics, focus trap) предсуществуют и не являются
условием Stage 0; они остаются backlog, если финальное визуальное
ревью не повысит severity.

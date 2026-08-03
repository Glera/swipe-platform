NO-GO

# Кросс-ревью meta PR #55 (Gate C / Gate C0), exact head 63e67a0

- Дата: 03.08.2026. Reviewer: Claude (Fable 5). Author = Codex.
  Diff-only, read-only; эксперименты — в одноразовых каталогах скретчпада.
- Exact head: `63e67a0caa0434d52a028aba15154683405dd8a5`
  (предыдущее моё ревью — `fca5b25`, вердикт GO WITH CONDITIONS).
- Дельта: +1810/−62 по 17 файлам; новый инструмент замены Blueprint (480
  строк + 269 тестов), переписанный контракт (215 строк), три квитанции.
- Связанный вердикт: backend PR #49 @`7a04bb7` — **GO** (выдан отдельно).

## Вердикт

**NO-GO.** Мои три прошлых замечания сняты корректно, но новая поверхность —
инструментарий Gate C0 — не выдерживает той же планки, что уже принятый
эталон `platform-reliability-r1-db-capability-compare.mjs`.

## Что закрыто корректно

1. **Precondition 5 переформулирован через доказуемое следствие** — ровно как
   я предлагал: успешное сравнение по схеме v2 само доказывает, что прямая
   ACL-авторитетность в пределах допуска, а сырые счётчики намеренно не
   коммитятся.
2. **Auto Sync получил проверяемую квитанцию**
   (`…-gate-c-blueprint-autosync.json`: `syncStatus=paused`, `autoSync=No`,
   `controlDisabled=true`) плюс требование перепроверки непосредственно перед
   актом.
3. **Мой P2 про commit-триггер закрыт разворотом, а не оговоркой.** Старый
   Preview помечен `stale:true` с причиной, precondition 6 требует
   `stale=false` — то есть закоммиченный артефакт принципиально не может
   удовлетворить условие и вынуждает свежий захват. Precondition 7 сокращён до
   трёх строк `DATABASE_URL`, и любая строка `auto-deploy-trigger=commit`
   объявлена NO-GO. Различие «PR #49 — hardening пути деплоя, а не containment
   инцидента с хуком; триггеры сервисов и приватный sync-хук — разные пути
   авторитета» зафиксировано верно.
4. **Квитанции инцидента и ответа провайдера честные.** Блок `evidenceLimits`
   прямо фиксирует, что remediation провайдером не выполнялся, терминальной
   инвалидации нет, непрерывность релинка не наблюдалась и аудита
   использования хука Render не предоставил. `hookCanInitiateBlueprintSync:
   true` подтверждает мою исходную оценку радиуса.
5. **Дизайн Gate C0 в целом верный**: удаление делает безопасным само по себе
   (шаг 5 — «если Render не покажет ограниченный Preview до мутирующего
   действия, стоп; удаление само по себе есть containment»), а
   `targetBlueprintId` инцидента привязан к **скомпрометированному**, а не к
   новому Blueprint.

## Блокирующие находки

### P2-A. Судьба blueprint-управляемых env-переменных при удалении Blueprint не установлена, а окно C0 не ограничено

`DATABASE_URL` у всех трёх потребителей объявлен как
`fromDatabase: {name: swipe-db, property: connectionString}`
(`swipe-backend/render.yaml:28,363,381`), то есть управляется блюпринтом.
Контракт нигде не устанавливает, что происходит с такими переменными при
удалении объекта Blueprint, а Render это подтвердить не смог —
`serviceRelinkContinuityObserved: false`.

При этом окно между удалением и созданием нового блюпринта не ограничено:
шаг 5 явно допускает остановку в удалённом состоянии. А
`swipe-seq-shadow-run` стартует ежечасно в `:15` (`schedule: "15 * * * *"`),
`swipe-c1-materialize` — ежедневно в 02:30. То есть в пределах часа после
удаления запустится новый контейнер, которому надо разрешить эту переменную.
Работающий web переживёт (окружение уже разрешено), но первый же рестарт или
cron проверит гипотезу на живом проде — с отложенной атрибуцией отказа.

**Фикс:** дозадать Render вопрос в том же открытом треде (что происходит с
`fromDatabase`-переменными и env сервиса при удалении блюпринта); приостановить
оба cron на время окна C0; ограничить окно и описать, что делать, если
пересоздание не может продолжиться.

### P2-B. Терминальные дайджесты зависят от локали хоста

`scripts/platform-reliability-r1-blueprint-replacement-compare.mjs:251`
сортирует сервисы через `left.serviceId.localeCompare(right.serviceId)` без
указания локали. Этот порядок входит в `linkedServiceIdsSha256`,
`linkedServiceConfigurationSha256` и в байты `comparison.json`, которые затем
проверяются побайтно (`--verify-json`) и вшиваются в квитанцию как
`terminalProofSha256`.

Воспроизведено на реалистичных Render-id:
```
en-US → d95tq3 , d95zq3
et-EE → d95zq3 , d95tq3      (эстонская локаль ставит z между s и t)
кодпойнтно → d95tq3 , d95zq3
```
Принятый эталон `db-capability-compare.mjs` не использует `localeCompare` ни
разу (0 вхождений) — везде кодпойнты. Хуже: валидатор считает свой аналог
кодпойнтным `.sort()` и требует равенства — при расходящейся локали цепочка
доказательств запирается насмерть с непонятным сообщением.

**Фикс:** кодпойнтное сравнение, как в эталоне.

### P2-C. `parseSupport()` принимает caller-authored JSON шире заявленного

`…-compare.mjs:303-337`: только `plainObject` плюс семь листовых равенств. Ни
`exactKeys` на корне, ни на `providerStatements`/`evidenceLimits`; поля
`observedAt`, `channel`, `responseActorKind`, `nextAuthorizedBoundary`,
`secretValueSubmitted` не читаются вообще. Support-документ, заявляющий
`responseActorKind:"automated_bot_reply"`,
`channel:"anonymous_forum_post"`, `observedAt:"not-a-timestamp"`,
`nextAuthorizedBoundary:"no_operator_go_required"` и
`secretValueSubmitted:true`, даёт `replacementSafe = true`.

Это прямая регрессия против эталона, где `assertExactKeys` применяется к
четырём узлам. **Фикс:** `exactKeys` на трёх узлах плюс типизация остальных
полей; `secretValueSubmitted !== false` должно быть отказом.

### P2-D. У «перекрытого» инцидента нет временно́й границы

`…-operator-receipt-validate.mjs:1652-1679`: предикат supersession требует
совпадения цепочки blueprint-id, но не требует, чтобы замена произошла
**после** перекрываемого инцидента. Прогон `validateOperatorEvidence` с
инцидентом, чья continuity-аттестация наблюдает уже удалённый
`blueprint-main`, даёт `ACCEPTED: pass`. То есть аттестация непрерывности
выдаётся на объект, которого в момент наблюдения не существует.

**Фикс:** требовать `candidate.dispositionCompletedAt >=
incident.continuityAfterObservedAt`.

### P2-E. evidence-scan читает те же байты дважды и не сверяет два дайджеста

`…-evidence-scan.mjs:377-436,531-538`: `readArtifact()` существует ради
fstat-до/после, `O_NOFOLLOW`, `nlink==1`, но компаратор вызывается по путям,
то есть повторно открывает файлы без этих гарантий — и в квитанцию идут
дайджесты **второго** чтения. `blueprintValidation.beforeSha256` и
`beforeArtifact.metadata.sha256` нигде не сравниваются. Соседний delta-путь
сделан правильно (байты прокидываются). **Фикс:** сверить дайджесты либо
прокинуть байты.

### P2-F. Компаратор доказывает только внутреннюю согласованность двух операторских документов

`commandSha256`, `databaseBindingSha256`, `environmentShapeSha256`,
`sourceDatabase.configurationSha256`, `oldBlueprintAbsence.evidenceSha256` —
самозаявленные хэши без определённого прообраза. В `scripts/` нет
инструмента, который их вычисляет (ср. `platform-reliability-r1-db-capture.mjs`
для БД-стороны), в контракте рецепта тоже нет. Фактически «service
continuity» = оператор дважды написал одни и те же 64 hex; фикстуры теста это
и демонстрируют (`after` = `structuredClone(common)` со сменой id).

Это durable-правило проекта: «a self-hashed evidence document is not external
authority». Вместе с P2-A это значит, что заявление о непрерывности сервисов
в C0 не имеет независимого основания ни со стороны провайдера, ни со стороны
инструмента. **Фикс в рамках PR:** как минимум выразить границу в выводе
(`evidenceClass: "operator_attested"`), чтобы `replacementSafe:true` ниже по
цепочке не читалось как provider-verified.

### P2-G. Инертная инъекция в двух местах

- Мутация, снимающая **сразу оба** предохранителя evidence-scan (аргумент
  `--verify-json` и `if (!blueprintValidation.replacementSafe) fail(...)`),
  оставляет весь набор зелёным (9/9).
- Удаление всего блока `fail('support response does not authorize the bounded
  replacement path')` оставляет тесты компаратора зелёными (4/4).

Мутационная сводка прохода: compare 23 мутации / 13 выживших;
receipt-validate 15 / 6; evidence-scan 11 / 9.

## P3

- Мёртвые клаузы, выглядящие как проверки: `autoSyncState` (`:367-370`),
  `sourceRepository`/`sourceBranch`/`blueprintPath` (`:359-366`) недостижимы
  из-за enum'ов выше; поле вывода `autoSyncDisabled` константно `true`, но в
  квитанции читается как результат проверки. То же в валидаторе
  (`sourceIdentity`, `autoSyncState !== 'disabled'`).
- Противоречие «invalidated»: компаратор **требует**
  `oldHookTerminallyInvalidated === false`, а валидатор жёстко маппит
  `replace_blueprint → terminalOutcome:'invalidated'` — квитанция штампует
  «invalidated» поверх evidence, зафиксированного как терминально не
  доказанное.
- `canonical()` компаратора — голый `JSON.stringify` без сортировки ключей
  (эталон использует `stable()`); сейчас безопасно, но ловушка при рефакторе.
- `acceptedRenderResidual` в `normalizedIncidents` нигде не читается.
- `SAFE_ID_RE` компаратора допускает верхний регистр, валидатора — нет.
- `evidence-scan` матчит инцидент литералом, валидатор держит константу
  `REQUIRED_SECRET_EXPOSURE_ID` — должна быть одна.
- Значение хука по-прежнему существует на диске в Codex-сессии
  (`contentDeletedOrRewritten: false`), права сужены до 0600. Это containment,
  не устранение; файл станет инертным только после замены Blueprint. Порядок
  защитим, но контракт должен это сказать и добавить follow-up на вычистку
  либо явное принятие.

## Проверено-чисто

- Существенный дрейф Blueprint компаратор действительно ловит: смена
  `kind`/`plan`/`environmentShapeSha256`/`databaseBindingSha256`, лишний
  сервис → `differences`; смена репозитория/ветки/пути → typed refusal; чужой
  `affectedBlueprintId`, устаревший `lastSyncAt`, перевёрнутый порядок
  наблюдений, 404 старого Blueprint раньше after-наблюдения — все отказы.
- Приватность вывода сохранена: только имена полей в `differences`, id
  сервисов только как sha256, сообщения об ошибках печатают label и enum, но
  не значения. `hookValueObserved`/`secretsCaptured` обязаны быть `false` на
  обоих наблюдениях, обе проверки покрыты тестами. Hook-URL, DATABASE_URL и
  имён ролей в новом коде нет ни на одном пути.
- Fail-closed структуры: `plainObject` отвергает null-прототип и массивы,
  `exactKeys` применён к observation/blueprint/sourceDatabase/service/
  oldBlueprintAbsence, `utcValue` проверяет и формат, и реальность инстанта,
  `parseArgs` отвергает нечётный argv, дубли и неизвестные опции.
- Существующие проверки валидатора не ослаблены; часть новых инвариантов
  честно покрыта (привязка `linkedServiceIdsSha256` к закрытому набору
  потребителей, привязка `sourceSha` к `pinnedSourceSha`, равенства before/
  after, метка `replaced_same_source_and_services`).
- Локальные наборы зелёные: compare 4/4, evidence-template 3/3,
  operator-receipt-validate 19/19, evidence-scan 9/9.

## Условие следующего раунда

Закрыть P2-A…P2-G и обновить контракт (окно C0, судьба `fromDatabase`,
приостановка cron, граница `operator_attested`). Прислать fixed exact SHA.
Следующий раунд повторит: локальную зависимость дайджестов, поддельный
support-документ, перекрытый инцидент с наблюдением удалённого Blueprint,
мутацию обоих предохранителей.

Вердикт — evidence, не authority: Gate C0, Approve, замена Blueprint и Gate D
остаются отдельными операторскими решениями.

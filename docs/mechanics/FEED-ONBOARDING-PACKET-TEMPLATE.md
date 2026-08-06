# `<mechanic>` → production feed onboarding packet

Статус: DRAFT / REVIEWED / EXECUTED
Владелец механики: `<agent/person>`
Независимый ревьюер: `<frontier reviewer>`
Дата: `<YYYY-MM-DD>`

Authority процесса:
`swipe-backend/docs/specs/mechanic-onboarding.md`.

## 1. Что добавляем

- playable ID: `<id>`;
- variant ID: `<uuid>`;
- mapping ID: `<uuid>`;
- mechanic family: `<family>`;
- catalog mechanic: `<family/base>`;
- mapping digest: `<64hex>`;
- mapping manifest: `<repo-relative path>`;
- mapping provenance actor: `<provenance.registeredBy; exact --actor>`;
- утверждённая позиция: после `<existing playableId>`.

## 2. Release readiness

- source commit: `<sha>`;
- direct production URL: `<https://...html>`;
- runtime version: `<version>`;
- runtime artifact digest: `<sha256:...>`;
- exact production `versions.json` digest: `<64hex>`;
- exact `variantId` exists: yes / no;
- variant creation evidence: `<legacy/builtin /api/runs/start without decision_id; exact ticket, mechanic_id + variant_id>`;
- series length: `<N>`;
- client/backend series-policy parity: PASS / FAIL;
- repository verify links/receipts: `<links>`;
- direct play/cover/payload observation: PASS / FAIL.

## 3. Fresh production snapshot

- active activation ID: `<uuid>`;
- active roster hash: `<64hex>`;
- active entry count: `<N>`;
- mapping registry classification: `create` / exact `replay`;
- Composer manifest source:
  `https://swipe-platform.onrender.com/versions.json`;
- Composer manifest digest: `<64hex>`;
- Composer platform base: `https://swipe-platform.onrender.com/`;
- Composer sees playable: yes / no.

## 4. Planned diff

- added: `[<new mapping UUID>]`;
- removed: `[]`;
- reordered: `false`;
- target position: `<1-based position>`;
- unrelated changes: none.

Любое отличие от этого diff сжигает review/GO.

## 5. Mapping dry-run

- working directory: `<absolute or repo-relative checkout>`;
- exact actor: `<must equal provenance.registeredBy>`;
- exact command: `<ready to paste; secrets/connection holder are not embedded>`.

```json
<exact stdout: status, counts, mapping identity/digest>
```

Acceptance: ровно один ожидаемый `create` либо exact `replay`, конфликтов нет.

## 6. Independent review

- reviewed commit/file digest: `<sha/digest>`;
- verdict: GO / NO-GO;
- findings/disposition: `<summary or none>`.

## 7. Operator GO

```text
GO <mechanic> feed onboarding. Разрешаю ровно один reviewed mapping apply,
затем одну Lab Composer CAS activation с current activation <uuid>, production
manifest digest <64hex> и diff: added [<mapping uuid>], removed [],
reordered=false, position <N>. Любой drift — STOP; retry/другие production
изменения не разрешены.
```

## 8. Execution receipts

### Mapping

```json
<exact apply stdout>
```

### Composer

```json
<exact typed activation receipt>
```

Если HTTP-ответ потерян, blind retry запрещён. Сначала перечитать state. Если
target roster уже active, сохранить server projection как recovery evidence и
пометить typed response как потерянный; если нет — запросить fresh GO.

## 9. Наблюдаемая приёмка

- Mini App полностью перезапущен дважды: yes / no;
- карточка видна на позиции `<N>`: yes / no;
- playable запускается и принимает input: yes / no;
- terminal result/series complete: yes / no;
- server decision связан с expected activation/mapping: yes / no;
- `roster_entry_unavailable`: 0 / `<count>`;
- `roster_fallback`: 0 / `<count>`.

Итог: PASS / FAIL.

## STOP-условия

- playable отсутствует в production manifest;
- mapping bytes/digest не совпадают с reviewed artifact;
- current activation изменилась после review;
- Composer использует local/stale manifest;
- Composer preview origin не production;
- diff содержит removal/reorder или другую позицию;
- direct playable/series policy не прошли проверку.

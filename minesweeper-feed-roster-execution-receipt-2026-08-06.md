# Minesweeper feed roster — production execution receipt

Дата: 2026-08-06
Статус: **PASS**
Reviewed authority:
`minesweeper-feed-roster-packet-2026-08-05.md` +
`minesweeper-feed-roster-claude-review-2026-08-05.md`

## Результат

Minesweeper добавлен в server-owned production roster на позицию 5, появился
в Telegram Mini App после двух перезапусков и был пройден оператором. Mapping,
roster и activation зарегистрированы append-only штатными authority-сервисами;
прямых SQL writes не было.

## Пины

- backend authority:
  `0e9e940a2a762f0e35f93c3e35f3afcfea6baaa4`;
- production DB revision: `0073_platform_release_receipts`;
- playable: `minesweeper-v1-swipe`;
- variant: `8fea2760-c422-d071-ad0e-35ab4c909c4d`;
- runtime version: `a62f94702b`;
- runtime artifact:
  `sha256:31687c400a53bb7a844fdfc1a76a7475f13aab5763cc8fd82d9db13343e76220`;
- exact production `versions.json` SHA-256:
  `d0b15849c92bdd681bd3fd143b4c92644959d3e363af160153c1bc38b66c0b82`.

## Mapping apply

Operator GO ограничивал акт одним mapping apply. Process-local
`ENABLE_FEED_MAPPING_REGISTRY_OPS=true`; persistent Render env не менялся.

```json
{
  "status": "applied",
  "mode": "apply",
  "counts": {"total": 1, "create": 1, "replay": 0},
  "mappingId": "c47b75ff-1e9b-43ae-aa53-fca5e8bb86a4",
  "mappingDigest": "6237927d6093aab4fc67d893d6ea943c1a2f2bededeffa7534fa3ee97da1a4fd"
}
```

Read-only verification после commit: registry count `15`, exact Minesweeper
row active, identity/digest совпадают с reviewed manifest.

## Roster registration

Dry-run до GO: `entryCount=15`, added — только Minesweeper mapping,
`removed=[]`, `reordered=false`.

Apply receipt:

- roster ID: `d43544b1-f72a-439e-8ab6-ead899a2c841`;
- roster hash:
  `7a9418ddcb1e495521ad0f04a0191da486e3325477af5808edb45903812a9d30`;
- `created=true`;
- прежняя active activation осталась
  `123ad86c-df97-4f9f-872b-6255fce36f4f` до отдельного CAS apply.

## CAS activation

Dry-run сверил fresh current activation, exact production manifest и diff.
Operator GO пиннил все три значения.

- activation ID: `837fdee2-6d6f-4676-9080-2ad4d7434c57`;
- previous activation: `123ad86c-df97-4f9f-872b-6255fce36f4f`;
- intervention ID: `4f3cc955-8be6-4adf-980f-9f36f482ef9b`;
- request hash:
  `00ca862c8da1f4dcaae1fb21d4d2ca93aa6b5ddbdc09323796f0fcb21942d819`;
- deploy manifest digest:
  `d0b15849c92bdd681bd3fd143b4c92644959d3e363af160153c1bc38b66c0b82`;
- `added=[c47b75ff-1e9b-43ae-aa53-fca5e8bb86a4]`;
- `removed=[]`, `reordered=false`, `replayed=false`.

Fresh production projection: 15 active entries; Minesweeper is entry 5, after
Arrows, with exact mapping/variant/catalog identity.

## Наблюдаемая приёмка

Оператор 06.08.2026 подтвердил: «Есть сапёр в ленте» и сыграл механику.
Server-side evidence той же сессии:

- `unit_shown` для `minesweeper-v1-swipe`, `feed_pos=4`;
- `first_input` и `series_start`;
- два manual `win` и два `series_complete`;
- feed decision связан с activation `837fdee2…` и mapping `c47b75ff…`;
- `roster_entry_unavailable` и `roster_fallback` в проверенных сессиях
  отсутствуют.

HTML и payload production playable возвращали HTTP 200; payload bytes `55454`,
version/hash `a62f94702b`.

## Process disposition

Первый проход намеренно разделял mapping/register/activate на три GO и три
низкоуровневых CLI-акта. Это bootstrap evidence, а не дальнейший штатный UX.
Новый эталон описан в
`swipe-backend/docs/specs/mechanic-onboarding.md`: один reviewed mapping apply,
затем визуальный Lab Composer (preview + diff + register/activate одним POST) и
два перезапуска Mini App.

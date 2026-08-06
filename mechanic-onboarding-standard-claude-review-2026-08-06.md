# Mechanic onboarding standard — independent Claude review

Дата: 2026-08-06
Ревьюер: Claude Fable 5, max effort, отдельная read-only CLI-сессия
Итог: **GO**

## Scope

Ревью сверяло новый штатный путь с committed-кодом:

- backend base `0e9e940a2a762f0e35f93c3e35f3afcfea6baaa4`;
- generator base `5d1ae26`;
- backend operator guide;
- generator Composer docs, lost-response copy и browser test;
- root packet template и Minesweeper execution receipt.

Никаких dispatch, production writes или редактирования ревьюер не выполнял.

## Reviewed final bytes

| Artifact | SHA-256 |
| --- | --- |
| `swipe-backend/docs/specs/mechanic-onboarding.md` | `72fec9f3cc0f053b7237383e4ef6ef8eb4e0923e3762f196960a858216d7c78b` |
| `swipe-generator/README.md` | `c22e14e47a9020f77a8f350df0011b040d355200fa3e12ae0df565f1b3901447` |
| `swipe-generator/public/lab.js` | `bb9d7d7d9e17a1cf530835b13aaadab5c28ced2562321043c48c4890b83a2a42` |
| `swipe-generator/test/lab-ui-roster-composer.test.mjs` | `e368ea1eb9676799d7686562bdf9b94f8bcdcbf0118462be21ffb744787ebd61` |
| `docs/mechanics/FEED-ONBOARDING-PACKET-TEMPLATE.md` | `2db4317a83c8cb77bcac340c837b53af03edbd283ca9978733e1a7c349a68a1b` |
| `docs/mechanics/README.md` | `430a172fddebfd71d5ddc21a5bd1c1b7338c89b348d7ad67bf4f194bc22343f6` |
| `minesweeper-feed-roster-execution-receipt-2026-08-06.md` | `4961973e05d78b32df5957d6b900c7e440eb420912f744e0c512459933b58e27` |

Последние три механические правки после delta-GO уточнили exact route
`POST /api/runs/start`, legacy/builtin wire без `decision_id` и то, что
catalog/player-v2 decision-wire не создаёт legacy `Variant`. Они закрывают
единственный оставшийся P3 без расширения authority или поведения.
После GO в трёх Markdown-шапках удалены только trailing spaces, чтобы
`git diff --check` был чист; значения таблицы выше пересчитаны по итоговым
байтам.

## Findings and disposition

| Finding | Severity | Disposition |
| --- | --- | --- |
| Не был описан легитимный источник legacy `Variant` для новой механики | P2 | Принято: exact legacy/builtin run evidence добавлено в release prerequisites и packet; если supported path отсутствует — STOP, SQL запрещён |
| Manifest мог измениться после старого refresh | P3 | Принято: final refresh непосредственно перед confirmation; drift current activation/manifest сжигает GO |
| Preview origin не был связан с production | P3 | Принято: отдельно пинятся `SWIPE_DEPLOY_MANIFEST` и `SWIPE_PLATFORM_ORIGIN`; проверяется `/v1/lab.platformBase` |
| Transport loss ошибочно говорил «команда не ушла» | P3 | Принято: copy теперь говорит «исход неизвестен», запрещает blind retry и требует state re-read; browser transport-failure test зелёный |
| `--actor` не был явно связан с manifest provenance | P3 | Принято: packet и guide требуют exact `provenance.registeredBy` |

Ревью подтвердило по коду:

- Composer state проецирует active roster, registered rollback configs и active mappings;
- production manifest читается bounded/redirect-free и хэшируется по exact bytes;
- один Composer POST выполняет register+activate в одной DB-транзакции;
- stale head даёт CAS conflict, partial mapping без activation остаётся инертным;
- rollback активирует предыдущую server-owned registered config новой append-only
  activation;
- три отдельных roster CLI/GO из Minesweeper bootstrap не нужны в штатном пути.

## Verification

- generator `npm run check` — PASS под Node 24;
- `test/feed-roster-lab-client.test.mjs` +
  `test/lab-ui-roster-composer-ux.test.mjs` — 14/14 PASS;
- `test/lab-ui-roster-composer.test.mjs` — PASS, включая transport loss;
- root `node --test 'scripts/*.test.mjs'` — 163/163 PASS;
- `docs-boundary-lint` и `git diff --check` — PASS.

## Publication

- backend PR #56 merged as `332885831213e6b4f0554b5b00372e73a4da8ca2`;
- generator PR #10 passed its exact-head CI and merged as
  `1257aa72d4f17042c764d50822195792b2bd4c7c`.

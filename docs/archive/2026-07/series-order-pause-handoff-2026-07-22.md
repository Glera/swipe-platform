# Series Order — pause handoff (2026-07-22)

## Цель

Довести операторский заказ серии до обычного Workshop draft через две независимые reusable-плоскости:

1. фабрика левел-дизайна;
2. фабрика сеттинга;
3. обязательный human review каждой новой фабрики;
4. генерация и human review exact output;
5. материализация серии и стандартный Telegram Approve.

Цель **не завершена**. Пауза стоит ровно на первом человеческом вкусовом гейте; технического блокера нет.

## Зафиксированный код

### Series Order

- Репозиторий/worktree: `/Users/gleb/My projects/p4g-platform-workspace/swipe-generator-series-order-integration`
- Ветка: `codex/series-order-integration`
- HEAD/push: `5bd77e6d45a09a919857082a1d7c4ec9b1f4e3b8`
- Дерево после коммита: чистое.
- Срез добавляет provider-free создание фабрик, immutable build/proof/review/admission, обе независимые дорожки в UI и продолжение в существующий Series Factory/Workshop.
- UX hardening в том же коммите: тёмный proof читаем; чек-лист и комментарий переживают 5-секундный auto-refresh.

### Canary console (отдельный, ещё не включённый срез)

- Backend: ветка `codex/catalog-canary-console-impl`, commit `8021720`.
- Generator: ветка `codex/catalog-canary-console-impl`, commit `8f4cb64`.
- Состояние: подготовлено default-off, не merged/deployed/enabled.
- Возможности после включения: candidate → один приоритетный canary-показ → retest / permanent rotation / pause.

## Живой локальный заказ

- URL: `http://127.0.0.1:4320/lab?view=orders&order=baf7ba65-ac98-4ae9-9219-fafefa10ec98`
- Вкладка: `Заказы`.
- Order ID: `baf7ba65-ac98-4ae9-9219-fafefa10ec98`
- Order hash: `194876de4530fdbe219c4ef7aab4f148e3bab343b97ff27c69be3b015f40fac4`
- Статус заказа: `factories_resolving`.
- Level lane: `factory_review_pending`.
- Level factory hash: `397663f7075f10fbb146877297a085923b8e413a222808b5cad2bf47e93a4393`.
- Review target: `factory-e18bdce9c8a41b4d6c8932c75efd57b894b51d36079d6f437380b58e0694c563`.
- Setting lane: `factory_requested`; её build намеренно не начинается до решения по level factory.
- Текущий blocker: `Нужно отсмотреть proof новой фабрики`.

Локальные durable bytes перенесены из `/tmp` в:

`/Users/gleb/My projects/p4g-platform-workspace/swipe-generator-series-order-integration/.data/series-order-final-e2e`

Не создавать новый заказ и не копировать старый `/tmp` поверх этой директории.

## Единственный следующий человеческий шаг

На `4320/lab` открыть текущий заказ → `Открыть proof и отсмотр фабрики`:

1. открыть три sample;
2. проверить пять пунктов;
3. выбрать `Фабрика подходит`, `Вернуть на доработку` или `Закрыть фабрику`.

Не ставить `good` автоматически: это taste authority оператора.

После человеческого verdict продолжить через UI/сервис, не редактируя store вручную:

1. зафиксировать verdict/admission в order projection;
2. собрать factory setting;
3. показать её provider-free proof и дождаться второго human verdict;
4. сгенерировать три setting output и дать оператору выбрать один reviewed мир;
5. сгенерировать три уровня, дождаться level reviews;
6. материализовать один Workshop draft;
7. пройти series review и стандартный Telegram Approve;
8. затем отдельные cross-repo review/merge/deploy/status.

## Как восстановить локальный сервер `4320`

Штатный `http://127.0.0.1:4317/lab` работает с `swipe-generator/master` и нового экрана пока не содержит. Для этого среза нужен `4320`.

```bash
cd '/Users/gleb/My projects/p4g-platform-workspace/swipe-generator-series-order-integration'
env \
  SWIPE_GENERATOR_MODEL_PREFLIGHT_PROBE=0 \
  SWIPE_GENERATOR_DATA="$PWD/.data/series-order-final-e2e" \
  SWIPE_GENERATOR_PORT=4320 \
  P4G_WORKSPACE_ROOT='/Users/gleb/My projects/p4g-platform-workspace' \
  SWIPE_UGC_ROOT='/Users/gleb/My projects/p4g-platform-workspace/swipe-ugc' \
  npm start
```

Проверка сохранённой проекции:

```bash
curl -fsS 'http://127.0.0.1:4320/v1/series-orders/baf7ba65-ac98-4ae9-9219-fafefa10ec98'
```

## Проверки перед паузой

- Focused Series Order/factory suite: `44/44`.
- Registry/builder/UI regression subset: `19/19`.
- Full generator verify: `504/508`.
- Четыре падения воспроизведены на baseline master и не относятся к срезу:
  - три `swipe-ugc checkout differs from the accepted worker commit`;
  - frozen `derivation v1 identity` hash mismatch.
- Живой браузерный smoke:
  - order/detail/proof открываются;
  - computed colours proof: тёмный фон + светлый текст;
  - checkbox/comment сохраняются после реального auto-refresh;
  - human verdict не отправлялся.

## Что не делать при возобновлении

- Не путать `4317` и `4320`.
- Не merge/deploy без независимого review ветки `5bd77e6`.
- Не включать canary-console до PG/CI acceptance и отдельного rollout-решения.
- Не обходить human factory review прямой записью admission.
- Не переносить mutable status в root `CLAUDE.md`; rollout-status после merge живёт в backend `IMPLEMENTATION-STATUS.md`.

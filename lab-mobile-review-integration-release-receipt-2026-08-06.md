# Lab mobile-review integration — release receipt

Дата: 2026-08-06. Контур: локальный `swipe-generator` / Mechanic Lab.

## Результат

Накопленная Lab-интеграция доведена до `swipe-generator/master`, а локальный
Lab на `http://127.0.0.1:4317/lab` переведён на чистый checkout этого master.
Данные, авторизация, очередь и preview-артефакты сохранены. Mobile-review
остаётся default-off до готовности backend-половины.

## Git authority

- Исходная реконсилированная голова: `d17c7a6a6b9931a8793565ad97231fbb3e4b88be`.
- База после Composer recovery: `1257aa72d4f17042c764d50822195792b2bd4c7c`.
- Проверенная integration-head:
  `f99d97043d253e960e64209bca021c57829bfa76`.
- PR: `Glera/swipe-generator#11`.
- Merge commit: `92f7a6764ade036da584fae1ef2342fb200b90a1`.
- Дерево merge-коммита побайтово равно дереву проверенной integration-head.
- Живой checkout:
  `/Users/gleb/My projects/p4g-platform-workspace/swipe-generator-live`,
  detached на exact merge commit.

Рабочий checkout оператора не очищался и не переписывался. Снапшот будущего
контура «Фабрики» остаётся в
`wip/live-checkout-2026-08-05@a7b5891`; поднимать его следует оттуда.

## Проверки до merge

- `npm run check` под Node `24.19.0`: PASS.
- Затронутые интеграционные и Composer-тесты: `55/55` PASS.
- Полный локальный `npm run verify`: `674` теста, `668` PASS, `4` FAIL,
  `2` SKIP. Те же четыре cross-repo/fixture failure воспроизведены на чистом
  `origin/master` в том же workspace; новых падений нет.
- GitHub exact-head CI `check + node:test`: SUCCESS, run `31081066011`.
- Независимый Claude Fable 5 max-effort review exact head `f99d970`: **GO**,
  P1/P2 отсутствуют. Вердикт опубликован в PR #11 до merge.

Неблокирующие P3 независимого review:

1. ручное обновление вкладки «Память» не обновляет nav-бейджи до следующего
   общего refresh;
2. `/v1/mobile-reviews/notifications` пока не имеет потребителя;
3. постоянно malformed remote verdict будет повторяться каждые 5 секунд —
   перед включением mobile-review нужен terminal backend disposition.

## Переключение живого Lab

LaunchAgent `com.p4g.swipe-generator` переведён на чистый live-checkout:

- executable: Node `24`;
- code: `swipe-generator-live/src/server-bootstrap.mjs`;
- workspace root: `/Users/gleb/My projects/p4g-platform-workspace`;
- persistent data: прежний
  `/Users/gleb/My projects/p4g-platform-workspace/swipe-generator/.data`;
- stdout/stderr: прежние файлы в `.data`;
- `SWIPE_MOBILE_REVIEW_ENABLED` не задан и остаётся выключенным.

После рестарта launchd сообщает `state=running`; API подтверждает, что
mobile-review выключен, а закрытый route отвечает обычным `404`.

## Наблюдаемая приёмка

- `/v1/feed-roster/status`: `200`, право `feed.roster:write` подключено,
  production deploy manifest доступен.
- Composer показывает активный roster из `15` механик, activation
  `837fdee2-6d6f-4676-9080-2ad4d7434c57`; Minesweeper стоит на позиции 5.
- Навигация после загрузки лёгкой проекции показывает `Прототипы 6`.
- Кнопка «Поиграть» для `minesweeper-v1-swipe` открывает игровой iframe с
  production URL; визуальный smoke PASS, ошибок/предупреждений браузерной
  консоли нет.
- Durable Claude queue и существующие Lab-данные пережили рестарт.

## Известная граница

Полная тяжёлая `/v1/lab`-проекция на текущих legacy-данных может отвечать
`series_order_corrupt`; это существовало до интеграции и не воспроизводится
как регресс её кода. Лёгкий bootstrap, Composer и production roster работают.
Следующий разумный шаг — отдельная bounded-нормализация legacy Series Order
данных, а не расширение архитектуры релиза.

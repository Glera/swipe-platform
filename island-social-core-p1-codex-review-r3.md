# Island Social Core P1 — независимое Codex-ревью R3

Дата: 2026-07-25  
Backend head: `630b8e160f93319344dfef0f1ab7f8be4b4b9752`  
Client head: `8e122aef95c7f28876bfa0520fc3fd6ae7f3f225`  
Вердикт: **GO**

Проверены только изменения после R2 и заявленный §13 evidence-пакета.
Новых находок нет.

## Закрытие R2-F001

Контракт v1.4 честно выбрал разрешённый в R2 вариант: builtin binding
задаёт identity/runtime-authority через `mechanicId`, а
`rosterRevision`/`versionsDigest` остаются rotation/audit record.
Immutable delivery не заявляется; до отдельного content-addressed контура
доставка равна текущему deploy.

Harness теперь действительно различает:

- `tpl != mechanicId`, runtime выбирается по binding;
- ротацию текущих deploy bytes `v1 → v2` под неизменным binding;
- исчезнувший `mechanicId` → fail closed, без visit/claim.

Отдельный интеграционный шаг поймал и исправил route-дефект исходного
stand-unverified harness (`.html?auto=0`). Это test-only изменение и хороший
пример того, зачем evidence прогоняется отдельно от авторского коммита.

## Закрытие R2-F002

`persistPendingFriendAccept` сохраняет cumulative attempts для того же кода,
сбрасывает счётчик только для нового кода и очищает terminal/cap state.
Новый browser harness проверяет `1→5` через reopens, отсутствие шестого
запроса и reset для нового кода.

## Verify

- backend targeted pure на P4-интеграционном superset: **28 passed**;
- client exact `8e122ae`: `tsc` + production Vite build — **PASS**;
- Alembic в полном downstream-графе:
  `0050_a11 → 0051_island → 0052_friend_idx` — один линейный head.

Неблокирующая документационная мелочь: §13 называет `c65d837`
`workspace-meta`-ревизией, хотя это ревизия `swipe-backend`; на решение о
merge не влияет.


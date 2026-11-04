# Mac A — стартовые инструкции workspace

Этот каталог — рабочая папка с вложенными репозиториями. Его корневой Git
checkout исторический (`Glera/swipe-platform`); локальные `STATE.md`,
`CLAUDE.md` и старые transfer-планы не являются актуальными правилами портфеля.
Не менять его remote/ветку и не перезаписывать пользовательские изменения.

## Актуальные инструкции — из canonical meta

Постоянная локальная копия документов:
`/Users/gleb/My projects/p4g-workspace-meta`.
Её origin должен указывать на `Glera/p4g-workspace-meta`, не на другой проект.
Это источник документов, а не место запуска Backend, Feed или Generator.

В начале рабочей задачи проверить origin, обновить ссылки и зафиксировать
один SHA документов. Сначала прочитать `STATE.md`, затем целиком `AGENTS.md`
из этого SHA и следовать указанному там порядку чтения:

```sh
git -C '/Users/gleb/My projects/p4g-workspace-meta' remote get-url origin
git -C '/Users/gleb/My projects/p4g-workspace-meta' fetch --no-tags origin master
P4G_DOCS_REF=$(git -C '/Users/gleb/My projects/p4g-workspace-meta' rev-parse origin/master)
git -C '/Users/gleb/My projects/p4g-workspace-meta' show "${P4G_DOCS_REF}:STATE.md"
git -C '/Users/gleb/My projects/p4g-workspace-meta' show "${P4G_DOCS_REF}:AGENTS.md"
```

Команды выполнять последовательно: при ошибке fetch не продолжать блок как
успешное обновление. Относительные ссылки из canonical документов читать из
того же SHA (`git show "${P4G_DOCS_REF}:<path>"`); не подменять их одноимёнными
устаревшими файлами этого workspace. Для кода читать также применимые
инструкции конкретного вложенного репозитория.

Если canonical копия недоступна, можно получить документы read-only из
`Glera/p4g-workspace-meta`, закрепив один remote master SHA. Если сеть
недоступна, явно отметить дату последней доступной версии: разрешены
независимые чтение/локальная работа, но решения, которым нужна свежая
authority/status, отложить. Старые локальные инструкции не становятся
актуальными из-за ошибки сети.

## Границы, которые нельзя потерять при старте

- Mac A владеет Platform/Backend/Feed/Mission/Seasons; Mac B —
  Generator/Playables/Labs/Researcher и живым Generator. Старый перенос не повторять.
- Обычный Feed-only polish не требует Mac B только из-за изменения Feed.
  Локальный объём проверок и полный PR CI определяются canonical правилами.
  Проверки публикации, авторизации и наград не ослаблять.
- «Проверь входящие» означает GitHub inbox из canonical `docs/dev-inbox.md`;
  старый #136 bridge, wake/replay и session-resume не запускать.
- Пользовательские dirty-файлы сохранять. Изменения правил/STATE оформлять в
  отдельной ветке canonical meta; не затирать исторические локальные документы.
  Новая задача не получает разрешений на deploy, публикацию, credentials или
  миграции только из старых receipt — действуют актуальный scope и authority.

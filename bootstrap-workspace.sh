#!/usr/bin/env bash
#
# bootstrap-workspace.sh — развернуть p4g-workspace на новой машине одной командой.
#
# Использование (после клонирования meta-repo):
#   git clone https://github.com/Glera/p4g-workspace-meta.git p4g-platform-workspace
#   cd p4g-platform-workspace
#   bash bootstrap-workspace.sh            # клоны + все установки
#   bash bootstrap-workspace.sh --check    # только показать план, ничего не делать
#   BOOTSTRAP_SKIP_INSTALL=1 bash bootstrap-workspace.sh   # только клоны
#
# Скрипт идемпотентен: существующие клоны пропускает, установки перезапускает
# безопасно. Каждый шаг печатает явный exit-код и останавливает скрипт при
# ошибке. Секретов не касается — см. чеклист в конце вывода.

set -uo pipefail

REPOS=(swipe-backend feed-prototype swipe-generator swipe-ugc playables swipe-agents swipe-platform)
NODE_REPOS=(. feed-prototype swipe-generator swipe-ugc playables swipe-agents)
GH_OWNER="Glera"
CHECK_ONLY=0
[ "${1:-}" = "--check" ] && CHECK_ONLY=1

step() { printf '\n=== %s ===\n' "$1"; }
run()  {
  printf '$ %s\n' "$*"
  if [ "$CHECK_ONLY" = 1 ]; then return 0; fi
  "$@"; local code=$?
  printf '   exit=%s\n' "$code"
  [ "$code" -ne 0 ] && { printf '!! шаг упал — останов\n'; exit "$code"; }
  return 0
}

step "0. Предпосылки"
printf 'workspace: %s\n' "$PWD"
case "$PWD" in
  */p4g-platform-workspace) ;;
  *) printf '⚠ каталог называется не p4g-platform-workspace — часть скриптов ожидает это имя в путях\n' ;;
esac
command -v git >/dev/null  || { echo '!! нужен git'; exit 1; }
command -v node >/dev/null || { echo '!! нужен node (использовался v24)'; exit 1; }
command -v python3 >/dev/null || { echo '!! нужен python3 (backend использует 3.13)'; exit 1; }
printf 'git=%s node=%s python=%s\n' "$(git --version | cut -d' ' -f3)" "$(node --version)" "$(python3 --version | cut -d' ' -f2)"

step "1. Клоны sibling-репозиториев"
for r in "${REPOS[@]}"; do
  if [ -d "$r/.git" ]; then
    printf 'skip: %s (уже клонирован)\n' "$r"
  else
    run git clone "https://github.com/$GH_OWNER/$r.git" "$r"
  fi
done

if [ "${BOOTSTRAP_SKIP_INSTALL:-0}" = 1 ]; then
  step "Установки пропущены (BOOTSTRAP_SKIP_INSTALL=1)"
else
  step "2. Python venv для swipe-backend (3.13)"
  if [ ! -x swipe-backend/.venv/bin/python ]; then
    run python3 -m venv swipe-backend/.venv
  else
    printf 'skip: .venv существует\n'
  fi
  run swipe-backend/.venv/bin/pip install -q --upgrade pip
  run swipe-backend/.venv/bin/pip install -q -r swipe-backend/requirements.txt
  run swipe-backend/.venv/bin/pip install -q -r swipe-backend/requirements-test.txt

  step "3. npm ci по node-репозиториям"
  for r in "${NODE_REPOS[@]}"; do
    if [ -f "$r/package-lock.json" ]; then
      ( cd "$r" && run npm ci --no-audit --no-fund )
    else
      printf 'skip: %s (нет package-lock.json)\n' "$r"
    fi
  done

  step "4. Playwright-браузеры (нужны тестам playables/feed)"
  run npx --yes playwright install chromium
fi

step "5. Смоук"
run git -C swipe-backend log --oneline -1
run node -e "console.log('node ok')"
[ "$CHECK_ONLY" = 1 ] || swipe-backend/.venv/bin/python -c "import fastapi, sqlalchemy; print('backend deps ok')"

step "ГОТОВО — но руками остаётся (секретов в git нет):"
cat <<'EOF'
  [ ] Claude Code auth:      claude setup-token   (+ скопировать память:
      ~/.claude/projects/-Users-gleb-My-projects-p4g-platform-workspace/memory/)
  [ ] codex auth, gh auth login
  [ ] SSH-ключи по необходимости: свой GitHub-ключ; Render ops-ключ НЕ копировать
      на постоянный агентский хост без решения оператора (минимальные привилегии)
  [ ] Backend env для локальных прогонов: DATABASE_URL (локальный PostgreSQL 15/16)
  [ ] swipe-agents: данные/бэкапы живут вне git (внешний том, AGENTS_BACKUP_ROOT);
      токены ботов — из менеджера секретов оператора
  [ ] PostgreSQL 15+: brew install postgresql@15 (нужен E2E-стенду и acceptance)
  [ ] Прочитать: VISION.md → AGENTS.md → swipe-backend/docs/specs/IMPLEMENTATION-STATUS.md
      → platform-scheme/README.md (схема+scoreboard) → CLAUDE.md (продуктовые решения)
EOF

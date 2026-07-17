#!/bin/bash
# Full workspace verification — one command to know if everything is green.
# Usage: npm run verify  (from workspace root)
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

FAILED=0
STEP=0

run_step() {
  STEP=$((STEP + 1))
  echo ""
  echo "========================================"
  echo "  Step $STEP: $1"
  echo "========================================"
  if eval "$2"; then
    echo "  -> PASSED"
  else
    echo "  -> FAILED"
    FAILED=$((FAILED + 1))
  fi
}

run_step "TypeScript check (all packages)" \
  "npm run check:all"

run_step "Unit tests (5 core packages)" \
  "npm run test:all"

run_step "Build all packages" \
  "npm run build:all"

run_step "Contract tests (p4g-platform)" \
  "npm run contracts"

run_step "Bundle check (p4g-platform)" \
  "cd p4g-platform && bash scripts/check-bundle.sh"

echo ""
echo "========================================"
if [ "$FAILED" -eq 0 ]; then
  echo "  ALL $STEP STEPS PASSED"
else
  echo "  $FAILED / $STEP STEPS FAILED"
fi
echo "========================================"

exit $FAILED

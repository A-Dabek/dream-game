#!/bin/bash

# acceptance-tests.sh - Full acceptance testing suite
# Usage: ./acceptance-tests.sh

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$PROJECT_ROOT"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

run_step() {
    local step_name=$1
    shift
    local cmd="$@"

    echo "[$step_name] RUNNING..."

    set +e
    output=$($cmd 2>&1)
    exit_code=$?
    set -e

    if [ $exit_code -eq 0 ]; then
        echo "[$step_name] PASSED"
        return 0
    else
        echo -e "${RED}[$step_name] FAILED${NC}"
        echo "$output"
        echo -e "${RED}[ERROR] Acceptance tests failed. Fix errors above.${NC}"
        exit 1
    fi
}

echo "========================================="
echo "ACCEPTANCE TESTS"
echo "========================================="
echo ""

# Step 1: Build main app
run_step "BUILD" npx ng build dream-game

# Step 2: Run all unit tests
echo "[TEST:ALL] Running all unit tests..."
set +e
output=$(npx ng test game-board --watch=false 2>&1)
exit_code=$?
if [ $exit_code -ne 0 ]; then
    echo -e "${RED}[TEST:ALL] FAILED${NC}"
    echo "$output"
    echo -e "${RED}[ERROR] Acceptance tests failed. Fix errors above.${NC}"
    exit 1
fi

output=$(npx ng test game-board-ui --watch=false 2>&1)
exit_code=$?
if [ $exit_code -ne 0 ]; then
    echo -e "${RED}[TEST:ALL] FAILED${NC}"
    echo "$output"
    echo -e "${RED}[ERROR] Acceptance tests failed. Fix errors above.${NC}"
    exit 1
fi

output=$(npx ng test dream-game --watch=false 2>&1)
exit_code=$?
if [ $exit_code -ne 0 ]; then
    echo -e "${RED}[TEST:ALL] FAILED${NC}"
    echo "$output"
    echo -e "${RED}[ERROR] Acceptance tests failed. Fix errors above.${NC}"
    exit 1
fi
set -e

echo "[TEST:ALL] PASSED"

# Step 3: E2E Tests
run_step "E2E" npx playwright test

echo ""
echo "========================================="
echo -e "${GREEN}ALL ACCEPTANCE TESTS PASSED!${NC}"
echo "========================================="
echo ""
echo "Summary:"
echo "  [BUILD]   PASSED"
echo "  [TEST:ALL] PASSED"
echo "  [E2E]     PASSED"

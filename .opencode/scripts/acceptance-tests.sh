#!/bin/bash

# acceptance-tests.sh - Full acceptance testing suite
# Usage: ./acceptance-tests.sh

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$PROJECT_ROOT"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
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

# Step 1: Build
run_step "BUILD" npm run build

# Step 2: Test
run_step "TEST" npm run test

# Step 3: E2E Tests
run_step "E2E" npm run e2e

echo ""
echo "========================================="
echo -e "${GREEN}ALL ACCEPTANCE TESTS PASSED!${NC}"
echo "========================================="
echo ""
echo "Summary:"
echo "  [BUILD] PASSED"
echo "  [TEST]   PASSED"
echo "  [E2E]    PASSED"

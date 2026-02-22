#!/bin/bash

# verify-work.sh - Run all verification checks (build, test, format, e2e, api)
# Usage: ./verify-work.sh

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$PROJECT_ROOT"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Helper functions
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
        echo -e "${RED}[ERROR] Verification failed. Fix errors above.${NC}"
        exit 1
    fi
}

echo "========================================="
echo "WORK VERIFICATION"
echo "========================================="
echo ""

# Step 1: Format
run_step "FORMAT" npx prettier --write .

# Step 2: Build Libraries
run_step "BUILD:LIBS" npx ng build game-board

# Step 3: Build game-board-ui library
run_step "BUILD:UI" npx ng build game-board-ui

# Step 4: Build main app
run_step "BUILD:APP" npx ng build dream-game

# Step 5: Test Libraries
run_step "TEST:LIBS" npx ng test game-board --watch=false

# Step 6: Test UI Library
run_step "TEST:UI" npx ng test game-board-ui --watch=false

# Step 7: Test main app
run_step "TEST:APP" npx ng test dream-game --watch=false

# Step 8: API Extractor
echo "[API-EXTRACTOR] RUNNING..."
set +e
output=$(npx tsc -p projects/game-board/tsconfig.api.json --declaration --emitDeclarationOnly --outDir dist/types/game-board 2>&1)
exit_code=$?
if [ $exit_code -ne 0 ]; then
    echo -e "${RED}[API-EXTRACTOR] FAILED${NC}"
    echo "$output"
    echo -e "${RED}[ERROR] Verification failed. Fix errors above.${NC}"
    exit 1
fi

output=$(npx api-extractor run --local --config projects/game-board/api-extractor.json 2>&1)
exit_code=$?
if [ $exit_code -ne 0 ]; then
    echo -e "${RED}[API-EXTRACTOR] FAILED${NC}"
    echo "$output"
    echo -e "${RED}[ERROR] Verification failed. Fix errors above.${NC}"
    exit 1
fi

output=$(npx tsc -p projects/game-board-ui/tsconfig.api.json --declaration --emitDeclarationOnly --outDir dist/types/game-board-ui 2>&1)
exit_code=$?
if [ $exit_code -ne 0 ]; then
    echo -e "${RED}[API-EXTRACTOR] FAILED${NC}"
    echo "$output"
    echo -e "${RED}[ERROR] Verification failed. Fix errors above.${NC}"
    exit 1
fi

output=$(npx api-extractor run --local --config projects/game-board-ui/api-extractor.json 2>&1)
exit_code=$?
if [ $exit_code -ne 0 ]; then
    echo -e "${RED}[API-EXTRACTOR] FAILED${NC}"
    echo "$output"
    echo -e "${RED}[ERROR] Verification failed. Fix errors above.${NC}"
    exit 1
fi
set -e
echo "[API-EXTRACTOR] PASSED"

# Step 9: E2E Tests
run_step "E2E" npx playwright test

echo ""
echo "========================================="
echo -e "${GREEN}ALL VERIFICATIONS PASSED!${NC}"
echo "========================================="
echo ""
echo "Ready for deployment. Run ./deploy-work.sh to commit and deploy."

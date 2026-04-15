#!/bin/bash

# verify-work.sh - Run all verification checks (build, test, format, e2e, api)
# Usage: ./verify-work.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

run_step() {
    local step_name=$1
    shift
    local cmd="$@"

    echo "[$step_name] RUNNING..."
    start_time=$(date +%s%3N)
    set +e
    output=$($cmd 2>&1)
    exit_code=$?
    set -e
    end_time=$(date +%s%3N)
    duration=$((end_time - start_time))

    if [ $exit_code -eq 0 ]; then
        echo "[$step_name] PASSED (${duration}ms)"
        return 0
    else
        echo -e "${RED}[$step_name] FAILED (${duration}ms)${NC}"
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
run_step "FORMAT" bun run format

# Step 2: Build
run_step "BUILD" bun run build

# Step 3: Test
run_step "TEST" bun run test

# Step 4: API Extractor
run_step "API-EXTRACTOR" bun run api-extractor

# Step 5: E2E Tests
run_step "E2E" bun run e2e

# Step 6: Random items
run_step "RANDOM-ITEMS" bun run generate-items

# Step 7: Init Game (Performance check)
echo "[INIT-GAME] RUNNING..."
start_time=$(date +%s%3N)
set +e
output=$(timeout 10s bun run init-game 2>&1)
exit_code=$?
set -e
end_time=$(date +%s%3N)
duration=$((end_time - start_time))

if [ $exit_code -eq 124 ]; then
    echo -e "${RED}[INIT-GAME] FAILED (Timed out after 10s)${NC}"
    echo -e "${RED}[ERROR] Verification failed. Fix errors above.${NC}"
    exit 1
elif [ $exit_code -ne 0 ]; then
    echo -e "${RED}[INIT-GAME] FAILED (${duration}ms)${NC}"
    echo "$output"
    echo -e "${RED}[ERROR] Verification failed. Fix errors above.${NC}"
    exit 1
fi

echo "[INIT-GAME] PASSED (${duration}ms)"

echo ""
echo "========================================="
echo -e "${GREEN}ALL VERIFICATIONS PASSED!${NC}"
echo "========================================="
echo ""
echo "Ready for deployment. Run ./deploy-work.sh to commit and deploy."

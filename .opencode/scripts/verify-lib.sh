#!/bin/bash

# verify-lib.sh - Per-library verification script
# Usage: ./verify-lib.sh <lib-name>
# Example: ./verify-lib.sh game-board

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$PROJECT_ROOT"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Validate arguments
if [ $# -eq 0 ]; then
    echo -e "${RED}[ERROR] No library name provided${NC}"
    echo "Usage: ./verify-lib.sh <lib-name>"
    echo ""
    echo "Available libraries:"
    echo "  game-board"
    echo "  game-board-ui"
    exit 1
fi

LIB_NAME=$1

# Validate library name
if [ "$LIB_NAME" != "game-board" ] && [ "$LIB_NAME" != "game-board-ui" ]; then
    echo -e "${RED}[ERROR] Invalid library name: $LIB_NAME${NC}"
    echo "Usage: ./verify-lib.sh <lib-name>"
    echo ""
    echo "Available libraries:"
    echo "  game-board"
    echo "  game-board-ui"
    exit 1
fi

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
        echo -e "${RED}[ERROR] Library verification failed. Fix errors above.${NC}"
        exit 1
    fi
}

echo "========================================="
echo "VERIFY LIBRARY: $LIB_NAME"
echo "========================================="
echo ""

# Step 1: Test the library
run_step "TEST" npx ng test "$LIB_NAME" --watch=false

# Step 2: Build the library
run_step "BUILD" npx ng build "$LIB_NAME"

# Step 3: API Extractor
echo "[API-EXTRACTOR] Running..."

if [ "$LIB_NAME" = "game-board" ]; then
    set +e
    output=$(npx tsc -p projects/game-board/tsconfig.api.json --declaration --emitDeclarationOnly --outDir dist/types/game-board 2>&1)
    exit_code=$?
    if [ $exit_code -ne 0 ]; then
        echo -e "${RED}[API-EXTRACTOR] FAILED${NC}"
        echo "$output"
        echo -e "${RED}[ERROR] Library verification failed. Fix errors above.${NC}"
        exit 1
    fi

    output=$(npx api-extractor run --local --config projects/game-board/api-extractor.json 2>&1)
    exit_code=$?
    if [ $exit_code -ne 0 ]; then
        echo -e "${RED}[API-EXTRACTOR] FAILED${NC}"
        echo "$output"
        echo -e "${RED}[ERROR] Library verification failed. Fix errors above.${NC}"
        exit 1
    fi
    set -e
else
    set +e
    output=$(npx tsc -p projects/game-board-ui/tsconfig.api.json --declaration --emitDeclarationOnly --outDir dist/types/game-board-ui 2>&1)
    exit_code=$?
    if [ $exit_code -ne 0 ]; then
        echo -e "${RED}[API-EXTRACTOR] FAILED${NC}"
        echo "$output"
        echo -e "${RED}[ERROR] Library verification failed. Fix errors above.${NC}"
        exit 1
    fi

    output=$(npx api-extractor run --local --config projects/game-board-ui/api-extractor.json 2>&1)
    exit_code=$?
    if [ $exit_code -ne 0 ]; then
        echo -e "${RED}[API-EXTRACTOR] FAILED${NC}"
        echo "$output"
        echo -e "${RED}[ERROR] Library verification failed. Fix errors above.${NC}"
        exit 1
    fi
    set -e
fi

echo "[API-EXTRACTOR] PASSED"

echo ""
echo "========================================="
echo -e "${GREEN}LIBRARY VERIFICATION COMPLETE: $LIB_NAME${NC}"
echo "========================================="
echo ""
echo "Summary:"
echo "  [TEST]          PASSED"
echo "  [BUILD]         PASSED"
echo "  [API-EXTRACTOR] PASSED"

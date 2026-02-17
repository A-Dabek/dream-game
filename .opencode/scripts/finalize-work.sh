#!/bin/bash

# finalize-work.sh - Complete work finalization workflow
# Usage: ./finalize-work.sh [--dry-run]

set -e

DRY_RUN=false

if [ "$1" = "--dry-run" ]; then
    DRY_RUN=true
    echo "[DRY-RUN] Mode enabled - showing commands without execution"
fi

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$PROJECT_ROOT"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
run_step() {
    local step_name=$1
    shift
    local cmd="$@"

    echo "[$step_name] RUNNING..."

    if [ "$DRY_RUN" = true ]; then
        echo "  > $cmd"
        echo "[$step_name] PASSED (dry-run)"
        return 0
    fi

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
        echo -e "${RED}[ERROR] Workflow stopped. Fix errors above.${NC}"
        exit 1
    fi
}

prompt_yes_no() {
    local prompt=$1
    local response

    while true; do
        read -p "$prompt (y/n): " response
        case $response in
            [Yy]* ) return 0;;
            [Nn]* ) return 1;;
            * ) echo "Please answer y or n.";;
        esac
    done
}

echo "========================================="
echo "WORK FINALIZATION WORKFLOW"
echo "========================================="
echo ""

# Get current branch name
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

if [ "$DRY_RUN" = false ]; then
    echo "Current branch: $CURRENT_BRANCH"
    echo ""
fi

# Step 1: Format
echo "[FORMAT] Running prettier --write..."
if [ "$DRY_RUN" = true ]; then
    echo "  > npx prettier --write ."
    echo "[FORMAT] PASSED (dry-run)"
else
    set +e
    output=$(npx prettier --write . 2>&1)
    exit_code=$?
    set -e

    if [ $exit_code -eq 0 ]; then
        echo "[FORMAT] PASSED"
    else
        echo -e "${RED}[FORMAT] FAILED${NC}"
        echo "$output"
        echo -e "${RED}[ERROR] Workflow stopped. Fix errors above.${NC}"
        exit 1
    fi
fi

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
echo "[API-EXTRACTOR] Running..."
if [ "$DRY_RUN" = true ]; then
    echo "  > npx tsc -p projects/game-board/tsconfig.api.json --declaration --emitDeclarationOnly --outDir dist/types/game-board"
    echo "  > npx api-extractor run --local --config projects/game-board/api-extractor.json"
    echo "  > npx tsc -p projects/game-board-ui/tsconfig.api.json --declaration --emitDeclarationOnly --outDir dist/types/game-board-ui"
    echo "  > npx api-extractor run --local --config projects/game-board-ui/api-extractor.json"
    echo "[API-EXTRACTOR] PASSED (dry-run)"
else
    set +e
    output=$(npx tsc -p projects/game-board/tsconfig.api.json --declaration --emitDeclarationOnly --outDir dist/types/game-board 2>&1)
    exit_code=$?
    if [ $exit_code -ne 0 ]; then
        echo -e "${RED}[API-EXTRACTOR] FAILED${NC}"
        echo "$output"
        echo -e "${RED}[ERROR] Workflow stopped. Fix errors above.${NC}"
        exit 1
    fi

    output=$(npx api-extractor run --local --config projects/game-board/api-extractor.json 2>&1)
    exit_code=$?
    if [ $exit_code -ne 0 ]; then
        echo -e "${RED}[API-EXTRACTOR] FAILED${NC}"
        echo "$output"
        echo -e "${RED}[ERROR] Workflow stopped. Fix errors above.${NC}"
        exit 1
    fi

    output=$(npx tsc -p projects/game-board-ui/tsconfig.api.json --declaration --emitDeclarationOnly --outDir dist/types/game-board-ui 2>&1)
    exit_code=$?
    if [ $exit_code -ne 0 ]; then
        echo -e "${RED}[API-EXTRACTOR] FAILED${NC}"
        echo "$output"
        echo -e "${RED}[ERROR] Workflow stopped. Fix errors above.${NC}"
        exit 1
    fi

    output=$(npx api-extractor run --local --config projects/game-board-ui/api-extractor.json 2>&1)
    exit_code=$?
    if [ $exit_code -ne 0 ]; then
        echo -e "${RED}[API-EXTRACTOR] FAILED${NC}"
        echo "$output"
        echo -e "${RED}[ERROR] Workflow stopped. Fix errors above.${NC}"
        exit 1
    fi
    set -e

    echo "[API-EXTRACTOR] PASSED"
fi

# Step 9: E2E Tests
run_step "E2E" npx playwright test

echo ""
echo "========================================="
echo -e "${GREEN}ALL CHECKS PASSED!${NC}"
echo "========================================="
echo ""

# Interactive prompts
if [ "$DRY_RUN" = true ]; then
    echo "[DRY-RUN] Would prompt for:"
    echo "  - Git commit"
    echo "  - Git merge to main"
    echo "  - Delete branch"
    echo "  - Firebase deploy"
    echo ""
    echo "[DRY-RUN] Complete!"
    exit 0
fi

# Git Commit
echo ""
if prompt_yes_no "Create git commit?"; then
    read -p "Enter commit message: " commit_msg
    if [ -n "$commit_msg" ]; then
        git add -A
        git commit -m "$commit_msg"
        echo -e "${GREEN}[GIT] Commit created successfully${NC}"
    else
        echo -e "${YELLOW}[GIT] No commit message provided, skipping${NC}"
    fi
else
    echo -e "${YELLOW}[GIT] Skipping commit${NC}"
fi

# Git Merge to main
if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ]; then
    echo ""
    if prompt_yes_no "Merge $CURRENT_BRANCH into main?"; then
        git checkout main
        git merge "$CURRENT_BRANCH"
        echo -e "${GREEN}[GIT] Merge completed successfully${NC}"
    else
        echo -e "${YELLOW}[GIT] Skipping merge${NC}"
    fi

    # Delete branch
    echo ""
    if prompt_yes_no "Delete branch $CURRENT_BRANCH?"; then
        git branch -d "$CURRENT_BRANCH"
        echo -e "${GREEN}[GIT] Branch deleted successfully${NC}"
    else
        echo -e "${YELLOW}[GIT] Keeping branch $CURRENT_BRANCH${NC}"
    fi
else
    echo -e "${YELLOW}[GIT] Currently on main/master, skipping merge/branch deletion${NC}"
fi

# Firebase Deploy
echo ""
if prompt_yes_no "Deploy to Firebase?"; then
    npx firebase deploy
    echo -e "${GREEN}[FIREBASE] Deploy completed successfully${NC}"
else
    echo -e "${YELLOW}[FIREBASE] Skipping deployment${NC}"
fi

echo ""
echo "========================================="
echo -e "${GREEN}WORK FINALIZATION COMPLETE!${NC}"
echo "========================================="

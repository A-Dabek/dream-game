#!/bin/bash

# finalize-work.sh - Complete work finalization workflow
# Usage: ./finalize-work.sh --dry-run <true|false> --commit <message>

set -e

DRY_RUN=""
COMMIT_MSG=""

# Show usage
show_usage() {
    echo "Usage: ./finalize-work.sh --dry-run <true|false> --commit <message>"
    echo ""
    echo "Parameters:"
    echo "  --dry-run <true|false>  Required. If true, runs all checks but skips git operations and deploy."
    echo "                          If false, executes all steps including git ops and deploy."
    echo "  --commit <message>      Required. Commit message for git commit."
    echo ""
    echo "Examples:"
    echo "  ./finalize-work.sh --dry-run true --commit 'feat: add new feature'"
    echo "  ./finalize-work.sh --dry-run false --commit 'fix: bug fix'"
    exit 1
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN="$2"
            shift 2
            ;;
        --commit)
            COMMIT_MSG="$2"
            shift 2
            ;;
        --help|-h)
            show_usage
            ;;
        *)
            echo "Error: Unknown option: $1"
            show_usage
            ;;
    esac
done

# Validate required parameters
if [ -z "$DRY_RUN" ]; then
    echo "Error: --dry-run is required"
    show_usage
fi

if [ "$DRY_RUN" != "true" ] && [ "$DRY_RUN" != "false" ]; then
    echo "Error: --dry-run must be 'true' or 'false'"
    show_usage
fi

if [ -z "$COMMIT_MSG" ]; then
    echo "Error: --commit is required"
    show_usage
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

echo "========================================="
echo "WORK FINALIZATION WORKFLOW"
echo "========================================="
echo ""

if [ "$DRY_RUN" = "true" ]; then
    echo "[DRY-RUN] Mode enabled - running checks only (no git ops or deploy)"
    echo ""
fi

# Get current branch name
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

echo "Current branch: $CURRENT_BRANCH"
echo "Commit message: $COMMIT_MSG"
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

# Step 9: E2E Tests
run_step "E2E" npx playwright test

echo ""
echo "========================================="
echo -e "${GREEN}ALL CHECKS PASSED!${NC}"
echo "========================================="
echo ""

if [ "$DRY_RUN" = "true" ]; then
    echo "[DRY-RUN] Skipping git operations and deployment"
    echo "[DRY-RUN] Would execute:"
    echo "  - Git commit: $COMMIT_MSG"
    echo "  - Merge $CURRENT_BRANCH into master"
    echo "  - Delete branch $CURRENT_BRANCH"
    echo "  - Firebase deploy"
    echo ""
    echo "[DRY-RUN] Complete!"
    exit 0
fi

# Git Commit
echo ""
echo "[GIT] Creating commit..."
git add -A
git commit -m "$COMMIT_MSG"
echo -e "${GREEN}[GIT] Commit created: $COMMIT_MSG${NC}"

# Git Merge to master
if [ "$CURRENT_BRANCH" != "master" ]; then
    echo ""
    echo "[GIT] Merging $CURRENT_BRANCH into master..."
    git checkout master
    git merge "$CURRENT_BRANCH"
    echo -e "${GREEN}[GIT] Merge completed successfully${NC}"

    # Delete branch
    echo ""
    echo "[GIT] Deleting branch $CURRENT_BRANCH..."
    git branch -d "$CURRENT_BRANCH"
    echo -e "${GREEN}[GIT] Branch deleted successfully${NC}"
else
    echo -e "${YELLOW}[GIT] Currently on master, skipping merge/branch deletion${NC}"
fi

# Firebase Deploy
echo ""
echo "[FIREBASE] Deploying..."
npx firebase deploy
echo -e "${GREEN}[FIREBASE] Deploy completed successfully${NC}"

echo ""
echo "========================================="
echo -e "${GREEN}WORK FINALIZATION COMPLETE!${NC}"
echo "========================================="

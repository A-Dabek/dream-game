#!/bin/bash

# finalize-work.sh - Complete work finalization workflow
# Usage: ./finalize-work.sh [--dry-run] [--commit "message"] [--merge] [--delete-branch] [--deploy]

set -e

DRY_RUN=false
COMMIT_MSG=""
DO_COMMIT=false
DO_MERGE=false
DO_DELETE_BRANCH=false
DO_DEPLOY=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --commit)
            DO_COMMIT=true
            COMMIT_MSG="$2"
            shift 2
            ;;
        --merge)
            DO_MERGE=true
            shift
            ;;
        --delete-branch)
            DO_DELETE_BRANCH=true
            shift
            ;;
        --deploy)
            DO_DEPLOY=true
            shift
            ;;
        --help|-h)
            echo "Usage: ./finalize-work.sh [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --dry-run           Show commands without execution"
            echo "  --commit MESSAGE    Create git commit with message"
            echo "  --merge             Merge current branch into main"
            echo "  --delete-branch     Delete branch after merge"
            echo "  --deploy            Deploy to Firebase"
            echo "  --help, -h          Show this help message"
            echo ""
            echo "Example:"
            echo "  ./finalize-work.sh --commit 'Add new feature' --merge --delete-branch"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

if [ "$DRY_RUN" = true ]; then
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

# Show what actions will be taken
if [ "$DRY_RUN" = true ]; then
    echo "[DRY-RUN] Would execute:"
    [ "$DO_COMMIT" = true ] && echo "  - Git commit: $COMMIT_MSG"
    [ "$DO_MERGE" = true ] && echo "  - Merge $CURRENT_BRANCH into main"
    [ "$DO_DELETE_BRANCH" = true ] && echo "  - Delete branch $CURRENT_BRANCH"
    [ "$DO_DEPLOY" = true ] && echo "  - Firebase deploy"
    echo ""
    echo "[DRY-RUN] Complete!"
    exit 0
fi

# Git Commit
if [ "$DO_COMMIT" = true ]; then
    if [ -n "$COMMIT_MSG" ]; then
        echo ""
        echo "[GIT] Creating commit..."
        git add -A
        git commit -m "$COMMIT_MSG"
        echo -e "${GREEN}[GIT] Commit created: $COMMIT_MSG${NC}"
    else
        echo -e "${YELLOW}[GIT] No commit message provided, skipping${NC}"
    fi
else
    echo -e "${YELLOW}[GIT] Skipping commit (--commit not specified)${NC}"
fi

# Git Merge to main
if [ "$DO_MERGE" = true ]; then
    if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ]; then
        echo ""
        echo "[GIT] Merging $CURRENT_BRANCH into main..."
        git checkout main
        git merge "$CURRENT_BRANCH"
        echo -e "${GREEN}[GIT] Merge completed successfully${NC}"
    else
        echo -e "${YELLOW}[GIT] Currently on main/master, skipping merge${NC}"
    fi
else
    echo -e "${YELLOW}[GIT] Skipping merge (--merge not specified)${NC}"
fi

# Delete branch
if [ "$DO_DELETE_BRANCH" = true ]; then
    if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ]; then
        echo ""
        echo "[GIT] Deleting branch $CURRENT_BRANCH..."
        git branch -d "$CURRENT_BRANCH"
        echo -e "${GREEN}[GIT] Branch deleted successfully${NC}"
    else
        echo -e "${YELLOW}[GIT] Cannot delete main/master branch${NC}"
    fi
else
    echo -e "${YELLOW}[GIT] Skipping branch deletion (--delete-branch not specified)${NC}"
fi

# Firebase Deploy
if [ "$DO_DEPLOY" = true ]; then
    echo ""
    echo "[FIREBASE] Deploying..."
    npx firebase deploy
    echo -e "${GREEN}[FIREBASE] Deploy completed successfully${NC}"
else
    echo -e "${YELLOW}[FIREBASE] Skipping deployment (--deploy not specified)${NC}"
fi

echo ""
echo "========================================="
echo -e "${GREEN}WORK FINALIZATION COMPLETE!${NC}"
echo "========================================="

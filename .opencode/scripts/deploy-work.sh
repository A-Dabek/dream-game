#!/bin/bash

# deploy-work.sh - Commit, merge, and deploy the work
# Usage: ./deploy-work.sh --commit <message>

set -e

COMMIT_MSG=""

# Show usage
show_usage() {
    echo "Usage: ./deploy-work.sh --commit <message>"
    echo ""
    echo "Parameters:"
    echo "  --commit <message>  Required. Commit message for git commit."
    echo ""
    echo "Examples:"
    echo "  ./deploy-work.sh --commit 'feat: add new feature'"
    echo "  ./deploy-work.sh --commit 'fix: bug fix'"
    exit 1
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
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
if [ -z "$COMMIT_MSG" ]; then
    echo "Error: --commit is required"
    show_usage
fi

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$PROJECT_ROOT"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================="
echo "WORK DEPLOYMENT"
echo "========================================="
echo ""

# Get current branch name
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

echo "Current branch: $CURRENT_BRANCH"
echo "Commit message: $COMMIT_MSG"
echo ""

# Remove specification files
echo ""
echo "[CLEANUP] Removing specification files..."
rm -f .opencode/specifications/*.md
echo -e "${GREEN}[CLEANUP] Specification files removed successfully${NC}"

# Git Commit
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
firebase deploy --only hosting
echo -e "${GREEN}[FIREBASE] Deploy completed successfully${NC}"

echo ""
echo "========================================="
echo -e "${GREEN}WORK DEPLOYMENT COMPLETE!${NC}"
echo "========================================="


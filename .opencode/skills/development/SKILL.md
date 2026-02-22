---
name: development
description: Use this skill for development workflow guidance
---

# Development Workflow

This skill outlines the recommended workflow for completing feature work in this monorepo.

## Branch Strategy

- **Always work on feature branches**, not directly on `master`
- Create branch from `master` with a descriptive name: `feature/your-feature-name` or `fix/issue-name`
- Keep branches focused on a single feature/fix

## Development Process

### 1. Before Starting
- Ensure you're on `master` and it's up to date
- Create a new branch: `git checkout -b feature/your-feature`

### 2. During Development
- Make your code changes
- Create tests alongside your features
- Use the appropriate skills

### 3. At the End of Work

**First, run verification to ensure everything is working:**

```bash
bash .opencode/scripts/verify-work.sh
```

**If verification passes**, you will see "ALL VERIFICATIONS PASSED!" and can proceed.

**If verification fails**, fix the errors and re-run `verify-work.sh` until it passes.

The `verify-work.sh` is safe to run multiple times and should be run frequently during development.

### 4. User Signoff

After verification passes, **ask the user for confirmation** before deploying:

> "All checks passed! Ready to commit, merge, and deploy. Do you approve the deployment? (yes/no)"

- If user says **yes**, proceed to step 5
- If user says **no**, stop and await further instructions

### 5. Deployment

**Only with explicit user approval**, run:

```bash
bash .opencode/scripts/deploy-work.sh --commit "feat: your commit message"
```

The `deploy-work.sh` performs irreversible operations (commit, merge, deploy) - use with caution

## Important Notes

- **Never skip verification** - always run `verify-work.sh` before asking for signoff
- **Never auto-deploy** - always ask the user for explicit approval

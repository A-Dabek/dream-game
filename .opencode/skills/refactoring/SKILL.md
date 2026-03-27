---
name: refactoring
description: Refactor code while maintaining business logic
---

# What you need

1. What specific area to refactor (e.g., "improve naming in engine", "reduce duplication in board tests", "simplify this component").
2. What files or patterns to focus on.

# What to do

## Principles

- Maintain business logic - do NOT change behavior
- Follow SOLID, DRY, KISS, YAGNI principles
- Improve readability and maintainability
- Remove code duplication
- Add explicit types instead of `any` or `unknown`
- Use self-documenting code
- Encapsulate implementation details

## Focus Areas

- **Angular components**: Improve component structure, use modern Angular patterns, reduce template complexity
- **E2E tests**: Improve test structure, reduce duplication, better selectors
- **Vitest tests**: Simplify test utilities, reduce boilerplate
- **Game logic**: Improve naming, reduce complexity, better encapsulation

## What NOT to do

- Do NOT change business logic or behavior
- Do NOT remove tests or weaken assertions
- Do NOT introduce new features
- Do NOT add JSDoc comments unless explaining WHY

## Verification

After refactoring, always run:
```bash
.opencode/scripts/acceptance-tests.sh
```

Ensure all tests pass and the build succeeds.

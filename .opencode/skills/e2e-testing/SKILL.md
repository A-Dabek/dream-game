---
name: e2e-testing
description: Write Playwright end-to-end tests
---

# What you need

1. The feature or user flow to test.
2. What behaviors should be verified.

# What to do

## Location

E2E tests are located in `projects/e2e/` with `.e2e.ts` extension, organized by feature (e.g., `projects/e2e/game-loop/`).

## Conventions

- Use Playwright with `test` and `expect` from `@playwright/test`
- Use `data-testid` attributes for querying elements
- Disable animations by adding `disable-animations` class to `document.body` in `beforeEach`
- Use `test.describe` to group related tests
- Test observable user behaviors, NOT implementation details
- Avoid `wait` functions - use expect assertions instead

## Example Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/route');
  });

  test('should display initial state', async ({ page }) => {
    await page.evaluate(() =>
      document.body.classList.add('disable-animations'),
    );
    
    await expect(page.getByTestId('element')).toBeVisible();
  });

  test('should handle user interaction', async ({ page }) => {
    await page.evaluate(() =>
      document.body.classList.add('disable-animations'),
    );
    
    await page.getByTestId('button').click();
    await expect(page.getByTestId('result')).toContainText('Expected');
  });
});
```

## Running Tests

Run E2E tests with:
```bash
npm run e2e
```

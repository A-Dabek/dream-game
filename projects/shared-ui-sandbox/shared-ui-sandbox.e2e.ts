import { test, expect } from '@playwright/test';

test.describe('shared-ui-sandbox visual regression', () => {
  test('screenshot - icon showcase', async ({ page }) => {
    await page.goto('/icon');
    await page.waitForTimeout(1000);

    const container = page.locator('app-icon-showcase');
    await expect(container).toHaveScreenshot('icon-showcase.png', {
      maxDiffPixelRatio: 0.01,
    });
  });

  test('screenshot - item-display showcase', async ({ page }) => {
    await page.goto('/item-display');
    await page.waitForTimeout(1000);

    const container = page.locator('app-item-display-showcase');
    await expect(container).toHaveScreenshot('item-display-showcase.png', {
      maxDiffPixelRatio: 0.01,
    });
  });
});

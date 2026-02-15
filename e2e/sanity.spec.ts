import { test, expect } from '@playwright/test';

test('visual sanity check - game loads and board renders', async ({ page }) => {
  await page.goto('/');

  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    `,
  });

  await expect(page.getByTestId('ready-button')).toBeVisible();

  await page.getByTestId('ready-button').click();

  await expect(page.getByTestId('board-ui')).toBeVisible();

  await page.waitForTimeout(100);

  await expect(page).toHaveScreenshot('game-board.png', {
    fullPage: true,
    maxDiffPixels: 5000,
  });
});

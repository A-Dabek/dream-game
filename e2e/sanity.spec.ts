import { test, expect } from '@playwright/test';

test('visual sanity check - game loads and board renders', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByTestId('ready-button')).toBeVisible();

  await page.evaluate(() => {
    document.body.classList.add('disable-animations');
  });

  await page.getByTestId('ready-button').click();

  await expect(page.getByTestId('board-ui')).toBeVisible();

  await page.waitForTimeout(500);

  await expect(page).toHaveScreenshot('game-board.png', {
    fullPage: true,
    maxDiffPixels: 5000,
  });
});

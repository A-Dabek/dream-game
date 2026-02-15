import { test, expect } from '@playwright/test';

test('visual sanity check - game loads and board renders', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('button', { name: 'Ready' })).toBeVisible();

  await page.getByRole('button', { name: 'Ready' }).click();

  await expect(page.locator('app-board-ui')).toBeVisible();

  await page.screenshot({
    path: 'e2e/screenshots/game-board.png',
    fullPage: true,
  });
});

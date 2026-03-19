import { test, expect } from '@playwright/test';

test('visual sanity check - game loads and board renders', async ({ page }) => {
  // Use URL state parameter for predictable, reproducible game state
  // Format: items|health|speed;items|health|speed
  await page.goto('/?state=punch,sticking_plaster|20|10;wingfoot|15|8');

  // Disable animations via existing CSS class and delay via localStorage
  await page.evaluate(() => {
    document.body.classList.add('disable-animations');
    localStorage.setItem('dream-game:delay', '0');
  });

  // Reload to apply localStorage changes
  await page.reload();

  await expect(page.getByTestId('ready-button')).toBeVisible();

  await page.getByTestId('ready-button').click();

  await expect(page.getByTestId('board-ui')).toBeVisible();

  await page.waitForTimeout(100);

  await expect(page).toHaveScreenshot('game-board.png', {
    fullPage: true,
  });
});

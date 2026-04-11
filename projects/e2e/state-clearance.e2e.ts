import { test, expect } from '@playwright/test';

test('Game state is cleared between fights', async ({ page }) => {
  // Fight 1: Human wins in 1 move
  // Human: punch, 10 health, 10 speed
  // AI: punch, 5 health, 5 speed
  const stateParam1 = 'punch|10|10;punch|5|5';
  await page.goto(`/?state=${stateParam1}`);

  // Disable animations
  await page.evaluate(() => {
    document.body.classList.add('disable-animations');
    localStorage.setItem('dream-game:delay', '0');
  });
  await page.reload();

  // 1. Pre-game screen
  await expect(page.getByTestId('pre-game-screen')).toBeVisible();
  await page.getByTestId('ready-button').click();

  // 2. Play punch to win
  const firstPunch = page
    .locator('app-board-ui .player-area app-player-hand app-item-display')
    .first();
  await firstPunch.click();

  // 3. Post-game screen
  await expect(page.getByTestId('post-game-screen')).toBeVisible();
  await expect(page.locator('.player-section .headline')).toContainText(
    'Winner',
  );

  // 4. Continue to Rewards
  await page.getByTestId('continue-button').click();
  await expect(page.getByTestId('reward-view')).toBeVisible();

  // 5. Go to Backpack via stats bar
  await page.getByTestId('nav-btn').click();
  await expect(page.getByTestId('backpack-section')).toBeVisible();

  // 6. Start Fight 2 from Backpack
  // This will get next enemy from campaign, but we can also use query param if we want to be sure.
  // Actually, startFight() in service will navigate to / with a new state.
  await page.getByTestId('fight-btn').click();

  // 7. CRITICAL: Assert we see the Pre-game screen, NOT the Post-game screen of previous fight
  await expect(page.getByTestId('pre-game-screen')).toBeVisible();
  await expect(page.getByTestId('post-game-screen')).not.toBeVisible();
});

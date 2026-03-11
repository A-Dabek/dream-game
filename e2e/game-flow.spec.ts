import { test, expect } from '@playwright/test';

test('Full game flow: human wins in 2 moves', async ({ page }) => {
  // Human (player 1): 2x punch, 20 health, 10 speed
  // AI (player 2): 2x punch, 10 health, 5 speed
  const stateParam = 'punch,punch|20|10;punch,punch|10|5';
  await page.goto(`/?state=${stateParam}`);

  // Disable animations for faster, more predictable tests
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    `,
  });

  // 1. New game screen with loadout of both players is shown
  await expect(page.getByTestId('pre-game-screen')).toBeVisible();

  // 2. "Ready" button is clicked (the issue description says "New game" button, but the code says "Ready")
  const readyButton = page.getByTestId('ready-button');
  await expect(readyButton).toBeVisible();
  await readyButton.click();

  // 3. Game board is shown
  await expect(page.getByTestId('game-screen')).toBeVisible();

  // 4. First attack item is played by the human (item is clicked)
  // Human's hand should have 2 punches.
  const playerHand = page.locator('app-board-ui .player-area app-player-hand');
  const firstPunch = playerHand.locator('app-item-display').first();
  await expect(firstPunch).toBeVisible();
  await firstPunch.click();

  // 5. Enemy loses health
  // Enemy health starts at 10. After 1 punch (5 damage), it should be 5.
  const opponentHealthBar = page.locator(
    'app-board-ui .opponent-area app-health-bar',
  );
  await expect(opponentHealthBar).toContainText('5');

  // 6. Enemy plays automatically
  // 7. Player loses health
  // Human health starts at 20. AI plays punch (5 damage). Human health should be 15.
  const playerHealthBar = page.locator(
    'app-board-ui .player-area app-health-bar',
  );
  // Wait for AI move (it might take some time if there are delays in UiStateService)
  await expect(playerHealthBar).toContainText('15');

  // 8. Player plays another attack
  await firstPunch.click();

  // 9. Wins the game
  // 10. Post-game screen shows the result (assert on winner and loser)
  await expect(page.getByTestId('post-game-screen')).toBeVisible();

  const postGameScreen = page.getByTestId('post-game-screen');
  const opponentSection = postGameScreen.locator('.opponent-section');
  const playerSection = postGameScreen.locator('.player-section');

  await expect(playerSection.locator('.headline')).toContainText('Winner');
  await expect(opponentSection.locator('.headline')).toContainText('Loser');

  // 11. Click "New Game"
  const newGameButton = postGameScreen.getByTestId('new-game-button');
  await expect(newGameButton).toBeVisible();
  await newGameButton.click();

  // 12. Pre-game screen is shown again
  await expect(page.getByTestId('pre-game-screen')).toBeVisible();

  // 13. "Ready" button is clicked again
  await expect(readyButton).toBeVisible();
  await readyButton.click();

  // 14. Game board is shown again
  await expect(page.getByTestId('game-screen')).toBeVisible();
});

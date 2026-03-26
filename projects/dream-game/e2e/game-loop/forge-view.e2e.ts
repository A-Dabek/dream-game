import { test, expect } from '@playwright/test';

test.describe('Forge View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/game-loop');
    await expect(page.getByTestId('forge-container')).toBeVisible();
  });

  test('shows empty card, craft costs 2 matrices', async ({ page }) => {
    // Disable animations
    await page.evaluate(() =>
      document.body.classList.add('disable-animations'),
    );

    // Visual: empty card shown
    await expect(page.getByTestId('empty-card')).toBeVisible();
    await expect(page.getByTestId('card-wrapper')).toBeVisible();

    // Initial state
    await expect(page.getByTestId('stat-matrices')).toContainText('10');
    await expect(page.getByTestId('craft-btn')).toBeEnabled();

    // Craft costs 2 matrices
    await page.getByTestId('craft-btn').click();
    await expect(page.getByTestId('stat-matrices')).toContainText('8');
    await expect(
      page.getByTestId('card-wrapper').locator('app-item-card'),
    ).toBeVisible();
  });

  test('navigate to backpack', async ({ page }) => {
    await page.getByTestId('proceed-btn').click();
    await expect(page.getByTestId('backpack-section')).toBeVisible();
  });
});

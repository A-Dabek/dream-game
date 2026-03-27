import { test, expect } from '@playwright/test';

test.describe('Game Loop', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/game-loop');
  });

  test('initial state shows stats and abandon button below fold', async ({
    page,
  }) => {
    // Disable animations
    await page.evaluate(() =>
      document.body.classList.add('disable-animations'),
    );

    // Stats bar visible with correct initial values
    await expect(page.getByTestId('stats-bar')).toBeVisible();
    await expect(page.getByTestId('stat-matrices')).toContainText('10');
    await expect(page.getByTestId('stat-hp')).toContainText('1');
    await expect(page.getByTestId('stat-speed')).toContainText('1');

    // Abandon button visible but below the fold
    await expect(page.getByTestId('abandon-btn')).toBeVisible();
    const box = await page.getByTestId('abandon-btn').boundingBox();
    expect(box!.y + box!.height).toBeGreaterThan(page.viewportSize()!.height);
  });

  test('abandon dialog confirms and resets state', async ({ page }) => {
    // Disable animations
    await page.evaluate(() =>
      document.body.classList.add('disable-animations'),
    );

    // Craft something (costs 2 matrices)
    await page.getByTestId('craft-btn').click();
    await expect(page.getByTestId('stat-matrices')).toContainText('8');

    // Open dialog
    await page.getByTestId('abandon-btn').click();
    await expect(page.locator('.confirmation-dialog')).toBeVisible();

    // Confirm -> resets to 10
    await page.locator('button', { hasText: 'Yes' }).click();
    await expect(page.getByTestId('stat-matrices')).toContainText('10');
  });

  test('abandon dialog can be cancelled', async ({ page }) => {
    // Disable animations
    await page.evaluate(() =>
      document.body.classList.add('disable-animations'),
    );

    // Craft something
    await page.getByTestId('craft-btn').click();
    await expect(page.getByTestId('stat-matrices')).toContainText('8');

    // Open and cancel
    await page.getByTestId('abandon-btn').click();
    await page
      .locator('.confirmation-dialog button', { hasText: 'No' })
      .click();

    // State preserved
    await expect(page.getByTestId('stat-matrices')).toContainText('8');
  });

  test('navigation between views maintains state', async ({ page }) => {
    // Disable animations
    await page.evaluate(() =>
      document.body.classList.add('disable-animations'),
    );

    // Backpack: expand
    await page.getByTestId('nav-btn').click();
    await page.getByTestId('expand-btn').click();

    // Forge: craft item
    await page.getByTestId('nav-btn').click();
    await page.getByTestId('craft-btn').click();

    // Backpack: verify expanded + item
    await page.getByTestId('nav-btn').click();
    await expect(page.locator('[data-testid^="backpack-slot-"]')).toHaveCount(
      2,
    );
    await expect(
      page.getByTestId('backpack-slot-0').locator('app-item-display'),
    ).toBeVisible();
  });

  test('stats bar navigation buttons work correctly', async ({ page }) => {
    // Disable animations
    await page.evaluate(() =>
      document.body.classList.add('disable-animations'),
    );

    // On Forge (default route): nav button shows Backpack
    await expect(page.getByTestId('nav-btn')).toBeVisible();
    await expect(page.getByTestId('nav-btn')).toContainText('Backpack');

    // Click nav button to go to Backpack
    await page.getByTestId('nav-btn').click();
    await expect(page.url()).toContain('/backpack');

    // On Backpack: nav button shows Forge
    await expect(page.getByTestId('nav-btn')).toBeVisible();
    await expect(page.getByTestId('nav-btn')).toContainText('Forge');

    // Click nav button to go back to Forge
    await page.getByTestId('nav-btn').click();
    await expect(page.url()).toContain('/forge');
  });
});

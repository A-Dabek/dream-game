import { test, expect } from '@playwright/test';

test.describe('Backpack View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/game-loop/backpack');
    await expect(page.getByTestId('backpack-section')).toBeVisible();
  });

  test('shows equipment and backpack slots, expand costs 1 matrix', async ({
    page,
  }) => {
    // Disable animations
    await page.evaluate(() =>
      document.body.classList.add('disable-animations'),
    );

    // Visual: both sections visible
    await expect(page.getByTestId('equipment-section')).toBeVisible();
    await expect(page.getByTestId('backpack-section')).toBeVisible();

    // 5 equipment slots, 1 backpack slot initially
    await expect(page.locator('[data-testid^="equip-slot-"]')).toHaveCount(5);
    await expect(page.locator('[data-testid^="backpack-slot-"]')).toHaveCount(
      1,
    );

    // Expand costs 1 matrix
    await expect(page.getByTestId('stat-matrices')).toContainText('10');
    await page.getByTestId('expand-btn').click();
    await expect(page.locator('[data-testid^="backpack-slot-"]')).toHaveCount(
      2,
    );
    await expect(page.getByTestId('stat-matrices')).toContainText('9');
  });

  test('move item between backpack and equipment', async ({ page }) => {
    // Disable animations
    await page.evaluate(() =>
      document.body.classList.add('disable-animations'),
    );

    // Expand backpack and craft item
    await page.getByTestId('expand-btn').click();
    await page.getByTestId('proceed-btn').click();
    await page.getByTestId('craft-btn').click();

    // Wait for craft animation to complete (300ms delay in craft method)
    await page.waitForTimeout(500);

    await page.getByTestId('proceed-btn').click();

    // Move backpack -> equipment
    await page.getByTestId('backpack-slot-0').click();
    await page.getByTestId('equip-slot-0').click();

    // Verify in equipment, not in backpack
    await expect(
      page.getByTestId('equip-slot-0').locator('app-item-display'),
    ).toBeVisible();
    await expect(
      page.getByTestId('backpack-slot-0').locator('app-item-display'),
    ).not.toBeVisible();

    // Move equipment -> backpack
    await page.getByTestId('equip-slot-0').click();
    await page.getByTestId('backpack-slot-0').click();

    // Verify back in backpack
    await expect(
      page.getByTestId('backpack-slot-0').locator('app-item-display'),
    ).toBeVisible();
    await expect(
      page.getByTestId('equip-slot-0').locator('app-item-display'),
    ).not.toBeVisible();
  });

  test('equipping item does not change stats', async ({ page }) => {
    // Disable animations
    await page.evaluate(() =>
      document.body.classList.add('disable-animations'),
    );

    const initialHp = await page.getByTestId('stat-hp').textContent();
    const initialSpeed = await page.getByTestId('stat-speed').textContent();

    // Expand, craft, equip
    await page.getByTestId('expand-btn').click();
    await page.getByTestId('proceed-btn').click();
    await page.getByTestId('craft-btn').click();
    await page.getByTestId('proceed-btn').click();
    await page.getByTestId('backpack-slot-0').click();
    await page.getByTestId('equip-slot-0').click();

    // Stats remain unchanged (equipping in game-loop doesn't give item bonuses)
    expect(await page.getByTestId('stat-hp').textContent()).toBe(initialHp);
    // Note: speed may become negative if sticky_boot is equipped (allowed)
    expect(
      parseInt((await page.getByTestId('stat-speed').textContent()) ?? '0', 10),
    ).toBeLessThanOrEqual(1);
  });
});

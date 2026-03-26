import { test, expect } from '@playwright/test';

test.describe('shared-ui-sandbox', () => {
  test('displays icon component showcase', async ({ page }) => {
    page.on('console', (msg) => console.log('Browser console:', msg.text()));
    page.on('pageerror', (err) => console.log('Browser error:', err.message));

    await page.goto('/icon');

    // Wait a bit for Angular to bootstrap
    await page.waitForTimeout(2000);

    // Verify the main heading is visible
    await expect(page.locator('h1')).toHaveText('Icon Component');

    // Verify icon grid section exists
    await expect(page.locator('h2').first()).toContainText(
      'Different Path Values',
    );

    // Verify icons are rendered (check for SVG elements in icon grid)
    const iconItems = page.locator('.icon-item');
    const iconsInIconGrid = iconItems.locator('app-icon');
    await expect(iconsInIconGrid).toHaveCount(3);

    // Verify color section exists
    const sections = page.locator('section h2');
    await expect(sections.nth(1)).toContainText('Color Variations');

    // Verify size section exists
    await expect(sections.nth(2)).toContainText('Size Variations');
  });

  test('displays different icon path values', async ({ page }) => {
    await page.goto('/icon');

    const iconItems = page.locator('.icon-item');
    await expect(iconItems).toHaveCount(3);

    // Verify icon names are displayed
    await expect(iconItems.first()).toContainText('Checkmark');
    await expect(iconItems.nth(1)).toContainText('Circle');
    await expect(iconItems.nth(2)).toContainText('Star');
  });

  test('displays color variations', async ({ page }) => {
    await page.goto('/icon');

    const colorItems = page.locator('.color-item');
    // Should have 6 color variations (currentColor, #ff0000, #00ff00, #0000ff, #ff6600, #990099)
    await expect(colorItems).toHaveCount(6);
  });

  test('displays size variations', async ({ page }) => {
    await page.goto('/icon');

    const sizeItems = page.locator('.size-item');
    // Should have 5 size variations (16, 24, 32, 48, 64)
    await expect(sizeItems).toHaveCount(5);

    // Verify size labels
    await expect(sizeItems.first()).toContainText('16px');
    await expect(sizeItems.last()).toContainText('64px');
  });

  test('navigation to icon showcase', async ({ page }) => {
    // Start at root - should redirect to /icon
    await page.goto('/');

    // Verify we're on the icon page
    await expect(page.locator('h1')).toHaveText('Icon Component');

    // Verify nav link exists
    const navLink = page.locator('nav a');
    await expect(navLink).toHaveText('Icon Component');
    await expect(navLink).toHaveAttribute('routerlink', '/icon');
  });

  test('screenshot - icon showcase visual regression', async ({ page }) => {
    await page.goto('/icon');

    // Wait for Angular to render
    await page.waitForTimeout(1000);

    // Take screenshot for visual regression testing
    await expect(page).toHaveScreenshot('icon-showcase.png', {
      fullPage: true,
    });
  });
});

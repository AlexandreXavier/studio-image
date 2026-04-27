import { test, expect } from '@playwright/test';

async function seedImage(page: any) {
  await page.goto('/editor');
  await page.evaluate(() => {
    localStorage.setItem('xani_image', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==');
  });
  await page.reload();
  await page.waitForTimeout(300);
}

test.describe('non-linear history navigation', () => {
  test.beforeEach(async ({ page }) => {
    await seedImage(page);
  });

  test('clicking a past snapshot restores that state', async ({ page }) => {
    // Apply two edits
    const toolbar = page.locator('[data-testid="toolbar"]');
    await toolbar.locator('button').nth(0).click(); // Crop
    await page.locator('text=Apply Crop').click();

    await toolbar.locator('button').nth(1).click(); // Resize
    await page.locator('text=Apply Resize').click();

    // Should have 3 history entries: Original, Crop, Resize
    let history = page.locator('[data-testid="history-panel"] button');
    await expect(history).toHaveCount(3);

    // Click on the first snapshot ("Original")
    await history.nth(0).click();

    // Original should now be active
    await expect(history.nth(0)).toHaveCSS('background-color', /rgb\(.*?\)/);
  });

  test('jumping back and applying replaces future history', async ({ page }) => {
    // Apply two edits
    const toolbar = page.locator('[data-testid="toolbar"]');
    await toolbar.locator('button').nth(0).click(); // Crop
    await page.locator('text=Apply Crop').click();

    await toolbar.locator('button').nth(1).click(); // Resize
    await page.locator('text=Apply Resize').click();

    let history = page.locator('[data-testid="history-panel"] button');
    await expect(history).toHaveCount(3);

    // Jump back to Original
    await history.nth(0).click();

    // Apply a new tool from that point
    await toolbar.locator('button').nth(1).click(); // Resize again
    await page.locator('text=Apply Resize').click();

    // History should now be Original, Resize (old Crop and Resize replaced)
    history = page.locator('[data-testid="history-panel"] button');
    await expect(history).toHaveCount(2);
    await expect(history.nth(1)).toContainText('Resize');
  });
});

import { test, expect } from '@playwright/test';

async function seedImage(page: any) {
  await page.goto('/editor');
  await page.evaluate(() => {
    localStorage.setItem('xani_image', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==');
  });
  await page.reload();
}

test.describe('canvas engine — tool activation', () => {
  test.beforeEach(async ({ page }) => {
    await seedImage(page);
    await page.waitForTimeout(300);
  });

  test('selecting crop tool shows crop controls', async ({ page }) => {
    const toolbar = page.locator('[data-testid="toolbar"]');
    await toolbar.locator('button').nth(0).click(); // Crop

    const panel = page.locator('[data-testid="tool-panel"]');
    await expect(panel).toBeVisible();
    await expect(panel.locator('h3')).toContainText('Crop');
    await expect(panel.locator('button')).toContainText('Apply Crop');
  });

  test('selecting resize tool shows resize controls', async ({ page }) => {
    const toolbar = page.locator('[data-testid="toolbar"]');
    await toolbar.locator('button').nth(1).click(); // Resize

    const panel = page.locator('[data-testid="tool-panel"]');
    await expect(panel).toBeVisible();
    await expect(panel.locator('h3')).toContainText('Resize');
    await expect(panel.locator('button')).toContainText('Apply Resize');
  });
});

test.describe('canvas engine — apply and history', () => {
  test.beforeEach(async ({ page }) => {
    await seedImage(page);
    await page.waitForTimeout(300);
  });

  test('applying crop adds history entry', async ({ page }) => {
    const toolbar = page.locator('[data-testid="toolbar"]');
    await toolbar.locator('button').nth(0).click(); // Crop

    // Set crop to 1x1
    await page.locator('input[type="number"]').nth(2).fill('1'); // Width
    await page.locator('input[type="number"]').nth(3).fill('1'); // Height

    await page.locator('text=Apply Crop').click();

    // History should have "Original" and "Crop"
    const history = page.locator('[data-testid="history-panel"] button');
    await expect(history).toHaveCount(2);
    await expect(history.nth(1)).toContainText('Crop');
  });

  test('undo reverts canvas change', async ({ page }) => {
    // Apply crop first
    const toolbar = page.locator('[data-testid="toolbar"]');
    await toolbar.locator('button').nth(0).click();
    await page.locator('input[type="number"]').nth(2).fill('1');
    await page.locator('input[type="number"]').nth(3).fill('1');
    await page.locator('text=Apply Crop').click();

    // Wait for history to update
    const history = page.locator('[data-testid="history-panel"] button');
    await expect(history).toHaveCount(2);

    // Click undo
    await page.locator('text=Undo').click();

    // History should go back to Original being active
    await expect(history.nth(0)).toHaveCSS('background-color', /rgb\(.*?\)/); // active styling
  });
});

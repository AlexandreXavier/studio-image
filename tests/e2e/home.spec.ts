import { test, expect } from '@playwright/test';

test.describe('homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('has title and header', async ({ page }) => {
    await expect(page).toHaveTitle(/Xani Image Studio/);
    await expect(page.locator('.brand-title')).toContainText('Xani Image Studio');
    await expect(page.locator('.brand-subtitle')).toContainText('Files never leave your device');
  });

  test('grid is disabled before upload', async ({ page }) => {
    const cards = page.locator('.tool-card');
    await expect(cards).toHaveCount(5);
    for (let i = 0; i < 5; i++) {
      await expect(cards.nth(i)).toHaveClass(/disabled/);
    }
  });

  test('upload activates grid', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('xani_image', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==');
    });
    await page.reload();

    const cards = page.locator('.tool-card');
    for (let i = 0; i < 5; i++) {
      await expect(cards.nth(i)).not.toHaveClass(/disabled/);
    }
  });

  test('rejects oversized file', async ({ page }) => {
    const buffer = Buffer.alloc(6 * 1024 * 1024); // 6 MB
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'huge.png',
      mimeType: 'image/png',
      buffer,
    });

    await page.waitForTimeout(500);
    await expect(page.locator('text=File too large')).toBeVisible();
  });

  test('rejects wrong format', async ({ page }) => {
    const buffer = Buffer.from('not an image');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'bad.txt',
      mimeType: 'text/plain',
      buffer,
    });

    await page.waitForTimeout(500);
    await expect(page.locator('text=Format not accepted')).toBeVisible();
  });
});

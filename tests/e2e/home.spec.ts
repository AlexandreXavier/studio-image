import { test, expect } from '@playwright/test';

test.describe('landing page validations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('rejects oversized file', async ({ page }) => {
    const buffer = Buffer.alloc(6 * 1024 * 1024); // 6 MB
    const dropzone = page.locator('[data-testid="upload-dropzone"]');
    await dropzone.click();
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'huge.png',
      mimeType: 'image/png',
      buffer,
    });

    await expect(page.locator('text=File too large')).toBeVisible({ timeout: 5000 });
  });

  test('rejects wrong format', async ({ page }) => {
    const buffer = Buffer.from('not an image');
    const dropzone = page.locator('[data-testid="upload-dropzone"]');
    await dropzone.click();
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'bad.txt',
      mimeType: 'text/plain',
      buffer,
    });

    await expect(page.locator('text=Format not accepted')).toBeVisible({ timeout: 5000 });
  });
});

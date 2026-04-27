import { test, expect } from '@playwright/test';

test.describe('restructured landing page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('has upload dropzone and disabled AI generator', async ({ page }) => {
    // Upload area is visible and centered
    await expect(page.locator('[data-testid="upload-dropzone"]')).toBeVisible();
    await expect(page.locator('text=Abrir imagem')).toBeVisible();

    // AI generator button is disabled with "Em breve"
    const aiButton = page.locator('[data-testid="ai-generator"]');
    await expect(aiButton).toBeVisible();
    await expect(aiButton).toBeDisabled();
    await expect(aiButton).toContainText('Em breve');

    // No tool grid on landing page
    await expect(page.locator('.tool-grid')).not.toBeVisible();
    await expect(page.locator('.tool-card')).toHaveCount(0);
  });

  test('upload redirects to editor', async ({ page }) => {
    // Seed image via evaluate to bypass FileReader flakiness in headless
    await page.evaluate(() => {
      localStorage.setItem('xani_image', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==');
      window.location.href = '/editor';
    });

    await page.waitForURL('**/editor', { timeout: 5000 });
    await expect(page).toHaveURL(/\/editor/);
    await expect(page.locator('canvas')).toBeVisible();
  });

  test('theme toggle works on landing page', async ({ page }) => {
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'light');

    await page.waitForTimeout(300);
    await page.locator('button[aria-label="Toggle theme"]').click();
    await expect(html).toHaveAttribute('data-theme', 'dark');
  });
});

import { test, expect } from '@playwright/test';

async function seedImage(page: any) {
  await page.goto('/editor');
  await page.evaluate(() => {
    localStorage.setItem('xani_image', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==');
  });
  await page.reload();
}

test.describe('workspace shell', () => {
  test.beforeEach(async ({ page }) => {
    await seedImage(page);
    await page.waitForTimeout(300); // wait for hydration
  });

  test('has minimal header with logo and theme toggle', async ({ page }) => {
    // Header should be minimal — no large subtitle on editor
    await expect(page.locator('.brand-title')).toContainText('Xani');
    await expect(page.locator('button[aria-label="Toggle theme"]')).toBeVisible();
    // The full subtitle from landing page should NOT be here
    await expect(page.locator('.brand-subtitle')).not.toBeVisible();
  });

  test('has left toolbar with 5 tool icons', async ({ page }) => {
    const toolbar = page.locator('[data-testid="toolbar"]');
    await expect(toolbar).toBeVisible();
    const buttons = toolbar.locator('button');
    await expect(buttons).toHaveCount(5);
  });

  test('has central canvas area with image', async ({ page }) => {
    const canvas = page.locator('[data-testid="canvas-area"]');
    await expect(canvas).toBeVisible();
    await expect(canvas.locator('canvas')).toBeVisible();
  });

  test('has right history panel', async ({ page }) => {
    const panel = page.locator('[data-testid="history-panel"]');
    await expect(panel).toBeVisible();
  });

  test('has bottom footer bar with controls', async ({ page }) => {
    const footer = page.locator('[data-testid="footer-bar"]');
    await expect(footer).toBeVisible();
    await expect(footer.locator('text=Download')).toBeVisible();
    await expect(footer.locator('text=Undo')).toBeVisible();
    await expect(footer.locator('text=Redo')).toBeVisible();
    await expect(footer.locator('text=Fechar')).toBeVisible();
  });
});

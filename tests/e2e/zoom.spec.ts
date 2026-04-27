import { test, expect } from '@playwright/test';

async function seedImage(page: any) {
  await page.goto('/editor');
  await page.evaluate(() => {
    localStorage.setItem('xani_image', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==');
  });
  await page.reload();
  await page.waitForTimeout(300);
}

test.describe('zoom controls', () => {
  test.beforeEach(async ({ page }) => {
    await seedImage(page);
  });

  test('zoom in increases scale display', async ({ page }) => {
    const zoomDisplay = page.locator('[data-testid="footer-bar"] span');
    // Initial scale should be 100%
    await expect(zoomDisplay).toContainText('100%');

    await page.locator('button[aria-label="Zoom in"]').click();
    await expect(zoomDisplay).toContainText('110%');

    await page.locator('button[aria-label="Zoom in"]').click();
    await expect(zoomDisplay).toContainText('120%');
  });

  test('zoom out decreases scale display', async ({ page }) => {
    // Zoom in first so we can zoom out
    await page.locator('button[aria-label="Zoom in"]').click();
    await page.locator('button[aria-label="Zoom in"]').click();

    const zoomDisplay = page.locator('[data-testid="footer-bar"] span');
    await expect(zoomDisplay).toContainText('120%');

    await page.locator('button[aria-label="Zoom out"]').click();
    await expect(zoomDisplay).toContainText('110%');
  });

  test('zoom limits at minimum 20%', async ({ page }) => {
    const zoomDisplay = page.locator('[data-testid="footer-bar"] span');

    // Click zoom out many times
    for (let i = 0; i < 20; i++) {
      await page.locator('button[aria-label="Zoom out"]').click();
    }

    // Should be clamped at 20%
    await expect(zoomDisplay).toContainText('20%');
  });
});

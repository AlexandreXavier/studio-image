import { test, expect } from '@playwright/test';

async function seedImage(page: any) {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('xani_image', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==');
  });
  await page.reload();
}

test.describe('crop editor', () => {
  test('loads crop page after upload', async ({ page }) => {
    await seedImage(page);
    await page.locator('.tool-card').nth(0).click(); // Crop
    await page.waitForURL('**/crop');
    await expect(page.locator('text=Crop Image')).toBeVisible();
  });

  test('download produces a file', async ({ page }) => {
    await seedImage(page);
    await page.goto('/crop');
    await page.waitForTimeout(300);

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('text=Download').click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/-edited\.png$/);
  });

  test('apply and continue returns to home', async ({ page }) => {
    await seedImage(page);
    await page.goto('/crop');
    await page.waitForTimeout(300);

    await page.locator('text=Apply & Continue').click();
    await page.waitForURL('**/');
    await expect(page.locator('.brand-title')).toContainText('Xani Image Studio');
  });
});

test.describe('resize editor', () => {
  test('can resize by pixels', async ({ page }) => {
    await seedImage(page);
    await page.goto('/resize');
    await page.waitForTimeout(300);

    await expect(page.locator('text=Resize Image')).toBeVisible();
    await page.locator('select[data-testid="resize-mode"]').selectOption('pixels');
    await page.locator('input[type="number"]').nth(0).fill('50');
    await page.locator('input[type="number"]').nth(1).fill('50');
    await page.locator('text=Apply Resize').click();
    await page.waitForTimeout(200);

    await page.locator('text=Apply & Continue').click();
    await page.waitForURL('**/');
  });
});

test.describe('pipeline', () => {
  test('crop then resize uses cropped image', async ({ page }) => {
    await seedImage(page);
    await page.goto('/crop');
    await page.waitForTimeout(300);

    // Apply crop
    await page.locator('text=Apply & Continue').click();
    await page.waitForURL('**/');

    // Go to resize
    await page.locator('.tool-card').nth(1).click(); // Resize
    await page.waitForURL('**/resize');
    await expect(page.locator('text=Resize Image')).toBeVisible();
  });
});

test.describe('reset', () => {
  test('reset clears image and redirects home', async ({ page }) => {
    await seedImage(page);
    await page.goto('/crop');
    await page.waitForTimeout(300);

    await page.locator('text=Reset').click();
    await page.waitForURL('**/');

    const cards = page.locator('.tool-card');
    await expect(cards.nth(0)).toHaveClass(/disabled/);
  });
});

import { test, expect } from '@playwright/test';

async function seedImage(page: any) {
  await page.goto('/editor');
  await page.evaluate(() => {
    localStorage.setItem('xani_image', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==');
  });
  await page.reload();
  await page.waitForTimeout(300);
}

test.describe('persistence — history survives reload', () => {
  test('history entries persist after page reload', async ({ page }) => {
    await seedImage(page);

    // Apply crop
    const toolbar = page.locator('[data-testid="toolbar"]');
    await toolbar.locator('button').nth(0).click();
    await page.locator('text=Apply Crop').click();

    // Verify 2 entries before reload
    let history = page.locator('[data-testid="history-panel"] button');
    await expect(history).toHaveCount(2);

    // Reload page
    await page.reload();
    await page.waitForTimeout(300);

    // History should still have 2 entries
    history = page.locator('[data-testid="history-panel"] button');
    await expect(history).toHaveCount(2);
    await expect(history.nth(1)).toContainText('Crop');
  });

  test('active history index persists after reload', async ({ page }) => {
    await seedImage(page);

    // Apply two edits
    const toolbar = page.locator('[data-testid="toolbar"]');
    await toolbar.locator('button').nth(0).click();
    await page.locator('text=Apply Crop').click();
    await toolbar.locator('button').nth(1).click();
    await page.locator('text=Apply Resize').click();

    // Undo once (back to Crop)
    await page.locator('text=Undo').click();

    // Reload
    await page.reload();
    await page.waitForTimeout(300);

    // Should have 3 history entries
    const history = page.locator('[data-testid="history-panel"] button');
    await expect(history).toHaveCount(3);

    // Crop should be the active one (index 1)
    // We verify by clicking Redo to see if it advances to Resize
    await expect(page.locator('text=Redo')).not.toBeDisabled();
    await page.locator('text=Redo').click();
    await expect(history.nth(2)).toContainText('Resize');
  });
});

test.describe('persistence — close clears everything', () => {
  test('close clears workspace state on reload', async ({ page }) => {
    await seedImage(page);

    // Apply an edit
    const toolbar = page.locator('[data-testid="toolbar"]');
    await toolbar.locator('button').nth(0).click();
    await page.locator('text=Apply Crop').click();

    // Close
    await page.locator('text=Fechar').click();
    await page.waitForURL('**/');

    // Navigate back to editor
    await page.goto('/editor');
    await page.waitForTimeout(300);

    // Should show "no image" message since both image and workspace were cleared
    await expect(page.locator('text=No image loaded')).toBeVisible();
  });
});

import { test, expect } from '@playwright/test';

test.describe('Busaty public pages', () => {
  test('homepage hero renders text', async ({ page }) => {
    await page.goto('/');
    const heading = page.locator('h1');
    await expect(heading).toHaveText(/Busaty|باصاتي/);
    await expect(page.locator('[data-app-detail="parent"]')).toBeVisible();
  });

  test('help page FAQ tabs exist', async ({ page }) => {
    await page.goto('/help.html');
    await expect(page.locator('.faq-tabs button')).toHaveCount(3);
  });
});

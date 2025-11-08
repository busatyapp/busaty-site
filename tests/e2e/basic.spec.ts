import { test, expect } from '@playwright/test';

const FORMSPREE_URL = 'https://formspree.io/f/XXXXXXX';

test.describe('Busaty public pages', () => {
  test('homepage hero renders text', async ({ page }) => {
    await page.goto('/');
    const heading = page.locator('h1');
    await expect(heading).toHaveText(/Busaty|باصاتي/);
    await expect(page.locator('[data-app-detail="parent"]')).toBeVisible();
  });

  test('language switcher toggles content', async ({ page }) => {
    await page.goto('/');
    await page.selectOption('#lang-switcher', 'en');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toContainText('Busaty');
  });

  test('help page FAQ tabs exist', async ({ page }) => {
    await page.goto('/help.html');
    await expect(page.locator('.faq-tabs button')).toHaveCount(3);
  });

  test('contact form shows success message', async ({ page }) => {
    await page.route(FORMSPREE_URL, route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true })
      });
    });
    await page.goto('/help.html');
    await page.fill('input[name="name"]', 'Tester');
    await page.fill('input[name="email"]', 'tester@example.com');
    await page.fill('textarea[name="message"]', 'Smoke test message');
    await page.click('.contact-form button[type="submit"]');
    await expect(page.locator('.contact-form .form-message')).toContainText(/تم|thank you|success/i);
  });

  test('hero visual regression', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.hero')).toHaveScreenshot('hero-ar.png');
  });
});

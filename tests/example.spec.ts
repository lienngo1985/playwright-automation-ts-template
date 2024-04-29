import { test, expect } from '@playwright/test';

test.describe('navigation', () =>{
  test.beforeEach(async ({ page }) => {
    await page.goto('https://playwright.dev/');
  });


  test('has title', async ({ page }) => {
    await expect(page).toHaveTitle(/Playwright/); 
  });

  test('get started link', async ({ page }) => {
    const getStarted = page.getByRole('link', { name: 'Get Started' });
    await getStarted.click();
    await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
  });
})

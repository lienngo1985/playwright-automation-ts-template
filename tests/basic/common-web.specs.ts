import { test, expect } from '@playwright/test';

test('verify simple navigation', async ({ page }) => {
    // navigate to page
    await page.goto('http://google.com');

    // ensure that the page is fully loaded before proceeding with interactions or data extraction.
    await page.waitForLoadState('networkidle');

    // check page Title
    await expect(page).toHaveTitle('Google');
})
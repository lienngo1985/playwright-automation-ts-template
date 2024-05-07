import { test, expect, chromium } from '@playwright/test';

test.describe('Commons', () => {
    test('example of simple navigation', async ({ page }) => {
        // navigate to page
        await page.goto('https://google.com');

        // ensure that the page is fully loaded before proceeding with interactions or data extraction.
        await page.waitForLoadState('networkidle');

        // check page Title
        await expect(page).toHaveTitle('Google');
    });

    test.skip('example of web hierachy', async ({ page }) => {
        const browser = chromium.launch();
        const context = (await browser).newContext();
        const page1 = (await context).newPage();
        const page2 = (await context).newPage();

        (await page1).goto('https://google.com');
        (await page2).goto('https://www.youtube.com/');
    });

    test('example of file upload', async ({ page }) => {
        await page.goto('https://kitchen.applitools.com/ingredients/file-picker');
        
        const uploadButton = await page.getByLabel('Upload Recipe Picture');

        // Click Upload button and wait for File Chooser window displayed, then upload file
        const [fileChooser] = await Promise.all([
            page.waitForEvent('filechooser'), uploadButton.click()
        ]);
        await fileChooser.setFiles('resources/amongus.png')

        // Verify if the file is uploaded successfully
        await expect(page.getByRole('figure', { name: 'Upload Preview' })).toBeVisible();
    })

    test('example of file download', async ({ page }) => {
        await page.goto('https://demoqa.com/upload-download');
        const downloadButton = await page.getByRole('link', { name: 'Download' });

        // Click Download button and wait for download event, then save files to desired location
        const [fileDownload] = await Promise.all([
            page.waitForEvent('download'), downloadButton.click()
        ]);
        await fileDownload.saveAs('resources/sample_download.jpeg')
    })

    test.use({
        locale: 'de-DE',
        timezoneId: 'Europe/Berlin',
    });
    test('example of locale stimulation', async ({ page }) => {
        await page.goto('https://www.bing.com')
    })

    test('example of intercept network - mock api request within web application', async ({ page }) => {
        await page.route('https://kitchen.applitools.com/api/recipes', async route => {
            //const response = await page.request.fetch(route.request());
            const json = {
                time: 1671374535336,
                data: [
                    {
                        "id": "mixed-grill-skewers",
                        "title": "Mixed Grill Skewers",
                        "image": "/images/mixed-grill-skewers.jpg"
                    },
                    {
                        "id": "rice-paper-sushi-rolls",
                        "title": "Rice Paper Sushi Rolls",
                        "image": "/images/rice-paper-sushi-rolls.jpg"
                    }]
            };
            route.fulfill({ 
                status: 200,
                json,
            });
        })

        // Go to the page
        await page.goto('https://kitchen.applitools.com/ingredients/api');
        await page.waitForLoadState('networkidle');

        // Assert that two intercept recipe displayed on page
        await expect(page.locator('div').getByText(/^Mixed Grill SkewersRice Paper Sushi Rolls$/).first()).toBeVisible();
    })

    test('example of intercept network - modify API responses within web application', async ({ page }) => {
        // Get the response and add to it
        await page.route('https://kitchen.applitools.com/api/recipes', async route => {
            const response = await page.request.fetch(route.request());
            let body = await response.text();
            body = body.replace('"Mixed Grill Skewers"', '"Mixed Grill Beef Skewers"');
            await route.fulfill({ body });
        })

        // Go to the page
        await page.goto('https://kitchen.applitools.com/ingredients/api');
        await page.waitForLoadState("networkidle");

        // Assert that two intercept recipe displayed on page
        await expect(page.locator('div').getByText(/Mixed Grill Beef Skewers/).first()).toBeVisible();
    })
})
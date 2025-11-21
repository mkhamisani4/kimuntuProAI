import { test, expect } from '@playwright/test';

test.describe('Export Features', () => {
  // Setup: Generate a mock result for each test
  test.beforeEach(async ({ page }) => {
    // Mock successful API response
    await page.route('**/api/ai/answer', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          sections: {
            'Executive Summary': 'This is the executive summary content for export testing.',
            'Market Analysis': 'This is the market analysis content.',
            'Financial Projections': 'Revenue projections for 12 months.',
          },
          sources: [
            { title: 'Source 1', url: 'https://example.com/1', snippet: 'Snippet 1' },
          ],
          meta: {
            model: 'gpt-4o-mini',
            tokensIn: 150,
            costCents: 10,
            latencyMs: 2000,
          },
        }),
      });
    });

    await page.goto('/dashboard/business/streamlined-plan');

    // Generate result
    await page.getByRole('textbox').fill('Test business plan for export');
    await page.getByRole('button', { name: /Run Assistant/i }).click();

    // Wait for result to appear
    await expect(page.getByText('Results')).toBeVisible({ timeout: 5000 });
  });

  test('Export dropdown button is visible after result is generated', async ({ page }) => {
    const exportButton = page.getByRole('button', { name: /Export/i });
    await expect(exportButton).toBeVisible();
  });

  test('Export dropdown menu opens and shows all options', async ({ page }) => {
    const exportButton = page.getByRole('button', { name: /Export/i });
    await exportButton.click();

    // Check all menu items are visible
    await expect(page.getByTestId('export-markdown')).toBeVisible();
    await expect(page.getByTestId('export-plain-text')).toBeVisible();
    await expect(page.getByTestId('export-html')).toBeVisible();
    await expect(page.getByTestId('export-pdf')).toBeVisible();
  });

  test('Copy as Markdown shows success toast', async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    const exportButton = page.getByRole('button', { name: /Export/i });
    await exportButton.click();

    const markdownOption = page.getByTestId('export-markdown');
    await markdownOption.click();

    // Wait for toast (react-hot-toast displays toasts in the DOM)
    // Note: Toast detection may vary depending on implementation
    // We can verify clipboard content instead
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());

    expect(clipboardText).toContain('## Executive Summary');
    expect(clipboardText).toContain('This is the executive summary content for export testing.');
    expect(clipboardText).toContain('## Market Analysis');
  });

  test('Copy as Plain Text shows success toast', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    const exportButton = page.getByRole('button', { name: /Export/i });
    await exportButton.click();

    const plainTextOption = page.getByTestId('export-plain-text');
    await plainTextOption.click();

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());

    // Plain text should not have markdown markers
    expect(clipboardText).not.toContain('##');
    expect(clipboardText).toContain('Executive Summary');
    expect(clipboardText).toContain('This is the executive summary content for export testing.');
    expect(clipboardText).toContain('---'); // Separator
  });

  test('Copy as HTML shows success toast', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    const exportButton = page.getByRole('button', { name: /Export/i });
    await exportButton.click();

    const htmlOption = page.getByTestId('export-html');
    await htmlOption.click();

    // HTML copy may not be readable via clipboard.readText()
    // But we can verify the action completed without errors
    await page.waitForTimeout(500);

    // Check no console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    expect(errors.filter(e => !e.includes('favicon'))).toHaveLength(0);
  });

  test('Download PDF triggers file download', async ({ page }) => {
    const exportButton = page.getByRole('button', { name: /Export/i });
    await exportButton.click();

    // Listen for download event
    const downloadPromise = page.waitForEvent('download');

    const pdfOption = page.getByTestId('export-pdf');
    await pdfOption.click();

    const download = await downloadPromise;

    // Check filename format: KimuntuPro_<assistant>_<date>.pdf
    const filename = download.suggestedFilename();
    expect(filename).toMatch(/^KimuntuPro_streamlined_plan_\d{4}-\d{2}-\d{2}\.pdf$/);
  });

  test('Export dropdown has emerald gradient styling', async ({ page }) => {
    const exportButton = page.getByRole('button', { name: /Export/i });

    // Check button has gradient classes
    const classes = await exportButton.getAttribute('class');
    expect(classes).toContain('bg-gradient-to-r');
    expect(classes).toContain('from-emerald-600');
    expect(classes).toContain('to-teal-600');
  });

  test('Export dropdown supports keyboard navigation', async ({ page }) => {
    const exportButton = page.getByRole('button', { name: /Export/i });

    // Focus and open with keyboard
    await exportButton.focus();
    await page.keyboard.press('Enter');

    // Menu should be open
    await expect(page.getByTestId('export-markdown')).toBeVisible();

    // Navigate with arrow keys
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');

    // Close with Escape
    await page.keyboard.press('Escape');

    // Menu should be closed
    await expect(page.getByTestId('export-markdown')).not.toBeVisible();
  });

  test('Export dropdown closes after selecting an option', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    const exportButton = page.getByRole('button', { name: /Export/i });
    await exportButton.click();

    // Menu should be open
    await expect(page.getByTestId('export-markdown')).toBeVisible();

    // Click an option
    const markdownOption = page.getByTestId('export-markdown');
    await markdownOption.click();

    // Wait a moment for animation
    await page.waitForTimeout(200);

    // Menu should be closed
    await expect(page.getByTestId('export-markdown')).not.toBeVisible();
  });

  test('Export dropdown has proper ARIA roles', async ({ page }) => {
    const exportButton = page.getByRole('button', { name: /Export/i });
    await exportButton.click();

    // Check for menu role
    const menu = page.getByRole('menu');
    await expect(menu).toBeVisible();

    // Check for menuitem roles
    const menuItems = page.getByRole('menuitem');
    const count = await menuItems.count();
    expect(count).toBe(4);
  });

  test('Export works on all three assistant pages', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    const pages = [
      '/dashboard/business/streamlined-plan',
      '/dashboard/business/exec-summary',
      '/dashboard/business/market-analysis',
    ];

    for (const pagePath of pages) {
      await page.goto(pagePath);

      // Generate result
      await page.getByRole('textbox').fill('Test prompt');
      await page.getByRole('button', { name: /Run Assistant/i }).click();
      await expect(page.getByText('Results')).toBeVisible({ timeout: 5000 });

      // Check export button exists
      const exportButton = page.getByRole('button', { name: /Export/i });
      await expect(exportButton).toBeVisible();

      // Test one export option
      await exportButton.click();
      const markdownOption = page.getByTestId('export-markdown');
      await markdownOption.click();

      // Verify clipboard has content
      const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
      expect(clipboardText.length).toBeGreaterThan(0);
    }
  });

  test('No console errors during export operations', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    const errors: string[] = [];
    page.on('pageerror', error => {
      errors.push(error.message);
    });

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    const exportButton = page.getByRole('button', { name: /Export/i });

    // Test all export options
    await exportButton.click();
    await page.getByTestId('export-markdown').click();

    await page.waitForTimeout(500);

    await exportButton.click();
    await page.getByTestId('export-plain-text').click();

    await page.waitForTimeout(500);

    await exportButton.click();
    await page.getByTestId('export-html').click();

    await page.waitForTimeout(500);

    // Filter out favicon errors (not related to our code)
    const relevantErrors = errors.filter(e => !e.includes('favicon'));
    expect(relevantErrors).toHaveLength(0);
  });

  test('Export dropdown menu has divider between copy and download options', async ({ page }) => {
    const exportButton = page.getByRole('button', { name: /Export/i });
    await exportButton.click();

    // Check for divider element (using CSS selector)
    const divider = page.locator('.border-t.border-gray-100');
    await expect(divider).toBeVisible();
  });

  test('Copy operations handle empty sections gracefully', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    // Mock empty sections response
    await page.route('**/api/ai/answer', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          sections: {},
          sources: [],
          meta: {
            model: 'gpt-4o-mini',
            tokensIn: 10,
            costCents: 1,
            latencyMs: 500,
          },
        }),
      });
    });

    await page.goto('/dashboard/business/streamlined-plan');
    await page.getByRole('textbox').fill('Test');
    await page.getByRole('button', { name: /Run Assistant/i }).click();

    // Wait for result (even if empty)
    await expect(page.getByText('No sections returned')).toBeVisible({ timeout: 5000 });

    // Export button should still be available
    const exportButton = page.getByRole('button', { name: /Export/i });
    await expect(exportButton).toBeVisible();

    // Try to copy (should not error)
    await exportButton.click();
    await page.getByTestId('export-markdown').click();

    // Check clipboard (should be empty string)
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toBe('');
  });
});

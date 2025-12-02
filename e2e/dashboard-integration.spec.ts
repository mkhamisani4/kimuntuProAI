import { test, expect } from '@playwright/test';

test.describe('Dashboard Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Mock authentication if needed
    // For now, we'll test the navigation without auth
  });

  test('navigates from dashboard to Streamlined Plan', async ({ page }) => {
    await page.goto('/dashboard/business');

    // Click on Streamlined Plan card
    const streamlinedPlanLink = page.getByRole('link', { name: /Generate Plan/i });
    await streamlinedPlanLink.click();

    // Verify URL
    await expect(page).toHaveURL('/dashboard/business/streamlined-plan');

    // Verify page header
    await expect(page.getByRole('heading', { name: 'Streamlined Business Plan' })).toBeVisible();

    // Verify breadcrumb
    await expect(page.getByText('Dashboard')).toBeVisible();
    await expect(page.getByText('Business Track')).toBeVisible();
    await expect(page.getByText('Streamlined Business Plan')).toBeVisible();

    // Check for no console errors
    const errors: string[] = [];
    page.on('pageerror', error => {
      errors.push(error.message);
    });
    await page.waitForTimeout(1000);
    expect(errors).toHaveLength(0);
  });

  test('navigates from dashboard to Executive Summary', async ({ page }) => {
    await page.goto('/dashboard/business');

    // Click on Executive Summary card
    const execSummaryLink = page.getByRole('link', { name: /Create Summary/i });
    await execSummaryLink.click();

    // Verify URL
    await expect(page).toHaveURL('/dashboard/business/exec-summary');

    // Verify page header
    await expect(page.getByRole('heading', { name: 'Executive Summary + Financials' })).toBeVisible();

    // Verify breadcrumb
    await expect(page.getByText('Dashboard')).toBeVisible();
    await expect(page.getByText('Business Track')).toBeVisible();
  });

  test('navigates from dashboard to Market Analysis', async ({ page }) => {
    await page.goto('/dashboard/business');

    // Click on Market Analysis card
    const marketAnalysisLink = page.getByRole('link', { name: /Analyze Market/i });
    await marketAnalysisLink.click();

    // Verify URL
    await expect(page).toHaveURL('/dashboard/business/market-analysis');

    // Verify page header
    await expect(page.getByRole('heading', { name: 'Market Analysis' })).toBeVisible();

    // Verify breadcrumb
    await expect(page.getByText('Dashboard')).toBeVisible();
    await expect(page.getByText('Business Track')).toBeVisible();
  });

  test('can use browser back button to return to dashboard', async ({ page }) => {
    await page.goto('/dashboard/business');

    // Navigate to Streamlined Plan
    await page.getByRole('link', { name: /Generate Plan/i }).click();
    await expect(page).toHaveURL('/dashboard/business/streamlined-plan');

    // Use browser back button
    await page.goBack();

    // Should be back at dashboard
    await expect(page).toHaveURL('/dashboard/business');
    await expect(page.getByRole('heading', { name: 'Business Track' })).toBeVisible();
  });

  test('can use Back button to return to dashboard', async ({ page }) => {
    await page.goto('/dashboard/business/streamlined-plan');

    // Click back button
    const backButton = page.getByLabel('Back to Business Track');
    await backButton.click();

    // Should be back at dashboard
    await expect(page).toHaveURL('/dashboard/business');
  });

  test('AI Tools section is visible on dashboard', async ({ page }) => {
    await page.goto('/dashboard/business');

    // Verify AI Tools section header
    await expect(page.getByText('✨ AI-Powered Tools')).toBeVisible();

    // Verify all three tool cards are present
    await expect(page.getByText('Streamlined Plan')).toBeVisible();
    await expect(page.getByText('Executive Summary')).toBeVisible();
    await expect(page.getByText('Market Analysis')).toBeVisible();
  });

  test('page layout has correct dark theme', async ({ page }) => {
    await page.goto('/dashboard/business/streamlined-plan');

    // Check that the main container has dark gradient background
    const mainDiv = page.locator('.bg-gradient-to-br').first();
    await expect(mainDiv).toBeVisible();

    // Verify dark theme classes are present
    const hasGradient = await mainDiv.evaluate(el => {
      return el.classList.contains('from-gray-900') &&
             el.classList.contains('via-gray-800') &&
             el.classList.contains('to-black');
    });
    expect(hasGradient).toBe(true);
  });

  test('TaskForm is rendered on each assistant page', async ({ page }) => {
    const pages = [
      '/dashboard/business/streamlined-plan',
      '/dashboard/business/exec-summary',
      '/dashboard/business/market-analysis',
    ];

    for (const pagePath of pages) {
      await page.goto(pagePath);

      // Verify form elements are present
      await expect(page.getByRole('combobox')).toBeVisible(); // Task selector
      await expect(page.getByRole('textbox')).toBeVisible(); // Prompt textarea
      await expect(page.getByRole('button', { name: /Run Assistant/i })).toBeVisible();
    }
  });

  test('placeholder is shown before result is generated', async ({ page }) => {
    await page.goto('/dashboard/business/streamlined-plan');

    // Verify placeholder text is visible
    await expect(page.getByText(/Enter your prompt to get started/i)).toBeVisible();
  });
});

test.describe('Mock Result Generation', () => {
  test('displays result after mocked successful response', async ({ page }) => {
    // Mock the API response
    await page.route('**/api/ai/answer', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          sections: {
            'Problem': 'Test problem section',
            'Solution': 'Test solution section',
          },
          sources: [],
          meta: {
            model: 'gpt-4o-mini',
            tokensIn: 100,
            tokensOut: 200,
            costCents: 5,
            latencyMs: 1500,
          },
        }),
      });
    });

    await page.goto('/dashboard/business/streamlined-plan');

    // Fill in the form
    await page.getByRole('textbox').fill('Test business plan prompt');

    // Click Run Assistant
    await page.getByRole('button', { name: /Run Assistant/i }).click();

    // Wait for result to appear
    await expect(page.getByText('Results')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Test problem section')).toBeVisible();
    await expect(page.getByText('Test solution section')).toBeVisible();
  });

  test('displays error banner on failed request', async ({ page }) => {
    // Mock the API error response
    await page.route('**/api/ai/answer', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'internal_error',
          message: 'Test error message',
        }),
      });
    });

    await page.goto('/dashboard/business/streamlined-plan');

    // Fill in the form
    await page.getByRole('textbox').fill('Test prompt');

    // Click Run Assistant
    await page.getByRole('button', { name: /Run Assistant/i }).click();

    // Wait for error to appear
    await expect(page.getByText(/Server Error/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Test error message')).toBeVisible();
  });
});

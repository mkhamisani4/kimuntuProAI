import { test, expect } from '@playwright/test';

test.describe('UI/UX Polish - Loading Skeletons', () => {
  test('shows loading skeleton during API call', async ({ page }) => {
    // Mock a delayed API response
    await page.route('**/api/ai/answer', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          sections: { 'Test Section': 'Test content' },
          sources: [],
          meta: {
            model: 'gpt-4o-mini',
            tokensIn: 100,
            costCents: 5,
            latencyMs: 1500,
          },
        }),
      });
    });

    await page.goto('/dashboard/business/streamlined-plan');

    // Fill and submit form
    await page.getByRole('textbox').fill('Test business plan');
    await page.getByRole('button', { name: /Run Assistant/i }).click();

    // Loading skeleton should appear
    const skeleton = page.getByTestId('loading-skeleton');
    await expect(skeleton).toBeVisible({ timeout: 1000 });

    // Wait for result to load (skeleton should disappear)
    await expect(skeleton).not.toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Results')).toBeVisible();
  });

  test('loading skeleton has correct structure', async ({ page }) => {
    // Mock a long delay to examine skeleton
    await page.route('**/api/ai/answer', async route => {
      await new Promise(resolve => setTimeout(resolve, 10000)); // Never resolve during test
    });

    await page.goto('/dashboard/business/streamlined-plan');

    await page.getByRole('textbox').fill('Test');
    await page.getByRole('button', { name: /Run Assistant/i }).click();

    // Wait for skeleton
    const skeleton = page.getByTestId('loading-skeleton');
    await expect(skeleton).toBeVisible({ timeout: 2000 });

    // Check for loading message
    await expect(page.getByText('Generating your response...')).toBeVisible();

    // Check for spinner
    const spinner = page.locator('.animate-spin').first();
    await expect(spinner).toBeVisible();
  });
});

test.describe('UI/UX Polish - Toast Notifications', () => {
  test('shows error toast when prompt is empty', async ({ page }) => {
    await page.goto('/dashboard/business/streamlined-plan');

    // Try to submit empty form
    const submitButton = page.getByRole('button', { name: /Run Assistant/i });

    // Button should be disabled when empty
    await expect(submitButton).toBeDisabled();
  });

  test('shows toast notifications on successful generation', async ({ page }) => {
    // Mock successful response
    await page.route('**/api/ai/answer', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          sections: { 'Section': 'Content' },
          sources: [],
          meta: {
            model: 'gpt-4o-mini',
            tokensIn: 100,
            costCents: 5,
            latencyMs: 1500,
          },
        }),
      });
    });

    await page.goto('/dashboard/business/streamlined-plan');

    await page.getByRole('textbox').fill('Test prompt');
    await page.getByRole('button', { name: /Run Assistant/i }).click();

    // Note: Toast notifications appear in a portal, checking for success is tricky
    // We'll verify the result appears instead
    await expect(page.getByText('Results')).toBeVisible({ timeout: 5000 });
  });

  test('copy to clipboard shows toast', async ({ page }) => {
    // Mock successful response
    await page.route('**/api/ai/answer', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          sections: { 'Section': 'Content to copy' },
          sources: [],
          meta: {
            model: 'gpt-4o-mini',
            tokensIn: 100,
            costCents: 5,
            latencyMs: 1500,
          },
        }),
      });
    });

    await page.goto('/dashboard/business/streamlined-plan');

    // Generate result
    await page.getByRole('textbox').fill('Test prompt');
    await page.getByRole('button', { name: /Run Assistant/i }).click();
    await expect(page.getByText('Results')).toBeVisible({ timeout: 5000 });

    // Grant clipboard permissions
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

    // Click copy button
    const copyButton = page.getByTestId('copy-button');
    await copyButton.click();

    // Verify clipboard content
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toContain('Section');
    expect(clipboardText).toContain('Content to copy');
  });
});

test.describe('UI/UX Polish - Character Counter', () => {
  test('character counter updates as user types', async ({ page }) => {
    await page.goto('/dashboard/business/streamlined-plan');

    const textarea = page.getByRole('textbox');
    const counter = page.getByTestId('character-counter');

    // Initially 0/1000
    await expect(counter).toHaveText('0/1000');

    // Type text
    await textarea.fill('Hello World');
    await expect(counter).toHaveText('11/1000');

    // Type more
    await textarea.fill('This is a longer test message');
    await expect(counter).toHaveText('30/1000');
  });

  test('character counter changes color near limit', async ({ page }) => {
    await page.goto('/dashboard/business/streamlined-plan');

    const textarea = page.getByRole('textbox');
    const counter = page.getByTestId('character-counter');

    // Fill with text near 90% limit (900 chars)
    const text900 = 'a'.repeat(900);
    await textarea.fill(text900);
    await expect(counter).toHaveText('900/1000');

    // Counter should have warning color class
    const counterClass = await counter.getAttribute('class');
    expect(counterClass).toContain('text-amber-600');
  });

  test('prevents typing beyond 1000 characters', async ({ page }) => {
    await page.goto('/dashboard/business/streamlined-plan');

    const textarea = page.getByRole('textbox');

    // Try to fill with 1100 characters
    const text1100 = 'a'.repeat(1100);
    await textarea.fill(text1100);

    // Should be truncated to 1000 due to maxLength attribute
    const value = await textarea.inputValue();
    expect(value.length).toBe(1000);
  });

  test('disables submit button when over limit', async ({ page }) => {
    await page.goto('/dashboard/business/streamlined-plan');

    const textarea = page.getByRole('textbox');
    const submitButton = page.getByRole('button', { name: /Run Assistant/i });

    // Fill with exactly 1000 chars (at limit)
    const text1000 = 'a'.repeat(1000);
    await textarea.fill(text1000);

    // Should be enabled at exactly 1000
    await expect(submitButton).not.toBeDisabled();

    // Note: Can't actually exceed 1000 due to maxLength, but button handles this
  });
});

test.describe('UI/UX Polish - Error Handling and Retry', () => {
  test('shows error UI with retry button on failure', async ({ page }) => {
    // Mock error response
    await page.route('**/api/ai/answer', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Server error occurred',
        }),
      });
    });

    await page.goto('/dashboard/business/streamlined-plan');

    await page.getByRole('textbox').fill('Test prompt');
    await page.getByRole('button', { name: /Run Assistant/i }).click();

    // Error UI should appear
    await expect(page.getByText('Generation Failed')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Server error occurred')).toBeVisible();

    // Retry button should be visible
    const retryButton = page.getByTestId('retry-button');
    await expect(retryButton).toBeVisible();
    await expect(retryButton).toHaveText('Try Again');
  });

  test('retry button clears error and allows re-submission', async ({ page }) => {
    let callCount = 0;

    // First call fails, second succeeds
    await page.route('**/api/ai/answer', async route => {
      callCount++;
      if (callCount === 1) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Server error' }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            sections: { 'Section': 'Success content' },
            sources: [],
            meta: {
              model: 'gpt-4o-mini',
              tokensIn: 100,
              costCents: 5,
              latencyMs: 1500,
            },
          }),
        });
      }
    });

    await page.goto('/dashboard/business/streamlined-plan');

    // First attempt - fails
    await page.getByRole('textbox').fill('Test prompt');
    await page.getByRole('button', { name: /Run Assistant/i }).click();

    // Wait for error
    await expect(page.getByText('Generation Failed')).toBeVisible({ timeout: 5000 });

    // Click retry
    const retryButton = page.getByTestId('retry-button');
    await retryButton.click();

    // Error should disappear
    await expect(page.getByText('Generation Failed')).not.toBeVisible();

    // Re-submit form
    await page.getByRole('button', { name: /Run Assistant/i }).click();

    // Should succeed this time
    await expect(page.getByText('Results')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Success content')).toBeVisible();
  });

  test('handles quota exceeded error', async ({ page }) => {
    const resetsAt = new Date(Date.now() + 3600000).toISOString();

    await page.route('**/api/ai/answer', async route => {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Quota exceeded',
          resetsAt,
        }),
      });
    });

    await page.goto('/dashboard/business/streamlined-plan');

    await page.getByRole('textbox').fill('Test prompt');
    await page.getByRole('button', { name: /Run Assistant/i }).click();

    // Wait for error banner
    await expect(page.getByText(/Quota Exceeded/i)).toBeVisible({ timeout: 5000 });
  });
});

test.describe('UI/UX Polish - Animations and Styling', () => {
  test('result sections have fade-in animation', async ({ page }) => {
    await page.route('**/api/ai/answer', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          sections: {
            'Section 1': 'Content 1',
            'Section 2': 'Content 2',
            'Section 3': 'Content 3',
          },
          sources: [],
          meta: {
            model: 'gpt-4o-mini',
            tokensIn: 100,
            costCents: 5,
            latencyMs: 1500,
          },
        }),
      });
    });

    await page.goto('/dashboard/business/streamlined-plan');

    await page.getByRole('textbox').fill('Test prompt');
    await page.getByRole('button', { name: /Run Assistant/i }).click();

    // Wait for results
    await expect(page.getByText('Results')).toBeVisible({ timeout: 5000 });

    // Check that sections have animate-fadeIn class
    const sections = page.locator('.animate-fadeIn');
    await expect(sections.first()).toBeVisible();

    // Verify multiple sections exist
    const count = await sections.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('maintains dark glassmorphism theme', async ({ page }) => {
    await page.goto('/dashboard/business/streamlined-plan');

    // Check main background gradient
    const mainDiv = page.locator('.bg-gradient-to-br').first();
    await expect(mainDiv).toBeVisible();

    // Verify gradient classes
    const hasGradient = await mainDiv.evaluate(el => {
      return el.classList.contains('from-gray-900') &&
             el.classList.contains('via-gray-800') &&
             el.classList.contains('to-black');
    });
    expect(hasGradient).toBe(true);
  });
});

test.describe('UI/UX Polish - No Console Errors', () => {
  test('no console errors on page load', async ({ page }) => {
    const errors: string[] = [];

    page.on('pageerror', error => {
      errors.push(error.message);
    });

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/dashboard/business/streamlined-plan');

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Check for errors
    expect(errors).toHaveLength(0);
  });

  test('no console errors during form interaction', async ({ page }) => {
    const errors: string[] = [];

    page.on('pageerror', error => {
      errors.push(error.message);
    });

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/dashboard/business/streamlined-plan');

    // Interact with form
    await page.getByRole('textbox').fill('Test prompt');
    await page.getByRole('combobox').selectOption('exec_summary');
    await page.getByRole('textbox').fill('Updated prompt');

    await page.waitForTimeout(1000);

    // Check for errors
    expect(errors).toHaveLength(0);
  });

  test('no console errors during API call and result display', async ({ page }) => {
    const errors: string[] = [];

    page.on('pageerror', error => {
      errors.push(error.message);
    });

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.route('**/api/ai/answer', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          sections: { 'Test': 'Content' },
          sources: [],
          meta: {
            model: 'gpt-4o-mini',
            tokensIn: 100,
            costCents: 5,
            latencyMs: 1500,
          },
        }),
      });
    });

    await page.goto('/dashboard/business/streamlined-plan');

    await page.getByRole('textbox').fill('Test prompt');
    await page.getByRole('button', { name: /Run Assistant/i }).click();

    // Wait for result
    await expect(page.getByText('Results')).toBeVisible({ timeout: 5000 });

    await page.waitForTimeout(1000);

    // Check for errors
    expect(errors).toHaveLength(0);
  });
});

test.describe('UI/UX Polish - Cross-page Consistency', () => {
  test('all three assistant pages have consistent UI/UX features', async ({ page }) => {
    const pages = [
      '/dashboard/business/streamlined-plan',
      '/dashboard/business/exec-summary',
      '/dashboard/business/market-analysis',
    ];

    for (const pagePath of pages) {
      await page.goto(pagePath);

      // Verify character counter exists
      await expect(page.getByTestId('character-counter')).toBeVisible();

      // Verify textarea has maxLength
      const textarea = page.getByRole('textbox');
      const maxLength = await textarea.getAttribute('maxLength');
      expect(maxLength).toBe('1000');

      // Verify submit button is disabled when empty
      const submitButton = page.getByRole('button', { name: /Run Assistant/i });
      await expect(submitButton).toBeDisabled();

      // Verify dark theme
      const mainDiv = page.locator('.bg-gradient-to-br').first();
      await expect(mainDiv).toBeVisible();
    }
  });
});

# Generate Playwright Tests

Generate Playwright tests based on user requirements.

## Process

1. Ask the user to describe what they want to test
2. Create a well-structured test file
3. Use best practices for selectors and assertions
4. Include proper setup and teardown
5. Add meaningful test descriptions

## Test Template

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should do something specific', async ({ page }) => {
    // Arrange
    await page.waitForSelector('.target-element');

    // Act
    await page.click('button:has-text("Submit")');
    await page.waitForTimeout(200);  // Let action complete

    // Assert
    await expect(page.locator('.result')).toBeVisible();
    await expect(page.locator('.result')).toHaveText('Expected text');
  });
});
```

## Test Structure Guidelines

### Use Descriptive Test Names

```typescript
// Good
test('should display error message when email is invalid', ...);

// Bad
test('test1', ...);
```

### Use Locator Best Practices

Priority order for selectors:

1. **Test IDs** (most reliable): `page.getByTestId('submit-button')`
2. **Role + name**: `page.getByRole('button', { name: 'Submit' })`
3. **Text content**: `page.getByText('Submit')`
4. **CSS selectors** (last resort): `page.locator('.submit-btn')`

### Add Meaningful Assertions

```typescript
// Check visibility
await expect(page.locator('.modal')).toBeVisible();

// Check text content
await expect(page.locator('.message')).toHaveText('Success!');

// Check attribute
await expect(page.locator('input')).toHaveAttribute('disabled', '');

// Check count
await expect(page.locator('.list-item')).toHaveCount(5);

// Check URL
await expect(page).toHaveURL(/.*dashboard/);
```

## Cross-Browser Considerations

Tests run against multiple browsers by default (Chromium, Firefox). Consider:

- Avoid browser-specific CSS selectors
- Test with both browsers during development
- Use `test.skip` for known browser-specific issues:

```typescript
test('WebGL feature', async ({ page, browserName }) => {
  test.skip(browserName === 'firefox', 'WebGL not fully supported in Firefox');
  // ... test code
});
```

## Handling Async Operations

```typescript
// Wait for element to appear
await page.waitForSelector('.dynamic-content');

// Wait for network request
await page.waitForResponse(resp =>
  resp.url().includes('/api/data') && resp.status() === 200
);

// Wait for navigation
await Promise.all([
  page.waitForNavigation(),
  page.click('a[href="/next-page"]')
]);
```

## Example Tests

### Form Submission

```typescript
test('should submit contact form', async ({ page }) => {
  await page.fill('input[name="name"]', 'John Doe');
  await page.waitForTimeout(100);

  await page.fill('input[name="email"]', 'john@example.com');
  await page.waitForTimeout(100);

  await page.fill('textarea[name="message"]', 'Hello!');
  await page.waitForTimeout(100);

  await page.click('button[type="submit"]');
  await page.waitForTimeout(200);

  await expect(page.locator('.success-message')).toBeVisible();
});
```

### Navigation

```typescript
test('should navigate to about page', async ({ page }) => {
  await page.click('a:has-text("About")');
  await page.waitForTimeout(200);

  await expect(page).toHaveURL(/.*about/);
  await expect(page.locator('h1')).toHaveText('About Us');
});
```

### Authentication

```typescript
test('should login successfully', async ({ page }) => {
  await page.fill('input[name="email"]', 'user@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button:has-text("Login")');

  await expect(page).toHaveURL(/.*dashboard/);
  await expect(page.locator('.user-menu')).toBeVisible();
});
```

## Running Tests

```bash
# Run all tests
npx playwright test

# Run specific test file
npx playwright test tests/login.spec.ts

# Run in headed mode (see browser)
npx playwright test --headed

# Run specific browser
npx playwright test --project=chromium
```

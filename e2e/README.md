# E2E Testing Guide

Cashlines uses **Playwright** for end-to-end (E2E) testing. This allows us to validate that the UI works correctly across browsers and devices automatically.

## Quick Start

### Install Playwright
```bash
npm install
npx playwright install  # Installs browser binaries (chromium, firefox, webkit)
```

### Run Tests

```bash
# Run all E2E tests (headless mode)
npm run test:e2e

# Run tests with UI - visual test runner (recommended for development)
npm run test:e2e:ui

# Run tests in debug mode - step through with DevTools
npm run test:e2e:debug

# Run all tests (Jest unit tests + Playwright E2E tests)
npm run test:all
```

## What's Being Tested

### Dashboard Tests (`e2e/dashboard.spec.ts`)
- ✅ Dashboard loads and displays title
- ✅ Summary cards render correctly
- ✅ Navigation menu is visible and functional
- ✅ Logo and branding elements are present
- ✅ Theme toggle button is accessible

### Navigation Tests
- ✅ Can navigate to Income page
- ✅ Can navigate to Transactions page
- ✅ Can navigate to Accounts page
- ✅ URL updates correctly after navigation
- ✅ Page titles update appropriately

### Responsive Design Tests
- ✅ Mobile hamburger menu appears on small screens (375px)
- ✅ Menu can be opened and closed
- ✅ Desktop dropdown menus appear on larger screens (1920px)
- ✅ Hover interactions work on desktop

### Dark Mode Tests
- ✅ Theme toggle button is present and clickable
- ✅ Theme switching doesn't cause errors
- ✅ Theme preference can be changed

## Test Structure

```
e2e/
├── dashboard.spec.ts          # Dashboard and navigation tests
└── (future test files)
```

Each test file follows this pattern:
```typescript
import { test, expect } from '@playwright/test'

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await page.goto('/')
  })

  test('should do something', async ({ page }) => {
    // Test logic
    await expect(page.locator('h1')).toContainText('Title')
  })
})
```

## CI/CD Integration

These tests automatically run in GitHub Actions on:
- Pull requests to `development` branch
- Commits to `main` branch
- Manual workflow dispatch

See `.github/workflows/` for CI configuration.

## Configuration

**Playwright Config** (`playwright.config.ts`):
- Base URL: `http://localhost:3000`
- Browsers: Chromium, Firefox, WebKit
- Auto-starts dev server before tests
- Reports: HTML report saved to `playwright-report/`
- Retries: 2 on CI, 0 locally

## Development Workflow

### Writing a New Test

1. **Use the UI test runner** to develop interactively:
   ```bash
   npm run test:e2e:ui
   ```

2. **Click the "Pick locator" button** to find elements easily
   ```
   - Click elements in the app
   - Get Playwright selectors automatically
   - Inspect their CSS and accessibility properties
   ```

3. **Write assertions**:
   ```typescript
   await expect(page.locator('h1')).toContainText('Income')
   await expect(page).toHaveURL('**/income')
   ```

4. **Run in debug mode** to step through:
   ```bash
   npm run test:e2e:debug
   ```

### Common Patterns

**Navigate to page:**
```typescript
await page.goto('/income')
await page.waitForLoadState('networkidle')
```

**Click a button:**
```typescript
await page.locator('button:has-text("New Income")').click()
```

**Fill a form:**
```typescript
await page.fill('input[name="amount"]', '1000')
```

**Check visibility:**
```typescript
await expect(page.locator('h1')).toBeVisible()
```

**Wait for element:**
```typescript
await page.locator('button:has-text("Save")').waitFor({ state: 'visible' })
```

## Debugging

### See what's happening
```bash
npm run test:e2e:ui
```
Opens interactive test UI where you can:
- See each test step
- Rerun specific tests
- Inspect page state
- Watch videos of failures

### Debug in DevTools
```bash
npm run test:e2e:debug
```
Opens a browser with DevTools where you can:
- Set breakpoints
- Inspect DOM
- Run console commands
- Step through code

### Check test reports
```bash
npx playwright show-report
```
Shows HTML report with:
- Test results
- Screenshots
- Videos (of failed tests)
- Detailed error messages

## Best Practices

1. **Use semantic selectors** - prefer role, label, text over nth-child
   ```typescript
   // ✅ Good
   page.locator('button:has-text("Save")')
   page.locator('input[placeholder="Email"]')
   
   // ❌ Avoid
   page.locator('div > div > button')
   page.locator('button:nth-child(3)')
   ```

2. **Wait for network** - don't rely on fixed waits
   ```typescript
   // ✅ Good
   await page.waitForLoadState('networkidle')
   
   // ❌ Avoid
   await page.waitForTimeout(1000)
   ```

3. **Use fixtures** - for common setup
   ```typescript
   test.beforeEach(async ({ page }) => {
     await page.goto('/')
   })
   ```

4. **Test user behavior** - not implementation details
   ```typescript
   // ✅ Good - test what user sees
   await expect(page.locator('h1')).toContainText('Income')
   
   // ❌ Avoid - testing internals
   expect(component.state.isLoaded).toBe(true)
   ```

5. **Keep tests independent** - each test should work alone
   ```typescript
   // ✅ Good - each test navigates and sets up
   test('test 1', async ({ page }) => {
     await page.goto('/income')
     // ...
   })
   
   test('test 2', async ({ page }) => {
     await page.goto('/transactions')
     // ...
   })
   ```

## Continuous Integration

Tests run automatically on:
- **Every PR** - must pass to merge
- **Every commit to main** - verify production readiness
- **Weekly schedule** - regression detection

View results in GitHub:
1. Go to your PR
2. Scroll to "Checks" section
3. Click "Playwright" → "Summary"
4. View detailed results and artifacts

## Troubleshooting

### Tests hang or timeout
```bash
# Increase timeout in playwright.config.ts
timeout: 30 * 1000  // 30 seconds
```

### Tests fail locally but pass in CI
- Check browser versions match
- Ensure dev server is running
- Check for flaky waits (use `networkidle` not fixed timeouts)

### Can't find element
```bash
# Use debug mode to see the page
npm run test:e2e:debug

# Then interact with the browser to find the element
```

### Screenshot/Video artifacts
Check `test-results/` directory for:
- Screenshots of failures
- Videos of failing tests
- Detailed error logs

## Next Steps

### Add More Tests
Create `e2e/income.spec.ts`:
```typescript
import { test, expect } from '@playwright/test'

test.describe('Income Page', () => {
  test('should create new income entry', async ({ page }) => {
    await page.goto('/income')
    await page.locator('button:has-text("New Income")').click()
    // ... fill form and submit
  })
})
```

### Data Setup
For tests that need specific data:
```typescript
// In a fixture file
export async function setupTestData(page: Page) {
  // Use API to create test data
  await page.request.post('/api/income', {
    data: { ... }
  })
}
```

### Screenshots/Videos
Capture visuals for regression testing:
```typescript
await page.screenshot({ path: 'screenshot.png' })
```

## Resources

- [Playwright Docs](https://playwright.dev/docs/intro)
- [Test Runners](https://playwright.dev/docs/running-tests)
- [Selectors](https://playwright.dev/docs/locators)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [CI/CD](https://playwright.dev/docs/ci)

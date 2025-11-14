# Playwright MCP Quick Reference for Cashlines

## Setup

```bash
# Install playwright if not already
npm install @playwright/test --save-dev
npx playwright install

# Run tests
npm run test:e2e          # Headless
npm run test:e2e:ui       # Interactive UI
npm run test:e2e:debug    # With debugger
```

## Essential Patterns

### Navigation & Waits
```typescript
await page.goto('/income')                      // Navigate
await page.waitForLoadState('networkidle')     // Wait for network
await page.locator('text=Success').waitFor()   // Wait for element
```

### Finding Elements
```typescript
// Preferred: semantic selectors
await page.click('button:has-text("Submit")')
await page.fill('input[placeholder="Amount"]', '1000')
await page.selectOption('select[name="type"]', 'salary')

// Good: data attributes
await page.click('[data-test="submit-btn"]')

// Avoid: nth-child, class-based
// ❌ page.click('div > div > button:nth-child(3)')
```

### Assertions
```typescript
await expect(page).toHaveURL('**/income')
await expect(page.locator('h1')).toContainText('Income')
await expect(page.locator('[role="alert"]')).toBeVisible()
await expect(page.locator('input')).toHaveValue('1000.00')
```

### Screenshots & Visuals
```typescript
// Full page screenshot
await expect(page.locator('main')).toHaveScreenshot('dashboard.png')

// Element screenshot
await expect(page.locator('[data-test="chart"]')).toHaveScreenshot('chart.png', {
  maxDiffPixels: 100
})

// Mask dynamic elements
await expect(page).toHaveScreenshot('page.png', {
  mask: [page.locator('[data-test="date"]')]
})
```

### Financial Data Testing
```typescript
// Verify calculation
const balance = await page.locator('[data-test="balance"]').textContent()
expect(balance).toContain('$5,000.00')

// Test form with decimals
await page.fill('input[name="amount"]', '1234.56')
await page.click('button:has-text("Save")')
await expect(page.locator('text=1,234.56')).toBeVisible()

// Verify routing
await page.goto('/accounts')
const savingsBalance = await page.locator('[data-account="savings"] [data-balance]').textContent()
expect(savingsBalance).toContain('500.00')
```

## Cashlines Test Templates

### Dashboard Test
```typescript
test('Dashboard displays financial summary', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  
  // Verify key elements
  await expect(page.locator('h1')).toContainText('Dashboard')
  await expect(page.locator('[data-test="total-income"]')).toBeVisible()
  await expect(page.locator('[data-test="total-expenses"]')).toBeVisible()
  await expect(page.locator('[data-test="balance"]')).toBeVisible()
})
```

### Income Entry Test
```typescript
test('Should add income entry', async ({ page }) => {
  await page.goto('/income')
  
  const amount = '5000'
  const type = 'salary'
  
  await page.fill('input[name="amount"]', amount)
  await page.selectOption('select[name="type"]', type)
  await page.fill('textarea[name="description"]', 'Monthly salary')
  
  await page.click('button:has-text("Save Income")')
  
  await expect(page).toHaveURL('**/income')
  await expect(page.locator('text=Saved successfully')).toBeVisible()
})
```

### Account Navigation Test
```typescript
test('Should navigate to accounts', async ({ page }) => {
  await page.goto('/')
  
  // Find and click accounts link
  const link = page.locator('a[href="/accounts"], button:has-text("Accounts")')
  
  if (await link.isVisible()) {
    await link.click()
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveURL('**/accounts')
  }
})
```

### Error Handling Test
```typescript
test('Should handle network errors', async ({ page }) => {
  // Mock API error
  await page.route('**/api/**', route => route.abort('failed'))
  
  await page.goto('/accounts')
  
  // Should show error, not crash
  await expect(page.locator('[role="alert"]')).toContainText('Failed to load')
})
```

### Performance Test
```typescript
test('Dashboard loads quickly', async ({ page }) => {
  const start = Date.now()
  await page.goto('/')
  const duration = Date.now() - start
  
  expect(duration).toBeLessThan(3000) // 3 seconds
})
```

### Dark Mode Test
```typescript
test('Theme toggle persists', async ({ page }) => {
  await page.goto('/')
  
  // Toggle theme
  await page.click('button[aria-label*="theme" i]')
  await page.waitForTimeout(300)
  
  // Check dark class
  const isDark = await page.locator('html').evaluate(el => 
    el.classList.contains('dark')
  )
  
  expect(isDark).toBe(true)
})
```

### Mobile Responsive Test
```typescript
test('Mobile menu works', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 })
  await page.goto('/')
  
  const nav = page.locator('nav')
  await expect(nav).not.toBeVisible() // Hidden by default
  
  // Open menu
  await page.click('[aria-label="Toggle menu"]')
  await expect(nav).toBeVisible()
})
```

## Debugging Tips

### Pause & Inspect
```typescript
test('Debug test', async ({ page }) => {
  await page.goto('/')
  
  // Pause execution - use DevTools
  await page.pause()
})
```

### Print Debug Info
```typescript
const title = await page.locator('h1').textContent()
console.log('Page title:', title)

const url = page.url()
console.log('Current URL:', url)

const count = await page.locator('button').count()
console.log('Button count:', count)
```

### Check Page Content
```typescript
const allText = await page.textContent('body')
console.log('Page text:', allText)

const html = await page.innerHTML('main')
console.log('Main HTML:', html)

const attrs = await page.locator('[data-test]').getAttribute('data-test')
console.log('Data attribute:', attrs)
```

## Configuration

### playwright.config.ts
```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  timeout: 30 * 1000,
  expect: { timeout: 5 * 1000 },
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

## Common Errors

| Error | Cause | Fix |
|---|---|---|
| `Timeout waiting for locator` | Element doesn't exist | Check selector is correct |
| `Navigation failed` | Server down | Ensure dev server running |
| `Screenshot mismatch` | Visual change | Update baseline or adjust threshold |
| `Port already in use` | Dev server running | Kill process or use different port |
| `Element not clickable` | Hidden/obscured | Wait for visibility, scroll into view |

## Useful Links

- **Docs**: https://playwright.dev
- **Selectors**: https://playwright.dev/docs/locators
- **Assertions**: https://playwright.dev/docs/test-assertions
- **Best Practices**: https://playwright.dev/docs/best-practices
- **CI/CD**: https://playwright.dev/docs/ci-intro
- **Debugging**: https://playwright.dev/docs/debug

## Key Files

- `playwright.config.ts` - Main configuration
- `e2e/*.spec.ts` - Test files
- `playwright-report/` - HTML report (after running tests)
- `.github/workflows/playwright.yml` - CI configuration

## Running Tests

```bash
# All tests
npx playwright test

# Specific file
npx playwright test dashboard.spec.ts

# Specific test
npx playwright test -g "should display dashboard"

# Watch mode
npx playwright test --watch

# UI mode
npx playwright test --ui

# With trace
npx playwright test --trace on

# Report
npx playwright show-report
```

## Performance Optimization

### Skip Slow Tests in Development
```typescript
test.skip(process.env.CI, 'Too slow for CI')
test('Slow visual regression', async ({ page }) => {
  // ...
})
```

### Run Tests in Parallel
```typescript
test.describe.parallel('Fast tests', () => {
  test('Test 1', async ({ page }) => {})
  test('Test 2', async ({ page }) => {})
  test('Test 3', async ({ page }) => {})
})
```

### Reuse Authentication
```typescript
// store auth state
test('Store auth', async ({ page }) => {
  await page.goto('/')
  // ... login steps ...
  await page.context().storageState({ path: 'auth.json' })
})

// use stored auth in other tests
test.use({
  storageState: 'auth.json'
})
```

## Next Steps

1. **Setup**: Copy playwright.config.ts to project
2. **Migrate**: Convert existing tests to Playwright format
3. **Add**: Visual regression baseline images
4. **CI/CD**: Configure GitHub Actions workflow
5. **Expand**: Add more test scenarios
6. **Monitor**: Set up performance dashboards
7. **AI**: Enable Playwright MCP for Claude integration

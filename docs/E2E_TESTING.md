# E2E Testing Guide

Complete guide to Playwright E2E testing in Cashlines.

## Overview

Cashlines uses **Playwright** for end-to-end testing. E2E tests validate that the UI works correctly in real browsers, catching issues that unit tests might miss.

**What's tested:**
- Dashboard loads and displays correctly
- Navigation between pages works
- Responsive design (mobile menu vs. desktop dropdowns)
- Dark mode toggle functionality
- User workflows (forms, buttons, interactions)

## Quick Start

### Installation

```bash
# Install npm dependencies (includes @playwright/test)
npm install

# Install browser binaries
npx playwright install
```

### Running Tests

```bash
# All E2E tests in headless mode (CI/CD friendly)
npm run test:e2e

# Interactive test runner - see tests run in real-time (recommended for development)
npm run test:e2e:ui

# Debug mode - step through with DevTools
npm run test:e2e:debug

# Run all tests (unit + E2E)
npm run test:all
```

## Current Test Coverage

**File**: `e2e/dashboard.spec.ts`

### Dashboard Tests (5 tests)
- ✅ Display dashboard title
- ✅ Display summary cards (4 card elements)
- ✅ Navigation menu presence (category buttons on desktop)
- ✅ Header with logo and branding
- ✅ Theme toggle button

### Navigation Tests (3 tests)
- ✅ Navigate to Income page and verify URL
- ✅ Navigate to Transactions page and verify URL
- ✅ Navigate to Accounts page and verify URL

### Responsive Design Tests (2 tests)
- ✅ Mobile: Hamburger menu appears and works (375x667 viewport)
- ✅ Desktop: Dropdown menus appear on hover (1920x1080 viewport)

### Dark Mode Tests (1 test)
- ✅ Theme toggle button changes theme

**Total: 11 E2E tests across 5 describe blocks**

## How E2E Tests Work

### Test Structure

```typescript
import { test, expect } from '@playwright/test'

test.describe('Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Setup runs before each test
    await page.goto('/')
  })

  test('should do something', async ({ page }) => {
    // Arrange - set up state
    // Act - perform user action
    await page.locator('button:has-text("Submit")').click()
    // Assert - verify result
    await expect(page).toHaveURL('/success')
  })
})
```

### Key Concepts

**Navigation:**
```typescript
await page.goto('/income')              // Go to URL
await page.waitForLoadState('networkidle')  // Wait for network calls
```

**Finding Elements:**
```typescript
// By text (semantic, preferred)
page.locator('button:has-text("Save")')
page.locator('input[placeholder="Email"]')

// By role (accessibility-focused)
page.locator('role=button[name="Save"]')

// By selector (last resort)
page.locator('.btn-primary')
```

**Interactions:**
```typescript
await page.locator('button').click()
await page.fill('input', 'text')
await page.selectOption('select', 'value')
await page.press('input', 'Enter')
```

**Assertions:**
```typescript
await expect(page.locator('h1')).toContainText('Title')
await expect(page).toHaveURL('/page')
await expect(element).toBeVisible()
await expect(element).toHaveClass('active')
```

## Configuration

**File**: `playwright.config.ts`

Key settings:
- **Test directory**: `./e2e/` - finds all `*.spec.ts` files
- **Base URL**: `http://localhost:3000` - dev server address
- **Browsers**: Chromium, Firefox, WebKit (all three run by default)
- **Dev server**: Auto-starts before tests with `npm run dev`
- **HTML reporter**: Results saved to `playwright-report/`
- **Retries**: 0 locally (see failures immediately), 2 on CI
- **Parallel**: Enabled by default (faster execution)
- **Timeout**: 30 seconds per test
- **Expect timeout**: 5 seconds for assertions

## Development Workflow

### Writing a New Test

#### Step 1: Use the UI Test Runner
```bash
npm run test:e2e:ui
```

This opens an interactive test runner where you can:
- See test results in real-time
- Click "Pick locator" button to find elements
- Inspect the DOM
- Re-run individual tests

#### Step 2: Create Test File
Create `e2e/feature.spec.ts`:
```typescript
import { test, expect } from '@playwright/test'

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should do something', async ({ page }) => {
    // Find element
    const button = page.locator('button:has-text("Click Me")')
    
    // Verify it exists
    await expect(button).toBeVisible()
    
    // Click it
    await button.click()
    
    // Check result
    await expect(page.locator('h1')).toContainText('Success')
  })
})
```

#### Step 3: Debug if Needed
```bash
npm run test:e2e:debug
```

Opens browser with DevTools where you can:
- Set breakpoints
- Inspect DOM live
- Run JavaScript console commands
- Watch page state change as tests run

#### Step 4: Run Full Suite
```bash
npm run test:e2e
```

Verifies test passes in all browsers (Chromium, Firefox, WebKit).

### Common Patterns

#### Test a Form Submission
```typescript
test('should submit form', async ({ page }) => {
  await page.goto('/income')
  
  // Fill form
  await page.fill('input[name="amount"]', '1000')
  await page.selectOption('select[name="type"]', 'salary')
  
  // Submit
  await page.click('button:has-text("Save")')
  
  // Verify
  await page.waitForURL('**/income')
  await expect(page.locator('text=Saved successfully')).toBeVisible()
})
```

#### Test Responsive Menu
```typescript
test('should show mobile menu on small screens', async ({ page }) => {
  // Set mobile viewport
  await page.setViewportSize({ width: 375, height: 667 })
  await page.goto('/')
  
  // Menu button should be visible
  const menuButton = page.locator('button[aria-label="Toggle menu"]')
  await expect(menuButton).toBeVisible()
  
  // Click to open
  await menuButton.click()
  
  // Menu items should appear
  const menu = page.locator('nav')
  await expect(menu).toBeVisible()
})
```

#### Test Dark Mode
```typescript
test('should toggle dark mode', async ({ page }) => {
  await page.goto('/')
  
  // Get initial theme
  const html = page.locator('html')
  
  // Find theme toggle (various selectors to try)
  const toggle = page.locator(
    'button[aria-label="Toggle theme"], button:has-text("Light"), button:has-text("Dark")'
  ).first()
  
  // Click toggle
  await toggle.click()
  
  // Verify class changed
  await expect(html).toHaveClass(/dark/)
})
```

#### Test Navigation
```typescript
test('should navigate to page', async ({ page }) => {
  await page.goto('/')
  
  // Try different selector strategies
  const link = page.locator(
    'a:has-text("Income"), button:has-text("Income")'
  ).first()
  
  await link.click()
  
  // Wait for navigation
  await page.waitForURL('**/income')
  
  // Verify page loaded
  await expect(page.locator('h1')).toContainText('Income')
})
```

## Debugging Failed Tests

### View Test Report
```bash
npx playwright show-report
```

Shows HTML report with:
- ✅/❌ status for each test
- Screenshots of failures
- Videos of test execution (failures only by default)
- Detailed error messages
- Browser and OS info

### Check Screenshots/Videos
Artifacts stored in:
- `test-results/` - screenshots, videos, logs
- `playwright-report/` - HTML report

### Common Issues

**Test times out (> 30 seconds)**
```typescript
// Solution 1: Increase timeout
test('slow test', async ({ page }) => {
  // ...
}, { timeout: 60 * 1000 }) // 60 seconds

// Solution 2: Wait for specific element instead of timeout
await page.locator('text=Loaded').waitFor({ timeout: 10000 })
```

**Can't find element**
```bash
# Use debug mode to inspect page
npm run test:e2e:debug

# Then use "Pick locator" in UI test runner
npm run test:e2e:ui
```

**Test passes locally but fails in CI**
- Check browser versions (CI may use different versions)
- Check system dependencies (fonts, fonts, headless compatibility)
- Add explicit waits for network/DOM (don't rely on `waitForTimeout`)

**Flaky tests (sometimes pass, sometimes fail)**
```typescript
// ❌ Wrong - might be too fast or slow
await page.waitForTimeout(500)

// ✅ Right - wait for specific condition
await page.waitForLoadState('networkidle')
await page.locator('text=Loaded').waitFor()
```

## CI/CD Integration

Tests run automatically in GitHub Actions:

1. **On every PR** to `development` branch
2. **On every commit** to `main` branch
3. **Weekly schedule** for regression detection

View results:
1. Go to PR or commit
2. Click "Checks" tab
3. Find "Playwright" job
4. View detailed results and artifacts

## Best Practices

### ✅ Do This

```typescript
// Use semantic selectors
page.locator('button:has-text("Save")')
page.locator('input[placeholder="Email"]')

// Wait for specific conditions
await page.waitForLoadState('networkidle')
await page.locator('text=Success').waitFor()

// Test user behavior, not implementation
await expect(page).toHaveURL('/income')

// Make tests independent
test('test 1', async ({ page }) => {
  await page.goto('/income')
  // ...
})

test('test 2', async ({ page }) => {
  await page.goto('/transactions')
  // ...
})

// Use fixtures for setup
test.beforeEach(async ({ page }) => {
  await page.goto('/')
})
```

### ❌ Don't Do This

```typescript
// Avoid nth-child selectors (brittle)
page.locator('div > div > button:nth-child(3)')

// Avoid fixed timeouts (flaky)
await page.waitForTimeout(1000)

// Avoid testing implementation details
expect(component.state.isLoaded).toBe(true)

// Avoid interdependent tests
test('test 1', async ({ page }) => {
  // Relies on test 2 running first
  await page.goto('/income')
})

// Avoid hardcoding data (use APIs)
await page.fill('input', 'hardcoded-value')
```

## Expanding Test Coverage

### Add Tests for Forms
Create `e2e/forms.spec.ts`:
```typescript
test.describe('Forms', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/income')
  })

  test('should submit income form', async ({ page }) => {
    // Test income entry
  })

  test('should submit transaction form', async ({ page }) => {
    // Test transaction entry
  })
})
```

### Add Tests for Data Management
Create `e2e/data-management.spec.ts`:
```typescript
test.describe('Data Management', () => {
  test('should reset data', async ({ page }) => {
    // Test reset functionality
  })

  test('should seed demo data', async ({ page }) => {
    // Test seed functionality
  })
})
```

### Add Tests for Accounts
Create `e2e/accounts.spec.ts`:
```typescript
test.describe('Accounts', () => {
  test('should create account', async ({ page }) => {
    // Test account creation
  })

  test('should delete account', async ({ page }) => {
    // Test account deletion
  })
})
```

## Troubleshooting

### Playwright Not Found
```bash
npm install @playwright/test --save-dev
npx playwright install
```

### Browsers Not Installed
```bash
npx playwright install
```

### Test Hangs
Check that:
- Dev server is running (`npm run dev`)
- Port 3000 is accessible
- No authentication required
- Network is stable

### Tests Pass Locally but Fail in CI
- Update Chrome/Firefox/WebKit versions in CI
- Check system has required dependencies
- Use `waitForLoadState('networkidle')` instead of fixed timeouts
- Ensure test data setup is reproducible

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Test Configuration](https://playwright.dev/docs/test-configuration)
- [Locators](https://playwright.dev/docs/locators)
- [Assertions](https://playwright.dev/docs/test-assertions)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging](https://playwright.dev/docs/debug)

## Summary

✅ **11 E2E tests** validating core UI functionality  
✅ **All browsers** (Chromium, Firefox, WebKit)  
✅ **Responsive testing** (mobile, tablet, desktop)  
✅ **Dark mode testing** included  
✅ **Easy to debug** with UI runner and debug mode  
✅ **CI/CD ready** - runs in GitHub Actions  

Next steps:
1. Run `npm run test:e2e` to verify setup
2. Write tests for critical user workflows
3. Add to CI/CD pipeline
4. Integrate with performance monitoring

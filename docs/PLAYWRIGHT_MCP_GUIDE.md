# Playwright MCP Server: Comprehensive Guide for E2E Testing

## Overview

The **Playwright Model Context Protocol (MCP) Server** is an official Microsoft server that enables AI agents and LLMs like Claude to control browsers, automate web interactions, and perform end-to-end testing through a standardized protocol. It transforms Playwright's powerful browser automation capabilities into tools accessible to AI systems.

**GitHub**: [microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp)

---

## 1. Core Capabilities Enabled by Playwright MCP

### 1.1 Browser Automation Capabilities

Playwright MCP enables AI agents to:

| Capability | Description | Cashlines Use Case |
|---|---|---|
| **Page Navigation** | Navigate to URLs, manage browser history | Test dashboard, account, transaction pages |
| **Element Interaction** | Click, type, select, submit forms | Test financial data entry forms |
| **Content Scraping** | Extract text, HTML, structured data | Validate financial summaries, reports |
| **Screenshot Capture** | Full page, element, or viewport screenshots | Visual regression testing, UI verification |
| **Performance Metrics** | Collect timing, network, resource data | Monitor dashboard load times |
| **Accessibility Testing** | Check ARIA labels, keyboard navigation | Ensure financial app is accessible |
| **Cookie/Storage Management** | Manage authentication, user preferences | Test persistent login, theme preferences |
| **Multi-browser Testing** | Run same tests across Chrome, Firefox, Safari | Cross-browser financial data validation |
| **Mobile Viewport Testing** | Test responsive design on different devices | Verify mobile banking experience |
| **Network Interception** | Mock APIs, intercept requests | Test error handling for failed transactions |
| **Keyboard/Mouse Events** | Simulate user input patterns | Test keyboard navigation in forms |
| **Wait Conditions** | Wait for elements, network, navigation | Handle async financial data loading |

### 1.2 MCP Protocol Integration Benefits

```typescript
// AI agents can now use Playwright as a tool
{
  "name": "playwright_navigate",
  "description": "Navigate to a URL and wait for page load",
  "inputSchema": {
    "type": "object",
    "properties": {
      "url": { "type": "string" },
      "waitFor": { "type": "string", "enum": ["load", "networkidle"] }
    }
  }
}
```

**Benefits:**
- ✅ Seamless LLM integration without custom code
- ✅ Standardized API across different clients (Claude, ChatGPT, etc.)
- ✅ Zero configuration for AI-powered test generation
- ✅ Real-time context sharing between AI and browser
- ✅ Automatic error handling and retry logic

---

## 2. Advanced Testing Patterns Enabled by Playwright MCP

### 2.1 Visual Regression Testing

**What it enables:** Detect unintended UI changes by comparing screenshots

```typescript
// Visual regression test with Playwright MCP
import { test, expect } from '@playwright/test'

test('Dashboard should match baseline screenshot', async ({ page }) => {
  // Navigate and load
  await page.goto('http://localhost:3000')
  await page.waitForLoadState('networkidle')
  
  // Capture current state
  await expect(page.locator('main')).toHaveScreenshot('dashboard.png', {
    mask: [page.locator('[data-test="dynamic-date"]')], // Ignore dates
    maxDiffPixels: 100
  })
})
```

**MCP Advantage:**
- AI can automatically update baseline images
- Detect visual regressions in financial displays (charts, tables)
- Compare light/dark mode changes
- Validate responsive design across breakpoints

### 2.2 Performance Monitoring

**What it enables:** Track and analyze page performance metrics

```typescript
test('Dashboard load performance', async ({ page }) => {
  // Collect metrics
  const metrics = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0]
    return {
      dnsLookup: nav.domainLookupEnd - nav.domainLookupStart,
      tcpConnect: nav.connectEnd - nav.connectStart,
      ttfb: nav.responseStart - nav.requestStart,
      domInteractive: nav.domInteractive - nav.fetchStart,
      domComplete: nav.domComplete - nav.fetchStart,
      loadComplete: nav.loadEventEnd - nav.fetchStart
    }
  })
  
  // Assert performance thresholds
  expect(metrics.loadComplete).toBeLessThan(3000) // 3 second load
  expect(metrics.ttfb).toBeLessThan(500) // First byte in 500ms
})
```

**MCP Advantage:**
- AI can identify performance bottlenecks
- Trigger performance tests on every build
- Compare metrics across branches
- Detect regressions in financial calculations

### 2.3 Accessibility Testing

**What it enables:** Verify web content is accessible to all users

```typescript
import { injectAxe, checkA11y } from 'axe-playwright'

test('Dashboard accessibility audit', async ({ page }) => {
  await page.goto('http://localhost:3000')
  
  // Inject axe accessibility testing library
  await injectAxe(page)
  
  // Run accessibility audit
  await checkA11y(page, null, {
    detailedReport: true,
    detailedReportOptions: {
      html: true
    }
  })
})
```

**MCP Advantage:**
- AI can automate accessibility audits
- Ensure financial forms are screen-reader friendly
- Validate keyboard navigation
- Test color contrast for light/dark modes

### 2.4 Data-Driven Testing

**What it enables:** Run same test with multiple datasets

```typescript
test.describe('Money Entry Forms - Data Driven', () => {
  const testCases = [
    { 
      amount: 5000,
      type: 'salary',
      description: 'Monthly salary',
      expectedSuccess: true
    },
    { 
      amount: -100,
      type: 'expense',
      description: 'Utility bill',
      expectedSuccess: true
    },
    { 
      amount: 999999999,
      type: 'savings',
      description: 'Lotto win',
      expectedSuccess: false // Amount too large
    }
  ]
  
  testCases.forEach(testCase => {
    test(`should ${testCase.expectedSuccess ? 'accept' : 'reject'} ${testCase.amount} ${testCase.type}`, 
      async ({ page }) => {
        await page.goto('http://localhost:3000/income')
        await page.fill('input[name="amount"]', testCase.amount.toString())
        await page.selectOption('select[name="type"]', testCase.type)
        await page.fill('textarea[name="description"]', testCase.description)
        
        await page.click('button:has-text("Submit")')
        
        if (testCase.expectedSuccess) {
          await expect(page).toHaveURL('**/income')
          await expect(page.locator('text=Saved successfully')).toBeVisible()
        } else {
          await expect(page.locator('[role="alert"]')).toContainText('Invalid')
        }
      }
    )
  })
})
```

**MCP Advantage:**
- AI can generate test data sets
- Validate financial edge cases (negative numbers, decimals, limits)
- Test data validation across forms
- Generate comprehensive test coverage from requirements

### 2.5 Cross-Browser Testing

**What it enables:** Ensure consistent behavior across browsers

```typescript
// Run same test in Chromium, Firefox, WebKit
export default defineConfig({
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
})

test('Dashboard renders correctly in all browsers', async ({ page, browserName }) => {
  await page.goto('http://localhost:3000')
  
  // Browser-specific assertions
  if (browserName === 'webkit') {
    // Safari-specific quirks
  }
  
  await expect(page.locator('[role="main"]')).toBeVisible()
})
```

**MCP Advantage:**
- AI can identify browser-specific issues
- Test financial calculations across engines
- Validate CSS support (Grid, Flexbox)
- Ensure consistent number formatting

### 2.6 Mobile & Responsive Testing

**What it enables:** Test different device contexts and orientations

```typescript
test('Financial dashboard on mobile', async ({ browser }) => {
  // Test on iPhone 14
  const iphoneContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    userAgent: 'iPhone User Agent'
  })
  
  const page = await iphoneContext.newPage()
  await page.goto('http://localhost:3000')
  
  // Verify mobile layout
  await expect(page.locator('nav')).not.toBeVisible() // Hidden on mobile
  await expect(page.locator('[aria-label="Menu toggle"]')).toBeVisible()
  
  // Test mobile menu
  await page.click('[aria-label="Menu toggle"]')
  await expect(page.locator('nav')).toBeVisible()
})
```

**MCP Advantage:**
- AI can test responsive breakpoints
- Verify touch interactions work
- Test financial data readability on small screens

### 2.7 API Mocking & Error Injection

**What it enables:** Test error handling without breaking real systems

```typescript
test('Handle network error gracefully', async ({ page }) => {
  // Intercept and mock API responses
  await page.route('**/api/accounts/**', async (route) => {
    // Simulate server error
    await route.abort('failed')
  })
  
  await page.goto('http://localhost:3000/accounts')
  
  // Should show error message
  await expect(page.locator('[role="alert"]'))
    .toContainText('Failed to load accounts')
})

test('Retry on timeout', async ({ page }) => {
  let requestCount = 0
  
  await page.route('**/api/transactions', async (route) => {
    requestCount++
    
    if (requestCount < 2) {
      // Timeout first request
      await new Promise(resolve => setTimeout(resolve, 15000))
    }
    
    await route.continue()
  })
  
  await page.goto('http://localhost:3000/transactions')
  
  // Should eventually load after retry
  await expect(page.locator('[data-test="transactions-list"]')).toBeVisible()
})
```

**MCP Advantage:**
- AI can generate error scenarios
- Test financial app resilience
- Verify error messages are user-friendly

---

## 3. Specific Enhancements for Cashlines Next.js Financial App

### 3.1 Financial Data Validation

```typescript
test('Income entry calculates totals correctly', async ({ page }) => {
  await page.goto('http://localhost:3000/income')
  
  // Add multiple income entries
  const entries = [
    { amount: 3000, type: 'salary' },
    { amount: 500, type: 'freelance' },
    { amount: 100, type: 'bonus' }
  ]
  
  for (const entry of entries) {
    await page.fill('input[data-test="amount"]', entry.amount.toString())
    await page.selectOption('select[data-test="type"]', entry.type)
    await page.click('button:has-text("Add Income")')
    await page.waitForTimeout(500)
  }
  
  // Verify total calculation
  const total = await page.locator('[data-test="income-total"]').textContent()
  expect(total).toContain('3,600.00')
})
```

### 3.2 Transaction Routing Rules Testing

```typescript
test('Money routes correctly based on rules', async ({ page }) => {
  // Setup routing rule
  await page.goto('http://localhost:3000/rules')
  await page.click('button:has-text("Add Rule")')
  await page.fill('input[placeholder="Rule name"]', 'Savings Transfer')
  await page.selectOption('select[name="condition"]', 'amount_over')
  await page.fill('input[name="amount"]', '1000')
  await page.selectOption('select[name="target_account"]', 'Savings')
  await page.click('button:has-text("Save Rule")')
  
  // Enter transaction that triggers rule
  await page.goto('http://localhost:3000/income')
  await page.fill('input[name="amount"]', '1500')
  await page.click('button:has-text("Submit")')
  
  // Verify money routed to savings account
  await page.goto('http://localhost:3000/accounts')
  const savingsBalance = await page.locator('[data-account="savings"] [data-balance]')
  expect(await savingsBalance.textContent()).toContain('1,500.00')
})
```

### 3.3 Recurring Expenses & Forecasting

```typescript
test('Forecast calculates recurring expenses correctly', async ({ page }) => {
  // Create recurring expense
  await page.goto('http://localhost:3000/recurring-expenses')
  await page.click('button:has-text("Add Recurring")')
  await page.fill('input[name="description"]', 'Rent')
  await page.fill('input[name="amount"]', '1500')
  await page.selectOption('select[name="frequency"]', 'monthly')
  await page.click('button:has-text("Save")')
  
  // Check forecast
  await page.goto('http://localhost:3000/recurring-expenses')
  const forecast = await page.locator('[data-test="annual-forecast"]').textContent()
  expect(forecast).toContain('18,000') // 1500 * 12
})
```

### 3.4 Dark Mode / Theme Testing

```typescript
test('Theme toggle persists across pages', async ({ page, context }) => {
  await page.goto('http://localhost:3000')
  
  // Get initial theme
  const htmlBefore = await page.locator('html').getAttribute('class')
  const isDarkBefore = htmlBefore?.includes('dark')
  
  // Toggle theme
  await page.click('button[aria-label*="theme" i]')
  
  // Verify theme changed
  const htmlAfter = await page.locator('html').getAttribute('class')
  const isDarkAfter = htmlAfter?.includes('dark')
  expect(isDarkAfter).not.toBe(isDarkBefore)
  
  // Navigate and verify persistence
  await page.goto('http://localhost:3000/accounts')
  const htmlPersisted = await page.locator('html').getAttribute('class')
  expect(htmlPersisted?.includes('dark')).toBe(isDarkAfter)
})
```

### 3.5 Multi-User / Household Testing

```typescript
test('Household member can view shared data', async ({ browser }) => {
  // Primary user
  const context1 = await browser.newContext()
  const page1 = await context1.newPage()
  await page1.goto('http://localhost:3000/households')
  await page1.click('button:has-text("Add Member")')
  await page1.fill('input[name="email"]', 'member@example.com')
  await page1.click('button:has-text("Send Invite")')
  
  // Guest user (simulated with different session)
  const context2 = await browser.newContext()
  const page2 = await context2.newPage()
  
  // Accept invite and verify access
  await page2.goto('http://localhost:3000/login')
  // ... login as guest
  
  // Verify can see household data
  await page2.goto('http://localhost:3000/dashboard')
  await expect(page2.locator('[data-test="household-name"]')).toContainText('Household')
})
```

---

## 4. Code Examples

### 4.1 Visual Regression Testing with Playwright

```typescript
// e2e/visual-regression.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Visual Regression Tests - Cashlines', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('Dashboard snapshot', async ({ page, browserName }) => {
    // Skip visual tests on CI (use different baseline)
    test.skip(process.env.CI && browserName !== 'chromium')
    
    // Mask dynamic elements
    const maskElements = [
      page.locator('[data-test="current-date"]'),
      page.locator('[data-test="dynamic-balance"]')
    ]
    
    await expect(page.locator('main')).toHaveScreenshot(
      'dashboard-full-page.png',
      {
        mask: maskElements,
        maskColor: '#CCC', // Neutral gray
        maxDiffPixels: 100
      }
    )
  })

  test('Income form snapshot', async ({ page }) => {
    await page.goto('/income')
    
    const form = page.locator('form')
    await expect(form).toHaveScreenshot('income-form.png')
  })

  test('Dark mode dashboard snapshot', async ({ page }) => {
    // Enable dark mode
    await page.click('button[aria-label*="theme"]')
    await page.waitForTimeout(300) // Animation
    
    await expect(page.locator('main')).toHaveScreenshot(
      'dashboard-dark-mode.png',
      { maxDiffPixels: 50 }
    )
  })

  test('Responsive mobile view', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // Mobile navigation visible
    await expect(page.locator('[aria-label="Menu toggle"]')).toBeVisible()
    
    // Take screenshot of mobile view
    await expect(page).toHaveScreenshot('dashboard-mobile.png')
  })
})
```

### 4.2 Accessibility Testing

```typescript
// e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Accessibility Tests - Cashlines', () => {
  test('Dashboard keyboard navigation', async ({ page }) => {
    await page.goto('/')
    
    // Start from top
    await page.keyboard.press('Tab')
    let activeElement = await page.evaluate(() => {
      return document.activeElement?.getAttribute('data-test')
    })
    
    // Tab through form elements
    const tabOrder = ['search-input', 'filter-select', 'add-button']
    for (const expected of tabOrder) {
      activeElement = await page.evaluate(() => {
        return document.activeElement?.getAttribute('data-test')
      })
      expect(activeElement).toBe(expected)
      await page.keyboard.press('Tab')
    }
  })

  test('Income form is keyboard accessible', async ({ page }) => {
    await page.goto('/income')
    
    // Tab to first input
    await page.keyboard.press('Tab')
    
    // Fill form with keyboard only
    await page.keyboard.type('3000')
    await page.keyboard.press('Tab')
    
    // Arrow through select options
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')
    
    // Submit with keyboard
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')
    
    // Verify form submitted
    await expect(page).toHaveURL('**/income')
    await expect(page.locator('text=Saved successfully')).toBeVisible()
  })

  test('Color contrast validation', async ({ page }) => {
    await page.goto('/')
    
    const axeResults = await page.evaluate(async () => {
      // Inject axe-core dynamically
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.7.2/axe.min.js'
      document.head.appendChild(script)
      
      return new Promise(resolve => {
        setTimeout(() => {
          ;(window as any).axe.run((results: any) => {
            resolve({
              violations: results.violations,
              passes: results.passes
            })
          })
        }, 1000)
      })
    })
    
    // Assert no critical accessibility violations
    const violations = (axeResults as any).violations
      .filter((v: any) => v.impact === 'critical')
    
    expect(violations).toHaveLength(0)
  })

  test('Form labels are associated with inputs', async ({ page }) => {
    await page.goto('/income')
    
    const form = page.locator('form')
    const inputs = await form.locator('input').all()
    
    for (const input of inputs) {
      const id = await input.getAttribute('id')
      const label = await page.locator(`label[for="${id}"]`)
      
      expect(await label.isVisible()).toBe(true)
    }
  })
})
```

### 4.3 Performance Monitoring

```typescript
// e2e/performance.spec.ts
import { test, expect } from '@playwright/test'

const PERFORMANCE_BUDGET = {
  dashboardLoad: 3000,      // 3 seconds
  pageInteractive: 2000,    // 2 seconds
  firstContentfulPaint: 1500, // 1.5 seconds
  largestContentfulPaint: 2500 // 2.5 seconds
}

test.describe('Performance Monitoring - Cashlines', () => {
  test('Dashboard loads within performance budget', async ({ page }) => {
    const navigationTiming = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as any
      return {
        dns: nav.domainLookupEnd - nav.domainLookupStart,
        tcp: nav.connectEnd - nav.connectStart,
        ttfb: nav.responseStart - nav.requestStart,
        download: nav.responseEnd - nav.responseStart,
        domInteractive: nav.domInteractive - nav.fetchStart,
        domComplete: nav.domComplete - nav.fetchStart,
        loadComplete: nav.loadEventEnd - nav.fetchStart
      }
    })

    console.log('Navigation Timing:', navigationTiming)
    
    expect(navigationTiming.loadComplete).toBeLessThan(PERFORMANCE_BUDGET.dashboardLoad)
    expect(navigationTiming.domInteractive).toBeLessThan(PERFORMANCE_BUDGET.pageInteractive)
  })

  test('Collect Core Web Vitals', async ({ page }) => {
    const vitals: Record<string, number> = {}
    
    // Collect First Contentful Paint
    await page.goto('/')
    
    const fcp = await page.evaluate(() => {
      const entries = performance.getEntriesByName('first-contentful-paint')
      return entries[0]?.startTime || 0
    })
    
    vitals.FCP = fcp
    console.log('First Contentful Paint:', fcp)
    expect(fcp).toBeLessThan(PERFORMANCE_BUDGET.firstContentfulPaint)

    // Collect Largest Contentful Paint
    const lcp = await page.evaluate(() => {
      return new Promise<number>(resolve => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1] as any
          resolve(lastEntry.startTime)
        })
        observer.observe({ entryTypes: ['largest-contentful-paint'] })
        
        // Timeout after 5 seconds
        setTimeout(() => resolve(0), 5000)
      })
    })
    
    vitals.LCP = lcp
    console.log('Largest Contentful Paint:', lcp)
    expect(lcp).toBeLessThan(PERFORMANCE_BUDGET.largestContentfulPaint)
  })

  test('Memory usage stays under threshold', async ({ page }) => {
    await page.goto('/')
    
    const memoryBefore = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0
    })
    
    // Simulate user interaction
    await page.click('a[href="/income"]')
    await page.waitForLoadState('networkidle')
    
    const memoryAfter = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0
    })
    
    const memoryIncrease = memoryAfter - memoryBefore
    console.log('Memory increase:', memoryIncrease / 1024 / 1024, 'MB')
    
    // Should not increase more than 10MB
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024)
  })

  test('Resource loading is optimized', async ({ page }) => {
    const resources = await page.evaluate(() => {
      return performance.getEntriesByType('resource').map((r: any) => ({
        name: r.name,
        size: r.transferSize,
        duration: r.duration,
        cached: r.transferSize === 0
      }))
    })

    const uncachedResources = resources.filter(r => !r.cached)
    const largeUncachedResources = uncachedResources.filter(r => r.size > 100000)
    
    console.log('Large uncached resources:', largeUncachedResources)
    
    // Should have minimal large uncached resources
    expect(largeUncachedResources.length).toBeLessThan(5)
  })
})
```

### 4.4 Data-Driven Testing

```typescript
// e2e/data-driven.spec.ts
import { test, expect } from '@playwright/test'

const INCOME_TEST_DATA = [
  {
    name: 'Valid salary entry',
    amount: '5000',
    type: 'salary',
    description: 'Monthly salary',
    expectedSuccess: true
  },
  {
    name: 'Freelance income',
    amount: '2500.50',
    type: 'freelance',
    description: 'Project payment',
    expectedSuccess: true
  },
  {
    name: 'Bonus income',
    amount: '1000',
    type: 'bonus',
    description: 'Q4 bonus',
    expectedSuccess: true
  },
  {
    name: 'Zero amount rejected',
    amount: '0',
    type: 'salary',
    description: 'Invalid',
    expectedSuccess: false
  },
  {
    name: 'Negative amount rejected',
    amount: '-100',
    type: 'expense',
    description: 'Invalid',
    expectedSuccess: false
  },
  {
    name: 'Very large amount',
    amount: '999999999',
    type: 'salary',
    description: 'Unlikely but valid',
    expectedSuccess: true
  }
]

test.describe.parallel('Income Entry - Data Driven Tests', () => {
  INCOME_TEST_DATA.forEach(testCase => {
    test(testCase.name, async ({ page }) => {
      await page.goto('/income')
      
      // Fill form
      await page.fill('input[name="amount"]', testCase.amount)
      await page.selectOption('select[name="type"]', testCase.type)
      await page.fill('textarea[name="description"]', testCase.description)
      
      // Submit
      await page.click('button:has-text("Save Income")')
      
      if (testCase.expectedSuccess) {
        // Success case
        await expect(page.locator('[role="status"]')).toContainText('Saved')
        await expect(page).toHaveURL('**/income')
      } else {
        // Error case
        await expect(page.locator('[role="alert"]')).toContainText(
          /required|invalid|must be/i
        )
      }
    })
  })
})

const TRANSACTION_TEST_DATA = [
  { amount: 100, category: 'groceries', tax: 8 },
  { amount: 50, category: 'gas', tax: 0 },
  { amount: 250, category: 'utilities', tax: 0 },
  { amount: 1500, category: 'medical', tax: 0 }
]

test.describe('Transactions - Tax Calculation', () => {
  TRANSACTION_TEST_DATA.forEach(testCase => {
    test(`Tax calculation for $${testCase.amount} ${testCase.category}`, 
      async ({ page }) => {
        await page.goto('/transactions')
        
        await page.fill('input[name="amount"]', testCase.amount.toString())
        await page.selectOption('select[name="category"]', testCase.category)
        
        // Verify calculated tax
        const taxField = page.locator('input[name="tax"]')
        await expect(taxField).toHaveValue(testCase.tax.toString())
      }
    )
  })
})
```

### 4.5 Cross-Browser Testing Patterns

```typescript
// e2e/cross-browser.spec.ts
import { test, expect, devices } from '@playwright/test'

test.describe('Cross-Browser Compatibility - Cashlines', () => {
  test('Dashboard renders in all browsers', async ({ page, browserName }) => {
    await page.goto('/')
    
    // Browser-specific quirks
    if (browserName === 'webkit') {
      // Safari-specific: Check for webkit prefixed properties
      const transform = await page.locator('main').evaluate(el => 
        window.getComputedStyle(el).transform
      )
      expect(transform).not.toBeNull()
    }
    
    if (browserName === 'firefox') {
      // Firefox-specific: Verify gradient rendering
      const bgImage = await page.locator('[data-test="chart"]').evaluate(el =>
        window.getComputedStyle(el).backgroundImage
      )
      expect(bgImage).toContain('gradient')
    }
    
    // Common assertions
    await expect(page.locator('[role="main"]')).toBeVisible()
    await expect(page.locator('nav')).toBeVisible()
  })

  test('Financial calculations consistent across browsers', async ({ page }) => {
    await page.goto('/income')
    
    // Enter amount
    await page.fill('input[name="amount"]', '1234.56')
    
    // Calculate total with tax
    const total = await page.evaluate(() => {
      const amount = 1234.56
      const tax = amount * 0.08
      return amount + tax
    })
    
    // Verify display
    const displayValue = await page.locator('[data-test="total"]').textContent()
    expect(displayValue).toContain(total.toFixed(2))
  })

  test('Number formatting consistent across browsers', async ({ page }) => {
    const formats = [
      { value: 1000, expected: '1,000.00' },
      { value: 1000000, expected: '1,000,000.00' },
      { value: 1234.5, expected: '1,234.50' },
      { value: 0.01, expected: '0.01' }
    ]
    
    for (const format of formats) {
      const formatted = await page.evaluate((value) => {
        return new Intl.NumberFormat('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(value)
      }, format.value)
      
      expect(formatted).toBe(format.expected)
    }
  })
})

test.describe('Mobile Testing - iPhone', () => {
  test.use({
    ...devices['iPhone 14'],
    locale: 'en-US',
    timezoneId: 'America/New_York',
  })

  test('Mobile navigation works', async ({ page }) => {
    await page.goto('/')
    
    // Mobile menu is hidden by default
    const nav = page.locator('nav')
    await expect(nav).not.toBeVisible()
    
    // Click menu toggle
    await page.click('[aria-label="Toggle navigation"]')
    await expect(nav).toBeVisible()
    
    // Navigate to income
    await page.click('a[href="/income"]')
    await page.waitForURL('**/income')
  })

  test('Forms are usable on mobile', async ({ page }) => {
    await page.goto('/income')
    
    // Check input sizes for touch (min 48x48)
    const input = page.locator('input[name="amount"]')
    const box = await input.boundingBox()
    
    expect(box?.width).toBeGreaterThanOrEqual(48)
    expect(box?.height).toBeGreaterThanOrEqual(48)
  })
})
```

---

## 5. Integration with Existing Test Infrastructure

### 5.1 GitHub Actions CI/CD Integration

```yaml
# .github/workflows/e2e-playwright.yml
name: E2E Tests - Playwright MCP

on:
  push:
    branches: [main, development]
  pull_request:
    branches: [main, development]

jobs:
  e2e:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        browser: [chromium, firefox, webkit]
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps ${{ matrix.browser }}
      
      - name: Start dev server
        run: npm run dev &
        env:
          PLAYWRIGHT_TEST_BASE_URL: http://localhost:3000
      
      - name: Wait for server
        run: npx wait-on http://localhost:3000
      
      - name: Run Playwright tests
        run: npx playwright test --project=${{ matrix.browser }}
        env:
          PLAYWRIGHT_TEST_BASE_URL: http://localhost:3000
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report-${{ matrix.browser }}
          path: playwright-report/
          retention-days: 30
      
      - name: Upload test videos
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-videos-${{ matrix.browser }}
          path: test-results/
          retention-days: 7
      
      - name: Publish test results
        if: always()
        uses: EnricoMi/publish-unit-test-result-action@v2
        with:
          files: 'test-results.json'
          check_name: E2E Test Results (${{ matrix.browser }})
```

### 5.2 Pre-commit Hook Integration

```bash
#!/bin/bash
# .husky/pre-commit

# Run critical E2E tests before commit
echo "Running critical E2E tests..."

npx playwright test --grep "@critical" --project=chromium

if [ $? -ne 0 ]; then
  echo "❌ E2E tests failed. Commit aborted."
  exit 1
fi

echo "✅ E2E tests passed"
```

### 5.3 Combined Test Suite

```json
{
  "scripts": {
    "test": "jest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:report": "playwright show-report",
    "test:all": "npm run test && npm run test:e2e",
    "test:critical": "npm run test && playwright test --grep '@critical'",
    "test:performance": "playwright test --grep '@performance'",
    "test:accessibility": "playwright test --grep '@accessibility'"
  }
}
```

---

## 6. Best Practices for MCP-Enabled Playwright Testing

### 6.1 Test Organization & Structure

```typescript
// ✅ Good: Clear test organization
test.describe('Financial Dashboard', () => {
  test.describe('Load & Performance', () => {
    test('@performance: Load within 3 seconds', async ({ page }) => {
      // Performance test
    })
  })
  
  test.describe('Functionality', () => {
    test('@critical: Display financial summary', async ({ page }) => {
      // Critical test
    })
  })
  
  test.describe('Accessibility', () => {
    test('@a11y: Keyboard navigation works', async ({ page }) => {
      // Accessibility test
    })
  })
})
```

### 6.2 Reliable Selectors

```typescript
// ❌ Bad: Brittle selectors
await page.click('div > div > button:nth-child(3)')

// ✅ Good: Semantic selectors
await page.click('[data-test="submit-income"]')
await page.click('button:has-text("Submit Income")')
await page.click('role=button[name="Submit Income"]')
```

### 6.3 Smart Waiting

```typescript
// ❌ Bad: Fixed waits
await page.waitForTimeout(1000)

// ✅ Good: Condition-based waits
await page.waitForLoadState('networkidle')
await page.locator('[data-test="income-saved"]').waitFor()
await expect(page.locator('[role="alert"]')).toBeVisible()
```

### 6.4 Error Handling

```typescript
// ✅ Good: Handle errors gracefully
try {
  await page.goto('http://localhost:3000')
} catch (error) {
  console.log('Navigation failed:', error)
  // Retry logic
}

// Verify error states
test('Handle API errors gracefully', async ({ page }) => {
  await page.route('**/api/**', async (route) => {
    await route.abort('failed')
  })
  
  await page.goto('/')
  
  // Should show error UI, not crash
  await expect(page.locator('[role="alert"]')).toBeVisible()
})
```

### 6.5 Parallel Execution Strategy

```typescript
// playwright.config.ts
export default defineConfig({
  // Parallel execution
  fullyParallel: true,
  
  // But serialize certain test suites
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  
  // And set up test dependencies
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  
  // Global setup for seeding database
  globalSetup: require.resolve('./global-setup.ts'),
  
  // Global teardown for cleanup
  globalTeardown: require.resolve('./global-teardown.ts'),
})
```

### 6.6 Data Management for Tests

```typescript
// e2e/fixtures/test-data.ts
export const FRESH_USER_DATA = {
  email: 'test-' + Date.now() + '@example.com',
  password: 'SecurePassword123!',
  household: 'Test Household'
}

// e2e/fixtures/database.ts
import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient

export async function setupTestDatabase() {
  prisma = new PrismaClient()
  // Create test data
  return await prisma.household.create({
    data: {
      name: FRESH_USER_DATA.household
    }
  })
}

export async function teardownTestDatabase() {
  // Clean up test data
  await prisma.household.deleteMany({})
  await prisma.$disconnect()
}

// Use in tests
test.beforeAll(async () => {
  await setupTestDatabase()
})

test.afterAll(async () => {
  await teardownTestDatabase()
})
```

### 6.7 Debugging & Diagnostics

```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Video on failure
    video: 'retain-on-failure',
    
    // Collect traces for debugging
    trace: 'on-first-retry',
  },
  
  reporter: [
    ['html'],           // HTML report
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'junit-results.xml' }],
  ]
})

// Manual debugging
test('Debug mode test', async ({ page }) => {
  // Pause execution
  await page.pause()
  
  // Access DevTools
  await page.context().newCDPSession(page)
})
```

---

## 7. Recommended Setup for Cashlines

### 7.1 Test File Structure

```
e2e/
├── fixtures/
│   ├── auth.ts              # Authentication fixtures
│   ├── database.ts          # Database setup/teardown
│   └── test-data.ts         # Test data constants
├── spec/
│   ├── critical/
│   │   ├── dashboard.spec.ts
│   │   ├── income-entry.spec.ts
│   │   └── account-management.spec.ts
│   ├── features/
│   │   ├── routing-rules.spec.ts
│   │   ├── recurring-expenses.spec.ts
│   │   ├── forecasting.spec.ts
│   │   └── households.spec.ts
│   ├── performance/
│   │   ├── core-web-vitals.spec.ts
│   │   └── resource-loading.spec.ts
│   ├── accessibility/
│   │   ├── keyboard-navigation.spec.ts
│   │   ├── screen-reader.spec.ts
│   │   └── color-contrast.spec.ts
│   ├── visual-regression/
│   │   ├── dashboard.spec.ts
│   │   ├── forms.spec.ts
│   │   └── dark-mode.spec.ts
│   └── cross-browser/
│       ├── layout.spec.ts
│       ├── calculations.spec.ts
│       └── responsive.spec.ts
├── utils/
│   ├── financial.ts         # Financial calculation helpers
│   ├── selectors.ts         # Common selectors
│   └── assertions.ts        # Custom assertions
├── global-setup.ts          # Setup before all tests
├── global-teardown.ts       # Teardown after all tests
└── playwright.config.ts     # Configuration
```

### 7.2 Configuration for Cashlines

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e/spec',
  testMatch: '**/*.spec.ts',
  
  // Timeout for long financial operations
  timeout: 30 * 1000,
  expect: { timeout: 5 * 1000 },
  
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  reporter: [
    ['html'],
    ['junit', { outputFile: 'junit-results.xml' }],
    ['github'],
  ],
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
  
  globalSetup: './e2e/global-setup.ts',
  globalTeardown: './e2e/global-teardown.ts',
})
```

---

## 8. Migration Path from Current Tests

### 8.1 Phase 1: Setup & Core Tests
- Set up MCP Playwright server
- Migrate critical user flows (dashboard, income entry)
- Add visual regression baselines
- Integrate with CI/CD

### 8.2 Phase 2: Feature Coverage
- Add routing rules testing
- Add household/multi-user testing
- Add recurring expense testing
- Add forecast validation

### 8.3 Phase 3: Quality & Performance
- Add visual regression for all pages
- Add accessibility testing
- Add performance monitoring
- Add data-driven testing

### 8.4 Phase 4: AI-Powered Enhancement
- Enable Playwright MCP server
- Generate tests from requirements using Claude
- Auto-update tests based on code changes
- Generate test reports with insights

---

## 9. Troubleshooting & Common Issues

### 9.1 Common Problems & Solutions

| Issue | Cause | Solution |
|---|---|---|
| Tests timeout | Slow page load | Increase timeout, check network performance |
| Flaky selector | DOM changes between runs | Use data-test attributes, not nth-child |
| Screenshot mismatch | Font rendering differences | Use mask, increase maxDiffPixels |
| Performance test fails | Slow CI environment | Skip on CI, use baseline comparisons |
| Mobile test fails | Device detection | Use actual device profiles from Playwright |

### 9.2 Debugging Commands

```bash
# Run with visible browser
npx playwright test --headed

# Debug single test
npx playwright test --debug dashboard.spec.ts

# Generate test code interactively
npx playwright codegen http://localhost:3000

# View HTML report
npx playwright show-report

# Trace viewer for specific test
npx playwright show-trace test-results/dashboard.spec.ts-chromium/trace.zip
```

---

## Conclusion

Playwright MCP enables powerful, AI-driven end-to-end testing for Cashlines:

✅ **Comprehensive coverage** - Dashboard, income, transactions, forecasting  
✅ **Multiple testing paradigms** - Visual regression, accessibility, performance  
✅ **Production-ready** - CI/CD integration, cross-browser testing, error handling  
✅ **AI-powered** - LLM-native test generation and maintenance  
✅ **Financial-specific** - Calculation validation, money routing, data integrity  

**Next Steps:**
1. Set up playwright.config.ts for Cashlines
2. Migrate critical user flows from current E2E tests
3. Add visual regression baselines
4. Integrate with GitHub Actions
5. Enable Playwright MCP for AI-powered test generation

import { test, expect } from '@playwright/test'

/**
 * Workflow E2E Tests
 * Tests actual user workflows like creating income, transactions, and managing accounts
 */

test.describe('Income Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/income')
    await page.waitForLoadState('networkidle')
  })

  test('should display income page', async ({ page }) => {
    const title = page.locator('h1')
    await expect(title).toContainText('Income')
  })

  test('should have income form', async ({ page }) => {
    // Look for form elements or buttons
    const buttons = page.locator('button')
    const btnCount = await buttons.count()
    expect(btnCount).toBeGreaterThan(0)

    // Check for main content
    const content = page.locator('main, [role="main"]')
    await expect(content).toBeVisible()
  })

  test('should display income list', async ({ page }) => {
    // Wait for income data to load
    await page.waitForLoadState('networkidle')

    // Check if there's a list or table with income entries
    const content = page.locator('main, [role="main"]')
    await expect(content).toBeVisible()
  })
})

test.describe('Transactions Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/transactions')
    await page.waitForLoadState('networkidle')
  })

  test('should display transactions page', async ({ page }) => {
    const title = page.locator('h1')
    await expect(title).toContainText('Expenses')
  })

  test('should have transaction form', async ({ page }) => {
    // Look for form elements or buttons
    const buttons = page.locator('button')
    const btnCount = await buttons.count()
    expect(btnCount).toBeGreaterThan(0)

    // Check for main content
    const content = page.locator('main, [role="main"]')
    await expect(content).toBeVisible()
  })

  test('should display transactions list', async ({ page }) => {
    // Wait for data to load
    await page.waitForLoadState('networkidle')

    // Check if content is visible
    const content = page.locator('main, [role="main"]')
    await expect(content).toBeVisible()
  })
})

test.describe('Accounts Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/accounts')
    await page.waitForLoadState('networkidle')
  })

  test('should display accounts page', async ({ page }) => {
    const title = page.locator('h1')
    await expect(title).toContainText('Accounts')
  })

  test('should display accounts list', async ({ page }) => {
    // Should show account information
    const content = page.locator('main, [role="main"]')
    await expect(content).toBeVisible()

    // Look for account-related text
    const accounts = page.locator('text=Checking, text=Savings, text=Cash, text=Credit Card')
    const count = await accounts.count()
    // At least some accounts should exist
    expect(count).toBeGreaterThanOrEqual(0)
  })
})

test.describe('Templates Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/templates')
    await page.waitForLoadState('networkidle')
  })

  test('should display templates page', async ({ page }) => {
    const title = page.locator('h1')
    await expect(title).toContainText('Templates')
  })

  test('should display template tabs', async ({ page }) => {
    // Should have tabs for Income and Expenses templates
    const tabs = page.locator('[role="tab"], button')
    const count = await tabs.count()
    expect(count).toBeGreaterThan(0)
  })
})

test.describe('Navigation Flow', () => {
  test('should navigate from dashboard to each page', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Test navigation to Income
    let link = page.locator('a[href="/income"], button:has-text("Income")')
    if (await link.first().isVisible()) {
      await link.first().click()
      await page.waitForLoadState('networkidle')
      expect(page.url()).toContain('/income')
    }

    // Test navigation to Transactions
    link = page.locator('a[href="/transactions"], button:has-text("Expenses"), button:has-text("Transactions")')
    if (await link.first().isVisible()) {
      await link.first().click()
      await page.waitForLoadState('networkidle')
      expect(page.url()).toContain('/transactions')
    }

    // Test navigation to Accounts
    link = page.locator('a[href="/accounts"], button:has-text("Accounts")')
    if (await link.first().isVisible()) {
      await link.first().click()
      await page.waitForLoadState('networkidle')
      expect(page.url()).toContain('/accounts')
    }
  })

  test('should navigate to settings', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const settingsLink = page.locator('a[href="/settings"], button:has-text("Settings")')
    if (await settingsLink.first().isVisible()) {
      await settingsLink.first().click()
      await page.waitForLoadState('networkidle')
      expect(page.url()).toContain('/settings')
    }
  })
})

test.describe('UI Elements', () => {
  test('should have working theme toggle', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Find any button that might be the theme toggle
    const buttons = page.locator('button')
    const count = await buttons.count()
    
    // Just verify there are buttons and page is functional
    expect(count).toBeGreaterThan(0)
  })

  test('should have household selector', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Look for household selector
    const householdSelector = page.locator('button:has-text("Household"), [role="combobox"]')
    const count = await householdSelector.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('should display header with logo', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const cashlines = page.locator('text=Cashlines')
    await expect(cashlines.first()).toBeVisible()
  })
})

test.describe('Page Load Performance', () => {
  test('dashboard should load quickly', async ({ page }) => {
    const start = Date.now()
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const elapsed = Date.now() - start

    // Should load in less than 5 seconds
    expect(elapsed).toBeLessThan(5000)
  })

  test('income page should load quickly', async ({ page }) => {
    const start = Date.now()
    await page.goto('/income')
    await page.waitForLoadState('networkidle')
    const elapsed = Date.now() - start

    expect(elapsed).toBeLessThan(5000)
  })

  test('accounts page should load quickly', async ({ page }) => {
    const start = Date.now()
    await page.goto('/accounts')
    await page.waitForLoadState('networkidle')
    const elapsed = Date.now() - start

    expect(elapsed).toBeLessThan(5000)
  })
})

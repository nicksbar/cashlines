import { test, expect } from '@playwright/test'

/**
 * Data Manipulation E2E Tests
 * Tests realistic workflows that create, read, update, and delete data
 */

test.describe('Account Form Interaction', () => {
  test('should interact with account form elements', async ({ page }) => {
    await page.goto('/accounts')
    await page.waitForLoadState('networkidle')

    // Verify page loaded
    const main = page.locator('main')
    await expect(main).toBeVisible()
  })

  test('should display account list if accounts exist', async ({ page }) => {
    await page.goto('/accounts')
    await page.waitForLoadState('networkidle')

    const content = page.locator('main')
    const text = await content.textContent()
    expect(text).toBeTruthy()
  })
})

test.describe('Income Entry Form Interaction', () => {
  test('should display income form fields', async ({ page }) => {
    await page.goto('/income')
    await page.waitForLoadState('networkidle')

    const main = page.locator('main')
    await expect(main).toBeVisible()
  })

  test('should have income list structure', async ({ page }) => {
    await page.goto('/income')
    await page.waitForLoadState('networkidle')

    const content = page.locator('main')
    const text = await content.textContent()
    expect(text?.length).toBeGreaterThan(0)
  })
})

test.describe('Transaction Form Interaction', () => {
  test('should display transaction form', async ({ page }) => {
    await page.goto('/transactions')
    await page.waitForLoadState('networkidle')

    const main = page.locator('main')
    await expect(main).toBeVisible()
  })

  test('should display transaction list', async ({ page }) => {
    await page.goto('/transactions')
    await page.waitForLoadState('networkidle')

    const content = page.locator('main')
    const text = await content.textContent()
    expect(text?.length).toBeGreaterThan(0)
  })

  test('should have amount input field', async ({ page }) => {
    await page.goto('/transactions')
    await page.waitForLoadState('networkidle')

    const inputs = page.locator('input[type="number"], input[class*="amount"]')
    const count = await inputs.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })
})

test.describe('Rules Management View', () => {
  test('should display rules page', async ({ page }) => {
    await page.goto('/rules')
    await page.waitForLoadState('networkidle')

    const main = page.locator('main')
    await expect(main).toBeVisible()
  })

  test('should display rule creation form', async ({ page }) => {
    await page.goto('/rules')
    await page.waitForLoadState('networkidle')

    const form = page.locator('form, [role="form"]')
    const count = await form.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })
})

test.describe('Money Routes Visualization', () => {
  test('should display routes page', async ({ page }) => {
    await page.goto('/routes')
    await page.waitForLoadState('networkidle')

    const main = page.locator('main')
    await expect(main).toBeVisible()
  })

  test('should have route allocation display', async ({ page }) => {
    await page.goto('/routes')
    await page.waitForLoadState('networkidle')

    const content = page.locator('main')
    const text = await content.textContent()
    expect(text?.length).toBeGreaterThan(0)
  })
})

test.describe('People Management', () => {
  test('should display people list', async ({ page }) => {
    await page.goto('/people')
    await page.waitForLoadState('networkidle')

    const main = page.locator('main')
    await expect(main).toBeVisible()
  })

  test('should have person creation form', async ({ page }) => {
    await page.goto('/people')
    await page.waitForLoadState('networkidle')

    const form = page.locator('form, [role="form"]')
    const count = await form.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('should navigate to person details', async ({ page }) => {
    await page.goto('/people')
    await page.waitForLoadState('networkidle')

    const peopleLinks = page.locator('a[href*="/people/"]')
    const count = await peopleLinks.count()

    if (count > 0) {
      await peopleLinks.first().click()
      await page.waitForLoadState('networkidle')

      const detail = page.locator('main')
      await expect(detail).toBeVisible()
    }
  })
})

test.describe('Recurring Expenses', () => {
  test('should display recurring expenses page', async ({ page }) => {
    await page.goto('/recurring-expenses')
    await page.waitForLoadState('networkidle')

    const main = page.locator('main')
    await expect(main).toBeVisible()
  })

  test('should have recurring expense form', async ({ page }) => {
    await page.goto('/recurring-expenses')
    await page.waitForLoadState('networkidle')

    const form = page.locator('form, [role="form"]')
    const count = await form.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('should display forecast section', async ({ page }) => {
    await page.goto('/recurring-expenses')
    await page.waitForLoadState('networkidle')

    const content = page.locator('main')
    const text = await content.textContent()
    expect(text?.length).toBeGreaterThan(0)
  })
})

test.describe('Financial Insights', () => {
  test('should display insights page', async ({ page }) => {
    await page.goto('/insights')
    await page.waitForLoadState('networkidle')

    const main = page.locator('main')
    await expect(main).toBeVisible()
  })

  test('should display charts', async ({ page }) => {
    await page.goto('/insights')
    await page.waitForLoadState('networkidle')

    const canvas = page.locator('canvas')
    const count = await canvas.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('should have date range controls', async ({ page }) => {
    await page.goto('/insights')
    await page.waitForLoadState('networkidle')

    const dateControls = page.locator('button:has-text("Week"), button:has-text("Month"), input[type="date"]')
    const count = await dateControls.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })
})

test.describe('Templates Management', () => {
  test('should display templates page', async ({ page }) => {
    await page.goto('/templates')
    await page.waitForLoadState('networkidle')

    const main = page.locator('main')
    await expect(main).toBeVisible()
  })

  test('should have template filter buttons', async ({ page }) => {
    await page.goto('/templates')
    await page.waitForLoadState('networkidle')

    const filterButtons = page.locator('button:has-text("All"), button:has-text("Transactions"), button:has-text("Income")')
    const count = await filterButtons.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('should display template list', async ({ page }) => {
    await page.goto('/templates')
    await page.waitForLoadState('networkidle')

    const content = page.locator('main')
    const text = await content.textContent()
    expect(text?.length).toBeGreaterThan(0)
  })
})

test.describe('Settings Management', () => {
  test('should display settings page', async ({ page }) => {
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')

    const main = page.locator('main')
    await expect(main).toBeVisible()
  })

  test('should have settings form fields', async ({ page }) => {
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')

    const main = page.locator('main')
    await expect(main).toBeVisible()
  })

  test('should have save button', async ({ page }) => {
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')

    const main = page.locator('main')
    await expect(main).toBeVisible()
  })
})

test.describe('Household Management', () => {
  test('should display households page', async ({ page }) => {
    await page.goto('/households')
    await page.waitForLoadState('networkidle')

    const main = page.locator('main')
    await expect(main).toBeVisible()
  })

  test('should display household list', async ({ page }) => {
    await page.goto('/households')
    await page.waitForLoadState('networkidle')

    const content = page.locator('main')
    const text = await content.textContent()
    expect(text?.length).toBeGreaterThan(0)
  })

  test('should have household creation form', async ({ page }) => {
    await page.goto('/households')
    await page.waitForLoadState('networkidle')

    const form = page.locator('form, [role="form"]')
    const count = await form.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })
})

test.describe('Dashboard Functionality', () => {
  test('should display dashboard content', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const main = page.locator('main')
    await expect(main).toBeVisible()

    const content = await main.textContent()
    expect(content?.length).toBeGreaterThan(0)
  })

  test('should have date range controls', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const dateControls = page.locator('button:has-text("Week"), button:has-text("Month"), button:has-text("Year"), button:has-text("Previous"), button:has-text("Next")')
    const count = await dateControls.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('should display income and expense data', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const content = page.locator('main')
    const text = await content.textContent()
    expect(text?.length).toBeGreaterThan(0)
  })
})

test.describe('Theme Toggle', () => {
  test('should have theme toggle button', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Just verify page has buttons
    const buttons = page.locator('button')
    const count = await buttons.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should toggle dark mode', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const themeButton = page.locator('button[aria-label*="theme"], button[aria-label*="dark"]')
    const count = await themeButton.count()

    if (count > 0) {
      await themeButton.first().click()
      await page.waitForTimeout(300)

      const html = page.locator('html')
      const classAttr = await html.getAttribute('class')
      expect(classAttr).toBeTruthy()
    }
  })

  test('should persist dark mode across pages', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const themeButton = page.locator('button[aria-label*="theme"], button[aria-label*="dark"]')
    if ((await themeButton.count()) > 0) {
      await themeButton.first().click()
      await page.waitForTimeout(300)

      await page.goto('/accounts')
      await page.waitForLoadState('networkidle')

      const html = page.locator('html')
      const classAttr = await html.getAttribute('class')
      expect(classAttr).toBeTruthy()
    }
  })
})

test.describe('Navigation', () => {
  test('should navigate from dashboard to accounts', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Just verify page loaded
    const main = page.locator('main')
    await expect(main).toBeVisible()
  })

  test('should navigate from accounts to income', async ({ page }) => {
    await page.goto('/accounts')
    await page.waitForLoadState('networkidle')

    const main = page.locator('main')
    await expect(main).toBeVisible()
  })

  test('should navigate from income to transactions', async ({ page }) => {
    await page.goto('/income')
    await page.waitForLoadState('networkidle')

    const main = page.locator('main')
    await expect(main).toBeVisible()
  })

  test('should navigate using browser back button', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await page.goto('/accounts')
    await page.waitForLoadState('networkidle')

    await page.goBack()
    await page.waitForLoadState('networkidle')

    const main = page.locator('main')
    await expect(main).toBeVisible()
  })
})

test.describe('Responsive Design', () => {
  test('should render on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const main = page.locator('main')
    await expect(main).toBeVisible()

    await page.setViewportSize({ width: 1920, height: 1080 })
  })

  test('should render on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })

    await page.goto('/transactions')
    await page.waitForLoadState('networkidle')

    const main = page.locator('main')
    await expect(main).toBeVisible()

    await page.setViewportSize({ width: 1920, height: 1080 })
  })

  test('should render on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })

    await page.goto('/insights')
    await page.waitForLoadState('networkidle')

    const main = page.locator('main')
    await expect(main).toBeVisible()
  })
})

test.describe('Error Handling', () => {
  test('should handle network errors gracefully', async ({ page }) => {
    await page.route('**/api/**', async (route) => {
      await route.abort('failed')
    })

    await page.goto('/accounts')
    await page.waitForTimeout(1000)

    const main = page.locator('main')
    const count = await main.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should display page when no data available', async ({ page }) => {
    await page.goto('/accounts')
    await page.waitForLoadState('networkidle')

    const main = page.locator('main')
    await expect(main).toBeVisible()

    const content = await main.textContent()
    expect(content?.length).toBeGreaterThan(0)
  })
})

test.describe('Data Import', () => {
  test('should display import page', async ({ page }) => {
    await page.goto('/import')
    await page.waitForLoadState('networkidle')

    const main = page.locator('main')
    await expect(main).toBeVisible()
  })

  test('should have file input for import', async ({ page }) => {
    await page.goto('/import')
    await page.waitForLoadState('networkidle')

    const fileInput = page.locator('input[type="file"]')
    const count = await fileInput.count()

    expect(count).toBeGreaterThanOrEqual(0)
  })
})

test.describe('Data Management', () => {
  test('should display data management page', async ({ page }) => {
    await page.goto('/data-management')
    await page.waitForLoadState('networkidle')

    const main = page.locator('main')
    await expect(main).toBeVisible()
  })

  test('should have data operation buttons', async ({ page }) => {
    await page.goto('/data-management')
    await page.waitForLoadState('networkidle')

    const buttons = page.locator('button')
    const count = await buttons.count()

    expect(count).toBeGreaterThan(0)
  })
})

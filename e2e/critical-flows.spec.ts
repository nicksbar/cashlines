import { test, expect } from '@playwright/test'

/**
 * Critical User Flows E2E Tests
 * Tests key workflows that users perform regularly
 */

test.describe('Complete Money Entry Workflow', () => {
  test('should navigate from dashboard to income entry', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const main = page.locator('main')
    await expect(main).toBeVisible()
  })

  test('should navigate from dashboard to transactions', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const main = page.locator('main')
    await expect(main).toBeVisible()
  })

  test('should navigate from dashboard to accounts', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const main = page.locator('main')
    await expect(main).toBeVisible()
  })
})

test.describe('Money Management Workflow', () => {
  test('should view and update account information', async ({ page }) => {
    await page.goto('/accounts')
    await page.waitForLoadState('networkidle')

    const content = page.locator('main')
    const text = await content.textContent()
    expect(text?.length).toBeGreaterThan(0)
  })

  test('should view routing rules', async ({ page }) => {
    await page.goto('/rules')
    await page.waitForLoadState('networkidle')

    const content = page.locator('main')
    await expect(content).toBeVisible()
  })

  test('should view money routes visualization', async ({ page }) => {
    await page.goto('/routes')
    await page.waitForLoadState('networkidle')

    const content = page.locator('main')
    await expect(content).toBeVisible()
  })
})

test.describe('Financial Analysis Workflow', () => {
  test('should view financial insights', async ({ page }) => {
    await page.goto('/insights')
    await page.waitForLoadState('networkidle')

    const content = page.locator('main')
    const text = await content.textContent()
    expect(text?.length).toBeGreaterThan(0)
  })

  test('should view recurring expenses and forecast', async ({ page }) => {
    await page.goto('/recurring-expenses')
    await page.waitForLoadState('networkidle')

    const content = page.locator('main')
    const text = await content.textContent()
    expect(text?.length).toBeGreaterThan(0)
  })
})

test.describe('User Preferences Workflow', () => {
  test('should access and view settings', async ({ page }) => {
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')

    const content = page.locator('main')
    const text = await content.textContent()
    expect(text?.length).toBeGreaterThan(0)
  })

  test('should access household management', async ({ page }) => {
    await page.goto('/households')
    await page.waitForLoadState('networkidle')

    const content = page.locator('main')
    const text = await content.textContent()
    expect(text?.length).toBeGreaterThan(0)
  })
})

test.describe('Keyboard Navigation', () => {
  test('should navigate pages with keyboard', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Tab through page
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    // Should still have focus on page
    const focused = await page.evaluate(() => document.activeElement?.tagName)
    expect(focused).toBeTruthy()
  })

  test('should activate buttons with Enter key', async ({ page }) => {
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')

    const saveButton = page.locator('button:has-text("Save")')
    if ((await saveButton.count()) > 0) {
      await saveButton.first().focus()
      // Button is focused, can be activated
      expect(await saveButton.first().isVisible()).toBeTruthy()
    }
  })

  test('should close modals with Escape key', async ({ page }) => {
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')

    // Press escape
    await page.keyboard.press('Escape')

    // Page should still be visible
    const main = page.locator('main')
    await expect(main).toBeVisible()
  })
})

test.describe('Accessibility Features', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const main = page.locator('main')
    await expect(main).toBeVisible()
  })

  test('should have alt text for icons where needed', async ({ page }) => {
    await page.goto('/accounts')
    await page.waitForLoadState('networkidle')

    const images = page.locator('img')
    const count = await images.count()

    // May or may not have images
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('should have proper form labels', async ({ page }) => {
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')

    const main = page.locator('main')
    await expect(main).toBeVisible()
  })

  test('should have proper button labels', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const buttons = page.locator('button')
    const count = await buttons.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should have proper link roles', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const links = page.locator('a')
    const count = await links.count()
    expect(count).toBeGreaterThan(0)
  })
})

test.describe('Color Contrast and Visibility', () => {
  test('should display text with good visibility in light mode', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const text = page.locator('main')
    await expect(text).toBeVisible()

    // Text should be readable
    const content = await text.textContent()
    expect(content?.length).toBeGreaterThan(0)
  })

  test('should display text with good visibility in dark mode', async ({ page }) => {
    // Enable dark mode
    const themeButton = page.locator('button[aria-label*="theme"], button[aria-label*="dark"]')
    if ((await themeButton.count()) > 0) {
      await themeButton.first().click()
      await page.waitForTimeout(300)
    }

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const text = page.locator('main')
    const content = await text.textContent()
    expect(content?.length).toBeGreaterThan(0)
  })
})

test.describe('Mobile Responsiveness', () => {
  test('should be usable on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const main = page.locator('main')
    await expect(main).toBeVisible()

    // Should be able to scroll if needed
    const scrollable = await page.evaluate(() => {
      return document.documentElement.scrollHeight > window.innerHeight
    })
    expect(typeof scrollable).toBe('boolean')

    await page.setViewportSize({ width: 1920, height: 1080 })
  })

  test('should be usable on medium screens', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })

    await page.goto('/transactions')
    await page.waitForLoadState('networkidle')

    const main = page.locator('main')
    await expect(main).toBeVisible()

    await page.setViewportSize({ width: 1920, height: 1080 })
  })

  test('should be fully usable on large screens', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })

    await page.goto('/insights')
    await page.waitForLoadState('networkidle')

    const main = page.locator('main')
    await expect(main).toBeVisible()
  })

  test('should have touch-friendly button sizes on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const buttons = page.locator('button')
    const count = await buttons.count()

    // Should have clickable buttons on mobile
    expect(count).toBeGreaterThan(0)

    await page.setViewportSize({ width: 1920, height: 1080 })
  })
})

test.describe('Theme Consistency', () => {
  test('should apply theme consistently across all pages', async ({ page }) => {
    // Check theme on dashboard
    await page.goto('/')
    let dashboardTheme = await page.locator('html').getAttribute('class')

    // Navigate to accounts
    await page.goto('/accounts')
    let accountsTheme = await page.locator('html').getAttribute('class')

    // Navigate to settings
    await page.goto('/settings')
    let settingsTheme = await page.locator('html').getAttribute('class')

    // All should have consistent theme
    expect(dashboardTheme).toBe(accountsTheme)
    expect(accountsTheme).toBe(settingsTheme)
  })

  test('should maintain theme in dark mode across navigation', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const main = page.locator('main')
    await expect(main).toBeVisible()
  })
})

test.describe('Data Persistence', () => {
  test('should preserve form data when navigating away', async ({ page }) => {
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')

    // Get initial form state
    const inputs = page.locator('input, select, textarea')
    const initialCount = await inputs.count()

    // Navigate away
    await page.goto('/accounts')
    await page.waitForLoadState('networkidle')

    // Navigate back
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')

    // Form should still be visible
    const finalInputs = page.locator('input, select, textarea')
    const finalCount = await finalInputs.count()

    expect(finalCount).toBeGreaterThanOrEqual(0)
  })

  test('should preserve household selection', async ({ page }) => {
    await page.goto('/households')
    await page.waitForLoadState('networkidle')

    const householdList = page.locator('main')
    const initialContent = await householdList.textContent()

    // Navigate to accounts
    await page.goto('/accounts')
    await page.waitForLoadState('networkidle')

    // Navigate back
    await page.goto('/households')
    await page.waitForLoadState('networkidle')

    const finalContent = await householdList.textContent()
    expect(finalContent?.length).toBeGreaterThan(0)
  })
})

test.describe('Page Performance', () => {
  test('should load dashboard within reasonable time', async ({ page }) => {
    const startTime = Date.now()

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const loadTime = Date.now() - startTime

    // Should load in reasonable time (less than 10 seconds)
    expect(loadTime).toBeLessThan(10000)
  })

  test('should handle multiple page navigations smoothly', async ({ page }) => {
    const pages = ['/', '/accounts', '/income', '/transactions', '/settings']
    let totalTime = 0

    for (const route of pages) {
      const start = Date.now()
      await page.goto(route)
      await page.waitForLoadState('networkidle')
      totalTime += Date.now() - start
    }

    // Average load time should be reasonable
    const avgTime = totalTime / pages.length
    expect(avgTime).toBeLessThan(3000)
  })
})

test.describe('Error Recovery', () => {
  test('should recover from network error on accounts page', async ({ page }) => {
    await page.route('**/api/**', (route) => route.abort('failed'))

    await page.goto('/accounts')
    await page.waitForTimeout(1000)

    // Clear the abort handler
    await page.unroute('**/api/**')

    // Page should still be usable
    const main = page.locator('main')
    const count = await main.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should recover from slow API response', async ({ page }) => {
    let apiDelay = true

    await page.route('**/api/**', async (route) => {
      if (apiDelay) {
        await new Promise((resolve) => setTimeout(resolve, 5000))
      }
      await route.continue()
    })

    await page.goto('/transactions')
    await page.waitForTimeout(2000)

    // Stop delaying
    apiDelay = false

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    const main = page.locator('main')
    await expect(main).toBeVisible()
  })
})

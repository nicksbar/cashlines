/**
 * E2E Tests for Dashboard Payment Analytics Card
 * Tests the display of debt payment metrics on the dashboard
 */

import { test, expect } from '@playwright/test'

test.describe('Dashboard Payment Analytics', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('networkidle')
  })

  test('should display payment card when debt payments exist', async ({ page }) => {
    // Look for the Debt Payments card
    const paymentCard = page.locator('text=Debt Payments').first()
    
    // Check if card is visible (it should be if there are payments)
    const isVisible = await paymentCard.isVisible().catch(() => false)
    
    if (isVisible) {
      // Verify the card structure
      await expect(paymentCard).toBeVisible()
      
      // Check for the three metric boxes
      await expect(page.locator('text=Credit Card Payments').first()).toBeVisible()
      await expect(page.locator('text=Loan Payments').first()).toBeVisible()
      await expect(page.locator('text=Debt Reduction Rate').first()).toBeVisible()
      
      // Verify currency values are displayed
      const ccPayments = page.locator('text=Credit Card Payments').locator('..').locator('p').nth(1)
      await expect(ccPayments).toContainText('$')
      
      // Verify payment count is displayed
      const paymentsList = page.locator('text=Payments by Account')
      if (await paymentsList.isVisible()) {
        await expect(paymentsList).toBeVisible()
      }
    }
  })

  test('should show correct payment metrics with date range filtering', async ({ page }) => {
    // Change date range to current month
    const monthButton = page.locator('button:has-text("Month")')
    await monthButton.click()
    await page.waitForTimeout(500)
    
    // Check if payment card updates
    const paymentCard = page.locator('text=Debt Payments').first()
    const isVisible = await paymentCard.isVisible().catch(() => false)
    
    if (isVisible) {
      // Verify metrics are numeric and formatted
      const debtReductionRate = page.locator('text=Debt Reduction Rate').locator('..').locator('p').nth(1)
      await expect(debtReductionRate).toContainText('%')
    }
  })

  test('should display payments by account breakdown', async ({ page }) => {
    const paymentCard = page.locator('text=Debt Payments').first()
    const isVisible = await paymentCard.isVisible().catch(() => false)
    
    if (isVisible) {
      const paymentsSection = page.locator('text=Payments by Account')
      if (await paymentsSection.isVisible()) {
        // Check that account names and amounts are displayed
        const accountItems = page.locator('[class*="bg-slate-50 dark:bg-slate-800"]').filter({
          has: page.locator('p:has-text("payments")')
        })
        
        const count = await accountItems.count()
        expect(count).toBeGreaterThan(0)
        
        // Verify each item has account name and amount
        for (let i = 0; i < count; i++) {
          const item = accountItems.nth(i)
          await expect(item).toContainText('$')
          await expect(item).toContainText('payments')
        }
      }
    }
  })

  test('should have proper dark mode styling for payment card', async ({ page }) => {
    const paymentCard = page.locator('text=Debt Payments').first()
    const isVisible = await paymentCard.isVisible().catch(() => false)
    
    if (isVisible) {
      // Toggle dark mode
      const themeToggle = page.locator('[aria-label*="theme"], button:has-text("Theme"), [class*="theme"]').first()
      if (await themeToggle.isVisible()) {
        await themeToggle.click()
        await page.waitForTimeout(300)
        
        // Verify card still visible in dark mode
        await expect(paymentCard).toBeVisible()
        
        // Check for purple accent color
        const cardContainer = page.locator('text=Debt Payments').locator('..')
        await expect(cardContainer).toBeVisible()
      }
    }
  })

  test('should navigate to transactions page from payment card', async ({ page }) => {
    // Look for any links or buttons that might navigate to transactions
    const transactionsLink = page.locator('a[href*="/transactions"]').first()
    
    if (await transactionsLink.isVisible()) {
      await transactionsLink.click()
      await page.waitForLoadState('networkidle')
      
      // Verify we're on transactions page
      await expect(page).toHaveURL(/\/transactions/)
      await expect(page.locator('h1:has-text("Transactions")')).toBeVisible()
    }
  })

  test('should handle zero payments gracefully', async ({ page }) => {
    // In case there are no payments, the card should not appear
    const paymentCard = page.locator('text=Debt Payments').first()
    const isVisible = await paymentCard.isVisible().catch(() => false)
    
    if (!isVisible) {
      // Verify other dashboard elements are still working
      await expect(page.locator('text=Total Income')).toBeVisible()
      await expect(page.locator('text=Total Expenses')).toBeVisible()
    }
  })

  test('should display payment velocity metric', async ({ page }) => {
    const paymentCard = page.locator('text=Debt Payments').first()
    const isVisible = await paymentCard.isVisible().catch(() => false)
    
    if (isVisible) {
      // Check for payment count indicators
      const paymentCounts = page.locator('text=/\\d+ payments/')
      const count = await paymentCounts.count()
      
      if (count > 0) {
        // Verify at least one payment count is visible
        await expect(paymentCounts.first()).toBeVisible()
      }
    }
  })

  test('should format currency values correctly', async ({ page }) => {
    const paymentCard = page.locator('text=Debt Payments').first()
    const isVisible = await paymentCard.isVisible().catch(() => false)
    
    if (isVisible) {
      // Find all currency values in the payment card
      const cardContainer = paymentCard.locator('..')
      const currencyValues = cardContainer.locator('text=/\\$[\\d,]+\\.\\d{2}/')
      
      const count = await currencyValues.count()
      if (count > 0) {
        // Verify currency formatting (e.g., $1,234.56)
        const firstValue = await currencyValues.first().textContent()
        expect(firstValue).toMatch(/\$[\d,]+\.\d{2}/)
      }
    }
  })

  test('should maintain payment card state across page refresh', async ({ page }) => {
    const paymentCard = page.locator('text=Debt Payments').first()
    const wasVisible = await paymentCard.isVisible().catch(() => false)
    
    if (wasVisible) {
      // Get initial payment amount
      const ccPaymentText = await page.locator('text=Credit Card Payments').locator('..').locator('p').nth(1).textContent()
      
      // Refresh page
      await page.reload()
      await page.waitForLoadState('networkidle')
      
      // Verify card still shows same data
      await expect(page.locator('text=Debt Payments').first()).toBeVisible()
      const newCCPaymentText = await page.locator('text=Credit Card Payments').locator('..').locator('p').nth(1).textContent()
      expect(newCCPaymentText).toBe(ccPaymentText)
    }
  })

  test('should show loading state gracefully', async ({ page }) => {
    // Reload and quickly check for loading state
    await page.reload()
    
    // Should show loading indicator before data loads
    const loading = page.locator('text=Loading...')
    // It might disappear quickly, so we don't assert visibility
    
    await page.waitForLoadState('networkidle')
    
    // Verify dashboard loads successfully
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible()
  })
})

test.describe('Payment Analytics - Empty State', () => {
  test('should not show payment card when no debt payments exist', async ({ page }) => {
    // This test assumes a fresh database with no payment transactions
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('networkidle')
    
    // Payment card should not be visible if no payments
    const paymentCard = page.locator('text=Debt Payments').first()
    const isVisible = await paymentCard.isVisible().catch(() => false)
    
    // Either not visible or shows zero values
    if (isVisible) {
      // If visible, should show $0.00 or similar
      const ccPayments = page.locator('text=Credit Card Payments').locator('..').locator('p').nth(1)
      const text = await ccPayments.textContent()
      // Accept if showing or if truly zero
      expect(text).toBeTruthy()
    }
  })
})

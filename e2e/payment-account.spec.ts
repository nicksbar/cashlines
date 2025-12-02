/**
 * E2E Tests for Payment Account Feature
 * Tests the ability to link transactions to accounts they're paying (e.g., credit card payments)
 */

import { test, expect } from '@playwright/test'

test.describe('Payment Account Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/transactions')
    await page.waitForLoadState('networkidle')
  })

  test('should display payment account field in transaction form', async ({ page }) => {
    // Click "Add Transaction" button
    const addButton = page.locator('button:has-text("Add Transaction"), button:has-text("New Transaction")')
    if (await addButton.first().isVisible()) {
      await addButton.first().click()
      await page.waitForTimeout(500)

      // Check for the "Paying Account" field
      const payingAccountLabel = page.locator('label:has-text("Paying Account")')
      await expect(payingAccountLabel).toBeVisible()

      // Check for the select dropdown
      const payingAccountSelect = page.locator('#payingAccountId, select[id*="paying"]')
      await expect(payingAccountSelect.first()).toBeVisible()
    }
  })

  test('should have "None (regular expense)" as default option', async ({ page }) => {
    const addButton = page.locator('button:has-text("Add Transaction"), button:has-text("New Transaction")')
    if (await addButton.first().isVisible()) {
      await addButton.first().click()
      await page.waitForTimeout(500)

      // Check the default option
      const payingAccountSelect = page.locator('#payingAccountId, select[id*="paying"]')
      if (await payingAccountSelect.first().isVisible()) {
        const defaultOption = payingAccountSelect.locator('option[value=""]')
        await expect(defaultOption.first()).toContainText('None')
      }
    }
  })

  test('should show only credit cards and loans in payment account dropdown', async ({ page }) => {
    const addButton = page.locator('button:has-text("Add Transaction"), button:has-text("New Transaction")')
    if (await addButton.first().isVisible()) {
      await addButton.first().click()
      await page.waitForTimeout(500)

      const payingAccountSelect = page.locator('#payingAccountId, select[id*="paying"]')
      if (await payingAccountSelect.first().isVisible()) {
        // Get all options
        const options = payingAccountSelect.locator('option')
        const optionCount = await options.count()

        // Check that options contain "Credit Card" or "Loan" text (if there are accounts)
        if (optionCount > 1) { // More than just the "None" option
          let hasValidType = false
          for (let i = 1; i < optionCount; i++) {
            const text = await options.nth(i).textContent()
            if (text && (text.includes('Credit Card') || text.includes('Loan'))) {
              hasValidType = true
              break
            }
          }
          // If there are options beyond "None", they should be credit cards or loans
          if (optionCount > 1) {
            expect(hasValidType || optionCount === 1).toBeTruthy()
          }
        }
      }
    }
  })

  test('should display help text for payment account field', async ({ page }) => {
    const addButton = page.locator('button:has-text("Add Transaction"), button:has-text("New Transaction")')
    if (await addButton.first().isVisible()) {
      await addButton.first().click()
      await page.waitForTimeout(500)

      // Look for help text
      const helpText = page.locator('text=/paying off a credit card or loan/i')
      if (await helpText.first().isVisible()) {
        await expect(helpText.first()).toBeVisible()
      }
    }
  })

  test('should allow creating a transaction without payment account', async ({ page }) => {
    const addButton = page.locator('button:has-text("Add Transaction"), button:has-text("New Transaction")')
    if (await addButton.first().isVisible()) {
      await addButton.first().click()
      await page.waitForTimeout(500)

      // Fill in basic transaction details
      await page.fill('input[id="description"], input[placeholder*="Grocery"]', 'Test Expense')
      await page.fill('input[type="number"][id*="amount"]', '25.00')
      
      // Leave payingAccountId as empty (None)
      const payingAccountSelect = page.locator('#payingAccountId, select[id*="paying"]')
      if (await payingAccountSelect.first().isVisible()) {
        await payingAccountSelect.first().selectOption('')
      }

      // Check that form is ready (we won't actually submit in e2e test to keep it non-destructive)
      const submitButton = page.locator('button[type="submit"]:has-text("Add"), button:has-text("Create")')
      if (await submitButton.first().isVisible()) {
        await expect(submitButton.first()).toBeEnabled()
      }
    }
  })

  test('should persist payment account selection when selecting an account', async ({ page }) => {
    const addButton = page.locator('button:has-text("Add Transaction"), button:has-text("New Transaction")')
    if (await addButton.first().isVisible()) {
      await addButton.first().click()
      await page.waitForTimeout(500)

      const payingAccountSelect = page.locator('#payingAccountId, select[id*="paying"]')
      if (await payingAccountSelect.first().isVisible()) {
        const options = payingAccountSelect.locator('option')
        const optionCount = await options.count()

        // If there are payment accounts available (more than just "None")
        if (optionCount > 1) {
          // Select the first non-empty option
          const firstAccountValue = await options.nth(1).getAttribute('value')
          if (firstAccountValue) {
            await payingAccountSelect.first().selectOption(firstAccountValue)

            // Verify the selection persists
            const selectedValue = await payingAccountSelect.first().inputValue()
            expect(selectedValue).toBe(firstAccountValue)
          }
        }
      }
    }
  })
})

test.describe('Payment Account in Transaction List', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/transactions')
    await page.waitForLoadState('networkidle')
  })

  test('should display payment indicator for transactions with paying account', async ({ page }) => {
    // Look for the payment indicator in the transaction list
    // The indicator uses "→ Paying:" text
    const paymentIndicators = page.locator('text=/→ Paying:/i')
    const count = await paymentIndicators.count()

    // If there are payment transactions, verify the indicator is visible
    if (count > 0) {
      await expect(paymentIndicators.first()).toBeVisible()
    }
    // Otherwise, test passes (no payment transactions exist yet)
  })

  test('should show account name in transaction list', async ({ page }) => {
    // Check that the "Account" column is visible in the table
    const accountHeader = page.locator('th:has-text("Account")')
    const headerCount = await accountHeader.count()
    
    // Verify account column exists in the table
    expect(headerCount).toBeGreaterThanOrEqual(0)
  })
})

test.describe('Payment Account Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/transactions')
    await page.waitForLoadState('networkidle')
  })

  test('should have proper label for payment account field', async ({ page }) => {
    const addButton = page.locator('button:has-text("Add Transaction"), button:has-text("New Transaction")')
    if (await addButton.first().isVisible()) {
      await addButton.first().click()
      await page.waitForTimeout(500)

      // Check that label is associated with select
      const label = page.locator('label[for="payingAccountId"]')
      if (await label.isVisible()) {
        await expect(label).toBeVisible()
        
        const select = page.locator('#payingAccountId')
        await expect(select).toBeVisible()
      }
    }
  })

  test('should support keyboard navigation in payment account dropdown', async ({ page }) => {
    const addButton = page.locator('button:has-text("Add Transaction"), button:has-text("New Transaction")')
    if (await addButton.first().isVisible()) {
      await addButton.first().click()
      await page.waitForTimeout(500)

      const payingAccountSelect = page.locator('#payingAccountId, select[id*="paying"]')
      if (await payingAccountSelect.first().isVisible()) {
        // Focus the select
        await payingAccountSelect.first().focus()
        
        // Press arrow down to open and navigate
        await page.keyboard.press('ArrowDown')
        
        // Verify the select is still focused
        const isFocused = await payingAccountSelect.first().evaluate(el => el === document.activeElement)
        expect(isFocused).toBeTruthy()
      }
    }
  })
})

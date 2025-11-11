/**
 * Integration tests for common workflows
 * Tests realistic user scenarios across multiple components
 */

import {
  createMockIncome,
  createMockAccount,
  createMockTransaction,
  createMockSplit,
  testData,
  assertions,
} from './testUtils'
import {
  incomeCreateSchema,
  accountCreateSchema,
  transactionCreateSchema,
} from '@/lib/validation'
import {
  calculatePercentOf,
  sumAmounts,
  formatCurrency,
} from '@/lib/money'

describe('Income Tracking Workflows', () => {
  describe('Monthly income summary', () => {
    it('should aggregate monthly income correctly', () => {
      const monthlyIncome = testData.createMonthlyIncome(11, 2025, 3)
      
      const totalGross = sumAmounts(monthlyIncome.map((i) => i.grossAmount))
      const totalTaxes = sumAmounts(monthlyIncome.map((i) => i.taxes))
      const totalNet = sumAmounts(monthlyIncome.map((i) => i.netAmount))
      
      expect(totalGross).toBeGreaterThan(0)
      expect(totalTaxes).toBeGreaterThan(0)
      expect(totalNet).toBeGreaterThan(0)
      expect(totalNet).toBeLessThan(totalGross)
      
      // Verify all incomes are valid
      monthlyIncome.forEach((income) => {
        expect(assertions.isValidIncome(income)).toBe(true)
      })
    })

    it('should calculate effective tax rate', () => {
      const income = createMockIncome({
        grossAmount: 10000,
        taxes: 2000,
        preTaxDeductions: 1000,
        postTaxDeductions: 500,
        netAmount: 6500,
      })
      
      const taxRate = calculatePercentOf(income.taxes, income.grossAmount)
      expect(taxRate).toBe(20) // 2000/10000 = 20%
    })

    it('should calculate deduction breakdown', () => {
      const income = createMockIncome({
        grossAmount: 10000,
        taxes: 2000,
        preTaxDeductions: 1000,
        postTaxDeductions: 500,
        netAmount: 6500,
      })
      
      const totalDeductions = income.preTaxDeductions + income.postTaxDeductions
      const deductionPercent = calculatePercentOf(totalDeductions, income.grossAmount)
      
      expect(totalDeductions).toBe(1500)
      expect(deductionPercent).toBe(15)
    })
  })

  describe('Income source tracking', () => {
    it('should compare multiple income sources', () => {
      const salary = createMockIncome({
        source: 'Salary',
        grossAmount: 5000,
        taxes: 1200,
        netAmount: 3200,
      })
      
      const freelance = createMockIncome({
        source: 'Freelance',
        grossAmount: 2000,
        taxes: 300,
        netAmount: 1700,
      })
      
      const totalGross = salary.grossAmount + freelance.grossAmount
      const salaryPercent = calculatePercentOf(salary.grossAmount, totalGross)
      const freelancePercent = calculatePercentOf(freelance.grossAmount, totalGross)
      
      expect(salaryPercent).toBe(71.43) // ~71%
      expect(freelancePercent).toBe(28.57) // ~29%
    })

    it('should identify recurring vs irregular income', () => {
      const recurring = createMockIncome({ tags: '["recurring","salary"]' })
      const irregular = createMockIncome({ 
        source: 'Bonus',
        tags: '["irregular","bonus"]' 
      })
      
      const recurringTags = JSON.parse(recurring.tags)
      const irregularTags = JSON.parse(irregular.tags)
      
      expect(recurringTags).toContain('recurring')
      expect(irregularTags).toContain('irregular')
    })
  })

  describe('Account management workflow', () => {
    it('should validate account creation data', () => {
      const accountData = {
        name: 'Emergency Fund Savings',
        type: 'savings',
        notes: 'For emergency expenses',
      }
      
      const result = accountCreateSchema.safeParse(accountData)
      expect(result.success).toBe(true)
    })

    it('should create account set for complete setup', () => {
      const accounts = testData.createAccountSet()
      
      expect(accounts).toHaveLength(4)
      expect(accounts.map((a: any) => a.type)).toEqual([
        'checking',
        'savings',
        'credit_card',
        'cash',
      ])
      
      // All accounts should be valid before persistence
      accounts.forEach((account: any) => {
        expect(account.id).toBeDefined()
        expect(account.name).toBeDefined()
        expect(account.type).toBeDefined()
      })
    })
  })

  describe('Expense tracking workflow', () => {
    it('should validate transaction creation', () => {
      const transactionData = {
        date: new Date(),
        amount: 150.5,
        description: 'Weekly groceries',
        accountId: 'test-account-1',
        method: 'cc',
      }
      
      const result = transactionCreateSchema.safeParse(transactionData)
      expect(result.success).toBe(true)
    })

    it('should allocate transaction across categories', () => {
      const transaction = createMockTransaction({ amount: 1000 })
      const splits = testData.createSplitAllocation()
      
      // Simulate allocation
      const needs = (splits[0].percent! / 100) * transaction.amount // 50%
      const wants = (splits[1].percent! / 100) * transaction.amount // 30%
      const savings = (splits[2].percent! / 100) * transaction.amount // 20%
      
      expect(needs).toBe(500)
      expect(wants).toBe(300)
      expect(savings).toBe(200)
      expect(needs + wants + savings).toBe(1000)
    })

    it('should calculate expense ratios', () => {
      const income = createMockIncome({ netAmount: 3200 })
      const expenses = [
        createMockTransaction({ amount: 800 }),
        createMockTransaction({ amount: 600 }),
        createMockTransaction({ amount: 400 }),
      ]
      
      const totalExpenses = sumAmounts(expenses.map((e) => e.amount))
      const expenseRatio = calculatePercentOf(totalExpenses, income.netAmount)
      
      expect(totalExpenses).toBe(1800)
      expect(expenseRatio).toBeCloseTo(56.25, 1) // 1800/3200 ≈ 56%
    })
  })

  describe('Financial metrics calculation', () => {
    it('should calculate savings rate', () => {
      const income = createMockIncome({ netAmount: 3200 })
      const expenses = 1600
      const savings = income.netAmount - expenses
      const savingsRate = calculatePercentOf(savings, income.netAmount)
      
      expect(savings).toBe(1600)
      expect(savingsRate).toBe(50) // 50% savings rate
    })

    it('should calculate tax rate from gross income', () => {
      const income = createMockIncome({
        grossAmount: 10000,
        taxes: 2000,
      })
      
      const taxRate = calculatePercentOf(income.taxes, income.grossAmount)
      expect(taxRate).toBe(20)
    })

    it('should calculate take-home ratio', () => {
      const income = createMockIncome({
        grossAmount: 5000,
        taxes: 1200,
        preTaxDeductions: 400,
        postTaxDeductions: 200,
        netAmount: 3200,
      })
      
      const takeHomeRatio = calculatePercentOf(income.netAmount, income.grossAmount)
      expect(takeHomeRatio).toBe(64) // 64% take-home
    })
  })

  describe('Data validation across workflows', () => {
    it('should validate complete income entry', () => {
      const income = createMockIncome()
      
      expect(assertions.isValidIncome(income)).toBe(true)
      expect(income.grossAmount).toBeGreaterThan(0)
      expect(income.netAmount).toBeGreaterThan(0)
      expect(income.netAmount).toBeLessThan(income.grossAmount)
    })

    it('should validate account and transaction together', () => {
      const account = createMockAccount()
      const transaction = createMockTransaction({ accountId: account.id })
      
      // Transaction belongs to account
      expect(transaction.accountId).toBe(account.id)
      expect(account.type).toBe('checking')
    })

    it('should validate multi-month income data', () => {
      const months = [
        testData.createMonthlyIncome(10, 2025, 2),
        testData.createMonthlyIncome(11, 2025, 2),
      ]
      
      months.forEach((monthData) => {
        monthData.forEach((income) => {
          expect(assertions.isValidIncome(income)).toBe(true)
        })
      })
    })
  })

  describe('Formatting and display', () => {
    it('should format currency for display', () => {
      const amount = 1234.56
      const formatted = formatCurrency(amount)
      
      expect(formatted).toBe('$1,234.56')
    })

    it('should format monthly summary', () => {
      const income = testData.createMonthlyIncome(11, 2025, 2)
      const totalGross = sumAmounts(income.map((i) => i.grossAmount))
      const totalNet = sumAmounts(income.map((i) => i.netAmount))
      
      const grossDisplay = formatCurrency(totalGross)
      const netDisplay = formatCurrency(totalNet)
      
      expect(grossDisplay).toMatch(/^\$/)
      expect(netDisplay).toMatch(/^\$/)
    })

    it('should format percentage for display', () => {
      const income = createMockIncome({
        grossAmount: 10000,
        netAmount: 6400,
      })
      
      const ratio = calculatePercentOf(income.netAmount, income.grossAmount)
      expect(ratio).toBe(64)
      expect(`${ratio}%`).toBe('64%')
    })
  })
})

describe('Error handling and edge cases', () => {
  it('should handle small positive income', () => {
    const smallIncome = createMockIncome({ 
      grossAmount: 100,
      taxes: 10,
      preTaxDeductions: 0,
      postTaxDeductions: 0,
      netAmount: 90,
    })
    expect(smallIncome.grossAmount).toBeGreaterThan(0)
    expect(assertions.isValidIncome(smallIncome)).toBe(true)
  })

  it('should handle very large amounts', () => {
    const largeIncome = createMockIncome({ 
      grossAmount: 999999.99,
      netAmount: 699999.99,
    })
    const formatted = formatCurrency(largeIncome.grossAmount)
    expect(formatted).toMatch(/999,999\.99/)
  })

  it('should handle dates at month boundaries', () => {
    const firstDay = new Date(2025, 10, 1)
    const lastDay = new Date(2025, 10, 30)
    const monthStart = new Date(2025, 10, 1)
    const monthEnd = new Date(2025, 10, 31)
    
    expect(assertions.isDateInRange(firstDay, monthStart, monthEnd)).toBe(true)
    expect(assertions.isDateInRange(lastDay, monthStart, monthEnd)).toBe(true)
  })

  it('should handle split calculations with rounding', () => {
    const transaction = createMockTransaction({ amount: 100 })
    const splits = [
      createMockSplit({ id: '1', percent: 33.33, amount: null }),
      createMockSplit({ id: '2', percent: 33.33, amount: null }),
      createMockSplit({ id: '3', percent: 33.34, amount: null }),
    ]
    
    // Should sum to 100
    expect(assertions.isValidAllocation(transaction, splits)).toBe(true)
  })
})

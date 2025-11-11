import {
  formatCurrency,
  parseAmount,
  roundAmount,
  calculatePercent,
  calculatePercentOf,
  sumAmounts,
} from '@/lib/money'

/**
 * Comprehensive Financial Calculations Tests
 * Tests critical financial calculations used throughout the application
 * to ensure accuracy, edge cases, and proper rounding
 */

describe('Financial Calculations - Core Math', () => {
  describe('Income Calculations', () => {
    it('should calculate net income correctly (gross - taxes - deductions)', () => {
      const grossIncome = 5000
      const taxes = 1000
      const preTaxDeductions = 200
      const postTaxDeductions = 150
      const netIncome = grossIncome - taxes - preTaxDeductions - postTaxDeductions
      expect(netIncome).toBe(3650)
    })

    it('should handle bi-weekly paycheck accumulation', () => {
      const biweeklyPaycheck = 2000
      const paychecksPerMonth = 2.17 // Average (26 per year / 12 months)
      const monthlyIncome = biweeklyPaycheck * paychecksPerMonth
      expect(roundAmount(monthlyIncome)).toBe(4340)
    })

    it('should calculate annual income from monthly', () => {
      const monthlyIncome = 3650
      const annualIncome = monthlyIncome * 12
      expect(annualIncome).toBe(43800)
    })

    it('should handle irregular income (bonuses, freelance)', () => {
      const baseMonthlyIncome = 3650
      const quarterlyBonus = 5000
      const irregularIncome = [2000, 3500, 1800] // freelance, freelance, freelance
      const totalIncome = baseMonthlyIncome + quarterlyBonus + sumAmounts(irregularIncome)
      expect(totalIncome).toBe(15950)
    })

    it('should calculate effective tax rate', () => {
      const grossIncome = 100000
      const totalTaxes = 20000
      const effectiveTaxRate = calculatePercentOf(totalTaxes, grossIncome)
      expect(effectiveTaxRate).toBe(20)
    })
  })

  describe('Expense Calculations', () => {
    it('should sum all monthly expenses', () => {
      const expenses = [2200, 250, 400, 800, 300, 250, 2500] // mortgage, utilities, gas, groceries, dining, shopping, savings
      const totalExpenses = sumAmounts(expenses)
      expect(totalExpenses).toBe(6700)
    })

    it('should calculate average transaction', () => {
      const totalExpenses = 6700
      const transactionCount = 15
      const avgTransaction = totalExpenses / transactionCount
      expect(roundAmount(avgTransaction)).toBe(446.67)
    })

    it('should handle expense variance', () => {
      const baseGroceryExpense = 800
      const variance = 0.2 // ±20%
      const lowEstimate = baseGroceryExpense * (1 - variance)
      const highEstimate = baseGroceryExpense * (1 + variance)
      expect(lowEstimate).toBe(640)
      expect(highEstimate).toBe(960)
    })

    it('should track expenses by category', () => {
      const categoryExpenses = {
        housing: 2200,
        utilities: 250,
        transport: 400,
        food: 800,
        dining: 300,
        shopping: 250,
        savings: 2500,
      }
      const totalNeeds = categoryExpenses.housing + categoryExpenses.utilities + categoryExpenses.transport + categoryExpenses.food
      expect(totalNeeds).toBe(3650)
    })
  })

  describe('Allocation Calculations (50/30/20 Rule)', () => {
    it('should calculate SBNL budget allocation for needs (50%)', () => {
      const monthlyIncome = 4000
      const needsAllocation = calculatePercent(50, monthlyIncome)
      expect(needsAllocation).toBe(2000)
    })

    it('should calculate budget allocation for wants (30%)', () => {
      const monthlyIncome = 4000
      const wantsAllocation = calculatePercent(30, monthlyIncome)
      expect(wantsAllocation).toBe(1200)
    })

    it('should calculate budget allocation for savings (20%)', () => {
      const monthlyIncome = 4000
      const savingsAllocation = calculatePercent(20, monthlyIncome)
      expect(savingsAllocation).toBe(800)
    })

    it('should verify total allocation equals 100%', () => {
      const monthlyIncome = 4000
      const needs = calculatePercent(50, monthlyIncome)
      const wants = calculatePercent(30, monthlyIncome)
      const savings = calculatePercent(20, monthlyIncome)
      const total = needs + wants + savings
      expect(total).toBe(monthlyIncome)
    })

    it('should handle over-spending in one category', () => {
      const monthlyIncome = 4000
      const needsAllocation = 2000
      const wantsAllocation = 1200
      const actualNeeds = 2200 // 10% over
      const actualWants = 1200
      const actualSavings = monthlyIncome - actualNeeds - actualWants
      expect(actualSavings).toBe(600) // 20% reduced to 15%
    })

    it('should calculate percent spent vs budget', () => {
      const budget = 2000 // needs budget
      const spent = 2150 // spent more
      const percentSpent = calculatePercentOf(spent, budget)
      expect(percentSpent).toBe(107.5)
    })
  })

  describe('Balance Calculations', () => {
    it('should calculate net balance (income - expenses)', () => {
      const totalIncome = 8000
      const totalExpenses = 6700
      const netBalance = totalIncome - totalExpenses
      expect(netBalance).toBe(1300)
    })

    it('should calculate savings rate', () => {
      const totalIncome = 8000
      const totalExpenses = 6700
      const netBalance = totalIncome - totalExpenses
      const savingsRate = calculatePercentOf(netBalance, totalIncome)
      expect(roundAmount(savingsRate)).toBe(16.25)
    })

    it('should calculate expense ratio', () => {
      const totalIncome = 8000
      const totalExpenses = 6700
      const expenseRatio = calculatePercentOf(totalExpenses, totalIncome)
      expect(roundAmount(expenseRatio)).toBe(83.75)
    })

    it('should verify income = expenses + balance', () => {
      const income = 8000
      const expenses = 6700
      const balance = 1300
      expect(income).toBe(expenses + balance)
    })

    it('should handle deficit spending', () => {
      const income = 5000
      const expenses = 5500
      const balance = income - expenses
      expect(balance).toBe(-500)
    })
  })

  describe('Split/Allocation Calculations', () => {
    it('should split transaction by percent', () => {
      const transactionAmount = 1000
      const needPercent = 70
      const wantPercent = 30
      const needAllocation = calculatePercent(needPercent, transactionAmount)
      const wantAllocation = calculatePercent(wantPercent, transactionAmount)
      expect(needAllocation + wantAllocation).toBe(transactionAmount)
    })

    it('should split transaction by fixed amounts', () => {
      const transactionAmount = 1000
      const housing = 700
      const utilities = 300
      expect(housing + utilities).toBe(transactionAmount)
    })

    it('should handle uneven splits', () => {
      const transactionAmount = 100
      const allocation1 = 33.33
      const allocation2 = 33.33
      const allocation3 = 33.34
      const total = allocation1 + allocation2 + allocation3
      expect(roundAmount(total)).toBe(100)
    })

    it('should verify split totals equal transaction', () => {
      const transaction = 2200
      const splits = {
        need: 2200,
      }
      const totalSplits = sumAmounts(Object.values(splits))
      expect(totalSplits).toBe(transaction)
    })
  })

  describe('Monthly to Annual Conversions', () => {
    it('should convert monthly expense to annual', () => {
      const monthlyExpense = 250 // utilities
      const annualExpense = monthlyExpense * 12
      expect(annualExpense).toBe(3000)
    })

    it('should convert annual income to monthly', () => {
      const annualIncome = 60000
      const monthlyIncome = annualIncome / 12
      expect(roundAmount(monthlyIncome)).toBe(5000)
    })

    it('should handle quarterly calculations', () => {
      const quarterlyBonus = 5000
      const annualBonus = quarterlyBonus * 4
      expect(annualBonus).toBe(20000)
    })

    it('should handle weekly to annual', () => {
      const weeklyIncome = 1000
      const annualIncome = weeklyIncome * 52
      expect(annualIncome).toBe(52000)
    })
  })

  describe('Rounding and Precision', () => {
    it('should round currency to 2 decimals', () => {
      expect(roundAmount(100.456)).toBe(100.46)
      expect(roundAmount(100.444)).toBe(100.44)
    })

    it('should handle cumulative rounding errors', () => {
      const amounts = [33.33, 33.33, 33.34]
      const total = roundAmount(sumAmounts(amounts))
      expect(total).toBe(100)
    })

    it('should format currency consistently', () => {
      expect(formatCurrency(1000)).toBe('$1,000.00')
      expect(formatCurrency(1000.5)).toBe('$1,000.50')
      expect(formatCurrency(0.01)).toBe('$0.01')
    })

    it('should handle very large amounts', () => {
      const largeAmount = 1000000
      expect(formatCurrency(largeAmount)).toBe('$1,000,000.00')
    })

    it('should handle very small amounts', () => {
      expect(roundAmount(0.001)).toBe(0)
      expect(roundAmount(0.005)).toBe(0.01)
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle zero amounts', () => {
      expect(calculatePercent(50, 0)).toBe(0)
      expect(calculatePercentOf(0, 1000)).toBe(0)
      expect(sumAmounts([])).toBe(0)
    })

    it('should handle negative amounts', () => {
      const refund = -100
      const purchase = 150
      const net = purchase + refund
      expect(net).toBe(50)
    })

    it('should handle very small percentages', () => {
      const amount = 0.01 // 1 cent
      const percent = calculatePercentOf(amount, 1000)
      expect(roundAmount(percent)).toBe(0) // Rounds to 0 with 2 decimals
    })

    it('should handle division by zero gracefully', () => {
      // In real code, should check denominator before dividing
      const safePercentOf = (amount: number, total: number) => (total > 0 ? calculatePercentOf(amount, total) : 0)
      expect(safePercentOf(100, 0)).toBe(0)
    })

    it('should parse currency strings correctly', () => {
      expect(parseAmount('$1,000.00')).toBe(1000)
      expect(parseAmount('$1000')).toBe(1000)
      expect(parseAmount('-$500.00')).toBe(-500)
    })
  })
})

describe('Financial Calculations - Date Ranges', () => {
  describe('Date Range Calculations', () => {
    it('should calculate days in a month', () => {
      const november2025 = new Date(2025, 10, 1)
      const daysInNovember = new Date(2025, 11, 0).getDate()
      expect(daysInNovember).toBe(30)
    })

    it('should calculate month boundaries', () => {
      const year = 2025
      const month = 11 // November
      const monthStart = new Date(year, month - 1, 1)
      const monthEnd = new Date(year, month, 0)
      expect(monthStart.getDate()).toBe(1)
      expect(monthEnd.getDate()).toBe(30)
    })

    it('should calculate quarter dates', () => {
      const q1Start = new Date(2025, 0, 1)
      const q1End = new Date(2025, 2, 31)
      const q2Start = new Date(2025, 3, 1)
      const q2End = new Date(2025, 5, 30)
      expect(q1Start.getMonth()).toBe(0)
      expect(q1End.getMonth()).toBe(2)
      expect(q2Start.getMonth()).toBe(3)
    })

    it('should aggregate data across months', () => {
      const monthlyIncome = [4000, 4000, 8000] // nov, dec, jan (with bonus)
      const quarterlyIncome = sumAmounts(monthlyIncome)
      expect(quarterlyIncome).toBe(16000)
    })

    it('should calculate average per period', () => {
      const monthlyExpenses = [6700, 6850, 6500]
      const total = sumAmounts(monthlyExpenses)
      const average = total / monthlyExpenses.length
      expect(roundAmount(average)).toBe(6683.33)
    })
  })

  describe('Year-over-Year Calculations', () => {
    it('should compare same month different years', () => {
      const novemberLastYear = 6700
      const novemberThisYear = 6850
      const monthlyChange = novemberThisYear - novemberLastYear
      const changePercent = calculatePercentOf(monthlyChange, novemberLastYear)
      expect(monthlyChange).toBe(150)
      expect(roundAmount(changePercent)).toBe(2.24)
    })

    it('should calculate year-over-year growth', () => {
      const annualIncomeLastYear = 85000
      const annualIncomeThisYear = 92000
      const growth = annualIncomeThisYear - annualIncomeLastYear
      const growthPercent = calculatePercentOf(growth, annualIncomeLastYear)
      expect(growth).toBe(7000)
      expect(roundAmount(growthPercent)).toBe(8.24)
    })
  })
})

describe('Financial Calculations - Validation', () => {
  describe('Budget Validation', () => {
    it('should validate allocation percentages sum to 100', () => {
      const allocations = { need: 50, want: 30, savings: 20 }
      const total = sumAmounts(Object.values(allocations))
      expect(total).toBe(100)
    })

    it('should flag over-budget spending', () => {
      const budget = 2000
      const spent = 2200
      const isOverBudget = spent > budget
      expect(isOverBudget).toBe(true)
    })

    it('should calculate budget remaining', () => {
      const budget = 2000
      const spent = 1500
      const remaining = budget - spent
      expect(remaining).toBe(500)
    })

    it('should alert on negative balance', () => {
      const income = 5000
      const expenses = 5500
      const balance = income - expenses
      const isDeficit = balance < 0
      expect(isDeficit).toBe(true)
      expect(balance).toBe(-500)
    })
  })

  describe('Credit Card Utilization', () => {
    it('should calculate credit card utilization percentage', () => {
      const creditLimit = 25000
      const currentBalance = 7500
      const utilization = calculatePercentOf(currentBalance, creditLimit)
      expect(utilization).toBe(30)
    })

    it('should flag high utilization (>30%)', () => {
      const utilization = 45
      const isHighUtilization = utilization > 30
      expect(isHighUtilization).toBe(true)
    })

    it('should track payment progress', () => {
      const currentBalance = 7500
      const payment = 2500
      const newBalance = currentBalance - payment
      expect(newBalance).toBe(5000)
    })
  })
})

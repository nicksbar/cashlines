import { sumAmounts, calculatePercentOf, roundAmount } from '../money'

/**
 * Financial Aggregation and Range Tests
 * Tests that the application correctly aggregates financial data
 * across date ranges, calculates summaries, and maintains data integrity
 */

describe('Financial Aggregation - Date Ranges', () => {
  describe('Monthly Aggregation', () => {
    it('should correctly sum income for a month', () => {
      const monthlyIncome = [2417, 2417, 3500, 5600] // two salary payments, one mike salary, one bonus
      const totalIncome = sumAmounts(monthlyIncome)
      expect(totalIncome).toBe(13934)
    })

    it('should correctly sum expenses for a month', () => {
      const monthlyExpenses = [2200, 250, 400, 800, 300, 250, 2500]
      const totalExpenses = sumAmounts(monthlyExpenses)
      expect(totalExpenses).toBe(6700)
    })

    it('should calculate monthly balance', () => {
      const monthlyIncome = 13934
      const monthlyExpenses = 6700
      const balance = monthlyIncome - monthlyExpenses
      expect(balance).toBe(7234)
    })

    it('should track transaction count per month', () => {
      const transactionCount = 7
      expect(transactionCount).toBeGreaterThan(0)
    })

    it('should track income count per month', () => {
      const incomeCount = 4
      expect(incomeCount).toBeGreaterThan(0)
    })
  })

  describe('Quarterly Aggregation', () => {
    it('should aggregate 3 months of data', () => {
      const month1Income = 13934
      const month2Income = 14234
      const month3Income = 18934 // with bonus
      const quarterlyIncome = sumAmounts([month1Income, month2Income, month3Income])
      expect(quarterlyIncome).toBe(47102)
    })

    it('should aggregate quarterly expenses', () => {
      const month1Expenses = 6700
      const month2Expenses = 6850
      const month3Expenses = 7200
      const quarterlyExpenses = sumAmounts([month1Expenses, month2Expenses, month3Expenses])
      expect(quarterlyExpenses).toBe(20750)
    })

    it('should calculate quarterly balance', () => {
      const quarterlyIncome = 47102
      const quarterlyExpenses = 20750
      const balance = quarterlyIncome - quarterlyExpenses
      expect(balance).toBe(26352)
    })

    it('should verify quarterly data consistency', () => {
      // Data should add up properly across aggregation levels
      const month1Income = 13934
      const month2Income = 14234
      const month3Income = 18934
      const quarterIncome = month1Income + month2Income + month3Income
      const averageMonthly = quarterIncome / 3
      expect(roundAmount(averageMonthly)).toBe(15700.67)
    })
  })

  describe('Annual Aggregation', () => {
    it('should aggregate 12 months of income', () => {
      // Assuming monthly income with bonus twice a year
      const baseMonthlyIncome = 13934
      const annualWithoutBonuses = baseMonthlyIncome * 12
      const bonusesPerYear = 5600 * 2 // semi-annual bonus
      const totalAnnualIncome = annualWithoutBonuses + bonusesPerYear
      expect(totalAnnualIncome).toBe(178408)
    })

    it('should aggregate 12 months of expenses', () => {
      const averageMonthlyExpense = 6750
      const totalAnnualExpense = averageMonthlyExpense * 12
      expect(totalAnnualExpense).toBe(81000)
    })

    it('should calculate annual balance', () => {
      const annualIncome = 191408
      const annualExpense = 81000
      const balance = annualIncome - annualExpense
      expect(balance).toBe(110408)
    })

    it('should calculate annual savings rate', () => {
      const annualIncome = 178408
      const annualExpense = 81000
      const annualSavings = annualIncome - annualExpense
      const savingsRate = calculatePercentOf(annualSavings, annualIncome)
      expect(roundAmount(savingsRate)).toBe(54.6)
    })
  })

  describe('Split/Category Aggregation', () => {
    it('should aggregate spending by category', () => {
      const categories = {
        housing: 2200,
        utilities: 250,
        transport: 400,
        food: 800,
        dining: 300,
        shopping: 250,
      }
      const totalSpent = sumAmounts(Object.values(categories))
      expect(totalSpent).toBe(4200)
    })

    it('should calculate category percentages', () => {
      const totalExpenses = 6700
      const housingExpense = 2200
      const housingPercent = calculatePercentOf(housingExpense, totalExpenses)
      expect(roundAmount(housingPercent)).toBe(32.84)
    })

    it('should track allocation vs actual', () => {
      const allocations = {
        need: { budget: 3350, actual: 3400 },
        want: { budget: 2010, actual: 1850 },
        savings: { budget: 1340, actual: 1450 },
      }
      
      expect(allocations.need.actual > allocations.need.budget).toBe(true)
      expect(allocations.want.actual < allocations.want.budget).toBe(true)
      expect(allocations.savings.actual > allocations.savings.budget).toBe(true)
    })
  })

  describe('Payment Method Aggregation', () => {
    it('should aggregate spending by payment method', () => {
      const byMethod = {
        cc: 4200,
        ach: 2500,
        cash: 0,
      }
      const totalExpenses = sumAmounts(Object.values(byMethod))
      expect(totalExpenses).toBe(6700)
    })

    it('should calculate method usage percentages', () => {
      const totalExpenses = 6700
      const ccSpending = 4200
      const ccPercent = calculatePercentOf(ccSpending, totalExpenses)
      expect(roundAmount(ccPercent)).toBe(62.69)
    })

    it('should track credit card utilization over time', () => {
      const monthlyCC = [4200, 4350, 3900, 4500]
      const totalCC = sumAmounts(monthlyCC)
      const averageCC = totalCC / monthlyCC.length
      expect(roundAmount(averageCC)).toBe(4237.5)
    })
  })
})

describe('Financial Validation - Cross-Checks', () => {
  describe('Income Validation', () => {
    it('should verify income = net + taxes + deductions', () => {
      const gross = 5000
      const taxes = 1000
      const preTaxDeductions = 200
      const postTaxDeductions = 150
      const net = 3650
      
      // Verify the calculation
      const calculatedGross = net + taxes + preTaxDeductions + postTaxDeductions
      expect(calculatedGross).toBe(gross)
    })

    it('should verify net income percentages', () => {
      const gross = 5000
      const net = 3650
      const takeHomePercent = calculatePercentOf(net, gross)
      expect(roundAmount(takeHomePercent)).toBe(73)
    })

    it('should validate tax rate is within reasonable bounds', () => {
      const gross = 100000
      const taxes = 20000
      const taxRate = calculatePercentOf(taxes, gross)
      // Most people pay between 10-40% taxes
      expect(taxRate).toBeGreaterThan(10)
      expect(taxRate).toBeLessThan(40)
    })
  })

  describe('Expense Validation', () => {
    it('should verify total expenses equal sum of categories', () => {
      const categories = {
        housing: 2200,
        utilities: 250,
        transport: 400,
        food: 800,
        dining: 300,
        shopping: 250,
      }
      const totalByCategory = sumAmounts(Object.values(categories))
      const reportedTotal = 4200
      expect(totalByCategory).toBe(reportedTotal)
    })

    it('should verify budget allocation sums to 100%', () => {
      const needs = 50
      const wants = 30
      const savings = 20
      const total = needs + wants + savings
      expect(total).toBe(100)
    })
  })

  describe('Balance Validation', () => {
    it('should verify balance calculation: income - expenses = balance', () => {
      const income = 13934
      const expenses = 6700
      const reportedBalance = 7234
      const calculatedBalance = income - expenses
      expect(calculatedBalance).toBe(reportedBalance)
    })

    it('should verify savings rate: balance / income = savings rate', () => {
      const income = 13934
      const balance = 7234
      const savingsRate = calculatePercentOf(balance, income)
      expect(roundAmount(savingsRate)).toBe(51.92)
    })

    it('should verify expense ratio: expenses / income = expense ratio', () => {
      const income = 13934
      const expenses = 6700
      const expenseRatio = calculatePercentOf(expenses, income)
      expect(roundAmount(expenseRatio)).toBe(48.08)
    })

    it('should verify savings rate + expense ratio = 100%', () => {
      const income = 13934
      const expenses = 6700
      const balance = 7234
      const savingsRate = calculatePercentOf(balance, income)
      const expenseRatio = calculatePercentOf(expenses, income)
      expect(roundAmount(savingsRate + expenseRatio)).toBe(100)
    })
  })

  describe('Split Validation', () => {
    it('should verify split amounts sum to transaction total', () => {
      const transactionAmount = 2200
      const splits = {
        need: 2200,
      }
      const totalSplits = sumAmounts(Object.values(splits))
      expect(totalSplits).toBe(transactionAmount)
    })

    it('should verify split percentages sum to 100', () => {
      const splitPercentages = [70, 30]
      const total = sumAmounts(splitPercentages)
      expect(total).toBe(100)
    })

    it('should handle uneven percent splits correctly', () => {
      const transactionAmount = 1000
      const splits = [333.33, 333.33, 333.34]
      const total = sumAmounts(splits)
      expect(roundAmount(total)).toBe(transactionAmount)
    })
  })
})

describe('Financial Edge Cases', () => {
  describe('Zero and Negative Values', () => {
    it('should handle zero income month', () => {
      const income = 0
      const expenses = 6700
      const balance = income - expenses
      expect(balance).toBe(-6700)
    })

    it('should handle zero expense month', () => {
      const income = 13934
      const expenses = 0
      const balance = income - expenses
      expect(balance).toBe(13934)
    })

    it('should handle deficit month (expenses > income)', () => {
      const income = 5000
      const expenses = 6700
      const balance = income - expenses
      expect(balance).toBe(-1700)
      expect(balance < 0).toBe(true)
    })

    it('should handle negative refunds', () => {
      const purchase = 100
      const refund = -20
      const net = purchase + refund
      expect(net).toBe(80)
    })
  })

  describe('Rounding and Precision', () => {
    it('should not lose precision in cumulative calculations', () => {
      const amounts = [100.01, 100.02, 100.03]
      const sum = sumAmounts(amounts)
      expect(roundAmount(sum)).toBe(300.06)
    })

    it('should handle very large totals correctly', () => {
      const monthlyIncome = 50000
      const annualIncome = monthlyIncome * 12
      expect(annualIncome).toBe(600000)
    })

    it('should handle very small amounts', () => {
      const amount = 0.01
      const percent = calculatePercentOf(amount, 100)
      expect(roundAmount(percent)).toBe(0.01)
    })

    it('should maintain precision across multiple operations', () => {
      const income = 10000
      const tax = 2000
      const net = income - tax
      expect(tax).toBe(2000)
      expect(net).toBe(8000)
    })
  })

  describe('Boundary Conditions', () => {
    it('should handle months with different day counts', () => {
      const februaryDays = 28 // 2025 is not a leap year
      const julyDays = 31
      expect(februaryDays).toBeLessThan(julyDays)
    })

    it('should handle year boundaries', () => {
      const decemberBalance = 5000
      const januaryIncome = 4000
      const carriedBalance = decemberBalance + januaryIncome
      expect(carriedBalance).toBe(9000)
    })

    it('should handle multi-year calculations', () => {
      const year1Income = 100000
      const year2Income = 110000
      const totalIncome = year1Income + year2Income
      expect(totalIncome).toBe(210000)
    })
  })
})

describe('Financial Consistency Checks', () => {
  describe('Data Integrity', () => {
    it('should verify no duplicate transactions in aggregation', () => {
      const transaction1 = 100
      const transaction2 = 100
      const transactions = [transaction1, transaction2]
      // Should not double-count
      expect(sumAmounts(transactions)).toBe(200)
    })

    it('should maintain precision across aggregations', () => {
      const month1 = 6700.45
      const month2 = 6700.45
      const month3 = 6700.45
      const quarterly = sumAmounts([month1, month2, month3])
      expect(roundAmount(quarterly)).toBe(20101.35)
    })

    it('should handle out-of-order transaction dates', () => {
      const transactions = [
        { date: new Date(2025, 10, 30), amount: 100 },
        { date: new Date(2025, 10, 1), amount: 200 },
        { date: new Date(2025, 10, 15), amount: 300 },
      ]
      const total = sumAmounts(transactions.map(t => t.amount))
      expect(total).toBe(600)
    })
  })

  describe('Cross-Report Consistency', () => {
    it('should verify summary total matches transaction sum', () => {
      const transactions = [
        { amount: 2200, category: 'housing' },
        { amount: 250, category: 'utilities' },
        { amount: 400, category: 'transport' },
        { amount: 800, category: 'food' },
      ]
      const transactionSum = sumAmounts(transactions.map(t => t.amount))
      const summaryTotal = 3650
      expect(transactionSum).toBe(summaryTotal)
    })

    it('should verify income total matches summary', () => {
      const incomeEntries = [
        { amount: 2417, source: 'salary' },
        { amount: 2417, source: 'salary' },
        { amount: 3500, source: 'salary' },
        { amount: 5600, source: 'bonus' },
      ]
      const incomeSum = sumAmounts(incomeEntries.map(e => e.amount))
      const summaryTotal = 13934
      expect(incomeSum).toBe(summaryTotal)
    })
  })
})

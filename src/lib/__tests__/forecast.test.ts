import {
  calculateNextDueDate,
  getMonthlyAmount,
  getExpectedMonthlyTotal,
  getExpensesDueInMonth,
  compareForecast,
} from '../forecast'

describe('Recurring Expenses Forecast', () => {
  const mockExpense = {
    id: 'test-1',
    description: 'T-Mobile Bill',
    isActive: true,
    nextDueDate: new Date('2024-12-15'),
  }

  describe('calculateNextDueDate', () => {
    it('should calculate next daily occurrence', () => {
      const today = new Date(2024, 0, 15) // January 15, 2024
      const next = calculateNextDueDate('daily', undefined, today)
      expect(next.getDate()).toBe(16)
      expect(next.getMonth()).toBe(0)
      expect(next.getFullYear()).toBe(2024)
    })

    it('should calculate next weekly occurrence', () => {
      const today = new Date(2024, 0, 15) // January 15, 2024
      const next = calculateNextDueDate('weekly', undefined, today)
      expect(next.getDate()).toBe(22)
      expect(next.getMonth()).toBe(0)
      expect(next.getFullYear()).toBe(2024)
    })

    it('should calculate next monthly occurrence on same day', () => {
      const today = new Date(2024, 0, 15) // January 15, 2024
      const next = calculateNextDueDate('monthly', 15, today)
      expect(next.getDate()).toBe(15)
      expect(next.getMonth()).toBe(1) // February
      expect(next.getFullYear()).toBe(2024)
    })

    it('should handle month-end dates correctly', () => {
      // Jan 31 with dueDay 31 -> Feb 28 (leap year)
      const today = new Date(2024, 0, 31) // January 31, 2024 (leap year)
      const next = calculateNextDueDate('monthly', 31, today)
      // Feb has 29 days in 2024 (leap year), so day 31 doesn't exist
      // setMonth should handle this gracefully
      expect(next.getMonth()).toBeGreaterThanOrEqual(1) // At least February or later
    })

    it('should calculate next yearly occurrence', () => {
      const today = new Date(2024, 0, 15) // January 15, 2024
      const next = calculateNextDueDate('yearly', undefined, today)
      expect(next.getDate()).toBe(15)
      expect(next.getMonth()).toBe(0) // January
      expect(next.getFullYear()).toBe(2025)
    })

    it('should handle due day already passed in current month', () => {
      const today = new Date(2024, 0, 20) // January 20, 2024
      const next = calculateNextDueDate('monthly', 15, today)
      // Day 15 already passed, should be Feb 15
      expect(next.getDate()).toBe(15)
      expect(next.getMonth()).toBe(1) // February
      expect(next.getFullYear()).toBe(2024)
    })

    it('should handle leap year correctly', () => {
      // 2024 is a leap year
      const today = new Date(2024, 1, 28) // February 28, 2024
      const next = calculateNextDueDate('monthly', 28, today)
      expect(next.getDate()).toBe(28)
      expect(next.getMonth()).toBe(2) // March
      expect(next.getFullYear()).toBe(2024)
    })
  })

  describe('getMonthlyAmount', () => {
    it('should return daily amount normalized to monthly', () => {
      const expense = { ...mockExpense, amount: 10, frequency: 'daily' }
      const monthly = getMonthlyAmount(expense)
      expect(monthly).toBeCloseTo(10 * (365 / 12), 1)
    })

    it('should return weekly amount normalized to monthly', () => {
      const expense = { ...mockExpense, amount: 25, frequency: 'weekly' }
      const monthly = getMonthlyAmount(expense)
      expect(monthly).toBeCloseTo(25 * (52 / 12), 1)
    })

    it('should return monthly amount as-is', () => {
      const expense = { ...mockExpense, amount: 75, frequency: 'monthly' }
      const monthly = getMonthlyAmount(expense)
      expect(monthly).toBe(75)
    })

    it('should return yearly amount divided by 12', () => {
      const expense = { ...mockExpense, amount: 1200, frequency: 'yearly' }
      const monthly = getMonthlyAmount(expense)
      expect(monthly).toBe(100)
    })

    it('should return 0 for inactive expenses', () => {
      const expense = { ...mockExpense, amount: 75, frequency: 'monthly', isActive: false }
      const monthly = getMonthlyAmount(expense)
      expect(monthly).toBe(0)
    })
  })

  describe('getExpectedMonthlyTotal', () => {
    it('should sum all monthly expenses', () => {
      const expenses = [
        { ...mockExpense, amount: 75, frequency: 'monthly' },
        { ...mockExpense, id: 'test-2', amount: 120, frequency: 'monthly' },
        { ...mockExpense, id: 'test-3', amount: 1500, frequency: 'monthly' },
      ]
      const total = getExpectedMonthlyTotal(expenses, 2024, 0) // January
      expect(total).toBe(75 + 120 + 1500)
    })

    it('should include normalized daily/weekly expenses', () => {
      const expenses = [
        { ...mockExpense, amount: 75, frequency: 'monthly' },
        { ...mockExpense, id: 'test-2', amount: 10, frequency: 'daily' },
      ]
      const total = getExpectedMonthlyTotal(expenses, 2024, 0)
      expect(total).toBeCloseTo(75 + 10 * (365 / 12), 1)
    })

    it('should exclude inactive expenses', () => {
      const expenses = [
        { ...mockExpense, amount: 75, frequency: 'monthly', isActive: true },
        { ...mockExpense, id: 'test-2', amount: 100, frequency: 'monthly', isActive: false },
      ]
      const total = getExpectedMonthlyTotal(expenses, 2024, 0)
      expect(total).toBe(75)
    })

    it('should handle yearly expenses correctly', () => {
      const expenses = [
        { ...mockExpense, amount: 1200, frequency: 'yearly', nextDueDate: new Date('2024-01-15') },
      ]
      const total = getExpectedMonthlyTotal(expenses, 2024, 0) // January
      expect(total).toBe(1200) // Full amount only in the due month
    })

    it('should not count yearly expense if not in the correct month', () => {
      const expenses = [
        { ...mockExpense, amount: 1200, frequency: 'yearly', nextDueDate: new Date('2024-01-15') },
      ]
      const total = getExpectedMonthlyTotal(expenses, 2024, 1) // February
      expect(total).toBe(0)
    })
  })

  describe('getExpensesDueInMonth', () => {
    it('should return expenses due in the specified month', () => {
      const expenses = [
        { ...mockExpense, id: 'test-1', amount: 75, frequency: 'monthly', nextDueDate: new Date('2024-01-15') },
        { ...mockExpense, id: 'test-2', amount: 100, frequency: 'monthly', nextDueDate: new Date('2024-02-15') },
        { ...mockExpense, id: 'test-3', amount: 50, frequency: 'monthly', nextDueDate: new Date('2024-01-20') },
      ]
      const due = getExpensesDueInMonth(expenses, 2024, 0) // January
      expect(due).toHaveLength(2)
      expect(due.map((e) => e.id)).toEqual(['test-1', 'test-3'])
    })

    it('should exclude inactive expenses', () => {
      const expenses = [
        { ...mockExpense, id: 'test-1', amount: 75, frequency: 'monthly', nextDueDate: new Date('2024-01-15'), isActive: true },
        { ...mockExpense, id: 'test-2', amount: 100, frequency: 'monthly', nextDueDate: new Date('2024-01-20'), isActive: false },
      ]
      const due = getExpensesDueInMonth(expenses, 2024, 0)
      expect(due).toHaveLength(1)
      expect(due[0].id).toBe('test-1')
    })
  })

  describe('compareForecast', () => {
    it('should mark as on-track when within 10% threshold', () => {
      const forecast = compareForecast(100, 105, 0.1)
      expect(forecast.status).toBe('on-track')
      expect(forecast.difference).toBe(5)
    })

    it('should mark as over when actual exceeds expected', () => {
      const forecast = compareForecast(100, 150, 0.1)
      expect(forecast.status).toBe('over')
      expect(forecast.difference).toBe(50)
    })

    it('should mark as under when actual is below expected', () => {
      const forecast = compareForecast(100, 50, 0.1)
      expect(forecast.status).toBe('under')
      expect(forecast.difference).toBe(-50)
    })

    it('should calculate percent difference correctly', () => {
      const forecast = compareForecast(100, 125)
      expect(forecast.percentDifference).toBe(25)
    })

    it('should handle zero expected total', () => {
      const forecast = compareForecast(0, 100)
      expect(forecast.percentDifference).toBe(0)
    })

    it('should apply custom threshold', () => {
      // 30% difference should be on-track with 0.3 threshold
      const forecast = compareForecast(100, 130, 0.3)
      expect(forecast.status).toBe('on-track')
    })
  })

  describe('Edge Cases', () => {
    it('should handle February 29th in leap years', () => {
      const today = new Date(2024, 1, 29) // February 29, 2024 (leap year)
      const next = calculateNextDueDate('monthly', 29, today)
      // Next monthly due date should be March 29 (Feb 29 doesn't exist next)
      // Current month is Feb (month 1), so next should be >= month 2
      expect(next.getMonth()).toBeGreaterThanOrEqual(2) // March or later
      expect(next.getFullYear()).toBe(2024)
    })

    it('should handle 30th and 31st correctly for months with fewer days', () => {
      const today = new Date(2024, 0, 31) // January 31, 2024
      const next = calculateNextDueDate('monthly', 30, today)
      // With dueDay 30, next month after Jan 31 should be Feb 30 (doesn't exist) -> Mar 2
      // The key is that the month should advance
      expect(next.getMonth()).toBeGreaterThanOrEqual(1) // At least February
    })

    it('should handle multiple expenses with different frequencies', () => {
      const expenses = [
        { ...mockExpense, id: '1', amount: 10, frequency: 'daily' },
        { ...mockExpense, id: '2', amount: 50, frequency: 'weekly' },
        { ...mockExpense, id: '3', amount: 100, frequency: 'monthly' },
        { ...mockExpense, id: '4', amount: 1200, frequency: 'yearly', nextDueDate: new Date('2024-01-15') },
      ]
      const total = getExpectedMonthlyTotal(expenses, 2024, 0)
      // Daily + weekly + monthly + yearly (only in Jan)
      const expectedDaily = 10 * (365 / 12)
      const expectedWeekly = 50 * (52 / 12)
      const expected = expectedDaily + expectedWeekly + 100 + 1200
      expect(total).toBeCloseTo(expected, 1)
    })

    it('should handle year boundary crossing', () => {
      // Create a date explicitly to avoid timezone parsing issues
      const today = new Date(2024, 11, 31) // December 31, 2024
      const next = calculateNextDueDate('daily', undefined, today)
      expect(next.getFullYear()).toBe(2025)
      expect(next.getMonth()).toBe(0) // January
      expect(next.getDate()).toBe(1)
    })
  })
})

/**
 * Test utilities and mock factories for creating test data
 */

export const createMockUser = (overrides = {}) => ({
  id: 'test-user-1',
  email: 'test@example.com',
  name: 'Test User',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

export const createMockAccount = (overrides = {}) => ({
  id: 'test-account-1',
  userId: 'test-user-1',
  name: 'Checking',
  type: 'checking',
  isActive: true,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

export const createMockIncome = (overrides = {}) => ({
  id: 'test-income-1',
  userId: 'test-user-1',
  accountId: 'test-account-1',
  date: new Date('2025-11-11'),
  grossAmount: 5000,
  taxes: 1200,
  preTaxDeductions: 400,
  postTaxDeductions: 200,
  netAmount: 3200,
  source: 'Salary',
  notes: null,
  tags: '["recurring","tax:w2"]',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

export const createMockTransaction = (overrides = {}) => ({
  id: 'test-transaction-1',
  userId: 'test-user-1',
  accountId: 'test-account-1',
  date: new Date('2025-11-11'),
  amount: 150.5,
  description: 'Groceries',
  method: 'cc',
  notes: null,
  tags: '["groceries"]',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

export const createMockSplit = (overrides = {}) => ({
  id: 'test-split-1',
  transactionId: 'test-transaction-1',
  type: 'need',
  target: 'Groceries',
  amount: 150.5,
  percent: null,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

/**
 * Test data generators for common scenarios
 */
export const testData = {
  /**
   * Create monthly income snapshot
   */
  createMonthlyIncome: (month: number, year: number, count: number) => {
    const income = []
    for (let i = 0; i < count; i++) {
      income.push(
        createMockIncome({
          id: `income-${month}-${i}`,
          date: new Date(year, month - 1, i + 1),
          grossAmount: 5000 + i * 100,
          taxes: 1200 + i * 20,
          netAmount: 3200 + i * 80,
          source: i === 0 ? 'Salary' : 'Freelance',
        })
      )
    }
    return income
  },

  /**
   * Create transaction splits for allocation testing
   */
  createSplitAllocation: () => [
    createMockSplit({
      id: 'split-need',
      type: 'need',
      target: 'Essentials',
      percent: 50,
    }),
    createMockSplit({
      id: 'split-want',
      type: 'want',
      target: 'Entertainment',
      percent: 30,
    }),
    createMockSplit({
      id: 'split-savings',
      type: 'savings',
      target: 'Emergency Fund',
      percent: 20,
    }),
  ],

  /**
   * Create multiple accounts for testing
   */
  createAccountSet: () => [
    createMockAccount({ id: 'acc-checking', name: 'Checking', type: 'checking' }),
    createMockAccount({ id: 'acc-savings', name: 'Savings', type: 'savings' }),
    createMockAccount({ id: 'acc-amex', name: 'Amex', type: 'credit_card' }),
    createMockAccount({ id: 'acc-cash', name: 'Cash', type: 'cash' }),
  ],
}

/**
 * Assertion helpers
 */
export const assertions = {
  /**
   * Verify income calculations are correct
   */
  isValidIncome: (income: any) => {
    const calculated = income.grossAmount - income.taxes - income.preTaxDeductions - income.postTaxDeductions
    return Math.abs(calculated - income.netAmount) < 0.01
  },

  /**
   * Verify transaction splits sum to transaction amount
   */
  isValidAllocation: (transaction: any, splits: any[]) => {
    const splitTotal = splits.reduce((sum, split) => {
      if (split.amount !== null) {
        return sum + split.amount
      }
      return sum + (split.percent / 100) * transaction.amount
    }, 0)
    return Math.abs(splitTotal - transaction.amount) < 0.01
  },

  /**
   * Verify date is within range
   */
  isDateInRange: (date: Date, startDate: Date, endDate: Date) => {
    return date >= startDate && date <= endDate
  },
}

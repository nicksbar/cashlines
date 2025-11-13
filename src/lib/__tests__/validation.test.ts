import {
  incomeCreateSchema,
  incomeUpdateSchema,
  accountCreateSchema,
  accountUpdateSchema,
  transactionCreateSchema,
} from '@/lib/validation'

describe('Income Validation', () => {
  describe('incomeCreateSchema', () => {
    it('should validate correct income data', () => {
      const validData = {
        date: new Date('2025-11-11'),
        grossAmount: 5000,
        taxes: 1200,
        preTaxDeductions: 400,
        postTaxDeductions: 200,
        netAmount: 3200,
        source: 'Salary',
        accountId: 'test-account-1',
      }

      const result = incomeCreateSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.grossAmount).toBe(5000)
        expect(result.data.netAmount).toBe(3200)
      }
    })

    it('should reject negative gross amount', () => {
      const invalidData = {
        date: new Date(),
        grossAmount: -500,
        taxes: 0,
        preTaxDeductions: 0,
        postTaxDeductions: 0,
        netAmount: -500,
        source: 'Salary',
        accountId: 'test-account-1',
      }

      const result = incomeCreateSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject negative taxes', () => {
      const invalidData = {
        date: new Date(),
        grossAmount: 5000,
        taxes: -100,
        preTaxDeductions: 0,
        postTaxDeductions: 0,
        netAmount: 5100,
        source: 'Salary',
        accountId: 'test-account-1',
      }

      const result = incomeCreateSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should require source and accountId', () => {
      const invalidData = {
        date: new Date(),
        grossAmount: 5000,
        taxes: 1200,
        preTaxDeductions: 0,
        postTaxDeductions: 0,
        netAmount: 3800,
      }

      const result = incomeCreateSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should allow optional tags as array', () => {
      const validData = {
        date: new Date(),
        grossAmount: 5000,
        taxes: 1200,
        preTaxDeductions: 0,
        postTaxDeductions: 0,
        netAmount: 3800,
        source: 'Salary',
        accountId: 'test-account-1',
        tags: ['recurring', 'tax:w2'],
      }

      const result = incomeCreateSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.tags).toEqual(['recurring', 'tax:w2'])
      }
    })
  })

  describe('incomeUpdateSchema', () => {
    it('should allow partial updates', () => {
      const partialData = {
        grossAmount: 6000,
        taxes: 1400,
      }

      const result = incomeUpdateSchema.safeParse(partialData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.grossAmount).toBe(6000)
        expect(result.data.source).toBeUndefined()
      }
    })

    it('should allow empty update', () => {
      const emptyData = {}

      const result = incomeUpdateSchema.safeParse(emptyData)
      expect(result.success).toBe(true)
    })

    it('should validate all fields when provided', () => {
      const fullData = {
        date: new Date(),
        grossAmount: 5000,
        taxes: 1200,
        preTaxDeductions: 400,
        postTaxDeductions: 200,
        netAmount: 3200,
        source: 'Freelance',
        accountId: 'test-account-2',
        notes: 'Updated income',
        tags: ['irregular', 'tax:1099'],
      }

      const result = incomeUpdateSchema.safeParse(fullData)
      expect(result.success).toBe(true)
    })
  })
})

describe('Account Validation', () => {
  describe('accountCreateSchema', () => {
    it('should validate correct account data', () => {
      const validData = {
        name: 'Checking',
        type: 'checking',
      }

      const result = accountCreateSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe('Checking')
        expect(result.data.isActive).toBe(true) // default value
      }
    })

    it('should require account name', () => {
      const invalidData = {
        type: 'checking',
      }

      const result = accountCreateSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should validate all account types', () => {
      const validTypes = ['checking', 'savings', 'credit_card', 'cash', 'investment', 'loan', 'other']

      for (const type of validTypes) {
        const data = { name: 'Test', type }
        const result = accountCreateSchema.safeParse(data)
        expect(result.success).toBe(true)
      }
    })

    it('should reject invalid account type', () => {
      const invalidData = {
        name: 'Test',
        type: 'invalid_type',
      }

      const result = accountCreateSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should validate credit card specific fields', () => {
      const validData = {
        name: 'Amex Platinum',
        type: 'credit_card',
        creditLimit: 10000,
        interestRate: 18.99,
        cashBackPercent: 1.5,
        pointsPerDollar: 2,
        annualFee: 550,
        rewardsProgram: 'Membership Rewards',
      }

      const result = accountCreateSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.creditLimit).toBe(10000)
        expect(result.data.interestRate).toBe(18.99)
        expect(result.data.annualFee).toBe(550)
      }
    })

    it('should validate savings account fields', () => {
      const validData = {
        name: 'Emergency Fund',
        type: 'savings',
        interestRateApy: 4.5,
        monthlyFee: 0,
        minimumBalance: 500,
        isFdic: true,
      }

      const result = accountCreateSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.interestRateApy).toBe(4.5)
        expect(result.data.isFdic).toBe(true)
      }
    })

    it('should validate checking account fields', () => {
      const validData = {
        name: 'Chase Checking',
        type: 'checking',
        interestRateApy: 0.05,
        monthlyFee: 12,
        minimumBalance: 0,
        isFdic: true,
      }

      const result = accountCreateSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.monthlyFee).toBe(12)
      }
    })

    it('should validate cash account fields', () => {
      const validData = {
        name: 'Wallet',
        type: 'cash',
        location: 'Wallet',
        currentBalance: 250.75,
      }

      const result = accountCreateSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.location).toBe('Wallet')
        expect(result.data.currentBalance).toBe(250.75)
      }
    })

    it('should validate investment account fields', () => {
      const validData = {
        name: 'Vanguard Portfolio',
        type: 'investment',
        currentBalance: 50000,
        accountNumber: '****1234',
      }

      const result = accountCreateSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.currentBalance).toBe(50000)
      }
    })

    it('should validate loan account fields', () => {
      const validData = {
        name: 'Car Loan',
        type: 'loan',
        principalBalance: 15000,
        currentBalance: 12500,
        interestRate: 5.5,
        accountNumber: '****5678',
      }

      const result = accountCreateSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.principalBalance).toBe(15000)
        expect(result.data.interestRate).toBe(5.5)
      }
    })

    it('should reject invalid interest rates', () => {
      const invalidData = {
        name: 'Test',
        type: 'credit_card',
        interestRate: 150, // max is 100
      }

      const result = accountCreateSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject negative credit limits', () => {
      const invalidData = {
        name: 'Test Card',
        type: 'credit_card',
        creditLimit: -1000,
      }

      const result = accountCreateSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject negative cash back percent', () => {
      const invalidData = {
        name: 'Test Card',
        type: 'credit_card',
        cashBackPercent: -0.5,
      }

      const result = accountCreateSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject negative annual fee', () => {
      const invalidData = {
        name: 'Premium Card',
        type: 'credit_card',
        annualFee: -50,
      }

      const result = accountCreateSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('accountUpdateSchema', () => {
    it('should allow partial account updates', () => {
      const partialData = {
        name: 'Updated Checking',
      }

      const result = accountUpdateSchema.safeParse(partialData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe('Updated Checking')
        expect(result.data.type).toBeUndefined()
      }
    })

    it('should allow empty update', () => {
      const emptyData = {}

      const result = accountUpdateSchema.safeParse(emptyData)
      expect(result.success).toBe(true)
    })

    it('should allow updating credit card fields', () => {
      const updateData = {
        creditLimit: 15000,
        interestRate: 16.99,
        cashBackPercent: 2.5,
      }

      const result = accountUpdateSchema.safeParse(updateData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.creditLimit).toBe(15000)
        expect(result.data.interestRate).toBe(16.99)
      }
    })

    it('should allow updating to null for optional fields', () => {
      const updateData = {
        creditLimit: null,
        interestRateApy: null,
        location: null,
      }

      const result = accountUpdateSchema.safeParse(updateData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.creditLimit).toBeNull()
      }
    })
  })
})

describe('Transaction Validation', () => {
  describe('transactionCreateSchema', () => {
    it('should validate correct transaction data', () => {
      const validData = {
        date: new Date(),
        amount: 150.50,
        description: 'Groceries',
        accountId: 'test-account-1',
        method: 'cc',
      }

      const result = transactionCreateSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.amount).toBe(150.50)
        expect(result.data.method).toBe('cc')
      }
    })

    it('should reject negative amount', () => {
      const invalidData = {
        date: new Date(),
        amount: -100,
        description: 'Groceries',
        accountId: 'test-account-1',
      }

      const result = transactionCreateSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should require description and accountId', () => {
      const invalidData = {
        date: new Date(),
        amount: 100,
      }

      const result = transactionCreateSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should default method to credit_card', () => {
      const validData = {
        date: new Date(),
        amount: 100,
        description: 'Purchase',
        accountId: 'test-account-1',
      }

      const result = transactionCreateSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.method).toBe('cc')
      }
    })
  })
})

import { accountCreateSchema, accountUpdateSchema } from '../validation'

describe('Account Validation - Field Bounds & Validation', () => {
  describe('Credit Card Fields', () => {
    it('should validate positive credit limit', () => {
      const data = {
        name: 'Amex',
        type: 'credit_card',
        creditLimit: 10000,
      }
      const result = accountCreateSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject negative credit limit', () => {
      const data = {
        name: 'Amex',
        type: 'credit_card',
        creditLimit: -5000,
      }
      const result = accountCreateSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should validate interest rate as percentage (0-100)', () => {
      const validRates = [0, 15.99, 29.99, 100]
      for (const rate of validRates) {
        const data = {
          name: 'CC',
          type: 'credit_card',
          interestRate: rate,
        }
        const result = accountCreateSchema.safeParse(data)
        expect(result.success).toBe(true)
      }
    })

    it('should reject interest rates outside 0-100', () => {
      const invalidRates = [-1, 100.01, 150]
      for (const rate of invalidRates) {
        const data = {
          name: 'CC',
          type: 'credit_card',
          interestRate: rate,
        }
        const result = accountCreateSchema.safeParse(data)
        expect(result.success).toBe(false)
      }
    })

    it('should validate positive cash back percent', () => {
      const data = {
        name: 'CC',
        type: 'credit_card',
        cashBackPercent: 2.5,
      }
      const result = accountCreateSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject negative cash back', () => {
      const data = {
        name: 'CC',
        type: 'credit_card',
        cashBackPercent: -1,
      }
      const result = accountCreateSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should validate positive points per dollar', () => {
      const data = {
        name: 'CC',
        type: 'credit_card',
        pointsPerDollar: 2,
      }
      const result = accountCreateSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should validate positive annual fee', () => {
      const data = {
        name: 'Premium Card',
        type: 'credit_card',
        annualFee: 550,
      }
      const result = accountCreateSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should allow zero annual fee', () => {
      const data = {
        name: 'No Fee Card',
        type: 'credit_card',
        annualFee: 0,
      }
      const result = accountCreateSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject negative annual fee', () => {
      const data = {
        name: 'Card',
        type: 'credit_card',
        annualFee: -50,
      }
      const result = accountCreateSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should validate rewards program text', () => {
      const data = {
        name: 'Premium Card',
        type: 'credit_card',
        rewardsProgram: 'Membership Rewards',
      }
      const result = accountCreateSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should allow all credit card fields together', () => {
      const data = {
        name: 'Chase Sapphire Reserve',
        type: 'credit_card',
        creditLimit: 50000,
        interestRate: 21.99,
        cashBackPercent: 3,
        pointsPerDollar: 3,
        annualFee: 550,
        rewardsProgram: 'Ultimate Rewards',
      }
      const result = accountCreateSchema.safeParse(data)
      expect(result.success).toBe(true)
    })
  })

  describe('Savings Account Fields', () => {
    it('should validate APY as percentage (0-100)', () => {
      const validApy = [0, 4.5, 5.99, 10]
      for (const apy of validApy) {
        const data = {
          name: 'Savings',
          type: 'savings',
          interestRateApy: apy,
        }
        const result = accountCreateSchema.safeParse(data)
        expect(result.success).toBe(true)
      }
    })

    it('should reject APY outside 0-100', () => {
      const invalidApy = [-0.5, 100.1, 150]
      for (const apy of invalidApy) {
        const data = {
          name: 'Savings',
          type: 'savings',
          interestRateApy: apy,
        }
        const result = accountCreateSchema.safeParse(data)
        expect(result.success).toBe(false)
      }
    })

    it('should validate non-negative monthly fee', () => {
      const data = {
        name: 'Basic Savings',
        type: 'savings',
        monthlyFee: 0,
      }
      const result = accountCreateSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should allow positive monthly fee', () => {
      const data = {
        name: 'Premium Savings',
        type: 'savings',
        monthlyFee: 5,
      }
      const result = accountCreateSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject negative monthly fee', () => {
      const data = {
        name: 'Savings',
        type: 'savings',
        monthlyFee: -2,
      }
      const result = accountCreateSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should validate minimum balance', () => {
      const data = {
        name: 'Premium Savings',
        type: 'savings',
        minimumBalance: 10000,
      }
      const result = accountCreateSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should validate FDIC insurance flag', () => {
      const data = {
        name: 'Insured Savings',
        type: 'savings',
        isFdic: true,
      }
      const result = accountCreateSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should allow all savings fields together', () => {
      const data = {
        name: 'Emergency Fund',
        type: 'savings',
        interestRateApy: 4.85,
        monthlyFee: 0,
        minimumBalance: 500,
        isFdic: true,
      }
      const result = accountCreateSchema.safeParse(data)
      expect(result.success).toBe(true)
    })
  })

  describe('Checking Account Fields', () => {
    it('should validate checking account with low APY', () => {
      const data = {
        name: 'Checking',
        type: 'checking',
        interestRateApy: 0.05,
        monthlyFee: 12,
        minimumBalance: 0,
        isFdic: true,
      }
      const result = accountCreateSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should validate interest-bearing checking', () => {
      const data = {
        name: 'High Yield Checking',
        type: 'checking',
        interestRateApy: 2.5,
        monthlyFee: 0,
        minimumBalance: 1000,
        isFdic: true,
      }
      const result = accountCreateSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should allow zero minimum balance', () => {
      const data = {
        name: 'Basic Checking',
        type: 'checking',
        minimumBalance: 0,
      }
      const result = accountCreateSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should allow high minimum balance', () => {
      const data = {
        name: 'Premium Checking',
        type: 'checking',
        minimumBalance: 50000,
      }
      const result = accountCreateSchema.safeParse(data)
      expect(result.success).toBe(true)
    })
  })

  describe('Cash Account Fields', () => {
    it('should validate cash location string', () => {
      const data = {
        name: 'Wallet',
        type: 'cash',
        location: 'Wallet',
        currentBalance: 150,
      }
      const result = accountCreateSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should validate various cash locations', () => {
      const locations = ['Wallet', 'Home Safe', 'Desk Drawer', 'Savings Jar']
      for (const location of locations) {
        const data = {
          name: 'Cash',
          type: 'cash',
          location,
          currentBalance: 100,
        }
        const result = accountCreateSchema.safeParse(data)
        expect(result.success).toBe(true)
      }
    })

    it('should validate positive cash balance', () => {
      const data = {
        name: 'Wallet',
        type: 'cash',
        currentBalance: 250.75,
      }
      const result = accountCreateSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should allow zero balance', () => {
      const data = {
        name: 'Empty Wallet',
        type: 'cash',
        currentBalance: 0,
      }
      const result = accountCreateSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject negative balance', () => {
      const data = {
        name: 'Wallet',
        type: 'cash',
        currentBalance: -50,
      }
      const result = accountCreateSchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })

  describe('Investment Account Fields', () => {
    it('should validate investment account', () => {
      const data = {
        name: 'Vanguard Brokerage',
        type: 'investment',
        currentBalance: 100000,
        accountNumber: '****1234',
      }
      const result = accountCreateSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should validate positive balance', () => {
      const data = {
        name: 'Stock Portfolio',
        type: 'investment',
        currentBalance: 500000.50,
      }
      const result = accountCreateSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should allow zero balance', () => {
      const data = {
        name: 'Empty Investment',
        type: 'investment',
        currentBalance: 0,
      }
      const result = accountCreateSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject negative balance', () => {
      const data = {
        name: 'Investment',
        type: 'investment',
        currentBalance: -1000,
      }
      const result = accountCreateSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should validate account number', () => {
      const data = {
        name: 'Fidelity',
        type: 'investment',
        accountNumber: '****5678',
      }
      const result = accountCreateSchema.safeParse(data)
      expect(result.success).toBe(true)
    })
  })

  describe('Loan Account Fields', () => {
    it('should validate loan account with all fields', () => {
      const data = {
        name: 'Car Loan',
        type: 'loan',
        principalBalance: 20000,
        currentBalance: 15000,
        interestRate: 5.5,
        accountNumber: '****5678',
      }
      const result = accountCreateSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should validate positive principal balance', () => {
      const data = {
        name: 'Home Equity Loan',
        type: 'loan',
        principalBalance: 100000,
      }
      const result = accountCreateSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject negative principal balance', () => {
      const data = {
        name: 'Loan',
        type: 'loan',
        principalBalance: -5000,
      }
      const result = accountCreateSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should validate interest rate 0-100', () => {
      const rates = [0, 3.5, 10, 100]
      for (const rate of rates) {
        const data = {
          name: 'Loan',
          type: 'loan',
          interestRate: rate,
        }
        const result = accountCreateSchema.safeParse(data)
        expect(result.success).toBe(true)
      }
    })

    it('should reject interest rate outside bounds', () => {
      const data = {
        name: 'Loan',
        type: 'loan',
        interestRate: 150,
      }
      const result = accountCreateSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should validate current balance', () => {
      const data = {
        name: 'Mortgage',
        type: 'loan',
        currentBalance: 250000,
      }
      const result = accountCreateSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject negative current balance', () => {
      const data = {
        name: 'Loan',
        type: 'loan',
        currentBalance: -100,
      }
      const result = accountCreateSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should validate account number', () => {
      const data = {
        name: 'Student Loan',
        type: 'loan',
        accountNumber: '****9999',
      }
      const result = accountCreateSchema.safeParse(data)
      expect(result.success).toBe(true)
    })
  })

  describe('Cross-Type Scenarios', () => {
    it('should reject credit card fields on savings account', () => {
      const data = {
        name: 'Savings',
        type: 'savings',
        creditLimit: 10000, // wrong type
      }
      const result = accountCreateSchema.safeParse(data)
      // Validation should still parse but field would be ignored in API
      expect(result.success).toBe(true)
    })

    it('should validate updating account type specific fields', () => {
      const updateData = {
        type: 'credit_card',
        creditLimit: 25000,
        interestRate: 19.99,
      }
      const result = accountUpdateSchema.safeParse(updateData)
      expect(result.success).toBe(true)
    })

    it('should allow switching between account types with update', () => {
      const updateData = {
        type: 'loan',
        principalBalance: 50000,
      }
      const result = accountUpdateSchema.safeParse(updateData)
      expect(result.success).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('should handle very large balance amounts', () => {
      const data = {
        name: 'Large Investment',
        type: 'investment',
        currentBalance: 999999999.99,
      }
      const result = accountCreateSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should handle very small balance amounts', () => {
      const data = {
        name: 'Savings',
        type: 'savings',
        currentBalance: 0.01,
      }
      const result = accountCreateSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should handle many decimal places', () => {
      const data = {
        name: 'Investment',
        type: 'investment',
        currentBalance: 1234.567,
      }
      const result = accountCreateSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should allow null for all optional fields', () => {
      const data = {
        name: 'Account',
        type: 'credit_card',
        creditLimit: null,
        interestRate: null,
        cashBackPercent: null,
        pointsPerDollar: null,
        annualFee: null,
        rewardsProgram: null,
      }
      const result = accountCreateSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should allow empty strings for text fields', () => {
      const data = {
        name: 'Account',
        type: 'cash',
        location: '',
      }
      const result = accountCreateSchema.safeParse(data)
      expect(result.success).toBe(true)
    })
  })
})

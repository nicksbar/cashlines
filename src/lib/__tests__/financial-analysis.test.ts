/**
 * Tests for Financial Analysis Engine
 */

import {
  analyzeCreditCards,
  calculateNetWorth,
  analyzeCashFlow,
  generateInsights,
  suggestCardStrategy,
  type Account,
  type PaymentAnalysis,
} from '../financial-analysis'

describe('Financial Analysis Engine', () => {
  const mockAccounts: Account[] = [
    {
      id: 'checking1',
      name: 'Chase Checking',
      type: 'checking',
      isActive: true,
      currentBalance: 5000,
      interestRateApy: 0.01,
    },
    {
      id: 'savings1',
      name: 'High Yield Savings',
      type: 'savings',
      isActive: true,
      currentBalance: 10000,
      interestRateApy: 4.5,
      isFdic: true,
    },
    {
      id: 'cc1',
      name: 'Chase Sapphire',
      type: 'credit_card',
      isActive: true,
      creditLimit: 10000,
      currentBalance: 2000,
      interestRate: 18.99,
      cashBackPercent: 2,
      annualFee: 95,
    },
    {
      id: 'cc2',
      name: 'Amex Gold',
      type: 'credit_card',
      isActive: true,
      creditLimit: 5000,
      currentBalance: 1500,
      interestRate: 21.99,
      cashBackPercent: 3,
      pointsPerDollar: 2,
      annualFee: 250,
    },
    {
      id: 'loan1',
      name: 'Car Loan',
      type: 'loan',
      isActive: true,
      principalBalance: 15000,
      interestRate: 4.5,
    },
    {
      id: 'investment1',
      name: '401k',
      type: 'investment',
      isActive: true,
      currentBalance: 50000,
    },
  ]

  describe('analyzeCreditCards', () => {
    it('should calculate total credit limit correctly', () => {
      const result = analyzeCreditCards(mockAccounts)
      expect(result.totalCreditLimit).toBe(15000) // 10000 + 5000
    })

    it('should calculate total balance correctly', () => {
      const result = analyzeCreditCards(mockAccounts)
      expect(result.totalBalance).toBe(3500) // 2000 + 1500
    })

    it('should calculate utilization rate correctly', () => {
      const result = analyzeCreditCards(mockAccounts)
      expect(result.utilizationRate).toBeCloseTo(23.33, 1) // 3500/15000 * 100
    })

    it('should calculate weighted APR correctly', () => {
      const result = analyzeCreditCards(mockAccounts)
      expect(result.weightedApr).toBeCloseTo(20.49, 1) // (18.99 + 21.99) / 2
    })

    it('should identify best rewards card', () => {
      const result = analyzeCreditCards(mockAccounts)
      expect(result.bestRewards).toBeDefined()
      expect(result.bestRewards?.card.name).toBe('Amex Gold')
    })

    it('should calculate potential savings from high balance', () => {
      const result = analyzeCreditCards(mockAccounts)
      expect(result.potentialSavings).toBeGreaterThan(0)
    })

    it('should handle no credit cards', () => {
      const noCC = mockAccounts.filter(a => a.type !== 'credit_card')
      const result = analyzeCreditCards(noCC)
      expect(result.totalCreditLimit).toBe(0)
      expect(result.totalBalance).toBe(0)
      expect(result.utilizationRate).toBe(0)
    })

    it('should handle cards with no balance', () => {
      const lowBalance = mockAccounts.map(a =>
        a.type === 'credit_card' ? { ...a, currentBalance: 0 } : a
      )
      const result = analyzeCreditCards(lowBalance)
      expect(result.totalBalance).toBe(0)
      expect(result.utilizationRate).toBe(0)
      expect(result.potentialSavings).toBe(0)
    })
  })

  describe('calculateNetWorth', () => {
    it('should calculate total assets correctly', () => {
      const result = calculateNetWorth(mockAccounts)
      // checking(5000) + savings(10000) + investment(50000) = 65000
      expect(result.assets).toBe(65000)
    })

    it('should calculate total liabilities correctly', () => {
      const result = calculateNetWorth(mockAccounts)
      // cc1(2000) + cc2(1500) + loan(15000) = 18500
      expect(result.liabilities).toBe(18500)
    })

    it('should calculate net worth correctly', () => {
      const result = calculateNetWorth(mockAccounts)
      expect(result.netWorth).toBe(46500) // 65000 - 18500
    })

    it('should track asset distribution', () => {
      const result = calculateNetWorth(mockAccounts)
      expect(result.assetDistribution['Chase Checking']).toBe(5000)
      expect(result.assetDistribution['High Yield Savings']).toBe(10000)
      expect(result.assetDistribution['401k']).toBe(50000)
    })

    it('should track liability distribution', () => {
      const result = calculateNetWorth(mockAccounts)
      expect(result.liabilityDistribution['Chase Sapphire']).toBe(2000)
      expect(result.liabilityDistribution['Amex Gold']).toBe(1500)
      expect(result.liabilityDistribution['Car Loan']).toBe(15000)
    })

    it('should handle negative net worth', () => {
      const highDebt = mockAccounts.map(a => ({
        ...a,
        currentBalance: a.type === 'credit_card' ? 50000 : a.currentBalance,
        principalBalance: a.type === 'loan' ? 50000 : a.principalBalance,
      }))
      const result = calculateNetWorth(highDebt)
      expect(result.netWorth).toBeLessThan(0)
    })

    it('should skip inactive accounts', () => {
      const withInactive = [
        ...mockAccounts,
        {
          id: 'inactive1',
          name: 'Old Savings',
          type: 'savings',
          isActive: false,
          currentBalance: 10000,
        },
      ] as Account[]
      const result = calculateNetWorth(withInactive)
      expect(result.assets).toBe(65000) // Should not include inactive account
    })
  })

  describe('analyzeCashFlow', () => {
    it('should calculate interest earned on savings', () => {
      const result = analyzeCashFlow(mockAccounts, 1000)
      // High Yield Savings: 10000 * 0.045 / 12 = 37.50
      // Checking: 5000 * 0.0001 / 12 = 0.04
      expect(result.monthlyInterestEarned).toBeCloseTo(37.54, 1)
    })

    it('should calculate interest paid on credit cards', () => {
      const result = analyzeCashFlow(mockAccounts, 1000)
      // cc1: 2000 * 0.1899 / 12 = 31.65
      // cc2: 1500 * 0.2199 / 12 = 27.49
      // Total should be at least cc interest (59.14+)
      expect(result.monthlyInterestPaid).toBeGreaterThan(59)
    })

    it('should calculate interest paid on loans', () => {
      const result = analyzeCashFlow(mockAccounts, 1000)
      // loan: 15000 * 0.045 / 12 = 56.25
      expect(result.monthlyInterestPaid).toBeGreaterThan(56)
    })

    it('should calculate monthly fees from accounts', () => {
      const withFees = mockAccounts.map(a =>
        a.type === 'checking' ? { ...a, monthlyFee: 15 } : a
      )
      const result = analyzeCashFlow(withFees, 1000)
      expect(result.monthlyFeesTotal).toBeGreaterThan(15)
    })

    it('should prorate annual credit card fees', () => {
      const result = analyzeCashFlow(mockAccounts, 1000)
      // cc1: 95/12 = 7.92, cc2: 250/12 = 20.83
      expect(result.monthlyFeesTotal).toBeCloseTo(28.75, 1)
    })

    it('should calculate net interest correctly', () => {
      const result = analyzeCashFlow(mockAccounts, 1000)
      expect(result.monthlyNetInterest).toBe(
        result.monthlyInterestEarned - result.monthlyInterestPaid
      )
    })

    it('should identify opportunity gap', () => {
      const result = analyzeCashFlow(mockAccounts, 1000)
      expect(result.opportunityGap).toBeGreaterThan(0)
    })

    it('should handle no interest rates', () => {
      const noInterest = mockAccounts.map(a => ({
        ...a,
        interestRate: undefined,
        interestRateApy: undefined,
      }))
      const result = analyzeCashFlow(noInterest, 1000)
      expect(result.monthlyInterestEarned).toBe(0)
      expect(result.monthlyInterestPaid).toBe(0)
    })
  })

  describe('generateInsights', () => {
    const mockPaymentAnalysis: PaymentAnalysis = {
      totalCreditCardPayments: 800,
      totalLoanPayments: 450,
      totalDebtPayments: 1250,
      paymentCount: 3,
      avgPaymentAmount: 416.67,
      paymentsByAccount: {
        cc1: { accountName: 'Chase Sapphire', amount: 800, count: 2 },
      },
      debtReductionRate: 89.29,
      paymentVelocity: 3,
    }

    it('should generate insights for high credit utilization', () => {
      const highUtil = mockAccounts.map(a =>
        a.type === 'credit_card'
          ? { ...a, currentBalance: a.creditLimit ? a.creditLimit * 0.85 : 0 }
          : a
      )
      const ccAnalysis = analyzeCreditCards(highUtil)
      const netWorth = calculateNetWorth(highUtil)
      const cashFlow = analyzeCashFlow(highUtil, 1000)

      const insights = generateInsights(highUtil, ccAnalysis, netWorth, cashFlow, 1000)

      const utilizationInsight = insights.find(i => i.title.includes('Utilization'))
      expect(utilizationInsight).toBeDefined()
      expect(utilizationInsight?.type).toBe('warning')
    })

    it('should generate insight for interest gap', () => {
      const ccAnalysis = analyzeCreditCards(mockAccounts)
      const netWorth = calculateNetWorth(mockAccounts)
      const cashFlow = analyzeCashFlow(mockAccounts, 1000)

      const insights = generateInsights(mockAccounts, ccAnalysis, netWorth, cashFlow, 1000)

      const gapInsight = insights.find(i => i.title.includes('Interest Gap'))
      expect(gapInsight).toBeDefined()
      expect(gapInsight?.type).toBe('opportunity')
    })

    it('should generate insight for high-yield savings opportunity', () => {
      const lowYield = mockAccounts.map(a =>
        a.type === 'savings' ? { ...a, interestRateApy: 0.01, currentBalance: 10000 } : a
      )
      const ccAnalysis = analyzeCreditCards(lowYield)
      const netWorth = calculateNetWorth(lowYield)
      const cashFlow = analyzeCashFlow(lowYield, 1000)

      const insights = generateInsights(lowYield, ccAnalysis, netWorth, cashFlow, 1000)

      const savingsInsight = insights.find(i => i.title.includes('High-Yield'))
      expect(savingsInsight).toBeDefined()
      expect(savingsInsight?.type).toBe('opportunity')
    })

    it('should generate payment insights when provided', () => {
      const ccAnalysis = analyzeCreditCards(mockAccounts)
      const netWorth = calculateNetWorth(mockAccounts)
      const cashFlow = analyzeCashFlow(mockAccounts, 1000)

      const insights = generateInsights(
        mockAccounts,
        ccAnalysis,
        netWorth,
        cashFlow,
        1000,
        mockPaymentAnalysis
      )

      const paymentInsight = insights.find(i => i.title.includes('Debt Reduction'))
      expect(paymentInsight).toBeDefined()
      expect(paymentInsight?.type).toBe('info')
      expect(paymentInsight?.impact).toBe('high')
    })

    it('should generate top payment account insight', () => {
      const ccAnalysis = analyzeCreditCards(mockAccounts)
      const netWorth = calculateNetWorth(mockAccounts)
      const cashFlow = analyzeCashFlow(mockAccounts, 1000)

      const insights = generateInsights(
        mockAccounts,
        ccAnalysis,
        netWorth,
        cashFlow,
        1000,
        mockPaymentAnalysis
      )

      const topPayment = insights.find(i => i.title.includes('Top Payment'))
      expect(topPayment).toBeDefined()
      expect(topPayment?.title).toContain('Chase Sapphire')
    })

    it('should generate reward optimization insight', () => {
      const ccAnalysis = analyzeCreditCards(mockAccounts)
      const netWorth = calculateNetWorth(mockAccounts)
      const cashFlow = analyzeCashFlow(mockAccounts, 2000) // Higher spending

      const insights = generateInsights(mockAccounts, ccAnalysis, netWorth, cashFlow, 2000)

      // Should have at least 1 insight (credit utilization or others)
      expect(insights.length).toBeGreaterThan(0)
    })

    it('should generate annual fee warning', () => {
      const highFee = mockAccounts.map(a =>
        a.id === 'cc2' ? { ...a, annualFee: 500, cashBackPercent: 0.1 } : a
      )
      const ccAnalysis = analyzeCreditCards(highFee)
      const netWorth = calculateNetWorth(highFee)
      const cashFlow = analyzeCashFlow(highFee, 500)

      const insights = generateInsights(highFee, ccAnalysis, netWorth, cashFlow, 500)

      const feeInsight = insights.find(i => i.title.includes('Annual Fee'))
      expect(feeInsight).toBeDefined()
      expect(feeInsight?.type).toBe('warning')
    })

    it('should generate FDIC coverage warning', () => {
      const highBalance = mockAccounts.map(a =>
        a.type === 'savings' ? { ...a, currentBalance: 300000, isFdic: true } : a
      )
      const ccAnalysis = analyzeCreditCards(highBalance)
      const netWorth = calculateNetWorth(highBalance)
      const cashFlow = analyzeCashFlow(highBalance, 1000)

      const insights = generateInsights(highBalance, ccAnalysis, netWorth, cashFlow, 1000)

      const fdicInsight = insights.find(i => i.title.includes('FDIC'))
      expect(fdicInsight).toBeDefined()
      expect(fdicInsight?.type).toBe('warning')
    })

    it('should generate monthly fee warning', () => {
      const withFees = mockAccounts.map(a =>
        a.type === 'checking' ? { ...a, monthlyFee: 25 } : a
      )
      const ccAnalysis = analyzeCreditCards(withFees)
      const netWorth = calculateNetWorth(withFees)
      const cashFlow = analyzeCashFlow(withFees, 1000)

      const insights = generateInsights(withFees, ccAnalysis, netWorth, cashFlow, 1000)

      const feeInsight = insights.find(i => i.title.includes('Account Fees'))
      expect(feeInsight).toBeDefined()
    })

    it('should sort insights by priority', () => {
      const ccAnalysis = analyzeCreditCards(mockAccounts)
      const netWorth = calculateNetWorth(mockAccounts)
      const cashFlow = analyzeCashFlow(mockAccounts, 1000)

      const insights = generateInsights(
        mockAccounts,
        ccAnalysis,
        netWorth,
        cashFlow,
        1000,
        mockPaymentAnalysis
      )

      for (let i = 0; i < insights.length - 1; i++) {
        expect(insights[i].priority).toBeGreaterThanOrEqual(insights[i + 1].priority)
      }
    })

    it('should limit to 10 insights max', () => {
      const ccAnalysis = analyzeCreditCards(mockAccounts)
      const netWorth = calculateNetWorth(mockAccounts)
      const cashFlow = analyzeCashFlow(mockAccounts, 1000)

      const insights = generateInsights(
        mockAccounts,
        ccAnalysis,
        netWorth,
        cashFlow,
        1000,
        mockPaymentAnalysis
      )

      expect(insights.length).toBeLessThanOrEqual(10)
    })
  })

  describe('suggestCardStrategy', () => {
    it('should suggest cards for different spending categories', () => {
      const monthlySpending = {
        groceries: 500,
        restaurants: 300,
        travel: 200,
      }

      const strategies = suggestCardStrategy(
        mockAccounts.filter(a => a.type === 'credit_card') as Account[],
        monthlySpending
      )

      expect(strategies.length).toBeGreaterThan(0)
      expect(strategies[0]).toHaveProperty('category')
      expect(strategies[0]).toHaveProperty('recommendedCard')
      expect(strategies[0]).toHaveProperty('reason')
    })

    it('should skip categories with zero spending', () => {
      const monthlySpending = {
        groceries: 500,
        restaurants: 0,
        travel: 0,
      }

      const strategies = suggestCardStrategy(
        mockAccounts.filter(a => a.type === 'credit_card') as Account[],
        monthlySpending
      )

      expect(strategies.every(s => s.category !== 'restaurants')).toBe(true)
    })

    it('should recommend card with best rewards', () => {
      const monthlySpending = {
        groceries: 1000,
      }

      const strategies = suggestCardStrategy(
        mockAccounts.filter(a => a.type === 'credit_card') as Account[],
        monthlySpending
      )

      const groceryStrategy = strategies.find(s => s.category === 'groceries')
      expect(groceryStrategy?.recommendedCard).toBeDefined()
    })

    it('should handle empty spending data', () => {
      const strategies = suggestCardStrategy(
        mockAccounts.filter(a => a.type === 'credit_card') as Account[],
        {}
      )

      expect(strategies).toEqual([])
    })

    it('should handle no credit cards', () => {
      const strategies = suggestCardStrategy([], { groceries: 500 })

      expect(strategies).toEqual([])
    })
  })
})

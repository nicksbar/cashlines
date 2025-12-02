/**
 * Tests for Payment Analysis Functions
 */

import { analyzePayments, type Transaction, type Account } from '../financial-analysis'

describe('analyzePayments', () => {
  const mockAccounts: Account[] = [
    {
      id: 'cc1',
      name: 'Chase Sapphire',
      type: 'credit_card',
      isActive: true,
      creditLimit: 10000,
      currentBalance: 2000,
    },
    {
      id: 'cc2',
      name: 'Amex Gold',
      type: 'credit_card',
      isActive: true,
      creditLimit: 5000,
      currentBalance: 1500,
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
      id: 'checking1',
      name: 'Chase Checking',
      type: 'checking',
      isActive: true,
      currentBalance: 5000,
    },
  ]

  describe('with no payments', () => {
    it('should return zero values when no payment transactions exist', () => {
      const transactions: Transaction[] = [
        {
          id: 'tx1',
          amount: 100,
          description: 'Groceries',
          date: '2025-12-01',
          accountId: 'checking1',
          method: 'ach',
        },
        {
          id: 'tx2',
          amount: 50,
          description: 'Gas',
          date: '2025-12-02',
          accountId: 'checking1',
          method: 'cash',
        },
      ]

      const result = analyzePayments(transactions, mockAccounts, 150, 1)

      expect(result.totalCreditCardPayments).toBe(0)
      expect(result.totalLoanPayments).toBe(0)
      expect(result.totalDebtPayments).toBe(0)
      expect(result.paymentCount).toBe(0)
      expect(result.avgPaymentAmount).toBe(0)
      expect(result.debtReductionRate).toBe(0)
      expect(result.paymentVelocity).toBe(0)
      expect(Object.keys(result.paymentsByAccount)).toHaveLength(0)
    })
  })

  describe('with credit card payments', () => {
    it('should correctly track credit card payments', () => {
      const transactions: Transaction[] = [
        {
          id: 'tx1',
          amount: 500,
          description: 'Chase CC Payment',
          date: '2025-12-01',
          accountId: 'checking1',
          payingAccountId: 'cc1',
          method: 'ach',
        },
        {
          id: 'tx2',
          amount: 300,
          description: 'Amex Payment',
          date: '2025-12-15',
          accountId: 'checking1',
          payingAccountId: 'cc2',
          method: 'ach',
        },
        {
          id: 'tx3',
          amount: 100,
          description: 'Regular expense',
          date: '2025-12-10',
          accountId: 'checking1',
          method: 'ach',
        },
      ]

      const totalExpenses = 900
      const result = analyzePayments(transactions, mockAccounts, totalExpenses, 1)

      expect(result.totalCreditCardPayments).toBe(800)
      expect(result.totalLoanPayments).toBe(0)
      expect(result.totalDebtPayments).toBe(800)
      expect(result.paymentCount).toBe(2)
      expect(result.avgPaymentAmount).toBe(400)
      expect(result.debtReductionRate).toBeCloseTo(88.89, 1) // 800/900 * 100
      expect(result.paymentVelocity).toBe(2) // 2 payments / 1 month

      expect(Object.keys(result.paymentsByAccount)).toHaveLength(2)
      expect(result.paymentsByAccount['cc1']).toEqual({
        accountName: 'Chase Sapphire',
        amount: 500,
        count: 1,
      })
      expect(result.paymentsByAccount['cc2']).toEqual({
        accountName: 'Amex Gold',
        amount: 300,
        count: 1,
      })
    })

    it('should aggregate multiple payments to the same account', () => {
      const transactions: Transaction[] = [
        {
          id: 'tx1',
          amount: 500,
          description: 'Chase CC Payment 1',
          date: '2025-12-01',
          accountId: 'checking1',
          payingAccountId: 'cc1',
          method: 'ach',
        },
        {
          id: 'tx2',
          amount: 300,
          description: 'Chase CC Payment 2',
          date: '2025-12-15',
          accountId: 'checking1',
          payingAccountId: 'cc1',
          method: 'ach',
        },
        {
          id: 'tx3',
          amount: 200,
          description: 'Chase CC Payment 3',
          date: '2025-12-20',
          accountId: 'checking1',
          payingAccountId: 'cc1',
          method: 'ach',
        },
      ]

      const result = analyzePayments(transactions, mockAccounts, 1000, 1)

      expect(result.totalCreditCardPayments).toBe(1000)
      expect(result.paymentCount).toBe(3)
      expect(result.paymentsByAccount['cc1']).toEqual({
        accountName: 'Chase Sapphire',
        amount: 1000,
        count: 3,
      })
    })
  })

  describe('with loan payments', () => {
    it('should correctly track loan payments', () => {
      const transactions: Transaction[] = [
        {
          id: 'tx1',
          amount: 450,
          description: 'Car Loan Payment',
          date: '2025-12-01',
          accountId: 'checking1',
          payingAccountId: 'loan1',
          method: 'ach',
        },
      ]

      const result = analyzePayments(transactions, mockAccounts, 450, 1)

      expect(result.totalCreditCardPayments).toBe(0)
      expect(result.totalLoanPayments).toBe(450)
      expect(result.totalDebtPayments).toBe(450)
      expect(result.debtReductionRate).toBe(100) // 450/450 * 100
    })
  })

  describe('with mixed payment types', () => {
    it('should correctly track both credit card and loan payments', () => {
      const transactions: Transaction[] = [
        {
          id: 'tx1',
          amount: 500,
          description: 'Chase CC Payment',
          date: '2025-12-01',
          accountId: 'checking1',
          payingAccountId: 'cc1',
          method: 'ach',
        },
        {
          id: 'tx2',
          amount: 450,
          description: 'Car Loan Payment',
          date: '2025-12-05',
          accountId: 'checking1',
          payingAccountId: 'loan1',
          method: 'ach',
        },
        {
          id: 'tx3',
          amount: 300,
          description: 'Amex Payment',
          date: '2025-12-15',
          accountId: 'checking1',
          payingAccountId: 'cc2',
          method: 'ach',
        },
        {
          id: 'tx4',
          amount: 150,
          description: 'Groceries',
          date: '2025-12-10',
          accountId: 'checking1',
          method: 'ach',
        },
      ]

      const totalExpenses = 1400
      const result = analyzePayments(transactions, mockAccounts, totalExpenses, 1)

      expect(result.totalCreditCardPayments).toBe(800)
      expect(result.totalLoanPayments).toBe(450)
      expect(result.totalDebtPayments).toBe(1250)
      expect(result.paymentCount).toBe(3)
      expect(result.avgPaymentAmount).toBeCloseTo(416.67, 1)
      expect(result.debtReductionRate).toBeCloseTo(89.29, 1) // 1250/1400 * 100

      expect(Object.keys(result.paymentsByAccount)).toHaveLength(3)
    })
  })

  describe('with multiple months', () => {
    it('should calculate payment velocity correctly', () => {
      const transactions: Transaction[] = [
        {
          id: 'tx1',
          amount: 500,
          description: 'Payment 1',
          date: '2025-10-01',
          accountId: 'checking1',
          payingAccountId: 'cc1',
          method: 'ach',
        },
        {
          id: 'tx2',
          amount: 500,
          description: 'Payment 2',
          date: '2025-11-01',
          accountId: 'checking1',
          payingAccountId: 'cc1',
          method: 'ach',
        },
        {
          id: 'tx3',
          amount: 500,
          description: 'Payment 3',
          date: '2025-12-01',
          accountId: 'checking1',
          payingAccountId: 'cc1',
          method: 'ach',
        },
      ]

      const result = analyzePayments(transactions, mockAccounts, 1500, 3)

      expect(result.paymentCount).toBe(3)
      expect(result.paymentVelocity).toBe(1) // 3 payments / 3 months = 1 payment/month
    })
  })

  describe('edge cases', () => {
    it('should handle missing payingAccountId gracefully', () => {
      const transactions: Transaction[] = [
        {
          id: 'tx1',
          amount: 500,
          description: 'Payment',
          date: '2025-12-01',
          accountId: 'checking1',
          payingAccountId: 'cc1',
          method: 'ach',
        },
        {
          id: 'tx2',
          amount: 100,
          description: 'Regular expense',
          date: '2025-12-02',
          accountId: 'checking1',
          payingAccountId: null,
          method: 'ach',
        },
      ]

      const result = analyzePayments(transactions, mockAccounts, 600, 1)

      expect(result.totalDebtPayments).toBe(500)
      expect(result.paymentCount).toBe(1)
    })

    it('should handle payments to non-existent accounts', () => {
      const transactions: Transaction[] = [
        {
          id: 'tx1',
          amount: 500,
          description: 'Payment to unknown account',
          date: '2025-12-01',
          accountId: 'checking1',
          payingAccountId: 'nonexistent',
          method: 'ach',
        },
      ]

      const result = analyzePayments(transactions, mockAccounts, 500, 1)

      // Should not crash, but also shouldn't count the payment
      expect(result.totalDebtPayments).toBe(0)
      expect(result.paymentCount).toBe(1) // Still counts as a payment transaction
      expect(Object.keys(result.paymentsByAccount)).toHaveLength(0)
    })

    it('should handle zero total expenses', () => {
      const transactions: Transaction[] = [
        {
          id: 'tx1',
          amount: 500,
          description: 'Payment',
          date: '2025-12-01',
          accountId: 'checking1',
          payingAccountId: 'cc1',
          method: 'ach',
        },
      ]

      const result = analyzePayments(transactions, mockAccounts, 0, 1)

      expect(result.totalDebtPayments).toBe(500)
      expect(result.debtReductionRate).toBe(0) // Can't divide by zero
    })

    it('should handle empty transactions array', () => {
      const result = analyzePayments([], mockAccounts, 1000, 1)

      expect(result.totalDebtPayments).toBe(0)
      expect(result.paymentCount).toBe(0)
      expect(result.paymentVelocity).toBe(0)
    })

    it('should handle zero month count', () => {
      const transactions: Transaction[] = [
        {
          id: 'tx1',
          amount: 500,
          description: 'Payment',
          date: '2025-12-01',
          accountId: 'checking1',
          payingAccountId: 'cc1',
          method: 'ach',
        },
      ]

      const result = analyzePayments(transactions, mockAccounts, 500, 0)

      expect(result.paymentVelocity).toBe(0) // Avoids division by zero
    })
  })

  describe('payments to non-debt accounts', () => {
    it('should ignore payments to checking/savings accounts', () => {
      const transactions: Transaction[] = [
        {
          id: 'tx1',
          amount: 500,
          description: 'Transfer to checking',
          date: '2025-12-01',
          accountId: 'checking1',
          payingAccountId: 'checking1',
          method: 'ach',
        },
      ]

      const result = analyzePayments(transactions, mockAccounts, 500, 1)

      // Checking account payments don't count as debt reduction
      expect(result.totalCreditCardPayments).toBe(0)
      expect(result.totalLoanPayments).toBe(0)
      expect(result.totalDebtPayments).toBe(0)
    })
  })
})

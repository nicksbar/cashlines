/**
 * Tests for transaction payment account feature
 * Tests creating transactions with payingAccountId to track payments to accounts
 */

import { prisma } from '@/lib/db'

describe('Transaction Payment Account Feature', () => {
  let userId: string
  let checkingAccountId: string
  let creditCardAccountId: string
  let loanAccountId: string

  beforeAll(async () => {
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'payment-test@example.com',
        name: 'Payment Test User',
      },
    })
    userId = user.id

    // Create checking account (source of payments)
    const checking = await prisma.account.create({
      data: {
        userId,
        name: 'Test Checking',
        type: 'checking',
        isActive: true,
      },
    })
    checkingAccountId = checking.id

    // Create credit card account (can be paid)
    const creditCard = await prisma.account.create({
      data: {
        userId,
        name: 'Test Credit Card',
        type: 'credit_card',
        isActive: true,
        creditLimit: 5000,
      },
    })
    creditCardAccountId = creditCard.id

    // Create loan account (can be paid)
    const loan = await prisma.account.create({
      data: {
        userId,
        name: 'Test Loan',
        type: 'loan',
        isActive: true,
        principalBalance: 10000,
      },
    })
    loanAccountId = loan.id
  })

  afterAll(async () => {
    // Cleanup
    await prisma.transaction.deleteMany({ where: { userId } })
    await prisma.account.deleteMany({ where: { userId } })
    await prisma.user.delete({ where: { id: userId } })
  })

  describe('Creating transactions with payment accounts', () => {
    test('should create a credit card payment transaction', async () => {
      const transaction = await prisma.transaction.create({
        data: {
          userId,
          accountId: checkingAccountId,
          payingAccountId: creditCardAccountId,
          date: new Date('2024-01-15'),
          amount: 500,
          description: 'Credit Card Payment',
          method: 'ach',
          tags: JSON.stringify(['payment']),
        },
        include: {
          account: true,
          payingAccount: true,
        },
      })

      expect(transaction).toBeDefined()
      expect(transaction.accountId).toBe(checkingAccountId)
      expect(transaction.payingAccountId).toBe(creditCardAccountId)
      expect(transaction.account.name).toBe('Test Checking')
      expect(transaction.payingAccount?.name).toBe('Test Credit Card')
      expect(transaction.amount).toBe(500)
      expect(transaction.description).toBe('Credit Card Payment')
    })

    test('should create a loan payment transaction', async () => {
      const transaction = await prisma.transaction.create({
        data: {
          userId,
          accountId: checkingAccountId,
          payingAccountId: loanAccountId,
          date: new Date('2024-01-20'),
          amount: 1000,
          description: 'Loan Payment',
          method: 'ach',
          tags: JSON.stringify(['payment', 'loan']),
        },
        include: {
          account: true,
          payingAccount: true,
        },
      })

      expect(transaction).toBeDefined()
      expect(transaction.payingAccountId).toBe(loanAccountId)
      expect(transaction.payingAccount?.name).toBe('Test Loan')
      expect(transaction.amount).toBe(1000)
    })

    test('should create a regular transaction without payingAccountId', async () => {
      const transaction = await prisma.transaction.create({
        data: {
          userId,
          accountId: creditCardAccountId,
          payingAccountId: null,
          date: new Date('2024-01-10'),
          amount: 50,
          description: 'Groceries',
          method: 'cc',
          tags: JSON.stringify(['shopping']),
        },
        include: {
          account: true,
          payingAccount: true,
        },
      })

      expect(transaction).toBeDefined()
      expect(transaction.payingAccountId).toBeNull()
      expect(transaction.payingAccount).toBeNull()
      expect(transaction.description).toBe('Groceries')
    })
  })

  describe('Querying transactions with payment relationships', () => {
    test('should fetch transactions with payingAccount included', async () => {
      const transactions = await prisma.transaction.findMany({
        where: {
          userId,
          payingAccountId: { not: null },
        },
        include: {
          account: true,
          payingAccount: true,
        },
        orderBy: { date: 'desc' },
      })

      expect(transactions.length).toBeGreaterThan(0)
      transactions.forEach(tx => {
        expect(tx.payingAccountId).not.toBeNull()
        expect(tx.payingAccount).toBeDefined()
        expect(tx.payingAccount?.type).toMatch(/credit_card|loan/)
      })
    })

    test('should fetch payments received by a specific account', async () => {
      const paymentsToCard = await prisma.transaction.findMany({
        where: {
          userId,
          payingAccountId: creditCardAccountId,
        },
        include: {
          account: true,
          payingAccount: true,
        },
      })

      expect(paymentsToCard.length).toBeGreaterThan(0)
      paymentsToCard.forEach(tx => {
        expect(tx.payingAccountId).toBe(creditCardAccountId)
        expect(tx.payingAccount?.name).toBe('Test Credit Card')
      })
    })

    test('should filter regular expenses (no payment account)', async () => {
      const regularExpenses = await prisma.transaction.findMany({
        where: {
          userId,
          payingAccountId: null,
        },
      })

      expect(regularExpenses.length).toBeGreaterThan(0)
      regularExpenses.forEach(tx => {
        expect(tx.payingAccountId).toBeNull()
      })
    })
  })

  describe('Account relations', () => {
    test('should access paymentsReceived from account', async () => {
      const creditCard = await prisma.account.findUnique({
        where: { id: creditCardAccountId },
        include: {
          paymentsReceived: true,
        },
      })

      expect(creditCard).toBeDefined()
      expect(creditCard?.paymentsReceived).toBeDefined()
      expect(creditCard?.paymentsReceived.length).toBeGreaterThan(0)
      
      creditCard?.paymentsReceived.forEach(payment => {
        expect(payment.payingAccountId).toBe(creditCardAccountId)
      })
    })

    test('should calculate total payments received for an account', async () => {
      const creditCard = await prisma.account.findUnique({
        where: { id: creditCardAccountId },
        include: {
          paymentsReceived: true,
        },
      })

      const totalPayments = creditCard?.paymentsReceived.reduce(
        (sum, payment) => sum + payment.amount,
        0
      ) || 0

      expect(totalPayments).toBeGreaterThan(0)
    })
  })

  describe('Edge cases', () => {
    test('should handle null payingAccountId gracefully', async () => {
      const transaction = await prisma.transaction.create({
        data: {
          userId,
          accountId: checkingAccountId,
          payingAccountId: null,
          date: new Date('2024-01-25'),
          amount: 25,
          description: 'Coffee',
          method: 'cc',
          tags: JSON.stringify([]),
        },
        include: {
          payingAccount: true,
        },
      })

      expect(transaction.payingAccountId).toBeNull()
      expect(transaction.payingAccount).toBeNull()
    })

    test('should allow same account for both accountId and payingAccountId (self-payment)', async () => {
      // Edge case: transferring within same account type (rare but valid)
      const transaction = await prisma.transaction.create({
        data: {
          userId,
          accountId: checkingAccountId,
          payingAccountId: checkingAccountId,
          date: new Date('2024-01-30'),
          amount: 10,
          description: 'Transfer fee',
          method: 'ach',
          tags: JSON.stringify(['fee']),
        },
        include: {
          account: true,
          payingAccount: true,
        },
      })

      expect(transaction.accountId).toBe(checkingAccountId)
      expect(transaction.payingAccountId).toBe(checkingAccountId)
    })
  })
})

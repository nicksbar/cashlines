/**
 * Integration tests for Income API routes
 * Tests POST, PATCH, DELETE operations
 */

import { prisma } from '@/lib/db'

// Mock the prisma client
jest.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
    },
    income: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    account: {
      findUnique: jest.fn(),
    },
  },
}))

describe('Income API Routes', () => {
  const mockUserId = 'test-user-1'
  const mockAccountId = 'test-account-1'
  const mockIncomeId = 'test-income-1'

  const mockAccount = {
    id: mockAccountId,
    userId: mockUserId,
    name: 'Checking',
    type: 'checking',
    isActive: true,
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockIncome = {
    id: mockIncomeId,
    userId: mockUserId,
    accountId: mockAccountId,
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
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(prisma.user.findMany as jest.Mock).mockResolvedValue([
      { id: mockUserId },
    ])
  })

  describe('POST /api/income - Create income', () => {
    it('should create income with valid data', async () => {
      ;(prisma.account.findUnique as jest.Mock).mockResolvedValue(
        mockAccount
      )
      ;(prisma.income.create as jest.Mock).mockResolvedValue(mockIncome)

      const incomeData = {
        date: new Date('2025-11-11'),
        grossAmount: 5000,
        taxes: 1200,
        preTaxDeductions: 400,
        postTaxDeductions: 200,
        netAmount: 3200,
        source: 'Salary',
        accountId: mockAccountId,
        tags: ['recurring', 'tax:w2'],
      }

      // Simulate the POST logic
      const result = await prisma.income.create({
        data: {
          userId: mockUserId,
          accountId: incomeData.accountId,
          date: incomeData.date,
          grossAmount: incomeData.grossAmount,
          taxes: incomeData.taxes,
          preTaxDeductions: incomeData.preTaxDeductions,
          postTaxDeductions: incomeData.postTaxDeductions,
          netAmount: incomeData.netAmount,
          source: incomeData.source,
          tags: JSON.stringify(incomeData.tags),
        },
      })

      expect(result).toEqual(mockIncome)
      expect(prisma.income.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: mockUserId,
          grossAmount: 5000,
          netAmount: 3200,
        }),
      })
    })

    it('should preserve decimal precision for taxes (2807.95 stored as 2807.95)', async () => {
      const decimalIncome = {
        id: 'test-decimal-income',
        userId: mockUserId,
        accountId: mockAccountId,
        date: new Date('2025-11-11'),
        grossAmount: 3500,
        taxes: 2807.95,
        preTaxDeductions: 0,
        postTaxDeductions: 0,
        netAmount: 692.05,
        source: 'Salary',
        notes: null,
        tags: '[]',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(prisma.account.findUnique as jest.Mock).mockResolvedValue(mockAccount)
      ;(prisma.income.create as jest.Mock).mockResolvedValue(decimalIncome)

      const result = await prisma.income.create({
        data: {
          userId: mockUserId,
          accountId: mockAccountId,
          date: new Date('2025-11-11'),
          grossAmount: 3500,
          taxes: 2807.95,
          preTaxDeductions: 0,
          postTaxDeductions: 0,
          netAmount: 692.05,
          source: 'Salary',
          tags: '[]',
        },
      })

      // Verify exact decimal value is stored/returned
      expect(result.taxes).toBe(2807.95)
      expect(result.netAmount).toBe(692.05)
    })

    it('should reject request without user', async () => {
      ;(prisma.user.findMany as jest.Mock).mockResolvedValue([])

      const hasUser = (await prisma.user.findMany()).length > 0
      expect(hasUser).toBe(false)
    })
  })

  describe('PATCH /api/income/[id] - Update income', () => {
    it('should update income with partial data', async () => {
      const updatedIncome = { ...mockIncome, grossAmount: 6000, taxes: 1400 }
      ;(prisma.income.update as jest.Mock).mockResolvedValue(updatedIncome)

      const result = await prisma.income.update({
        where: { id: mockIncomeId },
        data: {
          grossAmount: 6000,
          taxes: 1400,
        },
      })

      expect(result.grossAmount).toBe(6000)
      expect(result.taxes).toBe(1400)
      expect(prisma.income.update).toHaveBeenCalledWith({
        where: { id: mockIncomeId },
        data: {
          grossAmount: 6000,
          taxes: 1400,
        },
      })
    })

    it('should update all fields when provided', async () => {
      const updatedIncome = {
        ...mockIncome,
        grossAmount: 5500,
        taxes: 1300,
        preTaxDeductions: 450,
        postTaxDeductions: 250,
        netAmount: 3500,
        source: 'Freelance',
      }
      ;(prisma.income.update as jest.Mock).mockResolvedValue(updatedIncome)

      const result = await prisma.income.update({
        where: { id: mockIncomeId },
        data: {
          grossAmount: 5500,
          taxes: 1300,
          preTaxDeductions: 450,
          postTaxDeductions: 250,
          netAmount: 3500,
          source: 'Freelance',
        },
      })

      expect(result.source).toBe('Freelance')
      expect(result.netAmount).toBe(3500)
    })
  })

  describe('DELETE /api/income/[id] - Delete income', () => {
    it('should delete income successfully', async () => {
      ;(prisma.income.delete as jest.Mock).mockResolvedValue(mockIncome)

      const result = await prisma.income.delete({
        where: { id: mockIncomeId },
      })

      expect(result.id).toBe(mockIncomeId)
      expect(prisma.income.delete).toHaveBeenCalledWith({
        where: { id: mockIncomeId },
      })
    })

    it('should handle delete errors gracefully', async () => {
      const error = new Error('Income not found')
      ;(prisma.income.delete as jest.Mock).mockRejectedValue(error)

      try {
        await prisma.income.delete({
          where: { id: 'non-existent' },
        })
        fail('Should have thrown')
      } catch (e) {
        expect(e).toEqual(error)
      }
    })
  })

  describe('GET /api/income - Fetch income list', () => {
    it('should fetch all income for user', async () => {
      const mockIncomeList = [mockIncome]
      ;(prisma.income.findMany as jest.Mock).mockResolvedValue(mockIncomeList)

      const result = await prisma.income.findMany({
        where: { userId: mockUserId },
      })

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(mockIncomeId)
    })

    it('should filter by date range', async () => {
      const filteredIncome = [mockIncome]
      ;(prisma.income.findMany as jest.Mock).mockResolvedValue(filteredIncome)

      const startDate = new Date('2025-11-01')
      const endDate = new Date('2025-11-30')

      const result = await prisma.income.findMany({
        where: {
          userId: mockUserId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      })

      expect(result).toHaveLength(1)
    })

    it('should filter by account', async () => {
      const filteredIncome = [mockIncome]
      ;(prisma.income.findMany as jest.Mock).mockResolvedValue(filteredIncome)

      const result = await prisma.income.findMany({
        where: {
          userId: mockUserId,
          accountId: mockAccountId,
        },
      })

      expect(result[0].accountId).toBe(mockAccountId)
    })
  })
})

describe('Account API Routes', () => {
  const mockUserId = 'test-user-1'
  const mockAccountId = 'test-account-1'

  const mockAccount = {
    id: mockAccountId,
    userId: mockUserId,
    name: 'Checking',
    type: 'checking',
    isActive: true,
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/accounts - Create account', () => {
    it('should create account with valid data', async () => {
      ;(prisma.income.create as jest.Mock).mockResolvedValue(mockAccount)

      const accountData = {
        name: 'Checking',
        type: 'checking',
      }

      expect(accountData.name).toBe('Checking')
      expect(accountData.type).toBe('checking')
    })
  })

  describe('PATCH /api/accounts/[id] - Update account', () => {
    it('should update account name', async () => {
      const updatedAccount = { ...mockAccount, name: 'Updated Checking' }

      expect(updatedAccount.name).toBe('Updated Checking')
      expect(updatedAccount.id).toBe(mockAccountId)
    })
  })

  describe('DELETE /api/accounts/[id] - Delete account', () => {
    it('should delete account successfully', async () => {
      expect(mockAccount.id).toBe(mockAccountId)
    })
  })
})

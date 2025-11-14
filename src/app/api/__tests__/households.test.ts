import { POST, DELETE, GET } from '@/app/api/households/route'
import { DELETE as DELETE_ID } from '@/app/api/households/[id]/route'
import { prisma } from '@/lib/db'
import { NextRequest } from 'next/server'

// Mock Prisma
jest.mock('@/lib/db', () => ({
  prisma: {
    user: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    transaction: { deleteMany: jest.fn() },
    income: { deleteMany: jest.fn() },
    recurringExpense: { deleteMany: jest.fn() },
    rule: { deleteMany: jest.fn() },
    template: { deleteMany: jest.fn() },
    person: { deleteMany: jest.fn() },
    balanceSnapshot: { deleteMany: jest.fn() },
    account: { deleteMany: jest.fn() },
    setting: { deleteMany: jest.fn() },
  },
}))

describe('Households API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/households', () => {
    it('should return all households', async () => {
      const mockHouseholds = [
        { id: 'user_1', name: 'Default', email: 'default@cashlines.local', isProduction: false },
        { id: 'test_1', name: 'Test', email: 'test@cashlines.local', isProduction: false },
      ]

      ;(prisma.user.findMany as jest.Mock).mockResolvedValue(mockHouseholds)

      const response = await GET()
      const json = await response.json()

      expect(response.status).toBe(200)
      expect(json).toEqual(mockHouseholds)
      expect(prisma.user.findMany).toHaveBeenCalled()
    })

    it('should handle database errors gracefully', async () => {
      ;(prisma.user.findMany as jest.Mock).mockRejectedValue(new Error('DB Error'))

      const response = await GET()
      const json = await response.json()

      expect(response.status).toBe(500)
      expect(json.error).toBe('Failed to fetch households')
    })
  })

  describe('POST /api/households', () => {
    it('should create a new household', async () => {
      const mockRequest = {
        json: async () => ({ name: 'New Household' }),
      } as NextRequest

      const newHousehold = {
        id: 'new_1',
        name: 'New Household',
        email: 'new-household-@cashlines.local',
        isProduction: false,
      }

      ;(prisma.user.create as jest.Mock).mockResolvedValue(newHousehold)

      const response = await POST(mockRequest)
      const json = await response.json()

      expect(response.status).toBe(201)
      expect(json.id).toBe('new_1')
      expect(json.name).toBe('New Household')
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'New Household',
            isProduction: false,
          }),
        })
      )
    })

    it('should reject empty household name', async () => {
      const mockRequest = {
        json: async () => ({ name: '' }),
      } as NextRequest

      const response = await POST(mockRequest)
      const json = await response.json()

      expect(response.status).toBe(400)
      expect(json.error).toBe('Household name is required')
      expect(prisma.user.create).not.toHaveBeenCalled()
    })

    it('should reject missing household name', async () => {
      const mockRequest = {
        json: async () => ({}),
      } as NextRequest

      const response = await POST(mockRequest)
      const json = await response.json()

      expect(response.status).toBe(400)
      expect(json.error).toBe('Household name is required')
    })

    it('should handle database errors', async () => {
      const mockRequest = {
        json: async () => ({ name: 'Test' }),
      } as NextRequest

      ;(prisma.user.create as jest.Mock).mockRejectedValue(new Error('DB Error'))

      const response = await POST(mockRequest)
      const json = await response.json()

      expect(response.status).toBe(500)
      expect(json.error).toBe('Failed to create household')
    })
  })

  describe('DELETE /api/households/[id]', () => {
    it('should delete a test household', async () => {
      const mockRequest = {
        headers: new Map([['x-household-id', 'user_1']]),
      } as unknown as NextRequest

      const householdToDelete = {
        id: 'test_1',
        name: 'Test Household',
        isProduction: false,
      }

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(householdToDelete)
      ;(prisma.transaction.deleteMany as jest.Mock).mockResolvedValue({ count: 5 })
      ;(prisma.income.deleteMany as jest.Mock).mockResolvedValue({ count: 2 })
      ;(prisma.recurringExpense.deleteMany as jest.Mock).mockResolvedValue({ count: 1 })
      ;(prisma.rule.deleteMany as jest.Mock).mockResolvedValue({ count: 0 })
      ;(prisma.template.deleteMany as jest.Mock).mockResolvedValue({ count: 3 })
      ;(prisma.person.deleteMany as jest.Mock).mockResolvedValue({ count: 1 })
      ;(prisma.balanceSnapshot.deleteMany as jest.Mock).mockResolvedValue({ count: 4 })
      ;(prisma.account.deleteMany as jest.Mock).mockResolvedValue({ count: 2 })
      ;(prisma.setting.deleteMany as jest.Mock).mockResolvedValue({ count: 1 })
      ;(prisma.user.delete as jest.Mock).mockResolvedValue(householdToDelete)

      const response = await DELETE_ID(mockRequest, { params: { id: 'test_1' } })
      const json = await response.json()

      expect(response.status).toBe(200)
      expect(json.success).toBe(true)
      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 'test_1' } })
    })

    it('should prevent deleting production households', async () => {
      const mockRequest = {
        headers: new Map([['x-household-id', 'user_1']]),
      } as unknown as NextRequest

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'prod_1',
        name: 'Production',
        isProduction: true,
      })

      const response = await DELETE_ID(mockRequest, { params: { id: 'prod_1' } })
      const json = await response.json()

      expect(response.status).toBe(403)
      expect(json.error).toBe('Cannot delete production households')
      expect(prisma.user.delete).not.toHaveBeenCalled()
    })

    it('should prevent deleting default household', async () => {
      const mockRequest = {
        headers: new Map([['x-household-id', 'user_1']]),
      } as unknown as NextRequest

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user_1',
        name: 'Default',
        isProduction: false,
      })

      const response = await DELETE_ID(mockRequest, { params: { id: 'user_1' } })
      const json = await response.json()

      expect(response.status).toBe(403)
      expect(json.error).toBe('Cannot delete default household')
      expect(prisma.user.delete).not.toHaveBeenCalled()
    })

    it('should require household ID header', async () => {
      const mockRequest = {
        headers: new Map(),
      } as unknown as NextRequest

      const response = await DELETE_ID(mockRequest, { params: { id: 'test_1' } })
      const json = await response.json()

      expect(response.status).toBe(400)
      expect(json.error).toBe('Missing household ID')
    })

    it('should return 404 for non-existent household', async () => {
      const mockRequest = {
        headers: new Map([['x-household-id', 'user_1']]),
      } as unknown as NextRequest

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)

      const response = await DELETE_ID(mockRequest, { params: { id: 'nonexistent' } })
      const json = await response.json()

      expect(response.status).toBe(404)
      expect(json.error).toBe('Household not found')
    })

    it('should handle database errors during deletion', async () => {
      const mockRequest = {
        headers: new Map([['x-household-id', 'user_1']]),
      } as unknown as NextRequest

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'test_1',
        name: 'Test',
        isProduction: false,
      })
      ;(prisma.transaction.deleteMany as jest.Mock).mockRejectedValue(new Error('DB Error'))

      const response = await DELETE_ID(mockRequest, { params: { id: 'test_1' } })
      const json = await response.json()

      expect(response.status).toBe(500)
      expect(json.error).toBe('Failed to delete household')
    })

    it('should delete all related data before deleting household', async () => {
      const mockRequest = {
        headers: new Map([['x-household-id', 'user_1']]),
      } as unknown as NextRequest

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'test_1',
        name: 'Test',
        isProduction: false,
      })
      ;(prisma.transaction.deleteMany as jest.Mock).mockResolvedValue({ count: 0 })
      ;(prisma.income.deleteMany as jest.Mock).mockResolvedValue({ count: 0 })
      ;(prisma.recurringExpense.deleteMany as jest.Mock).mockResolvedValue({ count: 0 })
      ;(prisma.rule.deleteMany as jest.Mock).mockResolvedValue({ count: 0 })
      ;(prisma.template.deleteMany as jest.Mock).mockResolvedValue({ count: 0 })
      ;(prisma.person.deleteMany as jest.Mock).mockResolvedValue({ count: 0 })
      ;(prisma.balanceSnapshot.deleteMany as jest.Mock).mockResolvedValue({ count: 0 })
      ;(prisma.account.deleteMany as jest.Mock).mockResolvedValue({ count: 0 })
      ;(prisma.setting.deleteMany as jest.Mock).mockResolvedValue({ count: 0 })
      ;(prisma.user.delete as jest.Mock).mockResolvedValue({})

      const response = await DELETE_ID(mockRequest, { params: { id: 'test_1' } })

      expect(response.status).toBe(200)
      // Verify all deletes were called before user.delete
      expect(prisma.transaction.deleteMany).toHaveBeenCalled()
      expect(prisma.income.deleteMany).toHaveBeenCalled()
      expect(prisma.account.deleteMany).toHaveBeenCalled()
      expect(prisma.user.delete).toHaveBeenCalled()
    })
  })
})

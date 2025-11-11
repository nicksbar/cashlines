import {
  createMockIncome,
  createMockTransaction,
  createMockSplit,
  testData,
  assertions,
} from './testUtils'

describe('Test Utilities and Factories', () => {
  describe('Mock Factories', () => {
    it('should create valid mock income', () => {
      const income = createMockIncome()
      expect(income.id).toBeDefined()
      expect(income.grossAmount).toBe(5000)
      expect(income.netAmount).toBe(3200)
    })

    it('should create mock income with overrides', () => {
      const income = createMockIncome({
        source: 'Freelance',
        grossAmount: 1000,
      })
      expect(income.source).toBe('Freelance')
      expect(income.grossAmount).toBe(1000)
    })

    it('should create valid mock transaction', () => {
      const tx = createMockTransaction()
      expect(tx.id).toBeDefined()
      expect(tx.amount).toBe(150.5)
      expect(tx.description).toBe('Groceries')
    })

    it('should create valid mock split', () => {
      const split = createMockSplit()
      expect(split.id).toBeDefined()
      expect(split.type).toBe('need')
      expect(split.target).toBeDefined()
    })
  })

  describe('Test Data Generators', () => {
    it('should generate monthly income', () => {
      const income = testData.createMonthlyIncome(11, 2025, 3)
      expect(income).toHaveLength(3)
      expect(income[0].date.getMonth()).toBe(10) // November is month 10
      expect(income[1].source).toBe('Freelance')
    })

    it('should generate split allocation', () => {
      const splits = testData.createSplitAllocation()
      expect(splits).toHaveLength(3)
      expect(splits[0].type).toBe('need')
      expect(splits[1].type).toBe('want')
      expect(splits[2].type).toBe('savings')
    })

    it('should generate account set', () => {
      const accounts = testData.createAccountSet()
      expect(accounts).toHaveLength(4)
      expect(accounts.map((a) => a.type)).toEqual([
        'checking',
        'savings',
        'credit_card',
        'cash',
      ])
    })
  })

  describe('Assertions', () => {
    it('should validate correct income calculations', () => {
      const income = createMockIncome()
      expect(assertions.isValidIncome(income)).toBe(true)
    })

    it('should reject invalid income calculations', () => {
      const income = createMockIncome({ netAmount: 5000 })
      expect(assertions.isValidIncome(income)).toBe(false)
    })

    it('should validate date in range', () => {
      const date = new Date('2025-11-15')
      const startDate = new Date('2025-11-01')
      const endDate = new Date('2025-11-30')
      expect(assertions.isDateInRange(date, startDate, endDate)).toBe(true)
    })

    it('should reject date outside range', () => {
      const date = new Date('2025-12-01')
      const startDate = new Date('2025-11-01')
      const endDate = new Date('2025-11-30')
      expect(assertions.isDateInRange(date, startDate, endDate)).toBe(false)
    })

    it('should validate split allocation with amounts', () => {
      const transaction = createMockTransaction({ amount: 1000 })
      const splits = [
        createMockSplit({ id: '1', amount: 500 }),
        createMockSplit({ id: '2', amount: 500 }),
      ]
      expect(assertions.isValidAllocation(transaction, splits)).toBe(true)
    })

    it('should validate split allocation with percentages', () => {
      const transaction = createMockTransaction({ amount: 1000 })
      const splits = [
        createMockSplit({ id: '1', amount: null, percent: 50 }),
        createMockSplit({ id: '2', amount: null, percent: 50 }),
      ]
      expect(assertions.isValidAllocation(transaction, splits)).toBe(true)
    })
  })
})

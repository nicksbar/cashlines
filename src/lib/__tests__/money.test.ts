import {
  formatCurrency,
  parseAmount,
  roundAmount,
  calculatePercent,
  calculatePercentOf,
  sumAmounts,
  groupByProperty,
} from '@/lib/money'

describe('Money Utilities', () => {
  describe('formatCurrency', () => {
    it('should format positive amounts', () => {
      expect(formatCurrency(1000)).toBe('$1,000.00')
      expect(formatCurrency(1000.5)).toBe('$1,000.50')
    })

    it('should format negative amounts', () => {
      expect(formatCurrency(-500)).toBe('-$500.00')
    })

    it('should format zero', () => {
      expect(formatCurrency(0)).toBe('$0.00')
    })

    it('should respect decimal parameter', () => {
      expect(formatCurrency(1000.123, 1)).toBe('$1,000.1')
      expect(formatCurrency(1000, 0)).toBe('$1,000')
    })
  })

  describe('parseAmount', () => {
    it('should parse currency strings', () => {
      expect(parseAmount('$1,000.00')).toBe(1000)
      expect(parseAmount('$1000.50')).toBe(1000.5)
    })

    it('should parse plain numbers', () => {
      expect(parseAmount('500')).toBe(500)
      expect(parseAmount('500.25')).toBe(500.25)
    })

    it('should handle negative amounts', () => {
      expect(parseAmount('-$500.00')).toBe(-500)
    })

    it('should return 0 for invalid input', () => {
      expect(parseAmount('invalid')).toBe(0)
      expect(parseAmount('')).toBe(0)
    })
  })

  describe('roundAmount', () => {
    it('should round to 2 decimals by default', () => {
      expect(roundAmount(100.456)).toBe(100.46)
      expect(roundAmount(100.444)).toBe(100.44)
    })

    it('should respect decimal parameter', () => {
      expect(roundAmount(100.456, 1)).toBe(100.5)
      expect(roundAmount(100.456, 0)).toBe(100)
    })

    it('should handle negative numbers', () => {
      expect(roundAmount(-100.456)).toBe(-100.46)
    })
  })

  describe('calculatePercent', () => {
    it('should calculate percent of total', () => {
      expect(calculatePercent(50, 1000)).toBe(500)
      expect(calculatePercent(100, 500)).toBe(500)
    })

    it('should handle decimals', () => {
      expect(calculatePercent(33.33, 1000)).toBe(333.3)
    })

    it('should handle zero', () => {
      expect(calculatePercent(0, 1000)).toBe(0)
      expect(calculatePercent(50, 0)).toBe(0)
    })
  })

  describe('calculatePercentOf', () => {
    it('should calculate what percent amount is of total', () => {
      expect(calculatePercentOf(500, 1000)).toBe(50)
      expect(calculatePercentOf(250, 1000)).toBe(25)
    })

    it('should handle decimals', () => {
      expect(calculatePercentOf(333.3, 1000)).toBe(33.33)
    })

    it('should return 0 when total is 0', () => {
      expect(calculatePercentOf(500, 0)).toBe(0)
    })

    it('should handle percentages over 100', () => {
      expect(calculatePercentOf(1500, 1000)).toBe(150)
    })
  })

  describe('sumAmounts', () => {
    it('should sum positive amounts', () => {
      expect(sumAmounts([100, 200, 300])).toBe(600)
    })

    it('should handle negative amounts', () => {
      expect(sumAmounts([100, -50, 200])).toBe(250)
    })

    it('should handle decimals', () => {
      expect(sumAmounts([100.1, 200.2, 300.3])).toBe(600.6)
    })

    it('should handle empty array', () => {
      expect(sumAmounts([])).toBe(0)
    })
  })

  describe('groupByProperty', () => {
    interface TestItem {
      id: number
      category: string
      value: number
    }

    it('should group items by property', () => {
      const items: TestItem[] = [
        { id: 1, category: 'A', value: 100 },
        { id: 2, category: 'B', value: 200 },
        { id: 3, category: 'A', value: 150 },
      ]

      const grouped = groupByProperty(items, (item) => item.category)

      expect(grouped.size).toBe(2)
      expect(grouped.get('A')).toHaveLength(2)
      expect(grouped.get('B')).toHaveLength(1)
    })

    it('should preserve order within groups', () => {
      const items: TestItem[] = [
        { id: 1, category: 'A', value: 100 },
        { id: 2, category: 'A', value: 150 },
      ]

      const grouped = groupByProperty(items, (item) => item.category)
      const groupA = grouped.get('A')!

      expect(groupA[0].id).toBe(1)
      expect(groupA[1].id).toBe(2)
    })

    it('should handle numeric keys', () => {
      const items: TestItem[] = [
        { id: 1, category: 'A', value: 100 },
        { id: 2, category: 'B', value: 200 },
      ]

      const grouped = groupByProperty(items, (item) => item.id)

      expect(grouped.size).toBe(2)
      expect(grouped.get(1)).toHaveLength(1)
    })
  })
})

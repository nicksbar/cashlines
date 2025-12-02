import {
  getMonthRange,
  getYearRange,
  formatDate,
  formatMonth,
  isDateInRange,
  getCurrentMonthYear,
  getMonthName,
  getMonthsInRange,
  parseMonthYear,
  getMonthYearString,
} from '../date'

describe('Date Utilities', () => {
  describe('getMonthRange', () => {
    it('should return start and end of month', () => {
      const range = getMonthRange(2024, 1)
      expect(range.start.getFullYear()).toBe(2024)
      expect(range.start.getMonth()).toBe(0) // January
      expect(range.start.getDate()).toBe(1)
      expect(range.end.getDate()).toBe(31) // Last day of January
    })

    it('should handle February in leap year', () => {
      const range = getMonthRange(2024, 2) // 2024 is leap year
      expect(range.end.getDate()).toBe(29)
    })

    it('should handle February in non-leap year', () => {
      const range = getMonthRange(2023, 2) // 2023 is not leap year
      expect(range.end.getDate()).toBe(28)
    })

    it('should handle month 12 (December)', () => {
      const range = getMonthRange(2024, 12)
      expect(range.start.getMonth()).toBe(11) // December
      expect(range.end.getDate()).toBe(31)
    })
  })

  describe('getYearRange', () => {
    it('should return start and end of year', () => {
      const range = getYearRange(2024)
      expect(range.start.getFullYear()).toBe(2024)
      expect(range.start.getMonth()).toBe(0) // January
      expect(range.start.getDate()).toBe(1)
      expect(range.end.getFullYear()).toBe(2024)
      expect(range.end.getMonth()).toBe(11) // December
      expect(range.end.getDate()).toBe(31)
    })

    it('should work for different years', () => {
      const range = getYearRange(2023)
      expect(range.start.getFullYear()).toBe(2023)
      expect(range.end.getFullYear()).toBe(2023)
    })
  })

  describe('formatDate', () => {
    it('should format date with default format', () => {
      const date = new Date(2024, 0, 15)
      const formatted = formatDate(date)
      expect(formatted).toContain('Jan')
      expect(formatted).toContain('15')
      expect(formatted).toContain('2024')
    })

    it('should format string date', () => {
      const formatted = formatDate('2024-01-15')
      expect(formatted).toContain('Jan')
      expect(formatted).toContain('2024')
    })

    it('should accept custom format', () => {
      const date = new Date(2024, 0, 15)
      const formatted = formatDate(date, 'yyyy-MM-dd')
      expect(formatted).toBe('2024-01-15')
    })

    it('should handle ISO date strings from API without timezone shift', () => {
      // This is critical - API returns dates like "2025-11-01T00:00:00.000Z"
      // These should display as Nov 01, not Oct 31
      const isoString = '2025-11-01T00:00:00.000Z'
      const formatted = formatDate(isoString)
      expect(formatted).toContain('Nov')
      expect(formatted).toContain('01')
      expect(formatted).toContain('2025')
    })
  })

  describe('formatMonth', () => {
    it('should format year and month', () => {
      const formatted = formatMonth(2024, 1)
      expect(formatted).toContain('January')
      expect(formatted).toContain('2024')
    })

    it('should handle all months', () => {
      const months = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December']
      
      for (let i = 1; i <= 12; i++) {
        const formatted = formatMonth(2024, i)
        expect(formatted).toContain(months[i - 1])
      }
    })
  })

  describe('isDateInRange', () => {
    it('should return true for date within range', () => {
      const start = new Date(2024, 0, 1)
      const date = new Date(2024, 0, 15)
      const end = new Date(2024, 0, 31)
      expect(isDateInRange(date, start, end)).toBe(true)
    })

    it('should return true for start date', () => {
      const start = new Date(2024, 0, 1)
      const end = new Date(2024, 0, 31)
      expect(isDateInRange(start, start, end)).toBe(true)
    })

    it('should return true for end date', () => {
      const start = new Date(2024, 0, 1)
      const end = new Date(2024, 0, 31)
      expect(isDateInRange(end, start, end)).toBe(true)
    })

    it('should return false for date before range', () => {
      const start = new Date(2024, 0, 15)
      const date = new Date(2024, 0, 10)
      const end = new Date(2024, 0, 31)
      expect(isDateInRange(date, start, end)).toBe(false)
    })

    it('should return false for date after range', () => {
      const start = new Date(2024, 0, 1)
      const date = new Date(2024, 0, 31)
      const end = new Date(2024, 0, 25)
      expect(isDateInRange(date, start, end)).toBe(false)
    })
  })

  describe('getCurrentMonthYear', () => {
    it('should return current month and year', () => {
      const now = new Date()
      const result = getCurrentMonthYear()
      expect(result.year).toBe(now.getFullYear())
      expect(result.month).toBe(now.getMonth() + 1)
    })

    it('should return month as 1-indexed', () => {
      const result = getCurrentMonthYear()
      expect(result.month).toBeGreaterThanOrEqual(1)
      expect(result.month).toBeLessThanOrEqual(12)
    })
  })

  describe('getMonthName', () => {
    it('should return month name for valid month', () => {
      expect(getMonthName(1)).toBe('January')
      expect(getMonthName(6)).toBe('June')
      expect(getMonthName(12)).toBe('December')
    })

    it('should return all month names', () => {
      const months = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December']
      
      for (let i = 1; i <= 12; i++) {
        expect(getMonthName(i)).toBe(months[i - 1])
      }
    })
  })

  describe('getMonthsInRange', () => {
    it('should return months within same month', () => {
      const months = getMonthsInRange(2024, 1, 2024, 1)
      expect(months).toHaveLength(1)
      expect(months[0]).toEqual({ year: 2024, month: 1 })
    })

    it('should return months across year boundary', () => {
      const months = getMonthsInRange(2023, 11, 2024, 2)
      expect(months).toHaveLength(4) // Nov, Dec 2023, Jan, Feb 2024
      expect(months[0]).toEqual({ year: 2023, month: 11 })
      expect(months[3]).toEqual({ year: 2024, month: 2 })
    })

    it('should return all months in a year', () => {
      const months = getMonthsInRange(2024, 1, 2024, 12)
      expect(months).toHaveLength(12)
      expect(months[0].month).toBe(1)
      expect(months[11].month).toBe(12)
    })

    it('should handle multi-year range', () => {
      const months = getMonthsInRange(2024, 1, 2026, 1)
      expect(months).toHaveLength(25) // Jan 2024 - Jan 2026
      expect(months[0]).toEqual({ year: 2024, month: 1 })
      expect(months[24]).toEqual({ year: 2026, month: 1 })
    })
  })

  describe('parseMonthYear', () => {
    it('should parse valid YYYY-MM format', () => {
      const result = parseMonthYear('2024-01')
      expect(result).toEqual({ year: 2024, month: 1 })
    })

    it('should parse single-digit month', () => {
      const result = parseMonthYear('2024-3')
      expect(result).toEqual({ year: 2024, month: 3 })
    })

    it('should parse zero-padded month', () => {
      const result = parseMonthYear('2024-09')
      expect(result).toEqual({ year: 2024, month: 9 })
    })

    it('should return null for invalid format', () => {
      expect(parseMonthYear('01-2024')).toBeNull()
      expect(parseMonthYear('2024')).toBeNull()
      expect(parseMonthYear('invalid')).toBeNull()
    })

    it('should return null for invalid month', () => {
      expect(parseMonthYear('2024-00')).toBeNull()
      expect(parseMonthYear('2024-13')).toBeNull()
    })

    it('should handle invalid month number gracefully', () => {
      expect(parseMonthYear('2024-abc')).toBeNull()
    })
  })

  describe('getMonthYearString', () => {
    it('should return zero-padded month string', () => {
      expect(getMonthYearString(2024, 1)).toBe('2024-01')
      expect(getMonthYearString(2024, 9)).toBe('2024-09')
    })

    it('should format all months with padding', () => {
      for (let i = 1; i <= 12; i++) {
        const result = getMonthYearString(2024, i)
        expect(result).toMatch(/2024-\d{2}/)
        const month = parseInt(result.split('-')[1])
        expect(month).toBe(i)
      }
    })

    it('should work for different years', () => {
      expect(getMonthYearString(2023, 5)).toBe('2023-05')
      expect(getMonthYearString(2025, 12)).toBe('2025-12')
    })
  })

  describe('Integration Tests', () => {
    it('should parse and format month year correctly', () => {
      const str = getMonthYearString(2024, 5)
      const parsed = parseMonthYear(str)
      expect(parsed).toEqual({ year: 2024, month: 5 })
    })

    it('should verify date is in month range', () => {
      const range = getMonthRange(2024, 1)
      const date = new Date(2024, 0, 15)
      expect(isDateInRange(date, range.start, range.end)).toBe(true)
    })

    it('should verify date is not in month range', () => {
      const range = getMonthRange(2024, 1)
      const date = new Date(2024, 1, 15) // February
      expect(isDateInRange(date, range.start, range.end)).toBe(false)
    })
  })
})

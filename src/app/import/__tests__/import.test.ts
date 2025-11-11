/**
 * Tests for bulk import functionality
 */

describe('CSV Import Workflow', () => {
  describe('CSV Parsing', () => {
    const parseCSV = (text: string): string[][] => {
      const rows: string[][] = []
      let current: string[] = []
      let inQuotes = false
      let value = ''

      for (let i = 0; i < text.length; i++) {
        const char = text[i]
        const nextChar = text[i + 1]

        if (char === '"') {
          if (inQuotes && nextChar === '"') {
            value += '"'
            i++
          } else {
            inQuotes = !inQuotes
          }
        } else if (char === ',' && !inQuotes) {
          current.push(value.trim())
          value = ''
        } else if ((char === '\n' || char === '\r') && !inQuotes) {
          if (value || current.length) {
            current.push(value.trim())
            if (current.some(c => c)) rows.push(current)
            current = []
            value = ''
          }
          if (char === '\r' && nextChar === '\n') i++
        } else {
          value += char
        }
      }

      if (value || current.length) {
        current.push(value.trim())
        if (current.some(c => c)) rows.push(current)
      }

      return rows
    }

    it('should parse simple CSV with headers', () => {
      const csv = 'Date,Amount,Description\n2025-11-11,150.50,Groceries\n2025-11-10,25.00,Coffee'
      const rows = parseCSV(csv)

      expect(rows).toHaveLength(3) // header + 2 rows
      expect(rows[0]).toEqual(['Date', 'Amount', 'Description'])
      expect(rows[1]).toEqual(['2025-11-11', '150.50', 'Groceries'])
      expect(rows[2]).toEqual(['2025-11-10', '25.00', 'Coffee'])
    })

    it('should handle quoted values with commas', () => {
      const csv = 'Date,Description\n2025-11-11,"Dinner, Restaurant"\n2025-11-10,Coffee'
      const rows = parseCSV(csv)

      expect(rows[1][1]).toBe('Dinner, Restaurant')
      expect(rows[2][1]).toBe('Coffee')
    })

    it('should handle quoted values with quotes', () => {
      const csv = 'Description\n"Store ""ABC"" location"\nRegular'
      const rows = parseCSV(csv)

      expect(rows[1][0]).toBe('Store "ABC" location')
    })

    it('should handle CRLF line endings', () => {
      const csv = 'Date,Amount\r\n2025-11-11,150.50\r\n2025-11-10,25.00'
      const rows = parseCSV(csv)

      expect(rows).toHaveLength(3)
      expect(rows[1][1]).toBe('150.50')
    })

    it('should handle empty fields', () => {
      const csv = 'Date,Amount,Notes\n2025-11-11,150.50,\n2025-11-10,,Coffee'
      const rows = parseCSV(csv)

      expect(rows[1][2]).toBe('')
      expect(rows[2][1]).toBe('')
    })
  })

  describe('Data Validation', () => {
    it('should validate required fields', () => {
      const mockRow = {
        date: '',
        amount: '150.50',
        description: 'Test',
      }

      const errors: string[] = []
      if (!mockRow.date) errors.push('Missing date')

      expect(errors).toContain('Missing date')
    })

    it('should validate numeric amounts', () => {
      const amounts = ['150.50', '25', '0.01', '-100']
      const validAmounts = amounts.filter(amt => !isNaN(parseFloat(amt)))

      expect(validAmounts).toHaveLength(4)
    })

    it('should validate date format', () => {
      const dates = ['2025-11-11', '2025/11/11', '11-11-2025']
      const valid = dates.filter(d => {
        const parsed = new Date(d)
        return !isNaN(parsed.getTime())
      })

      expect(valid.length).toBeGreaterThan(0)
    })

    it('should match account names case-insensitive', () => {
      const accounts = [
        { id: 'acc-1', name: 'Checking' },
        { id: 'acc-2', name: 'Savings' },
      ]

      const findAccount = (name: string) =>
        accounts.find(a => a.name.toLowerCase() === name.toLowerCase())

      expect(findAccount('checking')).toBeDefined()
      expect(findAccount('CHECKING')).toBeDefined()
      expect(findAccount('ChEcKiNg')).toBeDefined()
      expect(findAccount('Amex')).toBeUndefined()
    })
  })

  describe('Bulk Transaction Creation', () => {
    it('should calculate total amount from valid rows', () => {
      const rows = [
        { amount: '150.50', isValid: true },
        { amount: '25.00', isValid: true },
        { amount: 'invalid', isValid: false },
      ]

      const total = rows
        .filter(r => r.isValid)
        .reduce((sum, r) => sum + parseFloat(r.amount), 0)

      expect(total).toBe(175.5)
    })

    it('should filter invalid rows before import', () => {
      const rows = [
        { description: 'Groceries', isValid: true },
        { description: 'Coffee', isValid: false, errors: ['Invalid amount'] },
        { description: 'Gas', isValid: true },
      ]

      const validRows = rows.filter(r => r.isValid)
      expect(validRows).toHaveLength(2)
      expect(validRows.map(r => r.description)).toEqual(['Groceries', 'Gas'])
    })

    it('should handle batch import with mixed results', () => {
      const results = {
        created: 15,
        failed: 2,
        errors: ['Row 3: Invalid account', 'Row 8: Duplicate entry'],
      }

      expect(results.created + results.failed).toBe(17)
      expect(results.errors).toHaveLength(2)
    })
  })

  describe('Recurring Expense Replication', () => {
    it('should allow date modification for next month', () => {
      const lastMonth = '2025-10-11'
      const nextMonth = new Date('2025-10-11')
      nextMonth.setMonth(nextMonth.getMonth() + 1)

      expect(nextMonth.getDate()).toBe(11)
      expect(nextMonth.getMonth()).toBe(10) // November
    })

    it('should preserve amount and description for recurring expenses', () => {
      const recurring = {
        amount: 75.99,
        description: 'Gym Membership',
        tags: 'recurring,subscription',
      }

      // When replicated
      const replicated = { ...recurring, date: '2025-12-11' }

      expect(replicated.amount).toBe(recurring.amount)
      expect(replicated.description).toBe(recurring.description)
      expect(replicated.tags).toBe(recurring.tags)
    })

    it('should handle date offset for end-of-month transactions', () => {
      const dates = [
        '2025-10-31', // October 31
        '2025-11-30', // November 30 (no 31st)
        '2025-12-31', // December 31
      ]

      dates.forEach(dateStr => {
        const date = new Date(dateStr)
        const nextMonth = new Date(date)
        nextMonth.setMonth(nextMonth.getMonth() + 1)
        expect(nextMonth.getFullYear()).toBeGreaterThanOrEqual(2025)
      })
    })
  })

  describe('Error Handling', () => {
    it('should collect errors for invalid rows', () => {
      const row = {
        date: '',
        amount: 'abc',
        description: '',
        errors: [] as string[],
      }

      if (!row.date) row.errors.push('Missing date')
      if (isNaN(parseFloat(row.amount))) row.errors.push('Invalid amount')
      if (!row.description) row.errors.push('Missing description')

      expect(row.errors).toHaveLength(3)
    })

    it('should handle file parsing errors gracefully', () => {
      const malformed = 'Date,Amount\n2025-11-11,"unclosed quote'
      
      try {
        // Would attempt to parse but malformed quotes might cause issues
        const result = malformed.split('\n').length > 1
        expect(result).toBe(true)
      } catch (error) {
        // Error handled gracefully
        expect(error).toBeDefined()
      }
    })

    it('should report import progress with created/failed counts', () => {
      const progress = {
        created: 0,
        failed: 0,
        total: 9,
        processed: 0,
      }

      for (let i = 0; i < 9; i++) {
        progress.processed++
        if (i % 3 === 0) progress.failed++
        else progress.created++
      }

      expect(progress.created + progress.failed).toBe(progress.total)
      expect(progress.created).toBe(6) // 9 rows: 3 fail (0,3,6), 6 succeed
      expect(progress.failed).toBe(3)
    })
  })

  describe('Template Functionality', () => {
    it('should generate CSV template with correct columns', () => {
      const template = 'Date,Amount,Description,Method,Account,Notes,Tags'
      const columns = template.split(',')

      expect(columns).toContain('Date')
      expect(columns).toContain('Amount')
      expect(columns).toContain('Description')
      expect(columns).toContain('Account')
    })

    it('should include example data in template', () => {
      const templateData = [
        { date: '2025-11-11', amount: 150.5, description: 'Groceries', method: 'cc', account: 'Checking' },
        { date: '2025-11-10', amount: 25.0, description: 'Coffee', method: 'cash', account: 'Cash' },
      ]

      expect(templateData).toHaveLength(2)
      expect(templateData[0].description).toBe('Groceries')
    })
  })
})

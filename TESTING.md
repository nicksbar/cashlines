# Cashlines Testing Guide

This project uses **Jest** and **ts-jest** for unit and integration tests. Tests verify business logic, API routes, and data validation across the income tracking system.

## Quick Start

```bash
# Run all tests once
npm test

# Run tests in watch mode (re-run on file changes)
npm test:watch

# Run tests with coverage report
npm test:coverage
```

## Test Structure

```
src/
├── __tests__/
│   ├── testUtils.ts         # Test utilities, factories, and helpers
│   └── testUtils.test.ts    # Tests for test utilities
├── lib/
│   └── __tests__/
│       ├── validation.test.ts  # Zod validation schema tests
│       └── money.test.ts       # Money formatting and calculation tests
└── app/
    └── api/
        └── __tests__/
            └── income.test.ts   # API route tests (mocked Prisma)
```

## Test Categories

### 1. Validation Tests (`src/lib/__tests__/validation.test.ts`)

Test Zod validation schemas for all models:

- **Income**: Validates field requirements, ranges, and calculations
  - `incomeCreateSchema`: Required grossAmount, taxes, deductions, source, accountId
  - `incomeUpdateSchema`: All fields optional for partial updates
  - Rejects negative amounts and missing required fields
  - Allows optional tags and notes

- **Accounts**: Validates account types and properties
  - `accountCreateSchema`: Requires name and valid type
  - `accountUpdateSchema`: All fields optional
  - Validates enum types: checking, savings, credit_card, cash, other

- **Transactions**: Validates spend tracking
  - `transactionCreateSchema`: Requires amount, description, account
  - Rejects zero or negative amounts
  - Defaults method to 'cc' if not provided

### 2. Money Utilities Tests (`src/lib/__tests__/money.test.ts`)

Test currency formatting and financial calculations:

- **formatCurrency()**: Format amounts to USD with proper localization
- **parseAmount()**: Parse currency strings and numbers
- **roundAmount()**: Round to specified decimal places
- **calculatePercent()**: Calculate X% of total (e.g., 50% of 1000 = 500)
- **calculatePercentOf()**: Calculate what % amount is of total (e.g., 500 of 1000 = 50%)
- **sumAmounts()**: Sum arrays of amounts with proper rounding
- **groupByProperty()**: Group items by key for aggregations

### 3. API Route Tests (`src/app/api/__tests__/income.test.ts`)

Test API endpoints with mocked Prisma client:

- **POST /api/income**: Create new income entries
  - Validates account ownership
  - Stores tags as JSON
  - Returns created income with all fields
  
- **PATCH /api/income/[id]**: Update existing income
  - Supports partial updates (any fields)
  - Recalculates derived fields if needed
  
- **DELETE /api/income/[id]**: Remove income entries
  - Handles non-existent IDs gracefully
  
- **GET /api/income**: Fetch income with filters
  - Filter by date range (month/year)
  - Filter by account
  - Filter by source

### 4. Test Utilities (`src/__tests__/testUtils.ts`)

Reusable factories and helpers for creating test data:

#### Mock Factories

```typescript
// Create test data with defaults
const income = createMockIncome()
const income2 = createMockIncome({ source: 'Freelance', grossAmount: 1000 })
const tx = createMockTransaction()
const account = createMockAccount({ name: 'Savings' })
```

#### Test Data Generators

```typescript
// Generate monthly income for scenario testing
const monthlyIncome = testData.createMonthlyIncome(11, 2025, 3)

// Create split allocation for testing money routing
const splits = testData.createSplitAllocation()

// Generate full account set
const accounts = testData.createAccountSet()
```

#### Assertions

```typescript
// Verify income calculation is correct
if (assertions.isValidIncome(income)) {
  // grossAmount - taxes - preTax - postTax = netAmount ✓
}

// Verify transaction splits sum correctly
if (assertions.isValidAllocation(transaction, splits)) {
  // All splits add up to transaction amount ✓
}

// Verify date is in range
if (assertions.isDateInRange(date, start, end)) {
  // Date is within range ✓
}
```

## Test Coverage

Current test coverage:

```
src/lib/money.ts         - 100% (all utilities tested)
src/lib/validation.ts    - 95%+ (all schemas tested)
src/app/api/income       - 90%+ (all CRUD operations tested)
```

## Running Specific Tests

```bash
# Run only validation tests
npm test -- src/lib/__tests__/validation.test.ts

# Run only money utility tests
npm test -- src/lib/__tests__/money.test.ts

# Run only API tests
npm test -- src/app/api/__tests__/income.test.ts

# Run tests matching a pattern
npm test -- --testNamePattern="Income"
```

## Adding New Tests

### Template for new test files:

```typescript
// src/lib/__tests__/myfeature.test.ts
describe('My Feature', () => {
  describe('Function Name', () => {
    it('should do something', () => {
      // Arrange
      const input = { /* ... */ }
      
      // Act
      const result = myFunction(input)
      
      // Assert
      expect(result).toEqual(expectedValue)
    })

    it('should handle edge case', () => {
      expect(() => myFunction(null)).toThrow()
    })
  })
})
```

### Using test utilities:

```typescript
import { createMockIncome, assertions } from '../__tests__/testUtils'

it('should calculate income correctly', () => {
  const income = createMockIncome({
    grossAmount: 5000,
    taxes: 1000,
    preTaxDeductions: 200,
    postTaxDeductions: 100,
    netAmount: 3700
  })
  
  expect(assertions.isValidIncome(income)).toBe(true)
})
```

## Mocking Strategy

### Prisma Client

Tests mock the Prisma client using Jest `jest.mock()`:

```typescript
jest.mock('@/lib/db', () => ({
  prisma: {
    income: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}))
```

This allows testing API logic without a real database.

### Setting Mock Return Values

```typescript
;(prisma.income.create as jest.Mock).mockResolvedValue(mockIncome)
;(prisma.income.findMany as jest.Mock).mockResolvedValue([mockIncome])
;(prisma.income.delete as jest.Mock).mockRejectedValue(new Error('not found'))
```

## Common Test Patterns

### Testing Validation

```typescript
it('should reject invalid data', () => {
  const invalid = { amount: -100, ...other }
  const result = schema.safeParse(invalid)
  expect(result.success).toBe(false)
})
```

### Testing Calculations

```typescript
it('should calculate with precision', () => {
  expect(calculatePercent(33.33, 1000)).toBe(333.3)
  expect(calculatePercentOf(333.3, 1000)).toBe(33.33)
})
```

### Testing API with Mocks

```typescript
it('should create with database call', async () => {
  ;(prisma.income.create as jest.Mock).mockResolvedValue(mockIncome)
  
  const result = await createIncome(data)
  
  expect(prisma.income.create).toHaveBeenCalledWith({
    data: expect.objectContaining({ grossAmount: 5000 })
  })
  expect(result.id).toBe(mockIncome.id)
})
```

## Debugging Tests

### Run with verbose output

```bash
npm test -- --verbose
```

### Run single test

```bash
npm test -- --testNamePattern="exact test name"
```

### Debug with Node inspector

```bash
node --inspect-brk node_modules/jest/bin/jest.js --runInBand
```

Then open Chrome DevTools at `chrome://inspect`

## Continuous Integration

Tests run on every push and pull request. Add to CI/CD:

```yaml
# Example GitHub Actions
- name: Run tests
  run: npm test -- --coverage
```

## Next Steps

Consider adding:

- [ ] E2E tests with Playwright or Cypress for UI workflows
- [ ] Performance tests for large dataset queries
- [ ] Security tests for auth and data access
- [ ] Contract tests for API endpoints
- [ ] Visual regression tests for components

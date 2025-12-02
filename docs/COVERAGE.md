# Test Coverage Policy

## Overview

Cashlines maintains strict test coverage thresholds to ensure code quality and reliability. Coverage is measured and enforced at multiple levels using Jest.

## Current Coverage

| Metric | Global | `lib/` | `app/api/` |
|--------|--------|--------|-----------|
| **Statements** | 50% | 90% | 75% |
| **Branches** | 65% | 85% | 70% |
| **Functions** | 80% | 95% | 85% |
| **Lines** | 50% | 90% | 75% |

## Coverage Thresholds

### Global Thresholds (All Code)
- **Statements**: 50% - Basic coverage of all code paths
- **Branches**: 65% - Coverage of conditional logic
- **Functions**: 80% - Most functions should be tested
- **Lines**: 50% - Majority of lines executed in tests

### `src/lib/` Thresholds (Utilities & Logic)
- **Statements**: 90% - Nearly all utility code covered
- **Branches**: 85% - Conditional logic thoroughly tested
- **Functions**: 95% - Almost all functions tested
- **Lines**: 90% - Comprehensive coverage

### `src/app/api/` Thresholds (API Routes)
- **Statements**: 75% - Most API endpoints tested
- **Branches**: 70% - API logic branches covered
- **Functions**: 85% - API handlers tested
- **Lines**: 75% - Main API paths covered

## Why These Thresholds?

### Strict on Core Logic (`src/lib/`)
- 90%+ coverage ensures utilities are reliable
- These functions are reused across the application
- Higher confidence in calculations and data processing

### Strict on APIs (`src/app/api/`)
- 75%+ coverage ensures endpoints work correctly
- API tests validate data contracts
- Protects against regressions in data access

### Relaxed on UI (`src/app/[pages]/*.tsx`)
- Pages are harder to test with Jest
- E2E tests (Playwright) cover page functionality
- Jest coverage focused on critical logic

## Running Coverage

```bash
# Generate coverage report
npm test -- --coverage

# Generate detailed HTML report
npm test -- --coverage --collectCoverageFrom="src/**/*.ts(x)"

# View coverage in terminal
npm test -- --coverage --verbose

# Run coverage for specific files
npm test -- --coverage src/lib/
```

## Coverage Report Location

After running tests with `--coverage`:
```
coverage/
├── lcov.info           # LCOV format (for Codecov)
├── coverage-final.json # Machine-readable summary
└── lcov-report/        # HTML report
    └── index.html      # Open in browser
```

View the HTML report:
```bash
open coverage/lcov-report/index.html  # macOS
xdg-open coverage/lcov-report/index.html  # Linux
start coverage/lcov-report/index.html  # Windows
```

## What Gets Measured

### Included
- `src/**/*.ts` - TypeScript files
- `src/**/*.tsx` - React components
- API routes and handlers
- Utility functions
- Business logic

### Excluded
- `src/**/__tests__/**` - Test files themselves
- `src/**/*.d.ts` - Type definitions
- `src/app/layout.tsx` - Root layout (hard to test)
- `src/app/page.tsx` - Dashboard (mostly E2E tested)

## Enforcing Thresholds

### In GitHub Actions
Coverage thresholds are automatically checked:
1. Tests run with `--coverage` flag
2. Jest compares against thresholds
3. Build fails if coverage drops below thresholds
4. Coverage reports uploaded to Codecov

### Locally
Run before committing:
```bash
npm test -- --coverage
```

If thresholds are not met:
1. You'll see a coverage summary table
2. Lines show what's uncovered
3. Fix by adding tests for untested code
4. Re-run to verify thresholds pass

## Adding Tests to Improve Coverage

When you need to improve coverage:

1. **Identify uncovered code**
   ```bash
   npm test -- --coverage
   # Look for files below thresholds
   ```

2. **Add tests for gaps**
   ```typescript
   // src/lib/__tests__/myfunction.test.ts
   test('should handle edge case', () => {
     const result = myFunction(edgeCase)
     expect(result).toBe(expected)
   })
   ```

3. **Re-run coverage**
   ```bash
   npm test -- --coverage
   ```

4. **Verify thresholds pass**

## Coverage by Module

Current coverage by major modules:

### ✅ High Coverage (>90%)
- `lib/validation.ts` - 100%
- `lib/money.ts` - 100%
- `lib/sbnl.ts` - 100%
- `lib/creditcard.ts` - 100%
- `lib/constants.ts` - 100%

### ✅ Good Coverage (70-89%)
- `lib/forecast.ts` - 85%
- `app/api/data/reset/route.ts` - 84%
- `app/api/accounts/route.ts` - 75%+
- `app/api/income/route.ts` - 75%+

### ⚠️ Lower Coverage (<70%)
- `app/api/data/seed/route.ts` - 10% (complex seed logic)
- Page components - 0-30% (E2E tested instead)

## Improving Seed Coverage

The seed route has low coverage because:
- It's called during data initialization
- Tested via E2E (not unit tests)
- Complex branching logic
- Not critical for user functionality

Can be improved by:
- Adding unit tests for seed helpers
- Breaking seed into testable functions
- Mocking database calls

## Continuous Coverage Tracking

### Codecov Integration
- Coverage reports uploaded to Codecov
- PR comments show coverage impact
- Trend tracking over time
- Historical comparison

### Actions
After tests complete:
1. Coverage data sent to Codecov
2. PR gets coverage badge
3. Comments show:
   - Overall coverage change
   - Per-file impact
   - Coverage trends

## Coverage Targets by Year

| Period | Statements | Branches | Functions | Lines |
|--------|------------|----------|-----------|-------|
| 2025 Q4 | 50% | 65% | 80% | 50% |
| 2026 Q1 | 55% | 70% | 82% | 55% |
| 2026 Q2 | 60% | 75% | 85% | 60% |

## Best Practices

### ✅ Do This
- Write tests alongside code
- Test edge cases and error paths
- Use meaningful test names
- Test business logic thoroughly
- Mock external dependencies

### ❌ Don't Do This
- Write tests only to hit coverage targets
- Test trivial getters/setters
- Skip testing error paths
- Ignore coverage reports
- Commit code below thresholds

## Troubleshooting

### Coverage is lower than expected
1. Check `collectCoverageFrom` in `jest.config.ts`
2. Ensure test files are excluded
3. Run `npm test -- --coverage` to recalculate
4. Check for unreachable code paths

### Coverage thresholds failing
1. Run `npm test -- --coverage`
2. Identify files below thresholds
3. Add tests for uncovered lines
4. Check error messages for specific gaps

### Codecov not receiving reports
1. Check workflow includes coverage upload
2. Verify `coverage/coverage-final.json` exists
3. Check GitHub token has repo access
4. Review Codecov action logs

## Resources

- [Jest Coverage Docs](https://jestjs.io/docs/en/coverage)
- [Codecov Docs](https://docs.codecov.com)
- [Testing Best Practices](./E2E_TESTING.md)
- [Development Guide](./DEVELOPMENT.md)

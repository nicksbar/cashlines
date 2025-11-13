# Development Guide

Complete guide for contributing to Cashlines development.

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- SQLite3 (or PostgreSQL for production)

### Local Development Setup

```bash
# Clone and install
git clone https://github.com/nicksbar/cashlines.git
cd cashlines
npm install

# Setup environment
cp .env.example .env
# Update DATABASE_URL if needed

# Initialize database
npx prisma db push

# Load demo data (optional)
npm run seed

# Start development server
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000)

## Project Structure

### `/src/app` - Pages and Routes
- **Dashboard** (`/`) - Main overview with DateRangeSelector
- **Accounts** (`/accounts`) - Account management
- **Income** (`/income`) - Income tracking and history
- **Transactions** (`/transactions`) - Expense tracking
- **Routes** (`/routes`) - Money allocation visualization
- **Rules** (`/rules`) - Auto-routing rule management
- **Templates** (`/templates`) - Save/reuse entry templates
- **People** (`/people`) - Household member management
- **Recurring Expenses** (`/recurring-expenses`) - Bill forecasting
- **Insights** (`/insights`) - Financial analytics
- **Settings** (`/settings`) - User preferences
- **Data Management** (`/data-management`) - Reset/seed utilities
- **Import** (`/import`) - CSV import stub
- **API** (`/api/*`) - RESTful endpoints

### `/src/components` - React Components
- **UI Components** (`/ui`) - shadcn/ui wrappers
- **DateRangeSelector** - Reusable date range picker with prev/next
- **FinancialInsightsWidget** - Dashboard metrics preview
- **HouseholdSelector** - Switch between households
- **IncomeForm/IncomeList** - Income entry and display
- **TransactionForm/TransactionList** - Transaction entry and display
- **RecurringExpensesForecast** - Bill forecast widget
- **QuickExpenseEntry** - Modal for fast bill logging
- **TemplateSelector** - Select saved templates
- **ThemeProvider/ThemeToggle** - Theme management
- **InfoTooltip** - Help tooltips with modals

### `/src/lib` - Utilities
- **db.ts** - Prisma client initialization
- **validation.ts** - Zod schemas for all models
- **money.ts** - Currency formatting and calculations
- **date.ts** - Date utilities and range calculations
- **constants.ts** - App-wide constants and enums
- **templates.ts** - Template save/load utilities
- **sbnl.ts** - SBNL allocation logic
- **forecast.ts** - Recurring expense forecasting
- **financial-analysis.ts** - Analytics calculations
- **creditcard.ts** - Credit card specific logic
- **UserContext.tsx** - User and household context
- **utils.ts** - General utilities

### `/prisma` - Database
- **schema.prisma** - Database schema (13 models)
- **migrations/** - Auto-generated migrations

## Development Workflow

### 1. Create a New Feature

**Database Changes:**
```bash
# 1. Update /prisma/schema.prisma
# 2. Create migration
npx prisma migrate dev --name add_feature_name
# 3. Type-check the migration
```

**API Endpoint:**
```bash
# Create /src/app/api/[resource]/route.ts
# Use NextRequest/NextResponse from next/server
# Add Zod validation from @/lib/validation
# Return type-safe responses
```

**Page Component:**
```bash
# Create /src/app/[feature]/page.tsx
# Use 'use client' directive
# Import from @/components, @/lib
# Include dark mode classes (dark:)
# Use Card, Button, etc. from shadcn/ui
```

**Tests:**
```bash
# Create __tests__/[feature].test.ts next to source
# Export test utilities from @/__tests__/testUtils
# Use Jest + ts-jest configuration
# Run: npm test
```

### 2. Add a Component

```bash
# Create /src/components/[Component].tsx
# Export as named or default
# Include TypeScript interfaces
# Use shadcn/ui for UI consistency
# Test dark mode support
```

Example component structure:
```tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface ComponentProps {
  title: string
  onAction?: () => void
}

export function Component({ title, onAction }: ComponentProps) {
  // Implementation
  return (
    <Card className="dark:bg-slate-800">
      {/* Content */}
    </Card>
  )
}
```

### 3. Update an Existing Feature

- Follow the same structure as existing code
- Update type definitions in validation.ts
- Update tests to match new behavior
- Verify dark mode support
- Run full test suite before committing

### 4. Fix a Bug

```bash
# 1. Identify the issue (page, API, component, lib)
# 2. Write test that reproduces the bug
# 3. Fix the bug
# 4. Verify test passes
# 5. Run full test suite: npm test
# 6. Commit: git commit -m "Fix: description"
```

## Code Style

### TypeScript
- Strict mode enabled
- 100% type coverage required
- Use interfaces for props and models
- Avoid `any` type

### React
- Functional components with hooks
- Use `useCallback` for async functions
- Proper dependency arrays
- 'use client' directive for client components

### Styling
- Tailwind CSS classes only
- Dark mode with `dark:` prefix
- Consistent color palette:
  - Backgrounds: `bg-slate-50/800/900`, `dark:bg-slate-900/800/700`
  - Text: `text-slate-900/600`, `dark:text-slate-100/400`
  - Borders: `border-slate-200/300`, `dark:border-slate-700/600`

### Imports
- Clean imports: `@/components`, `@/lib`, `@/app/...`
- Group imports: React, external libs, internal
- No relative paths (`../../../`)

### Testing
- Test files in `__tests__` folders
- Jest + ts-jest configuration
- Aim for >80% coverage on critical paths
- Test both happy path and error cases

## Git Workflow

### Commit Messages
```
Short summary (50 chars max)

Detailed explanation if needed:
- What changed
- Why it changed
- Any impacts or notes

Related issue/PR if applicable
```

### Branch Strategy
- `main` - Production-ready code
- `development` - Integration branch
- `feature/*` - Feature branches
- All work merged via pull requests

## Testing

### Run Tests
```bash
npm test                 # Run all tests
npm test -- --watch     # Watch mode for development
npm test -- --coverage  # Coverage report
```

### Test Structure
```typescript
describe('Feature Name', () => {
  it('should do something', () => {
    // Arrange
    const input = 'value'
    
    // Act
    const result = processInput(input)
    
    // Assert
    expect(result).toBe('expected')
  })
})
```

## Build & Deployment

### Local Build
```bash
npm run build            # Production build
npm start                # Run production server
```

### Docker
```bash
docker-compose up -d     # Start containerized app
docker-compose down      # Stop containers
```

### Requirements
- No TypeScript errors
- All tests passing (399)
- No warnings during build
- Dark mode tested

## Debugging

### Browser DevTools
- React DevTools extension for component inspection
- Network tab for API calls
- Console for errors/warnings

### Server Logs
```bash
# Development server logs show all requests
npm run dev

# Check API response structure
# Use browser Network tab to inspect
```

### Database
```bash
# Open Prisma Studio
npx prisma studio

# View schema
npx prisma generate
```

## Performance Tips

1. **Code Splitting**: Next.js automatically splits pages
2. **Image Optimization**: Use next/image for images
3. **Database Queries**: Use Prisma relations properly
4. **Component Memoization**: Use React.memo sparingly
5. **Bundle Size**: Monitor with `npm run build`

## Common Tasks

### Add a New Date Range Type
1. Update `DateRangeType` in `DateRangeSelector.tsx`
2. Add calculation logic in `getDatesForRange()`
3. Add button in component JSX
4. Test navigation (prev/next)

### Add a New Validation Rule
1. Add Zod schema in `src/lib/validation.ts`
2. Use in API route handlers
3. Update type imports
4. Test error cases

### Add a New API Endpoint
1. Create route handler in `src/app/api/[resource]/route.ts`
2. Add Zod validation
3. Add tests in `__tests__/[resource].test.ts`
4. Document in AGENTS.md
5. Add to relevant component if needed

### Integrate a New Component
1. Create component in `src/components/`
2. Add TypeScript types
3. Use in page or parent component
4. Test dark mode
5. Add to Storybook (optional)

## Troubleshooting

### Build Errors
- Check TypeScript: `npm run build`
- Verify imports use `@/` pattern
- Check dark mode classes
- Run tests: `npm test`

### Test Failures
- Read error message carefully
- Check test file for setup issues
- Verify mocks are correct
- Run in watch mode: `npm test -- --watch`

### Runtime Errors
- Check browser console
- Check server logs (npm run dev)
- Verify API responses in Network tab
- Check database state in Prisma Studio

## Resources

- **Next.js**: https://nextjs.org/docs
- **React**: https://react.dev
- **Tailwind**: https://tailwindcss.com
- **Prisma**: https://www.prisma.io/docs
- **shadcn/ui**: https://ui.shadcn.com
- **Zod**: https://zod.dev
- **Jest**: https://jestjs.io

## Getting Help

1. Check existing GitHub Issues
2. Review AGENTS.md for architecture
3. Look at similar existing features
4. Check test files for examples
5. Open a GitHub Issue with details

---

**Last Updated**: November 2025
**Status**: Active development with clear processes

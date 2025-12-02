# Cashlines Agent Instructions

For GitHub Copilot agents and automated development tools.

## Project Overview

**Cashlines** is a self-hostable personal money tracking application built with Next.js 14, TypeScript, Tailwind CSS, and Prisma ORM.

- **Repository**: github.com/nicksbar/cashlines
- **Language**: TypeScript (100% type-safe)
- **Database**: SQLite (dev), PostgreSQL (production)
- **UI Framework**: Next.js 14 App Router, shadcn/ui, Tailwind CSS
- **Current Status**: MVP complete with core features, template system, theme support

## Quick Facts

- **12 Main Features**: Dashboard, Accounts, Income, Transactions, Routes, Rules, Templates, Import, People, Recurring Expenses, Insights, Data Management
- **Recent Additions**: Payment Account Tracking (debt payment analytics), DateRangeSelector component, Financial Insights with analytics, People/Household support, Recurring Expenses forecasting
- **Test Coverage**: 545 tests (100% passing)
- **Build Status**: Successful (19 pages)
- **Dark Mode**: Full support throughout entire application
- **Import Path**: Fixed tsconfig with '@/*' resolving to './src/*' for clean imports

## Architecture

### Project Structure

```
/src
  /app
    /api           - RESTful API endpoints
      /accounts, /income, /transactions, /rules, /templates, /people, 
      /households, /settings, /reports, /recurring-expenses, /export, /data
    /accounts      - Account management page
    /income        - Income tracking page
    /transactions  - Transaction tracking page
    /routes        - Money routing visualization
    /rules         - Routing rules management
    /templates     - Template management
    /people        - Household member management (with [id] detail page)
    /recurring-expenses - Forecast and manage recurring bills
    /insights      - Financial analytics and detailed analysis
    /settings      - User settings and preferences
    /data-management - Data reset and seed utilities
    /import        - Data import page
    page.tsx       - Dashboard with DateRangeSelector
    layout.tsx     - Root layout with theme provider
  /components
    /ui            - shadcn/ui component wrappers (button, card, dialog, input, label, select, tabs)
    DateRangeSelector.tsx - Reusable date range picker with prev/next navigation
    FinancialInsightsWidget.tsx - Key metrics preview for dashboard
    HouseholdSelector.tsx - Switch between households
    IncomeForm.tsx - Income entry with deductions
    IncomeList.tsx - Income history display
    InfoTooltip.tsx - Contextual help component with modals
    QuickExpenseEntry.tsx - Modal for quick transaction entry
    RecurringExpensesForecast.tsx - Forecast widget for recurring bills
    TemplateSelector.tsx - Select and apply saved templates
    ThemeProvider.tsx - next-themes wrapper
    ThemeToggle.tsx - Theme switcher (light/dark/auto)
    TransactionForm.tsx - Transaction entry with splitting
    TransactionList.tsx - Transaction history with filtering
  /lib
    db.ts          - Prisma client
    validation.ts  - Zod schemas for all models
    money.ts       - Currency formatting and calculations
    date.ts        - Date utilities and range calculations
    constants.ts   - App constants and enums
    templates.ts   - Template save/load utilities
    sbnl.ts        - Smart Budget Need/Want/Debt/Tax/Savings allocation
    forecast.ts    - Recurring expense forecasting logic
    financial-analysis.ts - Advanced analytics and insights
    creditcard.ts  - Credit card specific calculations
    UserContext.tsx - User and household context provider
    utils.ts       - General utilities
/prisma
  schema.prisma    - Full database schema with 13 models
  migrations/      - All database migrations (auto-generated)
```

### Key Models

1. **User** - Single user with data protection flag (multi-user ready)
2. **Person** - Household member for tracking income/expenses (role: primary, spouse, child, etc.)
3. **Account** - Funding source (checking, savings, credit card, cash, investment, loan)
4. **BalanceSnapshot** - Historical balance tracking for accounts
5. **Income** - Gross amount with automatic tax and deduction breakdown
6. **Transaction** - Expenses linked to accounts and people
7. **Split** - Money allocation (Need/Want/Debt/Tax/Savings)
8. **Rule** - Auto-routing rules based on transaction patterns
9. **Template** - Saved entry templates (income and transaction) with usage tracking
10. **Tag** - For future tagging system (structure ready)
11. **Setting** - User preferences (theme, display, etc.)
12. **RecurringExpense** - Fixed bills with forecast and quick-entry support

### Database

- **Default**: SQLite at `./prisma/dev.db`
- **Production**: PostgreSQL supported
- **Migrations**: Auto-generated from schema changes
- **ORM**: Prisma with type-safe queries

## Development Guidelines

### Code Style

- **TypeScript**: Strict mode enabled, 100% type coverage required
- **Components**: Functional components with hooks
- **Styling**: Tailwind CSS classes + dark mode with `dark:` prefix
- **Forms**: Zod validation + shadcn/ui components
- **API Routes**: Type-safe with Prisma

### Adding Features

1. **Database Changes**:
   ```bash
   # Modify /prisma/schema.prisma
   npx prisma migrate dev --name feature_name
   ```

2. **API Endpoints**:
   - Create in `/src/app/api/[resource]/route.ts`
   - Use `NextRequest`, `NextResponse` from next/server
   - Handle errors gracefully

3. **Pages**:
   - Create in `/src/app/[page]/page.tsx`
   - Include dark mode classes (`dark:` prefix)
   - Use consistent layout with Card/Button components
   - Add help tooltips with InfoTooltip component

4. **Components**:
   - Place in `/src/components/`
   - Use shadcn/ui for UI consistency
   - Export as default or named exports
   - Include TypeScript interfaces

### Testing

```bash
npm test                 # Run all tests
npm test -- --watch     # Watch mode
npm test -- --coverage  # Coverage report
```

- Tests in `__tests__` folders next to source
- Jest + ts-jest configuration
- Current: 114 tests, 100% passing
- No test regressions on changes

### Building & Deploying

```bash
npm run build            # Production build
npm start                # Run production server
npm run dev              # Development server
```

- Build generates 19 pages
- No TypeScript errors allowed
- All tests must pass before merge

## Recently Completed

### Payment Account Tracking & Analytics (Latest)
- **Feature**: Track which accounts are being paid (credit cards, loans)
- **Database**: `payingAccountId` field on Transaction model
- **Dashboard**: Debt Payments card showing CC payments, loan payments, debt reduction rate
- **Analytics**: Payment analysis with insights and recommendations
- **Tests**: 12 unit tests + 11 e2e tests for payment tracking
- **Status**: Fully integrated into dashboard, insights, and financial analysis

### DateRangeSelector Component
- **Location**: `src/components/DateRangeSelector.tsx`
- **Type-safe**: Exports `DateRangeType` and `DateRange` interfaces
- **Features**:
  - Preset range buttons (Week, Month, Quarter, Half-Year, Year)
  - Previous/Next navigation for all preset ranges
  - Custom date range with date pickers and Apply/Cancel
  - Configurable display modes (showLabel, compact)
  - Full dark mode support
  - Reusable across entire application
- **Status**: Integrated into Dashboard, ready for Income/Transactions pages

### Import Path Standardization
- **Fix**: tsconfig.json updated to use '@/*' → './src/*'
- **Impact**: Eliminated ~200 incorrect '@/src/...' imports
- **Result**: Clean, consistent import pattern throughout codebase
- **All files**: Refactored to use standard '@/' imports

### People/Household Features
- **Database**: Person model with role and color support
- **API**: `/api/people/*` endpoints with security validation
  - All endpoints require and validate x-household-id header
  - Ownership verification for GET, PATCH, DELETE operations
- **Seed Data**: Alice and Bob with assigned income/transactions
- **UI**: People management page with [id] detail view
- **Context**: HouseholdSelector component for switching households

### Financial Insights & Analytics
- **Page**: `/app/insights/` with comprehensive financial analysis
- **Charts**: Spending by category (pie), income vs expenses (bar/line)
- **Metrics**: Income trends, expense ratios, savings rate, tax analysis
- **Filtering**: Full date range support with custom date selection
- **Dashboard Widget**: FinancialInsightsWidget with key metrics preview

### Recurring Expenses & Forecasting
- **Model**: RecurringExpense with amount, frequency, and due date
- **Forecasting**: 90-day forecast logic in `lib/forecast.ts`
- **Widget**: RecurringExpensesForecast on dashboard
- **Quick Entry**: QuickExpenseEntry modal for fast bill logging
- **Analytics**: Recurring vs actual spending comparison

### Theme System
- **Implementation**: next-themes with class-based switching
- **Components**: ThemeProvider, ThemeToggle
- **Default**: Auto (respects OS preference)
- **Storage**: localStorage persistence
- **Coverage**: All pages have dark mode classes

### Template System
- **Database**: Template model with usage tracking and favorites
- **API**: 8 endpoints (4 transaction, 4 income templates)
- **UI**: Management page at `/templates`, "Save as Template" buttons on forms
- **Features**: Usage tracking, favorite status, sorting, filtering
- **Status**: Infrastructure ready, form integration available

### Help System
- **Component**: InfoTooltip with modal display
- **Pages**: Rules, Routes have comprehensive help sections
- **Features**: Context-specific explanations, examples, best practices
- **Accessibility**: Proper ARIA labels, keyboard navigation

## Common Tasks

### Add a New Feature

1. Design database schema (if needed)
2. Create migration: `npx prisma migrate dev --name feature_name`
3. Create API endpoint(s)
4. Create/modify page component
5. Add tests
6. Update docs
7. Test dark mode
8. Commit: `git commit -m "Add feature name"`

### Fix a Bug

1. Identify the issue (page, API, component)
2. Add test that reproduces the bug
3. Fix the bug
4. Verify test passes
5. Run full test suite: `npm test`
6. Commit: `git commit -m "Fix: description"`

### Add Dark Mode Support

- Use `dark:` Tailwind classes
- Test in both light and dark modes
- Use consistent color palette:
  - Background: `dark:bg-slate-900`, `dark:bg-slate-800`, `dark:bg-slate-700`
  - Text: `dark:text-slate-100` (primary), `dark:text-slate-400` (secondary)
  - Borders: `dark:border-slate-700`, `dark:border-slate-600`

### Update Documentation

- Root README: Overview and quick links
- `/docs/` folder: Detailed documentation
- In-code comments: Complex logic explanations
- Update AGENTS.md when project structure changes

## Dependencies

### Core
- `next@14.2.18` - React framework
- `react@18`, `react-dom@18` - UI library
- `typescript@5.3` - Type safety

### Database
- `@prisma/client@5.22` - ORM
- `prisma@5.22` - Migrations

### UI
- `tailwindcss@3.3` - Styling
- `lucide-react@0.292` - Icons
- shadcn/ui components (wrapped in /ui/)

### Forms & Validation
- `zod@3.22` - Schema validation

### Development
- `jest@29` - Testing
- `ts-jest@29` - TypeScript support for Jest
- `eslint@8` - Linting
- `next-themes@0.4` - Theme management

## Testing Strategy

- **Unit Tests**: Utilities (money, validation)
- **Integration Tests**: API endpoints
- **E2E Ready**: Infrastructure in place for Cypress/Playwright
- **Coverage**: Aim for >80% on critical paths

Current test files:
- `src/lib/__tests__/money.test.ts`
- `src/lib/__tests__/validation.test.ts`
- `src/__tests__/testUtils.test.ts`, `workflows.test.ts`
- `src/app/__tests__/*` - Page tests
- `src/app/api/__tests__/*` - API tests

## Git Workflow

- Main branch: production-ready
- Feature commits clearly describe changes
- Commits link to features/bugs when applicable
- All commits tested before push

Recent commits:
```
aee19b2 Add template system status and completion summary
3310c0e Add comprehensive template system implementation documentation
739223b Add template management page
ed8d645 Add 'Save as Template' feature to forms
eb15b69 Add template system for quick entry creation
```

## API Endpoints

### People & Households
- `GET /api/people` - List household members
- `POST /api/people` - Create person
- `GET /api/people/[id]` - Get person details
- `PATCH /api/people/[id]` - Update person
- `DELETE /api/people/[id]` - Delete person
- `GET /api/households` - List user's households

### Templates
- `GET /api/templates/transactions` - List transaction templates
- `POST /api/templates/transactions` - Create template
- `PATCH /api/templates/transactions/[id]` - Update/favorite
- `DELETE /api/templates/transactions/[id]` - Delete
- Same for `/income`

### Financial Data
- `/api/accounts/*` - Account CRUD
- `/api/income/*` - Income entry management
- `/api/transactions/*` - Transaction management (includes payingAccountId field)
- `/api/rules/*` - Routing rules
- `/api/recurring-expenses/*` - Recurring expense management
- `/api/reports/summary` - Monthly summaries
- `/api/reports/untracked` - Untracked cash estimates

### Utilities
- `/api/settings/*` - User preferences
- `/api/export` - CSV export
- `/api/data/seed` - Seed demo data
- `/api/data/reset` - Reset all data (dev only)

## Performance Notes

- Build time: ~30-45 seconds
- Dev server startup: ~2-3 seconds
- Page load: <2s (with caching)
- Database queries: Optimized with Prisma relations
- No N+1 queries in standard operations

## Known Limitations

1. Single user (hardcoded user_1)
2. SQLite for development only (use PostgreSQL for production)
3. No multi-currency support
4. No webhook integrations
5. Date range selector not yet integrated into Income/Transactions pages

## Future Roadmap

- [ ] User authentication system
- [ ] Multi-user support with proper isolation
- [ ] Date range filtering on Income and Transactions pages
- [ ] CSV/XLSX import with bank mapping
- [ ] Mobile-responsive improvements
- [ ] Advanced analytics dashboards (drill-down capabilities)
- [ ] Template categories and tagging
- [ ] Bulk template operations
- [ ] Template sharing between households
- [ ] Auto-apply routing rules with ML suggestions
- [ ] Multi-currency support
- [ ] Transaction tagging system (structure ready)
- [ ] Budget forecasting based on historical data
- [ ] Webhook integrations for bank connections

## Contact & Support

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Docs**: See `/docs/` folder
- **Code**: Well-commented and type-safe

---

**Last Updated**: November 2025 (Latest Session)
**Version**: 1.0.0+ (MVP complete, actively enhanced)
**Status**: Active development, 12 core features implemented

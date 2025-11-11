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

- **8 Main Features**: Dashboard, Accounts, Income, Transactions, Routes, Rules, Templates, Import
- **3 Recent Additions**: Light/dark/auto theme system, comprehensive help system, template system
- **Test Coverage**: 114 tests (100% passing)
- **Build Status**: Successful (19 pages)
- **Dark Mode**: Full support throughout entire application

## Architecture

### Project Structure

```
/src
  /app
    /api           - RESTful API endpoints (accounts, income, transactions, rules, reports, templates, export)
    /accounts      - Account management page
    /income        - Income tracking page
    /transactions  - Transaction tracking page
    /routes        - Money routing visualization
    /rules         - Routing rules management
    /templates     - Template management (NEW)
    /import        - Data import page
    page.tsx       - Dashboard
    layout.tsx     - Root layout with theme provider
  /components
    /ui            - shadcn/ui component wrappers
    ThemeProvider.tsx  - next-themes wrapper (NEW)
    ThemeToggle.tsx    - Theme switcher (NEW)
    TemplateSelector.tsx - Template selection (NEW)
    InfoTooltip.tsx    - Contextual help component (NEW)
    TransactionForm.tsx, IncomeForm.tsx
  /lib
    db.ts          - Prisma client
    validation.ts  - Zod schemas
    money.ts       - Currency formatting
    date.ts        - Date utilities
    constants.ts   - App constants
    templates.ts   - Template utilities (NEW)
/prisma
  schema.prisma    - Full database schema with 8 models
  migrations/      - All database migrations
```

### Key Models

1. **User** - Single user (ready for multi-user)
2. **Account** - Checking, savings, credit card, cash
3. **Income** - Gross amount with tax/deduction breakdown
4. **Transaction** - Expenses with splits
5. **Split** - Money allocation (Need/Want/Debt/Tax/Savings)
6. **Rule** - Auto-routing rules
7. **Template** - Saved entry templates (NEW)
8. **Tag** - For future tagging system

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

### Template System (Latest)
- Database: Template model with usage tracking
- API: 8 endpoints (4 transaction, 4 income templates)
- UI: Management page at `/templates`, "Save as Template" buttons on forms
- Features: Usage tracking, favorite status, sorting, filtering
- Ready for: Form integration for template selection

### Theme System
- Implementation: next-themes with class-based switching
- Components: ThemeProvider, ThemeToggle
- Default: Auto (respects OS preference)
- Storage: localStorage persistence
- Coverage: All pages have dark mode classes

### Help System
- Component: InfoTooltip with modal display
- Pages: Rules, Routes have comprehensive help sections
- Features: Context-specific explanations, examples, best practices
- Accessibility: Proper ARIA labels, keyboard navigation

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
- `next-themes@0.4` - Theme management (NEW)

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

### Templates (NEW)
- `GET /api/templates/transactions` - List transaction templates
- `POST /api/templates/transactions` - Create template
- `PATCH /api/templates/transactions/[id]` - Update/favorite
- `DELETE /api/templates/transactions/[id]` - Delete
- Same for `/income`

### Existing
- `/api/accounts/*` - Account CRUD
- `/api/income/*` - Income entry management
- `/api/transactions/*` - Transaction management
- `/api/rules/*` - Routing rules
- `/api/reports/summary` - Monthly summaries
- `/api/export` - CSV export

## Performance Notes

- Build time: ~30-45 seconds
- Dev server startup: ~2-3 seconds
- Page load: <2s (with caching)
- Database queries: Optimized with Prisma relations
- No N+1 queries in standard operations

## Known Limitations

1. Single user (hardcoded user_1)
2. SQLite for development only (use PostgreSQL for production)
3. Template selection UI not yet integrated (infrastructure ready)
4. No multi-currency support
5. No webhook integrations

## Future Roadmap

- [ ] User authentication system
- [ ] Multi-user support
- [ ] CSV/XLSX import with bank mapping
- [ ] Mobile-responsive improvements
- [ ] Advanced analytics dashboards
- [ ] Template categories
- [ ] Bulk template operations
- [ ] Template sharing
- [ ] Auto-apply routing rules

## Contact & Support

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Docs**: See `/docs/` folder
- **Code**: Well-commented and type-safe

---

**Last Updated**: November 2025
**Version**: 1.0.0 (MVP complete)
**Status**: Active development, feature-complete

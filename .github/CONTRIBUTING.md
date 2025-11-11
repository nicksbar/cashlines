# Contributing to Cashlines

We're excited you want to contribute! Here's how to get started.

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Local Setup

```bash
git clone https://github.com/nicksbar/cashlines.git
cd cashlines
npm install
cp .env.example .env
npx prisma db push
npm run dev
```

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/short-description
# or for bug fixes:
git checkout -b fix/short-description
```

### 2. Make Your Changes

- Write clean, readable code
- Follow the existing code style
- Add tests for new features
- Update documentation if needed

### 3. Test Locally

```bash
npm test              # Run all tests
npm run lint          # Check code style
npm run build         # Verify production build
```

### 4. Commit Your Changes

Use conventional commit format:

```bash
git commit -m "feat: add new feature

- Detailed description of what changed
- Why you made this change
- Any related issues: Fixes #123"
```

**Commit types**:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only
- `test:` - Add/update tests
- `refactor:` - Code restructuring
- `chore:` - Dependencies, tooling
- `ci:` - CI/CD changes

### 5. Push and Create a Pull Request

```bash
git push origin feature/short-description
```

Then on GitHub:
1. Click "Create Pull Request"
2. Fill in the PR template
3. Reference any related issues
4. Submit

### 6. Address Feedback

- Reviewers may request changes
- Make updates on your branch
- Push again (same branch)
- Comment when ready for re-review

## Code Standards

### TypeScript

- Enable strict mode (no `any`)
- Use proper types for all parameters
- Export interfaces where useful
- Document complex logic

Example:
```typescript
interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
}

export function applyTheme(prefs: UserPreferences): void {
  // Implementation
}
```

### React Components

- Use functional components with hooks
- Props should be typed
- Use shadcn/ui components for consistency
- Add dark mode support (dark: prefix)

Example:
```typescript
interface ButtonProps {
  onClick: () => void;
  label: string;
  variant?: 'primary' | 'secondary';
}

export function MyButton({ onClick, label, variant = 'primary' }: ButtonProps) {
  return (
    <button 
      onClick={onClick}
      className={`px-4 py-2 rounded dark:bg-slate-700 ${...}`}
    >
      {label}
    </button>
  );
}
```

### Styling

- Use Tailwind CSS classes
- Always include dark mode classes (`dark:` prefix)
- Keep component styles with the component
- Avoid inline styles

### Testing

Write tests for:
- Utility functions (validation, formatting)
- API endpoints
- Complex components
- Edge cases

Run tests with: `npm test -- --watch`

## Documentation

When adding features:

1. **Update relevant doc** in `/docs/`
2. **Add code comments** for complex logic
3. **Update README** if it's a major feature
4. **Update AGENTS.md** if architecture changes

## Database Changes

If you modify the schema:

1. Update `/prisma/schema.prisma`
2. Create a migration:
   ```bash
   npx prisma migrate dev --name feature_description
   ```
3. Test the migration locally
4. Commit the migration file

## Pull Request Checklist

Before submitting a PR, ensure:

- [ ] Tests pass: `npm test`
- [ ] Linter passes: `npm run lint`
- [ ] Build succeeds: `npm run build`
- [ ] Code follows project style
- [ ] New features have tests
- [ ] Documentation updated
- [ ] Dark mode support added (if UI)
- [ ] Commit messages are descriptive
- [ ] No sensitive data in commits

## PR Review Process

A maintainer will:
1. Review your code
2. Run all CI checks
3. Request changes if needed
4. Approve when ready
5. Merge to `develop` branch

You'll be notified of all updates.

## Questions?

- **Issues**: Open a [GitHub Issue](https://github.com/nicksbar/cashlines/issues)
- **Discussions**: Start a [Discussion](https://github.com/nicksbar/cashlines/discussions)
- **Security**: Email security@cashlines.dev for vulnerabilities

## Code of Conduct

Please follow our [Code of Conduct](./CODE_OF_CONDUCT.md). 

Be respectful, inclusive, and professional.

---

**Thank you for contributing!** Your efforts help make Cashlines better for everyone.

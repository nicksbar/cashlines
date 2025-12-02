# GitHub Actions CI/CD

Cashlines uses GitHub Actions to automatically test, validate, and build the application on every commit and pull request.

## Workflows

### 1. **CI** (`test.yml`) - Main Test Pipeline
Runs on every commit and PR to `main` and `development` branches.

**Steps:**
1. ✅ Lint code with ESLint
2. ✅ Type check with TypeScript
3. ✅ Run unit/API tests (Jest) with coverage
4. ✅ Upload coverage to Codecov
5. ✅ Build production bundle
6. ✅ Verify build output
7. ✅ Install Playwright browsers
8. ✅ Run E2E tests across all browsers
9. ✅ Upload E2E test artifacts

**Artifacts:**
- Playwright HTML report (`playwright-report/`)
- Test results and traces (`test-results/`)
- Coverage reports

### 2. **E2E Tests** (`e2e.yml`) - Dedicated E2E Pipeline
Focused E2E testing with separate runs per browser.

**Runs on:**
- Every commit to `main` and `development`
- Every pull request
- Daily at 2 AM UTC for regression detection

**Features:**
- Parallel testing across Chromium, Firefox, and WebKit
- Separate artifacts per browser
- Detailed test reports
- Summary job aggregates results

### 3. **Full Test Suite** (`full-test.yml`) - Comprehensive Validation
Runs all tests (lint, types, unit, API, E2E) in one job.

**Steps:**
1. ✅ ESLint validation
2. ✅ TypeScript type checking
3. ✅ Unit & API tests with coverage
4. ✅ Production build
5. ✅ E2E tests for all browsers
6. ✅ Generate summary report

**Summary Output:**
- Test results summary in PR
- Links to artifacts
- Pass/fail status

### 4. **Validate Branch Name** (`validate-branch.yml`)
Enforces branch naming conventions.

**Rules:**
- ✅ `main` - main branch
- ✅ `development` - development branch
- ✅ `branches/*` - feature/fix branches
- ❌ All other names are rejected

### 5. **Release** (`release.yml`)
Creates releases when tagged.

### 6. **Release Build** (`release-build.yml`)
Builds Docker images for releases.

## Test Workflows in Detail

### CI Pipeline (test.yml)

```
checkout
  ↓
setup node 20.x + npm cache
  ↓
npm ci (install)
  ↓
setup database (prisma db push)
  ↓
generate prisma client
  ↓
npm run lint
  ↓
npm test -- --coverage
  ↓
upload coverage to codecov
  ↓
install playwright browsers
  ↓
npm run test:e2e
  ↓
upload artifacts (playwright-report, test-results)
  ↓
npm run build
  ↓
verify build (.next directory exists)
  ↓
docker build (if push to main/development)
```

## Test Badges

The README displays:
- **CI Status Badge** - Links to latest workflow run
- **Tests Badge** - Shows 489 tests passing (402 unit/API + 87 E2E)

## Coverage Reports

Coverage reports are automatically uploaded to Codecov:
- Track coverage trends over time
- Per-file coverage details
- PR comments with coverage impact

## Pull Request Checks

When a PR is opened:
1. ✅ Branch name validation
2. ✅ CI workflow runs automatically
3. ✅ All checks must pass before merge
4. ✅ Test artifacts available for review

## Running Tests Locally

To replicate CI/CD locally:

```bash
# Run everything like CI does
npm run lint          # ESLint
npx tsc --noEmit     # TypeScript check
npm test              # Jest unit tests
npm run build         # Production build
npm run test:e2e      # Playwright E2E tests

# Or run all at once
npm run test:all      # Unit tests + E2E tests
```

## Monitoring & Logs

View workflow runs:
1. Go to GitHub repo → **Actions** tab
2. Select a workflow from the list
3. Click a run to see detailed logs
4. Download artifacts (reports, videos, traces)

## Schedule

- **CI Pipeline**: On every commit (any branch)
- **PR Checks**: On every pull request
- **E2E Regression**: Daily at 2 AM UTC
- **Release Build**: On git tag push

## Environment Variables

CI/CD uses these environment variables:

- `DATABASE_URL: file:./prisma/dev.db` - SQLite for testing
- `NODE_ENV: test` - Testing environment (implicit)
- `CI: true` - Tells scripts we're in CI

## Database Setup

For each CI run:
1. Fresh SQLite database created at `prisma/dev.db`
2. Schema pushed with `prisma db push --skip-generate`
3. Prisma client generated
4. Tests run against clean database
5. Database cleaned after tests

## Docker Image Building

After successful CI on `main` or `development`:
1. Docker image built automatically
2. Named `cashlines:latest`
3. Published to registry (when configured)

## Troubleshooting

### Tests Fail Locally but Pass in CI
- Check Node.js version: CI uses 20.x
- Check npm cache: `npm ci` vs `npm install`
- Check database state: Tests use fresh SQLite

### E2E Tests Timeout
- Increase timeout in `playwright.config.ts`
- Check dev server is running
- Verify network is stable

### Coverage Not Uploading
- Check Codecov token is set (usually auto for public repos)
- Check YAML indentation in `test.yml`
- Review Codecov step logs

### Artifacts Not Found
- Check artifact name matches upload step
- Verify artifact path exists
- Check retention period (30 days default)

## Configuration Files

- `.github/workflows/test.yml` - Main CI pipeline
- `.github/workflows/e2e.yml` - E2E test pipeline
- `.github/workflows/full-test.yml` - Comprehensive validation
- `.github/workflows/validate-branch.yml` - Branch validation
- `.github/workflows/release.yml` - Release creation
- `.github/workflows/release-build.yml` - Docker build on release

## Adding New Tests

When adding new tests:

1. **Unit/API Tests**: Add to `src/**/__tests__/*`
2. **E2E Tests**: Add to `e2e/*.spec.ts`
3. **Run locally**: `npm run test` and `npm run test:e2e`
4. **Commit**: Tests run automatically in CI
5. **PR**: All checks must pass before merge

## Performance

Current CI/CD performance:
- **Lint**: ~10 seconds
- **Type check**: ~5 seconds
- **Unit tests**: ~2.5 seconds
- **E2E tests**: ~35 seconds per browser
- **Build**: ~45 seconds
- **Total**: ~2-3 minutes (parallel jobs)

## Future Improvements

- [ ] Scheduled daily E2E runs with detailed reports
- [ ] Performance benchmarking
- [ ] Visual regression testing
- [ ] Accessibility testing
- [ ] Load testing
- [ ] Automated dependency updates
- [ ] Security scanning
- [ ] Code quality metrics (SonarQube)

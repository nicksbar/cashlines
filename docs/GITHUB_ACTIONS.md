# GitHub Actions Guide

Cashlines uses GitHub Actions for automated testing, building, and releasing.

## Workflows

### 1. Test Workflow (test.yml)

**Triggers**: Pushes to `main`/`develop`, Pull Requests

**What it does**:
- Installs dependencies
- Runs linter
- Executes test suite with coverage
- Builds production bundle
- Verifies build succeeds

**Matrix Testing**: Tests on Node.js 18.x and 20.x

**Coverage**: Uploads results to Codecov (requires Codecov account)

### 2. Build Workflow (build.yml)

**Triggers**: Pushes to `main`/`develop`, Pull Requests

**What it does**:
- Builds Next.js production bundle
- Builds Docker image
- Verifies Docker image works
- Checks for build warnings

**No Deployment**: Just verification that builds are valid

### 3. Release Workflow (release.yml)

**Triggers**: Git tags matching `v*` (e.g., `v1.0.0`, `v1.1.0-beta`)

**What it does**:
- Runs full test suite
- Builds production bundle
- Creates source tarball (excludes node_modules, .next, etc.)
- Builds Docker image and exports as tarball
- Generates release notes
- Creates GitHub Release with artifacts

**Artifacts**:
- `cashlines-v1.0.0.tar.gz` - Source code for distribution
- `cashlines-docker-v1.0.0.tar.gz` - Docker image archive

## How to Use

### Creating a Release

1. **Tag a commit** locally:
```bash
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

2. **GitHub Actions automatically**:
   - Runs tests
   - Builds everything
   - Creates a GitHub Release
   - Attaches build artifacts

3. **Check the Release**:
   - Go to your repo's "Releases" page
   - Download source or Docker image
   - See automatically generated release notes

### Prerelease Tags

For alpha/beta releases, use:
```bash
git tag -a v1.0.0-alpha -m "Alpha release"
git tag -a v1.0.0-beta.1 -m "Beta release 1"
```

These will be marked as "Pre-release" on GitHub.

### Testing on PRs

- Every pull request automatically runs tests
- Build must pass before merging
- Coverage reports uploaded to Codecov

### CI Status Badges

Add to your README.md:

```markdown
[![Tests](https://github.com/nicksbar/cashlines/actions/workflows/test.yml/badge.svg)](https://github.com/nicksbar/cashlines/actions/workflows/test.yml)
[![Build](https://github.com/nicksbar/cashlines/actions/workflows/build.yml/badge.svg)](https://github.com/nicksbar/cashlines/actions/workflows/build.yml)
```

## Configuration

### Codecov (Optional but Recommended)

1. Sign up at [codecov.io](https://codecov.io)
2. Link your GitHub repo
3. Coverage reports will automatically upload

The workflow doesn't require manual setup - it uses GitHub's GITHUB_TOKEN.

### Branch Protection Rules (Recommended)

In GitHub repo settings, add branch protection for `main`:

1. Require status checks to pass before merging
2. Select: `test`, `build`
3. Require branches to be up to date
4. Require code reviews (optional)

This ensures only tested code merges to main.

## Manual Workflow Dispatch

You can also trigger workflows manually from GitHub UI:

1. Go to "Actions" tab
2. Select a workflow
3. Click "Run workflow"
4. Choose branch/tag and click green button

## Troubleshooting

### Tests failing in Actions but passing locally

Common causes:
- Different Node.js versions (Actions tests 18.x and 20.x)
- Database state not clean (try `npx prisma migrate reset`)
- Missing environment variables (check `.env.example`)

### Docker build failing

- Ensure `Dockerfile` exists and is valid
- Check Docker context is repository root
- Review `docker build` output in logs

### Release not creating

- Ensure tag format matches `v*` (e.g., `v1.0.0`)
- Check Actions tab for error logs
- Verify GITHUB_TOKEN has write permissions

## Next Steps

1. **Enable Branch Protection** (recommended for public repo)
2. **Set up Codecov** for coverage tracking
3. **Add badges to README** for CI status
4. **Test by creating a release tag**

## Example Release

```bash
# Make your changes, commit
git add .
git commit -m "feat: add new feature"

# Create a release tag
git tag -a v1.1.0 -m "Release 1.1.0"

# Push the tag
git push origin v1.1.0

# GitHub Actions will:
# - Run all tests
# - Build Docker image
# - Create source tarball
# - Generate release notes
# - Create GitHub Release with artifacts
```

Then visit your repo's Releases page to see the new release!

---

For more information, see [GitHub Actions Documentation](https://docs.github.com/actions).

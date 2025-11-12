# GitHub Actions CI/CD Guide# GitHub Actions Guide



Cashlines uses GitHub Actions for continuous integration, automated versioning, and releases.Cashlines uses GitHub Actions for automated testing, building, and releasing.



## Workflows## Workflows



### 1. CI Validation (test.yml)### 1. Test Workflow (test.yml)



**Triggers**: Pull Requests to `main` or `development`**Triggers**: Pushes to `main`/`develop`, Pull Requests



**What it does**:**What it does**:

- ✅ Lints code (ESLint)- Installs dependencies

- ✅ Runs test suite (289 tests)- Runs linter

- ✅ Builds Next.js production bundle- Executes test suite with coverage

- ✅ Uploads coverage to Codecov- Builds production bundle

- Verifies build succeeds

**Required to merge**: All checks must pass before PR merge

**Matrix Testing**: Tests on Node.js 18.x and 20.x

### 2. Release Build (release-build.yml)

**Coverage**: Uploads results to Codecov (requires Codecov account)

**Triggers**: Commits pushed to `main` or `development` branches (after PR merge)

### 2. Build Workflow (build.yml)

**On `main` branch** (Production Release):

- ✅ Auto-increments patch version (1.0.0 → 1.0.1)**Triggers**: Pushes to `main`/`develop`, Pull Requests

- ✅ Creates git tag (v1.0.1)

- ✅ Builds Docker image with version tag**What it does**:

- ✅ Creates source tarball- Builds Next.js production bundle

- ✅ Creates GitHub Release- Builds Docker image

- ✅ Updates package.json with version- Verifies Docker image works

- Checks for build warnings

**On `development` branch** (Development Build):

- ✅ Creates prerelease tag with timestamp: `v0.1.0-dev.20251112.053421.abc123d`**No Deployment**: Just verification that builds are valid

- ✅ Builds Docker image for testing

- ✅ Creates GitHub Release marked as "pre-release"### 3. Release Workflow (release.yml)

- ✅ Good for integration testing

**Triggers**: Git tags matching `v*` (e.g., `v1.0.0`, `v1.1.0-beta`)

### 3. Manual Release (release.yml)

**What it does**:

**Triggers**: Manual git tags `v*` (e.g., `v1.2.0`)- Runs full test suite

- Builds production bundle

**Use case**: Hotfixes or manual release overrides- Creates source tarball (excludes node_modules, .next, etc.)

- Builds Docker image and exports as tarball

```bash- Generates release notes

git tag -a v1.2.3 -m "Hotfix release"- Creates GitHub Release with artifacts

git push origin v1.2.3

```**Artifacts**:

- `cashlines-v1.0.0.tar.gz` - Source code for distribution

### 4. Branch Validation (validate-branch.yml)- `cashlines-docker-v1.0.0.tar.gz` - Docker image archive



**Triggers**: Pull Request creation## How to Use



**What it checks**:### Creating a Release

- ✅ Branch name follows pattern: `branches/*` or `main`/`development`

- ❌ Rejects invalid branch names1. **Tag a commit** locally:

```bash

**Valid**:git tag -a v1.0.0 -m "Release version 1.0.0"

- `branches/user-dashboard`git push origin v1.0.0

- `branches/fix-bug````

- `main`

- `development`2. **GitHub Actions automatically**:

   - Runs tests

**Invalid**:   - Builds everything

- `my-feature` (missing `branches/` prefix)   - Creates a GitHub Release

- `feature/something` (wrong prefix)   - Attaches build artifacts



## Development Workflow3. **Check the Release**:

   - Go to your repo's "Releases" page

### Creating a Feature   - Download source or Docker image

   - See automatically generated release notes

```bash

# 1. Create feature branch### Prerelease Tags

git checkout -b branches/my-feature

For alpha/beta releases, use:

# 2. Make changes and commit```bash

git add .git tag -a v1.0.0-alpha -m "Alpha release"

git commit -m "feat: add user dashboard"git tag -a v1.0.0-beta.1 -m "Beta release 1"

```

# 3. Push and create PR

git push -u origin branches/my-featureThese will be marked as "Pre-release" on GitHub.

# Then create PR to `development` via GitHub UI

### Testing on PRs

# 4. CI runs automatically

# - Linting, tests, build verification- Every pull request automatically runs tests

# - Branch name validation- Build must pass before merging

- Coverage reports uploaded to Codecov

# 5. After PR approved and merged

# - Branch auto-deletes (GitHub native)### CI Status Badges

# - Release Build triggers on `development`

# - Dev build created: v0.1.0-dev.*Add to your README.md:

```

```markdown

### Releasing to Production[![Tests](https://github.com/nicksbar/cashlines/actions/workflows/test.yml/badge.svg)](https://github.com/nicksbar/cashlines/actions/workflows/test.yml)

[![Build](https://github.com/nicksbar/cashlines/actions/workflows/build.yml/badge.svg)](https://github.com/nicksbar/cashlines/actions/workflows/build.yml)

```bash```

# 1. Create PR from development → main

# PR title: "Release: version X.Y.Z"## Configuration



# 2. CI runs validation### Codecov (Optional but Recommended)

# 3. Approve PR

# 4. Merge to main1. Sign up at [codecov.io](https://codecov.io)

2. Link your GitHub repo

# GitHub Actions automatically:3. Coverage reports will automatically upload

# - Increments patch version (e.g., 1.0.0 → 1.0.1)

# - Creates tag v1.0.1The workflow doesn't require manual setup - it uses GitHub's GITHUB_TOKEN.

# - Builds Docker image

# - Creates GitHub Release with artifacts### Branch Protection Rules (Recommended)

# - Updates package.json

```In GitHub repo settings, add branch protection for `main`:



## Viewing Results1. Require status checks to pass before merging

2. Select: `test`, `build`

### Check CI Status3. Require branches to be up to date

4. Require code reviews (optional)

1. Go to PR → Scroll to "Checks" section

2. See CI, Release Build, and Branch Validation statusThis ensures only tested code merges to main.

3. Click "Details" to view full logs

## Manual Workflow Dispatch

### View Releases

You can also trigger workflows manually from GitHub UI:

1. Go to repo → "Releases" tab

2. See all versions created automatically1. Go to "Actions" tab

3. Download source tarball or view Docker image info2. Select a workflow

3. Click "Run workflow"

### Check Build Logs4. Choose branch/tag and click green button



1. Go to "Actions" tab## Troubleshooting

2. Select workflow run

3. Expand job to see detailed output### Tests failing in Actions but passing locally



## No Manual Versioning!Common causes:

- Different Node.js versions (Actions tests 18.x and 20.x)

The system fully automates versioning:- Database state not clean (try `npx prisma migrate reset`)

- Missing environment variables (check `.env.example`)

- **No git tags needed** (except hotfixes)

- **No package.json edits** (automatic on merge)### Docker build failing

- **No release notes** (auto-generated from commits)

- **Just PR → Merge → Auto-release**- Ensure `Dockerfile` exists and is valid

- Check Docker context is repository root

## Status Badges- Review `docker build` output in logs



Add to README.md:### Release not creating



```markdown- Ensure tag format matches `v*` (e.g., `v1.0.0`)

[![CI](https://github.com/nicksbar/cashlines/actions/workflows/test.yml/badge.svg)](https://github.com/nicksbar/cashlines/actions/workflows/test.yml)- Check Actions tab for error logs

[![Release](https://github.com/nicksbar/cashlines/actions/workflows/release-build.yml/badge.svg)](https://github.com/nicksbar/cashlines/actions/workflows/release-build.yml)- Verify GITHUB_TOKEN has write permissions

```

## Next Steps

## Troubleshooting

1. **Enable Branch Protection** (recommended for public repo)

### PR checks failing2. **Set up Codecov** for coverage tracking

3. **Add badges to README** for CI status

**Linting errors**: Run `npm run lint` locally, fix issues4. **Test by creating a release tag**

**Test failures**: Run `npm test` locally to debug

**Build errors**: Run `npm run build` locally## Example Release



### Branch validation failed```bash

# Make your changes, commit

**Error**: "Invalid branch name: my-feature"git add .

**Solution**: Rename branch to `branches/my-feature`git commit -m "feat: add new feature"



```bash# Create a release tag

git branch -m my-feature branches/my-featuregit tag -a v1.1.0 -m "Release 1.1.0"

git push -u origin branches/my-feature

```# Push the tag

git push origin v1.1.0

### Manual release needed

# GitHub Actions will:

Use the `release.yml` workflow:# - Run all tests

# - Build Docker image

```bash# - Create source tarball

# Create tag and push# - Generate release notes

git tag -a v1.2.3 -m "Emergency hotfix"# - Create GitHub Release with artifacts

git push origin v1.2.3```



# GitHub Actions creates release automaticallyThen visit your repo's Releases page to see the new release!

```

---

## Protection Rules (Recommended)

For more information, see [GitHub Actions Documentation](https://docs.github.com/actions).

In repo settings, enable:

1. **For `main` branch**:
   - ✅ Require status checks: `CI`
   - ✅ Require status checks: `Release Build`
   - ✅ Require branch to be up to date
   - ✅ Require review approval
   - ✅ Dismiss stale reviews

2. **For `development` branch**:
   - ✅ Require status checks: `CI`
   - ✅ Require branch to be up to date

3. **Branch auto-delete**:
   - ✅ Automatically delete head branches

---

**For more info**: [GitHub Actions Documentation](https://docs.github.com/actions)

# Branch Security & Contribution Guide

Complete setup for protecting your main branch and managing contributions as your Cashlines project goes public.

## Branch Protection Rules

### For `main` Branch (Production)

These rules ensure code quality before merging to production.

**Required Status Checks**:
- ✅ `test` workflow must pass
- ✅ `build` workflow must pass
- Prevents merging broken code

**Review Requirements**:
- ✅ Require at least 1 pull request review
- ✅ Dismiss stale PR approvals when new commits pushed
- Ensures code review before merging

**Dismiss Stale Reviews**: 
- ✅ Enable
- Forces re-review after changes

**Require Code Owner Review**:
- ✅ Enable (if using CODEOWNERS file)
- Code owners must approve changes

**Require Status Checks to be Passing**:
- ✅ Enable
- ✅ Require branches to be up to date
- Prevents merging branches that are out of sync

**Restrictions**:
- ✅ Include administrators (enforce rules for everyone)
- ✅ Restrict who can push to matching branches
- Only repo owners/maintainers can force push

### For `develop` Branch (Staging)

Less strict than main, but still enforcing quality:

- ✅ Require 1 PR review (optional, can be less strict)
- ✅ Require `test` workflow to pass
- Allow merge without `build` check (faster iteration)
- ✅ Dismiss stale reviews

## Implementation Steps

### 1. Set Up Branch Protection on GitHub

Go to: **Settings → Branches → Add Rule**

**Branch name pattern**: `main`

Then configure:

```
✅ Require a pull request before merging
  ✅ Require approvals (1 required)
  ✅ Dismiss stale pull request approvals when new commits are pushed
  ✅ Require review from Code Owners (if using CODEOWNERS)

✅ Require status checks to pass before merging
  ✅ Require branches to be up to date before merging
  Select checks:
    - test
    - build

✅ Include administrators
✅ Restrict who can push to matching branches
  (Leave empty for all users, or add your GitHub username)
```

Repeat for `develop` branch with less strict settings.

## Code of Conduct

Create `.github/CODE_OF_CONDUCT.md` to set community standards:

This establishes expected behavior and how you'll handle violations.

## Contributing Guidelines

Create `.github/CONTRIBUTING.md` to guide contributors:

Key sections:
- How to set up dev environment
- Coding standards
- Testing requirements
- Pull request process
- Commit message format

## CODEOWNERS File

Create `.github/CODEOWNERS` to specify code review requirements:

```
# Global owners
* @nicksbar

# Documentation
/docs/ @nicksbar
/README.md @nicksbar

# Database schema
/prisma/ @nicksbar

# API endpoints
/src/app/api/ @nicksbar

# UI components
/src/components/ @nicksbar
/src/app/ @nicksbar

# Tests
/src/__tests__/ @nicksbar
src/lib/__tests__/ @nicksbar
```

This ensures specific areas require code owner approval.

## Pull Request Template

Create `.github/pull_request_template.md`:

Standardizes PR descriptions and ensures important info is included.

Example sections:
- What does this PR do?
- Type of change (feature, bug, docs, etc.)
- Testing instructions
- Checklist (tests pass, docs updated, etc.)

## Issue Templates

Create templates in `.github/ISSUE_TEMPLATE/`:

1. **Bug Report** - Standardized bug reports
2. **Feature Request** - Structured feature proposals
3. **Documentation** - Doc improvement suggestions

## Security Policy

Create `SECURITY.md` in root:

- How to report security vulnerabilities
- Disclosure timeline
- Supported versions

Example:
```markdown
# Security Policy

## Reporting Security Issues

**Do not** open public issues for security vulnerabilities.

Please email: security@cashlines.dev

Include:
- Description of vulnerability
- Steps to reproduce
- Impact assessment
- Potential fix (if you have one)

Response time: Within 48 hours
```

## Recommended Settings Overview

| Setting | Main | Develop |
|---------|------|---------|
| Require PR | ✅ | ✅ |
| Require reviews | 1 | 0-1 |
| Dismiss stale reviews | ✅ | ✅ |
| Status checks | test + build | test only |
| Up to date required | ✅ | ✅ |
| Include admins | ✅ | ✅ |

## Git Workflow for Contributors

Once you have branch protection set up, here's the expected flow:

```bash
# 1. Clone and create feature branch
git clone https://github.com/nicksbar/cashlines.git
cd cashlines
git checkout -b feature/my-feature

# 2. Make changes, test locally
npm test
npm run build

# 3. Commit with descriptive messages
git commit -m "feat: add feature description"

# 4. Push to your fork (or branch if contributor)
git push origin feature/my-feature

# 5. Open Pull Request on GitHub
# - Fill out PR template
# - Reference any issues (#123)
# - Add labels if applicable

# 6. Wait for reviews and CI checks
# - Actions run automatically
# - Reviewers approve/request changes
# - Respond to feedback

# 7. Merge when approved
# - GitHub automatically merges after approval
# - Branch is automatically deleted
```

## Commit Message Format

For consistency, use conventional commits:

```
feat: add new feature
fix: resolve bug description
docs: update documentation
test: add or update tests
refactor: restructure code
chore: update dependencies
ci: modify CI/CD configuration
```

Example:
```
feat: add template system for quick entry creation

- Add Template model to Prisma schema
- Create 8 API endpoints for template CRUD
- Add "Save as Template" buttons to forms
- Add template management page

Fixes #42
```

## Suggested First Checklist

When going public, do this in order:

- [ ] Set up branch protection for `main`
- [ ] Set up branch protection for `develop`
- [ ] Create `.github/CONTRIBUTING.md`
- [ ] Create `.github/CODE_OF_CONDUCT.md`
- [ ] Create `.github/CODEOWNERS`
- [ ] Create `.github/pull_request_template.md`
- [ ] Create issue templates in `.github/ISSUE_TEMPLATE/`
- [ ] Create `SECURITY.md`
- [ ] Add CI badges to README
- [ ] Make repo public

## For Your Current Single-Developer Setup

Since you're the sole developer currently:

**Simple approach**:
1. Protect `main` with status checks only (no review needed)
2. Use `develop` for active work
3. Use feature branches for new features
4. Create PR from feature branch → develop
5. Periodically merge develop → main (releases)

**Command flow**:
```bash
# Work on features
git checkout develop
git checkout -b feature/new-thing
# ... make changes ...
git push origin feature/new-thing

# Create PR, let CI run
# Merge to develop when passing

# Create release
git checkout main
git merge develop
git tag -a v1.1.0
git push --tags
```

## Advanced: Automatic Deployments

Once you're comfortable:

- Add deploy workflow triggered by `main` branch pushes
- Auto-deploy to production server
- Use environment secrets for credentials

This would require setting up a server and deployment configuration.

## Quick Security Checklist

- [ ] **Branch protection** on `main` (require checks)
- [ ] **No force pushes** to main
- [ ] **Status checks required** (test + build)
- [ ] **Reviews required** (even if just you initially)
- [ ] **Code owner reviews** for critical files
- [ ] **Secrets management** (use GitHub Secrets, not in code)
- [ ] **Dependabot** enabled (auto-update dependencies)
- [ ] **Security policy** in place

---

**Recommended**: Start with branch protection on `main`, then add contribution guidelines. You can always tighten rules as contributors join.

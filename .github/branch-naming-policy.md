# Branch Naming Policy

Simple branch structure: only `main`, `development`, and feature branches under `branches/`.

## Allowed Branches

- `main` - Production releases
- `development` - Integration branch
- `branches/*` - Feature branches (e.g., `branches/my-feature`)

## Examples

✅ **Valid**
- `branches/user-authentication`
- `branches/fix-transaction-bug`
- `branches/update-docs`

❌ **Invalid**
- `my-feature` - Must use `branches/` prefix
- `feature/something` - Use `branches/` not `feature/`
- `develop` - Use `development`

## Workflow

1. Create feature branch: `git checkout -b branches/your-feature`
2. Make changes and commit
3. Push: `git push -u origin branches/your-feature`
4. Create PR to `development`
5. After merge, branch auto-deletes

## Cleanup

Local cleanup after merge:
```bash
git branch -d branches/your-feature
```


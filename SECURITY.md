# Security Policy

## Reporting Security Vulnerabilities

**Do not open public GitHub issues for security vulnerabilities.**

If you discover a security vulnerability, please email:

📧 **security@example.com** (replace with your email)

Include in your report:
1. Description of the vulnerability
2. Steps to reproduce
3. Potential impact
4. Suggested fix (if you have one)

## Response Timeline

- **Initial response**: Within 48 hours
- **Assessment**: Within 1 week
- **Fix and release**: Depends on severity
- **Disclosure**: After fix is released

## Vulnerability Severity Levels

### Critical
- Remote code execution
- Authentication bypass
- Data exposure of all users
- **Fix timeline**: Immediate

### High
- Privilege escalation
- SQL injection
- XSS in critical areas
- **Fix timeline**: Within 7 days

### Medium
- Information disclosure
- Denial of service
- Limited impact vulnerabilities
- **Fix timeline**: Within 30 days

### Low
- Minor security issues
- No user impact
- **Fix timeline**: Next release

## Supported Versions

| Version | Status | Support Until |
|---------|--------|---------------|
| 1.x+ | Current | Latest 2 versions |

## Security Best Practices for Users

1. **Keep Updated**: Always use the latest version
2. **Environment Variables**: Never commit `.env` files
3. **Database**: Use PostgreSQL for production (not SQLite)
4. **Credentials**: Rotate API keys regularly
5. **Backups**: Maintain regular database backups
6. **Access Control**: Implement proper access controls when deploying

## For Contributors

- Never commit sensitive data (keys, passwords, secrets)
- Use environment variables for secrets
- Follow OWASP security guidelines
- Run security checks: `npm audit`

---

Thank you for helping keep Cashlines secure!

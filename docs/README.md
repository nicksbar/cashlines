# Cashlines Documentation

This directory contains the complete Cashlines documentation.

## Quick Navigation

- **[Getting Started](./GETTING_STARTED.md)** - Setup instructions for local development
- **[Setup & Security Checklist](./SETUP.md)** - Complete setup guide and branch protection
- **[Features & Usage](./FEATURES.md)** - Detailed feature documentation
- **[Charts & Visualizations](./CHARTS.md)** - Dashboard charts and test data generation
- **[Development Guide](./DEVELOPMENT.md)** - Complete developer guide for contributing
- **[Test Coverage](./TEST_COVERAGE.md)** - Detailed test coverage and validation reference
- **[Spent But Not Listed (SBNL)](./SBNL.md)** - Untracked spending analysis
- **[Project Overview](./PROJECT_OVERVIEW.md)** - Full implementation summary
- **[Architecture](./API.md)** - Technical architecture and design notes
- **[API Reference](./API.md)** - Complete API endpoint documentation
- **[Deployment](./DEPLOYMENT.md)** - Docker, LXC, and container deployment
- **[Templates System](./TEMPLATES.md)** - Template system for quick entry creation
- **[Help System](./HELP_SYSTEM.md)** - Contextual help and tooltips
- **[Branch Security](./BRANCH_SECURITY.md)** - Branch protection and governance

## For Agents & Contributors

- **[Agent Instructions](../AGENTS.md)** - For GitHub Copilot agents and automated development
- **[Development Guide](./DEVELOPMENT.md)** - Complete developer guide for contributing
- **[Project Overview](./PROJECT_OVERVIEW.md)** - Full implementation summary
- **[Session Notes](../SESSION_NOTES.md)** - Latest session work and improvements

## Project Overview

Cashlines is a self-hostable personal money tracking application focused on understanding where your money comes from and where it goes. No budgets, no complexity—just tracking.

**Key Features:**
- Income & transaction tracking across multiple accounts
- Automatic money routing based on custom rules
- Monthly reporting and visualization
- Privacy-focused self-hosted deployment
- Light/dark theme support
- Comprehensive template system for quick entry creation

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Prisma ORM, SQLite/PostgreSQL

## Database Schema

The application uses Prisma ORM with the following main models:

- **User**: Authentication and multi-user support (currently single-user)
- **Account**: Checking, savings, credit card, cash, etc.
- **Income**: Income entries with tax and deduction tracking
- **Transaction**: Expense entries with splits
- **Split**: Money allocation across Need/Want/Debt/Tax/Savings
- **Rule**: Automatic routing rules for income/transactions
- **Template**: Saved templates for quick entry creation

## Getting Help

- Check the contextual help on each page (look for ℹ️ icons)
- Read the relevant documentation file above
- Review the [Frequently Asked Questions](./FAQ.md)

---

**Last Updated:** November 2025
**Version:** 1.0.0

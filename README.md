# Cashlines

> Self-hosted personal money tracking. No budgets, no complexity—just tracking where your money comes from and where it goes.

**Purpose**: Understand your money flow. Track income from multiple sources, split expenses across categories (Need/Want/Debt/Tax/Savings), create routing rules for automation, and analyze monthly reports—all privately on your own hardware.

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](#) [![Tests](https://img.shields.io/badge/tests-114%2F114-brightgreen)](#) [![License](https://img.shields.io/badge/license-MIT-blue)](#license)

## Features

- **Dashboard** - Monthly income, expenses, and money routing overview
- **Income Tracking** - Record income with automatic tax and deduction calculations
- **Accounts** - Manage multiple accounts (checking, savings, credit card, cash, custom)
- **Transactions** - Track expenses with flexible split allocation across categories
- **Money Routing** - Auto-split money across Need/Want/Debt/Tax/Savings
- **Routing Rules** - Create rules to automatically allocate transactions by pattern
- **Templates** - Save and reuse common entry patterns for quick creation
- **Reports** - Monthly summaries with spending breakdowns
- **Theme Support** - Light/dark/auto themes with persistent preferences
- **Self-Hosted** - Full privacy and control, no external services or tracking

## Quick Start

### Local Development

```bash
git clone https://github.com/nicksbar/cashlines.git
cd cashlines
npm install
cp .env.example .env
npx prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Docker

```bash
docker-compose up -d
```

App runs at [http://localhost:3000](http://localhost:3000) with persistent data volume.

## Tech Stack

**Frontend**: Next.js 14+ (App Router), React 18, TypeScript, Tailwind CSS, shadcn/ui  
**Backend**: Next.js API Routes, TypeScript  
**Database**: Prisma ORM with SQLite (dev) or PostgreSQL (prod)  
**Validation**: Zod schemas  
**Containerization**: Docker & Docker Compose

## Project Structure

```
/src
  /app              - Next.js pages and API routes
    /api            - RESTful endpoints (accounts, income, transactions, rules, templates, reports)
    /accounts       - Account management page
    /income         - Income tracking
    /transactions   - Transaction tracking
    /routes         - Money routing visualization
    /rules          - Routing rules management
    /templates      - Template management
    /import         - Data import
  /components       - React components
  /lib              - Utilities (db, validation, money, date, templates)
/prisma
  schema.prisma     - Database schema
  migrations/       - Database migrations
```

## Why Cashlines?

Traditional budgets fail. They provide constraints that break immediately under real-world pressure, creating nothing but friction.

**Cashlines flips the script**: Instead of budgeting, it provides visibility. You'll understand:
- Where your income actually goes
- Your spending allocation ratios
- Trends that reveal real patterns
- Which spending habits matter most to you

This data-driven approach transforms how you make financial decisions—replacing failed budget cycles with honest awareness.

[**Learn more about the philosophy →**](./docs/ABOUT.md)

## Documentation

Complete docs in `/docs/`:

- **[About the Author](./docs/ABOUT.md)** - Why this exists
- **[Getting Started](./docs/GETTING_STARTED.md)** - Setup instructions
- **[Features & Usage](./docs/FEATURES.md)** - How to use each feature
- **[API Reference](./docs/API.md)** - Complete endpoint documentation
- **[Deployment](./docs/DEPLOYMENT.md)** - Docker, LXC, production setups
- **[Agent Instructions](./AGENTS.md)** - Development guidelines

## Status

✅ **MVP complete**: 8 features fully implemented  
✅ **114 tests passing** (100% success rate)  
✅ **Production-ready**: Builds successfully with zero errors  
✅ **Dark mode**: Full light/dark/auto theme support  
✅ **Self-hosted**: Docker and LXC deployment ready

## Privacy & Security

- **Self-Hosted**: Run on your own hardware
- **No Cloud**: No data sent to external services
- **No Tracking**: No analytics, telemetry, or ads
- **Open Source**: Inspect the code yourself
- **Your Data**: Full control and ownership

## License

MIT - Use freely for personal or commercial use.

---

**Track your money. Take control. No budgets, no complexity.**

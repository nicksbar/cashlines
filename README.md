# Cashlines````markdown

# Cashlines

> **Self-hosted personal money tracking.** No budgets, no complexity—just tracking where your money comes from and where it goes.

A self-hostable personal money tracking application focused on tracking income, expenses, and how money is routed across accounts and allocations. Built with modern web technologies for privacy-focused deployment in Docker and LXC containers.

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](#) [![Tests](https://img.shields.io/badge/tests-114%2F114-brightgreen)](#) [![License](https://img.shields.io/badge/license-MIT-blue)](#license)

**No budgets, just tracking.** Cashlines helps you understand where your money comes from and where it goes.

## ✨ Key Features

## Features

- **📊 Dashboard** - Monthly overview with income, expenses, and routing breakdown

- **💰 Income Tracking** - Record income with automatic tax and deduction calculations- **Income Tracking**: Record income from various sources (salary, freelance, transfers, etc.)

- **🏦 Account Management** - Checking, savings, credit card, cash, and custom accounts- **Transaction Tracking**: Track all expenses and transfers across accounts

- **💳 Transaction Tracking** - Log expenses with flexible split allocation- **Account Management**: Manage multiple accounts (checking, savings, credit card, cash, etc.)

- **🚦 Money Routing** - Auto-split money across Need/Want/Debt/Tax/Savings categories- **Money Routing**: Split transactions across different categories:

- **📋 Routing Rules** - Create rules to automatically allocate transactions  - **Needs**: Essential expenses (groceries, utilities, rent)

- **📈 Monthly Reports** - Visualize spending patterns and allocation trends  - **Wants**: Discretionary spending (entertainment, dining)

- **🎨 Theme Support** - Light/dark/auto theme with persistent preferences  - **Debt**: Debt payments

- **📝 Templates** - Save and reuse common entry patterns  - **Tax**: Tax-related allocations

- **🔒 Self-Hosted** - Full privacy and control—no external services, no tracking  - **Savings**: Savings goals

- **🐳 Container-Ready** - Easy deployment with Docker or LXC- **Routing Rules**: Auto-split income based on custom rules (e.g., salary routing)

- **Monthly Reports**: Summary dashboards with income, expenses, and routing breakdown

## 🚀 Quick Start- **Tagging System**: Tag transactions and income for organization

- **Self-Hosted**: Full control over your financial data - runs locally or in containers

### Local Development (2 minutes)- **Privacy-Focused**: No tracking, no ads, no external services required

- **Container-Ready**: Easy deployment with Docker or LXC

```bash

# 1. Clone and install## Tech Stack

git clone https://github.com/nicksbar/cashlines.git

cd cashlines- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, shadcn/ui

npm install- **Backend**: Next.js API Routes (TypeScript)

- **Database**: Prisma ORM with SQLite (default) or PostgreSQL

# 2. Set up database- **Validation**: Zod for schema validation

cp .env.example .env- **Containerization**: Docker & Docker Compose

npx prisma db push- **Styling**: Tailwind CSS + shadcn/ui components



# 3. Start development server## Project Structure

npm run dev

``````

/src

Open [http://localhost:3000](http://localhost:3000) in your browser.  /app                 - Next.js pages and API routes

    /api               - RESTful API endpoints

### Docker Deployment (1 command)      /accounts        - Account CRUD operations

      /income          - Income entry management

```bash      /transactions    - Transaction management with splits

docker-compose up -d      /rules           - Routing rules

```      /reports/summary - Monthly summary reports

    /accounts          - Accounts page

App runs at [http://localhost:3000](http://localhost:3000) with persistent data volume.    /income            - Income tracking page

    /transactions      - Transactions page

## 📚 Documentation    /routes            - Money routing visualization

    /rules             - Rules management

Complete documentation available in `/docs/`:    /import            - Data import page

    page.tsx           - Dashboard

- **[Getting Started](./docs/GETTING_STARTED.md)** - Detailed setup instructions    layout.tsx         - Root layout with navigation

- **[Features & Usage](./docs/FEATURES.md)** - How to use each feature  /lib                 - Utilities

- **[API Reference](./docs/API.md)** - Complete endpoint documentation    db.ts              - Prisma client

- **[Architecture](./docs/ARCHITECTURE.md)** - Technical design and structure    validation.ts      - Zod schemas

- **[Deployment](./docs/DEPLOYMENT.md)** - Docker, LXC, and production setups    money.ts           - Currency/amount helpers

- **[Agent Instructions](./AGENTS.md)** - For automated development    date.ts            - Date utilities

    constants.ts       - App constants

## 🏗️ Technology Stack  /components          - React components

    /ui                - shadcn/ui components

| Layer | Technology |/prisma

|-------|-----------|  schema.prisma        - Database schema (User, Account, Income, Transaction, Split, Rule)

| **Frontend** | Next.js 14, React 18, TypeScript |  seed.js              - Demo data seed script

| **Styling** | Tailwind CSS, shadcn/ui, Lucide Icons |.env.example           - Environment variables template

| **Backend** | Next.js API Routes, TypeScript |Dockerfile             - Multi-stage Docker build

| **Database** | Prisma ORM, SQLite (dev) / PostgreSQL (prod) |docker-compose.yml     - Docker Compose configuration

| **Validation** | Zod schemas |```

| **Deployment** | Docker, Docker Compose, LXC |

## Getting Started

## 💡 How It Works

### Prerequisites

### 1. Set Up Accounts

Create accounts for your money flows: checking, savings, credit card, cash, etc.- Node.js 18+

- npm or yarn

### 2. Record Income- (Optional) Docker & Docker Compose for containerized deployment

Log income sources with automatic calculations for taxes and deductions.

### Local Development

### 3. Track Spending

Record expenses and specify how the money is allocated (Need/Want/Debt/Tax/Savings).1. **Clone the repository**:

```bash

### 4. Create Routing Rulesgit clone https://github.com/nicksbar/cashlines.git

Define rules to automatically split transactions:cd cashlines

- "Salary → 60% Need, 20% Want, 20% Savings"```

- "Groceries → 100% Need"

2. **Install dependencies**:

### 5. View Reports```bash

See monthly breakdowns showing where your money came from and went.npm install

```

### 6. Use Templates

Save frequent entries as templates for quick creation next time.3. **Set up environment**:

```bash

## 🔧 Commandscp .env.example .env

```

```bash

# Development4. **Initialize database**:

npm run dev              # Start dev server```bash

npm run build            # Production buildnpx prisma generate

npm start                # Run production servernpx prisma db push

npm run seed  # Load demo data (optional)

# Database```

npx prisma db push       # Sync schema changes

npx prisma migrate dev   # Create new migration5. **Start development server**:

npm run seed             # Load demo data```bash

npx prisma studio       # Open Prisma GUInpm run dev

```

# Testing & Quality

npm test                 # Run test suite6. Open [http://localhost:3000](http://localhost:3000)

npm run lint             # Check code style

```The demo user login is: `demo@cashlines.local`



## 🐳 Docker## Database



### Compose (Recommended)### SQLite (Default)



```bashSQLite is recommended for single-user deployments.

docker-compose up -d

``````env

DATABASE_URL="file:./dev.db"

### Custom Deployment```



```bash### PostgreSQL

docker build -t cashlines .

docker run -p 3000:3000 -v data:/app/data cashlinesFor multi-user or high-performance deployments:

```

1. Update `prisma/schema.prisma`:

## 📦 Project Status```prisma

datasource db {

- **MVP Status**: Feature-complete ✅  provider = "postgresql"

- **Test Coverage**: 114 tests, 100% passing ✅  url      = env("DATABASE_URL")

- **Build**: Production-ready ✅}

- **Dark Mode**: Fully implemented ✅```

- **Documentation**: Complete ✅

2. Update `.env`:

### Recent Additions```env

DATABASE_URL="postgresql://user:password@host:5432/cashlines"

1. **Template System** - Save and reuse entry patterns```

2. **Theme System** - Light/dark/auto themes with persistence

3. **Help System** - Contextual help with tooltips and guides3. Apply changes:

```bash

## 🤝 Contributingnpx prisma generate

npx prisma db push

See [AGENTS.md](./AGENTS.md) for detailed development guidelines and contribution instructions.```



## 📋 Roadmap## API Endpoints



- [ ] User authentication### Accounts

- [ ] Multi-user support- `GET /api/accounts` - List all accounts

- [ ] CSV/XLSX import- `POST /api/accounts` - Create account

- [ ] Mobile app- `GET /api/accounts/[id]` - Get account details

- [ ] Advanced reporting- `PATCH /api/accounts/[id]` - Update account

- [ ] Webhook integrations- `DELETE /api/accounts/[id]` - Delete account



## 🔐 Privacy & Security### Income

- `GET /api/income?month=11&year=2024` - List income (with date filters)

- **Self-Hosted**: Run on your own hardware- `POST /api/income` - Create income entry

- **No Cloud**: No data sent to external services

- **No Tracking**: No analytics or telemetry### Transactions

- **Open Source**: Inspect the code yourself- `GET /api/transactions?month=11&year=2024` - List transactions (with filters)

- **Your Data**: Full control and ownership- `POST /api/transactions` - Create transaction with splits



## 📄 License### Rules

- `GET /api/rules` - List routing rules

MIT - Use freely for personal or commercial use.- `POST /api/rules` - Create rule

- `GET /api/rules/[id]` - Get rule

## 📞 Support- `PATCH /api/rules/[id]` - Update rule

- `DELETE /api/rules/[id]` - Delete rule

- **Documentation**: See `/docs/` folder

- **Issues**: [GitHub Issues](https://github.com/nicksbar/cashlines/issues)### Reports

- **Discussions**: [GitHub Discussions](https://github.com/nicksbar/cashlines/discussions)- `GET /api/reports/summary?month=11&year=2024` - Monthly summary



---## Docker Deployment



**Built with ❤️ for privacy-conscious individuals who want control over their financial data.**### Quick Start with Docker Compose



Made with [Next.js](https://nextjs.org) • [Tailwind CSS](https://tailwindcss.com) • [Prisma](https://www.prisma.io) • [shadcn/ui](https://ui.shadcn.com)```bash

docker-compose up -d
```

App runs at [http://localhost:3000](http://localhost:3000)

Data is persisted in `cashlines-data` volume.

### With PostgreSQL

Uncomment the `postgres` service in `docker-compose.yml` and run:

```bash
docker-compose up -d
```

Update environment variable:
```env
DATABASE_URL=postgresql://cashlines:cashlines@postgres:5432/cashlines
```

### Building Manually

```bash
docker build -t cashlines .
docker run -p 3000:3000 -v cashlines-data:/app/data cashlines
```

## LXC Deployment

### 1. Create Container

```bash
lxc launch ubuntu:24.04 cashlines
lxc exec cashlines bash
```

### 2. Install Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs sqlite3
```

### 3. Set Up Cashlines

```bash
git clone https://github.com/nicksbar/cashlines.git
cd cashlines
npm install
cp .env.example .env
npx prisma db push
npm run seed
npm run build
npm start
```

### 4. Port Forwarding (on host)

```bash
lxc config device add cashlines web proxy listen=tcp:0.0.0.0:3000 connect=tcp:127.0.0.1:3000
```

## Usage

### Dashboard

Monthly view showing:
- Total income and expenses
- Breakdown by payment method (Credit Card, Cash, ACH)
- Money routing summary (split allocations)
- Tax-related totals

### Accounts

Create and manage accounts:
- **Checking**: Main transaction account
- **Savings**: Savings account
- **Credit Card**: Credit card accounts  
- **Cash**: Cash on hand
- **Other**: Custom account types

### Income

Record income sources with automatic routing rules:
- Salary, freelance, refunds, transfers, etc.
- Optional tags for organization
- Tax-related marking

### Transactions

Log expenses with split allocation:
- Date, amount, description
- Payment method (CC, Cash, ACH, Other)
- Split allocation (how money is categorized)
- Tags for filtering

### Routes

Visualize money allocation:
- Pie charts/tables of splits by category
- Target allocation tracking
- Monthly trend analysis

### Rules

Create automated routing rules:
- Match by income source or transaction description
- Define default split allocation
- Apply to transactions automatically

## Scripts

```bash
npm run dev              # Development server
npm run build            # Production build
npm start                # Production server
npm run lint             # Run linter
npm run prisma:generate  # Generate Prisma types
npm run prisma:push      # Sync database
npm run seed             # Seed demo data
npm run prisma:studio    # Open Prisma Studio GUI
```

## Contributing

Contributions welcome! Areas for enhancement:
- More split/routing visualizations
- CSV/XLSX import with bank mapping
- Multi-user authentication
- Mobile app
- Advanced reporting

Please submit PRs or open issues on GitHub.

## License

MIT - Use freely for personal or commercial use.

## Roadmap

- [ ] User authentication (currently single-user)
- [ ] CSV/XLSX import with bank-specific mappings
- [ ] Advanced reporting and analytics
- [ ] Mobile-friendly responsive design improvements
- [ ] API documentation (OpenAPI/Swagger)
- [ ] Multi-currency support
- [ ] Webhook integrations
- [ ] Dark mode

---

**Track your money. Take control of your finances. No budgets, no complexity.**
````
````markdown
# Cashlines

A self-hostable personal money tracking application focused on tracking income, expenses, and how money is routed across accounts and allocations. Built with modern web technologies for privacy-focused deployment in Docker and LXC containers.

**No budgets, just tracking.** Cashlines helps you understand where your money comes from and where it goes.

## Features

- **Income Tracking**: Record income from various sources (salary, freelance, transfers, etc.)
- **Transaction Tracking**: Track all expenses and transfers across accounts
- **Account Management**: Manage multiple accounts (checking, savings, credit card, cash, etc.)
- **Money Routing**: Split transactions across different categories:
  - **Needs**: Essential expenses (groceries, utilities, rent)
  - **Wants**: Discretionary spending (entertainment, dining)
  - **Debt**: Debt payments
  - **Tax**: Tax-related allocations
  - **Savings**: Savings goals
- **Routing Rules**: Auto-split income based on custom rules (e.g., salary routing)
- **Monthly Reports**: Summary dashboards with income, expenses, and routing breakdown
- **Tagging System**: Tag transactions and income for organization
- **Self-Hosted**: Full control over your financial data - runs locally or in containers
- **Privacy-Focused**: No tracking, no ads, no external services required
- **Container-Ready**: Easy deployment with Docker or LXC

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes (TypeScript)
- **Database**: Prisma ORM with SQLite (default) or PostgreSQL
- **Validation**: Zod for schema validation
- **Containerization**: Docker & Docker Compose
- **Styling**: Tailwind CSS + shadcn/ui components

## Project Structure

```
/src
  /app                 - Next.js pages and API routes
    /api               - RESTful API endpoints
      /accounts        - Account CRUD operations
      /income          - Income entry management
      /transactions    - Transaction management with splits
      /rules           - Routing rules
      /reports/summary - Monthly summary reports
    /accounts          - Accounts page
    /income            - Income tracking page
    /transactions      - Transactions page
    /routes            - Money routing visualization
    /rules             - Rules management
    /import            - Data import page
    page.tsx           - Dashboard
    layout.tsx         - Root layout with navigation
  /lib                 - Utilities
    db.ts              - Prisma client
    validation.ts      - Zod schemas
    money.ts           - Currency/amount helpers
    date.ts            - Date utilities
    constants.ts       - App constants
  /components          - React components
    /ui                - shadcn/ui components
/prisma
  schema.prisma        - Database schema (User, Account, Income, Transaction, Split, Rule)
  seed.js              - Demo data seed script
.env.example           - Environment variables template
Dockerfile             - Multi-stage Docker build
docker-compose.yml     - Docker Compose configuration
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- (Optional) Docker & Docker Compose for containerized deployment

### Local Development

1. **Clone the repository**:
```bash
git clone https://github.com/nicksbar/cashlines.git
cd cashlines
```

2. **Install dependencies**:
```bash
npm install
```

3. **Set up environment**:
```bash
cp .env.example .env
```

4. **Initialize database**:
```bash
npx prisma generate
npx prisma db push
npm run seed  # Load demo data (optional)
```

5. **Start development server**:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

The demo user login is: `demo@cashlines.local`

## Database

### SQLite (Default)

SQLite is recommended for single-user deployments.

```env
DATABASE_URL="file:./dev.db"
```

### PostgreSQL

For multi-user or high-performance deployments:

1. Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Update `.env`:
```env
DATABASE_URL="postgresql://user:password@host:5432/cashlines"
```

3. Apply changes:
```bash
npx prisma generate
npx prisma db push
```

## API Endpoints

### Accounts
- `GET /api/accounts` - List all accounts
- `POST /api/accounts` - Create account
- `GET /api/accounts/[id]` - Get account details
- `PATCH /api/accounts/[id]` - Update account
- `DELETE /api/accounts/[id]` - Delete account

### Income
- `GET /api/income?month=11&year=2024` - List income (with date filters)
- `POST /api/income` - Create income entry

### Transactions
- `GET /api/transactions?month=11&year=2024` - List transactions (with filters)
- `POST /api/transactions` - Create transaction with splits

### Rules
- `GET /api/rules` - List routing rules
- `POST /api/rules` - Create rule
- `GET /api/rules/[id]` - Get rule
- `PATCH /api/rules/[id]` - Update rule
- `DELETE /api/rules/[id]` - Delete rule

### Reports
- `GET /api/reports/summary?month=11&year=2024` - Monthly summary

## Docker Deployment

### Quick Start with Docker Compose

```bash
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
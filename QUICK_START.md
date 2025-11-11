# Cashlines - Quick Start Guide

## 🚀 Get Started in 3 Minutes

### Option 1: Local Development (Recommended)

```bash
# 1. Install dependencies
npm install

# 2. Database setup (already done, but for reference)
npx prisma db push

# 3. Start dev server
npm run dev

# 4. Open browser
# → http://localhost:3000
```

**Login:** Already authenticated as demo@cashlines.local

### Option 2: Docker

```bash
# 1. Build and run with Docker Compose
docker-compose up -d

# 2. Open browser
# → http://localhost:3000

# View logs
docker-compose logs -f cashlines
```

### Option 3: Build for Production

```bash
# Build
npm run build

# Start
npm start

# Open → http://localhost:3000
```

## 📊 Dashboard Features

The dashboard shows:
- **Month Selector** - Pick any month to view
- **Summary Cards** - Income, Expenses, Net Balance, Tax Total
- **Expenses by Method** - CC vs Cash breakdown
- **Routing Summary** - Money allocation by category

### Sample Data Included
The app comes pre-populated with demo data:
- 4 accounts (Checking, Savings, Amex, Cash)
- 2 income entries (Salary $5000, Freelance $500)
- 2 transactions (Grocery $85.50, Coffee $25.00)
- 1 routing rule

Change the month in the selector to October 2024 to see the salary income.

## 🔗 API Endpoints

Try these in your browser or with curl:

```bash
# List accounts
curl http://localhost:3000/api/accounts

# Get monthly summary
curl http://localhost:3000/api/reports/summary?month=10&year=2024

# Export as CSV
curl http://localhost:3000/api/export?type=all > data.csv

# List transactions (November 2024)
curl "http://localhost:3000/api/transactions?month=11&year=2024"

# List income
curl "http://localhost:3000/api/income?month=10&year=2024"
```

## 📝 Common Tasks

### Add an Account
Navigate to `/accounts` and click "New Account"

### Add Income
Click "Add Income" button on dashboard or `/income` page

### Add Transaction
Click "Add Transaction" button on dashboard or `/transactions` page

### View Routing
Go to `/routes` to see money allocation visualization

### Manage Rules
Go to `/rules` to set up automatic transaction routing

### Export Data
On dashboard, look for Export button (CSV format)

## 🗄️ Database

**Default:** SQLite (stored in `dev.db`)

**Switch to PostgreSQL:**
1. Update `prisma/schema.prisma` - change provider to "postgresql"
2. Update `.env`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/cashlines"
   ```
3. Run: `npx prisma db push`

## 🛠️ Useful Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Regenerate Prisma types (if schema changes)
npm run prisma:generate

# Sync schema to database
npm run prisma:push

# Open Prisma Studio (GUI database viewer)
npm run prisma:studio

# Reseed demo data
npm run seed

# Linting
npm run lint
```

## 📚 Documentation

- **README.md** - Comprehensive guide
- **IMPLEMENTATION_NOTES.md** - Technical details
- **prisma/schema.prisma** - Database schema documentation

## 🐳 Docker Tips

```bash
# View logs
docker-compose logs -f

# Stop containers
docker-compose down

# Rebuild image
docker-compose build --no-cache

# Access database file
# SQLite file is in: /app/data/cashlines.db (inside container)
# Local mount: cashlines-data volume (use docker cp to extract)

# Use PostgreSQL instead
# 1. Uncomment postgres service in docker-compose.yml
# 2. Update DATABASE_URL in service environment
# 3. Run: docker-compose up -d
```

## 🐛 Troubleshooting

**Port 3000 already in use?**
```bash
# Kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

**Database locked?**
```bash
# Remove SQLite database and reseed
rm dev.db
npm run seed
```

**TypeScript errors in IDE?**
```bash
# Regenerate Prisma types
npm run prisma:generate

# Restart your IDE
```

## 📞 Support

Check the full README.md for:
- Detailed API documentation
- LXC deployment instructions
- Database configuration
- Architecture overview

## ✨ Next Steps

1. Add income and transactions
2. Set up routing rules
3. Explore the reports
4. Export your data
5. (Optional) Deploy to Docker or LXC

---

**Cashlines** - Track your money, understand your finances. No budgets, no complexity.

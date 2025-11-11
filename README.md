# Cashlines

A self-hostable money tracking web application focused on tracking income and expenses without complex budgeting features. Built with modern web technologies for easy deployment in Docker and LXC containers.

## Features

- **Income Tracking**: Record income from various sources
- **Transaction Tracking**: Track expenses and transfers
- **Routing Support**: Categorize transactions by payment method (Credit Card, Cash, Savings, Checking)
- **Tax Tagging**: Mark transactions and income as tax-related with categories
- **Import/Export**: Export your financial data to CSV format
- **Self-Hosted**: Full control over your financial data
- **Container-Ready**: Easy deployment with Docker and LXC

## Tech Stack

- **Frontend**: Next.js 14+ with App Router, TypeScript, Tailwind CSS, shadcn/ui components
- **Backend**: Next.js API Routes
- **Database**: Prisma ORM with SQLite (default) or PostgreSQL support
- **Containerization**: Docker, Docker Compose

## Project Structure

```
/src/app          - Next.js pages and API routes
  /api            - API endpoints for transactions, income, export
  page.tsx        - Main dashboard
  layout.tsx      - Root layout
  globals.css     - Global styles
/src/lib          - Utility functions and database client
/src/components   - React components
  /ui             - shadcn/ui components
/prisma           - Database schema and migrations
  schema.prisma   - Prisma schema definition
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/nicksbar/cashlines.git
cd cashlines
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
cp .env.example .env
npx prisma generate
npx prisma db push
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Configuration

### SQLite (Default)

SQLite is used by default for simplicity. No additional setup required.

```env
DATABASE_URL="file:./dev.db"
```

### PostgreSQL

To use PostgreSQL instead:

1. Update `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/cashlines?schema=public"
```

2. Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

3. Run migrations:
```bash
npx prisma generate
npx prisma db push
```

## Docker Deployment

### Using Docker Compose (Recommended)

1. Build and start the container:
```bash
docker-compose up -d
```

The application will be available at [http://localhost:3000](http://localhost:3000).

Data is persisted in a Docker volume named `cashlines-data`.

### Using Docker with PostgreSQL

Uncomment the PostgreSQL section in `docker-compose.yml` and use:

```bash
docker-compose up -d cashlines-postgres postgres
```

### Building Docker Image Manually

```bash
docker build -t cashlines .
docker run -p 3000:3000 -v cashlines-data:/app/data cashlines
```

## LXC Container Deployment

### Create LXC Container

```bash
lxc launch ubuntu:22.04 cashlines
lxc exec cashlines -- bash
```

### Inside the Container

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Clone and setup
git clone https://github.com/nicksbar/cashlines.git
cd cashlines
npm install
cp .env.example .env
npx prisma generate
npx prisma db push
npm run build
npm start
```

### Configure Port Forwarding

```bash
# On host
lxc config device add cashlines myport proxy listen=tcp:0.0.0.0:3000 connect=tcp:127.0.0.1:3000
```

## Usage

### Dashboard

The main dashboard displays:
- Total Income
- Total Expenses  
- Net Balance

### Adding Transactions

1. Click "Add Transaction" button
2. Fill in details:
   - Description
   - Amount
   - Date
   - Type (Expense/Transfer)
   - Routing (Credit Card/Cash/Savings/Checking)
   - Optional: Category, Tax information, Notes
3. Click "Add Transaction"

### Adding Income

1. Click "Add Income" button
2. Fill in details:
   - Description
   - Amount
   - Date
   - Optional: Source, Tax information, Notes
3. Click "Add Income"

### Exporting Data

Click the "Export CSV" button to download all your financial data in CSV format.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:push` - Push schema to database
- `npm run prisma:studio` - Open Prisma Studio

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
DATABASE_URL="file:./dev.db"
```

For PostgreSQL:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/cashlines?schema=public"
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues and questions, please open an issue on GitHub.
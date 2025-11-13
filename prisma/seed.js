/**
 * Seed script for demo data
 * Run with: node prisma/seed.js
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create a demo user
  const user = await prisma.user.upsert({
    where: { email: 'demo@cashlines.local' },
    update: {},
    create: {
      email: 'demo@cashlines.local',
      name: 'Demo User',
    },
  })

  console.log(`Created user: ${user.email}`)

  // Create accounts with realistic financial data
  const checking = await prisma.account.create({
    data: {
      userId: user.id,
      name: 'Checking',
      type: 'checking',
      isActive: true,
      currentBalance: 5500,
      interestRateApy: 0.50,
      monthlyFee: 0,
      minimumBalance: 500,
      isFdic: true,
    },
  })

  const savings = await prisma.account.create({
    data: {
      userId: user.id,
      name: 'High-Yield Savings',
      type: 'savings',
      isActive: true,
      currentBalance: 15000,
      interestRateApy: 4.75,
      monthlyFee: 0,
      minimumBalance: 1000,
      isFdic: true,
    },
  })

  const amex = await prisma.account.create({
    data: {
      userId: user.id,
      name: 'American Express Platinum',
      type: 'credit_card',
      isActive: true,
      creditLimit: 25000,
      interestRate: 18.99,
      currentBalance: 3200,
      annualFee: 695,
      cashBackPercent: 1.5,
      pointsPerDollar: 1,
      rewardsProgram: 'Membership Rewards',
    },
  })

  const chase = await prisma.account.create({
    data: {
      userId: user.id,
      name: 'Chase Freedom Flex',
      type: 'credit_card',
      isActive: true,
      creditLimit: 10000,
      interestRate: 21.99,
      currentBalance: 0,
      annualFee: 0,
      cashBackPercent: 5.0,
      pointsPerDollar: 1.5,
      rewardsProgram: 'Ultimate Rewards',
    },
  })

  const cash = await prisma.account.create({
    data: {
      userId: user.id,
      name: 'Wallet',
      type: 'cash',
      isActive: true,
      currentBalance: 245.50,
      location: 'Physical Wallet',
    },
  })

  const student = await prisma.account.create({
    data: {
      userId: user.id,
      name: 'Student Loan',
      type: 'loan',
      isActive: true,
      principalBalance: 35000,
      currentBalance: 32400,
      interestRate: 6.08,
      accountNumber: 'LOAN-XXX-1234',
    },
  })

  console.log(`Created accounts: ${checking.name}, ${savings.name}, ${amex.name}, ${chase.name}, ${cash.name}, ${student.name}`)

  // Create sample income
  const today = new Date()
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())

  const income1 = await prisma.income.create({
    data: {
      userId: user.id,
      accountId: checking.id,
      date: lastMonth,
      grossAmount: 5000,
      taxes: 1200,
      preTaxDeductions: 400,
      postTaxDeductions: 200,
      netAmount: 3200,
      source: 'Salary',
      tags: JSON.stringify(['recurring', 'tax:w2']),
    },
  })

  const income2 = await prisma.income.create({
    data: {
      userId: user.id,
      accountId: checking.id,
      date: today,
      grossAmount: 500,
      taxes: 75,
      preTaxDeductions: 0,
      postTaxDeductions: 0,
      netAmount: 425,
      source: 'Freelance',
      tags: JSON.stringify(['irregular', 'tax:1099']),
    },
  })

  console.log(`Created income entries: ${income1.amount} from ${income1.source}, ${income2.amount} from ${income2.source}`)

  // Create sample transactions with realistic spending
  const transactions = [
    { desc: 'Whole Foods Grocery Store', amt: 145.78, method: 'cc', split: 'need', target: 'Food' },
    { desc: 'Amazon Purchase', amt: 89.99, method: 'cc', split: 'want', target: 'Shopping' },
    { desc: 'Electric Bill', amt: 156.23, method: 'ach', split: 'need', target: 'Utilities' },
    { desc: 'Starbucks Coffee', amt: 6.45, method: 'cc', split: 'want', target: 'Dining' },
    { desc: 'Netflix Subscription', amt: 15.99, method: 'cc', split: 'want', target: 'Entertainment' },
    { desc: 'Gas Station', amt: 62.50, method: 'cc', split: 'need', target: 'Transportation' },
    { desc: 'Restaurant Dinner', amt: 78.50, method: 'cc', split: 'want', target: 'Dining' },
    { desc: 'ATM Withdrawal', amt: 100.00, method: 'ach', split: 'want', target: 'Cash' },
  ]

  for (const tx of transactions) {
    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        accountId: tx.method === 'ach' ? checking.id : amex.id,
        date: today,
        amount: tx.amt,
        description: tx.desc,
        method: tx.method,
        tags: JSON.stringify(['tracked']),
      },
    })

    // Create split
    await prisma.split.create({
      data: {
        transactionId: transaction.id,
        type: tx.split,
        target: tx.target,
        percent: 100,
      },
    })
  }

  console.log(`Created ${transactions.length} sample transactions with splits`)

  // Create a routing rule
  const rule = await prisma.rule.create({
    data: {
      userId: user.id,
      name: 'Salary Routing',
      matchSource: 'Salary',
      splitConfig: JSON.stringify([
        { type: 'need', target: 'Expenses Fund', percent: 60 },
        { type: 'want', target: 'Discretionary', percent: 15 },
        { type: 'savings', target: 'Emergency Fund', percent: 20 },
        { type: 'tax', target: 'Tax Withholding', percent: 5 },
      ]),
      isActive: true,
    },
  })

  console.log(`Created rule: ${rule.name}`)

  console.log('✓ Seed completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

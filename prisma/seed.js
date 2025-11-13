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

  // Create household members
  const alice = await prisma.person.upsert({
    where: { userId_name: { userId: user.id, name: 'Alice' } },
    update: {},
    create: {
      userId: user.id,
      name: 'Alice',
      role: 'primary',
      color: '#4ECDC4', // Teal
    },
  })

  const bob = await prisma.person.upsert({
    where: { userId_name: { userId: user.id, name: 'Bob' } },
    update: {},
    create: {
      userId: user.id,
      name: 'Bob',
      role: 'spouse',
      color: '#FF6B6B', // Red
    },
  })

  console.log(`Created household members: ${alice.name} (${alice.role}), ${bob.name} (${bob.role})`)

  // Create accounts with realistic financial data (with some financial challenges)
  const checking = await prisma.account.create({
    data: {
      userId: user.id,
      name: 'Checking',
      type: 'checking',
      isActive: true,
      currentBalance: 8500,
      interestRateApy: 0.01, // Very low APY - traditional checking account
      monthlyFee: 0,
      minimumBalance: 500,
      isFdic: true,
    },
  })

  const savings = await prisma.account.create({
    data: {
      userId: user.id,
      name: 'Regular Savings',
      type: 'savings',
      isActive: true,
      currentBalance: 12000,
      interestRateApy: 4.35, // Market rate high-yield savings account (Nov 2024)
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
      creditLimit: 15000,
      interestRate: 19.99, // High APR
      currentBalance: 8500, // High utilization - 56.7%!
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
      creditLimit: 8000,
      interestRate: 22.99, // Higher APR
      currentBalance: 3200, // 40% utilization
      annualFee: 0,
      cashBackPercent: 5.0,
      pointsPerDollar: 1.5,
      rewardsProgram: 'Ultimate Rewards',
    },
  })

  const discover = await prisma.account.create({
    data: {
      userId: user.id,
      name: 'Discover It',
      type: 'credit_card',
      isActive: true,
      creditLimit: 5000,
      interestRate: 21.99,
      currentBalance: 4500, // 90% utilization - WARNING!
      annualFee: 0,
      cashBackPercent: 2.0,
      pointsPerDollar: 1,
      rewardsProgram: 'Discover Cashback',
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

  console.log(`Created accounts: ${checking.name}, ${savings.name}, ${amex.name}, ${chase.name}, ${discover.name}, ${cash.name}, ${student.name}`)

  // Create sample income
  const today = new Date()
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())

  const income1 = await prisma.income.create({
    data: {
      userId: user.id,
      personId: alice.id,
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
      personId: bob.id,
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
    { desc: 'Whole Foods Grocery Store', amt: 245.78, method: 'cc', split: 'need', target: 'Food', card: chase, person: alice },
    { desc: 'Amazon Purchase', amt: 189.99, method: 'cc', split: 'want', target: 'Shopping', card: amex, person: bob },
    { desc: 'Electric Bill', amt: 156.23, method: 'ach', split: 'need', target: 'Utilities', card: null, person: alice },
    { desc: 'Starbucks Coffee', amt: 16.45, method: 'cc', split: 'want', target: 'Dining', card: chase, person: alice },
    { desc: 'Netflix Subscription', amt: 15.99, method: 'cc', split: 'want', target: 'Entertainment', card: discover, person: null },
    { desc: 'Gas Station', amt: 62.50, method: 'cc', split: 'need', target: 'Transportation', card: amex, person: bob },
    { desc: 'Restaurant Dinner', amt: 178.50, method: 'cc', split: 'want', target: 'Dining', card: amex, person: null },
    { desc: 'Grocery Store Costco', amt: 287.64, method: 'cc', split: 'need', target: 'Food', card: discover, person: alice },
    { desc: 'Target Shopping', amt: 95.23, method: 'cc', split: 'want', target: 'Shopping', card: chase, person: bob },
    { desc: 'Uber Rides', amt: 45.50, method: 'cc', split: 'need', target: 'Transportation', card: chase, person: alice },
  ]

  for (const tx of transactions) {
    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        personId: tx.person?.id || null,
        accountId: tx.method === 'ach' ? checking.id : tx.card?.id || amex.id,
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

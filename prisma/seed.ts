/**
 * Seed script for demo data
 * Run with: npx ts-node prisma/seed.ts
 */

import { PrismaClient } from '@prisma/client'

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

  // Create accounts
  const checking = await prisma.account.upsert({
    where: { userId_name: { userId: user.id, name: 'Checking' } },
    update: {},
    create: {
      userId: user.id,
      name: 'Checking',
      type: 'checking',
      isActive: true,
    },
  })

  const savings = await prisma.account.upsert({
    where: { userId_name: { userId: user.id, name: 'Savings' } },
    update: {},
    create: {
      userId: user.id,
      name: 'Savings',
      type: 'savings',
      isActive: true,
    },
  })

  const amex = await prisma.account.upsert({
    where: { userId_name: { userId: user.id, name: 'Amex' } },
    update: {},
    create: {
      userId: user.id,
      name: 'Amex',
      type: 'credit_card',
      isActive: true,
    },
  })

  const cash = await prisma.account.upsert({
    where: { userId_name: { userId: user.id, name: 'Cash' } },
    update: {},
    create: {
      userId: user.id,
      name: 'Cash',
      type: 'cash',
      isActive: true,
    },
  })

  console.log(`Created accounts: ${checking.name}, ${savings.name}, ${amex.name}, ${cash.name}`)

  // Create sample income
  const today = new Date()
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())

  const income1 = await prisma.income.create({
    data: {
      userId: user.id,
      accountId: checking.id,
      date: lastMonth,
      amount: 5000,
      source: 'Salary',
      tags: JSON.stringify(['recurring', 'tax:w2']),
    },
  })

  const income2 = await prisma.income.create({
    data: {
      userId: user.id,
      accountId: checking.id,
      date: today,
      amount: 500,
      source: 'Freelance',
      tags: JSON.stringify(['irregular', 'tax:1099']),
    },
  })

  console.log(`Created income entries: ${income1.amount} from ${income1.source}, ${income2.amount} from ${income2.source}`)

  // Create sample transactions
  const tx1 = await prisma.transaction.create({
    data: {
      userId: user.id,
      accountId: amex.id,
      date: today,
      amount: 85.50,
      description: 'Grocery Store',
      method: 'cc',
      tags: JSON.stringify(['groceries', 'recurring']),
    },
  })

  const tx2 = await prisma.transaction.create({
    data: {
      userId: user.id,
      accountId: cash.id,
      date: today,
      amount: 25.00,
      description: 'Coffee',
      method: 'cash',
      tags: JSON.stringify(['dining']),
    },
  })

  console.log(`Created transactions: ${tx1.description} (${tx1.amount}), ${tx2.description} (${tx2.amount})`)

  // Create splits for the first transaction
  await prisma.split.create({
    data: {
      transactionId: tx1.id,
      type: 'need',
      target: 'Food',
      percent: 100,
    },
  })

  // Create splits for the second transaction
  await prisma.split.create({
    data: {
      transactionId: tx2.id,
      type: 'want',
      target: 'Discretionary',
      percent: 100,
    },
  })

  console.log('Created splits')

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

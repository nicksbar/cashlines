/**
 * Seed script for realistic household test data
 * Family of 4: ~$150k/year income, mortgage, 2 cars, kids expenses
 * Run with: npx ts-node prisma/seed-household.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Helper to create dates for the current month
function getDateInMonth(day: number, month?: number, year?: number): Date {
  const now = new Date()
  const targetMonth = month ?? now.getMonth()
  const targetYear = year ?? now.getFullYear()
  return new Date(targetYear, targetMonth, Math.min(day, 28))
}

async function main() {
  console.log('🏠 Seeding realistic household data...')

  // Create user
  const user = await prisma.user.upsert({
    where: { email: 'household@cashlines.local' },
    update: {},
    create: {
      email: 'household@cashlines.local',
      name: 'Household Demo',
    },
  })
  console.log(`✓ Created user: ${user.email}`)

  // Create people in household
  const sarah = await prisma.person.create({
    data: {
      userId: user.id,
      name: 'Sarah',
      role: 'primary-earner',
      color: '#3B82F6',
    },
  })

  const mike = await prisma.person.create({
    data: {
      userId: user.id,
      name: 'Mike',
      role: 'secondary-earner',
      color: '#10B981',
    },
  })

  const child1 = await prisma.person.create({
    data: {
      userId: user.id,
      name: 'Emma',
      role: 'dependent',
      color: '#F59E0B',
    },
  })

  const child2 = await prisma.person.create({
    data: {
      userId: user.id,
      name: 'Jake',
      role: 'dependent',
      color: '#EC4899',
    },
  })

  console.log(`✓ Created household members: Sarah, Mike, Emma, Jake`)

  // Create accounts
  const checking = await prisma.account.upsert({
    where: { userId_name: { userId: user.id, name: 'Primary Checking' } },
    update: {},
    create: {
      userId: user.id,
      name: 'Primary Checking',
      type: 'checking',
      personId: sarah.id,
      isActive: true,
    },
  })

  const savings = await prisma.account.upsert({
    where: { userId_name: { userId: user.id, name: 'Emergency Fund' } },
    update: {},
    create: {
      userId: user.id,
      name: 'Emergency Fund',
      type: 'savings',
      personId: sarah.id,
      isActive: true,
    },
  })

  const creditCard = await prisma.account.upsert({
    where: { userId_name: { userId: user.id, name: 'Chase Sapphire' } },
    update: {},
    create: {
      userId: user.id,
      name: 'Chase Sapphire',
      type: 'credit_card',
      creditLimit: 25000,
      personId: sarah.id,
      isActive: true,
    },
  })

  const mikeCard = await prisma.account.upsert({
    where: { userId_name: { userId: user.id, name: 'Amex Blue' } },
    update: {},
    create: {
      userId: user.id,
      name: 'Amex Blue',
      type: 'credit_card',
      creditLimit: 15000,
      personId: mike.id,
      isActive: true,
    },
  })

  const cash = await prisma.account.upsert({
    where: { userId_name: { userId: user.id, name: 'Cash Wallet' } },
    update: {},
    create: {
      userId: user.id,
      name: 'Cash Wallet',
      type: 'cash',
      isActive: true,
    },
  })

  console.log(`✓ Created accounts: Checking, Savings, 2x Credit Cards, Cash`)

  // Create income entries (~$150k/year = $12,500/month)
  // Sarah: $85k salary + bonus
  const sarahSalary1 = await prisma.income.create({
    data: {
      userId: user.id,
      personId: sarah.id,
      accountId: checking.id,
      date: getDateInMonth(1),
      grossAmount: 7083, // $85k/12
      taxes: 1700, // ~24% effective tax
      preTaxDeductions: 350, // 401k
      postTaxDeductions: 200, // insurance
      netAmount: 4833,
      source: 'Salary - ABC Corp',
      tags: JSON.stringify(['recurring', 'tax:w2', 'primary']),
    },
  })

  // Mike: $60k salary
  const mikeSalary = await prisma.income.create({
    data: {
      userId: user.id,
      personId: mike.id,
      accountId: checking.id,
      date: getDateInMonth(1),
      grossAmount: 5000, // $60k/12
      taxes: 1100, // ~22% effective tax
      preTaxDeductions: 250, // 401k
      postTaxDeductions: 150, // insurance
      netAmount: 3500,
      source: 'Salary - Tech Startup',
      tags: JSON.stringify(['recurring', 'tax:w2', 'secondary']),
    },
  })

  // Sarah bonus (quarterly)
  const sarahBonus = await prisma.income.create({
    data: {
      userId: user.id,
      personId: sarah.id,
      accountId: checking.id,
      date: getDateInMonth(15),
      grossAmount: 8000,
      taxes: 2400, // Higher tax on bonus
      preTaxDeductions: 0,
      postTaxDeductions: 0,
      netAmount: 5600,
      source: 'Quarterly Bonus',
      tags: JSON.stringify(['irregular', 'bonus']),
    },
  })

  // Side income - Mike freelance
  const mikeFreelance = await prisma.income.create({
    data: {
      userId: user.id,
      personId: mike.id,
      accountId: checking.id,
      date: getDateInMonth(20),
      grossAmount: 2500,
      taxes: 625, // 25% self-employment
      preTaxDeductions: 0,
      postTaxDeductions: 0,
      netAmount: 1875,
      source: 'Freelance Consulting',
      tags: JSON.stringify(['irregular', 'tax:1099']),
    },
  })

  console.log(
    `✓ Created income: Sarah salary + bonus, Mike salary + freelance (~$150k/year)`
  )

  // ===== NECESSARY EXPENSES (50% budget) =====

  // Mortgage: $2,200/month
  const mortgage = await prisma.transaction.create({
    data: {
      userId: user.id,
      accountId: checking.id,
      date: getDateInMonth(3),
      amount: 2200,
      description: 'Mortgage Payment - Home Loan',
      method: 'ach',
      tags: JSON.stringify(['housing', 'recurring']),
    },
  })

  await prisma.split.create({
    data: {
      transactionId: mortgage.id,
      type: 'need',
      target: 'Housing',
      percent: 100,
    },
  })

  // Property tax & insurance: $400/month
  const homeInsurance = await prisma.transaction.create({
    data: {
      userId: user.id,
      accountId: checking.id,
      date: getDateInMonth(5),
      amount: 400,
      description: 'Property Tax & Home Insurance',
      method: 'ach',
      tags: JSON.stringify(['housing', 'recurring']),
    },
  })

  await prisma.split.create({
    data: {
      transactionId: homeInsurance.id,
      type: 'need',
      target: 'Housing',
      percent: 100,
    },
  })

  // Utilities: $250/month
  const utilities = await prisma.transaction.create({
    data: {
      userId: user.id,
      accountId: checking.id,
      date: getDateInMonth(7),
      amount: 250,
      description: 'Electric, Gas, Water',
      method: 'ach',
      tags: JSON.stringify(['utilities', 'recurring']),
    },
  })

  await prisma.split.create({
    data: {
      transactionId: utilities.id,
      type: 'need',
      target: 'Utilities',
      percent: 100,
    },
  })

  // Car loan #1: $450/month (owned car)
  const carLoan = await prisma.transaction.create({
    data: {
      userId: user.id,
      accountId: creditCard.id,
      date: getDateInMonth(8),
      amount: 450,
      description: 'Auto Loan - Toyota Camry',
      method: 'cc',
      tags: JSON.stringify(['transportation', 'recurring']),
    },
  })

  await prisma.split.create({
    data: {
      transactionId: carLoan.id,
      type: 'need',
      target: 'Transportation',
      percent: 100,
    },
  })

  // Car lease #2: $380/month (leased car)
  const carLease = await prisma.transaction.create({
    data: {
      userId: user.id,
      accountId: creditCard.id,
      date: getDateInMonth(8),
      amount: 380,
      description: 'Car Lease - Honda Accord',
      method: 'cc',
      tags: JSON.stringify(['transportation', 'recurring']),
    },
  })

  await prisma.split.create({
    data: {
      transactionId: carLease.id,
      type: 'need',
      target: 'Transportation',
      percent: 100,
    },
  })

  // Car insurance: $200/month
  const autoInsurance = await prisma.transaction.create({
    data: {
      userId: user.id,
      accountId: creditCard.id,
      date: getDateInMonth(9),
      amount: 200,
      description: 'Auto Insurance - Geico',
      method: 'cc',
      tags: JSON.stringify(['transportation', 'recurring']),
    },
  })

  await prisma.split.create({
    data: {
      transactionId: autoInsurance.id,
      type: 'need',
      target: 'Transportation',
      percent: 100,
    },
  })

  // Gas: $180/month
  const gas = await prisma.transaction.create({
    data: {
      userId: user.id,
      accountId: creditCard.id,
      date: getDateInMonth(10),
      amount: 180,
      description: 'Gas - Shell & Costco',
      method: 'cc',
      tags: JSON.stringify(['transportation', 'recurring']),
    },
  })

  await prisma.split.create({
    data: {
      transactionId: gas.id,
      type: 'need',
      target: 'Transportation',
      percent: 100,
    },
  })

  // Groceries: $600/month
  const groceries = await prisma.transaction.create({
    data: {
      userId: user.id,
      accountId: creditCard.id,
      date: getDateInMonth(12),
      amount: 600,
      description: 'Groceries - Whole Foods & Trader Joes',
      method: 'cc',
      tags: JSON.stringify(['food', 'recurring']),
    },
  })

  await prisma.split.create({
    data: {
      transactionId: groceries.id,
      type: 'need',
      target: 'Food',
      percent: 100,
    },
  })

  // Health insurance: $450/month
  const healthIns = await prisma.transaction.create({
    data: {
      userId: user.id,
      accountId: checking.id,
      date: getDateInMonth(1),
      amount: 450,
      description: 'Family Health Insurance',
      method: 'ach',
      tags: JSON.stringify(['healthcare', 'recurring']),
    },
  })

  await prisma.split.create({
    data: {
      transactionId: healthIns.id,
      type: 'need',
      target: 'Healthcare',
      percent: 100,
    },
  })

  // Kids activities: $150/month
  const kidsActivities = await prisma.transaction.create({
    data: {
      userId: user.id,
      accountId: checking.id,
      date: getDateInMonth(6),
      amount: 150,
      description: 'Childcare & Activities - Soccer, Piano',
      method: 'ach',
      tags: JSON.stringify(['childcare', 'recurring']),
    },
  })

  await prisma.split.create({
    data: {
      transactionId: kidsActivities.id,
      type: 'need',
      target: 'Childcare',
      percent: 100,
    },
  })

  console.log(`✓ Created necessary expenses (~$6,240/month, 50% of income)`)

  // ===== WANT EXPENSES (30% budget) =====

  // Dining out: $400/month
  const dining = await prisma.transaction.create({
    data: {
      userId: user.id,
      accountId: creditCard.id,
      date: getDateInMonth(14),
      amount: 400,
      description: 'Restaurants - Various',
      method: 'cc',
      tags: JSON.stringify(['dining', 'recurring']),
    },
  })

  await prisma.split.create({
    data: {
      transactionId: dining.id,
      type: 'want',
      target: 'Dining',
      percent: 100,
    },
  })

  // Entertainment & streaming: $80/month
  const entertainment = await prisma.transaction.create({
    data: {
      userId: user.id,
      accountId: creditCard.id,
      date: getDateInMonth(15),
      amount: 80,
      description: 'Netflix, Disney+, Spotify',
      method: 'cc',
      tags: JSON.stringify(['entertainment', 'recurring']),
    },
  })

  await prisma.split.create({
    data: {
      transactionId: entertainment.id,
      type: 'want',
      target: 'Entertainment',
      percent: 100,
    },
  })

  // Gym membership: $50/month
  const gym = await prisma.transaction.create({
    data: {
      userId: user.id,
      accountId: creditCard.id,
      date: getDateInMonth(16),
      amount: 50,
      description: 'Planet Fitness Membership',
      method: 'cc',
      tags: JSON.stringify(['wellness', 'recurring']),
    },
  })

  await prisma.split.create({
    data: {
      transactionId: gym.id,
      type: 'want',
      target: 'Wellness',
      percent: 100,
    },
  })

  // Shopping & personal: $300/month
  const shopping = await prisma.transaction.create({
    data: {
      userId: user.id,
      accountId: creditCard.id,
      date: getDateInMonth(20),
      amount: 300,
      description: 'Clothing, household items',
      method: 'cc',
      tags: JSON.stringify(['shopping', 'discretionary']),
    },
  })

  await prisma.split.create({
    data: {
      transactionId: shopping.id,
      type: 'want',
      target: 'Shopping',
      percent: 100,
    },
  })

  // Coffee & small discretionary: $150/month
  const discretionary = await prisma.transaction.create({
    data: {
      userId: user.id,
      accountId: cash.id,
      date: getDateInMonth(22),
      amount: 150,
      description: 'Coffee, snacks, misc',
      method: 'cash',
      tags: JSON.stringify(['discretionary']),
    },
  })

  await prisma.split.create({
    data: {
      transactionId: discretionary.id,
      type: 'want',
      target: 'Discretionary',
      percent: 100,
    },
  })

  console.log(`✓ Created want expenses (~$1,380/month, 30% of income)`)

  // ===== SAVINGS (20% budget) =====

  // Monthly savings transfer
  const savings1 = await prisma.transaction.create({
    data: {
      userId: user.id,
      accountId: savings.id,
      date: getDateInMonth(2),
      amount: 2500,
      description: 'Monthly savings transfer',
      method: 'ach',
      tags: JSON.stringify(['savings', 'recurring']),
    },
  })

  await prisma.split.create({
    data: {
      transactionId: savings1.id,
      type: 'savings',
      target: 'Emergency Fund',
      percent: 100,
    },
  })

  console.log(`✓ Created savings (~$2,500/month, 20% of income)`)

  // Create routing rule for salary splitting
  const rule = await prisma.rule.create({
    data: {
      userId: user.id,
      name: 'Salary Auto-Split',
      matchSource: 'Salary',
      splitConfig: JSON.stringify([
        { type: 'need', target: 'Housing', percent: 35 },
        { type: 'need', target: 'Transportation', percent: 12 },
        { type: 'need', target: 'Food', percent: 5 },
        { type: 'want', target: 'Dining', percent: 15 },
        { type: 'savings', target: 'Emergency Fund', percent: 20 },
        { type: 'tax', target: 'Tax Reserve', percent: 13 },
      ]),
      isActive: true,
    },
  })

  console.log(`✓ Created routing rule for automatic salary splitting`)

  console.log(`
✅ Household seed completed!
   
📊 Summary:
   • 4 household members (2 earners, 2 dependents)
   • ~$150k/year income ($12,500/month)
   • Realistic expenses:
     - Housing: $2,600/month (mortgage, insurance, utilities)
     - Transportation: $1,210/month (2 cars + gas + insurance)
     - Food: $600/month
     - Health/Childcare: $600/month
     - Wants: $1,380/month (dining, entertainment, shopping)
     - Savings: $2,500/month
   • Multiple accounts and credit cards
   • Income from multiple sources
   • Automated routing rules for salary splitting
  `)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

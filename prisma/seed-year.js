/**
 * Seed script for full year of realistic household test data
 * Family of 4: ~$150k/year income, mortgage, 2 cars, kids expenses
 * 12 months of realistic spending patterns
 * Run with: node prisma/seed-year.js
 * 
 * Only seeds if user doesn't already exist. Safe to run multiple times.
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Helper to create a specific date
function createDate(year, month, day) {
  return new Date(year, month - 1, day)
}

// Generate all 12 months starting from 1 year ago
function getMonthsToSeed() {
  const months = []
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  // Go back 12 months
  for (let i = 11; i >= 0; i--) {
    let month = currentMonth - i
    let year = currentYear
    if (month <= 0) {
      month += 12
      year -= 1
    }
    months.push({ year, month })
  }
  return months
}

// Random variance helper
function variance(base, percent = 0.1) {
  return base * (1 + (Math.random() - 0.5) * percent * 2)
}

async function seedYear() {
  // Check if data already exists
  const userCount = await prisma.user.count()
  if (userCount > 0) {
    console.log(`✓ Database already has ${userCount} user(s). Skipping seed.`)
    return
  }

  console.log('🏠 Seeding one year of realistic household data...')

  // Get the household that was created via API
  const users = await prisma.user.findMany({
    where: { isProduction: false },
    take: 1,
  })

  if (users.length === 0) {
    console.log('❌ No test household found. Please create one first via the UI.')
    process.exit(1)
  }

  const user = users[0]
  console.log(`✓ Using household: ${user.email}`)

  // Get or create people
  let sarah = await prisma.person.findFirst({
    where: { userId: user.id, name: 'Sarah' },
  })

  if (!sarah) {
    sarah = await prisma.person.create({
      data: {
        userId: user.id,
        name: 'Sarah',
        role: 'primary-earner',
        color: '#3B82F6',
      },
    })
  }

  let mike = await prisma.person.findFirst({
    where: { userId: user.id, name: 'Mike' },
  })

  if (!mike) {
    mike = await prisma.person.create({
      data: {
        userId: user.id,
        name: 'Mike',
        role: 'secondary-earner',
        color: '#10B981',
      },
    })
  }

  // Get or create accounts
  let checking = await prisma.account.findFirst({
    where: { userId: user.id, name: 'Primary Checking' },
  })

  if (!checking) {
    checking = await prisma.account.create({
      data: {
        userId: user.id,
        name: 'Primary Checking',
        type: 'checking',
        personId: sarah.id,
        isActive: true,
      },
    })
  }

  let creditCard = await prisma.account.findFirst({
    where: { userId: user.id, name: 'Chase Sapphire' },
  })

  if (!creditCard) {
    creditCard = await prisma.account.create({
      data: {
        userId: user.id,
        name: 'Chase Sapphire',
        type: 'credit_card',
        creditLimit: 25000,
        personId: sarah.id,
        isActive: true,
      },
    })
  }

  console.log(`✓ Using people: Sarah, Mike`)
  console.log(`✓ Using accounts: Checking, Credit Card`)

  const months = getMonthsToSeed()
  let incomeCount = 0
  let transactionCount = 0
  let splitCount = 0

  // Seed each month
  for (const { year, month } of months) {
    console.log(`  📅 Seeding ${year}-${String(month).padStart(2, '0')}...`)

    // ===== INCOME =====
    // Sarah salary (2 payments/month)
    await prisma.income.create({
      data: {
        userId: user.id,
        personId: sarah.id,
        accountId: checking.id,
        date: createDate(year, month, 1),
        grossAmount: 3542, // $85k/24 paychecks
        taxes: 850,
        preTaxDeductions: 175,
        postTaxDeductions: 100,
        netAmount: 2417,
        source: 'Salary - ABC Corp',
        tags: JSON.stringify(['recurring', 'tax:w2']),
      },
    })
    incomeCount++

    await prisma.income.create({
      data: {
        userId: user.id,
        personId: sarah.id,
        accountId: checking.id,
        date: createDate(year, month, 15),
        grossAmount: 3542,
        taxes: 850,
        preTaxDeductions: 175,
        postTaxDeductions: 100,
        netAmount: 2417,
        source: 'Salary - ABC Corp',
        tags: JSON.stringify(['recurring', 'tax:w2']),
      },
    })
    incomeCount++

    // Mike salary
    await prisma.income.create({
      data: {
        userId: user.id,
        personId: mike.id,
        accountId: checking.id,
        date: createDate(year, month, 1),
        grossAmount: 5000,
        taxes: 1100,
        preTaxDeductions: 250,
        postTaxDeductions: 150,
        netAmount: 3500,
        source: 'Salary - Tech Startup',
        tags: JSON.stringify(['recurring', 'tax:w2']),
      },
    })
    incomeCount++

    // Sarah bonus (every 3 months)
    if (month % 3 === 0) {
      await prisma.income.create({
        data: {
          userId: user.id,
          personId: sarah.id,
          accountId: checking.id,
          date: createDate(year, month, 15),
          grossAmount: 8000,
          taxes: 2400,
          preTaxDeductions: 0,
          postTaxDeductions: 0,
          netAmount: 5600,
          source: 'Quarterly Bonus',
          tags: JSON.stringify(['irregular', 'bonus']),
        },
      })
      incomeCount++
    }

    // Mike freelance (irregular)
    if (Math.random() > 0.3) {
      await prisma.income.create({
        data: {
          userId: user.id,
          personId: mike.id,
          accountId: checking.id,
          date: createDate(year, month, 20),
          grossAmount: variance(2500, 0.4),
          taxes: variance(625, 0.4),
          preTaxDeductions: 0,
          postTaxDeductions: 0,
          netAmount: variance(1875, 0.4),
          source: 'Freelance Consulting',
          tags: JSON.stringify(['irregular', 'tax:1099']),
        },
      })
      incomeCount++
    }

    // ===== NECESSARY EXPENSES (Housing, Transport, Food, Insurance) =====

    // Mortgage: $2,200/month
    const mortgage = await prisma.transaction.create({
      data: {
        userId: user.id,
        personId: sarah.id,
        accountId: checking.id,
        date: createDate(year, month, 3),
        amount: 2200,
        description: 'Mortgage Payment - Home Loan',
        method: 'ach',
        tags: JSON.stringify(['housing', 'recurring']),
      },
    })
    transactionCount++
    splitCount++
    await prisma.split.create({
      data: { transactionId: mortgage.id, type: 'need', target: 'Housing', percent: 100 },
    })

    // Property tax: $250/month
    const propTax = await prisma.transaction.create({
      data: {
        userId: user.id,
        personId: sarah.id,
        accountId: checking.id,
        date: createDate(year, month, 5),
        amount: 250,
        description: 'Property Taxes',
        method: 'ach',
        tags: JSON.stringify(['housing', 'recurring']),
      },
    })
    transactionCount++
    await prisma.split.create({
      data: { transactionId: propTax.id, type: 'need', target: 'Housing', percent: 100 },
    })

    // Home insurance: $150/month
    const homeIns = await prisma.transaction.create({
      data: {
        userId: user.id,
        personId: sarah.id,
        accountId: checking.id,
        date: createDate(year, month, 7),
        amount: 150,
        description: 'Home Insurance',
        method: 'ach',
        tags: JSON.stringify(['insurance', 'recurring']),
      },
    })
    transactionCount++
    await prisma.split.create({
      data: { transactionId: homeIns.id, type: 'need', target: 'Insurance', percent: 100 },
    })

    // Car 1 payment: $350/month
    const car1 = await prisma.transaction.create({
      data: {
        userId: user.id,
        personId: sarah.id,
        accountId: checking.id,
        date: createDate(year, month, 10),
        amount: 350,
        description: 'Car Loan - Honda Civic',
        method: 'ach',
        tags: JSON.stringify(['transport', 'recurring']),
      },
    })
    transactionCount++
    await prisma.split.create({
      data: { transactionId: car1.id, type: 'need', target: 'Transport', percent: 100 },
    })

    // Car 2 payment: $280/month
    const car2 = await prisma.transaction.create({
      data: {
        userId: user.id,
        personId: sarah.id,
        accountId: checking.id,
        date: createDate(year, month, 10),
        amount: 280,
        description: 'Car Loan - Toyota RAV4',
        method: 'ach',
        tags: JSON.stringify(['transport', 'recurring']),
      },
    })
    transactionCount++
    await prisma.split.create({
      data: { transactionId: car2.id, type: 'need', target: 'Transport', percent: 100 },
    })

    // Auto insurance: $200/month
    const autoIns = await prisma.transaction.create({
      data: {
        userId: user.id,
        personId: sarah.id,
        accountId: checking.id,
        date: createDate(year, month, 8),
        amount: 200,
        description: 'Auto Insurance',
        method: 'ach',
        tags: JSON.stringify(['insurance', 'recurring']),
      },
    })
    transactionCount++
    await prisma.split.create({
      data: { transactionId: autoIns.id, type: 'need', target: 'Insurance', percent: 100 },
    })

    // Gas: $400/month (variable)
    const gas = await prisma.transaction.create({
      data: {
        userId: user.id,
        personId: sarah.id,
        accountId: creditCard.id,
        date: createDate(year, month, 12),
        amount: variance(400, 0.3),
        description: 'Gas - Shell & Chevron',
        method: 'cc',
        tags: JSON.stringify(['transport', 'recurring']),
      },
    })
    transactionCount++
    await prisma.split.create({
      data: { transactionId: gas.id, type: 'need', target: 'Transport', percent: 100 },
    })

    // Groceries: $800/month (variable)
    const groceries = await prisma.transaction.create({
      data: {
        userId: user.id,
        personId: sarah.id,
        accountId: creditCard.id,
        date: createDate(year, month, 15),
        amount: variance(800, 0.2),
        description: 'Groceries - Whole Foods & Costco',
        method: 'cc',
        tags: JSON.stringify(['food', 'recurring']),
      },
    })
    transactionCount++
    await prisma.split.create({
      data: { transactionId: groceries.id, type: 'need', target: 'Food', percent: 100 },
    })

    // Utilities: $250/month
    const utilities = await prisma.transaction.create({
      data: {
        userId: user.id,
        personId: sarah.id,
        accountId: checking.id,
        date: createDate(year, month, 20),
        amount: variance(250, 0.3),
        description: 'Utilities - Electric, Gas, Water',
        method: 'ach',
        tags: JSON.stringify(['utilities', 'recurring']),
      },
    })
    transactionCount++
    await prisma.split.create({
      data: { transactionId: utilities.id, type: 'need', target: 'Utilities', percent: 100 },
    })

    // Health insurance: $400/month
    const healthIns = await prisma.transaction.create({
      data: {
        userId: user.id,
        personId: sarah.id,
        accountId: checking.id,
        date: createDate(year, month, 1),
        amount: 400,
        description: 'Health Insurance',
        method: 'ach',
        tags: JSON.stringify(['insurance', 'recurring']),
      },
    })
    transactionCount++
    await prisma.split.create({
      data: { transactionId: healthIns.id, type: 'need', target: 'Insurance', percent: 100 },
    })

    // ===== WANTS (30% budget) =====

    // Dining out: $300/month
    const dining = await prisma.transaction.create({
      data: {
        userId: user.id,
        personId: sarah.id,
        accountId: creditCard.id,
        date: createDate(year, month, 18),
        amount: variance(300, 0.4),
        description: 'Restaurants - Various',
        method: 'cc',
        tags: JSON.stringify(['dining', 'recurring']),
      },
    })
    transactionCount++
    await prisma.split.create({
      data: { transactionId: dining.id, type: 'want', target: 'Dining', percent: 100 },
    })

    // Entertainment: $150/month
    const entertainment = await prisma.transaction.create({
      data: {
        userId: user.id,
        personId: sarah.id,
        accountId: creditCard.id,
        date: createDate(year, month, 25),
        amount: variance(150, 0.5),
        description: 'Movies, Streaming, Events',
        method: 'cc',
        tags: JSON.stringify(['entertainment', 'recurring']),
      },
    })
    transactionCount++
    await prisma.split.create({
      data: { transactionId: entertainment.id, type: 'want', target: 'Entertainment', percent: 100 },
    })

    // Shopping: $250/month
    const shopping = await prisma.transaction.create({
      data: {
        userId: user.id,
        personId: sarah.id,
        accountId: creditCard.id,
        date: createDate(year, month, 22),
        amount: variance(250, 0.6),
        description: 'Clothing & Misc - Target, Amazon',
        method: 'cc',
        tags: JSON.stringify(['shopping', 'recurring']),
      },
    })
    transactionCount++
    await prisma.split.create({
      data: { transactionId: shopping.id, type: 'want', target: 'Shopping', percent: 100 },
    })

    // Kids activities: $200/month
    const kidsAct = await prisma.transaction.create({
      data: {
        userId: user.id,
        personId: sarah.id,
        accountId: creditCard.id,
        date: createDate(year, month, 20),
        amount: variance(200, 0.4),
        description: 'Emma & Jake - Sports, Music, Classes',
        method: 'cc',
        tags: JSON.stringify(['kids', 'recurring']),
      },
    })
    transactionCount++
    await prisma.split.create({
      data: { transactionId: kidsAct.id, type: 'want', target: 'Kids', percent: 100 },
    })

    // ===== SAVINGS (20% budget) =====

    // Monthly transfer to savings: $2,500
    const savings = await prisma.transaction.create({
      data: {
        userId: user.id,
        personId: sarah.id,
        accountId: checking.id,
        date: createDate(year, month, 2),
        amount: 2500,
        description: 'Transfer to Savings Account',
        method: 'ach',
        tags: JSON.stringify(['savings', 'recurring']),
      },
    })
    transactionCount++
    await prisma.split.create({
      data: { transactionId: savings.id, type: 'savings', target: 'Emergency Fund', percent: 100 },
    })
  }

  console.log(`\n✅ Seeded one year of data:`)
  console.log(`   📊 Income entries: ${incomeCount}`)
  console.log(`   💳 Transactions: ${transactionCount}`)
  console.log(`   🔀 Splits: ${splitCount}`)
  console.log(`   📅 12 months of realistic spending patterns`)
}

seedYear()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

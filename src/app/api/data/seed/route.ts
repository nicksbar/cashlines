import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/db'

// Helper to create a specific date
function createDate(year: number, month: number, day: number) {
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
function variance(base: number, percent = 0.1) {
  return base * (1 + (Math.random() - 0.5) * percent * 2)
}

/**
 * POST /api/data/seed
 * Loads test household data
 * Protected: Only works if isProduction is false
 * 
 * Expects: x-household-id header with the household ID to seed
 */
export async function POST(request: NextRequest) {
  try {
    const householdId = request.headers.get('x-household-id')
    const { type = 'household' } = await request.json().catch(() => ({}))

    if (!householdId) {
      return NextResponse.json(
        { error: 'Missing household ID header' },
        { status: 400 }
      )
    }

    // Get the user/household
    let user = await prisma.user.findUnique({
      where: { id: householdId },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Household not found' },
        { status: 404 }
      )
    }

    if (user.isProduction) {
      return NextResponse.json(
        {
          error: 'Data seeding is disabled for production accounts.',
          locked: true,
        },
        { status: 403 }
      )
    }

    if (type === 'household') {
      // Create household members
      const sarah = await prisma.person.upsert({
        where: { userId_name: { userId: user.id, name: 'Sarah' } },
        update: {},
        create: {
          userId: user.id,
          name: 'Sarah',
          role: 'primary-earner',
          color: '#3B82F6',
        },
      })

      const mike = await prisma.person.upsert({
        where: { userId_name: { userId: user.id, name: 'Mike' } },
        update: {},
        create: {
          userId: user.id,
          name: 'Mike',
          role: 'secondary-earner',
          color: '#10B981',
        },
      })

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

      // Create sample income
      await prisma.income.create({
        data: {
          userId: user.id,
          personId: sarah.id,
          accountId: checking.id,
          date: new Date(),
          grossAmount: 7083,
          taxes: 1700,
          preTaxDeductions: 350,
          postTaxDeductions: 200,
          netAmount: 4833,
          source: 'Salary - ABC Corp',
          tags: JSON.stringify(['recurring', 'tax:w2']),
        },
      })

      // Create sample transaction
      const transaction = await prisma.transaction.create({
        data: {
          userId: user.id,
          personId: sarah.id,
          accountId: creditCard.id,
          date: new Date(),
          amount: 125.50,
          description: 'Groceries',
          method: 'cc',
          tags: JSON.stringify(['food']),
        },
      })

      await prisma.split.create({
        data: {
          transactionId: transaction.id,
          type: 'need',
          target: 'Food',
          percent: 100,
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Household test data loaded successfully',
        itemsCreated: {
          people: 2,
          accounts: 2,
          income: 1,
          transactions: 1,
        },
      })
    }

    if (type === 'year') {
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

      const months = getMonthsToSeed()
      let incomeCount = 0
      let transactionCount = 0

      // Seed each month
      for (const { year, month } of months) {
        // Sarah salary (2 payments/month)
        await prisma.income.create({
          data: {
            userId: user.id,
            personId: sarah.id,
            accountId: checking.id,
            date: createDate(year, month, 1),
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

        // Quarterly bonus
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

        // Freelance income (irregular)
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

        // Create sample transactions for each month
        const categories = [
          { name: 'Mortgage', amount: 2200, type: 'need', target: 'Housing', date: 3, person: 'sarah' },
          { name: 'Utilities', amount: 250, type: 'need', target: 'Utilities', date: 20, variance: 0.3, person: 'sarah' },
          { name: 'Groceries', amount: 800, type: 'need', target: 'Food', date: 15, variance: 0.2, person: 'sarah' },
          { name: 'Gas', amount: 400, type: 'need', target: 'Transport', date: 12, variance: 0.3, person: 'mike' },
          { name: 'Dining Out', amount: 300, type: 'want', target: 'Dining', date: 18, variance: 0.4, person: 'sarah' },
          { name: 'Shopping', amount: 250, type: 'want', target: 'Shopping', date: 22, variance: 0.6, person: 'mike' },
          { name: 'Savings', amount: 2500, type: 'savings', target: 'Savings', date: 2, person: 'sarah' },
        ]

        for (const cat of categories) {
          const amount = cat.variance ? variance(cat.amount, cat.variance) : cat.amount
          const personId = cat.person === 'mike' ? mike.id : sarah.id
          const tx = await prisma.transaction.create({
            data: {
              userId: user.id,
              personId: personId,
              accountId: creditCard.id,
              date: createDate(year, month, cat.date),
              amount,
              description: cat.name,
              method: 'cc',
              tags: JSON.stringify(['recurring']),
            },
          })
          transactionCount++

          await prisma.split.create({
            data: {
              transactionId: tx.id,
              type: cat.type,
              target: cat.target,
              percent: 100,
            },
          })
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Year of test data loaded successfully',
        itemsCreated: {
          income: incomeCount,
          transactions: transactionCount,
          months: 12,
        },
      })
    }

    return NextResponse.json(
      { error: `Unknown seed type: ${type}` },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error seeding data:', error)
    return NextResponse.json(
      { error: 'Failed to seed data' },
      { status: 500 }
    )
  }
}

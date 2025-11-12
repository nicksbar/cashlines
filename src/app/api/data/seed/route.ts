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

    // Validate type
    const validTypes = ['household', 'year', 'single-no-cc', 'business-owner', 'working-teens', 'complex-family']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid seed type. Valid types: ${validTypes.join(', ')}` },
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

    // Handle new realistic scenarios
    if (type === 'single-no-cc') {
      return seedSingleNoCc(user)
    }
    
    if (type === 'business-owner') {
      return seedBusinessOwner(user)
    }
    
    if (type === 'working-teens') {
      return seedWorkingTeens(user)
    }
    
    if (type === 'complex-family') {
      return seedComplexFamily(user)
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

// Scenario 1: Single, No Credit Card - Simple W2, tight budget
async function seedSingleNoCc(user: any) {
  const sarah = await prisma.person.create({
    data: {
      userId: user.id,
      name: 'Sarah',
      role: 'primary-earner',
      color: '#3B82F6',
    },
  })

  const checking = await prisma.account.create({
    data: {
      userId: user.id,
      personId: sarah.id,
      name: 'Checking',
      type: 'checking',
      isActive: true,
    },
  })

  // 6 months of income and essential expenses
  let incomeCount = 0
  let transactionCount = 0

  for (let m = 0; m < 6; m++) {
    const date = new Date(2025, 6 + m, 1)

    // Monthly W2 salary
    await prisma.income.create({
      data: {
        userId: user.id,
        personId: sarah.id,
        accountId: checking.id,
        date,
        grossAmount: 4500,
        taxes: 1980,
        preTaxDeductions: 0,
        postTaxDeductions: 270,
        netAmount: 2250,
        source: 'W2 Salary',
        tags: JSON.stringify(['recurring', 'tax:w2']),
      },
    })
    incomeCount++

    // Essential expenses only
    const expenses = [
      { name: 'Rent', amount: 1200, type: 'need', date: 5 },
      { name: 'Utilities', amount: 150, type: 'need', date: 7 },
      { name: 'Groceries', amount: 250, type: 'need', date: 10 },
      { name: 'Transportation', amount: 300, type: 'need', date: 13 },
      { name: 'Phone & Internet', amount: 100, type: 'need', date: 15 },
      { name: 'Health Insurance', amount: 200, type: 'need', date: 17 },
    ]

    for (const exp of expenses) {
      const tx = await prisma.transaction.create({
        data: {
          userId: user.id,
          personId: sarah.id,
          accountId: checking.id,
          date: new Date(date.getFullYear(), date.getMonth(), exp.date),
          amount: exp.amount,
          description: exp.name,
          method: 'ach',
          tags: JSON.stringify(['recurring', 'essential']),
        },
      })
      transactionCount++

      await prisma.split.create({
        data: {
          transactionId: tx.id,
          type: exp.type,
          target: exp.name,
          percent: 100,
        },
      })
    }
  }

  return NextResponse.json({
    success: true,
    message: 'Single, No CC scenario loaded',
    itemsCreated: { income: incomeCount, transactions: transactionCount },
  })
}

// Scenario 2: Business Owner - Self-employed with quarterly taxes
async function seedBusinessOwner(user: any) {
  const mike = await prisma.person.create({
    data: {
      userId: user.id,
      name: 'Mike',
      role: 'business-owner',
      color: '#10B981',
    },
  })

  const businessChecking = await prisma.account.create({
    data: {
      userId: user.id,
      personId: mike.id,
      name: 'Business Checking',
      type: 'checking',
      isActive: true,
    },
  })

  let incomeCount = 0
  let transactionCount = 0

  for (let m = 0; m < 6; m++) {
    const date = new Date(2025, 6 + m, 1)

    // Variable consulting income
    const monthlyRevenue = 7000 + Math.random() * 3000
    await prisma.income.create({
      data: {
        userId: user.id,
        personId: mike.id,
        accountId: businessChecking.id,
        date,
        grossAmount: monthlyRevenue,
        taxes: 0, // Pays quarterly estimated
        preTaxDeductions: 0,
        postTaxDeductions: 0,
        netAmount: monthlyRevenue,
        source: 'Consulting Income',
        tags: JSON.stringify(['business', 'variable']),
      },
    })
    incomeCount++

    // Quarterly tax payment
    if ((6 + m) % 3 === 0) {
      const tx = await prisma.transaction.create({
        data: {
          userId: user.id,
          personId: mike.id,
          accountId: businessChecking.id,
          date: new Date(date.getFullYear(), date.getMonth(), 15),
          amount: 2800,
          description: 'Quarterly Estimated Tax Payment',
          method: 'ach',
          tags: JSON.stringify(['taxes', 'quarterly']),
        },
      })
      transactionCount++

      await prisma.split.create({
        data: {
          transactionId: tx.id,
          type: 'need',
          target: 'Federal Taxes',
          percent: 100,
        },
      })
    }

    // Business & personal expenses
    const expenses = [
      { name: 'Mortgage', amount: 1500, type: 'need' },
      { name: 'Home Office Equipment', amount: 400, type: 'need' },
      { name: 'Internet', amount: 150, type: 'need' },
      { name: 'Phone', amount: 100, type: 'need' },
      { name: 'Business Insurance', amount: 300, type: 'need' },
      { name: 'Utilities', amount: 250, type: 'need' },
      { name: 'Groceries', amount: 400, type: 'need' },
      { name: 'Transportation', amount: 400, type: 'need' },
    ]

    for (const exp of expenses) {
      const tx = await prisma.transaction.create({
        data: {
          userId: user.id,
          personId: mike.id,
          accountId: businessChecking.id,
          date: new Date(date.getFullYear(), date.getMonth(), 10 + Math.floor(Math.random() * 15)),
          amount: exp.amount,
          description: exp.name,
          method: 'ach',
          tags: JSON.stringify(['business']),
        },
      })
      transactionCount++

      await prisma.split.create({
        data: {
          transactionId: tx.id,
          type: exp.type,
          target: exp.name,
          percent: 100,
        },
      })
    }
  }

  return NextResponse.json({
    success: true,
    message: 'Business Owner scenario loaded',
    itemsCreated: { income: incomeCount, transactions: transactionCount },
  })
}

// Scenario 3: Working Teens + Gig Income
async function seedWorkingTeens(user: any) {
  const james = await prisma.person.create({
    data: {
      userId: user.id,
      name: 'James',
      role: 'primary-earner',
      color: '#3B82F6',
    },
  })

  const jennifer = await prisma.person.create({
    data: {
      userId: user.id,
      name: 'Jennifer',
      role: 'secondary-earner',
      color: '#EC4899',
    },
  })

  const alex = await prisma.person.create({
    data: {
      userId: user.id,
      name: 'Alex',
      role: 'teen',
      color: '#F59E0B',
    },
  })

  const familyChecking = await prisma.account.create({
    data: {
      userId: user.id,
      personId: james.id,
      name: 'Family Checking',
      type: 'checking',
      isActive: true,
    },
  })

  const alexGigAccount = await prisma.account.create({
    data: {
      userId: user.id,
      personId: alex.id,
      name: 'Alex Gig Account',
      type: 'checking',
      isActive: true,
    },
  })

  let incomeCount = 0
  let transactionCount = 0

  for (let m = 0; m < 6; m++) {
    const date = new Date(2025, 6 + m, 1)

    // James: W2 salary
    await prisma.income.create({
      data: {
        userId: user.id,
        personId: james.id,
        accountId: familyChecking.id,
        date,
        grossAmount: 5500,
        taxes: 1210,
        preTaxDeductions: 300,
        postTaxDeductions: 0,
        netAmount: 3990,
        source: 'W2 Salary',
        tags: JSON.stringify(['recurring', 'tax:w2']),
      },
    })
    incomeCount++

    // Jennifer: Part-time salary
    await prisma.income.create({
      data: {
        userId: user.id,
        personId: jennifer.id,
        accountId: familyChecking.id,
        date,
        grossAmount: 3200,
        taxes: 480,
        preTaxDeductions: 0,
        postTaxDeductions: 150,
        netAmount: 2570,
        source: 'Part-time Salary',
        tags: JSON.stringify(['recurring', 'tax:w2']),
      },
    })
    incomeCount++

    // Alex: Variable gig income
    const gigIncome = 600 + Math.random() * 400
    await prisma.income.create({
      data: {
        userId: user.id,
        personId: alex.id,
        accountId: alexGigAccount.id,
        date,
        grossAmount: gigIncome,
        taxes: 0,
        preTaxDeductions: 0,
        postTaxDeductions: 0,
        netAmount: gigIncome,
        source: 'Gig Work (DoorDash, TaskRabbit)',
        tags: JSON.stringify(['gig', 'variable']),
      },
    })
    incomeCount++

    // Family expenses
    const familyExpenses = [
      { name: 'Mortgage', amount: 2200, person: james },
      { name: 'Utilities', amount: 300, person: james },
      { name: 'Groceries', amount: 600, person: jennifer },
      { name: 'Car Payments', amount: 800, person: james },
      { name: 'Gas', amount: 400, person: james },
      { name: 'Phone (Family)', amount: 200, person: jennifer },
      { name: 'Internet', amount: 120, person: james },
      { name: 'Health Insurance', amount: 600, person: james },
    ]

    for (const exp of familyExpenses) {
      const tx = await prisma.transaction.create({
        data: {
          userId: user.id,
          personId: exp.person.id,
          accountId: familyChecking.id,
          date: new Date(date.getFullYear(), date.getMonth(), 5 + Math.floor(Math.random() * 10)),
          amount: exp.amount,
          description: exp.name,
          method: 'ach',
          tags: JSON.stringify(['recurring', 'household']),
        },
      })
      transactionCount++

      await prisma.split.create({
        data: {
          transactionId: tx.id,
          type: 'need',
          target: exp.name,
          percent: 100,
        },
      })
    }
  }

  return NextResponse.json({
    success: true,
    message: 'Working Teens + Gig Income scenario loaded',
    itemsCreated: { income: incomeCount, transactions: transactionCount },
  })
}

// Scenario 4: Complex Family - Multiple properties, business income
async function seedComplexFamily(user: any) {
  const david = await prisma.person.create({
    data: {
      userId: user.id,
      name: 'David',
      role: 'primary-earner',
      color: '#3B82F6',
    },
  })

  const rebecca = await prisma.person.create({
    data: {
      userId: user.id,
      name: 'Rebecca',
      role: 'business-owner',
      color: '#EC4899',
    },
  })

  const primaryChecking = await prisma.account.create({
    data: {
      userId: user.id,
      personId: david.id,
      name: 'Primary Checking',
      type: 'checking',
      isActive: true,
    },
  })

  const businessChecking = await prisma.account.create({
    data: {
      userId: user.id,
      personId: rebecca.id,
      name: 'Business Checking',
      type: 'checking',
      isActive: true,
    },
  })

  const businessCC = await prisma.account.create({
    data: {
      userId: user.id,
      personId: rebecca.id,
      name: 'Business Credit Card',
      type: 'credit_card',
      creditLimit: 50000,
      isActive: true,
    },
  })

  const personalCC = await prisma.account.create({
    data: {
      userId: user.id,
      personId: david.id,
      name: 'Personal Credit Card',
      type: 'credit_card',
      creditLimit: 25000,
      isActive: true,
    },
  })

  let incomeCount = 0
  let transactionCount = 0

  for (let m = 0; m < 6; m++) {
    const date = new Date(2025, 6 + m, 1)

    // David: Salary
    await prisma.income.create({
      data: {
        userId: user.id,
        personId: david.id,
        accountId: primaryChecking.id,
        date,
        grossAmount: 10000,
        taxes: 2200,
        preTaxDeductions: 500,
        postTaxDeductions: 300,
        netAmount: 7000,
        source: 'W2 Salary',
        tags: JSON.stringify(['recurring', 'tax:w2']),
      },
    })
    incomeCount++

    // David: Bonus (March & September)
    if ([2, 8].includes(6 + m)) {
      const bonus = 15000 + Math.random() * 5000
      await prisma.income.create({
        data: {
          userId: user.id,
          personId: david.id,
          accountId: primaryChecking.id,
          date: new Date(date.getFullYear(), date.getMonth(), 15),
          grossAmount: bonus,
          taxes: bonus * 0.3,
          preTaxDeductions: bonus * 0.05,
          postTaxDeductions: 0,
          netAmount: bonus * 0.65,
          source: 'Annual Bonus',
          tags: JSON.stringify(['bonus', 'irregular']),
        },
      })
      incomeCount++
    }

    // Rebecca: Business income
    const businessIncome = 7000 + Math.random() * 3000
    await prisma.income.create({
      data: {
        userId: user.id,
        personId: rebecca.id,
        accountId: businessChecking.id,
        date,
        grossAmount: businessIncome,
        taxes: 0,
        preTaxDeductions: 0,
        postTaxDeductions: 0,
        netAmount: businessIncome,
        source: 'Freelance Business',
        tags: JSON.stringify(['business', 'variable']),
      },
    })
    incomeCount++

    // Quarterly tax payment
    if ((6 + m) % 3 === 0) {
      const tx = await prisma.transaction.create({
        data: {
          userId: user.id,
          personId: rebecca.id,
          accountId: businessChecking.id,
          date: new Date(date.getFullYear(), date.getMonth(), 15),
          amount: 2800,
          description: 'Quarterly Estimated Taxes',
          method: 'ach',
          tags: JSON.stringify(['taxes', 'quarterly']),
        },
      })
      transactionCount++

      await prisma.split.create({
        data: {
          transactionId: tx.id,
          type: 'need',
          target: 'Federal Taxes',
          percent: 100,
        },
      })
    }

    // Major expenses
    const expenses = [
      { name: 'Primary Mortgage', amount: 2500, person: david, account: primaryChecking },
      { name: 'Investment Property Mortgage', amount: 1500, person: david, account: primaryChecking },
      { name: 'Utilities (Both)', amount: 400, person: david, account: primaryChecking },
      { name: 'Groceries', amount: 800, person: david, account: primaryChecking },
      { name: 'Cars & Insurance', amount: 1000, person: david, account: primaryChecking },
      { name: 'Gas', amount: 500, person: david, account: primaryChecking },
      { name: 'Insurance (Home, Auto, Business)', amount: 1200, person: david, account: primaryChecking },
      { name: 'Medical', amount: 300, person: david, account: primaryChecking },
      { name: 'Business Expenses', amount: 1500, person: rebecca, account: businessCC },
      { name: 'Personal CC Payment', amount: 2000, person: david, account: primaryChecking },
    ]

    for (const exp of expenses) {
      const tx = await prisma.transaction.create({
        data: {
          userId: user.id,
          personId: exp.person.id,
          accountId: exp.account.id,
          date: new Date(date.getFullYear(), date.getMonth(), 5 + Math.floor(Math.random() * 15)),
          amount: exp.amount,
          description: exp.name,
          method: exp.account.type === 'credit_card' ? 'cc' : 'ach',
          tags: JSON.stringify(['recurring', 'household']),
        },
      })
      transactionCount++

      await prisma.split.create({
        data: {
          transactionId: tx.id,
          type: 'need',
          target: exp.name,
          percent: 100,
        },
      })
    }
  }

  return NextResponse.json({
    success: true,
    message: 'Complex Family scenario loaded',
    itemsCreated: { income: incomeCount, transactions: transactionCount },
  })
}

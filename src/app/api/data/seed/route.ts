import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

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

      // Create recurring expenses
      const today = new Date()
      const nextMonth = new Date(today)
      nextMonth.setMonth(nextMonth.getMonth() + 1)
      nextMonth.setDate(15)

      await prisma.recurringExpense.create({
        data: {
          userId: user.id,
          accountId: creditCard.id,
          description: 'T-Mobile Bill',
          amount: 85.99,
          frequency: 'monthly',
          dueDay: 15,
          nextDueDate: nextMonth,
          isActive: true,
          notes: 'Monthly mobile phone service',
        },
      })

      const nextInsurance = new Date(today)
      nextInsurance.setMonth(nextInsurance.getMonth() + 1)
      nextInsurance.setDate(1)

      await prisma.recurringExpense.create({
        data: {
          userId: user.id,
          accountId: checking.id,
          description: 'Auto Insurance',
          amount: 145.00,
          frequency: 'monthly',
          dueDay: 1,
          nextDueDate: nextInsurance,
          isActive: true,
          notes: 'Full coverage for 2 vehicles',
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
          recurringExpenses: 2,
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

      // Create recurring expenses
      const today = new Date()
      const nextMonthMortgage = new Date(today)
      nextMonthMortgage.setMonth(nextMonthMortgage.getMonth() + 1)
      nextMonthMortgage.setDate(1)

      await prisma.recurringExpense.create({
        data: {
          userId: user.id,
          accountId: checking.id,
          description: 'Mortgage Payment',
          amount: 2200,
          frequency: 'monthly',
          dueDay: 1,
          nextDueDate: nextMonthMortgage,
          isActive: true,
          notes: 'Monthly mortgage payment',
        },
      })

      const nextMonthAuto = new Date(today)
      nextMonthAuto.setMonth(nextMonthAuto.getMonth() + 1)
      nextMonthAuto.setDate(15)

      await prisma.recurringExpense.create({
        data: {
          userId: user.id,
          accountId: creditCard.id,
          description: 'Auto Insurance',
          amount: 165.00,
          frequency: 'monthly',
          dueDay: 15,
          nextDueDate: nextMonthAuto,
          isActive: true,
          notes: 'Full coverage for 2 vehicles',
        },
      })

      const nextMonthPhone = new Date(today)
      nextMonthPhone.setMonth(nextMonthPhone.getMonth() + 1)
      nextMonthPhone.setDate(20)

      await prisma.recurringExpense.create({
        data: {
          userId: user.id,
          accountId: creditCard.id,
          description: 'T-Mobile Bill',
          amount: 95.99,
          frequency: 'monthly',
          dueDay: 20,
          nextDueDate: nextMonthPhone,
          isActive: true,
          notes: 'Monthly phone service (2 lines)',
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Year of test data loaded successfully',
        itemsCreated: {
          income: incomeCount,
          transactions: transactionCount,
          recurringExpenses: 3,
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

  const checking = await prisma.account.create({
    data: {
      userId: user.id,
      personId: sarah.id,
      name: 'Primary Checking',
      type: 'checking',
      isActive: true,
    },
  })

  const savings = await prisma.account.create({
    data: {
      userId: user.id,
      personId: sarah.id,
      name: 'Emergency Fund',
      type: 'savings',
      isActive: true,
    },
  })

  // Create budget settings
  await prisma.setting.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      monthlyIncomeTarget: 2250,
      monthlyExpenseTarget: 2100,
      savingsTarget: 150,
      savingsRate: 6.7,
      needPercent: 93,
      wantPercent: 0,
      savingsPercent: 7,
      trackedCategories: JSON.stringify(['Rent', 'Food', 'Transport', 'Insurance']),
      excludeFromBudget: JSON.stringify(['Transfer', 'Savings']),
    },
  })

  // Create rules for auto-splitting
  await prisma.rule.create({
    data: {
      userId: user.id,
      name: 'All ACH payments are needs',
      matchMethod: 'ach',
      splitConfig: JSON.stringify([{ type: 'need', target: 'Essential Expenses', percent: 100 }]),
      isActive: true,
    },
  })

  // 6 months of income and essential expenses
  let incomeCount = 0
  let transactionCount = 0
  let recurringCount = 0

  for (let m = 0; m < 6; m++) {
    const date = new Date(2025, 6 + m, 1)

    // Monthly W2 salary (biweekly deposits)
    await prisma.income.create({
      data: {
        userId: user.id,
        personId: sarah.id,
        accountId: checking.id,
        date: new Date(date.getFullYear(), date.getMonth(), 1),
        grossAmount: 2250,
        taxes: 990,
        preTaxDeductions: 0,
        postTaxDeductions: 135,
        netAmount: 1125,
        source: 'W2 Salary (biweekly)',
        tags: JSON.stringify(['recurring', 'tax:w2']),
      },
    })
    incomeCount++

    await prisma.income.create({
      data: {
        userId: user.id,
        personId: sarah.id,
        accountId: checking.id,
        date: new Date(date.getFullYear(), date.getMonth(), 15),
        grossAmount: 2250,
        taxes: 990,
        preTaxDeductions: 0,
        postTaxDeductions: 135,
        netAmount: 1125,
        source: 'W2 Salary (biweekly)',
        tags: JSON.stringify(['recurring', 'tax:w2']),
      },
    })
    incomeCount++

    // Essential expenses only
    const expenses = [
      { name: 'Rent', amount: 1200, type: 'need', date: 5 },
      { name: 'Utilities', amount: 120, type: 'need', date: 8 },
      { name: 'Groceries', amount: 280, type: 'need', date: 10 },
      { name: 'Gas/Transportation', amount: 200, type: 'need', date: 13 },
      { name: 'Phone & Internet', amount: 80, type: 'need', date: 15 },
      { name: 'Health Insurance', amount: 240, type: 'need', date: 20 },
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
          tags: JSON.stringify(['recurring']),
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

    // Small savings deposit
    const savingsTx = await prisma.transaction.create({
      data: {
        userId: user.id,
        personId: sarah.id,
        accountId: checking.id,
        date: new Date(date.getFullYear(), date.getMonth(), 25),
        amount: 150,
        description: 'Transfer to Emergency Fund',
        method: 'ach',
        tags: JSON.stringify(['savings']),
      },
    })
    transactionCount++

    await prisma.split.create({
      data: {
        transactionId: savingsTx.id,
        type: 'savings',
        target: 'Emergency Fund',
        percent: 100,
      },
    })
  }

  // Create recurring expenses
  const today = new Date()
  const nextRent = new Date(today)
  nextRent.setMonth(nextRent.getMonth() + 1)
  nextRent.setDate(5)

  await prisma.recurringExpense.create({
    data: {
      userId: user.id,
      accountId: checking.id,
      description: 'Rent',
      amount: 1200,
      frequency: 'monthly',
      dueDay: 5,
      nextDueDate: nextRent,
      isActive: true,
      notes: 'Apartment rent',
    },
  })
  recurringCount++

  const nextUtilities = new Date(today)
  nextUtilities.setMonth(nextUtilities.getMonth() + 1)
  nextUtilities.setDate(8)

  await prisma.recurringExpense.create({
    data: {
      userId: user.id,
      accountId: checking.id,
      description: 'Utilities',
      amount: 120,
      frequency: 'monthly',
      dueDay: 8,
      nextDueDate: nextUtilities,
      isActive: true,
      notes: 'Electric, water, gas',
    },
  })
  recurringCount++

  const nextInsurance = new Date(today)
  nextInsurance.setMonth(nextInsurance.getMonth() + 1)
  nextInsurance.setDate(20)

  await prisma.recurringExpense.create({
    data: {
      userId: user.id,
      accountId: checking.id,
      description: 'Health Insurance',
      amount: 240,
      frequency: 'monthly',
      dueDay: 20,
      nextDueDate: nextInsurance,
      isActive: true,
      notes: 'Health insurance premium',
    },
  })
  recurringCount++

  return NextResponse.json({
    success: true,
    message: 'Single, No CC scenario loaded',
    itemsCreated: { 
      people: 1,
      accounts: 2,
      income: incomeCount,
      transactions: transactionCount,
      recurringExpenses: recurringCount,
      rules: 1,
      settings: 1,
    },
  })
}

// Scenario 2: Business Owner - Self-employed with quarterly taxes, multiple accounts
async function seedBusinessOwner(user: any) {
  const mike = await prisma.person.upsert({
    where: { userId_name: { userId: user.id, name: 'Mike' } },
    update: {},
    create: {
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

  const personalChecking = await prisma.account.create({
    data: {
      userId: user.id,
      personId: mike.id,
      name: 'Personal Checking',
      type: 'checking',
      isActive: true,
    },
  })

  const businessCard = await prisma.account.create({
    data: {
      userId: user.id,
      personId: mike.id,
      name: 'Business Credit Card',
      type: 'credit_card',
      creditLimit: 15000,
      isActive: true,
    },
  })

  const taxReserve = await prisma.account.create({
    data: {
      userId: user.id,
      personId: mike.id,
      name: 'Tax Reserve',
      type: 'savings',
      isActive: true,
    },
  })

  // Create budget settings
  await prisma.setting.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      monthlyIncomeTarget: 8000,
      monthlyExpenseTarget: 4500,
      savingsTarget: 3500,
      savingsRate: 43.75,
      needPercent: 55,
      wantPercent: 20,
      savingsPercent: 25,
      trackedCategories: JSON.stringify(['Business Expenses', 'Taxes', 'Personal']),
      excludeFromBudget: JSON.stringify(['Transfer', 'Tax Payment']),
    },
  })

  // Create rules for auto-splitting
  await prisma.rule.create({
    data: {
      userId: user.id,
      name: 'Business credit card expenses',
      matchAccountId: businessCard.id,
      splitConfig: JSON.stringify([{ type: 'need', target: 'Business Expenses', percent: 100 }]),
      isActive: true,
    },
  })

  let incomeCount = 0
  let transactionCount = 0
  let recurringCount = 0

  for (let m = 0; m < 6; m++) {
    const date = new Date(2025, 6 + m, 1)

    // Variable consulting income
    const monthlyRevenue = 8000 + Math.random() * 3000
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

    // Personal draw from business
    const draw = await prisma.transaction.create({
      data: {
        userId: user.id,
        personId: mike.id,
        accountId: businessChecking.id,
        date: new Date(date.getFullYear(), date.getMonth(), 28),
        amount: 5000,
        description: 'Personal Draw',
        method: 'ach',
        tags: JSON.stringify(['business', 'draw']),
      },
    })
    transactionCount++

    await prisma.split.create({
      data: {
        transactionId: draw.id,
        type: 'need',
        target: 'Personal Draw',
        percent: 100,
      },
    })

    // Quarterly tax payment
    if ((6 + m) % 3 === 0) {
      const tx = await prisma.transaction.create({
        data: {
          userId: user.id,
          personId: mike.id,
          accountId: taxReserve.id,
          date: new Date(date.getFullYear(), date.getMonth(), 15),
          amount: 3000,
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

    // Business expenses on credit card
    const businessExpenses = [
      { name: 'Software Subscriptions', amount: 450, date: 5 },
      { name: 'Office Supplies', amount: 250, date: 8 },
      { name: 'Professional Services', amount: 500, date: 12 },
      { name: 'Equipment Maintenance', amount: 300, date: 18 },
    ]

    for (const exp of businessExpenses) {
      const tx = await prisma.transaction.create({
        data: {
          userId: user.id,
          personId: mike.id,
          accountId: businessCard.id,
          date: new Date(date.getFullYear(), date.getMonth(), exp.date),
          amount: exp.amount,
          description: exp.name,
          method: 'cc',
          tags: JSON.stringify(['business', 'recurring']),
        },
      })
      transactionCount++

      await prisma.split.create({
        data: {
          transactionId: tx.id,
          type: 'need',
          target: 'Business Expenses',
          percent: 100,
        },
      })
    }

    // Personal expenses from personal account
    const personalExpenses = [
      { name: 'Mortgage', amount: 2000, date: 5 },
      { name: 'Utilities', amount: 300, date: 8 },
      { name: 'Groceries', amount: 500, date: 12 },
      { name: 'Gas', amount: 250, date: 15 },
      { name: 'Insurance', amount: 400, date: 20 },
    ]

    for (const exp of personalExpenses) {
      const tx = await prisma.transaction.create({
        data: {
          userId: user.id,
          personId: mike.id,
          accountId: personalChecking.id,
          date: new Date(date.getFullYear(), date.getMonth(), exp.date),
          amount: exp.amount,
          description: exp.name,
          method: 'ach',
          tags: JSON.stringify(['personal', 'recurring']),
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

  // Create recurring expenses
  const today = new Date()
  const nextMortgage = new Date(today)
  nextMortgage.setMonth(nextMortgage.getMonth() + 1)
  nextMortgage.setDate(5)

  await prisma.recurringExpense.create({
    data: {
      userId: user.id,
      accountId: personalChecking.id,
      description: 'Mortgage',
      amount: 2000,
      frequency: 'monthly',
      dueDay: 5,
      nextDueDate: nextMortgage,
      isActive: true,
      notes: 'Home mortgage payment',
    },
  })
  recurringCount++

  const nextTaxPayment = new Date(today)
  nextTaxPayment.setMonth(nextTaxPayment.getMonth() + 1)
  nextTaxPayment.setDate(15)

  await prisma.recurringExpense.create({
    data: {
      userId: user.id,
      accountId: taxReserve.id,
      description: 'Quarterly Tax Payment',
      amount: 3000,
      frequency: 'monthly',
      dueDay: 15,
      nextDueDate: nextTaxPayment,
      isActive: true,
      notes: 'Quarterly estimated tax (sets aside 1/3)',
    },
  })
  recurringCount++

  const nextInsurance = new Date(today)
  nextInsurance.setMonth(nextInsurance.getMonth() + 1)
  nextInsurance.setDate(20)

  await prisma.recurringExpense.create({
    data: {
      userId: user.id,
      accountId: personalChecking.id,
      description: 'Health & Auto Insurance',
      amount: 400,
      frequency: 'monthly',
      dueDay: 20,
      nextDueDate: nextInsurance,
      isActive: true,
      notes: 'Health, auto, disability insurance',
    },
  })
  recurringCount++

  return NextResponse.json({
    success: true,
    message: 'Business Owner scenario loaded',
    itemsCreated: { 
      people: 1,
      accounts: 4,
      income: incomeCount,
      transactions: transactionCount,
      recurringExpenses: recurringCount,
      rules: 1,
      settings: 1,
    },
  })
}

// Scenario 3: Working Teens + Gig Income - Family with multiple income streams
async function seedWorkingTeens(user: any) {
  const james = await prisma.person.upsert({
    where: { userId_name: { userId: user.id, name: 'James' } },
    update: {},
    create: {
      userId: user.id,
      name: 'James',
      role: 'primary-earner',
      color: '#3B82F6',
    },
  })

  const jennifer = await prisma.person.upsert({
    where: { userId_name: { userId: user.id, name: 'Jennifer' } },
    update: {},
    create: {
      userId: user.id,
      name: 'Jennifer',
      role: 'secondary-earner',
      color: '#EC4899',
    },
  })

  const alex = await prisma.person.upsert({
    where: { userId_name: { userId: user.id, name: 'Alex' } },
    update: {},
    create: {
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

  const familySavings = await prisma.account.create({
    data: {
      userId: user.id,
      personId: james.id,
      name: 'Family Savings',
      type: 'savings',
      isActive: true,
    },
  })

  const familyCard = await prisma.account.create({
    data: {
      userId: user.id,
      personId: james.id,
      name: 'Family Credit Card',
      type: 'credit_card',
      creditLimit: 10000,
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

  // Create budget settings
  await prisma.setting.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      monthlyIncomeTarget: 8500,
      monthlyExpenseTarget: 6500,
      savingsTarget: 2000,
      savingsRate: 23.5,
      needPercent: 70,
      wantPercent: 15,
      savingsPercent: 15,
      trackedCategories: JSON.stringify(['Housing', 'Food', 'Transport', 'Kids Activities']),
      excludeFromBudget: JSON.stringify(['Transfer', 'Internal']),
    },
  })

  // Create rules
  await prisma.rule.create({
    data: {
      userId: user.id,
      name: 'Credit card expenses are wants/needs',
      matchMethod: 'cc',
      splitConfig: JSON.stringify([
        { type: 'want', target: 'Family Expenses', percent: 30 },
        { type: 'need', target: 'Essential', percent: 70 }
      ]),
      isActive: true,
    },
  })

  let incomeCount = 0
  let transactionCount = 0
  let recurringCount = 0

  for (let m = 0; m < 6; m++) {
    const date = new Date(2025, 6 + m, 1)

    // James: W2 salary (biweekly)
    await prisma.income.create({
      data: {
        userId: user.id,
        personId: james.id,
        accountId: familyChecking.id,
        date: new Date(date.getFullYear(), date.getMonth(), 1),
        grossAmount: 2750,
        taxes: 605,
        preTaxDeductions: 150,
        postTaxDeductions: 0,
        netAmount: 1995,
        source: 'W2 Salary (biweekly)',
        tags: JSON.stringify(['recurring', 'tax:w2']),
      },
    })
    incomeCount++

    await prisma.income.create({
      data: {
        userId: user.id,
        personId: james.id,
        accountId: familyChecking.id,
        date: new Date(date.getFullYear(), date.getMonth(), 15),
        grossAmount: 2750,
        taxes: 605,
        preTaxDeductions: 150,
        postTaxDeductions: 0,
        netAmount: 1995,
        source: 'W2 Salary (biweekly)',
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
        grossAmount: 2000,
        taxes: 240,
        preTaxDeductions: 0,
        postTaxDeductions: 90,
        netAmount: 1670,
        source: 'Part-time Salary',
        tags: JSON.stringify(['recurring', 'tax:w2']),
      },
    })
    incomeCount++

    // Alex: Variable gig income
    const gigIncome = 800 + Math.random() * 500
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
      { name: 'Mortgage', amount: 2400, method: 'ach', person: james, date: 5 },
      { name: 'Utilities', amount: 350, method: 'ach', person: james, date: 8 },
      { name: 'Groceries', amount: 700, method: 'ach', person: jennifer, date: 10 },
      { name: 'Car Payments', amount: 600, method: 'ach', person: james, date: 12 },
      { name: 'Gas', amount: 350, method: 'ach', person: james, date: 15 },
      { name: 'Phone (Family)', amount: 180, method: 'ach', person: jennifer, date: 18 },
      { name: 'Internet', amount: 100, method: 'ach', person: james, date: 20 },
      { name: 'Health Insurance', amount: 550, method: 'ach', person: james, date: 22 },
      { name: 'Groceries (Credit)', amount: 300, method: 'cc', person: james, date: 12 },
      { name: 'Dining Out', amount: 250, method: 'cc', person: jennifer, date: 18 },
    ]

    for (const exp of familyExpenses) {
      const accountId = exp.method === 'cc' ? familyCard.id : familyChecking.id
      const tx = await prisma.transaction.create({
        data: {
          userId: user.id,
          personId: exp.person.id,
          accountId,
          date: new Date(date.getFullYear(), date.getMonth(), exp.date),
          amount: exp.amount,
          description: exp.name,
          method: exp.method as any,
          tags: JSON.stringify(['family']),
        },
      })
      transactionCount++

      await prisma.split.create({
        data: {
          transactionId: tx.id,
          type: exp.method === 'cc' ? 'want' : 'need',
          target: exp.name,
          percent: 100,
        },
      })
    }

    // Alex's savings contribution
    const alexSavings = await prisma.transaction.create({
      data: {
        userId: user.id,
        personId: alex.id,
        accountId: alexGigAccount.id,
        date: new Date(date.getFullYear(), date.getMonth(), 28),
        amount: 200,
        description: 'Savings Contribution',
        method: 'ach',
        tags: JSON.stringify(['savings']),
      },
    })
    transactionCount++

    await prisma.split.create({
      data: {
        transactionId: alexSavings.id,
        type: 'savings',
        target: 'Alex College Fund',
        percent: 100,
      },
    })
  }

  // Create recurring expenses
  const today = new Date()
  const nextMortgage = new Date(today)
  nextMortgage.setMonth(nextMortgage.getMonth() + 1)
  nextMortgage.setDate(5)

  await prisma.recurringExpense.create({
    data: {
      userId: user.id,
      accountId: familyChecking.id,
      description: 'Mortgage',
      amount: 2400,
      frequency: 'monthly',
      dueDay: 5,
      nextDueDate: nextMortgage,
      isActive: true,
      notes: 'Family home mortgage',
    },
  })
  recurringCount++

  const nextCar = new Date(today)
  nextCar.setMonth(nextCar.getMonth() + 1)
  nextCar.setDate(12)

  await prisma.recurringExpense.create({
    data: {
      userId: user.id,
      accountId: familyChecking.id,
      description: 'Car Payments',
      amount: 600,
      frequency: 'monthly',
      dueDay: 12,
      nextDueDate: nextCar,
      isActive: true,
      notes: 'Two vehicle car payments',
    },
  })
  recurringCount++

  const nextInsurance = new Date(today)
  nextInsurance.setMonth(nextInsurance.getMonth() + 1)
  nextInsurance.setDate(22)

  await prisma.recurringExpense.create({
    data: {
      userId: user.id,
      accountId: familyChecking.id,
      description: 'Health Insurance',
      amount: 550,
      frequency: 'monthly',
      dueDay: 22,
      nextDueDate: nextInsurance,
      isActive: true,
      notes: 'Family health insurance plan',
    },
  })
  recurringCount++

  return NextResponse.json({
    success: true,
    message: 'Working Teens + Gig Income scenario loaded',
    itemsCreated: { 
      people: 3,
      accounts: 4,
      income: incomeCount,
      transactions: transactionCount,
      recurringExpenses: recurringCount,
      rules: 1,
      settings: 1,
    },
  })
}

// Scenario 4: Complex Family - Multiple properties, business income, investment accounts
async function seedComplexFamily(user: any) {
  const david = await prisma.person.upsert({
    where: { userId_name: { userId: user.id, name: 'David' } },
    update: {},
    create: {
      userId: user.id,
      name: 'David',
      role: 'primary-earner',
      color: '#3B82F6',
    },
  })

  const rebecca = await prisma.person.upsert({
    where: { userId_name: { userId: user.id, name: 'Rebecca' } },
    update: {},
    create: {
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

  const investmentSavings = await prisma.account.create({
    data: {
      userId: user.id,
      personId: david.id,
      name: 'Investment Savings',
      type: 'savings',
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
      creditLimit: 30000,
      isActive: true,
    },
  })

  const taxReserve = await prisma.account.create({
    data: {
      userId: user.id,
      personId: rebecca.id,
      name: 'Tax Reserve',
      type: 'savings',
      isActive: true,
    },
  })

  // Create budget settings
  await prisma.setting.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      monthlyIncomeTarget: 18000,
      monthlyExpenseTarget: 10000,
      savingsTarget: 8000,
      savingsRate: 44.4,
      needPercent: 50,
      wantPercent: 25,
      savingsPercent: 25,
      trackedCategories: JSON.stringify(['Housing', 'Business', 'Investments', 'Taxes']),
      excludeFromBudget: JSON.stringify(['Transfer', 'Tax Payment', 'Investment']),
    },
  })

  // Create rules
  await prisma.rule.create({
    data: {
      userId: user.id,
      name: 'Business credit card',
      matchAccountId: businessCC.id,
      splitConfig: JSON.stringify([{ type: 'need', target: 'Business Expenses', percent: 100 }]),
      isActive: true,
    },
  })

  await prisma.rule.create({
    data: {
      userId: user.id,
      name: 'Personal credit card',
      matchAccountId: personalCC.id,
      splitConfig: JSON.stringify([
        { type: 'want', target: 'Discretionary', percent: 60 },
        { type: 'need', target: 'Essential', percent: 40 }
      ]),
      isActive: true,
    },
  })

  let incomeCount = 0
  let transactionCount = 0
  let recurringCount = 0

  for (let m = 0; m < 6; m++) {
    const date = new Date(2025, 6 + m, 1)

    // David: W2 Salary (biweekly)
    await prisma.income.create({
      data: {
        userId: user.id,
        personId: david.id,
        accountId: primaryChecking.id,
        date: new Date(date.getFullYear(), date.getMonth(), 1),
        grossAmount: 5000,
        taxes: 1100,
        preTaxDeductions: 250,
        postTaxDeductions: 150,
        netAmount: 3500,
        source: 'W2 Salary (biweekly)',
        tags: JSON.stringify(['recurring', 'tax:w2']),
      },
    })
    incomeCount++

    await prisma.income.create({
      data: {
        userId: user.id,
        personId: david.id,
        accountId: primaryChecking.id,
        date: new Date(date.getFullYear(), date.getMonth(), 15),
        grossAmount: 5000,
        taxes: 1100,
        preTaxDeductions: 250,
        postTaxDeductions: 150,
        netAmount: 3500,
        source: 'W2 Salary (biweekly)',
        tags: JSON.stringify(['recurring', 'tax:w2']),
      },
    })
    incomeCount++

    // David: Bonus (March & September)
    if ([2, 8].includes(6 + m)) {
      const bonus = 20000 + Math.random() * 10000
      await prisma.income.create({
        data: {
          userId: user.id,
          personId: david.id,
          accountId: primaryChecking.id,
          date: new Date(date.getFullYear(), date.getMonth(), 15),
          grossAmount: bonus,
          taxes: bonus * 0.25,
          preTaxDeductions: bonus * 0.05,
          postTaxDeductions: 0,
          netAmount: bonus * 0.7,
          source: 'Annual Bonus',
          tags: JSON.stringify(['bonus', 'annual']),
        },
      })
      incomeCount++
    }

    // Rebecca: Business income
    const businessIncome = 10000 + Math.random() * 5000
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
        source: 'Freelance Consulting',
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
          accountId: taxReserve.id,
          date: new Date(date.getFullYear(), date.getMonth(), 15),
          amount: 3500,
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
      { name: 'Primary Mortgage', amount: 3500, person: david, account: primaryChecking, method: 'ach', date: 5 },
      { name: 'Investment Property Mortgage', amount: 2000, person: david, account: primaryChecking, method: 'ach', date: 5 },
      { name: 'Property Tax', amount: 1500, person: david, account: primaryChecking, method: 'ach', date: 10 },
      { name: 'Utilities (Both)', amount: 600, person: david, account: primaryChecking, method: 'ach', date: 8 },
      { name: 'Groceries', amount: 1000, person: david, account: primaryChecking, method: 'ach', date: 12 },
      { name: 'Cars & Maintenance', amount: 800, person: david, account: primaryChecking, method: 'ach', date: 12 },
      { name: 'Gas', amount: 500, person: david, account: primaryChecking, method: 'ach', date: 15 },
      { name: 'Insurance (Home, Auto, Business)', amount: 1800, person: david, account: primaryChecking, method: 'ach', date: 18 },
      { name: 'Medical & Health', amount: 500, person: david, account: primaryChecking, method: 'ach', date: 20 },
      { name: 'Business Expenses', amount: 2500, person: rebecca, account: businessCC, method: 'cc', date: 10 },
      { name: 'Office & Equipment', amount: 800, person: rebecca, account: businessCC, method: 'cc', date: 15 },
      { name: 'Dining & Entertainment', amount: 600, person: david, account: personalCC, method: 'cc', date: 18 },
      { name: 'Shopping', amount: 400, person: david, account: personalCC, method: 'cc', date: 22 },
      { name: 'CC Payment - Personal', amount: 1000, person: david, account: primaryChecking, method: 'ach', date: 25 },
      { name: 'Investment Deposit', amount: 3000, person: david, account: primaryChecking, method: 'ach', date: 28 },
    ]

    for (const exp of expenses) {
      const accountId = exp.account.id
      const tx = await prisma.transaction.create({
        data: {
          userId: user.id,
          personId: exp.person.id,
          accountId,
          date: new Date(date.getFullYear(), date.getMonth(), exp.date),
          amount: exp.amount,
          description: exp.name,
          method: exp.method as any,
          tags: JSON.stringify(['family']),
        },
      })
      transactionCount++

      const splitType = exp.method === 'cc' && exp.account.id === personalCC.id ? 'want' : 'need'
      await prisma.split.create({
        data: {
          transactionId: tx.id,
          type: splitType,
          target: exp.name,
          percent: 100,
        },
      })
    }
  }

  // Create recurring expenses
  const today = new Date()
  
  const nextPrimaryMortgage = new Date(today)
  nextPrimaryMortgage.setMonth(nextPrimaryMortgage.getMonth() + 1)
  nextPrimaryMortgage.setDate(5)

  await prisma.recurringExpense.create({
    data: {
      userId: user.id,
      accountId: primaryChecking.id,
      description: 'Primary Mortgage',
      amount: 3500,
      frequency: 'monthly',
      dueDay: 5,
      nextDueDate: nextPrimaryMortgage,
      isActive: true,
      notes: 'Primary residence mortgage',
    },
  })
  recurringCount++

  const nextInvestmentMortgage = new Date(today)
  nextInvestmentMortgage.setMonth(nextInvestmentMortgage.getMonth() + 1)
  nextInvestmentMortgage.setDate(5)

  await prisma.recurringExpense.create({
    data: {
      userId: user.id,
      accountId: primaryChecking.id,
      description: 'Investment Property Mortgage',
      amount: 2000,
      frequency: 'monthly',
      dueDay: 5,
      nextDueDate: nextInvestmentMortgage,
      isActive: true,
      notes: 'Rental property mortgage',
    },
  })
  recurringCount++

  const nextInsurance = new Date(today)
  nextInsurance.setMonth(nextInsurance.getMonth() + 1)
  nextInsurance.setDate(18)

  await prisma.recurringExpense.create({
    data: {
      userId: user.id,
      accountId: primaryChecking.id,
      description: 'Insurance (Home, Auto, Business)',
      amount: 1800,
      frequency: 'monthly',
      dueDay: 18,
      nextDueDate: nextInsurance,
      isActive: true,
      notes: 'Homeowner, auto, and business liability insurance',
    },
  })
  recurringCount++

  const nextTaxPayment = new Date(today)
  nextTaxPayment.setMonth(nextTaxPayment.getMonth() + 1)
  nextTaxPayment.setDate(15)

  await prisma.recurringExpense.create({
    data: {
      userId: user.id,
      accountId: taxReserve.id,
      description: 'Quarterly Tax Payment',
      amount: 3500,
      frequency: 'monthly',
      dueDay: 15,
      nextDueDate: nextTaxPayment,
      isActive: true,
      notes: 'Quarterly estimated taxes for Rebecca\'s business',
    },
  })
  recurringCount++

  return NextResponse.json({
    success: true,
    message: 'Complex Family scenario loaded',
    itemsCreated: { 
      people: 2,
      accounts: 6,
      income: incomeCount,
      transactions: transactionCount,
      recurringExpenses: recurringCount,
      rules: 2,
      settings: 1,
    },
  })
}


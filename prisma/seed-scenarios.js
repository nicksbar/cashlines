/**
 * Realistic Financial Test Scenarios
 *
 * 4 complete scenarios available from UI:
 * 1. Single, No CC - Simple W2, tight budget
 * 2. Business Owner - Self-employed with quarterly taxes
 * 3. Working Teens + Gig Income - Family with variable income
 * 4. Complex Family - Multiple properties, business income
 *
 * Run with: node prisma/seed-scenarios.js
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const generateEmail = (name) => `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}@cashlines.local`

async function scenario1() {
  console.log('🔷 Scenario 1: Single, No Credit Card...')

  const user = await prisma.user.create({
    data: {
      email: generateEmail('Sarah Single'),
      name: 'Sarah - Single Income, No CC',
      isProduction: false,
    },
  })

  const sarah = await prisma.person.create({
    data: {
      userId: user.id,
      name: 'Sarah',
      role: 'primary',
    },
  })

  const checking = await prisma.account.create({
    data: {
      userId: user.id,
      personId: sarah.id,
      name: 'Checking',
      type: 'checking',
    },
  })

  // 6 months of realistic data
  const baseDate = new Date(2025, 6, 1)
  for (let m = 0; m < 6; m++) {
    const date = new Date(baseDate.getFullYear(), baseDate.getMonth() + m, 1)

    // W2 Salary: $4,500 gross → $2,250 net
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
        notes: 'Biweekly deposits',
      },
    })

    // Expenses
    const expenses = [
      { day: 5, amount: 1200, desc: 'Rent', tag: 'housing' },
      { day: 7, amount: 150, desc: 'Utilities', tag: 'utilities' },
      { day: 10, amount: 250, desc: 'Groceries', tag: 'groceries' },
      { day: 13, amount: 300, desc: 'Transportation (Gas, Insurance)', tag: 'transportation' },
      { day: 15, amount: 100, desc: 'Phone & Internet', tag: 'utilities' },
      { day: 17, amount: 200, desc: 'Health Insurance', tag: 'insurance' },
    ]

    for (const exp of expenses) {
      await prisma.transaction.create({
        data: {
          userId: user.id,
          personId: sarah.id,
          accountId: checking.id,
          date: new Date(date.getFullYear(), date.getMonth(), exp.day),
          amount: exp.amount,
          description: exp.desc,
          method: 'ach',
          tags: JSON.stringify([exp.tag, 'recurring']),
          splits: {
            create: [{ type: 'need', target: exp.desc, amount: exp.amount }],
          },
        },
      })
    }
  }

  console.log('✅ Scenario 1 complete')
}

async function scenario2() {
  console.log('🔶 Scenario 2: Business Owner...')

  const user = await prisma.user.create({
    data: {
      email: generateEmail('Mike Business'),
      name: 'Mike - Business Owner, Quarterly Taxes',
      isProduction: false,
    },
  })

  const mike = await prisma.person.create({
    data: {
      userId: user.id,
      name: 'Mike',
      role: 'primary',
    },
  })

  const bizChecking = await prisma.account.create({
    data: {
      userId: user.id,
      personId: mike.id,
      name: 'Business Checking',
      type: 'checking',
    },
  })

  const personal = await prisma.account.create({
    data: {
      userId: user.id,
      personId: mike.id,
      name: 'Personal Checking',
      type: 'checking',
    },
  })

  const baseDate = new Date(2025, 6, 1)
  for (let m = 0; m < 6; m++) {
    const date = new Date(baseDate.getFullYear(), baseDate.getMonth() + m, 1)

    // Variable consulting income
    const income = 7500 + Math.random() * 2500
    await prisma.income.create({
      data: {
        userId: user.id,
        personId: mike.id,
        accountId: bizChecking.id,
        date,
        grossAmount: income,
        taxes: 0,
        preTaxDeductions: 0,
        postTaxDeductions: 0,
        netAmount: income,
        source: 'Consulting',
        tags: JSON.stringify(['self-employed', 'variable']),
      },
    })

    // Quarterly tax payment
    if ([0, 3].includes(m)) {
      await prisma.transaction.create({
        data: {
          userId: user.id,
          personId: mike.id,
          accountId: personal.id,
          date: new Date(date.getFullYear(), date.getMonth(), 15),
          amount: 2800,
          description: 'Quarterly Estimated Tax Payment',
          method: 'ach',
          tags: JSON.stringify(['taxes', 'quarterly']),
          splits: {
            create: [{ type: 'need', target: 'Taxes', amount: 2800 }],
          },
        },
      })
    }

    // Expenses
    const expenses = [
      { day: 5, amount: 1500, desc: 'Mortgage', account: 'personal' },
      { day: 8, amount: 400, desc: 'Home Office', account: 'business', method: 'cc' },
      { day: 10, amount: 150, desc: 'Internet', account: 'personal' },
      { day: 10, amount: 100, desc: 'Phone', account: 'personal' },
      { day: 12, amount: 300, desc: 'Business Insurance', account: 'business' },
      { day: 13, amount: 250, desc: 'Utilities', account: 'personal' },
      { day: 15, amount: 400, desc: 'Groceries', account: 'personal' },
      { day: 17, amount: 400, desc: 'Transportation', account: 'personal' },
    ]

    for (const exp of expenses) {
      const account = exp.account === 'personal' ? personal.id : bizChecking.id
      await prisma.transaction.create({
        data: {
          userId: user.id,
          personId: mike.id,
          accountId: account,
          date: new Date(date.getFullYear(), date.getMonth(), exp.day),
          amount: exp.amount,
          description: exp.desc,
          method: exp.method || 'ach',
          tags: JSON.stringify(['business']),
          splits: {
            create: [{ type: 'need', target: exp.desc, amount: exp.amount }],
          },
        },
      })
    }
  }

  console.log('✅ Scenario 2 complete')
}

async function scenario3() {
  console.log('🔵 Scenario 3: Working Teens + Gig Income...')

  const user = await prisma.user.create({
    data: {
      email: generateEmail('WorkingTeens'),
      name: 'Working Teens Family - Multiple Income',
      isProduction: false,
    },
  })

  const james = await prisma.person.create({
    data: { userId: user.id, name: 'James', role: 'primary' },
  })
  const jen = await prisma.person.create({
    data: { userId: user.id, name: 'Jennifer', role: 'secondary' },
  })
  const alex = await prisma.person.create({
    data: { userId: user.id, name: 'Alex', role: 'teen' },
  })
  const casey = await prisma.person.create({
    data: { userId: user.id, name: 'Casey', role: 'teen' },
  })

  const familyChecking = await prisma.account.create({
    data: { userId: user.id, personId: james.id, name: 'Family Checking', type: 'checking' },
  })
  const alexGig = await prisma.account.create({
    data: { userId: user.id, personId: alex.id, name: 'Alex Gig', type: 'checking' },
  })
  const caseyRetail = await prisma.account.create({
    data: { userId: user.id, personId: casey.id, name: 'Casey Retail', type: 'checking' },
  })

  const baseDate = new Date(2025, 6, 1)
  for (let m = 0; m < 6; m++) {
    const date = new Date(baseDate.getFullYear(), baseDate.getMonth() + m, 1)

    // Income streams
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
        source: 'W2 Salary (James)',
        tags: JSON.stringify(['recurring', 'tax:w2']),
      },
    })

    await prisma.income.create({
      data: {
        userId: user.id,
        personId: jen.id,
        accountId: familyChecking.id,
        date,
        grossAmount: 3200,
        taxes: 480,
        preTaxDeductions: 0,
        postTaxDeductions: 150,
        netAmount: 2570,
        source: 'Part-time (Jennifer)',
        tags: JSON.stringify(['recurring', 'tax:w2']),
      },
    })

    const gigIncome = 600 + Math.random() * 200
    await prisma.income.create({
      data: {
        userId: user.id,
        personId: alex.id,
        accountId: alexGig.id,
        date,
        grossAmount: gigIncome,
        taxes: 0,
        preTaxDeductions: 0,
        postTaxDeductions: 0,
        netAmount: gigIncome,
        source: 'Gig Work (DoorDash, TaskRabbit)',
        tags: JSON.stringify(['variable', 'gig']),
      },
    })

    await prisma.income.create({
      data: {
        userId: user.id,
        personId: casey.id,
        accountId: caseyRetail.id,
        date,
        grossAmount: 1200,
        taxes: 80,
        preTaxDeductions: 0,
        postTaxDeductions: 0,
        netAmount: 1120,
        source: 'Part-time Retail (Casey)',
        tags: JSON.stringify(['recurring', 'tax:w2']),
      },
    })

    // Family expenses
    const familyExp = [
      { day: 5, amount: 2200, desc: 'Mortgage', person: james.id },
      { day: 6, amount: 300, desc: 'Utilities', person: james.id },
      { day: 7, amount: 600, desc: 'Groceries', person: jen.id },
      { day: 8, amount: 800, desc: 'Car Payments', person: james.id },
      { day: 9, amount: 400, desc: 'Gas', person: james.id },
      { day: 10, amount: 200, desc: 'Phone (Family)', person: jen.id },
      { day: 11, amount: 120, desc: 'Internet', person: james.id },
      { day: 12, amount: 600, desc: 'Health Insurance', person: james.id },
    ]

    for (const exp of familyExp) {
      await prisma.transaction.create({
        data: {
          userId: user.id,
          personId: exp.person,
          accountId: familyChecking.id,
          date: new Date(date.getFullYear(), date.getMonth(), exp.day),
          amount: exp.amount,
          description: exp.desc,
          method: 'ach',
          tags: JSON.stringify(['family']),
          splits: {
            create: [{ type: 'need', target: exp.desc, amount: exp.amount }],
          },
        },
      })
    }

    // Casey contributes
    await prisma.transaction.create({
      data: {
        userId: user.id,
        personId: casey.id,
        accountId: caseyRetail.id,
        date: new Date(date.getFullYear(), date.getMonth(), 20),
        amount: 400,
        description: 'Contribution to Household',
        method: 'ach',
        tags: JSON.stringify(['family']),
        splits: {
          create: [{ type: 'need', target: 'Household', amount: 400 }],
        },
      },
    })
  }

  console.log('✅ Scenario 3 complete')
}

async function scenario4() {
  console.log('🟢 Scenario 4: Complex Family - Business + Properties...')

  const user = await prisma.user.create({
    data: {
      email: generateEmail('ComplexFamily'),
      name: 'Complex Family - Business, Properties',
      isProduction: false,
    },
  })

  const david = await prisma.person.create({
    data: { userId: user.id, name: 'David', role: 'primary' },
  })
  const rebecca = await prisma.person.create({
    data: { userId: user.id, name: 'Rebecca', role: 'secondary' },
  })

  const primaryChecking = await prisma.account.create({
    data: { userId: user.id, personId: david.id, name: 'Primary Checking', type: 'checking' },
  })
  const bizChecking = await prisma.account.create({
    data: { userId: user.id, personId: rebecca.id, name: 'Business Checking', type: 'checking' },
  })
  const taxReserve = await prisma.account.create({
    data: { userId: user.id, personId: rebecca.id, name: 'Tax Reserve', type: 'savings' },
  })
  const bizCC = await prisma.account.create({
    data: { userId: user.id, personId: rebecca.id, name: 'Business CC', type: 'credit_card' },
  })
  const personalCC = await prisma.account.create({
    data: { userId: user.id, personId: david.id, name: 'Personal CC', type: 'credit_card' },
  })

  const baseDate = new Date(2025, 6, 1)
  for (let m = 0; m < 6; m++) {
    const date = new Date(baseDate.getFullYear(), baseDate.getMonth() + m, 1)

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
        source: 'W2 Salary (David)',
        tags: JSON.stringify(['recurring', 'tax:w2']),
      },
    })

    // David: Bonus (semi-annual)
    if ([2, 5].includes(m)) {
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
          source: 'Annual Bonus (David)',
          tags: JSON.stringify(['bonus', 'annual']),
        },
      })
    }

    // Rebecca: Business income
    const bizIncome = 7500 + Math.random() * 1500
    await prisma.income.create({
      data: {
        userId: user.id,
        personId: rebecca.id,
        accountId: bizChecking.id,
        date,
        grossAmount: bizIncome,
        taxes: 0,
        preTaxDeductions: 0,
        postTaxDeductions: 0,
        netAmount: bizIncome,
        source: 'Freelance Consulting (Rebecca)',
        tags: JSON.stringify(['self-employed', 'variable']),
      },
    })

    // Quarterly tax
    if ([0, 3].includes(m)) {
      await prisma.transaction.create({
        data: {
          userId: user.id,
          personId: rebecca.id,
          accountId: taxReserve.id,
          date: new Date(date.getFullYear(), date.getMonth(), 15),
          amount: 2800,
          description: 'Quarterly Estimated Tax',
          method: 'ach',
          tags: JSON.stringify(['taxes']),
          splits: {
            create: [{ type: 'need', target: 'Taxes', amount: 2800 }],
          },
        },
      })
    }

    // Complex expenses
    const expenses = [
      { day: 5, amount: 2500, desc: 'Mortgage (Primary)', person: david.id, account: 'primary' },
      { day: 5, amount: 1500, desc: 'Mortgage (Investment)', person: david.id, account: 'primary' },
      { day: 6, amount: 400, desc: 'Utilities (Both)', person: david.id, account: 'primary' },
      { day: 7, amount: 800, desc: 'Groceries', person: david.id, account: 'primary' },
      { day: 8, amount: 1000, desc: 'Cars & Insurance', person: david.id, account: 'primary' },
      { day: 9, amount: 500, desc: 'Gas', person: david.id, account: 'primary' },
      { day: 10, amount: 1200, desc: 'All Insurance', person: david.id, account: 'primary' },
      { day: 12, amount: 1500, desc: 'Business Expenses', person: rebecca.id, account: 'bizcc' },
      { day: 14, amount: 1000, desc: 'Personal Expenses', person: david.id, account: 'personalcc' },
      { day: 20, amount: 2000, desc: 'CC Payment', person: david.id, account: 'primary' },
    ]

    for (const exp of expenses) {
      let account
      if (exp.account === 'primary') account = primaryChecking.id
      if (exp.account === 'bizcc') account = bizCC.id
      if (exp.account === 'personalcc') account = personalCC.id

      await prisma.transaction.create({
        data: {
          userId: user.id,
          personId: exp.person,
          accountId: account,
          date: new Date(date.getFullYear(), date.getMonth(), exp.day),
          amount: exp.amount,
          description: exp.desc,
          method: ['bizcc', 'personalcc'].includes(exp.account) ? 'cc' : 'ach',
          tags: JSON.stringify(['family']),
          splits: {
            create: [{ type: 'need', target: exp.desc, amount: exp.amount }],
          },
        },
      })
    }

    // Home improvements
    if (Math.random() > 0.6) {
      const homeImp = 800 + Math.random() * 1200
      await prisma.transaction.create({
        data: {
          userId: user.id,
          personId: david.id,
          accountId: primaryChecking.id,
          date: new Date(date.getFullYear(), date.getMonth(), 20),
          amount: homeImp,
          description: 'Home Improvements',
          method: 'ach',
          tags: JSON.stringify(['maintenance']),
          splits: {
            create: [{ type: 'need', target: 'Maintenance', amount: homeImp }],
          },
        },
      })
    }
  }

  console.log('✅ Scenario 4 complete')
}

async function main() {
  console.log('\n🌱 Creating 4 realistic financial scenarios...\n')
  try {
    await scenario1()
    await scenario2()
    await scenario3()
    await scenario4()
    console.log('\n✅ All scenarios created!\n')
    console.log('Available scenarios:')
    console.log('  1️⃣  Single, No CC - $2,250/month net, tight budget')
    console.log('  2️⃣  Business Owner - Variable income, quarterly taxes')
    console.log('  3️⃣  Working Teens - Family with gig income')
    console.log('  4️⃣  Complex Family - Business, properties, investments\n')
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

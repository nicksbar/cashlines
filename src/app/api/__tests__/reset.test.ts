import { POST as resetHandler } from '../data/reset/route'
import { POST as seedHandler } from '../data/seed/route'
import { prisma } from '@/lib/db'
import { NextRequest } from 'next/server'

// Helper to create NextRequest with headers
function createRequest(body?: any, headers: Record<string, string> = {}) {
  const defaultHeaders: Record<string, string> = {
    'x-household-id': 'test-household-reset',
    'Content-Type': 'application/json',
    ...headers,
  }

  return {
    headers: new Map(Object.entries(defaultHeaders)),
    json: async () => body || {},
  } as unknown as NextRequest
}

describe('Data Reset and Seed', () => {
  let testHouseholdId: string
  let testEmail: string

  beforeAll(async () => {
    // Create a test household
    testEmail = `reset-test-${Date.now()}@test.local`
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        name: 'Reset Test User',
        isProduction: false,
      },
    })
    testHouseholdId = user.id
  })

  afterAll(async () => {
    // Clean up
    await prisma.user.delete({ where: { id: testHouseholdId } }).catch(() => {})
  })

  test('Reset deletes all data but preserves user', async () => {
    // Seed household data first
    const seedRequest = createRequest(
      { type: 'household' },
      { 'x-household-id': testHouseholdId }
    )
    const seedResponse = await seedHandler(seedRequest)
    const seedData = await seedResponse.json()
    expect(seedData.success || seedData.itemsCreated).toBeDefined()

    // Verify data exists
    const peopleCount = await prisma.person.count({
      where: { userId: testHouseholdId },
    })
    const accountsCount = await prisma.account.count({
      where: { userId: testHouseholdId },
    })
    const incomeCount = await prisma.income.count({
      where: { userId: testHouseholdId },
    })
    const transactionsCount = await prisma.transaction.count({
      where: { userId: testHouseholdId },
    })

    expect(peopleCount).toBeGreaterThan(0)
    expect(accountsCount).toBeGreaterThan(0)
    expect(incomeCount).toBeGreaterThan(0)
    expect(transactionsCount).toBeGreaterThan(0)

    // Reset
    const resetRequest = createRequest(undefined, { 'x-household-id': testHouseholdId })
    const resetResponse = await resetHandler(resetRequest)
    expect(resetResponse.status).toBe(200)

    // Verify household still exists
    const user = await prisma.user.findUnique({
      where: { id: testHouseholdId },
    })
    expect(user).toBeDefined()
    expect(user?.email).toBe(testEmail) // Household ID preserved

    // Verify all data is deleted
    const finalPeopleCount = await prisma.person.count({
      where: { userId: testHouseholdId },
    })
    const finalAccountsCount = await prisma.account.count({
      where: { userId: testHouseholdId },
    })
    const finalIncomeCount = await prisma.income.count({
      where: { userId: testHouseholdId },
    })
    const finalTransactionsCount = await prisma.transaction.count({
      where: { userId: testHouseholdId },
    })
    const finalRulesCount = await prisma.rule.count({
      where: { userId: testHouseholdId },
    })
    const finalTemplatesCount = await prisma.template.count({
      where: { userId: testHouseholdId },
    })
    const finalBalanceSnapshotsCount = await prisma.balanceSnapshot.count({
      where: { userId: testHouseholdId },
    })

    expect(finalPeopleCount).toBe(0)
    expect(finalAccountsCount).toBe(0)
    expect(finalIncomeCount).toBe(0)
    expect(finalTransactionsCount).toBe(0)
    expect(finalRulesCount).toBe(0)
    expect(finalTemplatesCount).toBe(0)
    expect(finalBalanceSnapshotsCount).toBe(0)
  })

  test('Reset prevents deletion for production accounts', async () => {
    // Create a production account
    const prodUser = await prisma.user.create({
      data: {
        email: `reset-prod-test-${Date.now()}@test.local`,
        name: 'Production User',
        isProduction: true,
      },
    })

    try {
      const resetRequest = createRequest(undefined, { 'x-household-id': prodUser.id })
      const resetResponse = await resetHandler(resetRequest)

      expect(resetResponse.status).toBe(403)
      const data = await resetResponse.json()
      expect(data.locked).toBe(true)
      expect(data.error).toContain('production')
    } finally {
      await prisma.user.delete({ where: { id: prodUser.id } })
    }
  })

  test('Reset can be followed by seed without errors', async () => {
    // Create fresh household
    const user = await prisma.user.create({
      data: {
        email: `reset-seed-test-${Date.now()}@test.local`,
        name: 'Reset-Seed Test User',
        isProduction: false,
      },
    })

    try {
      // Seed, reset, seed again
      const seedRequest = createRequest(
        { type: 'household' },
        { 'x-household-id': user.id }
      )

      const seed1 = await seedHandler(seedRequest)
      expect(seed1.status).toBe(200)

      const resetRequest = createRequest(undefined, { 'x-household-id': user.id })
      const resetResponse = await resetHandler(resetRequest)
      expect(resetResponse.status).toBe(200)

      // Seed again - should work without constraints
      const seed2 = await seedHandler(seedRequest)
      expect(seed2.status).toBe(200)
    } finally {
      await prisma.user.delete({ where: { id: user.id } }).catch(() => {})
    }
  })
})

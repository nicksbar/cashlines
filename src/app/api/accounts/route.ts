import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/db'
import { accountCreateSchema, accountUpdateSchema } from '@/src/lib/validation'
import { getErrorMessage } from '@/src/lib/utils'

/**
 * GET /api/accounts
 * Fetch all accounts for the current household
 * Requires: x-household-id header with the household ID
 */
export async function GET(request: NextRequest) {
  try {
    const householdId = request.headers.get('x-household-id')
    
    if (!householdId) {
      return NextResponse.json(
        { error: 'Missing household ID' },
        { status: 400 }
      )
    }

    // Verify household exists
    const user = await prisma.user.findUnique({
      where: { id: householdId },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Household not found' },
        { status: 404 }
      )
    }
    
    const accounts = await prisma.account.findMany({
      where: {
        userId: householdId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    return NextResponse.json(accounts)
  } catch (error) {
    console.error('Error fetching accounts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch accounts' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/accounts
 * Create a new account
 * Requires: x-household-id header with the household ID
 */
export async function POST(request: NextRequest) {
  try {
    const householdId = request.headers.get('x-household-id')
    
    if (!householdId) {
      return NextResponse.json(
        { error: 'Missing household ID' },
        { status: 400 }
      )
    }

    // Verify household exists
    const user = await prisma.user.findUnique({
      where: { id: householdId },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Household not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validated = accountCreateSchema.parse(body)

    const account = await prisma.account.create({
      data: {
        userId: householdId,
        name: validated.name,
        type: validated.type,
        personId: validated.personId || undefined,
        isActive: validated.isActive,
        notes: validated.notes,
        creditLimit: validated.creditLimit,
        interestRate: validated.interestRate,
        cashBackPercent: validated.cashBackPercent,
        pointsPerDollar: validated.pointsPerDollar,
        annualFee: validated.annualFee,
        rewardsProgram: validated.rewardsProgram,
        interestRateApy: validated.interestRateApy,
        monthlyFee: validated.monthlyFee,
        minimumBalance: validated.minimumBalance,
        isFdic: validated.isFdic,
        location: validated.location,
        currentBalance: validated.currentBalance,
        accountNumber: validated.accountNumber,
        principalBalance: validated.principalBalance,
      },
    })

    return NextResponse.json(account, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message.includes('unique constraint')) {
      return NextResponse.json(
        { error: 'Account with this name already exists' },
        { status: 400 }
      )
    }
    console.error('Error creating account:', error)
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}

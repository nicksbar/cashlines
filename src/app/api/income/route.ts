import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/db'
import { incomeCreateSchema } from '@/src/lib/validation'
import { getMonthRange } from '@/src/lib/date'

/**
 * GET /api/income
 * Fetch income with optional filters
 * Requires: x-household-id header with the household ID
 * Query params:
 *   - month: number (1-12)
 *   - year: number
 *   - accountId: string
 *   - source: string (partial match)
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

    const searchParams = request.nextUrl.searchParams
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : undefined
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined
    const accountId = searchParams.get('accountId')
    const source = searchParams.get('source')

    const where: any = { userId: householdId }

    // Date range filter
    if (month && year) {
      const range = getMonthRange(year, month)
      where.date = {
        gte: range.start,
        lte: range.end,
      }
    }

    if (accountId) {
      where.accountId = accountId
    }

    if (source) {
      where.source = { contains: source, mode: 'insensitive' }
    }

    const income = await prisma.income.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        account: true,
      },
    })

    return NextResponse.json(income)
  } catch (error) {
    console.error('Error fetching income:', error)
    return NextResponse.json(
      { error: 'Failed to fetch income' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/income
 * Create a new income entry
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
    const validated = incomeCreateSchema.parse(body)

    // Verify account belongs to household
    const account = await prisma.account.findUnique({
      where: { id: validated.accountId },
    })

    if (!account || account.userId !== householdId) {
      return NextResponse.json(
        { error: 'Account not found or access denied' },
        { status: 404 }
      )
    }

    const income = await prisma.income.create({
      data: {
        userId: householdId,
        accountId: validated.accountId,
        date: validated.date,
        grossAmount: validated.grossAmount,
        taxes: validated.taxes,
        preTaxDeductions: validated.preTaxDeductions,
        postTaxDeductions: validated.postTaxDeductions,
        netAmount: validated.netAmount,
        source: validated.source,
        notes: validated.notes,
        tags: JSON.stringify(validated.tags),
      },
      include: {
        account: true,
      },
    })

    return NextResponse.json(income, { status: 201 })
  } catch (error) {
    console.error('Error creating income:', error)
    return NextResponse.json(
      { error: 'Failed to create income' },
      { status: 500 }
    )
  }
}

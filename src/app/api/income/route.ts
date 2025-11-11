import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/db'
import { incomeCreateSchema } from '@/src/lib/validation'
import { getMonthRange } from '@/src/lib/date'

/**
 * GET /api/income
 * Fetch income with optional filters
 * Query params:
 *   - month: number (1-12)
 *   - year: number
 *   - accountId: string
 *   - source: string (partial match)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : undefined
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined
    const accountId = searchParams.get('accountId')
    const source = searchParams.get('source')

    // TODO: Get actual user from session
    const users = await prisma.user.findMany()
    const userId = users[0]?.id

    if (!userId) {
      return NextResponse.json(
        { error: 'No user found' },
        { status: 400 }
      )
    }

    const where: any = { userId }

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
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = incomeCreateSchema.parse(body)

    // TODO: Get actual user from session
    const users = await prisma.user.findMany()
    const userId = users[0]?.id

    if (!userId) {
      return NextResponse.json(
        { error: 'No user found' },
        { status: 400 }
      )
    }

    // Verify account belongs to user
    const account = await prisma.account.findUnique({
      where: { id: validated.accountId },
    })

    if (!account || account.userId !== userId) {
      return NextResponse.json(
        { error: 'Account not found or access denied' },
        { status: 404 }
      )
    }

    const income = await prisma.income.create({
      data: {
        userId,
        accountId: validated.accountId,
        date: validated.date,
        amount: validated.amount,
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

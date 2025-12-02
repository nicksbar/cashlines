import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { transactionCreateSchema } from '@/lib/validation'
import { getMonthRange } from '@/lib/date'

/**
 * GET /api/transactions
 * Fetch transactions with optional filters
 * Requires: x-household-id header with the household ID
 * Query params:
 *   - month: number (1-12)
 *   - year: number
 *   - accountId: string
 *   - method: string (cc, cash, ach, other)
 *   - tags: string (comma-separated)
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
    const method = searchParams.get('method')
    const tagsStr = searchParams.get('tags')

    const where: any = { userId: householdId }

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

    if (method) {
      where.method = method
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        account: true,
        person: true,
        payingAccount: true,
        splits: true,
      },
    })

    // Filter by tags if provided
    let filtered = transactions
    if (tagsStr) {
      const searchTags = tagsStr.split(',').map(t => t.trim().toLowerCase())
      filtered = transactions.filter(tx => {
        const txTags = JSON.parse(tx.tags || '[]') as string[]
        return searchTags.some(st => txTags.some(t => t.toLowerCase().includes(st)))
      })
    }

    return NextResponse.json(filtered)
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/transactions
 * Create a new transaction with optional splits
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
    const validated = transactionCreateSchema.parse(body)

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

    const transaction = await prisma.transaction.create({
      data: {
        userId: householdId,
        accountId: validated.accountId,
        personId: validated.personId,
        payingAccountId: validated.payingAccountId,
        date: validated.date,
        amount: validated.amount,
        description: validated.description,
        method: validated.method,
        notes: validated.notes,
        tags: JSON.stringify(validated.tags),
        websiteUrl: validated.websiteUrl,
        splits: {
          create: validated.splits.map(split => ({
            type: split.type,
            target: split.target,
            amount: split.amount,
            percent: split.percent,
            notes: split.notes,
          })),
        },
      },
      include: {
        account: true,
        payingAccount: true,
        splits: true,
      },
    })

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    )
  }
}

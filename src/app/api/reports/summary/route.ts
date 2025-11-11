import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/db'
import { getMonthRange } from '@/src/lib/date'
import { sumAmounts } from '@/src/lib/money'

/**
 * GET /api/reports/summary
 * Get a summary for a given month/year:
 * - total income
 * - totals by method (cc/cash/ach/other)
 * - routing summary (sum of splits by type/target)
 * - tax-related totals
 *
 * Requires: x-household-id header with the household ID
 * Query params:
 *   - month: number (1-12)
 *   - year: number
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

    if (!month || !year) {
      return NextResponse.json(
        { error: 'month and year query parameters are required' },
        { status: 400 }
      )
    }

    const range = getMonthRange(year, month)

    // Fetch income for the month
    const incomes = await prisma.income.findMany({
      where: {
        userId: householdId,
        date: {
          gte: range.start,
          lte: range.end,
        },
      },
    })

    // Fetch transactions for the month with splits
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: householdId,
        date: {
          gte: range.start,
          lte: range.end,
        },
      },
      include: {
        splits: true,
      },
    })

    // Calculate totals
    const totalIncome = sumAmounts(incomes.map(i => i.netAmount))
    const totalExpense = sumAmounts(transactions.map(t => t.amount))

    // Group transactions by method
    const byMethod: Record<string, number> = {}
    transactions.forEach(tx => {
      byMethod[tx.method] = (byMethod[tx.method] || 0) + tx.amount
    })

    // Calculate routing summary (sum of splits by type/target)
    const routingSummary: Record<string, Record<string, number>> = {}
    transactions.forEach(tx => {
      tx.splits.forEach(split => {
        if (!routingSummary[split.type]) {
          routingSummary[split.type] = {}
        }
        const amount = split.amount || (split.percent ? (split.percent / 100) * tx.amount : 0)
        routingSummary[split.type][split.target] = (routingSummary[split.type][split.target] || 0) + amount
      })
    })

    // Calculate tax totals (from income taxes + split items tagged as tax)
    let taxTotal = sumAmounts(incomes.map(i => i.taxes))
    transactions.forEach(tx => {
      tx.splits.forEach(split => {
        if (split.type === 'tax') {
          const amount = split.amount || (split.percent ? (split.percent / 100) * tx.amount : 0)
          taxTotal += amount
        }
      })
    })

    return NextResponse.json({
      month,
      year,
      totalIncome,
      totalExpense,
      byMethod,
      routingSummary,
      taxTotal,
      transactionCount: transactions.length,
      incomeCount: incomes.length,
    })
  } catch (error) {
    console.error('Error fetching report:', error)
    return NextResponse.json(
      { error: 'Failed to fetch report' },
      { status: 500 }
    )
  }
}

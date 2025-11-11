import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/db'
import { getMonthRange } from '@/src/lib/date'
import { sumAmounts } from '@/src/lib/money'

/**
 * GET /api/reports/untracked
 * Calculate "Spent But Not Listed" (SBNL) for credit card accounts
 *
 * This metric shows the difference between:
 * - Total tracked expenses on a credit card (actual transactions logged)
 * - Total credit card payment made in the next month
 *
 * The gap reveals untracked/discretionary spending
 *
 * Query params:
 *   - month: number (1-12, defaults to current month)
 *   - year: number (defaults to current year)
 *   - accountId: optional, specific CC account ID
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : new Date().getMonth() + 1
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : new Date().getFullYear()
    const accountId = searchParams.get('accountId')

    // Get actual user
    const users = await prisma.user.findMany()
    const userId = users[0]?.id

    if (!userId) {
      return NextResponse.json(
        { error: 'No user found' },
        { status: 400 }
      )
    }

    // Get credit card accounts (filter to accountId if specified)
    const accounts = await prisma.account.findMany({
      where: {
        userId,
        type: 'credit_card',
        ...(accountId ? { id: accountId } : {}),
      },
    })

    if (accounts.length === 0) {
      return NextResponse.json({
        month,
        year,
        creditCards: [],
        totalTrackedExpenses: 0,
        totalCCPayments: 0,
        totalSpentButNotListed: 0,
        message: 'No credit card accounts found',
      })
    }

    const range = getMonthRange(year, month)

    // Get next month's range (for CC payment)
    const nextMonth = month === 12 ? 1 : month + 1
    const nextYear = month === 12 ? year + 1 : year
    const nextRange = getMonthRange(nextYear, nextMonth)

    const results = []
    let totalTracked = 0
    let totalPayments = 0

    for (const account of accounts) {
      // Get all transactions on this CC during the month
      const trackedExpenses = await prisma.transaction.findMany({
        where: {
          userId,
          accountId: account.id,
          date: {
            gte: range.start,
            lte: range.end,
          },
        },
      })

      const trackedAmount = sumAmounts(trackedExpenses.map(t => t.amount))

      // Get CC payments made in the NEXT month (these pay for current month charges)
      const ccPayments = await prisma.transaction.findMany({
        where: {
          userId,
          // Payment would be FROM a bank account TO the CC account
          // OR could be a transaction marked as "payment"
          date: {
            gte: nextRange.start,
            lte: nextRange.end,
          },
          // Look for transfers or payments (harder to identify without a payment field)
          // Alternative: sum of total charges the CC company reports
        },
      })

      // For CC tracking, we need to estimate what was charged based on statement
      // Since we don't have statement imports yet, we calculate based on:
      // - Tracked expenses on the CC + estimated SBNL
      // 
      // Better approach: Get CC transactions (from other accounts) that paid this card
      const paymentTransactions = await prisma.transaction.findMany({
        where: {
          userId,
          // Payments TO the credit card (reverse flow)
          description: {
            contains: account.name,
          },
          date: {
            gte: nextRange.start,
            lte: nextRange.end,
          },
        },
      })

      const paymentAmount = sumAmounts(paymentTransactions.map(t => t.amount))

      // SBNL = Total CC payment (next month) - Tracked expenses (this month)
      const sbnl = paymentAmount - trackedAmount

      totalTracked += trackedAmount
      totalPayments += paymentAmount

      results.push({
        accountId: account.id,
        accountName: account.name,
        trackedExpenses: trackedAmount,
        estimatedCCPayment: paymentAmount,
        spentButNotListed: sbnl,
        percentage: paymentAmount > 0 ? Math.round((sbnl / paymentAmount) * 100) : 0,
        transactionCount: trackedExpenses.length,
      })
    }

    return NextResponse.json({
      month,
      year,
      creditCards: results,
      totalTrackedExpenses: totalTracked,
      totalCCPayments: totalPayments,
      totalSpentButNotListed: totalPayments - totalTracked,
      percentageOfPayment: totalPayments > 0 ? Math.round(((totalPayments - totalTracked) / totalPayments) * 100) : 0,
      note: 'SBNL = (Total CC Payment) - (Tracked Expenses). Positive values indicate untracked discretionary spending.',
    })
  } catch (error) {
    console.error('Error calculating untracked spending:', error)
    return NextResponse.json(
      { error: 'Failed to calculate untracked spending' },
      { status: 500 }
    )
  }
}

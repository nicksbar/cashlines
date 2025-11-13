import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/db'

/**
 * POST /api/data/reset
 * Deletes all user data (accounts, income, transactions, rules, templates, people)
 * Protected: Only works if isProduction is false
 * 
 * Expects: x-household-id header with the household ID to reset
 */
export async function POST(request: NextRequest) {
  try {
    const householdId = request.headers.get('x-household-id')

    if (!householdId) {
      return NextResponse.json(
        { error: 'Missing household ID header' },
        { status: 400 }
      )
    }

    // Get the user/household
    const user = await prisma.user.findUnique({
      where: { id: householdId },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Household not found' },
        { status: 404 }
      )
    }

    // Check if user has production flag set
    if (user.isProduction) {
      return NextResponse.json(
        {
          error: 'Data reset is disabled for production accounts. Contact support to enable testing mode.',
          locked: true,
        },
        { status: 403 }
      )
    }

    // Delete all user data in correct order (respecting foreign keys)
    await prisma.split.deleteMany({
      where: {
        transaction: {
          userId: user.id,
        },
      },
    })

    await prisma.transaction.deleteMany({
      where: { userId: user.id },
    })

    await prisma.income.deleteMany({
      where: { userId: user.id },
    })

    await prisma.template.deleteMany({
      where: { userId: user.id },
    })

    await prisma.rule.deleteMany({
      where: { userId: user.id },
    })

    await prisma.recurringExpense.deleteMany({
      where: { userId: user.id },
    })

    await prisma.account.deleteMany({
      where: { userId: user.id },
    })

    await prisma.person.deleteMany({
      where: { userId: user.id },
    })

    await prisma.setting.deleteMany({
      where: { userId: user.id },
    })

    return NextResponse.json({
      success: true,
      message: 'All user data deleted successfully',
    })
  } catch (error) {
    console.error('Error resetting data:', error)
    return NextResponse.json(
      { error: 'Failed to reset data' },
      { status: 500 }
    )
  }
}

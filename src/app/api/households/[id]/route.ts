import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * DELETE /api/households/[id]
 * Delete a household and all associated data
 * Requires: x-household-id header
 * Only test households can be deleted (isProduction = false)
 * Cannot delete default household (user_1)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const householdId = request.headers.get('x-household-id')

    if (!householdId) {
      return NextResponse.json(
        { error: 'Missing household ID' },
        { status: 400 }
      )
    }

    const targetId = params.id

    // Find the household to delete
    const household = await prisma.user.findUnique({
      where: { id: targetId },
    })

    if (!household) {
      return NextResponse.json(
        { error: 'Household not found' },
        { status: 404 }
      )
    }

    // Prevent deleting production households
    if (household.isProduction) {
      return NextResponse.json(
        { error: 'Cannot delete production households' },
        { status: 403 }
      )
    }

    // Prevent deleting the default household
    if (targetId === 'user_1') {
      return NextResponse.json(
        { error: 'Cannot delete default household' },
        { status: 403 }
      )
    }

    // Delete all related data first (cascade)
    // Delete in order to respect foreign key constraints
    await Promise.all([
      // Delete transaction-related data
      prisma.transaction.deleteMany({ where: { userId: targetId } }),
      // Delete income-related data
      prisma.income.deleteMany({ where: { userId: targetId } }),
      // Delete recurring expenses
      prisma.recurringExpense.deleteMany({ where: { userId: targetId } }),
      // Delete rules
      prisma.rule.deleteMany({ where: { userId: targetId } }),
      // Delete templates
      prisma.template.deleteMany({ where: { userId: targetId } }),
      // Delete people/household members
      prisma.person.deleteMany({ where: { userId: targetId } }),
      // Delete balance snapshots
      prisma.balanceSnapshot.deleteMany({ where: { userId: targetId } }),
      // Delete accounts
      prisma.account.deleteMany({ where: { userId: targetId } }),
      // Delete settings
      prisma.setting.deleteMany({ where: { userId: targetId } }),
    ])

    // Now delete the household itself
    await prisma.user.delete({
      where: { id: targetId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting household:', error)
    return NextResponse.json(
      { error: 'Failed to delete household' },
      { status: 500 }
    )
  }
}

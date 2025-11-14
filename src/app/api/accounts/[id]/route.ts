import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { accountUpdateSchema } from '@/lib/validation'

/**
 * GET /api/accounts/[id]
 * Fetch a single account by ID
 * Requires: x-household-id header with the household ID
 */
export async function GET(
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

    const account = await prisma.account.findUnique({
      where: { id: params.id },
      include: {
        incomes: {
          orderBy: { date: 'desc' },
          take: 10,
        },
        transactions: {
          orderBy: { date: 'desc' },
          take: 10,
        },
      },
    })

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      )
    }

    // Verify account belongs to the requesting household
    if (account.userId !== householdId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    return NextResponse.json(account)
  } catch (error) {
    console.error('Error fetching account:', error)
    return NextResponse.json(
      { error: 'Failed to fetch account' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/accounts/[id]
 * Update an account
 * Requires: x-household-id header with the household ID
 */
export async function PATCH(
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

    // Verify account belongs to the requesting household
    const existingAccount = await prisma.account.findUnique({
      where: { id: params.id },
    })

    if (!existingAccount) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      )
    }

    if (existingAccount.userId !== householdId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validated = accountUpdateSchema.parse(body)

    const account = await prisma.account.update({
      where: { id: params.id },
      data: validated,
    })

    return NextResponse.json(account)
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      )
    }
    console.error('Error updating account:', error)
    return NextResponse.json(
      { error: 'Failed to update account' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/accounts/[id]
 * Delete an account
 * Requires: x-household-id header with the household ID
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

    // Verify account belongs to the requesting household
    const account = await prisma.account.findUnique({
      where: { id: params.id },
    })

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      )
    }

    if (account.userId !== householdId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Check if account has related data
    const incomeCount = await prisma.income.count({
      where: { accountId: params.id },
    })
    
    const txCount = await prisma.transaction.count({
      where: { accountId: params.id },
    })

    if (incomeCount > 0 || txCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete account with existing income or transactions' },
        { status: 400 }
      )
    }

    await prisma.account.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      )
    }
    console.error('Error deleting account:', error)
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    )
  }
}

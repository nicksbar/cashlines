import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * GET /api/transactions/[id]
 * Fetch a single transaction
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: params.id },
      include: {
        account: true,
        splits: true,
      },
    })

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(transaction)
  } catch (error) {
    console.error('Error fetching transaction:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transaction' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/transactions/[id]
 * Update a transaction (partial update)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    // Find existing transaction
    const existing = await prisma.transaction.findUnique({
      where: { id: params.id },
      include: { splits: true },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    // Build update data from provided fields
    const updateData: any = {}

    if (body.date !== undefined) updateData.date = new Date(body.date)
    if (body.amount !== undefined) updateData.amount = body.amount
    if (body.description !== undefined) updateData.description = body.description
    if (body.method !== undefined) updateData.method = body.method
    if (body.accountId !== undefined) updateData.accountId = body.accountId
    if (body.personId !== undefined) updateData.personId = body.personId
    if (body.notes !== undefined) updateData.notes = body.notes
    if (body.tags !== undefined) {
      updateData.tags = typeof body.tags === 'string' ? body.tags : JSON.stringify(body.tags)
    }

    // Handle splits if provided
    if (body.splits !== undefined) {
      // Delete existing splits
      await prisma.split.deleteMany({
        where: { transactionId: params.id },
      })

      // Create new splits
      updateData.splits = {
        create: body.splits.map((split: any) => ({
          type: split.type,
          target: split.target,
          amount: split.amount,
          percent: split.percent,
          notes: split.notes,
        })),
      }
    }

    const transaction = await prisma.transaction.update({
      where: { id: params.id },
      data: updateData,
      include: {
        account: true,
        splits: true,
      },
    })

    return NextResponse.json(transaction)
  } catch (error) {
    console.error('Error updating transaction:', error)
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/transactions/[id]
 * Delete a transaction (cascades to splits)
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.transaction.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }
    console.error('Error deleting transaction:', error)
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    )
  }
}

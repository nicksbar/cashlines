import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/db'
import { personUpdateSchema } from '@/src/lib/validation'

/**
 * GET /api/people/[id]
 * Fetch a single person by ID
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const person = await prisma.person.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            incomes: true,
            transactions: true,
          },
        },
      },
    })

    if (!person) {
      return NextResponse.json(
        { error: 'Person not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(person)
  } catch (error) {
    console.error('Error fetching person:', error)
    return NextResponse.json(
      { error: 'Failed to fetch person' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/people/[id]
 * Update a person
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validated = personUpdateSchema.parse(body)

    const person = await prisma.person.update({
      where: { id: params.id },
      data: validated,
    })

    return NextResponse.json(person)
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Person not found' },
        { status: 404 }
      )
    }
    console.error('Error updating person:', error)
    return NextResponse.json(
      { error: 'Failed to update person' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/people/[id]
 * Delete a person (reassigns income/transactions to null)
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // First, reassign all income and transactions to null (unassigned)
    await prisma.income.updateMany({
      where: { personId: params.id },
      data: { personId: null },
    })

    await prisma.transaction.updateMany({
      where: { personId: params.id },
      data: { personId: null },
    })

    // Then delete the person
    await prisma.person.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Person not found' },
        { status: 404 }
      )
    }
    console.error('Error deleting person:', error)
    return NextResponse.json(
      { error: 'Failed to delete person' },
      { status: 500 }
    )
  }
}

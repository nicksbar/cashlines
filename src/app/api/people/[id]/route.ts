import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { personUpdateSchema } from '@/lib/validation'

/**
 * GET /api/people/[id]
 * Fetch a single person by ID
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

    // Verify ownership
    if (person.userId !== householdId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
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

    // Verify ownership before updating
    const person = await prisma.person.findUnique({
      where: { id: params.id },
    })

    if (!person) {
      return NextResponse.json(
        { error: 'Person not found' },
        { status: 404 }
      )
    }

    if (person.userId !== householdId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validated = personUpdateSchema.parse(body)

    const updatedPerson = await prisma.person.update({
      where: { id: params.id },
      data: validated,
    })

    return NextResponse.json(updatedPerson)
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

    // Verify ownership before deleting
    const person = await prisma.person.findUnique({
      where: { id: params.id },
    })

    if (!person) {
      return NextResponse.json(
        { error: 'Person not found' },
        { status: 404 }
      )
    }

    if (person.userId !== householdId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

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

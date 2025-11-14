import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { personCreateSchema, personUpdateSchema } from '@/lib/validation'

/**
 * GET /api/people
 * Fetch all people for the current household
 * Requires: x-household-id header with the household ID
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

    const people = await prisma.person.findMany({
      where: { userId: householdId },
      orderBy: {
        createdAt: 'asc',
      },
      include: {
        _count: {
          select: {
            incomes: true,
            transactions: true,
          },
        },
      },
    })

    return NextResponse.json(people)
  } catch (error) {
    console.error('Error fetching people:', error)
    return NextResponse.json(
      { error: 'Failed to fetch people' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/people
 * Create a new person
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
    const validated = personCreateSchema.parse(body)

    const person = await prisma.person.create({
      data: {
        userId: householdId,
        name: validated.name,
        role: validated.role,
        color: validated.color,
      },
    })

    return NextResponse.json(person, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message.includes('unique constraint')) {
      return NextResponse.json(
        { error: 'Person with this name already exists for this user' },
        { status: 400 }
      )
    }
    console.error('Error creating person:', error)
    return NextResponse.json(
      { error: 'Failed to create person' },
      { status: 500 }
    )
  }
}

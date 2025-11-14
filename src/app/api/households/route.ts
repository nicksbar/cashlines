import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * GET /api/households
 * Fetch all households (users)
 */
export async function GET() {
  try {
    const households = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        isProduction: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    return NextResponse.json(households)
  } catch (error) {
    console.error('Error fetching households:', error)
    return NextResponse.json(
      { error: 'Failed to fetch households' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/households
 * Create a new household
 */
export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json()

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Household name is required' },
        { status: 400 }
      )
    }

    // Generate email from name
    const email = `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}@cashlines.local`

    const household = await prisma.user.create({
      data: {
        email,
        name,
        isProduction: false,
      },
      select: {
        id: true,
        email: true,
        name: true,
        isProduction: true,
      },
    })

    return NextResponse.json(household)
  } catch (error) {
    console.error('Error creating household:', error)
    return NextResponse.json(
      { error: 'Failed to create household' },
      { status: 500 }
    )
  }
}

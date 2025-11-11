import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/db'
import { accountCreateSchema, accountUpdateSchema } from '@/src/lib/validation'
import { getErrorMessage } from '@/src/lib/utils'

/**
 * GET /api/accounts
 * Fetch all accounts for the current user
 * For now, assumes single user (demo@cashlines.local)
 */
export async function GET() {
  try {
    // TODO: Get actual user from session/auth
    const userId = 'demo-user-id'
    
    const accounts = await prisma.account.findMany({
      where: {
        // For now, filter is commented - in production, filter by authenticated user
        // userId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    return NextResponse.json(accounts)
  } catch (error) {
    console.error('Error fetching accounts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch accounts' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/accounts
 * Create a new account
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const validated = accountCreateSchema.parse(body)
    
    // TODO: Get actual user from session/auth
    const users = await prisma.user.findMany()
    const userId = users[0]?.id

    if (!userId) {
      return NextResponse.json(
        { error: 'No user found' },
        { status: 400 }
      )
    }

    const account = await prisma.account.create({
      data: {
        userId,
        name: validated.name,
        type: validated.type,
        isActive: validated.isActive,
        notes: validated.notes,
      },
    })

    return NextResponse.json(account, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message.includes('unique constraint')) {
      return NextResponse.json(
        { error: 'Account with this name already exists' },
        { status: 400 }
      )
    }
    console.error('Error creating account:', error)
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}

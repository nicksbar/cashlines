import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/db'
import { ruleCreateSchema, ruleUpdateSchema } from '@/src/lib/validation'

/**
 * GET /api/rules
 * Fetch all routing rules
 */
export async function GET() {
  try {
    // TODO: Get actual user from session
    const users = await prisma.user.findMany()
    const userId = users[0]?.id

    if (!userId) {
      return NextResponse.json(
        { error: 'No user found' },
        { status: 400 }
      )
    }

    const rules = await prisma.rule.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    // Parse splitConfig for each rule
    const rulesWithParsed = rules.map(rule => ({
      ...rule,
      splitConfig: JSON.parse(rule.splitConfig),
      matchTags: rule.matchTags ? JSON.parse(rule.matchTags) : [],
    }))

    return NextResponse.json(rulesWithParsed)
  } catch (error) {
    console.error('Error fetching rules:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rules' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/rules
 * Create a new routing rule
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = ruleCreateSchema.parse(body)

    // TODO: Get actual user from session
    const users = await prisma.user.findMany()
    const userId = users[0]?.id

    if (!userId) {
      return NextResponse.json(
        { error: 'No user found' },
        { status: 400 }
      )
    }

    const rule = await prisma.rule.create({
      data: {
        userId,
        name: validated.name,
        matchSource: validated.matchSource,
        matchDescription: validated.matchDescription,
        matchAccountId: validated.matchAccountId,
        matchMethod: validated.matchMethod,
        matchTags: validated.matchTags.length > 0 ? JSON.stringify(validated.matchTags) : null,
        splitConfig: JSON.stringify(validated.splitConfig),
        isActive: validated.isActive,
        notes: validated.notes,
      },
    })

    return NextResponse.json(
      {
        ...rule,
        splitConfig: JSON.parse(rule.splitConfig),
        matchTags: rule.matchTags ? JSON.parse(rule.matchTags) : [],
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating rule:', error)
    return NextResponse.json(
      { error: 'Failed to create rule' },
      { status: 500 }
    )
  }
}

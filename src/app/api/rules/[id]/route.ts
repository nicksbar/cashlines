import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/db'
import { ruleUpdateSchema } from '@/src/lib/validation'

/**
 * GET /api/rules/[id]
 * Fetch a single rule
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const rule = await prisma.rule.findUnique({
      where: { id: params.id },
    })

    if (!rule) {
      return NextResponse.json(
        { error: 'Rule not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ...rule,
      splitConfig: JSON.parse(rule.splitConfig),
      matchTags: rule.matchTags ? JSON.parse(rule.matchTags) : [],
    })
  } catch (error) {
    console.error('Error fetching rule:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rule' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/rules/[id]
 * Update a rule
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validated = ruleUpdateSchema.parse(body)

    const updateData: any = {}
    
    if (validated.name) updateData.name = validated.name
    if (validated.matchSource !== undefined) updateData.matchSource = validated.matchSource
    if (validated.matchDescription !== undefined) updateData.matchDescription = validated.matchDescription
    if (validated.matchAccountId !== undefined) updateData.matchAccountId = validated.matchAccountId
    if (validated.matchMethod !== undefined) updateData.matchMethod = validated.matchMethod
    if (validated.matchTags) updateData.matchTags = JSON.stringify(validated.matchTags)
    if (validated.splitConfig) updateData.splitConfig = JSON.stringify(validated.splitConfig)
    if (validated.isActive !== undefined) updateData.isActive = validated.isActive
    if (validated.notes !== undefined) updateData.notes = validated.notes

    const rule = await prisma.rule.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json({
      ...rule,
      splitConfig: JSON.parse(rule.splitConfig),
      matchTags: rule.matchTags ? JSON.parse(rule.matchTags) : [],
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Rule not found' },
        { status: 404 }
      )
    }
    console.error('Error updating rule:', error)
    return NextResponse.json(
      { error: 'Failed to update rule' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/rules/[id]
 * Delete a rule
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.rule.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Rule not found' },
        { status: 404 }
      )
    }
    console.error('Error deleting rule:', error)
    return NextResponse.json(
      { error: 'Failed to delete rule' },
      { status: 500 }
    )
  }
}

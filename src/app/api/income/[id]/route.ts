import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { incomeUpdateSchema } from '@/lib/validation'

/**
 * GET /api/income/[id]
 * Fetch a single income entry
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const income = await prisma.income.findUnique({
      where: { id: params.id },
    })

    if (!income) {
      return NextResponse.json(
        { error: 'Income entry not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(income)
  } catch (error) {
    console.error('Error fetching income:', error)
    return NextResponse.json(
      { error: 'Failed to fetch income' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/income/[id]
 * Update an income entry
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validated = incomeUpdateSchema.parse(body)

    const data: any = {}
    if (validated.date !== undefined) data.date = validated.date
    if (validated.grossAmount !== undefined) data.grossAmount = validated.grossAmount
    if (validated.taxes !== undefined) data.taxes = validated.taxes
    if (validated.preTaxDeductions !== undefined) data.preTaxDeductions = validated.preTaxDeductions
    if (validated.postTaxDeductions !== undefined) data.postTaxDeductions = validated.postTaxDeductions
    if (validated.netAmount !== undefined) data.netAmount = validated.netAmount
    if (validated.source !== undefined) data.source = validated.source
    if (validated.accountId !== undefined) data.accountId = validated.accountId
    if (validated.personId !== undefined) data.personId = validated.personId
    if (validated.notes !== undefined) data.notes = validated.notes
    if (validated.tags !== undefined) data.tags = JSON.stringify(validated.tags)

    const income = await prisma.income.update({
      where: { id: params.id },
      data,
    })

    return NextResponse.json(income)
  } catch (error) {
    console.error('Error updating income:', error)
    return NextResponse.json(
      { error: 'Failed to update income' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/income/[id]
 * Delete an income entry
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.income.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Income entry not found' },
        { status: 404 }
      )
    }
    console.error('Error deleting income:', error)
    return NextResponse.json(
      { error: 'Failed to delete income' },
      { status: 500 }
    )
  }
}


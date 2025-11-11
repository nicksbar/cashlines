import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = searchParams.get('limit')
    const offset = searchParams.get('offset')

    const income = await prisma.income.findMany({
      orderBy: {
        date: 'desc',
      },
      take: limit ? parseInt(limit) : undefined,
      skip: offset ? parseInt(offset) : undefined,
    })

    return NextResponse.json(income)
  } catch (error) {
    console.error('Error fetching income:', error)
    return NextResponse.json(
      { error: 'Failed to fetch income' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const income = await prisma.income.create({
      data: {
        description: body.description,
        amount: parseFloat(body.amount),
        date: new Date(body.date),
        source: body.source || null,
        isTaxRelated: body.isTaxRelated || false,
        taxCategory: body.taxCategory || null,
        notes: body.notes || null,
      },
    })

    return NextResponse.json(income, { status: 201 })
  } catch (error) {
    console.error('Error creating income:', error)
    return NextResponse.json(
      { error: 'Failed to create income' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Income ID is required' },
        { status: 400 }
      )
    }

    await prisma.income.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting income:', error)
    return NextResponse.json(
      { error: 'Failed to delete income' },
      { status: 500 }
    )
  }
}

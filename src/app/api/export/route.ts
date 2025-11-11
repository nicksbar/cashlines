import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') || 'all'

    let csvData = ''

    if (type === 'transactions' || type === 'all') {
      const transactions = await prisma.transaction.findMany({
        orderBy: { date: 'desc' },
      })

      csvData += 'Type,Date,Description,Amount,Transaction Type,Routing,Category,Tax Related,Tax Category,Notes\n'
      transactions.forEach(t => {
        csvData += `Transaction,${t.date.toISOString()},${escapeCSV(t.description)},${t.amount},${t.type},${t.routing},${escapeCSV(t.category || '')},${t.isTaxRelated},${escapeCSV(t.taxCategory || '')},${escapeCSV(t.notes || '')}\n`
      })
    }

    if (type === 'income' || type === 'all') {
      const income = await prisma.income.findMany({
        orderBy: { date: 'desc' },
      })

      if (type === 'income') {
        csvData += 'Type,Date,Description,Amount,Source,Tax Related,Tax Category,Notes\n'
      }

      income.forEach(i => {
        csvData += `Income,${i.date.toISOString()},${escapeCSV(i.description)},${i.amount},${escapeCSV(i.source || '')},${i.isTaxRelated},${escapeCSV(i.taxCategory || '')},${escapeCSV(i.notes || '')}\n`
      })
    }

    return new NextResponse(csvData, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="cashlines-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error('Error exporting data:', error)
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    )
  }
}

function escapeCSV(str: string): string {
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

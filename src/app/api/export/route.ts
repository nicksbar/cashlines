import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') || 'all'

    // TODO: Get actual user from session
    const users = await prisma.user.findMany()
    const userId = users[0]?.id

    if (!userId) {
      return NextResponse.json(
        { error: 'No user found' },
        { status: 400 }
      )
    }

    let csvData = ''

    if (type === 'transactions' || type === 'all') {
      const transactions = await prisma.transaction.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        include: { account: true, splits: true },
      })

      csvData += 'Type,Date,Description,Amount,Method,Account,Tags,Splits\n'
      transactions.forEach((t: any) => {
        const splitsStr = t.splits
          .map((s: any) => `${s.type}:${s.target}:${s.amount || s.percent + '%'}`)
          .join('|')
        csvData += `Transaction,${t.date.toISOString()},${escapeCSV(t.description)},${t.amount},${t.method},${t.account.name},${escapeCSV(t.tags)},${escapeCSV(splitsStr)}\n`
      })
    }

    if (type === 'income' || type === 'all') {
      const incomes = await prisma.income.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        include: { account: true },
      })

      if (type === 'income') {
        csvData += 'Type,Date,Source,Amount,Account,Tags,Notes\n'
      }

      incomes.forEach((i: any) => {
        csvData += `Income,${i.date.toISOString()},${escapeCSV(i.source || '')},${i.amount},${i.account.name},${escapeCSV(i.tags)},${escapeCSV(i.notes || '')}\n`
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

function escapeCSV(str: string | null | undefined): string {
  if (!str) return ''
  const strVal = String(str)
  if (strVal.includes(',') || strVal.includes('"') || strVal.includes('\n')) {
    return `"${strVal.replace(/"/g, '""')}"`
  }
  return strVal
}

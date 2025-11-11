'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { useState, useEffect } from 'react'
import { formatCurrency } from '@/src/lib/money'
import { formatDate } from '@/src/lib/date'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useUser } from '@/src/lib/UserContext'

interface Person {
  id: string
  name: string
  role?: string
  color?: string
}

interface Income {
  id: string
  date: string
  source: string
  grossAmount: number
  netAmount: number
  taxes: number
  accountId: string
  account: {
    name: string
  }
}

interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  accountId: string
  account: {
    name: string
  }
}

export default function PersonDashboard({ params }: { params: { id: string } }) {
  const { currentHousehold } = useUser()
  const [person, setPerson] = useState<Person | null>(null)
  const [income, setIncome] = useState<Income[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (currentHousehold) {
      fetchData()
    }
  }, [params.id, currentHousehold?.id])

  const fetchData = async () => {
    if (!currentHousehold) return
    
    try {
      setLoading(true)
      const headers = { 'x-household-id': currentHousehold.id }

      // Fetch person details
      const personRes = await fetch(`/api/people/${params.id}`, { headers })
      if (personRes.ok) {
        setPerson(await personRes.json())
      }

      // Fetch all income entries and filter by personId
      const incomeRes = await fetch('/api/income', { headers })
      if (incomeRes.ok) {
        const allIncome = await incomeRes.json()
        const personIncome = allIncome.filter((entry: any) => entry.personId === params.id)
        setIncome(personIncome)
      }

      // Fetch all transactions and filter by personId
      const txRes = await fetch('/api/transactions', { headers })
      if (txRes.ok) {
        const allTransactions = await txRes.json()
        const personTx = allTransactions.filter((entry: any) => entry.personId === params.id)
        setTransactions(personTx)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/people" className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
            <ArrowLeft className="w-4 h-4" />
            Back to People
          </Link>
        </div>
        <div className="flex items-center justify-center h-32">
          <p className="text-slate-500">Loading...</p>
        </div>
      </div>
    )
  }

  if (!person) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/people" className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
            <ArrowLeft className="w-4 h-4" />
            Back to People
          </Link>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-slate-500">Person not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Calculate metrics
  const totalIncome = income.reduce((sum, entry) => sum + entry.grossAmount, 0)
  const totalNetIncome = income.reduce((sum, entry) => sum + entry.netAmount, 0)
  const totalTaxes = income.reduce((sum, entry) => sum + entry.taxes, 0)
  const totalExpenses = transactions.reduce((sum, entry) => sum + entry.amount, 0)
  const incomeCount = income.length
  const transactionCount = transactions.length
  const averageTransaction = transactionCount > 0 ? totalExpenses / transactionCount : 0

  // Group transactions by type
  const expensesByType: Record<string, number> = {}
  transactions.forEach((tx) => {
    if (!expensesByType[tx.account.name]) {
      expensesByType[tx.account.name] = 0
    }
    expensesByType[tx.account.name] += tx.amount
  })

  // Recent activities
  const allActivities = [
    ...income.map((entry) => ({
      type: 'income',
      date: entry.date,
      description: `Income: ${entry.source}`,
      amount: entry.grossAmount,
    })),
    ...transactions.map((tx) => ({
      type: 'transaction',
      date: tx.date,
      description: `Transaction: ${tx.description}`,
      amount: -tx.amount,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <Link href="/people" className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
          <ArrowLeft className="w-4 h-4" />
          Back to People
        </Link>
        
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full"
            style={{ backgroundColor: person.color || '#4ECDC4' }}
          />
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{person.name}</h1>
            {person.role && (
              <p className="text-slate-600 dark:text-slate-400 capitalize">{person.role}</p>
            )}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Total Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(totalIncome)}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {incomeCount} {incomeCount === 1 ? 'entry' : 'entries'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Net Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(totalNetIncome)}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              After deductions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(totalExpenses)}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {transactionCount} {transactionCount === 1 ? 'transaction' : 'transactions'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Net Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${totalNetIncome - totalExpenses >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {formatCurrency(totalNetIncome - totalExpenses)}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Income minus expenses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Taxes and Breakdown */}
      {incomeCount > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Income Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600 dark:text-slate-400">Gross Income</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {formatCurrency(totalIncome)}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Taxes</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">
                    -{formatCurrency(totalTaxes)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Net Income</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {formatCurrency(totalNetIncome)}
                  </span>
                </div>
              </div>

              {totalIncome > 0 && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
                  <p>Effective Tax Rate: {((totalTaxes / totalIncome) * 100).toFixed(1)}%</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Expenses by Account</CardTitle>
              <CardDescription>Total spending per account</CardDescription>
            </CardHeader>
            <CardContent>
              {Object.entries(expensesByType).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(expensesByType)
                    .sort(([, a], [, b]) => b - a)
                    .map(([account, amount]) => (
                      <div key={account}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-600 dark:text-slate-400">{account}</span>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {formatCurrency(amount)}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                          <div
                            className="bg-red-500 h-1.5 rounded-full"
                            style={{
                              width: `${(amount / totalExpenses) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-slate-500 dark:text-slate-400 text-sm">No expenses recorded</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Last 10 transactions and income entries</CardDescription>
        </CardHeader>
        <CardContent>
          {allActivities.length > 0 ? (
            <div className="space-y-3">
              {allActivities.map((activity, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {activity.description}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatDate(activity.date)}
                    </p>
                  </div>
                  <p className={`font-semibold ${activity.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {activity.amount > 0 ? '+' : ''}{formatCurrency(activity.amount)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 dark:text-slate-400 text-sm">No activity yet</p>
          )}
        </CardContent>
      </Card>

      {/* Income List */}
      {incomeCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Income Entries</CardTitle>
            <CardDescription>{incomeCount} total income entries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-2 px-2 text-slate-900 dark:text-slate-100">Date</th>
                    <th className="text-left py-2 px-2 text-slate-900 dark:text-slate-100">Source</th>
                    <th className="text-left py-2 px-2 text-slate-900 dark:text-slate-100">Account</th>
                    <th className="text-right py-2 px-2 text-slate-900 dark:text-slate-100">Gross</th>
                    <th className="text-right py-2 px-2 text-slate-900 dark:text-slate-100">Taxes</th>
                    <th className="text-right py-2 px-2 text-slate-900 dark:text-slate-100">Net</th>
                  </tr>
                </thead>
                <tbody>
                  {income.map((entry) => (
                    <tr key={entry.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <td className="py-3 px-2 text-slate-900 dark:text-slate-100">{formatDate(entry.date)}</td>
                      <td className="py-3 px-2 font-medium text-slate-900 dark:text-slate-100">{entry.source}</td>
                      <td className="py-3 px-2 text-slate-600 dark:text-slate-400">{entry.account.name}</td>
                      <td className="py-3 px-2 text-right font-semibold text-green-600 dark:text-green-400">
                        {formatCurrency(entry.grossAmount)}
                      </td>
                      <td className="py-3 px-2 text-right text-red-600 dark:text-red-400">
                        {formatCurrency(entry.taxes)}
                      </td>
                      <td className="py-3 px-2 text-right font-semibold text-blue-600 dark:text-blue-400">
                        {formatCurrency(entry.netAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transactions List */}
      {transactionCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
            <CardDescription>{transactionCount} total transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-2 px-2 text-slate-900 dark:text-slate-100">Date</th>
                    <th className="text-left py-2 px-2 text-slate-900 dark:text-slate-100">Description</th>
                    <th className="text-left py-2 px-2 text-slate-900 dark:text-slate-100">Account</th>
                    <th className="text-right py-2 px-2 text-slate-900 dark:text-slate-100">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <td className="py-3 px-2 text-slate-900 dark:text-slate-100">{formatDate(tx.date)}</td>
                      <td className="py-3 px-2 font-medium text-slate-900 dark:text-slate-100">{tx.description}</td>
                      <td className="py-3 px-2 text-slate-600 dark:text-slate-400">{tx.account.name}</td>
                      <td className="py-3 px-2 text-right font-semibold text-red-600 dark:text-red-400">
                        {formatCurrency(tx.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Select } from '@/src/components/ui/select'
import { TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import { formatCurrency } from '@/src/lib/money'
import { formatMonth, getCurrentMonthYear, getMonthsInRange } from '@/src/lib/date'

interface Summary {
  month: number
  year: number
  totalIncome: number
  totalExpense: number
  byMethod: Record<string, number>
  routingSummary: Record<string, Record<string, number>>
  taxTotal: number
  transactionCount: number
  incomeCount: number
}

export default function Dashboard() {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState(getCurrentMonthYear().month)
  const [year, setYear] = useState(getCurrentMonthYear().year)
  const months = getMonthsInRange(year - 1, 1, year, 12)

  useEffect(() => {
    fetchSummary()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year])

  const fetchSummary = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/reports/summary?month=${month}&year=${year}`)
      if (!response.ok) throw new Error('Failed to fetch summary')
      const data = await response.json()
      setSummary(data)
    } catch (error) {
      console.error('Error fetching summary:', error)
    } finally {
      setLoading(false)
    }
  }

  const monthOptions = months.map((m) => ({
    label: formatMonth(m.year, m.month),
    value: `${m.year}-${m.month}`,
  }))

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-slate-500">Loading...</p>
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-slate-500">No data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-2">Track your money, not budgets</p>
      </div>

      {/* Month Selector */}
      <div className="flex gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Select Month
          </label>
          <select
            value={`${year}-${month}`}
            onChange={(e) => {
              const [y, m] = e.target.value.split('-')
              setYear(parseInt(y))
              setMonth(parseInt(m))
            }}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {monthOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <ArrowDownLeft className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.totalIncome)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {summary.incomeCount} entries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(summary.totalExpense)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {summary.transactionCount} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.totalIncome - summary.totalExpense >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {formatCurrency(summary.totalIncome - summary.totalExpense)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tax Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(summary.taxTotal)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Method Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Expenses by Method</CardTitle>
          <CardDescription>How you spent money this month</CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(summary.byMethod).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(summary.byMethod).map(([method, amount]) => (
                <div key={method} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600 capitalize">
                    {method === 'cc' ? 'Credit Card' : method === 'ach' ? 'ACH Transfer' : method}
                  </span>
                  <span className="text-lg font-semibold text-slate-900">
                    {formatCurrency(amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No transactions this month</p>
          )}
        </CardContent>
      </Card>

      {/* Routing Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Routing Summary</CardTitle>
          <CardDescription>How money was categorized</CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(summary.routingSummary).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(summary.routingSummary).map(([type, targets]) => (
                <div key={type}>
                  <h4 className="text-sm font-semibold text-slate-900 capitalize mb-2">
                    {type}
                  </h4>
                  <div className="space-y-2 ml-4">
                    {Object.entries(targets).map(([target, amount]) => (
                      <div key={target} className="flex justify-between text-sm">
                        <span className="text-slate-600">{target}</span>
                        <span className="font-medium text-slate-900">
                          {formatCurrency(amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No splits configured</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

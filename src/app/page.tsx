'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Select } from '@/src/components/ui/select'
import { TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownLeft, Percent, Target } from 'lucide-react'
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
  const [prevSummary, setPrevSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState(getCurrentMonthYear().month)
  const [year, setYear] = useState(getCurrentMonthYear().year)
  const months = getMonthsInRange(year - 1, 1, year, 12)

  useEffect(() => {
    fetchSummaries()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year])

  const fetchSummaries = async () => {
    try {
      setLoading(true)
      // Fetch current month
      const response = await fetch(`/api/reports/summary?month=${month}&year=${year}`)
      if (!response.ok) throw new Error('Failed to fetch summary')
      const data = await response.json()
      setSummary(data)

      // Fetch previous month for comparison
      let prevMonth = month - 1
      let prevYear = year
      if (prevMonth < 1) {
        prevMonth = 12
        prevYear--
      }
      const prevResponse = await fetch(`/api/reports/summary?month=${prevMonth}&year=${prevYear}`)
      if (prevResponse.ok) {
        const prevData = await prevResponse.json()
        setPrevSummary(prevData)
      }
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

  // Calculate useful metrics
  const netBalance = summary.totalIncome - summary.totalExpense
  const savingsRate = summary.totalIncome > 0 ? (netBalance / summary.totalIncome) * 100 : 0
  const expenseRatio = summary.totalIncome > 0 ? (summary.totalExpense / summary.totalIncome) * 100 : 0
  const taxRate = summary.totalIncome > 0 ? (summary.taxTotal / summary.totalIncome) * 100 : 0
  const avgTransaction = summary.transactionCount > 0 ? summary.totalExpense / summary.transactionCount : 0
  const avgIncome = summary.incomeCount > 0 ? summary.totalIncome / summary.incomeCount : 0
  
  // Calculate total allocations by type
  const allocationsByType: Record<string, number> = {}
  Object.entries(summary.routingSummary).forEach(([type, targets]) => {
    allocationsByType[type] = Object.values(targets).reduce((sum, val) => sum + val, 0)
  })

  // Month-to-month comparison
  const incomeChange = prevSummary ? summary.totalIncome - prevSummary.totalIncome : 0
  const expenseChange = prevSummary ? summary.totalExpense - prevSummary.totalExpense : 0
  const incomeChangePercent = prevSummary && prevSummary.totalIncome > 0 ? (incomeChange / prevSummary.totalIncome) * 100 : 0
  const expenseChangePercent = prevSummary && prevSummary.totalExpense > 0 ? (expenseChange / prevSummary.totalExpense) * 100 : 0

  // Payment method breakdown with percentages
  const methodEntries = Object.entries(summary.byMethod)
  const ccExpense = summary.byMethod['cc'] || 0
  const cashExpense = summary.byMethod['cash'] || 0
  const achExpense = summary.byMethod['ach'] || 0

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

      {/* Summary Cards - Main Metrics */}
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
              {summary.incomeCount} entries · Avg: {formatCurrency(avgIncome)}
            </p>
            {prevSummary && incomeChange !== 0 && (
              <p className={`text-xs mt-1 font-semibold ${incomeChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {incomeChange >= 0 ? '↑' : '↓'} {formatCurrency(Math.abs(incomeChange))} ({incomeChangePercent.toFixed(1)}%)
              </p>
            )}
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
              {summary.transactionCount} txns · Avg: {formatCurrency(avgTransaction)}
            </p>
            {prevSummary && expenseChange !== 0 && (
              <p className={`text-xs mt-1 font-semibold ${expenseChange <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {expenseChange >= 0 ? '↑' : '↓'} {formatCurrency(Math.abs(expenseChange))} ({expenseChangePercent.toFixed(1)}%)
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {formatCurrency(netBalance)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {savingsRate.toFixed(1)}% savings rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expense Ratio</CardTitle>
            <Percent className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {expenseRatio.toFixed(1)}%
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Tax: {taxRate.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Method Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method Breakdown</CardTitle>
          <CardDescription>Expenses by payment method and compared to total</CardDescription>
        </CardHeader>
        <CardContent>
          {methodEntries.length > 0 ? (
            <div className="space-y-4">
              {methodEntries.map(([method, amount]) => {
                const percent = summary.totalExpense > 0 ? (amount / summary.totalExpense) * 100 : 0
                const label = method === 'cc' ? 'Credit Card' : method === 'ach' ? 'ACH Transfer' : method.charAt(0).toUpperCase() + method.slice(1)
                return (
                  <div key={method}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-700">{label}</span>
                      <span className="text-sm font-semibold text-slate-900">
                        {formatCurrency(amount)} ({percent.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          method === 'cc' ? 'bg-blue-500' : method === 'cash' ? 'bg-green-500' : 'bg-purple-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No transactions this month</p>
          )}
        </CardContent>
      </Card>

      {/* Routing Summary with Details */}
      <Card>
        <CardHeader>
          <CardTitle>Money Allocation Summary</CardTitle>
          <CardDescription>How expenses were categorized and allocated</CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(allocationsByType).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(allocationsByType)
                .sort(([, a], [, b]) => b - a)
                .map(([type, total]) => {
                  const percent = summary.totalExpense > 0 ? (total / summary.totalExpense) * 100 : 0
                  const targets = summary.routingSummary[type] || {}
                  return (
                    <div key={type}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-slate-900 capitalize">
                          {type}
                        </h4>
                        <div className="text-right">
                          <div className="font-semibold text-slate-900">
                            {formatCurrency(total)}
                          </div>
                          <div className="text-xs text-slate-500">
                            {percent.toFixed(1)}% of expenses
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 mb-3">
                        <div
                          className={`h-2 rounded-full ${
                            type === 'need' ? 'bg-blue-500' :
                            type === 'want' ? 'bg-green-500' :
                            type === 'debt' ? 'bg-red-500' :
                            type === 'tax' ? 'bg-orange-500' :
                            type === 'savings' ? 'bg-purple-500' :
                            'bg-slate-500'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="space-y-1 ml-2">
                        {Object.entries(targets)
                          .sort(([, a], [, b]) => b - a)
                          .map(([target, amount]) => (
                            <div key={target} className="flex justify-between text-xs text-slate-600">
                              <span>{target}</span>
                              <span className="font-medium">{formatCurrency(amount)}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )
                })}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No allocations configured</p>
          )}
        </CardContent>
      </Card>

      {/* Key Ratios Card */}
      <Card>
        <CardHeader>
          <CardTitle>Key Financial Ratios</CardTitle>
          <CardDescription>Important metrics for money tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-600">Savings Rate</p>
              <p className="text-2xl font-bold text-slate-900">{savingsRate.toFixed(1)}%</p>
              <p className="text-xs text-slate-500">Income after expenses</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-600">Expense Ratio</p>
              <p className="text-2xl font-bold text-slate-900">{expenseRatio.toFixed(1)}%</p>
              <p className="text-xs text-slate-500">Expenses vs income</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-600">Tax Rate</p>
              <p className="text-2xl font-bold text-slate-900">{taxRate.toFixed(1)}%</p>
              <p className="text-xs text-slate-500">Taxes vs gross income</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-600">CC vs Total Spend</p>
              <p className="text-2xl font-bold text-slate-900">
                {summary.totalExpense > 0 ? ((ccExpense / summary.totalExpense) * 100).toFixed(1) : '0'}%
              </p>
              <p className="text-xs text-slate-500">{formatCurrency(ccExpense)} on credit card</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-600">Cash vs Total Spend</p>
              <p className="text-2xl font-bold text-slate-900">
                {summary.totalExpense > 0 ? ((cashExpense / summary.totalExpense) * 100).toFixed(1) : '0'}%
              </p>
              <p className="text-xs text-slate-500">{formatCurrency(cashExpense)} in cash</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-600">Transaction Frequency</p>
              <p className="text-2xl font-bold text-slate-900">{summary.transactionCount}</p>
              <p className="text-xs text-slate-500">transactions this month</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

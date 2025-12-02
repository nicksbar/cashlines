'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownLeft, Percent, Target, CreditCard } from 'lucide-react'
import { formatCurrency } from '@/lib/money'
import { formatMonth, getCurrentMonthYear, getMonthsInRange } from '@/lib/date'
import { useUser } from '@/lib/UserContext'
import { RecurringExpensesForecast } from '@/components/RecurringExpensesForecast'
import { DateRangeSelector, type DateRange as DateRangeValue } from '@/components/DateRangeSelector'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { analyzePayments, type PaymentAnalysis } from '@/lib/financial-analysis'

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

interface Person {
  id: string
  name: string
  role?: string
  color?: string
}

export default function Dashboard() {
  const { currentHousehold } = useUser()
  const [summary, setSummary] = useState<Summary | null>(null)
  const [prevSummary, setPrevSummary] = useState<Summary | null>(null)
  const [people, setPeople] = useState<Person[]>([])
  const [personMetrics, setPersonMetrics] = useState<Record<string, { income: number; expenses: number }>>({})
  const [paymentAnalysis, setPaymentAnalysis] = useState<PaymentAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<DateRangeValue>({
    type: 'month',
    startDate: (() => {
      const now = new Date()
      return new Date(now.getFullYear(), now.getMonth(), 1)
    })(),
    endDate: (() => {
      const now = new Date()
      return new Date(now.getFullYear(), now.getMonth() + 1, 0)
    })(),
    label: '',
  })
  const months = getMonthsInRange(new Date().getFullYear() - 1, 1, new Date().getFullYear(), 12)

  // Convert date range to months for API calls
  const getMonthsFromDateRange = (start: Date, end: Date) => {
    const months = []
    const current = new Date(start)
    while (current <= end) {
      months.push({ month: current.getMonth() + 1, year: current.getFullYear() })
      current.setMonth(current.getMonth() + 1)
    }
    return months
  }

  useEffect(() => {
    if (currentHousehold) {
      fetchSummaries()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange, currentHousehold?.id])

  const fetchSummaries = async () => {
    if (!currentHousehold) return

    try {
      setLoading(true)
      const headers = { 'x-household-id': currentHousehold.id }

      // Calculate months for current date range
      const rangeMonths = getMonthsFromDateRange(dateRange.startDate, dateRange.endDate)

      // Fetch summaries for all months in range
      const summaries = await Promise.all(
        rangeMonths.map(m => fetch(`/api/reports/summary?month=${m.month}&year=${m.year}`, { headers }).then(r => r.ok ? r.json() : null))
      )

      // Aggregate all summaries
      const aggregated = summaries.reduce((acc, s) => {
        if (!s) return acc
        return {
          month: s.month,
          year: s.year,
          totalIncome: acc.totalIncome + (s.totalIncome || 0),
          totalExpense: acc.totalExpense + (s.totalExpense || 0),
          byMethod: {
            ...acc.byMethod,
            ...(Object.entries(s.byMethod || {}).reduce((m: any, [key, val]) => {
              m[key] = (acc.byMethod[key] || 0) + (val || 0)
              return m
            }, {}))
          },
          routingSummary: {
            ...acc.routingSummary,
            ...(Object.entries(s.routingSummary || {}).reduce((rs: any, [type, targets]) => {
              if (!rs[type]) rs[type] = {}
              Object.entries((targets as Record<string, number>) || {}).forEach(([target, val]) => {
                rs[type][target] = (rs[type][target] || 0) + (val || 0)
              })
              return rs
            }, {}))
          },
          taxTotal: acc.taxTotal + (s.taxTotal || 0),
          transactionCount: acc.transactionCount + (s.transactionCount || 0),
          incomeCount: acc.incomeCount + (s.incomeCount || 0),
        }
      }, {
        month: 0,
        year: 0,
        totalIncome: 0,
        totalExpense: 0,
        byMethod: {},
        routingSummary: {},
        taxTotal: 0,
        transactionCount: 0,
        incomeCount: 0,
      } as Summary)

      setSummary(aggregated)
      setPrevSummary(null) // Don't show comparison for ranges

      // Fetch people and calculate their metrics
      const peopleRes = await fetch('/api/people', { headers })
      if (peopleRes.ok) {
        const peopleData = await peopleRes.json()
        setPeople(peopleData)

        // Build query params for date filtering
        const queryParams = rangeMonths.map(m => `month=${m.month}&year=${m.year}`).join('&')

        // Fetch all income and transactions with date filtering
        const [incomeRes, txRes] = await Promise.all([
          fetch(`/api/income?${queryParams}`, { headers }),
          fetch(`/api/transactions?${queryParams}`, { headers }),
        ])

        const incomeData = incomeRes.ok ? await incomeRes.json() : []
        const txData = txRes.ok ? await txRes.json() : []

        // Calculate metrics per person
        const metrics: Record<string, { income: number; expenses: number }> = {}
        peopleData.forEach((p: Person) => {
          metrics[p.id] = { income: 0, expenses: 0 }
        })

        // Sum income by person
        incomeData.forEach((entry: any) => {
          if (entry.personId && metrics[entry.personId]) {
            metrics[entry.personId].income += entry.netAmount || 0
          }
        })

        // Sum expenses by person
        txData.forEach((entry: any) => {
          if (entry.personId && metrics[entry.personId]) {
            metrics[entry.personId].expenses += entry.amount || 0
          }
        })

        setPersonMetrics(metrics)
        
        // Fetch accounts for payment analysis
        const accountsRes = await fetch('/api/accounts', { headers })
        const accounts = accountsRes.ok ? await accountsRes.json() : []
        
        // Analyze payment patterns
        const paymentData = analyzePayments(txData, accounts, aggregated.totalExpense, rangeMonths.length)
        setPaymentAnalysis(paymentData)
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

  // Show onboarding if no household selected
  if (!currentHousehold) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Welcome to Cashlines</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Let&apos;s get you started tracking your money</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>Create your first household to begin tracking income and expenses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h3 className="font-medium text-slate-900 dark:text-slate-100">What&apos;s a household?</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                A household is your budget scope. You might have:
              </p>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1 ml-4">
                <li>• <strong>Personal</strong> - Just tracking your own money</li>
                <li>• <strong>Family</strong> - Shared household finances</li>
                <li>• <strong>Business</strong> - Side gig or freelance income</li>
              </ul>
            </div>

            <div className="pt-4">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                Use the &quot;Create Household&quot; button at the top to get started.
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500">
                Once created, you can add accounts, income, and track expenses.
              </p>
            </div>
          </CardContent>
        </Card>
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

  // Get range label for display
  const rangeLabel = dateRange.label

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
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Dashboard</h1>
      </div>

      {/* Date Range Selector Component */}
      <DateRangeSelector value={dateRange} onChange={setDateRange} compact />

      {/* Summary Cards - Main Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">Total Income</CardTitle>
            <ArrowDownLeft className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(summary.totalIncome)}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {summary.incomeCount} · Avg: {formatCurrency(avgIncome)}
            </p>
            {prevSummary && incomeChange !== 0 && (
              <p className={`text-xs font-semibold ${incomeChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {incomeChange >= 0 ? '↑' : '↓'} {formatCurrency(Math.abs(incomeChange))} ({incomeChangePercent.toFixed(1)}%)
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">Total Expenses</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-red-600 dark:text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(summary.totalExpense)}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {summary.transactionCount} txns · Avg: {formatCurrency(avgTransaction)}
            </p>
            {prevSummary && expenseChange !== 0 && (
              <p className={`text-xs font-semibold ${expenseChange <= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {expenseChange >= 0 ? '↑' : '↓'} {formatCurrency(Math.abs(expenseChange))} ({expenseChangePercent.toFixed(1)}%)
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">Net Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netBalance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
              {formatCurrency(netBalance)}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {savingsRate.toFixed(1)}% savings
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">Expense Ratio</CardTitle>
            <Percent className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {expenseRatio.toFixed(1)}%
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Tax: {taxRate.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <RecurringExpensesForecast actualCCSpending={ccExpense} />
      </div>

      {/* Debt Payments Card - NEW */}
      {paymentAnalysis && paymentAnalysis.totalDebtPayments > 0 && (
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-slate-900 dark:text-slate-100">Debt Payments</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">Tracking your debt reduction progress</CardDescription>
              </div>
              <CreditCard className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Credit Card Payments</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {formatCurrency(paymentAnalysis.totalCreditCardPayments)}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {Object.values(paymentAnalysis.paymentsByAccount).filter(p => p.accountName.toLowerCase().includes('credit')).reduce((sum, p) => sum + p.count, 0)} payments
                  </p>
                </div>
                
                <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Loan Payments</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {formatCurrency(paymentAnalysis.totalLoanPayments)}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {Object.values(paymentAnalysis.paymentsByAccount).filter(p => p.accountName.toLowerCase().includes('loan')).reduce((sum, p) => sum + p.count, 0)} payments
                  </p>
                </div>
                
                <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Debt Reduction Rate</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {paymentAnalysis.debtReductionRate.toFixed(1)}%
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    of expenses
                  </p>
                </div>
              </div>
              
              {Object.keys(paymentAnalysis.paymentsByAccount).length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Payments by Account</p>
                  {Object.entries(paymentAnalysis.paymentsByAccount)
                    .sort(([, a], [, b]) => b.amount - a.amount)
                    .map(([accountId, data]) => (
                      <div key={accountId} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded">
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{data.accountName}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{data.count} payments</p>
                        </div>
                        <p className="text-sm font-bold text-purple-600 dark:text-purple-400">{formatCurrency(data.amount)}</p>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Method Breakdown - as Gauge Cards */}
      {methodEntries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-slate-100">Payment Methods</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">Spending distribution by method</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {methodEntries.map(([method, amount]) => {
                const percent = summary.totalExpense > 0 ? (amount / summary.totalExpense) * 100 : 0
                const label = method === 'cc' ? 'Credit Card' : method === 'ach' ? 'ACH Transfer' : method.charAt(0).toUpperCase() + method.slice(1)
                const color = method === 'cc' ? 'text-blue-600 dark:text-blue-400' : method === 'cash' ? 'text-green-600 dark:text-green-400' : 'text-purple-600 dark:text-purple-400'
                return (
                  <div key={method} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">{label}</p>
                    <p className={`text-2xl font-bold ${color}`}>{percent.toFixed(1)}%</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{formatCurrency(amount)}</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Money Allocation Summary - as Gauge Cards with Smart Thresholds */}
      {Object.keys(allocationsByType).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-slate-100">Spending Categories</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">Allocation vs recommended targets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(allocationsByType)
                .sort(([, a], [, b]) => b - a)
                .map(([type, total]) => {
                  const percent = summary.totalExpense > 0 ? (total / summary.totalExpense) * 100 : 0
                  // Smart threshold calculation based on category and income
                  const recommendedTargets = {
                    need: 50,
                    want: 30,
                    debt: 10,
                    tax: 15,
                    savings: 20
                  }
                  const threshold = recommendedTargets[type as keyof typeof recommendedTargets] || 20
                  const status = percent > threshold ? 'over' : percent > threshold * 0.8 ? 'caution' : 'good'
                  
                  const statusColor = status === 'over' ? 'text-red-600 dark:text-red-400' : 
                                     status === 'caution' ? 'text-orange-600 dark:text-orange-400' : 
                                     'text-green-600 dark:text-green-400'
                  const bgColor = status === 'over' ? 'bg-red-50 dark:bg-red-950' : 
                                 status === 'caution' ? 'bg-orange-50 dark:bg-orange-950' : 
                                 'bg-slate-50 dark:bg-slate-800'
                  
                  return (
                    <div key={type} className={`p-3 rounded-lg border border-slate-200 dark:border-slate-700 ${bgColor}`}>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 capitalize">{type}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Target: {threshold}%</p>
                      </div>
                      <p className={`text-2xl font-bold ${statusColor}`}>{percent.toFixed(1)}%</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{formatCurrency(total)}</p>
                      {status === 'over' && <p className="text-xs text-red-600 dark:text-red-400 mt-1">⚠ Over target</p>}
                      {status === 'caution' && <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">→ Approaching target</p>}
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Financial Insights - Dashboard Preview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-slate-900 dark:text-slate-100">Financial Insights</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">Key findings from your financial data</CardDescription>
          </div>
          <Link href="/insights">
            <Button variant="outline" size="sm" className="dark:border-slate-600 dark:text-slate-300">
              View Full Analysis →
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Accounts</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {Object.keys(summary.byMethod).length}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">by payment method</p>
            </div>

            <div className={`p-3 rounded-lg border border-slate-200 dark:border-slate-700 ${
              expenseRatio > 80 ? 'bg-red-50 dark:bg-red-950' :
              expenseRatio > 60 ? 'bg-yellow-50 dark:bg-yellow-950' :
              'bg-green-50 dark:bg-green-950'
            }`}>
              <p className="text-xs font-medium mb-1 text-slate-600 dark:text-slate-400">Expense Ratio</p>
              <p className={`text-2xl font-bold ${
                expenseRatio > 80 ? 'text-red-600 dark:text-red-400' :
                expenseRatio > 60 ? 'text-yellow-600 dark:text-yellow-400' :
                'text-green-600 dark:text-green-400'
              }`}>
                {expenseRatio.toFixed(1)}%
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">of income</p>
            </div>

            <div className={`p-3 rounded-lg border border-slate-200 dark:border-slate-700 ${
              savingsRate > 20 ? 'bg-green-50 dark:bg-green-950' :
              savingsRate > 10 ? 'bg-blue-50 dark:bg-blue-950' :
              'bg-orange-50 dark:bg-orange-950'
            }`}>
              <p className="text-xs font-medium mb-1 text-slate-600 dark:text-slate-400">Savings Rate</p>
              <p className={`text-2xl font-bold ${
                savingsRate > 20 ? 'text-green-600 dark:text-green-400' :
                savingsRate > 10 ? 'text-blue-600 dark:text-blue-400' :
                'text-orange-600 dark:text-orange-400'
              }`}>
                {savingsRate.toFixed(1)}%
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">of income</p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Avg Transaction</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {formatCurrency(avgTransaction)}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{summary.transactionCount} total</p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-700 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              💡 <strong>Tip:</strong> Check the full insights page for detailed credit card analysis, net worth breakdown, and personalized recommendations.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      {summary && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Spending by Category */}
          <Card>
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-slate-100">Spending by Category</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">{rangeLabel}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={Object.entries(summary.routingSummary).map(([type, targets]) => ({
                      name: type.charAt(0).toUpperCase() + type.slice(1),
                      value: Object.values(targets as Record<string, number>).reduce((a: number, b: number) => a + b, 0),
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="#3B82F6" />
                    <Cell fill="#10B981" />
                    <Cell fill="#F59E0B" />
                    <Cell fill="#EF4444" />
                    <Cell fill="#8B5CF6" />
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Income vs Expenses */}
          <Card>
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-slate-100">Income vs Expenses</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">Monthly comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    {
                      name: 'Current',
                      income: summary.totalIncome,
                      expenses: summary.totalExpense,
                    },
                    {
                      name: 'Previous',
                      income: prevSummary?.totalIncome || 0,
                      expenses: prevSummary?.totalExpense || 0,
                    },
                  ]}
                  margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="income" fill="#10B981" name="Income" />
                  <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-slate-100">Spending by Method</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">Cash, Credit Card, ACH, Other</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={Object.entries(summary.byMethod).map(([method, amount]) => ({
                    name: method === 'cc' ? 'Credit Card' : method === 'ach' ? 'ACH' : method.charAt(0).toUpperCase() + method.slice(1),
                    amount,
                  }))}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={90} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="amount" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Allocation Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-slate-100">Budget Allocation Target</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">Need 50% • Want 30% • Other 20%</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Need (Target 50%)', value: 50, fill: '#EF4444' },
                      { name: 'Want (Target 30%)', value: 30, fill: '#F59E0B' },
                      { name: 'Other (Target 20%)', value: 20, fill: '#8B5CF6' },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}\n${value}%`}
                    outerRadius={80}
                    dataKey="value"
                  />
                  <Tooltip formatter={(value: number) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Key Ratios Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-slate-100">Key Financial Ratios</CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">Important metrics for money tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Savings Rate</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{savingsRate.toFixed(1)}%</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Income after expenses</p>
            </div>
            <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Expense Ratio</p>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{expenseRatio.toFixed(1)}%</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Expenses vs income</p>
            </div>
            <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Tax Rate</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{taxRate.toFixed(1)}%</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Taxes vs gross income</p>
            </div>
            <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">CC vs Total Spend</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {summary.totalExpense > 0 ? ((ccExpense / summary.totalExpense) * 100).toFixed(1) : '0'}%
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{formatCurrency(ccExpense)} on credit card</p>
            </div>
            <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Cash vs Total Spend</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {summary.totalExpense > 0 ? ((cashExpense / summary.totalExpense) * 100).toFixed(1) : '0'}%
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{formatCurrency(cashExpense)} in cash</p>
            </div>
            <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Transaction Frequency</p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{summary.transactionCount}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">transactions this month</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Person Summary Cards */}
      {people.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-slate-100">Household Members</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">Summary stats for each person</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {people.map((person) => {
                const metrics = personMetrics[person.id] || { income: 0, expenses: 0 }
                const balance = metrics.income - metrics.expenses
                
                return (
                  <Link key={person.id} href={`/people/${person.id}`} className="block">
                    <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:shadow-lg hover:border-blue-400 dark:hover:border-blue-500 transition-all dark:bg-slate-800">
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="w-6 h-6 rounded-full flex-shrink-0"
                          style={{ backgroundColor: person.color || '#4ECDC4' }}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {person.name}
                          </h4>
                          {person.role && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                              {person.role}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-600 dark:text-slate-400">Income</span>
                          <span className="font-semibold text-green-600 dark:text-green-400">
                            {formatCurrency(metrics.income)}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-600 dark:text-slate-400">Expenses</span>
                          <span className="font-semibold text-red-600 dark:text-red-400">
                            {formatCurrency(metrics.expenses)}
                          </span>
                        </div>
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between text-xs">
                          <span className="font-medium text-slate-900 dark:text-slate-100">Balance</span>
                          <span className={`font-semibold ${balance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                            {formatCurrency(balance)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline">
                          View Dashboard →
                        </p>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

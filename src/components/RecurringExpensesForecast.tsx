'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/money'
import { getExpectedMonthlyTotal, compareForecast, formatForecastStatus } from '@/lib/forecast'
import { useUser } from '@/lib/UserContext'
import { TrendingUp } from 'lucide-react'

interface RecurringExpense {
  id: string
  description: string
  amount: number
  frequency: string
  dueDay?: number | null
  nextDueDate: string
  isActive: boolean
}

interface RecurringExpensesForecastProps {
  actualCCSpending?: number
}

export function RecurringExpensesForecast({ actualCCSpending }: RecurringExpensesForecastProps) {
  const { currentHousehold } = useUser()
  const [expenses, setExpenses] = useState<RecurringExpense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchExpenses = useCallback(async function() {
    if (!currentHousehold) return
    
    try {
      setLoading(true)
      const headers = { 'x-household-id': currentHousehold.id }
      const response = await fetch('/api/recurring-expenses', { headers })
      if (!response.ok) throw new Error('Failed to fetch recurring expenses')
      const data = await response.json()
      setExpenses(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [currentHousehold])

  useEffect(() => {
    if (currentHousehold) {
      fetchExpenses()
    }
  }, [currentHousehold, fetchExpenses])

  if (loading) {
    return (
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Recurring Expenses
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        </CardHeader>
        <CardContent>
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading...</p>
        </CardContent>
      </Card>
    )
  }

  if (error || expenses.length === 0) {
    return (
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Recurring Expenses
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        </CardHeader>
        <CardContent>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {error ? 'Error loading expenses' : 'No recurring expenses yet'}
          </p>
          <a
            href="/recurring-expenses"
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-block"
          >
            Add recurring expenses →
          </a>
        </CardContent>
      </Card>
    )
  }

  // Calculate expected monthly total
  const now = new Date()
  const expectedMonthly = getExpectedMonthlyTotal(expenses, now.getFullYear(), now.getMonth())

  // Compare with actual if provided
  let forecast = null
  if (actualCCSpending !== undefined) {
    forecast = compareForecast(expectedMonthly, actualCCSpending, 0.15) // 15% threshold
  }

  return (
    <Card className="border-l-4 border-l-purple-500">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Recurring Expenses (Monthly)
        </CardTitle>
        <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
          {formatCurrency(expectedMonthly)}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {expenses.filter((e) => e.isActive).length} active expenses
        </p>

        {forecast && (
          <div className="mt-3 p-2 bg-slate-50 dark:bg-slate-700 rounded text-xs">
            {forecast.status === 'on-track' && (
              <p className="text-green-600 dark:text-green-400">
                ✓ On track vs CC spending ({formatCurrency(forecast.actualTotal)})
              </p>
            )}
            {forecast.status === 'over' && (
              <p className="text-red-600 dark:text-red-400">
                ↑ Over by {formatCurrency(forecast.difference)} ({forecast.percentDifference.toFixed(1)}%)
              </p>
            )}
            {forecast.status === 'under' && (
              <p className="text-blue-600 dark:text-blue-400">
                ↓ Under by {formatCurrency(Math.abs(forecast.difference))} ({Math.abs(forecast.percentDifference).toFixed(1)}%)
              </p>
            )}
          </div>
        )}

        <a
          href="/recurring-expenses"
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-block"
        >
          Manage →
        </a>
      </CardContent>
    </Card>
  )
}

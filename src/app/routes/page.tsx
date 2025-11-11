'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { useState, useEffect } from 'react'
import { formatCurrency } from '@/src/lib/money'
import { getCurrentMonthYear, formatMonth } from '@/src/lib/date'
import { AlertCircle } from 'lucide-react'

interface RoutingSummary {
  [type: string]: {
    [target: string]: number
  }
}

export default function RoutesPage() {
  const [routing, setRouting] = useState<RoutingSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState(getCurrentMonthYear().month)
  const [year, setYear] = useState(getCurrentMonthYear().year)

  const fetchRouting = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/reports/summary?month=${month}&year=${year}`)
      if (response.ok) {
        const data = await response.json()
        setRouting(data.routingSummary)
      }
    } catch (error) {
      console.error('Error fetching routing:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRouting()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year])

  const COLORS: Record<string, string> = {
    need: 'bg-blue-100 text-blue-900 border-blue-300',
    want: 'bg-green-100 text-green-900 border-green-300',
    debt: 'bg-red-100 text-red-900 border-red-300',
    tax: 'bg-orange-100 text-orange-900 border-orange-300',
    savings: 'bg-purple-100 text-purple-900 border-purple-300',
    other: 'bg-slate-100 text-slate-900 border-slate-300',
  }

  const ICONS: Record<string, string> = {
    need: '🛒',
    want: '🎉',
    debt: '💳',
    tax: '🧾',
    savings: '🏦',
    other: '📌',
  }

  const totalByType: Record<string, number> = {}
  if (routing) {
    Object.entries(routing).forEach(([type, targets]) => {
      totalByType[type] = Object.values(targets).reduce((sum, val) => sum + val, 0)
    })
  }

  const grandTotal = Object.values(totalByType).reduce((sum, val) => sum + val, 0)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Money Routing</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">Visualize how your money is allocated</p>
      </div>

      {/* Help Section */}
      <Card className="border-l-4 border-l-green-500 bg-green-50 dark:bg-green-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-slate-900 dark:text-slate-100">
            <AlertCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            Understanding Money Routes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">What is this?</h4>
            <p className="text-slate-700 dark:text-slate-400">
              This page shows where your money actually goes based on the routing rules you've created. When you add transactions and income, they're automatically routed based on matching rules.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">The Categories:</h4>
            <ul className="space-y-1 text-slate-700 dark:text-slate-400">
              <li><strong>🛒 Need:</strong> Essential expenses (housing, food, utilities)</li>
              <li><strong>🎉 Want:</strong> Discretionary spending (entertainment, dining out)</li>
              <li><strong>💳 Debt:</strong> Debt repayment and credit card payments</li>
              <li><strong>🧾 Tax:</strong> Taxes withheld or owed</li>
              <li><strong>🏦 Savings:</strong> Emergency fund, investments, goals</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700">
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">How to use it:</h4>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-400 text-xs">
              <li>Create routing rules in the <strong>Routing Rules</strong> page</li>
              <li>Rules automatically categorize your transactions and income</li>
              <li>Check this page to see the breakdown of where your money went</li>
              <li>Select different months to compare spending patterns</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-end gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Select Month
          </label>
          <select
            value={`${year}-${month}`}
            onChange={(e) => {
              const [y, m] = e.target.value.split('-')
              setYear(parseInt(y))
              setMonth(parseInt(m))
            }}
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {[...Array(12)].map((_, i) => {
              const m = i + 1
              return (
                <option key={m} value={`${year}-${m}`}>
                  {formatMonth(year, m)}
                </option>
              )
            })}
          </select>
        </div>
      </div>

      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-slate-500 dark:text-slate-400">Loading...</p>
          </CardContent>
        </Card>
      ) : !routing || Object.keys(routing).length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-slate-500 dark:text-slate-400">No routing data for this month</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Total Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-slate-100">Total Allocated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {formatCurrency(grandTotal)}
              </div>
            </CardContent>
          </Card>

          {/* Type Breakdown */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(routing).map(([type, targets]) => {
              const total = totalByType[type]
              const percentage = grandTotal > 0 ? (total / grandTotal) * 100 : 0

              return (
                <Card key={type} className="dark:bg-slate-900">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                        <span>{ICONS[type] || '📌'}</span>
                        <span className="capitalize">{type}</span>
                      </CardTitle>
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(total)}
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          COLORS[type]?.split(' ')[0] || 'bg-slate-400'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    {/* Target Breakdown */}
                    <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                      {Object.entries(targets).map(([target, amount]) => (
                        <div
                          key={target}
                          className={`flex justify-between items-center px-2 py-1 rounded border ${
                            COLORS[type] || ''
                          }`}
                        >
                          <span className="font-medium text-sm text-slate-900 dark:text-slate-100">{target}</span>
                          <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                            {formatCurrency(amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Detailed Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-slate-100">Detailed Breakdown</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">All routing targets and amounts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left py-2 px-2 font-medium text-slate-900 dark:text-slate-100">Type</th>
                      <th className="text-left py-2 px-2 font-medium text-slate-900 dark:text-slate-100">Target</th>
                      <th className="text-right py-2 px-2 font-medium text-slate-900 dark:text-slate-100">Amount</th>
                      <th className="text-right py-2 px-2 font-medium text-slate-900 dark:text-slate-100">% of Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(routing).map(([type, targets]) =>
                      Object.entries(targets).map(([target, amount], idx) => {
                        const typeTotal = totalByType[type]
                        const typePercent = typeTotal > 0 ? (amount / typeTotal) * 100 : 0

                        return (
                          <tr
                            key={`${type}-${target}-${idx}`}
                            className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                          >
                            <td className="py-2 px-2">
                              <span className={`inline-block px-3 py-1 rounded text-sm font-medium capitalize ${COLORS[type] || ''}`}>
                                {type}
                              </span>
                            </td>
                            <td className="py-2 px-2 font-medium text-slate-900 dark:text-slate-100">{target}</td>
                            <td className="py-2 px-2 text-right font-semibold text-slate-900 dark:text-slate-100">
                              {formatCurrency(amount)}
                            </td>
                            <td className="py-2 px-2 text-right text-slate-600 dark:text-slate-400">
                              {typePercent.toFixed(1)}%
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

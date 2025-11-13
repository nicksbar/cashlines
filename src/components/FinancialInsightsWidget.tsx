'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useUser } from '@/lib/UserContext'
import {
  analyzeCreditCards,
  calculateNetWorth,
  analyzeCashFlow,
  generateInsights,
  type CreditCardAnalysis,
  type NetWorthBreakdown,
  type CashFlowAnalysis,
  type FinancialInsight,
  type Account,
} from '@/lib/financial-analysis'
import { formatCurrency } from '@/lib/money'
import {
  AlertCircle,
  TrendingUp,
  Zap,
  DollarSign,
  PieChart as PieChartIcon,
  Target,
  Lightbulb,
} from 'lucide-react'

interface InsightsData {
  accounts: Account[]
  creditCardAnalysis: CreditCardAnalysis
  netWorth: NetWorthBreakdown
  cashFlow: CashFlowAnalysis
  insights: FinancialInsight[]
}

export function FinancialInsightsWidget() {
  const { currentHousehold } = useUser()
  const [data, setData] = useState<InsightsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (currentHousehold) {
      fetchAndAnalyzeData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentHousehold?.id])

  const fetchAndAnalyzeData = async () => {
    if (!currentHousehold) return

    try {
      setLoading(true)
      const headers = { 'x-household-id': currentHousehold.id }

      // Fetch accounts
      const accountsRes = await fetch('/api/accounts', { headers })
      const accounts = accountsRes.ok ? await accountsRes.json() : []

      // Fetch transactions for current month to calculate spending
      const now = new Date()
      const month = now.getMonth() + 1
      const year = now.getFullYear()

      const txRes = await fetch(`/api/transactions?month=${month}&year=${year}`, { headers })
      const transactions = txRes.ok ? await txRes.json() : []

      const monthlySpending = transactions.reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0)

      // Run analysis
      const ccAnalysis = analyzeCreditCards(accounts)
      const netWorth = calculateNetWorth(accounts)
      const cashFlow = analyzeCashFlow(accounts, monthlySpending)
      const insights = generateInsights(accounts, ccAnalysis, netWorth, cashFlow, monthlySpending)

      setData({
        accounts,
        creditCardAnalysis: ccAnalysis,
        netWorth,
        cashFlow,
        insights,
      })
    } catch (error) {
      console.error('Error analyzing financial data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-slate-100">Financial Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500 dark:text-slate-400">Loading insights...</p>
        </CardContent>
      </Card>
    )
  }

  const { insights, creditCardAnalysis, netWorth, cashFlow } = data

  return (
    <div className="space-y-6">
      {/* Top Insights Section */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              Financial Insights & Opportunities
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              {insights.length} actionable recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights.slice(0, 5).map((insight, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border-l-4 ${
                  insight.type === 'warning'
                    ? 'bg-red-50 dark:bg-red-950 border-l-red-500'
                    : insight.type === 'opportunity'
                    ? 'bg-green-50 dark:bg-green-950 border-l-green-500'
                    : 'bg-blue-50 dark:bg-blue-950 border-l-blue-500'
                } border border-transparent dark:border-slate-700`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {insight.type === 'warning' ? (
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                    ) : insight.type === 'opportunity' ? (
                      <Zap className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                    ) : (
                      <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                      {insight.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      {insight.description}
                    </p>
                    {insight.metric && (
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Impact: <span className={
                          insight.type === 'warning' 
                            ? 'text-red-600 dark:text-red-400'
                            : insight.type === 'opportunity'
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-blue-600 dark:text-blue-400'
                        }>{insight.metric}</span>
                      </p>
                    )}
                    {insight.action && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                        💡 {insight.action}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {insights.length > 5 && (
              <div className="text-center pt-2">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  +{insights.length - 5} more insights available
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Credit Card Analysis */}
      {creditCardAnalysis.totalCreditLimit > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <PieChartIcon className="w-5 h-5" />
              Credit Card Portfolio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Total Limit</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {formatCurrency(creditCardAnalysis.totalCreditLimit)}
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Balance</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {formatCurrency(creditCardAnalysis.totalBalance)}
                </p>
              </div>

              <div
                className={`p-3 rounded-lg border border-slate-200 dark:border-slate-700 ${
                  creditCardAnalysis.utilizationRate > 80
                    ? 'bg-red-50 dark:bg-red-950'
                    : creditCardAnalysis.utilizationRate > 50
                    ? 'bg-yellow-50 dark:bg-yellow-950'
                    : 'bg-green-50 dark:bg-green-950'
                }`}
              >
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Utilization</p>
                <p
                  className={`text-2xl font-bold ${
                    creditCardAnalysis.utilizationRate > 80
                      ? 'text-red-600 dark:text-red-400'
                      : creditCardAnalysis.utilizationRate > 50
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : 'text-green-600 dark:text-green-400'
                  }`}
                >
                  {creditCardAnalysis.utilizationRate.toFixed(1)}%
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Weighted APR</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {creditCardAnalysis.weightedApr.toFixed(1)}%
                </p>
              </div>
            </div>

            {creditCardAnalysis.potentialSavings > 0 && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-700 rounded-lg">
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  💰 Potential Monthly Savings: {formatCurrency(creditCardAnalysis.potentialSavings)}
                </p>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                  By paying down high-interest balances
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Net Worth Summary */}
      {netWorth.assets > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <TrendingUp className="w-5 h-5" />
              Net Worth Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-700">
                <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-1">Total Assets</p>
                <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                  {formatCurrency(netWorth.assets)}
                </p>
              </div>

              <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-700">
                <p className="text-sm font-medium text-red-900 dark:text-red-100 mb-1">Total Liabilities</p>
                <p className="text-3xl font-bold text-red-700 dark:text-red-300">
                  {formatCurrency(netWorth.liabilities)}
                </p>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-700">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">Net Worth</p>
                <p className={`text-3xl font-bold ${
                  netWorth.netWorth >= 0
                    ? 'text-blue-700 dark:text-blue-300'
                    : 'text-red-700 dark:text-red-300'
                }`}>
                  {formatCurrency(netWorth.netWorth)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monthly Cash Flow Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <DollarSign className="w-5 h-5" />
            Monthly Cash Flow Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-700">
              <p className="text-xs font-medium text-green-900 dark:text-green-100 mb-1">Interest Earned</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                {formatCurrency(cashFlow.monthlyInterestEarned)}
              </p>
            </div>

            <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-700">
              <p className="text-xs font-medium text-red-900 dark:text-red-100 mb-1">Interest Paid</p>
              <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                {formatCurrency(cashFlow.monthlyInterestPaid)}
              </p>
            </div>

            <div className="p-3 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-700">
              <p className="text-xs font-medium text-orange-900 dark:text-orange-100 mb-1">Total Monthly Fees</p>
              <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                {formatCurrency(cashFlow.monthlyFeesTotal)}
              </p>
            </div>

            <div
              className={`p-3 rounded-lg border ${
                cashFlow.monthlyNetInterest > 0
                  ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-700'
                  : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-700'
              }`}
            >
              <p className="text-xs font-medium mb-1 text-slate-600 dark:text-slate-400">Net Monthly Interest</p>
              <p
                className={`text-2xl font-bold ${
                  cashFlow.monthlyNetInterest > 0
                    ? 'text-green-700 dark:text-green-300'
                    : 'text-red-700 dark:text-red-300'
                }`}
              >
                {formatCurrency(cashFlow.monthlyNetInterest)}
              </p>
            </div>
          </div>

          {cashFlow.opportunityGap > 50 && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-700 rounded-lg">
              <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                ⚠️ Interest Gap: {formatCurrency(cashFlow.opportunityGap)}/month
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                You&apos;re paying more in interest than you&apos;re earning. Consider debt paydown or higher-yield savings.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

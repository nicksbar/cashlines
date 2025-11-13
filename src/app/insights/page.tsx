'use client'

import { FinancialInsightsWidget } from '@/src/components/FinancialInsightsWidget'

export default function InsightsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">Financial Insights</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">AI-powered analysis of your finances</p>
      </div>

      <FinancialInsightsWidget />
    </div>
  )
}

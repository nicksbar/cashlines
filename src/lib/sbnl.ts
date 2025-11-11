/**
 * Spent But Not Listed (SBNL) Calculations
 * 
 * SBNL is the difference between:
 * - Total tracked expenses on a credit card in month N
 * - Total payment made to the credit card in month N+1
 * 
 * This reveals untracked/discretionary spending
 */

/**
 * Calculate SBNL for a credit card
 * 
 * @param ccPaymentAmount - Total payment made to CC (next month)
 * @param trackedExpenses - Sum of all tracked expenses on CC (this month)
 * @returns SBNL amount and percentage
 */
export function calculateSBNL(ccPaymentAmount: number, trackedExpenses: number) {
  const sbnl = ccPaymentAmount - trackedExpenses
  const percentage = ccPaymentAmount > 0 ? Math.round((sbnl / ccPaymentAmount) * 100) : 0

  return {
    spentButNotListed: sbnl,
    percentage,
    description: formatSBNLDescription(sbnl, percentage, ccPaymentAmount),
  }
}

/**
 * Format SBNL results for display
 */
export function formatSBNLDescription(sbnl: number, percentage: number, paymentAmount: number) {
  if (sbnl <= 0) {
    return `All CC spending accounted for (tracked: $${Math.abs(sbnl).toFixed(2)} over payment)`
  }

  if (percentage < 5) {
    return `Great tracking! Only $${sbnl.toFixed(2)} (${percentage}%) untracked`
  }

  if (percentage < 15) {
    return `Good tracking. $${sbnl.toFixed(2)} (${percentage}%) in untracked spending`
  }

  if (percentage < 25) {
    return `Note: $${sbnl.toFixed(2)} (${percentage}%) untracked - might want to review spending`
  }

  return `⚠️  Significant untracked spending: $${sbnl.toFixed(2)} (${percentage}%) of your CC payment`
}

/**
 * Analyze SBNL trends across multiple months
 */
export function analyzeSBNLTrend(
  monthlySBNL: Array<{ month: number; year: number; sbnl: number; payment: number }>
) {
  if (monthlySBNL.length === 0) {
    return {
      average: 0,
      trend: 'insufficient_data',
      highest: null,
      lowest: null,
    }
  }

  const sbnlAmounts = monthlySBNL.map(m => m.sbnl)
  const average = sbnlAmounts.reduce((a, b) => a + b, 0) / sbnlAmounts.length

  const highest = Math.max(...sbnlAmounts)
  const lowest = Math.min(...sbnlAmounts)

  let trend = 'stable'
  if (monthlySBNL.length >= 2) {
    const recent = monthlySBNL.slice(-3).map(m => m.sbnl)
    const older = monthlySBNL.slice(0, 3).map(m => m.sbnl)
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length

    if (recentAvg > olderAvg * 1.1) {
      trend = 'increasing'
    } else if (recentAvg < olderAvg * 0.9) {
      trend = 'decreasing'
    }
  }

  return {
    average: Math.round(average * 100) / 100,
    trend,
    highest,
    lowest,
    volatility: highest - lowest,
  }
}

/**
 * Generate insights from SBNL data
 */
export function generateSBNLInsights(
  sbnl: number,
  percentage: number,
  monthlyPayment: number,
  trend?: string
) {
  const insights = []

  if (sbnl > monthlyPayment * 0.25) {
    insights.push({
      severity: 'high',
      message: `You're spending over 25% of your CC payment on untracked items. This might indicate missing expense categories or cash spending.`,
    })
  }

  if (percentage > 20) {
    insights.push({
      severity: 'medium',
      message: `${percentage}% of CC spending isn't being tracked. Consider reviewing your expense categories.`,
    })
  }

  if (sbnl > 0 && sbnl < 10) {
    insights.push({
      severity: 'low',
      message: `Excellent tracking! Very little untracked spending.`,
    })
  }

  if (trend === 'increasing') {
    insights.push({
      severity: 'medium',
      message: `Your untracked spending is trending upward. Recent months show more discretionary spending.`,
    })
  }

  return insights
}

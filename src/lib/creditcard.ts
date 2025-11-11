/**
 * Credit Card Utility Functions
 * Calculates CC utilization, available credit, and health status
 */

export interface CCUtilization {
  currentBalance: number
  creditLimit: number
  utilizationPercent: number
  availableCredit: number
  status: 'healthy' | 'warning' | 'danger'
  statusMessage: string
}

export interface CCHealthTrend {
  monthData: Array<{
    month: string
    utilized: number
    limit: number
    percent: number
  }>
  trend: 'improving' | 'stable' | 'worsening'
  averageUtilization: number
}

/**
 * Calculate CC utilization based on current spending and limit
 * 
 * @param currentBalance - Amount currently charged on card
 * @param creditLimit - Total credit limit
 * @returns Utilization details with status
 */
export function calculateCCUtilization(
  currentBalance: number,
  creditLimit: number
): CCUtilization {
  if (!creditLimit || creditLimit <= 0) {
    return {
      currentBalance,
      creditLimit: 0,
      utilizationPercent: 0,
      availableCredit: 0,
      status: 'healthy',
      statusMessage: 'No credit limit set',
    }
  }

  const utilizationPercent = Math.round((currentBalance / creditLimit) * 100)
  const availableCredit = Math.max(0, creditLimit - currentBalance)

  let status: 'healthy' | 'warning' | 'danger'
  let statusMessage: string

  if (utilizationPercent <= 30) {
    status = 'healthy'
    statusMessage = `${utilizationPercent}% utilized - Excellent utilization`
  } else if (utilizationPercent < 70) {
    status = 'warning'
    statusMessage = `${utilizationPercent}% utilized - Moderate utilization`
  } else {
    status = 'danger'
    statusMessage = `${utilizationPercent}% utilized - High utilization`
  }

  return {
    currentBalance,
    creditLimit,
    utilizationPercent,
    availableCredit,
    status,
    statusMessage,
  }
}

/**
 * Format CC utilization as human-readable description
 */
export function formatCCUtilizationDescription(utilization: CCUtilization): string {
  if (!utilization.creditLimit) {
    return 'No credit limit set'
  }

  const { currentBalance, availableCredit, utilizationPercent, status } = utilization

  const balanceStr = currentBalance.toFixed(2)
  const availableStr = availableCredit.toFixed(2)
  const limitStr = utilization.creditLimit.toFixed(2)

  let recommendation = ''
  if (status === 'healthy') {
    recommendation = 'Keep it up! Your utilization is healthy.'
  } else if (status === 'warning') {
    recommendation = 'Consider paying down balance to improve credit utilization.'
  } else {
    recommendation = 'High utilization can impact credit score. Pay down ASAP.'
  }

  return `Using $${balanceStr} of $${limitStr} limit (${utilizationPercent}%). Available: $${availableStr}. ${recommendation}`
}

/**
 * Analyze CC utilization trend over multiple months
 */
export function analyzeCCTrend(monthlyData: Array<{
  month: string
  utilized: number
  limit: number
}>): CCHealthTrend {
  if (monthlyData.length === 0) {
    return {
      monthData: [],
      trend: 'stable',
      averageUtilization: 0,
    }
  }

  const monthData = monthlyData.map(item => ({
    month: item.month,
    utilized: item.utilized,
    limit: item.limit,
    percent: item.limit > 0 ? Math.round((item.utilized / item.limit) * 100) : 0,
  }))

  // Calculate trend (compare first third to last third)
  const thirdLength = Math.max(1, Math.floor(monthData.length / 3))
  const firstThird = monthData.slice(0, thirdLength)
  const lastThird = monthData.slice(-thirdLength)

  const firstAvg = firstThird.reduce((sum, m) => sum + m.percent, 0) / firstThird.length
  const lastAvg = lastThird.reduce((sum, m) => sum + m.percent, 0) / lastThird.length

  let trend: 'improving' | 'stable' | 'worsening'
  if (lastAvg < firstAvg - 5) {
    trend = 'improving'
  } else if (lastAvg > firstAvg + 5) {
    trend = 'worsening'
  } else {
    trend = 'stable'
  }

  const averageUtilization = Math.round(
    monthData.reduce((sum, m) => sum + m.percent, 0) / monthData.length
  )

  return {
    monthData,
    trend,
    averageUtilization,
  }
}

/**
 * Generate actionable insights based on CC utilization
 */
export function generateCCInsights(utilization: CCUtilization, trend?: CCHealthTrend): string[] {
  const insights: string[] = []

  // Utilization insights
  if (utilization.status === 'danger') {
    insights.push('⚠️ URGENT: Credit utilization is dangerously high (>70%). This significantly impacts your credit score. Create a paydown plan immediately.')
    if (utilization.availableCredit < 100) {
      insights.push('💳 Only $' + utilization.availableCredit.toFixed(2) + ' available credit remaining. Be careful with new charges.')
    }
  } else if (utilization.status === 'warning') {
    insights.push('📊 Your credit utilization is moderate (30-70%). Consider paying down balance to improve credit score.')
  } else {
    insights.push('✅ Your credit utilization is healthy (<30%). Keep maintaining this ratio.')
  }

  // Trend insights
  if (trend) {
    if (trend.trend === 'worsening') {
      insights.push('📈 Trend Alert: Your utilization is increasing. Review spending patterns and adjust budget.')
    } else if (trend.trend === 'improving') {
      insights.push('🎯 Great! Your utilization is trending downward. Keep up the paydown progress.')
    }
  }

  // Credit limit insights
  if (!utilization.creditLimit) {
    insights.push('📋 Tip: Set your credit limit in account settings to track utilization metrics.')
  }

  return insights
}

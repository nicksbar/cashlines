/**
 * Advanced Financial Analysis Engine
 * Analyzes account data, spending patterns, and cash flow to provide actionable insights
 */

export interface Account {
  id: string
  name: string
  type: string
  isActive: boolean
  creditLimit?: number | null
  interestRate?: number | null
  cashBackPercent?: number | null
  pointsPerDollar?: number | null
  annualFee?: number | null
  rewardsProgram?: string | null
  interestRateApy?: number | null
  monthlyFee?: number | null
  minimumBalance?: number | null
  isFdic?: boolean | null
  currentBalance?: number | null
  principalBalance?: number | null
}

export interface FinancialInsight {
  type: 'opportunity' | 'warning' | 'info'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  metric?: string
  action?: string
  priority: number // 1-10, higher = more important
}

export interface CreditCardAnalysis {
  totalCreditLimit: number
  totalBalance: number
  utilizationRate: number
  weightedApr: number
  potentialSavings: number
  bestRewards: {
    card: Account
    value: number
  } | null
}

export interface NetWorthBreakdown {
  assets: number
  liabilities: number
  netWorth: number
  assetDistribution: Record<string, number>
  liabilityDistribution: Record<string, number>
}

export interface CashFlowAnalysis {
  monthlyInterestEarned: number
  monthlyInterestPaid: number
  monthlyFeesTotal: number
  monthlyNetInterest: number
  opportunityGap: number
}

/**
 * Analyze credit card portfolio
 */
export function analyzeCreditCards(accounts: Account[]): CreditCardAnalysis {
  const creditCards = accounts.filter(a => a.type === 'credit_card')
  
  let totalCreditLimit = 0
  let totalBalance = 0
  let aprSum = 0
  let aprCount = 0
  let bestRewards: { card: Account; value: number } | null = null
  let maxRewardValue = 0

  creditCards.forEach(card => {
    // Credit limit analysis
    if (card.creditLimit) {
      totalCreditLimit += card.creditLimit
    }

    // Current balance (assuming balance would come from transaction data)
    if (card.currentBalance) {
      totalBalance += card.currentBalance
    }

    // APR tracking
    if (card.interestRate && card.interestRate > 0) {
      aprSum += card.interestRate
      aprCount++
    }

    // Calculate reward value (cashback or points converted to value)
    let rewardValue = 0
    if (card.cashBackPercent) {
      rewardValue += card.cashBackPercent * 10 // 1% cashback ≈ $10 value
    }
    if (card.pointsPerDollar && card.pointsPerDollar > 1) {
      rewardValue += card.pointsPerDollar * 5 // High points multiplier ≈ value
    }

    if (rewardValue > maxRewardValue) {
      maxRewardValue = rewardValue
      bestRewards = { card, value: rewardValue }
    }
  })

  const utilizationRate = totalCreditLimit > 0 ? (totalBalance / totalCreditLimit) * 100 : 0
  const weightedApr = aprCount > 0 ? aprSum / aprCount : 0
  
  // Calculate potential savings from paying down high-interest cards
  const monthlyInterestCost = totalBalance * (weightedApr / 100 / 12)
  const potentialSavings = monthlyInterestCost > 50 ? monthlyInterestCost : 0

  return {
    totalCreditLimit,
    totalBalance,
    utilizationRate,
    weightedApr,
    potentialSavings,
    bestRewards,
  }
}

/**
 * Calculate net worth from all accounts
 */
export function calculateNetWorth(accounts: Account[]): NetWorthBreakdown {
  let assets = 0
  let liabilities = 0
  const assetDistribution: Record<string, number> = {}
  const liabilityDistribution: Record<string, number> = {}

  accounts.forEach(account => {
    if (!account.isActive) return

    const balance = account.currentBalance || account.principalBalance || 0

    switch (account.type) {
      case 'checking':
      case 'savings':
      case 'cash':
      case 'investment':
        assets += balance
        assetDistribution[account.name] = balance
        break
      case 'credit_card':
        if (balance > 0) {
          liabilities += balance
          liabilityDistribution[account.name] = balance
        }
        break
      case 'loan':
        liabilities += balance
        liabilityDistribution[account.name] = balance
        break
    }
  })

  return {
    assets,
    liabilities,
    netWorth: assets - liabilities,
    assetDistribution,
    liabilityDistribution,
  }
}

/**
 * Analyze monthly interest and fee impact
 */
export function analyzeCashFlow(accounts: Account[], monthlySpending: number): CashFlowAnalysis {
  let monthlyInterestEarned = 0
  let monthlyInterestPaid = 0
  let monthlyFeesTotal = 0

  accounts.forEach(account => {
    if (!account.isActive) return

    const balance = account.currentBalance || 0

    // Interest earned on savings/checking
    if ((account.type === 'savings' || account.type === 'checking') && account.interestRateApy && balance > 0) {
      monthlyInterestEarned += balance * (account.interestRateApy / 100 / 12)
    }

    // Interest paid on credit cards
    if (account.type === 'credit_card' && account.interestRate && balance > 0) {
      monthlyInterestPaid += balance * (account.interestRate / 100 / 12)
    }

    // Interest paid on loans
    if (account.type === 'loan' && account.interestRate && balance > 0) {
      monthlyInterestPaid += balance * (account.interestRate / 100 / 12)
    }

    // Monthly fees
    if (account.monthlyFee) {
      monthlyFeesTotal += account.monthlyFee
    }

    // Credit card annual fees (prorated monthly)
    if (account.type === 'credit_card' && account.annualFee) {
      monthlyFeesTotal += account.annualFee / 12
    }
  })

  const monthlyNetInterest = monthlyInterestEarned - monthlyInterestPaid
  const opportunityGap = monthlyInterestPaid > monthlyInterestEarned ? monthlyInterestPaid - monthlyInterestEarned : 0

  return {
    monthlyInterestEarned,
    monthlyInterestPaid,
    monthlyFeesTotal,
    monthlyNetInterest,
    opportunityGap,
  }
}

/**
 * Format currency for display
 */
function formatMoney(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

/**
 * Generate actionable financial insights
 */
export function generateInsights(
  accounts: Account[],
  creditCardAnalysis: CreditCardAnalysis,
  netWorth: NetWorthBreakdown,
  cashFlow: CashFlowAnalysis,
  monthlySpending: number
): FinancialInsight[] {
  const insights: FinancialInsight[] = []

  // Credit card utilization warning
  if (creditCardAnalysis.totalCreditLimit > 0 && creditCardAnalysis.utilizationRate > 30) {
    const severity = creditCardAnalysis.utilizationRate > 80 ? 'high' : creditCardAnalysis.utilizationRate > 50 ? 'medium' : 'low'
    const priority = creditCardAnalysis.utilizationRate > 80 ? 9 : creditCardAnalysis.utilizationRate > 50 ? 7 : 5
    
    insights.push({
      type: 'warning',
      title: 'Credit Card Utilization',
      description: `You're using ${creditCardAnalysis.utilizationRate.toFixed(1)}% of your available credit (${formatMoney(creditCardAnalysis.totalBalance)} of ${formatMoney(creditCardAnalysis.totalCreditLimit)}). Ideal is below 30% for credit scores.`,
      impact: severity as any,
      metric: `${creditCardAnalysis.utilizationRate.toFixed(1)}%`,
      action: `Pay down to below 30% utilization to improve credit score. Target: ${formatMoney(creditCardAnalysis.totalCreditLimit * 0.3)}`,
      priority,
    })
  }

  // Interest paid vs earned gap - HIGH IMPACT
  if (cashFlow.opportunityGap > 10) {
    const yearlyGap = cashFlow.opportunityGap * 12
    insights.push({
      type: 'opportunity',
      title: 'Optimize Interest Gap',
      description: `You're paying $${cashFlow.monthlyInterestPaid.toFixed(2)}/month in interest but earning only $${cashFlow.monthlyInterestEarned.toFixed(2)}. Annual gap: $${yearlyGap.toFixed(2)}`,
      impact: 'high',
      metric: `$${yearlyGap.toFixed(2)}/year`,
      action: 'Prioritize paying off high-interest debt or increase savings APY',
      priority: 8,
    })
  }

  // High-yield savings opportunity
  const lowYieldSavings = accounts.filter(
    a => (a.type === 'savings' || a.type === 'checking') && (!a.interestRateApy || a.interestRateApy < 1) && (a.currentBalance || 0) > 5000
  )
  
  if (lowYieldSavings.length > 0) {
    const totalLowYield = lowYieldSavings.reduce((sum, a) => sum + (a.currentBalance || 0), 0)
    const currentYield = lowYieldSavings.reduce((sum, a) => sum + ((a.currentBalance || 0) * ((a.interestRateApy || 0) / 100 / 12)), 0)
    const potentialYield = totalLowYield * (0.045 / 12) // 4.5% high-yield
    const monthlyOpportunity = potentialYield - currentYield

    insights.push({
      type: 'opportunity',
      title: 'High-Yield Savings Opportunity',
      description: `You have ${formatMoney(totalLowYield)} earning ${(lowYieldSavings[0]?.interestRateApy || 0).toFixed(2)}% APY. High-yield savings offer 4-5% APY.`,
      impact: 'medium',
      metric: `+$${(monthlyOpportunity * 12).toFixed(2)}/year`,
      action: `Move ${lowYieldSavings.map(a => a.name).join(', ')} to high-yield account`,
      priority: 7,
    })
  }

  // Reward optimization opportunity
  const ccWithRewards = accounts.filter(a => a.type === 'credit_card' && a.cashBackPercent && a.cashBackPercent > 0)
  if (ccWithRewards.length > 0 && monthlySpending > 0) {
    const bestCard = ccWithRewards.reduce((best, card) => {
      const rewards = (card.cashBackPercent || 0) * monthlySpending
      return (best.cashBackPercent || 0) * monthlySpending > rewards ? best : card
    })

    const monthlyRewards = (bestCard.cashBackPercent || 0) * monthlySpending / 100
    const yearlyRewards = monthlyRewards * 12

    if (yearlyRewards > 50) {
      insights.push({
        type: 'opportunity',
        title: `Maximize ${bestCard.name} Usage`,
        description: `${bestCard.name} earns ${bestCard.cashBackPercent}% cashback. On your ${formatMoney(monthlySpending)}/month spending, you'd earn ${formatMoney(monthlyRewards)}/month.`,
        impact: 'medium',
        metric: `$${yearlyRewards.toFixed(2)}/year`,
        action: `Use ${bestCard.name} for as much spending as possible`,
        priority: 6,
      })
    }
  }

  // Annual fee vs value analysis
  const highFeeCards = accounts.filter(a => a.type === 'credit_card' && a.annualFee && a.annualFee > 0)
  
  highFeeCards.forEach(card => {
    const monthlySpendOnCard = monthlySpending * 0.4 // Assume 40% of spending on any one card
    const cashbackValue = ((card.cashBackPercent || 0) * monthlySpendOnCard * 12)
    const netValue = cashbackValue - (card.annualFee || 0)
    
    if (netValue < 0 && card.annualFee! > 50) {
      insights.push({
        type: 'warning',
        title: `Annual Fee Cost: ${card.name}`,
        description: `This card costs $${card.annualFee}/year. Estimated rewards only cover $${cashbackValue.toFixed(2)}, for a net loss of $${Math.abs(netValue).toFixed(2)}.`,
        impact: 'medium',
        metric: `-$${Math.abs(netValue).toFixed(2)}/year`,
        action: `Consider downgrading to no-fee version or canceling`,
        priority: 5,
      })
    }
  })

  // FDIC insurance coverage check
  const fdic = accounts
    .filter(a => (a.type === 'savings' || a.type === 'checking') && a.isFdic)
    .reduce((sum, a) => sum + (a.currentBalance || 0), 0)
  
  if (fdic > 250000) {
    insights.push({
      type: 'warning',
      title: 'FDIC Coverage Limit Exceeded',
      description: `Your FDIC-insured accounts total ${formatMoney(fdic)}, exceeding the $250,000 protection limit per bank.`,
      impact: 'high',
      metric: `${formatMoney(fdic - 250000)} uninsured`,
      action: 'Spread deposits across multiple banks',
      priority: 8,
    })
  }

  // Monthly fee analysis
  if (cashFlow.monthlyFeesTotal > 5) {
    insights.push({
      type: 'warning',
      title: 'Account Fees',
      description: `You're paying $${cashFlow.monthlyFeesTotal.toFixed(2)}/month ($${(cashFlow.monthlyFeesTotal * 12).toFixed(2)}/year) in account and credit card fees.`,
      impact: 'medium',
      metric: `$${(cashFlow.monthlyFeesTotal * 12).toFixed(2)}/year`,
      action: 'Switch to fee-free checking/savings accounts',
      priority: 4,
    })
  }

  // Net worth positive milestone
  if (netWorth.netWorth > 0) {
    const netWorthPercent = (netWorth.netWorth / netWorth.assets) * 100
    insights.push({
      type: 'info',
      title: 'Positive Net Worth',
      description: `You have ${formatMoney(netWorth.netWorth)} net worth. Assets: ${formatMoney(netWorth.assets)}, Liabilities: ${formatMoney(netWorth.liabilities)} (${netWorthPercent.toFixed(1)}% equity).`,
      impact: 'low',
      metric: `${formatMoney(netWorth.netWorth)}`,
      priority: 2,
    })
  }

  // Debt payoff opportunity
  if (netWorth.liabilities > 10000 && monthlySpending > 0) {
    const monthlyAvailable = netWorth.assets * 0.1 // Assume 10% of assets could be used
    const monthsToPayoff = netWorth.liabilities / monthlyAvailable
    
    insights.push({
      type: 'info',
      title: 'Debt Payoff Timeline',
      description: `At current asset levels, you could pay off ${formatMoney(netWorth.liabilities)} debt in ~${Math.ceil(monthsToPayoff)} months if you allocate ${formatMoney(monthlyAvailable)}/month.`,
      impact: 'low',
      metric: `${Math.ceil(monthsToPayoff)} months`,
      priority: 3,
    })
  }

  // Interest earned is significant
  if (cashFlow.monthlyInterestEarned > 25) {
    insights.push({
      type: 'info',
      title: 'Strong Interest Earnings',
      description: `Your savings are earning ${formatMoney(cashFlow.monthlyInterestEarned)}/month (${formatMoney(cashFlow.monthlyInterestEarned * 12)}/year). Great job finding high-yield accounts!`,
      impact: 'low',
      metric: `${formatMoney(cashFlow.monthlyInterestEarned * 12)}/year`,
      priority: 2,
    })
  }

  // Sort by priority
  return insights.sort((a, b) => b.priority - a.priority).slice(0, 10)
}

export function suggestCardStrategy(
  creditCards: Account[],
  monthlySpending: Record<string, number>
): { category: string; recommendedCard: Account | null; reason: string }[] {
  const strategies: { category: string; recommendedCard: Account | null; reason: string }[] = []

  // Common spending categories
  const categories = ['groceries', 'restaurants', 'travel', 'fuel', 'online', 'other']

  categories.forEach(category => {
    const spending = monthlySpending[category] || 0
    
    if (spending === 0) return

    // Find best card for this category
    let bestCard: Account | null = null
    let bestValue = 0

    creditCards.forEach(card => {
      let categoryBonus = 0
      const rewards = card.cashBackPercent || 0

      // Match card bonuses to categories (simplified)
      if (card.rewardsProgram) {
        const program = card.rewardsProgram.toLowerCase()
        if (category === 'groceries' && (program.includes('grocery') || program.includes('food'))) {
          categoryBonus = 2
        }
        if (category === 'travel' && program.includes('travel')) {
          categoryBonus = 3
        }
        if (category === 'restaurants' && (program.includes('dining') || program.includes('restaurant'))) {
          categoryBonus = 2
        }
      }

      const totalReward = (rewards + categoryBonus) * spending

      if (totalReward > bestValue) {
        bestValue = totalReward
        bestCard = card
      }
    })

    if (bestCard !== null) {
      const card = bestCard as Account
      strategies.push({
        category,
        recommendedCard: bestCard,
        reason: `${card.name} offers best rewards for ${category} spending`,
      })
    }
  })

  return strategies
}

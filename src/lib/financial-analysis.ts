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
  if (creditCardAnalysis.utilizationRate > 80) {
    insights.push({
      type: 'warning',
      title: 'High Credit Card Utilization',
      description: `You're using ${creditCardAnalysis.utilizationRate.toFixed(1)}% of your available credit. This impacts your credit score.`,
      impact: 'high',
      metric: `${creditCardAnalysis.utilizationRate.toFixed(1)}%`,
      action: 'Consider paying down balances to below 30% utilization',
      priority: 9,
    })
  }

  // Interest paid vs earned gap
  if (cashFlow.opportunityGap > 100) {
    insights.push({
      type: 'opportunity',
      title: 'Interest Paid vs Earned Gap',
      description: `You're paying $${cashFlow.monthlyInterestPaid.toFixed(2)}/month in interest but earning only $${cashFlow.monthlyInterestEarned.toFixed(2)}. Opportunity to optimize.`,
      impact: 'high',
      metric: `$${cashFlow.opportunityGap.toFixed(2)}/month`,
      action: 'Prioritize paying off high-interest debt or increase savings APY',
      priority: 8,
    })
  }

  // Reward optimization opportunity
  if (creditCardAnalysis.bestRewards && monthlySpending > 0) {
    const potentialMonthlyRewards = (monthlySpending * creditCardAnalysis.bestRewards.card.cashBackPercent! / 100)
    if (potentialMonthlyRewards > 20) {
      insights.push({
        type: 'opportunity',
        title: 'Maximize Rewards Usage',
        description: `Your ${creditCardAnalysis.bestRewards.card.name} card offers ${creditCardAnalysis.bestRewards.card.cashBackPercent}% cashback. You could earn ~$${(potentialMonthlyRewards * 12).toFixed(2)}/year.`,
        impact: 'medium',
        metric: `$${(potentialMonthlyRewards * 12).toFixed(2)}/year`,
        action: `Use ${creditCardAnalysis.bestRewards.card.name} for all eligible purchases`,
        priority: 6,
      })
    }
  }

  // Annual fee vs value analysis
  const highFeeCards = accounts.filter(
    a => a.type === 'credit_card' && a.annualFee && a.annualFee > 95
  )
  if (highFeeCards.length > 0) {
    highFeeCards.forEach(card => {
      if (card.cashBackPercent && card.cashBackPercent > 0) {
        const breakeven = (card.annualFee! / card.cashBackPercent) * 100
        if (breakeven > monthlySpending * 12) {
          insights.push({
            type: 'warning',
            title: `Annual Fee Not Worth It: ${card.name}`,
            description: `This card costs $${card.annualFee}/year but you need $${breakeven.toFixed(0)}/year in spending to break even on rewards.`,
            impact: 'medium',
            metric: `$${card.annualFee}/year`,
            action: `Consider downgrading or canceling this card`,
            priority: 5,
          })
        }
      }
    })
  }

  // FDIC insurance coverage check
  const savingsAccountsTotal = accounts
    .filter(a => (a.type === 'savings' || a.type === 'checking') && a.isFdic)
    .reduce((sum, a) => sum + (a.currentBalance || 0), 0)
  
  if (savingsAccountsTotal > 250000) {
    insights.push({
      type: 'warning',
      title: 'FDIC Coverage Limit Exceeded',
      description: `Your FDIC-insured accounts total $${savingsAccountsTotal.toFixed(0)}, exceeding the $250,000 protection limit per bank.`,
      impact: 'high',
      metric: `$${(savingsAccountsTotal - 250000).toFixed(0)} uninsured`,
      action: 'Spread deposits across multiple banks or use money market accounts',
      priority: 7,
    })
  }

  // Low-interest checking account detection
  const lowYieldAccounts = accounts.filter(
    a => a.type === 'checking' && (!a.interestRateApy || a.interestRateApy < 0.5) && (a.currentBalance || 0) > 10000
  )
  if (lowYieldAccounts.length > 0) {
    insights.push({
      type: 'opportunity',
      title: 'Optimize Checking Account Yield',
      description: `You have $${lowYieldAccounts.reduce((sum, a) => sum + (a.currentBalance || 0), 0).toFixed(0)} in low-yield checking. High-yield alternatives offer 4-5% APY.`,
      impact: 'medium',
      metric: `Potential extra: $${((lowYieldAccounts.reduce((sum, a) => sum + (a.currentBalance || 0), 0) * 0.045) / 12).toFixed(2)}/month`,
      action: 'Move excess to high-yield savings account',
      priority: 6,
    })
  }

  // Monthly fee analysis
  if (cashFlow.monthlyFeesTotal > 20) {
    insights.push({
      type: 'warning',
      title: 'High Monthly Fees',
      description: `You're paying $${cashFlow.monthlyFeesTotal.toFixed(2)}/month in fees ($${(cashFlow.monthlyFeesTotal * 12).toFixed(2)}/year).`,
      impact: 'medium',
      metric: `$${(cashFlow.monthlyFeesTotal * 12).toFixed(2)}/year`,
      action: 'Review account fees and switch to fee-free alternatives where possible',
      priority: 5,
    })
  }

  // Net worth milestone tracking
  if (netWorth.netWorth > 0) {
    insights.push({
      type: 'info',
      title: 'Net Worth Status',
      description: `Your current net worth is $${netWorth.netWorth.toFixed(2)} (Assets: $${netWorth.assets.toFixed(2)}, Liabilities: $${netWorth.liabilities.toFixed(2)}).`,
      impact: 'low',
      metric: `$${netWorth.netWorth.toFixed(2)}`,
      priority: 2,
    })
  }

  // Sort by priority
  return insights.sort((a, b) => b.priority - a.priority)
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

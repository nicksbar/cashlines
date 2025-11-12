/**
 * Forecast utilities for recurring expenses
 * Calculates expected monthly totals and compares against actual spending
 */

interface RecurringExpense {
  id: string
  description: string
  amount: number
  frequency: string
  dueDay?: number | null
  isActive: boolean
  nextDueDate: Date | string
}

/**
 * Calculate the normalized monthly cost for a recurring expense
 * Converts all frequencies to a monthly equivalent
 */
export function getMonthlyAmount(expense: RecurringExpense): number {
  if (!expense.isActive) return 0

  switch (expense.frequency) {
    case 'daily':
      return expense.amount * (365 / 12) // Average days per month
    case 'weekly':
      return expense.amount * (52 / 12) // Average weeks per month
    case 'monthly':
      return expense.amount
    case 'yearly':
      return expense.amount / 12 // Annual divided by 12 months
    default:
      return expense.amount
  }
}

/**
 * Calculate total expected spending for a given month
 * Includes all active recurring expenses that apply to that month
 */
export function getExpectedMonthlyTotal(
  expenses: RecurringExpense[],
  year: number,
  month: number // 0-indexed (0 = January, 11 = December)
): number {
  return expenses.reduce((total, expense) => {
    if (!expense.isActive) return total

    switch (expense.frequency) {
      case 'daily':
        // Daily expenses occur every day
        return total + expense.amount * (365 / 12)

      case 'weekly':
        // Weekly expenses occur ~4.33 times per month
        return total + expense.amount * (52 / 12)

      case 'monthly':
        // Monthly expenses occur once per month
        return total + expense.amount

      case 'yearly':
        // Yearly expenses occur once per year
        // Only count if this is the correct month
        const nextDue = new Date(expense.nextDueDate)
        if (nextDue.getFullYear() === year && nextDue.getMonth() === month) {
          return total + expense.amount
        }
        return total

      default:
        return total
    }
  }, 0)
}

/**
 * Calculate the next due date for a recurring expense
 * @param frequency - 'daily', 'weekly', 'monthly', or 'yearly'
 * @param dueDay - Day of month (1-31) for monthly expenses
 * @param fromDate - Date to calculate from (defaults to today)
 */
export function calculateNextDueDate(
  frequency: string,
  dueDay?: number | null,
  fromDate: Date = new Date()
): Date {
  const nextDate = new Date(fromDate)

  switch (frequency) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + 1)
      break

    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7)
      break

    case 'monthly':
      if (dueDay) {
        nextDate.setDate(dueDay)
        // If the due day has already passed this month, move to next month
        if (nextDate <= fromDate) {
          nextDate.setMonth(nextDate.getMonth() + 1)
          nextDate.setDate(dueDay)
        }
      } else {
        // Default to same day next month
        nextDate.setMonth(nextDate.getMonth() + 1)
      }
      break

    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + 1)
      break

    default:
      // Default to monthly
      nextDate.setMonth(nextDate.getMonth() + 1)
  }

  return nextDate
}

/**
 * Get all recurring expenses due in a specific month
 */
export function getExpensesDueInMonth(
  expenses: RecurringExpense[],
  year: number,
  month: number // 0-indexed
): RecurringExpense[] {
  return expenses.filter((expense) => {
    if (!expense.isActive) return false

    const nextDue = new Date(expense.nextDueDate)
    return nextDue.getFullYear() === year && nextDue.getMonth() === month
  })
}

/**
 * Compare expected recurring expenses against actual credit card spending
 */
export interface SpendingForecast {
  expectedTotal: number
  actualTotal: number
  difference: number
  percentDifference: number
  status: 'on-track' | 'under' | 'over'
}

export function compareForecast(
  expectedTotal: number,
  actualTotal: number,
  threshold: number = 0.1 // 10% threshold
): SpendingForecast {
  const difference = actualTotal - expectedTotal
  const percentDifference = expectedTotal > 0 ? (difference / expectedTotal) * 100 : 0

  let status: 'on-track' | 'under' | 'over'
  if (Math.abs(percentDifference) <= threshold * 100) {
    status = 'on-track'
  } else if (difference > 0) {
    status = 'over'
  } else {
    status = 'under'
  }

  return {
    expectedTotal,
    actualTotal,
    difference,
    percentDifference,
    status,
  }
}

/**
 * Format forecast status for display
 */
export function formatForecastStatus(forecast: SpendingForecast): string {
  switch (forecast.status) {
    case 'on-track':
      return '✓ On track'
    case 'under':
      return `↓ Under by ${Math.abs(forecast.difference).toFixed(2)}`
    case 'over':
      return `↑ Over by ${forecast.difference.toFixed(2)}`
    default:
      return 'Unknown'
  }
}

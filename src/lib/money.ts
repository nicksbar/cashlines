/**
 * Money utilities for formatting and calculations
 */

export function formatCurrency(amount: number, decimals = 2): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount)
}

export function parseAmount(str: string): number {
  // Remove currency symbols and parse
  const cleaned = str.replace(/[^0-9.-]/g, '')
  return parseFloat(cleaned) || 0
}

export function roundAmount(amount: number, decimals = 2): number {
  const factor = Math.pow(10, decimals)
  return Math.round(amount * factor) / factor
}

export function calculatePercent(percent: number, total: number): number {
  return roundAmount((percent / 100) * total)
}

export function calculatePercentOf(amount: number, total: number): number {
  if (total === 0) return 0
  return roundAmount((amount / total) * 100)
}

export function sumAmounts(amounts: number[]): number {
  return roundAmount(amounts.reduce((sum, a) => sum + a, 0))
}

export function groupByProperty<T, K extends string | number>(
  items: T[],
  key: (item: T) => K
): Map<K, T[]> {
  const groups = new Map<K, T[]>()
  items.forEach((item) => {
    const k = key(item)
    if (!groups.has(k)) {
      groups.set(k, [])
    }
    groups.get(k)!.push(item)
  })
  return groups
}

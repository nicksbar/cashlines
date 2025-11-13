// Account types
export const ACCOUNT_TYPES = {
  CHECKING: 'checking',
  SAVINGS: 'savings',
  CREDIT_CARD: 'credit_card',
  CASH: 'cash',
  INVESTMENT: 'investment',
  LOAN: 'loan',
  OTHER: 'other',
} as const

export const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  checking: 'Checking',
  savings: 'Savings',
  credit_card: 'Credit Card',
  cash: 'Cash',
  investment: 'Investment',
  loan: 'Loan',
  other: 'Other',
}

// Transaction methods
export const TRANSACTION_METHODS = {
  CREDIT_CARD: 'cc',
  CASH: 'cash',
  ACH: 'ach',
  OTHER: 'other',
} as const

export const TRANSACTION_METHOD_LABELS: Record<string, string> = {
  cc: 'Credit Card',
  cash: 'Cash',
  ach: 'ACH',
  other: 'Other',
}

// Split types (how money is categorized)
export const SPLIT_TYPES = {
  NEED: 'need',
  WANT: 'want',
  DEBT: 'debt',
  TAX: 'tax',
  SAVINGS: 'savings',
  OTHER: 'other',
} as const

export const SPLIT_TYPE_LABELS: Record<string, string> = {
  need: 'Need',
  want: 'Want',
  debt: 'Debt',
  tax: 'Tax',
  savings: 'Savings',
  other: 'Other',
}

// Common tag prefixes for filtering
export const TAG_PREFIXES = {
  TAX: 'tax',
  RECURRING: 'recurring',
  CATEGORY: 'category',
} as const

export const TRANSACTION_TYPES = {
  EXPENSE: 'EXPENSE',
  TRANSFER: 'TRANSFER',
} as const

export const ROUTING_TYPES = {
  CREDIT_CARD: 'CREDIT_CARD',
  CASH: 'CASH',
  SAVINGS: 'SAVINGS',
  CHECKING: 'CHECKING',
} as const

export const ROUTING_LABELS: Record<string, string> = {
  CREDIT_CARD: 'Credit Card',
  CASH: 'Cash',
  SAVINGS: 'Savings',
  CHECKING: 'Checking',
}

export const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  EXPENSE: 'Expense',
  TRANSFER: 'Transfer',
}

export const TAX_CATEGORIES = [
  'Business Expense',
  'Medical',
  'Charitable Donation',
  'Education',
  'Home Office',
  'Investment',
  'Other',
] as const

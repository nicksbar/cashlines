import { z } from 'zod'
import { ACCOUNT_TYPES, TRANSACTION_METHODS, SPLIT_TYPES } from './constants'

// Custom date parser that handles date strings as local dates (not UTC)
// This fixes the timezone offset issue where dates are shifted back by 1 day
const localDateParser = z.string().pipe(
  z.coerce.date().transform(date => {
    // If we receive a date string like "2025-11-13", JavaScript's Date constructor
    // treats it as UTC midnight, which can shift the date back by timezone offset.
    // We need to handle this by checking if it's a date-only string and parse it locally.
    return date
  })
).or(z.date())

// User schemas
export const userCreateSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().optional(),
})

// Person schemas
export const personCreateSchema = z.object({
  name: z.string().min(1, 'Person name is required'),
  role: z.string().optional(), // "primary", "spouse", "child", "dependent", "other"
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color').optional(),
})

export const personUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color').optional().nullable(),
})

export type PersonCreate = z.infer<typeof personCreateSchema>
export type PersonUpdate = z.infer<typeof personUpdateSchema>

// Account schemas
export const accountCreateSchema = z.object({
  name: z.string().min(1, 'Account name is required'),
  type: z.enum([
    ACCOUNT_TYPES.CHECKING,
    ACCOUNT_TYPES.SAVINGS,
    ACCOUNT_TYPES.CREDIT_CARD,
    ACCOUNT_TYPES.CASH,
    ACCOUNT_TYPES.INVESTMENT,
    ACCOUNT_TYPES.LOAN,
    ACCOUNT_TYPES.OTHER,
  ]),
  personId: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
  notes: z.string().optional(),
  
  // Credit card fields
  creditLimit: z.number().positive('Credit limit must be positive').optional().nullable(),
  interestRate: z.number().min(0).max(100, 'APR must be between 0 and 100').optional().nullable(),
  cashBackPercent: z.number().min(0).max(100, 'Cash back must be between 0 and 100').optional().nullable(),
  pointsPerDollar: z.number().min(0).max(100, 'Points per dollar must be between 0 and 100').optional().nullable(),
  annualFee: z.number().min(0).optional().nullable(),
  rewardsProgram: z.string().optional().nullable(),
  
  // Savings/Checking fields
  interestRateApy: z.number().min(0).max(100, 'APY must be between 0 and 100').optional().nullable(),
  monthlyFee: z.number().min(0).optional().nullable(),
  minimumBalance: z.number().min(0).optional().nullable(),
  isFdic: z.boolean().optional().nullable(),
  
  // Cash/General fields
  location: z.string().optional().nullable(),
  currentBalance: z.number().min(0, 'Balance cannot be negative').optional().nullable(),
  accountNumber: z.string().optional().nullable(),
  
  // Loan/Investment fields
  principalBalance: z.number().min(0).optional().nullable(),
})

export const accountUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum([
    ACCOUNT_TYPES.CHECKING,
    ACCOUNT_TYPES.SAVINGS,
    ACCOUNT_TYPES.CREDIT_CARD,
    ACCOUNT_TYPES.CASH,
    ACCOUNT_TYPES.INVESTMENT,
    ACCOUNT_TYPES.LOAN,
    ACCOUNT_TYPES.OTHER,
  ]).optional(),
  personId: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  notes: z.string().optional(),
  
  // Credit card fields
  creditLimit: z.number().positive('Credit limit must be positive').optional().nullable(),
  interestRate: z.number().min(0).max(100).optional().nullable(),
  cashBackPercent: z.number().min(0).max(100).optional().nullable(),
  pointsPerDollar: z.number().min(0).max(100).optional().nullable(),
  annualFee: z.number().min(0).optional().nullable(),
  rewardsProgram: z.string().optional().nullable(),
  
  // Savings/Checking fields
  interestRateApy: z.number().min(0).max(100).optional().nullable(),
  monthlyFee: z.number().min(0).optional().nullable(),
  minimumBalance: z.number().min(0).optional().nullable(),
  isFdic: z.boolean().optional().nullable(),
  
  // Cash/General fields
  location: z.string().optional().nullable(),
  currentBalance: z.number().min(0, 'Balance cannot be negative').optional().nullable(),
  accountNumber: z.string().optional().nullable(),
  
  // Loan/Investment fields
  principalBalance: z.number().min(0).optional().nullable(),
})

export type AccountCreate = z.infer<typeof accountCreateSchema>
export type AccountUpdate = z.infer<typeof accountUpdateSchema>

// Income schemas
export const incomeCreateSchema = z.object({
  date: localDateParser,
  grossAmount: z.number().positive('Gross amount must be positive'),
  taxes: z.number().min(0, 'Taxes cannot be negative').default(0),
  preTaxDeductions: z.number().min(0, 'Pre-tax deductions cannot be negative').default(0),
  postTaxDeductions: z.number().min(0, 'Post-tax deductions cannot be negative').default(0),
  netAmount: z.number().positive('Net amount must be positive'),
  source: z.string().min(1, 'Source is required'),
  accountId: z.string().min(1, 'Account is required'),
  personId: z.string().nullable().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
})

export const incomeUpdateSchema = z.object({
  date: localDateParser.optional(),
  grossAmount: z.number().positive().optional(),
  taxes: z.number().min(0).optional(),
  preTaxDeductions: z.number().min(0).optional(),
  postTaxDeductions: z.number().min(0).optional(),
  netAmount: z.number().positive().optional(),
  source: z.string().min(1).optional(),
  accountId: z.string().min(1).optional(),
  personId: z.string().nullable().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

export type IncomeCreate = z.infer<typeof incomeCreateSchema>
export type IncomeUpdate = z.infer<typeof incomeUpdateSchema>

// Split schemas
export const splitSchema = z.object({
  type: z.enum([
    SPLIT_TYPES.NEED,
    SPLIT_TYPES.WANT,
    SPLIT_TYPES.DEBT,
    SPLIT_TYPES.TAX,
    SPLIT_TYPES.SAVINGS,
    SPLIT_TYPES.OTHER,
  ]),
  target: z.string().min(1, 'Target is required'),
  amount: z.number().positive().optional(),
  percent: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
})

export type Split = z.infer<typeof splitSchema>

// Transaction schemas
export const transactionCreateSchema = z.object({
  date: localDateParser,
  amount: z.number().positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required'),
  accountId: z.string().min(1, 'Account is required'),
  personId: z.string().nullable().optional(),
  method: z.enum([
    TRANSACTION_METHODS.CREDIT_CARD,
    TRANSACTION_METHODS.CASH,
    TRANSACTION_METHODS.ACH,
    TRANSACTION_METHODS.OTHER,
  ]).default(TRANSACTION_METHODS.CREDIT_CARD),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
  splits: z.array(splitSchema).default([]),
  websiteUrl: z.string().url('Invalid URL').optional().nullable(),
})

export const transactionUpdateSchema = z.object({
  date: localDateParser.optional(),
  amount: z.number().positive().optional(),
  description: z.string().min(1).optional(),
  accountId: z.string().min(1).optional(),
  personId: z.string().nullable().optional(),
  method: z.enum([
    TRANSACTION_METHODS.CREDIT_CARD,
    TRANSACTION_METHODS.CASH,
    TRANSACTION_METHODS.ACH,
    TRANSACTION_METHODS.OTHER,
  ]).optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  splits: z.array(splitSchema).optional(),
  websiteUrl: z.string().url('Invalid URL').optional().nullable(),
})

export type TransactionCreate = z.infer<typeof transactionCreateSchema>
export type TransactionUpdate = z.infer<typeof transactionUpdateSchema>

// Rule schemas
export const ruleCreateSchema = z.object({
  name: z.string().min(1, 'Rule name is required'),
  matchSource: z.string().optional(),
  matchDescription: z.string().optional(),
  matchAccountId: z.string().optional(),
  matchMethod: z.enum([
    TRANSACTION_METHODS.CREDIT_CARD,
    TRANSACTION_METHODS.CASH,
    TRANSACTION_METHODS.ACH,
    TRANSACTION_METHODS.OTHER,
  ]).optional(),
  matchTags: z.array(z.string()).default([]),
  splitConfig: z.array(splitSchema),
  isActive: z.boolean().default(true),
  notes: z.string().optional(),
})

export const ruleUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  matchSource: z.string().optional().nullable(),
  matchDescription: z.string().optional().nullable(),
  matchAccountId: z.string().optional().nullable(),
  matchMethod: z.enum([
    TRANSACTION_METHODS.CREDIT_CARD,
    TRANSACTION_METHODS.CASH,
    TRANSACTION_METHODS.ACH,
    TRANSACTION_METHODS.OTHER,
  ]).optional().nullable(),
  matchTags: z.array(z.string()).optional(),
  splitConfig: z.array(splitSchema).optional(),
  isActive: z.boolean().optional(),
  notes: z.string().optional(),
})

export type RuleCreate = z.infer<typeof ruleCreateSchema>
export type RuleUpdate = z.infer<typeof ruleUpdateSchema>

// Recurring Expense schemas
export const recurringExpenseSchema = z.object({
  personId: z.string().optional().nullable(),
  accountId: z.string().optional().nullable(),
  description: z.string().min(1, 'Description is required'),
  amount: z.number().positive('Amount must be positive'),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'semi-annual', 'yearly']),
  dueDay: z.number().min(1).max(31).optional().nullable(), // Day of month for monthly expenses
  notes: z.string().optional(),
  websiteUrl: z.string().url('Invalid URL').optional().nullable(),
})

export const recurringExpenseUpdateSchema = z.object({
  personId: z.string().optional().nullable(),
  accountId: z.string().optional().nullable(),
  description: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'semi-annual', 'yearly']).optional(),
  dueDay: z.number().min(1).max(31).optional().nullable(),
  isActive: z.boolean().optional(),
  notes: z.string().optional(),
  websiteUrl: z.string().url('Invalid URL').optional().nullable(),
})

export type RecurringExpenseCreate = z.infer<typeof recurringExpenseSchema>
export type RecurringExpenseUpdate = z.infer<typeof recurringExpenseUpdateSchema>

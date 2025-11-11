import { z } from 'zod'
import { ACCOUNT_TYPES, TRANSACTION_METHODS, SPLIT_TYPES } from './constants'

// User schemas
export const userCreateSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().optional(),
})

// Account schemas
export const accountCreateSchema = z.object({
  name: z.string().min(1, 'Account name is required'),
  type: z.enum([
    ACCOUNT_TYPES.CHECKING,
    ACCOUNT_TYPES.SAVINGS,
    ACCOUNT_TYPES.CREDIT_CARD,
    ACCOUNT_TYPES.CASH,
    ACCOUNT_TYPES.OTHER,
  ]),
  isActive: z.boolean().default(true),
  notes: z.string().optional(),
})

export const accountUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum([
    ACCOUNT_TYPES.CHECKING,
    ACCOUNT_TYPES.SAVINGS,
    ACCOUNT_TYPES.CREDIT_CARD,
    ACCOUNT_TYPES.CASH,
    ACCOUNT_TYPES.OTHER,
  ]).optional(),
  isActive: z.boolean().optional(),
  notes: z.string().optional(),
})

export type AccountCreate = z.infer<typeof accountCreateSchema>
export type AccountUpdate = z.infer<typeof accountUpdateSchema>

// Income schemas
export const incomeCreateSchema = z.object({
  date: z.coerce.date(),
  grossAmount: z.number().positive('Gross amount must be positive'),
  taxes: z.number().min(0, 'Taxes cannot be negative').default(0),
  preTaxDeductions: z.number().min(0, 'Pre-tax deductions cannot be negative').default(0),
  postTaxDeductions: z.number().min(0, 'Post-tax deductions cannot be negative').default(0),
  netAmount: z.number().positive('Net amount must be positive'),
  source: z.string().min(1, 'Source is required'),
  accountId: z.string().min(1, 'Account is required'),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
})

export const incomeUpdateSchema = z.object({
  date: z.coerce.date().optional(),
  grossAmount: z.number().positive().optional(),
  taxes: z.number().min(0).optional(),
  preTaxDeductions: z.number().min(0).optional(),
  postTaxDeductions: z.number().min(0).optional(),
  netAmount: z.number().positive().optional(),
  source: z.string().min(1).optional(),
  accountId: z.string().min(1).optional(),
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
  date: z.coerce.date(),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required'),
  accountId: z.string().min(1, 'Account is required'),
  method: z.enum([
    TRANSACTION_METHODS.CREDIT_CARD,
    TRANSACTION_METHODS.CASH,
    TRANSACTION_METHODS.ACH,
    TRANSACTION_METHODS.OTHER,
  ]).default(TRANSACTION_METHODS.CREDIT_CARD),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
  splits: z.array(splitSchema).default([]),
})

export const transactionUpdateSchema = z.object({
  date: z.coerce.date().optional(),
  amount: z.number().positive().optional(),
  description: z.string().min(1).optional(),
  accountId: z.string().min(1).optional(),
  method: z.enum([
    TRANSACTION_METHODS.CREDIT_CARD,
    TRANSACTION_METHODS.CASH,
    TRANSACTION_METHODS.ACH,
    TRANSACTION_METHODS.OTHER,
  ]).optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  splits: z.array(splitSchema).optional(),
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

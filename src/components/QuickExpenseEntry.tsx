'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, AlertCircle, CheckCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/money'

interface RecurringExpense {
  id: string
  description: string
  amount: number
  accountId: string | null
  frequency: string
  dueDay: number | null
  nextDueDate: string
  isActive: boolean
  notes: string | null
  account?: {
    id: string
    name: string
  }
}

interface Account {
  id: string
  name: string
  type: string
  isActive: boolean
}

interface QuickExpenseEntryProps {
  isOpen: boolean
  onClose: () => void
  householdId?: string
}

export function QuickExpenseEntry({
  isOpen,
  onClose,
  householdId,
}: QuickExpenseEntryProps) {
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<RecurringExpense | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state for the selected expense
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    description: '',
    accountId: '',
    method: 'cc',
    notes: '',
  })

  // Filter accounts based on payment method
  const getFilteredAccounts = (method: string) => {
    const methodToTypeMap: { [key: string]: string[] } = {
      cc: ['credit_card'],
      cash: ['cash'],
      ach: ['checking', 'savings'],
      other: ['checking', 'savings', 'credit_card', 'cash', 'other'],
    }

    const allowedTypes = methodToTypeMap[method] || []
    return accounts.filter(
      (account) => account.isActive && allowedTypes.includes(account.type)
    )
  }

  const fetchData = useCallback(async function() {
    try {
      setLoading(true)
      setError(null)
      const headers: Record<string, string> = householdId 
        ? { 'x-household-id': householdId }
        : {}

      const [expensesRes, accountsRes] = await Promise.all([
        fetch('/api/recurring-expenses', { headers }),
        fetch('/api/accounts', { headers }),
      ])

      if (expensesRes.ok) {
        const expenses = await expensesRes.json()
        const activeExpenses = expenses.filter((e: RecurringExpense) => e.isActive)
        setRecurringExpenses(activeExpenses)
      }

      if (accountsRes.ok) {
        const accts = await accountsRes.json()
        setAccounts(accts.filter((a: Account) => a.isActive))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [householdId])

  useEffect(() => {
    if (isOpen) {
      fetchData()
    }
  }, [isOpen, householdId, fetchData])

  function selectExpense(expense: RecurringExpense) {
    setSelectedExpense(expense)
    setFormData({
      date: new Date().toISOString().split('T')[0],
      amount: expense.amount.toString(),
      description: expense.description,
      accountId: expense.accountId || '',
      method: 'cc',
      notes: expense.notes || '',
    })
    setSubmitted(false)
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedExpense) return

    try {
      setSubmitting(true)
      setError(null)

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      if (householdId) {
        headers['x-household-id'] = householdId
      }

      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          date: formData.date,
          amount: parseFloat(formData.amount),
          description: formData.description,
          method: formData.method,
          accountId: formData.accountId,
          notes: formData.notes ? `${formData.notes}\n[From recurring: ${selectedExpense.description}]` : `[From recurring: ${selectedExpense.description}]`,
          tags: ['recurring'],
          splits: [
            {
              type: 'need',
              target: '',
              percent: 100,
            },
          ],
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create transaction')
      }

      setSubmitted(true)
      setTimeout(() => {
        handleReset()
        onClose()
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  function handleReset() {
    setSelectedExpense(null)
    setFormData({
      date: new Date().toISOString().split('T')[0],
      amount: '',
      description: '',
      accountId: '',
      method: 'cc',
      notes: '',
    })
    setSubmitted(false)
    setError(null)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Quick Log Expense</CardTitle>
            <CardDescription>Log a payment from your recurring bills</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <div className="flex gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {submitted && (
            <div className="flex gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              <p className="text-sm text-green-700 dark:text-green-300">Expense logged successfully!</p>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8 text-slate-600 dark:text-slate-400">
              Loading recurring expenses...
            </div>
          ) : !selectedExpense ? (
            <div className="space-y-3">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Select a recurring bill to log a payment:
              </p>
              {recurringExpenses.length === 0 ? (
                <div className="py-6 text-center text-slate-500 dark:text-slate-400">
                  <p>No active recurring expenses found.</p>
                  <p className="text-sm">Create one on the Recurring Bills page first.</p>
                </div>
              ) : (
                <div className="grid gap-2">
                  {recurringExpenses.map((expense) => (
                    <button
                      key={expense.id}
                      onClick={() => selectExpense(expense)}
                      className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100">
                            {expense.description}
                          </p>
                          {expense.account && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              {expense.account.name}
                            </p>
                          )}
                        </div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                          {formatCurrency(expense.amount)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                  Logging: {selectedExpense.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="method">Payment Method</Label>
                  <select
                    id="method"
                    value={formData.method}
                    onChange={(e) => setFormData({ ...formData, method: e.target.value, accountId: '' })}
                    className="flex h-10 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                  >
                    <option value="cc">Credit Card</option>
                    <option value="cash">Cash</option>
                    <option value="ach">ACH</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="accountId">Account</Label>
                  <select
                    id="accountId"
                    value={formData.accountId}
                    onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                  >
                    <option value="">Select account</option>
                    {getFilteredAccounts(formData.method).map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes (optional)"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedExpense(null)}
                  disabled={submitting}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || !formData.accountId}
                  className="flex-1"
                >
                  {submitting ? 'Logging...' : 'Log Expense'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

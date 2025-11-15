'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { InfoTooltip } from '@/components/InfoTooltip'
import { formatCurrency } from '@/lib/money'
import { formatDateString } from '@/lib/date'
import { Trash2, Plus, AlertCircle, Zap } from 'lucide-react'
import { QuickExpenseEntry } from '@/components/QuickExpenseEntry'
import { useUser } from '@/lib/UserContext'

interface RecurringExpense {
  id: string
  userId: string
  accountId: string | null
  description: string
  amount: number
  frequency: string
  dueDay: number | null
  nextDueDate: string
  isActive: boolean
  notes: string | null
  websiteUrl?: string | null
  account?: {
    id: string
    name: string
  }
  createdAt: string
  updatedAt: string
}

interface Account {
  id: string
  name: string
  type: string
  isActive: boolean
}

interface Person {
  id: string
  name: string
  role?: string
  color?: string
}

export default function RecurringExpensesPage() {
  const { currentHousehold } = useUser()
  const [expenses, setExpenses] = useState<RecurringExpense[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [people, setPeople] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showQuickEntry, setShowQuickEntry] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; description: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    personId: '',
    accountId: '',
    description: '',
    amount: '',
    frequency: 'monthly',
    dueDay: '',
    notes: '',
    websiteUrl: '',
  })

  const fetchExpenses = useCallback(async function() {
    if (!currentHousehold) return

    try {
      setLoading(true)
      const response = await fetch('/api/recurring-expenses', {
        headers: { 'x-household-id': currentHousehold.id },
      })
      if (!response.ok) throw new Error('Failed to fetch expenses')
      const data = await response.json()
      setExpenses(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [currentHousehold])

  const fetchAccounts = useCallback(async function() {
    if (!currentHousehold) return

    try {
      const response = await fetch('/api/accounts', {
        headers: { 'x-household-id': currentHousehold.id },
      })
      if (!response.ok) throw new Error('Failed to fetch accounts')
      const data = await response.json()
      setAccounts(data.filter((a: Account) => a.isActive))
    } catch (err) {
      console.error('Error fetching accounts:', err)
    }
  }, [currentHousehold])

  const fetchPeople = useCallback(async function() {
    if (!currentHousehold) return

    try {
      const response = await fetch('/api/people', {
        headers: { 'x-household-id': currentHousehold.id },
      })
      if (!response.ok) throw new Error('Failed to fetch people')
      const data = await response.json()
      setPeople(data)
    } catch (err) {
      console.error('Error fetching people:', err)
    }
  }, [currentHousehold])

  useEffect(() => {
    if (currentHousehold) {
      fetchExpenses()
      fetchAccounts()
      fetchPeople()
    }
  }, [currentHousehold, fetchExpenses, fetchAccounts, fetchPeople])

  function resetForm() {
    setFormData({
      personId: '',
      accountId: '',
      description: '',
      amount: '',
      frequency: 'monthly',
      dueDay: '',
      notes: '',
      websiteUrl: '',
    })
    setEditingId(null)
    setShowForm(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!currentHousehold) return

    const payload: any = {
      description: formData.description,
      amount: parseFloat(formData.amount),
      frequency: formData.frequency,
    }

    // Only include optional fields if they have values
    if (formData.personId) {
      payload.personId = formData.personId
    }
    if (formData.accountId) {
      payload.accountId = formData.accountId
    }
    if (formData.dueDay) {
      payload.dueDay = parseInt(formData.dueDay)
    }
    if (formData.notes) {
      payload.notes = formData.notes
    }
    if (formData.websiteUrl) {
      payload.websiteUrl = formData.websiteUrl
    }

    try {
      const headers = {
        'Content-Type': 'application/json',
        'x-household-id': currentHousehold.id,
      }

      if (editingId) {
        // Update
        const response = await fetch(`/api/recurring-expenses/${editingId}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(payload),
        })
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to update expense')
        }
      } else {
        // Create
        const response = await fetch('/api/recurring-expenses', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            ...payload,
            accountId: formData.accountId || null,
          }),
        })
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to create expense')
        }
      }
      await fetchExpenses()
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  async function handleDelete(id: string) {
    if (!currentHousehold) return

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/recurring-expenses/${id}`, {
        method: 'DELETE',
        headers: { 'x-household-id': currentHousehold.id },
      })
      if (!response.ok) throw new Error('Failed to delete expense')
      await fetchExpenses()
      setDeleteConfirm(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsDeleting(false)
    }
  }

  function handleEdit(expense: RecurringExpense) {
    setFormData({
      personId: (expense as any).personId || '',
      accountId: expense.accountId || '',
      description: expense.description,
      amount: expense.amount.toString(),
      frequency: expense.frequency,
      dueDay: expense.dueDay?.toString() || '',
      notes: expense.notes || '',
      websiteUrl: expense.websiteUrl || '',
    })
    setEditingId(expense.id)
    setShowForm(true)
  }

  const totalMonthly = expenses.reduce((sum, exp) => {
    // Simple calculation: assume all are monthly for now
    if (exp.frequency === 'monthly') return sum + exp.amount
    if (exp.frequency === 'yearly') return sum + exp.amount / 12
    if (exp.frequency === 'weekly') return sum + exp.amount * (52 / 12)
    if (exp.frequency === 'daily') return sum + exp.amount * (365 / 12)
    return sum
  }, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold dark:text-slate-100">Recurring Expenses</h1>
          <InfoTooltip
            title="Recurring Expenses"
            description="Track fixed monthly bills and recurring charges. Use this to forecast expected spending and compare against credit card statements."
            examples={['T-Mobile bill: $75/month on 15th', 'Insurance: $120/month', 'Rent: $1,500/month on 1st']}
          />
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowQuickEntry(true)}
            className="dark:bg-amber-700 dark:text-slate-100 dark:hover:bg-amber-600"
          >
            <Zap className="w-4 h-4 mr-2" />
            Quick Log
          </Button>
          <Button
            onClick={() => {
              resetForm()
              setShowForm(!showForm)
            }}
            className="dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            {showForm ? 'Cancel' : 'Add Expense'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded flex gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4 dark:text-slate-100">
              {editingId ? 'Edit Recurring Expense' : 'New Recurring Expense'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="dark:text-slate-300">Description *</Label>
                  <Input
                    type="text"
                    value={formData.description}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="e.g., T-Mobile Bill"
                    required
                    className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400"
                  />
                </div>
                <div>
                  <Label className="dark:text-slate-300">Amount *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    required
                    className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="dark:text-slate-300">Frequency *</Label>
                  <select
                    value={formData.frequency}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, frequency: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly (Every 3 Months)</option>
                    <option value="semi-annual">Semi-Annual (Every 6 Months)</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                {formData.frequency === 'monthly' && (
                  <div>
                    <Label className="dark:text-slate-300">Due Day (1-31)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="31"
                      value={formData.dueDay}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, dueDay: e.target.value })}
                      placeholder="15"
                      className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="dark:text-slate-300">Account (Optional)</Label>
                  <select
                    value={formData.accountId}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, accountId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                  >
                    <option value="">-- No Account --</option>
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="dark:text-slate-300">Person (Optional)</Label>
                  <select
                    value={formData.personId}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, personId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                  >
                    <option value="">-- No Person --</option>
                    {people.map((person) => (
                      <option key={person.id} value={person.id}>
                        {person.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label className="dark:text-slate-300">Notes (Optional)</Label>
                <Input
                  type="text"
                  value={formData.notes}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes..."
                  className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400"
                />
              </div>

              <div>
                <Label className="dark:text-slate-300">Website URL (Optional)</Label>
                <Input
                  type="url"
                  value={formData.websiteUrl}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, websiteUrl: e.target.value })}
                  placeholder="https://example.com"
                  className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  className="flex-1 dark:bg-green-700 dark:text-white dark:hover:bg-green-600"
                >
                  {editingId ? 'Update' : 'Create'}
                </Button>
                <Button
                  type="button"
                  onClick={resetForm}
                  variant="outline"
                  className="flex-1 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-600"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      {!loading && expenses.length > 0 && (
        <Card className="dark:bg-blue-900/30 dark:border-blue-800 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <p className="text-sm dark:text-blue-200">
              <span className="font-semibold">Expected Monthly Total:</span> {formatCurrency(totalMonthly)}
            </p>
            <p className="text-xs text-slate-600 dark:text-blue-300 mt-1">
              Use this to compare against your credit card statement total to understand how much you actually spent.
            </p>
          </CardContent>
        </Card>
      )}

      {/* List */}
      {loading ? (
        <div className="text-center py-8 dark:text-slate-400">Loading...</div>
      ) : expenses.length === 0 ? (
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="p-8 text-center">
            <p className="text-slate-600 dark:text-slate-400 mb-4">No recurring expenses yet</p>
            <Button
              onClick={() => {
                resetForm()
                setShowForm(true)
              }}
              className="dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Expense
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {expenses.map((expense) => (
            <Card
              key={expense.id}
              className="dark:bg-slate-800 dark:border-slate-700 hover:dark:bg-slate-750 transition"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold dark:text-slate-100">{expense.description}</h3>
                      {expense.websiteUrl && (
                        <a
                          href={expense.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm"
                          title="Visit website"
                        >
                          🔗
                        </a>
                      )}
                      {!expense.isActive && (
                        <span className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded">
                          Inactive
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                      <span>
                        <strong className="dark:text-slate-300">Amount:</strong> {formatCurrency(expense.amount)}
                      </span>
                      <span>
                        <strong className="dark:text-slate-300">Frequency:</strong> {expense.frequency}
                        {expense.dueDay && ` (day ${expense.dueDay})`}
                      </span>
                      {expense.account && (
                        <span>
                          <strong className="dark:text-slate-300">Account:</strong> {expense.account.name}
                        </span>
                      )}
                    </div>
                    {expense.notes && (
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">{expense.notes}</p>
                    )}
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                      Next due: {formatDateString(expense.nextDueDate)}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      onClick={() => handleEdit(expense)}
                      variant="outline"
                      size="sm"
                      className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-600"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => setDeleteConfirm({ id: expense.id, description: expense.description })}
                      variant="outline"
                      size="sm"
                      className="dark:bg-red-900/30 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-sm mx-4">
            <CardContent className="space-y-4 pt-6">
              <div className="flex gap-3">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                    Delete Recurring Expense?
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    &quot;{deleteConfirm.description}&quot; will be permanently deleted.
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirm(null)}
                  disabled={isDeleting}
                  className="flex-1 dark:border-slate-600 dark:text-slate-100 disabled:opacity-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleDelete(deleteConfirm.id)}
                  disabled={isDeleting}
                  className="flex-1 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <QuickExpenseEntry
        isOpen={showQuickEntry}
        onClose={() => setShowQuickEntry(false)}
        householdId={currentHousehold?.id}
      />
    </div>
  )
}

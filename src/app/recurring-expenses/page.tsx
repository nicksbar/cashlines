'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { InfoTooltip } from '@/src/components/InfoTooltip'
import { formatCurrency } from '@/src/lib/money'
import { Trash2, Plus, AlertCircle, Zap } from 'lucide-react'
import { QuickExpenseEntry } from '@/src/components/QuickExpenseEntry'
import { useUser } from '@/src/lib/UserContext'

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

export default function RecurringExpensesPage() {
  const { currentHousehold } = useUser()
  const [expenses, setExpenses] = useState<RecurringExpense[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showQuickEntry, setShowQuickEntry] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    accountId: '',
    description: '',
    amount: '',
    frequency: 'monthly',
    dueDay: '',
    notes: '',
  })

  useEffect(() => {
    fetchExpenses()
    fetchAccounts()
  }, [])

  async function fetchExpenses() {
    try {
      setLoading(true)
      const response = await fetch('/api/recurring-expenses')
      if (!response.ok) throw new Error('Failed to fetch expenses')
      const data = await response.json()
      setExpenses(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  async function fetchAccounts() {
    try {
      const response = await fetch('/api/accounts')
      if (!response.ok) throw new Error('Failed to fetch accounts')
      const data = await response.json()
      setAccounts(data.filter((a: Account) => a.isActive))
    } catch (err) {
      console.error('Error fetching accounts:', err)
    }
  }

  function resetForm() {
    setFormData({
      accountId: '',
      description: '',
      amount: '',
      frequency: 'monthly',
      dueDay: '',
      notes: '',
    })
    setEditingId(null)
    setShowForm(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const payload = {
      accountId: formData.accountId || null,
      description: formData.description,
      amount: parseFloat(formData.amount),
      frequency: formData.frequency,
      dueDay: formData.dueDay ? parseInt(formData.dueDay) : null,
      notes: formData.notes || null,
    }

    try {
      if (editingId) {
        // Update
        const response = await fetch(`/api/recurring-expenses/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!response.ok) throw new Error('Failed to update expense')
      } else {
        // Create
        const response = await fetch('/api/recurring-expenses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!response.ok) throw new Error('Failed to create expense')
      }
      await fetchExpenses()
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this recurring expense?')) return

    try {
      const response = await fetch(`/api/recurring-expenses/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete expense')
      await fetchExpenses()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  function handleEdit(expense: RecurringExpense) {
    setFormData({
      accountId: expense.accountId || '',
      description: expense.description,
      amount: expense.amount.toString(),
      frequency: expense.frequency,
      dueDay: expense.dueDay?.toString() || '',
      notes: expense.notes || '',
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
                <Label className="dark:text-slate-300">Notes (Optional)</Label>
                <Input
                  type="text"
                  value={formData.notes}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes..."
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
                      Next due: {new Date(expense.nextDueDate).toLocaleDateString()}
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
                      onClick={() => handleDelete(expense.id)}
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

      <QuickExpenseEntry
        isOpen={showQuickEntry}
        onClose={() => setShowQuickEntry(false)}
        householdId={currentHousehold?.id}
      />
    </div>
  )
}

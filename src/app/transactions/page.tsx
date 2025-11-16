'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState, useEffect, useCallback } from 'react'
import { formatCurrency, roundAmount } from '@/lib/money'
import { formatDate } from '@/lib/date'
import { Plus, Trash2, Edit2, Download, Zap, CheckCircle, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useUser } from '@/lib/UserContext'
import { QuickExpenseEntry } from '@/components/QuickExpenseEntry'
import { useConfirmDialog } from '@/components/ConfirmDialog'
import { usePromptDialog } from '@/components/PromptDialog'
import { TemplateSelector } from '@/components/TemplateSelector'
import { extractErrorMessage } from '@/lib/utils'

interface Split {
  id: string
  type: string
  target: string
  amount?: number
  percent?: number
}

interface Transaction {
  id: string
  date: string
  amount: number
  description: string
  method: string
  accountId: string
  notes?: string
  tags: string
  personId?: string
  account: {
    name: string
  }
  person?: {
    id: string
    name: string
    color?: string
  }
  splits: Split[]
}

const METHOD_LABELS: Record<string, string> = {
  cc: 'Credit Card',
  cash: 'Cash',
  ach: 'ACH',
  other: 'Other',
}

export default function TransactionsPage() {
  const { currentHousehold } = useUser()
  const { dialog: confirmDialog, confirm } = useConfirmDialog()
  const { dialog: promptDialog, prompt } = usePromptDialog()
  const [alertMessage, setAlertMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [accounts, setAccounts] = useState<any[]>([])
  const [people, setPeople] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [expenseType, setExpenseType] = useState<'one-off' | 'recurring'>('one-off')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showQuickEntry, setShowQuickEntry] = useState(false)
  const [showConvertModal, setShowConvertModal] = useState(false)
  const [convertingTransaction, setConvertingTransaction] = useState<Transaction | null>(null)
  const [recurringFormData, setRecurringFormData] = useState({
    frequency: 'monthly',
    dueDay: new Date().getDate(),
  })
  const [convertStatus, setConvertStatus] = useState<{
    type: 'idle' | 'loading' | 'success' | 'error'
    message: string
  }>({ type: 'idle', message: '' })
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    description: '',
    method: 'cc',
    accountId: '',
    personId: '',
    notes: '',
    websiteUrl: '',
    tags: '',
    splits: [{ type: 'need', target: '', percent: 100 }],
  })

  const fetchData = useCallback(async () => {
    if (!currentHousehold) return

    try {
      setLoading(true)
      const headers = { 'x-household-id': currentHousehold.id }
      const [txRes, accountsRes, peopleRes] = await Promise.all([
        fetch('/api/transactions', { headers }),
        fetch('/api/accounts', { headers }),
        fetch('/api/people', { headers }),
      ])
      if (txRes.ok) setTransactions(await txRes.json())
      if (accountsRes.ok) setAccounts(await accountsRes.json())
      if (peopleRes.ok) setPeople(await peopleRes.json())
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }, [currentHousehold])

  useEffect(() => {
    if (currentHousehold) {
      fetchData()
    }
  }, [currentHousehold])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentHousehold) return

    try {
      const url = editingId ? `/api/transactions/${editingId}` : '/api/transactions'
      const method = editingId ? 'PATCH' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'x-household-id': currentHousehold.id,
        },
        body: JSON.stringify({
          ...formData,
          amount: roundAmount(formData.amount),
          date: formData.date,
          personId: formData.personId || null,
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
          splits: formData.splits.filter(s => s.target),
        }),
      })
      if (!response.ok) {
        const errorMessage = await extractErrorMessage(response)
        setAlertMessage({ text: errorMessage, type: 'error' })
        setTimeout(() => setAlertMessage(null), 5000)
        return
      }

      setFormData({
        date: new Date().toISOString().split('T')[0],
        amount: 0,
        description: '',
        method: 'cc',
        accountId: '',
        personId: '',
        notes: '',
        websiteUrl: '',
        tags: '',
        splits: [{ type: 'need', target: '', percent: 100 }],
      })
      setEditingId(null)
      setShowForm(false)
      setAlertMessage({ text: editingId ? 'Transaction updated successfully' : 'Transaction created successfully', type: 'success' })
      setTimeout(() => setAlertMessage(null), 3000)
      fetchData()
    } catch (error) {
      console.error('Error saving transaction:', error)
      setAlertMessage({ text: 'An unexpected error occurred. Please try again.', type: 'error' })
      setTimeout(() => setAlertMessage(null), 5000)
    }
  }

  const handleEdit = (tx: Transaction) => {
    setEditingId(tx.id)
    setFormData({
      date: tx.date.split('T')[0],
      amount: typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount,
      description: tx.description,
      method: tx.method,
      accountId: tx.accountId,
      personId: tx.personId || '',
      notes: tx.notes || '',
      websiteUrl: (tx as any).websiteUrl || '',
      tags: typeof tx.tags === 'string' ? JSON.parse(tx.tags).join(', ') : (tx.tags as any).join(', '),
      splits: tx.splits.map(s => ({
        type: s.type,
        target: s.target,
        percent: s.percent || 0,
      })),
    })
    setShowForm(true)
  }

  const handleCancel = () => {
    setEditingId(null)
    setFormData({
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      description: '',
      method: 'cc',
      accountId: '',
      personId: '',
      notes: '',
      websiteUrl: '',
      tags: '',
      splits: [{ type: 'need', target: '', percent: 100 }],
    })
    setShowForm(false)
  }

  const handleTemplateSelect = (template: any) => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      amount: template.amount ? parseFloat(template.amount) : 0,
      description: template.name || '',
      method: template.method || 'cc',
      accountId: template.accountId || '',
      personId: template.personId || '',
      notes: template.description || '',
      websiteUrl: template.websiteUrl || '',
      tags: '',
      splits: [{ type: 'need', target: template.accountId || 'Default', percent: 100 }],
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    confirm({
      title: 'Delete Transaction',
      message: 'Are you sure you want to delete this transaction? This action cannot be undone.',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      isDestructive: true,
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/transactions/${id}`, { 
            method: 'DELETE',
            headers: { 'x-household-id': currentHousehold?.id || '' }
          })
          if (!response.ok) {
            const errorMessage = await extractErrorMessage(response)
            setAlertMessage({ text: errorMessage, type: 'error' })
            setTimeout(() => setAlertMessage(null), 5000)
            return
          }
          fetchData()
          setAlertMessage({ text: 'Transaction deleted successfully', type: 'success' })
          setTimeout(() => setAlertMessage(null), 3000)
        } catch (error) {
          console.error('Error deleting transaction:', error)
          setAlertMessage({ text: 'An unexpected error occurred while deleting.', type: 'error' })
          setTimeout(() => setAlertMessage(null), 5000)
        }
      },
    })
  }

  const openConvertModal = (tx: Transaction) => {
    setConvertingTransaction(tx)
    setRecurringFormData({
      frequency: 'monthly',
      dueDay: new Date(tx.date).getDate(),
    })
    setShowConvertModal(true)
  }

  const handleConvertToRecurring = async () => {
    if (!convertingTransaction || !currentHousehold) return

    try {
      setConvertStatus({ type: 'loading', message: 'Creating recurring expense...' })

      const body: any = {
        description: convertingTransaction.description,
        amount: convertingTransaction.amount,
        frequency: recurringFormData.frequency,
        dueDay: recurringFormData.frequency === 'monthly' ? recurringFormData.dueDay : null,
        accountId: convertingTransaction.accountId,
      }

      // Only include notes if they exist
      if (convertingTransaction.notes) {
        body.notes = convertingTransaction.notes
      }

      const response = await fetch('/api/recurring-expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-household-id': currentHousehold.id,
        },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        setConvertStatus({
          type: 'success',
          message: `Created recurring: "${convertingTransaction.description}"`,
        })
        
        // Auto-close modal after success
        setTimeout(() => {
          setShowConvertModal(false)
          setConvertingTransaction(null)
          setConvertStatus({ type: 'idle', message: '' })
        }, 1500)
      } else {
        const errorData = await response.json()
        console.error('Error response:', errorData)
        setConvertStatus({
          type: 'error',
          message: `Failed: ${errorData.error || 'Unknown error'}`,
        })
      }
    } catch (error) {
      console.error('Error converting to recurring:', error)
      setConvertStatus({
        type: 'error',
        message: 'Error creating recurring expense',
      })
    }
  }

  const totalExpense = transactions.reduce((sum, t) => sum + t.amount, 0)

  const exportTransactions = async () => {
    try {
      const response = await fetch('/api/export?type=transactions')
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
        setAlertMessage({ text: 'Transactions exported successfully', type: 'success' })
        setTimeout(() => setAlertMessage(null), 2000)
      }
    } catch (error) {
      console.error('Error exporting transactions:', error)
      setAlertMessage({ text: 'Failed to export transactions', type: 'error' })
      setTimeout(() => setAlertMessage(null), 3000)
    }
  }

  const saveAsTemplate = async () => {
    if (!formData.description || !formData.amount) {
      setAlertMessage({ text: 'Please fill in description and amount', type: 'error' })
      setTimeout(() => setAlertMessage(null), 3000)
      return
    }

    prompt({
      title: 'Save as Template',
      message: 'Choose a name for this transaction template',
      inputPlaceholder: 'e.g., "Rent", "Grocery Run"',
      confirmLabel: 'Save',
      onConfirm: async (templateName) => {
        try {
          const response = await fetch('/api/templates/transactions', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'x-household-id': currentHousehold?.id || '',
            },
            body: JSON.stringify({
              name: templateName,
              description: formData.description,
              amount: roundAmount(formData.amount),
              method: formData.method,
              accountId: formData.accountId,
              notes: formData.notes,
              tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
            }),
          })

          if (response.ok) {
            setAlertMessage({ text: 'Template saved successfully!', type: 'success' })
            setTimeout(() => {
              setAlertMessage(null)
              handleCancel()
            }, 1500)
          } else {
            setAlertMessage({ text: 'Failed to save template', type: 'error' })
            setTimeout(() => setAlertMessage(null), 3000)
          }
        } catch (error) {
          console.error('Error saving template:', error)
          setAlertMessage({ text: 'Error saving template', type: 'error' })
          setTimeout(() => setAlertMessage(null), 3000)
        }
      },
    })
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Expenses</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">Track one-off expenses and manage recurring bills</p>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-2xl font-bold text-red-600 dark:text-red-400">
          Total: {formatCurrency(totalExpense)}
        </div>
        <div className="flex gap-2">
          <TemplateSelector type="transaction" onSelect={handleTemplateSelect} />
          <Button onClick={exportTransactions} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button 
            onClick={() => setShowQuickEntry(true)}
            className="bg-amber-600 hover:bg-amber-700"
          >
            <Zap className="w-4 h-4 mr-2" />
            Quick Log
          </Button>
          <Button 
            onClick={() => {
              setEditingId(null)
              setShowForm(!showForm)
              setExpenseType('one-off')
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
          <Button 
            onClick={() => window.location.href = '/recurring-expenses'}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Recurring Bills
          </Button>
        </div>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-slate-100">{editingId ? 'Edit Transaction' : 'Add Transaction'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g., Grocery Store, Gas"
                  className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="method">Payment Method</Label>
                  <select
                    id="method"
                    value={formData.method}
                    onChange={(e) => setFormData({ ...formData, method: e.target.value, accountId: '' })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="cc">Credit Card</option>
                    <option value="cash">Cash</option>
                    <option value="ach">ACH Transfer</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="accountId">Account</Label>
                  <select
                    id="accountId"
                    value={formData.accountId}
                    onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select account...</option>
                    {getFilteredAccounts(formData.method).map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="personId">Person</Label>
                <select
                  id="personId"
                  value={formData.personId}
                  onChange={(e) => setFormData({ ...formData, personId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Unassigned</option>
                  {people.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Optional notes"
                  className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                />
              </div>

              <div>
                <Label htmlFor="websiteUrl">Website URL</Label>
                <Input
                  id="websiteUrl"
                  type="url"
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                  placeholder="https://example.com"
                  className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                />
              </div>

              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="e.g., groceries, recurring"
                  className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                />
              </div>

              <div className="space-y-3">
                <Label>Money Routing (Splits)</Label>
                {formData.splits.map((split, idx) => (
                  <div key={idx} className="flex gap-2">
                    <select
                      value={split.type}
                      onChange={(e) => {
                        const newSplits = [...formData.splits]
                        newSplits[idx].type = e.target.value
                        setFormData({ ...formData, splits: newSplits })
                      }}
                      className="px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="need">Need</option>
                      <option value="want">Want</option>
                      <option value="debt">Debt</option>
                      <option value="tax">Tax</option>
                      <option value="savings">Savings</option>
                      <option value="other">Other</option>
                    </select>
                    <Input
                      value={split.target}
                      onChange={(e) => {
                        const newSplits = [...formData.splits]
                        newSplits[idx].target = e.target.value
                        setFormData({ ...formData, splits: newSplits })
                      }}
                      placeholder="Target name"
                      className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                    />
                    <Input
                      type="number"
                      step="0.01"
                      value={split.percent || ''}
                      onChange={(e) => {
                        const newSplits = [...formData.splits]
                        newSplits[idx].percent = e.target.value ? parseFloat(e.target.value) : 0
                        setFormData({ ...formData, splits: newSplits })
                      }}
                      placeholder="%"
                      className="w-20 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      splits: [...formData.splits, { type: 'need', target: '', percent: 0 }],
                    })
                  }
                  className="dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-700"
                >
                  + Add Split
                </Button>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit">{editingId ? 'Update Transaction' : 'Save Transaction'}</Button>
                <Button type="button" variant="outline" onClick={handleCancel} className="dark:border-slate-600 dark:text-slate-100">
                  Cancel
                </Button>
                {!editingId && (
                  <Button
                    type="button"
                    onClick={saveAsTemplate}
                    className="ml-auto bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600 text-white"
                  >
                    💾 Save as Template
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-slate-100">Transactions</CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">{transactions.length} entries</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-slate-500 dark:text-slate-400">Loading...</p>
          ) : transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-2 px-2 text-slate-900 dark:text-slate-100">Date</th>
                    <th className="text-left py-2 px-2 text-slate-900 dark:text-slate-100">Description</th>
                    <th className="text-left py-2 px-2 text-slate-900 dark:text-slate-100">Method</th>
                    <th className="text-left py-2 px-2 text-slate-900 dark:text-slate-100">Account</th>
                    <th className="text-left py-2 px-2 text-slate-900 dark:text-slate-100">Person</th>
                    <th className="text-right py-2 px-2 text-slate-900 dark:text-slate-100">Amount</th>
                    <th className="text-left py-2 px-2 text-slate-900 dark:text-slate-100">Routing</th>
                    <th className="text-center py-2 px-2 text-slate-900 dark:text-slate-100">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <td className="py-3 px-2 text-slate-900 dark:text-slate-100">{formatDate(tx.date)}</td>
                      <td className="py-3 px-2 font-medium text-slate-900 dark:text-slate-100">{tx.description}</td>
                      <td className="py-3 px-2 text-slate-600 dark:text-slate-400">{METHOD_LABELS[tx.method]}</td>
                      <td className="py-3 px-2 text-slate-600 dark:text-slate-400">{tx.account.name}</td>
                      <td className="py-3 px-2">
                        {tx.person ? (
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: tx.person.color || '#4ECDC4' }}
                            />
                            <span className="text-slate-900 dark:text-slate-100">{tx.person.name}</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 dark:text-slate-400 text-sm">—</span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-right font-semibold text-red-600 dark:text-red-400">
                        {formatCurrency(tx.amount)}
                      </td>
                      <td className="py-3 px-2">
                        <div className="space-y-1">
                          {tx.splits.map((split) => (
                            <div key={split.id} className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                              <span className="font-medium">{split.type}</span>: {split.target}{' '}
                              {split.percent && `(${split.percent}%)`}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center space-x-2 flex justify-center">
                        <button
                          onClick={() => handleEdit(tx)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                          title="Edit transaction"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openConvertModal(tx)}
                          className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
                          title="Convert to recurring"
                        >
                          <Zap className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(tx.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                          title="Delete transaction"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-slate-500 dark:text-slate-400">No transactions yet. Create one to get started!</p>
          )}
        </CardContent>
      </Card>

      {/* Convert to Recurring Modal */}
      {showConvertModal && convertingTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-slate-100">
                Convert to Recurring
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Make &quot;{convertingTransaction.description}&quot; a recurring expense
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {convertStatus.type === 'success' && (
                <div className="flex gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-700 dark:text-green-300">{convertStatus.message}</p>
                </div>
              )}

              {convertStatus.type === 'error' && (
                <div className="flex gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 dark:text-red-300">{convertStatus.message}</p>
                </div>
              )}

              {convertStatus.type !== 'success' && (
                <>
                  <div>
                    <Label htmlFor="recurringFrequency" className="text-slate-900 dark:text-slate-100">
                      Frequency
                    </Label>
                    <select
                      id="recurringFrequency"
                      value={recurringFormData.frequency}
                      onChange={(e) =>
                        setRecurringFormData({ ...recurringFormData, frequency: e.target.value })
                      }
                      disabled={convertStatus.type === 'loading'}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>

                  {recurringFormData.frequency === 'monthly' && (
                    <div>
                      <Label htmlFor="recurringDueDay" className="text-slate-900 dark:text-slate-100">
                        Due Day of Month
                      </Label>
                      <Input
                        id="recurringDueDay"
                        type="number"
                        min="1"
                        max="31"
                        value={recurringFormData.dueDay}
                        onChange={(e) =>
                          setRecurringFormData({
                            ...recurringFormData,
                            dueDay: parseInt(e.target.value),
                          })
                        }
                        disabled={convertStatus.type === 'loading'}
                        className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 disabled:opacity-50"
                      />
                    </div>
                  )}

                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-blue-900 dark:text-blue-200">
                      <strong>Amount:</strong> {formatCurrency(convertingTransaction.amount)}
                    </p>
                    <p className="text-sm text-blue-900 dark:text-blue-200">
                      <strong>Account:</strong> {convertingTransaction.account.name}
                    </p>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowConvertModal(false)
                        setConvertingTransaction(null)
                        setConvertStatus({ type: 'idle', message: '' })
                      }}
                      disabled={convertStatus.type === 'loading'}
                      className="flex-1 dark:border-slate-600 dark:text-slate-100 disabled:opacity-50"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleConvertToRecurring}
                      disabled={convertStatus.type === 'loading'}
                      className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white disabled:opacity-50"
                    >
                      {convertStatus.type === 'loading' ? 'Creating...' : 'Create Recurring'}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <QuickExpenseEntry
        isOpen={showQuickEntry}
        onClose={() => setShowQuickEntry(false)}
        householdId={currentHousehold?.id}
      />

      {confirmDialog}
      {promptDialog}

      {alertMessage && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${
          alertMessage.type === 'success'
            ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700'
            : 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700'
        }`}>
          <p className={`text-sm font-medium ${
            alertMessage.type === 'success'
              ? 'text-green-800 dark:text-green-200'
              : 'text-red-800 dark:text-red-200'
          }`}>
            {alertMessage.text}
          </p>
        </div>
      )}
    </div>
  )
}

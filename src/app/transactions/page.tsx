'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { useState, useEffect } from 'react'
import { formatCurrency } from '@/src/lib/money'
import { formatDate } from '@/src/lib/date'
import { Plus, Trash2, Edit2 } from 'lucide-react'

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
  account: {
    name: string
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
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [accounts, setAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    description: '',
    method: 'cc',
    accountId: '',
    notes: '',
    tags: '',
    splits: [{ type: 'need', target: '', percent: 100 }],
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [txRes, accountsRes] = await Promise.all([
        fetch('/api/transactions'),
        fetch('/api/accounts'),
      ])
      if (txRes.ok) setTransactions(await txRes.json())
      if (accountsRes.ok) setAccounts(await accountsRes.json())
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingId ? `/api/transactions/${editingId}` : '/api/transactions'
      const method = editingId ? 'PATCH' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          date: new Date(formData.date),
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
          splits: formData.splits.filter(s => s.target),
        }),
      })
      if (response.ok) {
        setFormData({
          date: new Date().toISOString().split('T')[0],
          amount: '',
          description: '',
          method: 'cc',
          accountId: '',
          notes: '',
          tags: '',
          splits: [{ type: 'need', target: '', percent: 100 }],
        })
        setEditingId(null)
        setShowForm(false)
        fetchData()
      }
    } catch (error) {
      console.error('Error saving transaction:', error)
    }
  }

  const handleEdit = (tx: Transaction) => {
    setEditingId(tx.id)
    setFormData({
      date: tx.date.split('T')[0],
      amount: tx.amount.toString(),
      description: tx.description,
      method: tx.method,
      accountId: tx.accountId,
      notes: tx.notes || '',
      tags: typeof tx.tags === 'string' ? JSON.parse(tx.tags).join(', ') : (tx.tags as any).join(', '),
      splits: tx.splits.map(s => ({
        type: s.type,
        target: s.target,
        amount: s.amount,
        percent: s.percent,
      })),
    })
    setShowForm(true)
  }

  const handleCancel = () => {
    setEditingId(null)
    setFormData({
      date: new Date().toISOString().split('T')[0],
      amount: '',
      description: '',
      method: 'cc',
      accountId: '',
      notes: '',
      tags: '',
      splits: [{ type: 'need', target: '', percent: 100 }],
    })
    setShowForm(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this transaction?')) return
    try {
      const response = await fetch(`/api/transactions/${id}`, { method: 'DELETE' })
      if (response.ok) fetchData()
    } catch (error) {
      console.error('Error deleting transaction:', error)
    }
  }

  const totalExpense = transactions.reduce((sum, t) => sum + t.amount, 0)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Transactions</h1>
        <p className="text-slate-600 mt-2">Track expenses and how money is routed</p>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-2xl font-bold text-red-600">
          Total: {formatCurrency(totalExpense)}
        </div>
        <Button onClick={() => {
          setEditingId(null)
          setShowForm(!showForm)
        }}>
          <Plus className="w-4 h-4 mr-2" />
          New Transaction
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Transaction' : 'Add Transaction'}</CardTitle>
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
                    required
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
                    placeholder="0.00"
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
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="method">Payment Method</Label>
                  <select
                    id="method"
                    value={formData.method}
                    onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select account...</option>
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name}
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
                  placeholder="Optional notes"
                />
              </div>

              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="e.g., groceries, recurring"
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
                      className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                      className="w-20"
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
                >
                  + Add Split
                </Button>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit">{editingId ? 'Update Transaction' : 'Save Transaction'}</Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>{transactions.length} entries</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-slate-500">Loading...</p>
          ) : transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 px-2">Date</th>
                    <th className="text-left py-2 px-2">Description</th>
                    <th className="text-left py-2 px-2">Method</th>
                    <th className="text-left py-2 px-2">Account</th>
                    <th className="text-right py-2 px-2">Amount</th>
                    <th className="text-left py-2 px-2">Routing</th>
                    <th className="text-center py-2 px-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-2">{formatDate(tx.date)}</td>
                      <td className="py-3 px-2 font-medium">{tx.description}</td>
                      <td className="py-3 px-2 text-slate-600">{METHOD_LABELS[tx.method]}</td>
                      <td className="py-3 px-2 text-slate-600">{tx.account.name}</td>
                      <td className="py-3 px-2 text-right font-semibold text-red-600">
                        {formatCurrency(tx.amount)}
                      </td>
                      <td className="py-3 px-2">
                        <div className="space-y-1">
                          {tx.splits.map((split) => (
                            <div key={split.id} className="text-xs bg-slate-100 px-2 py-1 rounded">
                              <span className="font-medium">{split.type}</span>: {split.target}{' '}
                              {split.percent && `(${split.percent}%)`}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center space-x-2 flex justify-center">
                        <button
                          onClick={() => handleEdit(tx)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit transaction"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(tx.id)}
                          className="text-red-600 hover:text-red-800"
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
            <p className="text-slate-500">No transactions yet. Create one to get started!</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

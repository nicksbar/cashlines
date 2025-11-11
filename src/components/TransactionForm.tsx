'use client'

import { useState } from 'react'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { recordTemplateUsage } from '@/src/lib/templates'

interface TransactionFormProps {
  onClose: () => void
  onSuccess: () => void
  initialData?: {
    description?: string
    amount?: string
    accountId?: string
    method?: string
    notes?: string
    templateId?: string
  }
}

export default function TransactionForm({ onClose, onSuccess, initialData }: TransactionFormProps) {
  const [formData, setFormData] = useState({
    description: initialData?.description || '',
    amount: initialData?.amount || '',
    date: new Date().toISOString().split('T')[0],
    accountId: initialData?.accountId || '',
    method: initialData?.method || 'cc',
    notes: initialData?.notes || '',
  })

  const [templateId, setTemplateId] = useState(initialData?.templateId || '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: formData.description,
          amount: parseFloat(formData.amount),
          date: formData.date,
          accountId: formData.accountId || 'default',
          method: formData.method,
          notes: formData.notes,
          tags: [],
          splits: [],
        }),
      })

      if (response.ok) {
        // Record template usage if a template was used
        if (templateId) {
          recordTemplateUsage(templateId, 'transaction')
        }
        onSuccess()
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-900 rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-slate-100">Add Transaction</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="description" className="text-slate-900 dark:text-slate-100">Description *</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Groceries, Gas, etc."
              required
              className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
            />
          </div>
          <div>
            <Label htmlFor="amount" className="text-slate-900 dark:text-slate-100">Amount *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
              className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
            />
          </div>
          <div>
            <Label htmlFor="date" className="text-slate-900 dark:text-slate-100">Date *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
            />
          </div>
          <div>
            <Label htmlFor="method" className="text-slate-900 dark:text-slate-100">Method</Label>
            <select
              id="method"
              value={formData.method}
              onChange={(e) => setFormData({ ...formData, method: e.target.value })}
              className="w-full px-2 py-1 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
            >
              <option value="cc">Credit Card</option>
              <option value="cash">Cash</option>
              <option value="ach">ACH</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <Label htmlFor="notes" className="text-slate-900 dark:text-slate-100">Notes</Label>
            <Input
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Add Transaction</Button>
          </div>
        </form>
      </div>
    </div>
  )
}


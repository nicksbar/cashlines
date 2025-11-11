'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { recordTemplateUsage } from '@/src/lib/templates'

interface Person {
  id: string
  name: string
  role?: string
  color?: string
}

interface IncomeFormProps {
  onClose: () => void
  onSuccess: () => void
  initialData?: {
    source?: string
    amount?: string
    accountId?: string
    notes?: string
    personId?: string
    templateId?: string
  }
}

export default function IncomeForm({ onClose, onSuccess, initialData }: IncomeFormProps) {
  const [formData, setFormData] = useState({
    source: initialData?.source || '',
    amount: initialData?.amount || '',
    date: new Date().toISOString().split('T')[0],
    accountId: initialData?.accountId || '',
    personId: initialData?.personId || '',
    notes: initialData?.notes || '',
  })

  const [templateId, setTemplateId] = useState(initialData?.templateId || '')
  const [people, setPeople] = useState<Person[]>([])

  useEffect(() => {
    const fetchPeople = async () => {
      try {
        const response = await fetch('/api/people')
        if (response.ok) {
          const data = await response.json()
          setPeople(data)
        }
      } catch (error) {
        console.error('Error fetching people:', error)
      }
    }
    fetchPeople()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/income', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: formData.source,
          amount: parseFloat(formData.amount),
          date: formData.date,
          accountId: formData.accountId || 'default',
          personId: formData.personId || null,
          notes: formData.notes,
          tags: [],
        }),
      })

      if (response.ok) {
        // Record template usage if a template was used
        if (templateId) {
          recordTemplateUsage(templateId, 'income')
        }
        onSuccess()
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-900 rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-slate-100">Add Income</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="source" className="text-slate-900 dark:text-slate-100">Source *</Label>
            <Input
              id="source"
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              placeholder="Salary, Freelance, etc."
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
            <Label htmlFor="person" className="text-slate-900 dark:text-slate-100">Person</Label>
            <select
              id="person"
              value={formData.personId}
              onChange={(e) => setFormData({ ...formData, personId: e.target.value })}
              className="w-full h-10 px-3 py-2 rounded-md border border-slate-300 bg-white text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
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
            <Button type="submit">Add Income</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

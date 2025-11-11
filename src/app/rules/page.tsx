'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2 } from 'lucide-react'

interface Rule {
  id: string
  name: string
  matchSource?: string
  matchDescription?: string
  matchAccountId?: string
  matchMethod?: string
  matchTags: string[]
  splitConfig: Array<{
    type: string
    target: string
    percent?: number
  }>
  isActive: boolean
  notes?: string
}

export default function RulesPage() {
  const [rules, setRules] = useState<Rule[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    matchSource: '',
    matchDescription: '',
    matchMethod: '',
    splitConfig: [{ type: 'need', target: '', percent: 100 }],
    isActive: true,
    notes: '',
  })

  useEffect(() => {
    fetchRules()
  }, [])

  const fetchRules = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/rules')
      if (response.ok) {
        const data = await response.json()
        setRules(data)
      }
    } catch (error) {
      console.error('Error fetching rules:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingId ? `/api/rules/${editingId}` : '/api/rules'
      const method = editingId ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          splitConfig: formData.splitConfig.filter(s => s.target),
        }),
      })

      if (response.ok) {
        resetForm()
        fetchRules()
      }
    } catch (error) {
      console.error('Error saving rule:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this rule?')) return
    try {
      const response = await fetch(`/api/rules/${id}`, { method: 'DELETE' })
      if (response.ok) fetchRules()
    } catch (error) {
      console.error('Error deleting rule:', error)
    }
  }

  const handleEdit = (rule: Rule) => {
    setFormData({
      name: rule.name,
      matchSource: rule.matchSource || '',
      matchDescription: rule.matchDescription || '',
      matchMethod: rule.matchMethod || '',
      splitConfig: rule.splitConfig.map(s => ({
        ...s,
        percent: s.percent || 0,
      })),
      isActive: rule.isActive,
      notes: rule.notes || '',
    })
    setEditingId(rule.id)
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      matchSource: '',
      matchDescription: '',
      matchMethod: '',
      splitConfig: [{ type: 'need', target: '', percent: 100 }],
      isActive: true,
      notes: '',
    })
    setEditingId(null)
    setShowForm(false)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Routing Rules</h1>
        <p className="text-slate-600 mt-2">Create rules to automatically route income and transactions</p>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          New Rule
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Rule' : 'Create Rule'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Rule Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Salary Routing"
                  required
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                <h3 className="font-semibold text-slate-900">Matching Criteria</h3>
                <div>
                  <Label htmlFor="matchSource">Match Income Source (regex)</Label>
                  <Input
                    id="matchSource"
                    value={formData.matchSource}
                    onChange={(e) => setFormData({ ...formData, matchSource: e.target.value })}
                    placeholder="e.g., Salary|Wages"
                  />
                </div>

                <div>
                  <Label htmlFor="matchDescription">Match Description (regex)</Label>
                  <Input
                    id="matchDescription"
                    value={formData.matchDescription}
                    onChange={(e) => setFormData({ ...formData, matchDescription: e.target.value })}
                    placeholder="e.g., Grocery|Amazon"
                  />
                </div>

                <div>
                  <Label htmlFor="matchMethod">Payment Method</Label>
                  <select
                    id="matchMethod"
                    value={formData.matchMethod}
                    onChange={(e) => setFormData({ ...formData, matchMethod: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Any method</option>
                    <option value="cc">Credit Card</option>
                    <option value="cash">Cash</option>
                    <option value="ach">ACH</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                <h3 className="font-semibold text-slate-900">Default Split Allocation</h3>
                {formData.splitConfig.map((split, idx) => (
                  <div key={idx} className="flex gap-2">
                    <select
                      value={split.type}
                      onChange={(e) => {
                        const newSplits = [...formData.splitConfig]
                        newSplits[idx].type = e.target.value
                        setFormData({ ...formData, splitConfig: newSplits })
                      }}
                      className="px-3 py-2 border border-slate-300 rounded-lg"
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
                        const newSplits = [...formData.splitConfig]
                        newSplits[idx].target = e.target.value
                        setFormData({ ...formData, splitConfig: newSplits })
                      }}
                      placeholder="Target name"
                    />
                    <Input
                      type="number"
                      step="0.01"
                      value={split.percent || ''}
                      onChange={(e) => {
                        const newSplits = [...formData.splitConfig]
                        newSplits[idx].percent = e.target.value ? parseFloat(e.target.value) : 0
                        setFormData({ ...formData, splitConfig: newSplits })
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
                      splitConfig: [...formData.splitConfig, { type: 'need', target: '', percent: 0 }],
                    })
                  }
                >
                  + Add Split
                </Button>
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

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="isActive">Active</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit">Save Rule</Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Routing Rules</CardTitle>
          <CardDescription>{rules.length} rules configured</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-slate-500">Loading...</p>
          ) : rules.length > 0 ? (
            <div className="space-y-4">
              {rules.map((rule) => (
                <div key={rule.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg text-slate-900">{rule.name}</h3>
                      <div className="flex gap-2 mt-2">
                        {rule.matchSource && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Source: {rule.matchSource}
                          </span>
                        )}
                        {rule.matchDescription && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Desc: {rule.matchDescription}
                          </span>
                        )}
                        {rule.matchMethod && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Method: {rule.matchMethod}
                          </span>
                        )}
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            rule.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {rule.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(rule)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(rule.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-700">Default Splits:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {rule.splitConfig.map((split, idx) => (
                        <div key={idx} className="text-xs bg-slate-100 px-2 py-1 rounded">
                          <span className="font-medium capitalize">{split.type}</span>:{' '}
                          {split.target}
                          {split.percent && ` (${split.percent}%)`}
                        </div>
                      ))}
                    </div>
                  </div>

                  {rule.notes && (
                    <p className="text-xs text-slate-600 mt-3 italic">{rule.notes}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500">No rules yet. Create one to get started!</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

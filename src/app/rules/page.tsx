'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, AlertCircle } from 'lucide-react'
import { InfoTooltip } from '@/src/components/InfoTooltip'

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
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Routing Rules</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">Create rules to automatically route income and transactions</p>
      </div>

      {/* Help Section */}
      <Card className="border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            How Routing Rules Work
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">What are routing rules?</h4>
            <p className="text-slate-700 dark:text-slate-400">
              Rules automatically categorize transactions and income into allocation types (Need, Want, Debt, Tax, Savings). When you add transactions or income that match a rule&apos;s criteria, they&apos;re automatically split across your defined targets.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Why use them?</h4>
            <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-400">
              <li><strong>Automatic allocation:</strong> No need to manually assign each transaction</li>
              <li><strong>Consistency:</strong> The same rule applies every time a matching transaction appears</li>
              <li><strong>Financial visibility:</strong> See how your money flows across different categories</li>
              <li><strong>Budget tracking:</strong> Monitor spending by type and target</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700">
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Example:</h4>
            <p className="text-slate-600 dark:text-slate-400 text-xs mb-2">
              Create a rule called &quot;Salary&quot; that matches income from your employer. Set splits: 60% to Need/Housing, 20% to Want/Entertainment, 20% to Savings/Emergency.
            </p>
            <p className="text-slate-600 dark:text-slate-400 text-xs">
              Every time you log salary income, it automatically splits this way. See on the Routes page how much goes where.
            </p>
          </div>
        </CardContent>
      </Card>

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
                <Label htmlFor="name" className="flex items-center">
                  Rule Name *
                  <InfoTooltip
                    title="Rule Name"
                    description="Give your rule a descriptive name so you can easily identify it later."
                    examples={['Salary', 'Groceries', 'Utilities', 'Freelance Income']}
                  />
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Salary Routing"
                  required
                />
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg space-y-3 border border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center">
                  Matching Criteria
                  <InfoTooltip
                    title="Matching Criteria"
                    description="Define conditions that a transaction must match for this rule to apply. You can match by income source, description, or payment method. Leave blank to match anything."
                    examples={['Multiple criteria must ALL match', 'Use regex for flexible matching']}
                  />
                </h3>
                <div>
                  <Label htmlFor="matchSource" className="flex items-center">
                    Match Income Source (regex)
                    <InfoTooltip
                      title="Income Source Matching"
                      description="Matches the name of income sources (e.g., employer names). Uses regex patterns for flexible matching."
                      examples={['Salary|Wages', 'Google', 'Acme Corp', '^[A-Z].*Ltd']}
                    />
                  </Label>
                  <Input
                    id="matchSource"
                    value={formData.matchSource}
                    onChange={(e) => setFormData({ ...formData, matchSource: e.target.value })}
                    placeholder="e.g., Salary|Wages"
                    className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                  />
                </div>

                <div>
                  <Label htmlFor="matchDescription" className="flex items-center">
                    Match Description (regex)
                    <InfoTooltip
                      title="Description Matching"
                      description="Matches transaction descriptions. Useful for categorizing recurring expenses like groceries or utilities."
                      examples={['Grocery|Whole Foods', 'Amazon', 'Starbucks|Coffee', 'Electric|Water|Gas']}
                    />
                  </Label>
                  <Input
                    id="matchDescription"
                    value={formData.matchDescription}
                    onChange={(e) => setFormData({ ...formData, matchDescription: e.target.value })}
                    placeholder="e.g., Grocery|Amazon"
                    className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                  />
                </div>

                <div>
                  <Label htmlFor="matchMethod" className="flex items-center">
                    Payment Method
                    <InfoTooltip
                      title="Payment Method Matching"
                      description="Match transactions by how they were paid. Leave blank to apply this rule regardless of payment method."
                      examples={['Credit Card expenses', 'Cash purchases', 'ACH transfers']}
                    />
                  </Label>
                  <select
                    id="matchMethod"
                    value={formData.matchMethod}
                    onChange={(e) => setFormData({ ...formData, matchMethod: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Any method</option>
                    <option value="cc">Credit Card</option>
                    <option value="cash">Cash</option>
                    <option value="ach">ACH</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg space-y-3 border border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center">
                  Default Split Allocation
                  <InfoTooltip
                    title="Split Allocation"
                    description="Define how matched transactions should be split across different allocation types and targets. Percentages don't have to total 100% - any remainder stays uncategorized."
                    examples={['60% Need, 30% Want, 10% Savings', '100% Debt (pay off credit card)', '50% each to two accounts']}
                  />
                </h3>
                {formData.splitConfig.map((split, idx) => (
                  <div key={idx} className="flex gap-2">
                    <select
                      value={split.type}
                      onChange={(e) => {
                        const newSplits = [...formData.splitConfig]
                        newSplits[idx].type = e.target.value
                        setFormData({ ...formData, splitConfig: newSplits })
                      }}
                      className="px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg"
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
                      placeholder="Target name (e.g., Housing, Emergency Fund)"
                      className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
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
                      splitConfig: [...formData.splitConfig, { type: 'need', target: '', percent: 0 }],
                    })
                  }
                  className="dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-700"
                >
                  + Add Split
                </Button>
              </div>

              <div>
                <Label htmlFor="notes" className="flex items-center">
                  Notes
                  <InfoTooltip
                    title="Notes"
                    description="Optional notes to remember why this rule exists or any special conditions."
                    examples={['Only for 2024', 'Temporary freelance income', 'Matches all subscriptions']}
                  />
                </Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Optional notes"
                  className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded dark:bg-slate-700 dark:border-slate-600"
                />
                <Label htmlFor="isActive" className="flex items-center">
                  Active
                  <InfoTooltip
                    title="Active Rule"
                    description="Uncheck to temporarily disable a rule without deleting it."
                    examples={['Disable seasonal rules', 'Keep old rules as reference']}
                  />
                </Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit">Save Rule</Button>
                <Button type="button" variant="outline" onClick={resetForm} className="dark:border-slate-600 dark:text-slate-100">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-slate-100">Routing Rules</CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">{rules.length} rules configured</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-slate-500 dark:text-slate-400">Loading...</p>
          ) : rules.length > 0 ? (
            <div className="space-y-4">
              {rules.map((rule) => (
                <div key={rule.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">{rule.name}</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {rule.matchSource && (
                          <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                            Source: {rule.matchSource}
                          </span>
                        )}
                        {rule.matchDescription && (
                          <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                            Desc: {rule.matchDescription}
                          </span>
                        )}
                        {rule.matchMethod && (
                          <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                            Method: {rule.matchMethod}
                          </span>
                        )}
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            rule.isActive
                              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                          }`}
                        >
                          {rule.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(rule)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(rule.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Default Splits:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {rule.splitConfig.map((split, idx) => (
                        <div key={idx} className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                          <span className="font-medium capitalize">{split.type}</span>:{' '}
                          {split.target}
                          {split.percent && ` (${split.percent}%)`}
                        </div>
                      ))}
                    </div>
                  </div>

                  {rule.notes && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 italic">{rule.notes}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 dark:text-slate-400">No rules yet. Create one to get started!</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

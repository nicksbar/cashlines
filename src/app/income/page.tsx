'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { useState, useEffect } from 'react'
import { formatCurrency } from '@/src/lib/money'
import { formatDate } from '@/src/lib/date'
import { Plus, Trash2, TrendingUp, Edit2, Download } from 'lucide-react'

interface IncomeEntry {
  id: string
  date: string
  grossAmount: number
  taxes: number
  preTaxDeductions: number
  postTaxDeductions: number
  netAmount: number
  source: string
  accountId: string
  notes?: string
  tags: string
  account: {
    name: string
  }
}

export default function IncomePage() {
  const [income, setIncome] = useState<IncomeEntry[]>([])
  const [accounts, setAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    source: '',
    accountId: '',
    grossAmount: '',
    taxes: '',
    preTaxDeductions: '',
    postTaxDeductions: '',
    netAmount: '',
    notes: '',
    tags: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [incomeRes, accountsRes] = await Promise.all([
        fetch('/api/income'),
        fetch('/api/accounts'),
      ])
      if (incomeRes.ok) setIncome(await incomeRes.json())
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
      const grossAmount = parseFloat(formData.grossAmount)
      const taxes = parseFloat(formData.taxes || '0')
      const preTaxDeductions = parseFloat(formData.preTaxDeductions || '0')
      const postTaxDeductions = parseFloat(formData.postTaxDeductions || '0')
      const netAmount = grossAmount - taxes - preTaxDeductions - postTaxDeductions

      const method = editingId ? 'PATCH' : 'POST'
      const url = editingId ? `/api/income/${editingId}` : '/api/income'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: new Date(formData.date),
          source: formData.source,
          accountId: formData.accountId,
          grossAmount,
          taxes,
          preTaxDeductions,
          postTaxDeductions,
          netAmount,
          notes: formData.notes,
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      })
      if (response.ok) {
        setFormData({
          date: new Date().toISOString().split('T')[0],
          source: '',
          accountId: '',
          grossAmount: '',
          taxes: '',
          preTaxDeductions: '',
          postTaxDeductions: '',
          netAmount: '',
          notes: '',
          tags: '',
        })
        setShowForm(false)
        setEditingId(null)
        fetchData()
      }
    } catch (error) {
      console.error('Error creating income:', error)
    }
  }

  const handleEdit = (entry: IncomeEntry) => {
    const date = entry.date.split('T')[0]
    setFormData({
      date,
      source: entry.source,
      accountId: entry.accountId,
      grossAmount: entry.grossAmount.toString(),
      taxes: entry.taxes.toString(),
      preTaxDeductions: entry.preTaxDeductions.toString(),
      postTaxDeductions: entry.postTaxDeductions.toString(),
      netAmount: entry.netAmount.toString(),
      notes: entry.notes || '',
      tags: typeof entry.tags === 'string' ? JSON.parse(entry.tags || '[]').join(', ') : '',
    })
    setEditingId(entry.id)
    setShowForm(true)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({
      date: new Date().toISOString().split('T')[0],
      source: '',
      accountId: '',
      grossAmount: '',
      taxes: '',
      preTaxDeductions: '',
      postTaxDeductions: '',
      netAmount: '',
      notes: '',
      tags: '',
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this income entry?')) return
    try {
      const response = await fetch(`/api/income/${id}`, { method: 'DELETE' })
      if (response.ok) fetchData()
    } catch (error) {
      console.error('Error deleting income:', error)
    }
  }

  const totalIncome = income.reduce((sum, i) => sum + i.netAmount, 0)
  const totalGross = income.reduce((sum, i) => sum + i.grossAmount, 0)
  const totalTaxes = income.reduce((sum, i) => sum + i.taxes, 0)
  const totalPreTaxDed = income.reduce((sum, i) => sum + i.preTaxDeductions, 0)
  const totalPostTaxDed = income.reduce((sum, i) => sum + i.postTaxDeductions, 0)
  const keepRatio = totalGross > 0 ? (totalIncome / totalGross) * 100 : 0
  const avgGross = income.length > 0 ? totalGross / income.length : 0
  const avgNet = income.length > 0 ? totalIncome / income.length : 0

  const exportIncome = async () => {
    try {
      const response = await fetch('/api/export?type=income')
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `income-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error exporting income:', error)
      alert('Failed to export income')
    }
  }

  const saveAsTemplate = async () => {
    if (!formData.source || !formData.grossAmount) {
      alert('Please fill in source and gross amount')
      return
    }

    const templateName = prompt('Template name (e.g., "Biweekly Salary"):')
    if (!templateName) return

    try {
      const response = await fetch('/api/templates/income', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: templateName,
          description: formData.source,
          grossAmount: parseFloat(formData.grossAmount),
          federalTaxes: parseFloat(formData.taxes) || 0,
          stateTaxes: 0,
          socialSecurity: 0,
          medicare: 0,
          preDeductions: parseFloat(formData.preTaxDeductions) || 0,
          postDeductions: parseFloat(formData.postTaxDeductions) || 0,
          notes: formData.notes,
        }),
      })

      if (response.ok) {
        alert('Template saved successfully!')
        handleCancel()
      } else {
        alert('Failed to save template')
      }
    } catch (error) {
      console.error('Error saving template:', error)
      alert('Error saving template')
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Income</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">Track income with full deduction breakdown</p>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Summary</h2>
        <div className="flex gap-2">
          <Button onClick={exportIncome} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-2" />
            New Income
          </Button>
        </div>
      </div>

      {/* Summary Statistics */}
      {!loading && income.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-slate-600 mb-1">YTD Gross</div>
              <div className="text-2xl font-bold text-slate-900">{formatCurrency(totalGross)}</div>
              <div className="text-xs text-slate-500 mt-2">Avg: {formatCurrency(avgGross)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-slate-600 mb-1">YTD Taxes</div>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(totalTaxes)}</div>
              <div className="text-xs text-slate-500 mt-2">{((totalTaxes / totalGross) * 100).toFixed(1)}% of gross</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-slate-600 mb-1">YTD Deductions</div>
              <div className="text-2xl font-bold text-orange-600">{formatCurrency(totalPreTaxDed + totalPostTaxDed)}</div>
              <div className="text-xs text-slate-500 mt-2">{((( totalPreTaxDed + totalPostTaxDed) / totalGross) * 100).toFixed(1)}% of gross</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-slate-600 mb-1">YTD Net</div>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</div>
              <div className="text-xs text-slate-500 mt-2">You keep {keepRatio.toFixed(1)}%</div>
            </CardContent>
          </Card>
        </div>
      )}

            {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-slate-100">{editingId ? 'Edit Income' : 'Add Income'}</CardTitle>
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
                  <Label htmlFor="source">Income Source</Label>
                  <Input
                    id="source"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    placeholder="e.g., Salary, Freelance"
                    className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                    required
                  />
                </div>
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
                  <option value="">Select...</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg space-y-4 border border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Income Breakdown</h3>
                
                <div>
                  <Label htmlFor="grossAmount" className="dark:text-slate-100">Gross Amount (Pre-Tax)</Label>
                  <Input
                    id="grossAmount"
                    type="number"
                    step="0.01"
                    value={formData.grossAmount}
                    onChange={(e) => setFormData({ ...formData, grossAmount: e.target.value })}
                    placeholder="0.00"
                    className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="taxes" className="dark:text-slate-100">Taxes</Label>
                    <Input
                      id="taxes"
                      type="number"
                      step="0.01"
                      value={formData.taxes}
                      onChange={(e) => setFormData({ ...formData, taxes: e.target.value })}
                      placeholder="0.00"
                      className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Fed, state, FICA</p>
                  </div>
                  <div>
                    <Label htmlFor="preTaxDeductions" className="dark:text-slate-100">Pre-Tax Deductions</Label>
                    <Input
                      id="preTaxDeductions"
                      type="number"
                      step="0.01"
                      value={formData.preTaxDeductions}
                      onChange={(e) => setFormData({ ...formData, preTaxDeductions: e.target.value })}
                      placeholder="0.00"
                      className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">401k, health insurance</p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="postTaxDeductions" className="dark:text-slate-100">Post-Tax Deductions</Label>
                  <Input
                    id="postTaxDeductions"
                    type="number"
                    step="0.01"
                    value={formData.postTaxDeductions}
                    onChange={(e) => setFormData({ ...formData, postTaxDeductions: e.target.value })}
                    placeholder="0.00"
                    className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Additional withdrawals after tax</p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-3 rounded border border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                    Net Amount: <span className="text-lg text-green-600 dark:text-green-400">
                      {formatCurrency(
                        (parseFloat(formData.grossAmount) || 0) -
                        (parseFloat(formData.taxes) || 0) -
                        (parseFloat(formData.preTaxDeductions) || 0) -
                        (parseFloat(formData.postTaxDeductions) || 0)
                      )}
                    </span>
                  </p>
                  {parseFloat(formData.grossAmount) > 0 && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                      Keep {(((parseFloat(formData.grossAmount) || 0) -
                        (parseFloat(formData.taxes) || 0) -
                        (parseFloat(formData.preTaxDeductions) || 0) -
                        (parseFloat(formData.postTaxDeductions) || 0)) / (parseFloat(formData.grossAmount) || 1) * 100).toFixed(1)}% of gross
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="notes" className="dark:text-slate-100">Notes</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Optional notes"
                  className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                />
              </div>

              <div>
                <Label htmlFor="tags" className="dark:text-slate-100">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="e.g., recurring, tax:w2"
                  className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit">{editingId ? 'Update Income' : 'Save Income'}</Button>
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
          <CardTitle className="text-slate-900 dark:text-slate-100">Income Entries</CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">{income.length} entries</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-slate-500 dark:text-slate-400">Loading...</p>
          ) : income.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                    <th className="text-left py-3 px-2 font-semibold text-slate-900 dark:text-slate-100">Date</th>
                    <th className="text-left py-3 px-2 font-semibold text-slate-900 dark:text-slate-100">Source</th>
                    <th className="text-left py-3 px-2 font-semibold text-slate-900 dark:text-slate-100">Account</th>
                    <th className="text-right py-3 px-2 font-semibold text-slate-900 dark:text-slate-100">Gross</th>
                    <th className="text-right py-3 px-2 font-semibold text-red-600 dark:text-red-400">Taxes</th>
                    <th className="text-right py-3 px-2 font-semibold text-orange-600 dark:text-orange-400">Deductions</th>
                    <th className="text-right py-3 px-2 font-semibold text-green-600 dark:text-green-400">Net</th>
                    <th className="text-right py-3 px-2 font-semibold text-slate-900 dark:text-slate-100">Ratio</th>
                    <th className="text-center py-3 px-2 font-semibold text-slate-900 dark:text-slate-100">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {income.map((entry) => {
                    const deductions = entry.preTaxDeductions + entry.postTaxDeductions
                    const ratio = entry.grossAmount > 0 ? ((entry.netAmount / entry.grossAmount) * 100) : 0
                    return (
                      <tr key={entry.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <td className="py-3 px-2 text-slate-900 dark:text-slate-100">{formatDate(entry.date)}</td>
                        <td className="py-3 px-2 font-medium text-slate-900 dark:text-slate-100">{entry.source}</td>
                        <td className="py-3 px-2 text-slate-600 dark:text-slate-400">{entry.account.name}</td>
                        <td className="py-3 px-2 text-right font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(entry.grossAmount)}</td>
                        <td className="py-3 px-2 text-right text-red-600 dark:text-red-400">{formatCurrency(entry.taxes)}</td>
                        <td className="py-3 px-2 text-right text-orange-600 dark:text-orange-400">{formatCurrency(deductions)}</td>
                        <td className="py-3 px-2 text-right font-semibold text-green-600 dark:text-green-400">{formatCurrency(entry.netAmount)}</td>
                        <td className="py-3 px-2 text-right text-slate-600 dark:text-slate-400 font-mono text-xs">{ratio.toFixed(1)}%</td>
                        <td className="py-3 px-2 text-center">
                          <div className="flex gap-1 justify-center">
                            <button
                              onClick={() => handleEdit(entry)}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(entry.id)}
                              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  <tr className="bg-slate-100 dark:bg-slate-800 font-bold border-t-2 border-slate-300 dark:border-slate-700">
                    <td colSpan={3} className="py-3 px-2 text-slate-900 dark:text-slate-100">TOTAL</td>
                    <td className="py-3 px-2 text-right text-slate-900 dark:text-slate-100">{formatCurrency(totalGross)}</td>
                    <td className="py-3 px-2 text-right text-red-600 dark:text-red-400">{formatCurrency(totalTaxes)}</td>
                    <td className="py-3 px-2 text-right text-orange-600 dark:text-orange-400">{formatCurrency(totalPreTaxDed + totalPostTaxDed)}</td>
                    <td className="py-3 px-2 text-right text-green-600 dark:text-green-400">{formatCurrency(totalIncome)}</td>
                    <td className="py-3 px-2 text-right text-slate-900 dark:text-slate-100">{keepRatio.toFixed(1)}%</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-slate-500 dark:text-slate-400">No income entries yet. Create one to get started!</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

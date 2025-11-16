'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState, useEffect, useCallback } from 'react'
import { formatCurrency, roundAmount } from '@/lib/money'
import { formatDate } from '@/lib/date'
import { Plus, Trash2, TrendingUp, Edit2, Download, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useUser } from '@/lib/UserContext'
import { useConfirmDialog } from '@/components/ConfirmDialog'
import { usePromptDialog } from '@/components/PromptDialog'
import { TemplateSelector } from '@/components/TemplateSelector'
import { extractErrorMessage } from '@/lib/utils'

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
  personId?: string
  notes?: string
  tags: string
  account: {
    name: string
  }
  person?: {
    id: string
    name: string
    color?: string
  }
}

export default function IncomePage() {
  const { currentHousehold } = useUser()
  const { dialog: confirmDialog, confirm } = useConfirmDialog()
  const { dialog: promptDialog, prompt } = usePromptDialog()
  const [income, setIncome] = useState<IncomeEntry[]>([])
  const [accounts, setAccounts] = useState<any[]>([])
  const [people, setPeople] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [alertMessage, setAlertMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    source: '',
    accountId: '',
    personId: '',
    grossAmount: 0,
    taxes: 0,
    preTaxDeductions: 0,
    postTaxDeductions: 0,
    netAmount: 0,
    notes: '',
    tags: '',
  })

  const fetchData = useCallback(async () => {
    if (!currentHousehold) return

    try {
      setLoading(true)
      const headers = { 'x-household-id': currentHousehold.id }
      const [incomeRes, accountsRes, peopleRes] = await Promise.all([
        fetch('/api/income', { headers }),
        fetch('/api/accounts', { headers }),
        fetch('/api/people', { headers }),
      ])
      if (incomeRes.ok) setIncome(await incomeRes.json())
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentHousehold) return

    try {
      // Values are already numbers in state, just ensure rounding
      const grossAmount = roundAmount(formData.grossAmount)
      const taxes = roundAmount(formData.taxes)
      const preTaxDeductions = roundAmount(formData.preTaxDeductions)
      const postTaxDeductions = roundAmount(formData.postTaxDeductions)
      const netAmount = roundAmount(grossAmount - taxes - preTaxDeductions - postTaxDeductions)

      // Validate: gross amount must be positive
      if (grossAmount <= 0) {
        setAlertMessage({ text: 'Gross amount must be greater than $0', type: 'error' })
        setTimeout(() => setAlertMessage(null), 3000)
        return
      }

      // Validate math: net amount should always be positive
      if (netAmount < 0) {
        setAlertMessage({ text: 'Net amount cannot be negative. Check your deductions.', type: 'error' })
        setTimeout(() => setAlertMessage(null), 3000)
        return
      }

      const method = editingId ? 'PATCH' : 'POST'
      const url = editingId ? `/api/income/${editingId}` : '/api/income'

      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'x-household-id': currentHousehold.id,
        },
        body: JSON.stringify({
          date: new Date(formData.date),
          source: formData.source,
          accountId: formData.accountId,
          personId: formData.personId || null,
          grossAmount,
          taxes,
          preTaxDeductions,
          postTaxDeductions,
          netAmount,
          notes: formData.notes,
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
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
        source: '',
        accountId: '',
        personId: '',
        grossAmount: 0,
        taxes: 0,
        preTaxDeductions: 0,
        postTaxDeductions: 0,
        netAmount: 0,
        notes: '',
        tags: '',
      })
      setShowForm(false)
      setEditingId(null)
      setAlertMessage({ text: editingId ? 'Income entry updated successfully' : 'Income entry created successfully', type: 'success' })
      setTimeout(() => setAlertMessage(null), 3000)
      fetchData()
    } catch (error) {
      console.error('Error creating income:', error)
      setAlertMessage({ text: 'An unexpected error occurred. Please try again.', type: 'error' })
      setTimeout(() => setAlertMessage(null), 5000)
    }
  }

  const handleEdit = (entry: IncomeEntry) => {
    const date = entry.date.split('T')[0]
    setFormData({
      date,
      source: entry.source,
      accountId: entry.accountId,
      personId: entry.personId || '',
      grossAmount: entry.grossAmount,
      taxes: entry.taxes,
      preTaxDeductions: entry.preTaxDeductions,
      postTaxDeductions: entry.postTaxDeductions,
      netAmount: entry.netAmount,
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
      personId: '',
      grossAmount: 0,
      taxes: 0,
      preTaxDeductions: 0,
      postTaxDeductions: 0,
      netAmount: 0,
      notes: '',
      tags: '',
    })
  }

  const handleTemplateSelect = (template: any) => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      source: template.name || '',
      accountId: template.accountId || '',
      personId: template.personId || '',
      grossAmount: template.grossAmount || 0,
      taxes: (template.federalTaxes || 0) + (template.stateTaxes || 0) + (template.socialSecurity || 0) + (template.medicare || 0),
      preTaxDeductions: template.preDeductions || 0,
      postTaxDeductions: template.postDeductions || 0,
      netAmount: 0,
      notes: template.description || '',
      tags: '',
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    confirm({
      title: 'Delete Income Entry',
      message: 'Are you sure you want to delete this income entry? This action cannot be undone.',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      isDestructive: true,
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/income/${id}`, { 
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
          setAlertMessage({ text: 'Income entry deleted successfully', type: 'success' })
          setTimeout(() => setAlertMessage(null), 3000)
        } catch (error) {
          console.error('Error deleting income:', error)
          setAlertMessage({ text: 'An unexpected error occurred while deleting.', type: 'error' })
          setTimeout(() => setAlertMessage(null), 5000)
        }
      },
    })
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
        setAlertMessage({ text: 'Income exported successfully', type: 'success' })
        setTimeout(() => setAlertMessage(null), 2000)
      }
    } catch (error) {
      console.error('Error exporting income:', error)
      setAlertMessage({ text: 'Failed to export income', type: 'error' })
      setTimeout(() => setAlertMessage(null), 3000)
    }
  }

  const saveAsTemplate = async () => {
    if (!formData.source || !formData.grossAmount) {
      setAlertMessage({ text: 'Please fill in source and gross amount', type: 'error' })
      setTimeout(() => setAlertMessage(null), 3000)
      return
    }

    prompt({
      title: 'Save as Template',
      message: 'Choose a name for this income template',
      inputPlaceholder: 'e.g., "Biweekly Salary"',
      confirmLabel: 'Save',
      onConfirm: async (templateName) => {
        try {
          const response = await fetch('/api/templates/income', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'x-household-id': currentHousehold?.id || '',
            },
            body: JSON.stringify({
              name: templateName,
              description: formData.source,
              accountId: formData.accountId,
              personId: formData.personId || null,
              grossAmount: roundAmount(formData.grossAmount),
              federalTaxes: roundAmount(formData.taxes || 0),
              stateTaxes: 0,
              socialSecurity: 0,
              medicare: 0,
              preDeductions: roundAmount(formData.preTaxDeductions || 0),
              postDeductions: roundAmount(formData.postTaxDeductions || 0),
              notes: formData.notes,
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
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Income</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">Track income with full deduction breakdown</p>
      </div>

      {alertMessage && (
        <div className={`p-4 rounded-lg flex items-start gap-3 ${
          alertMessage.type === 'success'
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900'
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900'
        }`}>
          {alertMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          )}
          <p className={alertMessage.type === 'success'
            ? 'text-green-800 dark:text-green-300'
            : 'text-red-800 dark:text-red-300'
          }>
            {alertMessage.text}
          </p>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Summary</h2>
        <div className="flex gap-2">
          <TemplateSelector type="income" onSelect={handleTemplateSelect} />
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
          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardContent className="pt-6">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">YTD Gross</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{formatCurrency(totalGross)}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">Avg: {formatCurrency(avgGross)}</div>
            </CardContent>
          </Card>

          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardContent className="pt-6">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">YTD Taxes</div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(totalTaxes)}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">{((totalTaxes / totalGross) * 100).toFixed(1)}% of gross</div>
            </CardContent>
          </Card>

          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardContent className="pt-6">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">YTD Deductions</div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{formatCurrency(totalPreTaxDed + totalPostTaxDed)}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">{((( totalPreTaxDed + totalPostTaxDed) / totalGross) * 100).toFixed(1)}% of gross</div>
            </CardContent>
          </Card>

          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardContent className="pt-6">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">YTD Net</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(totalIncome)}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">You keep {keepRatio.toFixed(1)}%</div>
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

              <div>
                <Label htmlFor="personId">Person (Optional)</Label>
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

              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg space-y-4 border border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Income Breakdown</h3>
                
                <div>
                  <Label htmlFor="grossAmount" className="dark:text-slate-100">Gross Amount (Pre-Tax)</Label>
                  <Input
                    id="grossAmount"
                    type="number"
                    step="0.01"
                    value={formData.grossAmount || ''}
                    onChange={(e) => setFormData({ ...formData, grossAmount: parseFloat(e.target.value) || 0 })}
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
                      value={formData.taxes || ''}
                      onChange={(e) => setFormData({ ...formData, taxes: parseFloat(e.target.value) || 0 })}
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
                      value={formData.preTaxDeductions || ''}
                      onChange={(e) => setFormData({ ...formData, preTaxDeductions: parseFloat(e.target.value) || 0 })}
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
                    value={formData.postTaxDeductions || ''}
                    onChange={(e) => setFormData({ ...formData, postTaxDeductions: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Additional withdrawals after tax</p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-3 rounded border border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                    Net Amount: <span className="text-lg text-green-600 dark:text-green-400">
                      {formatCurrency(
                        formData.grossAmount -
                        formData.taxes -
                        formData.preTaxDeductions -
                        formData.postTaxDeductions
                      )}
                    </span>
                  </p>
                  {formData.grossAmount > 0 && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                      Keep {(((formData.grossAmount -
                        formData.taxes -
                        formData.preTaxDeductions -
                        formData.postTaxDeductions) / formData.grossAmount) * 100).toFixed(1)}% of gross
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
                    <th className="text-left py-3 px-2 font-semibold text-slate-900 dark:text-slate-100">Person</th>
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
                        <td className="py-3 px-2">
                          {entry.person ? (
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: entry.person.color || '#4ECDC4' }}
                              />
                              <span className="text-slate-900 dark:text-slate-100">{entry.person.name}</span>
                            </div>
                          ) : (
                            <span className="text-slate-500 dark:text-slate-400 text-sm">—</span>
                          )}
                        </td>
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

'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useUser } from '@/lib/UserContext'
import { formatCurrency } from '@/lib/money'
import { Save, AlertCircle } from 'lucide-react'

interface Settings {
  userId: string
  monthlyIncomeTarget?: number
  monthlyExpenseTarget?: number
  savingsTarget?: number
  savingsRate?: number
  needPercent: number
  wantPercent: number
  savingsPercent: number
  lowBalanceThreshold?: number
  highCreditCardThreshold?: number
  trackedCategories: string
  excludeFromBudget: string
  currency: string
  fiscalYearStart: number
}

export default function SettingsPage() {
  const { currentHousehold } = useUser()
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const fetchSettings = useCallback(async () => {
    if (!currentHousehold) return

    try {
      setLoading(true)
      const response = await fetch('/api/settings', {
        headers: { 'x-household-id': currentHousehold.id },
      })
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      setMessage({ type: 'error', text: 'Failed to load settings' })
    } finally {
      setLoading(false)
    }
  }, [currentHousehold])

  useEffect(() => {
    if (currentHousehold) {
      fetchSettings()
    }
  }, [currentHousehold, fetchSettings])

  const handleSave = async () => {
    if (!currentHousehold || !settings) return

    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-household-id': currentHousehold.id,
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' })
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({ type: 'error', text: 'Failed to save settings' })
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      setMessage({ type: 'error', text: 'Error saving settings' })
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (key: keyof Settings, value: any) => {
    if (settings) {
      setSettings({
        ...settings,
        [key]: value === '' ? null : value,
      })
    }
  }

  if (loading) {
    return <div className="text-slate-600 dark:text-slate-400">Loading settings...</div>
  }

  if (!settings) {
    return <div className="text-slate-600 dark:text-slate-400">Failed to load settings</div>
  }

  const totalPercent = settings.needPercent + settings.wantPercent + settings.savingsPercent

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Settings & Goals</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Set your budget targets, goals, and thresholds to track your financial health
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg border ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-900'
              : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-900'
          }`}
        >
          <p className={message.type === 'success' ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}>
            {message.text}
          </p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Income & Expense Targets */}
        <Card>
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-slate-100">Income & Expense Targets</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Set your monthly financial goals
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="monthlyIncome" className="text-slate-900 dark:text-slate-100">
                Target Monthly Income
              </Label>
              <Input
                id="monthlyIncome"
                type="number"
                step="100"
                value={settings.monthlyIncomeTarget || ''}
                onChange={(e) => updateSetting('monthlyIncomeTarget', e.target.value ? parseFloat(e.target.value) : null)}
                placeholder="e.g., 5000"
                className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 mt-1"
              />
              {settings.monthlyIncomeTarget && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {formatCurrency(settings.monthlyIncomeTarget)}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="monthlyExpense" className="text-slate-900 dark:text-slate-100">
                Target Monthly Expenses
              </Label>
              <Input
                id="monthlyExpense"
                type="number"
                step="100"
                value={settings.monthlyExpenseTarget || ''}
                onChange={(e) => updateSetting('monthlyExpenseTarget', e.target.value ? parseFloat(e.target.value) : null)}
                placeholder="e.g., 3000"
                className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 mt-1"
              />
              {settings.monthlyExpenseTarget && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {formatCurrency(settings.monthlyExpenseTarget)}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="savingsRate" className="text-slate-900 dark:text-slate-100">
                Target Savings Rate (%)
              </Label>
              <Input
                id="savingsRate"
                type="number"
                min="0"
                max="100"
                step="1"
                value={settings.savingsRate || ''}
                onChange={(e) => updateSetting('savingsRate', e.target.value ? parseFloat(e.target.value) : null)}
                placeholder="e.g., 20"
                className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 mt-1"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Percentage of income you aim to save each month
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Budget Allocation Rules */}
        <Card>
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-slate-100">Budget Allocation (50/30/20 Rule)</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Customize your spending percentages
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded border border-blue-200 dark:border-blue-900">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Traditional 50/30/20: 50% needs, 30% wants, 20% savings
              </p>
            </div>

            <div>
              <Label htmlFor="needPercent" className="text-slate-900 dark:text-slate-100">
                Needs (%)
              </Label>
              <Input
                id="needPercent"
                type="number"
                min="0"
                max="100"
                step="1"
                value={settings.needPercent}
                onChange={(e) => updateSetting('needPercent', parseFloat(e.target.value) || 50)}
                className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 mt-1"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Housing, utilities, food, insurance, transportation
              </p>
            </div>

            <div>
              <Label htmlFor="wantPercent" className="text-slate-900 dark:text-slate-100">
                Wants (%)
              </Label>
              <Input
                id="wantPercent"
                type="number"
                min="0"
                max="100"
                step="1"
                value={settings.wantPercent}
                onChange={(e) => updateSetting('wantPercent', parseFloat(e.target.value) || 30)}
                className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 mt-1"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Entertainment, dining, hobbies, shopping
              </p>
            </div>

            <div>
              <Label htmlFor="savingsPercent" className="text-slate-900 dark:text-slate-100">
                Savings (%)
              </Label>
              <Input
                id="savingsPercent"
                type="number"
                min="0"
                max="100"
                step="1"
                value={settings.savingsPercent}
                onChange={(e) => updateSetting('savingsPercent', parseFloat(e.target.value) || 20)}
                className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 mt-1"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Emergency fund, investments, retirement
              </p>
            </div>

            {totalPercent !== 100 && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded border border-yellow-200 dark:border-yellow-900 flex gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-700 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Total must equal 100% (currently {totalPercent}%)
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alerts & Thresholds */}
        <Card>
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-slate-100">Alerts & Thresholds</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Get notified when you hit limits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="lowBalance" className="text-slate-900 dark:text-slate-100">
                Low Balance Alert
              </Label>
              <Input
                id="lowBalance"
                type="number"
                step="100"
                value={settings.lowBalanceThreshold || ''}
                onChange={(e) => updateSetting('lowBalanceThreshold', e.target.value ? parseFloat(e.target.value) : null)}
                placeholder="e.g., 500"
                className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 mt-1"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Alert if checking account falls below this amount
              </p>
            </div>

            <div>
              <Label htmlFor="highCCBalance" className="text-slate-900 dark:text-slate-100">
                High Credit Card Balance Alert
              </Label>
              <Input
                id="highCCBalance"
                type="number"
                step="100"
                value={settings.highCreditCardThreshold || ''}
                onChange={(e) => updateSetting('highCreditCardThreshold', e.target.value ? parseFloat(e.target.value) : null)}
                placeholder="e.g., 5000"
                className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 mt-1"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Alert if credit card balance exceeds this amount
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Fiscal Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-slate-100">Fiscal Settings</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Configure your tracking period
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="currency" className="text-slate-900 dark:text-slate-100">
                Currency
              </Label>
              <select
                id="currency"
                value={settings.currency}
                onChange={(e) => updateSetting('currency', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 mt-1"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD (C$)</option>
                <option value="AUD">AUD (A$)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>

            <div>
              <Label htmlFor="fiscalYear" className="text-slate-900 dark:text-slate-100">
                Fiscal Year Starts (Month)
              </Label>
              <select
                id="fiscalYear"
                value={settings.fiscalYearStart}
                onChange={(e) => updateSetting('fiscalYearStart', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 mt-1"
              >
                <option value="1">January</option>
                <option value="2">February</option>
                <option value="3">March</option>
                <option value="4">April</option>
                <option value="5">May</option>
                <option value="6">June</option>
                <option value="7">July</option>
                <option value="8">August</option>
                <option value="9">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
              </select>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                When your financial year starts (for annual reports)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  )
}

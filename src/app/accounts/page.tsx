'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react'
import { formatCurrency } from '@/src/lib/money'
import { useUser } from '@/src/lib/UserContext'

const ACCOUNT_TYPES = [
  { value: 'checking', label: 'Checking' },
  { value: 'savings', label: 'Savings' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'cash', label: 'Cash' },
  { value: 'investment', label: 'Investment' },
  { value: 'loan', label: 'Loan' },
  { value: 'other', label: 'Other' },
]

interface Account {
  id: string
  name: string
  type: string
  isActive: boolean
  notes?: string
  creditLimit?: number | null
  interestRate?: number | null
  cashBackPercent?: number | null
  pointsPerDollar?: number | null
  annualFee?: number | null
  rewardsProgram?: string | null
  interestRateApy?: number | null
  monthlyFee?: number | null
  minimumBalance?: number | null
  isFdic?: boolean | null
  location?: string | null
  currentBalance?: number | null
  accountNumber?: string | null
  principalBalance?: number | null
  personId?: string
  person?: {
    id: string
    name: string
    color?: string
  }
}

export default function AccountsPage() {
  const { currentHousehold } = useUser()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [people, setPeople] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'checking',
    personId: '',
    isActive: true,
    notes: '',
    // Credit card fields
    creditLimit: '',
    interestRate: '',
    cashBackPercent: '',
    pointsPerDollar: '',
    annualFee: '',
    rewardsProgram: '',
    // Savings/Checking fields
    interestRateApy: '',
    monthlyFee: '',
    minimumBalance: '',
    isFdic: false,
    // Cash/General fields
    location: '',
    currentBalance: '',
    accountNumber: '',
    // Loan/Investment fields
    principalBalance: '',
  })

  useEffect(() => {
    if (currentHousehold) {
      fetchData()
    }
  }, [currentHousehold?.id])

  const fetchData = async () => {
    if (!currentHousehold) return

    try {
      setLoading(true)
      const headers = { 'x-household-id': currentHousehold.id }
      const [accountsRes, peopleRes] = await Promise.all([
        fetch('/api/accounts', { headers }),
        fetch('/api/people', { headers }),
      ])
      if (accountsRes.ok) setAccounts(await accountsRes.json())
      if (peopleRes.ok) setPeople(await peopleRes.json())
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentHousehold) return

    try {
      const method = editingId ? 'PATCH' : 'POST'
      const url = editingId ? `/api/accounts/${editingId}` : '/api/accounts'

      // Build payload, converting empty strings to null for numeric fields
      const payload: any = {
        name: formData.name,
        type: formData.type,
        personId: formData.personId || null,
        isActive: formData.isActive,
        notes: formData.notes,
      }

      // Add optional numeric fields only if they have values
      if (formData.creditLimit) payload.creditLimit = parseFloat(formData.creditLimit)
      if (formData.interestRate) payload.interestRate = parseFloat(formData.interestRate)
      if (formData.cashBackPercent) payload.cashBackPercent = parseFloat(formData.cashBackPercent)
      if (formData.pointsPerDollar) payload.pointsPerDollar = parseFloat(formData.pointsPerDollar)
      if (formData.annualFee) payload.annualFee = parseFloat(formData.annualFee)
      if (formData.rewardsProgram) payload.rewardsProgram = formData.rewardsProgram
      if (formData.interestRateApy) payload.interestRateApy = parseFloat(formData.interestRateApy)
      if (formData.monthlyFee) payload.monthlyFee = parseFloat(formData.monthlyFee)
      if (formData.minimumBalance) payload.minimumBalance = parseFloat(formData.minimumBalance)
      payload.isFdic = formData.isFdic || null
      if (formData.location) payload.location = formData.location
      if (formData.currentBalance) payload.currentBalance = parseFloat(formData.currentBalance)
      if (formData.accountNumber) payload.accountNumber = formData.accountNumber
      if (formData.principalBalance) payload.principalBalance = parseFloat(formData.principalBalance)

      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'x-household-id': currentHousehold.id,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error('Failed to save account')

      setFormData({ 
        name: '', type: 'checking', personId: '', isActive: true, notes: '', 
        creditLimit: '', interestRate: '', cashBackPercent: '', pointsPerDollar: '',
        annualFee: '', rewardsProgram: '', interestRateApy: '', monthlyFee: '',
        minimumBalance: '', isFdic: false, location: '', currentBalance: '',
        accountNumber: '', principalBalance: ''
      })
      setShowForm(false)
      setEditingId(null)
      fetchData()
    } catch (error) {
      console.error('Error saving account:', error)
    }
  }

  const handleEdit = (account: Account) => {
    setFormData({
      name: account.name,
      type: account.type,
      personId: account.personId || '',
      isActive: account.isActive,
      notes: account.notes || '',
      creditLimit: account.creditLimit ? account.creditLimit.toString() : '',
      interestRate: account.interestRate ? account.interestRate.toString() : '',
      cashBackPercent: account.cashBackPercent ? account.cashBackPercent.toString() : '',
      pointsPerDollar: account.pointsPerDollar ? account.pointsPerDollar.toString() : '',
      annualFee: account.annualFee ? account.annualFee.toString() : '',
      rewardsProgram: account.rewardsProgram || '',
      interestRateApy: account.interestRateApy ? account.interestRateApy.toString() : '',
      monthlyFee: account.monthlyFee ? account.monthlyFee.toString() : '',
      minimumBalance: account.minimumBalance ? account.minimumBalance.toString() : '',
      isFdic: account.isFdic || false,
      location: account.location || '',
      currentBalance: account.currentBalance ? account.currentBalance.toString() : '',
      accountNumber: account.accountNumber || '',
      principalBalance: account.principalBalance ? account.principalBalance.toString() : '',
    })
    setEditingId(account.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this account?')) return
    try {
      const response = await fetch(`/api/accounts/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete')
      fetchData()
    } catch (error) {
      console.error('Error deleting account:', error)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({ 
      name: '', type: 'checking', personId: '', isActive: true, notes: '', 
      creditLimit: '', interestRate: '', cashBackPercent: '', pointsPerDollar: '',
      annualFee: '', rewardsProgram: '', interestRateApy: '', monthlyFee: '',
      minimumBalance: '', isFdic: false, location: '', currentBalance: '',
      accountNumber: '', principalBalance: ''
    })
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Accounts</h1>
        <p className="text-slate-600 mt-2">Manage your accounts and funding sources</p>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          New Account
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Account' : 'Create Account'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Account Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Chase Checking"
                  required
                />
              </div>

              <div>
                <Label htmlFor="type">Account Type</Label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {ACCOUNT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="personId">Person</Label>
                <select
                  id="personId"
                  value={formData.personId}
                  onChange={(e) => setFormData({ ...formData, personId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                />
              </div>

              {/* Credit Card Fields */}
              {formData.type === 'credit_card' && (
                <div className="space-y-4 pt-4 border-t border-slate-200">
                  <h3 className="font-medium text-slate-900">Credit Card Details</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="creditLimit">Credit Limit ($)</Label>
                      <Input
                        id="creditLimit"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.creditLimit}
                        onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                        placeholder="e.g., 5000"
                      />
                    </div>

                    <div>
                      <Label htmlFor="interestRate">APR (%)</Label>
                      <Input
                        id="interestRate"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={formData.interestRate}
                        onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                        placeholder="e.g., 18.99"
                      />
                    </div>

                    <div>
                      <Label htmlFor="cashBackPercent">Cash Back (%)</Label>
                      <Input
                        id="cashBackPercent"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={formData.cashBackPercent}
                        onChange={(e) => setFormData({ ...formData, cashBackPercent: e.target.value })}
                        placeholder="e.g., 1.5"
                      />
                    </div>

                    <div>
                      <Label htmlFor="pointsPerDollar">Points per Dollar</Label>
                      <Input
                        id="pointsPerDollar"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={formData.pointsPerDollar}
                        onChange={(e) => setFormData({ ...formData, pointsPerDollar: e.target.value })}
                        placeholder="e.g., 2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="annualFee">Annual Fee ($)</Label>
                      <Input
                        id="annualFee"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.annualFee}
                        onChange={(e) => setFormData({ ...formData, annualFee: e.target.value })}
                        placeholder="e.g., 95"
                      />
                    </div>

                    <div>
                      <Label htmlFor="rewardsProgram">Rewards Program</Label>
                      <Input
                        id="rewardsProgram"
                        value={formData.rewardsProgram}
                        onChange={(e) => setFormData({ ...formData, rewardsProgram: e.target.value })}
                        placeholder="e.g., Chase Ultimate Rewards"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Savings/Checking Account Fields */}
              {(formData.type === 'savings' || formData.type === 'checking') && (
                <div className="space-y-4 pt-4 border-t border-slate-200">
                  <h3 className="font-medium text-slate-900">
                    {formData.type === 'savings' ? 'Savings Account' : 'Checking Account'} Details
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="interestRateApy">APY (%)</Label>
                      <Input
                        id="interestRateApy"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={formData.interestRateApy}
                        onChange={(e) => setFormData({ ...formData, interestRateApy: e.target.value })}
                        placeholder="e.g., 4.5"
                      />
                    </div>

                    <div>
                      <Label htmlFor="monthlyFee">Monthly Fee ($)</Label>
                      <Input
                        id="monthlyFee"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.monthlyFee}
                        onChange={(e) => setFormData({ ...formData, monthlyFee: e.target.value })}
                        placeholder="e.g., 0"
                      />
                    </div>

                    <div>
                      <Label htmlFor="minimumBalance">Minimum Balance ($)</Label>
                      <Input
                        id="minimumBalance"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.minimumBalance}
                        onChange={(e) => setFormData({ ...formData, minimumBalance: e.target.value })}
                        placeholder="e.g., 500"
                      />
                    </div>

                    <div className="flex items-end">
                      <div className="flex items-center space-x-2 w-full">
                        <input
                          id="isFdic"
                          type="checkbox"
                          checked={formData.isFdic}
                          onChange={(e) => setFormData({ ...formData, isFdic: e.target.checked })}
                          className="w-4 h-4 rounded border-slate-300"
                        />
                        <Label htmlFor="isFdic" className="font-normal cursor-pointer mb-0">
                          FDIC Insured
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Cash Account Fields */}
              {formData.type === 'cash' && (
                <div className="space-y-4 pt-4 border-t border-slate-200">
                  <h3 className="font-medium text-slate-900">Cash Details</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="e.g., Wallet, Safe, Drawer"
                      />
                    </div>

                    <div>
                      <Label htmlFor="currentBalance">Current Balance ($)</Label>
                      <Input
                        id="currentBalance"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.currentBalance}
                        onChange={(e) => setFormData({ ...formData, currentBalance: e.target.value })}
                        placeholder="e.g., 100"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Investment/Loan Account Fields */}
              {(formData.type === 'investment' || formData.type === 'loan') && (
                <div className="space-y-4 pt-4 border-t border-slate-200">
                  <h3 className="font-medium text-slate-900">
                    {formData.type === 'investment' ? 'Investment Account' : 'Loan'} Details
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="currentBalance">Current Balance ($)</Label>
                      <Input
                        id="currentBalance"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.currentBalance}
                        onChange={(e) => setFormData({ ...formData, currentBalance: e.target.value })}
                        placeholder="e.g., 10000"
                      />
                    </div>

                    {formData.type === 'loan' && (
                      <div>
                        <Label htmlFor="principalBalance">Remaining Principal ($)</Label>
                        <Input
                          id="principalBalance"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.principalBalance}
                          onChange={(e) => setFormData({ ...formData, principalBalance: e.target.value })}
                          placeholder="e.g., 15000"
                        />
                      </div>
                    )}

                    <div>
                      <Label htmlFor="accountNumber">Account Number</Label>
                      <Input
                        id="accountNumber"
                        value={formData.accountNumber}
                        onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                        placeholder="e.g., ****1234 (masked for security)"
                      />
                    </div>

                    {formData.type === 'loan' && (
                      <div>
                        <Label htmlFor="interestRate">Interest Rate (APR %)</Label>
                        <Input
                          id="interestRate"
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={formData.interestRate}
                          onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                          placeholder="e.g., 5.5"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300"
                />
                <Label htmlFor="isActive" className="font-normal cursor-pointer">
                  Active
                </Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit">
                  {editingId ? 'Update Account' : 'Create Account'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <p className="text-slate-500">Loading...</p>
        </div>
      ) : accounts.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <Card key={account.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{account.name}</CardTitle>
                    <CardDescription className="capitalize">
                      {ACCOUNT_TYPES.find((t) => t.value === account.type)?.label || account.type}
                    </CardDescription>
                    {account.person && (
                      <div className="flex items-center gap-2 mt-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: account.person.color || '#4ECDC4' }}
                        />
                        <span className="text-xs text-slate-600">{account.person.name}</span>
                      </div>
                    )}
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      account.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {account.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                {account.notes && (
                  <p className="text-sm text-slate-600 mb-4">{account.notes}</p>
                )}
                
                {/* Credit Card Details */}
                {account.type === 'credit_card' && (
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg space-y-2 border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-sm mb-2">Credit Card Info</h4>
                    {account.creditLimit && (
                      <div className="text-sm"><span className="text-slate-600 dark:text-slate-300">Limit: </span><span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(account.creditLimit)}</span></div>
                    )}
                    {account.interestRate && (
                      <div className="text-sm"><span className="text-slate-600 dark:text-slate-300">APR: </span><span className="font-semibold text-slate-900 dark:text-slate-100">{account.interestRate.toFixed(2)}%</span></div>
                    )}
                    {account.cashBackPercent && (
                      <div className="text-sm"><span className="text-slate-600 dark:text-slate-300">Cash Back: </span><span className="font-semibold text-slate-900 dark:text-slate-100">{account.cashBackPercent.toFixed(2)}%</span></div>
                    )}
                    {account.pointsPerDollar && (
                      <div className="text-sm"><span className="text-slate-600 dark:text-slate-300">Points: </span><span className="font-semibold text-slate-900 dark:text-slate-100">{account.pointsPerDollar.toFixed(2)}/$ </span></div>
                    )}
                    {account.annualFee && (
                      <div className="text-sm"><span className="text-slate-600 dark:text-slate-300">Annual Fee: </span><span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(account.annualFee)}</span></div>
                    )}
                    {account.rewardsProgram && (
                      <div className="text-sm"><span className="text-slate-600 dark:text-slate-300">Program: </span><span className="font-semibold text-slate-900 dark:text-slate-100">{account.rewardsProgram}</span></div>
                    )}
                  </div>
                )}

                {/* Savings/Checking Details */}
                {(account.type === 'savings' || account.type === 'checking') && (
                  <div className="mb-4 p-3 bg-green-50 dark:bg-green-950 rounded-lg space-y-2 border border-green-200 dark:border-green-800">
                    <h4 className="font-semibold text-green-900 dark:text-green-100 text-sm mb-2">{account.type === 'savings' ? 'Savings' : 'Checking'} Info</h4>
                    {account.interestRateApy && (
                      <div className="text-sm"><span className="text-slate-600 dark:text-slate-300">APY: </span><span className="font-semibold text-slate-900 dark:text-slate-100">{account.interestRateApy.toFixed(2)}%</span></div>
                    )}
                    {account.monthlyFee !== null && account.monthlyFee !== undefined && (
                      <div className="text-sm"><span className="text-slate-600 dark:text-slate-300">Monthly Fee: </span><span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(account.monthlyFee)}</span></div>
                    )}
                    {account.minimumBalance && (
                      <div className="text-sm"><span className="text-slate-600 dark:text-slate-300">Min Balance: </span><span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(account.minimumBalance)}</span></div>
                    )}
                    {account.isFdic && (
                      <div className="text-sm"><span className="text-slate-600 dark:text-slate-300">✓ </span><span className="font-semibold text-slate-900 dark:text-slate-100">FDIC Insured</span></div>
                    )}
                  </div>
                )}

                {/* Cash Details */}
                {account.type === 'cash' && (
                  <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950 rounded-lg space-y-2 border border-amber-200 dark:border-amber-800">
                    <h4 className="font-semibold text-amber-900 dark:text-amber-100 text-sm mb-2">Cash Details</h4>
                    {account.location && (
                      <div className="text-sm"><span className="text-slate-600 dark:text-slate-300">Location: </span><span className="font-semibold text-slate-900 dark:text-slate-100">{account.location}</span></div>
                    )}
                    {account.currentBalance && (
                      <div className="text-sm"><span className="text-slate-600 dark:text-slate-300">Balance: </span><span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(account.currentBalance)}</span></div>
                    )}
                  </div>
                )}

                {/* Investment/Loan Details */}
                {(account.type === 'investment' || account.type === 'loan') && (
                  <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-950 rounded-lg space-y-2 border border-purple-200 dark:border-purple-800">
                    <h4 className="font-semibold text-purple-900 dark:text-purple-100 text-sm mb-2">{account.type === 'investment' ? 'Investment' : 'Loan'} Info</h4>
                    {account.currentBalance && (
                      <div className="text-sm"><span className="text-slate-600 dark:text-slate-300">Balance: </span><span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(account.currentBalance)}</span></div>
                    )}
                    {account.principalBalance && (
                      <div className="text-sm"><span className="text-slate-600 dark:text-slate-300">Principal: </span><span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(account.principalBalance)}</span></div>
                    )}
                    {account.interestRate && account.type === 'loan' && (
                      <div className="text-sm"><span className="text-slate-600 dark:text-slate-300">Rate: </span><span className="font-semibold text-slate-900 dark:text-slate-100">{account.interestRate.toFixed(2)}%</span></div>
                    )}
                    {account.accountNumber && (
                      <div className="text-sm"><span className="text-slate-600 dark:text-slate-300">Account: </span><span className="font-semibold text-xs text-slate-900 dark:text-slate-100">{account.accountNumber}</span></div>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(account)}
                    className="flex-1"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(account.id)}
                    className="flex-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-slate-500">No accounts yet. Create one to get started!</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}


'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { formatCurrency } from '@/src/lib/money'

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/accounts')
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setAccounts(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
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
            <CardTitle>Create Account</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">Account form coming soon...</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account) => (
          <Card key={account.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{account.name}</CardTitle>
                  <CardDescription className="capitalize">
                    {account.type.replace('_', ' ')}
                  </CardDescription>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  account.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {account.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {account.notes && (
                <p className="text-sm text-slate-600">{account.notes}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {accounts.length === 0 && !loading && (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-slate-500">No accounts yet. Create one to get started!</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

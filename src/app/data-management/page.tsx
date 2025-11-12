'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { AlertCircle, Trash2, RefreshCw, Zap } from 'lucide-react'
import { useUser } from '@/src/lib/UserContext'

export default function DataManagementPage() {
  const { currentHousehold } = useUser()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)

  // Redirect if no household selected
  useEffect(() => {
    if (!currentHousehold) {
      setMessage({
        type: 'error',
        text: 'Please select a household first',
      })
    }
  }, [currentHousehold])

  const handleReset = async () => {
    if (!confirmReset) {
      setConfirmReset(true)
      return
    }

    if (!currentHousehold) {
      setMessage({
        type: 'error',
        text: 'No household selected',
      })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/data/reset', {
        method: 'POST',
        headers: { 'x-household-id': currentHousehold.id },
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.locked) {
          setMessage({
            type: 'error',
            text: data.error,
          })
        } else {
          setMessage({
            type: 'error',
            text: data.error || 'Failed to reset data',
          })
        }
      } else {
        setMessage({
          type: 'success',
          text: 'All data deleted successfully. Load test data to get started.',
        })
        setConfirmReset(false)
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to reset data',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSeed = async (type: string) => {
    if (!currentHousehold) {
      setMessage({
        type: 'error',
        text: 'No household selected',
      })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/data/seed', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-household-id': currentHousehold.id,
        },
        body: JSON.stringify({ type }),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage({
          type: 'error',
          text: data.error || 'Failed to load test data',
        })
      } else {
        setMessage({
          type: 'success',
          text: `Test data loaded! Created: ${data.itemsCreated.people} people, ${data.itemsCreated.accounts} accounts, ${data.itemsCreated.income} income entries, ${data.itemsCreated.transactions} transactions.`,
        })
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to load test data',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Data Management</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Reset your data and load test scenarios to explore Cashlines features.
        </p>
      </div>

      {message && (
        <Card className={message.type === 'error' ? 'border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950' : 'border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950'}>
          <CardContent className="pt-6">
            <p className={message.type === 'error' ? 'text-red-800 dark:text-red-200' : 'text-green-800 dark:text-green-200'}>
              {message.text}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Reset Data Card */}
        <Card className="border-red-200 dark:border-red-900">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
                  Reset All Data
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Delete all your data and start fresh
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-lg">
              <div className="flex gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-800 dark:text-red-200">
                  <p className="font-semibold mb-1">This action cannot be undone.</p>
                  <p>All accounts, income, transactions, rules, and templates will be permanently deleted.</p>
                </div>
              </div>
            </div>

            {confirmReset && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-900 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                  Are you sure? Click below to confirm permanent deletion.
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setConfirmReset(false)}
                    variant="outline"
                    className="flex-1"
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleReset}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    disabled={loading}
                  >
                    {loading ? 'Deleting...' : 'Yes, Delete All Data'}
                  </Button>
                </div>
              </div>
            )}

            {!confirmReset && (
              <Button
                onClick={handleReset}
                variant="destructive"
                className="w-full"
                disabled={loading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete All Data
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Load Test Data Card */}
        <Card className="border-blue-200 dark:border-blue-900">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Load Test Data
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Populate your account with sample data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Load a realistic household scenario with ~$150k/year income, mortgage, 2 cars, and 2 kids.
              </p>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <Button
                  onClick={() => handleSeed('household')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={loading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {loading ? 'Loading...' : 'Load Household Scenario'}
                </Button>
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                  One month of realistic expenses (~$5,400)
                </p>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={() => handleSeed('year')}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                  disabled={loading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {loading ? 'Loading...' : 'Load Full Year of Data'}
                </Button>
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                  12 months with 50+ income & 600+ transactions
                </p>
              </div>

              <hr className="my-2 border-slate-300 dark:border-slate-600" />

              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-4 mb-3">
                Realistic Scenarios (Essential Expenses Only)
              </p>

              <div className="space-y-2">
                <Button
                  onClick={() => handleSeed('single-no-cc')}
                  className="w-full bg-slate-600 hover:bg-slate-700 text-white text-sm"
                  disabled={loading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Single, No CC
                </Button>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Simple W2 salary, tight budget, essential expenses only
                </p>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={() => handleSeed('business-owner')}
                  className="w-full bg-slate-600 hover:bg-slate-700 text-white text-sm"
                  disabled={loading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Business Owner
                </Button>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Self-employed with quarterly tax payments
                </p>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={() => handleSeed('working-teens')}
                  className="w-full bg-slate-600 hover:bg-slate-700 text-white text-sm"
                  disabled={loading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Working Teens + Gig Income
                </Button>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Family with variable gig income streams
                </p>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={() => handleSeed('complex-family')}
                  className="w-full bg-slate-600 hover:bg-slate-700 text-white text-sm"
                  disabled={loading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Complex Family
                </Button>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Multiple properties, business income, bonuses
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-slate-100">How It Works</CardTitle>
        </CardHeader>
  <CardContent className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Initial Setup</h4>
            <p>When you first start using Cashlines, load test data to explore features without worrying about real data.</p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">During Development</h4>
            <p>Reset and reload test data as needed to try different scenarios and test features.</p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Production Protection</h4>
            <p>Once you&apos;ve marked your account as production, reset and load features are automatically disabled to protect your real data.</p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Quick Manage Links</h4>
            <p className="mb-2">Jump straight to areas where you can edit or add data:</p>
            <div className="flex flex-wrap gap-2">
              <Link href="/accounts" className="inline-flex items-center px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-sm rounded-md border">
                Accounts
              </Link>
              <Link href="/income" className="inline-flex items-center px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-sm rounded-md border">
                Income
              </Link>
              <Link href="/transactions" className="inline-flex items-center px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-sm rounded-md border">
                Transactions
              </Link>
              <Link href="/people" className="inline-flex items-center px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-sm rounded-md border">
                People
              </Link>
              <Link href="/rules" className="inline-flex items-center px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-sm rounded-md border">
                Rules
              </Link>
              <Link href="/templates" className="inline-flex items-center px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-sm rounded-md border">
                Templates
              </Link>
              <Link href="/settings" className="inline-flex items-center px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-sm rounded-md border">
                Settings
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

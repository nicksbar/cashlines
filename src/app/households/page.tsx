'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useUser } from '@/lib/UserContext'
import { Trash2, Plus, AlertCircle, X } from 'lucide-react'

interface Household {
  id: string
  name: string
  email: string
  isProduction: boolean
}

export default function HouseholdsPage() {
  const { currentHousehold } = useUser()
  const [households, setHouseholds] = useState<Household[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null)

  useEffect(() => {
    fetchHouseholds()
  }, [])

  const fetchHouseholds = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/households')
      if (response.ok) {
        const data = await response.json()
        setHouseholds(data)
      }
    } catch (error) {
      console.error('Error fetching households:', error)
      setMessage({ type: 'error', text: 'Failed to load households' })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateHousehold = async () => {
    if (!newName.trim()) return

    setCreating(true)
    setMessage(null)

    try {
      const response = await fetch('/api/households', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      })

      if (response.ok) {
        const household = await response.json()
        setHouseholds([...households, household])
        setNewName('')
        setMessage({ type: 'success', text: 'Household created successfully' })
        setTimeout(() => setMessage(null), 3000)
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.error || 'Failed to create household' })
      }
    } catch (error) {
      console.error('Error creating household:', error)
      setMessage({ type: 'error', text: 'Error creating household' })
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteHousehold = async () => {
    if (!deleteConfirm) return

    setDeleting(deleteConfirm.id)
    setMessage(null)

    try {
      const response = await fetch(`/api/households/${deleteConfirm.id}`, {
        method: 'DELETE',
        headers: {
          'x-household-id': currentHousehold?.id || 'user_1',
        },
      })

      if (response.ok) {
        setHouseholds(households.filter((h) => h.id !== deleteConfirm.id))
        setMessage({ type: 'success', text: `"${deleteConfirm.name}" deleted successfully` })
        setTimeout(() => setMessage(null), 3000)
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.error || 'Failed to delete household' })
      }
    } catch (error) {
      console.error('Error deleting household:', error)
      setMessage({ type: 'error', text: 'Error deleting household' })
    } finally {
      setDeleting(null)
      setDeleteConfirm(null)
    }
  }

  if (loading) {
    return <div className="text-slate-600 dark:text-slate-400">Loading households...</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Households</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Manage your households. You can create test households for different scenarios and delete them when done testing.
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

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="text-slate-900 dark:text-slate-100">Delete Household?</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  This action cannot be undone
                </CardDescription>
              </div>
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting === deleteConfirm.id}
                className="rounded-sm opacity-70 hover:opacity-100 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200">
                  Deleting <strong>"{deleteConfirm.name}"</strong> will permanently remove the household and all associated data:
                </p>
                <ul className="text-sm text-red-800 dark:text-red-200 mt-2 ml-4 list-disc space-y-1">
                  <li>All accounts</li>
                  <li>All transactions</li>
                  <li>All income entries</li>
                  <li>All people/members</li>
                </ul>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirm(null)}
                  disabled={deleting === deleteConfirm.id}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteHousehold}
                  disabled={deleting === deleteConfirm.id}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  {deleting === deleteConfirm.id ? 'Deleting...' : 'Delete Household'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Household */}
      <Card>
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-slate-100">Create New Household</CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Add a new household for testing or organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="household-name" className="text-slate-900 dark:text-slate-100">
              Household Name
            </Label>
            <div className="flex gap-2">
              <Input
                id="household-name"
                placeholder="e.g., Test Household, Family Budget"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !creating) {
                    handleCreateHousehold()
                  }
                }}
                disabled={creating}
                className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
              />
              <Button
                onClick={handleCreateHousehold}
                disabled={creating || !newName.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                {creating ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Households List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-slate-100">
            All Households ({households.length})
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Manage and delete test households
          </CardDescription>
        </CardHeader>
        <CardContent>
          {households.length === 0 ? (
            <p className="text-slate-600 dark:text-slate-400">No households found</p>
          ) : (
            <div className="space-y-2">
              {households.map((household) => (
                <div
                  key={household.id}
                  className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {household.name || 'Default'}
                      </p>
                      {household.isProduction && (
                        <span className="px-2 py-1 text-xs font-medium bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 rounded">
                          🔒 Production
                        </span>
                      )}
                      {household.id === currentHousehold?.id && (
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                          ✓ Current
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {household.email}
                    </p>
                  </div>

                  {!household.isProduction && household.id !== 'user_1' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteConfirm({ id: household.id, name: household.name })}
                      disabled={deleting === household.id}
                      className="ml-4 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 border-red-200 dark:border-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                      {deleting === household.id ? 'Deleting...' : 'Delete'}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900">
        <CardHeader>
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <CardTitle className="text-blue-900 dark:text-blue-100">About Households</CardTitle>
              <CardDescription className="text-blue-800 dark:text-blue-200 mt-2">
                <ul className="space-y-1 list-disc list-inside">
                  <li>Create test households to keep your data organized</li>
                  <li>Production households (marked with 🔒) cannot be deleted</li>
                  <li>The default household (user_1) cannot be deleted</li>
                  <li>Deleting a household removes all associated data (accounts, transactions, etc.)</li>
                  <li>Use test households for E2E testing and cleanup when done</li>
                </ul>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
    </div>
  )
}


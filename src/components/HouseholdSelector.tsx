'use client'

import { useUser } from '@/src/lib/UserContext'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { ChevronDown, Plus, X } from 'lucide-react'
import { useState } from 'react'

export function HouseholdSelector() {
  const { currentHousehold, households, selectHousehold, createHousehold, loading } = useUser()
  const [showDropdown, setShowDropdown] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCreate() {
    if (!newName.trim()) return

    setCreating(true)
    setError(null)
    try {
      const household = await createHousehold(newName)
      selectHousehold(household.id)
      setShowCreateModal(false)
      setShowDropdown(false)
      setNewName('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create household')
    } finally {
      setCreating(false)
    }
  }

  function resetModal() {
    setShowCreateModal(false)
    setError(null)
    setNewName('')
  }

  if (loading) {
    return (
      <div className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">
        Loading...
      </div>
    )
  }

  // Show create household button if none exist
  if (households.length === 0) {
    return (
      <>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Household
        </Button>

        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle>Create Household</CardTitle>
                  <CardDescription>Get started with your first household</CardDescription>
                </div>
                <button
                  onClick={resetModal}
                  className="rounded-sm opacity-70 hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="household-name">Household Name</Label>
                  <Input
                    id="household-name"
                    placeholder="e.g., Personal, Family, Business"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !creating) {
                        handleCreate()
                      }
                    }}
                    disabled={creating}
                    autoFocus
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={resetModal}
                    disabled={creating}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreate}
                    disabled={creating || !newName.trim()}
                    className="flex-1"
                  >
                    {creating ? 'Creating...' : 'Create'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </>
    )
  }

  if (!currentHousehold) {
    return null
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        className="flex items-center gap-2"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <div className="flex flex-col items-start">
          <span className="text-xs text-slate-500 dark:text-slate-400">Household</span>
          <span className="font-medium">{currentHousehold.name || 'Default'}</span>
        </div>
        <ChevronDown className="h-4 w-4" />
      </Button>

      {showDropdown && (
        <div className="absolute top-full mt-1 left-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 min-w-48">
          <div className="p-2 space-y-1">
            {households.map((household) => (
              <button
                key={household.id}
                onClick={() => {
                  selectHousehold(household.id)
                  setShowDropdown(false)
                }}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  currentHousehold.id === household.id
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 font-medium'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="font-medium">{household.name || 'Default'}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {household.isProduction ? '🔒 Production' : '🧪 Test'}
                </div>
              </button>
            ))}

            <hr className="my-2 border-slate-200 dark:border-slate-700" />

            <button
              onClick={() => setShowCreateModal(true)}
              disabled={creating}
              className="w-full px-3 py-2 rounded-md text-sm hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-2 transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Household
            </button>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle>Create Household</CardTitle>
                <CardDescription>Add a new household to manage</CardDescription>
              </div>
              <button
                onClick={resetModal}
                className="rounded-sm opacity-70 hover:opacity-100"
              >
                <X className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="household-name">Household Name</Label>
                <Input
                  id="household-name"
                  placeholder="e.g., Personal, Family, Business"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !creating) {
                      handleCreate()
                    }
                  }}
                  disabled={creating}
                  autoFocus
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={resetModal}
                  disabled={creating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={creating || !newName.trim()}
                  className="flex-1"
                >
                  {creating ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

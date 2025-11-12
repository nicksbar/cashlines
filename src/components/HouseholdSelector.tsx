'use client'

import { useUser } from '@/src/lib/UserContext'
import { Button } from '@/src/components/ui/button'
import { ChevronDown, Plus } from 'lucide-react'
import { useState } from 'react'

export function HouseholdSelector() {
  const { currentHousehold, households, selectHousehold, createHousehold, loading } = useUser()
  const [showDropdown, setShowDropdown] = useState(false)
  const [creating, setCreating] = useState(false)

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
      <Button
        onClick={async () => {
          const name = prompt('Enter household name (e.g., "My Family", "Personal"):')
          if (name) {
            setCreating(true)
            try {
              const household = await createHousehold(name)
              selectHousehold(household.id)
            } catch (error) {
              alert('Failed to create household')
            } finally {
              setCreating(false)
            }
          }
        }}
        disabled={creating}
        className="flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        {creating ? 'Creating...' : 'Create Household'}
      </Button>
    )
  }

  if (!currentHousehold) {
    return null
  }

  const handleCreateNew = async () => {
    const name = prompt('Enter household name:')
    if (name) {
      setCreating(true)
      try {
        const household = await createHousehold(name)
        selectHousehold(household.id)
        setShowDropdown(false)
      } catch (error) {
        alert('Failed to create household')
      } finally {
        setCreating(false)
      }
    }
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
              onClick={handleCreateNew}
              disabled={creating}
              className="w-full px-3 py-2 rounded-md text-sm hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-2 transition-colors"
            >
              <Plus className="h-4 w-4" />
              {creating ? 'Creating...' : 'New Household'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

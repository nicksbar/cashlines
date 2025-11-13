'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface Household {
  id: string
  email: string
  name: string | null
  isProduction: boolean
}

interface UserContextType {
  currentHousehold: Household | null
  households: Household[]
  loading: boolean
  selectHousehold: (householdId: string) => void
  createHousehold: (name: string) => Promise<Household>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentHousehold, setCurrentHousehold] = useState<Household | null>(null)
  const [households, setHouseholds] = useState<Household[]>([])
  const [loading, setLoading] = useState(true)

  // Load households on mount
  useEffect(() => {
    const loadHouseholds = async () => {
      try {
        const res = await fetch('/api/households')
        if (res.ok) {
          const data = await res.json()
          setHouseholds(data)
          
          // Load selected household from localStorage or use first one
          const savedId = localStorage.getItem('selectedHouseholdId')
          const selected = savedId ? data.find((h: Household) => h.id === savedId) : data[0]
          
          if (selected) {
            setCurrentHousehold(selected)
            if (!savedId) {
              localStorage.setItem('selectedHouseholdId', selected.id)
            }
          }
        }
      } catch (error) {
        console.error('Failed to load households:', error)
      } finally {
        setLoading(false)
      }
    }

    loadHouseholds()
  }, [])

  const selectHousehold = (householdId: string) => {
    const household = households.find(h => h.id === householdId)
    if (household) {
      setCurrentHousehold(household)
      localStorage.setItem('selectedHouseholdId', householdId)
    }
  }

  const createHousehold = async (name: string): Promise<Household> => {
    const res = await fetch('/api/households', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })

    if (!res.ok) throw new Error('Failed to create household')
    const newHousehold = await res.json()
    
    // Update both households list and select the new one
    const updatedHouseholds = [...households, newHousehold]
    setHouseholds(updatedHouseholds)
    setCurrentHousehold(newHousehold)
    localStorage.setItem('selectedHouseholdId', newHousehold.id)
    
    return newHousehold
  }

  return (
    <UserContext.Provider value={{ currentHousehold, households, loading, selectHousehold, createHousehold }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within UserProvider')
  }
  return context
}

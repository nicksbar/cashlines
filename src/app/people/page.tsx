'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/src/components/ui/button'
import { Card } from '@/src/components/ui/card'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { useUser } from '@/src/lib/UserContext'

interface Person {
  id: string
  name: string
  role?: string
  color?: string
  createdAt: string
  _count?: {
    incomes: number
    transactions: number
  }
}

const ROLES = [
  { value: 'primary', label: 'Primary' },
  { value: 'spouse', label: 'Spouse' },
  { value: 'child', label: 'Child' },
  { value: 'dependent', label: 'Dependent' },
  { value: 'other', label: 'Other' },
]

const COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#FFA07A', // Salmon
  '#98D8C8', // Mint
  '#F7DC6F', // Yellow
  '#BB8FCE', // Purple
  '#85C1E2', // Light Blue
]

export default function PeoplePage() {
  const { currentHousehold } = useUser()
  const [people, setPeople] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    role: 'primary',
    color: '#4ECDC4',
  })

  useEffect(() => {
    if (currentHousehold) {
      fetchPeople()
    }
  }, [currentHousehold?.id])

  const fetchPeople = async () => {
    if (!currentHousehold) return

    try {
      const response = await fetch('/api/people', {
        headers: { 'x-household-id': currentHousehold.id },
      })
      if (response.ok) {
        const data = await response.json()
        setPeople(data)
      }
    } catch (error) {
      console.error('Error fetching people:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentHousehold) return

    try {
      const method = editingId ? 'PATCH' : 'POST'
      const url = editingId ? `/api/people/${editingId}` : '/api/people'

      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'x-household-id': currentHousehold.id,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        fetchPeople()
        resetForm()
      }
    } catch (error) {
      console.error('Error saving person:', error)
    }
  }

  const handleEdit = (person: Person) => {
    setFormData({
      name: person.name,
      role: person.role || 'primary',
      color: person.color || '#4ECDC4',
    })
    setEditingId(person.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this person? Transactions will be unassigned.')) {
      return
    }
    try {
      const response = await fetch(`/api/people/${id}`, { method: 'DELETE' })
      if (response.ok) {
        fetchPeople()
      }
    } catch (error) {
      console.error('Error deleting person:', error)
    }
  }

  const resetForm = () => {
    setFormData({ name: '', role: 'primary', color: '#4ECDC4' })
    setEditingId(null)
    setShowForm(false)
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Household Members
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Track income and expenses by household member
            </p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            + Add Person
          </Button>
        </div>

        {/* Form Card */}
        {showForm && (
          <Card className="mb-8 p-6 dark:bg-slate-800 dark:border-slate-700">
            <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
              {editingId ? 'Edit Person' : 'Add New Person'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="name" className="dark:text-slate-300">
                    Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Alice"
                    required
                    className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                  />
                </div>

                <div>
                  <Label htmlFor="role" className="dark:text-slate-300">
                    Role
                  </Label>
                  <select
                    id="role"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full h-10 px-3 py-2 rounded-md border border-slate-300 bg-white text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                  >
                    {ROLES.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="color" className="dark:text-slate-300">
                    Color
                  </Label>
                  <div className="flex gap-2 flex-wrap">
                    {COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, color })
                        }
                        className={`w-8 h-8 rounded border-2 ${
                          formData.color === color
                            ? 'border-slate-900 dark:border-slate-100'
                            : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {editingId ? 'Update' : 'Create'}
                </Button>
                <Button
                  type="button"
                  onClick={resetForm}
                  variant="outline"
                  className="dark:border-slate-600 dark:text-slate-300"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* People List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {people.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                No household members yet. Add one to get started!
              </p>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Add First Member
              </Button>
            </div>
          ) : (
            people.map((person) => (
              <Card
                key={person.id}
                className="p-6 dark:bg-slate-800 dark:border-slate-700 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className="w-12 h-12 rounded-full flex-shrink-0"
                    style={{ backgroundColor: person.color || '#4ECDC4' }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {person.name}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {person.role ? (
                        <span className="capitalize">{person.role}</span>
                      ) : (
                        <span>No role</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-100 dark:bg-slate-700 rounded p-3 mb-4 text-sm">
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-600 dark:text-slate-400">
                      Income entries:
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {person._count?.incomes || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">
                      Transactions:
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {person._count?.transactions || 0}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link href={`/people/${person.id}`} className="flex-1">
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full"
                    >
                      View Dashboard
                    </Button>
                  </Link>
                  <Button
                    onClick={() => handleEdit(person)}
                    variant="outline"
                    size="sm"
                    className="flex-1 dark:border-slate-600 dark:text-slate-300"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(person.id)}
                    variant="outline"
                    size="sm"
                    className="flex-1 text-red-600 border-red-300 hover:bg-red-50 dark:border-red-400 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

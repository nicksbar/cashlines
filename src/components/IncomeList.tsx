'use client'

import { formatCurrency, formatDate } from '@/src/lib/utils'
import { Button } from '@/src/components/ui/button'
import { Trash2, Tag } from 'lucide-react'

interface Income {
  id: string
  description: string
  amount: number
  date: string
  source: string | null
  isTaxRelated: boolean
  taxCategory: string | null
  notes: string | null
}

interface IncomeListProps {
  income: Income[]
  onRefresh: () => void
}

export default function IncomeList({ income, onRefresh }: IncomeListProps) {
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this income entry?')) return

    try {
      const response = await fetch(`/api/income?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        onRefresh()
      }
    } catch (error) {
      console.error('Error deleting income:', error)
    }
  }

  if (income.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No income entries yet. Add your first income to get started.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {income.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{item.description}</h3>
              {item.isTaxRelated && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                  <Tag className="w-3 h-3" />
                  Tax
                </span>
              )}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              <span>{formatDate(item.date)}</span>
              {item.source && (
                <>
                  <span className="mx-2">•</span>
                  <span>{item.source}</span>
                </>
              )}
            </div>
            {item.notes && (
              <p className="text-sm text-gray-500 mt-1">{item.notes}</p>
            )}
          </div>
          <div className="flex items-center gap-4 ml-4">
            <span className="font-semibold text-green-600">
              +{formatCurrency(item.amount)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(item.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

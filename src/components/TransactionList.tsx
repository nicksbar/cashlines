'use client'

import { formatCurrency, formatDate } from '@/src/lib/utils'
import { ROUTING_LABELS, TRANSACTION_TYPE_LABELS } from '@/src/lib/constants'
import { Button } from '@/src/components/ui/button'
import { Trash2, Tag } from 'lucide-react'

interface Transaction {
  id: string
  description: string
  amount: number
  date: string
  type: string
  routing: string
  category: string | null
  isTaxRelated: boolean
  taxCategory: string | null
  notes: string | null
}

interface TransactionListProps {
  transactions: Transaction[]
  onRefresh: () => void
}

export default function TransactionList({ transactions, onRefresh }: TransactionListProps) {
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return

    try {
      const response = await fetch(`/api/transactions?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        onRefresh()
      }
    } catch (error) {
      console.error('Error deleting transaction:', error)
    }
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No transactions yet. Add your first transaction to get started.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{transaction.description}</h3>
              {transaction.isTaxRelated && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                  <Tag className="w-3 h-3" />
                  Tax
                </span>
              )}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              <span>{formatDate(transaction.date)}</span>
              <span className="mx-2">•</span>
              <span>{TRANSACTION_TYPE_LABELS[transaction.type]}</span>
              <span className="mx-2">•</span>
              <span>{ROUTING_LABELS[transaction.routing]}</span>
              {transaction.category && (
                <>
                  <span className="mx-2">•</span>
                  <span>{transaction.category}</span>
                </>
              )}
            </div>
            {transaction.notes && (
              <p className="text-sm text-gray-500 mt-1">{transaction.notes}</p>
            )}
          </div>
          <div className="flex items-center gap-4 ml-4">
            <span className="font-semibold text-red-600">
              -{formatCurrency(transaction.amount)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(transaction.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

'use client'

import { formatDateString } from '@/lib/date'

interface TransactionListProps {
  transactions: any[]
  onRefresh: () => void
}

export default function TransactionList({ transactions }: TransactionListProps) {
  return (
    <div className="space-y-4">
      {transactions.length === 0 ? (
        <p className="text-slate-500 text-sm">No transactions yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                <th className="text-left py-2">Date</th>
                <th className="text-left py-2">Description</th>
                <th className="text-left py-2">Method</th>
                <th className="text-right py-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx: any) => (
                <tr key={tx.id} className="border-b hover:bg-slate-50">
                  <td className="py-2">{formatDateString(tx.date)}</td>
                  <td className="py-2">{tx.description}</td>
                  <td className="py-2 capitalize">{tx.method || '-'}</td>
                  <td className="text-right py-2 font-medium text-red-600">-${tx.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

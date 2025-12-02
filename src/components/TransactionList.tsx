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
            <thead className="border-b dark:border-slate-700">
              <tr>
                <th className="text-left py-2 text-slate-900 dark:text-slate-100">Date</th>
                <th className="text-left py-2 text-slate-900 dark:text-slate-100">Description</th>
                <th className="text-left py-2 text-slate-900 dark:text-slate-100">Account</th>
                <th className="text-left py-2 text-slate-900 dark:text-slate-100">Method</th>
                <th className="text-right py-2 text-slate-900 dark:text-slate-100">Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx: any) => (
                <tr key={tx.id} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                  <td className="py-2 text-slate-900 dark:text-slate-100">{formatDateString(tx.date)}</td>
                  <td className="py-2 text-slate-900 dark:text-slate-100">
                    <div>
                      {tx.description}
                      {tx.payingAccount && (
                        <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          → Paying: {tx.payingAccount.name}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-2 text-slate-600 dark:text-slate-400">{tx.account?.name || '-'}</td>
                  <td className="py-2 capitalize text-slate-600 dark:text-slate-400">{tx.method || '-'}</td>
                  <td className="text-right py-2 font-medium text-red-600 dark:text-red-400">-${tx.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

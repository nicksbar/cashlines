'use client'

interface IncomeListProps {
  income: any[]
  onRefresh: () => void
}

export default function IncomeList({ income }: IncomeListProps) {
  return (
    <div className="space-y-4">
      {income.length === 0 ? (
        <p className="text-slate-500 text-sm">No income entries yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                <th className="text-left py-2">Date</th>
                <th className="text-left py-2">Source</th>
                <th className="text-right py-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {income.map((item: any) => (
                <tr key={item.id} className="border-b hover:bg-slate-50">
                  <td className="py-2">{new Date(item.date).toLocaleDateString()}</td>
                  <td className="py-2">{item.source || '-'}</td>
                  <td className="text-right py-2 font-medium">${item.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

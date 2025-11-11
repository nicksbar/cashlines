'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'

export default function ImportPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Import</h1>
        <p className="text-slate-600 mt-2">Import transactions from CSV or other sources</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Import</CardTitle>
          <CardDescription>Upload and map data from external sources</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
            <p className="text-slate-600">CSV/XLSX import functionality coming soon...</p>
          </div>
          <p className="text-sm text-slate-500">
            Supported formats: CSV, XLSX. No bank-specific logic yet - manual mapping required.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

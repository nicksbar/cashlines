'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'

export default function IncomePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Income</h1>
        <p className="text-slate-600 mt-2">Track all income sources</p>
      </div>

      <div className="flex justify-end">
        <Button>
          + New Income
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Income List</CardTitle>
          <CardDescription>Coming soon...</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">Income tracking features will be available soon.</p>
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'

export default function RulesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Rules</h1>
        <p className="text-slate-600 mt-2">Manage automated routing rules</p>
      </div>

      <div className="flex justify-end">
        <Button>
          + New Rule
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Routing Rules</CardTitle>
          <CardDescription>Coming soon...</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">Rule management features will be available soon.</p>
        </CardContent>
      </Card>
    </div>
  )
}

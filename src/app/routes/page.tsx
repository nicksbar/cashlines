'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'

export default function RoutesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Routes</h1>
        <p className="text-slate-600 mt-2">Visualize how money is routed across splits</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Money Routing</CardTitle>
          <CardDescription>Coming soon...</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">Visual routing dashboard will be available soon.</p>
        </CardContent>
      </Card>
    </div>
  )
}

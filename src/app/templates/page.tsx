'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { useState, useEffect } from 'react'
import { formatCurrency } from '@/src/lib/money'
import { Trash2, Star } from 'lucide-react'

interface Template {
  id: string
  type: string
  name: string
  description?: string
  amount?: number
  grossAmount?: number
  isFavorite: boolean
  usageCount: number
  createdAt: string
}

const METHOD_LABELS: Record<string, string> = {
  cc: 'Credit Card',
  cash: 'Cash',
  ach: 'ACH',
  other: 'Other',
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'transaction' | 'income'>('all')
  const [sortBy, setSortBy] = useState<'usage' | 'favorites' | 'recent'>('usage')

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const [transRes, incomeRes] = await Promise.all([
        fetch('/api/templates/transactions'),
        fetch('/api/templates/income'),
      ])

      let allTemplates: Template[] = []
      if (transRes.ok) {
        const trans = await transRes.json()
        allTemplates = [...allTemplates, ...trans.map((t: any) => ({ ...t, type: 'transaction' }))]
      }
      if (incomeRes.ok) {
        const inc = await incomeRes.json()
        allTemplates = [...allTemplates, ...inc.map((t: any) => ({ ...t, type: 'income' }))]
      }

      setTemplates(allTemplates)
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, type: string) => {
    if (!confirm('Delete this template?')) return

    try {
      const endpoint = type === 'transaction' ? 'transactions' : 'income'
      const response = await fetch(`/api/templates/${endpoint}/${id}`, { method: 'DELETE' })
      if (response.ok) {
        fetchTemplates()
      }
    } catch (error) {
      console.error('Error deleting template:', error)
    }
  }

  const handleToggleFavorite = async (id: string, type: string, current: boolean) => {
    try {
      const endpoint = type === 'transaction' ? 'transactions' : 'income'
      const response = await fetch(`/api/templates/${endpoint}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !current }),
      })
      if (response.ok) {
        fetchTemplates()
      }
    } catch (error) {
      console.error('Error updating template:', error)
    }
  }

  const getFilteredAndSorted = () => {
    let filtered = filter === 'all' ? templates : templates.filter(t => t.type === filter)

    if (sortBy === 'usage') {
      return filtered.sort((a, b) => b.usageCount - a.usageCount)
    } else if (sortBy === 'favorites') {
      return filtered.sort((a, b) => {
        if (a.isFavorite === b.isFavorite) {
          return b.usageCount - a.usageCount
        }
        return a.isFavorite ? -1 : 1
      })
    } else {
      return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }
  }

  const filtered = getFilteredAndSorted()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Templates</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">Manage your saved templates for quick entry creation</p>
      </div>

      {/* Filters and Sorting */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <Label className="text-slate-900 dark:text-slate-100">Filter by Type</Label>
              <div className="flex gap-2 mt-2">
                {(['all', 'transaction', 'income'] as const).map(type => (
                  <Button
                    key={type}
                    variant={filter === type ? 'default' : 'outline'}
                    onClick={() => setFilter(type)}
                    className={filter === type ? 'bg-blue-600 hover:bg-blue-700' : 'dark:border-slate-600 dark:text-slate-100'}
                  >
                    {type === 'all' ? 'All' : type === 'transaction' ? 'Transactions' : 'Income'}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-slate-900 dark:text-slate-100">Sort by</Label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'usage' | 'favorites' | 'recent')}
                className="w-full px-3 py-2 mt-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg"
              >
                <option value="usage">Most Used</option>
                <option value="favorites">Favorites First</option>
                <option value="recent">Most Recent</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-slate-100">
            {filtered.length === 0 ? 'No Templates' : `Templates (${filtered.length})`}
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            {filtered.length === 0 ? 'Start by creating entries and saving them as templates' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-slate-500 dark:text-slate-400">Loading templates...</p>
          ) : filtered.length > 0 ? (
            <div className="space-y-3">
              {filtered.map(template => (
                <div
                  key={`${template.type}-${template.id}`}
                  className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">{template.name}</h3>
                      {template.isFavorite && <span className="text-lg">⭐</span>}
                      <span className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded">
                        {template.type === 'transaction' ? 'Transaction' : 'Income'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {template.description || template.amount ? (
                        <>
                          {template.description && template.description}
                          {template.amount && ` • ${formatCurrency(template.amount)}`}
                          {template.grossAmount && ` • ${formatCurrency(template.grossAmount)}`}
                        </>
                      ) : (
                        'No description'
                      )}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                      Used {template.usageCount} time{template.usageCount !== 1 ? 's' : ''}
                    </p>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleFavorite(template.id, template.type, template.isFavorite)}
                      className={`dark:border-slate-600 dark:text-slate-100 ${
                        template.isFavorite ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700' : ''
                      }`}
                      title={template.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Star className={`w-4 h-4 ${template.isFavorite ? 'fill-amber-500 text-amber-500' : ''}`} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(template.id, template.type)}
                      className="border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 dark:text-slate-400">No templates found with current filters</p>
          )}
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-base text-blue-900 dark:text-blue-100">💡 Template Tips</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-blue-900 dark:text-blue-100">
          <p>• <strong>Save as Template:</strong> Create an entry, click &quot;Save as Template&quot;, and give it a name</p>
          <p>• <strong>Use Templates:</strong> When creating a new entry, select a template to pre-fill the form</p>
          <p>• <strong>Mark Favorites:</strong> Star your most-used templates for quick access at the top</p>
          <p>• <strong>Track Usage:</strong> Templates show how many times they&apos;ve been used</p>
          <p>• <strong>Organize:</strong> Sort by usage, favorites, or creation date</p>
        </CardContent>
      </Card>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Button } from '@/src/components/ui/button'
import { Select } from '@/src/components/ui/select'

interface Template {
  id: string
  type: string
  name: string
  description?: string
  amount?: number
  method?: string
  accountId?: string
  grossAmount?: number
  federalTaxes?: number
  stateTaxes?: number
  socialSecurity?: number
  medicare?: number
  preDeductions?: number
  postDeductions?: number
  isFavorite: boolean
  usageCount: number
}

interface TemplateSelectorProps {
  type: 'transaction' | 'income'
  onSelect: (template: Template) => void
}

export function TemplateSelector({ type, onSelect }: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState('')

  useEffect(() => {
    fetchTemplates()
  }, [type])

  async function fetchTemplates() {
    try {
      const endpoint = `/api/templates/${type === 'transaction' ? 'transactions' : 'income'}`
      const response = await fetch(endpoint)
      if (response.ok) {
        const data = await response.json()
        setTemplates(data)
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = () => {
    const template = templates.find(t => t.id === selectedId)
    if (template) {
      onSelect(template)
      setSelectedId('')
    }
  }

  if (loading) {
    return <div className="text-sm text-slate-500 dark:text-slate-400">Loading templates...</div>
  }

  if (templates.length === 0) {
    return <div className="text-sm text-slate-500 dark:text-slate-400">No templates yet</div>
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-900 dark:text-slate-100">
        Quick Create from Template
      </label>
      <div className="flex gap-2">
        <Select value={selectedId} onValueChange={setSelectedId}>
          <option value="">Select a template...</option>
          {templates.map(template => (
            <option key={template.id} value={template.id}>
              {template.isFavorite ? '⭐ ' : ''}{template.name}
              {template.usageCount > 0 && ` (${template.usageCount}x)`}
            </option>
          ))}
        </Select>
        <Button 
          type="button" 
          onClick={handleSelect}
          disabled={!selectedId}
          className="bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 text-white"
        >
          Use Template
        </Button>
      </div>
    </div>
  )
}

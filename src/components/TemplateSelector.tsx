import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { useUser } from '@/lib/UserContext'

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
  const { currentHousehold } = useUser()
  const [templates, setTemplates] = useState<Template[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!currentHousehold) return
    
    const fetchTemplates = async () => {
      try {
        const endpoint = `/api/templates/${type === 'transaction' ? 'transactions' : 'income'}`
        const response = await fetch(endpoint, {
          headers: { 'x-household-id': currentHousehold.id }
        })
        if (response.ok) {
          const data = await response.json()
          setTemplates(data || [])
        }
      } catch (error) {
        console.error('Failed to fetch templates:', error)
      }
    }
    
    fetchTemplates()
  }, [type, currentHousehold])

  const handleSelect = (template: Template) => {
    onSelect(template)
    setOpen(false)
  }

  if (!currentHousehold || templates.length === 0) return null

  // Sort by favorite, then by usage
  const sorted = [...templates].sort((a, b) => {
    if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1
    return b.usageCount - a.usageCount
  })

  return (
    <div className="relative inline-block">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(!open)}
        className="dark:border-slate-600 dark:text-slate-100"
      >
        📋 Quick Template
      </Button>
      
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg z-50 min-w-[200px]">
          {sorted.map(template => (
            <button
              key={template.id}
              onClick={() => handleSelect(template)}
              className="w-full text-left px-3 py-2 hover:bg-blue-50 dark:hover:bg-slate-700 text-sm text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 last:border-b-0 flex justify-between items-center"
            >
              <span>
                {template.isFavorite && <span className="mr-1">⭐</span>}
                {template.name}
              </span>
              {template.usageCount > 0 && (
                <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">({template.usageCount}x)</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

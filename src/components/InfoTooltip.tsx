'use client'

import { HelpCircle } from 'lucide-react'
import { useState } from 'react'

interface InfoTooltipProps {
  title: string
  description: string
  examples?: string[]
}

export function InfoTooltip({ title, description, examples }: InfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center w-5 h-5 ml-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 focus:outline-none"
        title={title}
      >
        <HelpCircle className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Tooltip */}
          <div className="absolute left-0 mt-2 w-64 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 text-sm">
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
              {title}
            </h4>
            <p className="text-slate-600 dark:text-slate-400 mb-2">
              {description}
            </p>
            {examples && examples.length > 0 && (
              <div className="text-xs text-slate-500 dark:text-slate-500 bg-slate-50 dark:bg-slate-900 p-2 rounded space-y-1">
                <p className="font-medium text-slate-700 dark:text-slate-300">Examples:</p>
                {examples.map((ex, i) => (
                  <div key={i} className="font-mono">
                    {ex}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

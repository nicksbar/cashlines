'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export type DateRangeType = 'week' | 'month' | 'quarter' | 'half-year' | 'year' | 'custom'

export interface DateRange {
  type: DateRangeType
  startDate: Date
  endDate: Date
  label: string
}

interface DateRangeSelectorProps {
  value: DateRange
  onChange: (range: DateRange) => void
  showLabel?: boolean
  compact?: boolean
}

const RANGE_TYPES = ['week', 'month', 'quarter', 'half-year', 'year'] as const

export function DateRangeSelector({ value, onChange, showLabel = true, compact = false }: DateRangeSelectorProps) {
  const [customStart, setCustomStart] = useState<string>(value.startDate.toISOString().split('T')[0])
  const [customEnd, setCustomEnd] = useState<string>(value.endDate.toISOString().split('T')[0])
  const [showCustom, setShowCustom] = useState(value.type === 'custom')

  // Update custom inputs when value changes externally
  useEffect(() => {
    setCustomStart(value.startDate.toISOString().split('T')[0])
    setCustomEnd(value.endDate.toISOString().split('T')[0])
    setShowCustom(value.type === 'custom')
  }, [value])

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  const getDatesForRange = (type: DateRangeType, offset: number = 0): { start: Date; end: Date } => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    switch (type) {
      case 'week': {
        const weekStart = new Date(today)
        weekStart.setDate(today.getDate() - today.getDay() + offset * 7)
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)
        return { start: weekStart, end: weekEnd }
      }
      case 'month': {
        const date = new Date(today.getFullYear(), today.getMonth() + offset, 1)
        const start = new Date(date.getFullYear(), date.getMonth(), 1)
        const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)
        return { start, end }
      }
      case 'quarter': {
        const quarter = Math.floor(today.getMonth() / 3) + offset
        const year = today.getFullYear() + Math.floor((today.getMonth() + offset * 3) / 12)
        const q = ((quarter % 4) + 4) % 4
        const start = new Date(year, q * 3, 1)
        const end = new Date(year, q * 3 + 3, 0)
        return { start, end }
      }
      case 'half-year': {
        const half = today.getMonth() < 6 ? 0 : 1
        const newHalf = (half + offset + 2) % 2
        const year = today.getFullYear() + Math.floor((half + offset) / 2)
        const start = new Date(year, newHalf * 6, 1)
        const end = new Date(year, newHalf * 6 + 6, 0)
        return { start, end }
      }
      case 'year': {
        const year = today.getFullYear() + offset
        const start = new Date(year, 0, 1)
        const end = new Date(year, 11, 31)
        return { start, end }
      }
      default:
        return { start: today, end: today }
    }
  }

  const handleRangeTypeClick = (type: DateRangeType) => {
    const { start, end } = getDatesForRange(type)
    onChange({
      type,
      startDate: start,
      endDate: end,
      label: `${formatDate(start)} - ${formatDate(end)}`,
    })
    setShowCustom(false)
  }

  const handlePrevious = () => {
    if (value.type === 'custom') return
    const { start, end } = getDatesForRange(value.type, -1)
    onChange({
      type: value.type,
      startDate: start,
      endDate: end,
      label: `${formatDate(start)} - ${formatDate(end)}`,
    })
  }

  const handleNext = () => {
    if (value.type === 'custom') return
    const { start, end } = getDatesForRange(value.type, 1)
    onChange({
      type: value.type,
      startDate: start,
      endDate: end,
      label: `${formatDate(start)} - ${formatDate(end)}`,
    })
  }

  const handleCustomApply = () => {
    const start = new Date(customStart + 'T00:00:00')
    const end = new Date(customEnd + 'T00:00:00')
    if (start <= end) {
      onChange({
        type: 'custom',
        startDate: start,
        endDate: end,
        label: `${formatDate(start)} - ${formatDate(end)}`,
      })
      setShowCustom(false)
    }
  }

  const buttonClass = (isActive: boolean) =>
    `px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-600'
    }`

  return (
    <div className="space-y-4">
      {showLabel && (
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Date Range</label>
          {!compact && (
            <span className="text-sm text-slate-600 dark:text-slate-400">{value.label}</span>
          )}
        </div>
      )}

      {/* Preset Range Buttons with Navigation */}
      <div className="space-y-3">
        <div className="flex gap-2 flex-wrap">
          {RANGE_TYPES.map(type => (
            <button
              key={type}
              onClick={() => handleRangeTypeClick(type)}
              className={buttonClass(value.type === type && !showCustom)}
            >
              {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
            </button>
          ))}
          <button
            onClick={() => setShowCustom(!showCustom)}
            className={buttonClass(showCustom)}
          >
            Custom
          </button>
        </div>

        {/* Previous/Next Navigation for Preset Ranges */}
        {value.type !== 'custom' && !compact && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="ml-1">Prev</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <span className="mr-1">Next</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Custom Date Range Inputs */}
      {showCustom && (
        <div className="p-4 bg-slate-50 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-600 rounded-lg space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={customStart}
                onChange={e => setCustomStart(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={customEnd}
                onChange={e => setCustomEnd(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleCustomApply}
              className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white"
            >
              Apply
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowCustom(false)}
              className="flex-1 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Display Selected Range (Compact) */}
      {compact && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
          <p className="text-sm text-blue-900 dark:text-blue-200">
            <strong>Period:</strong> {value.label}
          </p>
        </div>
      )}
    </div>
  )
}

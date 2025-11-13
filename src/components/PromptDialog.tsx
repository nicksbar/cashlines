'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { X } from 'lucide-react'

interface PromptDialogState {
  isOpen: boolean
  title: string
  message: string
  inputPlaceholder?: string
  confirmLabel?: string
  cancelLabel?: string
  isLoading?: boolean
  onConfirm?: (value: string) => void | Promise<void>
  onCancel?: () => void
}

interface PromptDialogProps {
  state: PromptDialogState
  onStateChange: (state: Partial<PromptDialogState>) => void
}

export function PromptDialog({ state, onStateChange }: PromptDialogProps) {
  const [inputValue, setInputValue] = useState('')
  const [isExecuting, setIsExecuting] = useState(false)

  const handleConfirm = useCallback(async () => {
    if (!inputValue.trim()) return

    setIsExecuting(true)
    try {
      if (state.onConfirm) {
        const result = state.onConfirm(inputValue.trim())
        if (result instanceof Promise) {
          await result
        }
      }
    } finally {
      setIsExecuting(false)
      setInputValue('')
      onStateChange({ isOpen: false })
    }
  }, [inputValue, state, onStateChange])

  const handleCancel = useCallback(() => {
    if (state.onCancel) {
      state.onCancel()
    }
    setInputValue('')
    onStateChange({ isOpen: false })
  }, [state, onStateChange])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim() && !isExecuting) {
      handleConfirm()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }, [inputValue, isExecuting, handleConfirm, handleCancel])

  if (!state.isOpen) return null

  const confirmLabel = state.confirmLabel ?? 'OK'
  const cancelLabel = state.cancelLabel ?? 'Cancel'
  const isLoading = state.isLoading ?? isExecuting

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4 dark:bg-slate-800 dark:border-slate-700">
        <div className="p-6 space-y-4">
          {/* Title */}
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {state.title}
              </h2>
              {state.message && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {state.message}
                </p>
              )}
            </div>
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Input */}
          <Input
            type="text"
            placeholder={state.inputPlaceholder}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            autoFocus
            className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
          />

          {/* Actions */}
          <div className="flex gap-3 pt-4 justify-end">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              {cancelLabel}
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isLoading || !inputValue.trim()}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white disabled:opacity-50"
            >
              {isLoading ? 'Please wait...' : confirmLabel}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

// Hook for easy usage
export function usePromptDialog() {
  const [state, setState] = useState<PromptDialogState>({
    isOpen: false,
    title: '',
    message: '',
  })

  const prompt = useCallback((options: {
    title: string
    message?: string
    inputPlaceholder?: string
    confirmLabel?: string
    cancelLabel?: string
    onConfirm: (value: string) => void | Promise<void>
    onCancel?: () => void
  }) => {
    setState({
      isOpen: true,
      title: options.title,
      message: options.message || '',
      inputPlaceholder: options.inputPlaceholder,
      confirmLabel: options.confirmLabel,
      cancelLabel: options.cancelLabel,
      onConfirm: options.onConfirm,
      onCancel: options.onCancel,
    })
  }, [])

  const handleStateChange = useCallback((updates: Partial<PromptDialogState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  return {
    dialog: <PromptDialog state={state} onStateChange={handleStateChange} />,
    prompt,
  }
}

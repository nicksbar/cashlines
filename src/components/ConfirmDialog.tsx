'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AlertCircle, CheckCircle, X } from 'lucide-react'

interface ConfirmDialogState {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  isDestructive?: boolean
  isLoading?: boolean
  onConfirm?: () => void | Promise<void>
  onCancel?: () => void
}

interface ConfirmDialogProps {
  state: ConfirmDialogState
  onStateChange: (state: Partial<ConfirmDialogState>) => void
}

export function ConfirmDialog({ state, onStateChange }: ConfirmDialogProps) {
  const [isExecuting, setIsExecuting] = useState(false)

  const handleConfirm = useCallback(async () => {
    setIsExecuting(true)
    try {
      if (state.onConfirm) {
        const result = state.onConfirm()
        if (result instanceof Promise) {
          await result
        }
      }
    } finally {
      setIsExecuting(false)
      onStateChange({ isOpen: false })
    }
  }, [state, onStateChange])

  const handleCancel = useCallback(() => {
    if (state.onCancel) {
      state.onCancel()
    }
    onStateChange({ isOpen: false })
  }, [state, onStateChange])

  if (!state.isOpen) return null

  const isDestructive = state.isDestructive ?? false
  const confirmLabel = state.confirmLabel ?? 'Confirm'
  const cancelLabel = state.cancelLabel ?? 'Cancel'
  const isLoading = state.isLoading ?? isExecuting

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4 dark:bg-slate-800 dark:border-slate-700">
        <div className="p-6 space-y-4">
          {/* Icon and Title */}
          <div className="flex items-start gap-4">
            {isDestructive ? (
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            ) : (
              <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {state.title}
              </h2>
            </div>
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Message */}
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            {state.message}
          </p>

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
              disabled={isLoading}
              className={isDestructive
                ? 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white'
                : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white'
              }
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
export function useConfirmDialog() {
  const [state, setState] = useState<ConfirmDialogState>({
    isOpen: false,
    title: '',
    message: '',
  })

  const confirm = useCallback((options: {
    title: string
    message: string
    confirmLabel?: string
    cancelLabel?: string
    isDestructive?: boolean
    onConfirm: () => void | Promise<void>
    onCancel?: () => void
  }) => {
    setState({
      isOpen: true,
      title: options.title,
      message: options.message,
      confirmLabel: options.confirmLabel,
      cancelLabel: options.cancelLabel,
      isDestructive: options.isDestructive,
      onConfirm: options.onConfirm,
      onCancel: options.onCancel,
    })
  }, [])

  const close = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false }))
  }, [])

  const handleStateChange = useCallback((updates: Partial<ConfirmDialogState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  return {
    dialog: <ConfirmDialog state={state} onStateChange={handleStateChange} />,
    confirm,
    close,
  }
}

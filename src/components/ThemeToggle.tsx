'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Moon, Sun, Monitor } from 'lucide-react'

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="w-8 h-8" />
  }

  return (
    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
      <button
        onClick={() => setTheme('light')}
        className={`p-2 rounded transition-colors ${
          theme === 'light'
            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
        }`}
        title="Light theme"
        aria-label="Switch to light theme"
      >
        <Sun className="w-4 h-4" />
      </button>

      <button
        onClick={() => setTheme('dark')}
        className={`p-2 rounded transition-colors ${
          theme === 'dark'
            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
        }`}
        title="Dark theme"
        aria-label="Switch to dark theme"
      >
        <Moon className="w-4 h-4" />
      </button>

      <button
        onClick={() => setTheme('auto')}
        className={`p-2 rounded transition-colors ${
          theme === 'auto'
            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
        }`}
        title="Auto theme (system preference)"
        aria-label="Switch to auto theme"
      >
        <Monitor className="w-4 h-4" />
      </button>
    </div>
  )
}

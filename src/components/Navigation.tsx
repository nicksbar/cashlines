'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, ChevronRight } from 'lucide-react'

interface NavGroup {
  title: string
  items: Array<{ label: string; href: string }>
}

const navGroups: NavGroup[] = [
  {
    title: 'Core',
    items: [
      { label: '📊 Dashboard', href: '/' },
      { label: '👥 People', href: '/people' },
      { label: '🏦 Accounts', href: '/accounts' },
    ],
  },
  {
    title: 'Tracking',
    items: [
      { label: '💵 Income', href: '/income' },
      { label: '💸 Expenses', href: '/transactions' },
      { label: '🔁 Recurring', href: '/recurring-expenses' },
    ],
  },
  {
    title: 'Insights',
    items: [
      { label: '📈 Analytics', href: '/insights' },
      { label: '🛣️ Routes', href: '/routes' },
      { label: '📋 Rules', href: '/rules' },
    ],
  },
  {
    title: 'Tools',
    items: [
      { label: '⚡ Templates', href: '/templates' },
      { label: '📥 Import', href: '/import' },
      { label: '⚙️ Settings', href: '/settings' },
      { label: '💾 Data', href: '/data-management' },
    ],
  },
]

export function Navigation() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
        aria-label="Toggle menu"
      >
        {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex gap-1">
        {navGroups.map((group) => (
          <div key={group.title} className="group relative">
            <button className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors flex items-center gap-1">
              {group.title}
              <ChevronRight className="w-4 h-4 group-hover:rotate-90 transition-transform" />
            </button>

            {/* Dropdown */}
            <div className="absolute left-0 mt-0 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              {group.items.map((item, idx) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
                    idx === 0 ? 'rounded-t-lg' : ''
                  } ${idx === group.items.length - 1 ? 'rounded-b-lg' : ''}`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Mobile Menu */}
      {open && (
        <div className="absolute top-16 left-0 right-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 md:hidden max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4">
            {navGroups.map((group) => (
              <div key={group.title} className="py-4 border-b border-slate-200 dark:border-slate-800 last:border-b-0">
                <h3 className="px-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
                  {group.title}
                </h3>
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="block px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

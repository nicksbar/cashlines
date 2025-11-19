'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface FilterConfig {
  key: string
  label: string
  type: 'text' | 'select' | 'date' | 'number'
  options?: Array<{ value: string; label: string }>
  placeholder?: string
}

interface Column {
  key: string
  label: string
  render?: (value: any, row: any) => React.ReactNode
  sortable?: boolean
  filterable?: boolean
  align?: 'left' | 'center' | 'right'
}

interface FilterableTableProps {
  data: any[]
  columns: Column[]
  filters?: FilterConfig[]
  pageSize?: number
  onRowClick?: (row: any) => void
  emptyMessage?: string
  loading?: boolean
}

export function FilterableTable({
  data,
  columns,
  filters = [],
  pageSize = 10,
  onRowClick,
  emptyMessage = 'No data found',
  loading = false,
}: FilterableTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)
  const [filterValues, setFilterValues] = useState<Record<string, string | string[]>>({})

  // Apply filters and search
  const filteredData = useMemo(() => {
    let result = [...data]

    // Apply search across text-based columns
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter((row) =>
        columns.some((col) => {
          const value = row[col.key]
          if (value == null) return false
          return String(value).toLowerCase().includes(term)
        })
      )
    }

    // Apply specific filters
    Object.entries(filterValues).forEach(([key, value]) => {
      if (!value || (Array.isArray(value) && value.length === 0)) return
      result = result.filter((row) => {
        const rowValue = row[key]
        if (Array.isArray(value)) {
          return value.includes(String(rowValue))
        }
        return String(rowValue).toLowerCase().includes(String(value).toLowerCase())
      })
    })

    return result
  }, [data, searchTerm, filterValues, columns])

  // Apply sorting
  const sortedData = useMemo(() => {
    let result = [...filteredData]

    if (sortConfig) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key]
        const bVal = b[sortConfig.key]

        // Handle null/undefined
        if (aVal == null && bVal == null) return 0
        if (aVal == null) return sortConfig.direction === 'asc' ? 1 : -1
        if (bVal == null) return sortConfig.direction === 'asc' ? -1 : 1

        // Compare values
        if (aVal < bVal) {
          return sortConfig.direction === 'asc' ? -1 : 1
        }
        if (aVal > bVal) {
          return sortConfig.direction === 'asc' ? 1 : -1
        }
        return 0
      })
    }

    return result
  }, [filteredData, sortConfig])

  // Paginate
  const totalPages = Math.ceil(sortedData.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const paginatedData = sortedData.slice(startIndex, startIndex + pageSize)

  const handleSort = (key: string) => {
    const col = columns.find((c) => c.key === key)
    if (!col?.sortable) return

    if (sortConfig?.key === key) {
      setSortConfig({
        key,
        direction: sortConfig.direction === 'asc' ? 'desc' : 'asc',
      })
    } else {
      setSortConfig({ key, direction: 'asc' })
    }
  }

  const handleFilterChange = (key: string, value: string | string[]) => {
    setFilterValues((prev) => ({
      ...prev,
      [key]: value,
    }))
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setFilterValues({})
    setCurrentPage(1)
  }

  const hasActiveFilters = searchTerm || Object.values(filterValues).some((v) => v && (!Array.isArray(v) || v.length > 0))

  if (loading) {
    return <div className="text-center py-8 text-slate-500 dark:text-slate-400">Loading...</div>
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="space-y-3">
        <div className="flex gap-2 items-center flex-wrap">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search all columns..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-10 dark:bg-slate-800 dark:border-slate-700"
            />
          </div>
          {hasActiveFilters && (
            <Button
              onClick={clearFilters}
              variant="outline"
              size="sm"
              className="dark:border-slate-700 dark:text-slate-300"
            >
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {/* Specific filters */}
        {filters.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {filters.map((filter) => (
              <div key={filter.key}>
                {filter.type === 'select' && filter.options ? (
                  <select
                    value={filterValues[filter.key] || ''}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 dark:text-slate-100 text-sm"
                  >
                    <option value="">{filter.label}</option>
                    {filter.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    type={filter.type}
                    placeholder={filter.placeholder || filter.label}
                    value={filterValues[filter.key] || ''}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    className="w-40 dark:bg-slate-800 dark:border-slate-700 text-sm"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      {sortedData.length === 0 ? (
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">{emptyMessage}</div>
      ) : (
        <>
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      onClick={() => col.sortable && handleSort(col.key)}
                      className={`py-3 px-3 font-semibold text-slate-900 dark:text-slate-100 text-${col.align || 'left'} ${
                        col.sortable ? 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {col.label}
                        {col.sortable && sortConfig?.key === col.key && (
                          <span className="text-xs">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((row, idx) => (
                  <tr
                    key={idx}
                    onClick={() => onRowClick?.(row)}
                    className={`border-b border-slate-100 dark:border-slate-800 ${
                      onRowClick ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800' : ''
                    } transition-colors`}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`py-3 px-3 text-slate-900 dark:text-slate-100 text-${col.align || 'left'}`}
                      >
                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Showing {startIndex + 1}-{Math.min(startIndex + pageSize, sortedData.length)} of {sortedData.length}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                  className="dark:border-slate-700 dark:text-slate-300"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      className={
                        currentPage === page
                          ? ''
                          : 'dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                      }
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                  className="dark:border-slate-700 dark:text-slate-300"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

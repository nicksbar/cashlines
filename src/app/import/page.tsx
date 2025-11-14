'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useEffect, useRef, useState } from 'react'
import { AlertCircle, CheckCircle, Upload, Eye, Download } from 'lucide-react'
import { formatCurrency } from '@/lib/money'
import { useConfirmDialog } from '@/components/ConfirmDialog'

interface ParsedRow {
  date: string
  amount: string
  description: string
  method: string
  accountId: string
  notes?: string
  tags?: string
}

interface ParsedTransaction extends ParsedRow {
  isValid: boolean
  errors: string[]
  preview: {
    date: string
    amount: number
    description: string
    method: string
    account: string
  }
}

export default function ImportPage() {
  const { dialog: confirmDialog, confirm } = useConfirmDialog()
  const [alertMessage, setAlertMessage] = useState<{ text: string; type: 'error' } | null>(null)
  const [accounts, setAccounts] = useState<any[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<ParsedTransaction[]>([])
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({
    date: 'Date',
    amount: 'Amount',
    description: 'Description',
    method: 'Method',
    accountId: 'Account',
  })
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{
    success: boolean
    created: number
    failed: number
    errors: string[]
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch accounts on load
  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      const res = await fetch('/api/accounts')
      if (res.ok) {
        setAccounts(await res.json())
      }
    } catch (error) {
      console.error('Error fetching accounts:', error)
    }
  }

  const parseCSV = (text: string): string[][] => {
    const rows: string[][] = []
    let current: string[] = []
    let inQuotes = false
    let value = ''

    for (let i = 0; i < text.length; i++) {
      const char = text[i]
      const nextChar = text[i + 1]

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          value += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        current.push(value.trim())
        value = ''
      } else if ((char === '\n' || char === '\r') && !inQuotes) {
        if (value || current.length) {
          current.push(value.trim())
          if (current.some(c => c)) rows.push(current)
          current = []
          value = ''
        }
        if (char === '\r' && nextChar === '\n') i++
      } else {
        value += char
      }
    }

    if (value || current.length) {
      current.push(value.trim())
      if (current.some(c => c)) rows.push(current)
    }

    return rows
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setParsedData([])
    setImportResult(null)

    try {
      const text = await file.text()
      const rows = parseCSV(text)

      if (rows.length < 2) {
        setAlertMessage({ text: 'CSV must have header row and at least one data row', type: 'error' })
        setTimeout(() => setAlertMessage(null), 4000)
        return
      }

      // Auto-detect headers
      const headers = rows[0].map(h => h.toLowerCase())
      const autoMapping: Record<string, string> = {}

      if (headers.includes('date')) autoMapping['date'] = 'Date'
      if (headers.includes('amount')) autoMapping['amount'] = 'Amount'
      if (headers.includes('description')) autoMapping['description'] = 'Description'
      if (headers.includes('method')) autoMapping['method'] = 'Method'
      if (headers.includes('account')) autoMapping['accountId'] = 'Account'

      if (Object.keys(autoMapping).length > 0) {
        setColumnMapping({ ...columnMapping, ...autoMapping })
      }

      // Parse data rows
      const parsed: ParsedTransaction[] = rows.slice(1).map(row => {
        const obj: any = {}
        const errors: string[] = []
        const preview: any = {}

        // Map columns
        headers.forEach((header, idx) => {
          const value = row[idx] || ''
          if (header.includes('date')) obj.date = value
          if (header.includes('amount')) obj.amount = value
          if (header.includes('description')) obj.description = value
          if (header.includes('method')) obj.method = value
          if (header.includes('account')) obj.accountId = value
          if (header.includes('note')) obj.notes = value
          if (header.includes('tag')) obj.tags = value
        })

        // Validate
        if (!obj.date) errors.push('Missing date')
        else preview.date = obj.date

        if (!obj.amount) errors.push('Missing amount')
        else {
          const amt = parseFloat(obj.amount)
          if (isNaN(amt)) errors.push('Invalid amount')
          else preview.amount = amt
        }

        if (!obj.description) errors.push('Missing description')
        else preview.description = obj.description

        if (!obj.accountId) errors.push('Missing account')
        else {
          const account = accounts.find(
            a => a.name.toLowerCase() === obj.accountId.toLowerCase()
          )
          if (account) {
            obj.accountId = account.id
            preview.account = account.name
          } else {
            errors.push(`Account not found: ${obj.accountId}`)
          }
        }

        if (!obj.method) obj.method = 'cc'
        preview.method = obj.method

        return {
          ...obj,
          isValid: errors.length === 0,
          errors,
          preview,
        }
      })

      setParsedData(parsed)
    } catch (error) {
      setAlertMessage({ text: 'Error parsing file: ' + (error instanceof Error ? error.message : 'Unknown error'), type: 'error' })
      setTimeout(() => setAlertMessage(null), 4000)
    }
  }

  const handleBulkImport = async () => {
    const validRows = parsedData.filter(r => r.isValid)
    if (validRows.length === 0) {
      setAlertMessage({ text: 'No valid rows to import', type: 'error' })
      setTimeout(() => setAlertMessage(null), 4000)
      return
    }

    setImporting(true)
    const results = {
      success: true,
      created: 0,
      failed: 0,
      errors: [] as string[],
    }

    for (const row of validRows) {
      try {
        const response = await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: new Date(row.date),
            amount: parseFloat(row.amount),
            description: row.description,
            method: row.method || 'cc',
            accountId: row.accountId,
            notes: row.notes || '',
            tags: row.tags
              ? row.tags.split(',').map(t => t.trim()).filter(Boolean)
              : [],
          }),
        })

        if (response.ok) {
          results.created++
        } else {
          results.failed++
          results.errors.push(`Row "${row.description}": ${response.statusText}`)
        }
      } catch (error) {
        results.failed++
        results.errors.push(`Row "${row.description}": ${(error as Error).message}`)
      }
    }

    results.success = results.failed === 0
    setImporting(false)
    setImportResult(results)

    if (results.success) {
      setTimeout(() => {
        location.reload()
      }, 2000)
    }
  }

  const downloadTemplate = () => {
    const csv = 'Date,Amount,Description,Method,Account,Notes,Tags\n2025-11-11,150.50,Groceries,cc,Checking,Weekly shopping,groceries\n2025-11-10,25.00,Coffee,cash,Cash,Daily coffee,food'
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'import_template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Import Transactions</h1>
        <p className="text-slate-600 mt-2">
          Bulk import transactions from CSV. Perfect for replicating recurring expenses.
        </p>
      </div>

      {/* Step 1: Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Step 1: Upload CSV
          </CardTitle>
          <CardDescription>Select a CSV file to import</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="csv-upload" className="block mb-2">
                CSV File
              </Label>
              <Input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                ref={fileInputRef}
                disabled={importing}
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={downloadTemplate}
                disabled={importing}
              >
                Download Template
              </Button>
            </div>
          </div>
          <p className="text-sm text-slate-500">
            Required columns: Date, Amount, Description, Method, Account. Optional: Notes, Tags
          </p>
        </CardContent>
      </Card>

      {/* Step 2: Preview */}
      {parsedData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Step 2: Review Data
            </CardTitle>
            <CardDescription>
              {parsedData.filter(r => r.isValid).length} of {parsedData.length} rows valid
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded border border-green-200">
                  <p className="text-sm text-slate-600">Valid Rows</p>
                  <p className="text-2xl font-bold text-green-600">
                    {parsedData.filter(r => r.isValid).length}
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded border border-red-200">
                  <p className="text-sm text-slate-600">Invalid Rows</p>
                  <p className="text-2xl font-bold text-red-600">
                    {parsedData.filter(r => !r.isValid).length}
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded border border-blue-200">
                  <p className="text-sm text-slate-600">Total Amount</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(
                      parsedData
                        .filter(r => r.isValid)
                        .reduce((sum, r) => sum + parseFloat(r.amount || '0'), 0)
                    )}
                  </p>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-100 border-b">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">Status</th>
                      <th className="px-4 py-2 text-left font-medium">Date</th>
                      <th className="px-4 py-2 text-left font-medium">Amount</th>
                      <th className="px-4 py-2 text-left font-medium">Description</th>
                      <th className="px-4 py-2 text-left font-medium">Method</th>
                      <th className="px-4 py-2 text-left font-medium">Account</th>
                      <th className="px-4 py-2 text-left font-medium">Errors</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.map((row, idx) => (
                      <tr key={idx} className={row.isValid ? 'border-b' : 'border-b bg-red-50'}>
                        <td className="px-4 py-2">
                          {row.isValid ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-600" />
                          )}
                        </td>
                        <td className="px-4 py-2">{row.preview.date}</td>
                        <td className="px-4 py-2 font-mono">{formatCurrency(row.preview.amount)}</td>
                        <td className="px-4 py-2">{row.preview.description}</td>
                        <td className="px-4 py-2 text-xs">{row.preview.method}</td>
                        <td className="px-4 py-2 text-xs">{row.preview.account || '-'}</td>
                        <td className="px-4 py-2 text-xs text-red-600">
                          {row.errors.join(', ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Import */}
      {parsedData.length > 0 && parsedData.some(r => r.isValid) && (
        <Card>
          <CardHeader>
            <CardTitle>Step 3: Import</CardTitle>
            <CardDescription>Create transactions from valid rows</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {importResult ? (
              <div
                className={`p-4 rounded border ${
                  importResult.success
                    ? 'bg-green-50 border-green-200'
                    : 'bg-yellow-50 border-yellow-200'
                }`}
              >
                <p className="font-medium text-sm">
                  {importResult.success ? '✓ Import Complete' : '⚠ Import Completed with Errors'}
                </p>
                <p className="text-sm mt-1">
                  Created: <span className="font-bold">{importResult.created}</span> | Failed:{' '}
                  <span className="font-bold">{importResult.failed}</span>
                </p>
                {importResult.errors.length > 0 && (
                  <div className="mt-2 text-xs text-red-600 space-y-1">
                    {importResult.errors.slice(0, 5).map((err, i) => (
                      <p key={i}>• {err}</p>
                    ))}
                    {importResult.errors.length > 5 && (
                      <p>... and {importResult.errors.length - 5} more</p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <Button
                onClick={handleBulkImport}
                disabled={importing || parsedData.filter(r => r.isValid).length === 0}
                className="w-full"
                size="lg"
              >
                {importing ? 'Importing...' : 'Import Transactions'}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Help */}
      <Card className="bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-base text-blue-900 dark:text-blue-100">💡 Tips</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p className="text-blue-900 dark:text-blue-100">• <strong>Replicate recurring expenses:</strong> Export last month&apos;s transactions, change dates, and re-import</p>
          <p className="text-blue-900 dark:text-blue-100">• <strong>Account matching:</strong> Account names must match exactly (e.g., &quot;Checking&quot;, &quot;Amex&quot;)</p>
          <p className="text-blue-900 dark:text-blue-100">• <strong>Date format:</strong> Use YYYY-MM-DD format (2025-11-11)</p>
          <p className="text-blue-900 dark:text-blue-100">• <strong>Methods:</strong> Use cc (credit card), cash, ach, or other</p>
          <p className="text-blue-900 dark:text-blue-100">• <strong>Amounts:</strong> Decimal numbers only, no currency symbols</p>
        </CardContent>
      </Card>

      {confirmDialog}

      {alertMessage && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700`}>
          <p className={`text-sm font-medium text-red-800 dark:text-red-200`}>
            {alertMessage.text}
          </p>
        </div>
      )}
    </div>
  )
}

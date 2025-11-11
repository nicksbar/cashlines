'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs'
import { Button } from '@/src/components/ui/button'
import { DollarSign, TrendingUp, TrendingDown, Download, Plus } from 'lucide-react'
import { formatCurrency } from '@/src/lib/utils'
import TransactionForm from '@/src/components/TransactionForm'
import IncomeForm from '@/src/components/IncomeForm'
import TransactionList from '@/src/components/TransactionList'
import IncomeList from '@/src/components/IncomeList'

interface Transaction {
  id: string
  description: string
  amount: number
  date: string
  type: string
  routing: string
  category: string | null
  isTaxRelated: boolean
  taxCategory: string | null
  notes: string | null
}

interface Income {
  id: string
  description: string
  amount: number
  date: string
  source: string | null
  isTaxRelated: boolean
  taxCategory: string | null
  notes: string | null
}

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [income, setIncome] = useState<Income[]>([])
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const [showIncomeForm, setShowIncomeForm] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    fetchTransactions()
    fetchIncome()
  }, [refreshTrigger])

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/transactions')
      const data = await response.json()
      setTransactions(data)
    } catch (error) {
      console.error('Error fetching transactions:', error)
    }
  }

  const fetchIncome = async () => {
    try {
      const response = await fetch('/api/income')
      const data = await response.json()
      setIncome(data)
    } catch (error) {
      console.error('Error fetching income:', error)
    }
  }

  const handleExport = async () => {
    try {
      const response = await fetch('/api/export?type=all')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `cashlines-export-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error exporting data:', error)
    }
  }

  const totalIncome = income.reduce((sum, i) => sum + i.amount, 0)
  const totalExpenses = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0)
  const netBalance = totalIncome - totalExpenses

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Cashlines</h1>
            <p className="text-gray-600 mt-1">Track your money, not budgets</p>
          </div>
          <Button onClick={handleExport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totalIncome)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(totalExpenses)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${netBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {formatCurrency(netBalance)}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="transactions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Transactions</CardTitle>
                    <CardDescription>Track expenses and transfers</CardDescription>
                  </div>
                  <Button onClick={() => setShowTransactionForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Transaction
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <TransactionList 
                  transactions={transactions} 
                  onRefresh={() => setRefreshTrigger(prev => prev + 1)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="income" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Income</CardTitle>
                    <CardDescription>Track income sources</CardDescription>
                  </div>
                  <Button onClick={() => setShowIncomeForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Income
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <IncomeList 
                  income={income} 
                  onRefresh={() => setRefreshTrigger(prev => prev + 1)}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {showTransactionForm && (
          <TransactionForm
            onClose={() => setShowTransactionForm(false)}
            onSuccess={() => {
              setShowTransactionForm(false)
              setRefreshTrigger(prev => prev + 1)
            }}
          />
        )}

        {showIncomeForm && (
          <IncomeForm
            onClose={() => setShowIncomeForm(false)}
            onSuccess={() => {
              setShowIncomeForm(false)
              setRefreshTrigger(prev => prev + 1)
            }}
          />
        )}
      </div>
    </main>
  )
}

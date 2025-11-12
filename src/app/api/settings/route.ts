import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/db'

/**
 * GET /api/settings
 * Get user settings/goals/targets
 * Requires: x-household-id header
 */
export async function GET(request: NextRequest) {
  try {
    const householdId = request.headers.get('x-household-id')

    if (!householdId) {
      return NextResponse.json(
        { error: 'Missing household ID' },
        { status: 400 }
      )
    }

    const settings = await prisma.setting.findUnique({
      where: { userId: householdId },
    })

    if (!settings) {
      // Return defaults if no settings exist yet
      return NextResponse.json({
        userId: householdId,
        monthlyIncomeTarget: null,
        monthlyExpenseTarget: null,
        savingsTarget: null,
        savingsRate: null,
        needPercent: 50,
        wantPercent: 30,
        savingsPercent: 20,
        lowBalanceThreshold: null,
        highCreditCardThreshold: null,
        trackedCategories: JSON.stringify([]),
        excludeFromBudget: JSON.stringify([]),
        currency: 'USD',
        fiscalYearStart: 1,
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/settings
 * Create or update user settings
 * Requires: x-household-id header
 */
export async function POST(request: NextRequest) {
  try {
    const householdId = request.headers.get('x-household-id')

    if (!householdId) {
      return NextResponse.json(
        { error: 'Missing household ID' },
        { status: 400 }
      )
    }

    const data = await request.json()

    const settings = await prisma.setting.upsert({
      where: { userId: householdId },
      update: {
        monthlyIncomeTarget: data.monthlyIncomeTarget ? parseFloat(data.monthlyIncomeTarget) : null,
        monthlyExpenseTarget: data.monthlyExpenseTarget ? parseFloat(data.monthlyExpenseTarget) : null,
        savingsTarget: data.savingsTarget ? parseFloat(data.savingsTarget) : null,
        savingsRate: data.savingsRate ? parseFloat(data.savingsRate) : null,
        needPercent: data.needPercent ? parseFloat(data.needPercent) : 50,
        wantPercent: data.wantPercent ? parseFloat(data.wantPercent) : 30,
        savingsPercent: data.savingsPercent ? parseFloat(data.savingsPercent) : 20,
        lowBalanceThreshold: data.lowBalanceThreshold ? parseFloat(data.lowBalanceThreshold) : null,
        highCreditCardThreshold: data.highCreditCardThreshold ? parseFloat(data.highCreditCardThreshold) : null,
        trackedCategories: typeof data.trackedCategories === 'string' 
          ? data.trackedCategories 
          : JSON.stringify(data.trackedCategories || []),
        excludeFromBudget: typeof data.excludeFromBudget === 'string'
          ? data.excludeFromBudget
          : JSON.stringify(data.excludeFromBudget || []),
        currency: data.currency || 'USD',
        fiscalYearStart: data.fiscalYearStart ? parseInt(data.fiscalYearStart) : 1,
      },
      create: {
        userId: householdId,
        monthlyIncomeTarget: data.monthlyIncomeTarget ? parseFloat(data.monthlyIncomeTarget) : null,
        monthlyExpenseTarget: data.monthlyExpenseTarget ? parseFloat(data.monthlyExpenseTarget) : null,
        savingsTarget: data.savingsTarget ? parseFloat(data.savingsTarget) : null,
        savingsRate: data.savingsRate ? parseFloat(data.savingsRate) : null,
        needPercent: data.needPercent ? parseFloat(data.needPercent) : 50,
        wantPercent: data.wantPercent ? parseFloat(data.wantPercent) : 30,
        savingsPercent: data.savingsPercent ? parseFloat(data.savingsPercent) : 20,
        lowBalanceThreshold: data.lowBalanceThreshold ? parseFloat(data.lowBalanceThreshold) : null,
        highCreditCardThreshold: data.highCreditCardThreshold ? parseFloat(data.highCreditCardThreshold) : null,
        trackedCategories: typeof data.trackedCategories === 'string'
          ? data.trackedCategories
          : JSON.stringify(data.trackedCategories || []),
        excludeFromBudget: typeof data.excludeFromBudget === 'string'
          ? data.excludeFromBudget
          : JSON.stringify(data.excludeFromBudget || []),
        currency: data.currency || 'USD',
        fiscalYearStart: data.fiscalYearStart ? parseInt(data.fiscalYearStart) : 1,
      },
    })

    return NextResponse.json({
      success: true,
      settings,
      message: 'Settings updated successfully',
    })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}

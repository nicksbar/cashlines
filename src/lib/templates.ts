/**
 * Template utilities for quick creation from saved templates
 */

export interface TransactionTemplate {
  id: string
  name: string
  description?: string
  amount?: number
  method?: string
  accountId?: string
  tags?: string
  notes?: string
  isFavorite: boolean
  usageCount: number
}

export interface IncomeTemplate {
  id: string
  name: string
  description?: string
  grossAmount?: number
  federalTaxes?: number
  stateTaxes?: number
  socialSecurity?: number
  medicare?: number
  preDeductions?: number
  postDeductions?: number
  notes?: string
  isFavorite: boolean
  usageCount: number
}

/**
 * Increment usage count for a template
 */
export async function recordTemplateUsage(
  templateId: string,
  type: 'transaction' | 'income'
): Promise<void> {
  try {
    const endpoint = `/api/templates/${type === 'transaction' ? 'transactions' : 'income'}/${templateId}`
    const response = await fetch(endpoint, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usageCount: 1, // Will be incremented server-side
        lastUsedAt: new Date().toISOString(),
      }),
    })
    
    if (!response.ok) {
      console.error('Failed to record template usage')
    }
  } catch (error) {
    console.error('Error recording template usage:', error)
  }
}

/**
 * Toggle favorite status for a template
 */
export async function toggleTemplateFavorite(
  templateId: string,
  currentFavoriteStatus: boolean,
  type: 'transaction' | 'income'
): Promise<void> {
  try {
    const endpoint = `/api/templates/${type === 'transaction' ? 'transactions' : 'income'}/${templateId}`
    const response = await fetch(endpoint, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        isFavorite: !currentFavoriteStatus,
      }),
    })
    
    if (!response.ok) {
      console.error('Failed to toggle template favorite status')
    }
  } catch (error) {
    console.error('Error toggling template favorite:', error)
  }
}

/**
 * Delete a template
 */
export async function deleteTemplate(
  templateId: string,
  type: 'transaction' | 'income'
): Promise<void> {
  try {
    const endpoint = `/api/templates/${type === 'transaction' ? 'transactions' : 'income'}/${templateId}`
    const response = await fetch(endpoint, {
      method: 'DELETE',
    })
    
    if (!response.ok) {
      throw new Error('Failed to delete template')
    }
  } catch (error) {
    console.error('Error deleting template:', error)
    throw error
  }
}

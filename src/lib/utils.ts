import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Parse error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'An unknown error occurred'
}

/**
 * Handle API response errors
 */
export async function handleApiError(response: Response): Promise<never> {
  const contentType = response.headers.get('content-type')
  
  if (contentType?.includes('application/json')) {
    const data = await response.json()
    throw new Error(data.error || data.message || `HTTP ${response.status}`)
  }
  
  const text = await response.text()
  throw new Error(text || `HTTP ${response.status}`)
}

